import React, { useState } from 'react'
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import FotoComprobante from './FotoComprobante'

type Props = {
  visible: boolean
  cerrando: boolean
  error: string
  onCancelar: () => void
  onConfirmar: (fotoUri: string, numeroRecogida: string) => void
}

export default function CierreDatafonoModal({ visible, cerrando, error, onCancelar, onConfirmar }: Props) {
  const [foto, setFoto] = useState<string | null>(null)
  const [numero, setNumero] = useState('')
  const [errorLocal, setErrorLocal] = useState('')

  function confirmar() {
    setErrorLocal('')
    if (!foto) { setErrorLocal('Adjunta la foto del cierre del datafono'); return }
    if (!/^\d+$/.test(numero.trim())) { setErrorLocal('Ingresa el número de recogida (solo dígitos)'); return }
    onConfirmar(foto, numero.trim())
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancelar}>
      <View style={styles.fondo}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Cierre de turno</Text>
          <Text style={styles.subtitulo}>
            Adjunta la foto del cierre del datafono y el número de recogida del cuadre de caja para poder cerrar.
          </Text>

          {(error || errorLocal) ? <Text style={styles.error}>{error || errorLocal}</Text> : null}

          <Text style={styles.label}>Foto del cierre del datafono</Text>
          <FotoComprobante uri={foto} onChange={setFoto} placeholderTexto="Sin foto del cierre de datafono" />

          <Text style={[styles.label, { marginTop: 16 }]}>Número de recogida</Text>
          <TextInput
            value={numero}
            onChangeText={t => setNumero(t.replace(/\D/g, ''))}
            keyboardType="numeric"
            placeholder="Ej: 123456"
            style={styles.input}
          />

          <View style={styles.botones}>
            <TouchableOpacity onPress={onCancelar} disabled={cerrando} style={[styles.btn, styles.btnCancelar]}>
              <Text style={styles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmar} disabled={cerrando} style={[styles.btn, styles.btnConfirmar, cerrando && { opacity: 0.6 }]}>
              <Text style={styles.btnConfirmarTexto}>{cerrando ? 'Cerrando...' : 'Confirmar cierre'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#f1f5f9', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 30 },
  titulo: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  subtitulo: { fontSize: 12, color: '#64748b', marginBottom: 14 },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  botones: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnCancelar: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  btnCancelarTexto: { color: '#334155', fontWeight: '700', fontSize: 14 },
  btnConfirmar: { backgroundColor: '#dc2626' },
  btnConfirmarTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
