const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  /** Cuerpo completo de la respuesta de error (p. ej. requiere2fa en el login) */
  datos: Record<string, unknown> | null
  constructor(message: string, status: number, datos: Record<string, unknown> | null = null) {
    super(message)
    this.status = status
    this.datos = datos
  }
}

// Permite que AuthContext se entere de un 401 en cualquier llamada y cierre la
// sesión automáticamente, en vez de dejar al usuario viendo un error genérico
// con un token vencido que ya no sirve para nada.
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string | null
  body?: unknown
  formData?: FormData
}

export async function apiFetch<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  if (!opts.formData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  })

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.()
    const msg = (data as { error?: string } | null)?.error ?? `Error de red (${res.status})`
    throw new ApiError(msg, res.status, (data as Record<string, unknown> | null) ?? null)
  }

  return data as T
}
