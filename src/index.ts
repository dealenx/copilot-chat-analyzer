// COPILOT CHAT ANALYZER - Simplified Implementation

interface CopilotChatData {
  requests?: any[];
  [key: string]: any;
}

interface DialogStatusDetails {
  status: DialogStatusType;
  statusText: string;
  hasResult: boolean;
  hasFollowups: boolean;
  isCanceled: boolean;
  isFailed: boolean;
  lastRequestId?: string;
  errorCode?: string;
  errorMessage?: string;
}

interface McpToolCall {
  toolId: string;
  toolName: string;
  requestId: string;
  input: any;
  output: any;
  isError: boolean;
  timestamp?: number;
  source?: {
    type: string;
    serverLabel: string;
    label: string;
  };
}

interface McpToolMonitoring {
  toolName: string;
  totalCalls: number;
  successfulCalls: number;
  errorCalls: number;
  successRate: number;
  calls: McpToolCall[];
}

interface McpMonitoringSummary {
  totalTools: number;
  totalCalls: number;
  overallSuccessRate: number;
  tools: McpToolMonitoring[];
}

interface UserRequest {
  id: string;
  message: string;
  timestamp?: number;
  index: number;
}

interface DialogSession {
  sessionId: string;
  agentId?: string;
  modelId?: string;
}

interface AIResponse {
  /** Reference to the original request */
  requestId: string;
  /** Response ID if available */
  responseId?: string;
  /** Aggregated response text (all parts combined) */
  message: string;
  /** Timestamp when response was generated */
  timestamp?: number;
  /** Index in the conversation (0-based) */
  index: number;
  /** Whether response includes tool calls */
  hasToolCalls: boolean;
  /** Number of tool calls in this response */
  toolCallCount: number;
}

interface ConversationTurn {
  /** Turn index (0-based) */
  index: number;
  /** User's request */
  request: UserRequest;
  /** AI's response (null if no response yet) */
  response: AIResponse | null;
}

export const DialogStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELED: "canceled",
  IN_PROGRESS: "in_progress",
  FAILED: "failed",
} as const;

export type DialogStatusType = (typeof DialogStatus)[keyof typeof DialogStatus];

export class CopilotChatAnalyzer {
  getRequestsCount(chatData: CopilotChatData): number {
    if (!chatData || !Array.isArray(chatData.requests)) {
      return 0;
    }
    return chatData.requests.length;
  }

  /**
   * Extract sessionId from chat data.
   * The sessionId is stored in result.metadata.sessionId of any request.
   * All requests in a dialog share the same sessionId.
   */
  getSessionId(chatData: CopilotChatData): string | null {
    if (!chatData?.requests?.length) {
      return null;
    }

    for (const request of chatData.requests) {
      const sessionId = request?.result?.metadata?.sessionId;
      if (sessionId && typeof sessionId === "string") {
        return sessionId;
      }
    }

    return null;
  }

  /**
   * Get full session information including agentId and modelId.
   */
  getSessionInfo(chatData: CopilotChatData): DialogSession | null {
    const sessionId = this.getSessionId(chatData);
    if (!sessionId) {
      return null;
    }

    // Find request with metadata to extract additional info
    for (const request of chatData.requests!) {
      const metadata = request?.result?.metadata;
      if (metadata?.sessionId === sessionId) {
        return {
          sessionId,
          agentId: metadata?.agentId,
          modelId: metadata?.modelId,
        };
      }
    }

    return { sessionId };
  }

  private hasRequests(chatData: CopilotChatData): boolean {
    return Array.isArray(chatData.requests) && chatData.requests.length > 0;
  }

  private getLastRequest(chatData: CopilotChatData): any | null {
    if (!this.hasRequests(chatData)) {
      return null;
    }
    return chatData.requests![chatData.requests!.length - 1];
  }

  getDialogStatus(chatData: CopilotChatData): DialogStatusType {
    if (!this.hasRequests(chatData)) {
      return DialogStatus.PENDING;
    }

    const lastRequest = this.getLastRequest(chatData);
    if (!lastRequest) {
      return DialogStatus.PENDING;
    }

    // Check canceled first (user action via legacy field)
    if (lastRequest.isCanceled === true) {
      return DialogStatus.CANCELED;
    }

    // Check errorDetails for canceled or failed status
    const errorDetails = lastRequest?.result?.errorDetails;
    if (errorDetails) {
      // Check if canceled via errorDetails.code (newer format)
      if (errorDetails.code === "canceled") {
        return DialogStatus.CANCELED;
      }
      // Other error codes mean failure
      return DialogStatus.FAILED;
    }

    // Check completed (has empty followups array)
    if ("followups" in lastRequest && Array.isArray(lastRequest.followups)) {
      if (lastRequest.followups.length === 0) {
        return DialogStatus.COMPLETED;
      }
    }

    // No followups property means still in progress
    if (!("followups" in lastRequest)) {
      return DialogStatus.IN_PROGRESS;
    }

    return DialogStatus.IN_PROGRESS;
  }

