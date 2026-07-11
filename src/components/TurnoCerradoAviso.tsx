import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function TurnoCerradoAviso({ onIniciar }: { onIniciar: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.titulo}>Turno cerrado</Text>
      <Text style={styles.subtitulo}>Inicia un nuevo turno para seguir registrando pagos</Text>
      <TouchableOpacity onPress={onIniciar} style={styles.btn}>
        <Text style={styles.btnTexto}>▶ Iniciar turno</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emoji: { fontSize: 40, marginBottom: 10 },
  titulo: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitulo: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: '#0047BA', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  btnTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
