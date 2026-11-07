import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Layers, CheckCircle2, Search } from 'lucide-react';
import { DrawRecord } from '../types/lottery';
import {
  MISTIK_LAMA_MAP,
  MISTIK_BARU_MAP,
  INDEX_MAP,
  calculateMistikIndexTransitions
} from '../utils/calculations';

interface MistikIndexAnalysisProps {
  allDraws: DrawRecord[];
}

export const MistikIndexAnalysis: React.FC<MistikIndexAnalysisProps> = ({ allDraws }) => {
  const [inputVal, setInputVal] = useState('9887');
  const transitionsData = calculateMistikIndexTransitions(allDraws);

  // Convert an arbitrary input string
  const convertNumber = (numStr: string, map: Record<number, number>) => {
    return numStr
      .split('')
      .map(ch => {
        const d = parseInt(ch, 10);
        return isNaN(d) ? ch : (map[d] ?? d).toString();
      })
      .join('');
  };

  const cleanInput = inputVal.replace(/\D/g, '').slice(0, 4);
  const resMistikLama = convertNumber(cleanInput, MISTIK_LAMA_MAP);
  const resMistikBaru = convertNumber(cleanInput, MISTIK_BARU_MAP);
  const resIndex = convertNumber(cleanInput, INDEX_MAP);

  // Reference digits 0-9 table
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            Modul Analisis Angka Mistik (Lama &amp; Baru) &amp; Index
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          Sistem transformasi angka tradisional dan empiris untuk menguji hipotesis perpindahan digit antara putaran sebelumnya ($t-1$) dan putaran sekarang ($t$).
        </p>
      </div>

      {/* Interactive Conversion Tool */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>Kalkulator Konversi Angka Mistik &amp; Index Otomatis</span>
        </h3>
        <p className="text-xs text-slate-400">
          Masukkan 2D, 3D, atau 4D untuk melihat transformasi angka secara instan:
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Masukkan angka 4D..."
            maxLength={4}
            className="w-full sm:w-48 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-lg text-center font-mono font-black text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-3 gap-3 flex-1 w-full">
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                Mistik Lama (ML)
              </span>
              <span className="text-lg font-black font-mono text-white tracking-widest">
                {resMistikLama || '----'}
              </span>
            </div>

            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                Mistik Baru (MB)
              </span>
              <span className="text-lg font-black font-mono text-white tracking-widest">
                {resMistikBaru || '----'}
              </span>
            </div>

            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                Angka Index (IND)
              </span>
              <span className="text-lg font-black font-mono text-white tracking-widest">
                {resIndex || '----'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Master Conversion Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Table 1: Mistik Lama */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Tabel Mistik Lama
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Standar 5 Pasangan</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {digits.map(d => (
              <div key={d} className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                <span className="block text-slate-400 text-[10px]">Digit</span>
                <span className="text-sm font-black font-mono text-white">{d}</span>
                <span className="text-slate-500 block text-[9px] my-0.5">&darr;</span>
                <span className="text-sm font-black font-mono text-indigo-400">
                  {MISTIK_LAMA_MAP[d]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2: Mistik Baru */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Tabel Mistik Baru
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Standar Modern</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {digits.map(d => (
              <div key={d} className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                <span className="block text-slate-400 text-[10px]">Digit</span>
                <span className="text-sm font-black font-mono text-white">{d}</span>
                <span className="text-slate-500 block text-[9px] my-0.5">&darr;</span>
                <span className="text-sm font-black font-mono text-amber-400">
                  {MISTIK_BARU_MAP[d]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table 3: Index */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Tabel Angka Index
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">(d + 5) mod 10</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {digits.map(d => (
              <div key={d} className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                <span className="block text-slate-400 text-[10px]">Digit</span>
                <span className="text-sm font-black font-mono text-white">{d}</span>
                <span className="text-slate-500 block text-[9px] my-0.5">&darr;</span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  {INDEX_MAP[d]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Transition Stats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Analisis Frekuensi Perpindahan Angka antar Putaran Berurutan</span>
            </h3>
            <p className="text-xs text-slate-400">
              Mengukur seberapa sering digit pada putaran ($t$) berakar dari angka putaran sebelumnya ($t-1$)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Digit Tetap Sama (Kopral):</span>
            <span className="text-xl font-black font-mono text-blue-400 mt-1 block">
              {transitionsData.sameCount} kali
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/30">
            <span className="text-slate-400 block">Perpindahan Mistik Lama:</span>
            <span className="text-xl font-black font-mono text-indigo-400 mt-1 block">
              {transitionsData.mistikLamaCount} kali
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30">
            <span className="text-slate-400 block">Perpindahan Mistik Baru:</span>
            <span className="text-xl font-black font-mono text-amber-400 mt-1 block">
              {transitionsData.mistikBaruCount} kali
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
            <span className="text-slate-400 block">Perpindahan Index:</span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
              {transitionsData.indexCount} kali
            </span>
          </div>
        </div>

        {/* Transition History Log Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3 text-center">Putaran Sebelumnya</th>
                <th className="py-2.5 px-3 text-center">Putaran Sekarang</th>
                <th className="py-2.5 px-3">Mekanisme Perpindahan Terdeteksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transitionsData.transitions.map((tr) => (
                <tr key={tr.period} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-blue-400 font-bold">P-{tr.period}</td>
                  <td className="py-2 px-3 text-center text-slate-400 font-black tracking-widest">
                    {tr.from}
                  </td>
                  <td className="py-2 px-3 text-center text-white font-black tracking-widest">
                    {tr.to}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    {tr.matches.length === 0 ? (
                      <span className="text-slate-500 text-[11px]">Tidak ada keterkaitan langsung</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {tr.matches.map((m, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.type === 'same'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : m.type === 'mistikLama'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : m.type === 'mistikBaru'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            Pos {m.pos + 1}: Digit {m.digit} ({m.type.toUpperCase()})
                          </span>
                        ))}
                      </div>
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
