"use client";

import dynamic from "next/dynamic";
import Toolbar from "@/components/ui/Toolbar";
import SettingsSidebar from "@/components/ui/SettingsSidebar";
import { useStore } from "@/store/useStore";

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

  return (
    <main className="relative w-full h-screen">
      <SettingsSidebar />

      {/* 3D Canvas – fills the viewport */}
      <div className="absolute inset-0 md:left-[360px]">
        <Scene />
      </div>

      {/* Quick tool strip */}
      <Toolbar />

      {/* Status bar */}
      <div className="fixed top-3 right-3 z-50 bg-gray-900/85 backdrop-blur rounded-full px-4 py-1.5 text-xs text-gray-300 border border-gray-700 flex gap-3">
        <span>{TOOL_LABELS[activeTool]}</span>
        <span className="text-gray-500">|</span>
        <span>{count} piezas</span>
      </div>
    </main>
  );
}
