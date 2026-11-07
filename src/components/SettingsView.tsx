import React, { useState, useRef } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Layers,
  Save,
  ShieldAlert
} from 'lucide-react';
import { Market, PositionConfig, IndicatorWeights } from '../types/lottery';
import { exportDatabaseBackup, importDatabaseBackup } from '../utils/storage';

interface SettingsViewProps {
  markets: Market[];
  currentMarket: Market;
  onUpdateMarkets: (markets: Market[]) => void;
  posConfig: PositionConfig;
  onUpdatePosConfig: (cfg: PositionConfig) => void;
  weights: IndicatorWeights;
  onUpdateWeights: (w: IndicatorWeights) => void;
  onResetAllData: () => void;
  onResetCurrentMarketData: () => void;
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  markets,
  currentMarket,
  onUpdateMarkets,
  posConfig,
  onUpdatePosConfig,
  weights,
  onUpdateWeights,
  onResetAllData,
  onResetCurrentMarketData,
  onRefreshAll
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'backup' | 'markets' | 'position' | 'weights'>('backup');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetConfirmType, setResetConfirmType] = useState<'current' | 'all' | null>(null);

  // New market form
  const [isAddMarketOpen, setIsAddMarketOpen] = useState(false);
  const [newMarket, setNewMarket] = useState({
    name: '',
    code: '',
    schedule: '',
    color: '#3b82f6',
    description: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Database_4D_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMsg({ type: 'success', text: 'Cadangan database (backup) berhasil diunduh.' });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importDatabaseBackup(content);
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message });
        onRefreshAll();
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddNewMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarket.name || !newMarket.code) return;
    const id = newMarket.code.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
    const created: Market = {
      id,
      name: newMarket.name,
      code: newMarket.code.toUpperCase(),
      schedule: newMarket.schedule || 'Setiap Hari',
      color: newMarket.color,
      description: newMarket.description || 'Pasaran pengguna'
    };
    onUpdateMarkets([...markets, created]);
    setIsAddMarketOpen(false);
    setNewMarket({ name: '', code: '', schedule: '', color: '#3b82f6', description: '' });
    setStatusMsg({ type: 'success', text: `Pasaran ${created.name} berhasil ditambahkan.` });
  };

  const handleDeleteMarket = (marketId: string) => {
    if (markets.length <= 1) {
      setStatusMsg({ type: 'error', text: 'Tidak dapat menghapus pasaran terakhir.' });
      return;
    }
    const updated = markets.filter(m => m.id !== marketId);
    onUpdateMarkets(updated);
    setStatusMsg({ type: 'success', text: 'Pasaran berhasil dihapus.' });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            Pengaturan Aplikasi, Database Lokal, &amp; Parameter Analitik
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Konfigurasi pasaran terisolasi, manajemen backup/restore JSON, pemetaan digit posisi, dan pemulihan data asli.
        </p>

        {statusMsg && (
          <div className={`mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup &amp; Restore Database</span>
        </button>

        <button
          onClick={() => setActiveSubTab('markets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'markets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <span>Kelola Pasaran ({markets.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('position')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'position'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pemetaan Posisi As-Kop-Kep-Ek</span>
        </button>

        <button
          onClick={() => setActiveSubTab('weights')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'weights'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Bobot Analisis Default</span>
        </button>
      </div>

      {/* SubTab 1: Backup & Restore */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Backup Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Cadangkan Database (Backup JSON)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Unduh seluruh data pasaran, riwayat hasil undian 4D, konfigurasi posisi, dan parameter bobot ke dalam satu berkas cadangan JSON yang aman di komputer atau ponsel Anda.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan JSON</span>
                </button>
              </div>
            </div>

            {/* Import Restore Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Pulihkan Database (Restore JSON)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Unggah berkas JSON cadangan yang telah dibuat sebelumnya untuk mengembalikan seluruh basis data tanpa kehilangan rekam jejak.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih &amp; Unggah File JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone: Reset Actions */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Zona Bahaya: Reset Database dengan Konfirmasi</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gunakan fitur ini apabila Anda ingin mengembalikan data ke setelan awal pabrikan (seed history asli Sydney, Hongkong, Macau, Singapore).
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => setResetConfirmType('current')}
                className="px-4 py-2 bg-slate-950 border border-rose-500/40 hover:bg-rose-950/40 text-rose-300 rounded-xl text-xs font-bold transition-all"
              >
                Reset Riwayat Pasaran Ini ({currentMarket.name})
              </button>

              <button
                onClick={() => setResetConfirmType('all')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Reset Seluruh Database ke Data Asli (Semua Pasaran)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Manage Markets */}
      {activeSubTab === 'markets' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Daftar Pasaran Togel Terdaftar</h3>
              <p className="text-xs text-slate-400">
                Setiap pasaran memiliki database mandiri agar data undian tidak bercampur.
              </p>
            </div>
            <button
              onClick={() => setIsAddMarketOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pasaran Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {markets.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-10 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{m.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {m.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">{m.schedule}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {m.id === currentMarket.id && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Aktif Saat Ini
                    </span>
                  )}
                  {markets.length > 1 && (
                    <button
                      onClick={() => handleDeleteMarket(m.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                      title="Hapus Pasaran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Market Modal */}
          {isAddMarketOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-base font-bold text-white mb-3">
                  Tambah Pasaran Baru
                </h3>
                <form onSubmit={handleAddNewMarket} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nama Pasaran:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Taiwan Lotto"
                      value={newMarket.name}
                      onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Kode Singkatan:</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: TW"
                        value={newMarket.code}
                        onChange={(e) => setNewMarket({ ...newMarket, code: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Warna Label:</label>
                      <input
                        type="color"
                        value={newMarket.color}
                        onChange={(e) => setNewMarket({ ...newMarket, color: e.target.value })}
                        className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Jadwal Pengundian:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Setiap Hari - 20:45 WIB"
                      value={newMarket.schedule}
                      onChange={(e) => setNewMarket({ ...newMarket, schedule: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddMarketOpen(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                    >
                      Simpan Pasaran
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: Position Mapping */}
      {activeSubTab === 'position' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Pengaturan Pemetaan Posisi Digit (As, Kop, Kepala, Ekor)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Secara default pasaran 4D memetakan indeks [0] ke As, [1] ke Kop, [2] ke Kepala, dan [3] ke Ekor.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {(['as', 'kop', 'kepala', 'ekor'] as const).map((key) => (
              <div key={key} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                  Posisi {key}:
                </label>
                <select
                  value={posConfig[key]}
                  onChange={(e) => {
                    onUpdatePosConfig({
                      ...posConfig,
                      [key]: parseInt(e.target.value, 10)
                    });
                    setStatusMsg({ type: 'success', text: `Pemetaan posisi ${key} diperbarui.` });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value={0}>Indeks 0 (Digit 1)</option>
                  <option value={1}>Indeks 1 (Digit 2)</option>
                  <option value={2}>Indeks 2 (Digit 3)</option>
                  <option value={3}>Indeks 3 (Digit 4)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 4: Weights */}
      {activeSubTab === 'weights' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan Bobot Analisis &amp; Prediksi Default</span>
          </h3>
          <p className="text-xs text-slate-400">
            Nilai parameter ini menentukan kontribusi relatif masing-masing indikator statistik.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-300 font-semibold">Bobot Frekuensi: {weights.frequency}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.frequency}
                onChange={(e) => onUpdateWeights({ ...weights, frequency: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-300 font-semibold">Bobot Recency: {weights.recency}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.recency}
                onChange={(e) => onUpdateWeights({ ...weights, recency: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-300 font-semibold">Bobot Overdue Gap: {weights.overdue}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.overdue}
                onChange={(e) => onUpdateWeights({ ...weights, overdue: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-300 font-semibold">Bobot Posisi: {weights.positional}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.positional}
                onChange={(e) => onUpdateWeights({ ...weights, positional: Number(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset */}
      {resetConfirmType && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Konfirmasi Pemulihan Data Awal</span>
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              {resetConfirmType === 'current'
                ? `Apakah Anda yakin ingin mengatur ulang data untuk pasaran "${currentMarket.name}" ke setelan awal pabrikan?`
                : 'Apakah Anda yakin ingin menghapus data modifikasi dan mereset SELURUH pasaran ke riwayat awal bawaan sistem?'}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setResetConfirmType(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (resetConfirmType === 'current') {
                    onResetCurrentMarketData();
                    setStatusMsg({ type: 'success', text: `Riwayat pasaran ${currentMarket.name} berhasil direset.` });
                  } else {
                    onResetAllData();
                    setStatusMsg({ type: 'success', text: 'Seluruh database berhasil dipulihkan ke data asli.' });
                  }
                  setResetConfirmType(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Lanjutkan Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
