import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Rotate3d, 
  Layers, 
  Atom, 
  Zap, 
  Eye, 
  Flame, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  Compass,
  Play,
  Pause,
  Shield,
  Activity
} from 'lucide-react';
import { playGateClickSound } from '../utils/audio';

export type DashboardVisualMode = 'cryo' | 'qsphere' | 'lattice';
export type VisualFilter = 'gold' | 'thermal' | 'xray' | 'wireframe';

// ============================================================================
// 1. 3D CRYO REFRIGERATOR & QPU CORE (SHIELD INTACT IN CUTAWAY / SEPARATE MODES)
// ============================================================================
export interface CryoModelProps {
  filter: VisualFilter;
  autoRotate: boolean;
  rotationSpeed: number;
}

export const CryoChandelierScene: React.FC<CryoModelProps> = ({ filter, autoRotate, rotationSpeed }) => {
  const groupRef = useRef<THREE.Group>(null);
  const qpuAuraRef = useRef<THREE.Mesh>(null);
  const blochRingRef = useRef<THREE.Group>(null);
  const pulsesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.45 * rotationSpeed;
    }
    if (qpuAuraRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.8) * 0.08;
      qpuAuraRef.current.scale.set(s, s, s);
    }
    if (blochRingRef.current) {
      blochRingRef.current.rotation.y += delta * 1.2;
      blochRingRef.current.rotation.z += delta * 0.6;
    }
    if (pulsesRef.current) {
      pulsesRef.current.children.forEach((child, i) => {
        child.position.y -= delta * (1.2 + i * 0.2);
        if (child.position.y < -1.4) {
          child.position.y = 1.6;
        }
      });
    }
  });

  // Material palettes based on visual filter
  const plateMaterial = useMemo(() => {
    if (filter === 'thermal') {
      return new THREE.MeshStandardMaterial({
        color: '#ff4d4d',
        roughness: 0.3,
        metalness: 0.8,
        emissive: '#800000',
        emissiveIntensity: 0.3
      });
    }
    if (filter === 'xray') {
      return new THREE.MeshStandardMaterial({
        color: '#00e5ff',
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.6,
        wireframe: false
      });
    }
    if (filter === 'wireframe') {
      return new THREE.MeshBasicMaterial({
        color: '#00e5ff',
        wireframe: true
      });
    }
    // 'gold' standard photorealistic PBR
    return new THREE.MeshStandardMaterial({
      color: '#d6a84f',
      roughness: 0.2,
      metalness: 0.95
    });
  }, [filter]);

  const shieldMaterial = useMemo(() => {
    if (filter === 'thermal') {
      return new THREE.MeshStandardMaterial({
        color: '#3b82f6',
        roughness: 0.3,
        metalness: 0.7,
        side: THREE.DoubleSide
      });
    }
    if (filter === 'wireframe') {
      return new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        wireframe: true
      });
    }
    // High-tech aerospace vacuum enclosure with transparent inspection window
    return new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      roughness: 0.15,
      metalness: 0.85,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22
    });
  }, [filter]);

  const stages = [
    { name: '300K Flange', y: 1.6, r: 1.5, t: 0.08, color: '#94a3b8' },
    { name: '50K Thermal Plate', y: 1.1, r: 1.35, t: 0.07, color: '#cbd5e1' },
    { name: '4K Pulse Tube Plate', y: 0.5, r: 1.2, t: 0.065, color: '#d6a84f' },
    { name: 'Still 800mK Plate', y: -0.1, r: 1.05, t: 0.06, color: '#d6a84f' },
    { name: 'Cold Plate 100mK', y: -0.65, r: 0.9, t: 0.055, color: '#d6a84f' },
    { name: 'Mixing Chamber 15mK', y: -1.2, r: 0.75, t: 0.07, color: '#f59e0b' }
  ];

  return (
    <group ref={groupRef}>
      {/* 1. Thermal Stage Plates */}
      {stages.map((st, i) => (
        <group key={i} position={[0, st.y, 0]}>
          <mesh material={filter === 'gold' && i < 2 ? new THREE.MeshStandardMaterial({ color: st.color, metalness: 0.85, roughness: 0.3 }) : plateMaterial}>
            <cylinderGeometry args={[st.r, st.r, st.t, 48]} />
          </mesh>
          {/* Gold rim accent ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[st.r + 0.02, 0.015, 12, 48]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* 2. Vertical Structural Support Posts (Titanium / OFHC Copper) */}
      {[0, 1, 2, 3, 4, 5].map(idx => {
        const angle = (idx * Math.PI) / 3;
        const rad = 0.65;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        return (
          <mesh key={idx} position={[x, 0.2, z]}>
            <cylinderGeometry args={[0.02, 0.02, 2.7, 16]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}

      {/* 3. RF Semi-Rigid Coaxial Cables (NbTi & OFHC Cu SMA bundles) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => {
        const angle = (idx * Math.PI) / 4 + 0.15;
        const rad = 0.52;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        return (
          <group key={idx} position={[x, 0.2, z]}>
            <mesh>
              <cylinderGeometry args={[0.012, 0.012, 2.7, 12]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#38bdf8' : '#e2e8f0'} metalness={0.9} roughness={0.15} />
            </mesh>
            {/* SMA Gold Barrel Connectors at stages */}
            {[-1.2, -0.65, -0.1, 0.5, 1.1].map((cy, cIdx) => (
              <mesh key={cIdx} position={[0, cy - 0.2, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.045, 12]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* 4. Active Traveling Microwave Pulses */}
      <group ref={pulsesRef}>
        {[0, 1, 2, 3, 4, 5].map(i => {
          const angle = (i * Math.PI) / 3 + 0.15;
          const x = Math.cos(angle) * 0.52;
          const z = Math.sin(angle) * 0.52;
          return (
            <mesh key={i} position={[x, 1.2 - i * 0.4, z]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color="#00e5ff" />
            </mesh>
          );
        })}
      </group>

      {/* 5. Sub-Kelvin QPU Core at 15 mK Mixing Chamber */}
      <group position={[0, -1.48, 0]}>
        {/* Gold Coldfinger Mounting Block */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.18, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.12} />
        </mesh>

        {/* Superconducting Chip Die (Silicon / Sapphire Substrate) */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.32, 0.02, 0.32]} />
          <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* 5 Transmon Qubit Crosses (Josephson Junctions) */}
        {[-0.08, 0, 0.08].map(cx =>
          [-0.08, 0, 0.08].map(cz => {
            if (cx !== 0 && cz !== 0) return null; // Cross formation
            return (
              <group key={`${cx}-${cz}`} position={[cx, -0.028, cz]}>
                <mesh>
                  <boxGeometry args={[0.03, 0.005, 0.008]} />
                  <meshBasicMaterial color="#00e5ff" />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.008, 0.005, 0.03]} />
                  <meshBasicMaterial color="#00e5ff" />
                </mesh>
              </group>
            );
          })
        )}

        {/* Quantum Breathing Coherence Aura */}
        <mesh ref={qpuAuraRef} position={[0, 0, 0]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.22} wireframe={filter === 'wireframe'} />
        </mesh>

        {/* Rotating Bloch Sphere Precession Rings */}
        <group ref={blochRingRef}>
          <mesh>
            <torusGeometry args={[0.48, 0.006, 12, 48]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.48, 0.006, 12, 48]} />
            <meshBasicMaterial color="#c084fc" transparent opacity={0.6} />
          </mesh>
        </group>

        {/* Mu-Metal Bottom Magnetic Shield Canister with 180° Cutaway Window */}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.35, 32, 1, true, 0, Math.PI * 1.35]} />
          <primitive object={shieldMaterial} attach="material" />
        </mesh>
      </group>

      {/* 6. Multi-Layer Thermal Shield Canister (SHIELD INTACT - 180° Cutaway for Viewing) */}
      <group position={[0, 0.1, 0]} rotation={[0, Math.PI * 0.9, 0]}>
        {/* Outer Vacuum Chamber (OVC) with front-facing inspection window */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.56, 1.56, 3.1, 48, 1, true, 0, Math.PI * 1.05]} />
          <primitive object={shieldMaterial} attach="material" />
        </mesh>

        {/* Top Vacuum Flange Collar */}
        <mesh position={[0, 1.55, 0]}>
          <torusGeometry args={[1.56, 0.04, 16, 48, Math.PI * 1.25]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Bottom Can Dome */}
        <mesh position={[0, -1.55, 0]}>
          <cylinderGeometry args={[1.56, 1.2, 0.15, 32, 1, false, 0, Math.PI * 1.25]} />
          <primitive object={shieldMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
};

// ============================================================================
// 2. 3D MULTI-QUBIT Q-SPHERE & ENTANGLEMENT NEXUS
// ============================================================================
export const QSphereScene: React.FC<{ autoRotate: boolean; rotationSpeed: number }> = ({ autoRotate, rotationSpeed }) => {
  const sphereGroupRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (sphereGroupRef.current && autoRotate) {
      sphereGroupRef.current.rotation.y += delta * 0.35 * rotationSpeed;
      sphereGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y -= delta * 0.2 * rotationSpeed;
    }
  });

  // Statevectors for 3-qubit basis states |000> to |111>
  const basisStates = useMemo(() => {
    const states = [];
    const labels = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
    const r = 1.6;
    for (let i = 0; i < 8; i++) {
      const theta = ((i + 0.5) / 8) * Math.PI; // latitude
      const phi = (i * 0.75) * Math.PI; // longitude
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);
      const prob = i === 0 || i === 7 ? 0.707 : 0.15; // GHZ state weighting
      states.push({ label: labels[i], pos: [x, y, z] as [number, number, number], prob });
    }
    return states;
  }, []);

  // Entanglement connecting lines
  const linePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    basisStates.forEach((s1, i) => {
      basisStates.forEach((s2, j) => {
        if (i < j && (i === 0 || j === 7)) {
          pts.push(new THREE.Vector3(...s1.pos));
          pts.push(new THREE.Vector3(...s2.pos));
        }
      });
    });
    return pts;
  }, [basisStates]);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(linePoints);
    return geom;
  }, [linePoints]);

  return (
    <group ref={sphereGroupRef}>
      {/* Central Translucent Q-Sphere Body */}
      <mesh>
        <sphereGeometry args={[1.58, 36, 36]} />
        <meshStandardMaterial
          color="#041226"
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.35}
          wireframe={false}
        />
      </mesh>

      {/* Coordinate Latitudes & Longitudes */}
      <mesh>
        <sphereGeometry args={[1.6, 24, 24]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.18} />
      </mesh>

      {/* Equatorial Bloch Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.015, 12, 64]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>

      {/* Meridian Bloch Ring */}
      <mesh>
        <torusGeometry args={[1.6, 0.012, 12, 64]} />
        <meshBasicMaterial color="#c084fc" />
      </mesh>

      {/* Entanglement Line Web */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.55} />
      </lineSegments>

      {/* Statevector Nodes & Probability Spheres */}
      {basisStates.map((st, i) => (
        <group key={i} position={st.pos}>
          {/* Ray line from origin to node */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={self => {
                self.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(...st.pos).negate()]);
              }}
            />
            <lineBasicMaterial color="#00e5ff" transparent opacity={0.25} />
          </line>

          {/* Probability amplitude bubble */}
          <mesh>
            <sphereGeometry args={[0.07 + st.prob * 0.12, 16, 16]} />
            <meshStandardMaterial
              color={st.prob > 0.5 ? '#00e5ff' : '#a855f7'}
              emissive={st.prob > 0.5 ? '#00e5ff' : '#9333ea'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Ambient Quantum Superposition Sparks */}
      <points ref={cloudRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <pointsMaterial size={0.025} color="#38bdf8" transparent opacity={0.4} />
      </points>
    </group>
  );
};

// ============================================================================
// 3. 3D HEAVY-HEX SUPERCONDUCTING QPU CHIP LATTICE
// ============================================================================
export const HeavyHexLatticeScene: React.FC<{ autoRotate: boolean; rotationSpeed: number }> = ({ autoRotate, rotationSpeed }) => {
  const latticeRef = useRef<THREE.Group>(null);
  const pulseGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (latticeRef.current && autoRotate) {
      latticeRef.current.rotation.y += delta * 0.3 * rotationSpeed;
    }
    if (pulseGroupRef.current) {
      pulseGroupRef.current.children.forEach((c, i) => {
        const s = 1 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.25;
        c.scale.set(s, s, s);
      });
    }
  });

  // Generate Heavy-Hex Graph (Vertices & Couplers)
  const hexNodes = useMemo(() => {
    const nodes = [];
    const rows = 4;
    const cols = 5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2 + 0.5) * 0.8;
        const z = (r - rows / 2 + 0.5) * 0.7 + ((c % 2) * 0.35);
        const isAncilla = (r + c) % 3 === 0;
        nodes.push({ x, z, isAncilla, id: `q_${r}_${c}` });
      }
    }
    return nodes;
  }, []);

  return (
    <group ref={latticeRef} position={[0, -0.2, 0]} rotation={[0.4, 0, 0]}>
      {/* Superconducting Silicon Die Substrate */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[4.4, 0.08, 3.6]} />
        <meshStandardMaterial color="#031326" roughness={0.15} metalness={0.92} />
      </mesh>

      {/* Gold Edge Interconnect Wirebonds */}
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[4.5, 0.02, 3.7]} />
        <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* Hex Coupling Meanders */}
      {hexNodes.map((n, i) => {
        const next = hexNodes[i + 1];
        if (!next || Math.abs(next.x - n.x) > 1.2) return null;
        return (
          <line key={`line-${i}`}>
            <bufferGeometry
              attach="geometry"
              onUpdate={self => {
                self.setFromPoints([new THREE.Vector3(n.x, 0.01, n.z), new THREE.Vector3(next.x, 0.01, next.z)]);
              }}
            />
            <lineBasicMaterial color="#0284c7" linewidth={2} />
          </line>
        );
      })}

      {/* Qubit Nodes (Transmon Crosses & CPW Resonators) */}
      <group ref={pulseGroupRef}>
        {hexNodes.map((n, i) => (
          <group key={n.id} position={[n.x, 0.02, n.z]}>
            {/* Ground Plane Cutout */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
              <meshBasicMaterial color="#021f3f" />
            </mesh>

            {/* Transmon Cross Arms */}
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.16, 0.015, 0.04]} />
              <meshBasicMaterial color={n.isAncilla ? '#a855f7' : '#00e5ff'} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.04, 0.015, 0.16]} />
              <meshBasicMaterial color={n.isAncilla ? '#a855f7' : '#00e5ff'} />
            </mesh>

            {/* Glowing Josephson Junction Center */}
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.025, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// ============================================================================
// MAIN COMPONENT: DashboardQuantum3D
// ============================================================================
export const DashboardQuantum3D: React.FC = () => {
  const [visualMode, setVisualMode] = useState<DashboardVisualMode>('cryo');
  const [visualFilter, setVisualFilter] = useState<VisualFilter>('gold');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'front' | 'top' | 'macro'>('iso');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Camera settings per preset
  const cameraProps = useMemo(() => {
    switch (cameraPreset) {
      case 'front':
        return { position: [0, 0.2, 5.2] as [number, number, number], fov: 45 };
      case 'top':
        return { position: [0, 5.8, 0.1] as [number, number, number], fov: 42 };
      case 'macro':
        return { position: [0, -1.2, 2.2] as [number, number, number], fov: 38 };
      case 'iso':
      default:
        return { position: [3.4, 2.2, 4.4] as [number, number, number], fov: 45 };
    }
  }, [cameraPreset]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[rgba(0,229,255,0.22)] bg-gradient-to-b from-[#050b11] via-[#03070d] to-[#020508] shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl border-cyan-400/80 shadow-cyan-500/30' : 'h-[500px] lg:h-[580px]'
    }`}>
      {/* 1. Header Toolbar Inside 3D Visualizer */}
      <div className="absolute top-0 inset-x-0 z-20 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-b from-[#02060a]/90 via-[#02060a]/50 to-transparent backdrop-blur-xs font-mono text-xs">
        
        {/* Left: Visual Mode Switcher (Cryo Chandelier / Q-Sphere / Heavy-Hex) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#081523]/90 border border-cyan-500/30 backdrop-blur-md shadow-md">
          <button
            onClick={() => { playGateClickSound(600); setVisualMode('cryo'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              visualMode === 'cryo'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>3D Cryostat Twin</span>
          </button>

          <button
            onClick={() => { playGateClickSound(600); setVisualMode('qsphere'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              visualMode === 'qsphere'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Entanglement Q-Sphere</span>
          </button>

          <button
            onClick={() => { playGateClickSound(600); setVisualMode('lattice'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              visualMode === 'lattice'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Heavy-Hex QPU Lattice</span>
          </button>
        </div>

        {/* Right: Camera Presets, Shader Filter & View Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Material Shader Filter (for Cryo mode) */}
          {visualMode === 'cryo' && (
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[#081523]/80 border border-slate-800 backdrop-blur-md">
              <button
                onClick={() => { playGateClickSound(500); setVisualFilter('gold'); }}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  visualFilter === 'gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Photorealistic 24K Gold & Brushed Stainless Shield"
              >
                PBR Gold
              </button>
              <button
                onClick={() => { playGateClickSound(500); setVisualFilter('thermal'); }}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                  visualFilter === 'thermal' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="FLIR Infrared Thermal Mapping"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>FLIR</span>
              </button>
              <button
                onClick={() => { playGateClickSound(500); setVisualFilter('xray'); }}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  visualFilter === 'xray' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Translucent X-Ray Specular"
              >
                X-Ray
              </button>
              <button
                onClick={() => { playGateClickSound(500); setVisualFilter('wireframe'); }}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  visualFilter === 'wireframe' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Cyan Laser Mesh Wireframe"
              >
                Wire
              </button>
            </div>
          )}

          {/* Camera Angles */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#081523]/80 border border-slate-800 backdrop-blur-md">
            {[
              { id: 'iso', label: '3D Iso' },
              { id: 'front', label: 'Front' },
              { id: 'top', label: 'Top 90°' },
              { id: 'macro', label: 'QPU Macro' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  playGateClickSound(650);
                  setCameraPreset(p.id as any);
                }}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  cameraPreset === p.id
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Auto-Rotation Toggle */}
          <button
            onClick={() => {
              playGateClickSound(500);
              setAutoRotate(!autoRotate);
            }}
            title={autoRotate ? 'Pause 360° Turntable' : 'Start 360° Turntable'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              autoRotate
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Expansion Toggle */}
          <button
            onClick={() => {
              playGateClickSound(700);
              setIsFullscreen(!isFullscreen);
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D Viewport'}
            className="p-1.5 rounded-lg border border-slate-800 bg-[#081523]/80 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive R3F Three.js Canvas */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={cameraProps.position} fov={cameraProps.fov} />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1.2}
            maxDistance={12}
            dampingFactor={0.06}
          />

          {/* Studio Photorealistic Quantum Lighting */}
          <ambientLight intensity={0.85} />
          <directionalLight position={[6, 8, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-4, 2, -3]} intensity={1.2} color="#00e5ff" />
          <pointLight position={[3, -2, 4]} intensity={1.4} color="#38bdf8" />
          <pointLight position={[0, -2, 0]} intensity={2.0} color="#00f5ff" />
          <spotLight position={[0, 6, 0]} angle={0.6} penumbra={0.8} intensity={2.5} color="#ffffff" />

          {/* Render selected 3D Scene */}
          {visualMode === 'cryo' && (
            <CryoChandelierScene 
              filter={visualFilter} 
              autoRotate={autoRotate} 
              rotationSpeed={rotationSpeed} 
            />
          )}

          {visualMode === 'qsphere' && (
            <QSphereScene 
              autoRotate={autoRotate} 
              rotationSpeed={rotationSpeed} 
            />
          )}

          {visualMode === 'lattice' && (
            <HeavyHexLatticeScene 
              autoRotate={autoRotate} 
              rotationSpeed={rotationSpeed} 
            />
          )}
        </Canvas>
      </div>

      {/* 3. Bottom Live HUD Telemetry Strip */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-[#02060a]/95 via-[#02060a]/60 to-transparent backdrop-blur-xs font-mono text-xs pointer-events-none">
        
        {/* Left: Shield Status Badge & Live Base Temp */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 rounded-lg bg-[#081523]/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>SHIELD: <strong className="text-white">AISI 316L (140° CUTAWAY INSPECTION)</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#081523]/90 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>T_MIX: <strong className="text-purple-300">14.28 mK</strong></span>
          </div>
        </div>

        {/* Center: Rotation Speed Scrubber */}
        {autoRotate && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#081523]/90 border border-slate-800 pointer-events-auto">
            <span className="text-[10px] text-slate-400 uppercase">Speed:</span>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] text-cyan-300 font-bold w-6">{rotationSpeed.toFixed(1)}x</span>
          </div>
        )}

        {/* Right: Technical Guidance */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>DRAG TO ROTATE 360° · SCROLL TO ZOOM · SHIFT+DRAG TO PAN</span>
        </div>
      </div>
    </div>
  );
};
