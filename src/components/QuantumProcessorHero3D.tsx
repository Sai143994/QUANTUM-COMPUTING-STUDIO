import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// 1. HIGH-FIDELITY SUPERCONDUCTING QUBIT PROCESSOR (QPU) CORE
// ============================================================================
interface SuperconductingQPUCoreProps {
  reducedMotion: boolean;
}

const SuperconductingQPUCore: React.FC<SuperconductingQPUCoreProps> = ({ reducedMotion }) => {
  const coreRef = useRef<THREE.Group | null>(null);
  const qpuAuraRef = useRef<THREE.Mesh | null>(null);
  const microwavePulsesRef = useRef<THREE.Group | null>(null);

  // 16-Qubit Cross-Island Transmon Geometry (4x4 Matrix with Coplanar Waveguides)
  const transmonQubits = useMemo(() => {
    const qubits = [];
    const spacing = 0.32;
    for (let r = -1.5; r <= 1.5; r += 1) {
      for (let c = -1.5; c <= 1.5; c += 1) {
        qubits.push({
          id: `q_${r + 1.5}_${c + 1.5}`,
          x: c * spacing,
          z: r * spacing,
          freq: 4.8 + ((r + 2) * (c + 2) * 0.11) % 0.8, // 4.8 - 5.6 GHz transmon transition frequency
        });
      }
    }
    return qubits;
  }, []);

  // Peripheral SMA RF Connectors & Coaxial Feedline Ports
  const smaConnectors = useMemo(() => {
    const ports = [];
    const count = 16;
    const radius = 1.35;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      ports.push({
        angle,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
      });
    }
    return ports;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (!reducedMotion && coreRef.current) {
      // Gentle floating levitation & subtle precession
      coreRef.current.position.y = Math.sin(t * 0.9) * 0.04;
      coreRef.current.rotation.y = t * 0.06;
    }

    if (qpuAuraRef.current) {
      const s = 1.0 + Math.sin(t * 2.5) * 0.06;
      qpuAuraRef.current.scale.set(s, s * 0.5, s);
    }

    if (microwavePulsesRef.current && !reducedMotion) {
      microwavePulsesRef.current.rotation.y = -t * 0.2;
    }
  });

  return (
    <group ref={coreRef} position={[0, 0, 0]}>
      {/* ------------------------------------------------------------------ */}
      {/* A. Gold Coldfinger / Mixing Chamber Thermal Mount                  */}
      {/* ------------------------------------------------------------------ */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[1.5, 1.65, 0.35, 48]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.96}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Gold Heat-Sink Perimeter Flange Screws */}
      {smaConnectors.map((p, idx) => (
        <group key={`screw-${idx}`} position={[p.x * 0.92, -0.1, p.z * 0.92]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 0.05, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.026, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.015, 6]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------------------------ */}
      {/* B. OFHC Copper Chip Carrier Sub-Mount Package                      */}
      {/* ------------------------------------------------------------------ */}
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[2.0, 0.08, 2.0]} />
        <meshStandardMaterial
          color="#b45309"
          metalness={0.94}
          roughness={0.2}
        />
      </mesh>

      {/* Laser Engraved Gold Package Frame */}
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[1.82, 0.03, 1.82]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.97}
          roughness={0.12}
        />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* C. High-Reflectance Dark Sapphire / Silicon Superconducting Die    */}
      {/* ------------------------------------------------------------------ */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.42, 0.025, 1.42]} />
        <meshStandardMaterial
          color="#040b17"
          metalness={0.98}
          roughness={0.06}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Superconducting Aluminum/Niobium Ground Grid Mesh */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[1.38, 0.008, 1.38]} />
        <meshStandardMaterial
          color="#0ea5e9"
          metalness={0.92}
          roughness={0.18}
          wireframe={false}
        />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* D. Transmon Superconducting Qubit Crosses & CPW Resonators         */}
      {/* ------------------------------------------------------------------ */}
      {transmonQubits.map((q) => (
        <group key={q.id} position={[q.x, 0.005, q.z]}>
          {/* Horizontal Transmon Capacitor Arm */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.13, 0.006, 0.036]} />
            <meshStandardMaterial
              color="#00f5ff"
              emissive="#00e5ff"
              emissiveIntensity={1.4}
              metalness={0.8}
              roughness={0.1}
              toneMapped={false}
            />
          </mesh>

          {/* Vertical Transmon Capacitor Arm */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.036, 0.006, 0.13]} />
            <meshStandardMaterial
              color="#00f5ff"
              emissive="#00e5ff"
              emissiveIntensity={1.4}
              metalness={0.8}
              roughness={0.1}
              toneMapped={false}
            />
          </mesh>

          {/* Central Josephson Tunnel Junction Micro-Bridge */}
          <mesh position={[0, 0.006, 0]}>
            <boxGeometry args={[0.024, 0.008, 0.024]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Meandering Coplanar Waveguide (CPW) Readout Coupler Tail */}
          <mesh position={[0.09, 0, 0.06]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.08, 0.004, 0.016]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.8}
              metalness={0.85}
              roughness={0.15}
            />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------------------------ */}
      {/* E. Perimeter Gold Wire-Bonds (Connecting Die to Carrier)           */}
      {/* ------------------------------------------------------------------ */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const innerR = 0.68;
        const outerR = 0.86;
        const x1 = Math.cos(angle) * innerR;
        const z1 = Math.sin(angle) * innerR;
        const x2 = Math.cos(angle) * outerR;
        const z2 = Math.sin(angle) * outerR;
        const mx = (x1 + x2) / 2;
        const mz = (z1 + z2) / 2;
        return (
          <group key={`wb-${i}`}>
            <mesh position={[mx, 0.02, mz]} rotation={[0, -angle, Math.PI / 7]}>
              <cylinderGeometry args={[0.005, 0.005, 0.19, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.99} roughness={0.1} />
            </mesh>
            <mesh position={[x2, 0.002, z2]}>
              <boxGeometry args={[0.03, 0.008, 0.03]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        );
      })}

      {/* ------------------------------------------------------------------ */}
      {/* F. Cryogenic Miniature SMA Microwave Connectors & Feedlines        */}
      {/* ------------------------------------------------------------------ */}
      {smaConnectors.map((p, idx) => (
        <group key={`sma-${idx}`} position={[p.x, -0.05, p.z]} rotation={[0, -p.angle, 0]}>
          {/* Gold Hex Nut Body */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.16, 6]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.96} roughness={0.12} />
          </mesh>

          {/* Stainless Coaxial Barrel */}
          <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.14, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Flexible Semi-Rigid Coaxial Cable Routing Upwards */}
          <mesh position={[0.26, 0.22, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.025, 0.025, 0.45, 12]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#38bdf8' : '#cbd5e1'}
              metalness={0.92}
              roughness={0.18}
            />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------------------------ */}
      {/* G. Flowing Microwave State Waveguide Pulses                        */}
      {/* ------------------------------------------------------------------ */}
      <group ref={microwavePulsesRef}>
        {smaConnectors.map((p, idx) => (
          <mesh
            key={`pulse-${idx}`}
            position={[p.x * 0.75, 0.02 + Math.sin(idx) * 0.02, p.z * 0.75]}
          >
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color={idx % 3 === 0 ? '#00f5ff' : '#a855f7'} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* H. Volumetric Coherence Cloud Aura                                 */}
      {/* ------------------------------------------------------------------ */}
      <mesh ref={qpuAuraRef} position={[0, 0.03, 0]}>
        <sphereGeometry args={[1.2, 32, 16]} />
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Quantum Processor Core Spotlight */}
      <pointLight position={[0, 0.6, 0]} color="#00e5ff" intensity={5.5} distance={12} />
      <pointLight position={[0, -0.4, 0]} color="#fbbf24" intensity={2.8} distance={8} />
    </group>
  );
};

