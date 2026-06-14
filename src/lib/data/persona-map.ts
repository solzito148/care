import type { Json } from "@/lib/supabase/types";
import type { PersonaCuidada } from "@/lib/persona-cuidada-types";

type Meta = Record<string, Json | undefined>;

export function careRecipientToPersona(row: {
  full_name: string;
  preferred_name: string | null;
  dni?: string | null;
  birth_date: string | null;
  emergency_notes: string | null;
  metadata: Json;
}): PersonaCuidada {
  const meta = (row.metadata && typeof row.metadata === "object" ? row.metadata : {}) as Meta;
  const full = row.full_name.trim();
  const tokens = full.length ? full.split(/\s+/) : [];
  const defaultNombre = tokens[0] ?? "";
  const defaultApellido = tokens.slice(1).join(" ");

  return {
    nombre: typeof meta.nombre === "string" ? meta.nombre : defaultNombre,
    apellido: typeof meta.apellido === "string" ? meta.apellido : defaultApellido,
    // La columna `dni` es la fuente de verdad (clave univoca); metadata es fallback legacy.
    dni: row.dni?.trim() || (typeof meta.dni === "string" ? meta.dni : ""),
    fechaNacimiento: row.birth_date ?? (typeof meta.fechaNacimiento === "string" ? meta.fechaNacimiento : ""),
    domicilio: typeof meta.domicilio === "string" ? meta.domicilio : "",
    localidad: typeof meta.localidad === "string" ? meta.localidad : "",
    provincia: typeof meta.provincia === "string" ? meta.provincia : "",
    telefono: typeof meta.telefono === "string" ? meta.telefono : "",
    observacionesGenerales: row.emergency_notes ?? (typeof meta.observacionesGenerales === "string" ? meta.observacionesGenerales : ""),
    medicoCabecera: typeof meta.medicoCabecera === "string" ? meta.medicoCabecera : "",
    diagnosticosRelevantes: typeof meta.diagnosticosRelevantes === "string" ? meta.diagnosticosRelevantes : "",
    alergias: typeof meta.alergias === "string" ? meta.alergias : "",
    restricciones: typeof meta.restricciones === "string" ? meta.restricciones : "",
    movilidad: typeof meta.movilidad === "string" ? meta.movilidad : "",
    necesitaAcompanamiento: typeof meta.necesitaAcompanamiento === "boolean" ? meta.necesitaAcompanamiento : false,
    observacionesMedicas: typeof meta.observacionesMedicas === "string" ? meta.observacionesMedicas : "",
    obraSocialTipo: typeof meta.obraSocialTipo === "string" ? meta.obraSocialTipo : "",
    obraSocialNombre: typeof meta.obraSocialNombre === "string" ? meta.obraSocialNombre : "",
    obraSocialPlan: typeof meta.obraSocialPlan === "string" ? meta.obraSocialPlan : "",
    numeroAfiliado: typeof meta.numeroAfiliado === "string" ? meta.numeroAfiliado : "",
    telefonoUtil: typeof meta.telefonoUtil === "string" ? meta.telefonoUtil : "",
    credencialAdjunta: typeof meta.credencialAdjunta === "string" ? meta.credencialAdjunta : "",
    tutores: Array.isArray(meta.tutores) ? (meta.tutores as PersonaCuidada["tutores"]) : [],
    cuidadores: Array.isArray(meta.cuidadores) ? (meta.cuidadores as PersonaCuidada["cuidadores"]) : [],
    contactosEmergencia: Array.isArray(meta.contactosEmergencia)
      ? (meta.contactosEmergencia as PersonaCuidada["contactosEmergencia"])
      : [],
    documentacion: Array.isArray(meta.documentacion) ? (meta.documentacion as PersonaCuidada["documentacion"]) : [],
  };
}

export function personaToCareRecipientUpdate(form: PersonaCuidada): {
  full_name: string;
  preferred_name: string | null;
  dni: string | null;
  birth_date: string | null;
  emergency_notes: string | null;
  metadata: Json;
} {
  const full_name = `${form.nombre} ${form.apellido}`.trim() || "Persona cuidada";
  const metadata: Meta = {
    nombre: form.nombre,
    apellido: form.apellido,
    dni: form.dni,
    fechaNacimiento: form.fechaNacimiento,
    domicilio: form.domicilio,
    localidad: form.localidad,
    provincia: form.provincia,
    telefono: form.telefono,
    observacionesGenerales: form.observacionesGenerales,
    medicoCabecera: form.medicoCabecera,
    diagnosticosRelevantes: form.diagnosticosRelevantes,
    alergias: form.alergias,
    restricciones: form.restricciones,
    movilidad: form.movilidad,
    necesitaAcompanamiento: form.necesitaAcompanamiento,
    observacionesMedicas: form.observacionesMedicas,
    obraSocialTipo: form.obraSocialTipo,
    obraSocialNombre: form.obraSocialNombre,
    obraSocialPlan: form.obraSocialPlan,
    numeroAfiliado: form.numeroAfiliado,
    telefonoUtil: form.telefonoUtil,
    credencialAdjunta: form.credencialAdjunta,
    tutores: form.tutores as unknown as Json,
    cuidadores: form.cuidadores as unknown as Json,
    contactosEmergencia: form.contactosEmergencia as unknown as Json,
    documentacion: form.documentacion as unknown as Json,
  };

  return {
    full_name,
    preferred_name: form.nombre || null,
    dni: form.dni?.trim() ? form.dni.trim() : null,
    birth_date: form.fechaNacimiento || null,
    emergency_notes: form.observacionesGenerales || null,
    metadata: metadata as Json,
  };
}
