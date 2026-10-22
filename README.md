# AppSoul — App móvil de reserva (React Native)

App React Native para que el paciente elija centro, terapeuta, servicio, día y
horario, complete sus datos y confirme la reserva contra el backend NestJS/Prisma.

- **App**: `AppSoul/` (React Native 0.87.1, Hermes, React Navigation 7)
- **Backend**: `../backend-soul/` (NestJS en puerto `777`, prefijo global `/api`)
- **Base de datos**: PostgreSQL local, base `soul`

---

## Requisitos

| Herramienta | Versión / ruta |
| --- | --- |
| Node.js | 20+ |
| JDK | 21 — `/Applications/Android Studio.app/Contents/jbr/Contents/Home` |
| Android SDK | `$HOME/Library/Android/sdk` |
| NDK | 27.1 (`ndkVersion` en `android/build.gradle`) |
| Build-Tools | 36.0.0 |
| CocoaPods | 1.17.0 (`brew install cocoapods`) |
| Xcode | 26.2 + runtime de simulador iOS 26.x |

---

## 1. Backend

```sh
cd ../backend-soul
npx prisma migrate deploy   # aplica migraciones sobre la base `soul`
npm run start:dev           # http://localhost:777/api
```

Verificación rápida:

```sh
curl -s http://localhost:777/api/public/centers | head
```

---

## 2. Metro (dev server)

```sh
cd AppSoul
npm start          # http://localhost:8081
```

---

## 3. Android

### Configuración del backend

El emulador **no** alcanza `localhost` del host: se usa el loopback especial
`10.0.2.2`. Ya está resuelto en `src/config.ts`:

```ts
export const API_BASE_URL =
  process.env.UI_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:777/api' : 'http://localhost:777/api');
```

### Compilar el APK

En Apple Silicon el emulador es `arm64-v8a`. Compilar solo para la ABI del
emulador reduce tiempo y memoria:

```sh
cd android
export JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home'
export ANDROID_HOME="$HOME/Library/Android/sdk"

./gradlew assembleDebug --no-daemon \
  -PreactNativeArchitectures=arm64-v8a \
  -Dorg.gradle.jvmargs="-Xmx3g -XX:MaxMetaspaceSize=768m"
```

> Si el build se cuelga: baja la presión de memoria cerrando el emulador
> mientras compila, y limita la RAM de Gradle con `-Xmx3g`.

### Instalar y ejecutar

```sh
~/Library/Android/sdk/platform-tools/adb devices
~/Library/Android/sdk/platform-tools/adb install -r \
  app/build/outputs/apk/debug/app-debug.apk
~/Library/Android/sdk/platform-tools/adb shell am start -n com.appsoul/.MainActivity
```

### Cleartext HTTP

`android/app/src/main/AndroidManifest.xml` usa
`android:usesCleartextTraffic="${usesCleartextTraffic}"`. El placeholder lo
resuelve el plugin de React Native (`AgpConfiguratorUtils.kt`):

| Build | Valor | Efecto |
| --- | --- | --- |
| `debug` | `true` | permite `http://10.0.2.2:777` |
| `release` | `false` | **exige HTTPS** |

Para producción, sirve el backend por HTTPS y sustituye `API_BASE_URL` por la
URL pública (o define `UI_API_URL`).

---

## 4. iOS

```sh
cd ios
pod install
npm run ios
```

El simulador **sí** alcanza `localhost` del host, por eso usa
`http://localhost:777/api`.

> Requiere un runtime de simulador compatible con tu Xcode
> (`xcodebuild -downloadPlatform iOS`). Con Xcode 26.2 solo funcionan los
> runtimes 26.x; los 17.x que hubiera instalados no son elegibles.

---

## 5. Datos de demostración

Centro: **Centro Demo Norte** → terapeuta **Ana Ruiz** → servicio
**Terapia Familiar** (60 min, Presencial).

Los horarios se generan en la zona horaria del servidor (UTC-5, Colombia).
`SERVER_TIME_ZONE_OFFSET_MINUTES = -300` en `src/config.ts` se usa para
construir el `startTime` ISO que se envía al backend.

---

## 6. Verificación del flujo (validado en Android)

1. **Inicio** → lista de centros (`/public/centers`).
2. Centro → **Terapeutas** filtrados por el centro elegido.
3. Terapeuta → **Horarios disponibles** con selector de servicio, día y slots;
   cada slot muestra cuántos terapeutas lo tienen libre.
4. Slot → **Reservar sesión** con el resumen (servicio, duración, modalidad,
   fecha y hora en hora local).
5. Formulario (nombre, apellido, correo, teléfono opcional) →
   `POST /public/appointments`.
6. → **¡Reserva confirmada!** con los datos del paciente y opción de
   *Agregar a Google Calendar*.

Comprobación en base de datos:

```sh
psql -d soul -c "SELECT a.\"title\", a.\"startTime\", a.\"durationMinutes\", \
  a.\"isVirtual\", a.\"status\", p.\"firstName\", p.\"lastName\", p.\"email\" \
  FROM \"Appointment\" a LEFT JOIN \"Patient\" p ON p.id=a.\"patientId\" \
  ORDER BY a.\"createdAt\" DESC LIMIT 3;"
```

El `startTime` se guarda en UTC: un slot de **08:00** local (UTC-5) queda como
`13:00` UTC.

---

## 7. Problemas frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `INSTALL_FAILED_NO_MATCHING_ABIS` | APK compilado para otra ABI | compila con `-PreactNativeArchitectures=arm64-v8a` |
| `No space left on device` | disco lleno (SDK, Xcode DerivedData, cachés) | borra `system-images` sin AVD, `sdk/sources`, `~/.gradle/caches`, `~/Library/Caches/*` |
| Build de Gradle colgado | presión de memoria con el emulador abierto | cierra el emulador y limita `-Xmx3g` |
| `Unable to find a destination matching...` | el runtime de simulador no corresponde a tu Xcode | `xcodebuild -downloadPlatform iOS` |
| `Text strings must be rendered within a <Text> component` | texto suelto fuera de `<Text>` | envuelve el contenido en `<Text>` |
| La app no carga datos | Metro caído o backend apagado | `npm start` y `npm run start:dev` en `backend-soul` |

