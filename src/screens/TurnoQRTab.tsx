import React, { useEffect, useState, useCallback } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { getTurno, postAbrirTurno, postCerrarTurno, type Turno } from '../api/turno'
import { getPuntosVenta, type PuntoVenta } from '../api/pvn'
import { ApiError } from '../api/client'
import AbrirTurnoAviso from '../components/AbrirTurnoAviso'
import TurnoPendienteAviso from '../components/TurnoPendienteAviso'
import PagoQRForm from './PagoQRForm'

export default function TurnoQRTab() {
  const { user, token } = useAuth()
  const pvFijo = user?.punto_venta_id ?? null
  const esRotatoria = user?.rol === 'pvv' && !pvFijo

  const [turnoHoy, setTurnoHoy]           = useState<Turno | null | undefined>(undefined)
  const [turnoPendiente, setTurnoPendiente] = useState<Turno | null>(null)
  const [puntos, setPuntos]               = useState<PuntoVenta[]>([])
  const [puntoSel, setPuntoSel]           = useState<number | null>(null)
  const [abriendo, setAbriendo]           = useState(false)
  const [cerrandoPendiente, setCerrandoPendiente] = useState(false)
  const [error, setError]                 = useState('')

  const cargarTurno = useCallback(() => {
    if (!token) return
    getTurno(token)
      .then(d => { setTurnoHoy(d.turnoHoy); setTurnoPendiente(d.turnoPendiente) })
      .catch(() => { setTurnoHoy(null); setTurnoPendiente(null) })
  }, [token])

  useEffect(() => { cargarTurno() }, [cargarTurno])

  useEffect(() => {
    if (!token || !esRotatoria) return
    getPuntosVenta(token, 'principal').then(data => setPuntos(data.filter(p => p.activo))).catch(() => {})
  }, [token, esRotatoria])

  async function abrir(puntoId?: number) {
    if (!token) return
    setError('')
    if (esRotatoria && !puntoId) { setError('Selecciona el punto de venta'); return }
    setAbriendo(true)
    try {
      const t = await postAbrirTurno(token, puntoId)
      setTurnoHoy(t)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al abrir turno')
    } finally {
      setAbriendo(false)
    }
  }

  async function cerrarPendiente(turnoId: number) {
    if (!token) return
    setCerrandoPendiente(true)
    try {
      await postCerrarTurno(token, turnoId)
      setTurnoPendiente(null)
    } finally {
      setCerrandoPendiente(false)
    }
  }

  if (turnoHoy === undefined) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#0047BA" /></View>
  }

  if (turnoPendiente && !turnoHoy) {
    return <TurnoPendienteAviso turno={turnoPendiente} onCerrar={() => cerrarPendiente(turnoPendiente.id)} cerrando={cerrandoPendiente} />
  }

  if (!turnoHoy) {
    return (
      <AbrirTurnoAviso
        esRotatoria={esRotatoria}
        puntos={puntos}
        puntoSel={puntoSel}
        onSeleccionar={setPuntoSel}
        onIniciar={() => abrir(puntoSel ?? undefined)}
        abriendo={abriendo}
        error={error}
      />
    )
  }

  return (
    <PagoQRForm
      puntoVentaId={turnoHoy.punto_venta_id}
      puntoNombre={turnoHoy.punto_venta_nombre}
      onTurnoCerrado={() => { setTurnoHoy(null); setPuntoSel(null) }}
    />
  )
}
