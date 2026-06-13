# Hardening de seguridad movil (Capacitor) — CARE

Estado actual: CARE es **web** (Next.js en Vercel). Todavia no existe el proyecto
Capacitor (`ios/` / `android/`). Este documento es el runbook a aplicar cuando se
genere el shell nativo, segun el plan de Store Readiness.

Contexto clave: el shell Capacitor cargara la **URL remota de produccion**, asi
que el codigo de negocio (React/Next) no viaja dentro del IPA/APK. El riesgo
principal no es la ingenieria inversa del JavaScript, sino el **WebView, los
tokens y los deep links**. Por eso la ofuscacion de JS no es un control central.

## 1. Certificate pinning (SEC-03)

Evita ataques MITM en redes comprometidas fijando el certificado/clave publica
del dominio de produccion.

- Android: configurar `network_security_config.xml` con `<pin-set>` para el host
  de Vercel, o usar un plugin de SSL pinning de Capacitor.
- iOS: pinning via `URLSession`/`ATS` o plugin equivalente.
- Mantener un pin de respaldo (backup pin) para no romper la app al rotar el
  certificado.

## 2. WebView release hardening

- Android: `android:debuggable="false"` en el manifest de release; no habilitar
  `WebContentsDebuggingEnabled` en builds de produccion.
- iOS: deshabilitar la inspeccion del `WKWebView` en release.
- No guardar secretos en el dispositivo. Solo pueden viajar valores
  `NEXT_PUBLIC_*`; **nunca** `SUPABASE_SERVICE_ROLE_KEY` ni
  `MERCADOPAGO_ACCESS_TOKEN`.
- Sesion: mantener las cookies `httpOnly` que ya emite Supabase; evitar
  `localStorage` para tokens.
- Pantallas con datos medicos: evaluar `FLAG_SECURE` en Android para bloquear
  capturas y la vista en el selector de apps.

## 3. Deep links / Universal Links seguros

- Verificar dominio con App Links (Android, `assetlinks.json`) y Universal Links
  (iOS, `apple-app-site-association`) para impedir el secuestro del esquema.
- Validar siempre el `next`/destino de cualquier deep link contra una whitelist,
  igual que ya hace `src/app/auth/callback/route.ts` con el parametro `next`.

## 4. Pagos en movil

- iOS: usar **solo Apple IAP** (StoreKit). No mostrar Mercado Pago in-app en iOS.
- Android: redirect a Checkout de Mercado Pago (mismo modelo que la web).
- Ver `docs/payments-pci-policy.md` para las reglas PCI que no deben romperse.

## 5. Ofuscacion nativa (valor limitado)

- Android: R8/ProGuard ofusca el shell Java/Kotlin, no la web remota.
- iOS: stripping de simbolos del shell nativo.
- No depender de la ofuscacion como control de seguridad principal: la proteccion
  real vive en RLS, auth y validacion server-side.

## Checklist previo a publicar la app

- [ ] Certificate pinning activo en release (Android + iOS).
- [ ] WebView no debuggable en release.
- [ ] Sin secretos server-side embebidos en el binario.
- [ ] App Links / Universal Links verificados.
- [ ] Apple IAP en iOS; sin Mercado Pago in-app en iOS.
- [ ] `FLAG_SECURE` evaluado para pantallas con datos de salud.
