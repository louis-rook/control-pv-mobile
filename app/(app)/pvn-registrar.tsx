import React, { useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../src/context/AuthContext'
import AppHeader from '../../src/components/AppHeader'
import TabSwitcher from '../../src/components/TabSwitcher'
import PvnVentasTab from '../../src/screens/PvnVentasTab'
import TurnoQRTab from '../../src/screens/TurnoQRTab'

export default function PvnHomeScreen() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'ventas' | 'qr'>('ventas')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EBF4FF' }}>
      <AppHeader title={user?.name ?? 'PVN'} subtitle="Punto de Ventas Nacionales" />
      <TabSwitcher
        active={tab}
        onChange={k => setTab(k as 'ventas' | 'qr')}
        tabs={[
          { key: 'ventas', label: 'Registrar Ventas' },
          { key: 'qr', label: 'Pago QR' },
        ]}
      />
      <View style={{ flex: 1 }}>
        {tab === 'ventas' ? <PvnVentasTab /> : <TurnoQRTab />}
      </View>
    </SafeAreaView>
  )
}
