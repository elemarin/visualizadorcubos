"use client";

import { useStore, Voxel } from "@/store/useStore";
import { SingleVoxel } from "./SingleVoxel";

/**
 * Reads the voxel array from the store and renders one SingleVoxel per entry.
 */
export function VoxelRenderer() {
  const voxels = useStore((s) => s.voxels);

  return (
    <group>
      {voxels.map((voxel: Voxel) => (
        <SingleVoxel key={voxel.id} voxel={voxel} />
      ))}
    </group>
  );
}
