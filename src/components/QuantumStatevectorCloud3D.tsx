import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { QuantumEngineFlow3D } from './QuantumEngineFlow3D';

// 1. Procedural Quantum Vacuum Wave Grid (Zero-Point Field Lattice)
const QuantumVacuumWaveGrid: React.FC = () => {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const size = 56;
  const segments = 48;

  const { geometry, basePositions } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position.array as Float32Array;
    const base = new Float32Array(pos.length);
    base.set(pos);
    return { geometry: geo, basePositions: base };
  }, [size, segments]);

  useFrame(() => {
    if (!meshRef.current) return;
    const t = performance.now() * 0.001;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const dist = Math.sqrt(x * x + y * y);

      const wave1 = Math.sin(x * 0.28 + t * 1.5) * Math.cos(y * 0.28 + t * 1.1) * 0.45;
      const wave2 = Math.sin(dist * 0.32 - t * 1.6) * 0.35;
      pos[i + 2] = wave1 + wave2;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, -5.8, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <meshBasicMaterial
        color="#00e5ff"
        wireframe
        transparent
        opacity={0.12}
      />
    </mesh>
  );
};

// 2. High-Fidelity Superconducting Quantum Processor Core (Chandelier Base & Sapphire Chip)
const SuperconductingQuantumCore: React.FC = () => {
  const chipRef = useRef<THREE.Group | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    const t = performance.now() * 0.001;
    if (chipRef.current) {
      // Gentle cryogenic flotation breathing (no spinning)
      chipRef.current.position.y = Math.sin(t * 1.2) * 0.08;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.12;
    }
  });

  return (
    <group ref={chipRef}>
      {/* Golden Dilution Cryogenic Base Plate */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[4.2, 4.4, 0.35, 64]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.92}
          roughness={0.15}
        />
      </mesh>

      {/* Titanium Cyan Shield Ring */}
      <mesh position={[0, -0.2, 0]}>
        <torusGeometry args={[4.3, 0.06, 16, 64]} />
        <meshStandardMaterial
          color="#00f5ff"
          metalness={0.9}
          roughness={0.1}
          emissive="#00e5ff"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Sapphire Quantum Chip Substrate (Silicon / Sapphire Die) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.12, 3.2]} />
        <meshStandardMaterial
          color="#031628"
          roughness={0.08}
          metalness={0.88}
        />
      </mesh>

      {/* Superconducting Niobium Circuit Traces & 4 Transmon Qubit Crosses */}
      {[-0.9, 0.9].map((x) =>
        [-0.9, 0.9].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0.08, z]}>
            {/* Transmon Cross Pad */}
            <mesh>
              <boxGeometry args={[0.55, 0.02, 0.18]} />
              <meshBasicMaterial color="#00f5ff" />
            </mesh>
            <mesh>
              <boxGeometry args={[0.18, 0.02, 0.55]} />
              <meshBasicMaterial color="#00f5ff" />
            </mesh>
            {/* Josephson Junction Core Aura */}
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))
      )}

      {/* Coplanar Waveguide Resonator Bus Lines Linking Qubits */}
      <lineSegments>
        <bufferGeometry
          attach="geometry"
          onUpdate={(self) => {
            self.setFromPoints([
              new THREE.Vector3(-0.9, 0.08, -0.9),
              new THREE.Vector3(0.9, 0.08, -0.9),
              new THREE.Vector3(0.9, 0.08, -0.9),
              new THREE.Vector3(0.9, 0.08, 0.9),
              new THREE.Vector3(0.9, 0.08, 0.9),
              new THREE.Vector3(-0.9, 0.08, 0.9),
              new THREE.Vector3(-0.9, 0.08, 0.9),
              new THREE.Vector3(-0.9, 0.08, -0.9)
            ]);
          }}
        />
        <lineBasicMaterial color="#c084fc" transparent opacity={0.65} />
      </lineSegments>

      {/* Holographic Bloch Sphere Manifold Cage */}
      <mesh position={[0, 0.35, 0]}>
        <icosahedronGeometry args={[5.0, 2]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.10} />
      </mesh>

      {/* Coaxial Dilution Microwave Resonance Rings with Subtle Rotation */}
      <mesh ref={ring1Ref} position={[0, 0.8, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[4.8, 0.03, 16, 80]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.35} />
      </mesh>

      <mesh ref={ring2Ref} position={[0, -0.6, 0]} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[5.4, 0.025, 16, 80]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

// 3. Volumetric Quantum Wavepacket Lobes (Superposition Harmonics dz2 & px)
const QuantumOrbitalLobes: React.FC = () => {
  const lobeRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    const t = performance.now() * 0.001;
    if (lobeRef.current) {
      lobeRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }
  });

  return (
    <group ref={lobeRef}>
      {/* Upper Harmonic Wavepacket Lobe */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshStandardMaterial
          color="#00f5ff"
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>

      {/* Lower Harmonic Wavepacket Lobe */}
      <mesh position={[0, -2.4, 0]}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshStandardMaterial
          color="#c084fc"
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>

      {/* Toroidal Phase Belt (dz2 nodal ring) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.45, 16, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </group>
  );
};

// 4. Delicate Statevector Wavepacket Particle Atmosphere (1,800 Particles)
const StatevectorAtmosphere: React.FC = () => {
  const pointsRef = useRef<THREE.Points | null>(null);
  const count = 1800;

  const { positions, basePositions, colors, phases, radii } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const rad = new Float32Array(count);

    const cyan = new THREE.Color('#00f5ff');
    const purple = new THREE.Color('#c084fc');

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const r = 2.8 + Math.pow(Math.random(), 0.6) * 6.5;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) * 0.72;
      const z = r * Math.sin(phi) * Math.sin(theta);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;

      rad[i] = r;
      ph[i] = theta + phi * 2.0;

      const tCol = Math.sin(ph[i]) * 0.5 + 0.5;
      const finalCol = new THREE.Color().lerpColors(cyan, purple, tCol);
      col[i * 3] = finalCol.r;
      col[i * 3 + 1] = finalCol.g;
      col[i * 3 + 2] = finalCol.b;
    }

    return { positions: pos, basePositions: base, colors: col, phases: ph, radii: rad };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const t = performance.now() * 0.0012;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];
      const r = radii[i];
      const pPhase = phases[i];

      const pulse = Math.sin(r * 1.4 - t * 2.0 + pPhase) * 0.22;
      const norm = Math.sqrt(bx * bx + by * by + bz * bz) + 0.001;

      posArr[i * 3] = bx + (bx / norm) * pulse;
      posArr[i * 3 + 1] = by + (by / norm) * pulse;
      posArr[i * 3 + 2] = bz + (bz / norm) * pulse;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.13}
        vertexColors
        transparent
        opacity={0.82}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Main Exported React-Three-Fiber Canvas Component
export const QuantumStatevectorCloud3D: React.FC<{
  className?: string;
  activeStageId?: string | null;
  onSelectStage?: (id: string) => void;
  engineMode?: 'present' | 'future' | 'dual';
  showLabels?: boolean;
  perspective?: 'all' | 'software' | 'hardware';
}> = ({ 
  className = '', 
  activeStageId, 
  onSelectStage,
  engineMode = 'present',
  showLabels = true,
  perspective = 'all'
}) => {
  return (
    <div className={`w-full h-full absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 2.5, 17.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Deep Crystal Obsidian Vacuum */}
        <color attach="background" args={['#010206']} />
        <fogExp2 attach="fog" args={['#010206', 0.020]} />

        {/* Studio Quantum Lights with Gold & Cyan Highlights */}
        <ambientLight intensity={0.85} />
        <directionalLight position={[6, 12, 8]} intensity={1.9} color="#ffffff" />
        <pointLight position={[0, 2, 0]} color="#00f5ff" intensity={4.5} distance={26} />
        <pointLight position={[8, -2, 6]} color="#d4af37" intensity={3.0} distance={28} />
        <pointLight position={[-8, 6, -6]} color="#c084fc" intensity={2.8} distance={28} />

        {/* 1. Procedural Undulating Vacuum Plane */}
        <QuantumVacuumWaveGrid />

        {/* 2. Superconducting Quantum Core Hardware */}
        <SuperconductingQuantumCore />

        {/* 3. Volumetric Harmonic Quantum Lobes */}
        <QuantumOrbitalLobes />

        {/* 4. Delicate Quantum Wavepacket Atmosphere */}
        <StatevectorAtmosphere />

        {/* 5. LIVE 3D ANIMATED QUANTUM ENGINE FLOW (Catmull-Rom Pipeline & 6 Holographic Stations) */}
        <QuantumEngineFlow3D
          activeStageId={activeStageId}
          onSelectStage={onSelectStage}
          engineMode={engineMode}
          showLabels={showLabels}
          perspective={perspective}
        />

        {/* 6. Manual Orbit Controls (Smooth damping, no auto-spin so user has comfortable control) */}
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          maxDistance={30}
          minDistance={7}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.6}
        />
      </Canvas>
    </div>
  );
};
