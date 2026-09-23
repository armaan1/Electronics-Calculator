import React, { useState, useMemo } from 'react';
import { UnitInput } from '../UnitInput';
import { FormulaCard } from '../FormulaCard';
import { SchematicViewer } from '../SchematicViewer';
import { UNIT_OPTIONS, formatEngineering, findNearestESeries, recommendWattage } from '../../utils/engineering';
import { CalculationHistoryItem, StepMathItem } from '../../types/electronics';
import { Sparkles, BookmarkPlus } from 'lucide-react';

interface LedResistorCalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

interface LedColorPreset {
  name: string;
  vfDefault: number;
  hex: string;
  glowClass: string;
}

const LED_PRESETS: LedColorPreset[] = [
  { name: 'Red (Standard)', vfDefault: 1.8, hex: '#ef4444', glowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]' },
  { name: 'Yellow', vfDefault: 2.1, hex: '#eab308', glowClass: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]' },
  { name: 'Green', vfDefault: 2.2, hex: '#22c55e', glowClass: 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' },
  { name: 'Blue', vfDefault: 3.2, hex: '#3b82f6', glowClass: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]' },
  { name: 'Pure White', vfDefault: 3.3, hex: '#f8fafc', glowClass: 'shadow-[0_0_20px_rgba(255,255,255,0.7)]' },
  { name: 'UV / Violet', vfDefault: 3.6, hex: '#a855f7', glowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]' },
  { name: 'Infrared (IR)', vfDefault: 1.2, hex: '#991b1b', glowClass: 'shadow-[0_0_15px_rgba(153,27,27,0.4)]' },
];

export const LedResistorCalculator: React.FC<LedResistorCalculatorProps> = ({ onSaveHistory }) => {
  const [supplyV, setSupplyV] = useState<number>(5); // 5V
  const [forwardV, setForwardV] = useState<number>(1.8); // 1.8V
  const [forwardI, setForwardI] = useState<number>(0.02); // 20mA
  const [selectedColor, setSelectedColor] = useState<LedColorPreset>(LED_PRESETS[0]);

  // Units
  const [vsUnit, setVsUnit] = useState<string>('V');
  const [vfUnit, setVfUnit] = useState<string>('V');
  const [ifUnit, setIfUnit] = useState<string>('mA');

  const results = useMemo(() => {
    const vDrop = Math.max(0, supplyV - forwardV);
    const requiredR = forwardI > 0 ? vDrop / forwardI : 0;
    const powerR = vDrop * forwardI;
    const powerLed = forwardV * forwardI;
    const powerTotal = supplyV * forwardI;

    const stdResistor = findNearestESeries(requiredR, 'E24');
    const actualCurrent = stdResistor.standardValue > 0 ? vDrop / stdResistor.standardValue : 0;
    const wattageRec = recommendWattage(powerR);

    const steps: StepMathItem[] = [
      {
        step: 'Calculate Voltage Drop Across Limiting Resistor',
        formula: 'VR = Vs - Vf',
        substitution: `${supplyV} V - ${forwardV} V`,
        result: `${vDrop.toFixed(2)} V`,
      },
      {
        step: 'Calculate Required Limiting Resistance',
        formula: 'R = (Vs - Vf) / If',
        substitution: `${vDrop.toFixed(2)} V / ${forwardI} A`,
        result: `${formatEngineering(requiredR, 'Ω').formatted}`,
      },
      {
        step: 'Calculate Resistor Heat Dissipation',
        formula: 'PR = VR × If',
        substitution: `${vDrop.toFixed(2)} V × ${forwardI} A`,
        result: `${formatEngineering(powerR, 'W').formatted}`,
      },
    ];

    return {
      vDrop,
      requiredR,
      powerR,
      powerLed,
      powerTotal,
      stdResistor,
      actualCurrent,
      wattageRec,
      steps,
    };
  }, [supplyV, forwardV, forwardI]);

  const handleSelectPreset = (preset: LedColorPreset) => {
    setSelectedColor(preset);
    setForwardV(preset.vfDefault);
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'led-resistor',
      title: 'LED Series Current Limiter',
      summary: `Vs=${supplyV}V, Vf=${forwardV}V @ ${formatEngineering(forwardI, 'A').formatted} → R=${formatEngineering(results.requiredR, 'Ω').formatted} (Std: ${results.stdResistor.formatted})`,
      details: [
        { label: 'Required Resistance', value: formatEngineering(results.requiredR, 'Ω').formatted },
        { label: 'Standard E24 Resistor', value: results.stdResistor.formatted },
        { label: 'Actual Current with Std', value: formatEngineering(results.actualCurrent, 'A').formatted },
        { label: 'Resistor Power Dissipation', value: formatEngineering(results.powerR, 'W').formatted },
        { label: 'Recommended Resistor Rating', value: results.wattageRec.recommended },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* LED Color Preset Chips */}
      <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Select LED Color Preset (Typical Forward Drop):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {LED_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                selectedColor.name === preset.name
                  ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-sm'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: preset.hex }}
              />
              <span>{preset.name}</span>
              <span className="font-mono text-[10px] text-slate-500">({preset.vfDefault}V)</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-3">
          <UnitInput
            label="Supply Voltage (Vs)"
            sublabel="DC Rail Potential"
            value={supplyV}
            unit={vsUnit}
            unitOptions={UNIT_OPTIONS.voltage}
            onChange={setSupplyV}
            onUnitChange={setVsUnit}
          />

          <UnitInput
            label="LED Forward Drop (Vf)"
            sublabel="Diode Junction Drop"
            value={forwardV}
            unit={vfUnit}
            unitOptions={UNIT_OPTIONS.voltage}
            onChange={setForwardV}
            onUnitChange={setVfUnit}
          />

          <UnitInput
            label="LED Forward Current (If)"
            sublabel="Desired Brightness Current"
            value={forwardI}
            unit={ifUnit}
            unitOptions={UNIT_OPTIONS.current}
            onChange={setForwardI}
            onUnitChange={setIfUnit}
          />

          {/* Glowing LED Preview Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedColor.glowClass}`}
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {selectedColor.name} LED Emitting
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Total Circuit Power: {formatEngineering(results.powerTotal, 'W').formatted}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-cyan-400">
              {formatEngineering(results.powerLed, 'W').formatted} (LED)
            </span>
          </div>
        </div>

        {/* Right Schematic & Standard Resistor Match */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <SchematicViewer
            type="led"
            values={{
              vsStr: `${supplyV}V`,
              vfStr: `${forwardV}V`,
              ifStr: formatEngineering(forwardI, 'A').formatted,
              rStr: results.stdResistor.formatted,
              powerStr: formatEngineering(results.powerR, 'W').formatted,
              colorHex: selectedColor.hex,
            }}
          />

          {/* Results Telemetry Tiles */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Theoretical R</span>
              <span className="text-xl font-bold text-cyan-300">
                {formatEngineering(results.requiredR, 'Ω').formatted}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Nearest E24 Resistor</span>
              <span className="text-xl font-bold text-emerald-400">
                {results.stdResistor.formatted}
              </span>
            </div>
          </div>

          {/* Wattage Rating & Actual Current Card */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-semibold uppercase tracking-wider">
                Recommended Power Rating
              </span>
              <span className="font-mono font-bold text-amber-400">
                {results.wattageRec.recommended}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Heat Dissipated: {formatEngineering(results.powerR, 'W').formatted} · Real current with {results.stdResistor.formatted} is {formatEngineering(results.actualCurrent, 'A').formatted}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookmarkPlus className="w-4 h-4 text-cyan-400" />
            <span>Save LED Calculation to History</span>
          </button>
        </div>
      </div>

      <FormulaCard
        title="LED Current Limiting & Dissipation"
        formulaUnicode="R = (Vs - Vf) / If  ·  PR = (Vs - Vf) × If"
        latex="R = \\frac{V_s - V_f}{I_f}, \\quad P_R = (V_s - V_f) \\cdot I_f"
        description="LEDs are current-driven semiconductor diodes with low dynamic internal resistance. A series resistor drops the surplus voltage (Vs - Vf) to restrict current to safe continuous operating limits."
        variables={[
          { symbol: 'Vs', meaning: 'Source voltage', unit: 'V' },
          { symbol: 'Vf', meaning: 'LED forward drop voltage', unit: 'V' },
          { symbol: 'If', meaning: 'Desired forward continuous current', unit: 'A' },
          { symbol: 'PR', meaning: 'Heat dissipation in resistor', unit: 'W' },
        ]}
        steps={results.steps}
      />
    </div>
  );
};
