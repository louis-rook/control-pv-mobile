# PVN / PVV — App móvil

App Expo (React Native + TypeScript) para los roles `pvn` (Puntos de Venta Nacionales) y `pvv` (cajeras de los puntos principales) del sistema de inventario.

- **pvn**: registra ventas diarias por turno y sube comprobantes de pago QR (su punto de venta es fijo, asignado por el admin).
- **pvv**: selecciona su punto de venta al iniciar sesión (Sede Principal, Mayales, Éxito Flores, Natividad o Provincia) y sube comprobantes de pago QR.

Consume la misma API del backend Next.js (`inventory-app`) vía un JWT propio emitido por `POST /api/auth/mobile/login`.

## Requisitos previos en el backend

1. Migraciones SQL ejecutadas en Neon (tabla `pvn_pagos_qr`, columna `tipo` en `pvn_puntos_venta` + seed de los 5 puntos principales).
2. `BLOB_READ_WRITE_TOKEN` configurado en el backend (Vercel Blob).
3. Al menos un usuario con rol `pvn` (con punto de venta asignado) o `pvv` creado desde `/admin/usuarios`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
# Edita .env.local con la IP LAN de tu máquina (no localhost), ej:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

npx expo start
```

Escanea el QR con la app **Expo Go** en un celular conectado a la misma red Wi-Fi que el backend (`npm run dev` en `inventory-app`).

## Estructura

```
app/                      # rutas (expo-router)
  login.tsx
  (app)/
    pvn-registrar.tsx      # rol pvn: ventas + pago QR (pestañas)
    pvv-seleccionar-punto.tsx
    pvv-pago-qr.tsx
src/
  context/                 # AuthContext (sesión), PvvSessionContext (punto en memoria)
  api/                      # cliente fetch + wrappers por dominio
  components/               # FotoComprobante, AppHeader, TabSwitcher
  screens/                   # contenido de pantallas reutilizado entre pvn/pvv
  storage/                    # SecureStore (token + usuario)
```
