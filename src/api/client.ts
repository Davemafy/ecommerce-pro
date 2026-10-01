const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 20000);

type RequestBody = BodyInit | Record<string, unknown> | unknown[] | null;
type RequestOptions = {
  method?: string;
  body?: RequestBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retryAuth?: boolean;
};

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, { status = 0, data = null }: { status?: number; data?: unknown } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function setAccessToken(token?: string | null) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

function tokenFrom(payload: any): string | null {
  return payload?.data?.accessToken || payload?.accessToken || null;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}

async function refreshSession() {
  if (!BASE_URL) return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        clearAccessToken();
        return false;
      }
      const payload = await parseResponse(response);
      const nextToken = tokenFrom(payload);
      if (nextToken) setAccessToken(nextToken);
      return true;
    } catch {
      clearAccessToken();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function request(path: string, { method = 'GET', body, headers = {}, signal, retryAuth = true }: RequestOptions = {}) {
  if (!BASE_URL) throw new ApiError('API base URL is not configured.');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(!isFormData && body !== undefined && body !== null ? { 'Content-Type': 'application/json' } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      signal: signal || controller.signal,
      headers: requestHeaders,
      body:
        body === undefined || body === null
          ? undefined
          : isFormData || typeof body === 'string' || body instanceof Blob
            ? (body as BodyInit)
            : JSON.stringify(body),
    });

    if (response.status === 401 && retryAuth && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
      const refreshed = await refreshSession();
      if (refreshed) return request(path, { method, body, headers, signal, retryAuth: false });
    }

    const data: any = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(data?.message || data?.error || `Request failed (${response.status})`, {
        status: response.status,
        data,
      });
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.');
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : 'Network request failed.');
  } finally {
    window.clearTimeout(timeout);
  }
}

export const api = {
  get: (path: string, options: RequestOptions = {}) => request(path, options),
  post: (path: string, body?: RequestBody, options: RequestOptions = {}) => request(path, { ...options, method: 'POST', body }),
  patch: (path: string, body?: RequestBody, options: RequestOptions = {}) => request(path, { ...options, method: 'PATCH', body }),
  put: (path: string, body?: RequestBody, options: RequestOptions = {}) => request(path, { ...options, method: 'PUT', body }),
  delete: (path: string, body?: RequestBody, options: RequestOptions = {}) => request(path, { ...options, method: 'DELETE', body }),
};
