# AppSoul — App móvil de reserva (React Native)

App React Native para que el paciente elija centro, terapeuta, servicio, día y
horario, complete sus datos y confirme la reserva contra el backend NestJS/Prisma.

- **App**: `mobileapp-soul/` (React Native 0.87.1, Hermes, React Navigation 7)
- **Backend**: `../backend-soul/` (NestJS en puerto `777`, prefijo global `/api`)
- **Base de datos**: PostgreSQL local, base `soul`

---

## Requisitos

| Herramienta | Versión / ruta |
| --- | --- |
| Node.js | 22.11+ (`engines` en `package.json`) |
| JDK | 21 — `/Applications/Android Studio.app/Contents/jbr/Contents/Home` |
| Android SDK | `$HOME/Library/Android/sdk` |
| NDK | 27.1 (`ndkVersion` en `android/build.gradle`) |
| Build-Tools | 37.0.0 |
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
cd mobileapp-soul
npm start          # http://localhost:8081
```

### Scripts de calidad

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm test            # Jest (sin red: `fetch` está mockeado)
npm run test:ci     # Jest en modo CI con cobertura
npm run tokens:check # paridad de design tokens con frontend-soul
npm run validate    # ejecuta todo lo anterior en orden
```

`tokens:check` compara `src/styles/theme.ts` con
`../frontend-soul/src/app/globals.css`; si el repo web no está clonado al lado
avisa y termina con código 0.

El workflow `.github/workflows/ci.yml` ejecuta `typecheck`, `lint`, `test:ci`
(con la cobertura como artefacto) y la paridad de tokens en cada push y pull
request a `main`. El job de tokens clona `soul-frontend` para comparar contra el
CSS real.

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

### Firma de release

El build de release **no** se firma con `debug.keystore`. Define en
`~/.gradle/gradle.properties` (fuera del repositorio):

```properties
SOUL_UPLOAD_STORE_FILE=/ruta/a/soul-release.keystore
SOUL_UPLOAD_STORE_PASSWORD=...
SOUL_UPLOAD_KEY_ALIAS=...
SOUL_UPLOAD_KEY_PASSWORD=...
```

Sin esas propiedades el build de release falla de forma explícita, que es
preferible a generar un APK que Play Store rechazará.

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

## 5. Iconos y assets

Los iconos de Android (legacy + capas del icono adaptativo, con `monochrome` para
los iconos temáticos de Android 13) y los de iOS se generan con un script sin
dependencias a partir de una única definición vectorial:

```sh
npm run icons:generate
```

Escribe en `android/app/src/main/res/mipmap-*/` y en
`ios/AppSoul/Images.xcassets/AppIcon.appiconset/` (los PNG de iOS se generan en
RGB, sin canal alfa, porque la App Store rechaza iconos con transparencia).
Si cambia el diseño oficial, reemplaza los PNG o ajusta la geometría en
`scripts/generate-icons.mjs`.

Nombre visible: **Soul** (`strings.xml`, `CFBundleDisplayName` y
`app.json → displayName`). El identificador interno del bundle sigue siendo
`AppSoul`.

---

## 6. Datos de demostración

Centro: **Centro Demo Norte** → terapeuta **Ana Ruiz** → servicio
**Terapia Familiar** (60 min, Presencial).

Los horarios se calculan en el backend con la zona horaria **IANA de cada centro**
(`Center.timezone`, por defecto `America/Bogota`). El endpoint
`/public/availability/slots` devuelve, por cada slot, la hora de pared (`time`,
`HH:MM`) y el instante exacto en ISO 8601 UTC (`startTime`). La app envía ese
`startTime` tal cual al crear la cita, sin reconstruirlo en el cliente, y el
backend descarta los horarios que ya empezaron.

---

## 7. Verificación del flujo (validado en Android)

1. **Inicio** → lista de centros (`/public/centers`). Arriba a la derecha está
   el selector **ES/EN**.
2. Centro → **Terapeutas** filtrados por el centro elegido.
3. Terapeuta → **Horarios disponibles** con selector de servicio, día y slots;
   cada slot muestra cuántos terapeutas lo tienen libre. Las franjas **mixtas**
   del backend llegan aquí sin distinción: el paciente solo elige virtual o
   presencial.
