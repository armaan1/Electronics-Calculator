import React, { useState, useMemo } from 'react';
import { COLOR_BANDS, formatEngineering } from '../../utils/engineering';
import { ResistorColorBand, CalculationHistoryItem } from '../../types/electronics';
import { Palette, BookmarkPlus, ArrowRightLeft } from 'lucide-react';

interface ResistorColorCodeCalculatorProps {
  onSaveHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

type BandCount = 4 | 5 | 6;

export const ResistorColorCodeCalculator: React.FC<ResistorColorCodeCalculatorProps> = ({ onSaveHistory }) => {
  const [bandCount, setBandCount] = useState<BandCount>(4);
  const [direction, setDirection] = useState<'bands-to-value' | 'value-to-bands'>('bands-to-value');

  // Band selections
  const [band1, setBand1] = useState<number>(4); // Yellow (4)
  const [band2, setBand2] = useState<number>(7); // Violet (7)
  const [band3, setBand3] = useState<number>(0); // Black (0)
  const [multiplierIdx, setMultiplierIdx] = useState<number>(2); // Red (x100) -> 4.7k
  const [toleranceIdx, setToleranceIdx] = useState<number>(10); // Gold (5%)
  const [tempCoIdx, setTempCoIdx] = useState<number>(1); // Brown (100 ppm/K)

  // Reverse search state
  const [reverseTargetOhms, setReverseTargetOhms] = useState<number>(4700);

  // Filter color band arrays for specific roles
  const digitBands = useMemo(() => COLOR_BANDS.filter((b) => b.digit !== undefined), []);
  const multiplierBands = useMemo(() => COLOR_BANDS.filter((b) => b.multiplier !== undefined), []);
  const toleranceBands = useMemo(() => COLOR_BANDS.filter((b) => b.tolerance !== undefined), []);
  const tempCoBands = useMemo(() => COLOR_BANDS.filter((b) => b.tempCo !== undefined), []);

  // Compute resistance from bands
  const calculation = useMemo(() => {
    const b1 = COLOR_BANDS[band1] || COLOR_BANDS[0];
    const b2 = COLOR_BANDS[band2] || COLOR_BANDS[0];
    const b3 = COLOR_BANDS[band3] || COLOR_BANDS[0];
    const mult = COLOR_BANDS[multiplierIdx] || COLOR_BANDS[0];
    const tol = COLOR_BANDS[toleranceIdx] || COLOR_BANDS[10];
    const tempCo = COLOR_BANDS[tempCoIdx] || COLOR_BANDS[1];

    let digits = 0;
    if (bandCount === 4) {
      digits = (b1.digit ?? 0) * 10 + (b2.digit ?? 0);
    } else {
      digits = (b1.digit ?? 0) * 100 + (b2.digit ?? 0) * 10 + (b3.digit ?? 0);
    }

    const multiplierVal = mult.multiplier ?? 1;
    const nominalOhms = digits * multiplierVal;
    const toleranceVal = tol.tolerance ?? 5;
    const minOhms = nominalOhms * (1 - toleranceVal / 100);
    const maxOhms = nominalOhms * (1 + toleranceVal / 100);

    return {
      nominalOhms,
      toleranceVal,
      tempCoVal: tempCo.tempCo ?? 100,
      minOhms,
      maxOhms,
      b1,
      b2,
      b3,
      mult,
      tol,
      tempCo,
    };
  }, [bandCount, band1, band2, band3, multiplierIdx, toleranceIdx, tempCoIdx]);

  // Handle Reverse Search (Type Value -> update color bands)
  const handleReverseCalculate = (target: number) => {
    setReverseTargetOhms(target);
    if (target <= 0) return;

    if (bandCount === 4) {
      // 2 digits
      const decade = Math.floor(Math.log10(target));
      const multFactor = Math.pow(10, decade - 1);
      const digits = Math.round(target / multFactor);
      const d1 = Math.floor(digits / 10) % 10;
      const d2 = digits % 10;

      const foundD1 = COLOR_BANDS.findIndex((b) => b.digit === d1);
      const foundD2 = COLOR_BANDS.findIndex((b) => b.digit === d2);
      const foundMult = COLOR_BANDS.findIndex((b) => Math.abs((b.multiplier ?? 0) - multFactor) < 0.001);

      if (foundD1 !== -1) setBand1(foundD1);
      if (foundD2 !== -1) setBand2(foundD2);
      if (foundMult !== -1) setMultiplierIdx(foundMult);
    } else {
      // 3 digits
      const decade = Math.floor(Math.log10(target));
      const multFactor = Math.pow(10, decade - 2);
      const digits = Math.round(target / multFactor);
      const d1 = Math.floor(digits / 100) % 10;
      const d2 = Math.floor((digits % 100) / 10);
      const d3 = digits % 10;

      const foundD1 = COLOR_BANDS.findIndex((b) => b.digit === d1);
      const foundD2 = COLOR_BANDS.findIndex((b) => b.digit === d2);
      const foundD3 = COLOR_BANDS.findIndex((b) => b.digit === d3);
      const foundMult = COLOR_BANDS.findIndex((b) => Math.abs((b.multiplier ?? 0) - multFactor) < 0.001);

      if (foundD1 !== -1) setBand1(foundD1);
      if (foundD2 !== -1) setBand2(foundD2);
      if (foundD3 !== -1) setBand3(foundD3);
      if (foundMult !== -1) setMultiplierIdx(foundMult);
    }
  };

  const handleSave = () => {
    onSaveHistory({
      calculatorId: 'resistor-color',
      title: `${bandCount}-Band Resistor Color Code`,
      summary: `${formatEngineering(calculation.nominalOhms, 'Ω').formatted} ±${calculation.toleranceVal}% (${calculation.b1.name}-${calculation.b2.name}-${calculation.mult.name}-${calculation.tol.name})`,
      details: [
        { label: 'Nominal Value', value: formatEngineering(calculation.nominalOhms, 'Ω').formatted },
        { label: 'Tolerance', value: `±${calculation.toleranceVal}%` },
        { label: 'Guaranteed Range', value: `${formatEngineering(calculation.minOhms, 'Ω').formatted} to ${formatEngineering(calculation.maxOhms, 'Ω').formatted}` },
        { label: 'Color Sequence', value: `${calculation.b1.name} · ${calculation.b2.name} · ${calculation.mult.name} · ${calculation.tol.name}` },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls: Band count & Direction */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Resistor Band Format:
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {([4, 5, 6] as BandCount[]).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setBandCount(count)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  bandCount === count
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {count}-Band
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setDirection(direction === 'bands-to-value' ? 'value-to-bands' : 'bands-to-value')
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>{direction === 'bands-to-value' ? 'Switch to Value Search' : 'Switch to Band Picker'}</span>
          </button>
        </div>
      </div>

      {/* Reverse Search Input if mode enabled */}
      {direction === 'value-to-bands' && (
        <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider block">
              Reverse Lookup: Enter Resistance in Ohms
            </span>
            <span className="text-xs text-slate-400">
              Type any value (e.g. 4700 for 4.7kΩ) and color bands will update automatically.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={reverseTargetOhms}
              onChange={(e) => handleReverseCalculate(parseFloat(e.target.value) || 0)}
              className="w-36 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-cyan-300 font-bold text-base outline-none focus:border-cyan-400"
            />
            <span className="font-mono text-slate-400 font-bold">Ω</span>
          </div>
        </div>
      )}

      {/* Interactive Axial Resistor Visual Illustration */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[500px] h-[130px] flex items-center justify-center">
          <svg viewBox="0 0 440 100" className="w-full h-full select-none">
            {/* Left metallic wire lead */}
            <line x1="10" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            
            {/* Right metallic wire lead */}
            <line x1="340" y1="50" x2="430" y2="50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

            {/* Resistor ceramic body */}
            {/* Left bulb */}
            <rect x="100" y="26" width="30" height="48" rx="8" fill="#e2d9cc" stroke="#cbd5e1" strokeWidth="1" />
            {/* Middle body */}
            <rect x="120" y="32" width="200" height="36" fill="#e2d9cc" stroke="#cbd5e1" strokeWidth="1" />
            {/* Right bulb */}
            <rect x="310" y="26" width="30" height="48" rx="8" fill="#e2d9cc" stroke="#cbd5e1" strokeWidth="1" />

            {/* Band 1 */}
            <rect
              x="125"
              y="26"
              width="12"
              height="48"
              fill={calculation.b1.color === 'black' ? '#18181b' : calculation.b1.color === 'white' ? '#f8fafc' : calculation.b1.color}
              rx="2"
            />

            {/* Band 2 */}
            <rect
              x="155"
              y="32"
              width="12"
              height="36"
              fill={calculation.b2.color === 'black' ? '#18181b' : calculation.b2.color === 'white' ? '#f8fafc' : calculation.b2.color}
              rx="2"
            />

            {/* Band 3 (Only for 5 and 6 band) */}
            {bandCount >= 5 && (
              <rect
                x="185"
                y="32"
                width="12"
                height="36"
                fill={calculation.b3.color === 'black' ? '#18181b' : calculation.b3.color === 'white' ? '#f8fafc' : calculation.b3.color}
                rx="2"
              />
            )}

            {/* Multiplier Band */}
            <rect
              x={bandCount === 4 ? 205 : 225}
              y="32"
              width="12"
              height="36"
              fill={
                calculation.mult.color === 'gold'
                  ? '#f59e0b'
                  : calculation.mult.color === 'silver'
                  ? '#cbd5e1'
                  : calculation.mult.color === 'black'
                  ? '#18181b'
                  : calculation.mult.color
              }
              rx="2"
            />

            {/* Tolerance Band */}
            <rect
              x="275"
              y="32"
              width="12"
              height="36"
              fill={
                calculation.tol.color === 'gold'
                  ? '#f59e0b'
                  : calculation.tol.color === 'silver'
                  ? '#cbd5e1'
                  : calculation.tol.color
              }
              rx="2"
            />

            {/* 6th TempCo Band */}
            {bandCount === 6 && (
              <rect
                x="305"
                y="26"
                width="12"
                height="48"
                fill={calculation.tempCo.color}
                rx="2"
              />
            )}
          </svg>
        </div>

        {/* Big Resistor Readout */}
        <div className="text-center mt-2">
          <div className="text-2xl md:text-3xl font-mono font-bold text-white tracking-wide">
            {formatEngineering(calculation.nominalOhms, 'Ω').formatted}
            <span className="text-cyan-400 ml-2">±{calculation.toleranceVal}%</span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Range: {formatEngineering(calculation.minOhms, 'Ω').formatted} — {formatEngineering(calculation.maxOhms, 'Ω').formatted}
            {bandCount === 6 && ` · ${calculation.tempCoVal} ppm/K`}
          </div>
        </div>
      </div>

      {/* Band Pickers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Band 1 */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            1st Band (1st Digit)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {digitBands.slice(1).map((b, idx) => (
              <button
                key={b.color}
                type="button"
                onClick={() => setBand1(COLOR_BANDS.indexOf(b))}
                className={`h-8 rounded flex items-center justify-center font-mono text-xs font-bold transition-transform ${b.bgClass} ${b.textClass} ${
                  band1 === COLOR_BANDS.indexOf(b) ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80 hover:opacity-100'
                }`}
                title={`${b.name} (${b.digit})`}
              >
                {b.digit}
              </button>
            ))}
          </div>
        </div>

        {/* Band 2 */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            2nd Band (2nd Digit)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {digitBands.map((b) => (
              <button
                key={b.color}
                type="button"
                onClick={() => setBand2(COLOR_BANDS.indexOf(b))}
                className={`h-8 rounded flex items-center justify-center font-mono text-xs font-bold transition-transform ${b.bgClass} ${b.textClass} ${
                  band2 === COLOR_BANDS.indexOf(b) ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80 hover:opacity-100'
                }`}
                title={`${b.name} (${b.digit})`}
              >
                {b.digit}
              </button>
            ))}
          </div>
        </div>

        {/* Band 3 (if 5 or 6 band) */}
        {bandCount >= 5 && (
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              3rd Band (3rd Digit)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {digitBands.map((b) => (
                <button
                  key={b.color}
                  type="button"
                  onClick={() => setBand3(COLOR_BANDS.indexOf(b))}
                  className={`h-8 rounded flex items-center justify-center font-mono text-xs font-bold transition-transform ${b.bgClass} ${b.textClass} ${
                    band3 === COLOR_BANDS.indexOf(b) ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={`${b.name} (${b.digit})`}
                >
                  {b.digit}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Multiplier Band */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Multiplier Band (×10ⁿ)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {multiplierBands.map((b) => (
              <button
                key={b.color}
                type="button"
                onClick={() => setMultiplierIdx(COLOR_BANDS.indexOf(b))}
                className={`h-8 rounded px-1 flex items-center justify-center font-mono text-[10px] font-bold transition-transform ${b.bgClass} ${b.textClass} ${
                  multiplierIdx === COLOR_BANDS.indexOf(b) ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80 hover:opacity-100'
                }`}
                title={`${b.name} (x${b.multiplier})`}
              >
                {b.multiplier && b.multiplier >= 1e6
                  ? `${b.multiplier / 1e6}M`
                  : b.multiplier && b.multiplier >= 1e3
                  ? `${b.multiplier / 1e3}k`
                  : b.multiplier}
              </button>
            ))}
          </div>
        </div>

        {/* Tolerance Band */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Tolerance Band (±%)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {toleranceBands.map((b) => (
              <button
                key={b.color}
                type="button"
                onClick={() => setToleranceIdx(COLOR_BANDS.indexOf(b))}
                className={`h-8 rounded px-1 flex items-center justify-center font-mono text-[11px] font-bold transition-transform ${b.bgClass} ${b.textClass} ${
                  toleranceIdx === COLOR_BANDS.indexOf(b) ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80 hover:opacity-100'
                }`}
                title={`${b.name} (±${b.tolerance}%)`}
              >
                ±{b.tolerance}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
        >
          <BookmarkPlus className="w-4 h-4 text-cyan-400" />
          <span>Save Color Code to History</span>
        </button>
      </div>
    </div>
  );
};
