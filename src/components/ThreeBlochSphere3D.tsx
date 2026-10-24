import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { QuantumState } from '../types/quantum';
import { 
  Rotate3d, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  Sliders, 
  Compass,
  Zap
} from 'lucide-react';

interface ThreeBlochSphere3DProps {
  numQubits: number;
  qstate: QuantumState | null;
  activeQubit?: number;
  onSelectQubit?: (q: number) => void;
  height?: number;
}

export const ThreeBlochSphere3D: React.FC<ThreeBlochSphere3DProps> = ({
  numQubits,
  qstate,
  activeQubit: propActiveQubit = 0,
  onSelectQubit,
  height = 360
}) => {
  const [selectedQubit, setSelectedQubit] = useState<number>(propActiveQubit);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const sphereGroupRef = useRef<THREE.Group | null>(null);
  
  // History of vectors for trajectory
  const trajectoryPointsRef = useRef<THREE.Vector3[]>([]);

  // Update selected qubit if prop changes
  useEffect(() => {
    setSelectedQubit(propActiveQubit);
  }, [propActiveQubit]);

  const bv = qstate ? qstate.blochVector(selectedQubit) : { x: 0, y: 0, z: 1 };
  const theta = Math.acos(Math.max(-1, Math.min(1, bv.z)));
  const phi = Math.atan2(bv.y, bv.x);
  const thetaDeg = Math.round((theta * 180) / Math.PI);
  const phiDeg = Math.round((phi * 180) / Math.PI);
  const p0 = Math.round(Math.pow(Math.cos(theta / 2), 2) * 100);
  const p1 = Math.round(Math.pow(Math.sin(theta / 2), 2) * 100);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const h = height;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(2.8, 2.2, 3.2);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 2.5); // Cyan
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 1.8); // Indigo
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // 5. Sphere Group (allows user drag rotation)
    const sphereGroup = new THREE.Group();
    sphereGroupRef.current = sphereGroup;
    scene.add(sphereGroup);

    // Translucent Sphere Shell
    const sphereGeom = new THREE.SphereGeometry(1.2, 36, 36);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 0.9,
      transmission: 0.4
    });
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    sphereGroup.add(sphereMesh);

    // Wireframe Cage
    const wireframeGeom = new THREE.WireframeGeometry(new THREE.SphereGeometry(1.205, 18, 18));
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.15
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeom, wireframeMat);
    sphereGroup.add(wireframeMesh);

    // Equator Ring (XY plane)
    const equatorGeom = new THREE.BufferGeometry();
    const equatorPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      equatorPts.push(new THREE.Vector3(Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2));
    }
    equatorGeom.setFromPoints(equatorPts);
    const equatorLine = new THREE.Line(
      equatorGeom, 
      new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5, linewidth: 2 })
    );
    sphereGroup.add(equatorLine);

    // Meridian Rings (XZ and YZ planes)
    const meridianGeom1 = new THREE.BufferGeometry();
    const meridianPts1: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      meridianPts1.push(new THREE.Vector3(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0));
    }
    meridianGeom1.setFromPoints(meridianPts1);
    const meridianLine1 = new THREE.Line(
      meridianGeom1, 
      new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.35 })
    );
    sphereGroup.add(meridianLine1);

    // Coordinate Axes (X = red/amber, Y = green/indigo, Z = cyan)
    // Three.js coordinates: Y is UP in Three.js!
    // In Quantum Bloch convention: Z is UP (|0> is +Z, |1> is -Z).
    // So we map Quantum Z -> Three.js Y, Quantum X -> Three.js X, Quantum Y -> Three.js Z.
    const axisMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.6 });
    
    // Z axis (North/South, mapped to Three.js Y)
    const zGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1.6, 0), new THREE.Vector3(0, 1.6, 0)]);
    sphereGroup.add(new THREE.Line(zGeom, axisMat));

    // X axis (mapped to Three.js X)
    const xGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(1.6, 0, 0)]);
    sphereGroup.add(new THREE.Line(xGeom, axisMat));

    // Y axis (mapped to Three.js Z)
    const yGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -1.6), new THREE.Vector3(0, 0, 1.6)]);
    sphereGroup.add(new THREE.Line(yGeom, axisMat));

    // Pole Text Sprites
    const createTextSprite = (text: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.6, 0.3, 1);
      return sprite;
    };

    // North Pole |0>
    const sprite0 = createTextSprite('|0⟩', '#38bdf8');
    sprite0.position.set(0, 1.75, 0);
    sphereGroup.add(sprite0);

    // South Pole |1>
    const sprite1 = createTextSprite('|1⟩', '#f43f5e');
    sprite1.position.set(0, -1.75, 0);
    sphereGroup.add(sprite1);

    // +X Pole |+>
    const spritePlus = createTextSprite('|+⟩', '#34d399');
    spritePlus.position.set(1.75, 0, 0);
    sphereGroup.add(spritePlus);

    // -X Pole |->
    const spriteMinus = createTextSprite('|−⟩', '#fbbf24');
    spriteMinus.position.set(-1.75, 0, 0);
    sphereGroup.add(spriteMinus);

    // +Y Pole |i>
    const spriteI = createTextSprite('|+i⟩', '#a855f7');
    spriteI.position.set(0, 0, 1.75);
    sphereGroup.add(spriteI);

    // -Y Pole |-i>
    const spriteMinusI = createTextSprite('|−i⟩', '#c084fc');
    spriteMinusI.position.set(0, 0, -1.75);
    sphereGroup.add(spriteMinusI);

    // 6. State Vector Arrow
    // Mapping: Bloch (x, y, z) -> Three.js (x, z, y) where z is UP (Three.js Y)
    const initialDir = new THREE.Vector3(0, 1, 0);
    const arrow = new THREE.ArrowHelper(initialDir, new THREE.Vector3(0, 0, 0), 1.2, 0x00f0ff, 0.25, 0.15);
    arrowRef.current = arrow;
    sphereGroup.add(arrow);

    // 7. Interactive Orbit (Pointer Drag)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphereGroup.rotation.y += deltaX * 0.008;
      sphereGroup.rotation.x += deltaY * 0.008;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // 8. Animation Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        sphereGroup.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries) return;
      for (const entry of entries) {
        if (!entry || !entry.contentRect) continue;
        const newW = entry.contentRect.width;
        if (newW > 0) {
          camera.aspect = newW / h;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [height]);

  // Update State Vector Arrow when Bloch Vector changes
  useEffect(() => {
    if (!arrowRef.current) return;

    // Mapping: Bloch (x, y, z) -> Three.js (x, z, y)
    // Z is UP (Three.js Y), X is X, Y is Z
    const targetDir = new THREE.Vector3(bv.x, bv.z, bv.y);
    const length = Math.min(1.2, Math.max(0.1, targetDir.length() * 1.2));
    
    if (targetDir.length() > 0.001) {
      targetDir.normalize();
      arrowRef.current.setDirection(targetDir);
      arrowRef.current.setLength(length, 0.25, 0.15);
    }

    // Trajectory tracking
    const targetEndpoint = targetDir.clone().multiplyScalar(length);
    trajectoryPointsRef.current.push(targetEndpoint);
    if (trajectoryPointsRef.current.length > 40) {
      trajectoryPointsRef.current.shift();
    }

    // Update trajectory line
    if (sphereGroupRef.current && showTrajectory) {
      if (trajectoryLineRef.current) {
        sphereGroupRef.current.remove(trajectoryLineRef.current);
      }
      if (trajectoryPointsRef.current.length > 1) {
        const geom = new THREE.BufferGeometry().setFromPoints(trajectoryPointsRef.current);
        const mat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.7,
          linewidth: 2
        });
        const line = new THREE.Line(geom, mat);
        trajectoryLineRef.current = line;
        sphereGroupRef.current.add(line);
      }
    }
  }, [bv.x, bv.y, bv.z, showTrajectory]);

  const handleSelectQubit = (q: number) => {
    setSelectedQubit(q);
    trajectoryPointsRef.current = [];
    if (onSelectQubit) onSelectQubit(q);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#06080e] via-[#090d16] to-[#04060a] p-4 text-slate-200 space-y-3 shadow-xl">
      {/* 3D Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Rotate3d className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <span>3D WebGL Bloch Sphere Studio</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                Interactive 3D
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Real-time SU(2) Statevector Orbit &amp; Trajectory Precession
            </div>
          </div>
        </div>

        {/* Qubit Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 text-[10px] px-1">Qubit:</span>
          {Array.from({ length: numQubits }).map((_, q) => (
            <button
              key={q}
              onClick={() => handleSelectQubit(q)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                selectedQubit === q
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              q{q}
            </button>
          ))}
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2 py-1 rounded border text-[11px] cursor-pointer transition-colors flex items-center gap-1 ${
              autoRotate 
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Auto Rotation"
          >
            <RefreshCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Orbit</span>
          </button>

          <button
            onClick={() => {
              trajectoryPointsRef.current = [];
              if (trajectoryLineRef.current && sphereGroupRef.current) {
                sphereGroupRef.current.remove(trajectoryLineRef.current);
              }
            }}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] cursor-pointer"
            title="Clear Trajectory Path"
          >
            Clear Path
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-[#030508]">
        {/* Three.js canvas mount point */}
        <div 
          ref={containerRef} 
          style={{ height: `${height}px` }} 
          className="w-full cursor-grab active:cursor-grabbing" 
        />

        {/* Overlay Telemetry HUD (Top Left) */}
        <div className="absolute top-3 left-3 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/90 font-mono text-xs space-y-1.5 pointer-events-none shadow-lg">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            Target Statevector |ψ⟩ (q{selectedQubit})
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div>
              <span className="text-slate-500">θ (polar): </span>
              <span className="text-white font-bold">{thetaDeg}°</span>
            </div>
            <div>
              <span className="text-slate-500">φ (phase): </span>
              <span className="text-amber-300 font-bold">{phiDeg}°</span>
            </div>
          </div>

          {/* Basis Probabilities */}
          <div className="pt-1 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-sky-400 font-bold">P(|0⟩):</span>
              <span className="text-white">{p0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-rose-400 font-bold">P(|1⟩):</span>
              <span className="text-white">{p1}%</span>
            </div>
          </div>
        </div>

        {/* Overlay Drag Hint (Bottom Right) */}
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500 flex items-center gap-1 pointer-events-none">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>Click &amp; drag to rotate 3D sphere</span>
        </div>
      </div>

      {/* State Formulation Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-1">
        <div>
          |ψ⟩ = cos(θ/2)|0⟩ + e^{`iφ`}sin(θ/2)|1⟩ = cos({(thetaDeg/2).toFixed(1)}°)|0⟩ + e^{`i(${phiDeg}°)`}sin({(thetaDeg/2).toFixed(1)}°)|1⟩
        </div>
        <div className="text-cyan-400">
          Bloch Vector: ⟨X, Y, Z⟩ = ({bv.x.toFixed(3)}, {bv.y.toFixed(3)}, {bv.z.toFixed(3)})
        </div>
      </div>
    </div>
  );
};
