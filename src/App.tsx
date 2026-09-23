import React, { useState, useEffect } from 'react';
import { CalculatorId, CalculationHistoryItem, ThemeMode } from './types/electronics';
import { Navbar } from './components/Navbar';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ESeriesLookupModal } from './components/ESeriesLookupModal';
import { CIRCUIT_PRESETS, CircuitPreset } from './utils/presets';

// Calculators
import { OhmsLawCalculator } from './components/calculators/OhmsLawCalculator';
import { VoltageDividerCalculator } from './components/calculators/VoltageDividerCalculator';
import { CapacitorRCCalculator } from './components/calculators/CapacitorRCCalculator';
import { ResonantLCCalculator } from './components/calculators/ResonantLCCalculator';
import { Timer555Calculator } from './components/calculators/Timer555Calculator';
import { LedResistorCalculator } from './components/calculators/LedResistorCalculator';
import { OpAmpCalculator } from './components/calculators/OpAmpCalculator';
import { ResistorColorCodeCalculator } from './components/calculators/ResistorColorCodeCalculator';

import {
  Zap,
  Sliders,
  Activity,
  Radio,
  Clock,
  Sparkles,
  Gauge,
  Palette,
  Search,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CALCULATORS: {
  id: CalculatorId;
  name: string;
  shortDesc: string;
  icon: React.ElementType;
  tag: string;
}[] = [
  {
    id: 'ohms-law',
    name: "Ohm's Law & Power",
    shortDesc: 'V, I, R, P 4-parameter solver with thermal safety derating',
    icon: Zap,
    tag: 'Fundamental',
  },
  {
    id: 'voltage-divider',
    name: 'Voltage Divider',
    shortDesc: 'Loaded & unloaded dividers with E-series standard resistor pairs',
    icon: Sliders,
    tag: 'Passive Networks',
  },
  {
    id: 'capacitor-rc',
    name: 'Capacitors & RC Filters',
    shortDesc: 'Time constant τ, cutoff frequency, stored energy & transient curves',
    icon: Activity,
    tag: 'Transient & AC',
  },
  {
    id: 'resonant-lc',
    name: 'LC Resonant Frequency',
    shortDesc: 'Tank circuit oscillation, Q factor, impedance & Bode bandwidth',
    icon: Radio,
    tag: 'RF & Resonance',
  },
  {
    id: 'timer-555',
    name: '555 Timer IC',
    shortDesc: 'NE555 astable clock and monostable one-shot pulse generator',
    icon: Clock,
    tag: 'Timing Circuits',
  },
  {
    id: 'led-resistor',
    name: 'LED Series Resistor',
    shortDesc: 'Current limiter, forward voltage presets and power dissipation',
    icon: Sparkles,
    tag: 'Optoelectronics',
  },
  {
    id: 'op-amp',
    name: 'Op-Amp Gain',
    shortDesc: 'Inverting and non-inverting operational amplifier stages',
    icon: Gauge,
    tag: 'Active Analog',
  },
  {
    id: 'resistor-color',
    name: 'Resistor Color Code',
    shortDesc: '4, 5, 6-band interactive resistor graphic & reverse search',
    icon: Palette,
    tag: 'Components',
  },
];

export default function App() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorId>('ohms-law');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('voltcraft_theme');
      if (saved === 'dark' || saved === 'dim' || saved === 'light') {
        return saved as ThemeMode;
      }
      return 'dim'; // Default to "A Little Dark" (Dim Slate) for optimal eye comfort
    } catch {
      return 'dim';
    }
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [eSeriesOpen, setESeriesOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('voltcraft_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Theme synchronization - apply dark class and data-theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', themeMode);
    try {
      localStorage.setItem('voltcraft_theme', themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  // Persist history
  const handleSaveHistory = (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...historyItems].slice(0, 30);
    setHistoryItems(updated);
    try {
      localStorage.setItem('voltcraft_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem('voltcraft_history');
    } catch {
      // ignore
    }
  };

  // Filtered calculators for quick search
  const filteredCalculators = CALCULATORS.filter(
    (calc) =>
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Relevant presets for active calculator
  const activePresets = CIRCUIT_PRESETS.filter((p) => p.category === activeCalculator);

  // Theme class for outer shell - Light mode is purposely made "a little dark" (twilight slate)
  const themeShellClass =
    themeMode === 'dark'
      ? 'theme-dark bg-[#020617] text-slate-100 circuit-grid'
      : themeMode === 'dim'
      ? 'theme-dim bg-[#0b1326] text-slate-100 circuit-grid'
      : 'theme-light bg-[#152136] text-slate-100 circuit-grid';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeShellClass}`}>
      {/* Top Bar Contract compliant Navbar */}
      <Navbar
        activeCalculator={activeCalculator}
        onSelectCalculator={(id) => {
          setActiveCalculator(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        themeMode={themeMode}
        onChangeTheme={(mode) => setThemeMode(mode)}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={historyItems.length}
        onOpenESeries={() => setESeriesOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Section & Category Switcher */}
        <section
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b transition-colors ${
            themeMode === 'light'
              ? 'border-slate-700/80'
              : themeMode === 'dim'
              ? 'border-slate-800'
              : 'border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span>Precision Circuit Design</span>
              <span aria-hidden="true">·</span>
              <span>Theoretical & Standard EIA E-Series</span>
              <span aria-hidden="true">·</span>
              <span>Real-Time Formulas</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Electronics Formula & Circuit Analysis Suite
            </h1>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search formulas or circuits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg text-slate-100 placeholder:text-slate-400 outline-none focus:border-cyan-500 transition-colors border ${
                themeMode === 'light'
                  ? 'bg-[#1c2d47] border-slate-700'
                  : themeMode === 'dim'
                  ? 'bg-[#101b30] border-slate-800'
                  : 'bg-slate-900 border-slate-800'
              }`}
            />
          </div>
        </section>

        {/* Calculator Horizontal Carousel / Tab Grid */}
        <section aria-label="Available Calculators">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {filteredCalculators.map((calc) => {
              const Icon = calc.icon;
              const isActive = activeCalculator === calc.id;
              return (
                <button
                  key={calc.id}
                  type="button"
                  onClick={() => setActiveCalculator(calc.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/70 ring-1 ring-cyan-500/40 shadow-lg'
                      : themeMode === 'light'
                      ? 'bg-[#1c2c46]/80 border-slate-700/80 hover:border-slate-600 hover:bg-[#223554]'
                      : themeMode === 'dim'
                      ? 'bg-[#101c33]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#142442]'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-xs font-semibold block truncate ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {calc.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {calc.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Real-World Quick Presets (Adjacency & Practicality) */}
        {activePresets.length > 0 && (
          <section className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reference Presets:</span>
            </span>
            {activePresets.map((preset) => (
              <div
                key={preset.id}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap font-mono text-[11px] flex items-center gap-1.5 transition-colors ${
                  themeMode === 'light'
                    ? 'bg-[#1c2d47] border-slate-700 text-slate-200 hover:text-white'
                    : themeMode === 'dim'
                    ? 'bg-[#101b30] border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title={preset.description}
              >
                <span className="font-medium">{preset.name}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1 py-0.2 rounded">
                  {preset.badge}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Active Calculator Canvas with Animated Transition */}
        <section className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCalculator}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {activeCalculator === 'ohms-law' && (
                <OhmsLawCalculator onSaveHistory={handleSaveHistory} />
              )}
              {activeCalculator === 'voltage-divider' && (
                <VoltageDividerCalculator onSaveHistory={handleSaveHistory} />
              )}
              {activeCalculator === 'capacitor-rc' && (
                <CapacitorRCCalculator onSaveHistory={handleSaveHistory} />
              )}
              {activeCalculator === 'resonant-lc' && (
                <ResonantLCCalculator onSaveHistory={handleSaveHistory} />
              )}
              {activeCalculator === 'timer-555' && (
                <Timer555Calculator onSaveHistory={handleSaveHistory} />
              )}
              {activeCalculator === 'led-resistor' && (
                <LedResistorCalculator onSaveHistory={handleSaveHistory} />
              )}
              {activeCalculator === 'op-amp' && (
                <OpAmpCalculator onSaveHistory={handleSaveHistory} />
              )}
              {activeCalculator === 'resistor-color' && (
                <ResistorColorCodeCalculator onSaveHistory={handleSaveHistory} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Footer */}
        <footer className="pt-10 pb-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">VoltCraft Electronics Suite</span>
            <span aria-hidden="true">·</span>
            <span>IEC 60063 Standard Compliant</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Calculated with IEEE-754 64-bit precision
          </div>
        </footer>
      </main>

      {/* Slide-over Calculation History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={historyItems}
        onClear={handleClearHistory}
      />

      {/* EIA E-Series Standard Components Modal */}
      <ESeriesLookupModal
        isOpen={eSeriesOpen}
        onClose={() => setESeriesOpen(false)}
      />
    </div>
  );
}
