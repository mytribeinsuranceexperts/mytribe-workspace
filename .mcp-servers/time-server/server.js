#!/usr/bin/env node

/**
 * Simple Time MCP Server
 * Provides current date/time in various formats
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create server instance
const server = new Server(
  {
    name: "time-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: get_current_date
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_date",
        description:
          "Get the current date and time in various formats. Use this when you need to know today's date for data collection, logging, or timestamping.",
        inputSchema: {
          type: "object",
          properties: {
            format: {
              type: "string",
              description:
                "Date format to return. Options: 'iso' (YYYY-MM-DD), 'iso-datetime' (YYYY-MM-DDTHH:mm:ss), 'timestamp' (Unix milliseconds), 'human' (readable format)",
              enum: ["iso", "iso-datetime", "timestamp", "human"],
              default: "iso",
            },
            timezone: {
              type: "string",
              description:
                "Timezone for the date. Default is 'local' (system timezone). Use IANA timezone names like 'Europe/London', 'America/New_York', 'UTC'",
              default: "local",
            },
          },
        },
      },
      {
        name: "get_date_components",
        description:
          "Get individual date/time components (year, month, day, hour, etc) for the current date/time. Useful when you need specific parts of the date.",
        inputSchema: {
          type: "object",
          properties: {
            timezone: {
              type: "string",
              description:
                "Timezone for the date. Default is 'local' (system timezone). Use IANA timezone names.",
              default: "local",
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_current_date") {
    const format = args.format || "iso";
    const timezone = args.timezone || "local";

    const now = new Date();

    let dateString;
    let options = {};

    // Handle timezone
    if (timezone !== "local") {
      options.timeZone = timezone;
    }

    switch (format) {
      case "iso":
        // YYYY-MM-DD format
        dateString =
          timezone === "local"
            ? now.toISOString().split("T")[0]
            : now.toLocaleDateString("en-CA", {
                timeZone: timezone === "local" ? undefined : timezone,
              });
        break;

      case "iso-datetime":
        // YYYY-MM-DDTHH:mm:ss format
        dateString =
          timezone === "local"
            ? now.toISOString().split(".")[0]
            : new Date(
                now.toLocaleString("en-US", {
                  timeZone: timezone === "local" ? undefined : timezone,
                })
              )
                .toISOString()
                .split(".")[0];
        break;

      case "timestamp":
        // Unix timestamp in milliseconds
        dateString = now.getTime().toString();
        break;

      case "human":
        // Human-readable format: "Thursday, October 31, 2025"
        dateString = now.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: timezone === "local" ? undefined : timezone,
        });
        break;

      default:
        dateString = now.toISOString().split("T")[0];
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              date: dateString,
              format: format,
              timezone: timezone,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "get_date_components") {
    const timezone = args.timezone || "local";
    const now = new Date();

    const getComponent = (options) => {
      return new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: timezone === "local" ? undefined : timezone,
      })
        .format(now)
        .padStart(2, "0");
    };

    const components = {
      year: now.getFullYear(),
      month: now.getMonth() + 1, // 1-12
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      dayOfWeek: now.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: timezone === "local" ? undefined : timezone,
      }),
      dayOfWeekShort: now.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: timezone === "local" ? undefined : timezone,
      }),
      monthName: now.toLocaleDateString("en-US", {
        month: "long",
        timeZone: timezone === "local" ? undefined : timezone,
      }),
      monthNameShort: now.toLocaleDateString("en-US", {
        month: "short",
        timeZone: timezone === "local" ? undefined : timezone,
      }),
      iso_date: now.toISOString().split("T")[0],
      iso_datetime: now.toISOString().split(".")[0],
      timestamp: now.getTime(),
      timezone: timezone,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(components, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Time MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
