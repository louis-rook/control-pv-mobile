import { apiFetch } from './client'
import type { StoredUser } from '../storage/secureStore'

/**
 * Login de la app. `codigo` solo lo usan los administradores con verificación en
 * dos pasos (6 dígitos de su app autenticadora o un código de recuperación); si
 * hace falta, el servidor responde 401 con requiere2fa: true.
 */
export async function loginMobile(username: string, password: string, codigo?: string) {
  return apiFetch<{ token: string; user: StoredUser }>('/api/auth/mobile/login', {
    method: 'POST',
    body: { username, password, ...(codigo ? { codigo } : {}) },
  })
}

export async function cambiarPassword(token: string, nuevaPassword: string) {
  return apiFetch<{ ok: true }>('/api/cambiar-password', {
    method: 'PUT',
    token,
    body: { nueva_password: nuevaPassword },
  })
}
