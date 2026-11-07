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
import { Activity, Sliders, Info, TrendingUp, Award } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import { calculateRecencyWeighting, calculateFrequency } from '../utils/calculations';

interface RecencyWeightingAnalysisProps {
  allDraws: DrawRecord[];
}

export const RecencyWeightingAnalysis: React.FC<RecencyWeightingAnalysisProps> = ({ allDraws }) => {
  const [halfLife, setHalfLife] = useState<number>(14);

  const recencyStats = calculateRecencyWeighting(allDraws, halfLife);
  const rawFreqStats = calculateFrequency(allDraws);

  // Combine for chart comparison
  const chartData = recencyStats.map(r => {
    const raw = rawFreqStats.find(f => f.digit === r.digit);
    return {
      digitLabel: `Digit ${r.digit}`,
      digit: r.digit,
      weightedPct: r.weightedPercentage,
      rawPct: raw ? raw.percentage : 0,
      weightedScore: r.weightedScore,
      rawCount: r.rawCount,
      rank: r.rank
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner & Formula */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">
                Modul Exponential Recency Weighting (Peluruhan Usia Hasil)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Membobotkan data pengundian lebih baru secara eksponensial dengan parameter paruh waktu (Half-Life).
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Half-Life (h):</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={3}
                max={45}
                step={1}
                value={halfLife}
                onChange={(e) => setHalfLife(Number(e.target.value))}
                className="w-28 accent-blue-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-xs text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                {halfLife} Putaran
              </span>
            </div>
          </div>
        </div>

        {/* Formula breakdown */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-400 font-medium">Rumus Matematis: </span>
            <code className="text-blue-300 font-mono font-bold">
              W(d) = Σ 2^(-i / h) × I(d_i = d)
            </code>
          </div>
          <div className="text-[11px] text-slate-400">
            Nilai pembobotan berkurang 50% setiap jarak {halfLife} periode ke masa lalu.
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Grafik Perbandingan: Frekuensi All-Time vs Skor Terbobot Kekinian (Recency)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Bandingkan persentase frekuensi konvensional (abu-abu/biru) dengan persentase weighted recency (hijau)
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
                  `${val}%`,
                  name === 'weightedPct' ? `Recency (h=${halfLife}P)` : 'Frekuensi Standar (All-Time)'
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(val) => (
                  <span className="text-slate-300">
                    {val === 'weightedPct'
                      ? `Recency Weighted % (h = ${halfLife} Putaran)`
                      : 'Raw Frequency % (All-Time)'}
                  </span>
                )}
              />
              <Bar dataKey="weightedPct" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rawPct" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Tabel Evaluasi Recency Weighting &amp; Perubahan Peringkat Digit
          </h3>
          <span className="text-xs text-slate-400">
            Total {allDraws.length} Putaran dalam Analisis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Peringkat Recency</th>
                <th className="py-3 px-4">Digit</th>
                <th className="py-3 px-4 text-center">Skor Terbobot W(d)</th>
                <th className="py-3 px-4 text-center text-emerald-400">Persentase Terbobot</th>
                <th className="py-3 px-4 text-center">Kemunculan Aktual (Raw)</th>
                <th className="py-3 px-4 text-center text-blue-400">Persentase Standar (All-Time)</th>
                <th className="py-3 px-4 text-right">Dampak Kekinian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recencyStats.map((item) => {
                const rawItem = rawFreqStats.find(f => f.digit === item.digit);
                const rawPct = rawItem ? rawItem.percentage : 0;
                const shift = item.weightedPercentage - rawPct;

                return (
                  <tr key={item.digit} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      #{item.rank}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-black text-sm flex items-center justify-center">
                          {item.digit}
                        </span>
                        <span className="font-semibold text-slate-200">Digit {item.digit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      {item.weightedScore}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-400">
                      {item.weightedPercentage}%
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">
                      {item.rawCount} kali
                    </td>
                    <td className="py-3 px-4 text-center text-blue-400">
                      {rawPct}%
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          shift > 0.5
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : shift < -0.5
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {shift > 0.5 ? `Menguat (+${shift.toFixed(1)}%)` : shift < -0.5 ? `Melemah (${shift.toFixed(1)}%)` : 'Stabil'}
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
