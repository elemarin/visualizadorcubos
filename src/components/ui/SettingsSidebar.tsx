"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { useStore, Tool } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PickerMode = "tile" | "grout" | null;

const TOOL_BUTTONS: Array<{ id: "ADD" | "REMOVE" | "PAINT_TILE" | "PAINT_GROUT" | "CAMERA_ORBIT"; label: string; icon: string }> = [
  { id: "ADD", label: "Agregar", icon: "➕" },
  { id: "REMOVE", label: "Quitar", icon: "➖" },
  { id: "PAINT_TILE", label: "Pintar Tile", icon: "🎨" },
  { id: "PAINT_GROUT", label: "Pintar Fragua", icon: "🧱" },
  { id: "CAMERA_ORBIT", label: "Rotar Cámara", icon: "🔄" },
];

const PRESET_TILE_COLORS = [
  "#f8fafc",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
  "#000000",
  "#f87171",
  "#fb7185",
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#d4a373",
  "#8d6e63",
];

const PRESET_GROUT_COLORS = [
  "#ffffff",
  "#f5f5f4",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  "#292524",
  "#000000",
  "#d1d5db",
  "#9ca3af",
  "#6b7280",
  "#4b5563",
  "#374151",
  "#1f2937",
];

function mergePresetColors(favorites: string[], defaults: string[]): string[] {
  const set = new Set<string>();
  [...favorites, ...defaults].forEach((entry) => set.add(entry));
  return [...set];
}

