import { apiFetch } from './client'

export type Turno = {
  id: number
  punto_venta_id: number
  punto_venta_nombre: string
  fecha: string
  abierto_at: string
}
export type TurnoResp = { turnoHoy: Turno | null; turnoPendiente: Turno | null }
export type CierreTurno = { ok: boolean; total_pagos: number; total_valor: number }
export type TurnoHist = {
  id: number
  punto_venta_id: number
  punto_venta_nombre: string
  fecha: string
  abierto_at: string
  cerrado_at: string | null
  activo: boolean
}

export async function getTurno(token: string) {
  return apiFetch<TurnoResp>('/api/qr/turno?pendiente=true', { token })
}

export async function getTurnosHistorialHoy(token: string) {
  return apiFetch<TurnoHist[]>('/api/qr/turno?historial=true', { token })
}

export async function postAbrirTurno(token: string, puntoVentaId?: number) {
  return apiFetch<Turno>('/api/qr/turno', {
    method: 'POST',
    token,
    body: { accion: 'abrir', punto_venta_id: puntoVentaId },
  })
}

export async function postCerrarTurno(token: string, turnoId?: number) {
  return apiFetch<CierreTurno>('/api/qr/turno', {
    method: 'POST',
    token,
    body: turnoId ? { accion: 'cerrar', turno_id: turnoId } : { accion: 'cerrar' },
  })
}
