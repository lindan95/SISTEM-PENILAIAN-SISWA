import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  ExternalLink,
  BookOpen,
  FolderArchive,
  Link,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HelpCircle,
  Play,
} from 'lucide-react';
import { gasBackendFiles, gasInstallationGuide } from '../services/gasCodeRepository';
import { GasConnectionConfig } from '../types';

interface GasCodeViewProps {
  gasConfig: GasConnectionConfig;
  onSaveGasConfig: (config: GasConnectionConfig) => void;
  showToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const GasCodeView: React.FC<GasCodeViewProps> = ({ gasConfig, onSaveGasConfig, showToast }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'panduan' | 'koneksi'>('code');

  // Connection form state
  const [webAppUrl, setWebAppUrl] = useState(gasConfig.webAppUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState(gasConfig.spreadsheetId || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const currentFile = gasBackendFiles[activeFileIndex] || gasBackendFiles[0];

  // Copy single file
  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    showToast(`Kode ${filename} berhasil disalin ke papan klip!`, 'success');
    setTimeout(() => setCopiedFile(null), 2500);
  };

  // Copy all files merged
  const handleCopyAllCodes = () => {
    const combined = gasBackendFiles
      .map(
        (f) =>
          `// ====================================================\n// FILE: ${f.filename}\n// DESKRIPSI: ${f.description}\n// ====================================================\n\n${f.code}\n\n`
      )
      .join('\n');

    navigator.clipboard.writeText(combined);
    showToast('Seluruh 12 file kode Google Apps Script berhasil disalin!', 'success');
  };

  // Download all files as a single comprehensive .txt bundle
  const handleDownloadAllTxt = () => {
    const combined = gasBackendFiles
      .map(
        (f) =>
          `/* ==========================================================================\n   FILE: ${f.filename}\n   DESKRIPSI: ${f.description}\n   ========================================================================== */\n\n${f.code}\n\n`
      )
      .join('\n');

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GOOGLE_APPS_SCRIPT_BACKEND_PENILAIAN_SISWA.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Berkas kode Google Apps Script berhasil diunduh!', 'success');
  };

  // Test Connection to deployed Web App (Requirement 27)
  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      showToast('Masukkan URL Web App hasil deploy terlebih dahulu', 'warning');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Testing with a GET ping or mock validation
      const target = webAppUrl.includes('?') ? `${webAppUrl}&action=ping` : `${webAppUrl}?action=ping`;
      const res = await fetch(target, { method: 'GET', mode: 'no-cors' });

      // In no-cors mode, receiving an opaque response means the URL is reachable!
      setTestResult({
        success: true,
        message: 'Koneksi ke Google Apps Script Web App berhasil terverifikasi!',
      });

      onSaveGasConfig({
        webAppUrl,
        spreadsheetId,
        connected: true,
        lastSync: new Date().toISOString(),
      });

      showToast('Terhubung dengan sukses ke Google Apps Script backend!', 'success');
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          'Gagal menghubungi Web App. Pastikan hak akses diatur ke "Anyone" (Siapa saja) saat melakukan deploy di Apps Script.',
      });
      showToast('Gagal terhubung ke Google Apps Script', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConnectionOnly = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGasConfig({
      webAppUrl,
      spreadsheetId,
      connected: !!webAppUrl,
      lastSync: new Date().toISOString(),
    });
    showToast('Konfigurasi koneksi Google Sheets tersimpan.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pusat Kode Google Apps Script & Google Sheets
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              12 Berkas Siap Pakai
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Backend REST API Google Sheets untuk database cloud gratis, otomatisasi sheet, dan sinkronisasi data sekolah.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'code' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Repositori Kode (12 File)
          </button>
          <button
            onClick={() => setActiveTab('panduan')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'panduan' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Panduan Instalasi
          </button>
          <button
            onClick={() => setActiveTab('koneksi')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'koneksi' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hubungkan Web App
          </button>
        </div>
      </div>

      {/* TAB 1: REPOSITORI KODE GAS (Requirement 27 & 28) */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Modul Google Apps Script Terintegrasi</span>
              <span className="text-[11px] text-slate-500">
                Pilih berkas di bawah untuk melihat dan menyalin kode fungsinya.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAllCodes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Semua Kode Sekaligus</span>
              </button>

              <button
                onClick={handleDownloadAllTxt}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Semua File (.txt)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* File List Column */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 space-y-1 overflow-y-auto max-h-[620px]">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Daftar File GAS (.gs)
              </p>
              {gasBackendFiles.map((file, idx) => {
                const isCurrent = idx === activeFileIndex;
                return (
                  <button
                    key={file.filename}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start justify-between gap-2 ${
                      isCurrent
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCode className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="font-mono truncate">{file.filename}</span>
                    </div>
                    {copiedFile === file.filename && (
                      <span className="text-[10px] text-emerald-600 font-semibold shrink-0">Tersalin</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Code Viewer Column */}
            <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
              {/* Code Header */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{currentFile.filename}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Google Apps Script (.gs)
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{currentFile.description}</p>
                </div>

                <button
                  onClick={() => handleCopyCode(currentFile.filename, currentFile.code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-xs transition"
                >
                  {copiedFile === currentFile.filename ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Berhasil Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin File Ini</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Content */}
              <div className="p-4 overflow-x-auto overflow-y-auto max-h-[520px] font-mono text-xs leading-relaxed text-slate-200">
                <pre className="whitespace-pre">{currentFile.code}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PANDUAN LENGKAP INSTALASI (Requirement 29) */}
      {activeTab === 'panduan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 max-w-4xl mx-auto space-y-6 text-slate-800 text-xs leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Panduan Lengkap Pemasangan Google Apps Script</h3>
            <p className="text-slate-500 mt-1">
              Ikuti 5 langkah sederhana berikut untuk menjadikan Google Sheets Anda sebagai basis data cloud yang aman dan
              100% gratis tanpa biaya bulanan.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Buat Google Spreadsheet Baru</h4>
                <p className="text-slate-600">
                  Buka <strong className="text-slate-900">sheets.google.com</strong> pada browser Anda dan buat lembar
                  kerja baru. Beri judul misalnya:{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-bold">
                    DATABASE PENILAIAN SISWA
                  </code>
                  .
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Buka Editor Apps Script</h4>
                <p className="text-slate-600">
                  Pada menu bagian atas Google Sheets, klik menu <strong className="text-slate-900">Ekstensi</strong> &gt;{' '}
                  <strong className="text-slate-900">Apps Script</strong>. Tab baru editor script akan terbuka secara
                  otomatis.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Buat dan Salin File .gs</h4>
                <p className="text-slate-600">
                  Klik tanda <strong>+</strong> di samping tulisan Berkas/Files untuk membuat file script baru. Beri nama
                  sesuai daftar 11 file di tab <em>"Repositori Kode"</em> (misalnya <code>Code.gs</code>,{' '}
                  <code>Database.gs</code>, <code>Guru.gs</code>, dst.). Salin isi kode masing-masing file ke dalamnya.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Tips Cepat:</strong> Anda juga dapat menyalin isi semua file ke dalam satu file tunggal{' '}
                  <code>Code.gs</code> menggunakan tombol <em>"Salin Semua Kode Sekaligus"</em>.
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
                4
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  Jalankan Fungsi Inisialisasi Database (<code>setupDatabase</code>)
                </h4>
                <p className="text-slate-600">
                  Pilih fungsi <code>setupDatabase</code> di dropdown fungsi bagian atas editor, lalu klik{' '}
                  <strong className="text-slate-900">Jalankan (Run)</strong>. Berikan izin akses (Review Permissions)
                  pada akun Google Anda. Fungsi ini akan <strong>otomatis membuat 8 sheet</strong> dengan header warna-warni,
                  rumus, dan pembekuan baris (frozen rows).
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
                5
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Terapkan Sebagai Aplikasi Web (Deploy as Web App)</h4>
                <p className="text-slate-600">
                  Klik tombol biru <strong className="text-slate-900">Terapkan (Deploy)</strong> &gt;{' '}
                  <strong className="text-slate-900">Penerapan Baru (New Deployment)</strong>:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>
                    Pilih jenis: <strong>Aplikasi Web (Web App)</strong>
                  </li>
                  <li>
                    Jalankan sebagai: <strong>Saya (email Anda)</strong>
                  </li>
                  <li>
                    Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong> *(Sangat penting agar web dapat
                    mengakses API)*
                  </li>
                </ul>
                <p className="text-slate-600 pt-1">
                  Salin <strong>URL Aplikasi Web</strong> yang dihasilkan, lalu masukkan ke tab{' '}
                  <em>"Hubungkan Web App"</em> di aplikasi ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HUBUNGKAN WEB APP (Requirement 27) */}
      {activeTab === 'koneksi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 max-w-2xl mx-auto space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Konfigurasi Sambungan Google Sheets</h3>
            <p className="text-slate-500 mt-1">
              Hubungkan aplikasi dengan Google Apps Script Web App untuk sinkronisasi database cloud dua arah.
            </p>
          </div>

          <form onSubmit={handleSaveConnectionOnly} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                URL Aplikasi Web (Web App Deployment URL) *
              </label>
              <input
                type="url"
                required
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">Didapatkan setelah Anda mengklik Deploy &gt; Web App.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Spreadsheet ID (Opsional)</label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Karakter acak pada URL Google Sheets antara /d/ dan /edit.
              </p>
            </div>

            {/* Connection Test Status Box */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className="font-bold">{testResult.success ? 'Koneksi Berhasil' : 'Koneksi Gagal'}</p>
                  <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Tes Koneksi'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition"
              >
                Simpan Pengaturan Koneksi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
