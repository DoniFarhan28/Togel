import React from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Flame,
  Clock,
  Layers,
  GitCommit,
  Sparkles,
  Calculator,
  Split,
  Activity,
  Target,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { Market } from '../types/lottery';

export type ActiveTab =
  | 'dashboard'
  | 'data-history'
  | 'frequency'
  | 'hot-cold'
  | 'overdue'
  | 'position'
  | 'pair'
  | 'mistik-index'
  | 'digit-sum'
  | 'parity-size'
  | 'recency'
  | 'backtest'
  | 'composite'
  | 'reports'
  | 'settings';

interface SidebarProps {
  markets: Market[];
  activeMarketId: string;
  onSelectMarket: (marketId: string) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  drawCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  markets,
  activeMarketId,
  onSelectMarket,
  activeTab,
  onSelectTab,
  drawCount,
  isOpen,
  onClose
}) => {
  const currentMarket = markets.find(m => m.id === activeMarketId) || markets[0];

  const menuItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'data-history', label: 'Data History & Input', icon: Database, badge: `${drawCount}` },
    { id: 'frequency', label: 'Analisis Frekuensi', icon: BarChart3 },
    { id: 'hot-cold', label: 'Hot & Cold Number', icon: Flame },
    { id: 'overdue', label: 'Overdue / Gap Digit', icon: Clock },
    { id: 'position', label: 'Posisi 4D (As-Kop-Kep-Ek)', icon: Layers },
    { id: 'pair', label: 'Pair Analisis 2D', icon: GitCommit },
    { id: 'mistik-index', label: 'Mistik & Index Angka', icon: Sparkles },
    { id: 'digit-sum', label: 'Digit Sum (0-36)', icon: Calculator },
    { id: 'parity-size', label: 'Ganjil/Genap & Besar/Kecil', icon: Split },
    { id: 'recency', label: 'Recency Weighting (Half-Life)', icon: Activity },
    { id: 'backtest', label: 'Backtesting & Evaluasi', icon: Target, badge: 'PENTING' },
    { id: 'composite', label: 'Prediksi Gabungan (Smart)', icon: BrainCircuit },
    { id: 'reports', label: 'Visualisasi & Laporan', icon: FileSpreadsheet },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase">
                ANALISIS 4D 3D 2D
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  2026-2027
                </span>
                <span className="text-[10px] text-slate-400 font-medium">SMART ANALYTICS</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Market Selector Pill Bar */}
        <div className="p-3 border-b border-slate-800/70 bg-slate-900/50">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
            Pasaran Togel Terpilih:
          </label>
          <div className="relative">
            <select
              aria-label="Pilih Pasaran Togel"
              value={activeMarketId}
              onChange={(e) => onSelectMarket(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {markets.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: currentMarket?.color || '#3b82f6' }}
              />
              {currentMarket?.code}
            </span>
            <span className="font-mono text-emerald-400 font-semibold">{drawCount} Putaran</span>
          </div>
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      item.badge === 'PENTING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className="rounded-lg p-2.5 bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-200">Database Terisolasi</p>
              <p className="text-[10px] text-slate-400">Tersimpan lokal & aman</p>
            </div>
            <button
              onClick={() => {
                onSelectTab('settings');
                onClose();
              }}
              className="p-1 rounded text-slate-400 hover:text-blue-400"
              title="Pengaturan"
              aria-label="Buka Pengaturan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
