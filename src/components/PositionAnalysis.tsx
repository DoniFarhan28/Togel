import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { Layers, Settings2, CheckCircle2, TrendingUp, Sliders } from 'lucide-react';
import { DrawRecord, PositionConfig, PositionKey } from '../types/lottery';
import { calculatePositionAnalysis, filterDrawsByLimit } from '../utils/calculations';

interface PositionAnalysisProps {
  allDraws: DrawRecord[];
  posConfig: PositionConfig;
  onUpdatePosConfig: (newConfig: PositionConfig) => void;
}

const POSITION_COLORS: Record<PositionKey, string> = {
  as: '#3b82f6',
  kop: '#6366f1',
  kepala: '#10b981',
  ekor: '#f59e0b',
};

export const PositionAnalysis: React.FC<PositionAnalysisProps> = ({
  allDraws,
  posConfig,
  onUpdatePosConfig
}) => {
  const [periodLimit, setPeriodLimit] = useState<number | 'all'>(30);
  const [activePosTab, setActivePosTab] = useState<PositionKey>('as');
  const [showConfig, setShowConfig] = useState(false);

  const activeDraws = filterDrawsByLimit(allDraws, periodLimit);
  const posAnalysis = calculatePositionAnalysis(activeDraws, posConfig);

  const positions: Array<{ key: PositionKey; name: string; label: string; desc: string }> = [
    { key: 'as', name: 'AS', label: 'As (Digit 1)', desc: 'Digit pertama pada formasi 4D' },
    { key: 'kop', name: 'KOP', label: 'Kop (Digit 2)', desc: 'Digit kedua pada formasi 4D' },
    { key: 'kepala', name: 'KEPALA', label: 'Kepala (Digit 3)', desc: 'Digit ketiga / penentu puluhan 2D belakang' },
    { key: 'ekor', name: 'EKOR', label: 'Ekor (Digit 4)', desc: 'Digit keempat / penentu satuan 2D belakang' },
  ];

  // Chart data for selected position tab
  const activePosData = posAnalysis[activePosTab];
  const chartData = Array.from({ length: 10 }).map((_, d) => {
    const count = activePosData.digitCounts[d] || 0;
    const pct = activeDraws.length > 0 ? Number(((count / activeDraws.length) * 100).toFixed(1)) : 0;
    return {
      digitLabel: `Digit ${d}`,
      digit: d,
      count,
      pct,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Modul Analisis &amp; Prediksi Posisi 4D (As, Kop, Kepala, Ekor)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Analisis independen untuk setiap posisi guna memetakan digit dominan (Colok Jitu).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Sembunyikan Pemetaan' : 'Atur Pemetaan Posisi'}</span>
          </button>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[14, 30, 90, 'all'].map((val) => (
              <button
                key={String(val)}
                onClick={() => setPeriodLimit(val as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  periodLimit === val
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {val === 'all' ? 'Semua' : `${val}P`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Position Mapping Configuration Drawer */}
      {showConfig && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>Konfigurasi Indeks Pemetaan Posisi Digit</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Format baku 4D: [0]=As, [1]=Kop, [2]=Kepala, [3]=Ekor
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {(['as', 'kop', 'kepala', 'ekor'] as const).map((posKey) => (
              <div key={posKey} className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                  Posisi {posKey}:
                </label>
                <select
                  value={posConfig[posKey]}
                  onChange={(e) => {
                    onUpdatePosConfig({
                      ...posConfig,
                      [posKey]: parseInt(e.target.value, 10)
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value={0}>Indeks 0 (Digit 1 - Terdepan)</option>
                  <option value={1}>Indeks 1 (Digit 2)</option>
                  <option value={2}>Indeks 2 (Digit 3)</option>
                  <option value={3}>Indeks 3 (Digit 4 - Paling Belakang)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Positional Comparison Table (Requirement 8) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Tabel Komparasi Frekuensi Digit 0 Sampai 9 pada Setiap Posisi
          </h3>
          <span className="text-xs text-slate-400">
            Total {activeDraws.length} Putaran Pengamatan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Posisi</th>
                <th className="py-3 px-3 text-emerald-400">Digit Tertinggi</th>
                <th className="py-3 px-3 text-rose-400">Digit Terendah</th>
                {Array.from({ length: 10 }).map((_, d) => (
                  <th key={d} className="py-3 px-2 text-center font-mono">
                    d-{d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {positions.map((p) => {
                const pData = posAnalysis[p.key];
                return (
                  <tr key={p.key} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-sans font-bold text-slate-200">
                      {p.label}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {pData.mostFrequent.digit} ({pData.mostFrequent.count}x / {pData.mostFrequent.pct}%)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {pData.leastFrequent.digit} ({pData.leastFrequent.count}x / {pData.leastFrequent.pct}%)
                      </span>
                    </td>
                    {Array.from({ length: 10 }).map((_, d) => {
                      const count = pData.digitCounts[d] || 0;
                      const isMax = d === pData.mostFrequent.digit;
                      const isMin = d === pData.leastFrequent.digit;
                      return (
                        <td
                          key={d}
                          className={`py-3 px-2 text-center text-xs ${
                            isMax
                              ? 'text-emerald-400 font-black bg-emerald-500/15'
                              : isMin
                              ? 'text-rose-400 font-medium bg-rose-500/10'
                              : 'text-slate-300'
                          }`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position Specific Detail Tabs & Interactive Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {positions.map((p) => {
              const isActive = activePosTab === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setActivePosTab(p.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: POSITION_COLORS[p.key] }}
                  />
                  <span>Grafik {p.name}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400">
            Fokus: <strong className="text-white font-mono">{activePosData.label}</strong>
          </div>
        </div>

        {/* Chart View */}
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
                  `${val} kali (${item.payload.pct}%)`,
                  `Kemunculan di ${activePosData.label}`
                ]}
              />
              <Bar dataKey="count" fill={POSITION_COLORS[activePosTab]} radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.digit === activePosData.mostFrequent.digit
                        ? '#10b981'
                        : entry.digit === activePosData.leastFrequent.digit
                        ? '#f43f5e'
                        : POSITION_COLORS[activePosTab]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Colok Jitu Snapshot */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-200">
              Analisis Prediksi Colok Jitu Posisi {activePosData.label}:
            </span>
            <p className="text-slate-400 mt-0.5">
              Digit <strong className="text-emerald-400 font-mono">{activePosData.mostFrequent.digit}</strong> memiliki densitas tertinggi ({activePosData.mostFrequent.count} kali), sedangkan digit <strong className="text-rose-400 font-mono">{activePosData.leastFrequent.digit}</strong> memiliki densitas terendah ({activePosData.leastFrequent.count} kali).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400">Rekomendasi Jitu:</span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-black text-sm rounded-lg border border-emerald-500/30">
              {activePosData.mostFrequent.digit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
