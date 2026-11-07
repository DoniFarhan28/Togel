import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DataHistory } from './components/DataHistory';
import { FrequencyAnalysis } from './components/FrequencyAnalysis';
import { HotColdAnalysis } from './components/HotColdAnalysis';
import { OverdueAnalysis } from './components/OverdueAnalysis';
import { PositionAnalysis } from './components/PositionAnalysis';
import { PairAnalysis } from './components/PairAnalysis';
import { MistikIndexAnalysis } from './components/MistikIndexAnalysis';
import { DigitSumAnalysis } from './components/DigitSumAnalysis';
import { ParitySizeAnalysis } from './components/ParitySizeAnalysis';
import { RecencyWeightingAnalysis } from './components/RecencyWeightingAnalysis';
import { BacktestingView } from './components/BacktestingView';
import { CompositePrediction } from './components/CompositePrediction';
import { VisualizationReports } from './components/VisualizationReports';
import { SettingsView } from './components/SettingsView';

import { DrawRecord, IndicatorWeights, Market, PositionConfig } from './types/lottery';
import {
  loadMarkets,
  saveMarkets,
  loadDraws,
  saveDraws,
  loadPositionConfig,
  savePositionConfig,
  loadIndicatorWeights,
  saveIndicatorWeights,
  resetDatabaseToInitial,
  DEFAULT_POSITION_CONFIG
} from './utils/storage';
import { getInitialDraws } from './data/initialData';
import { filterDrawsByLimit } from './utils/calculations';
import { Plus, X, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export default function App() {
  const [markets, setMarkets] = useState<Market[]>(() => loadMarkets());
  const [activeMarketId, setActiveMarketId] = useState<string>(() => {
    const list = loadMarkets();
    return list[0]?.id || 'sydney';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [periodFilter, setPeriodFilter] = useState<number | 'all'>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Draws per active market
  const [marketDraws, setMarketDraws] = useState<DrawRecord[]>(() => loadDraws(activeMarketId));

  // Market position configuration & indicator weights
  const [posConfig, setPosConfig] = useState<PositionConfig>(() => loadPositionConfig(activeMarketId));
  const [indicatorWeights, setIndicatorWeights] = useState<IndicatorWeights>(() => loadIndicatorWeights());

  // Quick Add Draw Modal State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quickDay, setQuickDay] = useState('Senin');
  const [quickPeriod, setQuickPeriod] = useState('');
  const [quickNumber, setQuickNumber] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [quickError, setQuickError] = useState('');
  const [quickSuccess, setQuickSuccess] = useState('');

  // Synchronize when market changes
  useEffect(() => {
    const currentDraws = loadDraws(activeMarketId);
    setMarketDraws(currentDraws);
    setPosConfig(loadPositionConfig(activeMarketId));
  }, [activeMarketId]);

  const currentMarket = markets.find(m => m.id === activeMarketId) || markets[0];
  const filteredDraws = filterDrawsByLimit(marketDraws, periodFilter);
  const latestDraw = marketDraws[marketDraws.length - 1];

  // Refresh helper
  const refreshAllState = () => {
    const mList = loadMarkets();
    setMarkets(mList);
    const dList = loadDraws(activeMarketId);
    setMarketDraws(dList);
    setPosConfig(loadPositionConfig(activeMarketId));
    setIndicatorWeights(loadIndicatorWeights());
  };

  // 1. Add single draw (with duplicate check)
  const handleAddDraw = (drawData: Omit<DrawRecord, 'id' | 'createdAt'>): { success: boolean; message: string } => {
    const cleanNum = drawData.number.padStart(4, '0').slice(-4);

    // Duplicate check on period
    const duplicate = marketDraws.find(d => d.period.trim() === drawData.period.trim());
    if (duplicate) {
      return {
        success: false,
        message: `Peringatan: Periode P-${drawData.period} sudah terdaftar dengan angka ${duplicate.number} pada tanggal ${duplicate.date}.`
      };
    }

    const newRecord: DrawRecord = {
      id: `${activeMarketId}-${drawData.period}-${Date.now()}`,
      marketId: activeMarketId,
      date: drawData.date,
      day: drawData.day,
      period: drawData.period.trim(),
      number: cleanNum,
      note: drawData.note,
      createdAt: Date.now()
    };

    const updated = [...marketDraws, newRecord];
    setMarketDraws(updated);
    saveDraws(activeMarketId, updated);
    return { success: true, message: 'Hasil angka 4D berhasil disimpan.' };
  };

  // 2. Update draw
  const handleUpdateDraw = (id: string, updated: Partial<DrawRecord>): { success: boolean; message: string } => {
    const index = marketDraws.findIndex(d => d.id === id);
    if (index === -1) return { success: false, message: 'Data tidak ditemukan.' };

    const modified = [...marketDraws];
    modified[index] = {
      ...modified[index],
      ...updated,
      number: updated.number ? updated.number.padStart(4, '0').slice(-4) : modified[index].number
    };

    setMarketDraws(modified);
    saveDraws(activeMarketId, modified);
    return { success: true, message: 'Perubahan berhasil disimpan.' };
  };

  // 3. Delete draw
  const handleDeleteDraw = (id: string) => {
    const updated = marketDraws.filter(d => d.id !== id);
    setMarketDraws(updated);
    saveDraws(activeMarketId, updated);
  };

  // 4. Bulk import
  const handleBulkImport = (rawText: string) => {
    const lines = rawText.split('\n');
    let imported = 0;
    let duplicates = 0;
    let errors = 0;

    const existingPeriods = new Set(marketDraws.map(d => d.period.trim()));
    const newDraws: DrawRecord[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Extract parts by space or tab
      const parts = line.split(/[\t\s,]+/).filter(Boolean);
      if (parts.length < 3) {
        errors++;
        continue;
      }

      // Identify 4-digit number (usually last part)
      let numCandidate = parts[parts.length - 1];
      let periodCandidate = parts[parts.length - 2];
      let dateCandidate = parts[0];
      let dayCandidate = parts.length > 3 ? parts[1] : undefined;

      // Check if numCandidate is 4 digits
      if (!/^\d{4}$/.test(numCandidate)) {
        // Try searching for any 4-digit string in line
        const matches = line.match(/\b\d{4}\b/g);
        if (matches && matches.length >= 1) {
          numCandidate = matches[matches.length - 1];
        } else {
          errors++;
          continue;
        }
      }

      if (existingPeriods.has(periodCandidate)) {
        duplicates++;
        continue;
      }

      existingPeriods.add(periodCandidate);
      newDraws.push({
        id: `${activeMarketId}-${periodCandidate}-${Date.now()}-${imported}`,
        marketId: activeMarketId,
        date: dateCandidate,
        day: dayCandidate,
        period: periodCandidate,
        number: numCandidate,
        createdAt: Date.now() + imported
      });
      imported++;
    }

    if (newDraws.length > 0) {
      const updated = [...marketDraws, ...newDraws];
      setMarketDraws(updated);
      saveDraws(activeMarketId, updated);
    }

    return { imported, duplicates, errors };
  };

  // 5. Reset market data to initial
  const handleResetCurrentMarketData = () => {
    const initial = getInitialDraws(activeMarketId);
    setMarketDraws(initial);
    saveDraws(activeMarketId, initial);
  };

  // 6. Reset all data
  const handleResetAllData = () => {
    resetDatabaseToInitial();
    refreshAllState();
  };

  // 7. Update Position Config
  const handleUpdatePosConfig = (newConfig: PositionConfig) => {
    setPosConfig(newConfig);
    savePositionConfig(activeMarketId, newConfig);
  };

  // 8. Update Indicator Weights
  const handleUpdateWeights = (newWeights: IndicatorWeights) => {
    setIndicatorWeights(newWeights);
    saveIndicatorWeights(newWeights);
  };

  // 9. Update Markets list
  const handleUpdateMarkets = (newMarkets: Market[]) => {
    setMarkets(newMarkets);
    saveMarkets(newMarkets);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError('');
    setQuickSuccess('');

    if (!/^\d{4}$/.test(quickNumber.trim())) {
      setQuickError('Angka harus terdiri dari 4 digit tepat (0000 - 9999).');
      return;
    }

    if (!quickPeriod.trim()) {
      setQuickError('Nomor periode harus diisi.');
      return;
    }

    const res = handleAddDraw({
      marketId: activeMarketId,
      date: quickDate,
      day: quickDay,
      period: quickPeriod.trim(),
      number: quickNumber.trim(),
      note: quickNote
    });

    if (res.success) {
      setQuickSuccess(res.message);
      setQuickNumber('');
      setQuickPeriod((parseInt(quickPeriod, 10) + 1).toString() || '');
      setTimeout(() => {
        setIsQuickAddOpen(false);
        setQuickSuccess('');
      }, 1000);
    } else {
      setQuickError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Responsive Sidebar */}
      <Sidebar
        markets={markets}
        activeMarketId={activeMarketId}
        onSelectMarket={(id) => setActiveMarketId(id)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        drawCount={marketDraws.length}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header
          currentMarket={currentMarket}
          latestDraw={latestDraw}
          periodFilter={periodFilter}
          onFilterChange={(val) => setPeriodFilter(val)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddModal={() => {
            const lastPer = latestDraw ? parseInt(latestDraw.period, 10) : 1000;
            setQuickPeriod((lastPer + 1).toString());
            setQuickNumber('');
            setQuickError('');
            setQuickSuccess('');
            setIsQuickAddOpen(true);
          }}
          onPrint={handlePrint}
          onResetSeedData={handleResetCurrentMarketData}
          totalDraws={marketDraws.length}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              draws={filteredDraws}
              allDraws={marketDraws}
              currentMarket={currentMarket}
              posConfig={posConfig}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddModal={() => setIsQuickAddOpen(true)}
            />
          )}

          {activeTab === 'data-history' && (
            <DataHistory
              currentMarket={currentMarket}
              draws={marketDraws}
              onAddDraw={handleAddDraw}
              onUpdateDraw={handleUpdateDraw}
              onDeleteDraw={handleDeleteDraw}
              onBulkImport={handleBulkImport}
              onResetMarketData={handleResetCurrentMarketData}
            />
          )}

          {activeTab === 'frequency' && (
            <FrequencyAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'hot-cold' && (
            <HotColdAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'overdue' && (
            <OverdueAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'position' && (
            <PositionAnalysis
              allDraws={marketDraws}
              posConfig={posConfig}
              onUpdatePosConfig={handleUpdatePosConfig}
            />
          )}

          {activeTab === 'pair' && (
            <PairAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'mistik-index' && (
            <MistikIndexAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'digit-sum' && (
            <DigitSumAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'parity-size' && (
            <ParitySizeAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'recency' && (
            <RecencyWeightingAnalysis allDraws={marketDraws} />
          )}

          {activeTab === 'backtest' && (
            <BacktestingView allDraws={marketDraws} weights={indicatorWeights} />
          )}

          {activeTab === 'composite' && (
            <CompositePrediction
              draws={filteredDraws}
              weights={indicatorWeights}
              onUpdateWeights={handleUpdateWeights}
              posConfig={posConfig}
            />
          )}

          {activeTab === 'reports' && (
            <VisualizationReports
              currentMarket={currentMarket}
              draws={filteredDraws}
              posConfig={posConfig}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              markets={markets}
              currentMarket={currentMarket}
              onUpdateMarkets={handleUpdateMarkets}
              posConfig={posConfig}
              onUpdatePosConfig={handleUpdatePosConfig}
              weights={indicatorWeights}
              onUpdateWeights={handleUpdateWeights}
              onResetAllData={handleResetAllData}
              onResetCurrentMarketData={handleResetCurrentMarketData}
              onRefreshAll={refreshAllState}
            />
          )}
        </main>
      </div>

      {/* Quick Add Result Global Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Input Cepat Hasil 4D - {currentMarket.name}</span>
              </h3>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="mt-4 space-y-4">
              {quickError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{quickError}</span>
                </div>
              )}
              {quickSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{quickSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal:
                  </label>
                  <input
                    type="text"
                    required
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hari:
                  </label>
                  <input
                    type="text"
                    value={quickDay}
                    onChange={(e) => setQuickDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Periode:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2166"
                    value={quickPeriod}
                    onChange={(e) => setQuickPeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Angka 4D:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="9887"
                    value={quickNumber}
                    onChange={(e) => setQuickNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full bg-slate-950 border-2 border-emerald-500 rounded-lg px-3 py-2 text-base text-center font-mono font-black text-white tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Putaran 1 / malam"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Simpan Hasil 4D
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