// ============================================================================
// 2. CRYOGENIC DILUTION CHANDELIER SUSPENSION COLUMN (ABOVE QPU)
// ============================================================================
const CryogenicSuspensionColumn: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const columnRef = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    if (reducedMotion || !columnRef.current) return;
    const t = state.clock.getElapsedTime();
    columnRef.current.position.y = Math.sin(t * 0.9) * 0.04;
    columnRef.current.rotation.y = t * 0.06;
  });

  return (
    <group ref={columnRef} position={[0, 0, 0]}>
      {/* Central Vacuum Support Column */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 2.6, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.12} />
      </mesh>

      {/* 100 mK Cold Plate Disc */}
      <group position={[0, 0.8, 0]}>
        <mesh>
          <cylinderGeometry args={[1.7, 1.7, 0.1, 64]} />
          <meshStandardMaterial color="#eab308" metalness={0.96} roughness={0.15} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.72, 0.018, 16, 64]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00e5ff"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* 800 mK Still Plate Disc */}
      <group position={[0, 1.8, 0]}>
        <mesh>
          <cylinderGeometry args={[2.0, 2.0, 0.12, 64]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.18} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.02, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* 4.2 K Radiation Flange Disc */}
      <group position={[0, 2.7, 0]}>
        <mesh>
          <cylinderGeometry args={[2.3, 2.3, 0.14, 64]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.93} roughness={0.2} />
        </mesh>
      </group>

      {/* Structural Titanium Hexagonal Support Trusses */}
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const angle = (idx * Math.PI) / 3;
        const rad = 1.25;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        return (
          <mesh key={`truss-${idx}`} position={[x, 1.6, z]}>
            <cylinderGeometry args={[0.025, 0.025, 2.4, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        );
      })}

      {/* Braided Coaxial Cable Bundles Dropping to QPU */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
        const angle = (idx * Math.PI) / 4 + 0.15;
        const rad = 0.95;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        return (
          <mesh key={`bundle-${idx}`} position={[x, 1.2, z]}>
            <cylinderGeometry args={[0.018, 0.018, 2.2, 12]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#38bdf8' : '#e2e8f0'}
              metalness={0.92}
              roughness={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ============================================================================
// 3. ANIMATED HIGH-FIDELITY CRYOGENIC ORBITAL RINGS
// ============================================================================
interface CryogenicOrbitalRingProps {
  radius: number;
  tube: number;
  rotSpeed: number;
  tiltX: number;
  tiltY: number;
  bodyColor: string;
  glowColor: string;
  metalness?: number;
  roughness?: number;
  notchCount?: number;
  hasCoils?: boolean;
  reducedMotion: boolean;
}

const CryogenicOrbitalRing: React.FC<CryogenicOrbitalRingProps> = ({
  radius,
  tube,
  rotSpeed,
  tiltX,
  tiltY,
  bodyColor,
  glowColor,
  metalness = 0.94,
  roughness = 0.14,
  notchCount = 16,
  hasCoils = false,
  reducedMotion
}) => {
  const ringRef = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    if (reducedMotion || !ringRef.current) return;
    const t = state.clock.getElapsedTime();
    ringRef.current.rotation.z = t * rotSpeed;
    ringRef.current.rotation.x = tiltX + Math.sin(t * 0.35) * 0.06;
    ringRef.current.rotation.y = tiltY + Math.cos(t * 0.3) * 0.06;
  });

  // Precision measurement notches and optical fiducials
  const notches = useMemo(() => {
    const items = [];
    for (let i = 0; i < notchCount; i++) {
      const angle = (i / notchCount) * Math.PI * 2;
      items.push({
        angle,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
    return items;
  }, [radius, notchCount]);

  return (
    <group ref={ringRef}>
      {/* Heavy Machined Metallic Ring Housing */}
      <mesh>
        <torusGeometry args={[radius, tube, 32, 128]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={metalness}
          roughness={roughness}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Recessed Superconductive Glow Waveguide Channel */}
      <mesh>
        <torusGeometry args={[radius, tube * 0.42, 16, 128]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={2.2}
          metalness={0.8}
          roughness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Mechanical Vernier Notches & Optical Fiducials */}
      {notches.map((n, i) => (
        <group key={i} position={[n.x, n.y, 0]} rotation={[0, 0, n.angle]}>
          <mesh position={[0, 0, tube * 0.85]}>
            <boxGeometry args={[tube * 1.6, tube * 0.45, tube * 0.55]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.08} />
          </mesh>
          {i % 4 === 0 && (
            <mesh position={[0, 0, tube * 1.25]}>
              <sphereGeometry args={[tube * 0.38, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          )}
        </group>
      ))}

      {/* Superconducting Magnetic Flux Coils (4 Quadrants) */}
      {hasCoils &&
        [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, coilIdx) => {
          const cx = Math.cos(angle) * radius;
          const cy = Math.sin(angle) * radius;
          return (
            <group key={`coil-${coilIdx}`} position={[cx, cy, 0]} rotation={[0, 0, angle]}>
              <mesh>
                <cylinderGeometry args={[tube * 2.2, tube * 2.2, tube * 2.5, 16]} />
                <meshStandardMaterial color="#b45309" metalness={0.96} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0, tube * 0.6]}>
                <torusGeometry args={[tube * 1.8, tube * 0.25, 12, 24]} />
                <meshBasicMaterial color="#00f5ff" />
              </mesh>
            </group>
          );
        })}
    </group>
  );
};

// ============================================================================
// 4. FLOATING DIELECTRIC QUBIT BLOCH NODES WITH ENTANGLEMENT RAYS
// ============================================================================
const FloatingDielectricQubits: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const qubitOrbiters = useMemo(() => [
    { radius: 2.8, speed: 0.28, tilt: Math.PI / 3.4, color: '#00f5ff', phase: 0 },
    { radius: 2.8, speed: 0.28, tilt: Math.PI / 3.4, color: '#38bdf8', phase: Math.PI },
    { radius: 3.8, speed: -0.22, tilt: -Math.PI / 4.2, color: '#38bdf8', phase: Math.PI / 2 },
    { radius: 3.8, speed: -0.22, tilt: -Math.PI / 4.2, color: '#00f5ff', phase: (3 * Math.PI) / 2 },
    { radius: 4.8, speed: 0.16, tilt: Math.PI / 5.5, color: '#c084fc', phase: Math.PI / 3 },
    { radius: 4.8, speed: 0.16, tilt: Math.PI / 5.5, color: '#00e5ff', phase: (4 * Math.PI) / 3 },
  ], []);

  const nodeRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    nodeRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const def = qubitOrbiters[idx];
      const curT = reducedMotion ? def.phase : t * def.speed + def.phase;
      const x = Math.cos(curT) * def.radius;
      const y = Math.sin(curT) * def.radius * Math.sin(def.tilt) * 0.6;
      const z = Math.sin(curT) * def.radius * Math.cos(def.tilt);
      ref.position.set(x, y, z);
    });
  });

  return (
    <group>
      {qubitOrbiters.map((def, idx) => (
        <group
          key={idx}
          ref={(el) => {
            nodeRefs.current[idx] = el;
          }}
        >
          {/* Glowing Qubit Core Sphere */}
          <mesh>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={def.color}
              emissiveIntensity={2.5}
              metalness={0.9}
              roughness={0.05}
              toneMapped={false}
            />
          </mesh>

          {/* Dielectric Resonator Shell */}
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color={def.color}
              transparent
              opacity={0.35}
              roughness={0.1}
              metalness={0.95}
              depthWrite={false}
            />
          </mesh>

          {/* Micro Orbit Ring around Qubit */}
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.28, 0.009, 8, 32]} />
            <meshBasicMaterial color={def.color} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ============================================================================
// 5. TOROIDAL MAGNETIC FLUX STREAMLINES & QUANTUM PARTICLES
// ============================================================================
const QuantumMagneticFluxField: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const pointsRef = useRef<THREE.Points | null>(null);
  const count = 1200;

  const { positions, baseAngles, speeds, radii, heights, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ang = new Float32Array(count);
    const spd = new Float32Array(count);
    const rad = new Float32Array(count);
    const hgt = new Float32Array(count);
    const col = new Float32Array(count * 3);

    const cyan = new THREE.Color('#00f5ff');
    const sky = new THREE.Color('#38bdf8');
    const violet = new THREE.Color('#c084fc');

    for (let i = 0; i < count; i++) {
      const u = i / count;
      ang[i] = u * Math.PI * 2 * 6;
      spd[i] = 0.22 + Math.random() * 0.42;
      rad[i] = 2.2 + Math.pow(Math.random(), 0.7) * 4.4;
      hgt[i] = (Math.random() - 0.5) * 5.6;

      const x = Math.cos(ang[i]) * rad[i];
      const y = hgt[i];
      const z = Math.sin(ang[i]) * rad[i];

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const tCol = Math.random();
      const pColor = tCol < 0.7
        ? cyan.clone().lerp(sky, tCol * 1.4)
        : sky.clone().lerp(violet, (tCol - 0.7) * 3.0);

      col[i * 3] = pColor.r;
      col[i * 3 + 1] = pColor.g;
      col[i * 3 + 2] = pColor.b;
    }

    return { positions: pos, baseAngles: ang, speeds: spd, radii: rad, heights: hgt, colors: col };
  }, [count]);

  useFrame((state) => {
    if (reducedMotion || !pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const curAngle = baseAngles[i] + t * speeds[i] * (2.6 / (radii[i] + 0.5));
      const r = radii[i] + Math.sin(t * 1.4 + baseAngles[i] * 2) * 0.12;

      let y = heights[i] + Math.sin(curAngle * 2 + t) * 0.28;
      if (y > 3.2) y = -3.2;
      if (y < -3.2) y = 3.2;

      posArr[i * 3] = Math.cos(curAngle) * r;
      posArr[i * 3 + 1] = y;
      posArr[i * 3 + 2] = Math.sin(curAngle) * r;
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
        size={0.08}
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
// 6. MASTER REACT THREE FIBER SCENE EXPORT
// ============================================================================
export interface QuantumProcessorHero3DProps {
  className?: string;
  reducedMotion?: boolean;
}

export const QuantumProcessorHero3D: React.FC<QuantumProcessorHero3DProps> = ({
  className = '',
  reducedMotion = false
}) => {
  return (
    <div className={`w-full h-full absolute inset-0 select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0.8, 8.8], fov: 44 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Pure Deep Space Obsidian Background */}
        <color attach="background" args={['#010206']} />
        <fogExp2 attach="fog" args={['#010206', 0.024]} />

        {/* Studio Lighting Rig for Metallic & Gold Materials */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 10, 8]} intensity={2.8} color="#ffffff" />
        <directionalLight position={[-6, -6, -4]} intensity={1.4} color="#00f5ff" />

        {/* Sub-Kelvin Neon Accent Spotlights */}
        <pointLight position={[0, 0, 3.2]} color="#00f5ff" intensity={5.0} distance={16} />
        <pointLight position={[0, -2.0, 2.0]} color="#fbbf24" intensity={3.5} distance={14} />
        <pointLight position={[-4, 2, -3]} color="#38bdf8" intensity={2.4} distance={15} />
        <pointLight position={[4, 3, -3]} color="#c084fc" intensity={2.0} distance={15} />

        {/* 1. Central Superconducting Qubit Processor Core (16 Transmon Array & SMA Ports) */}
        <SuperconductingQPUCore reducedMotion={reducedMotion} />

        {/* 2. Cryogenic Dilution Refrigerator Suspension Column (Mounts Above QPU) */}
        <CryogenicSuspensionColumn reducedMotion={reducedMotion} />

        {/* 3. Nested Animated Cryogenic Orbital Rings */}
        {/* Ring 1: 15 mK Mixing Chamber Ring (Machined Gold & Cyan Laser Track) */}
        <CryogenicOrbitalRing
          radius={2.7}
          tube={0.042}
          rotSpeed={0.22}
          tiltX={Math.PI / 3.2}
          tiltY={0.15}
          bodyColor="#d4af37"
          glowColor="#00f5ff"
          metalness={0.97}
          roughness={0.1}
          notchCount={16}
          hasCoils={true}
          reducedMotion={reducedMotion}
        />

        {/* Ring 2: 100 mK Cold Plate Ring (OFHC Copper & Electric-Blue Waveguide) */}
        <CryogenicOrbitalRing
          radius={3.6}
          tube={0.038}
          rotSpeed={-0.16}
          tiltX={-Math.PI / 3.8}
          tiltY={0.3}
          bodyColor="#b45309"
          glowColor="#38bdf8"
          metalness={0.95}
          roughness={0.16}
          notchCount={20}
          hasCoils={false}
          reducedMotion={reducedMotion}
        />

        {/* Ring 3: 4 K Radiation Shield Ring (Niobium/Silver & Violet Glow) */}
        <CryogenicOrbitalRing
          radius={4.6}
          tube={0.034}
          rotSpeed={0.12}
          tiltX={Math.PI / 4.8}
          tiltY={-0.25}
          bodyColor="#1e293b"
          glowColor="#c084fc"
          metalness={0.93}
          roughness={0.14}
          notchCount={24}
          hasCoils={true}
          reducedMotion={reducedMotion}
        />

        {/* Ring 4: Vacuum Chamber Outer Gimbal Ring (Titanium Alloy) */}
        <CryogenicOrbitalRing
          radius={5.6}
          tube={0.03}
          rotSpeed={-0.08}
          tiltX={-Math.PI / 5.5}
          tiltY={0.18}
          bodyColor="#0f172a"
          glowColor="#00f5ff"
          metalness={0.92}
          roughness={0.18}
          notchCount={28}
          hasCoils={false}
          reducedMotion={reducedMotion}
        />

        {/* 4. Floating Dielectric Qubits with Resonator Shells */}
        <FloatingDielectricQubits reducedMotion={reducedMotion} />

        {/* 5. Swirling Toroidal Magnetic Flux Field */}
        <QuantumMagneticFluxField reducedMotion={reducedMotion} />

        {/* 6. Interactive 360° Drag & Inspection Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.65}
          dampingFactor={0.05}
          enableDamping={true}
          maxPolarAngle={Math.PI / 1.65}
          minPolarAngle={Math.PI / 4.8}
        />
      </Canvas>
    </div>
  );
};
