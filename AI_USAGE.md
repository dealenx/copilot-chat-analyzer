# AI Usage Guide for copilot-chat-analyzer

This is a TypeScript/JavaScript library for analyzing GitHub Copilot chat exports.

## Quick Start for AI Assistants

```typescript
import CopilotChatAnalyzer, { DialogStatus } from "copilot-chat-analyzer";
import { readFileSync } from "fs";

// Load chat data from JSON export
const chatData = JSON.parse(readFileSync("chat.json", "utf8"));
const analyzer = new CopilotChatAnalyzer();

// Basic analysis
const status = analyzer.getDialogStatus(chatData);
const requestCount = analyzer.getRequestsCount(chatData);
```

## Core Methods

### getDialogStatus(chatData)

Returns one of four status strings:

- `"pending"` - Chat created but no requests made (empty requests array)
- `"in_progress"` - Chat has requests but not completed
- `"completed"` - Chat finished successfully (has followups: [])
- `"canceled"` - Chat was canceled (isCanceled: true)

### getRequestsCount(chatData)

Returns number of requests in the chat.

### getDialogStatusDetails(chatData)

Returns detailed object:

```typescript
{
  status: DialogStatusType,
  statusText: string,        // Human readable status
  hasResult: boolean,        // Has result data
  hasFollowups: boolean,     // Has followups property
  isCanceled: boolean,       // Was canceled
  lastRequestId?: string     // ID of last request
}
```

### getMcpToolMonitoring(chatData, toolName?)

Monitor MCP (Model Context Protocol) tool usage:

- Without toolName: Returns summary of all tools
- With toolName: Returns detailed stats for specific tool

## Chat Data Structure

Expected JSON structure from GitHub Copilot export:

```typescript
{
  requesterUsername: string,
  responderUsername: string,
  requests: Array<{
    requestId: string,
    isCanceled?: boolean,
    followups?: any[],
    result?: any,
    response?: any[]
  }>
}
```

## Status Detection Logic

1. No requests or empty array → `"pending"`
2. Last request has `isCanceled: true` → `"canceled"`
3. Last request has `followups: []` (empty array) → `"completed"`
4. Otherwise → `"in_progress"`

## MCP Tool Analysis

The library can extract and analyze Model Context Protocol tool calls from chat responses, providing:

- Tool success rates
- Call counts
- Input/output data
- Error tracking

## Examples Directory

Check `/examples` folder for complete usage examples with sample data.
