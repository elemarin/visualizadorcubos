"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { useStore, Tool } from "@/store/useStore";

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
      <aside className="fixed top-0 left-0 z-50 h-screen w-[350px] max-w-[95vw] overflow-y-auto border-r border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">Editor Cerámico 3D</h1>
          <p className="mt-1 text-xs text-slate-400">Herramientas y configuración de proyecto.</p>
        </div>

        <div className="space-y-4 p-4">
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Herramientas</h2>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {TOOL_BUTTONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToolClick(item.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    activeTool === item.id
                      ? "border-blue-300 bg-blue-500 text-white"
                      : "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Pintar Tile y Pintar Fragua abren su selector. Guarda para aplicar.
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Favoritos</h2>

            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Tile</span>
                  <button
                    onClick={() => addTileFavoriteColor(activeColor)}
                    className="text-[11px] text-blue-300 hover:text-blue-200"
                  >
                    + Actual
                  </button>
                </div>
                {tileFavoriteColors.length === 0 ? (
                  <p className="text-[11px] text-slate-500">Sin favoritos de tile.</p>
                ) : (
                  <div className="grid grid-cols-8 gap-1.5">
                    {tileFavoriteColors.map((color) => (
                      <button
                        key={`tile-${color}`}
                        onClick={() => setActiveColor(color)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          removeTileFavoriteColor(color);
                        }}
                        className="h-7 rounded-md border border-slate-700"
                        style={{ backgroundColor: color }}
                        title={`${color} (clic derecho elimina)`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Fragua</span>
                  <button
                    onClick={() => addGroutFavoriteColor(groutColor)}
                    className="text-[11px] text-blue-300 hover:text-blue-200"
                  >
                    + Actual
                  </button>
                </div>
                {groutFavoriteColors.length === 0 ? (
                  <p className="text-[11px] text-slate-500">Sin favoritos de fragua.</p>
                ) : (
                  <div className="grid grid-cols-8 gap-1.5">
                    {groutFavoriteColors.map((color) => (
                      <button
                        key={`grout-${color}`}
                        onClick={() => setGroutColor(color)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          removeGroutFavoriteColor(color);
                        }}
                        className="h-7 rounded-md border border-slate-700"
                        style={{ backgroundColor: color }}
                        title={`${color} (clic derecho elimina)`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Fragua</h2>
            <label className="text-xs text-slate-400">Separación</label>
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.005}
              value={groutGap}
              onChange={(event) => setGroutGap(Number(event.target.value))}
              className="mt-1 w-full accent-blue-500"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500">
              <span>0%</span>
              <span>{Math.round(groutGap * 100)}%</span>
              <span>20%</span>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Dimensiones</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["X", "Y", "Z"] as const).map((axis, index) => (
                <div key={axis}>
                  <label className="text-[11px] text-slate-500">{axis}</label>
                  <input
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
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Proyecto</h2>
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Nombre del diseño"
                  className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-xs"
                />
                <button
                  onClick={handleSaveProject}
                  disabled={voxels.length === 0}
                  className="rounded-md bg-green-600 px-3 py-2 text-xs hover:bg-green-700 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportImage}
                  className="rounded-md bg-violet-600 px-3 py-2 text-xs hover:bg-violet-700"
                >
                  Exportar PNG
                </button>
                <button
                  onClick={handleNewProject}
                  className="rounded-md bg-red-600 px-3 py-2 text-xs hover:bg-red-700"
                >
                  Limpiar
                </button>
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                {savedProjects.length === 0 ? (
                  <p className="text-xs text-slate-500">Sin diseños guardados.</p>
                ) : (
                  savedProjects.map((project) => (
                    <div key={project.id} className="rounded-md border border-slate-700 bg-slate-800 p-2">
                      <p className="truncate text-xs text-slate-200">{project.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {new Date(project.date).toLocaleDateString("es-ES")} · {project.voxels.length} piezas
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => loadProject(project.id)}
                          className="flex-1 rounded bg-blue-600 py-1 text-xs hover:bg-blue-700"
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="flex-1 rounded bg-red-600 py-1 text-xs hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </aside>

      {pickerMode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-[360px] max-w-[96vw] rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-200">{activePickerTitle}</h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Ajusta color, luego presiona Guardar para aplicar.
            </p>

            <div className="mt-3 overflow-hidden rounded-md border border-slate-700">
              <SketchPicker
                color={tempColor}
                onChange={(color: ColorResult) => setTempColor(color.hex)}
                disableAlpha
                width={"100%"}
                presetColors={pickerMode === "tile" ? tilePresetColors : groutPresetColors}
                onSwatchHover={(color) => {
                  if (color?.hex) {
                    // no-op hook required for UX response parity with react-color docs usage
                  }
                }}
              />
            </div>

            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-slate-300">Favoritos {pickerMode === "tile" ? "Tile" : "Fragua"}</span>
                <button
                  onClick={() => {
                    if (pickerMode === "tile") addTileFavoriteColor(tempColor);
                    else addGroutFavoriteColor(tempColor);
                  }}
                  className="text-[11px] text-blue-300 hover:text-blue-200"
                >
                  + Añadir actual
                </button>
              </div>

              {activeFavorites.length === 0 ? (
                <p className="text-[11px] text-slate-500">Sin favoritos en esta categoría.</p>
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
                      className="h-7 rounded-md border border-slate-700"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCancelPicker}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePicker}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
