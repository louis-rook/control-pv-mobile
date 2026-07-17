import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'

type Props = {
  uri: string | null
  onChange: (uri: string | null) => void
  placeholderTexto?: string
}

async function comprimir(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  )
  return result.uri
}

export default function FotoComprobante({ uri, onChange, placeholderTexto = 'Sin foto del comprobante' }: Props) {
  async function tomarFoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar la foto del comprobante.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false })
    if (!result.canceled && result.assets[0]) {
      const comprimida = await comprimir(result.assets[0].uri)
      onChange(comprimida)
    }
  }

  async function elegirDeGaleria() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para adjuntar la foto.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ['images'] })
    if (!result.canceled && result.assets[0]) {
      const comprimida = await comprimir(result.assets[0].uri)
      onChange(comprimida)
    }
  }

  return (
    <View style={styles.container}>
      {uri ? (
        <View>
          <Image source={{ uri }} style={styles.preview} />
          <TouchableOpacity onPress={() => onChange(null)} style={styles.quitar}>
            <Text style={styles.quitarTexto}>Quitar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTexto}>{placeholderTexto}</Text>
        </View>
      )}
      <View style={styles.botones}>
        <TouchableOpacity onPress={tomarFoto} style={[styles.btn, styles.btnPrimario]}>
          <Text style={styles.btnPrimarioTexto}>📷 Tomar foto</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={elegirDeGaleria} style={[styles.btn, styles.btnSecundario]}>
          <Text style={styles.btnSecundarioTexto}>Galería</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  preview: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#f1f5f9' },
  placeholder: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  placeholderTexto: { color: '#94a3b8', fontSize: 13 },
  quitar: { marginTop: 8, alignSelf: 'flex-start' },
  quitarTexto: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  botones: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnPrimario: { backgroundColor: '#0047BA' },
  btnPrimarioTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnSecundario: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  btnSecundarioTexto: { color: '#475569', fontWeight: '600', fontSize: 14 },
})
