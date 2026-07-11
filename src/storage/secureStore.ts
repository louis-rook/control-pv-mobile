import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'pvn_pvv_token'
const USER_KEY  = 'pvn_pvv_user'

export type StoredUser = {
  id: string
  name: string
  rol: 'pvn' | 'pvv'
  area: string
  punto_venta_id: number | null
  punto_venta_nombre: string | null
  debe_cambiar_password: boolean
}

export async function saveSession(token: string, user: StoredUser) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
}

export async function loadSession(): Promise<{ token: string; user: StoredUser } | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  const userRaw = await SecureStore.getItemAsync(USER_KEY)
  if (!token || !userRaw) return null
  try {
    return { token, user: JSON.parse(userRaw) as StoredUser }
  } catch {
    return null
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(USER_KEY)
}
