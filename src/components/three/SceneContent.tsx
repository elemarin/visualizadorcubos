"use client";

import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { GridFloor } from "./GridFloor";
import { VoxelRenderer } from "./VoxelRenderer";
import { PlacementPreview } from "./PlacementPreview";

/**
 * All scene children: lights, controls, grid, voxels.
 * Separated from the Canvas so hooks like useThree work correctly.
 */
export function SceneContent() {
  const activeTool = useStore((s) => s.activeTool);
  const isCameraMode = activeTool === "CAMERA_ORBIT";

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[10, 15, 10]} intensity={0.9} castShadow />
      <directionalLight position={[-8, 10, -8]} intensity={0.35} />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        panSpeed={0.85}
        zoomSpeed={0.9}
        minDistance={2}
        maxDistance={120}
        maxPolarAngle={Math.PI * 0.49}
        target={[0, 1.5, 0]}
        enableRotate
        enablePan
        enableZoom
        mouseButtons={{
          LEFT: isCameraMode ? THREE.MOUSE.ROTATE : (-1 as THREE.MOUSE),
          MIDDLE: THREE.MOUSE.ROTATE,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: isCameraMode ? THREE.TOUCH.ROTATE : (-1 as THREE.TOUCH),
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        makeDefault
      />

      {/* Navigation helper */}
      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport />
      </GizmoHelper>

      {/* Base floor grid */}
      <GridFloor />

      {/* Voxels */}
      <VoxelRenderer />

      {/* Placement helper */}
      <PlacementPreview />
    </>
  );
}
