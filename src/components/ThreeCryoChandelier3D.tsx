import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { 
  Rotate3d, 
  Thermometer, 
  Activity, 
  Zap, 
  Sparkles, 
  Layers, 
  Compass, 
  Info,
  Maximize2,
  X,
  Gauge,
  Shield,
  Radio,
  Cpu,
  ArrowRight,
  Flame,
  CheckCircle2,
  BookOpen,
  Eye,
  Sliders,
  Play,
  Pause,
  ZoomIn,
  MoveVertical,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Navigation,
  Disc
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';
import { QpuControlStudioCards } from './QpuControlStudioCards';
import { 
  CryoChandelierBody, 
  HolographicOrbitalSystem, 
  QuantumSparkField, 
  ReflectiveQuantumFloor 
} from './ChandelierHero3D';
import { QuantumEngineFlowLab } from './QuantumEngineFlowLab';

interface StageInfo {
  name: string;
  shortName: string;
  temp: string;
  tempKelvin: number;
  color: string;
  badgeColor: string;
  role: string;
  sensorChannel: string;
  attenuation: string;
  sensorModel: string;
  sensorResistance: string;
  photonOccupation: string;
  spectralDensity: string;
  desc: string;
  components: string;
  componentTags: string[];
  thermalLoad: string;
  materials: string;
  yBase: number;
}

const THERMAL_STAGES: Record<string, StageInfo> = {
  stage_300k: {
    name: 'Room Temperature Flange',
    shortName: '300K Flange',
    temp: '295 Kelvin (+22 °C)',
    tempKelvin: 295,
    color: '#ef4444',
    badgeColor: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
    role: 'Vacuum Boundary · Classical AWG Interface',
    sensorChannel: 'CH-1 (Pt-100)',
    attenuation: '0 dB (Direct Feed)',
    sensorModel: 'Platinum RTD Pt-100 Class A',
    sensorResistance: '108.4 Ω',
    photonOccupation: '1,230 Photons (Thermal Noise)',
    spectralDensity: '2.21 nV/√Hz',
    yBase: 1.45,
    desc: 'Vacuum chamber top seal where RF microwave control cabling enters from classical room-temperature AWG signal generators and FPGA control electronics.',
    components: 'Hermetic SMA feedthroughs, vacuum turbopump port, optical feedthroughs.',
    componentTags: ['Hermetic SMA Feedthroughs', 'Turbopump Port', 'Vacuum O-Rings', 'Optical Ports'],
    thermalLoad: '~100 Watts (ambient radiation)',
    materials: 'Stainless steel 316L, OFHC copper vacuum seals'
  },
  stage_50k: {
    name: 'Thermal Radiation Shield',
    shortName: '50K Shield',
    temp: '50 Kelvin (-223 °C)',
    tempKelvin: 50,
    color: '#f97316',
    badgeColor: 'bg-orange-950/80 border-orange-500/50 text-orange-300',
    role: '1st Pulse Tube Stage · Blackbody Intercept',
    sensorChannel: 'CH-2 (Cernox)',
    attenuation: '-20 dB Cryo Attenuator',
    sensorModel: 'Lake Shore Cernox CX-1050-SD',
    sensorResistance: '342.1 Ω',
    photonOccupation: '208.5 Photons',
    spectralDensity: '0.91 nV/√Hz',
    yBase: 0.9,
    desc: 'First mechanical pulse-tube cooler stage that intercepts the bulk of room-temperature blackbody thermal radiation and anchors RF attenuators.',
    components: 'Gold-plated copper shield, 50K thermal attenuators (-20 dB), thermal clamps.',
    componentTags: ['50K Pulse Tube Stage', 'Gold-Plated Shield', '-20 dB RF Attenuators', 'Braid Clamps'],
    thermalLoad: '~35 Watts cooling power',
    materials: 'High-purity OFHC copper gold-plated to 5 μm'
  },
  stage_4k: {
    name: 'Liquid Helium / Pulse Tube Stage',
    shortName: '4.2K Stage',
    temp: '4.2 Kelvin (-269 °C)',
    tempKelvin: 4.2,
    color: '#eab308',
    badgeColor: 'bg-yellow-950/80 border-yellow-500/50 text-yellow-300',
    role: '2nd Pulse Tube Stage · Superconducting Transition (Tc)',
    sensorChannel: 'CH-3 (Cernox)',
    attenuation: '-10 dB Attenuator + HEMT Anchor',
    sensorModel: 'Lake Shore Cernox CX-1030-SD',
    sensorResistance: '1,120 Ω',
    photonOccupation: '17.5 Photons',
    spectralDensity: '0.26 nV/√Hz',
    yBase: 0.3,
    desc: 'Superconducting transition threshold for niobium-titanium coaxial cables and cryogenic HEMT low-noise amplifiers with copper braided heat sinks.',
    components: 'Cryogenic HEMT amplifiers, NbTi superconducting RF lines, 4K thermal anchors.',
    componentTags: ['Cryo HEMT Amplifiers', 'NbTi Superconducting Coax', '4K Thermal Anchor', 'Magnetic Traps'],
    thermalLoad: '~1.5 Watts cooling power',
    materials: 'Superconducting Niobium-Titanium (NbTi), Brass SMA connectors'
  },
  stage_still: {
    name: 'Still / Distillation Chamber',
    shortName: '0.8K Still',
    temp: '0.8 Kelvin (800 mK)',
    tempKelvin: 0.8,
    color: '#10b981',
    badgeColor: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
    role: 'Distillation Boiler · ³He Evaporation & Pumping',
    sensorChannel: 'CH-4 (RuO₂)',
    attenuation: '-10 dB Cryo Attenuator',
    sensorModel: 'Ruthenium Oxide RuO₂ RX-102A',
    sensorResistance: '2,890 Ω',
    photonOccupation: '3.3 Photons',
    spectralDensity: '0.11 nV/√Hz',
    yBase: -0.3,
    desc: 'Low-temperature distillation boiler where Helium-3 vapor is selectively pumped away from superfluid Helium-4 to drive closed-cycle circulation.',
    components: 'Still electrical heater, sintered silver heat exchanger, 0.8K attenuators.',
    componentTags: ['Still Boiler Heater', 'Sintered Silver Exchanger', 'He-3 Vapor Line', '-10 dB Attenuators'],
    thermalLoad: '~5 milliWatts heater power',
    materials: 'Gold-plated brass, sintered sub-micron silver powder'
  },
  stage_cold_plate: {
    name: 'Cold Plate Stage',
    shortName: '100mK Cold Plate',
    temp: '100 milliKelvin (0.1 K)',
    tempKelvin: 0.1,
    color: '#00e5ff',
    badgeColor: 'bg-cyan-950/80 border-cyan-500/50 text-[#00e5ff]',
    role: 'Continuous Capillary Exchanger · Pre-Cooling Boundary',
    sensorChannel: 'CH-5 (RuO₂)',
    attenuation: '-10 dB Cryo Attenuator',
    sensorModel: 'Ruthenium Oxide RuO₂ RX-102A',
    sensorResistance: '4,120 Ω',
    photonOccupation: '0.09 Photons (Quantum Squeezing)',
    spectralDensity: '0.04 nV/√Hz',
    yBase: -0.9,
    desc: 'Pre-cooling boundary where circulating liquid Helium-3 passes through continuous spiral copper heat exchangers before reaching mixing.',
    components: 'Continuous spiral capillary heat exchangers, step heat exchangers.',
    componentTags: ['Spiral Capillary Exchangers', 'Step Heat Exchangers', 'CuNi Capillaries', 'Thermal Isolators'],
    thermalLoad: '~100 microWatts cooling power',
    materials: 'CuNi (Copper-Nickel) capillaries, high-conductivity OFHC copper'
  },
  stage_mixing: {
    name: 'Mixing Chamber Stage (Coldest Spot)',
    shortName: '15mK Mixing Core',
    temp: '15 milliKelvin (0.015 K)',
    tempKelvin: 0.015,
    color: '#8b5cf6',
    badgeColor: 'bg-purple-950/80 border-purple-500/50 text-purple-300',
    role: 'Thermodynamic Core · Superconducting Transmon QPU Ground State',
    sensorChannel: 'CH-6 (RuO₂)',
    attenuation: '-20 dB Attenuator + Eccosorb IR Filter',
    sensorModel: 'Calibrated Ruthenium Oxide RuO₂ RX-102A-BR',
    sensorResistance: '4,842 Ω',
    photonOccupation: '< 10⁻⁶ Photons (Pure Ground State |0⟩)',
    spectralDensity: '0.015 nV/√Hz',
    yBase: -1.5,
    desc: 'Thermodynamic core where Helium-3 crosses the phase boundary, cooling the superconducting transmon QPU chip to sub-kelvin quantum silence.',
    components: 'High-purity gold coldfinger, cryogenic mumetal magnetic shield, transmon QPU package, TWPA amplifier.',
    componentTags: ['Transmon QPU Package', 'TWPA Parametric Amp', 'Cryoperm Magnetic Can', '99.999% Gold Coldfinger'],
    thermalLoad: '~18 microWatts cooling power',
    materials: '5N purity Gold (99.999%), Cryoperm / Mu-Metal, Superconducting Aluminum'
  }
};

type ViewMode = 'gold' | 'thermal' | 'xray' | 'signal';
type FlirPalette = 'ironbow' | 'rainbow' | 'blackhot' | 'whitehot';
type SignalChannel = 'all' | 'xy_drive' | 'z_flux' | 'readout';
type QuantumGen = 'present' | 'future';
type VacuumShieldMode = 'open' | 'cutaway' | 'sealed';

// -------------------------------------------------------------
// R3F 3D Model: Dilution Refrigerator Assembly
// -------------------------------------------------------------
interface CryoSceneProps {
  viewMode: ViewMode;
  quantumGen?: QuantumGen;
  flirPalette?: FlirPalette;
  activeSignalChannel?: SignalChannel;
  selectedStageKey: string;
  onSelectStage: (key: string) => void;
  hoveredStageKey: string | null;
  onHoverStage: (key: string | null) => void;
  autoRotate: boolean;
  rotationSpeed?: number;
  cameraFocus: 'all' | 'stage_300k' | 'stage_4k' | 'stage_mixing' | 'top_view';
  targetAzimuthDeg?: number | null;
  turntableScanActive?: boolean;
  onAngleChange?: (yawDeg: number, pitchDeg: number, distance: number) => void;
  onTurntableProgress?: (deg: number) => void;
  explodeFactor: number;
  openCan: boolean;
  vacuumShieldMode?: VacuumShieldMode;
  rfSignalsActive: boolean;
  heFlowActive?: boolean;
  showHudOverlay?: boolean;
}

const CryoAssembly: React.FC<CryoSceneProps> = ({
  viewMode,
  quantumGen = 'present',
  flirPalette = 'ironbow',
  activeSignalChannel = 'all',
  selectedStageKey,
  onSelectStage,
  hoveredStageKey,
  onHoverStage,
  autoRotate,
  rotationSpeed = 1.0,
  cameraFocus,
  targetAzimuthDeg = null,
  turntableScanActive = false,
  onAngleChange,
  onTurntableProgress,
  explodeFactor,
  openCan,
  vacuumShieldMode,
  rfSignalsActive,
  heFlowActive = true,
  showHudOverlay = true
}) => {
  const effectiveShieldMode: VacuumShieldMode = vacuumShieldMode || (openCan ? 'cutaway' : 'open');
  const groupRef = useRef<THREE.Group>(null);
  const qpuCoreRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);
  const signalPulsesRef = useRef<THREE.Group>(null);
  const signalPulsesUpRef = useRef<THREE.Group>(null);
  const heFlowDownRef = useRef<THREE.Group>(null);
  const heFlowUpRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const prevFocusRef = useRef<string>(cameraFocus);
  const isFocusTransitioningRef = useRef<boolean>(false);
  const turntableSweepDegRef = useRef<number>(0);

  useEffect(() => {
    if (prevFocusRef.current !== cameraFocus) {
      prevFocusRef.current = cameraFocus;
      isFocusTransitioningRef.current = true;
    }
  }, [cameraFocus]);

  useEffect(() => {
    if (controlsRef.current) {
      const handleStart = () => {
        isFocusTransitioningRef.current = false;
      };
      controlsRef.current.addEventListener('start', handleStart);
      return () => {
        controlsRef.current?.removeEventListener('start', handleStart);
      };
    }
  }, []);

  // Cryogenic Vapor Particle Cloud Buffer Geometry (like Dashboard 3D Twin)
  const [particlesGeo] = useState(() => {
    const count = 280;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3.6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.2 - 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.6;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  });

  // Targets for camera lerping
  const targetPositions: Record<string, [number, number, number]> = {
    all: [0, 0.9, 6.4],
    stage_300k: [0, 2.3, 4.4],
    stage_4k: [0, 0.8, 4.0],
    stage_mixing: [0, -1.1, 3.6],
    top_view: [0, 6.5, 0.15]
  };

  const targetLookAts: Record<string, [number, number, number]> = {
    all: [0, -0.1, 0],
    stage_300k: [0, 1.45, 0],
    stage_4k: [0, 0.3, 0],
    stage_mixing: [0, -1.6, 0],
    top_view: [0, -0.15, 0]
  };

  // Plate definitions with y positions calculated based on explodeFactor
  const stagesList = Object.entries(THERMAL_STAGES);

  const getStageY = (yBase: number) => {
    // Explodes outward from center y=0
    return yBase * (1.0 + explodeFactor * 0.45);
  };

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.22;
    }
    if (qpuCoreRef.current) {
      qpuCoreRef.current.rotation.y += delta * 1.4;
    }
    if (signalPulsesRef.current && rfSignalsActive) {
      const time = state.clock.getElapsedTime();
      const count = signalPulsesRef.current.children.length;
      signalPulsesRef.current.children.forEach((child, idx) => {
        const speed = 0.55;
        const phase = (time * speed + (idx / count)) % 1.0;
        const yTop = getStageY(1.45);
        const yBot = getStageY(-1.5);
        const curY = yTop - phase * (yTop - yBot);
        const a = (idx * Math.PI * 2) / count + phase * Math.PI * 2.4;
        const r = 0.58 + Math.sin(phase * Math.PI * 3) * 0.09;
        child.position.set(Math.cos(a) * r, curY, Math.sin(a) * r);
      });
    }

    // Animate Upward Moving Dispersive Readout Pulses (15mK through TWPA & HEMT to 300K)
    if (signalPulsesUpRef.current && rfSignalsActive) {
      const time = state.clock.getElapsedTime();
      const count = signalPulsesUpRef.current.children.length;
      signalPulsesUpRef.current.children.forEach((child, idx) => {
        const speed = 0.7;
        const phase = (time * speed + (idx / count)) % 1.0;
        const yTop = getStageY(1.45);
        const yBot = getStageY(-1.5);
        const curY = yBot + phase * (yTop - yBot); // Upward propagation
        const a = (idx * Math.PI * 2) / count + phase * Math.PI * 1.8 + Math.PI / 3;
        const r = 0.46 + Math.cos(phase * Math.PI * 2.8) * 0.07;
        child.position.set(Math.cos(a) * r, curY, Math.sin(a) * r);
      });
    }

    // Dilution Refrigerator Thermodynamic Cycle (³He/⁴He Circulation Flow)
    if (heFlowDownRef.current && heFlowActive) {
      const time = state.clock.getElapsedTime();
      const count = heFlowDownRef.current.children.length;
      heFlowDownRef.current.children.forEach((child, idx) => {
        const speed = 0.42;
        const phase = (time * speed + (idx / count)) % 1.0;
        const yTop = getStageY(1.45);
        const yBot = getStageY(-1.5);
        const curY = yTop - phase * (yTop - yBot);
        const a = (idx * Math.PI * 0.7) + phase * Math.PI * 3.2;
        const r = 0.28 + Math.sin(phase * Math.PI * 2.5) * 0.04;
        child.position.set(Math.cos(a) * r, curY, Math.sin(a) * r);
      });
    }

    if (heFlowUpRef.current && heFlowActive) {
      const time = state.clock.getElapsedTime();
      const count = heFlowUpRef.current.children.length;
      heFlowUpRef.current.children.forEach((child, idx) => {
        const speed = 0.58;
        const phase = (time * speed + (idx / count)) % 1.0;
        const yTop = getStageY(-0.3); // Up to Still stage
        const yBot = getStageY(-1.5); // From Mixing Chamber
        const curY = yBot + phase * (yTop - yBot);
        const a = Math.PI * 0.85 + Math.sin(phase * Math.PI * 2) * 0.22;
        const r = 0.34;
        child.position.set(Math.cos(a) * r, curY, Math.sin(a) * r);
      });
    }

    // Cryogenic vapor particle floating motion (identical to Dashboard 3D Twin)
    if (particlesRef.current) {
      const positions = particlesGeo.attributes.position.array as Float32Array;
      const elapsed = state.clock.getElapsedTime();
      for (let i = 0; i < 280; i++) {
        positions[i * 3 + 1] += Math.sin(elapsed + i) * 0.0018;
      }
      particlesGeo.attributes.position.needsUpdate = true;
    }

    // 6. Camera focus lerp (ONLY during focus change transition, then releases 100% control to user)
    if (isFocusTransitioningRef.current) {
      const targetPos = targetPositions[cameraFocus] || targetPositions.all;
      const targetLook = targetLookAts[cameraFocus] || targetLookAts.all;

      state.camera.position.lerp(new THREE.Vector3(...targetPos), 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(new THREE.Vector3(...targetLook), 0.08);
        controlsRef.current.update();
      }
      if (state.camera.position.distanceTo(new THREE.Vector3(...targetPos)) < 0.04) {
        isFocusTransitioningRef.current = false;
      }
    }

    // 7. Automated 360° Turntable Scan sweep
    if (turntableScanActive && controlsRef.current) {
      const cam = state.camera;
      const tgt = controlsRef.current.target;
      const dx = cam.position.x - tgt.x;
      const dz = cam.position.z - tgt.z;
      const radius = Math.sqrt(dx * dx + dz * dz) || 6.4;
      const curY = cam.position.y;
      
      turntableSweepDegRef.current = (turntableSweepDegRef.current + delta * 36) % 360;
      const rad = (turntableSweepDegRef.current * Math.PI) / 180;
      cam.position.x = tgt.x + radius * Math.sin(rad);
      cam.position.z = tgt.z + radius * Math.cos(rad);
      controlsRef.current.update();
      if (onTurntableProgress) {
        onTurntableProgress(Math.round(turntableSweepDegRef.current));
      }
    }

    // 8. User selected target azimuth degree (Cardinal snap: 0°, 90°, 180°, 270°, or 360° slider)
    if (targetAzimuthDeg !== null && targetAzimuthDeg !== undefined && controlsRef.current && !turntableScanActive) {
      const cam = state.camera;
      const tgt = controlsRef.current.target;
      const dx = cam.position.x - tgt.x;
      const dz = cam.position.z - tgt.z;
      const radius = Math.sqrt(dx * dx + dz * dz) || 6.4;
      const curY = cam.position.y;
      const rad = (targetAzimuthDeg * Math.PI) / 180;
      const desiredX = tgt.x + radius * Math.sin(rad);
      const desiredZ = tgt.z + radius * Math.cos(rad);
      
      cam.position.lerp(new THREE.Vector3(desiredX, curY, desiredZ), 0.12);
      controlsRef.current.update();
    }

    // 9. Report live 360° yaw, elevation pitch, and distance to HUD
    if (controlsRef.current && onAngleChange) {
      const cam = state.camera;
      const tgt = controlsRef.current.target;
      const dx = cam.position.x - tgt.x;
      const dz = cam.position.z - tgt.z;
      const dy = cam.position.y - tgt.y;
      const horizDist = Math.sqrt(dx * dx + dz * dz);
      let yaw = Math.round((Math.atan2(dx, dz) * 180) / Math.PI);
      if (yaw < 0) yaw += 360;
      const pitch = Math.round((Math.atan2(dy, horizDist) * 180) / Math.PI);
      const totalDist = Math.round(cam.position.distanceTo(tgt) * 10) / 10;
      onAngleChange(yaw, pitch, totalDist);
    }
  });

  const plates = [
    { key: 'stage_300k', yBase: 1.45, radius: 1.5, height: 0.055, isTop: true, bolts: 16 },
    { key: 'stage_50k', yBase: 0.9, radius: 1.3, height: 0.048, isCopper: true, bolts: 14 },
    { key: 'stage_4k', yBase: 0.3, radius: 1.15, height: 0.044, isGold: true, bolts: 12 },
    { key: 'stage_still', yBase: -0.3, radius: 1.0, height: 0.04, isCopper: true, bolts: 10 },
    { key: 'stage_cold_plate', yBase: -0.9, radius: 0.88, height: 0.038, isGold: true, bolts: 8 },
    { key: 'stage_mixing', yBase: -1.5, radius: 0.78, height: 0.038, isMirrorGold: true, bolts: 8 }
  ];

  // Helper for plate materials (Photorealistic Cleanroom Metallurgy & FLIR Shaders)
  const getPlateMaterial = (p: typeof plates[0], isSelected: boolean) => {
    if (viewMode === 'thermal') {
      const ironbowMap: Record<string, string> = {
        stage_300k: '#ef4444',
        stage_50k: '#f97316',
        stage_4k: '#eab308',
        stage_still: '#10b981',
        stage_cold_plate: '#06b6d4',
        stage_mixing: '#7c3aed'
      };
      const rainbowMap: Record<string, string> = {
        stage_300k: '#dc2626',
        stage_50k: '#ea580c',
        stage_4k: '#84cc16',
        stage_still: '#06b6d4',
        stage_cold_plate: '#2563eb',
        stage_mixing: '#4338ca'
      };
      const blackhotMap: Record<string, string> = {
        stage_300k: '#09090b',
        stage_50k: '#27272a',
        stage_4k: '#52525b',
        stage_still: '#71717a',
        stage_cold_plate: '#a1a1aa',
        stage_mixing: '#f4f4f5'
      };
      const whitehotMap: Record<string, string> = {
        stage_300k: '#ffffff',
        stage_50k: '#d4d4d8',
        stage_4k: '#a1a1aa',
        stage_still: '#71717a',
        stage_cold_plate: '#3f3f46',
        stage_mixing: '#09090b'
      };

      const activeColorMap = flirPalette === 'rainbow' ? rainbowMap : flirPalette === 'blackhot' ? blackhotMap : flirPalette === 'whitehot' ? whitehotMap : ironbowMap;
      const baseColor = activeColorMap[p.key] || '#06b6d4';

      return (
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isSelected ? 1.7 : 0.95}
          metalness={0.85}
          roughness={0.14}
        />
      );
    }

    if (viewMode === 'xray') {
      return (
        <meshStandardMaterial
          color={isSelected ? '#00ffff' : '#0284c7'}
          emissive={isSelected ? '#00e5ff' : '#0369a1'}
          emissiveIntensity={isSelected ? 1.6 : 0.55}
          transparent
          opacity={0.32}
          wireframe
        />
      );
    }

    if (viewMode === 'signal') {
      return (
        <meshStandardMaterial
          color="#020617"
          metalness={0.99}
          roughness={0.18}
          emissive={isSelected ? '#00e5ff' : '#0f172a'}
          emissiveIntensity={isSelected ? 1.5 : 0.25}
        />
      );
    }

    // Photorealistic Metallic Gold & Copper (Cleanroom Metallurgy PBR)
    if (p.isTop) {
      // 316L Austenitic Stainless Steel Room Temperature Flange
      return (
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.99}
          roughness={0.06}
          emissive={isSelected ? '#00e5ff' : '#1e293b'}
          emissiveIntensity={isSelected ? 0.65 : 0.04}
        />
      );
    }

    if (p.isCopper) {
      // High-Purity OFHC Copper (Cu-OFE, RRR=100)
      return (
        <meshStandardMaterial
          color="#c2410c"
          metalness={0.98}
          roughness={0.06}
          emissive={isSelected ? '#f59e0b' : '#78350f'}
          emissiveIntensity={isSelected ? 0.8 : 0.22}
        />
      );
    }

    // 24K Mirror Electroplated Gold (5 μm high-spec mirror)
    return (
      <meshStandardMaterial
        color="#fef08a"
        metalness={0.99}
        roughness={0.03}
        emissive={isSelected ? '#00e5ff' : '#d97706'}
        emissiveIntensity={isSelected ? 0.85 : 0.3}
      />
    );
  };

  // Helper for structural column, rods, and bellows
  const getStructuralMaterial = (accent: 'steel' | 'titanium' | 'gold' = 'steel') => {
    if (viewMode === 'xray') {
      return (
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.6}
          transparent
          opacity={0.25}
          wireframe
        />
      );
    }
    if (viewMode === 'signal') {
      return (
        <meshStandardMaterial
          color="#030712"
          metalness={0.98}
          roughness={0.25}
          emissive="#0a0f1d"
          emissiveIntensity={0.2}
        />
      );
    }
    if (viewMode === 'thermal') {
      return (
        <meshStandardMaterial
          color="#0891b2"
          metalness={0.85}
          roughness={0.2}
          emissive="#06b6d4"
          emissiveIntensity={0.4}
        />
      );
    }
    if (accent === 'gold') {
      return <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />;
    }
    if (accent === 'titanium') {
      return <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />;
    }
    return <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.12} />;
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.6}
        maxDistance={12.0}
        maxPolarAngle={Math.PI - 0.04}
        minPolarAngle={0.04}
        autoRotate={autoRotate && !turntableScanActive}
        autoRotateSpeed={rotationSpeed * 1.5}
      />

      {/* Cinematic Studio Lighting */}
      <ambientLight intensity={1.6} />
      <directionalLight position={[6, 14, 8]} intensity={3.6} color="#fef08a" />
      <directionalLight position={[-6, -4, 4]} intensity={2.8} color="#00e5ff" />
      <directionalLight position={[0, -8, -6]} intensity={1.5} color="#3b82f6" />
      <pointLight position={[0, getStageY(-1.5) - 0.3, 0]} intensity={4.2} distance={8} color="#00e5ff" />
      <pointLight position={[0, getStageY(0.3), 0]} intensity={2.4} distance={6} color="#f59e0b" />

      {/* Dark Metallic Pedestal Platform with Concentric Cyan Neon Rings */}
      <group position={[0, -2.15, 0]}>
        {/* Main Base Mirror Disc */}
        <mesh>
          <cylinderGeometry args={[3.4, 3.4, 0.08, 64]} />
          <meshStandardMaterial color="#040914" metalness={0.98} roughness={0.12} />
        </mesh>

        {/* Concentric Neon Rings */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
          <ringGeometry args={[1.6, 1.63, 64]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
          <ringGeometry args={[2.5, 2.53, 64]} />
          <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} />
        </mesh>

        {/* Radial Floor Markings */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh key={deg} position={[Math.cos(rad) * 2.05, 0.044, Math.sin(rad) * 2.05]} rotation={[-Math.PI / 2, 0, -rad]}>
              <planeGeometry args={[0.02, 0.45]} />
              <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} />
            </mesh>
          );
        })}

        {/* Base Chrome Mount */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.8, 0.9, 0.32, 48]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.08} />
        </mesh>
      </group>

      {/* Refrigerator Assembly Group */}
      <group ref={groupRef} position={[0, 0.35, 0]}>
        
        {/* Cryogenic Vapor / Fog Dispersion Particle Cloud (Digital Twin) */}
        <points ref={particlesRef} geometry={particlesGeo}>
          <pointsMaterial
            color="#00e5ff"
            size={0.036}
            transparent
            opacity={0.32}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Pulse Tube Cooler Regenerator Cylinder (Stage 300K to 4K) */}
        <group position={[0.62, getStageY(0.72), 0.22]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.85 * (1 + explodeFactor * 0.3), 24]} />
            {getStructuralMaterial('titanium')}
          </mesh>
          {/* Cooling fins */}
          {[-0.25, -0.1, 0.05, 0.2].map((fy, fIdx) => (
            <mesh key={`pt_fin_${fIdx}`} position={[0, fy, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
              {getStructuralMaterial('steel')}
            </mesh>
          ))}
        </group>

        {/* Central Structural Column */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 3.6 * (1 + explodeFactor * 0.4), 32]} />
          {getStructuralMaterial('steel')}
        </mesh>

        {/* 3 Structural Vertical Support Rods with Flexure Couplings */}
        {[0, 1, 2].map(i => {
          const angle = (i * Math.PI * 2) / 3;
          const x = Math.cos(angle) * 0.72;
          const z = Math.sin(angle) * 0.72;
          return (
            <group key={i} position={[x, -0.1, z]}>
              <mesh>
                <cylinderGeometry args={[0.024, 0.024, 3.3 * (1 + explodeFactor * 0.4), 16]} />
                {getStructuralMaterial('titanium')}
              </mesh>
              {/* Vibration damping collars */}
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
                {getStructuralMaterial('gold')}
              </mesh>
              <mesh position={[0, -0.6, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
                {getStructuralMaterial('gold')}
              </mesh>
            </group>
          );
        })}

        {/* Flexible Still Pumping Bellows (Corrugated line) */}
        <mesh position={[-0.35, getStageY(-0.05), 0.25]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2 * (1 + explodeFactor * 0.4), 24]} />
          {getStructuralMaterial('titanium')}
        </mesh>

        {/* Metallic Cryogenic Plates with Bolt Circles */}
        {plates.map(p => {
          const isSelected = selectedStageKey === p.key;
          const y = getStageY(p.yBase);
          return (
            <group key={p.key} position={[0, y, 0]}>
              
              {/* Main Plate Body */}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  playGateClickSound(700);
                  onSelectStage(p.key);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                <cylinderGeometry args={[p.radius, p.radius, p.height, 64]} />
                {getPlateMaterial(p, isSelected)}
              </mesh>

              {/* Gold/Copper Outer Beveled Rim */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[p.radius, 0.022, 16, 64]} />
                <meshStandardMaterial
                  color={p.isCopper ? '#ea580c' : '#fef08a'}
                  metalness={0.98}
                  roughness={0.06}
                  emissive={isSelected ? '#00e5ff' : '#d97706'}
                  emissiveIntensity={isSelected ? 0.75 : 0.25}
                />
              </mesh>

              {/* Bolt Circles around Rim (Conflat flange appearance) */}
              {Array.from({ length: p.bolts }).map((_, bIdx) => {
                const bAngle = (bIdx * Math.PI * 2) / p.bolts;
                const bx = Math.cos(bAngle) * (p.radius - 0.045);
                const bz = Math.sin(bAngle) * (p.radius - 0.045);
                return (
                  <mesh key={bIdx} position={[bx, p.height / 2 + 0.005, bz]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.012, 8]} />
                    <meshStandardMaterial color="#f1f5f9" metalness={0.99} roughness={0.05} />
                  </mesh>
                );
              })}

              {/* Glowing Indicator Ring if Active */}
              {isSelected && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, p.height / 2 + 0.01, 0]}>
                  <ringGeometry args={[p.radius * 0.72, p.radius * 0.78, 48]} />
                  <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} />
                </mesh>
              )}

              {/* Braided copper ground straps bridging adjacent plates */}
              {p.key !== 'stage_mixing' && (
                <mesh position={[Math.cos(p.key.length) * (p.radius - 0.15), -0.15, Math.sin(p.key.length) * (p.radius - 0.15)]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
                  <meshStandardMaterial color="#ea580c" metalness={0.92} roughness={0.3} />
                </mesh>
              )}

            </group>
          );
        })}

        {/* Superconducting Semi-Rigid Coaxial Cables (Present Gen: 6 Cyan + 6 Golden Lines) */}
        {quantumGen === 'present' && [0, 1, 2, 3, 4, 5].map(line => {
          const angleOffset = (line * Math.PI * 2) / 6;
          const points: THREE.Vector3[] = [];
          for (let step = 0; step <= 80; step++) {
            const t = step / 80;
            const yTop = getStageY(1.45);
            const yBot = getStageY(-1.5);
            const y = yTop - t * (yTop - yBot);
            const r = 0.58 + Math.sin(t * Math.PI * 3 + line) * 0.08;
            const a = angleOffset + t * Math.PI * 2.4;
            points.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          return (
            <mesh key={`cyan_coax_${line}`}>
              <tubeGeometry args={[curve, 64, 0.014, 8, false]} />
              <meshStandardMaterial
                color="#00e5ff"
                metalness={0.92}
                roughness={0.15}
                emissive="#00e5ff"
                emissiveIntensity={viewMode === 'signal' ? 2.4 : 1.6}
              />
            </mesh>
          );
        })}

        {/* Golden Copper Flux-Bias & Microwave Drive Lines (Present Gen) */}
        {quantumGen === 'present' && [0, 1, 2, 3, 4, 5].map(line => {
          const angleOffset = (line * Math.PI * 2) / 6 + Math.PI / 6;
          const points: THREE.Vector3[] = [];
          for (let step = 0; step <= 80; step++) {
            const t = step / 80;
            const yTop = getStageY(1.45);
            const yBot = getStageY(-1.5);
            const y = yTop - t * (yTop - yBot);
            const r = 0.46 + Math.cos(t * Math.PI * 2.8 + line) * 0.07;
            const a = angleOffset + t * Math.PI * 2.1;
            points.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          return (
            <mesh key={`gold_line_${line}`}>
              <tubeGeometry args={[curve, 64, 0.013, 8, false]} />
              <meshStandardMaterial
                color={viewMode === 'signal' ? '#00e5ff' : '#f59e0b'}
                metalness={0.94}
                roughness={0.12}
                emissive={viewMode === 'signal' ? '#00e5ff' : '#f59e0b'}
                emissiveIntensity={viewMode === 'signal' ? 2.6 : 1.4}
              />
            </mesh>
          );
        })}

        {/* Future Architecture: High-Density Flexible Superconducting Ribbon Striplines */}
        {quantumGen === 'future' && [0, 1, 2, 3].map(stripIdx => {
          const angleOffset = (stripIdx * Math.PI) / 2;
          const points: THREE.Vector3[] = [];
          for (let step = 0; step <= 80; step++) {
            const t = step / 80;
            const yTop = getStageY(1.45);
            const yBot = getStageY(-1.5);
            const y = yTop - t * (yTop - yBot);
            const r = 0.52 + Math.sin(t * Math.PI * 2) * 0.05;
            const a = angleOffset + t * Math.PI * 1.2;
            points.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          return (
            <group key={`future_ribbon_${stripIdx}`}>
              {/* Polyimide Substrate Ribbon */}
              <mesh>
                <tubeGeometry args={[curve, 64, 0.038, 4, false]} />
                <meshStandardMaterial
                  color="#1e1b4b"
                  metalness={0.7}
                  roughness={0.3}
                  transparent
                  opacity={0.88}
                />
              </mesh>
              {/* High-Density Luminous Superconducting Traces */}
              <mesh>
                <tubeGeometry args={[curve, 64, 0.018, 4, false]} />
                <meshStandardMaterial
                  color="#c084fc"
                  metalness={0.95}
                  roughness={0.1}
                  emissive="#a855f7"
                  emissiveIntensity={2.2}
                />
              </mesh>
            </group>
          );
        })}

        {/* Future Architecture: 4K Stage Cryo-CMOS Quantum Controller Modules */}
        {quantumGen === 'future' && [-0.65, 0.65].map((cx, cIdx) => (
          <group key={`cryocmos_${cIdx}`} position={[cx, getStageY(0.3) + 0.06, 0.2]}>
            {/* Ceramic Chip Package */}
            <mesh>
              <boxGeometry args={[0.22, 0.04, 0.16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.4} />
            </mesh>
            {/* Micro-Finned Heat Sink */}
            {[-0.07, -0.02, 0.03, 0.08].map((fx, fIdx) => (
              <mesh key={`fin_${fIdx}`} position={[fx, 0.035, 0]}>
                <boxGeometry args={[0.012, 0.04, 0.14]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
              </mesh>
            ))}
            {/* Status Telemetry LED */}
            <mesh position={[0, 0.025, 0.07]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>
        ))}

        {/* Future Architecture: Cryogenic Optical Fiber Readout Link */}
        {quantumGen === 'future' && (() => {
          const fiberPoints: THREE.Vector3[] = [];
          for (let step = 0; step <= 50; step++) {
            const t = step / 50;
            const yTop = getStageY(1.45);
            const yBot = getStageY(-1.5);
            const y = yTop - t * (yTop - yBot);
            const a = -Math.PI / 4 + Math.sin(t * Math.PI * 1.5) * 0.15;
            const r = 0.44;
            fiberPoints.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
          }
          const fiberCurve = new THREE.CatmullRomCurve3(fiberPoints);
          return (
            <mesh key="optical_fiber_link">
              <tubeGeometry args={[fiberCurve, 48, 0.007, 6, false]} />
              <meshStandardMaterial
                color="#38bdf8"
                metalness={0.3}
                roughness={0.05}
                transparent
                opacity={0.75}
                emissive="#00e5ff"
                emissiveIntensity={2.5}
              />
            </mesh>
          );
        })()}

        {/* Continuous ³He Condensation Capillary Tube (Helium Cooling Circuit) */}
        {(() => {
          const capPoints: THREE.Vector3[] = [];
          for (let step = 0; step <= 60; step++) {
            const t = step / 60;
            const yTop = getStageY(1.45);
            const yBot = getStageY(-1.5);
            const y = yTop - t * (yTop - yBot);
            const a = t * Math.PI * 4.2;
            const r = 0.28 + Math.sin(t * Math.PI * 2.5) * 0.04;
            capPoints.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
          }
          const capCurve = new THREE.CatmullRomCurve3(capPoints);
          return (
            <mesh key="he_condensation_line">
              <tubeGeometry args={[capCurve, 64, 0.009, 8, false]} />
              <meshStandardMaterial
                color="#f59e0b"
                metalness={0.96}
                roughness={0.08}
                emissive="#d97706"
                emissiveIntensity={heFlowActive ? 1.2 : 0.3}
              />
            </mesh>
          );
        })()}

        {/* Continuous Dilute ³He Vapor Pumping Return Tube (Mixing Chamber to Still) */}
        {(() => {
          const retPoints: THREE.Vector3[] = [];
          for (let step = 0; step <= 30; step++) {
            const t = step / 30;
            const yTop = getStageY(-0.3);
            const yBot = getStageY(-1.5);
            const y = yBot + t * (yTop - yBot);
            const a = Math.PI * 0.85 + Math.sin(t * Math.PI) * 0.15;
            const r = 0.34;
            retPoints.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
          }
          const retCurve = new THREE.CatmullRomCurve3(retPoints);
          return (
            <mesh key="he_vapor_return_line">
              <tubeGeometry args={[retCurve, 32, 0.012, 8, false]} />
              <meshStandardMaterial
                color="#0284c7"
                metalness={0.92}
                roughness={0.15}
                emissive="#00e5ff"
                emissiveIntensity={heFlowActive ? 1.4 : 0.3}
              />
            </mesh>
          );
        })()}

        {/* RF Microwave Attenuator Network at 50K, 4K, 100mK, and 15mK */}
        {quantumGen === 'present' && [
          { y: getStageY(0.9) - 0.08, label: '-20dB', r: 0.58 },
          { y: getStageY(0.3) - 0.08, label: '-10dB', r: 0.58 },
          { y: getStageY(-0.9) - 0.08, label: '-10dB', r: 0.52 },
          { y: getStageY(-1.5) + 0.12, label: '-20dB', r: 0.48 }
        ].map((att, aIdx) => (
          <group key={aIdx} position={[att.r, att.y, 0]}>
            <mesh>
              <cylinderGeometry args={[0.028, 0.028, 0.1, 16]} />
              <meshStandardMaterial color="#fef08a" metalness={0.96} roughness={0.1} />
            </mesh>
            {/* Cyan indicator ring */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.02, 16]} />
              <meshBasicMaterial color="#00e5ff" />
            </mesh>
          </group>
        ))}

        {/* 4K Cryo HEMT Low-Noise Amplifiers (Blocks on 4K Stage) */}
        {[0, 1].map(h => {
          const a = h * Math.PI + Math.PI / 4;
          return (
            <group key={`hemt_${h}`} position={[Math.cos(a) * 0.7, getStageY(0.3) + 0.08, Math.sin(a) * 0.7]}>
              <mesh>
                <boxGeometry args={[0.16, 0.09, 0.11]} />
                <meshStandardMaterial
                  color="#0284c7"
                  metalness={0.9}
                  roughness={0.2}
                  emissive="#00e5ff"
                  emissiveIntensity={0.8}
                />
              </mesh>
              {/* Gold SMA connectors */}
              <mesh position={[0.09, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.04, 12]} />
                <meshStandardMaterial color="#fef08a" metalness={0.98} roughness={0.1} />
              </mesh>
              <mesh position={[-0.09, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.04, 12]} />
                <meshStandardMaterial color="#fef08a" metalness={0.98} roughness={0.1} />
              </mesh>
            </group>
          );
        })}

        {/* 300K Hermetic SMA Microwave Bulkhead Feedthroughs */}
        {[0, 1, 2, 3, 4, 5].map(smaIdx => {
          const a = (smaIdx * Math.PI * 2) / 6;
          const r = 1.15;
          return (
            <group key={`sma_feed_${smaIdx}`} position={[Math.cos(a) * r, getStageY(1.45) + 0.04, Math.sin(a) * r]}>
              <mesh>
                <cylinderGeometry args={[0.02, 0.02, 0.04, 12]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.08} />
              </mesh>
              <mesh position={[0, 0.025, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.015, 8]} />
                <meshStandardMaterial color="#fef08a" metalness={0.99} roughness={0.02} />
              </mesh>
            </group>
          );
        })}

        {/* 0.8K Still Stage Sintered Silver Heat Exchanger Drum */}
        <group position={[0.32, getStageY(-0.3) - 0.07, -0.22]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Heater resistor cylinder */}
          <mesh position={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.08, 12]} />
            <meshStandardMaterial color="#ea580c" metalness={0.88} roughness={0.2} emissive="#f97316" emissiveIntensity={0.4} />
          </mesh>
        </group>

        {/* 100mK Cold Plate Continuous Spiral Capillary Exchanger Coils */}
        <group position={[0, getStageY(-0.9) - 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.42, 0.025, 12, 48]} />
            <meshStandardMaterial color="#b45309" metalness={0.94} roughness={0.12} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.26, 0.022, 12, 36]} />
            <meshStandardMaterial color="#d97706" metalness={0.94} roughness={0.12} />
          </mesh>
        </group>

        {/* 15 mK Mixing Chamber TWPA (Parametric Amp) */}
        <group position={[0.38, getStageY(-1.5) + 0.15, 0.22]}>
          <mesh>
            <boxGeometry args={[0.14, 0.2, 0.09]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.95}
              roughness={0.1}
              emissive="#f59e0b"
              emissiveIntensity={1.3}
            />
          </mesh>
          {/* Signal status LED */}
          <mesh position={[0, 0.08, 0.05]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
        </group>

        {/* 15 mK Cryogenic Microwave Ferrite Circulator */}
        <group position={[-0.35, getStageY(-1.5) + 0.12, 0.18]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 24]} />
            <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.15} emissive="#0284c7" emissiveIntensity={0.3} />
          </mesh>
          {/* 3 SMA ports (In, Out, 50-ohm load) */}
          {[0, 1, 2].map(portIdx => {
            const pAngle = (portIdx * Math.PI * 2) / 3;
            return (
              <mesh key={`circ_port_${portIdx}`} position={[Math.cos(pAngle) * 0.075, 0, Math.sin(pAngle) * 0.075]}>
                <cylinderGeometry args={[0.014, 0.014, 0.025, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.06} />
              </mesh>
            );
          })}
        </group>

        {/* 4K Cryogenic Ferrite Isolator */}
        <group position={[-0.42, getStageY(0.3) + 0.08, -0.28]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.07, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.2} emissive="#00e5ff" emissiveIntensity={0.2} />
          </mesh>
          {/* 2 SMA In/Out ports */}
          {[-0.085, 0.085].map((px, pIdx) => (
            <mesh key={`iso_port_${pIdx}`} position={[px, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.06} />
            </mesh>
          ))}
        </group>

        {/* Bottom 15 mK Mixing Chamber Magnetic Shield Enclosure (QPU Can) */}
        <group position={[0, getStageY(-1.5) - 0.26, 0]}>
          {/* Cryoperm / Mu-Metal Outer Magnetic Shield Canister with Matching Cutaway */}
          <mesh>
            <cylinderGeometry
              args={[
                0.38,
                0.38,
                0.48,
                32,
                1,
                true,
                effectiveShieldMode === 'cutaway' ? Math.PI * 0.25 : 0,
                effectiveShieldMode === 'cutaway' ? Math.PI * 1.5 : Math.PI * 2
              ]}
            />
            <meshStandardMaterial
              color={viewMode === 'xray' ? '#00e5ff' : '#0284c7'}
              metalness={0.94}
              roughness={0.12}
              transparent={effectiveShieldMode === 'cutaway' || viewMode === 'xray'}
              opacity={effectiveShieldMode === 'cutaway' ? 0.72 : viewMode === 'xray' ? 0.22 : 0.94}
              wireframe={viewMode === 'xray'}
              emissive="#00e5ff"
              emissiveIntensity={viewMode === 'xray' ? 0.9 : 0.15}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Internal High-Purity 5N Gold Coldfinger Mounting Block */}
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 24]} />
            <meshStandardMaterial color="#fef08a" metalness={0.99} roughness={0.04} emissive="#d97706" emissiveIntensity={0.5} />
          </mesh>

          {/* Mixing Chamber Liquid ³He / ⁴He Phase Separation Boundary */}
          <group position={[0, 0.045, 0]}>
            {/* Concentrated ³He Upper Phase Meniscus (Pure 100% He3) */}
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.02, 24]} />
              <meshStandardMaterial
                color="#f59e0b"
                transparent
                opacity={0.45}
                roughness={0.1}
                emissive="#d97706"
                emissiveIntensity={0.6}
              />
            </mesh>
            {/* Dilute Phase Lower Bath (6.6% He3 in He4 Superfluid) */}
            <mesh position={[0, -0.012, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.02, 24]} />
              <meshStandardMaterial
                color="#06b6d4"
                transparent
                opacity={0.45}
                roughness={0.1}
                emissive="#0891b2"
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>

          {/* Chip Carrier Socket Package (High-Density Multi-Pin Interconnect) */}
          <mesh position={[0, -0.01, 0]}>
            <boxGeometry args={[0.26, 0.028, 0.26]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Gold Wirebond Pads Ring around perimeter */}
          {[0, 1, 2, 3].map(side => (
            <group key={`pads_side_${side}`} rotation={[0, (side * Math.PI) / 2, 0]}>
              {[-0.09, -0.045, 0, 0.045, 0.09].map((px, pIdx) => (
                <mesh key={pIdx} position={[px, 0.007, 0.115]}>
                  <boxGeometry args={[0.018, 0.008, 0.015]} />
                  <meshStandardMaterial color="#fef08a" metalness={0.99} roughness={0.02} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Microscopic Arched Gold Wirebonds connecting carrier to chip die */}
          {[0, 1, 2, 3].map(side => (
            <group key={`wirebonds_side_${side}`} rotation={[0, (side * Math.PI) / 2, 0]}>
              {[-0.065, -0.022, 0.022, 0.065].map((wx, wIdx) => (
                <mesh key={`wb_${wIdx}`} position={[wx, 0.016, 0.102]} rotation={[0.42, 0, 0]}>
                  <cylinderGeometry args={[0.002, 0.002, 0.032, 6]} />
                  <meshStandardMaterial color="#fef08a" metalness={0.99} roughness={0.02} emissive="#f59e0b" emissiveIntensity={0.8} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Quantum Processing Core: Present Gen Multi-Qubit Transmon Lattice vs Future Gen 4-Tile Cluster */}
          {quantumGen === 'present' ? (
            /* Rotating Sapphire Substrate Die with Superconducting Coplanar Waveguides & 5-Qubit Transmon Lattice */
            <group ref={qpuCoreRef} position={[0, 0.012, 0]}>
              {/* Sapphire substrate die */}
              <mesh>
                <boxGeometry args={[0.18, 0.012, 0.18]} />
                <meshStandardMaterial
                  color="#090d16"
                  metalness={0.95}
                  roughness={0.08}
                  emissive="#00e5ff"
                  emissiveIntensity={0.35}
                />
              </mesh>

              {/* Center Transmon Qubit Cross */}
              <mesh position={[0, 0.008, 0]}>
                <boxGeometry args={[0.05, 0.003, 0.012]} />
                <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.0} />
              </mesh>
              <mesh position={[0, 0.008, 0]}>
                <boxGeometry args={[0.012, 0.003, 0.05]} />
                <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.0} />
              </mesh>

              {/* 4 Peripheral Transmon Qubits (Cross Lattice) */}
              {[[-0.055, 0], [0.055, 0], [0, -0.055], [0, 0.055]].map(([qx, qz], qIdx) => (
                <group key={`qubit_${qIdx}`} position={[qx, 0.008, qz]}>
                  <mesh>
                    <boxGeometry args={[0.032, 0.0025, 0.008]} />
                    <meshStandardMaterial color="#38bdf8" emissive="#00e5ff" emissiveIntensity={2.6} />
                  </mesh>
                  <mesh>
                    <boxGeometry args={[0.008, 0.0025, 0.032]} />
                    <meshStandardMaterial color="#38bdf8" emissive="#00e5ff" emissiveIntensity={2.6} />
                  </mesh>
                </group>
              ))}

              {/* Coplanar Waveguide (CPW) Meander Resonators Connecting Qubits */}
              {[
                { start: [-0.028, 0], end: [-0.04, 0] },
                { start: [0.028, 0], end: [0.04, 0] },
                { start: [0, -0.028], end: [0, -0.04] },
                { start: [0, 0.028], end: [0, 0.04] }
              ].map((line, lIdx) => (
                <mesh key={`cpw_${lIdx}`} position={[(line.start[0] + line.end[0]) / 2, 0.0075, (line.start[1] + line.end[1]) / 2]}>
                  <boxGeometry args={[0.018, 0.002, 0.004]} />
                  <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2.4} />
                </mesh>
              ))}

              {/* Corner Flux Bias Loops */}
              {[[-0.065, -0.065], [0.065, -0.065], [-0.065, 0.065], [0.065, 0.065]].map(([cx, cz], cIdx) => (
                <mesh key={`flux_${cIdx}`} position={[cx, 0.008, cz]}>
                  <boxGeometry args={[0.018, 0.003, 0.018]} />
                  <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={1.8} />
                </mesh>
              ))}
            </group>
          ) : (
            /* Future Architecture: 4-Tile Multi-Core QPU Cluster with Quantum Couplers */
            <group ref={qpuCoreRef} position={[0, 0.012, 0]}>
              {[[-0.048, -0.048], [0.048, -0.048], [-0.048, 0.048], [0.048, 0.048]].map(([tx, tz], tileIdx) => (
                <group key={`tile_${tileIdx}`} position={[tx, 0, tz]}>
                  <mesh>
                    <boxGeometry args={[0.085, 0.012, 0.085]} />
                    <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.1} emissive="#c084fc" emissiveIntensity={0.6} />
                  </mesh>
                  {/* Local Transmon Junctions */}
                  <mesh position={[0, 0.008, 0]}>
                    <boxGeometry args={[0.045, 0.004, 0.015]} />
                    <meshStandardMaterial color="#38bdf8" emissive="#00e5ff" emissiveIntensity={3.0} />
                  </mesh>
                </group>
              ))}
              {/* Coherent Inter-Tile Quantum Bus Couplers */}
              <mesh position={[0, 0.008, 0]}>
                <boxGeometry args={[0.11, 0.003, 0.01]} />
                <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={2.8} />
              </mesh>
              <mesh position={[0, 0.008, 0]}>
                <boxGeometry args={[0.01, 0.003, 0.11]} />
                <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={2.8} />
              </mesh>
            </group>
          )}

          {/* Sub-Kelvin Quantum Entanglement Breathing Coherence Aura */}
          <mesh position={[0, 0.01, 0]}>
            <sphereGeometry args={[0.21, 24, 24]} />
            <meshStandardMaterial
              color="#00e5ff"
              transparent
              opacity={0.18}
              emissive="#00e5ff"
              emissiveIntensity={2.0}
              wireframe={viewMode === 'xray'}
            />
          </mesh>

          {/* Superconducting Quantum Bloch Sphere Coordinate Rings */}
          <group position={[0, 0.01, 0]}>
            {/* Equatorial Superposition Ring (|0⟩+|1⟩)/√2 */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.205, 0.0028, 12, 48]} />
              <meshBasicMaterial color="#00e5ff" />
            </mesh>
            {/* Polar Meridian Precession Ring */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[0.205, 0.0028, 12, 48]} />
              <meshBasicMaterial color="#c084fc" />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.205, 0.0022, 12, 48]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        </group>

        {/* Dilution Refrigerator ³He/⁴He Circulation Flow Condensation Droplets */}
        {heFlowActive && (
          <group ref={heFlowDownRef}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(hIdx => (
              <mesh key={`he_down_${hIdx}`}>
                <sphereGeometry args={[0.026, 12, 12]} />
                <meshBasicMaterial color="#f59e0b" />
              </mesh>
            ))}
          </group>
        )}

        {/* Dilution Refrigerator Dilute ³He Vapor Return Droplets */}
        {heFlowActive && (
          <group ref={heFlowUpRef}>
            {[0, 1, 2, 3, 4, 5].map(hIdx => (
              <mesh key={`he_up_${hIdx}`}>
                <sphereGeometry args={[0.024, 12, 12]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
            ))}
          </group>
        )}

        {/* Downward Drive Pulses traveling along coax lines (if rfSignalsActive) */}
        {rfSignalsActive && (
          <group ref={signalPulsesRef}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(pIdx => {
              const a = (pIdx * Math.PI * 2) / 8;
              return (
                <mesh key={`pulse_${pIdx}`} position={[Math.cos(a) * 0.58, getStageY(0.2), Math.sin(a) * 0.58]}>
                  <sphereGeometry args={[0.038, 16, 16]} />
                  <meshBasicMaterial color={pIdx % 2 === 0 ? '#00e5ff' : '#ffffff'} />
                </mesh>
              );
            })}
          </group>
        )}

        {/* Upward Dispersive Readout Pulses traveling along coax lines (if rfSignalsActive) */}
        {rfSignalsActive && (
          <group ref={signalPulsesUpRef}>
            {[0, 1, 2, 3].map(pIdx => {
              const a = (pIdx * Math.PI * 2) / 4 + Math.PI / 4;
              return (
                <mesh key={`readout_pulse_${pIdx}`} position={[Math.cos(a) * 0.46, getStageY(-0.6), Math.sin(a) * 0.46]}>
                  <sphereGeometry args={[0.042, 16, 16]} />
                  <meshBasicMaterial color={pIdx % 2 === 0 ? '#c084fc' : '#38bdf8'} />
                </mesh>
              );
            })}
          </group>
        )}

        {/* Multi-Layer Outer Vacuum Canister (OVC) & Thermal Radiation Shields */}
        {effectiveShieldMode !== 'open' && (
          <group position={[0, getStageY(-0.05), 0]}>
            {/* 1. 300K Outer Vacuum Chamber (OVC) Cylinder (AISI 316L Stainless Steel) */}
            <mesh>
              <cylinderGeometry
                args={[
                  1.58,
                  1.58,
                  3.4 * (1 + explodeFactor * 0.38),
                  48,
                  1,
                  true,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 0.25 : 0,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 1.5 : Math.PI * 2
                ]}
              />
              {viewMode === 'xray' ? (
                <meshStandardMaterial
                  color="#00e5ff"
                  emissive="#00e5ff"
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.16}
                  wireframe
                  side={THREE.DoubleSide}
                />
              ) : viewMode === 'thermal' ? (
                <meshStandardMaterial
                  color="#ef4444"
                  emissive="#ef4444"
                  emissiveIntensity={0.8}
                  metalness={0.9}
                  roughness={0.2}
                  side={THREE.DoubleSide}
                />
              ) : (
                <meshStandardMaterial
                  color="#e2e8f0"
                  metalness={0.98}
                  roughness={0.1}
                  transparent={effectiveShieldMode === 'cutaway'}
                  opacity={effectiveShieldMode === 'cutaway' ? 0.88 : 0.96}
                  side={THREE.DoubleSide}
                />
              )}
            </mesh>

            {/* OVC Top Vacuum Flange Collar with Bolting Pattern */}
            <mesh position={[0, 1.7 * (1 + explodeFactor * 0.38), 0]}>
              <cylinderGeometry
                args={[
                  1.64,
                  1.64,
                  0.07,
                  48,
                  1,
                  true,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 0.25 : 0,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 1.5 : Math.PI * 2
                ]}
              />
              <meshStandardMaterial color="#cbd5e1" metalness={0.99} roughness={0.06} side={THREE.DoubleSide} />
            </mesh>

            {/* KF40 Vacuum Forepump Port on Side of OVC */}
            <group position={[effectiveShieldMode === 'cutaway' ? -1.58 : 0, 0.8, effectiveShieldMode === 'cutaway' ? 0 : 1.58]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.08, 0.08, 0.18, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.96} roughness={0.1} />
              </mesh>
            </group>

            {/* 2. 50K Thermal Radiation Shield (Gold / Aluminized Mylar Heat Reflective Barrier) */}
            <mesh position={[0, -0.2 * (1 + explodeFactor * 0.38), 0]}>
              <cylinderGeometry
                args={[
                  1.35,
                  1.35,
                  2.9 * (1 + explodeFactor * 0.38),
                  40,
                  1,
                  true,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 0.27 : 0,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 1.46 : Math.PI * 2
                ]}
              />
              {viewMode === 'xray' ? (
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} transparent opacity={0.14} wireframe side={THREE.DoubleSide} />
              ) : viewMode === 'thermal' ? (
                <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} metalness={0.92} roughness={0.18} side={THREE.DoubleSide} />
              ) : (
                <meshStandardMaterial color="#f59e0b" metalness={0.96} roughness={0.12} transparent opacity={0.78} side={THREE.DoubleSide} />
              )}
            </mesh>

            {/* 3. 4K Thermal Intercept Shield (OFHC Copper / Superconducting Lead Plated) */}
            <mesh position={[0, -0.45 * (1 + explodeFactor * 0.38), 0]}>
              <cylinderGeometry
                args={[
                  1.18,
                  1.18,
                  2.3 * (1 + explodeFactor * 0.38),
                  36,
                  1,
                  true,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 0.29 : 0,
                  effectiveShieldMode === 'cutaway' ? Math.PI * 1.42 : Math.PI * 2
                ]}
              />
              {viewMode === 'xray' ? (
                <meshStandardMaterial color="#818cf8" emissive="#4338ca" emissiveIntensity={0.5} transparent opacity={0.14} wireframe side={THREE.DoubleSide} />
              ) : viewMode === 'thermal' ? (
                <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.8} metalness={0.92} roughness={0.16} side={THREE.DoubleSide} />
              ) : (
                <meshStandardMaterial color="#c2410c" metalness={0.97} roughness={0.1} transparent opacity={0.72} side={THREE.DoubleSide} />
              )}
            </mesh>

            {/* Fused-Silica Optical Viewport Window into Mixing Chamber Level */}
            <group position={[0, getStageY(-1.5) - getStageY(-0.05), 1.58]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.18, 0.18, 0.05, 24]} />
                <meshStandardMaterial color="#0f172a" metalness={0.99} roughness={0.05} />
              </mesh>
              {/* Optical Glass Lens */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.13, 0.13, 0.015, 24]} />
                <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.02} emissive="#00e5ff" emissiveIntensity={0.3} />
              </mesh>
            </group>
          </group>
        )}

      </group>
    </>
  );
};

