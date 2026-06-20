import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { COLORS } from '../src/theme'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  if (!user) return <Redirect href="/login" />
  if (user.debe_cambiar_password) return <Redirect href="/cambiar-password" />
  if (user.rol === 'pvn') return <Redirect href="/(app)/pvn-registrar" />
  if (user.rol === 'pvv') return <Redirect href="/(app)/pvv-seleccionar-punto" />
  return <Redirect href="/login" />
}