  getDialogStatusDetails(chatData: CopilotChatData): DialogStatusDetails {
    const status = this.getDialogStatus(chatData);

    if (!this.hasRequests(chatData)) {
      return {
        status: DialogStatus.PENDING,
        statusText: "Dialog not started",
        hasResult: false,
        hasFollowups: false,
        isCanceled: false,
        isFailed: false,
      };
    }

    const lastRequest = this.getLastRequest(chatData);
    const errorDetails = lastRequest?.result?.errorDetails;

    const statusTexts: Record<DialogStatusType, string> = {
      [DialogStatus.PENDING]: "Dialog not started",
      [DialogStatus.COMPLETED]: "Dialog completed successfully",
      [DialogStatus.CANCELED]: "Dialog was canceled",
      [DialogStatus.IN_PROGRESS]: "Dialog in progress",
      [DialogStatus.FAILED]: "Dialog failed with error",
    };

    return {
      status,
      statusText: statusTexts[status],
      hasResult:
        lastRequest && "result" in lastRequest && lastRequest.result !== null,
      hasFollowups: lastRequest && "followups" in lastRequest,
      isCanceled: lastRequest && lastRequest.isCanceled === true,
      isFailed: !!errorDetails,
      lastRequestId: lastRequest?.requestId,
      errorCode: errorDetails?.code,
      errorMessage: errorDetails?.message,
    };
  }

  private extractMcpToolCalls(chatData: CopilotChatData): McpToolCall[] {
    if (!this.hasRequests(chatData)) {
      return [];
    }

    const toolCalls: McpToolCall[] = [];

    chatData.requests!.forEach((request) => {
      if (!request.response || !Array.isArray(request.response)) {
        return;
      }

      request.response.forEach((responseItem: any) => {
        if (
          responseItem.kind === "toolInvocationSerialized" &&
          responseItem.source?.type === "mcp"
        ) {
          const toolCall: McpToolCall = {
            toolId: responseItem.toolId || responseItem.toolName || "unknown",
            toolName: responseItem.toolName || responseItem.toolId || "unknown",
            requestId: request.requestId,
            input:
              responseItem.resultDetails?.input ||
              responseItem.toolSpecificData?.rawInput ||
              null,
            output: responseItem.resultDetails?.output || null,
            isError: responseItem.resultDetails?.isError || false,
            timestamp: request.timestamp,
            source: responseItem.source,
          };

          toolCalls.push(toolCall);
        }
      });
    });

    return toolCalls;
  }

  getMcpToolMonitoring(
    chatData: CopilotChatData,
    toolName?: string
  ): McpToolMonitoring | McpMonitoringSummary {
    const allToolCalls = this.extractMcpToolCalls(chatData);

    if (toolName) {
      // Мониторинг конкретного инструмента
      const toolCalls = allToolCalls.filter(
        (call) =>
          call.toolName.includes(toolName) || call.toolId.includes(toolName)
      );

      const successfulCalls = toolCalls.filter((call) => !call.isError).length;
      const errorCalls = toolCalls.filter((call) => call.isError).length;
      const successRate =
        toolCalls.length > 0 ? (successfulCalls / toolCalls.length) * 100 : 0;

      return {
        toolName,
        totalCalls: toolCalls.length,
        successfulCalls,
        errorCalls,
        successRate: Math.round(successRate * 100) / 100,
        calls: toolCalls,
      };
    } else {
      // Общий мониторинг всех инструментов
      const toolsMap = new Map<string, McpToolCall[]>();

      allToolCalls.forEach((call) => {
        const key = call.toolName || call.toolId;
        if (!toolsMap.has(key)) {
          toolsMap.set(key, []);
        }
        toolsMap.get(key)!.push(call);
      });

      const tools: McpToolMonitoring[] = Array.from(toolsMap.entries()).map(
        ([toolName, calls]) => {
          const successfulCalls = calls.filter((call) => !call.isError).length;
          const errorCalls = calls.filter((call) => call.isError).length;
          const successRate =
            calls.length > 0 ? (successfulCalls / calls.length) * 100 : 0;

          return {
            toolName,
            totalCalls: calls.length,
            successfulCalls,
            errorCalls,
            successRate: Math.round(successRate * 100) / 100,
            calls,
          };
        }
      );

      const totalCalls = allToolCalls.length;
      const totalSuccessful = allToolCalls.filter(
        (call) => !call.isError
      ).length;
      const overallSuccessRate =
        totalCalls > 0 ? (totalSuccessful / totalCalls) * 100 : 0;

      return {
        totalTools: tools.length,
        totalCalls,
        overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
        tools,
      };
    }
  }

  getMcpToolSuccessfulCalls(
    chatData: CopilotChatData,
    toolName: string
  ): McpToolCall[] {
    const monitoring = this.getMcpToolMonitoring(
      chatData,
      toolName
    ) as McpToolMonitoring;
    return monitoring.calls.filter((call) => !call.isError);
  }

