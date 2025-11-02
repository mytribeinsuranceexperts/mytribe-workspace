# Data Collection Template (with Time MCP Server)

## Before Starting Collection

**Step 1: Get Today's Date**
```
Use the Time MCP server's `get_current_date` tool with format "iso" to get today's date in YYYY-MM-DD format.
```

## CSV Format (8 Columns)

- **Column A**: Hospital Name (repeat for each row)
- **Column B**: Treatment Name (as appears on website)
- **Column C**: Treatment Category
- **Column D**: Price (numeric only, no currency symbol)
- **Column E**: Price Type (label "From" if price shows "from", otherwise "Guide")
- **Column F**: Notes (package inclusions like "includes unlimited aftercare", "also available as a day patient" - exclude finance info)
- **Column G**: Page URL (repeated for each row)
- **Column H**: Collection Date (ISO format YYYY-MM-DD from Time MCP server)

## Example CSV

```csv
Hospital Name,Treatment Name,Treatment Category,Price,Price Type,Notes,Page URL,Collection Date
Chester Hospital,Hip Replacement,Orthopaedics,12500,Guide,Includes unlimited aftercare,https://www.nuffieldhealth.com/hospitals/chester/pricing,2025-10-31
Chester Hospital,Cataract Surgery,Ophthalmology,2800,From,Day patient procedure,https://www.nuffieldhealth.com/hospitals/chester/pricing,2025-10-31
```

## Instructions

1. **Get date**: Call Time MCP server `get_current_date` with format="iso"
2. **Extract data**: Visit hospital pricing page and extract all treatments
3. **Format CSV**: Use 8-column format above
4. **Add date**: Use the date from step 1 in Column H for every row
5. **Save file**: Name format: `YYYY-MM-DD-[hospital-name].csv`
6. **Take screenshot**: Screenshot of pricing page for verification

## Why Collection Date Matters

- **Price changes**: Track when pricing was collected (prices change over time)
- **Data freshness**: Identify most recent data during normalization
- **Audit trail**: Know exactly when each row was collected
- **Version tracking**: Can compare pricing between collection dates
- **Database import**: Supabase `import_date` field requires this information

## Notes

- Collection date should be the same for all rows in a single CSV file
- Use ISO format (YYYY-MM-DD) for consistency and database compatibility
- Don't manually enter the date - always use the Time MCP server for accuracy
