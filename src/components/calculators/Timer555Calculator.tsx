import React, { useState, useMemo } from 'react';
import { UnitInput } from '../UnitInput';
import { FormulaCard } from '../FormulaCard';
import { SchematicViewer } from '../SchematicViewer';
import { UNIT_OPTIONS, formatEngineering } from '../../utils/engineering';
import { CalculationHistoryItem, StepMathItem } from '../../types/electronics';
import { Clock, BookmarkPlus } from 'lucide-react';

interface Timer555CalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

type TimerMode = 'astable' | 'monostable';

export const Timer555Calculator: React.FC<Timer555CalculatorProps> = ({ onSaveHistory }) => {
  const [mode, setMode] = useState<TimerMode>('astable');

  // Astable mode parameters: R1, R2, C
  const [r1, setR1] = useState<number>(1000); // 1k
  const [r2, setR2] = useState<number>(10000); // 10k
  const [c, setC] = useState<number>(1e-7); // 100nF

  // Monostable mode parameters: R, C
  const [monoR, setMonoR] = useState<number>(100000); // 100k
  const [monoC, setMonoC] = useState<number>(1e-5); // 10uF

  // Units
  const [r1Unit, setR1Unit] = useState<string>('kΩ');
  const [r2Unit, setR2Unit] = useState<string>('kΩ');
  const [cUnit, setCUnit] = useState<string>('nF');
  const [monoRUnit, setMonoRUnit] = useState<string>('kΩ');
  const [monoCUnit, setMonoCUnit] = useState<string>('µF');

  // Calculations
  const results = useMemo(() => {
    const steps: StepMathItem[] = [];

    if (mode === 'astable') {
      const tHigh = 0.693147 * (r1 + r2) * c;
      const tLow = 0.693147 * r2 * c;
      const period = tHigh + tLow;
      const frequency = period > 0 ? 1 / period : 0;
      const dutyCycle = period > 0 ? (tHigh / period) * 100 : 50;

      steps.push({
        step: 'High Pulse Duration (Output High)',
        formula: 't_high = 0.693 × (R1 + R2) × C',
        substitution: `0.693 × (${r1}Ω + ${r2}Ω) × ${c}F`,
        result: `${formatEngineering(tHigh, 's').formatted}`,
      });
      steps.push({
        step: 'Low Pulse Duration (Output Low)',
        formula: 't_low = 0.693 × R2 × C',
        substitution: `0.693 × ${r2}Ω × ${c}F`,
        result: `${formatEngineering(tLow, 's').formatted}`,
      });
      steps.push({
        step: 'Oscillation Frequency',
        formula: 'f = 1.44 / [(R1 + 2×R2) × C]',
        substitution: `1.44 / [(${r1} + 2×${r2}) × ${c}]`,
        result: `${formatEngineering(frequency, 'Hz').formatted}`,
      });

      return {
        mode: 'astable' as const,
        tHigh,
        tLow,
        period,
        frequency,
        dutyCycle,
        steps,
      };
    } else {
      const pulseWidth = 1.1 * monoR * monoC;
      steps.push({
        step: 'Monostable One-Shot Pulse Width',
        formula: 'T = 1.1 × R × C',
        substitution: `1.1 × ${monoR}Ω × ${monoC}F`,
        result: `${formatEngineering(pulseWidth, 's').formatted}`,
      });

      return {
        mode: 'monostable' as const,
        pulseWidth,
        steps,
      };
    }
  }, [mode, r1, r2, c, monoR, monoC]);

  const handleSave = () => {
    if (results.mode === 'astable') {
      onSaveHistory({
        calculatorId: 'timer-555',
        title: '555 Timer Astable Oscillator',
        summary: `Freq: ${formatEngineering(results.frequency, 'Hz').formatted}, Duty: ${results.dutyCycle.toFixed(1)}% (tH: ${formatEngineering(results.tHigh, 's').formatted}, tL: ${formatEngineering(results.tLow, 's').formatted})`,
        details: [
          { label: 'Frequency (f)', value: formatEngineering(results.frequency, 'Hz').formatted },
          { label: 'Duty Cycle', value: `${results.dutyCycle.toFixed(1)} %` },
          { label: 'High Time (tH)', value: formatEngineering(results.tHigh, 's').formatted },
          { label: 'Low Time (tL)', value: formatEngineering(results.tLow, 's').formatted },
          { label: 'Total Period (T)', value: formatEngineering(results.period, 's').formatted },
        ],
      });
    } else {
      onSaveHistory({
        calculatorId: 'timer-555',
        title: '555 Timer Monostable One-Shot',
        summary: `Pulse Width: ${formatEngineering(results.pulseWidth, 's').formatted} (R=${formatEngineering(monoR, 'Ω').formatted}, C=${formatEngineering(monoC, 'F').formatted})`,
        details: [
          { label: 'Pulse Width (T)', value: formatEngineering(results.pulseWidth, 's').formatted },
          { label: 'Timing Resistor (R)', value: formatEngineering(monoR, 'Ω').formatted },
          { label: 'Timing Capacitor (C)', value: formatEngineering(monoC, 'F').formatted },
        ],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Operating Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            555 Timer Configuration:
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('astable')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'astable'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Astable (Continuous Clock)
          </button>
          <button
            type="button"
            onClick={() => setMode('monostable')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'monostable'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monostable (One-Shot Pulse)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-3">
          {mode === 'astable' ? (
            <>
              <UnitInput
                label="Resistor R1"
                sublabel="Discharge pull-up"
                value={r1}
                unit={r1Unit}
                unitOptions={UNIT_OPTIONS.resistance}
                onChange={setR1}
                onUnitChange={setR1Unit}
              />
              <UnitInput
                label="Resistor R2"
                sublabel="Threshold / Trigger timing"
                value={r2}
                unit={r2Unit}
                unitOptions={UNIT_OPTIONS.resistance}
                onChange={setR2}
                onUnitChange={setR2Unit}
              />
              <UnitInput
                label="Timing Capacitor (C)"
                sublabel="Timing ramp capacity"
                value={c}
                unit={cUnit}
                unitOptions={UNIT_OPTIONS.capacitance}
                onChange={setC}
                onUnitChange={setCUnit}
              />
            </>
          ) : (
            <>
              <UnitInput
                label="Timing Resistor (R)"
                sublabel="Pull-up charging resistor"
                value={monoR}
                unit={monoRUnit}
                unitOptions={UNIT_OPTIONS.resistance}
                onChange={setMonoR}
                onUnitChange={setMonoRUnit}
              />
              <UnitInput
                label="Timing Capacitor (C)"
                sublabel="Pulse duration capacitor"
                value={monoC}
                unit={monoCUnit}
                unitOptions={UNIT_OPTIONS.capacitance}
                onChange={setMonoC}
                onUnitChange={setMonoCUnit}
              />
            </>
          )}
        </div>

        {/* Right Schematic & Waveform Preview */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <SchematicViewer
            type="timer555"
            values={{
              modeStr: mode === 'astable' ? 'Astable Clock' : 'Monostable',
              freqStr:
                results.mode === 'astable'
                  ? formatEngineering(results.frequency, 'Hz').formatted
                  : `T = ${formatEngineering(results.pulseWidth, 's').formatted}`,
              r1Str: mode === 'astable' ? formatEngineering(r1, 'Ω').formatted : formatEngineering(monoR, 'Ω').formatted,
              r2Str: mode === 'astable' ? formatEngineering(r2, 'Ω').formatted : '',
              cStr: mode === 'astable' ? formatEngineering(c, 'F').formatted : formatEngineering(monoC, 'F').formatted,
            }}
          />

          {/* Square Wave Graphic Visualizer */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>Output Pulse Waveform (Pin 3)</span>
              {results.mode === 'astable' ? (
                <span className="text-cyan-400">Duty: {results.dutyCycle.toFixed(1)}%</span>
              ) : (
                <span className="text-cyan-400">Pulse: {formatEngineering(results.pulseWidth, 's').formatted}</span>
              )}
            </div>

            <svg viewBox="0 0 320 80" className="w-full h-[70px]">
              <line x1="10" y1="65" x2="310" y2="65" stroke="#334155" strokeWidth="1" />
              <line x1="10" y1="15" x2="310" y2="15" stroke="#1e293b" strokeDasharray="3,3" />
              
              {results.mode === 'astable' ? (
                // Multi-period square wave reflecting real duty cycle
                <path
                  d="M 10 65 L 10 15 L 70 15 L 70 65 L 110 65 L 110 15 L 170 15 L 170 65 L 210 65 L 210 15 L 270 15 L 270 65 L 310 65"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              ) : (
                // Single shot monostable pulse
                <path
                  d="M 10 65 L 50 65 L 50 15 L 200 15 L 200 65 L 310 65"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                />
              )}
            </svg>
          </div>

          {/* Metric Tiles */}
          {results.mode === 'astable' ? (
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Frequency</span>
                <span className="text-base font-bold text-cyan-300">
                  {formatEngineering(results.frequency, 'Hz').formatted}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">High Time (tH)</span>
                <span className="text-base font-bold text-emerald-300">
                  {formatEngineering(results.tHigh, 's').formatted}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Low Time (tL)</span>
                <span className="text-base font-bold text-amber-300">
                  {formatEngineering(results.tLow, 's').formatted}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Output Pulse Duration (T)</span>
                <span className="text-xl font-bold text-cyan-300">
                  {formatEngineering(results.pulseWidth, 's').formatted}
                </span>
              </div>
              <span className="text-xs text-slate-400">Trigger active-low (Pin 2)</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookmarkPlus className="w-4 h-4 text-cyan-400" />
            <span>Save 555 Calculation to History</span>
          </button>
        </div>
      </div>

      <FormulaCard
        title={mode === 'astable' ? '555 Astable Multivibrator' : '555 Monostable One-Shot'}
        formulaUnicode={
          mode === 'astable'
            ? 'f = 1.44 / [(R1 + 2R2) × C]  ·  Duty = (R1 + R2)/(R1 + 2R2)'
            : 'T = 1.1 × R × C'
        }
        latex={
          mode === 'astable'
            ? 'f = \\frac{1.44}{(R_1 + 2 R_2) C}, \\quad t_H = 0.693 (R_1 + R_2) C, \\quad t_L = 0.693 R_2 C'
            : 'T = 1.1 R C'
        }
        description={
          mode === 'astable'
            ? 'In astable mode, the 555 oscillates continuously as an asynchronous clock generator between 1/3 VCC and 2/3 VCC.'
            : 'In monostable mode, a negative trigger pulse (< 1/3 VCC) triggers a single square output pulse of duration T.'
        }
        variables={
          mode === 'astable'
            ? [
                { symbol: 'f', meaning: 'Clock oscillation frequency', unit: 'Hz' },
                { symbol: 'tH', meaning: 'High output duration', unit: 's' },
                { symbol: 'tL', meaning: 'Low output duration', unit: 's' },
                { symbol: 'C', meaning: 'Timing capacitor', unit: 'F' },
              ]
            : [
                { symbol: 'T', meaning: 'Pulse duration width', unit: 's' },
                { symbol: 'R', meaning: 'Timing charging resistor', unit: 'Ω' },
                { symbol: 'C', meaning: 'Timing capacitor', unit: 'F' },
              ]
        }
        steps={results.steps}
      />
    </div>
  );
};
