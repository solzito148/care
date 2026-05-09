export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  mobilePrimary?: boolean;
};

export const appNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Inicio", mobilePrimary: true },
  { href: "/persona-cuidada", label: "Persona cuidada", shortLabel: "Persona", mobilePrimary: true },
  { href: "/agenda", label: "Agenda", shortLabel: "Agenda", mobilePrimary: true },
  { href: "/medicacion", label: "Medicacion", shortLabel: "Meds", mobilePrimary: true },
  { href: "/turnos", label: "Turnos", shortLabel: "Turnos", mobilePrimary: true },
  { href: "/estudios", label: "Estudios", shortLabel: "Estudios" },
  { href: "/contactos", label: "Contactos", shortLabel: "Contactos" },
  { href: "/cuidadores", label: "Cuidadores", shortLabel: "Cuidadores" },
  { href: "/servicios", label: "Servicios", shortLabel: "Servicios" },
  { href: "/marketplace", label: "Marketplace", shortLabel: "Market" },
  { href: "/planes", label: "Planes", shortLabel: "Planes" },
  { href: "/legales", label: "Legales y administrativos", shortLabel: "Legales" },
  { href: "/mi-cuenta", label: "Mi cuenta", shortLabel: "Cuenta" },
];
