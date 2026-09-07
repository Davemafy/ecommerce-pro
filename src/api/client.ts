const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const token = localStorage.getItem('commercepro_access_token');

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal: signal || controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(data?.message || `Request failed (${response.status})`, {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('Request timed out. Please try again.');
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network request failed.');
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
