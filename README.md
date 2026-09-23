# ⚡ VoltCraft — Modern Electronics Formula & Circuit Analysis Suite

<div align="center">

![VoltCraft Banner](https://img.shields.io/badge/⚡_VoltCraft-Electronics_Suite-06b6d4?style=for-the-badge&logoColor=white)
<br/>

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Motion](https://img.shields.io/badge/Motion-React-FF4154?style=flat-square&logo=framer&logoColor=white)](https://motion.dev/)
[![Standard](https://img.shields.io/badge/Standard-IEC_60062_%2F_60063-10B981?style=flat-square)](https://www.iec.ch/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

<p align="center">
  <b>A precision, high-performance electronics engineering calculator suite for hardware hackers, electrical engineers, and circuit designers.</b>
  <br />
  Includes live dynamic SVG schematics, 12-permutation Ohm's law solving, EIA E-Series resistor matching, time-constant curves, step-by-step mathematical proofs, and an eye-friendly low-glare tri-mode theme engine.
</p>

</div>

---

## 🌟 Key Highlights

- **⚡ Complete Calculator Suite**: 8 specialized calculators covering DC, AC, RC/LC filters, timing ICs, optoelectronics, active op-amp topologies, and color code decoding.
- **📐 Interactive Dynamic Schematics**: Real-time vector SVG circuit diagrams that reflect component substitutions, voltage drops, and test node points dynamically.
- **🔬 Mathematical Rigor**: Every equation displays formatted governing equations, LaTeX representation, step-by-step substitution breakdowns, and IEEE-754 64-bit precision.
- **🎯 EIA E-Series Standard Value Matching**: Automatically highlights the closest standard real-world commercial components from **E12 (10%)**, **E24 (5%)**, and **E96 (1%)** EIA series.
- **🌘 Eye-Friendly Tri-Theme Engine**:
  - **OLED Dark**: Deep pitch obsidian black (`#020617`) for battery conservation & high-contrast night lab work.
  - **Dim Slate ("A Little Dark")**: Gentle midnight slate (`#0b1326`) for extended workbench sessions with minimal eye fatigue.
  - **Low-Glare Light**: Sophisticated twilight slate (`#152136`) eliminating harsh, blinding white backgrounds.
- **📋 Calculation History**: In-browser session history drawer with single-click clipboard copying for lab notebooks and schematics documentation.
- **⚡ Zero Bloat & Instant Loading**: Powered by Vite and React 19 with buttery-smooth micro-animations via Motion.

---

## 🧮 Calculator Modules

| Module | Features & Capabilities | Governing Equations |
| :--- | :--- | :--- |
| **⚡ Ohm's Law Matrix** | Solves for any 2 unknown variables from $V, I, R, P$. Full 12-equation permutation matrix with instant power dissipation heat warnings. | $V = I \times R$<br/>$P = V \times I = I^2 R = \frac{V^2}{R}$ |
| **🎛️ Voltage Divider** | Dual-resistor divider with optional real-world load resistance ($R_L$). Calculates unloaded $V_{out}$, loaded $V_{out}$, loading error percentage, and Thévenin equivalent resistance ($R_{th}$). | $V_{out} = V_{in} \frac{R_2}{R_1 + R_2}$<br/>$R_{th} = R_1 \parallel R_2$ |
| **⏱️ RC Low-Pass / High-Pass** | Cutoff frequency ($-3\text{ dB}$ point), time constant $\tau = RC$, capacitor charge/discharge voltage across $1\tau \dots 5\tau$, and frequency attenuation graph. | $f_c = \frac{1}{2\pi R C}$<br/>$\tau = R \times C$ |
| **📻 LC Resonant Tank** | Resonance frequency ($f_0$), inductive reactance ($X_L$), capacitive reactance ($X_C$), characteristic impedance ($Z_0$), and circuit Quality Factor ($Q$). | $f_0 = \frac{1}{2\pi \sqrt{L C}}$<br/>$Z_0 = \sqrt{\frac{L}{C}}$ |
| **⏳ 555 Precision Timer** | Astable (oscillator / pulse generator) & Monostable (one-shot pulse) modes. Calculates charge time $t_H$, discharge time $t_L$, total period $T$, frequency, and duty cycle $\%$. | $t_H = 0.693(R_1 + R_2)C$<br/>$t_L = 0.693 R_2 C$ |
| **💡 LED Current Limiter** | Forward voltage drop ($V_f$) presets (Red, Green, Blue, White, UV), series & parallel diode arrays, required series resistance, and actual power dissipation rating with $2\times$ safety margin. | $R = \frac{V_s - (n \times V_f)}{I_f}$ |
| **📈 Op-Amp Configurations** | Inverting, Non-Inverting, Differential / Difference, and Voltage Follower (Buffer) amplifier gain, output voltage swing, and input impedance. | $A_v = -\frac{R_f}{R_{in}}$<br/>$A_v = 1 + \frac{R_f}{R_1}$ |
| **🎨 Resistor Color Code** | 4-Band, 5-Band, and 6-Band resistor decoding and reverse color encoding compliant with IEC 60062 standards, including temperature coefficient (TCR in $\text{ppm/K}$). | Value, Multiplier, Tolerance %, TempCo |

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) with Fast Refresh & Tree Shaking
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom circuit-grid engineering overlays
- **Icons**: [Lucide React](https://lucide.dev/)
- **Micro-Animations**: [Motion](https://motion.dev/) (formerly Framer Motion)
- **Mathematical Accuracy**: IEEE-754 double-precision arithmetic with unit metric scaling ($p, n, \mu, m, \text{base}, k, M, G$)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** / **yarn** / **pnpm** / **bun**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/voltcraft.git
   cd voltcraft
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Production Build:**
   ```bash
   npm run build
   ```
   Outputs optimized, static production assets into the `dist/` directory.

5. **Typecheck & Lint:**
   ```bash
   npm run lint
   ```

---

## 📁 Repository Structure

```text
voltcraft/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Modular React components
│   │   ├── calculators/    # Dedicated calculator engines
│   │   │   ├── CapacitorRCCalculator.tsx
│   │   │   ├── LedResistorCalculator.tsx
│   │   │   ├── OhmsLawCalculator.tsx
│   │   │   ├── OpAmpCalculator.tsx
│   │   │   ├── ResistorColorCodeCalculator.tsx
│   │   │   ├── ResonantLCCalculator.tsx
│   │   │   ├── Timer555Calculator.tsx
│   │   │   └── VoltageDividerCalculator.tsx
│   │   ├── ESeriesLookupModal.tsx  # EIA E12/E24/E96 component table
│   │   ├── FormulaCard.tsx         # Governing equation & LaTeX card
│   │   ├── HistoryDrawer.tsx       # Saved calculations slide-over
│   │   ├── Navbar.tsx              # Brand, navigation & tri-theme switch
│   │   ├── SchematicViewer.tsx     # Dynamic interactive circuit SVGs
│   │   └── UnitInput.tsx           # Precision input with metric scaling
│   ├── types/
│   │   └── electronics.ts  # Domain types, unit interfaces & E-Series
│   ├── utils/
│   │   ├── calculations.ts # Pure mathematical circuit formulas
│   │   └── presets.ts      # Real-world circuit reference presets
│   ├── App.tsx             # Application shell & layout
│   ├── main.tsx            # React root mount
│   └── index.css           # Tailwind CSS imports & theme grid styles
├── index.html              # HTML5 entry with metadata
├── package.json            # Scripts & project dependencies
├── tsconfig.json           # Strict TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 🤝 Contributing

Contributions are welcomed! Whether it's adding new circuit topologies (e.g. Sallen-Key active filters, buck/boost converters, transistor biasing), improving formulas, or enhancing schematics:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingCircuit`)
3. Commit your Changes (`git commit -m 'Add AmazingCircuit calculator'`)
4. Push to the Branch (`git push origin feature/AmazingCircuit`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Crafted with ⚡ for electrical engineers, makers, and students worldwide.</sub>
</div>
