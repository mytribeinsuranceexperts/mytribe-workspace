# CQC API Integration Guide

## Authentication

### Step 1: Obtain API Credentials

1. Go to https://api-portal.service.cqc.org.uk
2. Register/log in with your organization account
3. Create a new application/subscription
4. Copy your API Key/Token

### Step 2: Store Credentials Securely

**.env file (local development):**
```bash
CQC_API_KEY=your_api_key_here
CQC_API_SECRET=your_secret_here  # if applicable
```

**Environment variables (production):**
- Use AWS Secrets Manager, Azure Key Vault, or Bitwarden
- Never hardcode credentials
- Rotate credentials every 90 days

### Step 3: Implement Authentication

**Option A: Bearer Token (Most Common)**
```python
import os
import requests

API_BASE_URL = "https://api.service.cqc.org.uk/public/v1"
API_KEY = os.getenv("CQC_API_KEY")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}

response = requests.get(
    f"{API_BASE_URL}/providers",
    headers=headers
)
```

**Option B: Subscription Key Header**
```python
headers = {
    "Subscription-Key": API_KEY,
    "Accept": "application/json"
}

response = requests.get(
    f"{API_BASE_URL}/providers",
    headers=headers
)
```

**IMPORTANT:** Contact syndicationAPI@cqc.org.uk to confirm which method applies to your credentials.

---

## API Endpoints

### Base URL
```
https://api.service.cqc.org.uk/public/v1
```

### List All Providers
```
GET /providers
```

**Response:**
```json
{
  "providers": [
    {
      "locationId": "...",
      "name": "Hospital Name",
      "provider": {...},
      "registrationStatus": "Active",
      "type": "...",
      "ratings": {...}
    }
  ]
}
```

### Get Single Provider
```
GET /providers/{locationId}
```

### List Locations
```
GET /locations
```

### Get Single Location
```
GET /locations/{locationId}
```

---

## Rate Limiting & Throttling

### Current Status
**Rate limits are NOT published by CQC.**

### Conservative Approach (Recommended Until Confirmed)

**Python with ratelimit library:**
```python
from ratelimit import limits, sleep_and_retry
import requests

@sleep_and_retry
@limits(calls=1, period=1)  # 1 request per second
def cqc_api_call(endpoint, params=None):
    """Make rate-limited API call to CQC."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/{endpoint}",
            headers=headers,
            params=params,
            timeout=10
        )

        # Handle rate limiting
        if response.status_code == 429:
            retry_after = response.headers.get('Retry-After', '60')
            print(f"Rate limited. Retry after {retry_after}s")
            raise Exception(f"Rate limited")

        # Handle auth failure
        if response.status_code == 401:
            raise Exception("Authentication failed - check API credentials")

        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"API error: {e}")
        raise

# Usage
data = cqc_api_call("providers", params={"limit": 100})
```

### Exponential Backoff Strategy

```python
import time
import requests

def cqc_api_with_backoff(endpoint, max_retries=3):
    """API call with exponential backoff."""
    for attempt in range(max_retries):
        try:
            response = requests.get(
                f"{API_BASE_URL}/{endpoint}",
                headers=headers,
                timeout=10
            )

            if response.status_code == 429:
                wait_time = int(response.headers.get('Retry-After', 2 ** attempt))
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue

            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"Timeout. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise

    raise Exception(f"Failed after {max_retries} attempts")
```

---

## Daily Scheduled Sync

### Using APScheduler

```python
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def sync_cqc_data():
    """Fetch and update CQC provider data."""
    try:
        logger.info("Starting CQC data sync...")

        # Get all providers
        data = cqc_api_call("providers", params={"limit": 1000})

        # Process and store data
        providers = data.get("providers", [])
        logger.info(f"Fetched {len(providers)} providers")

        # Update database
        update_providers_in_db(providers)

        logger.info("CQC data sync completed successfully")

    except Exception as e:
        logger.error(f"CQC sync failed: {e}")
        # Send alert to admin
        send_alert(f"CQC API sync failed: {e}")

# Configure scheduler
scheduler = BackgroundScheduler()

# Run daily at 2:00 AM UTC (off-peak)
scheduler.add_job(
    func=sync_cqc_data,
    trigger="cron",
    hour=2,
    minute=0,
    timezone="UTC",
    id="cqc_daily_sync",
    name="CQC Provider Data Daily Sync"
)

# Start scheduler
scheduler.start()
```

