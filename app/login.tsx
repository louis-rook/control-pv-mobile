import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { COLORS } from '../src/theme'

export default function LoginScreen() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    if (user.rol === 'pvn') return <Redirect href="/(app)/pvn-registrar" />
    if (user.rol === 'pvv') return <Redirect href="/(app)/pvv-seleccionar-punto" />
  }

  async function onSubmit() {
    setError('')
    if (!username.trim() || !password) {
      setError('Usuario y contraseña requeridos')
      return
    }
    setSubmitting(true)
    try {
      await login(username.trim(), password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoCard}>
          <Image source={require('../assets/klarens-logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Control de Inventario</Text>
        <Text style={styles.subtitle}>Planta Valledupar · PVN / PVV</Text>

        <View style={styles.card}>
          {error ? <Text style={styles.error}>⚠️ {error}</Text> : null}

          <Text style={styles.label}>USUARIO</Text>
          <TextInput
            placeholder="Ej. juan.perez"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          <Text style={styles.label}>CONTRASEÑA</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            onSubmitEditing={onSubmit}
          />

          <TouchableOpacity onPress={onSubmit} disabled={submitting} style={[styles.btn, submitting && styles.btnDisabled]}>
            <Text style={styles.btnTexto}>{submitting ? 'Validando credenciales...' : 'Ingresar al Sistema'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.firma}>
          Desarrollado por el Área de Sistemas{'\n'}
          <Text style={styles.firmaBold}>Luis Alberto Torres</Text> — Asistente de Sistemas{'\n'}
          Lácteos del Cesar SAS · Klarens
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60, paddingBottom: 40 },
  logoCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: COLORS.accent, shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  logo: { width: '100%', height: 90 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.accent, textAlign: 'center', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: COLORS.text2, textAlign: 'center', marginTop: 4, marginBottom: 28, fontWeight: '600' },
  card: { backgroundColor: COLORS.bg2, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 22, shadowColor: COLORS.accent, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  error: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', color: COLORS.danger, fontSize: 13, fontWeight: '700', textAlign: 'center', borderRadius: 10, padding: 12, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text2, letterSpacing: 0.5, marginBottom: 8, marginTop: 14 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: COLORS.text, backgroundColor: '#fff' },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 22, shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  btnDisabled: { opacity: 0.6 },
  btnTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  firma: { fontSize: 10.5, color: '#94a3b8', textAlign: 'center', marginTop: 28, lineHeight: 17 },
  firmaBold: { color: '#64748b', fontWeight: '700' },
})
