"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ChromePicker, ColorResult } from "react-color";
import { useStore, Tool } from "@/store/useStore";

const TOOLS: Array<{ tool: Tool; label: string; icon: string }> = [
  { tool: "ADD", label: "Agregar", icon: "➕" },
  { tool: "REMOVE", label: "Quitar", icon: "➖" },
  { tool: "PAINT_SINGLE", label: "Pintar Pieza", icon: "🎨" },
  { tool: "PAINT_FACE", label: "Pintar Cara", icon: "🪣" },
  { tool: "CAMERA_ORBIT", label: "Rotar Cámara", icon: "🔄" },
];

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PickerRow({
  label,
  color,
  onChange,
}: {
  label: string;
  color: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">{color}</span>
          <span className="h-4 w-4 rounded border border-slate-600" style={{ backgroundColor: color }} />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-700">
        <ChromePicker
          color={color}
          onChange={(value: ColorResult) => onChange(value.hex)}
          disableAlpha
          styles={{
            default: {
              picker: {
                width: "100%",
                boxShadow: "none",
                borderRadius: 0,
                background: "#0b1220",
              },
              saturation: {
                borderRadius: 0,
              },
              hue: {
                borderRadius: 4,
              },
              color: {
                borderRadius: 4,
              },
            },
          }}
        />
      </div>
    </div>
  );
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

  const favoriteColors = useStore((state) => state.favoriteColors);
  const addFavoriteColor = useStore((state) => state.addFavoriteColor);
  const removeFavoriteColor = useStore((state) => state.removeFavoriteColor);

  const tileSize = useStore((state) => state.tileSize);
  const setTileSize = useStore((state) => state.setTileSize);

  const savedProjects = useStore((state) => state.savedProjects);
  const saveProject = useStore((state) => state.saveProject);
  const loadProject = useStore((state) => state.loadProject);
  const deleteProject = useStore((state) => state.deleteProject);
  const loadProjectsFromStorage = useStore((state) => state.loadProjectsFromStorage);

  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    loadProjectsFromStorage();
  }, [loadProjectsFromStorage]);

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

  const currentSwatch = useMemo(
    () => [
      { label: "Pieza", color: activeColor, set: () => addFavoriteColor(activeColor) },
      { label: "Fragua", color: groutColor, set: () => addFavoriteColor(groutColor) },
    ],
    [activeColor, groutColor, addFavoriteColor]
  );

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-[350px] max-w-[95vw] overflow-y-auto border-r border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl">
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight">Editor Cerámico 3D</h1>
        <p className="mt-1 text-xs text-slate-400">Pinta por cara y controla la fragua desde aquí.</p>
      </div>

      <div className="space-y-4 p-4">
        <SectionCard title="Herramientas">
          <div className="grid grid-cols-1 gap-2">
            {TOOLS.map((item) => (
              <button
                key={item.tool}
                onClick={() => setActiveTool(item.tool)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  activeTool === item.tool
                    ? "border-blue-300 bg-blue-500 text-white"
                    : "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Colores">
          <div className="space-y-3">
            <PickerRow label="Color de Pieza" color={activeColor} onChange={setActiveColor} />
            <PickerRow label="Color de Fragua" color={groutColor} onChange={setGroutColor} />

            <div>
              <label className="text-xs text-slate-400">Separación de Fragua</label>
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
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs text-slate-400">Favoritos</label>
                <span className="text-[11px] text-slate-500">Inician vacíos</span>
              </div>

              {favoriteColors.length === 0 ? (
                <p className="text-[11px] text-slate-500">Aún no hay favoritos. Añade con los botones rápidos.</p>
              ) : (
                <div className="mb-2 grid grid-cols-8 gap-1.5">
                  {favoriteColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setActiveColor(color)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        removeFavoriteColor(color);
                      }}
                      className="h-7 rounded-md border border-slate-700"
                      style={{ backgroundColor: color }}
                      title={`${color} (clic derecho elimina)`}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {currentSwatch.map((entry) => (
                  <button
                    key={entry.label}
                    onClick={entry.set}
                    className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    + {entry.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Dimensiones">
          <div className="grid grid-cols-3 gap-2">
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
        </SectionCard>

        <SectionCard title="Proyecto">
          <div className="space-y-2">
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
        </SectionCard>
      </div>
    </aside>
  );
}
