import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { COLORS } from '../theme'

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
      <Image source={require('../../assets/klarens-logo.png')} style={styles.logo} resizeMode="contain" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity onPress={confirmarSalir} style={styles.logout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.logoutTexto}>Salir</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18 },
  logo: { width: 36, height: 36 },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.text2, marginTop: 1 },
  logout: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fee2e2' },
  logoutTexto: { color: COLORS.danger, fontWeight: '700', fontSize: 13 },
})
