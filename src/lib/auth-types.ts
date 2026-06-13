export type AccountType =
  | "tutor-familiar-encargado"
  | "cuidador"
  | "profesional-salud"
  | "profesional-legal-administrativo"
  | "proveedor-marketplace"
  | "proveedor-servicios";

export type AccountTypeOption = {
  value: AccountType;
  label: string;
};

export const accountTypeOptions: AccountTypeOption[] = [
  { value: "tutor-familiar-encargado", label: "Tutor / Familiar / Encargado" },
  { value: "cuidador", label: "Cuidador" },
  { value: "profesional-salud", label: "Profesional de salud" },
  { value: "profesional-legal-administrativo", label: "Profesional legal o administrativo" },
  { value: "proveedor-marketplace", label: "Proveedor de productos" },
  { value: "proveedor-servicios", label: "Proveedor de servicios" },
];
