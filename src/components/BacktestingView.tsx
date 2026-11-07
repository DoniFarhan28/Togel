import React, { useState } from 'react';
import {
  Target,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { DrawRecord, IndicatorWeights } from '../types/lottery';
import { runWalkForwardBacktest } from '../utils/calculations';

interface BacktestingViewProps {
  allDraws: DrawRecord[];
  weights: IndicatorWeights;
}

export const BacktestingView: React.FC<BacktestingViewProps> = ({ allDraws, weights }) => {
  const [selectedMethod, setSelectedMethod] = useState<'composite' | 'hot' | 'cold' | 'overdue' | 'recency'>('composite');
  const [trainWindow, setTrainWindow] = useState<number>(20);

  const backtestResult = runWalkForwardBacktest(
    allDraws,
    selectedMethod,
    trainWindow,
    weights
  );

  const methodLabels = {
    composite: 'Kombinasi Multi-Indikator (Smart Composite)',
    hot: 'Metode Angka Panas (Hot Numbers)',
    cold: 'Metode Angka Dingin (Cold Numbers)',
    overdue: 'Metode Gap Terlama (Overdue Numbers)',
    recency: 'Metode Exponential Recency (Half-Life)'
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Modul Backtesting &amp; Evaluasi Walk-Forward Simulasi
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Menguji keabsahan statistik model prediktif secara <em>Walk-Forward Rolling Window</em>. Data masa depan ($t$) <strong>secara ketat tidak pernah</strong> diikutsertakan dalam pelatihan ($0 \dots t-1$).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Tanpa Bias Masa Depan (Zero Look-Ahead)
            </span>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">Pilih Metode:</span>
            {(['composite', 'hot', 'cold', 'overdue', 'recency'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMethod === m
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {m === 'composite' ? 'Composite (Smart)' : m.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Jendela Pelatihan:</span>
            <select
              value={trainWindow}
              onChange={(e) => setTrainWindow(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
            >
              <option value={10}>10 Putaran</option>
              <option value={15}>15 Putaran</option>
              <option value={20}>20 Putaran</option>
              <option value={30}>30 Putaran</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main KPI Evaluator Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Digit Hit Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Tingkat Kecocokan Digit
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {backtestResult.digitHitRate}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Baseline Acak: {backtestResult.randomBaselineDigit}%
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            95% CI: [{backtestResult.confidenceInterval[0]}% - {backtestResult.confidenceInterval[1]}%]
          </div>
        </div>

        {/* Card 2: Position Match Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Kecocokan Posisi Jitu
            </span>
            <div className="text-2xl font-black font-mono text-blue-400 mt-1">
              {backtestResult.positionHitRate}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Setidaknya 1 posisi tepat
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            As, Kop, Kepala, atau Ekor
          </div>
        </div>

        {/* Card 3: Exact 2D Hit Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Kecocokan 2D Belakang
            </span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {backtestResult.exact2DHitRate}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Baseline Acak: 1.0% (1:100)
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            Kombinasi Kepala &amp; Ekor
          </div>
        </div>

        {/* Card 4: Total Evaluated Draws */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Putaran Teruji (Test Set)
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {backtestResult.totalEvaluated}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Training Set: {backtestResult.trainSize} Putaran
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400">
            Evaluasi Berjalan Sukses
          </div>
        </div>
      </div>

      {/* Comparison against Random Baseline Banner */}
      <div className="p-4 bg-slate-900/80 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-semibold">
              Hasil Analisis Uji Komparasi terhadap Peluang Acak (Random Baseline):
            </strong>
            <p className="text-slate-400 mt-0.5">
              Metode <strong className="text-blue-300">{methodLabels[selectedMethod]}</strong> menghasilkan kecocokan digit sebesar <strong>{backtestResult.digitHitRate}%</strong> berbanding ekspektasi acak <strong>{backtestResult.randomBaselineDigit}%</strong>.
              {backtestResult.digitHitRate > backtestResult.randomBaselineDigit ? (
                <span className="text-emerald-400 font-semibold ml-1">
                  Model menunjukkan keunggulan empiris (+{(backtestResult.digitHitRate - backtestResult.randomBaselineDigit).toFixed(2)}%) di atas pemilihan murni acak pada data uji.
                </span>
              ) : (
                <span className="text-amber-400 font-semibold ml-1">
                  Hasil berada dalam rentang toleransi variansi stokastik standar.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Walk-Forward Simulation Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Log Simulasi Walk-Forward Pengujian Historis (Urutan Terbaru ke Terlama)
          </h3>
          <span className="text-xs text-slate-400">
            Menampilkan {backtestResult.historyLog.length} riwayat pengujian
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3 text-center">Angka Aktual</th>
                <th className="py-2.5 px-3 text-center">Top 4 Prediksi</th>
                <th className="py-2.5 px-3 text-center">Prediksi 2D</th>
                <th className="py-2.5 px-3 text-center">Status Digit Hit</th>
                <th className="py-2.5 px-3 text-center">Status 2D Hit</th>
                <th className="py-2.5 px-3 text-right">Status Posisi Hit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {backtestResult.historyLog.map((log) => (
                <tr key={log.period} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-blue-400 font-bold">
                    P-{log.period}
                  </td>
                  <td className="py-2.5 px-3 text-center text-white font-black tracking-widest">
                    {log.actual}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-300">
                    [{log.predictedTopDigits.join(', ')}]
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-amber-300">
                    {log.predicted2D}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    {log.isDigitHit ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> HIT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                        <XCircle className="w-3 h-3" /> MISS
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    {log.is2DHit ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                        <CheckCircle className="w-3 h-3" /> 2D HIT!
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    {log.isPositionHit ? (
                      <span className="text-blue-400 font-bold text-[10px]">
                        Posisi Cocok
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Meleset</span>
                    )}
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
