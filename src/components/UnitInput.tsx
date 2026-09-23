import React, { useId } from 'react';
import { UnitOption } from '../types/electronics';
import { motion } from 'motion/react';

interface UnitInputProps {
  label: string;
  sublabel?: string;
  value: number;
  unit: string;
  unitOptions: UnitOption[];
  onChange: (value: number) => void;
  onUnitChange: (unitSymbol: string) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  isCalculated?: boolean;
  badge?: string;
}

export const UnitInput: React.FC<UnitInputProps> = ({
  label,
  sublabel,
  value,
  unit,
  unitOptions,
  onChange,
  onUnitChange,
  min = 0,
  max,
  precision = 3,
  disabled = false,
  isCalculated = false,
  badge,
}) => {
  const inputId = useId();

  // Find the factor for the selected unit symbol
  const currentOption = unitOptions.find((opt) => opt.symbol === unit) || unitOptions[0];
  const factor = currentOption ? currentOption.factor : 1;

  // Display value in current unit
  const displayValue = Number((value / factor).toFixed(precision));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNum = parseFloat(e.target.value);
    if (isNaN(rawNum)) {
      onChange(0);
      return;
    }
    const realValue = rawNum * factor;
    onChange(realValue);
  };

  const handleUnitSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = e.target.value;
    onUnitChange(newSymbol);
  };

  const handleQuickScale = (multiplier: number) => {
    const nextVal = Math.max(min, value * multiplier);
    onChange(nextVal);
  };

  return (
    <motion.div 
      layout
      transition={{ duration: 0.18 }}
      className={`relative p-3.5 rounded-xl border transition-all ${
        isCalculated
          ? 'bg-cyan-950/20 border-cyan-500/40 dark:bg-cyan-950/20'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 dark:bg-slate-900/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-semibold tracking-wide uppercase text-slate-300 dark:text-slate-300 flex items-center gap-1.5"
        >
          <span>{label}</span>
          {sublabel && (
            <span className="text-[11px] font-normal lowercase text-slate-500">
              ({sublabel})
            </span>
          )}
        </label>

        {badge && (
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}

        {isCalculated && (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
            SOLVED
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            id={inputId}
            type="number"
            value={isNaN(displayValue) ? '' : displayValue}
            onChange={handleInputChange}
            disabled={disabled}
            min={min}
            max={max}
            step="any"
            className={`w-full px-3 py-2 text-base font-mono tabular-nums font-semibold rounded-lg outline-none transition-colors border ${
              isCalculated
                ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/50 focus:border-cyan-400'
                : 'bg-slate-950 text-slate-100 border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Unit Dropdown */}
        <div className="relative">
          <select
            value={unit}
            onChange={handleUnitSelect}
            aria-label={`${label} unit`}
            className="appearance-none bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium px-2.5 py-2.5 pr-6 rounded-lg border border-slate-700 cursor-pointer outline-none focus:border-cyan-500 transition-colors"
          >
            {unitOptions.map((opt) => (
              <option key={opt.symbol} value={opt.symbol}>
                {opt.symbol} ({opt.label})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Quick micro controls: x0.1 and x10 */}
      {!disabled && !isCalculated && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/70 text-[11px] text-slate-500">
          <span className="font-mono text-[10px] text-slate-500">
            SI: {value.toExponential(2)} {unitOptions.find((u) => u.factor === 1)?.symbol || ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleQuickScale(0.1)}
              title="Divide by 10"
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] transition-colors"
            >
              ÷10
            </button>
            <button
              type="button"
              onClick={() => handleQuickScale(10)}
              title="Multiply by 10"
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] transition-colors"
            >
              ×10
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
