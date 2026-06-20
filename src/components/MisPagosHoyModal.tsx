import React, { useEffect, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { getMisPagosHoy, postCierreDia, type PagoQR } from '../api/qr'
import { COLORS } from '../theme'

function fmtMoneda(v: number) {
  return `$${Math.round(v).toLocaleString('es-CO')}`
}
function fmtHora(s: string) {
  return new Date(s).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function MisPagosHoyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { token } = useAuth()
  const [pagos, setPagos]     = useState<PagoQR[]>([])
  const [cargando, setCargando] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [cerrado, setCerrado] = useState(false)

  useEffect(() => {
    if (!visible || !token) return
    setCargando(true)
    setCerrado(false)
    getMisPagosHoy(token).then(setPagos).finally(() => setCargando(false))
  }, [visible, token])

  const total = pagos.reduce((s, p) => s + Number(p.valor), 0)

  async function confirmarCierre() {
    if (!token) return
    Alert.alert(
      'Cerrar día',
      `Confirmas el cierre de turno con ${pagos.length} pago(s) por un total de ${fmtMoneda(total)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setCerrando(true)
            try {
              await postCierreDia(token)
              setCerrado(true)
            } finally {
              setCerrando(false)
            }
          },
        },
      ]
    )
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Mis pagos de hoy</Text>
          <TouchableOpacity onPress={onClose} style={styles.cerrarBtn}>
            <Text style={styles.cerrarTexto}>×</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>
        ) : (
          <>
            <View style={styles.resumen}>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{pagos.length}</Text>
                <Text style={styles.resumenLabel}>Pagos</Text>
              </View>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{fmtMoneda(total)}</Text>
                <Text style={styles.resumenLabel}>Total</Text>
              </View>
            </View>

            <FlatList
              data={pagos}
              keyExtractor={p => String(p.id)}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              ListEmptyComponent={<Text style={styles.vacio}>Sin pagos registrados hoy</Text>}
              renderItem={({ item }) => (
                <View style={styles.fila}>
                  <Text style={styles.filaHora}>{fmtHora(item.created_at)}</Text>
                  <Text style={styles.filaValor}>{fmtMoneda(Number(item.valor))}</Text>
                </View>
              )}
            />

            <View style={styles.footer}>
              {cerrado ? (
                <View style={styles.cerradoBox}>
                  <Text style={styles.cerradoTexto}>✅ Día cerrado correctamente</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={confirmarCierre} disabled={cerrando || pagos.length === 0} style={[styles.cierreBtn, (cerrando || pagos.length === 0) && styles.cierreBtnDisabled]}>
                  <Text style={styles.cierreTexto}>{cerrando ? 'Cerrando...' : 'Cerrar día'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  titulo: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  cerrarBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cerrarTexto: { fontSize: 20, color: COLORS.text2, lineHeight: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resumen: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  resumenItem: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  resumenValor: { fontSize: 22, fontWeight: '800', color: COLORS.accent },
  resumenLabel: { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  vacio: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8 },
  filaHora: { fontSize: 13, color: COLORS.text2, fontWeight: '600' },
  filaValor: { fontSize: 15, fontWeight: '800', color: COLORS.accent2 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  cierreBtn: { backgroundColor: COLORS.danger, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  cierreBtnDisabled: { opacity: 0.5 },
  cierreTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cerradoBox: { backgroundColor: '#d1fae5', borderRadius: 10, padding: 15, alignItems: 'center' },
  cerradoTexto: { color: '#065f46', fontWeight: '700', fontSize: 14 },
})
