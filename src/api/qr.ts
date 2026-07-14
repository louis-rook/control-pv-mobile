import { apiFetch } from './client'

export type PagoQR = {
  id: number
  fecha: string
  valor: number
  foto_url: string
  created_at: string
  punto_venta_nombre?: string | null
}

export async function getMisPagosHoy(token: string, turnoId?: number) {
  const qs = turnoId ? `?turno_id=${turnoId}` : ''
  return apiFetch<PagoQR[]>(`/api/qr/pagos${qs}`, { token })
}

export async function putPagoQR(token: string, id: number, valor: number) {
  return apiFetch<{ ok: true }>(`/api/qr/pagos/${id}`, { method: 'PUT', token, body: { valor } })
}

export async function deletePagoQR(token: string, id: number) {
  return apiFetch<{ ok: true }>(`/api/qr/pagos/${id}`, { method: 'DELETE', token })
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
