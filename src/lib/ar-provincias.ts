/**
 * Nombres oficiales de las 24 jurisdicciones de Argentina segun GeoRef
 * (apis.datos.gob.ar). Se usan tal cual los devuelve la API de direcciones
 * para que el valor derivado coincida con una opcion del desplegable.
 */
export const AR_PROVINCIAS = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
  "Tucumán",
] as const;

export type ArProvincia = (typeof AR_PROVINCIAS)[number];
