import React, { useState, useMemo } from 'react';
import { UnitInput } from '../UnitInput';
import { FormulaCard } from '../FormulaCard';
import { SchematicViewer } from '../SchematicViewer';
import { UNIT_OPTIONS, formatEngineering } from '../../utils/engineering';
import { CalculationHistoryItem, StepMathItem } from '../../types/electronics';
import { Radio, BookmarkPlus } from 'lucide-react';

interface ResonantLCCalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

type LCMode = 'solve-f0' | 'solve-l' | 'solve-c';

export const ResonantLCCalculator: React.FC<ResonantLCCalculatorProps> = ({ onSaveHistory }) => {
  const [mode, setMode] = useState<LCMode>('solve-f0');

  // Input states
  const [inductance, setInductance] = useState<number>(1e-5); // 10 µH
  const [capacitance, setCapacitance] = useState<number>(1e-10); // 100 pF
  const [frequency, setFrequency] = useState<number>(5032921); // ~5.03 MHz
  const [seriesR, setSeriesR] = useState<number>(2); // 2 Ω series ESR

  // Units
  const [lUnit, setLUnit] = useState<string>('µH');
  const [cUnit, setCUnit] = useState<string>('pF');
  const [fUnit, setFUnit] = useState<string>('MHz');
  const [rUnit, setRUnit] = useState<string>('Ω');

  const results = useMemo(() => {
    let l = inductance;
    let c = capacitance;
    let f0 = frequency;
    const steps: StepMathItem[] = [];

    if (mode === 'solve-f0') {
      if (l > 0 && c > 0) {
        f0 = 1 / (2 * Math.PI * Math.sqrt(l * c));
      } else {
        f0 = 0;
      }
      steps.push({
        step: 'Calculate Resonant Frequency (f0)',
        formula: 'f0 = 1 / (2π × √(L × C))',
        substitution: `1 / (2π × √(${l} H × ${c} F))`,
        result: `${formatEngineering(f0, 'Hz').formatted}`,
      });
    } else if (mode === 'solve-l') {
      if (f0 > 0 && c > 0) {
        const omega = 2 * Math.PI * f0;
        l = 1 / (omega * omega * c);
      } else {
        l = 0;
      }
      steps.push({
        step: 'Calculate Required Inductance (L)',
        formula: 'L = 1 / (4π² × f0² × C)',
        substitution: `1 / (4π² × (${f0} Hz)² × ${c} F)`,
        result: `${formatEngineering(l, 'H').formatted}`,
      });
    } else if (mode === 'solve-c') {
      if (f0 > 0 && l > 0) {
        const omega = 2 * Math.PI * f0;
        c = 1 / (omega * omega * l);
      } else {
        c = 0;
      }
      steps.push({
        step: 'Calculate Required Capacitance (C)',
        formula: 'C = 1 / (4π² × f0² × L)',
        substitution: `1 / (4π² × (${f0} Hz)² × ${l} H)`,
        result: `${formatEngineering(c, 'F').formatted}`,
      });
    }

    const omega0 = 2 * Math.PI * f0;
    const charImpedanceZ0 = c > 0 ? Math.sqrt(l / c) : 0;
    const reactanceAtResonance = omega0 * l; // = 1 / (omega0 * C)

    // Quality factor Q and Bandwidth BW
    const qFactor = seriesR > 0 ? charImpedanceZ0 / seriesR : 999;
    const bandwidth = qFactor > 0 ? f0 / qFactor : 0;

    steps.push({
      step: 'Calculate Characteristic Surge Impedance (Z0)',
      formula: 'Z0 = √(L / C)',
      substitution: `√(${l} H / ${c} F)`,
      result: `${formatEngineering(charImpedanceZ0, 'Ω').formatted}`,
    });

    steps.push({
      step: 'Calculate Tank Quality Factor (Q)',
      formula: 'Q = Z0 / R_series',
      substitution: `${charImpedanceZ0.toFixed(2)} Ω / ${seriesR} Ω`,
      result: `${qFactor.toFixed(1)}`,
    });

    return {
      f0,
      l,
      c,
      omega0,
      charImpedanceZ0,
      reactanceAtResonance,
      qFactor,
      bandwidth,
      steps,
    };
  }, [mode, inductance, capacitance, frequency, seriesR]);

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'resonant-lc',
      title: 'LC Resonant Tank Circuit',
      summary: `f0=${formatEngineering(results.f0, 'Hz').formatted} (L=${formatEngineering(results.l, 'H').formatted}, C=${formatEngineering(results.c, 'F').formatted})`,
      details: [
        { label: 'Resonant Frequency (f0)', value: formatEngineering(results.f0, 'Hz').formatted },
        { label: 'Inductance (L)', value: formatEngineering(results.l, 'H').formatted },
        { label: 'Capacitance (C)', value: formatEngineering(results.c, 'F').formatted },
        { label: 'Characteristic Impedance (Z0)', value: formatEngineering(results.charImpedanceZ0, 'Ω').formatted },
        { label: 'Quality Factor (Q)', value: results.qFactor.toFixed(1) },
        { label: 'Bandwidth (Δf)', value: formatEngineering(results.bandwidth, 'Hz').formatted },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Target Variable Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Solve Target:
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('solve-f0')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'solve-f0'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Frequency (f₀)
          </button>
          <button
            type="button"
            onClick={() => setMode('solve-l')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'solve-l'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inductance (L)
          </button>
          <button
            type="button"
            onClick={() => setMode('solve-c')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'solve-c'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Capacitance (C)
          </button>
        </div>
      </div>

      {/* Grid: Inputs + Schematic & Bode Peak Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          <UnitInput
            label="Resonant Frequency (f₀)"
            sublabel="Natural Oscillation"
            value={mode === 'solve-f0' ? results.f0 : frequency}
            unit={fUnit}
            unitOptions={UNIT_OPTIONS.frequency}
            onChange={setFrequency}
            onUnitChange={setFUnit}
            isCalculated={mode === 'solve-f0'}
            disabled={mode === 'solve-f0'}
          />

          <UnitInput
            label="Inductance (L)"
            sublabel="Coil Value"
            value={mode === 'solve-l' ? results.l : inductance}
            unit={lUnit}
            unitOptions={UNIT_OPTIONS.inductance}
            onChange={setInductance}
            onUnitChange={setLUnit}
            isCalculated={mode === 'solve-l'}
            disabled={mode === 'solve-l'}
          />

          <UnitInput
            label="Capacitance (C)"
            sublabel="Tank Capacitor"
            value={mode === 'solve-c' ? results.c : capacitance}
            unit={cUnit}
            unitOptions={UNIT_OPTIONS.capacitance}
            onChange={setCapacitance}
            onUnitChange={setCUnit}
            isCalculated={mode === 'solve-c'}
            disabled={mode === 'solve-c'}
          />

          <UnitInput
            label="Series Resistance (ESR)"
            sublabel="Loss Factor / Damping"
            value={seriesR}
            unit={rUnit}
            unitOptions={UNIT_OPTIONS.resistance}
            onChange={setSeriesR}
            onUnitChange={setRUnit}
          />
        </div>

        {/* Right: Schematic + Bode Frequency Response Peak SVG */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <SchematicViewer
            type="lc"
            values={{
              lStr: formatEngineering(results.l, 'H').formatted,
              cStr: formatEngineering(results.c, 'F').formatted,
              f0Str: formatEngineering(results.f0, 'Hz').formatted,
            }}
          />

          {/* Resonance Peak Frequency Response Curve */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>Resonance Transmission Curve</span>
              <span className="text-cyan-400">Peak f₀: {formatEngineering(results.f0, 'Hz').formatted}</span>
            </div>

            <svg viewBox="0 0 320 110" className="w-full h-[100px]">
              {/* Reference Grid */}
              <line x1="20" y1="90" x2="300" y2="90" stroke="#334155" strokeWidth="1.5" />
              <line x1="20" y1="10" x2="20" y2="90" stroke="#334155" strokeWidth="1.5" />
              
              {/* -3dB Cutoff dashed line */}
              <line x1="20" y1="35" x2="300" y2="35" stroke="#475569" strokeDasharray="3,3" />
              <text x="24" y="32" fill="#64748b" fontSize="8" fontFamily="monospace">-3 dB</text>

              {/* Resonant Bell Peak Curve */}
              <path
                d="M 20 88 C 110 88, 140 70, 160 12 C 180 70, 210 88, 300 88"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />

              {/* Peak Centerline */}
              <line x1="160" y1="12" x2="160" y2="90" stroke="#06b6d4" strokeDasharray="2,2" />
              <circle cx="160" cy="12" r="4" fill="#06b6d4" />
              <text x="160" y="102" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold" fontFamily="monospace">
                f₀
              </text>

              {/* -3dB Bandwidth markers */}
              <circle cx="148" cy="35" r="3" fill="#f59e0b" />
              <circle cx="172" cy="35" r="3" fill="#f59e0b" />
              <line x1="148" y1="35" x2="172" y2="35" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="160" y="47" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">
                BW = {formatEngineering(results.bandwidth, 'Hz').formatted}
              </text>
            </svg>
          </div>

          {/* Metric telemetry tiles */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Surge Z₀</span>
              <span className="text-base font-bold text-cyan-300">
                {formatEngineering(results.charImpedanceZ0, 'Ω').formatted}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Quality Q</span>
              <span className="text-base font-bold text-amber-300">
                {results.qFactor > 999 ? '>1000' : results.qFactor.toFixed(1)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Bandwidth Δf</span>
              <span className="text-base font-bold text-emerald-300">
                {formatEngineering(results.bandwidth, 'Hz').formatted}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookmarkPlus className="w-4 h-4 text-cyan-400" />
            <span>Save LC Tank Calculation to History</span>
          </button>
        </div>
      </div>

      <FormulaCard
        title="Thomson Formula & LC Resonance"
        formulaUnicode="f₀ = 1 / (2π√(LC))  ·  Z₀ = √(L/C)  ·  Q = Z₀ / R"
        latex="f_0 = \frac{1}{2\pi\sqrt{L C}}, \quad Z_0 = \sqrt{\frac{L}{C}}, \quad Q = \frac{1}{R}\sqrt{\frac{L}{C}}"
        description="At resonant frequency f₀, inductive reactance XL and capacitive reactance XC cancel each other (XL = XC), creating an undamped exchange of energy between the magnetic and electric fields."
        variables={[
          { symbol: 'f₀', meaning: 'Resonant frequency', unit: 'Hz' },
          { symbol: 'L', meaning: 'Inductance', unit: 'H' },
          { symbol: 'C', meaning: 'Capacitance', unit: 'F' },
          { symbol: 'Z₀', meaning: 'Characteristic impedance', unit: 'Ω' },
          { symbol: 'Q', meaning: 'Quality factor', unit: 'ratio' },
        ]}
        steps={results.steps}
      />
    </div>
  );
};