4. Slot → **Reservar sesión** con el resumen (servicio, modalidad, fecha y hora
   en hora local).
5. Formulario (nombre, apellido, correo, teléfono opcional) →
   `POST /payments/create-preference`. **La app nunca llama a
   `/public/appointments`**: esa ruta crea la cita sin cobro y es justo lo que
   la web no permite.
6. Se abre el checkout de Mercado Pago en el navegador del sistema
   (`init_point`, con `sandbox_init_point` de respaldo).
7. → **Pago**: sondea `GET /payments/status/:id` cada 4 s hasta que el webhook
   confirma (`PAID`), falla (`FAILED`/`REFUNDED`/`VOIDED`) o el pago no existe.
8. → **¡Reserva confirmada!** con la cita que creó el backend, monto cobrado,
   *Agregar a Google Calendar* y *Compartir la cita*.

### Sin pasarela configurada (`directCreate`)

Si el backend no tiene Mercado Pago, `create-preference` responde
`directCreate: true` y **ya creó la cita**. La app no abre ningún checkout: va
directo a **Pago**, que consulta el estado y termina en la confirmación. Es el
modo que se usa en desarrollo local.

### Pago aprobado sin cita

Si Mercado Pago aprobó el cobro pero la cita quedó en revisión manual,
`status` llega con `status: "PAID"` y `appointment: null`. La app muestra
*"Pago recibido, cita en revisión"* en lugar de inventar una confirmación o un
error: no se pierde el dinero ni se miente al paciente.

### Idioma

El idioma del teléfono elige el de la app al arrancar (`Intl` y, si el runtime
no lo expone, `AppleLocale` / `I18nManager`). El selector ES/EN lo cambia en
caliente y `apiClient` manda `Accept-Language` en **todas** las peticiones, así
que los mensajes de error del backend llegan en el idioma de la pantalla.
Límite conocido: los mensajes de validación de los DTO del backend siguen en
español (ver `backend-soul/docs/agent-memory/open-work.md`, ítem 7).

Comprobación en base de datos:

```sh
psql -d soul -c "SELECT a.\"title\", a.\"startTime\", a.\"durationMinutes\", \
  a.\"isVirtual\", a.\"status\", p.\"firstName\", p.\"lastName\", p.\"email\" \
  FROM \"Appointment\" a LEFT JOIN \"Patient\" p ON p.id=a.\"patientId\" \
  ORDER BY a.\"createdAt\" DESC LIMIT 3;"

# El pago que originó la cita: debe estar PAID con su reparto.
psql -d soul -c "SELECT \"status\", \"amount\", \"therapistAmount\", \
  \"platformAmount\", \"createdAt\" FROM \"Payment\" \
  ORDER BY \"createdAt\" DESC LIMIT 3;"
```

Una reserva hecha desde la app tiene que dejar **las dos filas**: si hay cita sin
`Payment`, el flujo se saltó el cobro (revisa que la pantalla de reserva esté
llamando a `create-preference`).

El `startTime` se guarda en UTC: un slot de **08:00** local (UTC-5) queda como
`13:00` UTC.

---

## 8. Problemas frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `INSTALL_FAILED_NO_MATCHING_ABIS` | APK compilado para otra ABI | compila con `-PreactNativeArchitectures=arm64-v8a` |
| `No space left on device` | disco lleno (SDK, Xcode DerivedData, cachés) | borra `system-images` sin AVD, `sdk/sources`, `~/.gradle/caches`, `~/Library/Caches/*` |
| Build de Gradle colgado | presión de memoria con el emulador abierto | cierra el emulador y limita `-Xmx3g` |
| `Unable to find a destination matching...` | el runtime de simulador no corresponde a tu Xcode | `xcodebuild -downloadPlatform iOS` |
| `Text strings must be rendered within a <Text> component` | texto suelto fuera de `<Text>` | envuelve el contenido en `<Text>` |
| La app no carga datos | Metro caído o backend apagado | `npm start` y `npm run start:dev` en `backend-soul` |

