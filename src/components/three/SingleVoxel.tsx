"use client";

import { useCallback, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { FaceKey, useStore, Voxel } from "@/store/useStore";

/**
 * Flood-fill helper for PAINT_FACE.
 * Given a clicked voxel, determine the face normal direction,
 * then find all contiguous voxels on the same plane sharing
 * the same axis-aligned face.
 */
function floodFillFace(
  startVoxel: Voxel,
  faceNormal: THREE.Vector3,
  allVoxels: Voxel[],
  tileSize: [number, number, number]
): [number, number, number][] {
  // Determine which axis the face belongs to
  const absX = Math.abs(faceNormal.x);
  const absY = Math.abs(faceNormal.y);
  const absZ = Math.abs(faceNormal.z);

  let fixedAxis: "x" | "y" | "z";
  if (absX > absY && absX > absZ) fixedAxis = "x";
  else if (absY > absX && absY > absZ) fixedAxis = "y";
  else fixedAxis = "z";

  const axisIndex = fixedAxis === "x" ? 0 : fixedAxis === "y" ? 1 : 2;
  const fixedValue = startVoxel.position[axisIndex];

  // Filter voxels that share the same fixed-axis value (same plane)
  const planeVoxels = allVoxels.filter(
    (v) => Math.abs(v.position[axisIndex] - fixedValue) < 0.01
  );

  // Additionally, for the face to be an exposed face, there must not be a
  // neighbor voxel in the normal direction.
  const normalDir: [number, number, number] = [0, 0, 0];
  normalDir[axisIndex] = faceNormal.x || faceNormal.y || faceNormal.z;

  const allPosSet = new Set(allVoxels.map((v) => v.position.join(",")));

  const exposedPlaneVoxels = planeVoxels.filter((v) => {
    const neighborPos: [number, number, number] = [...v.position];
    neighborPos[axisIndex] += normalDir[axisIndex] > 0 ? tileSize[axisIndex] : -tileSize[axisIndex];
    return !allPosSet.has(neighborPos.join(","));
  });

  // BFS flood-fill among exposed plane voxels via adjacency
  const exposedSet = new Set(exposedPlaneVoxels.map((v) => v.position.join(",")));
  const visited = new Set<string>();
  const result: [number, number, number][] = [];

  const queue: [number, number, number][] = [startVoxel.position];
  visited.add(startVoxel.position.join(","));

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    // Check 4 neighbors on the plane (the two non-fixed axes)
    const axes = [0, 1, 2].filter((i) => i !== axisIndex);
    for (const ax of axes) {
      for (const dir of [-1, 1]) {
        const neighbor: [number, number, number] = [...current];
        neighbor[ax] += dir * tileSize[ax];
        const key = neighbor.join(",");
        if (exposedSet.has(key) && !visited.has(key)) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }
  }

  return result;
}

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
  const paintFaceRegion = useStore((s) => s.paintFaceRegion);
  const activeColor = useStore((s) => s.activeColor);
  const groutColor = useStore((s) => s.groutColor);
  const groutGap = useStore((s) => s.groutGap);
  const tileSize = useStore((s) => s.tileSize);
  const voxels = useStore((s) => s.voxels);
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
      } else if (activeTool === "PAINT_SINGLE") {
        if (!e.face) return;
        const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld);
        const faceKey = getFaceKeyFromNormal(worldNormal);
        paintVoxelFace(voxel.id, faceKey, activeColor);
      } else if (activeTool === "PAINT_FACE") {
        if (!e.face) return;
        const normal = e.face.normal.clone();
        const worldNormal = normal.transformDirection(
          e.object.matrixWorld
        );

        const positions = floodFillFace(voxel, worldNormal, voxels, tileSize);
        const faceKey = getFaceKeyFromNormal(worldNormal);
        paintFaceRegion(faceKey, positions, activeColor);
      }
    },
    [
      activeTool,
      addVoxel,
      removeVoxel,
      paintVoxelFace,
      paintFaceRegion,
      activeColor,
      tileSize,
      voxel,
      voxels,
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