  getMcpToolErrorCalls(
    chatData: CopilotChatData,
    toolName: string
  ): McpToolCall[] {
    const monitoring = this.getMcpToolMonitoring(
      chatData,
      toolName
    ) as McpToolMonitoring;
    return monitoring.calls.filter((call) => call.isError);
  }

  /**
   * Простой метод для получения всех вызовов конкретного MCP инструмента
   * @param chatData - данные чата
   * @param toolName - название инструмента (например, 'update_entry_fields')
   * @returns массив всех вызовов инструмента
   */
  getMcpToolCalls(chatData: CopilotChatData, toolName: string): McpToolCall[] {
    const allToolCalls = this.extractMcpToolCalls(chatData);
    return allToolCalls.filter(
      (call) =>
        call.toolName.includes(toolName) || call.toolId.includes(toolName)
    );
  }

  /**
   * Получить список всех уникальных MCP инструментов, использованных в чате
   * @param chatData - данные чата
   * @returns массив названий инструментов
   */
  getMcpToolNames(chatData: CopilotChatData): string[] {
    const allToolCalls = this.extractMcpToolCalls(chatData);
    const uniqueNames = new Set<string>();

    allToolCalls.forEach((call) => {
      uniqueNames.add(call.toolName || call.toolId);
    });

    return Array.from(uniqueNames);
  }

  /**
   * Получить историю запросов пользователя из данных чата
   * @param chatData - данные чата Copilot
   * @returns массив запросов пользователя с текстом сообщения
   */
  getUserRequests(chatData: CopilotChatData): UserRequest[] {
    if (!chatData || !Array.isArray(chatData.requests)) {
      return [];
    }

    const userRequests: UserRequest[] = [];

    chatData.requests.forEach((request: any, index: number) => {
      // message can be a string or an object with text property
      let messageText: string | undefined;

      if (typeof request.message === "string") {
        messageText = request.message;
      } else if (request.message && typeof request.message.text === "string") {
        messageText = request.message.text;
      }

      if (messageText) {
        userRequests.push({
          id:
            request.variableData?.requestId ||
            request.requestId ||
            `req-${index}`,
          message: messageText,
          timestamp: request.timestamp,
          index: index,
        });
      }
    });

    return userRequests;
  }

  /**
   * Extract response text from a request object
   * Aggregates text from response[] and toolCallRounds[].response
   */
  private extractResponseText(request: any): string {
    const parts: string[] = [];

    // 1. Extract from response array
    if (Array.isArray(request.response)) {
      for (const item of request.response) {
        if (typeof item === "string") {
          parts.push(item);
        } else if (item.value && typeof item.value === "string") {
          parts.push(item.value);
        }
      }
    }

    // 2. Extract from toolCallRounds (for tool-based responses)
    const toolCallRounds = request.result?.metadata?.toolCallRounds;
    if (Array.isArray(toolCallRounds)) {
      for (const round of toolCallRounds) {
        if (round.response && typeof round.response === "string") {
          // Only add if not already included
          if (!parts.includes(round.response)) {
            parts.push(round.response);
          }
        }
      }
    }

    return parts.join("\n\n");
  }

  /**
   * Count total tool calls in a request
   */
  private countToolCalls(request: any): number {
    const toolCallRounds = request.result?.metadata?.toolCallRounds;
    if (!Array.isArray(toolCallRounds)) return 0;

    return toolCallRounds.reduce((count: number, round: any) => {
      return count + (round.toolCalls?.length || 0);
    }, 0);
  }

  /**
   * Get AI responses from chat data
   * @param chatData - Copilot chat data
   * @returns array of AI responses
   */
  getAIResponses(chatData: CopilotChatData): AIResponse[] {
    if (!chatData || !Array.isArray(chatData.requests)) {
      return [];
    }

    const aiResponses: AIResponse[] = [];

    chatData.requests.forEach((request: any, index: number) => {
      const message = this.extractResponseText(request);
      const toolCallCount = this.countToolCalls(request);

      aiResponses.push({
        requestId: request.requestId || `req-${index}`,
        responseId: request.responseId,
        message,
        timestamp: request.timestamp,
        index,
        hasToolCalls: toolCallCount > 0,
        toolCallCount,
      });
    });

    return aiResponses;
  }

  /**
   * Get full conversation history with paired requests and responses
   * @param chatData - Copilot chat data
   * @returns array of conversation turns (request + response pairs)
   */
  getConversationHistory(chatData: CopilotChatData): ConversationTurn[] {
    const userRequests = this.getUserRequests(chatData);
    const aiResponses = this.getAIResponses(chatData);

    return userRequests.map((request, index) => {
      const response = aiResponses.find((r) => r.index === index) || null;
      return {
        index,
        request,
        response,
      };
    });
  }
}

export default CopilotChatAnalyzer;
export type {
  McpToolCall,
  McpToolMonitoring,
  McpMonitoringSummary,
  UserRequest,
  DialogStatusDetails,
  DialogSession,
  AIResponse,
  ConversationTurn,
};
