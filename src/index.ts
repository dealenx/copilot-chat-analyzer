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

interface IChatDataValidator {
  isValidChatData(chatData: any): boolean;
  hasRequests(chatData: CopilotChatData): boolean;
}

interface IRequestAnalyzer {
  getRequestsCount(chatData: CopilotChatData): number;
  getLastRequest(chatData: CopilotChatData): any | null;
}

interface IDialogStatusAnalyzer {
  getDialogStatus(chatData: CopilotChatData): DialogStatusType;
  getDialogStatusDetails(chatData: CopilotChatData): DialogStatusDetails;
}

class ChatDataValidator implements IChatDataValidator {
  isValidChatData(chatData: any): boolean {
    return chatData && typeof chatData === "object";
  }

  hasRequests(chatData: CopilotChatData): boolean {
    return Array.isArray(chatData.requests) && chatData.requests.length > 0;
  }
}

class RequestAnalyzer implements IRequestAnalyzer {
  private validator: IChatDataValidator;

  constructor(validator: IChatDataValidator) {
    this.validator = validator;
  }

  getRequestsCount(chatData: CopilotChatData): number {
    if (
      !this.validator.isValidChatData(chatData) ||
      !Array.isArray(chatData.requests)
    ) {
      return 0;
    }
    return chatData.requests.length;
  }

  getLastRequest(chatData: CopilotChatData): any | null {
    if (!this.validator.hasRequests(chatData)) {
      return null;
    }
    return chatData.requests![chatData.requests!.length - 1];
  }
}

class DialogStatusAnalyzer implements IDialogStatusAnalyzer {
  private validator: IChatDataValidator;
  private requestAnalyzer: IRequestAnalyzer;

  constructor(
    validator: IChatDataValidator,
    requestAnalyzer: IRequestAnalyzer
  ) {
    this.validator = validator;
    this.requestAnalyzer = requestAnalyzer;
  }

  getDialogStatus(chatData: CopilotChatData): DialogStatusType {
    if (!this.validator.hasRequests(chatData)) {
      return DialogStatus.IN_PROGRESS;
    }

    const lastRequest = this.requestAnalyzer.getLastRequest(chatData);
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

    if (!this.validator.hasRequests(chatData)) {
      return {
        status: DialogStatus.IN_PROGRESS,
        statusText: "Нет запросов",
        hasResult: false,
        hasFollowups: false,
        isCanceled: false,
      };
    }

    const lastRequest = this.requestAnalyzer.getLastRequest(chatData);

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

export class CopilotChatAnalyzer {
  private validator: IChatDataValidator;
  private requestAnalyzer: IRequestAnalyzer;
  private statusAnalyzer: IDialogStatusAnalyzer;

  constructor(
    validator?: IChatDataValidator,
    requestAnalyzer?: IRequestAnalyzer,
    statusAnalyzer?: IDialogStatusAnalyzer
  ) {
    this.validator = validator || new ChatDataValidator();
    this.requestAnalyzer =
      requestAnalyzer || new RequestAnalyzer(this.validator);
    this.statusAnalyzer =
      statusAnalyzer ||
      new DialogStatusAnalyzer(this.validator, this.requestAnalyzer);
  }

  getRequestsCount(chatData: CopilotChatData): number {
    return this.requestAnalyzer.getRequestsCount(chatData);
  }

  getDialogStatus(chatData: CopilotChatData): DialogStatusType {
    return this.statusAnalyzer.getDialogStatus(chatData);
  }

  getDialogStatusDetails(chatData: CopilotChatData): DialogStatusDetails {
    return this.statusAnalyzer.getDialogStatusDetails(chatData);
  }
}

export default CopilotChatAnalyzer;
