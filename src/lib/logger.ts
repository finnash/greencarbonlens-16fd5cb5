/**
 * Minimal structured logger.
 *
 * Why: ad-hoc `console.log` calls bury context and leak to production. A
 * single shim lets us tag every line with a feature scope, drop logs at
 * configured levels, and route to a different sink later without rewriting
 * call sites.
 *
 * Levels: debug < info < warn < error. Defaults to `info` in production
 * and `debug` in development.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentLevel(): LogLevel {
  // `import.meta.env.DEV` is replaced at build time on the client; on the
  // server we read NODE_ENV from process.env which Vite preserves.
  const isDev =
    (typeof import.meta !== "undefined" && (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) ||
    (typeof process !== "undefined" && process.env?.NODE_ENV !== "production");
  return isDev ? "debug" : "info";
}

function emit(level: LogLevel, scope: string, msg: string, data?: unknown) {
  if (LEVEL_RANK[level] < LEVEL_RANK[currentLevel()]) return;
  const payload = {
    ts: new Date().toISOString(),
    level,
    scope,
    msg,
    ...(data !== undefined ? { data } : {}),
  };
  // eslint-disable-next-line no-console
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  sink(JSON.stringify(payload));
}

/** Create a scoped logger so every line is tagged with its feature. */
export function createLogger(scope: string) {
  return {
    debug: (msg: string, data?: unknown) => emit("debug", scope, msg, data),
    info: (msg: string, data?: unknown) => emit("info", scope, msg, data),
    warn: (msg: string, data?: unknown) => emit("warn", scope, msg, data),
    error: (msg: string, data?: unknown) => emit("error", scope, msg, data),
  };
}

export const logger = createLogger("app");