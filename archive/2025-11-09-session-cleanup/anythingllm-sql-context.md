# SQL Agent Context: UK Insurance Pricing Database

## Critical Column Names (USE THESE EXACTLY)

- `age` (NOT age_of_applicant) - Integer 20-80
- `plan` - Specific plan name text
- `coverage_type` - "Basic PMI" or "Comprehensive PMI"
- `monthly_premium` - Cost in GBP (£)
- `provider` - Insurance company name
- `postcode` - UK postcode prefix (SW, E, M1, etc.)
- `excess_amount` - £0, £100, £250, £500, £1000, £2000

## Coverage Types (ONLY TWO)

1. **Basic PMI** - Essential cover, excludes outpatient diagnosis (consultaions or scans)
2. **Comprehensive PMI** - Includes a minimum of £1000 outpatient cover and complementary therapies

**Important:** These are coverage categories, with the plans falling into one or other of them

## Query Pattern Rule (CRITICAL)

**Single Provider Query:**

```sql
-- Shows actual plan names
SELECT plan, AVG(monthly_premium)
WHERE provider ILIKE '%bupa%'
GROUP BY plan;
```

**Multi-Provider Query:**

```sql
-- Shows standardized comparison
SELECT provider, coverage_type, AVG(monthly_premium)
GROUP BY provider, coverage_type;
```

## Common Synonyms

- **PMI** = Private Medical Insurance = health insurance
- **provider** = insurer
- **premium** = cost = price

## User Term Translations

- "cheapest" → `MIN(monthly_premium)`
- "average" → `AVG(monthly_premium)`
- "most expensive" → `MAX(monthly_premium)`
- "capital" or "London" → `WHERE postcode IN ('SW','SE','W','E','N','NW','EC','WC')`

## Dataset Info

- **Records:** 10,601 pricing records
- **Providers:** Bupa, Aviva, Vitality, AXA PPP, Freedom Health, The Exeter, WPA
- **Ages:** 20-80 (10-year intervals)
- **All premiums in GBP (£)**
