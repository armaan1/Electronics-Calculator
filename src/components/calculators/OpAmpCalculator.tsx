import React, { useState, useMemo } from 'react';
import { UnitInput } from '../UnitInput';
import { FormulaCard } from '../FormulaCard';
import { SchematicViewer } from '../SchematicViewer';
import { UNIT_OPTIONS, formatEngineering } from '../../utils/engineering';
import { CalculationHistoryItem, StepMathItem } from '../../types/electronics';
import { Gauge, BookmarkPlus } from 'lucide-react';

interface OpAmpCalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

type OpAmpMode = 'inverting' | 'non-inverting';

export const OpAmpCalculator: React.FC<OpAmpCalculatorProps> = ({ onSaveHistory }) => {
  const [mode, setMode] = useState<OpAmpMode>('inverting');
  const [rin, setRin] = useState<number>(10000); // 10k
  const [rf, setRf] = useState<number>(100000); // 100k
  const [vin, setVin] = useState<number>(0.5); // 0.5V peak

  // Units
  const [rinUnit, setRinUnit] = useState<string>('kΩ');
  const [rfUnit, setRfUnit] = useState<string>('kΩ');
  const [vinUnit, setVinUnit] = useState<string>('V');

  const results = useMemo(() => {
    const steps: StepMathItem[] = [];
    let gain = 1;
    let vout = 0;

    if (mode === 'inverting') {
      gain = rin > 0 ? -(rf / rin) : 0;
      vout = gain * vin;
      steps.push({
        step: 'Calculate Inverting Closed-Loop Gain (Av)',
        formula: 'Av = - (Rf / Rin)',
        substitution: `- (${rf} Ω / ${rin} Ω)`,
        result: `${gain.toFixed(2)}`,
      });
    } else {
      gain = rin > 0 ? 1 + (rf / rin) : 1;
      vout = gain * vin;
      steps.push({
        step: 'Calculate Non-Inverting Closed-Loop Gain (Av)',
        formula: 'Av = 1 + (Rf / Rin)',
        substitution: `1 + (${rf} Ω / ${rin} Ω)`,
        result: `${gain.toFixed(2)}`,
      });
    }

    const gainMagnitude = Math.abs(gain);
    const gainDb = gainMagnitude > 0 ? 20 * Math.log10(gainMagnitude) : 0;

    steps.push({
      step: 'Calculate Output Voltage Amplitude (Vout)',
      formula: 'Vout = Av × Vin',
      substitution: `${gain.toFixed(2)} × ${vin} V`,
      result: `${vout.toFixed(3)} V`,
    });

    steps.push({
      step: 'Voltage Gain in Decibels (dB)',
      formula: 'Gain(dB) = 20 × log10(|Av|)',
      substitution: `20 × log10(${gainMagnitude.toFixed(2)})`,
      result: `${gainDb.toFixed(2)} dB`,
    });

    return {
      gain,
      gainMagnitude,
      gainDb,
      vout,
      steps,
    };
  }, [mode, rin, rf, vin]);

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'op-amp',
      title: `Op-Amp ${mode === 'inverting' ? 'Inverting' : 'Non-Inverting'} Amplifier`,
      summary: `Gain Av=${results.gain.toFixed(2)}x (${results.gainDb.toFixed(1)} dB), Vout=${results.vout.toFixed(2)}V (Vin=${vin}V)`,
      details: [
        { label: 'Amplifier Topology', value: mode === 'inverting' ? 'Inverting (-180°)' : 'Non-Inverting (0°)' },
        { label: 'Voltage Gain (Av)', value: `${results.gain.toFixed(2)}x` },
        { label: 'Gain in dB', value: `${results.gainDb.toFixed(2)} dB` },
        { label: 'Output Peak Voltage', value: `${results.vout.toFixed(3)} V` },
        { label: 'Feedback Resistor (Rf)', value: formatEngineering(rf, 'Ω').formatted },
        { label: 'Input Resistor (Rin)', value: formatEngineering(rin, 'Ω').formatted },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Topology Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Op-Amp Circuit Topology:
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('inverting')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'inverting'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inverting (-180° Phase)
          </button>
          <button
            type="button"
            onClick={() => setMode('non-inverting')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'non-inverting'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Non-Inverting (In-Phase)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-3">
          <UnitInput
            label="Input Resistor (Rin)"
            sublabel="Sets input impedance"
            value={rin}
            unit={rinUnit}
            unitOptions={UNIT_OPTIONS.resistance}
            onChange={setRin}
            onUnitChange={setRinUnit}
          />

          <UnitInput
            label="Feedback Resistor (Rf)"
            sublabel="Feedback loop scaling"
            value={rf}
            unit={rfUnit}
            unitOptions={UNIT_OPTIONS.resistance}
            onChange={setRf}
            onUnitChange={setRfUnit}
          />

          <UnitInput
            label="Input Voltage Amplitude (Vin)"
            sublabel="Peak input signal"
            value={vin}
            unit={vinUnit}
            unitOptions={UNIT_OPTIONS.voltage}
            onChange={setVin}
            onUnitChange={setVinUnit}
          />
        </div>

        {/* Right Schematic & Dual Oscilloscope Preview */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <SchematicViewer
            type="opamp"
            values={{
              mode,
              gainStr: `${results.gain.toFixed(2)}x`,
            }}
          />

          {/* Dual Waveform Oscilloscope Visualizer */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Vin ({vin}V)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Vout ({results.vout.toFixed(2)}V)</span>
                </span>
              </span>
              <span className="text-slate-400">Phase: {mode === 'inverting' ? '180° Inverted' : '0° In-Phase'}</span>
            </div>

            <svg viewBox="0 0 320 80" className="w-full h-[70px]">
              <line x1="10" y1="40" x2="310" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

              {/* Vin sine wave (Cyan) */}
              <path
                d="M 10 40 Q 47.5 15, 85 40 T 160 40 T 235 40 T 310 40"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />

              {/* Vout sine wave (Emerald), inverted if mode is inverting */}
              <path
                d={
                  mode === 'inverting'
                    ? 'M 10 40 Q 47.5 65, 85 40 T 160 40 T 235 40 T 310 40'
                    : 'M 10 40 Q 47.5 15, 85 40 T 160 40 T 235 40 T 310 40'
                }
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray={mode === 'inverting' ? '4,2' : undefined}
              />
            </svg>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-3 gap-2 font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Closed-Loop Gain</span>
              <span className="text-base font-bold text-cyan-300">
                {results.gain.toFixed(2)}x
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Gain in dB</span>
              <span className="text-base font-bold text-amber-300">
                {results.gainDb.toFixed(1)} dB
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Output Peak</span>
              <span className="text-base font-bold text-emerald-300">
                {results.vout.toFixed(2)} V
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookmarkPlus className="w-4 h-4 text-cyan-400" />
            <span>Save Op-Amp Calculation to History</span>
          </button>
        </div>
      </div>

      <FormulaCard
        title={mode === 'inverting' ? 'Inverting Operational Amplifier' : 'Non-Inverting Operational Amplifier'}
        formulaUnicode={
          mode === 'inverting'
            ? 'Av = - (Rf / Rin)  ·  Vout = Av × Vin'
            : 'Av = 1 + (Rf / Rin)  ·  Vout = Av × Vin'
        }
        latex={
          mode === 'inverting'
            ? 'A_v = -\\frac{R_f}{R_{\\text{in}}}, \\quad V_{\\text{out}} = A_v V_{\\text{in}}'
            : 'A_v = 1 + \\frac{R_f}{R_{\\text{in}}}, \\quad V_{\\text{out}} = A_v V_{\\text{in}}'
        }
        description={
          mode === 'inverting'
            ? 'Inverting topology holds the inverting terminal at virtual ground. Input impedance equals Rin, and output signal is phase-shifted by 180 degrees.'
            : 'Non-inverting topology provides extremely high input impedance (ideal for high-impedance sensors) with zero phase inversion.'
        }
        variables={[
          { symbol: 'Av', meaning: 'Closed loop voltage gain factor', unit: 'ratio' },
          { symbol: 'Rf', meaning: 'Negative feedback resistor', unit: 'Ω' },
          { symbol: 'Rin', meaning: 'Input resistor', unit: 'Ω' },
          { symbol: 'Vout', meaning: 'Amplified peak output voltage', unit: 'V' },
        ]}
        steps={results.steps}
      />
    </div>
  );
};
