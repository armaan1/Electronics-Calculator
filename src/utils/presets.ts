/**
 * Circuit design presets for rapid testing and real-world engineering scenarios
 */

import { CalculatorId } from '../types/electronics';

export interface CircuitPreset {
  id: string;
  name: string;
  category: CalculatorId;
  description: string;
  badge: string;
  values: Record<string, number>;
}

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'ohms-5v-100ma',
    name: '5V Microcontroller Rail (100mA)',
    category: 'ohms-law',
    description: 'Calculate equivalent load impedance and dissipation on standard 5V logic bus.',
    badge: 'Digital Logic',
    values: { voltage: 5, current: 0.1 },
  },
  {
    id: 'ohms-12v-motor',
    name: '12V DC Motor (2.5A)',
    category: 'ohms-law',
    description: 'High current automotive DC motor power consumption & winding resistance.',
    badge: 'Power Electronics',
    values: { voltage: 12, current: 2.5 },
  },
  {
    id: 'div-5v-to-3v3',
    name: '5V to 3.3V Logic Divider',
    category: 'voltage-divider',
    description: 'Translate 5V Arduino UART signals to 3.3V ESP32/Raspberry Pi input GPIO safely.',
    badge: 'Level Shifting',
    values: { vin: 5, r1: 1700, r2: 3300, rload: 1000000 },
  },
  {
    id: 'div-12v-car-sense',
    name: '12V-14.4V Battery Voltage Monitor',
    category: 'voltage-divider',
    description: 'Step down vehicle alternator voltage to 0-3.3V ADC microcontroller range.',
    badge: 'Automotive Sensing',
    values: { vin: 14.4, r1: 39000, r2: 10000, rload: 500000 },
  },
  {
    id: 'rc-audio-1khz',
    name: '1kHz Audio Anti-Aliasing Filter',
    category: 'capacitor-rc',
    description: 'Clean up speech band noise with a 1kHz cutoff passive RC low-pass filter.',
    badge: 'Audio DSP',
    values: { r: 1590, c: 1e-7, vin: 3.3 }, // 1.59k, 100nF -> 1kHz
  },
  {
    id: 'rc-debounce-10ms',
    name: '10ms Tactile Switch Debounce',
    category: 'capacitor-rc',
    description: 'Hardware switch contact bounce suppression time constant for clean button presses.',
    badge: 'Input Hardware',
    values: { r: 10000, c: 1e-6, vin: 5 }, // 10k, 1uF -> 10ms
  },
  {
    id: 'lc-fm-100mhz',
    name: '100 MHz VHF FM Tank Oscillator',
    category: 'resonant-lc',
    description: 'Resonant tank circuit for FM broadcast band frequency generation.',
    badge: 'RF Engineering',
    values: { l: 2.533e-7, c: 1e-11, r: 1 }, // 253.3nH, 10pF -> 100MHz
  },
  {
    id: 'lc-smps-100khz',
    name: '100 kHz Buck Converter Filter',
    category: 'resonant-lc',
    description: 'Output ripple attenuation LC stage for switched-mode DC-DC supply.',
    badge: 'Power Supply',
    values: { l: 2.2e-5, c: 1e-4, r: 0.05 }, // 22uH, 100uF
  },
  {
    id: '555-1khz-astable',
    name: '1 kHz Tone Generator (Astable)',
    category: 'timer-555',
    description: 'Standard 555 astable oscillator producing a 1kHz square audio clock.',
    badge: 'Timing IC',
    values: { r1: 1000, r2: 6800, c: 1e-7 },
  },
  {
    id: '555-1s-monostable',
    name: '1 Second Single-Shot Pulse',
    category: 'timer-555',
    description: 'Monostable pulse stretcher for relays and power-on reset sequencing.',
    badge: 'Industrial Timing',
    values: { r1: 91000, c: 1e-5 }, // 91k, 10uF -> ~1.001s
  },
  {
    id: 'led-red-5v',
    name: 'Standard Red LED on 5V (20mA)',
    category: 'led-resistor',
    description: 'Calculate current limiting resistor for 1.8V forward drop red indicator on 5V.',
    badge: 'Optoelectronics',
    values: { vs: 5, vf: 1.8, iforward: 0.02 },
  },
  {
    id: 'led-blue-12v',
    name: 'High-Bright Blue LED on 12V',
    category: 'led-resistor',
    description: '3.2V forward drop blue/white LED driven from 12V rail at 15mA.',
    badge: 'Automotive / Panel',
    values: { vs: 12, vf: 3.2, iforward: 0.015 },
  },
  {
    id: 'opamp-inv-10x',
    name: '10x Inverting Amplifier (-20dB)',
    category: 'op-amp',
    description: 'Classic inverting op-amp stage with 10k input and 100k feedback resistor.',
    badge: 'Analog Signal',
    values: { rin: 10000, rf: 100000, vin: 0.5 },
  },
  {
    id: 'opamp-noninv-2x',
    name: '2x Non-Inverting Buffer Stage',
    category: 'op-amp',
    description: 'High impedance sensor amplifier with 10k input and 10k feedback (Gain = +2).',
    badge: 'Instrumentation',
    values: { rin: 10000, rf: 10000, vin: 1.0 },
  },
];
