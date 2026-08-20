import type { Metadata } from "next";
import "./globals.css";
import Animations from "@/components/Animations";
import Vines from "@/components/Vines";
import PWARegister from "@/components/PWARegister";

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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A3A5C" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}
        <Vines /><Animations /><PWARegister /></body>
    </html>
  );
}
