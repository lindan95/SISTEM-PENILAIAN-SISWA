import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudUpload,
  CloudDownload,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  LogIn,
  X,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  onSyncToCloud: () => Promise<void>;
  onPullFromCloud: () => Promise<void>;
  lastSyncTime: string | null;
  isSyncing: boolean;
  totalStats: {
    siswa: number;
    kelas: number;
    mapel: number;
    nilai: number;
    absensi: number;
    refleksi: number;
  };
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onSyncToCloud,
  onPullFromCloud,
  lastSyncTime,
  isSyncing,
  totalStats,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = async (name: string, fn: () => Promise<void>) => {
    try {
      setActionLoading(name);
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Sinkronisasi Cloud Antar Perangkat</h3>
              <p className="text-xs text-indigo-100">Buka dan lanjutkan data di HP, Laptop, atau PC lain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white/90"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Akun Cloud */}
          {currentUser ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-11 h-11 rounded-full border-2 border-emerald-400 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {currentUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                      Cloud Aktif & Terhubung
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {currentUser.displayName || 'Guru Pengampu'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => handleAction('logout', onLogout)}
                disabled={actionLoading !== null}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1 shrink-0"
                title="Keluar dari akun ini"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Belum Masuk dengan Akun Google</h4>
                  <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                    Untuk membuka data lama di HP, laptop, atau komputer lain, masuk dengan Akun Google Anda. Data akan
                    otomatis tersimpan aman di cloud.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAction('login', onLogin)}
                disabled={actionLoading !== null}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {actionLoading === 'login' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Masuk dengan Akun Google</span>
              </button>
            </div>
          )}

          {/* Panduan Buka di Perangkat Lain */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Cara Membuka Data di Perangkat Baru:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">1. Di Perangkat Lama</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Klik tombol <b>"Kirim/Sinkronkan ke Cloud"</b> di bawah agar data terbaru terunggah.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">2. Di Perangkat Baru</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Buka alamat web aplikasi, lalu <b>Login dengan Akun Google yang sama</b>. Data langsung terbuka!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Data yang Akan Tersinkron */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Rekap Data Tersinkron:
              </span>
              <span className="text-[11px] text-slate-500">
                Terakhir: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('id-ID') : 'Belum pernah'}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-base font-bold text-indigo-600">{totalStats.siswa}</p>
                <p className="text-[10px] text-slate-500 font-medium">Siswa</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-base font-bold text-indigo-600">{totalStats.kelas}</p>
                <p className="text-[10px] text-slate-500 font-medium">Kelas</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-base font-bold text-indigo-600">{totalStats.mapel}</p>
                <p className="text-[10px] text-slate-500 font-medium">Mapel</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-base font-bold text-indigo-600">{totalStats.nilai}</p>
                <p className="text-[10px] text-slate-500 font-medium">Nilai</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-base font-bold text-indigo-600">{totalStats.absensi}</p>
                <p className="text-[10px] text-slate-500 font-medium">Absensi</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-base font-bold text-indigo-600">{totalStats.refleksi}</p>
                <p className="text-[10px] text-slate-500 font-medium">Refleksi</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => handleAction('sync', onSyncToCloud)}
              disabled={!currentUser || isSyncing || actionLoading !== null}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition ${
                currentUser
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {actionLoading === 'sync' || isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              <span>Kirim / Simpan Data Sekarang ke Cloud</span>
            </button>

            <button
              onClick={() => handleAction('pull', onPullFromCloud)}
              disabled={!currentUser || isSyncing || actionLoading !== null}
              className={`w-full py-2.5 px-4 rounded-2xl font-semibold text-xs border flex items-center justify-center gap-2 transition ${
                currentUser
                  ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50/70 active:bg-indigo-100 cursor-pointer'
                  : 'border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {actionLoading === 'pull' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CloudDownload className="w-4 h-4" />
              )}
              <span>Tarik / Muat Data dari Cloud ke Perangkat Ini</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dilindungi Firestore Security Rules & Google OAuth 2.0</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
