import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { usePvvSession } from '../../src/context/PvvSessionContext'
import AppHeader from '../../src/components/AppHeader'
import PagoQRForm from '../../src/screens/PagoQRForm'
import TurnoCerradoAviso from '../../src/components/TurnoCerradoAviso'

export default function PvvPagoQRScreen() {
  const { user } = useAuth()
  const { punto, setPunto } = usePvvSession()
  const router = useRouter()
  // Solo relevante para punto fijo: la rotativa "cierra turno" saliendo de la
  // sesión (ver handleTurnoCerrado), así que no necesita este estado.
  const [turnoAbierto, setTurnoAbierto] = useState(true)

  const pvFijo = user?.punto_venta_id ?? null

  // Sin punto fijo asignado (rotativa) y sin punto elegido en esta sesión:
  // forzamos elegirlo antes de poder registrar un pago.
  if (!pvFijo && !punto) {
    router.replace('/(app)/pvv-seleccionar-punto')
    return null
  }

  const puntoVentaId = pvFijo ?? punto?.id
  const puntoNombre  = pvFijo ? (user?.punto_venta_nombre ?? 'Tu punto de venta asignado') : punto?.nombre

  // No se puede cambiar de punto sin cerrar turno primero: al cerrar, la
  // rotativa vuelve a pedir el punto; la fija solo debe reabrir turno.
  function handleTurnoCerrado() {
    if (pvFijo) {
      setTurnoAbierto(false)
    } else {
      setPunto(null)
      router.replace('/(app)/pvv-seleccionar-punto')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EBF4FF' }}>
      <AppHeader title={user?.name ?? 'PVV'} subtitle="Pago QR" />
      {pvFijo && !turnoAbierto ? (
        <TurnoCerradoAviso onIniciar={() => setTurnoAbierto(true)} />
      ) : (
        <PagoQRForm
          puntoVentaId={puntoVentaId}
          puntoNombre={puntoNombre}
          onTurnoCerrado={handleTurnoCerrado}
        />
      )}
    </SafeAreaView>
  )
}
