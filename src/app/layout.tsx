import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CARE - Cuidado de personas mayores",
  description: "Plataforma web para gestion integral del cuidado de personas mayores.",
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
