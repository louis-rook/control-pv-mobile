import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { cambiarPassword } from '../src/api/auth'
import { ApiError } from '../src/api/client'
import { COLORS } from '../src/theme'

export default function CambiarPasswordScreen() {
  const { user, token, markPasswordChanged } = useAuth()
  const router = useRouter()
  const [nueva, setNueva]         = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError]         = useState('')
  const [guardando, setGuardando] = useState(false)

  if (!user || !token) return <Redirect href="/login" />
  if (!user.debe_cambiar_password) {
    return <Redirect href={user.rol === 'pvn' ? '/(app)/pvn-registrar' : '/(app)/pvv-seleccionar-punto'} />
  }

  async function onSubmit() {
    setError('')
    if (nueva.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (nueva !== confirmar) { setError('Las contraseñas no coinciden'); return }

    setGuardando(true)
    try {
      await cambiarPassword(token!, nueva)
      await markPasswordChanged()
      router.replace(user!.rol === 'pvn' ? '/(app)/pvn-registrar' : '/(app)/pvv-seleccionar-punto')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cambiar la contraseña')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.icono}>🔒</Text>
        <Text style={styles.title}>Cambia tu contraseña</Text>
        <Text style={styles.subtitle}>Por seguridad, debes establecer una contraseña propia antes de continuar.</Text>

        <View style={styles.card}>
          {error ? <Text style={styles.error}>⚠️ {error}</Text> : null}

          <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
          <TextInput
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={nueva}
            onChangeText={setNueva}
            style={styles.input}
          />

          <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
          <TextInput
            placeholder="Repite la contraseña"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={confirmar}
            onChangeText={setConfirmar}
            style={styles.input}
            onSubmitEditing={onSubmit}
          />

          <TouchableOpacity onPress={onSubmit} disabled={guardando} style={[styles.btn, guardando && styles.btnDisabled]}>
            <Text style={styles.btnTexto}>{guardando ? 'Guardando...' : 'Guardar y continuar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  icono: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.accent, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.text2, textAlign: 'center', marginTop: 6, marginBottom: 28, lineHeight: 19 },
  card: { backgroundColor: COLORS.bg2, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 22 },
  error: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', color: COLORS.danger, fontSize: 13, fontWeight: '700', textAlign: 'center', borderRadius: 10, padding: 12, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text2, letterSpacing: 0.5, marginBottom: 8, marginTop: 14 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: COLORS.text, backgroundColor: '#fff' },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 22 },
  btnDisabled: { opacity: 0.6 },
  btnTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
