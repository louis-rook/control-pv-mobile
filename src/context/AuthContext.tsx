import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loginMobile } from '../api/auth'
import { saveSession, loadSession, clearSession, type StoredUser } from '../storage/secureStore'

type AuthState = {
  user: StoredUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
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

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
