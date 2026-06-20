import { apiFetch } from './client'

export type PagoQR = {
  id: number
  fecha: string
  valor: number
  foto_url: string
  created_at: string
  punto_venta_nombre?: string | null
}

export type CierreDia = { ok: boolean; fecha: string; total_pagos: number; total_valor: number }

export async function getMisPagosHoy(token: string) {
  return apiFetch<PagoQR[]>('/api/qr/pagos', { token })
}

export async function postCierreDia(token: string) {
  return apiFetch<CierreDia>('/api/qr/cierre-dia', { method: 'POST', token })
}

export async function postPagoQR(token: string, params: {
  fotoUri: string
  valor: number
  puntoVentaId?: number | null
}) {
  const form = new FormData()
  const filename = params.fotoUri.split('/').pop() ?? 'comprobante.jpg'
  const match = /\.(\w+)$/.exec(filename)
  const ext = match ? match[1] : 'jpg'

  // React Native FormData acepta este shape de objeto para archivos
  form.append('foto', {
    uri: params.fotoUri,
    name: filename,
    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  } as unknown as Blob)
  form.append('valor', String(params.valor))
  if (params.puntoVentaId) form.append('punto_venta_id', String(params.puntoVentaId))

  return apiFetch<PagoQR>('/api/qr/pagos', { method: 'POST', token, formData: form })
}
