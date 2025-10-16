
import { RawDataRow, ProcessedDataRow, Timeframe } from '../types';

const SESS_MAP = {
  asia: 0.2,    // 00:00–07:59 UTC
  london: 0.6,  // 08:00–12:59 UTC
  newyork: 1.0, // 13:00–21:59 UTC
  off: 0.2      // 22:00–23:59 UTC treated as Asia
};

const rollingOperation = (data: number[], window: number, op: (slice: number[]) => number, minPeriods: number): (number | null)[] => {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < minPeriods - 1) {
      result.push(null);
    } else {
      const start = Math.max(0, i - window + 1);
      const slice = data.slice(start, i + 1);
      if (slice.length < minPeriods) {
        result.push(null)
      } else {
        result.push(op(slice));
      }
    }
  }
  return result;
};

const sma = (data: number[], window: number, minPeriods: number) => {
    return rollingOperation(data, window, slice => slice.reduce((a, b) => a + b, 0) / slice.length, minPeriods);
}

const rollingMax = (data: number[], window: number, minPeriods: number) => {
    return rollingOperation(data, window, slice => Math.max(...slice), minPeriods);
}

const rollingMin = (data: number[], window: number, minPeriods: number) => {
    return rollingOperation(data, window, slice => Math.min(...slice), minPeriods);
}

const inferSessionIndex = (ts: Date): number => {
  const hour = ts.getUTCHours();
  if (hour >= 0 && hour <= 7) return SESS_MAP.asia;
  if (hour >= 8 && hour <= 12) return SESS_MAP.london;
  if (hour >= 13 && hour <= 21) return SESS_MAP.newyork;
  return SESS_MAP.off; // 22-23
};

const computeLiquidityTrap = (data: ProcessedDataRow[], swingLookback: number): number[] => {
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  const priorHighs = [null, ...rollingMax(highs.slice(0, -1), swingLookback, 1)];
  const priorLows = [null, ...rollingMin(lows.slice(0, -1), swingLookback, 1)];
  
  return data.map((d, i) => {
    const pHigh = priorHighs[i];
    const pLow = priorLows[i];
    if (pHigh === null || pLow === null) return 0;
    
    const rng = d.high - d.low;
    if (rng === 0) return 0;

    const upperWick = (d.high - Math.max(d.open, d.close)) / rng;
    const lowerWick = (Math.min(d.open, d.close) - d.low) / rng;
    
    const sweepHigh = d.high > pHigh && upperWick >= 0.6;
    const sweepLow = d.low < pLow && lowerWick >= 0.6;
    
    if (sweepHigh) return 1.0;
    if (sweepLow) return -1.0;
    return 0.0;
  });
};

const normalizeToUnit = (val: number, lo: number = -1.5, hi: number = 1.5): number => {
  const clipped = Math.max(lo, Math.min(hi, val));
  return -1 + 2 * (clipped - lo) / (hi - lo);
};

const classify = (v: number): 'BUY' | 'SELL' | 'NEUTRAL' => {
  if (v >= 0.70) return 'BUY';
  if (v <= -0.70) return 'SELL';
  return 'NEUTRAL';
};

export const processData = (rawData: RawDataRow[], tf: Timeframe): ProcessedDataRow[] => {
  if (!rawData || rawData.length === 0) {
    throw new Error("No data to process.");
  }
  
  // Clean and parse time
  const data: Partial<ProcessedDataRow>[] = rawData.map(r => {
      let time;
      if (typeof r.time === 'number') {
        time = new Date(r.time * 1000);
      } else {
        time = new Date(r.time);
      }
      if (isNaN(time.getTime())) {
        throw new Error(`Invalid time format found: ${r.time}`);
      }
      return { ...r, time };
  }).sort((a, b) => a.time!.getTime() - b.time!.getTime());

  // Basic features
  const trueRange = data.map(d => d.high! - d.low!);
  const dir = data.map(d => Math.sign(d.close! - d.open!));

  const volSma = sma(data.map(d => d.volume!), 20, 5);
  const trSma = sma(trueRange, 20, 5);

  data.forEach((d, i) => {
    d.dV = (volSma[i] && volSma[i]! > 0) ? (d.volume! / volSma[i]!) : 0;
    d.dP = (trSma[i] && trSma[i]! > 0) ? (trueRange[i] / trSma[i]! * dir[i]) : 0;
    d.session_index = inferSessionIndex(d.time!);
  });

  // DXY delta
  if (data[0] && 'dxy' in rawData[0]) {
    const dxyValues = data.map(d => (d as any).dxy || null);
    data.forEach((d, i) => {
        if (i >= 12 && dxyValues[i] !== null && dxyValues[i-12] !== null) {
            d.dxy_delta = dxyValues[i] - dxyValues[i-12];
        } else {
            d.dxy_delta = 0.0;
        }
    });
  } else {
      data.forEach(d => { d.dxy_delta = 0.0; });
  }

  // Liquidity Trap
  const swingMap = { 'm1': 24, 'm5': 12, 'm15': 8, 'm30': 6, 'h1': 4 };
  const swingLb = swingMap[tf];
  const liqTraps = computeLiquidityTrap(data as ProcessedDataRow[], swingLb);
  data.forEach((d, i) => { d.liq_trap = liqTraps[i]});
  
  // Final signal and classification
  data.forEach(d => {
    const rawSignal = (0.4 * d.dV!) + 
                      (0.3 * d.dP!) + 
                      (0.2 * d.session_index!) - 
                      (0.1 * d.liq_trap!) - 
                      (0.05 * d.dxy_delta!);

    d.institution_signal = normalizeToUnit(rawSignal);
    d.signal_class = classify(d.institution_signal);
  });
  
  return data as ProcessedDataRow[];
};
