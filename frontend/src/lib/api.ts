const API_URL = import.meta.env.VITE_API_URL;
const sessionKey = 'autobid-session';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function fetchApi<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!API_URL) throw new ApiError('La API no está configurada.', 0);
  let storedToken = '';
  try { storedToken = (JSON.parse(localStorage.getItem(sessionKey) || '{}') as { idToken?: string }).idToken || ''; } catch { /* Ignore malformed local storage. */ }
  const authorizationToken = token || storedToken;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(authorizationToken ? { Authorization: `Bearer ${authorizationToken}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.message || 'No fue posible completar la operación.', response.status);
  return data as T;
}
