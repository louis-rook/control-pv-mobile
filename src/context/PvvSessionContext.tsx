import React, { createContext, useContext, useState } from 'react'
import type { PuntoVenta } from '../api/pvn'

// Punto de venta seleccionado por una cajera PVV — vive solo en memoria.
// Si la app se cierra, se vuelve a pedir el punto al reabrir (decisión
// intencional: evita atribuir pagos a un punto desactualizado).
type PvvSessionState = {
  punto: PuntoVenta | null
  setPunto: (p: PuntoVenta | null) => void
}

const PvvSessionContext = createContext<PvvSessionState | null>(null)

export function PvvSessionProvider({ children }: { children: React.ReactNode }) {
  const [punto, setPunto] = useState<PuntoVenta | null>(null)
  return (
    <PvvSessionContext.Provider value={{ punto, setPunto }}>
      {children}
    </PvvSessionContext.Provider>
  )
}

export function usePvvSession() {
  const ctx = useContext(PvvSessionContext)
  if (!ctx) throw new Error('usePvvSession debe usarse dentro de PvvSessionProvider')
  return ctx
}
