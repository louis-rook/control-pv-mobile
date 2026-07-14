import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { PuntoVenta } from '../api/pvn'

type Props = {
  esRotatoria: boolean
  puntos: PuntoVenta[]
  puntoSel: number | null
  onSeleccionar: (id: number) => void
  onIniciar: () => void
  abriendo: boolean
  error: string
}

export default function AbrirTurnoAviso({ esRotatoria, puntos, puntoSel, onSeleccionar, onIniciar, abriendo, error }: Props) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>🏪</Text>
      <Text style={styles.titulo}>Abrir turno</Text>
      <Text style={styles.subtitulo}>
        {esRotatoria ? 'Selecciona el punto donde vas a trabajar hoy' : 'Confirma el inicio de tu turno para comenzar a registrar pagos'}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {esRotatoria && (
        <View style={styles.lista}>
          {puntos.map(p => (
            <TouchableOpacity
              key={p.id}
              onPress={() => onSeleccionar(p.id)}
              style={[styles.item, puntoSel === p.id && styles.itemActivo]}
            >
              <Text style={[styles.itemTexto, puntoSel === p.id && styles.itemTextoActivo]}>{p.nombre}</Text>
            </TouchableOpacity>
          ))}
          {puntos.length === 0 && <Text style={styles.vacio}>No hay puntos configurados</Text>}
        </View>
      )}

      <TouchableOpacity onPress={onIniciar} disabled={abriendo} style={[styles.btn, abriendo && styles.btnDisabled]}>
        <Text style={styles.btnTexto}>{abriendo ? 'Abriendo turno...' : '▶ Iniciar turno'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 40, marginBottom: 10 },
  titulo: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitulo: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', fontSize: 13, padding: 10, borderRadius: 8, marginBottom: 14, width: '100%', textAlign: 'center' },
  lista: { width: '100%', marginBottom: 20 },
  item: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  itemActivo: { borderColor: '#0047BA', backgroundColor: '#eff6ff' },
  itemTexto: { fontSize: 14, fontWeight: '600', color: '#334155' },
  itemTextoActivo: { color: '#0047BA', fontWeight: '800' },
  vacio: { textAlign: 'center', color: '#94a3b8' },
  btn: { backgroundColor: '#0047BA', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
