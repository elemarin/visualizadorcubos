"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/store/useStore";

export default function ProjectManager() {
  const savedProjects = useStore((s) => s.savedProjects);
  const saveProject = useStore((s) => s.saveProject);
  const loadProject = useStore((s) => s.loadProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const loadProjectsFromStorage = useStore((s) => s.loadProjectsFromStorage);
  const voxels = useStore((s) => s.voxels);
  const setVoxels = useStore((s) => s.setVoxels);

  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Load saved projects on mount
  useEffect(() => {
    loadProjectsFromStorage();
  }, [loadProjectsFromStorage]);

  const handleSave = useCallback(() => {
    const name = projectName.trim() || `Diseño ${new Date().toLocaleDateString("es-ES")}`;
    saveProject(name);
    setProjectName("");
  }, [projectName, saveProject]);

  const handleNew = useCallback(() => {
    setVoxels([]);
  }, [setVoxels]);

  const handleExport = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = (window as any).__takeScreenshot;
    if (fn) fn();
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-10 h-10 rounded-full bg-gray-900/90 backdrop-blur text-white flex items-center justify-center shadow-lg border border-gray-700 hover:bg-gray-800 transition-colors"
        title="Proyectos"
      >
        📁
      </button>

      {isOpen && (
        <div className="mt-2 w-72 bg-gray-900/95 backdrop-blur rounded-xl p-4 shadow-2xl border border-gray-700 text-white">
          <h3 className="text-sm font-semibold mb-3">Gestión de Proyectos</h3>

          {/* New project */}
          <button
            onClick={handleNew}
            className="w-full text-xs bg-red-600/80 hover:bg-red-600 text-white px-3 py-2 rounded-lg mb-3 transition-colors"
          >
            🗑️ Nuevo Proyecto (limpiar todo)
          </button>

          {/* Save */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nombre del diseño…"
              className="flex-1 text-xs bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              disabled={voxels.length === 0}
              className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
            >
              💾 Guardar
            </button>
          </div>

          {/* Export screenshot */}
          <button
            onClick={handleExport}
            className="w-full text-xs bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-2 rounded-lg mb-3 transition-colors"
          >
            📸 Exportar Imagen (PNG)
          </button>

          {/* Saved list */}
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Diseños Guardados
          </h4>
          {savedProjects.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Sin diseños guardados.</p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {savedProjects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs font-medium truncate">
                      {project.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(project.date).toLocaleDateString("es-ES")} ·{" "}
                      {project.voxels.length} piezas
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadProject(project.id)}
                      className="text-xs bg-blue-600/80 hover:bg-blue-600 px-2 py-1 rounded transition-colors"
                      title="Cargar"
                    >
                      📂
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-xs bg-red-600/80 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
