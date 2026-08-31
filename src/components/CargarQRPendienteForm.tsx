import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { postPagoQR } from '../api/qr'
import { ApiError } from '../api/client'
import type { Turno } from '../api/turno'
import FotoComprobante from './FotoComprobante'

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}

type Props = {
  turno: Turno
  numero: number     // cuál de la tanda va (1-based)
  total: number
  onRegistrado: () => void
  onCancelarTanda: () => void
}

export default function CargarQRPendienteForm({ turno, numero, total, onRegistrado, onCancelarTanda }: Props) {
  const { token } = useAuth()
  const [foto, setFoto] = useState<string | null>(null)
  const [valor, setValor] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function registrar() {
    if (!token) return
    setError('')
    if (!foto) { setError('Toma o adjunta la foto del comprobante'); return }
    const valorNum = parseFloat(valor.replace(/[^\d.]/g, ''))
    if (!valorNum || valorNum <= 0) { setError('Ingresa un valor válido'); return }

    setGuardando(true)
    try {
      await postPagoQR(token, { fotoUri: foto, valor: valorNum, puntoVentaId: turno.punto_venta_id, turnoId: turno.id })
      setFoto(null); setValor('')
      onRegistrado()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  function cancelarTanda() {
    Alert.alert(
      'Cancelar carga de pendientes',
      '¿Seguro que quieres cancelar? Los pagos que ya subiste quedan guardados, pero no vas a poder subir los que faltan de esta tanda.',
      [{ text: 'Seguir subiendo', style: 'cancel' }, { text: 'Cancelar', style: 'destructive', onPress: onCancelarTanda }],
    )
  }

  return (
    <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.aviso}>
        <Text style={styles.avisoTitulo}>Ventas QR pendientes del {fmtFecha(turno.fecha)}</Text>
        <Text style={styles.avisoContador}>Pago {numero} de {total}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.label}>Comprobante</Text>
        <FotoComprobante uri={foto} onChange={setFoto} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Valor de la transacción</Text>
        <TextInput
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          placeholder="Ej: 25000"
          style={styles.input}
        />
      </View>

      <TouchableOpacity onPress={registrar} disabled={guardando} style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}>
        <Text style={styles.guardarTexto}>{guardando ? 'Guardando...' : `Registrar pago ${numero} de ${total}`}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={cancelarTanda} style={styles.cancelarBtn}>
        <Text style={styles.cancelarTexto}>Cancelar carga de pendientes</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  aviso: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, marginBottom: 16 },
  avisoTitulo: { fontSize: 13, fontWeight: '800', color: '#92400e' },
  avisoContador: { fontSize: 12, color: '#b45309', marginTop: 2, fontWeight: '600' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 18, fontWeight: '700', color: '#0f172a' },
  guardarBtn: { backgroundColor: '#0047BA', borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  guardarBtnDisabled: { opacity: 0.6 },
  guardarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelarBtn: { paddingVertical: 16, alignItems: 'center' },
  cancelarTexto: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
})
