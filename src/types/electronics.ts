/**
 * Electronics calculator types and interfaces
 */

export type CalculatorId = 
  | 'ohms-law'
  | 'voltage-divider'
  | 'capacitor-rc'
  | 'resonant-lc'
  | 'timer-555'
  | 'led-resistor'
  | 'op-amp'
  | 'resistor-color';

export type UnitPrefix = 
  | 'p' // pico (1e-12)
  | 'n' // nano (1e-9)
  | 'u' // micro (1e-6)
  | 'm' // milli (1e-3)
  | ''  // base (1)
  | 'k' // kilo (1e3)
  | 'M' // mega (1e6)
  | 'G' // giga (1e9);

export interface UnitOption {
  symbol: string;
  factor: number;
  label: string;
}

export interface UnitCategory {
  resistance: UnitOption[];
  voltage: UnitOption[];
  current: UnitOption[];
  power: UnitOption[];
  capacitance: UnitOption[];
  inductance: UnitOption[];
  frequency: UnitOption[];
  time: UnitOption[];
}

export interface CalculationHistoryItem {
  id: string;
  calculatorId: CalculatorId;
  title: string;
  timestamp: number;
  summary: string;
  details: { label: string; value: string }[];
}

export type ESeriesType = 'E12' | 'E24' | 'E96';

export interface ResistorColorBand {
  color: string;
  name: string;
  digit?: number;
  multiplier?: number;
  tolerance?: number;
  tempCo?: number;
  bgClass: string;
  textClass: string;
}

export interface StepMathItem {
  step: string;
  formula: string;
  substitution: string;
  result: string;
}

export type ThemeMode = 'dark' | 'dim' | 'light';
