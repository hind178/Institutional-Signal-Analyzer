
import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ProcessedDataRow } from '../types';

interface SignalChartProps {
  data: ProcessedDataRow[];
}

const SignalChart: React.FC<SignalChartProps> = ({ data }) => {
  const formattedData = data.map(d => ({
    ...d,
    time: d.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  const signalColor = (value: number) => {
    if (value >= 0.7) return '#4ade80'; // green-400
    if (value <= -0.7) return '#f87171'; // red-400
    return '#9ca3af'; // gray-400
  };

  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 mt-6" style={{ height: '600px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" domain={[-1.5, 1.5]} tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568', borderRadius: '0.5rem' }} 
            labelStyle={{ color: '#d1d5db' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}/>
          <Line yAxisId="left" type="monotone" dataKey="close" stroke="#38bdf8" strokeWidth={2} dot={false} name="Close Price" />
          
          <Bar yAxisId="right" dataKey="institution_signal" name="Signal" barSize={20}>
            {formattedData.map((entry, index) => (
              <rect key={`cell-${index}`} fill={signalColor(entry.institution_signal)} x={0} y={0} width={0} height={0}/>
            ))}
          </Bar>

          <ReferenceLine yAxisId="right" y={0.7} label={{ value: 'BUY', position: 'insideTopRight', fill: '#4ade80' }} stroke="#4ade80" strokeDasharray="3 3" />
          <ReferenceLine yAxisId="right" y={-0.7} label={{ value: 'SELL', position: 'insideTopRight', fill: '#f87171' }} stroke="#f87171" strokeDasharray="3 3" />
          <ReferenceLine yAxisId="right" y={0} stroke="#6b7280" strokeDasharray="2 2" />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SignalChart;
