import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

export type ChandelierViewMode = 'gold' | 'thermal' | 'xray';

export interface ChandelierHero3DProps {
  reducedMotion?: boolean;
  autoRotate?: boolean;
  enableZoom?: boolean;
  positionX?: number;
  viewMode?: ChandelierViewMode;
}

// ============================================================================
// 1. CASCADING GLOWING FIBER OPTIC / COAXIAL FOUNTAIN (BOTTOM OF CHANDELIER)
// ============================================================================
const CascadingFiberFountain: React.FC<{ reducedMotion: boolean; viewMode: ChandelierViewMode }> = ({ 
  reducedMotion,
  viewMode 
}) => {
  const fountainGroupRef = useRef<THREE.Group>(null);
  const coreAuraRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  // Generate 64 curved glowing fiber cables looping downward into a focal light nexus
  const fiberCables = useMemo(() => {
    const cables = [];
    const count = 64;
    const startY = -1.35; // Mixing chamber plate level
    const endY = -2.95;   // Light convergence point
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const startRadius = 0.45 + (i % 4) * 0.12;
      const flareRadius = 0.85 + ((i * 7) % 9) * 0.08; // Dynamic bell curve flare
      
      const p0 = new THREE.Vector3(
        Math.cos(angle) * startRadius,
        startY,
        Math.sin(angle) * startRadius
      );
      
      const p1 = new THREE.Vector3(
        Math.cos(angle + 0.28) * flareRadius,
        startY - 0.72,
        Math.sin(angle + 0.28) * flareRadius
      );

      const p2 = new THREE.Vector3(
        Math.cos(angle + 0.1) * (startRadius * 0.35),
        startY - 1.25,
        Math.sin(angle + 0.1) * (startRadius * 0.35)
      );

      const p3 = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        endY,
        (Math.random() - 0.5) * 0.05
      );

      const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const geom = new THREE.TubeGeometry(curve, 36, 0.01 + (i % 2) * 0.005, 8, false);
      const isElectric = i % 2 === 0;

      let color = isElectric ? '#00f5ff' : '#38bdf8';
      let emissive = isElectric ? '#00f5ff' : '#0284c7';
      if (viewMode === 'thermal') {
        color = '#a855f7';
        emissive = '#9333ea';
      }

      cables.push({
        geom,
        color,
        emissive,
        emissiveIntensity: isElectric ? 3.8 : 2.5
      });
    }
    return cables;
  }, [viewMode]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (fountainGroupRef.current) {
      fountainGroupRef.current.rotation.y = t * 0.06;
    }
    if (coreAuraRef.current) {
      const s = 1.0 + Math.sin(t * 4.0) * 0.15;
      coreAuraRef.current.scale.set(s, s * 1.5, s);
    }
    if (coreLightRef.current) {
      coreLightRef.current.intensity = 12 + Math.sin(t * 5.0) * 3;
    }
  });

  return (
    <group ref={fountainGroupRef}>
      {fiberCables.map((c, idx) => (
        <mesh key={idx} geometry={c.geom}>
          <meshStandardMaterial
            color={c.color}
            emissive={c.emissive}
            emissiveIntensity={c.emissiveIntensity}
            metalness={0.9}
            roughness={0.1}
            wireframe={viewMode === 'xray'}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Radiant Focal Core Light Burst at bottom convergence */}
      <mesh ref={coreAuraRef} position={[0, -2.95, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial
          color={viewMode === 'thermal' ? '#c084fc' : '#00f5ff'}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight 
        ref={coreLightRef}
        position={[0, -2.95, 0]} 
        color={viewMode === 'thermal' ? '#a855f7' : '#00f5ff'} 
        intensity={14.0} 
        distance={12} 
      />
    </group>
  );
};

// ============================================================================
// 2. CRYOGENIC DILUTION CHANDELIER (POLISHED GOLD, THERMAL OR X-RAY)
// ============================================================================
const CryoChandelierBody: React.FC<{ reducedMotion: boolean; viewMode: ChandelierViewMode }> = ({ 
  reducedMotion, 
  viewMode 
}) => {
  const bodyRef = useRef<THREE.Group>(null);
  const laserCoreRef = useRef<THREE.Mesh>(null);

  // Hex bolts around top vacuum flange
  const topFlangeBolts = useMemo(() => {
    const bolts = [];
    const count = 32;
    const rad = 2.2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      bolts.push({
        x: Math.cos(angle) * rad,
        z: Math.sin(angle) * rad
      });
    }
    return bolts;
  }, []);

  // Structural vertical truss columns between stages
  const trussColumns = useMemo(() => {
    const rods = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      rods.push({
        x: Math.cos(angle) * 1.35,
        z: Math.sin(angle) * 1.35
      });
    }
    return rods;
  }, []);

  // Coaxial microwave wiring lines running between stages
  const coaxialWires = useMemo(() => {
    const wires = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rad = 1.15 + (i % 3) * 0.12;
      wires.push({
        x: Math.cos(angle) * rad,
        z: Math.sin(angle) * rad
      });
    }
    return wires;
  }, []);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 0.6) * 0.04;
      bodyRef.current.rotation.y = t * 0.05;
    }
    if (laserCoreRef.current) {
      const s = 1.0 + Math.sin(t * 3.8) * 0.06;
      laserCoreRef.current.scale.set(s, 1, s);
    }
  });

  // Dynamic colors depending on viewMode
  const colors = useMemo(() => {
    if (viewMode === 'thermal') {
      return {
        stage0: '#ef4444',
        stage0Emissive: '#dc2626',
        stage1: '#f97316',
        stage1Emissive: '#ea580c',
        stage2: '#eab308',
        stage2Emissive: '#ca8a04',
        stage3: '#10b981',
        stage3Emissive: '#059669',
        stage4: '#06b6d4',
        stage4Emissive: '#0891b2',
        stage5: '#a855f7',
        stage5Emissive: '#9333ea',
        isWire: false,
        metalness: 0.8
      };
    }
    if (viewMode === 'xray') {
      return {
        stage0: '#38bdf8',
        stage0Emissive: '#0284c7',
        stage1: '#00e5ff',
        stage1Emissive: '#00e5ff',
        stage2: '#38bdf8',
        stage2Emissive: '#0284c7',
        stage3: '#00e5ff',
        stage3Emissive: '#00e5ff',
        stage4: '#38bdf8',
        stage4Emissive: '#0284c7',
        stage5: '#00e5ff',
        stage5Emissive: '#00e5ff',
        isWire: true,
        metalness: 0.95
      };
    }
    // Default PBR Gold Twin
    return {
      stage0: '#e2e8f0',
      stage0Emissive: '#000000',
      stage1: '#f59e0b',
      stage1Emissive: '#d97706',
      stage2: '#fbbf24',
      stage2Emissive: '#b45309',
      stage3: '#f59e0b',
      stage3Emissive: '#92400e',
      stage4: '#fbbf24',
      stage4Emissive: '#b45309',
      stage5: '#f59e0b',
      stage5Emissive: '#d97706',
      isWire: false,
      metalness: 0.94
    };
  }, [viewMode]);

  return (
    <group ref={bodyRef}>
      
      {/* ------------------------------------------------------------------ */}
      {/* STAGE 0: TOP VACUUM ROOM-TEMPERATURE COLLAR (CHROME & STAINLESS)    */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, 2.7, 0]}>
        <mesh>
          <cylinderGeometry args={[2.35, 2.45, 0.42, 64]} />
          <meshStandardMaterial
            color={colors.stage0}
            emissive={colors.stage0Emissive}
            emissiveIntensity={viewMode === 'thermal' ? 0.35 : 0.0}
            metalness={colors.metalness}
            roughness={0.12}
            wireframe={colors.isWire}
            envMapIntensity={2.5}
          />
        </mesh>

        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[2.55, 2.55, 0.2, 64]} />
          <meshStandardMaterial 
            color={colors.stage0} 
            metalness={0.98} 
            roughness={0.08}
            wireframe={colors.isWire}
          />
        </mesh>

        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[2.05, 2.05, 0.16, 64]} />
          <meshStandardMaterial 
            color={colors.stage0} 
            metalness={0.95} 
            roughness={0.14}
            wireframe={colors.isWire}
          />
        </mesh>

        {/* Cyan optical status tracker groove ring */}
        <mesh position={[0, -0.04, 0]}>
          <torusGeometry args={[2.4, 0.022, 16, 64]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00e5ff"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>

        {/* Circumferential stainless hex bolts */}
        {topFlangeBolts.map((b, idx) => (
          <mesh key={idx} position={[b.x, 0.24, b.z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
            <meshStandardMaterial color="#ffffff" metalness={0.99} roughness={0.06} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* STAGE 1: 50 K RADIATION FLANGE                                      */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, 1.8, 0]}>
        <mesh>
          <cylinderGeometry args={[1.95, 1.95, 0.14, 64]} />
          <meshStandardMaterial
            color={colors.stage1}
            emissive={colors.stage1Emissive}
            emissiveIntensity={0.25}
            metalness={colors.metalness}
            roughness={0.14}
            wireframe={colors.isWire}
            envMapIntensity={2.8}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[1.97, 0.024, 16, 64]} />
          <meshStandardMaterial color="#fde047" metalness={0.98} roughness={0.06} />
        </mesh>
        {/* Attenuator can cylinders */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.65, -0.15, Math.sin(a) * 1.65]}>
              <cylinderGeometry args={[0.075, 0.075, 0.26, 16]} />
              <meshStandardMaterial color={colors.stage1} metalness={0.94} roughness={0.18} />
            </mesh>
          );
        })}
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* STAGE 2: 4.2 K PULSE TUBE STAGE                                    */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, 0.95, 0]}>
        <mesh>
          <cylinderGeometry args={[1.68, 1.68, 0.13, 64]} />
          <meshStandardMaterial 
            color={colors.stage2} 
            emissive={colors.stage2Emissive}
            emissiveIntensity={0.22}
            metalness={colors.metalness} 
            roughness={0.12} 
            wireframe={colors.isWire}
            envMapIntensity={2.8}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[1.7, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00e5ff"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* STAGE 3: 800 mK STILL STAGE                                        */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, 0.15, 0]}>
        <mesh>
          <cylinderGeometry args={[1.45, 1.45, 0.12, 64]} />
          <meshStandardMaterial 
            color={colors.stage3} 
            emissive={colors.stage3Emissive}
            emissiveIntensity={0.22}
            metalness={colors.metalness} 
            roughness={0.15} 
            wireframe={colors.isWire}
          />
        </mesh>
        {/* Sintered silver heat exchanger cans */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 + 0.3;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.0, -0.17, Math.sin(a) * 1.0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 24]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.97} roughness={0.08} />
            </mesh>
          );
        })}
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* STAGE 4: 100 mK COLD PLATE                                         */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, -0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[1.22, 1.22, 0.11, 64]} />
          <meshStandardMaterial 
            color={colors.stage4} 
            emissive={colors.stage4Emissive}
            emissiveIntensity={0.25}
            metalness={colors.metalness} 
            roughness={0.1} 
            wireframe={colors.isWire}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[1.24, 0.018, 16, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* STAGE 5: 15 mK MIXING CHAMBER (SUB-KELVIN QPU GROUND STATE)        */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, -1.35, 0]}>
        <mesh>
          <cylinderGeometry args={[1.02, 1.02, 0.15, 64]} />
          <meshStandardMaterial
            color={colors.stage5}
            emissive={colors.stage5Emissive}
            emissiveIntensity={0.35}
            metalness={colors.metalness}
            roughness={0.08}
            wireframe={colors.isWire}
            envMapIntensity={3.0}
          />
        </mesh>

        {/* Magnetic Shielding Mu-Metal Can Shroud at bottom */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 0.38, 48]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.92}
            roughness={0.2}
            wireframe={colors.isWire}
          />
        </mesh>

        {/* Cyan optical resonance perimeter ring */}
        <mesh position={[0, -0.06, 0]}>
          <torusGeometry args={[1.04, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00e5ff"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* VERTICAL TRUSS COLUMNS & COAXIAL WIRING BUNDLES                     */}
      {/* ------------------------------------------------------------------ */}
      {trussColumns.map((col, idx) => (
        <mesh key={`truss-${idx}`} position={[col.x, 0.45, col.z]}>
          <cylinderGeometry args={[0.028, 0.028, 4.4, 16]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.98}
            roughness={0.06}
            envMapIntensity={2.5}
            wireframe={colors.isWire}
          />
        </mesh>
      ))}

      {coaxialWires.map((w, idx) => (
        <mesh key={`wire-${idx}`} position={[w.x, 0.4, w.z]}>
          <cylinderGeometry args={[0.012, 0.012, 4.3, 8]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#38bdf8' : '#fbbf24'}
            emissive={idx % 2 === 0 ? '#0284c7' : '#92400e'}
            emissiveIntensity={idx % 2 === 0 ? 1.5 : 0.8}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* ------------------------------------------------------------------ */}
      {/* CENTRAL GLOWING LASER / QUANTUM CORE CONDUIT (CYAN LASER SPINE)    */}
      {/* ------------------------------------------------------------------ */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 4.4, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.2}
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.35}
        />
      </mesh>

      <mesh ref={laserCoreRef} position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 4.4, 32]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00e5ff"
          emissiveIntensity={4.5}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 4.4, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <pointLight position={[0, 0.8, 0]} color="#00f5ff" intensity={6.5} distance={12} />
      <pointLight position={[0, -0.8, 0]} color="#38bdf8" intensity={7.0} distance={10} />

      {/* Cascading bottom fiber cables */}
      <CascadingFiberFountain reducedMotion={reducedMotion} viewMode={viewMode} />
    </group>
  );
};

// ============================================================================
// 3. TIGHT HOLOGRAPHIC ORBITAL RINGS & FLOATING GLASS QUBIT SPHERES
// ============================================================================
const HolographicOrbitalSystem: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const systemRef = useRef<THREE.Group>(null);
  
  // Qubits orbiting strictly around the chandelier body
  const qubits = useMemo(() => [
    { orbitRad: 2.05, speed: 0.45, tiltX: 0.52, tiltZ: 0.22, phase: 0, size: 0.16, color: '#00f5ff' },
    { orbitRad: 2.05, speed: 0.45, tiltX: 0.52, tiltZ: 0.22, phase: Math.PI, size: 0.13, color: '#38bdf8' },
    { orbitRad: 2.55, speed: -0.34, tiltX: -0.38, tiltZ: -0.28, phase: Math.PI * 0.45, size: 0.18, color: '#00f5ff' },
    { orbitRad: 2.55, speed: -0.34, tiltX: -0.38, tiltZ: -0.28, phase: Math.PI * 1.45, size: 0.14, color: '#60a5fa' },
    { orbitRad: 2.95, speed: 0.26, tiltX: 0.28, tiltZ: -0.36, phase: Math.PI * 0.85, size: 0.17, color: '#00e5ff' },
    { orbitRad: 2.95, speed: 0.26, tiltX: 0.28, tiltZ: -0.36, phase: Math.PI * 1.85, size: 0.13, color: '#38bdf8' },
  ], []);

  const qubitNodeRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();

    if (systemRef.current) {
      systemRef.current.rotation.y = t * 0.04;
    }

    qubits.forEach((q, idx) => {
      const el = qubitNodeRefs.current[idx];
      if (!el) return;
      const angle = t * q.speed + q.phase;
      const x = Math.cos(angle) * q.orbitRad;
      const y = Math.sin(angle) * q.orbitRad * Math.sin(q.tiltX) * 0.85;
      const z = Math.sin(angle) * q.orbitRad * Math.cos(q.tiltZ);
      el.position.set(x, y - 0.15, z);
    });
  });

  return (
    <group ref={systemRef}>
      {/* --- ORBITAL RING 1 (Inner tight, tilted forward) --- */}
      <group rotation={[0.52, 0, 0.22]}>
        <mesh>
          <torusGeometry args={[2.05, 0.018, 16, 128]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00e5ff"
            emissiveIntensity={3.2}
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* --- ORBITAL RING 2 (Middle, tilted opposite) --- */}
      <group rotation={[-0.38, 0, -0.28]}>
        <mesh>
          <torusGeometry args={[2.55, 0.02, 16, 128]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={2.8}
            transparent
            opacity={0.85}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* --- ORBITAL RING 3 (Outer, wide diagonal) --- */}
      <group rotation={[0.28, 0, -0.36]}>
        <mesh>
          <torusGeometry args={[2.95, 0.022, 16, 128]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={2.6}
            transparent
            opacity={0.75}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* --- GLASS QUBIT SPHERES WITH INNER NUCLEUS --- */}
      {qubits.map((q, idx) => (
        <group
          key={idx}
          ref={(el) => {
            qubitNodeRefs.current[idx] = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[q.size, 32, 32]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#00f5ff"
              emissiveIntensity={1.4}
              roughness={0.05}
              metalness={0.15}
              transparent
              opacity={0.75}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[q.size * 0.42, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          <pointLight color={q.color} intensity={2.8} distance={3.5} />
        </group>
      ))}
    </group>
  );
};

// ============================================================================
// 4. FLOATING QUANTUM SPARKS & STARDUST PARTICLES
// ============================================================================
const QuantumSparkField: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [geo] = useMemo(() => {
    const count = 380;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 0.8 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 6.5;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      if (i % 3 === 0) {
        col[i * 3] = 0.0;
        col[i * 3 + 1] = 0.96;
        col[i * 3 + 2] = 1.0;
      } else if (i % 3 === 1) {
        col[i * 3] = 0.22;
        col[i * 3 + 1] = 0.74;
        col[i * 3 + 2] = 0.97;
      } else {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 1.0;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return [g];
  }, []);

  useFrame((state) => {
    if (reducedMotion || !pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.03;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ============================================================================
// 5. HOLOGRAPHIC AMBIENT CRYO FLOOR RINGS (SEAMLESS VOID)
// ============================================================================
const ReflectiveQuantumFloor: React.FC = () => {
  return (
    <group position={[0, -3.4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.95, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 1.95, 64]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.25, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.16} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.8, 4.85, 64]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

// ============================================================================
// MAIN COMPONENT: CHANDELIER HERO 3D SCENE
// ============================================================================
export const ChandelierHero3D: React.FC<ChandelierHero3DProps> = ({
  reducedMotion = false,
  autoRotate = true,
  enableZoom = false,
  positionX = 0,
  viewMode = 'gold'
}) => {
  return (
    <div className="w-full h-full absolute inset-0 select-none pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0.15, 8.4], fov: 38 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#01030a']} />
        <fogExp2 attach="fog" args={['#01030a', 0.016]} />

        <ambientLight intensity={1.6} />
        <directionalLight position={[6, 12, 8]} intensity={4.2} color="#ffffff" />
        <directionalLight position={[-8, -4, -6]} intensity={2.2} color="#00f5ff" />

        <Environment preset="city" />

        {/* Chandelier Assembly positioned in its designated half */}
        <group position={[positionX, 0.15, 0]} scale={[0.85, 0.85, 0.85]}>
          <pointLight position={[0, 1.2, 3.2]} color="#00f5ff" intensity={8.5} distance={14} />
          <pointLight position={[-2.2, 2.0, 2.2]} color="#fbbf24" intensity={8.5} distance={14} />
          <pointLight position={[2.2, 0.5, -2.2]} color="#38bdf8" intensity={6.0} distance={12} />
          <pointLight position={[0, -2.6, 1.8]} color="#00f5ff" intensity={12.0} distance={12} />

          <CryoChandelierBody reducedMotion={reducedMotion} viewMode={viewMode} />
          <HolographicOrbitalSystem reducedMotion={reducedMotion} />
          <QuantumSparkField reducedMotion={reducedMotion} />
          <ReflectiveQuantumFloor />
        </group>

        <OrbitControls
          target={[positionX, 0.15, 0]}
          enableZoom={enableZoom}
          enablePan={false}
          autoRotate={!reducedMotion && autoRotate}
          autoRotateSpeed={0.4}
          dampingFactor={0.05}
          enableDamping={true}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.8}
        />
      </Canvas>
    </div>
  );
};

export {
  CryoChandelierBody,
  HolographicOrbitalSystem,
  QuantumSparkField,
  ReflectiveQuantumFloor
};
