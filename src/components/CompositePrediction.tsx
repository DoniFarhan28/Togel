import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  Bookmark,
  Check,
  ShieldAlert,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { DrawRecord, IndicatorWeights, PositionConfig } from '../types/lottery';
import { generateCompositePrediction, getCompositeDigitScores } from '../utils/calculations';

interface CompositePredictionProps {
  draws: DrawRecord[];
  weights: IndicatorWeights;
  onUpdateWeights: (newWeights: IndicatorWeights) => void;
  posConfig: PositionConfig;
}

export const CompositePrediction: React.FC<CompositePredictionProps> = ({
  draws,
  weights,
  onUpdateWeights,
  posConfig
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedList, setSavedList] = useState<Array<{ id: string; time: string; number4D: string; bbfs: string }>>([]);

  const prediction = generateCompositePrediction(draws, weights, posConfig);
  const digitScores = getCompositeDigitScores(draws, weights);

  const handleWeightChange = (key: keyof IndicatorWeights, val: number) => {
    onUpdateWeights({
      ...weights,
      [key]: val
    });
  };

  const handleSavePrediction = () => {
    const item = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      number4D: prediction.primary4D,
      bbfs: prediction.bbfs.join('')
    };
    setSavedList([item, ...savedList]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Modul Prediksi Gabungan Multi-Indikator (Smart Composite)
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Memadukan 6 indikator matematis secara berbobot: Frekuensi dasar, Exponential Recency, Gap Overdue, Densitas Posisi, Frekuensi Pasangan, dan Karakteristik Pola.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePrediction}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Prediksi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Requirement 15 */}
      <div className="p-4 bg-slate-900/60 border border-amber-500/30 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <strong className="text-amber-300 font-semibold block">
            Prinsip Transparansi &amp; Integritas Analitik:
          </strong>
          <p className="text-slate-400 leading-relaxed">
            Skor komposit yang dihasilkan merupakan pemeringkatan analitis empiris dari kombinasi indikator statistik historis. Sistem <strong>tidak pernah mengubah skor riwayat menjadi klaim probabilitas kemenangan mutlak</strong> karena setiap pengundian tetap beroperasi di bawah prinsip probabilitas acak independen.
          </p>
        </div>
      </div>

      {/* Sliders for Multi-Indicator Weights */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Pengaturan Bobot Masing-Masing Indikator Statistik (0 - 100)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Perubahan bobot langsung mengkalkulasi ulang rekomendasi angka secara instan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Weight 1: Frekuensi */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">1. Frekuensi Kemunculan:</span>
              <span className="text-blue-400 font-mono">{weights.frequency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights.frequency}
              onChange={(e) => handleWeightChange('frequency', Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Weight 2: Recency */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">2. Recency Weighting (Kekinian):</span>
              <span className="text-emerald-400 font-mono">{weights.recency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights.recency}
              onChange={(e) => handleWeightChange('recency', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Weight 3: Overdue */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">3. Kesenjangan / Overdue (Gap):</span>
              <span className="text-rose-400 font-mono">{weights.overdue}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights.overdue}
              onChange={(e) => handleWeightChange('overdue', Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Weight 4: Posisi */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">4. Densitas Posisi (As-Kop-Kep-Ek):</span>
              <span className="text-indigo-400 font-mono">{weights.positional}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights.positional}
              onChange={(e) => handleWeightChange('positional', Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Weight 5: Pasangan */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">5. Frekuensi Pasangan (2D Pair):</span>
              <span className="text-amber-400 font-mono">{weights.pairs}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights.pairs}
              onChange={(e) => handleWeightChange('pairs', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Weight 6: Half-Life */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">6. Half-Life Recency (Putaran):</span>
              <span className="text-cyan-400 font-mono">{weights.halfLife}P</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              value={weights.halfLife}
              onChange={(e) => handleWeightChange('halfLife', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Recommended Output Cards for 4D, 3D, 2D */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 4D Recommendations */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
              Rekomendasi Formasi 4D
            </h3>
            <span className="text-[10px] text-slate-400">As-Kop-Kep-Ek</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-blue-500/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Kandidat Utama (Posisi Dominan):
              </span>
              <div className="text-2xl font-black font-mono tracking-widest text-white text-center py-1 bg-blue-600/10 rounded-lg">
                {prediction.primary4D}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Kandidat Alternatif (Top Skor Gabungan):
              </span>
              <div className="text-xl font-black font-mono tracking-widest text-slate-300 text-center py-1">
                {prediction.secondary4D}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Kandidat Cadangan (Second Best):
              </span>
              <div className="text-xl font-black font-mono tracking-widest text-slate-400 text-center py-1">
                {prediction.alternate4D}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 3D & 2D Recommendations */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              Rekomendasi 3D &amp; 2D
            </h3>
            <span className="text-[10px] text-slate-400">Pola Tarung</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">3D Belakang</span>
                <span className="text-lg font-black font-mono text-white tracking-widest">
                  {prediction.primary3D}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">3D Alternatif</span>
                <span className="text-lg font-black font-mono text-slate-300 tracking-widest">
                  {prediction.secondary3D}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Pasangan 2D Menurut Posisi:
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">2D Belakang (Kep-Ek):</span>
                <strong className="text-emerald-400 font-mono text-base font-black">
                  {prediction.pair2D_Belakang}
                </strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">2D Tengah (Kop-Kep):</span>
                <strong className="text-indigo-400 font-mono text-base font-black">
                  {prediction.pair2D_Tengah}
                </strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">2D Depan (As-Kop):</span>
                <strong className="text-blue-400 font-mono text-base font-black">
                  {prediction.pair2D_Depan}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: BBFS & Colok Jitu */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              BBFS &amp; Colok Jitu
            </h3>
            <span className="text-[10px] text-slate-400">Pilihan Bebas</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                BBFS Rekomendasi (6 Digit Skor Tertinggi):
              </span>
              <div className="flex justify-center gap-1.5">
                {prediction.bbfs.map((d, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-sm flex items-center justify-center shadow-xs"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Colok Bebas:</span>
                <strong className="text-white font-mono text-sm font-black">
                  {prediction.colokBebas.join(' atau ')}
                </strong>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-400">Colok Jitu As:</span>
                <strong className="text-blue-400 font-mono font-bold">{prediction.colokJitu.as}</strong>
                <span className="text-slate-400">Kop:</span>
                <strong className="text-indigo-400 font-mono font-bold">{prediction.colokJitu.kop}</strong>
                <span className="text-slate-400">Kep:</span>
                <strong className="text-emerald-400 font-mono font-bold">{prediction.colokJitu.kepala}</strong>
                <span className="text-slate-400">Ek:</span>
                <strong className="text-amber-400 font-mono font-bold">{prediction.colokJitu.ekor}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digit Score Breakdown Leaderboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Peringkat Skor Gabungan Terbobot untuk Seluruh Digit (0 s/d 9)
          </h3>
          <span className="text-xs text-slate-400">Skor Relatif 0 - 100</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Digit</th>
                <th className="py-3 px-4 text-center">Skor Akhir Gabungan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Potensi Penempatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {prediction.sortedDigits.map((item, idx) => (
                <tr key={item.digit} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-black text-sm flex items-center justify-center">
                        {item.digit}
                      </span>
                      <span className="font-semibold text-slate-200">Digit {item.digit}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-white text-sm">
                    {item.score}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        idx < 3
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : idx < 6
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx < 3 ? 'Prioritas Utama' : idx < 6 ? 'Kandidat Cadangan' : 'Sekunder'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans text-slate-300">
                    {idx === 0
                      ? 'Cocok Colok Bebas / Jitu'
                      : idx < 6
                      ? 'Direkomendasikan masuk BBFS'
                      : 'Digit pendingin'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Predictions Drawer */}
      {savedList.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span>Riwayat Prediksi yang Disimpan Sesi Ini ({savedList.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {savedList.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block">{item.time} WIB</span>
                  <span className="font-mono font-bold text-white text-base tracking-wider block mt-0.5">
                    {item.number4D}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">BBFS: {item.bbfs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
