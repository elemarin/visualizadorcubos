"use client";

import { useCallback, useState } from "react";
import { useStore, Tool } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColorPickerDialog } from "@/components/ui/ColorPickerDialog";

type PickerMode = "tile" | "grout" | null;

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
  const activeColor = useStore((s) => s.activeColor);
  const setActiveColor = useStore((s) => s.setActiveColor);
  const groutColor = useStore((s) => s.groutColor);
  const setGroutColor = useStore((s) => s.setGroutColor);
  const tileFavoriteColors = useStore((s) => s.tileFavoriteColors);
  const groutFavoriteColors = useStore((s) => s.groutFavoriteColors);
  const addTileFavoriteColor = useStore((s) => s.addTileFavoriteColor);
  const addGroutFavoriteColor = useStore((s) => s.addGroutFavoriteColor);
  const removeTileFavoriteColor = useStore((s) => s.removeTileFavoriteColor);
  const removeGroutFavoriteColor = useStore((s) => s.removeGroutFavoriteColor);

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempColor, setTempColor] = useState("#ffffff");
  const activeFavorites = pickerMode === "tile" ? tileFavoriteColors : pickerMode === "grout" ? groutFavoriteColors : [];

  const handleToolClick = useCallback(
    (tool: Tool) => {
      if (tool === "PAINT_TILE") {
        setTempColor(activeColor);
        setPickerMode("tile");
        return;
      }

      if (tool === "PAINT_GROUT") {
        setTempColor(groutColor);
        setPickerMode("grout");
        return;
      }

      setActiveTool(tool);
    },
    [activeColor, groutColor, setActiveTool]
  );

  const handleSavePicker = useCallback((color: string) => {
    if (pickerMode === "tile") {
      setActiveColor(color);
      setActiveTool("PAINT_TILE");
    }

    if (pickerMode === "grout") {
      setGroutColor(color);
      setActiveTool("PAINT_GROUT");
    }

    setPickerMode(null);
  }, [pickerMode, setActiveColor, setActiveTool, setGroutColor]);

  return (
    <>
      <div className="fixed right-4 bottom-4 left-4 z-50 flex max-w-max gap-1 overflow-x-auto rounded-2xl border bg-background/85 p-1.5 shadow-2xl backdrop-blur-xl sm:right-auto sm:left-1/2 sm:-translate-x-1/2">
        {TOOLS.map(({ tool, label, icon }) => (
          <Button
            key={tool}
            onClick={() => handleToolClick(tool)}
            variant={activeTool === tool ? "default" : "ghost"}
            className={cn(
              "flex min-w-14 shrink-0 flex-col items-center justify-center rounded-xl px-2 py-1.5 text-xs",
              activeTool === tool && "shadow-md"
            )}
            title={label}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="mt-0.5 hidden text-[10px] sm:block">{label}</span>
          </Button>
        ))}
      </div>

      <ColorPickerDialog
        mode={pickerMode}
        color={tempColor}
        favorites={activeFavorites}
        onClose={() => setPickerMode(null)}
        onSave={handleSavePicker}
        onAddFavorite={(color, name) => {
          if (pickerMode === "tile") addTileFavoriteColor(color, name);
          else if (pickerMode === "grout") addGroutFavoriteColor(color, name);
        }}
        onRemoveFavorite={(color) => {
          if (pickerMode === "tile") removeTileFavoriteColor(color);
          else if (pickerMode === "grout") removeGroutFavoriteColor(color);
        }}
      />
    </>
  );
}
