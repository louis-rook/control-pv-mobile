import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/context/AuthContext'
import { PvvSessionProvider } from '../src/context/PvvSessionContext'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PvvSessionProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </PvvSessionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
