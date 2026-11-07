import React from 'react';
import { Menu, Plus, Printer, RotateCcw, Calendar, Hash, Clock } from 'lucide-react';
import { DrawRecord, Market } from '../types/lottery';

interface HeaderProps {
  currentMarket: Market;
  latestDraw?: DrawRecord;
  periodFilter: number | 'all';
  onFilterChange: (limit: number | 'all') => void;
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  onPrint: () => void;
  onResetSeedData: () => void;
  totalDraws: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMarket,
  latestDraw,
  periodFilter,
  onFilterChange,
  onOpenMobileMenu,
  onOpenAddModal,
  onPrint,
  onResetSeedData,
  totalDraws
}) => {
  const digits = latestDraw ? latestDraw.number.padStart(4, '0').slice(-4).split('') : ['-', '-', '-', '-'];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30">
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Mobile trigger & Market Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{currentMarket.name}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {currentMarket.code}
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{currentMarket.schedule}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium">{totalDraws} Data History</span>
              </p>
            </div>
          </div>

          {/* Quick Add on mobile */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={onOpenAddModal}
              className="p-2 rounded-lg bg-emerald-600 text-white font-medium text-xs flex items-center gap-1 hover:bg-emerald-500"
              aria-label="Input angka baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Latest Draw Card */}
        {latestDraw && (
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/90 px-3 py-1.5 rounded-xl">
            <div className="text-right border-r border-slate-800 pr-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-tight">
                Hasil Terakhir
              </span>
              <span className="text-xs font-mono text-slate-300 font-medium">
                P-{latestDraw.period}
              </span>
            </div>

            {/* Digits Display */}
            <div className="flex items-center gap-1.5">
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">AS</span>
                <span className="w-7 h-8 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-300 font-mono font-black text-sm flex items-center justify-center shadow-xs">
                  {digits[0]}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">KOP</span>
                <span className="w-7 h-8 rounded-md bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono font-black text-sm flex items-center justify-center shadow-xs">
                  {digits[1]}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">KEP</span>
                <span className="w-7 h-8 rounded-md bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm flex items-center justify-center shadow-xs">
                  {digits[2]}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">EKR</span>
                <span className="w-7 h-8 rounded-md bg-amber-600/20 border border-amber-500/40 text-amber-300 font-mono font-black text-sm flex items-center justify-center shadow-xs">
                  {digits[3]}
                </span>
              </div>
            </div>

            <div className="pl-2 border-l border-slate-800 text-[10px] text-slate-400">
              <span>{latestDraw.date}</span>
              {latestDraw.day && <span className="block text-slate-400">{latestDraw.day}</span>}
            </div>
          </div>
        )}

        {/* Right: Period Filter and Actions */}
        <div className="flex items-center flex-wrap gap-2 justify-end">
          {/* Quick Period Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <span className="px-2 text-[10px] text-slate-400 font-medium">Rentang:</span>
            {[7, 14, 30, 90, 'all'].map((limit) => (
              <button
                key={String(limit)}
                onClick={() => onFilterChange(limit as number | 'all')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  periodFilter === limit
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {limit === 'all' ? 'Semua' : `${limit}P`}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Hasil</span>
            </button>
            <button
              onClick={onPrint}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/60"
              title="Cetak atau Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
