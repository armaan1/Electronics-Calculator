import React from 'react';
import { motion } from 'motion/react';

interface SchematicViewerProps {
  type: 'ohms' | 'divider' | 'rc' | 'lc' | 'timer555' | 'led' | 'opamp';
  values: Record<string, string | number>;
  highlightNode?: string;
}

export const SchematicViewer: React.FC<SchematicViewerProps> = ({ type, values }) => {
  return (
    <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
      <div className="absolute top-2 left-3 text-[11px] font-mono tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
        <span>Interactive Circuit Schematic</span>
      </div>

      <div className="w-full max-w-[420px] h-[190px] flex items-center justify-center">
        {type === 'ohms' && <OhmsSchematic values={values} />}
        {type === 'divider' && <DividerSchematic values={values} />}
        {type === 'rc' && <RCSchematic values={values} />}
        {type === 'lc' && <LCSchematic values={values} />}
        {type === 'timer555' && <Timer555Schematic values={values} />}
        {type === 'led' && <LEDSchematic values={values} />}
        {type === 'opamp' && <OpAmpSchematic values={values} />}
      </div>
    </div>
  );
};

/* --- Ohm's Law Circuit --- */
const OhmsSchematic: React.FC<{ values: Record<string, string | number> }> = ({ values }) => {
  const currentNum = typeof values.currentNum === 'number' ? values.currentNum : 0.05;
  const isReverse = currentNum < 0;
  const speed = Math.max(0.5, Math.min(3, Math.abs(currentNum) * 5));

  return (
    <svg viewBox="0 0 360 170" className="w-full h-full select-none">
      {/* Circuit loop wire */}
      <rect
        x="60"
        y="30"
        width="240"
        height="100"
        rx="8"
        fill="none"
        stroke="#334155"
        strokeWidth="3"
      />

      {/* Animated current flow electrons along wire */}
      <rect
        x="60"
        y="30"
        width="240"
        height="100"
        rx="8"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="3"
        strokeDasharray="8,12"
        className="opacity-75"
        style={{
          animation: `dash ${2 / speed}s linear infinite`,
          animationDirection: isReverse ? 'reverse' : 'normal',
        }}
      />
      <style>{`@keyframes dash { to { stroke-dashoffset: -40; } }`}</style>

      {/* DC Voltage Source (Left branch) */}
      <g transform="translate(60, 80)">
        <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
        <line x1="-8" y1="-5" x2="8" y2="-5" stroke="#38bdf8" strokeWidth="2" />
        <line x1="-5" y1="5" x2="5" y2="5" stroke="#94a3b8" strokeWidth="2" />
        <text x="0" y="-8" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace">+</text>
        <text x="0" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">-</text>
        <text x="-24" y="4" textAnchor="end" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">
          {values.voltageStr || 'V'}
        </text>
      </g>

      {/* Resistor (Right branch) */}
      <g transform="translate(300, 80)">
        <rect x="-14" y="-24" width="28" height="48" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
        {/* Resistor zigzag or bands */}
        <line x1="-8" y1="-14" x2="8" y2="-14" stroke="#f59e0b" strokeWidth="2" />
        <line x1="-8" y1="-4" x2="8" y2="-4" stroke="#f59e0b" strokeWidth="2" />
        <line x1="-8" y1="6" x2="8" y2="6" stroke="#f59e0b" strokeWidth="2" />
        <line x1="-8" y1="16" x2="8" y2="16" stroke="#f59e0b" strokeWidth="2" />
        <text x="24" y="4" textAnchor="start" fill="#f59e0b" fontSize="12" fontWeight="bold" fontFamily="monospace">
          {values.resistanceStr || 'R'}
        </text>
      </g>

      {/* Ammeter / Current indicator (Top branch) */}
      <g transform="translate(180, 30)">
        <circle cx="0" cy="0" r="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
        <text x="0" y="4" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">I</text>
        <path d="M 12 0 L 22 -3 L 22 3 Z" fill="#10b981" />
        <text x="0" y="-18" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold" fontFamily="monospace">
          {values.currentStr || 'I'}
        </text>
      </g>

      {/* Power Dissipation Badge (Bottom branch) */}
      <g transform="translate(180, 130)">
        <rect x="-42" y="-12" width="84" height="24" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
        <text x="0" y="4" textAnchor="middle" fill="#c7d2fe" fontSize="11" fontWeight="bold" fontFamily="monospace">
          {values.powerStr || 'P'}
        </text>
      </g>
    </svg>
  );
};

