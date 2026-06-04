import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Care",
  description: "Plataforma de cuidado con accesibilidad y permisos por rol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
