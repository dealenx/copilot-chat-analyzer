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
    test("should return IN_PROGRESS for empty requests", () => {
      const chatData = { requests: [] };
      expect(analyzer.getDialogStatus(chatData)).toBe(DialogStatus.IN_PROGRESS);
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
  });

  describe("getDialogStatusDetails", () => {
    test("should return correct details for empty chat data", () => {
      const details = analyzer.getDialogStatusDetails({});

      expect(details.status).toBe(DialogStatus.IN_PROGRESS);
      expect(details.statusText).toBe("Нет запросов");
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
});
