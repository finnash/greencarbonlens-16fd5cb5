/**
 * Lightweight Result<T, E> helper.
 *
 * Why: keeps recoverable failures explicit in return types instead of
 * relying on thrown exceptions. Used by callers that want to render a
 * fallback UI rather than crash an error boundary.
 *
 * @example
 * ```ts
 * const r = await fetchProfile();
 * if (r.ok) return r.value;
 * logger.warn("profile fetch failed", r.error);
 * ```
 */
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

/** Construct a successful Result. */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/** Construct a failed Result. */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

/** Type guard for the success branch. */
export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok;

/** Type guard for the failure branch. */
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok;

/** Map the success value, leaving errors untouched. */
export function map<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return r.ok ? ok(fn(r.value)) : r;
}

/** Unwrap a Result, returning a fallback on the error branch. */
export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback;
}

/**
 * Wrap a thunk that may throw and return a Result. Always normalizes the
 * error to an `Error` instance with the original cause preserved.
 */
export async function tryCatch<T>(fn: () => Promise<T> | T): Promise<Result<T, Error>> {
  try {
    return ok(await fn());
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause), { cause });
    return err(error);
  }
}