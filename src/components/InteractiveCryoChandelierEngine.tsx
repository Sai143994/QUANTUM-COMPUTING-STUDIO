import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  CryoChandelierBody, 
  HolographicOrbitalSystem, 
  QuantumSparkField, 
  ReflectiveQuantumFloor, 
  ChandelierViewMode 
} from './ChandelierHero3D';
import { playGateClickSound } from '../utils/audio';

export type ChandelierFocalStage = 'overview' | 'stage_300k' | 'stage_4k' | 'stage_still' | 'stage_mixing';

export interface InteractiveChandelierProps {
  viewMode?: ChandelierViewMode;
  autoRotate?: boolean;
  focalStage?: ChandelierFocalStage;
  activeStep?: number; // 0 to 5
  onSelectStage?: (stageId: string) => void;
  showStageBadges?: boolean;
}

// 1. Microwave Pulses Traveling Down the Chandelier Coaxial Lines
const ChandelierMicrowavePulses: React.FC<{ activeStep: number; viewMode: ChandelierViewMode }> = ({ 
  activeStep, 
  viewMode 
}) => {
  const pulseGroupRef = useRef<THREE.Group>(null);

  // 12 active microwave coaxial guides
  const pulsePositions = useMemo(() => {
    const list = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rad = 1.15 + (i % 3) * 0.12;
      list.push({
        x: Math.cos(angle) * rad,
        z: Math.sin(angle) * rad,
        phaseOffset: (i * 0.35) % (Math.PI * 2)
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    if (!pulseGroupRef.current) return;
    const t = state.clock.getElapsedTime();
    pulseGroupRef.current.children.forEach((child, i) => {
      // Pulses slide downward from 300K Flange (y = 1.8) down into QPU (y = -1.8)
      const speed = 2.4 + (i % 3) * 0.5;
      let y = 1.8 - ((t * speed + pulsePositions[i].phaseOffset) % 3.6);
      child.position.y = y;
      
      // Pulse expands slightly as it nears the mixing chamber
      const s = 1.0 + (y < -0.8 ? 0.3 : 0);
      child.scale.set(s, s, s);
    });
  });

  return (
    <group ref={pulseGroupRef}>
      {pulsePositions.map((p, idx) => (
        <mesh key={idx} position={[p.x, 0, p.z]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial 
            color={viewMode === 'thermal' ? '#c084fc' : idx % 2 === 0 ? '#00f5ff' : '#38bdf8'} 
          />
        </mesh>
      ))}
    </group>
  );
};

// 2. Camera Rig Smooth Lerp to Focal Stages
const CameraRig: React.FC<{ focalStage: ChandelierFocalStage; controlsRef: React.RefObject<any> }> = ({ 
  focalStage, 
  controlsRef 
}) => {
  const targetConfig = useMemo(() => {
    switch (focalStage) {
      case 'stage_300k':
        return { pos: new THREE.Vector3(0, 1.8, 4.4), lookAt: new THREE.Vector3(0, 1.5, 0) };
      case 'stage_4k':
        return { pos: new THREE.Vector3(0, 0.6, 4.0), lookAt: new THREE.Vector3(0, 0.4, 0) };
      case 'stage_still':
        return { pos: new THREE.Vector3(0, -0.4, 3.8), lookAt: new THREE.Vector3(0, -0.4, 0) };
      case 'stage_mixing':
        return { pos: new THREE.Vector3(0, -1.8, 3.4), lookAt: new THREE.Vector3(0, -1.6, 0) };
      case 'overview':
      default:
        return { pos: new THREE.Vector3(0, 0.25, 7.8), lookAt: new THREE.Vector3(0, -0.15, 0) };
    }
  }, [focalStage]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const factor = Math.min(delta * 2.8, 0.15);
    state.camera.position.lerp(targetConfig.pos, factor);
    controlsRef.current.target.lerp(targetConfig.lookAt, factor);
    controlsRef.current.update();
  });

  return null;
};

// 3. Interactive Floating Holographic Stage Callout Badges
const HolographicStagePins: React.FC<{ 
  onSelectStage?: (id: string) => void; 
  activeStep: number 
}> = ({ 
  onSelectStage, 
  activeStep 
}) => {
  const STAGES_CONFIG = [
    { id: 'present_compiler', name: '300K FLANGE', sub: 'AWG Microwave Feed', y: 1.6, step: 1, temp: '300 K' },
    { id: 'present_awg_pulse', name: '50K STAGE', sub: 'First Thermal Shield', y: 1.05, step: 2, temp: '50 K' },
    { id: 'present_coax_cryo', name: '4.2K STAGE', sub: 'HEMT / Cryo-CMOS', y: 0.45, step: 3, temp: '4.2 K' },
    { id: 'present_qec_offline', name: 'STILL 800mK', sub: '³He Phase Separation', y: -0.15, step: 4, temp: '800 mK' },
    { id: 'present_transmon_qpu', name: '15mK QPU CORE', sub: 'Josephson Superconducting Chip', y: -1.35, step: 5, temp: '14.8 mK' }
  ];

  return (
    <group>
      {STAGES_CONFIG.map(st => {
        const isCur = activeStep === st.step - 1;
        return (
          <group key={st.id} position={[1.9, st.y, 0]}>
            {/* Guide line from pin to stage flange */}
            <line>
              <bufferGeometry
                attach="geometry"
                onUpdate={self => {
                  self.setFromPoints([
                    new THREE.Vector3(-0.6, 0, 0),
                    new THREE.Vector3(0, 0, 0)
                  ]);
                }}
              />
              <lineBasicMaterial
                color={isCur ? '#00e5ff' : '#475569'}
                transparent
                opacity={isCur ? 0.9 : 0.4}
              />
            </line>

            {/* Pulsing indicator orb */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[isCur ? 0.08 : 0.05, 16, 16]} />
              <meshBasicMaterial color={isCur ? '#00f5ff' : '#64748b'} />
            </mesh>

            {/* Html 3D Billboard Pin */}
            <Html distanceFactor={10} position={[0.2, 0, 0]} style={{ pointerEvents: 'auto' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playGateClickSound(700);
                  if (onSelectStage) onSelectStage(st.id);
                }}
                className={`px-2.5 py-1 rounded-lg backdrop-blur-md border text-left cursor-pointer transition-all whitespace-nowrap shadow-xl flex items-center gap-2 ${
                  isCur
                    ? 'bg-[#030914]/90 border-cyan-400 text-white ring-1 ring-cyan-400/50 shadow-cyan-500/20'
                    : 'bg-[#030914]/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isCur ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                <div>
                  <div className="text-[10px] font-bold leading-tight flex items-center gap-1.5">
                    <span>{st.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-cyan-300 font-mono">
                      {st.temp}
                    </span>
                  </div>
                  <div className="text-[8px] text-slate-500 leading-none">
                    {st.sub}
                  </div>
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// ============================================================================
// MAIN COMPONENT: INTERACTIVE CRYO CHANDELIER ENGINE (DASHBOARD TWIN)
// ============================================================================
export const InteractiveCryoChandelierEngine: React.FC<InteractiveChandelierProps> = ({
  viewMode = 'gold',
  autoRotate = true,
  focalStage = 'overview',
  activeStep = 3,
  onSelectStage,
  showStageBadges = true
}) => {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0.25, 7.8], fov: 38 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#01030a']} />
        <fogExp2 attach="fog" args={['#01030a', 0.016]} />

        {/* Studio High-Dynamic Range Quantum Lighting */}
        <ambientLight intensity={1.6} />
        <directionalLight position={[6, 12, 8]} intensity={4.2} color="#ffffff" />
        <directionalLight position={[-8, -4, -6]} intensity={2.2} color="#00f5ff" />

        <Environment preset="city" />

        {/* Chandelier Assembly Group */}
        <group position={[0, 0.15, 0]} scale={[0.9, 0.9, 0.9]}>
          <pointLight position={[0, 1.2, 3.2]} color="#00f5ff" intensity={8.5} distance={14} />
          <pointLight position={[-2.2, 2.0, 2.2]} color="#fbbf24" intensity={8.5} distance={14} />
          <pointLight position={[2.2, 0.5, -2.2]} color="#38bdf8" intensity={6.0} distance={12} />
          <pointLight position={[0, -2.6, 1.8]} color="#00f5ff" intensity={12.0} distance={12} />

          {/* 1. Core Chandelier Body (Plates, Trusses, Coax Wires, Fiber Fountain) */}
          <CryoChandelierBody reducedMotion={false} viewMode={viewMode} />

          {/* 2. Holographic Orbital Rings */}
          <HolographicOrbitalSystem reducedMotion={false} />

          {/* 3. Quantum Spark Particle Field */}
          <QuantumSparkField reducedMotion={false} />

          {/* 4. Active Microwave Pulses Traveling Down Coax */}
          <ChandelierMicrowavePulses activeStep={activeStep} viewMode={viewMode} />

          {/* 5. Reflective Floor */}
          <ReflectiveQuantumFloor />

          {/* 6. Interactive Holographic Callout Pins */}
          {showStageBadges && (
            <HolographicStagePins onSelectStage={onSelectStage} activeStep={activeStep} />
          )}
        </group>

        {/* Camera Lerp Controller */}
        <CameraRig focalStage={focalStage} controlsRef={controlsRef} />

        {/* Orbit Controls (Smooth Damping with Zoom Enabled) */}
        <OrbitControls
          ref={controlsRef}
          target={[0, -0.15, 0]}
          enableZoom={true}
          enablePan={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.35}
          dampingFactor={0.06}
          enableDamping={true}
          maxDistance={12}
          minDistance={2.2}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.8}
        />
      </Canvas>
    </div>
  );
};
