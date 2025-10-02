import { CopilotChatAnalyzer, DialogStatus } from "../index";

describe("CopilotChatAnalyzer", () => {
  let analyzer: CopilotChatAnalyzer;

  beforeEach(() => {
    analyzer = new CopilotChatAnalyzer();
  });

  describe("getRequestsCount", () => {
    test("should return 0 for empty chat data", () => {
      const chatData = {};
      expect(analyzer.getRequestsCount(chatData)).toBe(0);
    });

    test("should return 0 for null chat data", () => {
      expect(analyzer.getRequestsCount(null as any)).toBe(0);
    });

    test("should return correct count for valid requests", () => {
      const chatData = {
        requests: [{ requestId: "1" }, { requestId: "2" }, { requestId: "3" }],
      };
      expect(analyzer.getRequestsCount(chatData)).toBe(3);
    });

    test("should return 0 for empty requests array", () => {
      const chatData = { requests: [] };
      expect(analyzer.getRequestsCount(chatData)).toBe(0);
    });
  });

  describe("getDialogStatus", () => {
    test("should return PENDING for empty requests", () => {
      const chatData = { requests: [] };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.PENDING);
    });

    test("should return CANCELED when last request is canceled", () => {
      const chatData = {
        requests: [{ requestId: "1", isCanceled: true }],
      };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.CANCELED);
    });

    test("should return COMPLETED when last request has empty followups", () => {
      const chatData = {
        requests: [{ requestId: "1", followups: [] }],
      };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.COMPLETED);
    });

    test("should return IN_PROGRESS when no followups property", () => {
      const chatData = {
        requests: [{ requestId: "1" }],
      };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.IN_PROGRESS);
    });

    test("should prioritize canceled status over followups", () => {
      const chatData = {
        requests: [{ requestId: "1", isCanceled: true, followups: [] }],
      };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.CANCELED);
    });

    test("should return IN_PROGRESS when followups is not array", () => {
      const chatData = {
        requests: [{ requestId: "1", followups: "not-array" }],
      };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.IN_PROGRESS);
    });

    test("should return IN_PROGRESS when followups has items", () => {
      const chatData = {
        requests: [{ requestId: "1", followups: ["item1", "item2"] }],
      };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.IN_PROGRESS);
    });

    test("should handle multiple requests correctly", () => {
      const chatData = {
        requests: [
          { requestId: "1", followups: [] },
          { requestId: "2", isCanceled: false },
          { requestId: "3", followups: [] },
        ],
      };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.COMPLETED);
    });

    test("should return PENDING for chat with no requests property", () => {
      const chatData = {};
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.PENDING);
    });

    test("should return PENDING for chat with undefined requests", () => {
      const chatData = { requests: undefined };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.PENDING);
    });
  });

  describe("getDialogStatusDetails", () => {
    test("should return correct details for empty chat data", () => {
      const details = analyzer.getDialogStatusDetails({});

      expect(details.status).toBe(DialogStatus.PENDING);
      expect(details.statusText).toBe("Диалог еще не начат");
      expect(details.hasResult).toBe(false);
      expect(details.hasFollowups).toBe(false);
      expect(details.isCanceled).toBe(false);
    });

    test("should return correct details for completed dialog", () => {
      const chatData = {
        requests: [
          {
            requestId: "req-123",
            followups: [],
            result: "some result",
          },
        ],
      };
      const details = analyzer.getDialogStatusDetails(chatData);

      expect(details.status).toBe(DialogStatus.COMPLETED);
      expect(details.hasResult).toBe(true);
      expect(details.lastRequestId).toBe("req-123");
    });

    test("should return correct details for canceled dialog", () => {
      const chatData = {
        requests: [
          {
            requestId: "req-456",
            isCanceled: true,
          },
        ],
      };
      const details = analyzer.getDialogStatusDetails(chatData);

      expect(details.status).toBe(DialogStatus.CANCELED);
      expect(details.isCanceled).toBe(true);
      expect(details.lastRequestId).toBe("req-456");
    });
  });

  describe("DialogStatus constants", () => {
    test("should have correct values", () => {
      expect(DialogStatus.COMPLETED).toBe("completed");
      expect(DialogStatus.CANCELED).toBe("canceled");
      expect(DialogStatus.IN_PROGRESS).toBe("in_progress");
    });
  });

  describe("Real chat data tests", () => {
    test("should correctly analyze completed chat", () => {
      // Данные завершенного чата (упрощенная версия из completed_chat.json)
      const completedChatData = {
        requests: [
          {
            requestId: "request_962e76d4-743c-490e-9609-c8f65ef52f56",
            followups: [], // Пустой массив followups означает завершенный диалог
            result: {
              timings: {
                firstProgress: 4056,
                totalElapsed: 59981,
              },
              metadata: {
                codeBlocks: [],
              },
            },
            isCanceled: false,
          },
        ],
      };

      // Тестируем количество запросов
      expect(analyzer.getRequestsCount(completedChatData)).toBe(1);

      // Тестируем статус диалога
      expect(analyzer.getDialogStatus(completedChatData)).toBe(
        DialogStatus.COMPLETED
      );

      // Тестируем детали статуса
      const details = analyzer.getDialogStatusDetails(completedChatData);
      expect(details.status).toBe(DialogStatus.COMPLETED);
      expect(details.statusText).toBe("Диалог завершен успешно");
      expect(details.hasResult).toBe(true);
      expect(details.hasFollowups).toBe(true);
      expect(details.isCanceled).toBe(false);
      expect(details.lastRequestId).toBe(
        "request_962e76d4-743c-490e-9609-c8f65ef52f56"
      );
    });

    test("should correctly analyze in-progress chat", () => {
      // Данные чата в процессе (упрощенная версия из in_progress_chat.json)
      const inProgressChatData = {
        requests: [
          {
            requestId: "request_962e76d4-743c-490e-9609-c8f65ef52f56",
            // Нет поля followups = диалог в процессе
            isCanceled: false,
          },
        ],
      };

      // Тестируем количество запросов
      expect(analyzer.getRequestsCount(inProgressChatData)).toBe(1);

      // Тестируем статус диалога
      expect(analyzer.getDialogStatus(inProgressChatData)).toBe(
        DialogStatus.IN_PROGRESS
      );

      // Тестируем детали статуса
      const details = analyzer.getDialogStatusDetails(inProgressChatData);
      expect(details.status).toBe(DialogStatus.IN_PROGRESS);
      expect(details.statusText).toBe("Диалог в процессе выполнения");
      expect(details.hasResult).toBe(false);
      expect(details.hasFollowups).toBe(false);
      expect(details.isCanceled).toBe(false);
      expect(details.lastRequestId).toBe(
        "request_962e76d4-743c-490e-9609-c8f65ef52f56"
      );
    });

    test("should correctly analyze canceled chat", () => {
      // Данные отмененного чата
      const canceledChatData = {
        requests: [
          {
            requestId: "request_canceled_123",
            isCanceled: true, // Отмененный запрос
            result: null,
          },
        ],
      };

      // Тестируем количество запросов
      expect(analyzer.getRequestsCount(canceledChatData)).toBe(1);

      // Тестируем статус диалога
      expect(analyzer.getDialogStatus(canceledChatData)).toBe(
        DialogStatus.CANCELED
      );

      // Тестируем детали статуса
      const details = analyzer.getDialogStatusDetails(canceledChatData);
      expect(details.status).toBe(DialogStatus.CANCELED);
      expect(details.statusText).toBe("Диалог был отменен");
      expect(details.hasResult).toBe(false);
      expect(details.hasFollowups).toBe(false);
      expect(details.isCanceled).toBe(true);
      expect(details.lastRequestId).toBe("request_canceled_123");
    });
  });
});
