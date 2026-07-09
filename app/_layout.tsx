import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import { PvvSessionProvider } from '../src/context/PvvSessionContext'

SplashScreen.preventAutoHideAsync()

function AppContent() {
  const { loading } = useAuth()

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync()
  }, [loading])

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PvvSessionProvider>
          <AppContent />
        </PvvSessionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
