import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  X,
  Copy,
  Check,
  Sparkles,
  Wifi,
  ShieldCheck,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const { isInstallable, isInstalled, isAndroid, promptInstall } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showToast('Link aplikasi berhasil disalin!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        showToast('Instalasi aplikasi dimulai di Android!', 'success');
        onClose();
      } else if (outcome === 'dismissed') {
        showToast('Instalasi dibatalkan oleh pengguna.', 'info');
      } else {
        showToast('Gunakan petunjuk menu titik tiga di browser untuk instalasi.', 'info');
      }
    } catch {
      showToast('Gagal memicu instalasi otomatis. Ikuti panduan manual di bawah.', 'error');
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Android Styling */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="App Icon"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-semibold text-emerald-100 mb-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                <span>PWA WebAPK Android</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Instal di HP Android</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Gunakan aplikasi tanpa browser, cepat, offline, & tersinkronisasi Cloud
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status or Direct Install CTA */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Aplikasi Sudah Terinstal</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Aplikasi ini sudah terpasang di perangkat Anda dan dapat diakses langsung dari Beranda layar utama atau App Drawer.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">Perangkat Mendukung Instalasi Langsung</h4>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Ketuk tombol di bawah untuk memasang Sistem Penilaian Siswa langsung ke layar utama Android Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? 'Memproses Instalasi...' : 'Instal Aplikasi Android Sekarang'}</span>
              </button>
            </div>
          ) : null}

          {/* Key Advantages of Android PWA */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-1.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-800 text-xs">Layar Penuh</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Bebas address bar</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-800 text-xs">Bisa Offline</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Service worker cache</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-800 text-xs">Cloud Sync</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sinkron HP & Laptop</div>
            </div>
          </div>

          {/* Cara Pasang di Android (Langkah demi langkah) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Cara Memasang di Google Chrome Android</h4>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-900">Buka di Browser Google Chrome Android</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Salin link aplikasi ini atau buka URL di HP Android Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-900">Ketuk Menu Titik Tiga (⋮)</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Ada di sudut kanan atas browser Chrome Android Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-900">Pilih &quot;Tambahkan ke Layar Utama&quot; atau &quot;Instal Aplikasi&quot;</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Chrome akan membuat paket Android WebAPK resmi berlogo Sistem Penilaian Siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="text-slate-900">Selesai! Buka Layar Utama HP</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Aplikasi sekarang dapat dibuka seperti aplikasi Android biasa langsung dari beranda telepon Anda!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bagikan Link ke HP Android */}
          <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                Buka Link di HP Android Anda
              </span>
              <span className="text-[10px] text-slate-500">
                {isAndroid ? 'Terdeteksi perangkat Android' : 'Buka dari ponsel'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-700 select-all focus:outline-hidden"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Versi PWA WebAPK Aktif</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
