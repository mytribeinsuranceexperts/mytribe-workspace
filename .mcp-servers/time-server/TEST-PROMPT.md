# Time MCP Server Test Prompt

**Use this prompt after restarting Claude Code to test the Time MCP server:**

```
Use the Time MCP server to get today's date in ISO format (YYYY-MM-DD).
Then show me the date in all available formats.
Then get the date components and show me the full breakdown.
```

## Expected Output

You should see responses like:

**ISO Format:**
```json
{
  "date": "2025-10-31",
  "format": "iso",
  "timezone": "local"
}
```

**All Formats:**
- ISO: 2025-10-31
- ISO Datetime: 2025-10-31T14:30:45
- Timestamp: 1730386245000
- Human: Thursday, October 31, 2025

**Date Components:**
```json
{
  "year": 2025,
  "month": 10,
  "day": 31,
  "hour": 14,
  "minute": 30,
  "second": 45,
  "dayOfWeek": "Thursday",
  "monthName": "October",
  "iso_date": "2025-10-31"
}
```

## Data Collection Usage

Once tested, you can use it in data collection prompts like:

```
Use the Time MCP server to get today's date in ISO format.
Add this date as the Collection Date column (Column H) for every row in the CSV.
```
