import { z } from "zod";

import { longText, phoneSchema, shortText } from "@/lib/validations/common-schema";

const nestedIdName = z.object({
  id: z.string().trim().max(40).default(""),
  nombre: shortText(120).default(""),
});

export const savePersonaCuidadaSchema = z.object({
  nombre: shortText(80).default(""),
  apellido: shortText(80).default(""),
  dni: shortText(20).default(""),
  fechaNacimiento: z.string().trim().max(10).default(""),
  domicilio: shortText(200).default(""),
  localidad: shortText(120).default(""),
  provincia: shortText(80).default(""),
  telefono: phoneSchema.default(""),
  observacionesGenerales: longText(2000).default(""),
  medicoCabecera: shortText(120).default(""),
  diagnosticosRelevantes: longText(1000).default(""),
  alergias: longText(500).default(""),
  restricciones: longText(500).default(""),
  movilidad: shortText(120).default(""),
  necesitaAcompanamiento: z.boolean().default(false),
  observacionesMedicas: longText(1000).default(""),
  obraSocialTipo: shortText(80).default(""),
  obraSocialNombre: shortText(120).default(""),
  obraSocialPlan: shortText(80).default(""),
  numeroAfiliado: shortText(40).default(""),
  telefonoUtil: phoneSchema.default(""),
  credencialAdjunta: shortText(200).default(""),
  tutores: z.array(nestedIdName.extend({ rol: z.string().max(40), permisos: shortText(200) })).max(20).default([]),
  cuidadores: z.array(nestedIdName.extend({ rol: shortText(80), horarios: shortText(120), contacto: phoneSchema })).max(20).default([]),
  contactosEmergencia: z
    .array(
      nestedIdName.extend({
        relacion: shortText(80),
        telefono: phoneSchema,
        whatsapp: phoneSchema,
        email: z.string().trim().max(160).default(""),
      })
    )
    .max(20)
    .default([]),
  documentacion: z
    .array(
      z.object({
        id: z.string().trim().max(40).default(""),
        tipo: shortText(80),
        archivo: shortText(200),
        actualizado: shortText(40),
      })
    )
    .max(50)
    .default([]),
});