### Using Celery (Distributed Task Queue)

```python
from celery import Celery
from celery.schedules import crontab

app = Celery('mytribe')

@app.task
def sync_cqc_data():
    """Fetch CQC provider data."""
    try:
        data = cqc_api_call("providers", params={"limit": 1000})
        providers = data.get("providers", [])
        update_providers_in_db(providers)
        return {"status": "success", "count": len(providers)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Celery Beat configuration
app.conf.beat_schedule = {
    'sync-cqc-daily': {
        'task': 'tasks.sync_cqc_data',
        'schedule': crontab(hour=2, minute=0),  # 2:00 AM UTC daily
    },
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Verify API credentials |
| 429 | Rate Limited | Wait and retry with backoff |
| 500 | Server Error | Retry with exponential backoff |
| 503 | Service Unavailable | Retry later, check status page |

### Error Response Handling

```python
def handle_cqc_error(response):
    """Handle CQC API errors."""

    if response.status_code == 401:
        raise AuthError(
            "CQC API authentication failed. Check credentials at "
            "https://api-portal.service.cqc.org.uk"
        )

    elif response.status_code == 429:
        retry_after = response.headers.get('Retry-After', '60')
        raise RateLimitError(
            f"Rate limited. Retry after {retry_after} seconds."
        )

    elif response.status_code >= 500:
        raise ServerError(
            f"CQC API server error: {response.status_code}"
        )

    elif response.status_code >= 400:
        raise ClientError(
            f"CQC API error: {response.status_code} - {response.text}"
        )

    return response.json()
```

---

## Data Attribution

### HTML Footer Example

```html
<footer class="data-attribution">
    <div class="cqc-data-notice">
        <p>
            This service contains information licensed under the
            <a href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">
            Open Government Licence v3.0
            </a>.
        </p>
        <p>
            Data source: <a href="https://www.cqc.org.uk">
            Care Quality Commission (CQC)
            </a>
        </p>
        <p>
            Last updated: <span id="cqc-update-date">{{ last_sync_date }}</span>
        </p>
    </div>
</footer>
```

### CSS Styling

```css
.data-attribution {
    font-size: 0.875rem;
    color: #666;
    padding: 1rem;
    border-top: 1px solid #eee;
    margin-top: 2rem;
}

.cqc-data-notice a {
    color: #0066cc;
    text-decoration: none;
}

.cqc-data-notice a:hover {
    text-decoration: underline;
}

#cqc-update-date {
    font-weight: bold;
    color: #333;
}
```

### React Component Example

```jsx
export function CQCAttribution() {
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        // Fetch last sync timestamp
        fetch('/api/cqc/last-update')
            .then(r => r.json())
            .then(d => setLastUpdate(d.timestamp));
    }, []);

    return (
        <footer className="cqc-attribution">
            <p>
                This service contains information licensed under the
                <a href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">
                    Open Government Licence v3.0
                </a>
                .
            </p>
            <p>
                Data source:
                <a href="https://www.cqc.org.uk">
                    Care Quality Commission (CQC)
                </a>
            </p>
            {lastUpdate && (
                <p>Last updated: {new Date(lastUpdate).toLocaleDateString()}</p>
            )}
        </footer>
    );
}
```

---

## Monitoring & Logging

### Logging Setup

```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
logger = logging.getLogger('cqc_api')
logger.setLevel(logging.DEBUG)

# File handler with rotation
handler = RotatingFileHandler(
    'logs/cqc_api.log',
    maxBytes=10485760,  # 10MB
    backupCount=10
)

formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)

# Console handler
console = logging.StreamHandler()
console.setFormatter(formatter)
logger.addHandler(console)
```

### Key Metrics to Monitor

```python
def log_api_metrics(response, duration_ms, endpoint):
    """Log API performance metrics."""
    logger.info(
        f"CQC API Call | "
        f"Endpoint: {endpoint} | "
        f"Status: {response.status_code} | "
        f"Duration: {duration_ms}ms | "
        f"Bytes: {len(response.content)}"
    )

    # Track rate limiting
    if response.status_code == 429:
        logger.warning(f"Rate limited. Retry-After: {response.headers.get('Retry-After')}")

    # Track authentication issues
    if response.status_code == 401:
        logger.error("Authentication failed - check API credentials")
