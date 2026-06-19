import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { logout } = useAuth()

  function confirmarSalir() {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity onPress={confirmarSalir} style={styles.logout}>
        <Text style={styles.logoutTexto}>Salir</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logout: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fee2e2' },
  logoutTexto: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
})
