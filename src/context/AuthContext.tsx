import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loginMobile } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { saveSession, loadSession, clearSession, type StoredUser } from '../storage/secureStore'

type AuthState = {
  user: StoredUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  markPasswordChanged: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<StoredUser | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    loadSession().then(session => {
      if (session) {
        setToken(session.token)
        setUser(session.user)
      }
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const { token: newToken, user: newUser } = await loginMobile(username, password)
      await saveSession(newToken, newUser)
      setToken(newToken)
      setUser(newUser)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await clearSession()
    setToken(null)
    setUser(null)
  }, [])

  // Si cualquier llamada a la API responde 401 (token vencido o invalidado),
  // se cierra la sesión automáticamente en vez de dejar al usuario viendo un
  // error genérico sin poder hacer nada.
  useEffect(() => {
    setUnauthorizedHandler(() => { logout() })
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const markPasswordChanged = useCallback(async () => {
    if (!token || !user) return
    const updated = { ...user, debe_cambiar_password: false }
    await saveSession(token, updated)
    setUser(updated)
  }, [token, user])

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, markPasswordChanged }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
