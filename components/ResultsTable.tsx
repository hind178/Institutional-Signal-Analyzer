
import React from 'react';
import { ProcessedDataRow, SignalClass } from '../types';

interface ResultsTableProps {
  data: ProcessedDataRow[];
}

const signalColorMap: Record<SignalClass, string> = {
  BUY: 'text-green-400',
  SELL: 'text-red-400',
  NEUTRAL: 'text-gray-500',
};

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  return (
    <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden">
      <div className="overflow-x-auto max-h-[500px]">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-300">Time (UTC)</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Signal</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Class</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Open</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">High</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Low</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Close</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            {data.slice().reverse().map((row, index) => (
              <tr key={index} className="hover:bg-gray-800/70">
                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-400">{row.time.toISOString().replace('T', ' ').substring(0, 19)}</td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm font-bold ${signalColorMap[row.signal_class]}`}>{row.institution_signal.toFixed(3)}</td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${signalColorMap[row.signal_class]}`}>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.signal_class === 'BUY' ? 'bg-green-900 text-green-300' : row.signal_class === 'SELL' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300'}`}>
                        {row.signal_class}
                    </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{row.open.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{row.high.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{row.low.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{row.close.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{row.volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
