import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../src/context/AuthContext'
import AppHeader from '../../src/components/AppHeader'
import TurnoQRTab from '../../src/screens/TurnoQRTab'

export default function PvvPagoQRScreen() {
  const { user } = useAuth()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EBF4FF' }}>
      <AppHeader title={user?.name ?? 'PVV'} subtitle="Pago QR" />
      <TurnoQRTab />
    </SafeAreaView>
  )
}