/* --- Voltage Divider Circuit --- */
const DividerSchematic: React.FC<{ values: Record<string, string | number> }> = ({ values }) => {
  return (
    <svg viewBox="0 0 360 170" className="w-full h-full select-none">
      {/* Top Input Node (Vin) */}
      <line x1="120" y1="20" x2="120" y2="40" stroke="#06b6d4" strokeWidth="3" />
      <circle cx="120" cy="20" r="4" fill="#06b6d4" />
      <text x="110" y="24" textAnchor="end" fill="#06b6d4" fontSize="12" fontWeight="bold" fontFamily="monospace">
        Vin = {values.vinStr || 'Vin'}
      </text>

      {/* R1 Resistor */}
      <rect x="108" y="40" width="24" height="38" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
      <text x="96" y="62" textAnchor="end" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
        R1: {values.r1Str || 'R1'}
      </text>

      {/* Middle Node (Vout) */}
      <line x1="120" y1="78" x2="120" y2="102" stroke="#38bdf8" strokeWidth="3" />
      <circle cx="120" cy="90" r="4" fill="#38bdf8" />
      
      {/* Branch to Vout probe */}
      <line x1="120" y1="90" x2="220" y2="90" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3,3" />
      <circle cx="220" cy="90" r="4" fill="#38bdf8" />
      <rect x="226" y="78" width="94" height="24" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="273" y="94" textAnchor="middle" fill="#bae6fd" fontSize="11" fontWeight="bold" fontFamily="monospace">
        Vout: {values.voutStr || 'Vout'}
      </text>

      {/* R2 Resistor */}
      <rect x="108" y="102" width="24" height="38" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
      <text x="96" y="124" textAnchor="end" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
        R2: {values.r2Str || 'R2'}
      </text>

      {/* Bottom Ground */}
      <line x1="120" y1="140" x2="120" y2="152" stroke="#64748b" strokeWidth="3" />
      <line x1="110" y1="152" x2="130" y2="152" stroke="#64748b" strokeWidth="3" />
      <line x1="114" y1="157" x2="126" y2="157" stroke="#64748b" strokeWidth="2" />
      <line x1="117" y1="162" x2="123" y2="162" stroke="#64748b" strokeWidth="1.5" />

      {/* Optional Load Resistor (RL) */}
      {values.rloadStr && (
        <g>
          <line x1="190" y1="90" x2="190" y2="110" stroke="#64748b" strokeWidth="2" />
          <rect x="180" y="110" width="20" height="30" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
          <text x="175" y="128" textAnchor="end" fill="#c084fc" fontSize="10" fontFamily="monospace">
            RL
          </text>
          <line x1="190" y1="140" x2="190" y2="152" stroke="#64748b" strokeWidth="2" />
          <line x1="190" y1="152" x2="130" y2="152" stroke="#64748b" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};

/* --- RC Filter Circuit --- */
const RCSchematic: React.FC<{ values: Record<string, string | number> }> = ({ values }) => {
  return (
    <svg viewBox="0 0 360 170" className="w-full h-full select-none">
      {/* Input node */}
      <circle cx="40" cy="65" r="4" fill="#06b6d4" />
      <text x="36" y="50" textAnchor="start" fill="#06b6d4" fontSize="11" fontWeight="bold" fontFamily="monospace">
        Vin
      </text>
      <line x1="40" y1="65" x2="90" y2="65" stroke="#06b6d4" strokeWidth="3" />

      {/* Series Resistor R */}
      <rect x="90" y="53" width="50" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
      <text x="115" y="44" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
        R = {values.rStr || 'R'}
      </text>

      {/* Connecting wire to C and Vout */}
      <line x1="140" y1="65" x2="210" y2="65" stroke="#38bdf8" strokeWidth="3" />
      <circle cx="210" cy="65" r="4" fill="#38bdf8" />

      {/* Capacitor C (vertical to ground) */}
      <line x1="210" y1="65" x2="210" y2="85" stroke="#38bdf8" strokeWidth="3" />
      {/* Top Plate */}
      <line x1="194" y1="85" x2="226" y2="85" stroke="#38bdf8" strokeWidth="3" />
      {/* Bottom Plate */}
      <line x1="194" y1="95" x2="226" y2="95" stroke="#38bdf8" strokeWidth="3" />
      <line x1="210" y1="95" x2="210" y2="120" stroke="#64748b" strokeWidth="3" />
      
      <text x="236" y="93" textAnchor="start" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
        C = {values.cStr || 'C'}
      </text>

      {/* Ground symbol */}
      <line x1="200" y1="120" x2="220" y2="120" stroke="#64748b" strokeWidth="3" />
      <line x1="204" y1="125" x2="216" y2="125" stroke="#64748b" strokeWidth="2" />
      <line x1="207" y1="130" x2="213" y2="130" stroke="#64748b" strokeWidth="1.5" />

      {/* Output Node Vout */}
      <line x1="210" y1="65" x2="280" y2="65" stroke="#10b981" strokeWidth="3" />
      <circle cx="280" cy="65" r="4" fill="#10b981" />
      <text x="290" y="62" textAnchor="start" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
        Vout
      </text>
      <text x="290" y="78" textAnchor="start" fill="#64748b" fontSize="10" fontFamily="monospace">
        (Low-Pass)
      </text>

      {/* Info Badge */}
      <g transform="translate(180, 152)">
        <rect x="-80" y="-10" width="160" height="20" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <text x="0" y="3" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
          τ = {values.tauStr || 'RC'} · fc = {values.fcStr || 'Cutoff'}
        </text>
      </g>
    </svg>
  );
};

/* --- LC Resonant Tank Circuit --- */
const LCSchematic: React.FC<{ values: Record<string, string | number> }> = ({ values }) => {
  return (
    <svg viewBox="0 0 360 170" className="w-full h-full select-none">
      {/* Top rail */}
      <line x1="80" y1="35" x2="280" y2="35" stroke="#06b6d4" strokeWidth="3" />
      {/* Bottom rail */}
      <line x1="80" y1="135" x2="280" y2="135" stroke="#64748b" strokeWidth="3" />

      {/* Left branch: Inductor L */}
      <line x1="120" y1="35" x2="120" y2="55" stroke="#06b6d4" strokeWidth="2.5" />
      {/* Inductor Coils */}
      <path
        d="M 120 55 C 135 55, 135 70, 120 70 C 135 70, 135 85, 120 85 C 135 85, 135 100, 120 100 C 135 100, 135 115, 120 115"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
      />
      <line x1="120" y1="115" x2="120" y2="135" stroke="#64748b" strokeWidth="2.5" />
      <text x="142" y="88" textAnchor="start" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
        L = {values.lStr || 'L'}
      </text>

      {/* Right branch: Capacitor C */}
      <line x1="240" y1="35" x2="240" y2="78" stroke="#06b6d4" strokeWidth="2.5" />
      <line x1="225" y1="78" x2="255" y2="78" stroke="#38bdf8" strokeWidth="3" />
      <line x1="225" y1="88" x2="255" y2="88" stroke="#38bdf8" strokeWidth="3" />
      <line x1="240" y1="88" x2="240" y2="135" stroke="#64748b" strokeWidth="2.5" />
      <text x="262" y="86" textAnchor="start" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
        C = {values.cStr || 'C'}
      </text>

      {/* Resonance Frequency Center Tag */}
      <g transform="translate(180, 85)">
        <circle cx="0" cy="0" r="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
        <text x="0" y="4" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontWeight="bold" fontFamily="monospace">f₀</text>
        <text x="0" y="28" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold" fontFamily="monospace">
          {values.f0Str || 'Resonance'}
        </text>
      </g>
    </svg>
  );
};

/* --- 555 Timer Circuit --- */
const Timer555Schematic: React.FC<{ values: Record<string, string | number> }> = ({ values }) => {
  return (
    <svg viewBox="0 0 360 170" className="w-full h-full select-none">
      {/* 555 IC Body */}
      <rect x="130" y="30" width="100" height="110" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
      <circle cx="180" cy="30" r="4" fill="#06b6d4" />
      <text x="180" y="70" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace">
        NE555
      </text>
      <text x="180" y="85" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
        {values.modeStr || 'Astable'}
      </text>

      {/* Pin 8 VCC (Top) */}
      <line x1="180" y1="30" x2="180" y2="10" stroke="#ef4444" strokeWidth="2" />
      <text x="180" y="8" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">VCC</text>

      {/* Pin 1 GND (Bottom) */}
      <line x1="180" y1="140" x2="180" y2="160" stroke="#64748b" strokeWidth="2" />
      <text x="180" y="168" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">GND</text>

      {/* Pin 3 OUT (Right) */}
      <line x1="230" y1="85" x2="280" y2="85" stroke="#10b981" strokeWidth="2.5" />
      <circle cx="280" cy="85" r="3" fill="#10b981" />
      <text x="290" y="82" textAnchor="start" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
        OUT (Pin 3)
      </text>
      <text x="290" y="96" textAnchor="start" fill="#64748b" fontSize="10" fontFamily="monospace">
        {values.freqStr || '1 kHz'}
      </text>

      {/* Left side timing network (R1, R2, C) */}
      <line x1="80" y1="40" x2="130" y2="40" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="75" y="44" textAnchor="end" fill="#f59e0b" fontSize="9" fontFamily="monospace">
        R1: {values.r1Str || ''}
      </text>
      <line x1="80" y1="85" x2="130" y2="85" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="75" y="88" textAnchor="end" fill="#f59e0b" fontSize="9" fontFamily="monospace">
        R2: {values.r2Str || ''}
      </text>
      <line x1="80" y1="125" x2="130" y2="125" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="75" y="128" textAnchor="end" fill="#38bdf8" fontSize="9" fontFamily="monospace">
        C: {values.cStr || ''}
      </text>
    </svg>
  );
};

/* --- LED Driver Circuit --- */
const LEDSchematic: React.FC<{ values: Record<string, string | number> }> = ({ values }) => {
  const ledColorHex = typeof values.colorHex === 'string' ? values.colorHex : '#ef4444';

  return (
    <svg viewBox="0 0 360 170" className="w-full h-full select-none">
      {/* DC Rail */}
      <line x1="50" y1="80" x2="110" y2="80" stroke="#06b6d4" strokeWidth="2.5" />
      <circle cx="50" cy="80" r="4" fill="#06b6d4" />
      <text x="50" y="65" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold" fontFamily="monospace">
        Vs = {values.vsStr || '5V'}
      </text>

      {/* Limiting Resistor */}
      <rect x="110" y="68" width="50" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
      <text x="135" y="60" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
        {values.rStr || 'R'}
      </text>
      <text x="135" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
        {values.powerStr || ''}
      </text>

      {/* Connecting line to LED */}
      <line x1="160" y1="80" x2="220" y2="80" stroke="#38bdf8" strokeWidth="2.5" />

      {/* LED Symbol */}
      <g transform="translate(220, 80)">
        {/* Triangle anode */}
        <polygon points="0,-16 20,0 0,16" fill={ledColorHex} stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Cathode bar */}
        <line x1="20" y1="-16" x2="20" y2="16" stroke="#e2e8f0" strokeWidth="2" />
        
        {/* Light emission arrows */}
        <path d="M 12 -14 L 22 -24 M 20 -24 L 23 -24 L 23 -21" stroke={ledColorHex} strokeWidth="2" strokeLinecap="round" />
        <path d="M 18 -8 L 28 -18 M 26 -18 L 29 -18 L 29 -15" stroke={ledColorHex} strokeWidth="2" strokeLinecap="round" />
        
        <text x="10" y="32" textAnchor="middle" fill={ledColorHex} fontSize="11" fontWeight="bold" fontFamily="monospace">
          Vf = {values.vfStr || '2V'}
        </text>
      </g>

      {/* Cathode line to ground */}
      <line x1="240" y1="80" x2="300" y2="80" stroke="#64748b" strokeWidth="2.5" />
      <line x1="300" y1="80" x2="300" y2="105" stroke="#64748b" strokeWidth="2.5" />
      <line x1="290" y1="105" x2="310" y2="105" stroke="#64748b" strokeWidth="2.5" />
      <line x1="294" y1="110" x2="306" y2="110" stroke="#64748b" strokeWidth="2" />
      <line x1="297" y1="115" x2="303" y2="115" stroke="#64748b" strokeWidth="1.5" />

      {/* Current badge */}
      <g transform="translate(180, 40)">
        <rect x="-35" y="-10" width="70" height="20" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
        <text x="0" y="3" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold" fontFamily="monospace">
          If: {values.ifStr || '20mA'}
        </text>
      </g>
    </svg>
  );
};

/* --- Op-Amp Amplifier Circuit --- */
const OpAmpSchematic: React.FC<{ values: Record<string, string | number> }> = ({ values }) => {
  const isInverting = values.mode === 'inverting';

  return (
    <svg viewBox="0 0 360 170" className="w-full h-full select-none">
      {/* Op-Amp Triangle */}
      <polygon points="160,40 160,140 260,90" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
      {/* - and + inputs */}
      <text x="172" y="70" fill="#f43f5e" fontSize="14" fontWeight="bold" fontFamily="monospace">-</text>
      <text x="172" y="120" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace">+</text>

      {/* Output node */}
      <line x1="260" y1="90" x2="320" y2="90" stroke="#10b981" strokeWidth="2.5" />
      <circle cx="320" cy="90" r="4" fill="#10b981" />
      <text x="320" y="75" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
        Vout
      </text>

      {/* Feedback Resistor Rf */}
      <line x1="140" y1="65" x2="140" y2="30" stroke="#f59e0b" strokeWidth="2" />
      <line x1="140" y1="30" x2="185" y2="30" stroke="#f59e0b" strokeWidth="2" />
      <rect x="185" y="20" width="40" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="205" y="34" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
        Rf
      </text>
      <line x1="225" y1="30" x2="280" y2="30" stroke="#f59e0b" strokeWidth="2" />
      <line x1="280" y1="30" x2="280" y2="90" stroke="#f59e0b" strokeWidth="2" />

      {/* Input network */}
      {isInverting ? (
        <>
          <circle cx="50" cy="65" r="4" fill="#06b6d4" />
          <text x="50" y="52" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold" fontFamily="monospace">Vin</text>
          <line x1="50" y1="65" x2="85" y2="65" stroke="#06b6d4" strokeWidth="2" />
          <rect x="85" y="55" width="35" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="102" y="69" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">Rin</text>
          <line x1="120" y1="65" x2="160" y2="65" stroke="#06b6d4" strokeWidth="2" />

          {/* Non-inverting to ground */}
          <line x1="160" y1="115" x2="120" y2="115" stroke="#64748b" strokeWidth="2" />
          <line x1="120" y1="115" x2="120" y2="135" stroke="#64748b" strokeWidth="2" />
          <line x1="112" y1="135" x2="128" y2="135" stroke="#64748b" strokeWidth="2" />
        </>
      ) : (
        <>
          <circle cx="50" cy="115" r="4" fill="#06b6d4" />
          <text x="50" y="105" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold" fontFamily="monospace">Vin</text>
          <line x1="50" y1="115" x2="160" y2="115" stroke="#06b6d4" strokeWidth="2" />

          {/* Inverting to Rin to GND */}
          <line x1="140" y1="65" x2="105" y2="65" stroke="#64748b" strokeWidth="2" />
          <rect x="70" y="55" width="35" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="87" y="69" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">Rin</text>
          <line x1="70" y1="65" x2="50" y2="65" stroke="#64748b" strokeWidth="2" />
          <line x1="50" y1="65" x2="50" y2="85" stroke="#64748b" strokeWidth="2" />
          <line x1="42" y1="85" x2="58" y2="85" stroke="#64748b" strokeWidth="2" />
        </>
      )}

      {/* Gain readout */}
      <g transform="translate(180, 155)">
        <rect x="-60" y="-10" width="120" height="20" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
        <text x="0" y="3" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontWeight="bold" fontFamily="monospace">
          Gain Av: {values.gainStr || '1x'}
        </text>
      </g>
    </svg>
  );
};
