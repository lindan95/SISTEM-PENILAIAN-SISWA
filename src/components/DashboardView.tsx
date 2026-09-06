import React, { useState, useMemo } from 'react';
import {
  Users,
  Layers,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Eye,
  X,
  Clock,
  Award,
} from 'lucide-react';
import {
  SiswaBermasalahItem,
  ActiveMenu,
  Guru,
  Sekolah,
  TahunAjaran,
  Kelas,
  Mapel,
  Siswa,
  AbsensiRecord,
  NilaiSiswa,
  AppSettings,
} from '../types';

export interface DashboardViewProps {
  guru?: Guru;
  sekolah?: Sekolah;
  tahunAjaranList?: TahunAjaran[];
  kelasList?: Kelas[];
  mapelList?: Mapel[];
  siswaList?: Siswa[];
  absensiList?: AbsensiRecord[];
  nilaiList?: NilaiSiswa[];
  settings?: AppSettings;
  selectedTahunAjaran?: string;
  selectedSemester?: string;
  selectedKelasId?: string;
  selectedMapelId?: string;
  onNavigate: (menu: ActiveMenu) => void;
  showToast?: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;

  // Optional precalculated props
  totalSiswa?: number;
  totalKelas?: number;
  totalMapel?: number;
  rekapData?: {
    siswa: { id: string; nis: string; nama: string };
    nilaiKehadiran: number;
    nilaiTugas: number;
    nilaiFormatif: number;
    nilaiSumatif: number;
    nilaiPAS: number;
    nilaiAkhir: number;
    kktp: number;
    hadir: number;
    alpa: number;
    bolos: number;
    terlambat: number;
    ijin: number;
    sakit: number;
  }[];
  siswaBermasalah?: SiswaBermasalahItem[];
  selectedKelasNama?: string;
  selectedMapelNama?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kelasList = [],
  mapelList = [],
  siswaList = [],
  absensiList = [],
  nilaiList = [],
  settings,
  selectedTahunAjaran = '2026/2027',
  selectedSemester = '1',
  selectedKelasId = '',
  selectedMapelId = '',
  onNavigate,
  totalSiswa,
  totalKelas,
  totalMapel,
  rekapData,
  siswaBermasalah,
  selectedKelasNama,
  selectedMapelNama,
}) => {
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<SiswaBermasalahItem | null>(null);

  const activeKelas = kelasList.find((k) => k.id === selectedKelasId);
  const activeMapel = mapelList.find((m) => m.id === selectedMapelId);

  const resolvedKelasNama = selectedKelasNama || activeKelas?.namaKelas || 'Semua Kelas';
  const resolvedMapelNama = selectedMapelNama || activeMapel?.namaMapel || 'Semua Mapel';
  const resolvedTotalSiswa = totalSiswa !== undefined ? totalSiswa : siswaList.filter((s) => s.status === 'Aktif').length;
  const resolvedTotalKelas = totalKelas !== undefined ? totalKelas : kelasList.length;
  const resolvedTotalMapel = totalMapel !== undefined ? totalMapel : mapelList.length;

  // Derive rekapData if not explicitly provided
  const computedRekapData = useMemo(() => {
    if (rekapData && Array.isArray(rekapData)) return rekapData;

    const targetStudents = selectedKelasId
      ? siswaList.filter((s) => s.kelasId === selectedKelasId && s.status === 'Aktif')
      : siswaList.filter((s) => s.status === 'Aktif');

    return targetStudents.map((s) => {
      const studentAbs = absensiList.filter(
        (a) =>
          a.siswaId === s.id &&
          (!selectedKelasId || a.kelasId === selectedKelasId) &&
          (!selectedMapelId || a.mapelId === selectedMapelId) &&
          a.tahunAjaran === selectedTahunAjaran &&
          a.semester === selectedSemester
      );

      const hadir = studentAbs.filter((a) => a.status === 'Hadir').length;
      const alpa = studentAbs.filter((a) => a.status === 'Alpa').length;
      const bolos = studentAbs.filter((a) => a.status === 'Bolos').length;
      const terlambat = studentAbs.filter((a) => a.status === 'Terlambat').length;
      const ijin = studentAbs.filter((a) => a.status === 'Ijin').length;
      const sakit = studentAbs.filter((a) => a.status === 'Sakit').length;

      const grade = nilaiList.find(
        (n) =>
          n.siswaId === s.id &&
          (!selectedKelasId || n.kelasId === selectedKelasId) &&
          (!selectedMapelId || n.mapelId === selectedMapelId) &&
          n.tahunAjaran === selectedTahunAjaran &&
          n.semester === selectedSemester
      );

      return {
        siswa: { id: s.id, nis: s.nis, nama: s.nama },
        nilaiKehadiran: studentAbs.length > 0 ? Math.round((hadir / studentAbs.length) * 100) : 100,
        nilaiTugas: grade?.rataTugas || 0,
        nilaiFormatif: grade?.rataFormatif || 0,
        nilaiSumatif: grade?.rataSumatifLm || 0,
        nilaiPAS: grade?.sumatifAkhir || 0,
        nilaiAkhir: grade?.nilaiAkhir || 0,
        kktp: settings?.kktpDefault || 75,
        hadir,
        alpa,
        bolos,
        terlambat,
        ijin,
        sakit,
      };
    });
  }, [rekapData, siswaList, absensiList, nilaiList, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester, settings]);

  // Derive siswaBermasalah if not explicitly provided
  const computedSiswaBermasalah: SiswaBermasalahItem[] = useMemo(() => {
    if (siswaBermasalah && Array.isArray(siswaBermasalah)) return siswaBermasalah;

    const kktp = settings?.kktpDefault || 75;
    const bAlpa = settings?.batasAlpa || 3;
    const bBolos = settings?.batasBolos || 2;
    const bTerlambat = settings?.batasTerlambat || 3;

    return computedRekapData
      .map((r) => {
        const studentObj = siswaList.find((s) => s.id === r.siswa.id);
        if (!studentObj) return null;

        const kNama = kelasList.find((k) => k.id === studentObj.kelasId)?.namaKelas || resolvedKelasNama;
        const masalahList: string[] = [];
        if (r.alpa >= bAlpa) masalahList.push(`Alpa ${r.alpa} hari (Batas: ${bAlpa})`);
        if (r.bolos >= bBolos) masalahList.push(`Bolos ${r.bolos} kali (Batas: ${bBolos})`);
        if (r.terlambat >= bTerlambat) masalahList.push(`Terlambat ${r.terlambat} kali (Batas: ${bTerlambat})`);
        if (r.nilaiAkhir > 0 && r.nilaiAkhir < kktp) {
          masalahList.push(`Nilai Akhir ${r.nilaiAkhir} di bawah KKTP (${kktp})`);
        }

        let status: 'Aman' | 'Perlu Perhatian' | 'Bermasalah' = 'Aman';
        if (r.alpa >= bAlpa + 2 || r.bolos >= bBolos + 1 || masalahList.length >= 2) {
          status = 'Bermasalah';
        } else if (masalahList.length > 0) {
          status = 'Perlu Perhatian';
        }

        return {
          siswa: studentObj,
          kelasNama: kNama,
          alpa: r.alpa,
          bolos: r.bolos,
          terlambat: r.terlambat,
          ijin: r.ijin,
          sakit: r.sakit,
          hadir: r.hadir,
          totalPertemuan: r.hadir + r.ijin + r.sakit + r.terlambat + r.alpa + r.bolos,
          nilaiAkhir: r.nilaiAkhir,
          nilaiTugas: r.nilaiTugas,
          nilaiFormatif: r.nilaiFormatif,
          nilaiSumatif: r.nilaiSumatif,
          nilaiKelakuan: 85,
          kktp,
          masalahList,
          status,
        };
      })
      .filter((item): item is SiswaBermasalahItem => item !== null)
      .filter((item) => item.status !== 'Aman');
  }, [siswaBermasalah, computedRekapData, siswaList, settings, kelasList, resolvedKelasNama, selectedKelasId, selectedTahunAjaran]);

  const actualRekap = computedRekapData || [];
  const actualSiswaBermasalah = computedSiswaBermasalah || [];

  // Compute attendance aggregates safely
  const totalHadir = actualRekap.reduce((acc, r) => acc + (r.hadir || 0), 0);
  const totalIjin = actualRekap.reduce((acc, r) => acc + (r.ijin || 0), 0);
  const totalSakit = actualRekap.reduce((acc, r) => acc + (r.sakit || 0), 0);
  const totalTerlambat = actualRekap.reduce((acc, r) => acc + (r.terlambat || 0), 0);
  const totalAlpa = actualRekap.reduce((acc, r) => acc + (r.alpa || 0), 0);
  const totalBolos = actualRekap.reduce((acc, r) => acc + (r.bolos || 0), 0);

  const grandTotalAbsensi = totalHadir + totalIjin + totalSakit + totalTerlambat + totalAlpa + totalBolos;
  const attendanceRate = grandTotalAbsensi > 0 ? Math.round((totalHadir / grandTotalAbsensi) * 100) : 100;

  // Compute grade averages safely
  const validGrades = actualRekap.filter((r) => r.nilaiAkhir > 0);
  const avgNilaiAkhir = validGrades.length > 0
    ? (validGrades.reduce((acc, r) => acc + r.nilaiAkhir, 0) / validGrades.length).toFixed(1)
    : '0.0';

  const avgTugas = validGrades.length > 0
    ? (validGrades.reduce((acc, r) => acc + r.nilaiTugas, 0) / validGrades.length).toFixed(1)
    : '0.0';

  const avgFormatif = validGrades.length > 0
    ? (validGrades.reduce((acc, r) => acc + r.nilaiFormatif, 0) / validGrades.length).toFixed(1)
    : '0.0';

  const avgSumatif = validGrades.length > 0
    ? (validGrades.reduce((acc, r) => acc + r.nilaiSumatif, 0) / validGrades.length).toFixed(1)
    : '0.0';

  const avgPAS = validGrades.length > 0
    ? (validGrades.reduce((acc, r) => acc + r.nilaiPAS, 0) / validGrades.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Banner Context Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-indigo-700/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Tahun Ajaran {selectedTahunAjaran} • Semester {selectedSemester}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 tracking-tight">
              Selamat Datang di Sistem Penilaian Siswa
            </h2>
            <p className="text-sm text-indigo-200/90 mt-1 max-w-2xl leading-relaxed">
              Konteks aktif: <span className="font-semibold text-white">{resolvedKelasNama}</span> —{' '}
              <span className="font-semibold text-white">{resolvedMapelNama}</span>. Seluruh data absensi,
              evaluasi formatif, sumatif, dan rekap otomatis tersinkronisasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('absensi')}
              className="px-3.5 py-2 rounded-xl bg-white text-indigo-950 font-semibold text-xs hover:bg-indigo-50 transition shadow-sm flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              Input Absensi
            </button>
            <button
              onClick={() => onNavigate('penilaian-tugas')}
              className="px-3.5 py-2 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 font-semibold text-xs text-white border border-indigo-400/30 transition flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-indigo-300" />
              Input Nilai
            </button>
            <button
              onClick={() => onNavigate('rekap-nilai')}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-950 font-semibold text-xs text-white border border-indigo-600/50 transition flex items-center gap-1.5"
            >
              Rekap Nilai
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Siswa</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{resolvedTotalSiswa}</p>
          <span className="text-[11px] text-slate-400 font-medium">Siswa terdaftar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Kelas</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{resolvedTotalKelas}</p>
          <span className="text-[11px] text-slate-400 font-medium">Rombongan belajar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mata Pelajaran</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{resolvedTotalMapel}</p>
          <span className="text-[11px] text-slate-400 font-medium">Mapel diampu</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kehadiran</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{attendanceRate}%</p>
          <span className="text-[11px] text-slate-400 font-medium">Rata-rata kelas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rata-rata Nilai</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{avgNilaiAkhir}</p>
          <span className="text-[11px] text-slate-400 font-medium">Nilai Akhir Kelas</span>
        </div>

        <div
          onClick={() => onNavigate('siswa-bermasalah')}
          className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-2xs cursor-pointer hover:bg-rose-100/70 transition"
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Perlu Perhatian</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{actualSiswaBermasalah.length}</p>
          <span className="text-[11px] text-rose-500/80 font-medium">Lihat detail siswa &rarr;</span>
        </div>
      </div>

      {/* Visual Analytics Grid: Attendance Breakdown & Grade Component Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance Statistics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Grafik Status Kehadiran Siswa</h3>
              <p className="text-xs text-slate-500">Distribusi seluruh pertemuan di kelas ini</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">
              Total: {grandTotalAbsensi} Entri
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">Hadir</span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                  H
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{totalHadir}</p>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${grandTotalAbsensi > 0 ? (totalHadir / grandTotalAbsensi) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800">Ijin</span>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                  I
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">{totalIjin}</p>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${grandTotalAbsensi > 0 ? (totalIjin / grandTotalAbsensi) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800">Sakit</span>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                  S
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-1">{totalSakit}</p>
              <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-1.5 rounded-full"
                  style={{ width: `${grandTotalAbsensi > 0 ? (totalSakit / grandTotalAbsensi) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-800">Terlambat</span>
                <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100/80 px-1.5 py-0.5 rounded">
                  T
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-700 mt-1">{totalTerlambat}</p>
              <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-orange-600 h-1.5 rounded-full"
                  style={{ width: `${grandTotalAbsensi > 0 ? (totalTerlambat / grandTotalAbsensi) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800">Alpa</span>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded">
                  A
                </span>
              </div>
              <p className="text-2xl font-bold text-rose-700 mt-1">{totalAlpa}</p>
              <div className="w-full bg-rose-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-rose-600 h-1.5 rounded-full"
                  style={{ width: `${grandTotalAbsensi > 0 ? (totalAlpa / grandTotalAbsensi) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-800">Bolos</span>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded">
                  B
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-1">{totalBolos}</p>
              <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-1.5 rounded-full"
                  style={{ width: `${grandTotalAbsensi > 0 ? (totalBolos / grandTotalAbsensi) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grade Averages Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Rata-Rata Komponen Penilaian</h3>
              <p className="text-xs text-slate-500">Nilai tengah evaluasi kelas saat ini</p>
            </div>
            <button
              onClick={() => onNavigate('rekap-nilai')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Lihat Rekap &rarr;
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Rata-rata Tugas (1..N)</span>
                <span className="text-indigo-600 font-mono">{avgTugas} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Number(avgTugas))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Rata-rata Asesmen Formatif</span>
                <span className="text-teal-600 font-mono">{avgFormatif} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Number(avgFormatif))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Rata-rata Asesmen Sumatif</span>
                <span className="text-amber-600 font-mono">{avgSumatif} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Number(avgSumatif))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Penilaian Akhir Semester (PAS)</span>
                <span className="text-purple-600 font-mono">{avgPAS} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Number(avgPAS))}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Nilai Akhir Rata-Rata</span>
              <span className="font-bold text-sm text-indigo-700 font-mono bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                {avgNilaiAkhir}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5 & 40: SISWA PERLU PERHATIAN / SISWA BERMASALAH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Siswa Perlu Perhatian & Bermasalah
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                  {actualSiswaBermasalah.length} Siswa
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Deteksi otomatis berdasarkan batas alpa/bolos, nilai &lt; KKTP, dan catatan sikap
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('siswa-bermasalah')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-lg border border-rose-200 transition shrink-0"
          >
            Kelola Tindak Lanjut &rarr;
          </button>
        </div>

        {actualSiswaBermasalah.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700 text-sm">Semua Siswa dalam Kondisi Aman</p>
            <p className="text-xs text-slate-400 mt-1">
              Tidak ada siswa yang melebihi batas alpa/bolos atau memiliki nilai di bawah kriteria KKTP saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Indikator Masalah</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {actualSiswaBermasalah.map((item, idx) => {
                  const isSevere = item.status === 'Bermasalah';
                  return (
                    <tr key={item.siswa.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-medium">{item.siswa.nis}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.siswa.nama}</td>
                      <td className="py-3 px-4 font-medium text-slate-600">{item.kelasNama}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.masalahList.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                                m.includes('Alpa') || m.includes('Bolos')
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isSevere
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedStudentDetail(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: DETAIL SISWA BERMASALAH (Requirements 5 & 40) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Detail Evaluasi Siswa</h3>
                <p className="text-xs text-slate-500 font-mono">NIS: {selectedStudentDetail.siswa.nis}</p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Profile Card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shrink-0">
                  {selectedStudentDetail.siswa.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedStudentDetail.siswa.nama}</h4>
                  <p className="text-slate-500">
                    Kelas {selectedStudentDetail.kelasNama} • NISN: {selectedStudentDetail.siswa.nisn || '-'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    No HP Orang Tua: {selectedStudentDetail.siswa.noHpOrangTua || '-'}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <p className="font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Status: {selectedStudentDetail.status}
                </p>
                <ul className="mt-1.5 space-y-1 list-disc list-inside text-rose-700">
                  {selectedStudentDetail.masalahList.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              {/* Attendance Matrix */}
              <div>
                <h5 className="font-bold text-slate-800 mb-2">Riwayat Presensi</h5>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Hadir</p>
                    <p className="font-bold text-emerald-600 text-sm">{selectedStudentDetail.hadir}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Terlambat</p>
                    <p className="font-bold text-orange-600 text-sm">{selectedStudentDetail.terlambat}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Alpa</p>
                    <p className="font-bold text-rose-600 text-sm">{selectedStudentDetail.alpa}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Bolos</p>
                    <p className="font-bold text-purple-600 text-sm">{selectedStudentDetail.bolos}</p>
                  </div>
                </div>
              </div>

              {/* Academic Performance */}
              <div>
                <h5 className="font-bold text-slate-800 mb-2">Pencapaian Nilai</h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Tugas</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedStudentDetail.nilaiTugas}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Formatif</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedStudentDetail.nilaiFormatif}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px]">Sumatif</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedStudentDetail.nilaiSumatif}</p>
                  </div>
                </div>
                <div className="mt-2 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-900">Nilai Akhir Terkalkulasi</span>
                    <p className="text-[11px] text-slate-500">KKTP Target: {selectedStudentDetail.kktp}</p>
                  </div>
                  <span className="text-lg font-bold font-mono text-indigo-700">
                    {selectedStudentDetail.nilaiAkhir}
                  </span>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Rekomendasi Tindak Lanjut Guru:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Lakukan pemanggilan orang tua, berikan bimbingan khusus atau modul remedial untuk menuntaskan materi
                  formatif dan sumatif yang belum mencapai KKTP.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
