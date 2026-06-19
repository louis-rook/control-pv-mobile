import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { COLORS } from '../../src/theme'

export default function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  if (!user) return <Redirect href="/login" />

  return <Stack screenOptions={{ headerShown: false }} />
}
