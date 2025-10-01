import { CopilotChatAnalyzer } from "../index";

describe("Module Compatibility Tests", () => {
  describe("ES Module Import", () => {
    test("should import CopilotChatAnalyzer class successfully", () => {
      expect(CopilotChatAnalyzer).toBeDefined();
      expect(typeof CopilotChatAnalyzer).toBe("function");
    });

    test("should create instance of CopilotChatAnalyzer", () => {
      const analyzer = new CopilotChatAnalyzer();
      expect(analyzer).toBeInstanceOf(CopilotChatAnalyzer);
    });

    test("should have all expected methods", () => {
      const analyzer = new CopilotChatAnalyzer();
      expect(typeof analyzer.getRequestsCount).toBe("function");
      expect(typeof analyzer.getDialogStatus).toBe("function");
      expect(typeof analyzer.getDialogStatusDetails).toBe("function");
    });
  });
});
