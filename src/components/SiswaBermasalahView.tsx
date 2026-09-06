import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Phone,
  MessageSquare,
  Printer,
  Download,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Siswa,
  Kelas,
  Mapel,
  NilaiSiswa,
  AbsensiRecord,
  SiswaBermasalah,
  AppSettings,
  ProfilSekolah,
  ProfilGuru,
  Semester,
} from '../types';
import { StorageService } from '../services/storageService';

interface SiswaBermasalahViewProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  mapelList: Mapel[];
  nilaiList: NilaiSiswa[];
  absensiList: AbsensiRecord[];
  settings: AppSettings;
  sekolah: ProfilSekolah;
  guru: ProfilGuru;
  selectedTahunAjaran: string;
  selectedSemester: Semester;
  selectedKelasId: string;
  selectedMapelId: string;
  onUpdateSettings: (newSettings: AppSettings) => void;
  showToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const SiswaBermasalahView: React.FC<SiswaBermasalahViewProps> = ({
  siswaList,
  kelasList,
  mapelList,
  nilaiList,
  absensiList,
  settings,
  sekolah,
  guru,
  selectedTahunAjaran,
  selectedSemester,
  selectedKelasId,
  selectedMapelId,
  onUpdateSettings,
  showToast,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<SiswaBermasalah | null>(null);

  const currentKelas = kelasList.find((k) => k.id === selectedKelasId);
  const currentMapel = mapelList.find((m) => m.id === selectedMapelId);

  // Compute problem students dynamically based on settings thresholds
  const problemStudents: SiswaBermasalah[] = useMemo(() => {
    return StorageService.detectProblemStudents(
      siswaList,
      absensiList,
      nilaiList,
      settings,
      selectedTahunAjaran,
      selectedSemester,
      selectedKelasId,
      selectedMapelId
    );
  }, [siswaList, absensiList, nilaiList, settings, selectedTahunAjaran, selectedSemester, selectedKelasId, selectedMapelId]);

  // Filtered by level
  const filteredList = useMemo(() => {
    if (filterLevel === 'ALL') return problemStudents;
    return problemStudents.filter((p) => p.level === filterLevel);
  }, [problemStudents, filterLevel]);

  // Level counts
  const countRingan = problemStudents.filter((p) => p.level === 'Ringan').length;
  const countSedang = problemStudents.filter((p) => p.level === 'Sedang').length;
  const countBerat = problemStudents.filter((p) => p.level === 'Berat').length;

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setShowSettingsModal(false);
    showToast('Batas ambang deteksi siswa bermasalah berhasil diperbarui!', 'success');
  };

  // Export Problem Students to Excel
  const handleExportExcel = () => {
    const rows = filteredList.map((item, idx) => ({
      No: idx + 1,
      NIS: item.siswa.nis,
      'Nama Siswa': item.siswa.nama,
      Kelas: currentKelas?.namaKelas || '-',
      'Level Masalah': item.level,
      'Skor Pelanggaran': item.score,
      'Total Alpa': item.alpaCount,
      'Total Bolos': item.bolosCount,
      'Total Terlambat': item.terlambatCount,
      'Persentase Kehadiran': `${item.persentaseKehadiran}%`,
      'Nilai Akhir': item.nilaiAkhir,
      'Status Nilai': item.nilaiBawahKktp ? 'Di Bawah KKTP' : 'Aman',
      'Detail Indikator Masalah': item.issues.join(' | '),
      'Nama Ortu': item.siswa.ayah || item.siswa.ibu || '-',
      'No HP Ortu': item.siswa.noHpOrangTua || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Siswa Bermasalah');
    XLSX.writeFile(wb, `Laporan_Siswa_Bermasalah_${currentKelas?.namaKelas || 'Kelas'}.xlsx`);
    showToast('Laporan siswa bermasalah berhasil diekspor ke Excel!', 'success');
  };

  // WhatsApp generator link
  const getWhatsAppLink = (item: SiswaBermasalah) => {
    const rawHp = item.siswa.noHpOrangTua || '';
    let phoneClean = rawHp.replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('0')) {
      phoneClean = '62' + phoneClean.slice(1);
    }

    const message = encodeURIComponent(
      `Yth. Bapak/Ibu Orang Tua dari ${item.siswa.nama} (Kelas ${currentKelas?.namaKelas} ${sekolah.namaSekolah}),\n\n` +
        `Kami dari pihak sekolah menginformasikan perkembangan ananda:\n` +
        item.issues.map((iss) => `• ${iss}`).join('\n') +
        `\n\nMohon kerjasama Bapak/Ibu untuk memberikan perhatian dan pendampingan lebih lanjut di rumah. Terima kasih.\n\n` +
        `Salam hormat,\n${guru.nama} (Guru Pengampu / Wali Kelas)`
    );

    return `https://wa.me/${phoneClean}?text=${message}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sistem Deteksi Siswa Bermasalah</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Otomatis & Real-time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis terpadu absensi (alpa/bolos/terlambat), nilai di bawah KKTP, dan catatan perilaku siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Atur Ambang Batas</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Severity Cards (Requirement 40) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 no-print">
        <button
          onClick={() => setFilterLevel('ALL')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterLevel === 'ALL'
              ? 'bg-indigo-50 border-indigo-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[11px] font-semibold text-slate-500">Total Siswa Terindikasi</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{problemStudents.length}</p>
          <span className="text-[10px] text-slate-500">Semua tingkat peringatan</span>
        </button>

        <button
          onClick={() => setFilterLevel('Ringan')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterLevel === 'Ringan'
              ? 'bg-amber-50 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[11px] font-semibold text-amber-700">Peringatan 1 (Ringan)</p>
          <p className="text-2xl font-extrabold text-amber-800 font-mono mt-0.5">{countRingan}</p>
          <span className="text-[10px] text-amber-600">Perlu teguran lisan</span>
        </button>

        <button
          onClick={() => setFilterLevel('Sedang')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterLevel === 'Sedang'
              ? 'bg-orange-50 border-orange-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[11px] font-semibold text-orange-700">Peringatan 2 (Sedang)</p>
          <p className="text-2xl font-extrabold text-orange-800 font-mono mt-0.5">{countSedang}</p>
          <span className="text-[10px] text-orange-600">Peringatan tertulis / Konseling</span>
        </button>

        <button
          onClick={() => setFilterLevel('Berat')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterLevel === 'Berat'
              ? 'bg-rose-50 border-rose-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[11px] font-semibold text-rose-700">Peringatan 3 (Berat)</p>
          <p className="text-2xl font-extrabold text-rose-800 font-mono mt-0.5">{countBerat}</p>
          <span className="text-[10px] text-rose-600">Panggilan Orang Tua Resmi</span>
        </button>
      </div>

      {/* Main List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden no-print">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Daftar Siswa Butuh Perhatian Khusus</h3>
            <p className="text-xs text-slate-500">
              Kelas: {currentKelas?.namaKelas} • Tahun: {selectedTahunAjaran}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {filteredList.length} Siswa Terpilih
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-20">NIS</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Lengkap</th>
                <th className="py-3 px-3 text-center w-28">Tingkat Masalah</th>
                <th className="py-3 px-4 min-w-[280px]">Rincian Pelanggaran / Indikator</th>
                <th className="py-3 px-3 text-center w-24">Nilai Akhir</th>
                <th className="py-3 px-3 text-center w-28">Orang Tua / WA</th>
                <th className="py-3 px-4 text-right min-w-[140px]">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <p className="font-semibold text-slate-700">Tidak ada siswa yang terdeteksi bermasalah!</p>
                      <p className="text-[11px] text-slate-400">Semua siswa memenuhi kriteria kehadiran dan nilai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const hasWa = !!item.siswa.noHpOrangTua;
                  return (
                    <tr key={item.siswa.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{item.siswa.nis}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.siswa.nama}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            item.level === 'Berat'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.level === 'Sedang'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {item.level === 'Berat'
                            ? 'Peringatan 3'
                            : item.level === 'Sedang'
                            ? 'Peringatan 2'
                            : 'Peringatan 1'}
                        </span>
                      </td>

                      {/* Rincian Masalah */}
                      <td className="py-3 px-4">
                        <ul className="space-y-1">
                          {item.issues.map((iss, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{iss}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.nilaiBawahKktp ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {item.nilaiAkhir}
                        </span>
                        <p className="text-[10px] text-slate-400">KKTP: {settings.kktpDefault}</p>
                      </td>

                      {/* WhatsApp Ortu */}
                      <td className="py-3 px-3 text-center">
                        {hasWa ? (
                          <a
                            href={getWhatsAppLink(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                            title={`Kirim WA ke ${item.siswa.noHpOrangTua}`}
                          >
                            <Phone className="w-3 h-3" />
                            <span>Hubungi WA</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No HP Kosong</span>
                        )}
                      </td>

                      {/* Tindakan */}
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedStudentForLetter(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Surat Peringatan</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE SURAT PERINGATAN / PANGGILAN ORANG TUA (Requirement 40) */}
      {selectedStudentForLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <h3 className="font-bold text-slate-900 text-sm">Pratinjau Surat Pemanggilan Orang Tua / Peringatan</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForLetter(null)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Content to Print */}
            <div className="p-6 border border-slate-200 rounded-xl bg-white text-slate-900 text-xs leading-relaxed space-y-4 print:border-none print:p-0">
              {/* Kop Surat */}
              <div className="border-b-2 border-slate-900 pb-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide">
                  PEMERINTAH PROVINSI {sekolah.provinsi || 'SULAWESI TENGGARA'}
                </p>
                <h2 className="text-sm font-extrabold uppercase">{sekolah.namaSekolah}</h2>
                <p className="text-[10px] text-slate-600">{sekolah.alamat} | NPSN: {sekolah.npsn}</p>
              </div>

              {/* Surat Header */}
              <div className="flex justify-between text-[11px] pt-1">
                <div>
                  <p>Nomor : 421.3 / SP / {new Date().getFullYear()}</p>
                  <p>Lamp. : -</p>
                  <p>
                    Hal :{' '}
                    <strong>
                      {selectedStudentForLetter.level === 'Berat'
                        ? 'Panggilan Orang Tua / Wali Siswa'
                        : 'Pemberitahuan Peringatan Belajar'}
                    </strong>
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    {sekolah.kecamatan}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div>
                <p>Kepada Yth.</p>
                <p className="font-bold">
                  Bapak/Ibu Orang Tua / Wali dari {selectedStudentForLetter.siswa.nama}
                </p>
                <p>di Tempat</p>
              </div>

              <p>Dengan hormat,</p>
              <p>
                Sehubungan dengan perkembangan belajar dan kedisiplinan putra/putri Bapak/Ibu di {sekolah.namaSekolah}:
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
                <p>Nama Siswa : {selectedStudentForLetter.siswa.nama}</p>
                <p>NIS / NISN : {selectedStudentForLetter.siswa.nis} / {selectedStudentForLetter.siswa.nisn || '-'}</p>
                <p>Kelas : {currentKelas?.namaKelas}</p>
              </div>

              <p>
                Berdasarkan rekapitulasi penilaian dan presensi semester ini, ananda memiliki catatan sebagai berikut:
              </p>

              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {selectedStudentForLetter.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>

              {selectedStudentForLetter.level === 'Berat' ? (
                <p>
                  Mengingat pentingnya hal tersebut demi kelangsungan pendidikan ananda, kami mengharapkan kehadiran
                  Bapak/Ibu ke sekolah untuk berkoordinasi langsung dengan Wali Kelas dan Guru Bimbingan Konseling.
                </p>
              ) : (
                <p>
                  Kami memohon kerjasama Bapak/Ibu untuk memberikan perhatian, bimbingan, dan motivasi belajar ekstra di
                  rumah agar ananda dapat memperbaiki ketuntasan kompetensi sebelum pembagian rapor semester.
                </p>
              )}

              <p>Demikian surat ini kami sampaikan. Atas perhatian dan kerjasama Bapak/Ibu, kami ucapkan terima kasih.</p>

              {/* Tanda Tangan */}
              <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs text-slate-900">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala {sekolah.namaSekolah}</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{sekolah.kepalaSekolah}</p>
                  <p className="font-mono text-[10px]">NIP. {sekolah.nipKepala || '-'}</p>
                </div>

                <div>
                  <p>Wali Kelas / Guru Pengampu</p>
                  <div className="h-16 mt-4" />
                  <p className="font-bold underline">{guru.nama}</p>
                  <p className="font-mono text-[10px]">NIP. {guru.nip || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SETTINGS THRESHOLD (Requirement 40) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Konfigurasi Parameter Deteksi Masalah</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Alpa (Maksimal Tanpa Peringatan)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.batasAlpa}
                  onChange={(e) => setLocalSettings({ ...localSettings, batasAlpa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Siswa yang alpa &gt;= {localSettings.batasAlpa} hari akan otomatis terdeteksi.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Bolos (Maksimal Tanpa Peringatan)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.batasBolos}
                  onChange={(e) => setLocalSettings({ ...localSettings, batasBolos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Terlambat (Maksimal Tanpa Peringatan)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.batasTerlambat}
                  onChange={(e) => setLocalSettings({ ...localSettings, batasTerlambat: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Minimal Kehadiran (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={localSettings.batasPersentaseKehadiran}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, batasPersentaseKehadiran: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
