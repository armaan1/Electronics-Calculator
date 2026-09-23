import React from 'react';
import { CalculatorId, ThemeMode } from '../types/electronics';
import { Sun, Moon, Contrast, History, Layers } from 'lucide-react';

interface NavbarProps {
  activeCalculator: CalculatorId;
  onSelectCalculator: (id: CalculatorId) => void;
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenESeries: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCalculator,
  onSelectCalculator,
  themeMode,
  onChangeTheme,
  onOpenHistory,
  historyCount,
  onOpenESeries,
}) => {
  const navLinks: { id: CalculatorId; label: string }[] = [
    { id: 'ohms-law', label: "Ohm's Law" },
    { id: 'voltage-divider', label: 'Voltage Divider' },
    { id: 'capacitor-rc', label: 'RC Filters' },
    { id: 'resonant-lc', label: 'LC Tank' },
    { id: 'timer-555', label: '555 Timer' },
    { id: 'resistor-color', label: 'Color Code' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
        themeMode === 'light'
          ? 'border-slate-700/80 bg-[#172235]/90'
          : themeMode === 'dim'
          ? 'border-slate-800/80 bg-[#0b1326]/90'
          : 'border-slate-800 bg-slate-950/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectCalculator('ohms-law');
          }}
          className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="text-cyan-400">⚡</span>
          <span>VoltCraft</span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400 overflow-x-auto">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onSelectCalculator(link.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeCalculator === link.id
                  ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
                  : 'hover:text-slate-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenESeries}
            title="EIA Standard Component Values (E12/E24/E96)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
              themeMode === 'light'
                ? 'bg-[#1e2d45] hover:bg-[#253755] text-slate-200 border-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">E-Series</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            title="Calculation History"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap relative ${
              themeMode === 'light'
                ? 'bg-[#1e2d45] hover:bg-[#253755] text-slate-200 border-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-mono text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Selector: Dark (OLED) | Dim (A Little Dark) | Light (A Little Dark) */}
          <div
            className={`flex items-center p-0.5 rounded-lg border transition-colors ${
              themeMode === 'light'
                ? 'bg-[#1a273e] border-slate-700'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => onChangeTheme('dark')}
              title="Dark Theme: Deep Pitch Black (OLED)"
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                themeMode === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTheme('dim')}
              title="Dim Theme: 'A Little Dark' (Midnight Slate, gentle on eyes)"
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                themeMode === 'dim'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Dim (Little Dark)</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTheme('light')}
              title="Light Theme: Made a little dark (Low-glare twilight slate, no bright white)"
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                themeMode === 'light'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline text-[11px]">Light</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

