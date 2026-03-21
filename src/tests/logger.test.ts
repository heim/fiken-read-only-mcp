import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../logger.js";

describe("logger", () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it("writes structured JSON to stderr", () => {
    logger.info("test_event", { key: "value" });

    expect(stderrSpy).toHaveBeenCalledOnce();
    const output = stderrSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe("info");
    expect(parsed.event).toBe("test_event");
    expect(parsed.key).toBe("value");
    expect(parsed.timestamp).toBeDefined();
  });

  it("supports warn level", () => {
    logger.warn("warning_event");

    const output = stderrSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe("warn");
  });

  it("supports error level", () => {
    logger.error("error_event", { reason: "failure" });

    const output = stderrSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe("error");
    expect(parsed.reason).toBe("failure");
  });

  it("outputs valid newline-delimited JSON", () => {
    logger.info("event1");
    logger.info("event2");

    expect(stderrSpy).toHaveBeenCalledTimes(2);
    for (const call of stderrSpy.mock.calls) {
      const line = call[0] as string;
      expect(line.endsWith("\n")).toBe(true);
      expect(() => JSON.parse(line)).not.toThrow();
    }
  });
});
