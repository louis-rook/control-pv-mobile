import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { Turno } from '../api/turno'

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

type Props = { turno: Turno; onCerrar: () => void; cerrando: boolean; error?: string }

export default function TurnoPendienteAviso({ turno, onCerrar, cerrando, error }: Props) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.titulo}>Turno pendiente</Text>
      <Text style={styles.subtitulo}>Tienes un turno sin cerrar del</Text>
      <Text style={styles.fecha}>{fmtFecha(turno.fecha)}</Text>
      <Text style={styles.punto}>Punto: <Text style={styles.puntoBold}>{turno.punto_venta_nombre}</Text></Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity onPress={onCerrar} disabled={cerrando} style={[styles.btn, cerrando && styles.btnDisabled]}>
        <Text style={styles.btnTexto}>{cerrando ? 'Cerrando...' : '⏹ Cerrar turno pendiente'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emoji: { fontSize: 40, marginBottom: 10 },
  titulo: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitulo: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  fecha: { fontSize: 15, fontWeight: '700', color: '#dc2626', marginBottom: 6 },
  punto: { fontSize: 13, color: '#64748b', marginBottom: 24 },
  puntoBold: { fontWeight: '700', color: '#334155' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 12, width: '100%', textAlign: 'center' },
  btn: { backgroundColor: '#dc2626', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
