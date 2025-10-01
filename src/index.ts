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

// Экспорт по умолчанию для основной функции
export default copilotChatAnalyze;
