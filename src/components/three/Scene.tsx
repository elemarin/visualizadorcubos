"use client";

import { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneContent } from "./SceneContent";

/**
 * Main 3D canvas wrapper.
 * Exposes a ref to the underlying Three.js renderer for snapshot export.
 */
export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  // Store the gl reference so we can take snapshots from outside
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  const handleCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera }) => {
      glRef.current = state.gl;
      sceneRef.current = state.scene;
      cameraRef.current = state.camera;
    },
    []
  );

  // Public method for screenshot – called from UI
  const takeScreenshot = useCallback(() => {
    const gl = glRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!gl || !scene || !camera) return;

    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `diseno-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  // Expose takeScreenshot globally so UI buttons can call it
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__takeScreenshot = takeScreenshot;
  }

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [8, 8, 8], fov: 50 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={handleCreated}
      onContextMenu={(event) => event.preventDefault()}
      style={{ background: "#9db4df" }}
    >
      <SceneContent />
    </Canvas>
  );
}
