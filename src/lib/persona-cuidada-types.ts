export type TutorPermiso =
  | "administrador"
  | "edicion_total"
  | "salud"
  | "agenda"
  | "legales"
  | "solo_lectura";

export type Tutor = {
  id: string;
  nombre: string;
  rol: "principal" | "secundario";
  permisos: TutorPermiso;
};

export type Caregiver = {
  id: string;
  nombre: string;
  rol: string;
  horarios: string;
  contacto: string;
};

export type EmergencyContact = {
  id: string;
  nombre: string;
  relacion: string;
  telefono: string;
  whatsapp: string;
  email: string;
};

export type DocumentItem = {
  id: string;
  tipo: string;
  archivo: string;
  actualizado: string;
};

export type PersonaCuidada = {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  domicilio: string;
  localidad: string;
  provincia: string;
  telefono: string;
  observacionesGenerales: string;
  medicoCabecera: string;
  diagnosticosRelevantes: string;
  alergias: string;
  restricciones: string;
  movilidad: string;
  necesitaAcompanamiento: boolean;
  observacionesMedicas: string;
  obraSocialTipo: string;
  obraSocialNombre: string;
  obraSocialPlan: string;
  numeroAfiliado: string;
  telefonoUtil: string;
  credencialAdjunta: string;
  tutores: Tutor[];
  cuidadores: Caregiver[];
  contactosEmergencia: EmergencyContact[];
  documentacion: DocumentItem[];
};
