"use client";

import { ChangeEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
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

const HEX_COLOR = /^#[\da-f]{6}$/i;
const MAX_IMAGE_DIMENSION = 2048;

function pixelColor(canvas: HTMLCanvasElement, x: number, y: number) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

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
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tempColor, setTempColor] = useState(color);
  const [hexValue, setHexValue] = useState(color);
  const [favoriteName, setFavoriteName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (mode) {
      setTempColor(color);
      setHexValue(color);
      setFavoriteName("");
      setImageUrl(null);
      imageCanvasRef.current = null;
    }
  }, [color, mode]);

  const prepareImageCanvas = useCallback(() => {
    const image = imageRef.current;
    if (!image) return;
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.floor(image.naturalHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    imageCanvasRef.current = canvas;
  }, []);

  const sampleImage = useCallback((event: PointerEvent<HTMLImageElement>) => {
    const image = imageRef.current;
    const canvas = imageCanvasRef.current;
    if (!image || !canvas) return;
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height)));
    const sampled = pixelColor(canvas, x, y);
    if (sampled) {
      setTempColor(sampled);
      setHexValue(sampled);
    }
  }, []);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    imageCanvasRef.current = null;
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

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-md border p-3">
            <label className="text-sm font-medium" htmlFor="color-picker">Color</label>
            <div className="flex items-center gap-3">
              <input
                id="color-picker"
                type="color"
                value={tempColor}
                onChange={(event) => {
                  setTempColor(event.target.value);
                  setHexValue(event.target.value);
                }}
                className="h-12 w-16 shrink-0 rounded-md border p-1"
                aria-label="Seleccionar color"
              />
              <Input
                value={hexValue}
                onChange={(event) => {
                  const value = event.target.value;
                  setHexValue(value);
                  if (HEX_COLOR.test(value)) setTempColor(value.toLowerCase());
                }}
                inputMode="text"
                autoCapitalize="none"
                autoCorrect="off"
                maxLength={7}
                aria-label="Código hexadecimal del color"
              />
            </div>
            <p className="text-xs text-muted-foreground">Usa el selector o escribe un color hexadecimal.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tomar color de una imagen</label>
            <Input type="file" accept="image/*" capture="environment" onChange={handleUpload} />
            {imageUrl ? (
              <div className="overflow-hidden rounded-md border bg-muted">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Imagen para seleccionar un color"
                  className="max-h-64 w-full cursor-crosshair touch-manipulation object-contain"
                  onLoad={prepareImageCanvas}
                  onPointerDown={sampleImage}
                />
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
                    className="size-11 shrink-0 rounded border"
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
