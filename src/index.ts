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

export const DialogStatus = {
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
      return DialogStatus.IN_PROGRESS;
    }

    const lastRequest = this.getLastRequest(chatData);
    if (!lastRequest) {
      return DialogStatus.IN_PROGRESS;
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
        status: DialogStatus.IN_PROGRESS,
        statusText: "Нет запросов",
        hasResult: false,
        hasFollowups: false,
        isCanceled: false,
      };
    }

    const lastRequest = this.getLastRequest(chatData);

    const statusTexts = {
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
}

export default CopilotChatAnalyzer;
