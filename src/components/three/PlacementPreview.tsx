"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";

export function PlacementPreview() {
  const activeTool = useStore((s) => s.activeTool);
  const previewPosition = useStore((s) => s.previewPosition);
  const tileSize = useStore((s) => s.tileSize);
  const groutGap = useStore((s) => s.groutGap);
  const voxels = useStore((s) => s.voxels);
  const activeColor = useStore((s) => s.activeColor);

  const occupied = useMemo(() => {
    if (!previewPosition) return false;
    return voxels.some(
      (voxel) =>
        voxel.position[0] === previewPosition[0] &&
        voxel.position[1] === previewPosition[1] &&
        voxel.position[2] === previewPosition[2]
    );
  }, [previewPosition, voxels]);

  if (activeTool !== "ADD" || !previewPosition) return null;

  const gapFactor = Math.max(0.8, 1 - groutGap);

  return (
    <mesh position={previewPosition} renderOrder={2}>
      <boxGeometry args={[tileSize[0] * gapFactor, tileSize[1] * gapFactor, tileSize[2] * gapFactor]} />
      <meshStandardMaterial
        color={occupied ? "#ef4444" : activeColor}
        transparent
        opacity={occupied ? 0.2 : 0.35}
        depthWrite={false}
      />
    </mesh>
  );
}
