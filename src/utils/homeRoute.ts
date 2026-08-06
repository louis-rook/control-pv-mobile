import type { StoredUser } from '../storage/secureStore'

// Pantalla de inicio según el rol, una sola vez para no desincronizar
// index.tsx / login.tsx / cambiar-password.tsx entre sí.
export function homeRoute(rol: StoredUser['rol']): string {
  if (rol === 'pvn') return '/(app)/pvn-registrar'
  if (rol === 'pvv') return '/(app)/pvv-pago-qr'
  return '/(app)/movimiento-foto'
}
