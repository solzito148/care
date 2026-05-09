# CARE - Guia de Diseno y Funcionalidad

## 1) Vision de producto

CARE es una plataforma web/mobile para el cuidado de personas mayores con dos experiencias diferenciadas:

- Vista Administrador del Cuidado: gestion integral para tutores, familiares, cuidadores, profesionales, proveedores y equipo CARE.
- Vista Simple Persona Cuidada: experiencia minima, clara y segura para adultos mayores.

La interfaz debe ser moderna, confiable, sanitaria, humana, accesible y mobile-first.

---

## 2) Principios de diseno

- Claridad antes que densidad visual.
- Accion critica siempre visible.
- Jerarquia visual fuerte: titulo, contexto, accion.
- Pocos pasos por tarea.
- Consistencia total de componentes y estados.
- Lenguaje simple, directo y sin tecnicismos.
- Sin infantilizar la experiencia de personas mayores.
- Privacidad por defecto (mostrar solo lo necesario segun rol).

---

## 3) Paleta de colores (tokens base)

Usar Tailwind + tokens semanticos:

- Primario: azul confiable (`care-700` / `care-800`)
- Secundario: verde cuidado (`success-700`)
- Fondo: gris muy claro y blanco (`slate-50`, `white`)
- Informacion: azul claro (`info-100` / `info-700`)
- Advertencia leve: amarillo suave (`warning-100` / `warning-700`)
- Urgente / error: rojo controlado (`danger-100` / `danger-700`)
- Neutro: grises `slate-*`

Reglas:

- No usar paletas saturadas para fondos.
- Evitar rojo constante en pantalla.
- No usar tema oscuro como principal para vista simple.

---

## 4) Tipografia

Stack recomendado:

- `"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif`

Escalas:

- Admin texto base: 15-16px
- Vista simple texto base: 20-22px
- Botones vista simple: 22-26px
- Titulos vista simple: 28-34px

Reglas:

- Interlineado amplio.
- Peso semibold en acciones.
- Evitar bloques largos de texto.

---

## 5) Navegacion

### Desktop (Administrador)

- Sidebar izquierda (secciones principales).
- Header superior (usuario, persona cuidada activa, notificaciones, selector de vista).
- Contenido central por modulo.

### Mobile (Administrador)

- Bottom navigation con maximo 4-5 accesos.
- Menu secundario colapsable (hamburguesa/drawer).
- Filtros en panel colapsable.

### Vista Simple Persona Cuidada (mobile/tablet)

- Sin menu complejo.
- Home "Hoy" como entrada.
- Acciones fijas inferiores: Llamar tutor, Llamar cuidador, Emergencia.

---

## 6) Componentes principales (design system)

- AppShell
- Header (publico y privado)
- SidebarNav
- BottomNav
- Card
- Button (primary, secondary, ghost)
- Input + validacion
- CheckboxField
- Badge
- StatusBadge
- FormMessage

Reglas:

- Un solo estilo por tipo de componente.
- Variantes controladas por props/tokens.
- No crear estilos ad-hoc por pantalla.

---

## 7) Cards

Estructura recomendada:

- Titulo claro
- Dato principal (metric/estado)
- Contexto corto
- Accion principal

Reglas:

- Bordes suaves (`rounded-2xl`)
- Sombra ligera (`shadow-soft`)
- Espaciado interno amplio (16-24px)

---

## 8) Botones

- Altura minima: 44px (global)
- Vista simple: 56px+ y texto grande
- Jerarquia:
  - Primary: accion principal
  - Secondary: accion alternativa
  - Ghost: accion de baja prioridad

Reglas:

- Maximo 1 CTA primario por bloque.
- Estados `hover`, `focus-visible`, `disabled` obligatorios.

---

## 9) Formularios

Patron:

- Formularios largos siempre multi-step.
- Una columna en mobile.
- Errores cerca del campo.
- Confirmacion al guardar.

Reglas:

- Etiquetas siempre visibles.
- Placeholder no reemplaza label.
- Ayudas de formato cuando aplique.

---

## 10) Badges y estados visuales

Estados canonicos:

- Pendiente
- Confirmado
- Urgente
- Vencido
- Datos actualizados
- Recomendado CARE
- Referencias verificadas
- Destacado
- Gratuito
- Publicacion activa

Mapeo recomendado:

