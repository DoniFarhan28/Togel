import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  Hash,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import { DrawRecord, Market } from '../types/lottery';

interface DataHistoryProps {
  currentMarket: Market;
  draws: DrawRecord[];
  onAddDraw: (draw: Omit<DrawRecord, 'id' | 'createdAt'>) => { success: boolean; message: string };
  onUpdateDraw: (id: string, updated: Partial<DrawRecord>) => { success: boolean; message: string };
  onDeleteDraw: (id: string) => void;
  onBulkImport: (rawText: string) => { imported: number; duplicates: number; errors: number };
  onResetMarketData: () => void;
}

export const DataHistory: React.FC<DataHistoryProps> = ({
  currentMarket,
  draws,
  onAddDraw,
  onUpdateDraw,
  onDeleteDraw,
  onBulkImport,
  onResetMarketData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // default newest first

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingDraw, setEditingDraw] = useState<DrawRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Single form states
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    day: 'Senin',
    period: '',
    number: '',
    note: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Bulk input state
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState<{ imported: number; duplicates: number; errors: number } | null>(null);

  // Filtered draws
  const filteredDraws = draws.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.period.toLowerCase().includes(q) ||
      d.number.includes(q) ||
      d.date.toLowerCase().includes(q) ||
      (d.day && d.day.toLowerCase().includes(q)) ||
      (d.note && d.note.toLowerCase().includes(q))
    );
  });

  const sortedDraws = [...filteredDraws].sort((a, b) => {
    const pA = parseInt(a.period, 10) || 0;
    const pB = parseInt(b.period, 10) || 0;
    return sortOrder === 'desc' ? pB - pA : pA - pB;
  });

  const totalPages = Math.ceil(sortedDraws.length / pageSize) || 1;
  const paginatedDraws = sortedDraws.slice((page - 1) * pageSize, page * pageSize);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    const cleanNumber = formData.number.trim();
    if (!/^\d{4}$/.test(cleanNumber)) {
      setFormError('Angka 4D harus terdiri dari tepat 4 digit angka (0000 - 9999).');
      return;
    }

    if (!formData.period.trim()) {
      setFormError('Nomor periode pengundian harus diisi.');
      return;
    }

    if (editingDraw) {
      const res = onUpdateDraw(editingDraw.id, {
        date: formData.date,
        day: formData.day,
        period: formData.period.trim(),
        number: cleanNumber,
        note: formData.note
      });
      if (res.success) {
        setFormSuccess('Data berhasil diperbarui.');
        setTimeout(() => {
          setEditingDraw(null);
          setIsAddModalOpen(false);
        }, 800);
      } else {
        setFormError(res.message);
      }
    } else {
      const res = onAddDraw({
        marketId: currentMarket.id,
        date: formData.date,
        day: formData.day,
        period: formData.period.trim(),
        number: cleanNumber,
        note: formData.note
      });
      if (res.success) {
        setFormSuccess('Hasil angka berhasil disimpan.');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          day: 'Senin',
          period: (parseInt(formData.period, 10) + 1).toString() || '',
          number: '',
          note: ''
        });
        setTimeout(() => {
          setIsAddModalOpen(false);
          setFormSuccess('');
        }, 1000);
      } else {
        setFormError(res.message);
      }
    }
  };

  const handleOpenEdit = (draw: DrawRecord) => {
    setEditingDraw(draw);
    setFormData({
      date: draw.date,
      day: draw.day || 'Senin',
      period: draw.period,
      number: draw.number,
      note: draw.note || ''
    });
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    const res = onBulkImport(bulkText);
    setBulkResult(res);
  };

  const exportToCSV = () => {
    const headers = ['Pasaran', 'Tanggal', 'Hari', 'Periode', 'Angka_4D', 'As', 'Kop', 'Kepala', 'Ekor', 'Catatan'];
    const rows = draws.map(d => {
      const num = d.number.padStart(4, '0').slice(-4);
      return [
        `"${currentMarket.name}"`,
        `"${d.date}"`,
        `"${d.day || ''}"`,
        `"${d.period}"`,
        `"${num}"`,
        `"${num[0]}"`,
        `"${num[1]}"`,
        `"${num[2]}"`,
        `"${num[3]}"`,
        `"${d.note || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `History_${currentMarket.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tanggal, periode, 4D..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            title="Ubah Urutan"
          >
            <span>{sortOrder === 'desc' ? 'Terbaru &darr;' : 'Terlama &uarr;'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingDraw(null);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                day: 'Senin',
                period: draws.length > 0 ? (parseInt(draws[draws.length - 1].period, 10) + 1).toString() : '1001',
                number: '',
                note: ''
              });
              setFormError('');
              setFormSuccess('');
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Data 4D</span>
          </button>

          <button
            onClick={() => {
              setBulkText('');
              setBulkResult(null);
              setIsBulkModalOpen(true);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Impor Massal (Bulk)</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            title="Unduh file CSV"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Database Stats Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Menampilkan <strong className="text-white">{sortedDraws.length}</strong> hasil pengundian untuk{' '}
          <strong className="text-blue-400">{currentMarket.name}</strong>
        </div>
        <div className="flex items-center gap-2">
          <span>Baris per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Tanggal &amp; Waktu</th>
                <th className="py-3 px-4">Hari</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4 text-center">Angka 4D</th>
                <th className="py-3 px-3 text-center text-blue-400 font-mono">AS</th>
                <th className="py-3 px-3 text-center text-indigo-400 font-mono">KOP</th>
                <th className="py-3 px-3 text-center text-emerald-400 font-mono">KEPALA</th>
                <th className="py-3 px-3 text-center text-amber-400 font-mono">EKOR</th>
                <th className="py-3 px-4 text-center">2D Belakang</th>
                <th className="py-3 px-4 text-center">Jumlah Sum</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedDraws.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data hasil pengundian yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedDraws.map((d, index) => {
                  const num = d.number.padStart(4, '0').slice(-4);
                  const sum = num.split('').reduce((acc, c) => acc + (parseInt(c, 10) || 0), 0);
                  const pair2D = num.slice(2, 4);
                  const globalIdx = (page - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-400">
                        {globalIdx}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-200">
                        {d.date}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {d.day || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-400">
                        P-{d.period}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-mono font-black text-sm text-white px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-700/80 tracking-widest inline-block shadow-xs">
                          {num}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-300 bg-blue-950/20">
                        {num[0]}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-300 bg-indigo-950/20">
                        {num[1]}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-300 bg-emerald-950/20">
                        {num[2]}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-300 bg-amber-950/20">
                        {num[3]}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-400">
                        {pair2D}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-300">
                        {sum}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate">
                        {d.note || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEdit(d)}
                            className="p-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(d.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Halaman <strong className="text-white">{page}</strong> dari <strong className="text-white">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              &laquo; Awal
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-mono text-xs text-blue-400 font-bold">{page}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              Selanjutnya
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              Akhir &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* Single Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{editingDraw ? 'Edit Hasil Pengundian' : 'Input Hasil Pengundian 4D Baru'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pasaran Terpilih:
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentMarket.name} (${currentMarket.code})`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 06-11-2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hari (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Senin / Selasa dll."
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor Periode:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2166"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Angka 4D (0000 - 9999):
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="1234"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full bg-slate-950 border-2 border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-center text-white font-mono font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Catatan khusus, putaran ke-X, dll."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {editingDraw ? 'Simpan Perubahan' : 'Simpan Data 4D'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Impor Data Massal (Bulk Import) - {currentMarket.name}</span>
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-slate-400">
                Tempel data riwayat hasil pengundian dalam format tabel atau baris:
                <br />
                <code className="text-emerald-400 font-mono text-[11px]">
                  Tanggal [Hari] Periode Angka
                </code>
                <br />
                Contoh: <code className="text-slate-300 font-mono text-[11px]">06-11-2026 Jumat 2166 4589</code>
              </p>

              {bulkResult && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Berhasil diimpor: <strong>{bulkResult.imported}</strong> baris. Duplikat dilewati:{' '}
                    <strong>{bulkResult.duplicates}</strong>. Baris gagal: <strong>{bulkResult.errors}</strong>.
                  </span>
                </div>
              )}

              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Tempel baris teks di sini..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Sistem otomatis mendeteksi format tanggal, periode, dan angka 4D.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                  >
                    Proses Impor
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Konfirmasi Hapus Data</span>
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              Apakah Anda yakin ingin menghapus data pengundian ini secara permanen dari database lokal?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteDraw(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
