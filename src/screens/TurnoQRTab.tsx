import React, { useEffect, useState, useCallback } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { getTurno, postAbrirTurno, postCerrarTurno, type Turno } from '../api/turno'
import { getPuntosVenta, type PuntoVenta } from '../api/pvn'
import { ApiError } from '../api/client'
import AbrirTurnoAviso from '../components/AbrirTurnoAviso'
import TurnoPendienteAviso from '../components/TurnoPendienteAviso'
import CierreDatafonoModal from '../components/CierreDatafonoModal'
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
  const [mostrarDatafonoPendiente, setMostrarDatafonoPendiente] = useState(false)
  const [errorDatafonoPendiente, setErrorDatafonoPendiente]     = useState('')

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

  // PVV (fijo o rotativo) debe adjuntar la foto de cierre del datafono + el
  // número de recogida del cuadre de caja antes de poder cerrar; PVN cierra
  // directo sin ese paso.
  function cerrarPendiente(turnoId: number) {
    if (user?.rol === 'pvv') {
      setErrorDatafonoPendiente('')
      setMostrarDatafonoPendiente(true)
      return
    }
    cerrarPendienteSimple(turnoId)
  }

  async function cerrarPendienteSimple(turnoId: number) {
    if (!token) return
    setCerrandoPendiente(true)
    setErrorDatafonoPendiente('')
    try {
      await postCerrarTurno(token, turnoId)
      setTurnoPendiente(null)
    } catch (e) {
      setErrorDatafonoPendiente(e instanceof ApiError ? e.message : 'Error al cerrar turno')
    } finally {
      setCerrandoPendiente(false)
    }
  }

  async function cerrarPendienteConDatafono(fotoUri: string, numeroRecogida: string) {
    if (!token || !turnoPendiente) return
    setCerrandoPendiente(true)
    setErrorDatafonoPendiente('')
    try {
      await postCerrarTurno(token, turnoPendiente.id, { fotoUri, numeroRecogida })
      setTurnoPendiente(null)
      setMostrarDatafonoPendiente(false)
    } catch (e) {
      setErrorDatafonoPendiente(e instanceof ApiError ? e.message : 'Error al cerrar turno')
    } finally {
      setCerrandoPendiente(false)
    }
  }

  if (turnoHoy === undefined) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#0047BA" /></View>
  }

  if (turnoPendiente && !turnoHoy) {
    return (
      <View style={{ flex: 1 }}>
        <TurnoPendienteAviso
          turno={turnoPendiente}
          onCerrar={() => cerrarPendiente(turnoPendiente.id)}
          cerrando={cerrandoPendiente}
          error={mostrarDatafonoPendiente ? undefined : errorDatafonoPendiente}
        />
        <CierreDatafonoModal
          visible={mostrarDatafonoPendiente}
          cerrando={cerrandoPendiente}
          error={errorDatafonoPendiente}
          onCancelar={() => setMostrarDatafonoPendiente(false)}
          onConfirmar={cerrarPendienteConDatafono}
        />
      </View>
    )
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
