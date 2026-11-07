import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  Flame,
  Snowflake,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  Activity,
  Calculator,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
  BrainCircuit
} from 'lucide-react';
import { DrawRecord, Market, PositionConfig } from '../types/lottery';
import {
  calculateFrequency,
  calculateHotCold,
  calculateOverdue,
  calculatePositionAnalysis,
  calculateParityAndSize,
  calculateDigitSum,
  generateCompositePrediction,
  calculateRecencyWeighting
} from '../utils/calculations';

interface DashboardProps {
  draws: DrawRecord[];
  allDraws: DrawRecord[];
  currentMarket: Market;
  posConfig: PositionConfig;
  onNavigateTab: (tab: any) => void;
  onOpenAddModal: () => void;
}

const DIGIT_COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'
];

export const Dashboard: React.FC<DashboardProps> = ({
  draws,
  allDraws,
  currentMarket,
  posConfig,
  onNavigateTab,
  onOpenAddModal
}) => {
  const freqStats = calculateFrequency(draws);
  const hotCold = calculateHotCold(draws);
  const overdueStats = calculateOverdue(draws);
  const posAnalysis = calculatePositionAnalysis(draws, posConfig);
  const paritySize = calculateParityAndSize(draws);
  const digitSumData = calculateDigitSum(draws);
  const recencyStats = calculateRecencyWeighting(draws, 14);

  const latestDraw = draws[draws.length - 1];
  const mostFrequent = hotCold.top2[0];
  const leastFrequent = hotCold.bottom2[0];
  const mostOverdue = overdueStats[0];

  // Digits that have 0 appearances in this filtered slice
  const neverAppearedDigits = freqStats.filter(s => s.count === 0);

  // Frequency chart data
  const freqChartData = freqStats.map((s, idx) => ({
    digit: `Digit ${s.digit}`,
    digitNum: s.digit,
    count: s.count,
    percentage: s.percentage,
    zScore: s.zScore,
    fill: DIGIT_COLORS[idx]
  }));

  // Positional matrix data
  const positionRows = [
    { label: 'As (Digit 1)', key: 'as', data: posAnalysis.as },
    { label: 'Kop (Digit 2)', key: 'kop', data: posAnalysis.kop },
    { label: 'Kepala (Digit 3)', key: 'kepala', data: posAnalysis.kepala },
    { label: 'Ekor (Digit 4)', key: 'ekor', data: posAnalysis.ekor },
  ];

  // Quick Prediction
  const quickPred = generateCompositePrediction(draws, {
    frequency: 25,
    recency: 25,
    overdue: 15,
    positional: 20,
    pairs: 10,
    pattern: 5,
    halfLife: 14
  }, posConfig);

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-3 h-3" /> Mesin Analitik Aktif
            </span>
            <span className="text-xs text-slate-400">
              Periode Pengamatan: <strong className="text-white font-mono">{draws.length}</strong> Putaran
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            Dashboard Analisis &amp; Prediksi: {currentMarket.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Sistem kalkulasi matematis otomatis menguji frekuensi digit, Z-Score deviasi, posisi As-Kop-Kepala-Ekor, gap interval, dan recency weighting secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('composite')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Lihat Prediksi Smart</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-all"
          >
            <span>+ Input Hasil</span>
          </button>
        </div>
      </div>

      {/* Top Statistical KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Card 1: Total Data */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total History</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-white">{allDraws.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Putaran Tersimpan
            </div>
          </div>
        </div>

        {/* Card 2: Latest Result */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hasil Terakhir</span>
            <span className="text-[10px] font-mono text-blue-400 font-bold">P-{latestDraw?.period || '-'}</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
              {latestDraw?.number || '----'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {latestDraw?.date || 'Belum ada data'}
            </div>
          </div>
        </div>

        {/* Card 3: Most Frequent (Hot) */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Digit Terpanas</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-amber-400">
                {mostFrequent ? mostFrequent.digit : '-'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({mostFrequent ? mostFrequent.count : 0}x)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Pangsa: {mostFrequent ? mostFrequent.percentage : 0}% • Z: {mostFrequent?.zScore}
            </div>
          </div>
        </div>

        {/* Card 4: Least Frequent (Cold) */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Digit Terdingin</span>
            <Snowflake className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-cyan-400">
                {leastFrequent ? leastFrequent.digit : '-'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({leastFrequent ? leastFrequent.count : 0}x)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Pangsa: {leastFrequent ? leastFrequent.percentage : 0}% • Z: {leastFrequent?.zScore}
            </div>
          </div>
        </div>

        {/* Card 5: Longest Overdue */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue Terlama</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-rose-400">
                {mostOverdue ? mostOverdue.digit : '-'}
              </span>
              <span className="text-xs text-rose-300 font-mono font-bold">
                {mostOverdue ? `${mostOverdue.currentGap}P` : '-'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Rata-rata Gap: {mostOverdue?.avgGap}P
            </div>
          </div>
        </div>

        {/* Card 6: Average Digit Sum */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rata-rata Sum</span>
            <Calculator className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-indigo-300">
              {digitSumData.averageSum}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Modus: {digitSumData.mostFrequentSum.sum} ({digitSumData.mostFrequentSum.count}x)
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Frequency Distribution Bar Chart & Quick Prediction Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Frekuensi Kemunculan Digit 0-9 */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Frekuensi Kemunculan Digit 0 Sampai 9</span>
              </h3>
              <p className="text-xs text-slate-400">
                Jumlah kemunculan aktual dalam rentang {draws.length} pengundian terakhir
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('frequency')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>Detail Analisis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freqChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="digit" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} kali (${item.payload.percentage}%)`,
                    'Kemunculan'
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {freqChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Digit Status Chips */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-5 sm:grid-cols-10 gap-2">
            {freqStats.map((item) => (
              <div
                key={item.digit}
                className="bg-slate-950/70 border border-slate-800 rounded-lg p-1.5 text-center"
              >
                <div className="text-xs font-black font-mono text-white">{item.digit}</div>
                <div className="text-[11px] font-mono text-blue-400 font-semibold">{item.count}x</div>
                <div className="text-[9px] text-slate-400">{item.percentage}%</div>
              </div>
            ))}
          </div>

          {neverAppearedDigits.length > 0 && (
            <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-xs text-rose-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Digit yang <strong>belum pernah muncul</strong> pada rentang ini:{' '}
                {neverAppearedDigits.map(d => d.digit).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Right Col: Quick Prediction & Smart Composite Snapshot */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>Rekomendasi Pintar 4D 3D 2D</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PROBABILISTIK
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Dihitung dari kombinasi bobot frekuensi, recency exponential, gap overdue, dan puncak posisi.
            </p>

            {/* Generated Cards */}
            <div className="space-y-3">
              {/* Primary 4D */}
              <div className="bg-slate-950/90 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Kandidat Utama 4D
                  </span>
                  <span className="text-xs text-slate-400">As-Kop-Kepala-Ekor</span>
                </div>
                <div className="text-xl font-black font-mono tracking-widest text-white px-3 py-1 bg-blue-600/20 rounded-lg border border-blue-500/40">
                  {quickPred.primary4D}
                </div>
              </div>

              {/* 3D & 2D Belakang */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/90 border border-indigo-500/30 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                    3D Belakang
                  </span>
                  <div className="text-lg font-black font-mono text-white mt-1">
                    {quickPred.primary3D}
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    2D Belakang (Kep-Ek)
                  </span>
                  <div className="text-lg font-black font-mono text-emerald-400 mt-1">
                    {quickPred.pair2D_Belakang}
                  </div>
                </div>
              </div>

              {/* BBFS Set */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-300">BBFS Rekomendasi (6 Digit):</span>
                  <span className="text-[10px] text-amber-400">Skor Tertinggi</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  {quickPred.bbfs.map((d, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Colok Bebas & Jitu */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>Colok Bebas:</span>
                  <strong className="text-white font-mono font-bold">
                    {quickPred.colokBebas.join(' & ')}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Colok Jitu As:</span>
                  <strong className="text-blue-400 font-mono font-bold">
                    {quickPred.colokJitu.as}
                  </strong>
                  <span>Kop:</span>
                  <strong className="text-indigo-400 font-mono font-bold">
                    {quickPred.colokJitu.kop}
                  </strong>
                  <span>Kep:</span>
                  <strong className="text-emerald-400 font-mono font-bold">
                    {quickPred.colokJitu.kepala}
                  </strong>
                  <span>Ek:</span>
                  <strong className="text-amber-400 font-mono font-bold">
                    {quickPred.colokJitu.ekor}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Berdasarkan data history
            </span>
            <button
              onClick={() => onNavigateTab('composite')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Atur Bobot &amp; Simulasi &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Posisi As-Kop-Kepala-Ekor Table & Ganjil-Genap / Besar-Kecil Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posisi Breakdown Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Distribusi Angka Berdasarkan Posisi 4D</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pemetaan digit tertinggi dan terendah pada As, Kop, Kepala, dan Ekor
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('position')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Grafik Posisi &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Posisi</th>
                  <th className="py-2 px-3 font-semibold text-emerald-400">Digit Dominan</th>
                  <th className="py-2 px-3 font-semibold text-rose-400">Digit Lemah</th>
                  <th className="py-2 px-3 font-semibold text-right">Frekuensi Puncak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positionRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Digit {row.data.mostFrequent.digit} ({row.data.mostFrequent.count}x)
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Digit {row.data.leastFrequent.digit} ({row.data.leastFrequent.count}x)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300 font-semibold">
                      {row.data.mostFrequent.pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Digit Positional Mini Heatmap */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Frekuensi Digit 0-9 per Posisi (0 = Hitam, 5+ = Terang):
            </span>
            <div className="space-y-1.5 text-[11px]">
              {(['as', 'kop', 'kepala', 'ekor'] as const).map(pKey => {
                const pData = posAnalysis[pKey];
                return (
                  <div key={pKey} className="flex items-center gap-2">
                    <span className="w-14 uppercase text-[10px] font-bold text-slate-400">{pKey}</span>
                    <div className="flex-1 grid grid-cols-10 gap-1">
                      {Array.from({ length: 10 }).map((_, d) => {
                        const count = pData.digitCounts[d] || 0;
                        const intensity = Math.min(1, count / 8);
                        return (
                          <div
                            key={d}
                            className="h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] text-white border border-slate-800"
                            style={{
                              backgroundColor: `rgba(37, 99, 235, ${0.15 + intensity * 0.75})`
                            }}
                            title={`${pKey} digit ${d}: ${count}x`}
                          >
                            {d}:{count}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pola Karakteristik: Ganjil-Genap & Besar-Kecil */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Distribusi Karakteristik Angka</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pola kombinasi Ganjil/Genap dan Besar/Kecil
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('parity-size')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Lihat Detail &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Parity (Ganjil - Genap) List */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Ganjil / Genap</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {paritySize.oddCount}G : {paritySize.evenCount}E
                </span>
              </h4>
              <div className="space-y-2">
                {paritySize.parityDistribution.map((item) => (
                  <div key={item.pattern} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-mono text-slate-400">
                        {item.count}x ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Size (Besar - Kecil) List */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Besar / Kecil</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">
                  {paritySize.bigCount}B : {paritySize.smallCount}K
                </span>
              </h4>
              <div className="space-y-2">
                {paritySize.sizeDistribution.map((item) => (
                  <div key={item.pattern} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-mono text-slate-400">
                        {item.count}x ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Recency Weighting Leaderboard */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Peringkat Recency Weighting (Half-Life 14 Putaran):</span>
              </span>
              <button
                onClick={() => onNavigateTab('recency')}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                Konfigurasi Half-Life &rarr;
              </button>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {recencyStats.slice(0, 10).map((r) => (
                <div
                  key={r.digit}
                  className={`p-1.5 rounded text-center border ${
                    r.rank <= 3
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-[9px] block text-slate-400">#{r.rank}</span>
                  <span className="text-sm font-black font-mono">{r.digit}</span>
                  <span className="text-[9px] block font-mono text-slate-400">{r.weightedScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
