import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Box, Eye, Layers, Sun, Download, AlertCircle } from 'lucide-react';
import { ThreeDModelData } from '../types/ai';

interface ThreeDViewerProps {
  modelData?: ThreeDModelData;
  onExport?: (format: 'gltf' | 'obj') => void;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ modelData, onExport }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [lightingPreset, setLightingPreset] = useState<'studio' | 'dramatic' | 'ambient'>('studio');
  const [isRotating, setIsRotating] = useState(true);

  // References to three objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0f);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.2);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // 5. Grid Helper
    const grid = new THREE.GridHelper(6, 12, 0x334155, 0x1e293b);
    grid.position.y = -1.2;
    scene.add(grid);

    // 6. Mesh Group
    const group = new THREE.Group();
    scene.add(group);
    meshGroupRef.current = group;

    // Create 3D representation based on geometryType or default character/artifact
    const geomType = modelData?.geometryType || 'torus';
    const primaryColor = modelData?.color || '#38bdf8';

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(primaryColor),
      metalness: modelData?.metalness ?? 0.4,
      roughness: modelData?.roughness ?? 0.3,
      wireframe: false,
    });

    if (geomType === 'torus' || geomType === 'complex') {
      const coreGeom = new THREE.IcosahedronGeometry(0.9, 2);
      const coreMesh = new THREE.Mesh(coreGeom, material);
      group.add(coreMesh);

      const ringGeom = new THREE.TorusGeometry(1.4, 0.06, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      group.add(ringMesh);
    } else if (geomType === 'box') {
      const boxGeom = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const boxMesh = new THREE.Mesh(boxGeom, material);
      group.add(boxMesh);
    } else if (geomType === 'cylinder') {
      const cylGeom = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 32);
      const cylMesh = new THREE.Mesh(cylGeom, material);
      group.add(cylMesh);
    } else {
      const sphereGeom = new THREE.SphereGeometry(1.1, 32, 32);
      const sphereMesh = new THREE.Mesh(sphereGeom, material);
      group.add(sphereMesh);
    }

    // Interactive mouse drag orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !group) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      group.rotation.y += deltaX * 0.01;
      group.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!camera) return;
      camera.position.z = Math.max(2, Math.min(10, camera.position.z + e.deltaY * 0.005));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch events for mobile
    let prevTouchX = 0;
    let prevTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && group) {
        const deltaX = e.touches[0].clientX - prevTouchX;
        const deltaY = e.touches[0].clientY - prevTouchY;
        group.rotation.y += deltaX * 0.015;
        group.rotation.x += deltaY * 0.015;
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (group && isRotating && !isDragging) {
        group.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [modelData]);

  // Update wireframe state on meshes
  useEffect(() => {
    if (!meshGroupRef.current) return;
    meshGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => (m.wireframe = wireframe));
        } else {
          child.material.wireframe = wireframe;
        }
      }
    });
  }, [wireframe]);

  const handleReset = () => {
    if (cameraRef.current) cameraRef.current.position.set(0, 1.5, 4.5);
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const factor = direction === 'in' ? -0.8 : 0.8;
    cameraRef.current.position.z = Math.max(2, Math.min(9, cameraRef.current.position.z + factor));
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.12] bg-[#07090e] flex flex-col">
      {/* 3D Viewport Toolbar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-300">
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium text-white">{modelData?.title || 'Interactive 3D Viewport'}</span>
          <span className="text-neutral-500">·</span>
          <span className="text-[10px] text-neutral-400">{modelData?.type?.toUpperCase() || 'OBJECT'}</span>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              wireframe
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsRotating(!isRotating)}
            title="Toggle Auto-Rotate"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isRotating
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            title="Reset View"
            className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-neutral-400 hover:text-white cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Canvas Element Container */}
      <div
        ref={mountRef}
        className="w-full h-72 sm:h-96 relative cursor-grab active:cursor-grabbing select-none"
      />

      {/* Honest Provider Status Notice */}
      <div className="px-4 py-2 border-t border-white/[0.08] bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-amber-300/90">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>3D generation provider not connected — displaying real procedural Three.js mesh & geometry blueprints.</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-neutral-500">FORMATS:</span>
          <button
            onClick={() => onExport?.('gltf')}
            className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white text-[10px] cursor-pointer"
          >
            GLTF Specs
          </button>
          <button
            onClick={() => onExport?.('obj')}
            className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white text-[10px] cursor-pointer"
          >
            OBJ Data
          </button>
        </div>
      </div>
    </div>
  );
};