// -------------------------------------------------------------
// Photorealistic Dashboard Chandelier with Interactive Controls
// -------------------------------------------------------------
interface PhotorealisticChandelierProps {
  viewMode: ViewMode;
  isRotating: boolean;
  rotationSpeed: number;
  rotationDirection: 'cw' | 'ccw';
  cameraFocus: 'all' | 'stage_300k' | 'stage_4k' | 'stage_mixing' | 'top_view';
  targetAzimuthDeg: number | null;
  turntableScanActive: boolean;
  onAngleChange?: (yawDeg: number, pitchDeg: number, distance: number) => void;
  onTurntableProgress?: (deg: number) => void;
  explodeFactor: number;
  vacuumShieldMode: VacuumShieldMode;
  rfSignalsActive: boolean;
  heFlowActive: boolean;
}

const PhotorealisticChandelierScene: React.FC<PhotorealisticChandelierProps> = ({
  viewMode,
  isRotating,
  rotationSpeed,
  rotationDirection,
  cameraFocus,
  targetAzimuthDeg,
  turntableScanActive,
  onAngleChange,
  onTurntableProgress,
  explodeFactor,
  vacuumShieldMode,
  rfSignalsActive,
  heFlowActive
}) => {
  const controlsRef = useRef<any>(null);
  const prevFocusRef = useRef<string>(cameraFocus);
  const isTransitioningRef = useRef<boolean>(false);
  const turntableSweepRef = useRef<number>(0);

  const targetPositions: Record<string, [number, number, number]> = {
    all: [0, 0.4, 7.8],
    stage_300k: [0, 2.2, 4.6],
    stage_4k: [0, 0.7, 4.2],
    stage_mixing: [0, -1.3, 3.6],
    top_view: [0, 7.8, 0.15]
  };

  const targetLookAts: Record<string, [number, number, number]> = {
    all: [0, 0.15, 0],
    stage_300k: [0, 1.45, 0],
    stage_4k: [0, 0.35, 0],
    stage_mixing: [0, -1.8, 0],
    top_view: [0, 0.1, 0]
  };

  useEffect(() => {
    if (prevFocusRef.current !== cameraFocus) {
      prevFocusRef.current = cameraFocus;
      isTransitioningRef.current = true;
    }
  }, [cameraFocus]);

  useFrame((state, delta) => {
    // 1. Smooth Camera Focus Transition
    if (isTransitioningRef.current) {
      const pos = targetPositions[cameraFocus] || targetPositions.all;
      const look = targetLookAts[cameraFocus] || targetLookAts.all;
      state.camera.position.lerp(new THREE.Vector3(...pos), 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(new THREE.Vector3(...look), 0.08);
        controlsRef.current.update();
      }
      if (state.camera.position.distanceTo(new THREE.Vector3(...pos)) < 0.05) {
        isTransitioningRef.current = false;
      }
    }

    // 2. 360° Turntable Automated Sweep
    if (turntableScanActive && controlsRef.current) {
      const cam = state.camera;
      const tgt = controlsRef.current.target;
      const dx = cam.position.x - tgt.x;
      const dz = cam.position.z - tgt.z;
      const radius = Math.sqrt(dx * dx + dz * dz) || 7.2;
      turntableSweepRef.current = (turntableSweepRef.current + delta * 36) % 360;
      const rad = (turntableSweepRef.current * Math.PI) / 180;
      cam.position.x = tgt.x + radius * Math.sin(rad);
      cam.position.z = tgt.z + radius * Math.cos(rad);
      controlsRef.current.update();
      if (onTurntableProgress) onTurntableProgress(Math.round(turntableSweepRef.current));
    }

    // 3. User Target Azimuth Snap & Scrubber (0°, 90°, 180°, 270°, Iso 45°, Slider)
    if (targetAzimuthDeg !== null && targetAzimuthDeg !== undefined && controlsRef.current && !turntableScanActive) {
      const cam = state.camera;
      const tgt = controlsRef.current.target;
      const dx = cam.position.x - tgt.x;
      const dz = cam.position.z - tgt.z;
      const radius = Math.sqrt(dx * dx + dz * dz) || 7.2;
      const rad = (targetAzimuthDeg * Math.PI) / 180;
      const desiredX = tgt.x + radius * Math.sin(rad);
      const desiredZ = tgt.z + radius * Math.cos(rad);
      cam.position.lerp(new THREE.Vector3(desiredX, cam.position.y, desiredZ), 0.12);
      controlsRef.current.update();
    }

    // 4. Live Gimbal Compass Angle Telemetry to HUD
    if (controlsRef.current && onAngleChange) {
      const cam = state.camera;
      const tgt = controlsRef.current.target;
      const dx = cam.position.x - tgt.x;
      const dz = cam.position.z - tgt.z;
      const dy = cam.position.y - tgt.y;
      const horizDist = Math.sqrt(dx * dx + dz * dz);
      let yaw = Math.round((Math.atan2(dx, dz) * 180) / Math.PI);
      if (yaw < 0) yaw += 360;
      const pitch = Math.round((Math.atan2(dy, horizDist) * 180) / Math.PI);
      const totalDist = Math.round(cam.position.distanceTo(tgt) * 10) / 10;
      onAngleChange(yaw, pitch, totalDist);
    }
  });

  return (
    <>
      <color attach="background" args={['#01030a']} />
      <fogExp2 attach="fog" args={['#01030a', 0.016]} />

      {/* Studio Photorealistic Quantum Lighting */}
      <ambientLight intensity={1.6} />
      <directionalLight position={[6, 12, 8]} intensity={4.2} color="#ffffff" />
      <directionalLight position={[-8, -4, -6]} intensity={2.2} color="#00f5ff" />

      <Environment preset="city" />

      {/* Photorealistic Chandelier Assembly */}
      <group position={[0, 0.15, 0]} scale={[0.85, 0.85 * (1 + explodeFactor * 0.45), 0.85]}>
        <pointLight position={[0, 1.2, 3.2]} color="#00f5ff" intensity={8.5} distance={14} />
        <pointLight position={[-2.2, 2.0, 2.2]} color="#fbbf24" intensity={8.5} distance={14} />
        <pointLight position={[2.2, 0.5, -2.2]} color="#38bdf8" intensity={6.0} distance={12} />
        <pointLight position={[0, -2.6, 1.8]} color="#00f5ff" intensity={12.0} distance={12} />

        <CryoChandelierBody 
          reducedMotion={!isRotating} 
          viewMode={viewMode === 'thermal' ? 'thermal' : viewMode === 'xray' || viewMode === 'signal' ? 'xray' : 'gold'} 
        />
        {heFlowActive && <HolographicOrbitalSystem reducedMotion={!isRotating} />}
        {heFlowActive && <QuantumSparkField reducedMotion={!isRotating} />}
        <ReflectiveQuantumFloor />

        {/* Optional Vacuum Shield Enclosure (Cutaway or Sealed) */}
        {vacuumShieldMode !== 'open' && (
          <group position={[0, 0.35, 0]}>
            <mesh>
              <cylinderGeometry
                args={[
                  1.6,
                  1.6,
                  3.8 * (1 + explodeFactor * 0.35),
                  48,
                  1,
                  true,
                  vacuumShieldMode === 'cutaway' ? Math.PI * 0.25 : 0,
                  vacuumShieldMode === 'cutaway' ? Math.PI * 1.5 : Math.PI * 2
                ]}
              />
              <meshStandardMaterial 
                color="#cbd5e1" 
                metalness={0.99} 
                roughness={0.08} 
                side={THREE.DoubleSide} 
                transparent={vacuumShieldMode === 'cutaway'}
                opacity={vacuumShieldMode === 'cutaway' ? 0.85 : 0.95}
              />
            </mesh>
            {/* 50K Gold radiation shield inside cutaway */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry
                args={[
                  1.35,
                  1.35,
                  2.9 * (1 + explodeFactor * 0.35),
                  40,
                  1,
                  true,
                  vacuumShieldMode === 'cutaway' ? Math.PI * 0.27 : 0,
                  vacuumShieldMode === 'cutaway' ? Math.PI * 1.46 : Math.PI * 2
                ]}
              />
              <meshStandardMaterial 
                color="#f59e0b" 
                metalness={0.96} 
                roughness={0.12} 
                transparent 
                opacity={0.65} 
                side={THREE.DoubleSide} 
              />
            </mesh>
          </group>
        )}
      </group>

      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={isRotating}
        autoRotateSpeed={rotationDirection === 'cw' ? 0.45 * rotationSpeed : -0.45 * rotationSpeed}
        dampingFactor={0.05}
        enableDamping={true}
        minDistance={1.4}
        maxDistance={14}
        target={[0, 0.15, 0]}
      />
    </>
  );
};

// -------------------------------------------------------------
// Main ThreeCryoChandelier3D Component with React Three Fiber
// -------------------------------------------------------------
export const ThreeCryoChandelier3D: React.FC = () => {
  const [architectureModel, setArchitectureModel] = useState<'photorealistic' | 'engine_flow' | 'engineering'>('photorealistic');
  const [selectedStageKey, setSelectedStageKey] = useState<string>('stage_mixing');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [rotationDirection, setRotationDirection] = useState<'cw' | 'ccw'>('cw');
  const [azimuthDeg, setAzimuthDeg] = useState<number>(0);
  const [elevationDeg, setElevationDeg] = useState<number>(8);
  const [camDistance, setCamDistance] = useState<number>(6.4);
  const [targetAzimuthDeg, setTargetAzimuthDeg] = useState<number | null>(null);
  const [turntableScanActive, setTurntableScanActive] = useState<boolean>(false);
  const [turntableProgress, setTurntableProgress] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('gold');
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [activeAboutTab, setActiveAboutTab] = useState<'thermodynamics' | 'rf_chain' | 'shielding' | 'qpu'>('thermodynamics');
  const [cameraFocus, setCameraFocus] = useState<'all' | 'stage_300k' | 'stage_4k' | 'stage_mixing' | 'top_view'>('all');
  
  // Advanced Visual Controls & Mode Sub-States
  const [quantumGen, setQuantumGen] = useState<QuantumGen>('present');
  const [heFlowActive, setHeFlowActive] = useState<boolean>(true);
  const [showHudOverlay, setShowHudOverlay] = useState<boolean>(true);
  const [flirPalette, setFlirPalette] = useState<FlirPalette>('ironbow');
  const [activeSignalChannel, setActiveSignalChannel] = useState<SignalChannel>('all');
  const [selectedMetallurgy, setSelectedMetallurgy] = useState<'all' | 'gold' | 'copper' | 'shield'>('all');
  const [signalGraphTab, setSignalGraphTab] = useState<'s21' | 'iq' | 'waterfall'>('s21');
  const [explodeFactor, setExplodeFactor] = useState<number>(0.0); // 0.0 to 1.0
  const [openCan, setOpenCan] = useState<boolean>(false);
  const [vacuumShieldMode, setVacuumShieldMode] = useState<VacuumShieldMode>('cutaway');
  const [rfSignalsActive, setRfSignalsActive] = useState<boolean>(true);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'noise' | 'telemetry' | 'he_cycle'>('overview');
  const [studioLayout, setStudioLayout] = useState<'split' | '3d_only' | 'qpu_only'>('split');

  // Simulated live fluctuating telemetry (realistic physical parameters)
  const [telemetry, setTelemetry] = useState({
    baseTemp: 14.28,
    flowRate: 248.5,
    stillHeater: 1.42,
    vacuum: 1.18,
    pulseHz: 1.40
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        baseTemp: +(14.28 + (Math.sin(Date.now() / 2600) * 0.12)).toFixed(2),
        flowRate: +(248.5 + (Math.sin(Date.now() / 2000) * 3.2)).toFixed(1),
        vacuum: +(1.18 + (Math.cos(Date.now() / 4200) * 0.03)).toFixed(2),
        stillHeater: +(1.42 + (Math.sin(Date.now() / 3100) * 0.02)).toFixed(2)
      }));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const selectedStage = THERMAL_STAGES[selectedStageKey] || THERMAL_STAGES.stage_mixing;

  // Calculate thermal Johnson-Nyquist noise power: P = k_B * T * delta_f (for 1 GHz bandwidth)
  const thermalNoiseWatts = useMemo(() => {
    const kB = 1.380649e-23;
    const deltaF = 1e9; // 1 GHz bandwidth
    const powerW = kB * selectedStage.tempKelvin * deltaF;
    const powerDBm = 10 * Math.log10(powerW * 1000);
    return {
      watts: powerW.toExponential(2),
      dBm: powerDBm.toFixed(1)
    };
  }, [selectedStage.tempKelvin]);

  return (
    <div className="rounded-2xl border border-[rgba(0,229,255,0.25)] bg-[#030610] p-4 text-[#eaf8ff] space-y-4 shadow-2xl relative overflow-hidden font-sans">
      
      {/* 0. Top Developer Scientific Operations & Cryogenic Telemetry Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-[#050c18] border border-[rgba(0,229,255,0.22)] font-mono text-[11px] shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-[#00e5ff] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
            <span>T_BASE: {telemetry.baseTemp} mK</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#09141d] border border-slate-800 text-amber-300">
            <Thermometer className="w-3 h-3 text-amber-400" />
            <span>STILL: {telemetry.stillHeater > 1 ? '0.842 K' : '0.840 K'}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#09141d] border border-slate-800 text-slate-300">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>³He/⁴He FLOW: {telemetry.flowRate} μmol/s</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#09141d] border border-slate-800 text-slate-300">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>VACUUM: {telemetry.vacuum}×10⁻⁸ mbar</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#09141d] border border-slate-800 text-purple-300">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>B-RESIDUAL: 0.85 μT (Cryoperm)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>SUB-KELVIN GROUND STATE</span>
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            Fidelity ℱ ≥ 99.96%
          </span>
        </div>
      </div>

      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(0,229,255,0.15)] font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#09141d] border border-[rgba(0,229,255,0.35)] flex items-center justify-center text-[#00e5ff] shadow-sm shadow-[#00e5ff]/20">
            <Cpu className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                3D Cryogenic Dilution Refrigerator Architecture
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-[#d6a84f] border border-amber-500/50 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#d6a84f]" />
                <span>R3F Photorealistic 3D Twin</span>
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              6 Thermal stages with gold &amp; copper metallic flanges, semi-rigid RF coaxial cables, and sub-Kelvin QPU core
            </p>
          </div>
        </div>

        {/* View Mode, Layout Switcher & Physics Deep Dive Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Architecture 3D Model Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-cyan-500/40 text-xs shadow-md">
            <button
              onClick={() => { playGateClickSound(650); setArchitectureModel('photorealistic'); }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                architectureModel === 'photorealistic'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="High-Fidelity Photorealistic 3D Cryostat Visuals with Cutaway Shield & Gold Plates"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Visual Twin (Dashboard)</span>
            </button>
            <button
              onClick={() => { playGateClickSound(650); setArchitectureModel('engine_flow'); }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                architectureModel === 'engine_flow'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Quantum Engine Flow Architecture: End-to-End Microarchitecture, Waveforms & Scaling"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Quantum Engine Flow</span>
            </button>
            <button
              onClick={() => { playGateClickSound(650); setArchitectureModel('engineering'); }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                architectureModel === 'engineering'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Deep Cryogenic Hardware Engineering Inspector with RF Chains & Attenuation Networks"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Physics Inspector</span>
            </button>
          </div>

          {/* Studio Layout Switcher */}
          <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-[rgba(0,229,255,0.25)] text-xs">
            <button
              onClick={() => { playGateClickSound(600); setStudioLayout('split'); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                studioLayout === 'split' 
                  ? 'bg-[#00e5ff] text-[#02060a] font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
              title="3D Cryostat and QPU Control Studio side-by-side"
            >
              <Layers className="w-3 h-3" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => { playGateClickSound(600); setStudioLayout('3d_only'); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                studioLayout === '3d_only' 
                  ? 'bg-[#00e5ff] text-[#02060a] font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
              title="Full 3D Cryostat View"
            >
              <Rotate3d className="w-3 h-3" />
              <span>3D Cryostat</span>
            </button>
            <button
              onClick={() => { playGateClickSound(600); setStudioLayout('qpu_only'); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                studioLayout === 'qpu_only' 
                  ? 'bg-purple-500 text-white font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
              title="QPU Representation, Entanglement, and Quantum Circuit Studio"
            >
              <Zap className="w-3 h-3" />
              <span>QPU &amp; Entanglement</span>
            </button>
          </div>

          {/* View Modes */}
          <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-[rgba(0,229,255,0.18)] text-xs">
            <button
              onClick={() => { playGateClickSound(600); setViewMode('gold'); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'gold' 
                  ? 'bg-[#00e5ff] text-[#02060a] font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
            >
              Gold Plate
            </button>
            <button
              onClick={() => { playGateClickSound(600); setViewMode('thermal'); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'thermal' 
                  ? 'bg-rose-500 text-white font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Thermal FLIR</span>
            </button>
            <button
              onClick={() => { playGateClickSound(600); setViewMode('xray'); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'xray' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
            >
              RF X-Ray
            </button>
            <button
              onClick={() => { playGateClickSound(600); setViewMode('signal'); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'signal' 
                  ? 'bg-purple-600 text-white font-bold shadow-xs shadow-purple-600/30' 
                  : 'text-[#78909c] hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300" />
              <span>RF Signal Chain</span>
            </button>
          </div>

          {/* Camera View Angle Selector including Advanced Top Visual */}
          <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-[rgba(0,229,255,0.22)] text-xs">
            <button
              onClick={() => { playGateClickSound(600); setCameraFocus('all'); setTargetAzimuthDeg(null); }}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                cameraFocus === 'all' 
                  ? 'bg-[#00e5ff] text-[#02060a] font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
              title="Full 3D Chandelier Perspective View"
            >
              All 3D
            </button>
            <button
              onClick={() => { playGateClickSound(600); setCameraFocus('top_view'); setTargetAzimuthDeg(null); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold ${
                cameraFocus === 'top_view' 
                  ? 'bg-amber-400 text-slate-950 shadow-xs' 
                  : 'text-amber-300 hover:text-white bg-amber-950/40 border border-amber-500/40'
              }`}
              title="Advanced Top Visuals of Cryogenic Dilution Refrigerator Architecture"
            >
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Top Visual</span>
            </button>
            <button
              onClick={() => { playGateClickSound(600); setCameraFocus('stage_mixing'); setTargetAzimuthDeg(null); }}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                cameraFocus === 'stage_mixing' 
                  ? 'bg-purple-500 text-white font-bold shadow-xs' 
                  : 'text-[#78909c] hover:text-white'
              }`}
              title="Sub-Kelvin 15mK Quantum Processing Unit Close-Up"
            >
              <Zap className="w-3 h-3" />
              <span>QPU 15mK</span>
            </button>
          </div>

          {/* Architecture Generation: Present Coax vs Future Cryo-CMOS & Stripline */}
          <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-[rgba(0,229,255,0.22)] text-xs">
            <button
              onClick={() => { playGateClickSound(650); setQuantumGen('present'); }}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer text-[10px] font-bold ${
                quantumGen === 'present'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                  : 'text-[#78909c] hover:text-white'
              }`}
              title="Present Technology: Discrete Semi-Rigid Coax, Bulkhead Feedthroughs & TWPA Pre-Amp"
            >
              Present Gen (Coax &amp; TWPA)
            </button>
            <button
              onClick={() => { playGateClickSound(650); setQuantumGen('future'); }}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 ${
                quantumGen === 'future'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/60 shadow-xs'
                  : 'text-[#78909c] hover:text-white'
              }`}
              title="Next-Gen Future Architecture: 4K Cryo-CMOS ASICs, High-Density Superconducting Flex Striplines & Photonic Readout"
            >
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Future Gen (Cryo-CMOS &amp; Flex)</span>
            </button>
          </div>

          {/* Deep Dive Modal Trigger */}
          <button
            onClick={() => {
              playMeasurementCollapseSound();
              setAboutModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#09141d] hover:bg-[#0b1722] border border-[rgba(0,229,255,0.25)] text-[#00e5ff] text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer font-bold"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Physics Deep Dive</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workstation Area: Quantum Engine Flow or 3D Cryostat Workstation */}
      {architectureModel === 'engine_flow' ? (
        <div className="pt-2">
          <QuantumEngineFlowLab />
        </div>
      ) : (
        <>
          {studioLayout !== 'qpu_only' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Column: React Three Fiber 3D Viewport */}
        <div className={`${studioLayout === '3d_only' ? 'lg:col-span-12 h-[640px]' : 'lg:col-span-7 h-[580px]'} bg-[#02050c] border border-[rgba(0,229,255,0.22)] rounded-xl relative overflow-hidden flex flex-col shadow-2xl transition-all`}>
          
          {/* Top Left: Quick Telemetry HUD */}
          <div className="absolute top-3 left-3 z-10 p-2.5 rounded-xl bg-[#050b11]/85 backdrop-blur-md border border-[rgba(0,229,255,0.18)] font-mono text-[10px] space-y-1 shadow-lg pointer-events-none">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[#00e5ff] font-bold uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                <span>Mixing Chamber: {telemetry.baseTemp} mK</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold">
                SIMULATED
              </span>
            </div>
            <div className="text-[#78909c]">³He/⁴He Circulation: {telemetry.flowRate} μmol/s</div>
            <div className="text-[#78909c]">Chamber Vacuum: {telemetry.vacuum}×10⁻⁷ mbar</div>
            <div className="text-[#78909c]">Pulse Tube Frequency: {telemetry.pulseHz} Hz</div>
          </div>

          {/* Top Right: Camera Zoom Presets & Clear View Toggle */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#050b11]/90 backdrop-blur-md p-1 rounded-lg border border-[rgba(0,229,255,0.2)] font-mono text-xs shadow-lg">
            <button
              onClick={() => {
                playGateClickSound(700);
                setShowHudOverlay(!showHudOverlay);
              }}
              className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all flex items-center gap-1 font-bold ${
                !showHudOverlay 
                  ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                  : 'bg-[#09141d] border border-slate-700 text-[#00e5ff] hover:text-white'
              }`}
              title="Toggle diagnostic telemetry overlay for a 100% unobstructed clear view of the 3D dilution refrigerator"
            >
              <Eye className="w-3 h-3" />
              <span>{showHudOverlay ? 'Clear View' : 'Show HUD'}</span>
            </button>
            <span className="w-px h-3 bg-slate-800" />
            <span className="text-[10px] text-[#78909c] px-1">Zoom:</span>
            {(['all', 'stage_300k', 'stage_4k', 'stage_mixing'] as const).map(focus => (
              <button
                key={focus}
                onClick={() => {
                  playGateClickSound(750);
                  setCameraFocus(focus);
                }}
                className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                  cameraFocus === focus 
                    ? 'bg-[#00e5ff] text-[#02060a] font-bold shadow-xs' 
                    : 'text-[#78909c] hover:text-white'
                }`}
              >
                {focus === 'all' ? 'Overview' : focus === 'stage_300k' ? '300K Flange' : focus === 'stage_4k' ? '4K Stage' : '15mK QPU'}
              </button>
            ))}
          </div>

          {/* View Mode Advanced Quantum Scientific Consoles */}
          {showHudOverlay && viewMode === 'gold' && (
            <div className="absolute top-16 left-3 z-10 p-3 rounded-xl bg-[#050b11]/92 backdrop-blur-md border border-amber-500/40 font-mono text-[10px] space-y-2 shadow-2xl pointer-events-auto max-w-sm">
              <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 pb-1.5">
                <span className="text-amber-300 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Physical Metallurgy Core</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold">
                    24K GOLD &amp; OFHC Cu
                  </span>
                  <button
                    onClick={() => setShowHudOverlay(false)}
                    className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hide overlay for clear view"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Metallurgy Quick-Focus Chips */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { label: 'Au Mixing (15mK)', key: 'stage_mixing' },
                  { label: 'Cu Still (0.8K)', key: 'stage_still' },
                  { label: 'Cu Shield (50K)', key: 'stage_50k' },
                  { label: '316L Flange (300K)', key: 'stage_300k' }
                ].map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => {
                      playGateClickSound(700);
                      setSelectedStageKey(chip.key);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] transition-colors cursor-pointer border ${
                      selectedStageKey === chip.key
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-[#09141d] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1 text-slate-300 pt-0.5">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">Gold Electroplate:</span>
                  <span className="text-amber-300 font-bold">5.0 μm 24K Mirror (Rc &lt; 8 μΩ)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">Thermal Bus (4K):</span>
                  <span className="text-white font-bold">OFHC Cu RRR=100 (k=2,000 W/m·K)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">Magnetic Canister:</span>
                  <span className="text-cyan-300 font-bold">Cryoperm 80 (μ_r &gt; 80,000)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">Superconducting Tc:</span>
                  <span className="text-emerald-400 font-bold">NbTi = 9.2 K · Al = 1.2 K</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-[#78909c]">Chamber Seal:</span>
                  <span className="text-slate-300 font-bold">316L Knife-Edge (1.18×10⁻⁸ mbar)</span>
                </div>
              </div>
            </div>
          )}

          {showHudOverlay && viewMode === 'thermal' && (
            <div className="absolute top-16 left-3 z-10 p-3 rounded-xl bg-[#050b11]/92 backdrop-blur-md border border-rose-500/40 font-mono text-[10px] space-y-2.5 shadow-2xl pointer-events-auto max-w-md">
              <div className="flex items-center justify-between gap-2 border-b border-rose-500/30 pb-1.5">
                <span className="text-rose-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>FLIR Infrared Thermography</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-bold">
                    PLANCK RADIATION
                  </span>
                  <button
                    onClick={() => setShowHudOverlay(false)}
                    className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hide overlay for clear view"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* FLIR Palette Selector */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <span className="text-[9px] text-[#78909c]">FLIR Palette:</span>
                <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-slate-800">
                  {(['ironbow', 'rainbow', 'blackhot', 'whitehot'] as const).map(pKey => (
                    <button
                      key={pKey}
                      onClick={() => {
                        playGateClickSound(650);
                        setFlirPalette(pKey);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] capitalize transition-colors cursor-pointer ${
                        flirPalette === pKey
                          ? 'bg-rose-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {pKey === 'ironbow' ? 'Ironbow' : pKey === 'rainbow' ? 'Rainbow' : pKey === 'blackhot' ? 'B-Hot' : 'W-Hot'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* FLIR False-Color Continuous Thermal Gradient Scale with Pointer */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span>300K (+22°C)</span>
                  <span>50K</span>
                  <span>4.2K</span>
                  <span>0.8K</span>
                  <span>100mK</span>
                  <span className="text-purple-300 font-bold">15mK (-273.135°C)</span>
                </div>
                <div className="relative">
                  <div className={`h-2.5 rounded-full border border-slate-700 shadow-inner ${
                    flirPalette === 'rainbow'
                      ? 'bg-gradient-to-r from-red-600 via-orange-500 via-lime-400 via-cyan-400 via-blue-600 to-indigo-800'
                      : flirPalette === 'blackhot'
                      ? 'bg-gradient-to-r from-zinc-950 via-zinc-800 via-zinc-600 via-zinc-400 to-zinc-100'
                      : flirPalette === 'whitehot'
                      ? 'bg-gradient-to-r from-zinc-100 via-zinc-400 via-zinc-600 via-zinc-800 to-zinc-950'
                      : 'bg-gradient-to-r from-red-600 via-orange-500 via-yellow-400 via-emerald-500 via-cyan-400 to-purple-600'
                  }`} />
                </div>
              </div>

              {/* Active Isotherm & Radiation Physics */}
              <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800 space-y-1 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-[#78909c]">Active Isotherm Spot:</span>
                  <span className="text-white font-bold">{selectedStage.name} ({selectedStage.temp})</span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-[#78909c]">Planck Thermal Radiance:</span>
                  <span className="text-rose-300 font-bold">L_λ(T) = 2hc²/λ⁵(e^x - 1)</span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-[#78909c]">Johnson-Nyquist Noise Power:</span>
                  <span className="text-amber-300 font-bold">{thermalNoiseWatts.dBm} dBm ({thermalNoiseWatts.watts} W)</span>
                </div>
              </div>

              {/* Cryo Cooling Budget Strip */}
              <div className="grid grid-cols-3 gap-1 text-[9px] text-center pt-0.5">
                <div className="p-1 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block">300K Flange</span>
                  <span className="text-rose-400 font-bold">~100 W Load</span>
                </div>
                <div className="p-1 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block">4.2K Stage</span>
                  <span className="text-yellow-400 font-bold">1.5 W Lift</span>
                </div>
                <div className="p-1 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block">15mK QPU Base</span>
                  <span className="text-purple-300 font-bold">18 μW Lift</span>
                </div>
              </div>
            </div>
          )}

          {showHudOverlay && viewMode === 'xray' && (
            <div className="absolute top-16 left-3 z-10 p-3 rounded-xl bg-[#050b11]/92 backdrop-blur-md border border-cyan-500/40 font-mono text-[10px] space-y-2 shadow-2xl pointer-events-auto max-w-sm">
              <div className="flex items-center justify-between gap-2 border-b border-cyan-500/30 pb-1.5">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>RF X-Ray / Cryo Diagnostics</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold">
                    CLEAR 3D CRYO VIEW
                  </span>
                  <button
                    onClick={() => setShowHudOverlay(false)}
                    className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hide overlay for clear view"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-slate-300 text-[10px]">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">QPU Target Core:</span>
                  <span className="text-[#00e5ff] font-bold">[0.00, -1.76, 0.00] CLEAR</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">RF Skin Depth (Cu @ 5 GHz):</span>
                  <span className="text-white font-bold">δ = 0.93 μm</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">NbTi London Penetration:</span>
                  <span className="text-cyan-300 font-bold">λ_L = 39 nm (Zero Resistance)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                  <span className="text-[#78909c]">Mu-Metal Attenuation:</span>
                  <span className="text-emerald-400 font-bold">&gt; 99.98% (&lt; 0.85 μT)</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-[#78909c]">Sapphire Loss Tangent:</span>
                  <span className="text-purple-300 font-bold">tan δ = 1.2×10⁻⁶ (Q_i &gt; 2.4×10⁶)</span>
                </div>
              </div>

              {/* Multi-Layer Shield Inspection Toggle */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-800">
                <span className="text-[9px] text-[#78909c]">Shield Inspection Mode:</span>
                <button
                  onClick={() => setOpenCan(!openCan)}
                  className={`px-2 py-0.5 rounded text-[9px] cursor-pointer border transition-colors ${
                    openCan
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-[#09141d] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {openCan ? 'Shield: Cutaway Cross-Section' : 'Shield: Translucent Specular'}
                </button>
              </div>
            </div>
          )}

          {showHudOverlay && viewMode === 'signal' && (
            <div className="absolute top-16 left-3 z-10 p-3 rounded-xl bg-[#050b11]/92 backdrop-blur-md border border-purple-500/40 font-mono text-[10px] space-y-2 shadow-2xl pointer-events-auto max-w-md">
              <div className="flex items-center justify-between gap-2 border-b border-purple-500/30 pb-1.5">
                <span className="text-purple-300 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Microwave Signal Chain Architecture</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[9px] font-bold">
                    COHERENT RF
                  </span>
                  <button
                    onClick={() => setShowHudOverlay(false)}
                    className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hide overlay for clear view"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Signal Chain Sub-Tabs */}
              <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-slate-800 text-[9px]">
                <button
                  onClick={() => setSignalGraphTab('s21')}
                  className={`flex-1 py-0.5 rounded transition-colors cursor-pointer text-center ${
                    signalGraphTab === 's21'
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  S₂₁ Transmission
                </button>
                <button
                  onClick={() => setSignalGraphTab('iq')}
                  className={`flex-1 py-0.5 rounded transition-colors cursor-pointer text-center ${
                    signalGraphTab === 'iq'
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  IQ Constellation
                </button>
                <button
                  onClick={() => setSignalGraphTab('waterfall')}
                  className={`flex-1 py-0.5 rounded transition-colors cursor-pointer text-center ${
                    signalGraphTab === 'waterfall'
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RF Waterfall
                </button>
              </div>

              {/* Active Channel Filter */}
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <span className="text-[9px] text-[#78909c]">Filter Channel:</span>
                <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-slate-800">
                  {([
                    { id: 'all', label: 'All RF' },
                    { id: 'xy_drive', label: 'XY Drive (5.2 GHz)' },
                    { id: 'z_flux', label: 'Z Flux' },
                    { id: 'readout', label: 'Readout (7.15 GHz)' }
                  ] as const).map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        playGateClickSound(650);
                        setActiveSignalChannel(ch.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] transition-colors cursor-pointer ${
                        activeSignalChannel === ch.id
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: S21 Transmission Spectrum SVG */}
              {signalGraphTab === 's21' && (
                <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">Cavity Transmission Curve |S₂₁|:</span>
                    <span className="text-cyan-300 font-bold">2χ Dispersive Shift = 2.4 MHz</span>
                  </div>
                  <div className="h-20 w-full relative flex items-center justify-center">
                    <svg viewBox="0 0 240 80" className="w-full h-full">
                      {/* Grid lines */}
                      <line x1="10" y1="20" x2="230" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                      <line x1="10" y1="40" x2="230" y2="40" stroke="#1e293b" strokeDasharray="3,3" />
                      <line x1="10" y1="60" x2="230" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                      
                      {/* State |0> transmission dip (cyan) */}
                      <path
                        d="M 10 18 Q 70 18 100 24 Q 112 35 116 70 Q 120 35 132 24 Q 160 18 230 18"
                        fill="none"
                        stroke="#00e5ff"
                        strokeWidth="2"
                      />

                      {/* State |1> transmission dip (purple, shifted by 2chi) */}
                      <path
                        d="M 10 18 Q 80 18 120 24 Q 132 35 136 70 Q 140 35 152 24 Q 180 18 230 18"
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                      />

                      {/* Labels */}
                      <text x="116" y="78" fill="#00e5ff" fontSize="8" textAnchor="middle">|0⟩ (7.148 GHz)</text>
                      <text x="160" y="78" fill="#c084fc" fontSize="8" textAnchor="middle">|1⟩ (7.150 GHz)</text>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 pt-0.5">
                    <span>XY Drive: 5.241 GHz (DRAG)</span>
                    <span>Cavity Q_L = 10,000</span>
                    <span>TWPA Gain: +20.4 dB</span>
                  </div>
                </div>
              )}

              {/* Tab 2: IQ Quadrature Constellation SVG */}
              {signalGraphTab === 'iq' && (
                <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">Demodulated IQ Phase Plane:</span>
                    <span className="text-emerald-400 font-bold">Fidelity ℱ ≥ 99.4%</span>
                  </div>
                  <div className="h-20 w-full relative flex items-center justify-center">
                    <svg viewBox="0 0 160 80" className="w-full h-full">
                      {/* Axes */}
                      <line x1="80" y1="5" x2="80" y2="75" stroke="#334155" />
                      <line x1="10" y1="40" x2="150" y2="40" stroke="#334155" />
                      
                      {/* State |0> cluster (cyan blob) */}
                      <ellipse cx="115" cy="28" rx="14" ry="10" fill="#00e5ff" fillOpacity="0.25" stroke="#00e5ff" strokeWidth="1" />
                      <circle cx="115" cy="28" r="3" fill="#00e5ff" />
                      <text x="115" y="16" fill="#00e5ff" fontSize="8" textAnchor="middle" fontWeight="bold">|0⟩</text>

                      {/* State |1> cluster (purple blob) */}
                      <ellipse cx="45" cy="52" rx="14" ry="10" fill="#c084fc" fillOpacity="0.25" stroke="#c084fc" strokeWidth="1" />
                      <circle cx="45" cy="52" r="3" fill="#c084fc" />
                      <text x="45" y="70" fill="#c084fc" fontSize="8" textAnchor="middle" fontWeight="bold">|1⟩</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* Tab 3: RF Gain/Loss Waterfall */}
              {signalGraphTab === 'waterfall' && (
                <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800 space-y-0.5 text-[9px] text-slate-300">
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Room Temp AWG:</span>
                    <span className="text-white font-bold">+10 dBm</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">50K / 4K / 100mK Attenuators:</span>
                    <span className="text-amber-400 font-bold">-40 dB total</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">15mK Attenuator + Filter:</span>
                    <span className="text-rose-400 font-bold">-20 dB (Net: -130 dBm, ~1 photon)</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">15mK TWPA Quantum Pre-Amp:</span>
                    <span className="text-emerald-400 font-bold">+20.4 dB (Quantum-Limited)</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">4K Cryo HEMT LNA:</span>
                    <span className="text-purple-300 font-bold">+38.2 dB (T_N = 2.1 K)</span>
                  </div>
                </div>
              )}

              {/* Signal Controls */}
              <div className="flex items-center justify-between pt-0.5 border-t border-slate-800">
                <span className="text-[9px] text-[#78909c]">Signal Animation:</span>
                <button
                  onClick={() => setRfSignalsActive(!rfSignalsActive)}
                  className={`px-2 py-0.5 rounded text-[9px] cursor-pointer border transition-colors ${
                    rfSignalsActive
                      ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#09141d] border-slate-800 text-slate-400'
                  }`}
                >
                  {rfSignalsActive ? 'Pulses: FLOWING' : 'Pulses: PAUSED'}
                </button>
              </div>
            </div>
          )}

          {/* 3D-Only Floating Stage Ribbon */}
          {studioLayout === '3d_only' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-[#050b11]/90 backdrop-blur-md border border-[rgba(0,229,255,0.25)] shadow-2xl font-mono text-xs max-w-[85%] overflow-x-auto">
              {Object.entries(THERMAL_STAGES).map(([key, st]) => {
                const isCur = selectedStageKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      playGateClickSound(700);
                      setSelectedStageKey(key);
                      if (key === 'stage_300k') setCameraFocus('stage_300k');
                      else if (key === 'stage_4k') setCameraFocus('stage_4k');
                      else if (key === 'stage_mixing') setCameraFocus('stage_mixing');
                      else setCameraFocus('all');
                      setTargetAzimuthDeg(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isCur
                        ? 'bg-cyan-950 text-[#00e5ff] border border-cyan-500/60 shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-[#09141d]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    <span>{st.shortName}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${st.badgeColor}`}>
                      {st.tempKelvin >= 1 ? `${st.tempKelvin}K` : `${st.tempKelvin * 1000}mK`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* React Three Fiber Canvas */}
          <div className="w-full flex-1">
            <Canvas
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              camera={{ position: [0, 0.9, 6.4], fov: 40 }}
            >
              <PerspectiveCamera makeDefault position={[0, 0.9, 6.4]} fov={40} />
              {architectureModel === 'photorealistic' ? (
                <PhotorealisticChandelierScene
                  viewMode={viewMode}
                  isRotating={isRotating}
                  rotationSpeed={rotationSpeed}
                  rotationDirection={rotationDirection}
                  cameraFocus={cameraFocus}
                  targetAzimuthDeg={targetAzimuthDeg}
                  turntableScanActive={turntableScanActive}
                  onAngleChange={(yaw, pitch, dist) => {
                    setAzimuthDeg(yaw);
                    setElevationDeg(pitch);
                    setCamDistance(dist);
                  }}
                  onTurntableProgress={(deg) => {
                    setTurntableProgress(deg);
                  }}
                  explodeFactor={explodeFactor}
                  vacuumShieldMode={vacuumShieldMode}
                  rfSignalsActive={rfSignalsActive}
                  heFlowActive={heFlowActive}
                />
              ) : (
                <CryoAssembly
                  viewMode={viewMode}
                  quantumGen={quantumGen}
                  flirPalette={flirPalette}
                  activeSignalChannel={activeSignalChannel}
                  selectedStageKey={selectedStageKey}
                  onSelectStage={setSelectedStageKey}
                  hoveredStageKey={null}
                  onHoverStage={() => {}}
                  autoRotate={isRotating}
                  rotationSpeed={rotationDirection === 'cw' ? rotationSpeed : -rotationSpeed}
                  cameraFocus={cameraFocus}
                  targetAzimuthDeg={targetAzimuthDeg}
                  turntableScanActive={turntableScanActive}
                  onAngleChange={(yaw, pitch, dist) => {
                    setAzimuthDeg(yaw);
                    setElevationDeg(pitch);
                    setCamDistance(dist);
                  }}
                  onTurntableProgress={(deg) => {
                    setTurntableProgress(deg);
                  }}
                  explodeFactor={explodeFactor}
                  openCan={openCan}
                  vacuumShieldMode={vacuumShieldMode}
                  rfSignalsActive={rfSignalsActive}
                  heFlowActive={heFlowActive}
                  showHudOverlay={showHudOverlay}
                />
              )}
            </Canvas>
          </div>

          {/* Floating Interactive 360° Compass & Azimuth Gimbal HUD */}
          {showHudOverlay && (
            <div className="absolute bottom-14 left-3 z-10 p-2.5 rounded-xl bg-[#050b11]/92 backdrop-blur-md border border-[rgba(0,229,255,0.25)] font-mono text-[10px] space-y-2 shadow-2xl pointer-events-auto max-w-xs">
              <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-1.5">
                <div className="flex items-center gap-1.5 text-[#00e5ff] font-bold uppercase tracking-wider">
                  <Compass
                    className="w-3.5 h-3.5 text-[#00e5ff] transition-transform duration-100"
                    style={{ transform: `rotate(${azimuthDeg}deg)` }}
                  />
                  <span>360° Cryo Gimbal</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-[#78909c]">
                  <span className="text-[#00e5ff] font-bold">{azimuthDeg}° Yaw</span>
                  <span>•</span>
                  <span>{elevationDeg >= 0 ? `+${elevationDeg}` : elevationDeg}° Pitch</span>
                </div>
              </div>

              {/* Cardinal Angle Quick-Snap Buttons */}
              <div className="grid grid-cols-4 gap-1 text-[9px]">
                {[
                  { label: '0° Front', deg: 0 },
                  { label: '90° Right', deg: 90 },
                  { label: '180° Rear', deg: 180 },
                  { label: '270° Left', deg: 270 },
                  { label: 'Iso 45°', deg: 45 },
                  { label: 'Top Visual', deg: null, focus: 'top_view' as const },
                  { label: 'QPU 15mK', deg: null, focus: 'stage_mixing' as const },
                  { label: 'All 3D', deg: null, focus: 'all' as const }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playGateClickSound(720);
                      if (item.deg !== null) {
                        setTargetAzimuthDeg(item.deg);
                        setIsRotating(false);
                      } else if (item.focus) {
                        setCameraFocus(item.focus);
                        setTargetAzimuthDeg(null);
                      }
                    }}
                    className={`py-1 px-1 rounded transition-colors text-center font-bold cursor-pointer ${
                      (item.deg !== null && Math.abs(azimuthDeg - item.deg) < 15) || (item.focus && cameraFocus === item.focus)
                        ? 'bg-[#00e5ff] text-[#02060a] shadow-xs'
                        : 'bg-[#09141d] border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Interactive 360° Azimuth Angle Scrubber */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between items-center text-[9px] text-[#78909c]">
                  <span>Azimuth 360° Angle:</span>
                  <span className="text-[#00e5ff] font-bold">{azimuthDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={azimuthDeg}
                  onChange={(e) => {
                    const deg = +e.target.value;
                    setTargetAzimuthDeg(deg);
                    setIsRotating(false);
                  }}
                  className="w-full h-1 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
                  title="Drag to rotate smoothly through all 360 degrees"
                />
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>0° Front</span>
                  <span>90° East</span>
                  <span>180° Rear</span>
                  <span>270° West</span>
                  <span>360°</span>
                </div>
              </div>

              {/* 360° Turntable Scan Action */}
              <div className="pt-1 flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playGateClickSound(800);
                    setTurntableScanActive(!turntableScanActive);
                    if (!turntableScanActive) {
                      setTargetAzimuthDeg(null);
                    }
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[9px] font-bold cursor-pointer border ${
                    turntableScanActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                      : 'bg-[#09141d] border-cyan-500/30 text-[#00e5ff] hover:bg-[#0b1722]'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${turntableScanActive ? 'animate-spin' : ''}`} />
                  <span>
                    {turntableScanActive ? `Turntable Tour: ${turntableProgress}° / 360°` : '360° Turntable Scan'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Interactive Controls Bar: Explode View Slider + Can Cutaway + 360° Orbit Suite */}
          <div className="p-2.5 border-t border-[rgba(0,229,255,0.12)] bg-[#050b11]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 font-mono text-xs z-10">
            
            {/* Exploded View Control */}
            <div className="flex items-center gap-2">
              <MoveVertical className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span className="text-[11px] text-[#78909c]">Exploded:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(+e.target.value)}
                className="w-16 h-1 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
                title="Expand vertical separation between stages"
              />
              <span className="text-[10px] text-[#00e5ff] w-8">
                {explodeFactor > 0 ? `+${Math.round(explodeFactor * 100)}%` : '0%'}
              </span>
            </div>

            {/* Vacuum Shield Cutaway & RF Signal Toggle & He Cycle Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded border border-slate-800">
                <span className="text-[10px] text-[#78909c] px-1 font-sans">Shield Enclosure:</span>
                {[
                  { id: 'cutaway', label: 'Cutaway Shield' },
                  { id: 'sealed', label: 'Sealed Can' },
                  { id: 'open', label: 'Bare Core' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      playGateClickSound(650);
                      setVacuumShieldMode(item.id as VacuumShieldMode);
                      setOpenCan(item.id !== 'sealed');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors font-bold uppercase ${
                      vacuumShieldMode === item.id
                        ? 'bg-[#00e5ff] text-[#02060a] shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={
                      item.id === 'open'
                        ? 'Open Chandelier: Full direct access to internal gold plates and QPU'
                        : item.id === 'cutaway'
                        ? '180° Cutaway: Shows stainless vacuum vessel, 50K gold shield & 4K shield with interior exposed'
                        : 'Sealed Cryostat: Complete stainless steel vacuum vessel with viewport'
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setRfSignalsActive(!rfSignalsActive)}
                className={`px-2 py-0.5 rounded text-[10px] cursor-pointer border transition-colors ${
                  rfSignalsActive 
                    ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] font-bold' 
                    : 'bg-[#09141d] border-slate-800 text-[#78909c]'
                }`}
                title="Toggle animated RF microwave signal pulses"
              >
                RF Signals: {rfSignalsActive ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setHeFlowActive(!heFlowActive)}
                className={`px-2 py-0.5 rounded text-[10px] cursor-pointer border transition-colors ${
                  heFlowActive 
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-bold' 
                    : 'bg-[#09141d] border-slate-800 text-[#78909c]'
                }`}
                title="Toggle ³He/⁴He dilution cycle thermodynamic circulation flow"
              >
                ³He/⁴He: {heFlowActive ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => {
                  playGateClickSound(700);
                  setShowHudOverlay(!showHudOverlay);
                }}
                className={`px-2 py-0.5 rounded text-[10px] cursor-pointer border transition-colors flex items-center gap-1 ${
                  !showHudOverlay 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' 
                    : 'bg-[#09141d] border-slate-800 text-[#78909c] hover:text-white'
                }`}
                title="Toggle telemetry HUD for clear 3D cryostat view"
              >
                <Eye className="w-3 h-3" />
                <span>{showHudOverlay ? 'Clear View' : 'Show HUD'}</span>
              </button>

              {/* Dedicated 360° Orbit Suite */}
              <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded border border-[rgba(0,229,255,0.25)]">
                <button
                  onClick={() => {
                    playGateClickSound(650);
                    setIsRotating(!isRotating);
                    setTargetAzimuthDeg(null);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors flex items-center gap-1 font-bold ${
                    isRotating 
                      ? 'bg-[#00e5ff] text-[#02060a] shadow-xs' 
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Toggle continuous 360° orbit rotation"
                >
                  {isRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isRotating ? '360° Orbiting' : '360° Orbit'}</span>
                </button>

                {/* Speed buttons */}
                {([0.5, 1.0, 2.0] as const).map(spd => (
                  <button
                    key={spd}
                    onClick={() => {
                      playGateClickSound(600);
                      setRotationSpeed(spd);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                      rotationSpeed === spd
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={`Orbit speed ${spd}x`}
                  >
                    {spd}x
                  </button>
                ))}

                {/* Direction toggle */}
                <button
                  onClick={() => {
                    playGateClickSound(600);
                    setRotationDirection(prev => prev === 'cw' ? 'ccw' : 'cw');
                  }}
                  className="px-1.5 py-0.5 rounded bg-[#050b11] text-slate-300 hover:text-[#00e5ff] text-[9px] cursor-pointer font-mono"
                  title={`Rotation direction: ${rotationDirection === 'cw' ? 'Clockwise' : 'Counter-Clockwise'}`}
                >
                  {rotationDirection === 'cw' ? '↻ CW' : '↺ CCW'}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Thermal Gradient Ladder & Detailed Stage Inspector (Side-by-Side view) */}
        {studioLayout === 'split' && (
          <div className="lg:col-span-5 flex flex-col gap-3 font-mono">
          
          {/* Interconnected Cryostat Thermal Cascade Ladder */}
          <div className="p-3.5 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.2)] shadow-xl space-y-2">
            
            {/* Header with Live Status */}
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,229,255,0.12)]">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#00e5ff]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Cryostat Thermal Cascade
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#09141d] border border-[rgba(0,229,255,0.25)] text-[#00e5ff] font-semibold">
                6/6 CHANNELS ONLINE
              </span>
            </div>

            {/* Continuous Vertical Cascade with Connecting Conduit Line */}
            <div className="relative pl-5 space-y-1.5 pt-1">
              
              {/* Continuous Vertical Cooling Fluid Line on the Left */}
              <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gradient-to-b from-rose-500 via-yellow-400 to-purple-600 rounded-full opacity-60" />

              {Object.entries(THERMAL_STAGES).map(([key, stage]) => {
                const isSelected = selectedStageKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      playGateClickSound(700);
                      setSelectedStageKey(key);
                      if (key === 'stage_300k') setCameraFocus('stage_300k');
                      else if (key === 'stage_4k') setCameraFocus('stage_4k');
                      else if (key === 'stage_mixing') setCameraFocus('stage_mixing');
                      else setCameraFocus('all');
                      setTargetAzimuthDeg(null);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-left transition-all relative flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#09141d] border-[#00e5ff] text-white shadow-md shadow-[#00e5ff]/20 font-bold'
                        : 'bg-[#030610] border-[rgba(0,229,255,0.1)] text-[#78909c] hover:border-[rgba(0,229,255,0.3)] hover:text-white'
                    }`}
                  >
                    {/* Node Dot on the Vertical Line */}
                    <span
                      className={`absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#050b11] transition-transform ${
                        isSelected ? 'scale-125 ring-2 ring-[#00e5ff]' : ''
                      }`}
                      style={{ backgroundColor: stage.color }}
                    />

                    {/* Stage Name & Physical Role Subtitle */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {stage.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] px-1 rounded bg-[#00e5ff] text-[#02060a] font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#78909c] truncate font-sans">
                        {stage.role}
                      </div>
                    </div>

                    {/* Sensor Channel ID & Temperature Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#09141d] text-[#78909c] border border-slate-800 hidden sm:inline">
                        {stage.sensorChannel}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${stage.badgeColor}`}>
                        {stage.tempKelvin >= 1 ? `${stage.tempKelvin} K` : `${stage.tempKelvin * 1000} mK`}
                      </span>
                      {isSelected ? (
                        <ChevronRight className="w-3.5 h-3.5 text-[#00e5ff]" />
                      ) : (
                        <div className="w-3.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Active Stage Detailed Technical Inspector */}
          <div className="p-3.5 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.2)] shadow-xl space-y-3 flex-1 flex flex-col justify-between">
            
            <div className="space-y-2.5">
              
              {/* Header with Camera Focus Action */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,229,255,0.12)]">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedStage.color }} />
                    <span>{selectedStage.name}</span>
                  </h4>
                  <div className="text-[11px] text-[#00e5ff] font-semibold">{selectedStage.temp}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      playGateClickSound(750);
                      const target = selectedStageKey === 'stage_300k' ? 'stage_300k' : selectedStageKey === 'stage_4k' ? 'stage_4k' : selectedStageKey === 'stage_mixing' ? 'stage_mixing' : 'all';
                      setCameraFocus(target);
                    }}
                    className="px-2 py-1 rounded bg-[#09141d] hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[rgba(0,229,255,0.3)] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Focus 3D camera onto this thermal stage"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus in 3D</span>
                  </button>
                  <span className="px-2 py-1 rounded bg-[#09141d] border border-[rgba(0,229,255,0.25)] text-[#d6a84f] text-[10px] font-bold">
                    {selectedStage.tempKelvin < 1 ? 'Sub-Kelvin Core' : 'Cryo Stage'}
                  </span>
                </div>
              </div>

              {/* Inspector Sub-Tabs: Overview vs Noise Spectral Density vs Calibration */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#030610] border border-[rgba(0,229,255,0.15)] text-[10px]">
                <button
                  onClick={() => setInspectorTab('overview')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer text-center font-bold ${
                    inspectorTab === 'overview'
                      ? 'bg-[#00e5ff] text-[#02060a] shadow-xs'
                      : 'text-[#78909c] hover:text-white'
                  }`}
                >
                  Overview &amp; Hardware
                </button>
                <button
                  onClick={() => setInspectorTab('noise')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer text-center font-bold ${
                    inspectorTab === 'noise'
                      ? 'bg-[#00e5ff] text-[#02060a] shadow-xs'
                      : 'text-[#78909c] hover:text-white'
                  }`}
                >
                  Noise &amp; Photons
                </button>
                <button
                  onClick={() => setInspectorTab('telemetry')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer text-center font-bold ${
                    inspectorTab === 'telemetry'
                      ? 'bg-[#00e5ff] text-[#02060a] shadow-xs'
                      : 'text-[#78909c] hover:text-white'
                  }`}
                >
                  Sensor Calibration
                </button>
                <button
                  onClick={() => setInspectorTab('he_cycle')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer text-center font-bold ${
                    inspectorTab === 'he_cycle'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-[#78909c] hover:text-white'
                  }`}
                >
                  ³He/⁴He Thermodynamics
                </button>
              </div>

              {/* Tab 1: Overview & Hardware */}
              {inspectorTab === 'overview' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-[#eaf8ff] leading-relaxed font-sans">
                    {selectedStage.desc}
                  </p>

                  {/* Hardware Component Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#78909c] uppercase font-semibold block">
                      Integrated Hardware Components:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedStage.componentTags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-[#09141d] border border-[rgba(0,229,255,0.15)] text-[10px] text-[#00e5ff] flex items-center gap-1 font-mono"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#00e5ff]" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Generation Deep-Dive (Present vs Future Tech) */}
                  <div className="p-2.5 rounded-lg bg-[#09141d] border border-[rgba(0,229,255,0.18)] space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-[#00e5ff]" />
                        <span>Cryogenic Quantum Architecture:</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                        quantumGen === 'future'
                          ? 'bg-purple-950/80 border-purple-500/60 text-purple-300'
                          : 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                      }`}>
                        {quantumGen === 'future' ? 'FUTURE GEN (2030+)' : 'PRESENT GEN (2025)'}
                      </span>
                    </div>

                    {quantumGen === 'present' ? (
                      <div className="space-y-1 text-[10px] text-slate-300">
                        <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Signal Interconnect:</span>
                          <span className="text-amber-300 font-bold">Discrete Semi-Rigid Coax (NbTi / CuNi)</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Cryo Pre-Amplification:</span>
                          <span className="text-emerald-400 font-bold">15mK TWPA + 4K HEMT LNA (+58 dB)</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Thermal Heat Load:</span>
                          <span className="text-slate-200">~0.75 mW per Coax line into 4K Stage</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400">Wiring Limit:</span>
                          <span className="text-amber-400 font-bold">Physical bottleneck at ~1,000 Qubits</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-[10px] text-slate-300">
                        <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                          <span className="text-slate-400">High-Density Striplines:</span>
                          <span className="text-purple-300 font-bold">Superconducting Flex (Polyimide / Nb)</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                          <span className="text-slate-400">4K Cryo-CMOS ASICs:</span>
                          <span className="text-cyan-300 font-bold">Local Pulse Synth &amp; DACs at 4.2K</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Readout Link:</span>
                          <span className="text-emerald-400 font-bold">Cryogenic Photonic Fiber-Optic Bus</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400">Scalability Ceiling:</span>
                          <span className="text-purple-400 font-bold">&gt;100,000 Qubits Multi-Tile Cluster</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thermodynamic ³He/⁴He Circulation Status */}
                  <div className="p-2.5 rounded-lg bg-[#09141d] border border-amber-500/25 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Dilution Thermodynamic Cycle:</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        heFlowActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {heFlowActive ? 'CYCLE ACTIVE (480 μmol/s)' : 'FLOW PAUSED'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cooling Power (Q_dot):</span>
                        <span className="text-white font-bold">Q_dot = 84 · T_mc² · n_dot₃ ≈ 22 μW @ 15mK</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phase Boundary:</span>
                        <span className="text-amber-300 font-bold">Concentrated (100% ³He) over Dilute (6.6% ³He)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Noise & Photons */}
              {inspectorTab === 'noise' && (
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#09141d] border border-[rgba(0,229,255,0.18)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#78909c]">Thermal Johnson Noise Power:</span>
                      <span className="text-[#00e5ff] font-bold">{thermalNoiseWatts.dBm} dBm</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>P = k_B · T · Δf (1 GHz Bandwidth)</span>
                      <span className="text-[#eaf8ff]">{thermalNoiseWatts.watts} Watts</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800">
                      <span className="text-[#78909c] block font-semibold">Photon Occupation (nth):</span>
                      <span className="text-[#d6a84f] font-bold block mt-0.5">{selectedStage.photonOccupation}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800">
                      <span className="text-[#78909c] block font-semibold">Voltage Noise Spectral Density:</span>
                      <span className="text-white font-bold block mt-0.5">{selectedStage.spectralDensity}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#78909c] font-sans">
                    Cryogenic attenuation line: <strong className="text-white">{selectedStage.attenuation}</strong>
                  </div>
                </div>
              )}

              {/* Tab 3: Sensor Calibration */}
              {inspectorTab === 'telemetry' && (
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#09141d] border border-[rgba(0,229,255,0.18)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#78909c]">Calibrated Sensor Model:</span>
                      <span className="text-[#00e5ff] font-bold">{selectedStage.sensorModel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Sensor Resistance R(T):</span>
                      <span className="text-amber-300 font-bold">{selectedStage.sensorResistance}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800">
                      <span className="text-[#78909c] block font-semibold">Thermal Stability Drift:</span>
                      <span className="text-[#00a86b] font-bold block mt-0.5">±0.04 mK / hour</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800">
                      <span className="text-[#78909c] block font-semibold">RF Line Attenuation:</span>
                      <span className="text-[#00e5ff] font-bold block mt-0.5">{selectedStage.attenuation}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Helium-3 / Helium-4 Dilution Thermodynamics */}
              {inspectorTab === 'he_cycle' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>³He / ⁴He Osmotic Dilution Thermodynamic Refrigeration Cycle</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700 text-[9px] font-mono font-bold">
                      {telemetry.flowRate} μmol/s
                    </span>
                  </div>

                  <p className="text-xs text-[#eaf8ff] leading-relaxed font-sans">
                    Thermodynamic cooling cycle based on the finite solubility of Liquid ³He in superfluid ⁴He at absolute zero. In the 15mK Mixing Chamber, concentrated ³He atoms cross the phase boundary into the dilute phase, driven by osmotic pressure (Π = 5.6 atm), producing continuous endothermic cooling power: <span className="text-amber-300 font-mono font-bold">Q̇ = 84 · ṅ₃ · T_mc²</span>.
                  </p>

                  {/* Real-time Dilution Physics Parameter Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[9px]">
                    <div className="p-2 rounded-lg bg-[#09141d] border border-amber-500/20">
                      <span className="text-slate-400 block">Base Core Temp:</span>
                      <span className="text-amber-300 font-bold font-mono text-[11px] block">{telemetry.baseTemp} mK</span>
                      <span className="text-[8px] text-emerald-400">Stable within ±0.05mK</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#09141d] border border-amber-500/20">
                      <span className="text-slate-400 block">³He Circulation:</span>
                      <span className="text-cyan-300 font-bold font-mono text-[11px] block">{telemetry.flowRate} μmol/s</span>
                      <span className="text-[8px] text-slate-400">Turbo-Molecular Pump</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#09141d] border border-amber-500/20">
                      <span className="text-slate-400 block">Still Distillation (0.8K):</span>
                      <span className="text-white font-bold font-mono text-[11px] block">{telemetry.stillHeater} mW</span>
                      <span className="text-[8px] text-purple-300">95% ³He gas vapor</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#09141d] border border-amber-500/20">
                      <span className="text-slate-400 block">Condensing Pressure:</span>
                      <span className="text-emerald-300 font-bold font-mono text-[11px] block">320 mbar</span>
                      <span className="text-[8px] text-slate-400">Through 4K condenser</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#09141d] border border-amber-500/20">
                      <span className="text-slate-400 block">Flow Impedance (Z):</span>
                      <span className="text-cyan-300 font-bold font-mono text-[11px] block">1.05 × 10¹¹ cm⁻³</span>
                      <span className="text-[8px] text-slate-400">Pt-W capillary wire</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#09141d] border border-amber-500/20">
                      <span className="text-slate-400 block">Kapitza Area (Silver):</span>
                      <span className="text-amber-300 font-bold font-mono text-[11px] block">&gt; 120 m²/cm³</span>
                      <span className="text-[8px] text-emerald-400">Sub-micron sintered sponge</span>
                    </div>
                  </div>

                  {/* Dilution Flow Status Indicator */}
                  <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-slate-300">Closed-Cycle Helium Circulation:</span>
                    </div>
                    <span className="text-amber-300 font-bold font-mono">CONTINUOUS STEADY STATE</span>
                  </div>
                </div>
              )}

            </div>

            {/* Thermal Budget & Alloy (Clean Multi-line, NO TRUNCATION) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-[#78909c] pt-2 border-t border-[rgba(0,229,255,0.12)]">
              <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800/80">
                <span className="block text-slate-400 font-semibold mb-0.5">Cooling Budget:</span>
                <span className="text-[#d6a84f] font-bold block">{selectedStage.thermalLoad}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#09141d] border border-slate-800/80">
                <span className="block text-slate-400 font-semibold mb-0.5">Alloy / Metallurgy:</span>
                <span className="text-white block leading-snug break-words">{selectedStage.materials}</span>
              </div>
            </div>

          </div>

          </div>
        )}

      </div>
      )}

      {/* 3. QPU Quantum Core & Control Studio (Integrated Cards from user brief) */}
      {(studioLayout === 'split' || studioLayout === 'qpu_only') && (
        <div className="pt-3 border-t border-[rgba(0,229,255,0.18)] space-y-2">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00e5ff]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                QPU Quantum Core &amp; Control Electronics
              </span>
            </div>
            <span className="text-[10px] text-[#78909c]">
              Superconducting Transmon Interface · 15 mK Sub-Kelvin Floor
            </span>
          </div>
          <QpuControlStudioCards />
        </div>
      )}
        </>
      )}

      {/* 4. Physics Deep Dive Modal */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050b11] border border-[rgba(0,229,255,0.3)] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
            
            <div className="p-5 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between bg-[#09141d]/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Engineering &amp; Physics Deep Dive</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-[#00e5ff] border border-cyan-800/60 font-mono">
                      Sub-Kelvin Cryogenics
                    </span>
                  </h3>
                  <p className="text-xs text-[#78909c]">
                    How dilution refrigerators decouple superconducting transmons from room-temperature thermal noise
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAboutModalOpen(false)}
                className="text-[#78909c] hover:text-white p-2 rounded-lg hover:bg-[#09141d] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-6 pt-3 border-b border-[rgba(0,229,255,0.15)] bg-[#030610] text-xs overflow-x-auto">
              {[
                { id: 'thermodynamics', label: '1. ³He/⁴He Thermodynamics', icon: Thermometer },
                { id: 'rf_chain', label: '2. RF Microwave & Attenuation', icon: Radio },
                { id: 'shielding', label: '3. Magnetic & IR Shielding', icon: Shield },
                { id: 'qpu', label: '4. Transmon Packaging & TWPA', icon: Cpu }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveAboutTab(t.id as any)}
                    className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeAboutTab === t.id
                        ? 'border-[#00e5ff] text-[#00e5ff]'
                        : 'border-transparent text-[#78909c] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#eaf8ff] leading-relaxed">
              {activeAboutTab === 'thermodynamics' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                    <h4 className="font-bold text-[#00e5ff] text-sm mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      The Enthalpy of Phase Separation (³He - ⁴He)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      At room temperature, helium isotopes mix freely. Below <strong>0.87 Kelvin</strong>, quantum exchange statistics cause the mixture to spontaneously separate into two distinct fluid phases:
                    </p>
                    <ul className="text-xs list-disc pl-5 mt-2 space-y-1 text-slate-300">
                      <li><strong>Concentrated Phase:</strong> Pure liquid Helium-3 (lower density, floats on top).</li>
                      <li><strong>Dilute Phase:</strong> Saturated solution of ~6.6% Helium-3 dissolved in superfluid Helium-4.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-white uppercase tracking-wider">
                      Continuous Cooling Equation
                    </h5>
                    <div className="p-3 rounded-lg bg-[#09141d] border border-slate-800 text-xs text-[#d6a84f] text-center">
                      {"Q_mix = n_3 [H_{3,dilute}(T) - H_{3,concentrated}(T)] ≈ 84 · n_3 · T² [Watts]"}
                    </div>
                  </div>
                </div>
              )}

              {activeAboutTab === 'rf_chain' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <h4 className="font-bold text-[#d6a84f] text-sm mb-1 flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Thermal Photon Annihilation (hf ≫ k_B T)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Superconducting transmons operate at 4.0 GHz to 7.5 GHz microwave frequencies. Without cryogenic attenuation, blackbody thermal photons would cause instant qubit decoherence.
                    </p>
                  </div>
                </div>
              )}

              {activeAboutTab === 'shielding' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
                    <h4 className="font-bold text-[#7c4dff] text-sm mb-1 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Multilayer Magnetic &amp; Infrared Shielding
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      High-permeability Cryoperm / Mu-Metal cans divert Earth's geomagnetic field (~50 μT) down to under 0.5 μT, shielding Josephson junctions from magnetic flux vortices.
                    </p>
                  </div>
                </div>
              )}

              {activeAboutTab === 'qpu' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <h4 className="font-bold text-[#00a86b] text-sm mb-1 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Transmon QPU Chip &amp; TWPA
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Silicon or sapphire substrate patterned with superconducting coplanar waveguide resonators and non-linear Josephson junctions, providing +20 dB quantum-limited amplification via four-wave mixing TWPAs.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[rgba(0,229,255,0.15)] bg-[#030610] flex items-center justify-between text-xs">
              <span className="text-[#78909c]">
                Superconducting Quantum Computing Hardware Engineering Specification V2.4
              </span>
              <button
                onClick={() => setAboutModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] font-bold transition-colors cursor-pointer"
              >
                Close Deep Dive
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
