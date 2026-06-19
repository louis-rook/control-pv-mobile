import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { usePvvSession } from '../../src/context/PvvSessionContext'
import AppHeader from '../../src/components/AppHeader'
import PagoQRForm from '../../src/screens/PagoQRForm'

export default function PvvPagoQRScreen() {
  const { user } = useAuth()
  const { punto } = usePvvSession()
  const router = useRouter()

  // Si no hay punto seleccionado (p. ej. la app se cerró y se reabrió),
  // forzamos volver a elegirlo antes de poder registrar un pago.
  if (!punto) {
    router.replace('/(app)/pvv-seleccionar-punto')
    return null
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EBF4FF' }}>
      <AppHeader title={user?.name ?? 'PVV'} subtitle="Pago QR" />
      <PagoQRForm
        puntoVentaId={punto.id}
        puntoNombre={punto.nombre}
        onCambiarPunto={() => router.push('/(app)/pvv-seleccionar-punto')}
      />
    </SafeAreaView>
  )
}
