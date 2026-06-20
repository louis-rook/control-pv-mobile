import { apiFetch } from './client'
import type { StoredUser } from '../storage/secureStore'

export async function loginMobile(username: string, password: string) {
  return apiFetch<{ token: string; user: StoredUser }>('/api/auth/mobile/login', {
    method: 'POST',
    body: { username, password },
  })
}

export async function cambiarPassword(token: string, nuevaPassword: string) {
  return apiFetch<{ ok: true }>('/api/cambiar-password', {
    method: 'PUT',
    token,
    body: { nueva_password: nuevaPassword },
  })
}
