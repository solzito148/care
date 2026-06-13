# Ofuscacion y minificacion del shell mobile (iOS / Android) — CARE

> Complementa a `docs/mobile-security.md`. Aca esta el paso a paso concreto de
> ofuscacion/minificacion para cuando exista el proyecto Capacitor.

## 0. Contexto importante (leer antes de configurar)

Hoy **no existe** el proyecto nativo (`android/` / `ios/`). CARE es una app
Next.js. El plan de Store Readiness usa **Capacitor cargando la URL remota** de
produccion.

Consecuencia clave para la ofuscacion:

- El **codigo de negocio (React/Next) NO viaja dentro del IPA/APK**: vive en el
  servidor. La logica sensible (auth, validacion, RLS) ya esta protegida
  server-side.
- Por lo tanto, ProGuard/R8 y la optimizacion de Swift **solo ofuscan el shell
  nativo de Capacitor** (clases Java/Kotlin/Swift del contenedor), no tu logica
  de React.
- La ofuscacion es un control **secundario** (defensa en profundidad), no el
  principal. No reemplaza RLS ni la validacion del servidor.

Aun asi conviene activarla: reduce el tamano del binario, elimina simbolos y
dificulta el analisis del contenedor.

---

## 1. Generar el proyecto Capacitor (prerequisito)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init CARE com.tudominio.care
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

En `capacitor.config.ts`, apuntar el WebView a la URL de produccion:

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tudominio.care",
  appName: "CARE",
  webDir: "public",
  server: {
    url: "https://tu-dominio.com",
    androidScheme: "https",
  },
};

export default config;
```

---

## 2. Android — R8 + ProGuard (minificacion + ofuscacion)

R8 es el ofuscador/minificador por defecto de Android. Se activa en el modulo
`android/app/build.gradle`.

### 2.1 Activar minify/shrink en release

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true          // R8: ofusca + elimina codigo muerto
            shrinkResources true        // elimina recursos no usados
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'),
                          'proguard-rules.pro'
        }
    }
}
```

### 2.2 Reglas `android/app/proguard-rules.pro`

R8 debe **conservar** las clases del puente de Capacitor y los plugins (si se
ofuscan, la app deja de funcionar), pero puede ofuscar el resto.

```proguard
# --- Capacitor core / bridge (NO ofuscar) ---
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin { *; }

# --- WebView JS interfaces (NO ofuscar lo expuesto a JS) ---
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# --- Plugins Capacitor de la comunidad (ajustar segun los que uses) ---
-keep class com.capacitorjs.plugins.** { *; }

# --- Mantener atributos utiles para crash reports / reflection ---
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# --- Quitar logs en release (defensa adicional) ---
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# --- Ofuscar el resto del shell por defecto (no hace falta declararlo:
#     R8 ofusca todo lo no "keep") ---
```

### 2.3 Hardening de release (ver `mobile-security.md`)

En `android/app/src/main/AndroidManifest.xml`, el build release debe quedar con
`android:debuggable="false"` (es el default en release) y sin
`WebView.setWebContentsDebuggingEnabled(true)`.

### 2.4 Build y verificacion

```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleRelease
```

Verificar ofuscacion: abrir el APK con `apkanalyzer` o Android Studio
(Build > Analyze APK) y confirmar que las clases del shell aparecen renombradas
(`a`, `b`, `c`...). Guardar `android/app/build/outputs/mapping/release/mapping.txt`
para des-ofuscar stacktraces.

---

## 3. iOS — optimizacion y stripping de simbolos

Swift no tiene un "ProGuard", pero el compilador optimiza y se pueden eliminar
los simbolos del binario para dificultar el reversing del shell nativo.

En Xcode (target de la app) > **Build Settings**, para la config **Release**:

| Setting | Valor recomendado |
|---------|-------------------|
| `SWIFT_OPTIMIZATION_LEVEL` | `-O` (Optimize for Speed) |
| `SWIFT_COMPILATION_MODE` | `wholemodule` |
| `GCC_OPTIMIZATION_LEVEL` | `s` (Fastest, Smallest) |
| `DEPLOYMENT_POSTPROCESSING` | `YES` |
| `STRIP_INSTALLED_PRODUCT` | `YES` |
| `STRIP_STYLE` | `all` (`All Symbols`) |
| `STRIP_SWIFT_SYMBOLS` | `YES` |
| `ENABLE_BITCODE` | `NO` (deprecado por Apple) |
| `DEBUG_INFORMATION_FORMAT` | `DWARF with dSYM File` (subir el dSYM a tu crash reporter) |

Equivalente en `ios/App/App.xcodeproj` (build settings de Release). Mantener el
`.dSYM` archivado para simbolizar crashes.

> Nota: estas opciones optimizan/strippean el **contenedor**. No ofuscan el JS de
> CARE porque ese JS no esta en el `.ipa` (se sirve por HTTPS desde el servidor).

---

## 4. Que NO hacer

- No intentar ofuscar el bundle JS de Next embebiendolo en la app "para
  esconderlo": rompe el modelo Capacitor+URL remota y no aporta seguridad real.
- No confiar en la ofuscacion como unico control: la proteccion central es
  server-side (RLS, auth, validacion Zod, webhook fail-closed).
- No subir a tiendas sin guardar los archivos de mapping (`mapping.txt` Android,
  `.dSYM` iOS): se necesitan para depurar crashes en produccion.
