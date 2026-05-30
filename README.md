# Vajra

# वज्र · VAJRA
### Predictive SCADA Defense Engine & 3D Grid Simulator

> **Cyber-physical attacks on power grids don't just crash servers — they melt hardware and black out cities.**
> Sanrakshan predicts the cascade before it happens, severs the threat, and keeps the lights on.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Threat Vectors](#threat-vectors)
- [Installation](#installation)
- [Demo Walkthrough](#demo-walkthrough)
- [The Team](#the-team)

---

## What It Does

Modern SCADA systems — the software that runs power grids, water plants, and substations — were built for reliability, not security. A single malicious data packet can spoof sensor readings, overload a physical transformer, and trigger a **cascading failure** that blacks out an entire city in under 60 seconds.

Sanrakshan runs a high-frequency C++ simulation of a 5-node smart grid. It monitors the derivative of load over time ($dL/dt$), detects non-physical spikes that indicate injection attacks, and executes a preemptive isolation sequence — all before a human operator can react. The entire process is visualized in a 3D command center with live telemetry, AI narration, and a red-team attack panel.

---

## Key Features

**Deterministic Physics Engine**
A `while(true)` loop in C++ calculates load dissipation, packet flow, and capacity thresholds at 10 ticks per second. Physics is computed in binary — no JavaScript approximations.

**Sub-Second Telemetry Pipeline**
A custom Node.js bridge translates WebSocket messages from the browser into ZeroMQ PUB/SUB strings for the C++ engine and back, achieving end-to-end latency under 100ms.

**3D Spatial Dashboard**
Built with React Three Fiber. Operators navigate a holographic representation of the physical grid, with towers that change color live based on node status streamed from C++.

**SCADA Deep Metrics Overlay**
Click any tower to open a per-node analysis panel showing time-series Trust Score and Physical Load charts via Recharts. Slides in without obscuring the 3D scene.

**AI Narration**
The browser's native Speech Synthesis API announces every defense action aloud — *"Volumetric flood detected on Node 2. Traffic scrubbing engaged."* — so operators are never heads-down in a log.

**Red Team Orchestrator**
A built-in attack panel lets you manually inject any of three MITRE ICS threat vectors and toggle the defense engine on or off to observe both defended and undefended outcomes side by side.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (React)                     │
│  3D City View (R3F)  ←→  2D Network Graph  ←→  SCADA   │
│                     Zustand State Store                 │
└───────────────────────┬─────────────────────────────────┘
                        │  WebSocket :8080
┌───────────────────────▼─────────────────────────────────┐
│               bridge-node / aggregator.js               │
│         WebSocket Server  ←→  ZeroMQ Client             │
└───────────────────────┬─────────────────────────────────┘
                        │  ZeroMQ PUB :5555 / SUB :5556
┌───────────────────────▼─────────────────────────────────┐
│              backend-cpp / shatachandra                 │
│   Physics Loop · Trust Score Engine · Cascade Predictor │
└─────────────────────────────────────────────────────────┘
```

**Three fully decoupled services:**

`backend-cpp` — The simulation brain. Runs the physics loop, monitors $dL/dt$ for anomalous spikes, manages node state, and broadcasts JSON telemetry on TCP port 5555. Listens for UI commands on TCP port 5556.

`bridge-node` — The translator. A lightweight Node.js process that bridges the WebSocket protocol (browser) with ZeroMQ (C++ binary), letting a React frontend talk directly to a compiled engine with no polling.

`frontend-react` — The command center. Manages all UI state with Zustand, renders the 3D scene and 2D network graph, and exposes the attack orchestrator and SCADA panel as persistent floating overlays.

---

## Threat Vectors

Modeled against the **MITRE ATT&CK for ICS** framework:

| Attack | MITRE ID | Mechanism | Engine Response |
|:---|:---|:---|:---|
| Volumetric DDoS | T0814 | Brute-force packet injection — drives physical load past hardware threshold instantly | Traffic scrubbing, ingress rate limiting, node quarantine |
| False Data Injection | T0836 | Stealth attack — load stays nominal while Trust Score is silently drained to zero | Anomaly score threshold triggers isolation before breach |
| Packet Spoofing | T0856 | Hijack — bypasses physical checks to force node status to `COMPROMISED` directly | Cryptographic handshake verification, link severance |

---

## Installation

### Prerequisites

- C++17 compiler + CMake
- ZeroMQ (`libzmq`)
- Node.js v18+

### 1 — Start the C++ Engine

```bash
cd backend-cpp/build
make
./shatachandra
```

The engine boots and holds, waiting for the bridge to connect.

### 2 — Start the Node.js Bridge

```bash
cd bridge-node
npm install
node src/aggregator.js
```

Confirm that ZMQ ports 5555/5556 and WebSocket port 8080 are bound in the terminal output.

### 3 — Start the React Frontend

```bash
cd frontend-react
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demo Walkthrough

**1. Initialize**
Open the UI. The status bar should read `DATALINK: ACTIVE`. All five towers glow cyan — the grid is nominal.

**2. Observe Baseline**
Hover any tower to see live Voltage, Frequency, and Load readings streamed from C++. Cyan packets flow along the data links between nodes.

**3. Launch an Attack**
Open the Attack Orchestrator (top-right panel). Select `Volumetric DDoS` and click `SIMULATE ATTACK`.

**4. Watch the Response**
The AI narrator announces the threat. The targeted node spikes yellow (WARNING), then snaps red (ISOLATED). The defense engine severs the data link — visible as the edge line turning red and cutting — and redistributes load to healthy nodes.

**5. Analyze**
Click the compromised tower to open its SCADA panel. The time-series chart shows the exact tick at which the load threshold was breached and the Trust Score collapsed.

**6. Recover**
Click `RESTORE GRID`. The C++ engine wipes its state, all nodes return to nominal, and the narrator confirms: *"Grid integrity nominal."*

---

## The Team

Built at **[Hackathon Name · Date]**

Lavya Jain · Aaryamaan Rai · Aditya Gorane

---

*Built to protect the grid. Built to win.*
