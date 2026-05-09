# CARE - Backlog inicial (8 semanas)

Plan de ejecucion para pasar de base tecnica a MVP usable.

## Semana 1 - Base tecnica y calidad

- Cerrar setup de entornos (`.env`, secretos, CI).
- Definir esquema SQL inicial en Supabase.
- Establecer convenciones de componentes y rutas.
- Criterio de salida: proyecto compila, build/lint en verde, docs minimas listas.

## Semana 2 - Auth y onboarding

- Flujo login/registro funcional con Supabase Auth.
- Onboarding por tipo de cuenta (admin, tutor, cuidador, persona cuidada).
- Guards por sesion/rol.
- Criterio de salida: usuario nuevo entra a dashboard correcto segun rol.

## Semana 3 - Dashboard admin + vista simple

- Dashboard con KPIs y alertas.
- Vista simple con tipografia grande, alto contraste y CTA fijos.
- Navegacion responsive validada.
- Criterio de salida: experiencia dual admin/simple estable en mobile y desktop.

## Semana 4 - Agenda, medicacion y turnos

- CRUD agenda y turnos.
- Plan de medicacion y estado de toma.
- Estados visuales pendientes/confirmados/urgentes.
- Criterio de salida: flujo diario de cuidado usable de punta a punta.

## Semana 5 - Estudios y documentos

- Carga y consulta de estudios/documentacion medica.
- Metadatos basicos y trazabilidad.
- Permisos por rol sobre documentos.
- Criterio de salida: historial documental navegable y seguro.

## Semana 6 - Cuidadores y recomendacion CARE v1

- Alta de cuidadores con referencias.
- Busqueda con filtros (zona, especialidad, disponibilidad).
- Ranking de recomendacion basado en reglas.
- Criterio de salida: se pueden descubrir y comparar cuidadores.

## Semana 7 - Servicios y marketplace base

- Catalogo de servicios (separado de marketplace).
- Marketplace con tabs: venta/alquiler/intercambio/donacion.
- Moderacion minima de publicaciones.
- Criterio de salida: publicar y consultar items/servicios funciona.

## Semana 8 - Cierre MVP, seguridad y salida

- Hardening RLS, auditoria y logs de acciones criticas.
- Ajustes de accesibilidad y performance mobile.
- Checklist de release y runbook de incidentes.
- Criterio de salida: MVP listo para pilotos reales.
