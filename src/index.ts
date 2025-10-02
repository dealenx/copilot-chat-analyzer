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
  lastRequestId?: string;
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

export const DialogStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELED: "canceled",
  IN_PROGRESS: "in_progress",
} as const;

export type DialogStatusType = (typeof DialogStatus)[keyof typeof DialogStatus];

export class CopilotChatAnalyzer {
  getRequestsCount(chatData: CopilotChatData): number {
    if (!chatData || !Array.isArray(chatData.requests)) {
      return 0;
    }
    return chatData.requests.length;
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

    if (lastRequest.isCanceled === true) {
      return DialogStatus.CANCELED;
    }

    if ("followups" in lastRequest && Array.isArray(lastRequest.followups)) {
      if (lastRequest.followups.length === 0) {
        return DialogStatus.COMPLETED;
      }
    }

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
        statusText: "Диалог еще не начат",
        hasResult: false,
        hasFollowups: false,
        isCanceled: false,
      };
    }

    const lastRequest = this.getLastRequest(chatData);

    const statusTexts = {
      [DialogStatus.PENDING]: "Диалог еще не начат",
      [DialogStatus.COMPLETED]: "Диалог завершен успешно",
      [DialogStatus.CANCELED]: "Диалог был отменен",
      [DialogStatus.IN_PROGRESS]: "Диалог в процессе выполнения",
    };

    return {
      status,
      statusText: statusTexts[status],
      hasResult:
        lastRequest && "result" in lastRequest && lastRequest.result !== null,
      hasFollowups: lastRequest && "followups" in lastRequest,
      isCanceled: lastRequest && lastRequest.isCanceled === true,
      lastRequestId: lastRequest?.requestId,
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
}

export default CopilotChatAnalyzer;
export type { McpToolCall, McpToolMonitoring, McpMonitoringSummary };
