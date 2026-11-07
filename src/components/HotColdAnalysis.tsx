import React, { useState } from 'react';
import { Flame, Snowflake, AlertCircle, ShieldAlert, BarChart2, ArrowRight } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import { calculateHotCold, filterDrawsByLimit } from '../utils/calculations';

interface HotColdAnalysisProps {
  allDraws: DrawRecord[];
}

export const HotColdAnalysis: React.FC<HotColdAnalysisProps> = ({ allDraws }) => {
  const [periodLimit, setPeriodLimit] = useState<number | 'all'>(30);
  const activeDraws = filterDrawsByLimit(allDraws, periodLimit);
  const hotCold = calculateHotCold(activeDraws);

  const [activeTier, setActiveTier] = useState<2 | 3 | 4 | 5>(3);

  const getTierData = (tier: 2 | 3 | 4 | 5) => {
    switch (tier) {
      case 2: return { hot: hotCold.top2, cold: hotCold.bottom2 };
      case 3: return { hot: hotCold.top3, cold: hotCold.bottom3 };
      case 4: return { hot: hotCold.top4, cold: hotCold.bottom4 };
      case 5: return { hot: hotCold.top5, cold: hotCold.bottom5 };
    }
  };

  const { hot, cold } = getTierData(activeTier);
  const totalObs = activeDraws.length * 4;
  const expectedFreq = (totalObs * 0.1).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">
              Modul Analisis Hot Number &amp; Cold Number
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Klasifikasi digit berdasarkan frekuensi aktual dan nilai standar deviasi Z-Score terhadap ekspektasi teoritis ({expectedFreq}x).
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Rentang:</span>
          {[7, 14, 30, 90, 120, 'all'].map((val) => (
            <button
              key={String(val)}
              onClick={() => setPeriodLimit(val as number | 'all')}
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

      {/* Mandatory Statistical Disclaimer (Requirement 6) */}
      <div className="p-4 bg-slate-900/60 border border-amber-500/30 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <strong className="text-amber-300 font-semibold block">
            Catatan Penting Metodologi &amp; Integritas Statistik:
          </strong>
          <p className="text-slate-400 leading-relaxed">
            Klasifikasi angka <strong>Hot</strong> (Panas) dan <strong>Cold</strong> (Dingin) semata-mata mengukur frekuensi historis dan penyimpangan statistik (Z-score) pada periode terpilih. Dalam sistem pengundian acak yang independen (independent Bernoulli trials), probabilitas teoritis setiap bola undian tetap 10% (1/10) per posisi, sehingga status Hot atau Cold <strong>bukanlah jaminan pasti</strong> bahwa suatu digit akan lebih mungkin atau kurang mungkin keluar pada putaran mendatang.
          </p>
        </div>
      </div>

      {/* Tier Switcher (Top/Bottom 2, 3, 4, 5) */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <span className="text-xs font-bold text-slate-300">
          Pilih Tingkatan Klasifikasi Digit:
        </span>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[2, 3, 4, 5].map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTier === tier
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Top/Bottom {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Split Comparison Cards: Hot vs Cold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hot Numbers Section */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  Top {activeTier} Digit Panas (Hot Numbers)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Digit dengan kemunculan dan Z-Score tertinggi di atas rata-rata
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Deviasi Positif
            </span>
          </div>

          <div className="space-y-3">
            {hot.map((item, idx) => (
              <div
                key={item.digit}
                className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 w-5">
                    #{idx + 1}
                  </span>
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-mono font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20">
                    {item.digit}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">Digit {item.digit}</div>
                    <div className="text-xs text-slate-400">
                      Muncul <strong className="text-amber-300 font-mono">{item.count} kali</strong> ({item.percentage}%)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    Z-Score: +{item.zScore}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Peringkat Frekuensi #{item.rank}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
            Kombinasi digit Hot untuk BBFS / Tarung:{' '}
            <strong className="text-white font-mono tracking-widest">
              {hot.map(h => h.digit).join(', ')}
            </strong>
          </div>
        </div>

        {/* Cold Numbers Section */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  Bottom {activeTier} Digit Dingin (Cold Numbers)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Digit dengan kemunculan dan Z-Score terendah di bawah ekspektasi
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Deviasi Negatif
            </span>
          </div>

          <div className="space-y-3">
            {cold.map((item, idx) => (
              <div
                key={item.digit}
                className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 w-5">
                    #{idx + 1}
                  </span>
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-700 to-blue-800 text-white font-mono font-black text-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
                    {item.digit}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">Digit {item.digit}</div>
                    <div className="text-xs text-slate-400">
                      Muncul <strong className="text-cyan-300 font-mono">{item.count} kali</strong> ({item.percentage}%)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-rose-400">
                    Z-Score: {item.zScore}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Peringkat Frekuensi #{item.rank}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
            Kombinasi digit Cold (sering dihindari atau ditunggu):{' '}
            <strong className="text-cyan-300 font-mono tracking-widest">
              {cold.map(c => c.digit).join(', ')}
            </strong>
          </div>
        </div>
      </div>

      {/* Overview Table of All Top and Bottom Sets */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">
          Rangkuman Seluruh Tier Hot &amp; Cold (Top 2 s/d Top 5 &amp; Bottom 2 s/d Bottom 5)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <span className="text-amber-400 font-bold block mb-1">Daftar Hot Numbers Lengkap:</span>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Top 2 Digit:</span>
              <strong className="text-white font-mono">{hotCold.top2.map(s => s.digit).join(', ')}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Top 3 Digit:</span>
              <strong className="text-white font-mono">{hotCold.top3.map(s => s.digit).join(', ')}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Top 4 Digit:</span>
              <strong className="text-white font-mono">{hotCold.top4.map(s => s.digit).join(', ')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Top 5 Digit:</span>
              <strong className="text-white font-mono">{hotCold.top5.map(s => s.digit).join(', ')}</strong>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <span className="text-cyan-400 font-bold block mb-1">Daftar Cold Numbers Lengkap:</span>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Bottom 2 Digit:</span>
              <strong className="text-white font-mono">{hotCold.bottom2.map(s => s.digit).join(', ')}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Bottom 3 Digit:</span>
              <strong className="text-white font-mono">{hotCold.bottom3.map(s => s.digit).join(', ')}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Bottom 4 Digit:</span>
              <strong className="text-white font-mono">{hotCold.bottom4.map(s => s.digit).join(', ')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bottom 5 Digit:</span>
              <strong className="text-white font-mono">{hotCold.bottom5.map(s => s.digit).join(', ')}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
