"use client";

import { useStore, Tool } from "@/store/useStore";

interface ToolButton {
  tool: Tool;
  label: string;
  icon: string;
}

const TOOLS: ToolButton[] = [
  { tool: "ADD", label: "Agregar", icon: "➕" },
  { tool: "REMOVE", label: "Quitar", icon: "➖" },
  { tool: "PAINT_TILE", label: "Pintar Tile", icon: "🎨" },
  { tool: "PAINT_GROUT", label: "Pintar Fragua", icon: "🧱" },
  { tool: "CAMERA_ORBIT", label: "Rotar Cámara", icon: "🔄" },
];

export default function Toolbar() {
  const activeTool = useStore((s) => s.activeTool);
  const setActiveTool = useStore((s) => s.setActiveTool);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 bg-gray-900/90 backdrop-blur rounded-2xl p-1.5 shadow-2xl border border-gray-700">
      {TOOLS.map(({ tool, label, icon }) => (
        <button
          key={tool}
          onClick={() => setActiveTool(tool)}
          className={`flex flex-col items-center justify-center min-w-[56px] px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTool === tool
              ? "bg-blue-600 text-white shadow-lg scale-105"
              : "text-gray-300 hover:bg-gray-700/60"
          }`}
          title={label}
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className="mt-0.5 hidden sm:block text-[10px]">{label}</span>
        </button>
      ))}
    </div>
  );
}
