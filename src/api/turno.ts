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

export async function postCerrarTurno(
  token: string,
  turnoId?: number,
  datafono?: { fotoUri: string; numeroRecogida: string }
) {
  if (datafono) {
    const filename = datafono.fotoUri.split('/').pop() ?? 'datafono.jpg'
    const match = /\.(\w+)$/.exec(filename)
    const ext = match ? match[1] : 'jpg'

    const form = new FormData()
    form.append('accion', 'cerrar')
    if (turnoId) form.append('turno_id', String(turnoId))
    form.append('numero_recogida', datafono.numeroRecogida)
    // React Native FormData acepta este shape de objeto para archivos
    form.append('foto_datafono', {
      uri: datafono.fotoUri,
      name: filename,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    } as unknown as Blob)
    return apiFetch<CierreTurno>('/api/qr/turno', { method: 'POST', token, formData: form })
  }

  return apiFetch<CierreTurno>('/api/qr/turno', {
    method: 'POST',
    token,
    body: turnoId ? { accion: 'cerrar', turno_id: turnoId } : { accion: 'cerrar' },
  })
}
