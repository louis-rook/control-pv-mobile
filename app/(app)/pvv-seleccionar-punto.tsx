import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { usePvvSession } from '../../src/context/PvvSessionContext'
import { getPuntosVenta, type PuntoVenta } from '../../src/api/pvn'
import AppHeader from '../../src/components/AppHeader'

export default function SeleccionarPuntoScreen() {
  const { user, token } = useAuth()
  const { setPunto } = usePvvSession()
  const router = useRouter()
  const [puntos, setPuntos] = useState<PuntoVenta[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!token) return
    getPuntosVenta(token, 'principal').then(setPuntos).finally(() => setCargando(false))
  }, [token])

  function elegir(p: PuntoVenta) {
    setPunto(p)
    router.replace('/(app)/pvv-pago-qr')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EBF4FF' }}>
      <AppHeader title={user?.name ?? 'PVV'} subtitle="¿En qué punto estás hoy?" />
      {cargando ? (
        <View style={styles.center}><ActivityIndicator color="#0047BA" /></View>
      ) : (
        <FlatList
          data={puntos}
          keyExtractor={p => String(p.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => elegir(item)} style={styles.item}>
              <Text style={styles.itemTexto}>{item.nombre}</Text>
              <Text style={styles.itemFlecha}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.vacio}>No hay puntos configurados</Text>}
        />
      )}
      {/* DEBUG temporal — quitar después de diagnosticar */}
      <Text style={styles.debug} selectable>
        DEBUG {JSON.stringify(user)}
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  itemTexto: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  itemFlecha: { fontSize: 20, color: '#94a3b8' },
  vacio: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  debug: { fontSize: 10, color: '#ef4444', padding: 12, backgroundColor: '#fff', margin: 12, borderRadius: 8 },
})
