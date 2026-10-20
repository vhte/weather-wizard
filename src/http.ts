const TIMEOUT_MS = 20_000;

export class HttpError extends Error {
  constructor(
    readonly url: string,
    readonly status: number,
  ) {
    super(`Request to ${new URL(url).host} failed with HTTP ${status}`);
    this.name = "HttpError";
  }
}

/** GET a JSON document, failing on non-2xx and after a timeout. */
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const response = await fetch(url, {
    headers: { Accept: "application/json, application/geo+json" },
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) throw new HttpError(url, response.status);
  return (await response.json()) as T;
}
