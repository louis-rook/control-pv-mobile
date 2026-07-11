import React, { useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../src/context/AuthContext'
import AppHeader from '../../src/components/AppHeader'
import TabSwitcher from '../../src/components/TabSwitcher'
import PvnVentasTab from '../../src/screens/PvnVentasTab'
import PagoQRForm from '../../src/screens/PagoQRForm'
import TurnoCerradoAviso from '../../src/components/TurnoCerradoAviso'

export default function PvnHomeScreen() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'ventas' | 'qr'>('ventas')
  const [turnoAbierto, setTurnoAbierto] = useState(true)

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
        {tab === 'ventas' ? (
          <PvnVentasTab />
        ) : turnoAbierto ? (
          <PagoQRForm
            puntoVentaId={user?.punto_venta_id}
            puntoNombre={user?.punto_venta_nombre ?? 'Tu punto de venta asignado'}
            onTurnoCerrado={() => setTurnoAbierto(false)}
          />
        ) : (
          <TurnoCerradoAviso onIniciar={() => setTurnoAbierto(true)} />
        )}
      </View>
    </SafeAreaView>
  )
}
