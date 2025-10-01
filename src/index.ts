interface CopilotChatData {
  requesterUsername?: string;
  responderUsername?: string;
  requests?: any[];
  [key: string]: any;
}

/**
 * Анализирует данные чата Copilot и извлекает requesterUsername
 * @param chatData - Объект с данными чата
 * @returns requesterUsername или null если не найден
 */
export function copilotChatAnalyze(chatData: CopilotChatData): string | null {
  if (!chatData || typeof chatData !== "object") {
    return null;
  }

  return chatData.requesterUsername || null;
}

/**
 * Получает полную информацию о пользователях из чата
 * @param chatData - Объект с данными чата
 * @returns Объект с информацией о пользователях
 */
export function getChatUsers(chatData: CopilotChatData): {
  requester: string | null;
  responder: string | null;
} {
  if (!chatData || typeof chatData !== "object") {
    return { requester: null, responder: null };
  }

  return {
    requester: chatData.requesterUsername || null,
    responder: chatData.responderUsername || null,
  };
}

/**
 * Подсчитывает количество запросов в чате
 * @param chatData - Объект с данными чата
 * @returns Количество запросов
 */
export function getRequestsCount(chatData: CopilotChatData): number {
  if (!chatData || !Array.isArray(chatData.requests)) {
    return 0;
  }

  return chatData.requests.length;
}

/**
 * Статусы диалога
 */
export const DialogStatus = {
  COMPLETED: "completed", // Завершен
  CANCELED: "canceled", // Отменен
  IN_PROGRESS: "in_progress", // В процессе
} as const;

export type DialogStatus = (typeof DialogStatus)[keyof typeof DialogStatus];

/**
 * Определяет статус последнего запроса в диалоге
 * @param chatData - Объект с данными чата
 * @returns Статус диалога
 */
export function getDialogStatus(chatData: CopilotChatData): DialogStatus {
  if (
    !chatData ||
    !Array.isArray(chatData.requests) ||
    chatData.requests.length === 0
  ) {
    return DialogStatus.IN_PROGRESS;
  }

  const lastRequest = chatData.requests[chatData.requests.length - 1];

  // Проверяем наличие поля isCanceled
  if (lastRequest.isCanceled === true) {
    return DialogStatus.CANCELED;
  }

  // Проверяем наличие followups - если есть пустой массив, то диалог завершен
  if ("followups" in lastRequest && Array.isArray(lastRequest.followups)) {
    if (lastRequest.followups.length === 0) {
      return DialogStatus.COMPLETED;
    }
  }

  // Если нет поля followups, значит диалог еще в процессе
  if (!("followups" in lastRequest)) {
    return DialogStatus.IN_PROGRESS;
  }

  return DialogStatus.IN_PROGRESS;
}

/**
 * Получает детальную информацию о статусе диалога
 * @param chatData - Объект с данными чата
 * @returns Объект с детальной информацией о статусе
 */
export function getDialogStatusDetails(chatData: CopilotChatData): {
  status: DialogStatus;
  statusText: string;
  hasResult: boolean;
  hasFollowups: boolean;
  isCanceled: boolean;
  lastRequestId?: string;
} {
  const status = getDialogStatus(chatData);

  if (
    !chatData ||
    !Array.isArray(chatData.requests) ||
    chatData.requests.length === 0
  ) {
    return {
      status: DialogStatus.IN_PROGRESS,
      statusText: "Нет запросов",
      hasResult: false,
      hasFollowups: false,
      isCanceled: false,
    };
  }

  const lastRequest = chatData.requests[chatData.requests.length - 1];

  const statusTexts = {
    [DialogStatus.COMPLETED]: "Диалог завершен успешно",
    [DialogStatus.CANCELED]: "Диалог был отменен",
    [DialogStatus.IN_PROGRESS]: "Диалог в процессе выполнения",
  };

  return {
    status,
    statusText: statusTexts[status],
    hasResult: "result" in lastRequest && lastRequest.result !== null,
    hasFollowups: "followups" in lastRequest,
    isCanceled: lastRequest.isCanceled === true,
    lastRequestId: lastRequest.requestId,
  };
}

// Экспорт по умолчанию для основной функции
export default copilotChatAnalyze;
