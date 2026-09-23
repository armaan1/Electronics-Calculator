import React, { useState, useMemo } from 'react';
import { UnitInput } from '../UnitInput';
import { FormulaCard } from '../FormulaCard';
import { SchematicViewer } from '../SchematicViewer';
import { UNIT_OPTIONS, formatEngineering } from '../../utils/engineering';
import { CalculationHistoryItem, StepMathItem } from '../../types/electronics';
import { Activity, BatteryCharging, Network } from 'lucide-react';

interface CapacitorRCCalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

type RCTab = 'time-constant' | 'energy' | 'series-parallel';

export const CapacitorRCCalculator: React.FC<CapacitorRCCalculatorProps> = ({ onSaveHistory }) => {
  const [activeTab, setActiveTab] = useState<RCTab>('time-constant');

  // Tab 1: RC Filter & Time Constant
  const [resistor, setResistor] = useState<number>(10000); // 10k
  const [capacitor, setCapacitor] = useState<number>(1e-7); // 100nF
  const [vin, setVin] = useState<number>(5); // 5V
  const [rUnit, setRUnit] = useState<string>('kΩ');
  const [cUnit, setCUnit] = useState<string>('nF');
  const [vUnit, setVUnit] = useState<string>('V');
  const [scrubTimeRatio, setScrubTimeRatio] = useState<number>(1); // in tau multiples

  // Tab 2: Energy & Charge
  const [energyC, setEnergyC] = useState<number>(1e-4); // 100uF
  const [energyV, setEnergyV] = useState<number>(12); // 12V
  const [energyCUnit, setEnergyCUnit] = useState<string>('µF');
  const [energyVUnit, setEnergyVUnit] = useState<string>('V');

  // Tab 3: Series/Parallel
  const [c1, setC1] = useState<number>(1e-6); // 1uF
  const [c2, setC2] = useState<number>(2.2e-6); // 2.2uF
  const [c3, setC3] = useState<number>(4.7e-6); // 4.7uF
  const [c1Unit, setC1Unit] = useState<string>('µF');
  const [c2Unit, setC2Unit] = useState<string>('µF');
  const [c3Unit, setC3Unit] = useState<string>('µF');

  // RC calculations
  const rcResults = useMemo(() => {
    const tau = resistor * capacitor; // seconds
    const cutoffFreq = tau > 0 ? 1 / (2 * Math.PI * tau) : 0; // Hz
    const time50 = tau * 0.693147;
    const time63 = tau;
    const time90 = tau * 2.302585;
    const time99 = tau * 5;

    // Live scrubber calculation
    const scrubbedTime = tau * scrubTimeRatio;
    const scrubbedChargeV = vin * (1 - Math.exp(-scrubTimeRatio));
    const scrubbedDischargeV = vin * Math.exp(-scrubTimeRatio);

    const steps: StepMathItem[] = [
      {
        step: 'Calculate RC Time Constant (τ)',
        formula: 'τ = R × C',
        substitution: `${resistor} Ω × ${capacitor} F`,
        result: `${formatEngineering(tau, 's').formatted}`,
      },
      {
        step: 'Calculate Cutoff Frequency (-3dB)',
        formula: 'fc = 1 / (2π × R × C)',
        substitution: `1 / (2π × ${tau.toFixed(6)} s)`,
        result: `${formatEngineering(cutoffFreq, 'Hz').formatted}`,
      },
      {
        step: 'Full Charge Settling Time (5τ ≈ 99.3%)',
        formula: 't_settle = 5 × τ',
        substitution: `5 × ${tau.toFixed(6)} s`,
        result: `${formatEngineering(time99, 's').formatted}`,
      },
    ];

    return {
      tau,
      cutoffFreq,
      time50,
      time63,
      time90,
      time99,
      scrubbedTime,
      scrubbedChargeV,
      scrubbedDischargeV,
      steps,
    };
  }, [resistor, capacitor, vin, scrubTimeRatio]);

  // Energy calculations
  const energyResults = useMemo(() => {
    const chargeQ = energyC * energyV; // Coulombs
    const energyJoules = 0.5 * energyC * energyV * energyV; // Joules
    return {
      chargeQ,
      energyJoules,
    };
  }, [energyC, energyV]);

  // Series/Parallel calculations
  const combResults = useMemo(() => {
    const parallel = c1 + c2 + c3;
    const seriesInv = (1 / (c1 || 1e-12)) + (1 / (c2 || 1e-12)) + (1 / (c3 || 1e-12));
    const series = seriesInv > 0 ? 1 / seriesInv : 0;
    return { parallel, series };
  }, [c1, c2, c3]);

  const handleSave = () => {
    if (activeTab === 'time-constant') {
      onSaveHistory({
        calculatorId: 'capacitor-rc',
        title: 'RC Circuit & Time Constant',
        summary: `R=${formatEngineering(resistor, 'Ω').formatted}, C=${formatEngineering(capacitor, 'F').formatted} → τ=${formatEngineering(rcResults.tau, 's').formatted}, fc=${formatEngineering(rcResults.cutoffFreq, 'Hz').formatted}`,
        details: [
          { label: 'Time Constant (τ)', value: formatEngineering(rcResults.tau, 's').formatted },
          { label: 'Cutoff Frequency (fc)', value: formatEngineering(rcResults.cutoffFreq, 'Hz').formatted },
          { label: '63.2% Charge Time', value: formatEngineering(rcResults.time63, 's').formatted },
          { label: '99.3% Settling Time (5τ)', value: formatEngineering(rcResults.time99, 's').formatted },
        ],
      });
    } else if (activeTab === 'energy') {
      onSaveHistory({
        calculatorId: 'capacitor-rc',
        title: 'Capacitor Stored Energy & Charge',
        summary: `C=${formatEngineering(energyC, 'F').formatted} @ ${energyV}V → E=${formatEngineering(energyResults.energyJoules, 'J').formatted}, Q=${formatEngineering(energyResults.chargeQ, 'C').formatted}`,
        details: [
          { label: 'Stored Energy', value: formatEngineering(energyResults.energyJoules, 'J').formatted },
          { label: 'Stored Charge (Q)', value: formatEngineering(energyResults.chargeQ, 'C').formatted },
        ],
      });
    } else {
      onSaveHistory({
        calculatorId: 'capacitor-rc',
        title: 'Series & Parallel Capacitors',
        summary: `Parallel: ${formatEngineering(combResults.parallel, 'F').formatted} | Series: ${formatEngineering(combResults.series, 'F').formatted}`,
        details: [
          { label: 'Parallel Equivalent (C1+C2+C3)', value: formatEngineering(combResults.parallel, 'F').formatted },
          { label: 'Series Equivalent', value: formatEngineering(combResults.series, 'F').formatted },
        ],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tool Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Capacitor Analysis Tool:
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('time-constant')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'time-constant'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>RC Time Constant & Filter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('energy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'energy'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Energy & Charge</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('series-parallel')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'series-parallel'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Series & Parallel</span>
          </button>
        </div>
      </div>

      {activeTab === 'time-constant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <UnitInput
              label="Resistance (R)"
              sublabel="Charging / Filter Path"
              value={resistor}
              unit={rUnit}
              unitOptions={UNIT_OPTIONS.resistance}
              onChange={setResistor}
              onUnitChange={setRUnit}
            />

            <UnitInput
              label="Capacitance (C)"
              sublabel="Storage Capacity"
              value={capacitor}
              unit={cUnit}
              unitOptions={UNIT_OPTIONS.capacitance}
              onChange={setCapacitor}
              onUnitChange={setCUnit}
            />

            <UnitInput
              label="Step Voltage (Vin)"
              sublabel="Input Pulse Amplitude"
              value={vin}
              unit={vUnit}
              unitOptions={UNIT_OPTIONS.voltage}
              onChange={setVin}
              onUnitChange={setVUnit}
            />

            {/* Scrubber for transient voltage response */}
            <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Scrub Time t:</span>
                <span className="text-cyan-400 font-bold">
                  {scrubTimeRatio.toFixed(2)} τ ({formatEngineering(rcResults.scrubbedTime, 's').formatted})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.05"
                value={scrubTimeRatio}
                onChange={(e) => setScrubTimeRatio(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Charging V(t):</span>
                  <span className="text-emerald-400 font-bold">
                    {rcResults.scrubbedChargeV.toFixed(3)} V ({((rcResults.scrubbedChargeV / (vin || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Discharging V(t):</span>
                  <span className="text-amber-400 font-bold">
                    {rcResults.scrubbedDischargeV.toFixed(3)} V
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Schematic + Transient Oscilloscope SVG Curve */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <SchematicViewer
              type="rc"
              values={{
                rStr: formatEngineering(resistor, 'Ω').formatted,
                cStr: formatEngineering(capacitor, 'F').formatted,
                tauStr: formatEngineering(rcResults.tau, 's').formatted,
                fcStr: formatEngineering(rcResults.cutoffFreq, 'Hz').formatted,
              }}
            />

            {/* Oscilloscope Transient Charge Curve SVG */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative">
              <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>Transient Step Response [ 0 → 5τ ]</span>
                <span className="text-cyan-400">τ = {formatEngineering(rcResults.tau, 's').formatted}</span>
              </div>

              <svg viewBox="0 0 320 120" className="w-full h-[110px]">
                {/* Background grid */}
                <line x1="20" y1="10" x2="310" y2="10" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="20" y1="40" x2="310" y2="40" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="20" y1="70" x2="310" y2="70" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="20" y1="100" x2="310" y2="100" stroke="#334155" strokeWidth="1.5" />
                <line x1="20" y1="10" x2="20" y2="100" stroke="#334155" strokeWidth="1.5" />

                {/* 1τ line marker (63.2%) */}
                <line x1="78" y1="10" x2="78" y2="100" stroke="#334155" strokeDasharray="2,2" />
                <text x="78" y="112" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">1τ (63%)</text>
                
                {/* 5τ line marker */}
                <line x1="310" y1="10" x2="310" y2="100" stroke="#334155" strokeDasharray="2,2" />
                <text x="310" y="112" textAnchor="end" fill="#64748b" fontSize="8" fontFamily="monospace">5τ (99%)</text>

                {/* Theoretical Charging Curve (cyan) */}
                <path
                  d="M 20 100 Q 60 45, 120 20 T 310 12"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                />

                {/* Theoretical Discharging Curve (amber, dotted) */}
                <path
                  d="M 20 10 Q 60 65, 120 90 T 310 98"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />

                {/* Current scrubber marker position */}
                {(() => {
                  const scrubX = 20 + (scrubTimeRatio / 5) * (310 - 20);
                  const scrubY = 100 - (1 - Math.exp(-scrubTimeRatio)) * 88;
                  return (
                    <g>
                      <line x1={scrubX} y1="10" x2={scrubX} y2="100" stroke="#10b981" strokeWidth="1.5" />
                      <circle cx={scrubX} cy={scrubY} r="4" fill="#10b981" />
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 font-mono">
                <span className="text-[10px] text-slate-400 uppercase block">Time Constant (τ)</span>
                <span className="text-lg font-bold text-cyan-400">
                  {formatEngineering(rcResults.tau, 's').formatted}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 font-mono">
                <span className="text-[10px] text-slate-400 uppercase block">Cutoff Freq (-3dB)</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatEngineering(rcResults.cutoffFreq, 'Hz').formatted}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Save RC Analysis to History
            </button>
          </div>
        </div>
      )}

      {activeTab === 'energy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <UnitInput
              label="Capacitance (C)"
              sublabel="Storage Capacity"
              value={energyC}
              unit={energyCUnit}
              unitOptions={UNIT_OPTIONS.capacitance}
              onChange={setEnergyC}
              onUnitChange={setEnergyCUnit}
            />
            <UnitInput
              label="Voltage (V)"
              sublabel="Terminal Voltage"
              value={energyV}
              unit={energyVUnit}
              unitOptions={UNIT_OPTIONS.voltage}
              onChange={setEnergyV}
              onUnitChange={setEnergyVUnit}
            />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase block">
                  Stored Electrostatic Energy (E = ½ C V²)
                </span>
                <span className="text-3xl font-mono font-bold text-cyan-300 mt-1 block">
                  {formatEngineering(energyResults.energyJoules, 'J').formatted}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase block">
                  Stored Electric Charge (Q = C × V)
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-300 mt-1 block">
                  {formatEngineering(energyResults.chargeQ, 'C').formatted}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Save Energy Calculation to History
            </button>
          </div>
        </div>
      )}

      {activeTab === 'series-parallel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <UnitInput
              label="Capacitor C1"
              value={c1}
              unit={c1Unit}
              unitOptions={UNIT_OPTIONS.capacitance}
              onChange={setC1}
              onUnitChange={setC1Unit}
            />
            <UnitInput
              label="Capacitor C2"
              value={c2}
              unit={c2Unit}
              unitOptions={UNIT_OPTIONS.capacitance}
              onChange={setC2}
              onUnitChange={setC2Unit}
            />
            <UnitInput
              label="Capacitor C3"
              value={c3}
              unit={c3Unit}
              unitOptions={UNIT_OPTIONS.capacitance}
              onChange={setC3}
              onUnitChange={setC3Unit}
            />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase block">
                  Parallel Equivalent (Cp = C1 + C2 + C3)
                </span>
                <span className="text-3xl font-mono font-bold text-cyan-300 mt-1 block">
                  {formatEngineering(combResults.parallel, 'F').formatted}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Plates combine in parallel, increasing total surface area and total capacitance.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase block">
                  Series Equivalent (1/Cs = 1/C1 + 1/C2 + 1/C3)
                </span>
                <span className="text-3xl font-mono font-bold text-amber-300 mt-1 block">
                  {formatEngineering(combResults.series, 'F').formatted}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Series connection reduces total capacitance below the smallest capacitor, but increases maximum operating voltage.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Save Combination to History
            </button>
          </div>
        </div>
      )}

      <FormulaCard
        title="Capacitive Circuit Equations"
        formulaUnicode="τ = R × C  ·  fc = 1 / (2πRC)  ·  Q = C × V  ·  E = ½ C V²"
        latex="\tau = R C, \quad f_c = \frac{1}{2\pi R C}, \quad Q = C V, \quad E = \frac{1}{2} C V^2"
        description="The time constant τ dictates the transient charging/discharging exponential velocity. After 1τ, the capacitor reaches 63.2% of final voltage, and reaches 99.3% after 5τ."
        variables={[
          { symbol: 'τ', meaning: 'Time Constant (seconds)', unit: 's' },
          { symbol: 'fc', meaning: '-3dB Cutoff Frequency', unit: 'Hz' },
          { symbol: 'Q', meaning: 'Stored Electric Charge', unit: 'C' },
          { symbol: 'E', meaning: 'Electrostatic Stored Energy', unit: 'J' },
        ]}
        steps={rcResults.steps}
      />
    </div>
  );
};
