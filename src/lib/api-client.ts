export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      (data as { error?: string })?.error || "Request failed",
      response.status,
      data,
    );
  }

  return data as T;
}

export function resolveApiUrl(path: string, baseUrl?: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}${path}`;
  }

  return path;
}
