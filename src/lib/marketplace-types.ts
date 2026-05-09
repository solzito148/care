export type MarketplaceTab = "venta" | "alquiler" | "intercambio" | "donaciones";

export type MarketplaceCategory =
  | "movilidad"
  | "descanso"
  | "higiene"
  | "bano"
  | "insumos"
  | "salud-domiciliaria"
  | "rehabilitacion";

export type MarketplaceItem = {
  id: string;
  foto: string;
  titulo: string;
  categoria: string;
  zona: string;
  estado: string;
  precio?: string;
  tipo: MarketplaceTab;
};
