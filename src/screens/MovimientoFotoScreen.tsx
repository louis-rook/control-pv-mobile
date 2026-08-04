import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { getMovimiento, postFotoMovimiento, type MovimientoDetalle } from '../api/movimientos'
import { ApiError } from '../api/client'
import { COLORS } from '../theme'
import FotoComprobante from '../components/FotoComprobante'

export default function MovimientoFotoScreen() {
  const { token } = useAuth()
  const [idInput, setIdInput] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [movimiento, setMovimiento] = useState<MovimientoDetalle | null>(null)
  const [foto, setFoto] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [exito, setExito] = useState(false)

  async function buscar() {
    if (!idInput.trim() || !token) return
    setError(null)
    setExito(false)
    setMovimiento(null)
    setFoto(null)
    setBuscando(true)
    try {
      const data = await getMovimiento(token, idInput)
      setMovimiento(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo buscar el movimiento')
    } finally {
      setBuscando(false)
    }
  }

  async function subir() {
    if (!movimiento || !foto || !token) return
    setSubiendo(true)
    setError(null)
    try {
      await postFotoMovimiento(token, movimiento.id, foto)
      setExito(true)
      setMovimiento(prev => prev ? { ...prev, foto_autorizacion_url: foto } : prev)
      Alert.alert('Listo', `Foto subida correctamente para ${movimiento.id}`)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo subir la foto')
    } finally {
      setSubiendo(false)
    }
  }

  function nuevaBusqueda() {
    setIdInput('')
    setMovimiento(null)
    setFoto(null)
    setError(null)
    setExito(false)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Foto de Autorización — Movimiento TIC</Text>
        <Text style={styles.subtitulo}>
          Escribe el consecutivo del movimiento (ej. TIC-0001) para subir la foto del formato ya firmado y autorizado.
        </Text>

        <View style={styles.buscador}>
          <TextInput
            value={idInput}
            onChangeText={setIdInput}
            placeholder="TIC-0001"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
            onSubmitEditing={buscar}
          />
          <TouchableOpacity onPress={buscar} disabled={buscando || !idInput.trim()} style={[styles.btnBuscar, (buscando || !idInput.trim()) && styles.btnDisabled]}>
            {buscando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnBuscarTexto}>Buscar</Text>}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBox}><Text style={styles.errorTexto}>{error}</Text></View>
        )}

        {movimiento && (
          <View style={styles.card}>
            <Text style={styles.cardId}>{movimiento.id}</Text>
            <Text style={styles.cardLinea}>{movimiento.tipo_movimiento} · {movimiento.motivo}</Text>
            <Text style={styles.cardLinea}>De: {movimiento.origen_nombre} ({movimiento.origen_area})</Text>
            <Text style={styles.cardLinea}>A: {movimiento.destino_nombre} ({movimiento.destino_area})</Text>
            <Text style={styles.cardLinea}>{movimiento.activos.length} equipo(s)</Text>

            {movimiento.foto_autorizacion_url && !foto && (
              <Text style={styles.avisoYaTiene}>Este movimiento ya tiene una foto subida. Puedes reemplazarla.</Text>
            )}

            <View style={{ marginTop: 14 }}>
              <FotoComprobante uri={foto} onChange={setFoto} placeholderTexto="Foto del formato firmado y autorizado" />
            </View>

            <TouchableOpacity onPress={subir} disabled={!foto || subiendo} style={[styles.btnSubir, (!foto || subiendo) && styles.btnDisabled]}>
              {subiendo ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubirTexto}>Subir foto</Text>}
            </TouchableOpacity>

            {exito && (
              <TouchableOpacity onPress={nuevaBusqueda} style={styles.btnOtro}>
                <Text style={styles.btnOtroTexto}>Buscar otro movimiento</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 4 },
  titulo: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  subtitulo: { fontSize: 13, color: COLORS.text2, marginTop: 4, marginBottom: 16, lineHeight: 18 },
  buscador: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: '600', backgroundColor: '#fff' },
  btnBuscar: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnBuscarTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginTop: 14 },
  errorTexto: { color: '#991b1b', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  cardId: { fontSize: 16, fontWeight: '800', color: COLORS.accent, marginBottom: 6 },
  cardLinea: { fontSize: 13, color: '#334155', marginBottom: 2 },
  avisoYaTiene: { fontSize: 12, color: '#b45309', marginTop: 10, fontWeight: '600' },
  btnSubir: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  btnSubirTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnOtro: { alignItems: 'center', marginTop: 12 },
  btnOtroTexto: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
})
