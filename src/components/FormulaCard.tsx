import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { StepMathItem } from '../types/electronics';
import { motion, AnimatePresence } from 'motion/react';

interface FormulaCardProps {
  title: string;
  formulaUnicode: string;
  latex?: string;
  description: string;
  steps?: StepMathItem[];
  variables?: { symbol: string; meaning: string; unit: string }[];
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  title,
  formulaUnicode,
  latex,
  description,
  steps = [],
  variables = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleCopy = () => {
    const textToCopy = latex ? `${formulaUnicode} [LaTeX: ${latex}]` : formulaUnicode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Governing Equation · {title}
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-cyan-300 mt-1 tracking-wide">
            {formulaUnicode}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
          title="Copy Formula & LaTeX"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">Copy</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">{description}</p>

      {/* Variables explanation list */}
      {variables.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 mb-3 text-xs">
          {variables.map((v) => (
            <div key={v.symbol} className="flex items-baseline gap-1.5">
              <span className="font-mono font-bold text-cyan-400">{v.symbol}:</span>
              <span className="text-slate-400 truncate">{v.meaning}</span>
              <span className="text-[10px] text-slate-500 font-mono">({v.unit})</span>
            </div>
          ))}
        </div>
      )}

      {/* Expandable Step-by-Step Derivation */}
      {steps.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSteps(!showSteps)}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showSteps ? 'Hide Calculation Steps' : 'Show Calculation Steps & Substitution'}</span>
          </button>

          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t border-slate-800 space-y-2 overflow-hidden"
              >
                {steps.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs font-mono"
                  >
                    <div className="text-slate-400 font-sans font-medium mb-1">
                      Step {idx + 1}: {s.step}
                    </div>
                    <div className="text-slate-400">Formula: <span className="text-cyan-300">{s.formula}</span></div>
                    <div className="text-slate-400">Substituted: <span className="text-amber-300">{s.substitution}</span></div>
                    <div className="text-emerald-400 font-bold mt-0.5">Result: {s.result}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