export default function SettingsSidebar() {
  const voxels = useStore((state) => state.voxels);

  const activeTool = useStore((state) => state.activeTool);
  const setActiveTool = useStore((state) => state.setActiveTool);

  const activeColor = useStore((state) => state.activeColor);
  const setActiveColor = useStore((state) => state.setActiveColor);

  const groutColor = useStore((state) => state.groutColor);
  const setGroutColor = useStore((state) => state.setGroutColor);

  const groutGap = useStore((state) => state.groutGap);
  const setGroutGap = useStore((state) => state.setGroutGap);

  const tileFavoriteColors = useStore((state) => state.tileFavoriteColors);
  const groutFavoriteColors = useStore((state) => state.groutFavoriteColors);
  const addTileFavoriteColor = useStore((state) => state.addTileFavoriteColor);
  const addGroutFavoriteColor = useStore((state) => state.addGroutFavoriteColor);
  const removeTileFavoriteColor = useStore((state) => state.removeTileFavoriteColor);
  const removeGroutFavoriteColor = useStore((state) => state.removeGroutFavoriteColor);

  const tileSize = useStore((state) => state.tileSize);
  const setTileSize = useStore((state) => state.setTileSize);
  const projectName = useStore((state) => state.projectName);
  const currentProjectId = useStore((state) => state.currentProjectId);
  const createNewProject = useStore((state) => state.createNewProject);
  const clearCanvas = useStore((state) => state.clearCanvas);
  const persistCurrentProject = useStore((state) => state.persistCurrentProject);

  const savedProjects = useStore((state) => state.savedProjects);
  const loadProject = useStore((state) => state.loadProject);
  const deleteProject = useStore((state) => state.deleteProject);

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempColor, setTempColor] = useState("#ffffff");

  useEffect(() => {
    if (currentProjectId) persistCurrentProject();
  }, [
    currentProjectId,
    voxels,
    tileSize,
    groutGap,
    groutColor,
    activeColor,
    activeTool,
    tileFavoriteColors,
    groutFavoriteColors,
    projectName,
    persistCurrentProject,
  ]);

  const tilePresetColors = useMemo(
    () => mergePresetColors(tileFavoriteColors, PRESET_TILE_COLORS),
    [tileFavoriteColors]
  );

  const groutPresetColors = useMemo(
    () => mergePresetColors(groutFavoriteColors, PRESET_GROUT_COLORS),
    [groutFavoriteColors]
  );

  const openTilePicker = useCallback(() => {
    setTempColor(activeColor);
    setPickerMode("tile");
  }, [activeColor]);

  const openGroutPicker = useCallback(() => {
    setTempColor(groutColor);
    setPickerMode("grout");
  }, [groutColor]);

  const handleToolClick = useCallback(
    (tool: Tool) => {
      if (tool === "PAINT_TILE") {
        openTilePicker();
        return;
      }
      if (tool === "PAINT_GROUT") {
        openGroutPicker();
        return;
      }
      setActiveTool(tool);
    },
    [openTilePicker, openGroutPicker, setActiveTool]
  );

  const handleSavePicker = useCallback(() => {
    if (pickerMode === "tile") {
      setActiveColor(tempColor);
      setActiveTool("PAINT_TILE");
    } else if (pickerMode === "grout") {
      setGroutColor(tempColor);
    }
    setPickerMode(null);
  }, [pickerMode, tempColor, setActiveColor, setActiveTool, setGroutColor]);

  const handleCancelPicker = useCallback(() => {
    setPickerMode(null);
  }, []);

  const handleNewProject = useCallback(() => {
    createNewProject();
  }, [createNewProject]);

  const activePickerTitle = pickerMode === "tile" ? "Selector de Color: Tile" : "Selector de Color: Fragua";
  const activeFavorites = pickerMode === "tile" ? tileFavoriteColors : groutFavoriteColors;

  return (
    <>
      <aside className="flex h-full flex-col rounded-3xl border border-border/70 bg-card/90 text-card-foreground shadow-xl backdrop-blur-xl">
        <div className="space-y-2.5 border-b border-border/70 px-6 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">Editor Cerámico 3D</h1>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
              Beta UI
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Herramientas, colores y gestión del proyecto.</p>
        </div>

        <ScrollArea className="h-full">
          <div className="space-y-5 p-5">
            <Accordion type="multiple" defaultValue={["tools"]} className="space-y-4">
              <AccordionItem value="tools" className="rounded-2xl border border-border/70 bg-card/95 px-4 shadow-sm">
                <AccordionTrigger className="text-base">Herramientas</AccordionTrigger>
                <AccordionContent className="grid grid-cols-1 gap-2.5 pb-4">
                  {TOOL_BUTTONS.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTool === item.id ? "default" : "secondary"}
                      className="h-11 justify-start rounded-xl px-3 text-sm shadow-sm"
                      onClick={() => handleToolClick(item.id)}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="settings" className="rounded-2xl border border-border/70 bg-card/95 px-4 shadow-sm">
                <AccordionTrigger className="text-base">Ajustes</AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">Color de fragua</label>
                      <Button size="xs" variant="outline" onClick={openGroutPicker}>
                        Cambiar
                      </Button>
                    </div>
                    <button
                      className="h-8 w-full rounded-lg border border-white/50 shadow-sm"
                      style={{ backgroundColor: groutColor }}
                      onClick={openGroutPicker}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Separación</label>
                    <Slider
                      min={0}
                      max={0.2}
                      step={0.005}
                      value={[groutGap]}
                      onValueChange={(values) => setGroutGap(values[0] ?? 0)}
                      className="mt-3"
                    />
                    <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                      <span>0%</span>
                      <span>{Math.round(groutGap * 100)}%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Tamaño de tile</label>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      {(["X", "Y", "Z"] as const).map((axis, index) => (
                        <div key={axis}>
                          <label className="text-[11px] font-semibold text-muted-foreground">{axis}</label>
                          <Input
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={tileSize[index]}
                            onChange={(event) => {
                              const value = Math.max(0.5, Number(event.target.value) || 1);
                              const nextSize: [number, number, number] = [...tileSize];
                              nextSize[index] = value;
                              setTileSize(nextSize);
                            }}
                            className="mt-1.5 h-9 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="project" className="rounded-2xl border border-border/70 bg-card/95 px-4 shadow-sm">
                <AccordionTrigger className="text-base">Proyecto</AccordionTrigger>
                <AccordionContent className="space-y-3.5 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleNewProject} className="h-10 rounded-xl">
                      Nuevo proyecto
                    </Button>
                    <Button onClick={clearCanvas} variant="destructive" className="h-10 rounded-xl">
                      Limpiar canvas
                    </Button>
                  </div>

                  {savedProjects.length > 1 ? (
                    <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                      {savedProjects.map((project) => (
                        <div key={project.id} className="rounded-xl border border-border/70 bg-muted/45 p-3">
                          <p className="truncate text-xs font-medium">
                            {project.name} {project.id === currentProjectId ? "(actual)" : ""}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {new Date(project.date).toLocaleDateString("es-ES")} · {project.voxels.length} piezas
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" className="h-8 flex-1 rounded-lg" onClick={() => loadProject(project.id)}>
                              Cargar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 flex-1 rounded-lg"
                              onClick={() => deleteProject(project.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </aside>

      <Dialog
        open={pickerMode !== null}
        onOpenChange={(open) => {
          if (!open) handleCancelPicker();
        }}
      >
        <DialogContent
          className="max-w-95 p-4 sm:max-w-105"
          showCloseButton={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base">{activePickerTitle}</DialogTitle>
            <DialogDescription>Ajusta color, luego presiona Guardar para aplicar.</DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden rounded-md border">
            <SketchPicker
              color={tempColor}
              onChange={(color: ColorResult) => setTempColor(color.hex)}
              disableAlpha
              width={"100%"}
              presetColors={pickerMode === "tile" ? tilePresetColors : groutPresetColors}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Favoritos {pickerMode === "tile" ? "Tile" : "Fragua"}</span>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  if (pickerMode === "tile") addTileFavoriteColor(tempColor);
                  else addGroutFavoriteColor(tempColor);
                }}
              >
                + Añadir actual
              </Button>
            </div>

            {activeFavorites.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin favoritos en esta categoría.</p>
            ) : (
              <div className="grid grid-cols-10 gap-1.5">
                {activeFavorites.map((color) => (
                  <button
                    key={`${pickerMode}-${color}`}
                    onClick={() => setTempColor(color)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      if (pickerMode === "tile") removeTileFavoriteColor(color);
                      else removeGroutFavoriteColor(color);
                    }}
                    className="h-7 rounded-md border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleCancelPicker} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSavePicker}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