- Pendiente -> warning
- Confirmado / actualizado / recomendado -> success/info
- Urgente / vencido -> danger
- Neutral operativo -> slate

---

## 11) Alertas

Tipos:

- Informativa
- Advertencia
- Critica

Reglas:

- Mensaje corto + accion concreta.
- Alertas criticas arriba de contenido.
- No saturar con multiples criticas simultaneas.

---

## 12) Diseno de Dashboard (Administrador)

Bloques base:

- KPI cards (resumen operativo)
- Alertas importantes
- Acciones rapidas
- Proximos eventos

Reglas:

- Priorizar tareas de hoy.
- Mostrar solo indicadores accionables.

---

## 13) Diseno Vista Simple Persona Cuidada

Bloques base:

- Header: nombre + fecha + hora
- Ahora: proxima accion + confirmar + pedir ayuda
- Hoy: lista breve de actividades
- Manana: recordatorio anticipado
- Footer fijo de llamadas

Reglas:

- Max 3-4 acciones visibles.
- Sin filtros, sin tablas, sin admin data.

---

## 14) Diseno modulo Cuidadores

- Busqueda con filtros claros.
- Cards con confianza visible:
  - perfil completo
  - referencias
  - recomendado CARE
  - datos actualizados
- Perfil publico sin datos sensibles.
- Referencias con visibilidad condicionada por autorizacion.

---

## 15) Diseno Marketplace

Tabs:

- Venta
- Alquiler
- Intercambio
- Donaciones

Reglas:

- Intercambio/Donaciones con aviso permanente:
  "Seccion gratuita. No se permite cobrar dinero."
- Cards uniformes con tipo, estado, zona y accion.

---

## 16) Diseno Servicios

Separado de Marketplace.

Categorias:

- Traslados y acompanamiento
- Ambulancias
- Desarme y organizacion del hogar
- Adaptacion del hogar
- Tramites y gestiones
- Servicios domiciliarios complementarios

Cards:

- Proveedor
- Categoria
- Zona
- Plan
- Disponibilidad
- Contacto

---

## 17) Diseno Planes y Suscripciones

Pantallas:

- Planes (comparativa)
- Mi suscripcion

Estados:

- Activa
- Pendiente de pago
- Vencida
- Cancelada

Regla:

- Preparar UX para Mercado Pago sin acoplar UI al proveedor.

---

## 18) Diseno Panel Admin CARE

MVP admin funcional:

- Usuarios y roles
- Cuidadores y validaciones
- Recomendaciones CARE
- Marketplace/Servicios moderacion
- Suscripciones y vencimientos
- Denuncias y reportes

Reglas:

- Priorizar seguridad y trazabilidad.

---

## 19) Reglas de accesibilidad (WCAG 2.1 AA)

- Contraste minimo AA.
- Navegacion por teclado completa.
- Focus visible obligatorio.
- Labels y `aria-*` en formularios.
- Textos de error claros.
- No depender solo del color para estados.
- Objetivos tactiles >= 44x44.

---

## 20) Reglas responsive

- Mobile-first real.
- Breakpoints sugeridos: `sm`, `md`, `lg`, `xl`.
- Cards en lugar de tablas en mobile.
- Filtros colapsables en pantallas chicas.
- Acciones criticas siempre visibles.

---

## 21) Reglas de privacidad y seguridad UI

- No mostrar telefonos/emails sensibles sin permiso.
- Datos medicos visibles solo a roles autorizados.
- Referencias: mostrar telefono solo con consentimiento + tutor autorizado.
- Documentos en enlaces firmados.
- Historial de cambios en acciones sensibles.

---

## 22) Convenciones tecnicas (Next.js + React + TS + Tailwind)

- App Router.
- Tipado estricto TypeScript.
- Componentes reutilizables en `src/components/ui`.
- Datos mock centralizados en `src/lib/mock-data.ts`.
- Estados visuales centralizados en componentes `Badge/StatusBadge`.
- Formularios complejos con validaciones por paso.

---

## 23) Checklist previo a nuevas pantallas

Antes de implementar un nuevo modulo:

1. Definir rol objetivo y tarea principal.
2. Definir experiencia (admin o simple).
3. Definir estados y alertas.
4. Verificar accesibilidad y mobile.
5. Reusar componentes existentes.
6. Validar privacidad de datos mostrados.

