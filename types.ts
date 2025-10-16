
export type Timeframe = 'm1' | 'm5' | 'm15' | 'm30' | 'h1';

export interface RawDataRow {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dxy?: number;
}

export interface ProcessedDataRow {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dxy_delta: number;
  dV: number;
  dP: number;
  session_index: number;
  liq_trap: number;
  institution_signal: number;
  signal_class: 'BUY' | 'SELL' | 'NEUTRAL';
}

export type SignalClass = 'BUY' | 'SELL' | 'NEUTRAL';
