# Pruebas de humo — RBAC System

## Prueba 1: Login como TUTOR

1. Ve a http://localhost:3000/login
2. Inicia sesión con una cuenta **tutor**
3. En el sidebar, verifica:
   - Dashboard (visible)
   - Persona cuidada (visible)
   - Agenda (visible)
   - Medicación (visible)
   - Cuidadores (visible — solo tutor)
   - Planes (visible — solo tutor)
   - Marketplace (visible — tutor y provider)
   - Legales (NO visible — solo `legal_admin`)

## Prueba 2: Login como CUIDADOR

1. Cierra sesión
2. Inicia sesión con una cuenta **caregiver**
3. En el sidebar, verifica:
   - Dashboard (visible)
   - Persona cuidada (visible)
   - Agenda (visible)
   - Medicación (visible)
   - Cuidadores (NO visible)
   - Legales (NO visible)
   - Marketplace (NO visible)
   - Planes (NO visible)

## Prueba 3: Acceso directo (CUIDADOR a /cuidadores)

1. Como cuidador, abre: http://localhost:3000/cuidadores
2. Debe ocurrir una de estas:
   - Redirect a `/403`, o
   - Página 403 (Acceso denegado)

## Prueba 4: Acceso directo (TUTOR a /cuidadores)

1. Como tutor, abre: http://localhost:3000/cuidadores
2. Debe mostrar la página de Cuidadores con normalidad

## Prueba 5: Login como LEGAL_ADMIN

1. Inicia sesión con cuenta **legal_admin**
2. Verifica:
   - Legales (visible en sidebar)
   - Cuidadores (NO visible)

## Si todo pasa

El sistema de permisos funciona correctamente.

## Si algo falla

Contacta a desarrollo con:

- Rol con el que probaste
- URL que intentaste
- Qué viste vs qué esperabas
