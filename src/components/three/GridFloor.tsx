"use client";

import { useStore } from "@/store/useStore";
import { ThreeEvent } from "@react-three/fiber";
import { useCallback } from "react";

/**
 * A large grid on Y=0 that serves as the starting build surface.
 * Clicking it in ADD mode places a voxel at the clicked position snapped to the grid.
 */
export function GridFloor() {
  const activeTool = useStore((s) => s.activeTool);
  const addVoxel = useStore((s) => s.addVoxel);
  const tileSize = useStore((s) => s.tileSize);
  const setPreviewPosition = useStore((s) => s.setPreviewPosition);

  const snapToFloor = useCallback(
    (pointX: number, pointZ: number): [number, number, number] => {
      const x = Math.round(pointX / tileSize[0]) * tileSize[0];
      const z = Math.round(pointZ / tileSize[2]) * tileSize[2];
      const y = tileSize[1] / 2;
      return [x, y, z];
    },
    [tileSize]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (activeTool !== "ADD") return;
      e.stopPropagation();

      const nextPosition = snapToFloor(e.point.x, e.point.z);
      addVoxel(nextPosition);
    },
    [activeTool, addVoxel, snapToFloor]
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (activeTool !== "ADD") return;
      e.stopPropagation();
      setPreviewPosition(snapToFloor(e.point.x, e.point.z));
    },
    [activeTool, setPreviewPosition, snapToFloor]
  );

  const handlePointerOut = useCallback(() => {
    setPreviewPosition(null);
  }, [setPreviewPosition]);

  const planeScale = 160;
  const planeY = -0.001;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, planeY, 0]} receiveShadow>
        <planeGeometry args={[planeScale, planeScale]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0} />
      </mesh>

      <gridHelper
        args={[planeScale, planeScale, "#5f6677", "#4c5363"]}
        position={[0, 0.002, 0]}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        receiveShadow
      >
        <planeGeometry args={[planeScale, planeScale]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

    </group>
  );
}
