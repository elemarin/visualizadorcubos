"use client";

import { useCallback, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { useStore, Tool } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempColor, setTempColor] = useState("#ffffff");

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

  const handleSavePicker = useCallback(() => {
    if (pickerMode === "tile") {
      setActiveColor(tempColor);
      setActiveTool("PAINT_TILE");
    }

    if (pickerMode === "grout") {
      setGroutColor(tempColor);
      setActiveTool("PAINT_GROUT");
    }

    setPickerMode(null);
  }, [pickerMode, setActiveColor, setActiveTool, setGroutColor, tempColor]);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-2xl border bg-background/85 p-1.5 shadow-2xl backdrop-blur-xl">
        {TOOLS.map(({ tool, label, icon }) => (
          <Button
            key={tool}
            onClick={() => handleToolClick(tool)}
            variant={activeTool === tool ? "default" : "ghost"}
            className={cn(
              "flex min-w-14 flex-col items-center justify-center rounded-xl px-2 py-1.5 text-xs",
              activeTool === tool && "shadow-md"
            )}
            title={label}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="mt-0.5 hidden text-[10px] sm:block">{label}</span>
          </Button>
        ))}
      </div>

      <Dialog
        open={pickerMode !== null}
        onOpenChange={(open) => {
          if (!open) setPickerMode(null);
        }}
      >
        <DialogContent className="max-w-95 p-4 sm:max-w-105" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-base">
              {pickerMode === "tile" ? "Selector de Color: Tile" : "Selector de Color: Fragua"}
            </DialogTitle>
            <DialogDescription>Ajusta color, luego presiona Guardar para aplicar.</DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden rounded-md border">
            <SketchPicker
              color={tempColor}
              onChange={(color: ColorResult) => setTempColor(color.hex)}
              disableAlpha
              width={"100%"}
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setPickerMode(null)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSavePicker}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
