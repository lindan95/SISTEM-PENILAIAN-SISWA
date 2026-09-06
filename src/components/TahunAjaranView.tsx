import React, { useState } from 'react';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  Archive,
  Clock,
  Copy,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { TahunAjaran, Semester } from '../types';

interface TahunAjaranViewProps {
  list: TahunAjaran[];
  onSetActive: (id: string) => void;
  onSave: (ta: TahunAjaran) => void;
  onCreateNewAcademicYear: (
    tahunBaru: string,
    semester: Semester,
    salinKelas: boolean,
    salinSiswa: boolean,
    salinMapel: boolean
  ) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const TahunAjaranView: React.FC<TahunAjaranViewProps> = ({
  list,
  onSetActive,
  onSave,
  onCreateNewAcademicYear,
  showToast,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tahunBaru, setTahunBaru] = useState('2027/2028');
  const [semesterBaru, setSemesterBaru] = useState<Semester>('1');
  const [salinKelas, setSalinKelas] = useState(true);
  const [salinSiswa, setSalinSiswa] = useState(true);
  const [salinMapel, setSalinMapel] = useState(true);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tahunBaru.trim()) {
      showToast('Tahun ajaran baru tidak boleh kosong', 'warning');
      return;
    }
    onCreateNewAcademicYear(tahunBaru, semesterBaru, salinKelas, salinSiswa, salinMapel);
    setShowModal(false);
    showToast(`Tahun ajaran ${tahunBaru} (${semesterBaru}) berhasil dibuat dan diaktifkan!`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Tahun Ajaran & Semester</h2>
          <p className="text-xs text-slate-500">
            Aplikasi mendukung penggunaan berkesinambungan multi-tahun tanpa menghapus atau mencampur data lama.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Tahun Ajaran Baru</span>
        </button>
      </div>

      {/* Safety Notice Box (Requirement 3 & 47) */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 space-y-1">
          <p className="font-bold">Prinsip Keamanan & Isolasi Data Multi-Tahun:</p>
          <p className="text-indigo-900/90 leading-relaxed">
            Data penilaian, absensi harian, dan rapor semester terdahulu <strong>tersimpan permanen</strong> dan
            tidak pernah ditimpa. Ketika Anda berpindah konteks tahun ajaran melalui menu navigasi, sistem secara
            otomatis hanya menyajikan data yang relevan dengan tahun dan semester tersebut.
          </p>
        </div>
      </div>

      {/* Table of Academic Years */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Daftar Periode Akademik Tersimpan</h3>
          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            {list.length} Periode
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Tahun Ajaran</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Periode Mulai - Selesai</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {list.map((item, idx) => {
                const isAktif = item.status === 'Aktif';
                return (
                  <tr key={item.id} className={isAktif ? 'bg-indigo-50/40 font-medium' : 'hover:bg-slate-50/60'}>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.tahunAjaran}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">
                        Semester {item.semester} ({item.semester === '1' ? 'Ganjil' : 'Genap'})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.tanggalMulai || '-'} s/d {item.tanggalSelesai || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isAktif
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.status === 'Arsip'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAktif && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!isAktif && (
                        <button
                          onClick={() => {
                            onSetActive(item.id);
                            showToast(`Tahun ajaran ${item.tahunAjaran} Semester ${item.semester} diaktifkan.`, 'success');
                          }}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition"
                        >
                          Aktifkan
                        </button>
                      )}
                      {item.status !== 'Arsip' && (
                        <button
                          onClick={() => {
                            onSave({ ...item, status: 'Arsip' });
                            showToast(`Periode ${item.tahunAjaran} diarsipkan.`, 'info');
                          }}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                          title="Arsipkan"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: BUAT TAHUN AJARAN BARU */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Buat Tahun Ajaran Baru</h3>
                  <p className="text-xs text-slate-500">Membuka periode akademik baru tanpa merusak data lama</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateNew} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Format Tahun Ajaran Baru *</label>
                <input
                  type="text"
                  value={tahunBaru}
                  onChange={(e) => setTahunBaru(e.target.value)}
                  required
                  placeholder="Contoh: 2027/2028"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Gunakan format 4 digit garis miring 4 digit (2027/2028)</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Semester Awal</label>
                <select
                  value={semesterBaru}
                  onChange={(e) => setSemesterBaru(e.target.value as Semester)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                >
                  <option value="1">Semester 1 (Ganjil)</option>
                  <option value="2">Semester 2 (Genap)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-indigo-600" />
                  Opsi Duplikasi Struktur Master (Bebas Input Ulang):
                </p>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={salinKelas}
                    onChange={(e) => setSalinKelas(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span className="text-slate-700">Salin Data Rombel / Kelas dari tahun sebelumnya</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={salinSiswa}
                    onChange={(e) => setSalinSiswa(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span className="text-slate-700">Salin Data Siswa Aktif ke periode baru</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={salinMapel}
                    onChange={(e) => setSalinMapel(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span className="text-slate-700">Salin Relasi Mata Pelajaran ke periode baru</span>
                </label>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Catatan Penting:</strong> Nilai tugas, formatif, sumatif, catatan, kelakuan, dan absensi periode
                lama <strong>TIDAK AKAN IKUT TERCAMPUR</strong> ke tahun ajaran baru. Nilai dan absensi periode baru akan
                dimulai dari lembar kosong yang bersih.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  Buat Periode Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
