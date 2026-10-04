const API_URL = 'http://localhost:3000/api'

export function getToken(): string | null {
  return localStorage.getItem('interntrack_token')
}

export function saveToken(token: string): void {
  localStorage.setItem('interntrack_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('interntrack_token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()

  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''

  let payload: unknown = null

  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else {
    payload = await response.text()
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`

    if (response.status === 401) {
      clearToken()
    }

    throw new Error(message)
  }

  return payload as T
}

export const api = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint)
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  },

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'DELETE',
    })
  },
}