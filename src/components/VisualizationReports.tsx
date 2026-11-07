import React from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Layers,
  Flame,
  Activity,
  Calculator,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { DrawRecord, Market, PositionConfig } from '../types/lottery';
import {
  calculateFrequency,
  calculateHotCold,
  calculateOverdue,
  calculatePositionAnalysis,
  calculateParityAndSize,
  calculateDigitSum,
  generateCompositePrediction
} from '../utils/calculations';

interface VisualizationReportsProps {
  currentMarket: Market;
  draws: DrawRecord[];
  posConfig: PositionConfig;
  onPrint: () => void;
}

export const VisualizationReports: React.FC<VisualizationReportsProps> = ({
  currentMarket,
  draws,
  posConfig,
  onPrint
}) => {
  const freqStats = calculateFrequency(draws);
  const hotCold = calculateHotCold(draws);
  const overdueStats = calculateOverdue(draws);
  const posAnalysis = calculatePositionAnalysis(draws, posConfig);
  const paritySize = calculateParityAndSize(draws);
  const digitSumData = calculateDigitSum(draws);
  const latestDraw = draws[draws.length - 1];

  const prediction = generateCompositePrediction(draws, {
    frequency: 25,
    recency: 25,
    overdue: 15,
    positional: 20,
    pairs: 10,
    pattern: 5,
    halfLife: 14
  }, posConfig);

  const exportHtmlReport = () => {
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Statistik 4D - ${currentMarket.name}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
          h1, h2, h3 { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 24px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>ANALISIS 4D 3D 2D 2026-2027 - SMART NUMBER ANALYTICS</h1>
        <h2>Laporan Pasaran: ${currentMarket.name} (${currentMarket.code})</h2>
        <p>Total Data Teranalisis: ${draws.length} Putaran | Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}</p>
        <p>Hasil Terakhir: Periode P-${latestDraw?.period || '-'} = <strong>${latestDraw?.number || '----'}</strong></p>

        <h3>1. Rekomendasi Pintar (Smart Composite):</h3>
        <p>Kandidat 4D Utama: <strong>${prediction.primary4D}</strong> | 3D: <strong>${prediction.primary3D}</strong> | 2D: <strong>${prediction.pair2D_Belakang}</strong></p>
        <p>BBFS: <strong>${prediction.bbfs.join(', ')}</strong> | Colok Bebas: <strong>${prediction.colokBebas.join(' / ')}</strong></p>

        <h3>2. Frekuensi & Peringkat Digit 0-9:</h3>
        <table>
          <thead>
            <tr><th>Peringkat</th><th>Digit</th><th>Kemunculan</th><th>Persentase</th><th>Z-Score</th></tr>
          </thead>
          <tbody>
            ${freqStats.map(s => `<tr><td>#${s.rank}</td><td>Digit ${s.digit}</td><td>${s.count}x</td><td>${s.percentage}%</td><td>${s.zScore}</td></tr>`).join('')}
          </tbody>
        </table>

        <h3>3. Karakteristik Paritas & Ukuran:</h3>
        <p>Ganjil: ${paritySize.oddCount} digit | Genap: ${paritySize.evenCount} digit</p>
        <p>Besar (5-9): ${paritySize.bigCount} digit | Kecil (0-4): ${paritySize.smallCount} digit</p>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Analisis_${currentMarket.code}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Visualisasi Matriks &amp; Laporan Komprehensif
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Peta panas posisi (Positional Heatmap), ringkasan metrik statistik terpadu, dan format cetak laporan resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
          <button
            onClick={exportHtmlReport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Laporan HTML</span>
          </button>
        </div>
      </div>

      {/* 4x10 Positional Heatmap Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Matriks Peta Panas Frekuensi Posisi 4D (Heatmap Matrix)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Warna lebih terang menunjukkan konsentrasi kemunculan digit lebih tinggi pada posisi terkait
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {draws.length} Putaran Pengundian
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <th className="py-2.5 px-3 text-left">Posisi</th>
                {Array.from({ length: 10 }).map((_, d) => (
                  <th key={d} className="py-2.5 px-2 font-mono">
                    Digit {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {(['as', 'kop', 'kepala', 'ekor'] as const).map((posKey) => {
                const posData = posAnalysis[posKey];
                const maxCount = posData.mostFrequent.count || 1;

                return (
                  <tr key={posKey}>
                    <td className="py-3 px-3 text-left font-bold text-slate-200 uppercase tracking-wider">
                      {posData.label}
                    </td>
                    {Array.from({ length: 10 }).map((_, d) => {
                      const count = posData.digitCounts[d] || 0;
                      const intensity = count / maxCount;
                      const isMax = d === posData.mostFrequent.digit;
                      const isMin = d === posData.leastFrequent.digit;

                      return (
                        <td
                          key={d}
                          className="py-3 px-2 font-mono"
                          style={{
                            backgroundColor: count > 0 ? `rgba(37, 99, 235, ${0.15 + intensity * 0.75})` : 'transparent'
                          }}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className={`text-sm font-black ${isMax ? 'text-emerald-300 font-black' : isMin ? 'text-rose-300' : 'text-white'}`}>
                              {count}
                            </span>
                            <span className="text-[9px] text-slate-300">
                              {((count / (draws.length || 1)) * 100).toFixed(0)}%
                            </span>
                          </div>
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

      {/* Comprehensive Printable Executive Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:bg-white print:text-black">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white print:text-black uppercase tracking-wider">
              Ringkasan Eksekutif Analisis Statistik &amp; Prediksi: {currentMarket.name}
            </h3>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
              ANALISIS 4D 3D 2D 2026-2027 • Model Matematika &amp; Probabilitas Empiris
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-blue-400 print:text-blue-600 block">
              P-{latestDraw?.period || '-'} ({latestDraw?.number || '----'})
            </span>
            <span className="text-[10px] text-slate-400 print:text-gray-500">
              {latestDraw?.date || ''}
            </span>
          </div>
        </div>

        {/* 3 Core Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Block 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            <h4 className="font-bold text-blue-400 uppercase tracking-wider">
              1. Rekomendasi Angka Pintar
            </h4>
            <div className="space-y-1 text-slate-300 print:text-gray-800">
              <div className="flex justify-between">
                <span>4D Utama:</span>
                <strong className="font-mono text-white print:text-black text-sm">{prediction.primary4D}</strong>
              </div>
              <div className="flex justify-between">
                <span>3D Belakang:</span>
                <strong className="font-mono text-white print:text-black">{prediction.primary3D}</strong>
              </div>
              <div className="flex justify-between">
                <span>2D Belakang (Kep-Ek):</span>
                <strong className="font-mono text-emerald-400 font-bold">{prediction.pair2D_Belakang}</strong>
              </div>
              <div className="flex justify-between">
                <span>2D Tengah:</span>
                <strong className="font-mono text-indigo-400 font-bold">{prediction.pair2D_Tengah}</strong>
              </div>
              <div className="flex justify-between">
                <span>BBFS (6 Digit):</span>
                <strong className="font-mono text-amber-400 font-bold">{prediction.bbfs.join(', ')}</strong>
              </div>
            </div>
          </div>

          {/* Block 2 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider">
              2. Indikator Panas &amp; Dingin
            </h4>
            <div className="space-y-1 text-slate-300 print:text-gray-800">
              <div className="flex justify-between">
                <span>Top 3 Hot:</span>
                <strong className="font-mono text-amber-400">{hotCold.top3.map(h => h.digit).join(', ')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Bottom 3 Cold:</span>
                <strong className="font-mono text-cyan-400">{hotCold.bottom3.map(c => c.digit).join(', ')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Overdue Terlama:</span>
                <strong className="font-mono text-rose-400">Digit {overdueStats[0]?.digit} ({overdueStats[0]?.currentGap}P)</strong>
              </div>
              <div className="flex justify-between">
                <span>Rata-rata Digit Sum:</span>
                <strong className="font-mono text-white print:text-black">{digitSumData.averageSum}</strong>
              </div>
            </div>
          </div>

          {/* Block 3 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            <h4 className="font-bold text-indigo-400 uppercase tracking-wider">
              3. Posisi Jitu (Dominan)
            </h4>
            <div className="space-y-1 text-slate-300 print:text-gray-800">
              <div className="flex justify-between">
                <span>As Dominan:</span>
                <strong className="font-mono text-blue-400 font-bold">Digit {posAnalysis.as.mostFrequent.digit} ({posAnalysis.as.mostFrequent.pct}%)</strong>
              </div>
              <div className="flex justify-between">
                <span>Kop Dominan:</span>
                <strong className="font-mono text-indigo-400 font-bold">Digit {posAnalysis.kop.mostFrequent.digit} ({posAnalysis.kop.mostFrequent.pct}%)</strong>
              </div>
              <div className="flex justify-between">
                <span>Kepala Dominan:</span>
                <strong className="font-mono text-emerald-400 font-bold">Digit {posAnalysis.kepala.mostFrequent.digit} ({posAnalysis.kepala.mostFrequent.pct}%)</strong>
              </div>
              <div className="flex justify-between">
                <span>Ekor Dominan:</span>
                <strong className="font-mono text-amber-400 font-bold">Digit {posAnalysis.ekor.mostFrequent.digit} ({posAnalysis.ekor.mostFrequent.pct}%)</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 print:text-gray-500">
          <span>Laporan diekspor secara otomatis dari database analitik lokal browser</span>
          <span className="font-mono">ANALISIS 4D 3D 2D 2026-2027</span>
        </div>
      </div>
    </div>
  );
};
