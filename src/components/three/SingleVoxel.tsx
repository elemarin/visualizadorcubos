"use client";

import { useCallback, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { FaceKey, useStore, Voxel } from "@/store/useStore";

function getFaceKeyFromNormal(normal: THREE.Vector3): FaceKey {
  const absX = Math.abs(normal.x);
  const absY = Math.abs(normal.y);
  const absZ = Math.abs(normal.z);

  if (absX >= absY && absX >= absZ) return normal.x >= 0 ? "px" : "nx";
  if (absY >= absX && absY >= absZ) return normal.y >= 0 ? "py" : "ny";
  return normal.z >= 0 ? "pz" : "nz";
}

interface SingleVoxelProps {
  voxel: Voxel;
}

/**
 * Renders a single tile (voxel) and handles click interactions.
 */
export function SingleVoxel({ voxel }: SingleVoxelProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const activeTool = useStore((s) => s.activeTool);
  const addVoxel = useStore((s) => s.addVoxel);
  const removeVoxel = useStore((s) => s.removeVoxel);
  const paintVoxelFace = useStore((s) => s.paintVoxelFace);
  const activeColor = useStore((s) => s.activeColor);
  const groutColor = useStore((s) => s.groutColor);
  const groutGap = useStore((s) => s.groutGap);
  const tileSize = useStore((s) => s.tileSize);
  const setPreviewPosition = useStore((s) => s.setPreviewPosition);

  const getAdjacentPosition = useCallback(
    (e: ThreeEvent<MouseEvent | PointerEvent>): [number, number, number] | null => {
      if (!e.face) return null;
      const normal = e.face.normal.clone();
      const worldNormal = normal.transformDirection(e.object.matrixWorld);

      return [
        voxel.position[0] + Math.round(worldNormal.x) * tileSize[0],
        voxel.position[1] + Math.round(worldNormal.y) * tileSize[1],
        voxel.position[2] + Math.round(worldNormal.z) * tileSize[2],
      ];
    },
    [tileSize, voxel.position]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();

      if (activeTool === "CAMERA_ORBIT") return;

      if (activeTool === "ADD") {
        const newPos = getAdjacentPosition(e);
        if (!newPos) return;
        addVoxel(newPos);
      } else if (activeTool === "REMOVE") {
        removeVoxel(voxel.id);
      } else if (activeTool === "PAINT_TILE") {
        if (!e.face) return;
        const normal = e.face.normal.clone();
        const worldNormal = normal.transformDirection(
          e.object.matrixWorld
        );

        const faceKey = getFaceKeyFromNormal(worldNormal);
        paintVoxelFace(voxel.id, faceKey, activeColor);
      }
    },
    [
      activeTool,
      addVoxel,
      removeVoxel,
      paintVoxelFace,
      activeColor,
      voxel,
      getAdjacentPosition,
    ]
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (activeTool !== "ADD") return;
      e.stopPropagation();
      const nextPosition = getAdjacentPosition(e);
      if (!nextPosition) return;
      setPreviewPosition(nextPosition);
    },
    [activeTool, getAdjacentPosition, setPreviewPosition]
  );

  const handlePointerOut = useCallback(() => {
    setPreviewPosition(null);
  }, [setPreviewPosition]);

  const handleContextMenu = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      e.nativeEvent.preventDefault();
      removeVoxel(voxel.id);
    },
    [removeVoxel, voxel.id]
  );

  const gapFactor = Math.max(0.8, 1 - groutGap);
  const innerScale: [number, number, number] = [
    tileSize[0] * gapFactor,
    tileSize[1] * gapFactor,
    tileSize[2] * gapFactor,
  ];

  return (
    <group
      position={voxel.position}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={tileSize} />
        <meshStandardMaterial
          color={groutColor}
          roughness={0.95}
          metalness={0}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={innerScale} />
        <meshStandardMaterial attach="material-0" color={voxel.faceColors.px} roughness={0.78} metalness={0.02} />
        <meshStandardMaterial attach="material-1" color={voxel.faceColors.nx} roughness={0.78} metalness={0.02} />
        <meshStandardMaterial attach="material-2" color={voxel.faceColors.py} roughness={0.78} metalness={0.02} />
        <meshStandardMaterial attach="material-3" color={voxel.faceColors.ny} roughness={0.78} metalness={0.02} />
        <meshStandardMaterial attach="material-4" color={voxel.faceColors.pz} roughness={0.78} metalness={0.02} />
        <meshStandardMaterial attach="material-5" color={voxel.faceColors.nz} roughness={0.78} metalness={0.02} />
      </mesh>
    </group>
  );
}
