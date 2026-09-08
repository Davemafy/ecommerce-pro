const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

type RequestBody = unknown;
type RequestOptions = {
  method?: string;
  body?: RequestBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

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

export async function request(path: string, { method = 'GET', body, headers = {}, signal }: RequestOptions = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  const token = localStorage.getItem('commercepro_access_token');

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal: signal || controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const data: any = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) throw new ApiError(data?.message || `Request failed (${response.status})`, { status: response.status, data });
    return data;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiError('Request timed out. Please try again.');
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : 'Network request failed.');
  } finally {
    window.clearTimeout(timeout);
  }
}

export const api = {
  get: (path: string, options: RequestOptions = {}) => request(path, options),
  post: (path: string, body: RequestBody, options: RequestOptions = {}) => request(path, { ...options, method: 'POST', body }),
  patch: (path: string, body: RequestBody, options: RequestOptions = {}) => request(path, { ...options, method: 'PATCH', body }),
  put: (path: string, body: RequestBody, options: RequestOptions = {}) => request(path, { ...options, method: 'PUT', body }),
  delete: (path: string, options: RequestOptions = {}) => request(path, { ...options, method: 'DELETE' }),
};
