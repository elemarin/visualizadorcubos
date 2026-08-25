"use client";

import { ChangeEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { FavoriteColor } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PickerMode = "tile" | "grout" | null;

interface ColorPickerDialogProps {
  mode: PickerMode;
  color: string;
  favorites: FavoriteColor[];
  onClose: () => void;
  onSave: (color: string) => void;
  onAddFavorite: (color: string, name: string) => void;
  onRemoveFavorite: (color: string) => void;
}

function pixelColor(image: HTMLImageElement, x: number, y: number) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0);
  const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function ColorPickerDialog({
  mode,
  color,
  favorites,
  onClose,
  onSave,
  onAddFavorite,
  onRemoveFavorite,
}: ColorPickerDialogProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [tempColor, setTempColor] = useState(color);
  const [favoriteName, setFavoriteName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [magnifier, setMagnifier] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (mode) {
      setTempColor(color);
      setFavoriteName("");
      setImageUrl(null);
      setMagnifier(null);
    }
  }, [color, mode]);

  const sampleImage = useCallback((event: PointerEvent<HTMLImageElement>, selectColor: boolean) => {
    const image = imageRef.current;
    if (!image) return;
    const rect = image.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    setMagnifier({ x, y, width: rect.width, height: rect.height });

    if (selectColor && image.naturalWidth && image.naturalHeight) {
      const sampled = pixelColor(
        image,
        Math.min(image.naturalWidth - 1, Math.floor((x / rect.width) * image.naturalWidth)),
        Math.min(image.naturalHeight - 1, Math.floor((y / rect.height) * image.naturalHeight))
      );
      if (sampled) setTempColor(sampled);
    }
  }, []);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const title = mode === "tile" ? "Selector de color: Tile" : "Selector de color: Fragua";

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto p-4 sm:max-w-2xl"
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Elige un color y presiona Guardar para aplicarlo.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-md border">
            <SketchPicker color={tempColor} onChange={(next: ColorResult) => setTempColor(next.hex)} disableAlpha width="100%" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tomar color de una imagen</label>
            <Input type="file" accept="image/*" onChange={handleUpload} />
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-md border bg-muted">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Imagen para seleccionar un color"
                  className="max-h-70 w-full cursor-crosshair object-contain"
                  onPointerMove={(event) => sampleImage(event, false)}
                  onPointerLeave={() => setMagnifier(null)}
                  onPointerUp={(event) => sampleImage(event, true)}
                />
                {magnifier ? (
                  <div
                    className="pointer-events-none absolute size-24 rounded-full border-2 border-white shadow-lg"
                    style={{
                      left: magnifier.x - 48,
                      top: magnifier.y - 48,
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: `${-(magnifier.x * 2 - 48)}px ${-(magnifier.y * 2 - 48)}px`,
                      backgroundSize: `${magnifier.width * 2}px ${magnifier.height * 2}px`,
                    }}
                  />
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sube una imagen y toca un punto para seleccionar su color.</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="min-w-45 flex-1">
              <label className="text-sm font-medium" htmlFor="favorite-name">Nombre del favorito</label>
              <Input
                id="favorite-name"
                className="mt-1"
                placeholder="Ej. Azul cocina"
                value={favoriteName}
                onChange={(event) => setFavoriteName(event.target.value)}
              />
            </div>
            <Button onClick={() => onAddFavorite(tempColor, favoriteName)}>Añadir favorito</Button>
          </div>
          {favorites.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin favoritos en esta categoría.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {favorites.map((favorite) => (
                <div key={favorite.color} className="flex items-center gap-2 rounded-md border p-1.5">
                  <button
                    className="size-8 shrink-0 rounded border"
                    style={{ backgroundColor: favorite.color }}
                    onClick={() => setTempColor(favorite.color)}
                    aria-label={`Seleccionar ${favorite.name}`}
                    title={favorite.color}
                  />
                  <span className="min-w-0 flex-1 truncate text-xs">{favorite.name}</span>
                  <button
                    className="rounded px-1 text-sm text-muted-foreground hover:bg-muted"
                    onClick={() => onRemoveFavorite(favorite.color)}
                    aria-label={`Eliminar ${favorite.name}`}
                    title="Eliminar favorito"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancelar</Button>
          <Button onClick={() => onSave(tempColor)}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
