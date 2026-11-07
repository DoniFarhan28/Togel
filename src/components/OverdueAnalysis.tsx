import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { Clock, AlertTriangle, CheckCircle, Flame, ShieldAlert } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import { calculateOverdue, filterDrawsByLimit } from '../utils/calculations';

interface OverdueAnalysisProps {
  allDraws: DrawRecord[];
}

export const OverdueAnalysis: React.FC<OverdueAnalysisProps> = ({ allDraws }) => {
  const [periodLimit, setPeriodLimit] = useState<number | 'all'>('all');
  const activeDraws = filterDrawsByLimit(allDraws, periodLimit);
  const overdueStats = calculateOverdue(activeDraws);

  // Classify recent vs overdue
  const recentAppeared = overdueStats.filter(s => s.currentGap <= 1);
  const normalOverdue = overdueStats.filter(s => s.currentGap > 1 && s.currentGap <= 4);
  const highOverdue = overdueStats.filter(s => s.currentGap > 4);

  // Prepare chart data comparing current gap vs historical average gap
  const chartData = overdueStats.map(s => ({
    digitLabel: `Digit ${s.digit}`,
    digit: s.digit,
    currentGap: s.currentGap,
    avgGap: s.avgGap,
    maxGap: s.maxGap,
    appearances: s.appearanceCount
  }));

  return (
    <div className="space-y-6">
      {/* Header & Formula Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              Modul Analisis Digit Overdue &amp; Gap Kemunculan
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Menghitung interval jeda putaran sejak digit terakhir ditarik:{' '}
            <code className="text-rose-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              G(d) = T - T_terakhir(d)
            </code>
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Rentang:</span>
          {[30, 90, 150, 'all'].map((val) => (
            <button
              key={String(val)}
              onClick={() => setPeriodLimit(val as number | 'all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                periodLimit === val
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {val === 'all' ? 'Seluruh Data' : `${val}P`}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Quick Summary Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category 1: Baru Muncul (Gap 0-1) */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Baru Saja Muncul (Gap 0 - 1)</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {recentAppeared.length} Digit
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Digit yang baru keluar pada putaran terakhir atau satu putaran sebelumnya.
          </p>
          <div className="flex flex-wrap gap-2">
            {recentAppeared.map(s => (
              <div
                key={s.digit}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-sm flex items-center gap-2"
              >
                <span>Digit {s.digit}</span>
                <span className="text-[10px] text-slate-400 font-normal">({s.currentGap}P lalu)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category 2: Jeda Normal (Gap 2-4) */}
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Jeda Normal (Gap 2 - 4)</span>
            </span>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              {normalOverdue.length} Digit
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Masih dalam rentang batas ekspektasi siklus normal pengundian.
          </p>
          <div className="flex flex-wrap gap-2">
            {normalOverdue.map(s => (
              <div
                key={s.digit}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono font-bold text-sm flex items-center gap-2"
              >
                <span>Digit {s.digit}</span>
                <span className="text-[10px] text-slate-400 font-normal">({s.currentGap}P)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category 3: Sangat Terlambat (Overdue Tinggi) */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Overdue Tinggi (Gap &gt; 4)</span>
            </span>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
              {highOverdue.length} Digit
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Digit yang paling lama absen dan belum keluar dalam beberapa putaran terakhir.
          </p>
          <div className="flex flex-wrap gap-2">
            {highOverdue.length === 0 ? (
              <span className="text-xs text-slate-500">Semua digit baru saja ditarik.</span>
            ) : (
              highOverdue.map(s => (
                <div
                  key={s.digit}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono font-bold text-sm flex items-center gap-2"
                >
                  <span>Digit {s.digit}</span>
                  <span className="text-[10px] font-bold text-rose-400">({s.currentGap} Putaran)</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interval Chart: Current Gap vs Historical Average Gap */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <span>Grafik Interval Jarak Kemunculan (Current Gap vs Average Gap)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Bandingkan gap saat ini (merah/oranye) dengan rata-rata historis (biru) dan batas maksimum jeda yang pernah tercatat.
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
                formatter={(val: any, name: any) => [
                  `${val} Putaran`,
                  name === 'currentGap'
                    ? 'Jeda Saat Ini (G(d))'
                    : name === 'avgGap'
                    ? 'Rata-Rata Gap Historis'
                    : 'Max Gap Tercatat'
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(val) => (
                  <span className="text-slate-300">
                    {val === 'currentGap'
                      ? 'Jeda Saat Ini (Current Gap)'
                      : val === 'avgGap'
                      ? 'Rata-Rata Jeda Historis'
                      : 'Maksimum Jeda Historis'}
                  </span>
                )}
              />
              <Bar dataKey="currentGap" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgGap" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maxGap" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Overdue Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Tabel Analisis Jarak &amp; Interval Terakhir Kemunculan Setiap Digit (0-9)
          </h3>
          <span className="text-xs text-slate-400">
            Diurutkan berdasarkan gap terlama (Overdue tertinggi)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Digit</th>
                <th className="py-3 px-4 text-center">Jarak Saat Ini G(d)</th>
                <th className="py-3 px-4 text-center">Rata-rata Gap Historis</th>
                <th className="py-3 px-4 text-center">Max Gap Historis</th>
                <th className="py-3 px-4 text-center">Total Kemunculan</th>
                <th className="py-3 px-4">Terakhir Terlihat (Tanggal)</th>
                <th className="py-3 px-4">Terakhir Terlihat (Periode)</th>
                <th className="py-3 px-4 text-right">Status Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {overdueStats.map((item) => (
                <tr key={item.digit} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-black text-sm flex items-center justify-center">
                        {item.digit}
                      </span>
                      <span className="font-semibold text-slate-200">Digit {item.digit}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                      item.currentGap >= 6
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.currentGap >= 3
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.currentGap} Putaran
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300 font-semibold">
                    {item.avgGap} Putaran
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {item.maxGap} Putaran
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-white font-semibold">
                    {item.appearanceCount}x
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {item.lastDrawDate || 'Tidak ada data'}
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-400">
                    {item.lastPeriod ? `P-${item.lastPeriod}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        item.currentGap >= 6
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.currentGap >= 3
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.currentGap >= 6
                        ? '⚠️ Overdue Tinggi'
                        : item.currentGap >= 3
                        ? '⏱️ Waspada'
                        : '✅ Baru Muncul'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
