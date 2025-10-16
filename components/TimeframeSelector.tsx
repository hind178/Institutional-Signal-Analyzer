
import React from 'react';
import { Timeframe } from '../types';

interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  disabled: boolean;
}

const timeframes: Timeframe[] = ['m1', 'm5', 'm15', 'm30', 'h1'];

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ selectedTimeframe, onTimeframeChange, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">Timeframe</label>
      <div className="flex space-x-2">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedTimeframe === tf
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeframeSelector;
