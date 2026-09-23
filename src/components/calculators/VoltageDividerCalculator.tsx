import React, { useState, useMemo } from 'react';
import { UnitInput } from '../UnitInput';
import { FormulaCard } from '../FormulaCard';
import { SchematicViewer } from '../SchematicViewer';
import { UNIT_OPTIONS, formatEngineering, findNearestESeries } from '../../utils/engineering';
import { CalculationHistoryItem, ESeriesType, StepMathItem } from '../../types/electronics';
import { Sliders, CheckCircle2, BookmarkPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface VoltageDividerCalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const VoltageDividerCalculator: React.FC<VoltageDividerCalculatorProps> = ({ onSaveHistory }) => {
  const [vin, setVin] = useState<number>(5); // 5 Volts
  const [r1, setR1] = useState<number>(10000); // 10k Ohms
  const [r2, setR2] = useState<number>(10000); // 10k Ohms
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [rload, setRload] = useState<number>(100000); // 100k Ohms
  const [standardSeries, setStandardSeries] = useState<ESeriesType>('E24');

  // Units
  const [vinUnit, setVinUnit] = useState<string>('V');
  const [r1Unit, setR1Unit] = useState<string>('kΩ');
  const [r2Unit, setR2Unit] = useState<string>('kΩ');
  const [rloadUnit, setRloadUnit] = useState<string>('kΩ');

  // Math solver
  const results = useMemo(() => {
    const totalRNoLoad = r1 + r2;
    const voutUnloaded = totalRNoLoad > 0 ? vin * (r2 / totalRNoLoad) : 0;
    const ratioUnloaded = totalRNoLoad > 0 ? r2 / totalRNoLoad : 0;

    // Loaded calculation
    let voutLoaded = voutUnloaded;
    let r2Parallel = r2;
    if (isLoaded && rload > 0) {
      r2Parallel = (r2 * rload) / (r2 + rload);
      voutLoaded = (vin * r2Parallel) / (r1 + r2Parallel);
    }

    const currentDivider = totalRNoLoad > 0 ? vin / totalRNoLoad : 0;
    const powerTotal = vin * currentDivider;
    const outputImpedance = totalRNoLoad > 0 ? (r1 * r2) / totalRNoLoad : 0;

    const actualVout = isLoaded ? voutLoaded : voutUnloaded;
    const attenuationDb = actualVout > 0 && vin > 0 ? 20 * Math.log10(actualVout / vin) : 0;

    // Nearest standard E-series pairs
    const stdR1 = findNearestESeries(r1, standardSeries);
    const stdR2 = findNearestESeries(r2, standardSeries);
    const stdTotalR = stdR1.standardValue + stdR2.standardValue;
    const stdVout = stdTotalR > 0 ? vin * (stdR2.standardValue / stdTotalR) : 0;
    const stdVoutErrorPercent =
      voutUnloaded > 0 ? ((stdVout - voutUnloaded) / voutUnloaded) * 100 : 0;

    const steps: StepMathItem[] = [
      {
        step: 'Calculate Unloaded Output Voltage',
        formula: 'Vout = Vin × [R2 / (R1 + R2)]',
        substitution: `${vin}V × [${r2}Ω / (${r1}Ω + ${r2}Ω)]`,
        result: `${voutUnloaded.toFixed(4)} V`,
      },
    ];

    if (isLoaded) {
      steps.push({
        step: 'Calculate Equivalent Parallel Load Resistance (R2 || RL)',
        formula: 'R2_eq = (R2 × RL) / (R2 + RL)',
        substitution: `(${r2}Ω × ${rload}Ω) / (${r2}Ω + ${rload}Ω)`,
        result: `${r2Parallel.toFixed(2)} Ω`,
      });
      steps.push({
        step: 'Calculate Loaded Output Voltage',
        formula: 'Vout_loaded = Vin × [R2_eq / (R1 + R2_eq)]',
        substitution: `${vin}V × [${r2Parallel.toFixed(1)}Ω / (${r1}Ω + ${r2Parallel.toFixed(1)}Ω)]`,
        result: `${voutLoaded.toFixed(4)} V`,
      });
    }

    steps.push({
      step: 'Calculate Output Thevenin Impedance (Zout = R1 || R2)',
      formula: 'Zout = (R1 × R2) / (R1 + R2)',
      substitution: `(${r1}Ω × ${r2}Ω) / (${r1}Ω + ${r2}Ω)`,
      result: `${outputImpedance.toFixed(2)} Ω`,
    });

    return {
      voutUnloaded,
      voutLoaded,
      actualVout,
      ratioUnloaded,
      currentDivider,
      powerTotal,
      outputImpedance,
      attenuationDb,
      stdR1,
      stdR2,
      stdVout,
      stdVoutErrorPercent,
      steps,
    };
  }, [vin, r1, r2, isLoaded, rload, standardSeries]);

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'voltage-divider',
      title: 'Voltage Divider Network',
      summary: `Vin=${formatEngineering(vin, 'V').formatted} → Vout=${formatEngineering(results.actualVout, 'V').formatted} (Ratio: ${(results.ratioUnloaded * 100).toFixed(1)}%)`,
      details: [
        { label: 'Input Voltage (Vin)', value: formatEngineering(vin, 'V').formatted },
        { label: 'Output Voltage (Vout)', value: formatEngineering(results.actualVout, 'V').formatted },
        { label: 'R1', value: formatEngineering(r1, 'Ω').formatted },
        { label: 'R2', value: formatEngineering(r2, 'Ω').formatted },
        { label: 'Thevenin Impedance', value: formatEngineering(results.outputImpedance, 'Ω').formatted },
        { label: 'Nearest Standard E-Series', value: `R1: ${results.stdR1.formatted}, R2: ${results.stdR2.formatted} (Vout: ${results.stdVout.toFixed(3)}V)` },
      ],
    });
  };

  // Quick Potentiometer slider adjustment
  const handleRatioSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ratio = parseFloat(e.target.value);
    const totalR = r1 + r2 || 10000;
    const newR2 = Math.max(1, totalR * ratio);
    const newR1 = Math.max(1, totalR * (1 - ratio));
    setR1(newR1);
    setR2(newR2);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Divider Configuration
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Loaded Divider Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
            <input
              type="checkbox"
              checked={isLoaded}
              onChange={(e) => setIsLoaded(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500/20"
            />
            <span>Include Load (RL)</span>
          </label>

          <div className="h-4 w-[1px] bg-slate-700"></div>

          {/* Standard Series Picker */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Standard Series:</span>
            {(['E12', 'E24', 'E96'] as ESeriesType[]).map((series) => (
              <button
                key={series}
                type="button"
                onClick={() => setStandardSeries(series)}
                className={`px-2 py-0.5 text-xs font-mono rounded ${
                  standardSeries === series
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {series}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inputs & Schematic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          <UnitInput
            label="Input Voltage (Vin)"
            sublabel="Source Potential"
            value={vin}
            unit={vinUnit}
            unitOptions={UNIT_OPTIONS.voltage}
            onChange={setVin}
            onUnitChange={setVinUnit}
          />

          <UnitInput
            label="Upper Resistor (R1)"
            sublabel="Pull-up / High-side"
            value={r1}
            unit={r1Unit}
            unitOptions={UNIT_OPTIONS.resistance}
            onChange={setR1}
            onUnitChange={setR1Unit}
          />

          <UnitInput
            label="Lower Resistor (R2)"
            sublabel="Pull-down / Low-side"
            value={r2}
            unit={r2Unit}
            unitOptions={UNIT_OPTIONS.resistance}
            onChange={setR2}
            onUnitChange={setR2Unit}
          />

          {isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <UnitInput
                label="Load Resistor (RL)"
                sublabel="Next Stage Impedance"
                value={rload}
                unit={rloadUnit}
                unitOptions={UNIT_OPTIONS.resistance}
                onChange={setRload}
                onUnitChange={setRloadUnit}
                badge="LOAD"
              />
            </motion.div>
          )}

          {/* Interactive Potentiometer Slider */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Potentiometer Wiper Ratio:</span>
              <span className="text-cyan-400 font-bold">
                {(results.ratioUnloaded * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.99"
              step="0.005"
              value={results.ratioUnloaded}
              onChange={handleRatioSlider}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (0V)</span>
              <span>50% (Vin / 2)</span>
              <span>100% (Vin)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Schematic + Results Telemetry */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <SchematicViewer
            type="divider"
            values={{
              vinStr: formatEngineering(vin, 'V').formatted,
              r1Str: formatEngineering(r1, 'Ω').formatted,
              r2Str: formatEngineering(r2, 'Ω').formatted,
              voutStr: formatEngineering(results.actualVout, 'V').formatted,
              rloadStr: isLoaded ? formatEngineering(rload, 'Ω').formatted : '',
            }}
          />

          {/* Precision Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">
                Output Voltage
              </span>
              <span className="text-xl font-mono font-bold text-cyan-300">
                {formatEngineering(results.actualVout, 'V').formatted}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">
                Thevenin Zout
              </span>
              <span className="text-xl font-mono font-bold text-slate-200">
                {formatEngineering(results.outputImpedance, 'Ω').formatted}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">
                Attenuation
              </span>
              <span className="text-xl font-mono font-bold text-amber-300">
                {results.attenuationDb.toFixed(2)} dB
              </span>
            </div>
          </div>

          {/* Standard Resistor Value Recommendation Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Nearest {standardSeries} Standard Values</span>
              </div>
              <span className={`font-mono font-bold ${Math.abs(results.stdVoutErrorPercent) < 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {results.stdVoutErrorPercent > 0 ? '+' : ''}{results.stdVoutErrorPercent.toFixed(2)}% Error
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-slate-300">
              <div>
                <span className="text-slate-500">R1 std: </span>
                <span className="font-bold text-white">{results.stdR1.formatted}</span>
              </div>
              <div>
                <span className="text-slate-500">R2 std: </span>
                <span className="font-bold text-white">{results.stdR2.formatted}</span>
              </div>
              <div className="col-span-2 text-slate-400 pt-1 border-t border-slate-800">
                <span>Real Vout with standard parts: </span>
                <span className="font-bold text-cyan-400">{results.stdVout.toFixed(3)} V</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookmarkPlus className="w-4 h-4 text-cyan-400" />
            <span>Save to Calculation History</span>
          </button>
        </div>
      </div>

      <FormulaCard
        title="Voltage Divider & Loading Factor"
        formulaUnicode="Vout = Vin × [R2 / (R1 + R2)]  ·  Zout = R1 || R2"
        latex="V_{\text{out}} = V_{\text{in}} \cdot \frac{R_2}{R_1 + R_2} \quad \text{and} \quad Z_{\text{out}} = \frac{R_1 R_2}{R_1 + R_2}"
        description="A voltage divider produces an output voltage that is a fraction of its input. If a finite load resistance RL is connected across R2, the output voltage drops due to loading (R2 || RL)."
        variables={[
          { symbol: 'Vin', meaning: 'Input Rail Voltage', unit: 'V' },
          { symbol: 'Vout', meaning: 'Divided Output Voltage', unit: 'V' },
          { symbol: 'R1', meaning: 'Upper Pull-up Resistor', unit: 'Ω' },
          { symbol: 'R2', meaning: 'Lower Pull-down Resistor', unit: 'Ω' },
          { symbol: 'Zout', meaning: 'Thevenin Output Impedance', unit: 'Ω' },
        ]}
        steps={results.steps}
      />
    </div>
  );
};
