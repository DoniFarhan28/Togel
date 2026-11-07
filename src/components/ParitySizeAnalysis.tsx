import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Split, PieChart as PieIcon, Activity } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import { calculateParityAndSize, filterDrawsByLimit } from '../utils/calculations';

interface ParitySizeAnalysisProps {
  allDraws: DrawRecord[];
}

const PARITY_COLORS = ['#10b981', '#34d399', '#3b82f6', '#60a5fa', '#93c5fd'];
const SIZE_COLORS = ['#f59e0b', '#fbbf24', '#8b5cf6', '#a78bfa', '#c4b5fd'];

export const ParitySizeAnalysis: React.FC<ParitySizeAnalysisProps> = ({ allDraws }) => {
  const [periodLimit, setPeriodLimit] = useState<number | 'all'>('all');
  const activeDraws = filterDrawsByLimit(allDraws, periodLimit);
  const paritySize = calculateParityAndSize(activeDraws);

  const parityChartData = paritySize.parityDistribution.map((item, idx) => ({
    name: item.name,
    pattern: item.pattern,
    count: item.count,
    percentage: item.percentage,
    fill: PARITY_COLORS[idx]
  }));

  const sizeChartData = paritySize.sizeDistribution.map((item, idx) => ({
    name: item.name,
    pattern: item.pattern,
    count: item.count,
    percentage: item.percentage,
    fill: SIZE_COLORS[idx]
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Split className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Modul Analisis Ganjil/Genap &amp; Besar/Kecil
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Karakteristik kombinasi paritas (Ganjil: 1,3,5,7,9 / Genap: 0,2,4,6,8) dan skala besaran (Kecil: 0-4 / Besar: 5-9).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Rentang:</span>
          {[14, 30, 90, 150, 'all'].map((val) => (
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

      {/* High-level Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase">Total Digit Ganjil</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {paritySize.oddCount}
          </div>
          <span className="text-[10px] text-slate-400">
            {((paritySize.oddCount / (activeDraws.length * 4 || 1)) * 100).toFixed(1)}% dari seluruh digit
          </span>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/30 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-blue-400 uppercase">Total Digit Genap</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {paritySize.evenCount}
          </div>
          <span className="text-[10px] text-slate-400">
            {((paritySize.evenCount / (activeDraws.length * 4 || 1)) * 100).toFixed(1)}% dari seluruh digit
          </span>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-amber-400 uppercase">Total Digit Besar (5-9)</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {paritySize.bigCount}
          </div>
          <span className="text-[10px] text-slate-400">
            {((paritySize.bigCount / (activeDraws.length * 4 || 1)) * 100).toFixed(1)}% dari seluruh digit
          </span>
        </div>

        <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase">Total Digit Kecil (0-4)</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {paritySize.smallCount}
          </div>
          <span className="text-[10px] text-slate-400">
            {((paritySize.smallCount / (activeDraws.length * 4 || 1)) * 100).toFixed(1)}% dari seluruh digit
          </span>
        </div>
      </div>

      {/* Side-by-side Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parity Distribution Bar Chart & List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Distribusi Kombinasi Ganjil / Genap</span>
            </h3>
            <span className="text-xs text-slate-400">5 Pola Formasi 4D</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="pattern" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
                    `${val} kali (${item.payload.percentage}%)`,
                    item.payload.name
                  ]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {parityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {paritySize.parityDistribution.map((item) => (
              <div
                key={item.pattern}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-16 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-center">
                    {item.pattern}
                  </span>
                  <span className="font-semibold text-slate-200">{item.name}</span>
                </div>
                <div className="font-mono text-slate-300">
                  <strong className="text-white">{item.count}x</strong> ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Distribution Bar Chart & List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <span>Distribusi Kombinasi Besar / Kecil</span>
            </h3>
            <span className="text-xs text-slate-400">5 Pola Formasi 4D</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="pattern" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
                    `${val} kali (${item.payload.percentage}%)`,
                    item.payload.name
                  ]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sizeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {paritySize.sizeDistribution.map((item) => (
              <div
                key={item.pattern}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-16 font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-center">
                    {item.pattern}
                  </span>
                  <span className="font-semibold text-slate-200">{item.name}</span>
                </div>
                <div className="font-mono text-slate-300">
                  <strong className="text-white">{item.count}x</strong> ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
