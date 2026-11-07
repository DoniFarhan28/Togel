import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Info, Award, ArrowUp, ArrowDown } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import { calculateFrequency, filterDrawsByLimit } from '../utils/calculations';

interface FrequencyAnalysisProps {
  allDraws: DrawRecord[];
}

const PERIOD_OPTIONS: Array<{ label: string; value: number | 'all' }> = [
  { label: '7 Putaran', value: 7 },
  { label: '14 Putaran', value: 14 },
  { label: '30 Putaran', value: 30 },
  { label: '90 Putaran', value: 90 },
  { label: '120 Putaran', value: 120 },
  { label: '250 Putaran', value: 250 },
  { label: 'Seluruh Data', value: 'all' },
];

const COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'
];

export const FrequencyAnalysis: React.FC<FrequencyAnalysisProps> = ({ allDraws }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number | 'all'>(30);
  const activeDraws = filterDrawsByLimit(allDraws, selectedPeriod);
  const freqStats = calculateFrequency(activeDraws);

  const totalDigitObservations = activeDraws.length * 4;
  const sortedByRank = [...freqStats].sort((a, b) => a.rank - b.rank);

  // Chart data
  const chartData = freqStats.map((s, idx) => ({
    digitLabel: `Digit ${s.digit}`,
    digit: s.digit,
    count: s.count,
    percentage: s.percentage,
    predictedPct: Number(((s.count + 1) / (totalDigitObservations + 10) * 100).toFixed(2)),
    zScore: s.zScore,
    color: COLORS[idx]
  }));

  return (
    <div className="space-y-6">
      {/* Header & Formula Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Modul Analisis Frekuensi &amp; Prediksi Digit 0 Sampai 9
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Perhitungan empiris kemunculan seluruh digit berdasarkan rumus matematis:{' '}
            <code className="text-blue-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              F(d) = Kemunculan(d) / Total Pengamatan
            </code>
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Periode:</span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setSelectedPeriod(opt.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedPeriod === opt.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frequency & Percentage BarChart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Grafik Distribusi Frekuensi vs Prediksi Terbobot</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Sampel: {activeDraws.length} Putaran ({totalDigitObservations} digit)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Bilah batang menunjukkan frekuensi kemunculan aktual; garis putus-putus menunjukkan persentase probabilitas Laplace-smoothed.
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="digitLabel" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
                    `${val} kali (${item.payload.percentage}% aktual, ~${item.payload.predictedPct}% prediksi)`,
                    'Frekuensi'
                  ]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Rank Spotlight Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Peringkat Digit (Rank #1 - #10)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Urutan Frekuensi
              </span>
            </div>
            <div className="space-y-2">
              {sortedByRank.map((s) => {
                const isTop = s.rank <= 3;
                const isBottom = s.rank >= 8;
                return (
                  <div
                    key={s.digit}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                      isTop
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : isBottom
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-center font-mono font-bold text-slate-400 text-[11px]">
                        #{s.rank}
                      </span>
                      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-sm text-white shadow-xs">
                        {s.digit}
                      </span>
                      <div className="text-[11px]">
                        <span className="font-bold">{s.count} kali</span>
                        <span className="text-slate-400 block text-[10px]">{s.percentage}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.isHot
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : s.isCold
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.isHot ? 'HOT' : s.isCold ? 'COLD' : 'NETRAL'}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                        Z: {s.zScore > 0 ? `+${s.zScore}` : s.zScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Frequency Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Tabel Analisis Lengkap Frekuensi, Persentase Prediksi, &amp; Z-Score
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Rata-rata ekspektasi per digit: {(totalDigitObservations * 0.1).toFixed(1)} kemunculan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Digit</th>
                <th className="py-3 px-4 text-center">Jumlah Kemunculan</th>
                <th className="py-3 px-4 text-center">Persentase Frekuensi F(d)</th>
                <th className="py-3 px-4 text-center text-blue-400">Persentase Prediksi (P*)</th>
                <th className="py-3 px-4 text-center">Deviasi Relatif</th>
                <th className="py-3 px-4 text-center">Nilai Z-Score</th>
                <th className="py-3 px-4 text-right">Klasifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedByRank.map((item) => {
                const expCount = totalDigitObservations * 0.1;
                const devDiff = item.count - expCount;
                const predPct = Number(((item.count + 1) / (totalDigitObservations + 10) * 100).toFixed(2));

                return (
                  <tr key={item.digit} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{item.rank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-black text-sm flex items-center justify-center">
                          {item.digit}
                        </span>
                        <span className="font-semibold text-slate-200">Digit {item.digit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white text-sm">
                      {item.count}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-400 font-semibold">
                      {item.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-blue-400 font-semibold">
                      {predPct}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`inline-flex items-center gap-0.5 ${devDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {devDiff >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {devDiff > 0 ? `+${devDiff.toFixed(1)}` : devDiff.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`font-semibold ${item.zScore >= 1 ? 'text-amber-400' : item.zScore <= -1 ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {item.zScore > 0 ? `+${item.zScore}` : item.zScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          item.isHot
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.isCold
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.isHot ? '🔥 Panas (Hot)' : item.isCold ? '❄️ Dingin (Cold)' : 'Netral'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
