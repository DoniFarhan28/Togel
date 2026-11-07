import React, { useState } from 'react';
import { GitCommit, TrendingUp, AlertCircle, ArrowUpRight, Flame, Snowflake } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import { calculatePairAnalysis, filterDrawsByLimit } from '../utils/calculations';

interface PairAnalysisProps {
  allDraws: DrawRecord[];
}

export const PairAnalysis: React.FC<PairAnalysisProps> = ({ allDraws }) => {
  const [periodLimit, setPeriodLimit] = useState<number | 'all'>('all');
  const [pairType, setPairType] = useState<'belakang' | 'depan' | 'tengah' | 'all'>('belakang');

  const activeDraws = filterDrawsByLimit(allDraws, periodLimit);
  const pairAnalysis = calculatePairAnalysis(activeDraws, pairType);

  const pairTypeLabels = {
    belakang: '2D Belakang (Kepala - Ekor)',
    depan: '2D Depan (As - Kop)',
    tengah: '2D Tengah (Kop - Kepala)',
    all: 'Semua Kombinasi Pasangan 2D'
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitCommit className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Modul Analisis Pasangan Dua Digit (2D Pair Analysis)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Analisis frekuensi pasangan 00-99 terpisah berdasarkan posisi penempatan undian.
          </p>
        </div>

        {/* Position Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['belakang', 'depan', 'tengah', 'all'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setPairType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                pairType === type
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {type === 'belakang' ? '2D Belakang' : type === 'depan' ? '2D Depan' : type === 'tengah' ? '2D Tengah' : 'Semua Posisi'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: Consecutive vs Non-Consecutive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Pasangan Berurutan (Consecutive)</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {pairAnalysis.consecutiveCount}x
            </div>
            <span className="text-[10px] text-slate-500">Contoh: 12, 23, 89, 90</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {((pairAnalysis.consecutiveCount / (pairAnalysis.consecutiveCount + pairAnalysis.nonConsecutiveCount || 1)) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Pasangan Acak (Non-Consecutive)</span>
            <div className="text-2xl font-black font-mono text-blue-400 mt-1">
              {pairAnalysis.nonConsecutiveCount}x
            </div>
            <span className="text-[10px] text-slate-500">Contoh: 18, 42, 70</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {((pairAnalysis.nonConsecutiveCount / (pairAnalysis.consecutiveCount + pairAnalysis.nonConsecutiveCount || 1)) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Pasangan Belum Pernah Keluar (Zero Pairs)</span>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1">
              {pairAnalysis.zeroPairs.length}
            </div>
            <span className="text-[10px] text-slate-500">Dari total 100 kemungkinan (00-99)</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {pairAnalysis.zeroPairs.length}%
          </span>
        </div>
      </div>

      {/* Top 10 Frequent & Cold Pairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Frequent */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Top 10 Pasangan Paling Sering Muncul ({pairTypeLabels[pairType]})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Frekuensi Tertinggi</span>
          </div>

          <div className="space-y-2">
            {pairAnalysis.topPairs.map((p, idx) => (
              <div
                key={p.pair}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 font-mono font-bold text-slate-500">#{idx + 1}</span>
                  <span className="w-10 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm flex items-center justify-center">
                    {p.pair}
                  </span>
                  <div>
                    <span className="font-bold text-white font-mono">Pasangan {p.pair}</span>
                    <span className="block text-[10px] text-slate-400">
                      Terakhir muncul {p.lastSeenDrawsAgo} putaran lalu
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-sm">
                    {p.count} kali
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Proporsi {(p.frequency * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Coldest / Rare Pairs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-cyan-400" />
              <span>Top 10 Pasangan Paling Jarang Muncul ({pairTypeLabels[pairType]})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Frekuensi Rendah (&gt; 0)</span>
          </div>

          <div className="space-y-2">
            {pairAnalysis.rarePairs.map((p, idx) => (
              <div
                key={p.pair}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 font-mono font-bold text-slate-500">#{idx + 1}</span>
                  <span className="w-10 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-black text-sm flex items-center justify-center">
                    {p.pair}
                  </span>
                  <div>
                    <span className="font-bold text-white font-mono">Pasangan {p.pair}</span>
                    <span className="block text-[10px] text-slate-400">
                      Terakhir muncul {p.lastSeenDrawsAgo} putaran lalu
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-cyan-400 text-sm">
                    {p.count} kali
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Proporsi {(p.frequency * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zero Appearance Pairs Grid */}
      {pairAnalysis.zeroPairs.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Daftar Pasangan yang Belum Pernah Muncul ({pairAnalysis.zeroPairs.length} Pasangan)</span>
            </h3>
            <span className="text-xs text-slate-400">0x Terlihat</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
            {pairAnalysis.zeroPairs.map((pair) => (
              <span
                key={pair}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs font-semibold"
              >
                {pair}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
