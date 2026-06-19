import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'

export default function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0047BA" />
      </View>
    )
  }

  if (!user) return <Redirect href="/login" />

  return <Stack screenOptions={{ headerShown: false }} />
}
