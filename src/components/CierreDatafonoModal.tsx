import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Keyboard, BackHandler, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FotoComprobante from './FotoComprobante'

type Props = {
  visible: boolean
  cerrando: boolean
  error: string
  onCancelar: () => void
  onConfirmar: (fotoUri: string, numeroRecogida: string) => void
}

// No se usa el <Modal> nativo de RN a propósito: este componente se abre desde
// dentro de MisPagosHoyModal, que ya es un <Modal>. Un Modal anidado dentro de
// otro Modal abre su propia ventana de Android y no respeta adjustResize, así
// que el teclado tapa el contenido sin importar cuánto se calcule en JS. Como
// overlay normal dentro del árbol de pantalla, sí hereda el comportamiento de
// teclado del resto de la app (ver PagoQRForm.tsx).
export default function CierreDatafonoModal({ visible, cerrando, error, onCancelar, onConfirmar }: Props) {
  const [foto, setFoto] = useState<string | null>(null)
  const [numero, setNumero] = useState('')
  const [errorLocal, setErrorLocal] = useState('')
  const [kbHeight, setKbHeight] = useState(0)
  const scrollRef = useRef<ScrollView>(null)
  const { height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      setKbHeight(e.endCoordinates.height)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
    })
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0))
    return () => { show.remove(); hide.remove() }
  }, [])

  // Limpia el formulario cada vez que se vuelve a abrir, para no arrastrar
  // la foto/número de un cierre anterior (el componente nunca se desmonta).
  useEffect(() => {
    if (visible) { setFoto(null); setNumero(''); setErrorLocal('') }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancelar()
      return true
    })
    return () => sub.remove()
  }, [visible, onCancelar])

  if (!visible) return null

  function confirmar() {
    setErrorLocal('')
    if (!foto) { setErrorLocal('Adjunta la foto del cierre del datafono'); return }
    if (!/^\d+$/.test(numero.trim())) { setErrorLocal('Ingresa el número de recogida (solo dígitos)'); return }
    onConfirmar(foto, numero.trim())
  }

  return (
    <View style={styles.fondo}>
      <View
        style={[
          styles.card,
          {
            paddingBottom: insets.bottom + 16,
            marginBottom: kbHeight,
            maxHeight: (kbHeight > 0 ? screenHeight - kbHeight : screenHeight * 0.85) - insets.bottom - insets.top,
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 30 }}
        >
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
            onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)}
          />

          <View style={styles.botones}>
            <TouchableOpacity onPress={onCancelar} disabled={cerrando} style={[styles.btn, styles.btnCancelar]}>
              <Text style={styles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmar} disabled={cerrando} style={[styles.btn, styles.btnConfirmar, cerrando && { opacity: 0.6 }]}>
              <Text style={styles.btnConfirmarTexto}>{cerrando ? 'Cerrando...' : 'Confirmar cierre'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fondo: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    zIndex: 1000, elevation: 1000,
  },
  card: { backgroundColor: '#f1f5f9', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 20, paddingTop: 20 },
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