```

---

## Testing

### Unit Test Example

```python
import unittest
from unittest.mock import patch, MagicMock

class TestCQCIntegration(unittest.TestCase):

    @patch('requests.get')
    def test_authentication_success(self, mock_get):
        """Test successful API authentication."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"providers": []}
        mock_get.return_value = mock_response

        result = cqc_api_call("providers")
        assert result == {"providers": []}

        # Verify auth header was sent
        call_args = mock_get.call_args
        assert "Authorization" in call_args.kwargs['headers']

    @patch('requests.get')
    def test_authentication_failure(self, mock_get):
        """Test authentication failure handling."""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {
            "statusCode": 401,
            "message": "Access denied"
        }
        mock_get.return_value = mock_response

        with self.assertRaises(AuthError):
            cqc_api_call("providers")

    @patch('requests.get')
    def test_rate_limiting(self, mock_get):
        """Test rate limit handling."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.headers = {'Retry-After': '60'}
        mock_get.return_value = mock_response

        with self.assertRaises(RateLimitError):
            cqc_api_call("providers")

if __name__ == '__main__':
    unittest.main()
```

### Integration Test

```python
def test_cqc_api_end_to_end():
    """Test complete API integration flow."""
    try:
        # Authenticate
        headers = get_auth_headers()

        # Fetch providers
        response = requests.get(
            f"{API_BASE_URL}/providers?limit=10",
            headers=headers
        )
        assert response.status_code == 200

        data = response.json()
        assert "providers" in data
        assert len(data["providers"]) > 0

        # Verify data structure
        provider = data["providers"][0]
        assert "name" in provider
        assert "locationId" in provider

        print("✓ CQC API integration test passed")

    except Exception as e:
        print(f"✗ CQC API integration test failed: {e}")
        raise
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Causes:**
- Missing API key
- Incorrect/expired credentials
- Wrong authentication header format
- Credentials not yet activated in portal

**Solution:**
```python
# Verify credentials are loaded
import os
api_key = os.getenv("CQC_API_KEY")
if not api_key:
    raise Exception("CQC_API_KEY not set in environment")

# Verify header format
print(f"Auth header: Bearer {api_key[:20]}...")  # Don't print full key

# Check portal at https://api-portal.service.cqc.org.uk
```

### Issue: 429 Rate Limit

**Causes:**
- Polling too frequently
- Not implementing backoff
- Burst of requests

**Solution:**
- Reduce request frequency (max 1/sec)
- Implement exponential backoff
- Check Retry-After header
- Contact CQC about actual limits

### Issue: Timeout or 500 Errors

**Causes:**
- Network issues
- CQC API temporarily down
- Large response payloads

**Solution:**
```python
# Increase timeout and add retries
response = requests.get(
    endpoint,
    headers=headers,
    timeout=30  # Increase from default
)

# Implement retry logic
for attempt in range(3):
    try:
        response = requests.get(endpoint, headers=headers, timeout=30)
        break
    except requests.exceptions.Timeout:
        if attempt < 2:
            time.sleep(2 ** attempt)
        else:
            raise
```

---

## Compliance Checklist Before Launch

- [ ] API credentials stored in environment variables
- [ ] TLS 1.2+ verified in requests library
- [ ] Authentication headers implemented
- [ ] Rate limiting in place (1 req/sec minimum)
- [ ] Daily sync scheduled (2:00 AM UTC)
- [ ] Attribution displayed on all pages with CQC data
- [ ] Error handling for 401, 429, 500 errors
- [ ] Logging and monitoring in place
- [ ] Unit tests cover auth and error cases
- [ ] Integration test passes with real API
- [ ] OGL v3 license link in footer
- [ ] CQC support contacted re: rate limits
- [ ] Code review completed
- [ ] Security audit passed

---

## Support & Escalation

**First Question:** syndicationAPI@cqc.org.uk

Subject: "CQC API Integration - Rate Limits and Technical Confirmation"

**Include:**
- Your organization name
- Integration purpose
- Expected request volume (requests/day, peak requests/hour)
- Whether you need specific SLA
- Any performance requirements

---

Last Updated: 2025-11-02
