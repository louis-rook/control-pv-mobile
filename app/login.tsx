import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { COLORS } from '../src/theme'
import { homeRoute } from '../src/utils/homeRoute'
import { ApiError } from '../src/api/client'

export default function LoginScreen() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Administradores con verificación en dos pasos: el servidor pide el código y aparece el tercer campo
  const [pideCodigo, setPideCodigo] = useState(false)
  const [codigo, setCodigo] = useState('')

  if (user) {
    if (user.debe_cambiar_password) return <Redirect href="/cambiar-password" />
    return <Redirect href={homeRoute(user.rol) as never} />
  }

  async function onSubmit() {
    setError('')
    if (!username.trim() || !password) {
      setError('Usuario y contraseña requeridos')
      return
    }
    if (pideCodigo && !codigo.trim()) {
      setError('Ingresa el código de verificación')
      return
    }
    setSubmitting(true)
    try {
      await login(username.trim(), password, pideCodigo ? codigo.trim() : undefined)
    } catch (e) {
      if (e instanceof ApiError && e.datos?.requiere2fa) {
        // Contraseña correcta: falta (o no sirvió) el código. Si es la primera vez, no es un error.
        if (pideCodigo) setError(e.message)
        setPideCodigo(true)
        return
      }
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.logoCard}>
          <Image source={require('../assets/klarens-logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Gestión Operativa</Text>
        <Text style={styles.subtitle}>Control Puntos de Ventas</Text>

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

          {pideCodigo && (
            <>
              <Text style={styles.label}>CÓDIGO DE VERIFICACIÓN</Text>
              <TextInput
                placeholder="123456"
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus
                value={codigo}
                onChangeText={setCodigo}
                style={[styles.input, styles.inputCodigo]}
                onSubmitEditing={onSubmit}
              />
              <Text style={styles.ayuda}>Los 6 dígitos de tu app autenticadora. Sin el celular, usa un código de recuperación (XXXX-XXXX).</Text>
            </>
          )}

          <TouchableOpacity onPress={onSubmit} disabled={submitting} style={[styles.btn, submitting && styles.btnDisabled]}>
            <Text style={styles.btnTexto}>{submitting ? 'Validando credenciales...' : pideCodigo ? 'Verificar e ingresar' : 'Ingresar al Sistema'}</Text>
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
  inputCodigo: { fontSize: 20, letterSpacing: 4, textAlign: 'center' },
  ayuda: { fontSize: 12, color: COLORS.text2, marginTop: 6 },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 22, shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  btnDisabled: { opacity: 0.6 },
  btnTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  firma: { fontSize: 10.5, color: '#94a3b8', textAlign: 'center', marginTop: 28, lineHeight: 17 },
  firmaBold: { color: '#64748b', fontWeight: '700' },
})
