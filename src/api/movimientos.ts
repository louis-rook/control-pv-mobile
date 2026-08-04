import { apiFetch } from './client'

export type MovimientoActivo = {
  id: number
  equipo_id: string
  descripcion: string
  tipo_activo: string
  cantidad: number
  marca: string
  modelo: string
  numero_serie: string
}

export type MovimientoDetalle = {
  id: string
  fecha: string
  movimiento: string
  tipo_movimiento: string
  motivo: string
  origen_nombre: string
  origen_area: string
  destino_nombre: string
  destino_area: string
  estado: string
  foto_autorizacion_url: string | null
  activos: MovimientoActivo[]
}

export async function getMovimiento(token: string, id: string) {
  return apiFetch<MovimientoDetalle>(`/api/sistemas/movimientos/${id.trim().toUpperCase()}`, { token })
}

export async function postFotoMovimiento(token: string, id: string, fotoUri: string) {
  const form = new FormData()
  const filename = fotoUri.split('/').pop() ?? 'autorizacion.jpg'
  const match = /\.(\w+)$/.exec(filename)
  const ext = match ? match[1] : 'jpg'

  // React Native FormData acepta este shape de objeto para archivos
  form.append('foto', {
    uri: fotoUri,
    name: filename,
    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  } as unknown as Blob)

  return apiFetch<{ foto_autorizacion_url: string }>(`/api/sistemas/movimientos/${id.trim().toUpperCase()}/foto`, {
    method: 'POST', token, formData: form,
  })
}
