import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../src/context/AuthContext'
import AppHeader from '../../src/components/AppHeader'
import MovimientoFotoScreen from '../../src/screens/MovimientoFotoScreen'

export default function MovimientoFotoRoute() {
  const { user } = useAuth()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EBF4FF' }}>
      <AppHeader title={user?.name ?? 'Sistemas'} subtitle="Movimientos TIC" />
      <MovimientoFotoScreen />
    </SafeAreaView>
  )
}
