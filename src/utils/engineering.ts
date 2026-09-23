/**
 * Engineering notation, unit conversions, and E-series standard resistor calculations
 */

import { ESeriesType, ResistorColorBand, UnitOption } from '../types/electronics';

export const UNIT_OPTIONS = {
  resistance: [
    { symbol: 'mΩ', factor: 1e-3, label: 'milliohm' },
    { symbol: 'Ω', factor: 1, label: 'ohm' },
    { symbol: 'kΩ', factor: 1e3, label: 'kilo-ohm' },
    { symbol: 'MΩ', factor: 1e6, label: 'mega-ohm' },
  ],
  voltage: [
    { symbol: 'µV', factor: 1e-6, label: 'microvolt' },
    { symbol: 'mV', factor: 1e-3, label: 'millivolt' },
    { symbol: 'V', factor: 1, label: 'volt' },
    { symbol: 'kV', factor: 1e3, label: 'kilovolt' },
  ],
  current: [
    { symbol: 'nA', factor: 1e-9, label: 'nanoampere' },
    { symbol: 'µA', factor: 1e-6, label: 'microampere' },
    { symbol: 'mA', factor: 1e-3, label: 'milliampere' },
    { symbol: 'A', factor: 1, label: 'ampere' },
  ],
  power: [
    { symbol: 'µW', factor: 1e-6, label: 'microwatt' },
    { symbol: 'mW', factor: 1e-3, label: 'milliwatt' },
    { symbol: 'W', factor: 1, label: 'watt' },
    { symbol: 'kW', factor: 1e3, label: 'kilowatt' },
  ],
  capacitance: [
    { symbol: 'pF', factor: 1e-12, label: 'picofarad' },
    { symbol: 'nF', factor: 1e-9, label: 'nanofarad' },
    { symbol: 'µF', factor: 1e-6, label: 'microfarad' },
    { symbol: 'mF', factor: 1e-3, label: 'millifarad' },
    { symbol: 'F', factor: 1, label: 'farad' },
  ],
  inductance: [
    { symbol: 'pH', factor: 1e-12, label: 'picohenry' },
    { symbol: 'nH', factor: 1e-9, label: 'nanohenry' },
    { symbol: 'µH', factor: 1e-6, label: 'microhenry' },
    { symbol: 'mH', factor: 1e-3, label: 'millihenry' },
    { symbol: 'H', factor: 1, label: 'henry' },
  ],
  frequency: [
    { symbol: 'Hz', factor: 1, label: 'hertz' },
    { symbol: 'kHz', factor: 1e3, label: 'kilohertz' },
    { symbol: 'MHz', factor: 1e6, label: 'megahertz' },
    { symbol: 'GHz', factor: 1e9, label: 'gigahertz' },
  ],
  time: [
    { symbol: 'ps', factor: 1e-12, label: 'picosecond' },
    { symbol: 'ns', factor: 1e-9, label: 'nanosecond' },
    { symbol: 'µs', factor: 1e-6, label: 'microsecond' },
    { symbol: 'ms', factor: 1e-3, label: 'millisecond' },
    { symbol: 's', factor: 1, label: 'second' },
  ],
};

/**
 * Format raw SI number into human-readable engineering format
 */
export function formatEngineering(
  value: number,
  baseUnit: string,
  decimals = 3
): { formatted: string; value: string; unit: string; factor: number } {
  if (value === 0 || !isFinite(value) || isNaN(value)) {
    return { formatted: `0 ${baseUnit}`, value: '0', unit: baseUnit, factor: 1 };
  }

  const abs = Math.abs(value);
  const prefixes = [
    { prefix: 'p', factor: 1e-12 },
    { prefix: 'n', factor: 1e-9 },
    { prefix: 'µ', factor: 1e-6 },
    { prefix: 'm', factor: 1e-3 },
    { prefix: '', factor: 1 },
    { prefix: 'k', factor: 1e3 },
    { prefix: 'M', factor: 1e6 },
    { prefix: 'G', factor: 1e9 },
  ];

  // Pick suitable prefix
  let chosen = prefixes[4]; // default base
  for (let i = prefixes.length - 1; i >= 0; i--) {
    if (abs >= prefixes[i].factor * 0.999) {
      chosen = prefixes[i];
      break;
    }
  }

  const scaled = value / chosen.factor;
  // Format with dynamic precision: if scaled is whole, show fewer decimals
  let numStr = scaled.toFixed(decimals);
  // remove trailing zeroes after decimal
  if (numStr.includes('.')) {
    numStr = numStr.replace(/\.?0+$/, '');
  }

  const unitStr = `${chosen.prefix}${baseUnit}`;
  return {
    formatted: `${numStr} ${unitStr}`,
    value: numStr,
    unit: unitStr,
    factor: chosen.factor,
  };
}

/**
 * Standard E-series base multiplier tables
 */
export const E12_BASE = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

export const E24_BASE = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

