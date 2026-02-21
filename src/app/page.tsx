"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Toolbar from "@/components/ui/Toolbar";
import SettingsSidebar from "@/components/ui/SettingsSidebar";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Dynamically import the 3D scene with SSR disabled (Three.js needs the browser)
const Scene = dynamic(() => import("@/components/three/Scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400 text-sm">
      Cargando escena 3D…
    </div>
  ),
});

const TOOL_LABELS: Record<string, string> = {
  ADD: "➕ Agregar",
  REMOVE: "➖ Quitar",
  PAINT_TILE: "🎨 Pintar Tile",
  PAINT_GROUT: "🧱 Pintar Fragua",
  CAMERA_ORBIT: "🔄 Rotar Cámara",
};

export default function HomePage() {
  const count = useStore((s) => s.voxels.length);
  const activeTool = useStore((s) => s.activeTool);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,#1f2937,#0a0a0f_45%)]">
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-40 hidden w-90 transition-transform duration-300 md:block",
          desktopSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-auto h-full p-3">
          <SettingsSidebar />
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-y-0 right-0 left-0 transition-[left] duration-300",
          desktopSidebarOpen ? "md:left-90" : "md:left-0"
        )}
      >
        <Scene />
      </div>

      <div className="fixed top-3 left-3 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="size-11 rounded-full shadow-lg">
              <Menu className="size-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-85 border-r p-0 sm:max-w-85" showCloseButton={false}>
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <SettingsSidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="fixed top-3 left-3 z-50 hidden md:block">
        <Button
          variant="secondary"
          size="icon"
          className="size-10 rounded-full shadow-md"
          onClick={() => setDesktopSidebarOpen((value) => !value)}
        >
          {desktopSidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          <span className="sr-only">Alternar barra lateral</span>
        </Button>
      </div>

      <Toolbar />

      <div className="fixed top-3 right-3 z-50 rounded-full border bg-background/90 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur">
        <span className="font-medium text-foreground">{TOOL_LABELS[activeTool]}</span>
        <span className="mx-2 text-muted-foreground/60">•</span>
        <span>{count} piezas</span>
      </div>
    </main>
  );
}
