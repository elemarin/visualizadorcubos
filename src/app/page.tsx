"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Check, Menu, PanelLeftClose, PanelLeftOpen, Pencil } from "lucide-react";
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
const POSITION_PRECISION = 5;

export default function HomePage() {
  const voxels = useStore((s) => s.voxels);
  const tileSize = useStore((s) => s.tileSize);
  const activeTool = useStore((s) => s.activeTool);
  const projectName = useStore((s) => s.projectName);
  const setProjectName = useStore((s) => s.setProjectName);
  const loadProjectsFromStorage = useStore((s) => s.loadProjectsFromStorage);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState(projectName);

  useEffect(() => {
    loadProjectsFromStorage();
  }, [loadProjectsFromStorage]);

  useEffect(() => {
    setProjectNameDraft(projectName);
  }, [projectName]);
  const tileCounts = useMemo(() => {
    const toKey = (x: number, y: number, z: number) =>
      `${x.toFixed(POSITION_PRECISION)},${y.toFixed(POSITION_PRECISION)},${z.toFixed(POSITION_PRECISION)}`;
    const voxelSet = new Set(voxels.map((voxel) => toKey(voxel.position[0], voxel.position[1], voxel.position[2])));
    const counts = new Map<string, number>();
    const directions: Array<{ face: "px" | "nx" | "py" | "pz" | "nz"; offset: [number, number, number] }> = [
      { face: "px", offset: [tileSize[0], 0, 0] },
      { face: "nx", offset: [-tileSize[0], 0, 0] },
      { face: "py", offset: [0, tileSize[1], 0] },
      { face: "pz", offset: [0, 0, tileSize[2]] },
      { face: "nz", offset: [0, 0, -tileSize[2]] },
    ];

    voxels.forEach((voxel) => {
      const [x, y, z] = voxel.position;
      directions.forEach(({ face, offset }) => {
        if (!voxelSet.has(toKey(x + offset[0], y + offset[1], z + offset[2]))) {
          const color = voxel.faceColors[face];
          counts.set(color, (counts.get(color) ?? 0) + 1);
        }
      });
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [voxels, tileSize]);
  const totalTiles = useMemo(() => tileCounts.reduce((sum, [, value]) => sum + value, 0), [tileCounts]);

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

      <div className="fixed top-4 right-4 z-50 min-w-45 rounded-2xl border border-border/80 bg-card/90 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          {editingProjectName ? (
            <input
              className="h-7 min-w-40 rounded-md border border-border bg-background px-2 text-xs text-foreground"
              value={projectNameDraft}
              onChange={(event) => setProjectNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setProjectName(projectNameDraft.trim() || "Proyecto sin nombre");
                  setEditingProjectName(false);
                }
              }}
            />
          ) : (
            <p className="truncate text-sm font-semibold text-foreground">{projectName}</p>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={() => {
              if (editingProjectName) {
                setProjectName(projectNameDraft.trim() || "Proyecto sin nombre");
              }
              setEditingProjectName((value) => !value);
            }}
          >
            {editingProjectName ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
            <span className="sr-only">Editar nombre del proyecto</span>
          </Button>
        </div>
        <div className="flex items-center">
          <span className="font-medium text-foreground">{TOOL_LABELS[activeTool]}</span>
          <span className="mx-2 text-muted-foreground/60">•</span>
          <span>{totalTiles} tiles</span>
        </div>
        <div className="mt-1.5 space-y-1">
          {tileCounts.length === 0 ? (
            <p>Sin tiles</p>
          ) : (
            tileCounts.map(([color, count]) => (
              <div key={color} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm border" style={{ backgroundColor: color }} />
                  <span className="font-mono">{color}</span>
                </div>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
