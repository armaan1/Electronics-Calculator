import React, { useState, useMemo } from 'react';
import { UnitInput } from '../UnitInput';
import { FormulaCard } from '../FormulaCard';
import { SchematicViewer } from '../SchematicViewer';
import { UNIT_OPTIONS, formatEngineering, recommendWattage } from '../../utils/engineering';
import { CalculationHistoryItem, StepMathItem } from '../../types/electronics';
import { Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface OhmsLawCalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

type SolverMode = 'VI' | 'VR' | 'VP' | 'IR' | 'IP' | 'RP';

export const OhmsLawCalculator: React.FC<OhmsLawCalculatorProps> = ({ onSaveHistory }) => {
  const [mode, setMode] = useState<SolverMode>('VI');

  // Input states in standard SI units
  const [voltage, setVoltage] = useState<number>(5); // Volts
  const [current, setCurrent] = useState<number>(0.02); // Amperes (20mA)
  const [resistance, setResistance] = useState<number>(250); // Ohms
  const [power, setPower] = useState<number>(0.1); // Watts

  // Unit dropdown state
  const [vUnit, setVUnit] = useState<string>('V');
  const [iUnit, setIUnit] = useState<string>('mA');
  const [rUnit, setRUnit] = useState<string>('Ω');
  const [pUnit, setPUnit] = useState<string>('mW');

  // Solve based on selected mode
  const solved = useMemo(() => {
    let v = voltage;
    let i = current;
    let r = resistance;
    let p = power;
    const steps: StepMathItem[] = [];

    if (mode === 'VI') {
      // Known V and I -> Solve R and P
      r = i !== 0 ? v / i : 0;
      p = v * i;
      steps.push({
        step: 'Calculate Resistance (R = V / I)',
        formula: 'R = V / I',
        substitution: `${v} V / ${i} A`,
        result: `${r.toFixed(3)} Ω`,
      });
      steps.push({
        step: 'Calculate Power Dissipation (P = V × I)',
        formula: 'P = V × I',
        substitution: `${v} V × ${i} A`,
        result: `${p.toFixed(4)} W`,
      });
    } else if (mode === 'VR') {
      // Known V and R -> Solve I and P
      i = r !== 0 ? v / r : 0;
      p = r !== 0 ? (v * v) / r : 0;
      steps.push({
        step: 'Calculate Current (I = V / R)',
        formula: 'I = V / R',
        substitution: `${v} V / ${r} Ω`,
        result: `${i.toFixed(4)} A`,
      });
      steps.push({
        step: 'Calculate Power (P = V² / R)',
        formula: 'P = V² / R',
        substitution: `(${v} V)² / ${r} Ω`,
        result: `${p.toFixed(4)} W`,
      });
    } else if (mode === 'VP') {
      // Known V and P -> Solve I and R
      i = v !== 0 ? p / v : 0;
      r = p !== 0 ? (v * v) / p : 0;
      steps.push({
        step: 'Calculate Current (I = P / V)',
        formula: 'I = P / V',
        substitution: `${p} W / ${v} V`,
        result: `${i.toFixed(4)} A`,
      });
      steps.push({
        step: 'Calculate Resistance (R = V² / P)',
        formula: 'R = V² / P',
        substitution: `(${v} V)² / ${p} W`,
        result: `${r.toFixed(3)} Ω`,
      });
    } else if (mode === 'IR') {
      // Known I and R -> Solve V and P
      v = i * r;
      p = i * i * r;
      steps.push({
        step: 'Calculate Voltage (V = I × R)',
        formula: 'V = I × R',
        substitution: `${i} A × ${r} Ω`,
        result: `${v.toFixed(3)} V`,
      });
      steps.push({
        step: 'Calculate Power (P = I² × R)',
        formula: 'P = I² × R',
        substitution: `(${i} A)² × ${r} Ω`,
        result: `${p.toFixed(4)} W`,
      });
    } else if (mode === 'IP') {
      // Known I and P -> Solve V and R
      v = i !== 0 ? p / i : 0;
      r = i !== 0 ? p / (i * i) : 0;
      steps.push({
        step: 'Calculate Voltage (V = P / I)',
        formula: 'V = P / I',
        substitution: `${p} W / ${i} A`,
        result: `${v.toFixed(3)} V`,
      });
      steps.push({
        step: 'Calculate Resistance (R = P / I²)',
        formula: 'R = P / I²',
        substitution: `${p} W / (${i} A)²`,
        result: `${r.toFixed(3)} Ω`,
      });
    } else if (mode === 'RP') {
      // Known R and P -> Solve V and I
      v = Math.sqrt(Math.max(0, p * r));
      i = r !== 0 ? Math.sqrt(Math.max(0, p / r)) : 0;
      steps.push({
        step: 'Calculate Voltage (V = √(P × R))',
        formula: 'V = √(P × R)',
        substitution: `√(${p} W × ${r} Ω)`,
        result: `${v.toFixed(3)} V`,
      });
      steps.push({
        step: 'Calculate Current (I = √(P / R))',
        formula: 'I = √(P / R)',
        substitution: `√(${p} W / ${r} Ω)`,
        result: `${i.toFixed(4)} A`,
      });
    }

    const wattageRec = recommendWattage(p);

    return {
      v,
      i,
      r,
      p,
      steps,
      wattageRec,
    };
  }, [mode, voltage, current, resistance, power]);

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'ohms-law',
      title: "Ohm's Law & Power Analysis",
      summary: `V=${formatEngineering(solved.v, 'V').formatted}, I=${formatEngineering(solved.i, 'A').formatted}, R=${formatEngineering(solved.r, 'Ω').formatted}, P=${formatEngineering(solved.p, 'W').formatted}`,
      details: [
        { label: 'Voltage (V)', value: formatEngineering(solved.v, 'V').formatted },
        { label: 'Current (I)', value: formatEngineering(solved.i, 'A').formatted },
        { label: 'Resistance (R)', value: formatEngineering(solved.r, 'Ω').formatted },
        { label: 'Power (P)', value: formatEngineering(solved.p, 'W').formatted },
        { label: 'Resistor Rating', value: solved.wattageRec.recommended },
      ],
    });
  };

  const isVDisabled = mode === 'IR' || mode === 'IP' || mode === 'RP';
  const isIDisabled = mode === 'VR' || mode === 'VP' || mode === 'RP';
  const isRDisabled = mode === 'VI' || mode === 'VP' || mode === 'IP';
  const isPDisabled = mode === 'VI' || mode === 'VR' || mode === 'IR';

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Select 2 Known Variables to Solve Others:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {(
            [
              { key: 'VI', label: 'V & I' },
              { key: 'VR', label: 'V & R' },
              { key: 'VP', label: 'V & P' },
              { key: 'IR', label: 'I & R' },
              { key: 'IP', label: 'I & P' },
              { key: 'RP', label: 'R & P' },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                mode === m.key
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Inputs + Interactive Circuit Schematic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column (5 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <UnitInput
            label="Voltage (V)"
            sublabel="Potential Difference"
            value={isVDisabled ? solved.v : voltage}
            unit={vUnit}
            unitOptions={UNIT_OPTIONS.voltage}
            onChange={setVoltage}
            onUnitChange={setVUnit}
            isCalculated={isVDisabled}
            disabled={isVDisabled}
          />

          <UnitInput
            label="Current (I)"
            sublabel="Charge Flow Rate"
            value={isIDisabled ? solved.i : current}
            unit={iUnit}
            unitOptions={UNIT_OPTIONS.current}
            onChange={setCurrent}
            onUnitChange={setIUnit}
            isCalculated={isIDisabled}
            disabled={isIDisabled}
          />

          <UnitInput
            label="Resistance (R)"
            sublabel="Impedance"
            value={isRDisabled ? solved.r : resistance}
            unit={rUnit}
            unitOptions={UNIT_OPTIONS.resistance}
            onChange={setResistance}
            onUnitChange={setRUnit}
            isCalculated={isRDisabled}
            disabled={isRDisabled}
          />

          <UnitInput
            label="Power (P)"
            sublabel="Joule Heat Dissipation"
            value={isPDisabled ? solved.p : power}
            unit={pUnit}
            unitOptions={UNIT_OPTIONS.power}
            onChange={setPower}
            onUnitChange={setPUnit}
            isCalculated={isPDisabled}
            disabled={isPDisabled}
          />
        </div>

        {/* Right Interactive Schematic & Safety Margin (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <SchematicViewer
            type="ohms"
            values={{
              voltageStr: formatEngineering(solved.v, 'V').formatted,
              currentStr: formatEngineering(solved.i, 'A').formatted,
              resistanceStr: formatEngineering(solved.r, 'Ω').formatted,
              powerStr: formatEngineering(solved.p, 'W').formatted,
              currentNum: solved.i,
            }}
          />

          {/* Resistor Wattage & Thermal Safety Card */}
          <motion.div
            layout
            className={`p-4 rounded-xl border ${
              solved.wattageRec.isHighPower
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {solved.wattageRec.isHighPower ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Recommended Resistor Wattage
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                +{solved.wattageRec.margin}% Margin
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-mono font-bold text-white">
                {solved.wattageRec.recommended}
              </span>
              <span className="text-xs font-mono text-slate-400">
                P_actual = {formatEngineering(solved.p, 'W').formatted}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {solved.wattageRec.isHighPower
                ? 'High heat dissipation. Ensure proper ventilation or chassis heatsinking to prevent thermal runaway.'
                : 'Derating by 1.6x ensures safe continuous operation without overheating or drift.'}
            </p>
          </motion.div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Save to Calculation History</span>
          </button>
        </div>
      </div>

      {/* Governing Equations & Step Breakdown */}
      <FormulaCard
        title="Ohm's Law & Joule's First Law"
        formulaUnicode="V = I × R  ·  P = V × I = I²R = V² / R"
        latex="V = I \cdot R \quad \text{and} \quad P = V \cdot I = I^2 R = \frac{V^2}{R}"
        description="Ohm's Law describes the linear relationship between electrical potential (V), current flow (I), and resistance (R). Joule's Law calculates electrical power converted to heat energy per unit time."
        variables={[
          { symbol: 'V', meaning: 'Voltage / Potential Difference', unit: 'V' },
          { symbol: 'I', meaning: 'Electric Current flow rate', unit: 'A' },
          { symbol: 'R', meaning: 'Electrical Resistance', unit: 'Ω' },
          { symbol: 'P', meaning: 'Dissipated Power', unit: 'W' },
        ]}
        steps={solved.steps}
      />
    </div>
  );
};
