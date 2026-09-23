import React, { useState } from 'react';
import { E12_BASE, E24_BASE, E96_BASE, findNearestESeries, formatEngineering } from '../utils/engineering';
import { ESeriesType } from '../types/electronics';
import { X, Search, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ESeriesLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ESeriesLookupModal: React.FC<ESeriesLookupModalProps> = ({ isOpen, onClose }) => {
  const [selectedSeries, setSelectedSeries] = useState<ESeriesType>('E24');
  const [searchTarget, setSearchTarget] = useState<string>('4700');

  const numSearch = parseFloat(searchTarget) || 0;
  const matchE12 = findNearestESeries(numSearch, 'E12');
  const matchE24 = findNearestESeries(numSearch, 'E24');
  const matchE96 = findNearestESeries(numSearch, 'E96');

  const currentBase =
    selectedSeries === 'E12' ? E12_BASE : selectedSeries === 'E24' ? E24_BASE : E96_BASE;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Standard EIA E-Series Component Values
                  </h3>
                  <span className="text-xs text-slate-400">
                    IEC 60063 standard preferred numbers for resistors and capacitors
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Match Interactive Search */}
            <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Value Finder (Ω / F / H):</span>
                </span>
                <input
                  type="number"
                  placeholder="Enter target e.g. 4700"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  className="w-44 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-400"
                />
              </div>

              {numSearch > 0 && (
                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">E12 (10% Tol)</span>
                    <span className="font-bold text-cyan-300">{matchE12.formatted}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {matchE12.errorPercent > 0 ? '+' : ''}{matchE12.errorPercent.toFixed(1)}% error
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded border border-cyan-500/40">
                    <span className="text-[10px] text-cyan-400 block font-bold">E24 (5% Tol)</span>
                    <span className="font-bold text-white">{matchE24.formatted}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {matchE24.errorPercent > 0 ? '+' : ''}{matchE24.errorPercent.toFixed(1)}% error
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">E96 (1% Tol)</span>
                    <span className="font-bold text-emerald-300">{matchE96.formatted}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {matchE96.errorPercent > 0 ? '+' : ''}{matchE96.errorPercent.toFixed(1)}% error
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Series Selector */}
            <div className="flex items-center gap-2 mb-3">
              {(['E12', 'E24', 'E96'] as ESeriesType[]).map((series) => (
                <button
                  key={series}
                  type="button"
                  onClick={() => setSelectedSeries(series)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors ${
                    selectedSeries === series
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {series} ({series === 'E12' ? '10% tol' : series === 'E24' ? '5% tol' : '1% tol'})
                </button>
              ))}
            </div>

            {/* Decade Table Grid */}
            <div className="flex-1 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 font-mono text-xs text-center">
                {currentBase.map((val) => (
                  <div
                    key={val}
                    className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                  >
                    {val.toFixed(2)}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-3 text-center">
                Multiply values by 10ⁿ (0.1, 1, 10, 100, 1k, 10k, 100k, 1M, 10M...) for standard decade values.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
