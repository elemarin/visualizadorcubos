"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { useStore, Tool } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const setVoxels = useStore((state) => state.setVoxels);

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

  const savedProjects = useStore((state) => state.savedProjects);
  const saveProject = useStore((state) => state.saveProject);
  const loadProject = useStore((state) => state.loadProject);
  const deleteProject = useStore((state) => state.deleteProject);
  const loadProjectsFromStorage = useStore((state) => state.loadProjectsFromStorage);

  const [projectName, setProjectName] = useState("");
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempColor, setTempColor] = useState("#ffffff");

  useEffect(() => {
    loadProjectsFromStorage();
  }, [loadProjectsFromStorage]);

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

  const handleSaveProject = useCallback(() => {
    const name = projectName.trim() || `Diseño ${new Date().toLocaleDateString("es-ES")}`;
    saveProject(name);
    setProjectName("");
  }, [projectName, saveProject]);

  const handleNewProject = useCallback(() => {
    setVoxels([]);
  }, [setVoxels]);

  const handleExportImage = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportFn = (window as any).__takeScreenshot;
    if (exportFn) exportFn();
  }, []);

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
            <Card className="gap-4 rounded-2xl border-border/70 bg-card/95 py-5 shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Herramientas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2.5">
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
                <p className="pt-1 text-xs text-muted-foreground">
                  Pintar Tile y Pintar Fragua abren su selector. Guarda para aplicar.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-3 rounded-2xl border-border/70 bg-card/95 py-4 shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Ajustes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="multiple" defaultValue={["favorites", "grout", "dimensions"]}>
                  <AccordionItem value="favorites">
                    <AccordionTrigger className="text-sm">Favoritos</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2.5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Tile</span>
                            <Button size="xs" variant="outline" onClick={() => addTileFavoriteColor(activeColor)}>
                              + Actual
                            </Button>
                          </div>
                          {tileFavoriteColors.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Sin favoritos de tile.</p>
                          ) : (
                            <div className="grid grid-cols-8 gap-2">
                              {tileFavoriteColors.map((color) => (
                                <button
                                  key={`tile-${color}`}
                                  onClick={() => setActiveColor(color)}
                                  onContextMenu={(event) => {
                                    event.preventDefault();
                                    removeTileFavoriteColor(color);
                                  }}
                                  className="h-8 rounded-lg border border-white/50 shadow-sm"
                                  style={{ backgroundColor: color }}
                                  title={`${color} (clic derecho elimina)`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <div className="mb-2.5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Fragua</span>
                            <Button size="xs" variant="outline" onClick={() => addGroutFavoriteColor(groutColor)}>
                              + Actual
                            </Button>
                          </div>
                          {groutFavoriteColors.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Sin favoritos de fragua.</p>
                          ) : (
                            <div className="grid grid-cols-8 gap-2">
                              {groutFavoriteColors.map((color) => (
                                <button
                                  key={`grout-${color}`}
                                  onClick={() => setGroutColor(color)}
                                  onContextMenu={(event) => {
                                    event.preventDefault();
                                    removeGroutFavoriteColor(color);
                                  }}
                                  className="h-8 rounded-lg border border-white/50 shadow-sm"
                                  style={{ backgroundColor: color }}
                                  title={`${color} (clic derecho elimina)`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="grout">
                    <AccordionTrigger className="text-sm">Fragua</AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="dimensions">
                    <AccordionTrigger className="text-sm">Dimensiones</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-3">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="gap-4 rounded-2xl border-border/70 bg-card/95 py-5 shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex gap-2">
                  <Input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="Nombre del diseño"
                    className="h-10 rounded-xl"
                  />
                  <Button onClick={handleSaveProject} disabled={voxels.length === 0} className="h-10 rounded-xl px-5">
                    Guardar
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleExportImage} variant="secondary" className="h-10 rounded-xl">
                    Exportar PNG
                  </Button>
                  <Button onClick={handleNewProject} variant="destructive" className="h-10 rounded-xl">
                    Limpiar
                  </Button>
                </div>

                <div className="space-y-1">
                  {savedProjects.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sin diseños guardados.</p>
                  ) : (
                    savedProjects.map((project) => (
                      <div key={project.id} className="rounded-xl border border-border/70 bg-muted/45 p-3">
                        <p className="truncate text-xs font-medium">{project.name}</p>
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </aside>

      <Dialog
        open={pickerMode !== null}
        onOpenChange={(open) => {
          if (!open) handleCancelPicker();
        }}
      >
        <DialogContent className="max-w-95 p-4 sm:max-w-105" showCloseButton={false}>
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
