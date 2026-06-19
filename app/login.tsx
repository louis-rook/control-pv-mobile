import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'

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
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>PVN / PVV</Text>
        <Text style={styles.subtitle}>Inicia sesión con tu usuario</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          placeholder="Usuario"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          onSubmitEditing={onSubmit}
        />

        <TouchableOpacity onPress={onSubmit} disabled={submitting} style={[styles.btn, submitting && styles.btnDisabled]}>
          <Text style={styles.btnTexto}>{submitting ? 'Ingresando...' : 'Ingresar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoBox: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 80, height: 80 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 28 },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 14, color: '#0f172a' },
  btn: { backgroundColor: '#0047BA', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  btnDisabled: { opacity: 0.6 },
  btnTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
