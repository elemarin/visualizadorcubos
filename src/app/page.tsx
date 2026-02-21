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
    <div className="flex h-full w-full items-center justify-center bg-secondary/70 text-muted-foreground text-sm">
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
    <main className="relative h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,oklch(0.98_0.04_305),oklch(0.95_0.03_260)_45%,oklch(0.92_0.05_335)_100%)]">
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-40 hidden w-90 transition-transform duration-300 md:block",
          desktopSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-auto h-full p-4">
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

      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="size-11 rounded-full border border-border/80 bg-card/95 shadow-lg backdrop-blur">
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

      <div className="fixed top-4 left-4 z-50 hidden md:block">
        <Button
          variant="secondary"
          size="icon"
          className="size-10 rounded-full border border-border/80 bg-card/90 shadow-md backdrop-blur"
          onClick={() => setDesktopSidebarOpen((value) => !value)}
        >
          {desktopSidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          <span className="sr-only">Alternar barra lateral</span>
        </Button>
      </div>

      <Toolbar />

      <div className="fixed top-4 right-4 z-50 rounded-full border border-border/80 bg-card/90 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur">
        <span className="font-medium text-foreground">{TOOL_LABELS[activeTool]}</span>
        <span className="mx-2 text-muted-foreground/60">•</span>
        <span>{count} piezas</span>
      </div>
    </main>
  );
}
