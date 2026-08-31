import React, { useState } from 'react'
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'

type Props = {
  visible: boolean
  onCancelar: () => void
  onConfirmar: (cantidad: number) => void
}

export default function CantidadQRModal({ visible, onCancelar, onConfirmar }: Props) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')

  function confirmar() {
    const n = parseInt(texto, 10)
    if (!n || n <= 0) { setError('Ingresa un número válido (mínimo 1)'); return }
    setError('')
    onConfirmar(n)
    setTexto('')
  }

  function cancelar() {
    setTexto(''); setError(''); onCancelar()
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={cancelar}>
      <View style={styles.fondo}>
        <View style={styles.card}>
          <Text style={styles.titulo}>¿Cuántos pagos QR pendientes?</Text>
          <Text style={styles.subtitulo}>Indica cuántos pagos QR del turno anterior te faltan por subir. Solo vas a poder registrar esa cantidad — las ventas del turno nuevo se registran después, ya con el turno de hoy abierto.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            value={texto}
            onChangeText={setTexto}
            keyboardType="numeric"
            placeholder="Ej: 3"
            autoFocus
            style={styles.input}
          />
          <View style={styles.botones}>
            <TouchableOpacity onPress={cancelar} style={[styles.btn, styles.btnCancelar]}>
              <Text style={styles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmar} style={[styles.btn, styles.btnConfirmar]}>
              <Text style={styles.btnConfirmarTexto}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 22, width: '100%', maxWidth: 380 },
  titulo: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitulo: { fontSize: 13, color: '#64748b', lineHeight: 19, marginBottom: 16 },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 18, textAlign: 'center' },
  botones: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  btnCancelar: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  btnCancelarTexto: { color: '#475569', fontWeight: '700', fontSize: 14 },
  btnConfirmar: { backgroundColor: '#0047BA' },
  btnConfirmarTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
