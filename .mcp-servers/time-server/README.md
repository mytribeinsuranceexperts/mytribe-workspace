# Time MCP Server

Simple MCP server that provides current date and time information.

## Features

- Get current date in various formats (ISO, ISO datetime, Unix timestamp, human-readable)
- Support for different timezones
- Get individual date/time components
- Useful for data collection timestamping

## Tools

### `get_current_date`

Get the current date and time in various formats.

**Parameters:**
- `format` (optional): Output format
  - `iso` - YYYY-MM-DD (default)
  - `iso-datetime` - YYYY-MM-DDTHH:mm:ss
  - `timestamp` - Unix milliseconds
  - `human` - Readable format (e.g., "Thursday, October 31, 2025")
- `timezone` (optional): IANA timezone name (default: "local")
  - Examples: "Europe/London", "America/New_York", "UTC"

**Example Response:**
```json
{
  "date": "2025-10-31",
  "format": "iso",
  "timezone": "local"
}
```

### `get_date_components`

Get individual date/time components.

**Parameters:**
- `timezone` (optional): IANA timezone name (default: "local")

**Example Response:**
```json
{
  "year": 2025,
  "month": 10,
  "day": 31,
  "hour": 14,
  "minute": 30,
  "second": 45,
  "dayOfWeek": "Thursday",
  "dayOfWeekShort": "Thu",
  "monthName": "October",
  "monthNameShort": "Oct",
  "iso_date": "2025-10-31",
  "iso_datetime": "2025-10-31T14:30:45",
  "timestamp": 1730386245000,
  "timezone": "local"
}
```

## Installation

```bash
cd .mcp-servers/time-server
npm install
```

## Configuration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "time": {
      "command": "node",
      "args": [".mcp-servers/time-server/server.js"]
    }
  }
}
```

## Usage in Claude Code

The AI can use this server to get the current date for:
- Timestamping data collection
- Adding collection dates to CSV files
- Logging when data was extracted
- Audit trails

Example: "Use the Time MCP server to get today's date in ISO format (YYYY-MM-DD) and add it to the Collection Date column."
