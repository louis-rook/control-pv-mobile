import { apiFetch } from './client'

export type Componente = { componente_id: number; componente_nombre: string; cantidad: number; unidad: string }
export type Producto   = { id: number; nombre: string; activo: boolean; componentes: Componente[] }
export type PuntoVenta = { id: number; nombre: string; activo: boolean; tipo: 'nacional' | 'principal' }

export async function getProductos(token: string) {
  return apiFetch<Producto[]>('/api/pvn/productos', { token })
}

export async function getPuntosVenta(token: string, tipo?: 'nacional' | 'principal') {
  const qs = tipo ? `?tipo=${tipo}` : ''
  return apiFetch<PuntoVenta[]>(`/api/pvn/puntos-venta${qs}`, { token })
}

export async function postRegistroVentas(token: string, payload: {
  turno: string
  observaciones?: string | null
  detalle: Array<{ producto_id: number; producto_nombre: string; cantidad: number }>
}) {
  return apiFetch<{ id: number }>('/api/pvn/registros', { method: 'POST', token, body: payload })
}
