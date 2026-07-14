import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '../src/context/AuthContext'

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
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
