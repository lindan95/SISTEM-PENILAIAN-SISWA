import React, { useState } from 'react';
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Database,
  ShieldAlert,
  CheckCircle2,
  HardDrive,
  FileJson,
} from 'lucide-react';
import { AppSettings } from '../types';
import { StorageService } from '../services/storageService';

interface BackupPengaturanViewProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onResetAllData: () => void;
  onRestoreJson: (jsonData: any) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const BackupPengaturanView: React.FC<BackupPengaturanViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onRestoreJson,
  showToast,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });

  // Handle settings form save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    showToast('Pengaturan aplikasi berhasil disimpan!', 'success');
  };

  // Download Backup JSON (Requirement 38)
  const handleExportBackup = () => {
    const data = StorageService.exportAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BACKUP_SISTEM_PENILAIAN_SISWA_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File backup database JSON berhasil diunduh!', 'success');
  };

  // Restore JSON (Requirement 38)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (!json.siswa || !json.tahunAjaran) {
          showToast('Format file backup tidak valid atau rusak.', 'error');
          return;
        }

        if (confirm('Apakah Anda yakin ingin memulihkan (restore) data dari file ini? Data yang ada akan ditimpa.')) {
          onRestoreJson(json);
          showToast('Data sistem berhasil dipulihkan dari backup JSON!', 'success');
        }
      } catch (err) {
        showToast('Gagal memproses file JSON. Pastikan file tidak rusak.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Danger Reset
  const handleDangerReset = () => {
    const confirmation = prompt('Ketik "HAPUS SEMUA" untuk mengonfirmasi reset data aplikasi ke kondisi awal pabrik:');
    if (confirmation === 'HAPUS SEMUA') {
      onResetAllData();
      showToast('Semua data berhasil direset ke pengaturan awal pabrik.', 'info');
    } else {
      showToast('Reset dibatalkan.', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem & Pencadangan Data</h2>
        <p className="text-xs text-slate-500">
          Kelola parameter umum aplikasi, ekspor backup database JSON, serta pemulihan data.
        </p>
      </div>

      {/* SECTION 1: PENGATURAN UMUM & AMBANG BATAS (Requirement 37) */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Ambang Batas & Parameter Akademik</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Versi Aplikasi 2.0</span>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standar KKTP / KKM Default</label>
            <input
              type="number"
              min="50"
              max="100"
              value={formData.kktpDefault}
              onChange={(e) => setFormData({ ...formData, kktpDefault: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Batas Alpa Tanpa Peringatan (Hari)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.batasAlpa}
              onChange={(e) => setFormData({ ...formData, batasAlpa: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Batas Bolos Tanpa Peringatan (Hari)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.batasBolos}
              onChange={(e) => setFormData({ ...formData, batasBolos: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Batas Terlambat Tanpa Peringatan (Hari)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.batasTerlambat}
              onChange={(e) => setFormData({ ...formData, batasTerlambat: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Persentase Minimal Kehadiran (%)</label>
            <input
              type="number"
              min="50"
              max="100"
              value={formData.batasPersentaseKehadiran}
              onChange={(e) => setFormData({ ...formData, batasPersentaseKehadiran: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Format Kertas Cetak Rapor Resmi</label>
            <select
              value={formData.formatKertas}
              onChange={(e) => setFormData({ ...formData, formatKertas: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-semibold text-slate-800"
            >
              <option value="F4">F4 / Folio (215 x 330 mm) - Standar Kedinasan</option>
              <option value="A4">A4 (210 x 297 mm)</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* SECTION 2: BACKUP & RESTORE DATA JSON (Requirement 38) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Pencadangan & Pemulihan Database (Backup & Restore)</h3>
            <p className="text-slate-500 text-[11px]">
              Unduh salinan data lokal Anda ke file JSON atau pulihkan data dari file backup sebelumnya.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="font-bold text-slate-900">Download Salinan Data (Backup JSON)</h4>
                <p className="text-[11px] text-slate-500">Mencakup profil guru, sekolah, siswa, nilai, dan absensi.</p>
              </div>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Backup Sekarang</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="font-bold text-slate-900">Pulihkan Data (Restore JSON)</h4>
                <p className="text-[11px] text-slate-500">Impor file JSON yang pernah Anda unduh sebelumnya.</p>
              </div>
            </div>
            <label className="w-full px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Pilih File Backup JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3: DANGER ZONE (RESET DATA) (Requirement 37) */}
      <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-3 text-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-900 text-sm">Zona Bahaya: Reset Database Aplikasi</h4>
            <p className="text-rose-800/90 leading-relaxed text-[11px]">
              Tindakan ini akan mengembalikan seluruh database lokal ke data bawaan awal. Seluruh data siswa, nilai,
              absensi, dan kelas yang pernah Anda tambahkan akan terhapus jika belum dibackup.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDangerReset}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data ke Pengaturan Pabrik</span>
          </button>
        </div>
      </div>
    </div>
  );
};
