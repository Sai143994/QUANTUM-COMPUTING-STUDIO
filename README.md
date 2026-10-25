# Quantum Studio — Enterprise Quantum Simulator & CAD Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_60FPS-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Selenium WebDriver](https://img.shields.io/badge/Selenium_WebDriver-Automated_QA-43B02A?logo=selenium&logoColor=white)](https://www.selenium.dev/)
[![Build & Tests](https://img.shields.io/badge/QA_Tests-35%2F35_Passing-brightgreen)](#automated-testing--selenium-webdriver-audit)

> **Quantum Studio** is a high-performance, full-spectrum quantum computing simulator, interactive CAD workbench, and cryogenic hardware visualizer. Designed with modern enterprise engineering standards, it delivers zero-latency in-browser quantum statevector simulation ($2^N$ Hilbert space linear algebra), real-time 3D WebGL dilution refrigerator digital twins, and bidirectional hardware transpilation for OpenQASM, Qiskit, and Cirq.

---

## 📑 Table of Contents
- [Executive Overview](#executive-overview)
- [System Architecture](#system-architecture)
- [Workspaces & Core Modules (14 Workspaces)](#workspaces--core-modules)
- [Technology Stack & Languages](#technology-stack--languages)
- [Automated Testing & Selenium WebDriver Audit](#automated-testing--selenium-webdriver-audit)
- [Client-Side vs. Backend Architecture Analysis](#client-side-vs-backend-architecture-analysis)
- [Quick Start Guide](#quick-start-guide)
  - [Web Application (Vite + React)](#1-running-the-web-application)
  - [Pure Python Quantum Engine & CLI](#2-running-the-python-quantum-engine)
  - [Selenium Automated Test Suite](#3-running-the-selenium-automated-test-suite)
- [GitHub & Production Deployment](#github--production-deployment)
- [Project Directory Structure](#project-directory-structure)

---

## Executive Overview

Quantum Studio bridges the gap between theoretical quantum mechanics and physical quantum engineering. It features:
1. **Zero-Latency In-Browser Linear Algebra**: Performs unitary matrix operations ($|\psi\rangle = U |\psi_0\rangle$) and tensor products ($\mathcal{H}_1 \otimes \mathcal{H}_2$) directly in client memory at sub-millisecond execution speeds.
2. **Interactive 3D Cryogenic Hardware Engine**: A real-time WebGL digital twin of a dilution refrigerator (dilution unit operating down to 14.37 mK), complete with thermal FLIR imaging, RF X-ray pass-through, and stage telemetry.
3. **Comprehensive Algorithm Suite**: Pre-built and interactive visual simulations for Grover's search, Shor's factorization, Deutsch-Jozsa, Quantum Fourier Transform (QFT), and Bernstein-Vazirani.
4. **Fault-Tolerant Quantum Computing (FTQC)**: Rotated surface code simulator with syndrome extraction, real-time Pauli error injection ($X, Y, Z$), and stabilizer measurement visualization.
5. **Bidirectional Hardware Transpiler**: Convert circuits on-the-fly between OpenQASM 2.0/3.0, IBM Qiskit, Google Cirq, and Rigetti PyQuil with gate depth optimization.

---

## System Architecture

```mermaid
graph TD
    subgraph UI ["Modern Presentation Layer (React 19 + Tailwind v4)"]
        Nav["Persistent URL Hash Routing & State Cache"]
        Theme["Enterprise Typography: Space Grotesk / Jakarta / JetBrains Mono"]
        HUD["Frosted Glass Glassmorphism & Framer Motion Controls"]
    end

    subgraph GraphicsEngine ["3D WebGL & Physics Rendering"]
        Three["Three.js / React Three Fiber Canvas"]
        Cryo["Interactive Dilution Refrigerator 3D Mesh"]
        Modes["Visual Modes: Thermal FLIR · RF X-Ray · Cutaway Shield · Core"]
        Bloch["Dynamic 3D Bloch Spheres & Density Matrices"]
    end

    subgraph QuantumCore ["In-Browser Quantum Execution Engine"]
        StateVec["Complex Linear Algebra Statevector Engine"]
        Gates["Unitary Gate Operators: H, X, Y, Z, S, T, Rx, Ry, Rz, CNOT, CZ, SWAP, Toffoli"]
        Transpile["Multi-Target Transpiler: OpenQASM 3.0 / Qiskit / Cirq"]
        Algorithms["Quantum Algo Benchmarks: Grover / Shor / VQE / QKD / QML"]
    end

    subgraph PythonCore ["Standalone Pure Python Engine (quantum_studio/)"]
        PyCLI["cli.py / main.py CLI Runner"]
        PyState["Pure Python QuantumState & Complex Numbers"]
        PySurface["Rotated Surface Code Distance-3 Simulator"]
    end

    UI --> QuantumCore
    UI --> GraphicsEngine
    GraphicsEngine --> QuantumCore
```

---

## Workspaces & Core Modules

The platform is structured into **14 enterprise workspaces**, each targeting a specialized discipline of quantum engineering:

| Workspace | Module Description & Physics Capabilities |
| :--- | :--- |
| **1. Dashboard** | Minimalist mission-control hero view with real-time 3D cryostat hero background, active telemetry, quick workspace jump actions, and architectural metrics. |
| **2. Circuit Composer** | Multi-qubit graphical circuit editor with drag-and-drop gates, dynamic gate depth metrics, live statevector readout, Dirac bra-ket notations, and 1,000-shot measurement histograms. |
| **3. Quantum Algorithms** | Interactive sandbox for foundational algorithms: **Grover's Search** ($\mathcal{O}(\sqrt{N})$ amplitude amplification), **Shor's Algorithm** (period finding), **Deutsch-Jozsa**, **QFT**, and **Bernstein-Vazirani**. |
| **4. QPC Transpiler** | High-performance multi-platform compiler. Converts visual circuits into optimized OpenQASM 2.0/3.0, IBM Qiskit, Google Cirq, and Rigetti PyQuil with automated CNOT cancellation and single-qubit gate fusion. |
| **5. VQE Chemistry** | Variational Quantum Eigensolver simulator computing ground-state molecular dissociation curves ($H_2$, $LiH$, $H_2O$) across bond lengths using parameterized ansatz circuits ($Ry(\theta)$). |
| **6. Entanglement & EPR** | Bell state generator ($|\Phi^+\rangle, |\Phi^-\rangle, |\Psi^+\rangle, |\Psi^-\rangle$), CHSH inequality / Bell theorem test suite, and 3-qubit Quantum Teleportation protocol verification. |
| **7. QKD Cryptography** | BB84 Quantum Key Distribution protocol simulator. Visualizes photon polarization states ($+/\times$ bases), key sifting, Quantum Bit Error Rate (QBER) calculation, and Eve interception eavesdropping detection. |
| **8. QML Studio** | Quantum Machine Learning lab featuring Variational Quantum Classifiers (VQC) and Quantum Kernel Support Vector Machines trained on non-linear datasets (Iris, Concentric Circles). |
| **9. QEC Logical** | Quantum Error Correction workspace featuring rotated surface codes ($d=3$). Visualizes $X$-type and $Z$-type syndrome stabilizers, cosmic ray / thermal error injection, and minimum-weight perfect matching (MWPM) decoding concepts. |
| **10. Pulse AWG** | Microwave control Arbitrary Waveform Generator. Generates Gaussian, DRAG (Derivative Removal by Adiabatic Gate), and Square envelopes for superconducting transmon qubit driving with Rabi oscillations. |
| **11. Quantum Lab** | Master 3D cryo digital twin. Inspects all 5 thermal stages of a dilution refrigerator (50K, 4K, Still, Cold Plate, Mixing Chamber at 15 mK) with real-time FLIR thermal infrared and RF X-ray wire tracking. |
| **12. Hardware Roadmap** | Comparative architectural database benchmarking Superconducting Transmons, Trapped Ions, Neutral Atoms, Photonic waveguides, and Silicon Spin qubits ($T_1, T_2$ coherence times, gate fidelities). |
| **13. Global Outlook** | Global geopolitical intelligence tracking sovereign quantum investments, patent distributions, national initiatives, and supply-chain dependencies across 20+ nations. |
| **14. 3D Tech Matrix** | Interactive 3D force-directed graph modeling the interconnectivity between cryogenics, RF electronics, optical control, firmware, and quantum algorithm compilers. |

---

## Technology Stack & Languages

### 1. Front-End Web Application
- **Language**: TypeScript 7.0.2 (Strict type checking, zero `any` leaks)
- **Framework**: React 19.0.1 (Modern functional components, hooks, concurrent rendering)
- **Styling**: Tailwind CSS v4.3.3 + Custom CSS Tokens ([src/index.css](file:///c:/Users/dhana/Downloads/quantum-computing-project%20(1)/src/index.css))
- **3D Graphics & Canvas**: Three.js v0.186.1, `@react-three/fiber` v9.8.1, `@react-three/drei` v10.7.9
- **Animations & HUD**: Motion (`motion` v12.23.24) + Lucide React v0.546.0
- **Build Tool**: Vite v8.3.4 (Lightning-fast HMR and production bundle optimization)
- **Typography**: Space Grotesk (Headings), Plus Jakarta Sans (Body UI), JetBrains Mono (Code/Math)

### 2. Pure Python Core (`quantum_studio/`)
- **Language**: Python 3.8+ (Zero mandatory external dependencies)
- **Modules**:
  - `core.py`: Pure-Python complex matrix multiplier and statevector tracker
  - `circuits.py`: Gate definitions, unitary representations, and circuit abstraction
  - `algorithms.py`: Grover, Shor, Teleportation, and VQE solvers
  - `surface_code.py`: Surface code distance-3 stabilizer simulation
  - `qasm.py`: OpenQASM 2.0/3.0 tokenizer and parser
- **CLI Utilities**: `cli.py` and `main.py`

### 3. Automated Quality Assurance & WebDrivers
- **Automation Framework**: Python 3 + Selenium WebDriver (`selenium>=4.15.0`)
- **Driver**: Google Chrome Headless WebDriver (`--headless=new`, `--window-size=1920,1080`, WebGL acceleration enabled)
- **Test Suite**: `test_quantum_studio.py` (35 assertions across 7 verification phases)

---

## Automated Testing & Selenium WebDriver Audit

The platform includes a dedicated, automated end-to-end audit suite ([test_quantum_studio.py](file:///c:/Users/dhana/Downloads/quantum-computing-project%20(1)/test_quantum_studio.py)) that executes against the live web application using headless Selenium WebDriver.

### Audit Test Phases:
1. **Load Performance & Typography**: Measures TTFB (<20ms) and DOM ready timing, verifying computed CSS font families match enterprise standards.
2. **Multi-Refresh Stress Test**: Performs 5 rapid consecutive hard page reloads, ensuring WebGL context creation does not crash or leak memory.
3. **Multi-Tab Concurrency**: Opens 3 parallel browser tabs simultaneously to confirm independent session state, memory isolation, and canvas rendering.
4. **State & Hash Persistence**: Validates that active tabs survive browser refresh via URL hashes (`#tab=...`).
5. **Full 14-Workspace Audit**: Visits every workspace, asserting non-empty DOM content and WebGL canvas mounting.
6. **Interactive 3D Cryostat Controls**: Programmatically clicks all 12 visual layer buttons (`3D Visual Twin`, `Quantum Engine Flow`, `Thermal FLIR`, `RF X-Ray`, `Top Visual`, `QPU 15mK`, etc.) confirming UI responsiveness.
7. **Console Error Inspection**: Queries Chrome DevTools logs to guarantee zero `SEVERE` console errors.

### Latest Test Execution Results:
```
===========================================================================
  AUDIT SUMMARY (Selenium WebDriver v4.15+)
===========================================================================
  Total Passed:   35
  Total Warnings: 0
  Total Failed:   0
  Status:         100% PASS
===========================================================================
```

---

## Client-Side vs. Backend Architecture Analysis

### Why Client-Side Execution is Optimal:
- **Instant Response (Sub-millisecond)**: Statevector matrix manipulations for 2–10 qubits require $\mathcal{O}(2^N)$ complex numbers. Running this on the user's CPU and GPU in JavaScript delivers instant 60 FPS redraws when dragging gates or adjusting phase sliders. A cloud server would introduce 150–400ms network round-trip latency.
- **$0 Server Cost & Unlimited Scale**: Because no cloud server computes matrices, the app can be deployed to a free global CDN (Vercel, Netlify, Cloudflare Pages) and scale to millions of concurrent users without recurring cloud costs.
- **Privacy & Security**: Experimental circuit designs and proprietary research never leave the user's browser, preventing leakage of sensitive intellectual property.
- **Zero Server Downtime**: No API outages, rate limits, or database connection pool failures.

### Future Backend Roadmap (When a Backend is Recommended):
If you choose to expand this platform in the future, a backend microservice can be added for:
1. **User Accounts & Cloud Saves**: PostgreSQL + Supabase / Firebase for saving custom circuit libraries and team sharing.
2. **Real Physical QPU Access**: A Python FastAPI / Celery queue to securely submit circuits to physical quantum processors (IBM Quantum Experience, Rigetti, IonQ) via secret API keys.
3. **HPC High-Qubit Simulation (>16 Qubits)**: An MPI / C++ cluster running high-performance tensor network contraction for 20–50 qubit simulations.

---

## Quick Start Guide

### 1. Running the Web Application

#### Prerequisites
- Node.js 18.0+ or 20.0+ (or Bun)
- npm or pnpm

```bash
# Clone the repository
git clone https://github.com/your-username/quantum-studio.git
cd quantum-studio

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Building for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory ready for any static web host.

---

### 2. Running the Python Quantum Engine

#### Prerequisites
- Python 3.8 or higher

```bash
# Run demonstration suite (Bell State, Grover, Shor, VQE, Surface Code)
python main.py

# Run the interactive CLI
python cli.py

# Optional: Install as an editable local package
pip install -e .
```

---

### 3. Running the Selenium Automated Test Suite

#### Prerequisites
- Google Chrome browser installed
- Python 3.8+ with Selenium

```bash
# Install test requirements
pip install -r requirements.txt

# Run the full 35-assertion test suite against the local server
python test_quantum_studio.py
```
A complete JSON test report will be generated at `test_report.json`.

---

## GitHub & Production Deployment

### 1. Push to GitHub
```bash
# Initialize git if not already initialized
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: complete enterprise quantum computing studio v2.5"

# Link to your remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/quantum-studio.git
git branch -M main
git push -u origin main
```

### 2. One-Click Free Deployment

#### Deploy to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**.

#### Deploy to Netlify
1. Connect your repository on [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Click **Deploy Site**.

#### Deploy to GitHub Pages
1. In `vite.config.ts`, set `base: '/quantum-studio/'` (matching your repository name).
2. Run `npm run build`.
3. Push the `dist` directory to your `gh-pages` branch.

---

## Project Directory Structure

```text
quantum-studio/
├── index.html                   # HTML entry point with Google Fonts preloads
├── package.json                 # Node dependencies (React 19, Three.js, Tailwind v4)
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
├── requirements.txt             # Python dependencies (Selenium WebDriver)
├── setup.py                     # Python package installer
├── main.py                      # Python benchmark and algorithm demo runner
├── cli.py                       # Interactive quantum CLI tool
├── test_quantum_studio.py       # Selenium WebDriver automated E2E test suite
├── test_report.json             # Latest 35/35 automated audit results
├── README.md                    # Repository documentation and guide
├── PROJECT_DOCUMENTATION.md     # Deep-dive technical whitepaper & physics specs
│
├── src/                         # Web Application Source
│   ├── main.tsx                 # React application DOM mount
│   ├── App.tsx                  # Root component, routing, tab persistence
│   ├── index.css                # Tailwind v4 theme, fonts, and custom styles
│   │
│   ├── components/              # 14 Interactive Workspaces & 3D Engines
│   │   ├── QuantumComputingDashboard.tsx   # Minimalist Hero View
│   │   ├── ChandelierHero3D.tsx            # Three.js Background Cryostat
│   │   ├── InteractiveCryoChandelierEngine.tsx # 3D Cryo Digital Twin
│   │   ├── QuantumEngineFlowLab.tsx        # Microwave & Dilution Flow
│   │   ├── QuantumLab.tsx                  # Master Cryogenic Lab
│   │   ├── CircuitComposer.tsx             # Interactive Drag & Drop Gates
│   │   ├── AlgorithmStudio.tsx             # Grover, Shor, QFT, Deutsch
│   │   ├── QPCHardwareTranspiler.tsx       # QASM / Qiskit / Cirq Transpiler
│   │   ├── VQEMolecularLab.tsx             # Quantum Chemistry Solver
│   │   ├── EntanglementLab.tsx             # Bell States & Teleportation
│   │   ├── QKDCryptoLab.tsx                # BB84 Quantum Cryptography
│   │   ├── QMLStudio.tsx                   # Quantum Machine Learning
│   │   ├── QECSurfaceCodeLab.tsx           # Fault-Tolerant Surface Codes
│   │   ├── PulseAWGLab.tsx                 # Microwave Pulse AWG Physics
│   │   ├── HardwareRoadmap.tsx             # QPU Hardware Benchmarks
│   │   ├── GlobalOutlook.tsx               # Geopolitical Intelligence
│   │   └── QuantumTech3DMatrix.tsx         # 3D Technology Force Graph
│   │
│   └── types/                   # TypeScript interfaces & quantum data types
│
└── quantum_studio/              # Pure Python Quantum Core Engine
    ├── __init__.py              # Python module exports
    ├── core.py                  # Statevector linear algebra engine
    ├── circuits.py              # Unitary gate operators
    ├── algorithms.py            # Grover, Shor, and VQE solvers
    ├── surface_code.py          # Rotated surface code patch simulator
    └── qasm.py                  # OpenQASM parser & transpiler
```

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Built for researchers, engineers, and quantum computing enthusiasts worldwide.
