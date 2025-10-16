
import React, { useState, useCallback } from 'react';
import { Timeframe, RawDataRow, ProcessedDataRow } from './types';
import { processData } from './services/signalProcessor';
import FileUpload from './components/FileUpload';
import TimeframeSelector from './components/TimeframeSelector';
import SummaryCard from './components/SummaryCard';
import ResultsTable from './components/ResultsTable';
import SignalChart from './components/SignalChart';

// PapaParse is a reliable CSV parser, but for this self-contained app, a simple one is fine.
const parseCSV = (csvText: string): RawDataRow[] => {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredCols = ['time', 'open', 'high', 'low', 'close', 'volume'];
    if (!requiredCols.every(col => header.includes(col))) {
        throw new Error(`CSV must contain headers: ${requiredCols.join(', ')}`);
    }

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = header.reduce((obj, col, index) => {
            const val = values[index] ? values[index].trim() : '';
            if (val) {
                // Keep time as string for flexible parsing later
                obj[col] = (col === 'time') ? val : parseFloat(val);
            }
            return obj;
        }, {} as any);
        return row as RawDataRow;
    });
};

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [timeframe, setTimeframe] = useState<Timeframe>('m5');
  const [processedData, setProcessedData] = useState<ProcessedDataRow[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setProcessedData(null);
    setError(null);
  };

  const handleProcess = useCallback(() => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setProcessedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rawData = parseCSV(text);
        const results = processData(rawData, timeframe);
        setProcessedData(results);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred during processing.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
        setIsLoading(false);
    }
    reader.readAsText(selectedFile);
  }, [selectedFile, timeframe]);

  const downloadCSV = () => {
    if (!processedData) return;
    const header = Object.keys(processedData[0]).join(',');
    const rows = processedData.map(row => 
        Object.values(row).map(value => 
            value instanceof Date ? value.toISOString() : value
        ).join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'out_signals.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Institutional Signal Analyzer
          </h1>
          <p className="mt-2 text-lg text-gray-400">Upload financial data to identify market signals</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-lg border border-gray-700 h-fit sticky top-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Controls</h2>
            <div className="space-y-6">
              <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />
              {fileName && <p className="text-sm text-center text-gray-400">Selected: <span className="font-medium text-indigo-400">{fileName}</span></p>}
              <TimeframeSelector selectedTimeframe={timeframe} onTimeframeChange={setTimeframe} disabled={isLoading} />
              <button
                onClick={handleProcess}
                disabled={!selectedFile || isLoading}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition duration-150 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Analyze Data"
                )}
              </button>
            </div>
          </div>

          <main className="lg:col-span-2">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {!processedData && !isLoading && !error && (
              <div className="text-center p-12 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
                <h3 className="text-xl font-medium text-gray-300">Awaiting Data</h3>
                <p className="mt-2 text-gray-500">Please select a CSV file and click "Analyze Data" to see the results.</p>
              </div>
            )}

            {processedData && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-200">Analysis Results</h2>
                    <button onClick={downloadCSV} className="bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition">
                        Download CSV
                    </button>
                </div>
                <SummaryCard latestData={processedData[processedData.length - 1]} />
                <SignalChart data={processedData} />
                <ResultsTable data={processedData} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
