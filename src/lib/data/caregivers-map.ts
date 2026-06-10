import type { CaregiverReferencePublic, CaregiverSearchItem } from "@/lib/cuidadores-types";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["caregiver_profiles"]["Row"];
type RefRow = Database["public"]["Tables"]["caregiver_reference_entries"]["Row"];

export function profileRowToSearchItem(row: ProfileRow): CaregiverSearchItem {
  const rating = Number.parseFloat(row.rating);

  return {
    id: row.id,
    foto: row.display_initials,
    nombre: row.full_name,
    zonasTrabajo: row.zones ?? [],
    localidad: row.locality,
    modalidades: row.modalities ?? [],
    disponibilidadEspecial: row.availability_special ?? [],
    experiencia: row.experience_years,
    tareas: row.tasks ?? [],
    calificacion: Number.isFinite(rating) ? rating : 0,
    perfilCompleto: row.profile_complete,
    referenciasCargadas: row.references_loaded,
    referenciasVerificadas: row.references_verified,
    recomendadoCare: row.recommended_care,
    datosActualizados: row.data_updated,
    estadoActualizacionPerfil: row.profile_status,
    altaDisponibilidad: row.high_availability,
    ultimaActualizacion: row.last_profile_update ?? row.updated_at.slice(0, 10),
    recomendacionesCount: 0,
    recomendacionesPromedio: 0,
  };
}

export function referenceRowToPublic(row: RefRow): CaregiverReferencePublic {
  return {
    nombreContratante: row.hirer_name,
    zona: row.zone ?? "",
    periodo: row.period ?? "",
    modalidad: row.modality ?? "",
    tareas: row.tasks_summary ?? "",
    telefono: row.phone ?? undefined,
  };
}