export const E96_BASE = [
  1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30,
  1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69, 1.74,
  1.78, 1.82, 1.87, 1.91, 1.96, 2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32,
  2.37, 2.43, 2.49, 2.55, 2.61, 2.67, 2.74, 2.80, 2.87, 2.94, 3.01, 3.09,
  3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92, 4.02, 4.12,
  4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99, 5.11, 5.23, 5.36, 5.49,
  5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65, 6.81, 6.98, 7.15, 7.32,
  7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87, 9.09, 9.31, 9.53, 9.76,
];

/**
 * Find closest standard E-series resistor value
 */
export function findNearestESeries(
  targetOhms: number,
  series: ESeriesType = 'E24'
): { standardValue: number; errorPercent: number; formatted: string } {
  if (targetOhms <= 0 || !isFinite(targetOhms)) {
    return { standardValue: 0, errorPercent: 0, formatted: '0 Ω' };
  }

  const baseValues =
    series === 'E12' ? E12_BASE : series === 'E96' ? E96_BASE : E24_BASE;

  const decade = Math.floor(Math.log10(targetOhms));
  const normalized = targetOhms / Math.pow(10, decade);

  let closestBase = baseValues[0];
  let minDiff = Math.abs(normalized - closestBase);

  for (const val of baseValues) {
    const diff = Math.abs(normalized - val);
    if (diff < minDiff) {
      minDiff = diff;
      closestBase = val;
    }
  }

  // Also check wrapping to next decade or previous
  const nextDecadeVal = baseValues[0] * 10;
  if (Math.abs(normalized - nextDecadeVal) < minDiff) {
    closestBase = nextDecadeVal;
  }

  const standardValue = closestBase * Math.pow(10, decade);
  const errorPercent = ((standardValue - targetOhms) / targetOhms) * 100;
  const formatted = formatEngineering(standardValue, 'Ω').formatted;

  return { standardValue, errorPercent, formatted };
}

/**
 * Resistor color code tables
 */
export const COLOR_BANDS: ResistorColorBand[] = [
  { color: 'black', name: 'Black', digit: 0, multiplier: 1, tempCo: 250, bgClass: 'bg-zinc-900', textClass: 'text-zinc-100' },
  { color: 'brown', name: 'Brown', digit: 1, multiplier: 10, tolerance: 1, tempCo: 100, bgClass: 'bg-amber-800', textClass: 'text-amber-100' },
  { color: 'red', name: 'Red', digit: 2, multiplier: 100, tolerance: 2, tempCo: 50, bgClass: 'bg-red-600', textClass: 'text-white' },
  { color: 'orange', name: 'Orange', digit: 3, multiplier: 1000, tempCo: 15, bgClass: 'bg-amber-500', textClass: 'text-zinc-950' },
  { color: 'yellow', name: 'Yellow', digit: 4, multiplier: 10000, tempCo: 25, bgClass: 'bg-yellow-400', textClass: 'text-zinc-950' },
  { color: 'green', name: 'Green', digit: 5, multiplier: 100000, tolerance: 0.5, tempCo: 20, bgClass: 'bg-emerald-600', textClass: 'text-white' },
  { color: 'blue', name: 'Blue', digit: 6, multiplier: 1000000, tolerance: 0.25, tempCo: 10, bgClass: 'bg-blue-600', textClass: 'text-white' },
  { color: 'violet', name: 'Violet', digit: 7, multiplier: 10000000, tolerance: 0.1, tempCo: 5, bgClass: 'bg-purple-600', textClass: 'text-white' },
  { color: 'gray', name: 'Gray', digit: 8, multiplier: 100000000, tolerance: 0.05, tempCo: 1, bgClass: 'bg-zinc-500', textClass: 'text-white' },
  { color: 'white', name: 'White', digit: 9, multiplier: 1000000000, bgClass: 'bg-zinc-100', textClass: 'text-zinc-900' },
  { color: 'gold', name: 'Gold', multiplier: 0.1, tolerance: 5, bgClass: 'bg-amber-400', textClass: 'text-amber-950' },
  { color: 'silver', name: 'Silver', multiplier: 0.01, tolerance: 10, bgClass: 'bg-slate-300', textClass: 'text-slate-900' },
];

/**
 * Standard power ratings in Watts with safe margins
 */
export const STANDARD_RESISTOR_WATTAGES = [
  { rating: 0.125, label: '1/8 W (0.125W)' },
  { rating: 0.25, label: '1/4 W (0.25W)' },
  { rating: 0.5, label: '1/2 W (0.5W)' },
  { rating: 1.0, label: '1 W' },
  { rating: 2.0, label: '2 W' },
  { rating: 5.0, label: '5 W' },
  { rating: 10.0, label: '10 W' },
  { rating: 25.0, label: '25 W' },
];

export function recommendWattage(actualPowerW: number): {
  recommended: string;
  margin: number;
  isHighPower: boolean;
} {
  const safeTarget = actualPowerW * 1.6; // 60% derating safety margin
  for (const std of STANDARD_RESISTOR_WATTAGES) {
    if (std.rating >= safeTarget) {
      return {
        recommended: std.label,
        margin: Math.round(((std.rating - actualPowerW) / actualPowerW) * 100),
        isHighPower: std.rating >= 2.0,
      };
    }
  }
  return {
    recommended: '≥ 25 W (Chassis Mounted / Heatsink)',
    margin: 50,
    isHighPower: true,
  };
}
