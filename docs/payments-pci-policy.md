# Politica de pagos y PCI-DSS — CARE

CARE delega el procesamiento de pagos en proveedores certificados (Mercado Pago
y, en iOS, Apple). **CARE no almacena, procesa ni transmite datos de tarjeta**
(CHD: numero de tarjeta / PAN, CVV, fecha de vencimiento, datos de banda).

Esto mantiene a CARE en el alcance mas acotado de PCI-DSS (**SAQ A**): el cliente
ingresa la tarjeta en el entorno seguro del proveedor, no en CARE.

## Como funciona hoy (cumple SAQ A)

1. El usuario elige un plan en `/planes`.
2. El servidor crea una preferencia de Checkout en Mercado Pago
   (`src/lib/payments/mercadopago.ts`, `createCheckoutPreference`).
3. CARE **redirige** al `init_point` hospedado por Mercado Pago. La tarjeta se
   ingresa en el dominio de MP.
4. MP notifica el resultado al webhook
   (`src/app/api/payments/mercadopago/webhook/route.ts`), que solo consulta el
   `status` del pago y guarda una referencia externa.
5. La base de datos (`subscriptions`) guarda `plan_id`, `status` y
   `payment_external_ref`. **Nunca** datos de tarjeta.

El `MERCADOPAGO_ACCESS_TOKEN` vive solo en el servidor (nunca `NEXT_PUBLIC_*`).

## Reglas obligatorias (no romper en futuro desarrollo)

1. **Prohibido** agregar inputs de numero de tarjeta, CVV o vencimiento en CARE.
2. **Prohibido** persistir PAN, CVV, banda o PIN en Postgres, logs, Sentry o
   analytics.
3. **Prohibido** enviar datos de tarjeta a server actions, API routes o webhooks
   propios.
4. **Permitido** solo: `payment_id`, `external_reference`, `status`,
   `payment_external_ref`, montos e IDs de plan.
5. Pagos web/Android: redirect o SDK oficial de Mercado Pago (Checkout Pro /
   Subscriptions). Nada de formularios de tarjeta propios.
6. Pagos en la app iOS: **solo Apple IAP** (sin Mercado Pago in-app en iOS).
7. No loguear el body completo de respuestas de la API de pagos (ver
   `createCheckoutPreference`: solo se loguea el `status`).
8. Cualquier cambio del flujo de pago requiere **re-evaluar el SAQ** antes de
   produccion.

## Controles ya implementados

- Webhook **fail-closed** en produccion: sin `MERCADOPAGO_WEBHOOK_SECRET`
  responde `503` en vez de aceptar pagos sin verificar (SEC-10 / PCI-01).
- Verificacion de firma `x-signature` (HMAC) cuando el secret esta configurado.
- Logs de pago sin body de la API (PCI-02).
- Token de MP solo server-side.

## Checklist de revision de codigo (pagos)

- [ ] El cambio no introduce captura de datos de tarjeta en CARE.
- [ ] No se persisten ni loguean datos de tarjeta.
- [ ] El token de MP sigue siendo server-side.
- [ ] El webhook mantiene el comportamiento fail-closed en produccion.
- [ ] En iOS, el cobro usa Apple IAP.

## Niveles de SAQ (referencia)

| Modelo | SAQ | CARE |
|--------|-----|------|
| Redirect a checkout hospedado (`init_point`) | SAQ A | **Modelo actual** |
| Formulario de tarjeta embebido en tu dominio (Bricks/Elements) | SAQ A-EP | Evitar sin assessor |
| Captura de tarjeta en tu servidor | SAQ D | Prohibido para CARE |
