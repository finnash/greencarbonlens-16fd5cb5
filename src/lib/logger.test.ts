import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "./logger";

describe("createLogger", () => {
  const spies = {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
  };
  beforeEach(() => {
    spies.log.mockClear();
    spies.warn.mockClear();
    spies.error.mockClear();
  });
  afterEach(() => {
    spies.log.mockClear();
    spies.warn.mockClear();
    spies.error.mockClear();
  });

  it("emits JSON with scope + level + msg", () => {
    const log = createLogger("test");
    log.info("hello", { k: 1 });
    expect(spies.log).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(spies.log.mock.calls[0]![0] as string);
    expect(payload).toMatchObject({ level: "info", scope: "test", msg: "hello", data: { k: 1 } });
    expect(typeof payload.ts).toBe("string");
  });

  it("routes warn and error to the correct console sinks", () => {
    const log = createLogger("scoped");
    log.warn("careful");
    log.error("nope");
    expect(spies.warn).toHaveBeenCalledTimes(1);
    expect(spies.error).toHaveBeenCalledTimes(1);
  });
});