import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acuarius Café & Sabores — Buenos momentos, siempre",
  description:
    "Café de especialidad en Fontibón, Bogotá: cafés, tés, jugos, postres, coctelería y cerveza artesanal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
