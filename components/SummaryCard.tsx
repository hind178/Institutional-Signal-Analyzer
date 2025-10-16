
import React from 'react';
import { ProcessedDataRow, SignalClass } from '../types';

interface SummaryCardProps {
  latestData: ProcessedDataRow;
}

const signalColorMap: Record<SignalClass, string> = {
  BUY: 'text-green-400 border-green-400',
  SELL: 'text-red-400 border-red-400',
  NEUTRAL: 'text-gray-400 border-gray-400',
};

const signalBgColorMap: Record<SignalClass, string> = {
    BUY: 'bg-green-500/10',
    SELL: 'bg-red-500/10',
    NEUTRAL: 'bg-gray-500/10',
};

const SummaryCard: React.FC<SummaryCardProps> = ({ latestData }) => {
  const { time, institution_signal, signal_class, dV, dP, session_index, liq_trap, dxy_delta } = latestData;
  const colorClass = signalColorMap[signal_class];
  const bgColorClass = signalBgColorMap[signal_class];

  return (
    <div className={`p-6 rounded-lg border border-gray-700 bg-gray-800/50 shadow-lg ${bgColorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-300">Latest Signal</h2>
          <p className="text-sm text-gray-400">{time.toUTCString()}</p>
        </div>
        <div className={`px-4 py-1.5 text-lg font-bold rounded-full border-2 ${colorClass}`}>
          {signal_class}
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">Institutional Signal</p>
        <p className={`text-6xl font-bold tracking-tight ${colorClass}`}>
          {institution_signal.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Thresholds: ≥ +0.70 → BUY | ≤ -0.70 → SELL</p>
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <InfoItem label="ΔVolume" value={dV.toFixed(2)} />
        <InfoItem label="ΔPrice" value={dP.toFixed(2)} />
        <InfoItem label="Session" value={session_index.toFixed(2)} />
        <InfoItem label="Liq. Trap" value={liq_trap.toFixed(2)} />
        <InfoItem label="ΔDXY" value={dxy_delta.toFixed(3)} />
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-gray-200">{value}</p>
  </div>
);

export default SummaryCard;
