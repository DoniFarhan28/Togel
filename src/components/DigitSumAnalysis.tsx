import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Calculator, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import { calculateDigitSum, filterDrawsByLimit } from '../utils/calculations';

interface DigitSumAnalysisProps {
  allDraws: DrawRecord[];
}

export const DigitSumAnalysis: React.FC<DigitSumAnalysisProps> = ({ allDraws }) => {
  const [periodLimit, setPeriodLimit] = useState<number | 'all'>('all');
  const activeDraws = filterDrawsByLimit(allDraws, periodLimit);
  const sumData = calculateDigitSum(activeDraws);

  // Distribution chart data 0-36
  const chartData = Array.from({ length: 37 }).map((_, sumVal) => {
    const count = sumData.sumCounts[sumVal] || 0;
    const pct = activeDraws.length > 0 ? Number(((count / activeDraws.length) * 100).toFixed(1)) : 0;
    return {
      sumLabel: `${sumVal}`,
      sum: sumVal,
      count,
      pct
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Modul Analisis Digit Sum (Total Jumlah Digit 0 - 36)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Kalkulasi jumlahan $d_1 + d_2 + d_3 + d_4$ mengikuti kurva lonceng Gaussian (teoritis berpusat pada nilai 18).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Rentang:</span>
          {[30, 90, 150, 'all'].map((val) => (
            <button
              key={String(val)}
              onClick={() => setPeriodLimit(val as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                periodLimit === val
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {val === 'all' ? 'Semua' : `${val}P`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Jumlah Paling Sering</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            Sum {sumData.mostFrequentSum.sum}
          </div>
          <span className="text-[10px] text-slate-500">
            Keluar {sumData.mostFrequentSum.count} kali
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Jumlah Paling Jarang</span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">
            Sum {sumData.leastFrequentSum.sum}
          </div>
          <span className="text-[10px] text-slate-500">
            Keluar {sumData.leastFrequentSum.count} kali (&gt;0)
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Rata-Rata Empiris</span>
          <div className="text-2xl font-black font-mono text-blue-400 mt-1">
            {sumData.averageSum}
          </div>
          <span className="text-[10px] text-slate-500">
            Ekspektasi teoritis: 18.0
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Jumlah Belum Pernah</span>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            {sumData.neverDrawnSums.length}
          </div>
          <span className="text-[10px] text-slate-500">
            Dari 37 kemungkinan (0-36)
          </span>
        </div>
      </div>

      {/* Bell Curve Histogram BarChart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Grafik Distribusi Frekuensi Jumlah Digit (0 s/d 36)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Visualisasi histogram jumlahan digit dalam rentang {activeDraws.length} pengundian
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="sumLabel" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={1} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: any, item: any) => [
                  `${val} kali (${item.payload.pct}%)`,
                  `Total Digit = ${item.payload.sum}`
                ]}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Never Drawn Sums Banner */}
      {sumData.neverDrawnSums.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-bold text-slate-300 block mb-2">
            Nilai Jumlah Digit yang Belum Pernah Muncul ({sumData.neverDrawnSums.length} nilai):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sumData.neverDrawnSums.map(s => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs"
              >
                Sum {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
