"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";

export default function ColorPicker() {
  const activeColor = useStore((s) => s.activeColor);
  const setActiveColor = useStore((s) => s.setActiveColor);
  const groutGap = useStore((s) => s.groutGap);
  const setGroutGap = useStore((s) => s.setGroutGap);
  const favoriteColors = useStore((s) => s.favoriteColors);
  const addFavoriteColor = useStore((s) => s.addFavoriteColor);
  const removeFavoriteColor = useStore((s) => s.removeFavoriteColor);

  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState("#ffffff");

  const handleAddFavorite = useCallback(() => {
    addFavoriteColor(customColor);
  }, [addFavoriteColor, customColor]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
        style={{ backgroundColor: activeColor }}
        title="Colores"
      />

      {isOpen && (
        <div className="mt-2 w-64 bg-gray-900/95 backdrop-blur rounded-xl p-4 shadow-2xl border border-gray-700 text-white">
          {/* Active tile color */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Color de Pieza
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <span className="text-xs text-gray-300 font-mono">
              {activeColor}
            </span>
          </div>

          {/* Grout color */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Separación de Fragua
          </h3>
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.005}
              value={groutGap}
              onChange={(e) => setGroutGap(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-300 font-mono">{Math.round(groutGap * 100)}%</span>
          </div>

          {/* Favorite palette */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Paleta Favoritos
          </h3>
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {favoriteColors.map((color) => (
              <button
                key={color}
                onClick={() => setActiveColor(color)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  removeFavoriteColor(color);
                }}
                className={`w-8 h-8 rounded-md border-2 transition-transform hover:scale-110 ${
                  activeColor === color
                    ? "border-white scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                title={`${color} (clic derecho para eliminar)`}
              />
            ))}
          </div>

          {/* Add custom color */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <button
              onClick={handleAddFavorite}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + Añadir a favoritos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
