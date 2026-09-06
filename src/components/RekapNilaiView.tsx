import React, { useMemo } from 'react';
import {
  Printer,
  Download,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Siswa,
  Kelas,
  Mapel,
  NilaiSiswa,
  ProfilSekolah,
  ProfilGuru,
  Semester,
} from '../types';

interface RekapNilaiViewProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  mapelList: Mapel[];
  nilaiList: NilaiSiswa[];
  sekolah: ProfilSekolah;
  guru: ProfilGuru;
  selectedTahunAjaran: string;
  selectedSemester: Semester;
  selectedKelasId: string;
  selectedMapelId: string;
  showToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const RekapNilaiView: React.FC<RekapNilaiViewProps> = ({
  siswaList,
  kelasList,
  mapelList,
  nilaiList,
  sekolah,
  guru,
  selectedTahunAjaran,
  selectedSemester,
  selectedKelasId,
  selectedMapelId,
  showToast,
}) => {
  const currentKelas = kelasList.find((k) => k.id === selectedKelasId);
  const currentMapel = mapelList.find((m) => m.id === selectedMapelId);
  const kktp = currentMapel?.kktp || 75;

  const activeStudents = useMemo(() => {
    return siswaList.filter((s) => s.kelasId === selectedKelasId && s.status === 'Aktif');
  }, [siswaList, selectedKelasId]);

  // Combine student with grade and calculate ranking
  const rekapData = useMemo(() => {
    const list = activeStudents.map((s) => {
      const rec = nilaiList.find(
        (n) =>
          n.siswaId === s.id &&
          n.kelasId === selectedKelasId &&
          n.mapelId === selectedMapelId &&
          n.tahunAjaran === selectedTahunAjaran &&
          n.semester === selectedSemester
      );

      return {
        siswa: s,
        rataTugas: rec?.rataTugas ?? 0,
        rataFormatif: rec?.rataFormatif ?? 0,
        rataSumatifLm: rec?.rataSumatifLm ?? 0,
        sumatifAkhir: rec?.sumatifAkhir ?? 0,
        nilaiAkhir: rec?.nilaiAkhir ?? 0,
        predikat: rec?.predikat ?? 'D',
        keterangan: rec?.keterangan || ((rec?.nilaiAkhir ?? 0) >= kktp ? 'Tuntas' : 'Belum Tuntas'),
        ranking: 0,
      };
    });

    // Sort by nilaiAkhir desc to assign ranking
    list.sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
    list.forEach((item, index) => {
      item.ranking = index + 1;
    });

    // Re-sort alphabetically by student name or preserve NIS order
    list.sort((a, b) => a.siswa.nama.localeCompare(b.siswa.nama));

    return list;
  }, [activeStudents, nilaiList, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester, kktp]);

  // Class Statistics (Requirement 24)
  const stats = useMemo(() => {
    if (rekapData.length === 0) {
      return {
        rataRata: 0,
        tertinggi: 0,
        terendah: 0,
        tuntas: 0,
        belumTuntas: 0,
        persentaseKetuntasan: 0,
      };
    }

    const scores = rekapData.map((d) => d.nilaiAkhir);
    const sum = scores.reduce((a, b) => a + b, 0);
    const rataRata = Math.round((sum / scores.length) * 100) / 100;
    const tertinggi = Math.max(...scores);
    const terendah = Math.min(...scores);
    const tuntas = rekapData.filter((d) => d.nilaiAkhir >= kktp).length;
    const belumTuntas = rekapData.length - tuntas;
    const persentaseKetuntasan = Math.round((tuntas / rekapData.length) * 100);

    return {
      rataRata,
      tertinggi,
      terendah,
      tuntas,
      belumTuntas,
      persentaseKetuntasan,
    };
  }, [rekapData, kktp]);

  // Export Excel
  const handleExportExcel = () => {
    const rows = rekapData.map((d, idx) => ({
      No: idx + 1,
      NIS: d.siswa.nis,
      NISN: d.siswa.nisn || '-',
      'Nama Siswa': d.siswa.nama,
      'Rata Tugas': d.rataTugas,
      'Rata Formatif': d.rataFormatif,
      'Rata Sumatif LM': d.rataSumatifLm,
      'Nilai SAS': d.sumatifAkhir,
      'Nilai Akhir (NA)': d.nilaiAkhir,
      Predikat: d.predikat,
      Ketuntasan: d.keterangan,
      Peringkat: d.ranking,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');
    XLSX.writeFile(
      wb,
      `Rekap_Nilai_${currentKelas?.namaKelas}_${currentMapel?.namaMapel}_${selectedTahunAjaran.replace('/', '-')}.xlsx`
    );
    showToast('Rekapitulasi nilai berhasil diekspor ke Excel!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rekapitulasi Nilai Rapor Kelas</h2>
          <p className="text-xs text-slate-500">
            Hasil pengolahan nilai akhir, predikat capaian, ketuntasan KKTP, dan peringkat siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap (F4 Landscape)</span>
          </button>
        </div>
      </div>

      {/* Screen Statistics Cards (Screen Only) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Rata-Rata Kelas</p>
          <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{stats.rataRata}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Nilai Tertinggi</p>
          <p className="text-lg font-extrabold text-emerald-600 font-mono mt-0.5">{stats.tertinggi}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Nilai Terendah</p>
          <p className="text-lg font-extrabold text-rose-600 font-mono mt-0.5">{stats.terendah}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Jumlah Tuntas</p>
          <p className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
            {stats.tuntas} <span className="text-xs font-normal text-slate-500">siswa</span>
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Belum Tuntas</p>
          <p className="text-lg font-extrabold text-rose-700 font-mono mt-0.5">
            {stats.belumTuntas} <span className="text-xs font-normal text-slate-500">siswa</span>
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Persentase Ketuntasan</p>
          <p className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5">{stats.persentaseKetuntasan}%</p>
        </div>
      </div>

      {/* DOCUMENT SHEET: F4 Landscape Optimized Print View (Requirement 24) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 print:border-none print:shadow-none print:p-0 print-landscape">
        {/* KOP SURAT SEKOLAH LENGKAP */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-center justify-between gap-4 text-center">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {sekolah.logoPendidikan && (
                <img
                  src={sekolah.logoPendidikan}
                  alt="Logo Pendidikan"
                  className="max-h-16 max-w-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="flex-1 space-y-0.5">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                PEMERINTAH PROVINSI {sekolah.provinsi || 'SULAWESI TENGGARA'}
              </p>
              <p className="text-xs font-bold text-slate-700 uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                {sekolah.namaSekolah}
              </h2>
              <p className="text-[11px] text-slate-600">
                {sekolah.alamat}, Desa {sekolah.desa}, Kec. {sekolah.kecamatan}, {sekolah.kabupaten}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                NPSN: {sekolah.npsn} | NSS: {sekolah.nss} | Email: {sekolah.email}
              </p>
            </div>

            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {sekolah.logoSekolah && (
                <img
                  src={sekolah.logoSekolah}
                  alt="Logo Sekolah"
                  className="max-h-16 max-w-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-400 text-center">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              REKAPITULASI PENILAIAN HASIL BELAJAR SISWA (LEMBAR RAPOR)
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-800 mt-1 font-medium">
              <span>
                Kelas: <strong>{currentKelas?.namaKelas}</strong>
              </span>
              <span>•</span>
              <span>
                Mata Pelajaran: <strong>{currentMapel?.namaMapel}</strong>
              </span>
              <span>•</span>
              <span>
                KKTP: <strong>{kktp}</strong>
              </span>
              <span>•</span>
              <span>
                Semester: <strong>{selectedSemester}</strong>
              </span>
              <span>•</span>
              <span>
                Tahun Ajaran: <strong>{selectedTahunAjaran}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tabel Rekapitulasi Rapi */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-400">
            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
              <tr>
                <th className="py-2.5 px-2 border border-slate-400 w-10 text-center">No</th>
                <th className="py-2.5 px-2 border border-slate-400 w-20">NIS</th>
                <th className="py-2.5 px-3 border border-slate-400 min-w-[180px]">Nama Lengkap Siswa</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-20">Rata Tugas</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-20">Rata Formatif</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-24">Rata Sumatif LM</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-20">Nilai SAS</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-20 bg-slate-200/80">Nilai Akhir</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-16">Predikat</th>
                <th className="py-2.5 px-3 border border-slate-400 text-center w-28">Ketuntasan</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-16 bg-amber-100/60">Peringkat</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {rekapData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-6 text-center text-slate-400">
                    Belum ada data nilai yang diinputkan untuk kelas ini.
                  </td>
                </tr>
              ) : (
                rekapData.map((d, idx) => {
                  const isTuntas = d.nilaiAkhir >= kktp;
                  return (
                    <tr key={d.siswa.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-2 border border-slate-300 font-mono text-slate-700">{d.siswa.nis}</td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold">{d.siswa.nama}</td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono">{d.rataTugas}</td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono">{d.rataFormatif}</td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono">{d.rataSumatifLm}</td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-amber-900">
                        {d.sumatifAkhir}
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono font-extrabold text-sm bg-slate-100">
                        {d.nilaiAkhir}
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-bold">{d.predikat}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-medium">
                        <span className={isTuntas ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                          {isTuntas ? 'Tuntas' : 'Belum Tuntas'}
                        </span>
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-amber-800 bg-amber-50/50">
                        #{d.ranking}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* STATISTIK KELAS RESMI (Requirement 24) */}
        <div className="mt-4 p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <span className="text-slate-500 block">Rata-Rata Kelas:</span>
            <strong className="text-slate-900 font-mono text-sm">{stats.rataRata}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Nilai Tertinggi:</span>
            <strong className="text-emerald-700 font-mono text-sm">{stats.tertinggi}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Nilai Terendah:</span>
            <strong className="text-rose-700 font-mono text-sm">{stats.terendah}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Jumlah Tuntas:</span>
            <strong className="text-emerald-700 font-mono text-sm">{stats.tuntas} Siswa</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Belum Tuntas:</span>
            <strong className="text-rose-700 font-mono text-sm">{stats.belumTuntas} Siswa</strong>
          </div>
          <div>
            <span className="text-slate-500 block">% Ketuntasan:</span>
            <strong className="text-indigo-700 font-mono text-sm">{stats.persentaseKetuntasan}%</strong>
          </div>
        </div>

        {/* Tanda Tangan Resmi (Requirement 24) */}
        <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs text-slate-900">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala {sekolah.namaSekolah}</p>
            <div className="h-20" />
            <p className="font-bold underline text-sm">{sekolah.kepalaSekolah || 'Drs. H. Syamsuddin, M.Si.'}</p>
            <p className="font-mono text-[11px]">NIP. {sekolah.nipKepala || '-'}</p>
          </div>

          <div>
            <p>
              {sekolah.kecamatan || 'Dongkala'},{' '}
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-semibold">Guru Pengampu Mata Pelajaran</p>
            <div className="h-20" />
            <p className="font-bold underline text-sm">{guru.nama}</p>
            <p className="font-mono text-[11px]">NIP. {guru.nip || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
