import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Constructor de Muebles Cerámicos 3D",
  description:
    "Diseña muebles de cerámica en 3D con un constructor estilo voxel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased w-full h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
