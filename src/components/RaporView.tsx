import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  User,
  CheckCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import {
  Siswa,
  Kelas,
  Mapel,
  NilaiSiswa,
  AbsensiRecord,
  ProfilSekolah,
  ProfilGuru,
  Semester,
} from '../types';

interface RaporViewProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  mapelList: Mapel[];
  nilaiList: NilaiSiswa[];
  absensiList: AbsensiRecord[];
  sekolah: ProfilSekolah;
  guru: ProfilGuru;
  selectedTahunAjaran: string;
  selectedSemester: Semester;
  selectedKelasId: string;
  selectedMapelId: string;
  showToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const RaporView: React.FC<RaporViewProps> = ({
  siswaList,
  kelasList,
  mapelList,
  nilaiList,
  absensiList,
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

  const activeStudents = useMemo(() => {
    return siswaList.filter((s) => s.kelasId === selectedKelasId && s.status === 'Aktif');
  }, [siswaList, selectedKelasId]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(activeStudents[0]?.id || '');
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');

  // Find attendance summary for a given student
  const getStudentAttendance = (siswaId: string) => {
    const studentRecs = absensiList.filter(
      (a) =>
        a.siswaId === siswaId &&
        a.kelasId === selectedKelasId &&
        a.tahunAjaran === selectedTahunAjaran &&
        a.semester === selectedSemester
    );

    const sakit = studentRecs.filter((a) => a.status === 'Sakit').length;
    const ijin = studentRecs.filter((a) => a.status === 'Ijin').length;
    const alpa = studentRecs.filter((a) => a.status === 'Alpa').length;
    const bolos = studentRecs.filter((a) => a.status === 'Bolos').length;
    const hadir = studentRecs.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;
    const total = studentRecs.length;
    const persentase = total > 0 ? Math.round((hadir / total) * 100) : 100;

    return { sakit, ijin, alpa, bolos, persentase };
  };

  // Render a single student F4 report card
  const renderSingleReportCard = (siswa: Siswa) => {
    const grade = nilaiList.find(
      (n) =>
        n.siswaId === siswa.id &&
        n.kelasId === selectedKelasId &&
        n.mapelId === selectedMapelId &&
        n.tahunAjaran === selectedTahunAjaran &&
        n.semester === selectedSemester
    );

    const att = getStudentAttendance(siswa.id);
    const kktp = currentMapel?.kktp || 75;
    const na = grade?.nilaiAkhir ?? 0;
    const predikat = grade?.predikat ?? 'D';
    const isTuntas = na >= kktp;

    const kelakuan = grade?.kelakuan || {
      kedisiplinan: 'A',
      tanggungJawab: 'A',
      kejujuran: 'A',
      kerjasama: 'B',
      kesopanan: 'A',
      deskripsi: 'Menunjukkan integritas dan etika yang sangat baik dalam kegiatan pembelajaran.',
    };

    return (
      <div
        key={siswa.id}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs print:border-none print:shadow-none print:p-0 page-break f4-sheet max-w-[850px] mx-auto text-slate-900"
      >
        {/* KOP SURAT RESMI SEKOLAH */}
        <div className="border-b-2 border-slate-900 pb-3 mb-5">
          <div className="flex items-center justify-between gap-4 text-center">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {sekolah.logoPendidikan && (
                <img
                  src={sekolah.logoPendidikan}
                  alt="Logo Tut Wuri"
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
        </div>

        {/* JUDUL RAPOR */}
        <div className="text-center mb-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 underline">
            LAPORAN HASIL PENILAIAN CAPAIAN BELAJAR SISWA (RAPOR)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Semester {selectedSemester} ({selectedSemester === '1' ? 'Ganjil' : 'Genap'}) Tahun Ajaran{' '}
            {selectedTahunAjaran}
          </p>
        </div>

        {/* IDENTITAS SISWA (Requirement 25) */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex">
            <span className="w-28 text-slate-500">Nama Siswa</span>
            <span className="font-bold text-slate-900">: {siswa.nama}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-slate-500">Kelas</span>
            <span className="font-bold text-slate-900">: {currentKelas?.namaKelas}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-slate-500">NIS / NISN</span>
            <span className="font-mono font-bold text-slate-900">
              : {siswa.nis} / {siswa.nisn || '-'}
            </span>
          </div>
          <div className="flex">
            <span className="w-28 text-slate-500">Fase / Tingkat</span>
            <span className="font-medium text-slate-800">: Fase {currentKelas?.tingkat === 'X' ? 'E' : 'F'}</span>
          </div>
        </div>

        {/* TABEL NILAI CAPAIAN PEMBELAJARAN (Requirement 25) */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            A. Capaian Kompetensi Akademik
          </h4>
          <table className="w-full text-xs text-left border-collapse border border-slate-400">
            <thead className="bg-slate-100 font-bold border-b border-slate-400">
              <tr>
                <th className="py-2 px-3 border border-slate-400 w-10 text-center">No</th>
                <th className="py-2 px-3 border border-slate-400">Mata Pelajaran</th>
                <th className="py-2 px-2 border border-slate-400 text-center w-16">KKTP</th>
                <th className="py-2 px-2 border border-slate-400 text-center w-20">Nilai Angka</th>
                <th className="py-2 px-2 border border-slate-400 text-center w-16">Predikat</th>
                <th className="py-2 px-3 border border-slate-400 text-center w-28">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2.5 px-3 border border-slate-400 text-center font-mono">1</td>
                <td className="py-2.5 px-3 border border-slate-400 font-bold">{currentMapel?.namaMapel}</td>
                <td className="py-2.5 px-2 border border-slate-400 text-center font-mono font-bold">{kktp}</td>
                <td className="py-2.5 px-2 border border-slate-400 text-center font-mono font-extrabold text-sm text-indigo-900">
                  {na}
                </td>
                <td className="py-2.5 px-2 border border-slate-400 text-center font-bold">{predikat}</td>
                <td className="py-2.5 px-3 border border-slate-400 text-center font-semibold">
                  <span className={isTuntas ? 'text-emerald-700' : 'text-rose-600'}>
                    {isTuntas ? 'Tuntas' : 'Perlu Remedial'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CATATAN GURU PENGAMPU (Requirement 19 & 25) */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
            B. Catatan Perkembangan Belajar Siswa
          </h4>
          <div className="p-3 border border-slate-400 rounded-lg text-xs leading-relaxed min-h-[60px] bg-slate-50/50">
            {grade?.catatan ? (
              <p className="italic text-slate-800">"{grade.catatan}"</p>
            ) : (
              <p className="text-slate-400 italic">
                Siswa menunjukkan perkembangan belajar yang teratur. Pertahankan semangat dan terus tingkatkan
                pemahaman konsep materi.
              </p>
            )}
          </div>
        </div>

        {/* PENILAIAN KARAKTER & KELAKUAN (Requirement 20 & 25) */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            C. Perkembangan Karakter & Sikap
          </h4>
          <table className="w-full text-xs text-left border-collapse border border-slate-400">
            <thead className="bg-slate-100 font-bold border-b border-slate-400">
              <tr>
                <th className="py-2 px-3 border border-slate-400">Aspek Sikap / Karakter</th>
                <th className="py-2 px-2 border border-slate-400 text-center w-24">Predikat</th>
                <th className="py-2 px-3 border border-slate-400">Deskripsi Pengamatan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 px-3 border border-slate-400">1. Kedisiplinan</td>
                <td className="py-1.5 px-2 border border-slate-400 text-center font-bold">
                  {kelakuan.kedisiplinan}
                </td>
                <td className="py-1.5 px-3 border border-slate-400" rowSpan={5}>
                  <p className="leading-relaxed text-slate-700">
                    {kelakuan.deskripsi ||
                      'Menunjukkan sikap santun, kedisiplinan belajar yang konsisten, serta mampu bekerjasama secara harmonis dengan teman sebaya.'}
                  </p>
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 border border-slate-400">2. Tanggung Jawab</td>
                <td className="py-1.5 px-2 border border-slate-400 text-center font-bold">
                  {kelakuan.tanggungJawab}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 border border-slate-400">3. Kejujuran</td>
                <td className="py-1.5 px-2 border border-slate-400 text-center font-bold">{kelakuan.kejujuran}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 border border-slate-400">4. Kerjasama</td>
                <td className="py-1.5 px-2 border border-slate-400 text-center font-bold">{kelakuan.kerjasama}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 border border-slate-400">5. Kesopanan</td>
                <td className="py-1.5 px-2 border border-slate-400 text-center font-bold">{kelakuan.kesopanan}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* REKAPITULASI PRESENSI KEHADIRAN (Requirement 25) */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            D. Rekapitulasi Presensi Kehadiran
          </h4>
          <table className="w-full text-xs text-left border-collapse border border-slate-400">
            <thead className="bg-slate-100 font-bold border-b border-slate-400">
              <tr>
                <th className="py-2 px-3 border border-slate-400 text-center">Sakit (S)</th>
                <th className="py-2 px-3 border border-slate-400 text-center">Ijin (I)</th>
                <th className="py-2 px-3 border border-slate-400 text-center">Tanpa Keterangan / Alpa (A)</th>
                <th className="py-2 px-3 border border-slate-400 text-center">Bolos (B)</th>
                <th className="py-2 px-3 border border-slate-400 text-center">Persentase Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3 border border-slate-400 text-center font-mono font-bold">
                  {att.sakit} hari
                </td>
                <td className="py-2 px-3 border border-slate-400 text-center font-mono font-bold">{att.ijin} hari</td>
                <td className="py-2 px-3 border border-slate-400 text-center font-mono font-bold text-rose-700">
                  {att.alpa} hari
                </td>
                <td className="py-2 px-3 border border-slate-400 text-center font-mono font-bold text-purple-700">
                  {att.bolos} hari
                </td>
                <td className="py-2 px-3 border border-slate-400 text-center font-mono font-extrabold text-sm text-indigo-700">
                  {att.persentase}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN RESMI TIGA KOLOM (Requirement 25) */}
        <div className="mt-8 pt-4 grid grid-cols-3 text-center text-xs text-slate-900 gap-4">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Orang Tua / Wali Siswa</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">{siswa.ayah || siswa.ibu || '( ................................... )'}</p>
          </div>

          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala {sekolah.namaSekolah}</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">{sekolah.kepalaSekolah}</p>
            <p className="font-mono text-[10px]">NIP. {sekolah.nipKepala || '-'}</p>
          </div>

          <div>
            <p>
              {sekolah.kecamatan || 'Dongkala'},{' '}
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-semibold">Guru Pengampu Mata Pelajaran</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">{guru.nama}</p>
            <p className="font-mono text-[10px]">NIP. {guru.nip || '-'}</p>
          </div>
        </div>
      </div>
    );
  };

  const currentSelectedStudent = activeStudents.find((s) => s.id === selectedStudentId) || activeStudents[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Action Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cetak Lembar Rapor Siswa (Format F4)</h2>
          <p className="text-xs text-slate-500">
            Laporan lengkap capaian pembelajaran, karakter, rekapitulasi kehadiran, dan legalitas tanda tangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPrintMode('single')}
              className={`px-3 py-1.5 rounded-lg transition ${
                printMode === 'single' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Per Siswa
            </button>
            <button
              onClick={() => setPrintMode('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                printMode === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Semua Siswa ({activeStudents.length})
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{printMode === 'single' ? 'Cetak Rapor Siswa Ini' : 'Cetak Rapor 1 Kelas (F4)'}</span>
          </button>
        </div>
      </div>

      {/* Student Selector Bar for Single Mode */}
      {printMode === 'single' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">Pilih Siswa:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl outline-none font-bold text-slate-900 bg-white"
            >
              {activeStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nis} - {s.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const curIdx = activeStudents.findIndex((s) => s.id === selectedStudentId);
                if (curIdx > 0) setSelectedStudentId(activeStudents[curIdx - 1].id);
              }}
              disabled={activeStudents.findIndex((s) => s.id === selectedStudentId) <= 0}
              className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={() => {
                const curIdx = activeStudents.findIndex((s) => s.id === selectedStudentId);
                if (curIdx < activeStudents.length - 1) setSelectedStudentId(activeStudents[curIdx + 1].id);
              }}
              disabled={activeStudents.findIndex((s) => s.id === selectedStudentId) >= activeStudents.length - 1}
              className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Render Area */}
      {printMode === 'single' ? (
        currentSelectedStudent ? (
          renderSingleReportCard(currentSelectedStudent)
        ) : (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            Belum ada siswa di kelas ini.
          </div>
        )
      ) : (
        <div className="space-y-8">
          {activeStudents.map((s) => renderSingleReportCard(s))}
        </div>
      )}
    </div>
  );
};
