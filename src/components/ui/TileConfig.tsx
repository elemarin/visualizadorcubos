"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

/**
 * Small floating panel to configure the tile size globally.
 */
export default function TileConfig() {
  const tileSize = useStore((s) => s.tileSize);
  const setTileSize = useStore((s) => s.setTileSize);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-16 left-4 z-50">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-10 h-10 rounded-full bg-gray-900/90 backdrop-blur text-white flex items-center justify-center shadow-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
        title="Tamaño de pieza"
      >
        📐
      </button>

      {isOpen && (
        <div className="mt-2 w-56 bg-gray-900/95 backdrop-blur rounded-xl p-4 shadow-2xl border border-gray-700 text-white">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Tamaño de Pieza
          </h3>

          {/* Presets */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTileSize([1, 1, 1])}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                tileSize.join(",") === "1,1,1"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Cuadrado
            </button>
            <button
              onClick={() => setTileSize([2, 1, 1])}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                tileSize.join(",") === "2,1,1"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Subway
            </button>
            <button
              onClick={() => setTileSize([1, 1, 2])}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                tileSize.join(",") === "1,1,2"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Largo
            </button>
          </div>

          {/* Custom inputs */}
          <div className="grid grid-cols-3 gap-2">
            {(["X", "Y", "Z"] as const).map((axis, i) => (
              <div key={axis}>
                <label className="text-[10px] text-gray-400 block mb-1">
                  {axis}
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={tileSize[i]}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 1;
                    const newSize: [number, number, number] = [...tileSize];
                    newSize[i] = val;
                    setTileSize(newSize);
                  }}
                  className="w-full text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-center text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-500 mt-2 italic">
            Actual: {tileSize[0]} × {tileSize[1]} × {tileSize[2]}
          </p>
        </div>
      )}
    </div>
  );
}
