import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { postPagoQR } from '../api/qr'
import { ApiError } from '../api/client'
import FotoComprobante from '../components/FotoComprobante'
import MisPagosHoyModal from '../components/MisPagosHoyModal'

type Props = {
  puntoVentaId?: number | null
  puntoNombre?: string | null
  onCambiarPunto?: () => void
}

export default function PagoQRForm({ puntoVentaId, puntoNombre, onCambiarPunto }: Props) {
  const { token } = useAuth()
  const [foto, setFoto]       = useState<string | null>(null)
  const [valor, setValor]     = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError]     = useState('')
  const [exito, setExito]     = useState('')
  const [mostrarHoy, setMostrarHoy] = useState(false)

  async function enviar() {
    if (!token) return
    setError(''); setExito('')

    if (!foto) { setError('Toma o adjunta la foto del comprobante'); return }
    const valorNum = parseFloat(valor.replace(/[^\d.]/g, ''))
    if (!valorNum || valorNum <= 0) { setError('Ingresa un valor válido'); return }

    setGuardando(true)
    try {
      await postPagoQR(token, { fotoUri: foto, valor: valorNum, puntoVentaId })
      setExito(`Pago de $${valorNum.toLocaleString('es-CO')} registrado correctamente`)
      setFoto(null)
      setValor('')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {puntoNombre && (
        <View style={styles.puntoBox}>
          <View>
            <Text style={styles.puntoLabel}>Punto de venta</Text>
            <Text style={styles.puntoNombre}>{puntoNombre}</Text>
          </View>
          {onCambiarPunto && (
            <TouchableOpacity onPress={onCambiarPunto} style={styles.cambiarBtn}>
              <Text style={styles.cambiarTexto}>Cambiar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity onPress={() => setMostrarHoy(true)} style={styles.verHoyBtn}>
        <Text style={styles.verHoyTexto}>📋 Mis pagos de hoy · Cerrar día</Text>
      </TouchableOpacity>

      <MisPagosHoyModal visible={mostrarHoy} onClose={() => setMostrarHoy(false)} />

      {exito ? <Text style={styles.exito}>{exito}</Text> : null}
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

      <TouchableOpacity onPress={enviar} disabled={guardando} style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}>
        <Text style={styles.guardarTexto}>{guardando ? 'Guardando...' : 'Registrar pago'}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 20 },
  puntoBox: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  puntoLabel: { fontSize: 11, color: '#3b82f6', fontWeight: '600' },
  puntoNombre: { fontSize: 15, fontWeight: '800', color: '#1d4ed8', marginTop: 2 },
  cambiarBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff' },
  cambiarTexto: { color: '#1d4ed8', fontWeight: '700', fontSize: 12 },
  verHoyBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  verHoyTexto: { color: '#0047BA', fontWeight: '700', fontSize: 13 },
  exito: { backgroundColor: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13, fontWeight: '600' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 18, fontWeight: '700', color: '#0f172a' },
  guardarBtn: { backgroundColor: '#0047BA', borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  guardarBtnDisabled: { opacity: 0.6 },
  guardarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
