# Auditoría de la app móvil Control PV — 22/10/2026

Complemento de la auditoría del backend (`inventory-app/docs/`). La app es Expo SDK 54 /
React Native 0.81 con expo-router; habla solo con la API del backend
(`EXPO_PUBLIC_API_URL`, en `eas.json`: `https://inventario-app-blue.vercel.app`, el mismo
proyecto de Vercel que `operaciones.klarens.com.co`, ya con Next 15.5.28).

## Alcance

Revisados completos los 37 archivos de código (`app/`, `src/`), `app.json`, `eas.json`,
`package.json` y `.gitignore`. Sin acceso a dispositivos físicos ni al panel de Expo más allá
de lanzar el build.

## Controles que ya estaban bien

- Token guardado en **SecureStore** (almacén cifrado del sistema), no en AsyncStorage; se borra al salir.
- Cualquier **401 cierra la sesión** (`src/api/client.ts`): encaja con la revocación inmediata
  del backend (AUD-01) y con el cambio de contraseña pendiente (AUD-02).
- Comunicación solo por **HTTPS**; las fotos se comprimen a JPEG antes de subirlas.
- Permisos mínimos: cámara y galería; `RECORD_AUDIO` bloqueado explícitamente.
- `.env.local`, llaves y certificados (`*.jks`, `*.p12`, `*.key`) en `.gitignore`; sin secretos en el repositorio.
- Las fotos se piden al proxy con el token en el encabezado; desde AUD-27 el backend solo
  entrega las fotos del propio usuario.

## Hallazgos y correcciones

| ID | Severidad | Hallazgo | Estado |
|---|---|---|---|
| MOV-01 | **Alto** (dinero) | El monto se leía con `parseFloat(texto.replace(/[^\d.]/g, ''))`: **"25.000" se guardaba como $25**. En la copia de producción hay 7 de 6 609 pagos por debajo de $1 000 ($167 a $349; mediana $12 450): revisarlos contra la foto. El mismo error estaba en la web | Corregido: `src/utils/valor.ts` (`parseValorPesos`) lee punto y coma como miles; el formulario muestra «Se registrará: $25.000» antes de guardar. Web corregida igual (`lib/validacion.ts`) |
| MOV-02 | Medio | Cambio de contraseña con mínimo 6; el backend exige 8 desde AUD-18 | Corregido: mínimo 8 en la app |
| MOV-03 | Medio | Errores al cerrar el día (PVN), editar o eliminar un pago, o cargar pagos y turnos no se mostraban: la acción fallaba en silencio | Corregido: mensaje con el motivo |
| MOV-04 | Bajo | Si el catálogo de productos PVN no cargaba, la lista quedaba vacía sin explicación | Corregido |
| MOV-05 | Bajo | `allowBackup` por defecto en Android: los datos de la app podían ir a copias de seguridad del teléfono | Corregido: `android.allowBackup: false` |
| MOV-06 | Informativo | `npm audit`: 43 avisos (1 crítico, `shell-quote`), todos en herramientas de compilación y desarrollo (Expo CLI, Metro, React DevTools), no en el código que va dentro del APK | Aceptado; se resuelve al actualizar el SDK de Expo |
| MOV-07 | Informativo | `expo` y `expo-constants` un parche atrás del SDK 54; `npx expo install --fix` choca con dependencias «peer» de React en local (EAS usa `legacy-peer-deps`) | Pendiente, menor |
| MOV-08 | Medio (operativo) | Verificación de desarrolladores de Android: ver abajo | Pendiente de registro |

Versión de la app: **1.1.0** (paquete `com.lacteosdelcesar.controlpv`).

## Verificación de desarrolladores de Android (instalar el APK fuera de Play)

Según la página oficial de Google (https://developer.android.com/developer-verification), al 22/10/2026:

- **30/09/2026:** empezó la exigencia en Brasil, Indonesia, Singapur y Tailandia, en dispositivos certificados con Android 7 o superior.
- **2027:** se extiende a todos los países, **incluida Colombia**; Google no ha dado una fecha exacta.
- Hoy, en Colombia, el APK se sigue instalando como siempre.
- Cuando llegue, los APK de desarrolladores **no verificados** solo se podrán instalar con un «flujo avanzado» pensado para usuarios expertos (con pasos y esperas adicionales), no apto para el personal de los puntos de venta.

**Decisión (22/10/2026): cuenta de distribución limitada.** La empresa creó la cuenta de
Android Developer Console con *distribución limitada*: máximo **20 dispositivos** y solo se
pueden registrar paquetes que **nunca** hayan existido en Android. Por eso la app cambió de
paquete:

| | Antes | Desde la versión 1.1.0 |
|---|---|---|
| Paquete Android | `com.klarenssorganization.controlpvmobile` | `com.lacteosdelcesar.controlpv` |
| Llave de firma (EAS) | «Ob9jjjcl5U», SHA-256 `53:96:51:0C:…:BA:DE:C6` | Llave nueva generada por EAS, SHA-256 `0A:D1:E3:49:5D:F5:7A:62:24:0D:98:F7:E3:CF:E2:C2:FF:09:38:D4:A8:AA:17:38:A1:24:FA:86:71:7D:C4:A5` (verificada en el APK) |

Consecuencias:
- Android la trata como **otra app**: en cada teléfono hay que **desinstalar** «Control PV» anterior e
  instalar la nueva; cada persona vuelve a iniciar sesión. Los datos viven en el servidor: no se pierde nada.
- No se pueden pasar de 20 teléfonos con esta cuenta. Si se necesitan más, hay que pasar a la cuenta
  completa de organización (que además permitiría registrar el paquete viejo).
- Registro: Android Developer Console → *Nombres de paquetes* → `com.lacteosdelcesar.controlpv`,
  nombre descriptivo «Control PV», y la huella SHA-256 del certificado del APK nuevo.

## Pruebas

- `npx tsc --noEmit`: 0 errores.
- `parseValorPesos` probado con «25000», «25.000», «25,000», «$ 25.000», «1.250.000», «253.000», «12.500,50», «1500.5», vacío y texto: todos correctos.
- APK: build `preview` en EAS (ver el enlace del build). Pruebas en el teléfono pendientes: login, cambio de contraseña obligatorio, abrir turno, registrar un pago escribiendo «25.000» (debe mostrar y guardar $25.000), mis pagos de hoy con fotos, cerrar turno y foto de movimiento TIC.

## Actualización a Expo SDK 58 (23/10/2026, versión 1.2.0)

- Expo 54 → 58 (React Native 0.81 → 0.88, React 19.1 → 19.3) con `npx expo install expo@^58` y `npx expo install --fix`.
- Ajustes: el ref de `ScrollView` se tipa con `ComponentRef<typeof ScrollView>` (desde RN 0.82 es un componente función) en `CierreDatafonoModal` y `PagoQRForm`; la configuración del splash pasa de la raíz de `app.json` al plugin `expo-splash-screen`.
- Alertas de `npm audit --omit=dev`: 41 → 17 (las restantes son de herramientas de compilación, no van en el APK).
- Verificado: `npx tsc --noEmit` sin errores, `expo-doctor` 20/20, bundle Android con `expo export`, build `preview` en EAS (misma firma; versionCode sin cambiar, así que se puede reinstalar la 1.1.0 encima).
- Probado en teléfono el 23/10/2026: login, abrir turno, pago QR con cámara y con galería, cierre de datáfono, historial y cierre de turno.
