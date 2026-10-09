import type { Page, Response } from "@playwright/test";

const transientStatuses = new Set([429, 500, 502, 503, 504]);

function retryDelay(response: Response | null, attempt: number): number {
  const retryAfter = response?.headers()["retry-after"];
  const seconds = Number(retryAfter);
  const headerDelay = Number.isFinite(seconds)
    ? seconds * 1000
    : Date.parse(retryAfter ?? "") - Date.now();
  const backoff = Number.isFinite(headerDelay) && headerDelay > 0
    ? headerDelay
    : 250 * 2 ** attempt;
  return Math.min(backoff, 2000);
}

function waitForRetry(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function navigateWithRetry(
  page: Page,
  url: string,
  attempts = 2,
): Promise<Response | null> {
  let lastError: Error = new Error(`Navigation failed for ${url}`);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let response: Response | null;
    try {
      response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt + 1 < attempts) await waitForRetry(250 * 2 ** attempt);
      continue;
    }

    if (!response || response.status() < 400) return response;
    lastError = new Error(`Navigation to ${url} returned HTTP ${response.status()}`);
    if (!transientStatuses.has(response.status()) || attempt + 1 >= attempts)
      break;
    await waitForRetry(retryDelay(response, attempt));
  }

  throw lastError;
}