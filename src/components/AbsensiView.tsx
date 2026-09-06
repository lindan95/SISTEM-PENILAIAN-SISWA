import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  Save,
  RotateCcw,
  Printer,
  Download,
  Calendar,
  Layers,
  BookOpen,
  FileSpreadsheet,
  Search,
  Users,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Check,
  Filter,
  History,
  LayoutGrid,
  ExternalLink,
  X,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Siswa,
  Kelas,
  Mapel,
  AbsensiRecord,
  StatusAbsensi,
  Semester,
  ProfilSekolah,
  ProfilGuru,
} from '../types';

interface AbsensiViewProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  mapelList: Mapel[];
  absensiList: AbsensiRecord[];
  sekolah: ProfilSekolah;
  guru: ProfilGuru;
  selectedTahunAjaran: string;
  selectedSemester: Semester;
  selectedKelasId: string;
  selectedMapelId: string;
  onSaveBatch: (records: AbsensiRecord[]) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  isRekapMode?: boolean;
  onSelectMode?: (mode: 'input' | 'rekap') => void;
  onSelectKelas?: (kelasId: string) => void;
  onSelectMapel?: (mapelId: string) => void;
  onSelectSemester?: (sem: Semester) => void;
  onSelectTahunAjaran?: (ta: string) => void;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  siswaList,
  kelasList,
  mapelList,
  absensiList,
  sekolah,
  guru,
  selectedTahunAjaran,
  selectedSemester,
  selectedKelasId,
  selectedMapelId,
  onSaveBatch,
  showToast,
  isRekapMode = false,
  onSelectMode,
  onSelectKelas,
  onSelectMapel,
  onSelectSemester,
  onSelectTahunAjaran,
}) => {
  // Sync active sub tab with parent isRekapMode prop
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'rekap'>(isRekapMode ? 'rekap' : 'input');

  useEffect(() => {
    setActiveSubTab(isRekapMode ? 'rekap' : 'input');
  }, [isRekapMode]);

  const handleSubTabChange = (tab: 'input' | 'rekap') => {
    setActiveSubTab(tab);
    if (onSelectMode) {
      onSelectMode(tab);
    }
  };

  // Date input for daily attendance
  const [tanggalInput, setTanggalInput] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Search filter for student list
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Rekap sub-view mode: 'ringkasan' (cumulative totals) or 'matriks' (per date grid)
  const [rekapViewMode, setRekapViewMode] = useState<'ringkasan' | 'matriks'>('ringkasan');

  // Filter bulan for Rekap: '' means all months in the semester
  const [rekapBulanFilter, setRekapBulanFilter] = useState<string>('');

  // Print orientation & paper size state
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [paperSize, setPaperSize] = useState<'F4' | 'A4'>('F4');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Resolved current class and mapel
  const currentKelasObj = kelasList.find((k) => k.id === selectedKelasId) || kelasList[0];
  const currentMapelObj = mapelList.find((m) => m.id === selectedMapelId) || mapelList[0];

  // Active students in selected class
  const activeStudents = useMemo(() => {
    return siswaList.filter((s) => s.kelasId === selectedKelasId && s.status === 'Aktif');
  }, [siswaList, selectedKelasId]);

  // Filtered students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return activeStudents;
    const q = searchQuery.toLowerCase();
    return activeStudents.filter(
      (s) => s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)
    );
  }, [activeStudents, searchQuery]);

  // Attendance state for currently chosen date: siswaId -> { status, keterangan }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: StatusAbsensi; keterangan: string }>>({});

  // Detect whether the chosen date already has saved records
  const existingDateRecords = useMemo(() => {
    return absensiList.filter(
      (a) =>
        a.tanggal === tanggalInput &&
        a.kelasId === selectedKelasId &&
        a.mapelId === selectedMapelId &&
        a.tahunAjaran === selectedTahunAjaran &&
        a.semester === selectedSemester
    );
  }, [absensiList, tanggalInput, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester]);

  // List of all recorded dates for this class and mapel
  const recordedDates = useMemo(() => {
    const dates = absensiList
      .filter(
        (a) =>
          a.kelasId === selectedKelasId &&
          a.mapelId === selectedMapelId &&
          a.tahunAjaran === selectedTahunAjaran &&
          a.semester === selectedSemester
      )
      .map((a) => a.tanggal);

    return Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  }, [absensiList, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester]);

  // Sync attendance state when date/class/mapel changes
  useEffect(() => {
    const map: Record<string, { status: StatusAbsensi; keterangan: string }> = {};

    activeStudents.forEach((s) => {
      const rec = absensiList.find(
        (a) =>
          a.siswaId === s.id &&
          a.tanggal === tanggalInput &&
          a.kelasId === selectedKelasId &&
          a.mapelId === selectedMapelId &&
          a.tahunAjaran === selectedTahunAjaran &&
          a.semester === selectedSemester
      );

      map[s.id] = {
        status: rec ? rec.status : 'Hadir',
        keterangan: rec ? rec.keterangan : '',
      };
    });

    setAttendanceMap(map);
  }, [tanggalInput, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester, activeStudents, absensiList]);

  // Attendance status handler
  const handleStatusChange = (siswaId: string, status: StatusAbsensi) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        status,
      },
    }));
  };

  // Note handler
  const handleKeteranganChange = (siswaId: string, keterangan: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan,
      },
    }));
  };

  // Quick Action: "Semua Hadir"
  const handleMarkAllHadir = () => {
    const updated: Record<string, { status: StatusAbsensi; keterangan: string }> = {};
    activeStudents.forEach((s) => {
      updated[s.id] = {
        status: 'Hadir',
        keterangan: attendanceMap[s.id]?.keterangan || '',
      };
    });
    setAttendanceMap(updated);
    showToast('Seluruh siswa berhasil diset Hadir.', 'info');
  };

  // Quick Action: "Reset"
  const handleReset = () => {
    const updated: Record<string, { status: StatusAbsensi; keterangan: string }> = {};
    activeStudents.forEach((s) => {
      updated[s.id] = {
        status: 'Hadir',
        keterangan: '',
      };
    });
    setAttendanceMap(updated);
    showToast('Presensi direset ke kondisi awal.', 'info');
  };

  // Save batch attendance
  const handleSaveAll = () => {
    if (activeStudents.length === 0) {
      showToast('Tidak ada data siswa aktif di kelas ini.', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const recordsToSave: AbsensiRecord[] = activeStudents.map((s) => ({
      id: `abs-${tanggalInput}-${s.id}-${selectedMapelId}`,
      tanggal: tanggalInput,
      siswaId: s.id,
      kelasId: selectedKelasId,
      mapelId: selectedMapelId,
      tahunAjaran: selectedTahunAjaran,
      semester: selectedSemester,
      status: attendanceMap[s.id]?.status || 'Hadir',
      keterangan: attendanceMap[s.id]?.keterangan || '',
      createdAt: now,
      updatedAt: now,
    }));

    onSaveBatch(recordsToSave);
    showToast(`Presensi tanggal ${tanggalInput} (${recordsToSave.length} siswa) berhasil disimpan!`, 'success');
  };

  // Live count summary for current date input
  const currentSummary = useMemo(() => {
    let hadir = 0;
    let ijin = 0;
    let sakit = 0;
    let terlambat = 0;
    let alpa = 0;
    let bolos = 0;

    activeStudents.forEach((s) => {
      const st = attendanceMap[s.id]?.status || 'Hadir';
      if (st === 'Hadir') hadir++;
      else if (st === 'Ijin') ijin++;
      else if (st === 'Sakit') sakit++;
      else if (st === 'Terlambat') terlambat++;
      else if (st === 'Alpa') alpa++;
      else if (st === 'Bolos') bolos++;
    });

    const total = activeStudents.length;
    const persentase = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 0;

    return { total, hadir, ijin, sakit, terlambat, alpa, bolos, persentase };
  }, [activeStudents, attendanceMap]);

  // Relevant attendance records for Rekap
  const relevantRekapAbs = useMemo(() => {
    return absensiList.filter((a) => {
      const matchBasic =
        a.kelasId === selectedKelasId &&
        a.mapelId === selectedMapelId &&
        a.tahunAjaran === selectedTahunAjaran &&
        a.semester === selectedSemester;

      if (!matchBasic) return false;
      if (rekapBulanFilter) {
        return a.tanggal.startsWith(rekapBulanFilter);
      }
      return true;
    });
  }, [absensiList, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester, rekapBulanFilter]);

  // Unique recorded dates in ascending order
  const uniqueDates = useMemo(() => {
    const dates = relevantRekapAbs.map((a) => a.tanggal);
    return Array.from(new Set(dates)).sort();
  }, [relevantRekapAbs]);

  // Rekap summary per student
  const rekapPresensi = useMemo(() => {
    return activeStudents.map((s) => {
      const studentRecs = relevantRekapAbs.filter((a) => a.siswaId === s.id);
      const hadir = studentRecs.filter((a) => a.status === 'Hadir').length;
      const ijin = studentRecs.filter((a) => a.status === 'Ijin').length;
      const sakit = studentRecs.filter((a) => a.status === 'Sakit').length;
      const terlambat = studentRecs.filter((a) => a.status === 'Terlambat').length;
      const alpa = studentRecs.filter((a) => a.status === 'Alpa').length;
      const bolos = studentRecs.filter((a) => a.status === 'Bolos').length;

      const totalRecorded = studentRecs.length;
      const totalMeetings = Math.max(uniqueDates.length, 1);
      const persentase =
        uniqueDates.length > 0
          ? Math.min(100, Math.round(((hadir + terlambat) / totalMeetings) * 100))
          : 100;

      // Map per date for matrix view
      const dateStatusMap: Record<string, StatusAbsensi> = {};
      studentRecs.forEach((r) => {
        dateStatusMap[r.tanggal] = r.status;
      });

      return {
        siswa: s,
        hadir,
        ijin,
        sakit,
        terlambat,
        alpa,
        bolos,
        totalRecorded,
        persentase,
        dateStatusMap,
      };
    });
  }, [activeStudents, relevantRekapAbs, uniqueDates]);

  // Aggregate stats for Rekap cards
  const rekapStats = useMemo(() => {
    const totalSiswa = activeStudents.length;
    const totalPertemuan = uniqueDates.length;

    if (totalSiswa === 0 || totalPertemuan === 0) {
      return {
        totalSiswa,
        totalPertemuan,
        avgPersentase: 100,
        siswaRajin: 0,
        siswaPerhatian: 0,
      };
    }

    const avgPersentase = Math.round(
      rekapPresensi.reduce((acc, cur) => acc + cur.persentase, 0) / totalSiswa
    );

    const siswaRajin = rekapPresensi.filter((r) => r.persentase === 100).length;
    const siswaPerhatian = rekapPresensi.filter(
      (r) => r.alpa >= 3 || r.bolos >= 2 || r.persentase < 80
    ).length;

    return {
      totalSiswa,
      totalPertemuan,
      avgPersentase,
      siswaRajin,
      siswaPerhatian,
    };
  }, [activeStudents, uniqueDates, rekapPresensi]);

  // Export Rekap to Excel
  const handleExportRekapExcel = () => {
    const currentKelas = currentKelasObj?.namaKelas || 'Semua_Kelas';
    const currentMapel = currentMapelObj?.namaMapel || 'Semua_Mapel';

    const rows = rekapPresensi.map((r, idx) => ({
      No: idx + 1,
      NIS: r.siswa.nis,
      'Nama Siswa': r.siswa.nama,
      'L/P': r.siswa.jenisKelamin,
      'Total Pertemuan': uniqueDates.length,
      'Hadir (H)': r.hadir,
      'Izin (I)': r.ijin,
      'Sakit (S)': r.sakit,
      'Terlambat (T)': r.terlambat,
      'Alpa (A)': r.alpa,
      'Bolos (B)': r.bolos,
      'Persentase Kehadiran': `${r.persentase}%`,
      Keterangan:
        r.persentase >= 90
          ? 'Sangat Baik'
          : r.persentase >= 80
          ? 'Baik'
          : r.persentase >= 70
          ? 'Cukup'
          : 'Perlu Perhatian',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');
    XLSX.writeFile(
      wb,
      `Rekap_Absensi_${currentKelas.replace(/\s+/g, '_')}_${currentMapel.replace(/\s+/g, '_')}_${selectedTahunAjaran.replace('/', '-')}.xlsx`
    );
    showToast('Rekap absensi berhasil diekspor ke Excel!', 'success');
  };

  // Helper: inject dynamic print orientation styling into document head
  const applyPrintStyles = useCallback((orient: 'landscape' | 'portrait', size: 'F4' | 'A4') => {
    let existing = document.getElementById('applet-dynamic-print-style');
    if (!existing) {
      existing = document.createElement('style');
      existing.id = 'applet-dynamic-print-style';
      document.head.appendChild(existing);
    }
    const pageSizeCss =
      size === 'F4'
        ? orient === 'landscape'
          ? '330mm 215mm'
          : '215mm 330mm'
        : orient === 'landscape'
        ? '297mm 210mm'
        : '210mm 297mm';

    existing.innerHTML = `
      @page {
        size: ${pageSizeCss} !important;
        margin: ${orient === 'landscape' ? '8mm 10mm' : '10mm 12mm'} !important;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
  }, []);

  // Update print styles when orientation or paper size changes
  useEffect(() => {
    applyPrintStyles(printOrientation, paperSize);
  }, [printOrientation, paperSize, applyPrintStyles]);

  // Generate self-contained printable HTML document
  const generatePrintableHtml = useCallback(
    (orient: 'landscape' | 'portrait', size: 'F4' | 'A4') => {
      const currentKelas = currentKelasObj?.namaKelas || 'Kelas';
      const currentMapel = currentMapelObj?.namaMapel || 'Mata Pelajaran';
      const pageSizeCss =
        size === 'F4'
          ? orient === 'landscape'
            ? '330mm 215mm'
            : '215mm 330mm'
          : orient === 'landscape'
          ? '297mm 210mm'
          : '210mm 297mm';

      const tableContent =
        rekapViewMode === 'ringkasan'
          ? `
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">No</th>
                <th style="width: 80px;">NIS</th>
                <th style="text-align: left;">Nama Siswa</th>
                <th style="width: 35px; text-align: center;">L/P</th>
                <th style="width: 35px; text-align: center; background-color: #ecfdf5;">H</th>
                <th style="width: 35px; text-align: center; background-color: #eff6ff;">I</th>
                <th style="width: 35px; text-align: center; background-color: #fffbeb;">S</th>
                <th style="width: 35px; text-align: center; background-color: #fff7ed;">T</th>
                <th style="width: 35px; text-align: center; background-color: #fff1f2;">A</th>
                <th style="width: 35px; text-align: center; background-color: #faf5ff;">B</th>
                <th style="width: 65px; text-align: center;">% Kehadiran</th>
                <th style="width: 85px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rekapPresensi
                .map(
                  (r, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td style="font-family: monospace;">${r.siswa.nis}</td>
                  <td style="font-weight: 600; text-align: left;">${r.siswa.nama}</td>
                  <td style="text-align: center;">${r.siswa.jenisKelamin}</td>
                  <td style="text-align: center; font-weight: bold; color: #047857;">${r.hadir}</td>
                  <td style="text-align: center; color: #1d4ed8;">${r.ijin}</td>
                  <td style="text-align: center; color: #b45309;">${r.sakit}</td>
                  <td style="text-align: center; color: #c2410c;">${r.terlambat}</td>
                  <td style="text-align: center; font-weight: bold; color: #b91c1c;">${r.alpa}</td>
                  <td style="text-align: center; font-weight: bold; color: #7e22ce;">${r.bolos}</td>
                  <td style="text-align: center; font-weight: bold; font-family: monospace;">${r.persentase}%</td>
                  <td style="text-align: center; font-size: 8.5pt;">${
                    r.persentase >= 90
                      ? 'Sangat Baik'
                      : r.persentase >= 80
                      ? 'Baik'
                      : r.persentase >= 70
                      ? 'Cukup'
                      : 'Perlu Perhatian'
                  }</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `
          : `
          <table class="data-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 30px; text-align: center;">No</th>
                <th rowspan="2" style="width: 75px;">NIS</th>
                <th rowspan="2" style="text-align: left;">Nama Siswa</th>
                ${
                  uniqueDates.length > 0
                    ? `<th colspan="${uniqueDates.length}" style="text-align: center; background-color: #f1f5f9;">Tanggal Pertemuan</th>`
                    : '<th>Tanggal</th>'
                }
                <th rowspan="2" style="width: 30px; text-align: center; background-color: #ecfdf5;">H</th>
                <th rowspan="2" style="width: 30px; text-align: center; background-color: #fff1f2;">A</th>
                <th rowspan="2" style="width: 50px; text-align: center;">%</th>
              </tr>
              <tr>
                ${uniqueDates
                  .map(
                    (d) =>
                      `<th style="font-size: 7.5pt; padding: 2px 3px; text-align: center;">${d.slice(5)}</th>`
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${rekapPresensi
                .map(
                  (r, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td style="font-family: monospace;">${r.siswa.nis}</td>
                  <td style="font-weight: 600; text-align: left;">${r.siswa.nama}</td>
                  ${uniqueDates
                    .map((d) => {
                      const st = r.dateStatusMap[d];
                      if (!st) return '<td style="text-align: center; color: #ccc;">-</td>';
                      const color =
                        st === 'Hadir'
                          ? '#047857'
                          : st === 'Alpa'
                          ? '#b91c1c'
                          : st === 'Sakit'
                          ? '#b45309'
                          : st === 'Ijin'
                          ? '#1d4ed8'
                          : '#7e22ce';
                      return `<td style="text-align: center; font-weight: bold; font-size: 8pt; color: ${color};">${st.charAt(
                        0
                      )}</td>`;
                    })
                    .join('')}
                  <td style="text-align: center; font-weight: bold; color: #047857;">${r.hadir}</td>
                  <td style="text-align: center; font-weight: bold; color: #b91c1c;">${r.alpa}</td>
                  <td style="text-align: center; font-weight: bold; font-family: monospace;">${r.persentase}%</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;

      return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rekap Absensi - ${currentKelas} - ${selectedTahunAjaran}</title>
  <style>
    @page {
      size: ${pageSizeCss};
      margin: ${orient === 'landscape' ? '8mm 10mm' : '10mm 12mm'};
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: ${orient === 'landscape' ? '9.5pt' : '8.5pt'};
      color: #111;
      margin: 0;
      padding: 15px;
      background: #fff;
    }
    .no-print {
      margin-bottom: 16px;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .btn-print {
      background: #0f172a;
      color: #fff;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      font-size: 13px;
    }
    .kop {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .kop h3 { margin: 0; font-size: 10pt; font-weight: bold; text-transform: uppercase; }
    .kop h2 { margin: 2px 0; font-size: 13pt; font-weight: 800; text-transform: uppercase; }
    .kop p { margin: 0; font-size: 8pt; color: #444; }
    .title-box {
      text-align: center;
      margin-bottom: 10px;
    }
    .title-box h4 { margin: 0; font-size: 10pt; font-weight: bold; text-transform: uppercase; }
    .meta-info {
      font-size: 8.5pt;
      margin-bottom: 8px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    .data-table th, .data-table td {
      border: 1px solid #444;
      padding: 4px 6px;
      font-size: ${orient === 'landscape' ? '8.5pt' : '7.5pt'};
    }
    .data-table th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    .signatures {
      margin-top: 25px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-col {
      width: 45%;
      text-align: center;
      font-size: 9pt;
    }
    .sig-space { height: 50px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong>Mode Cetak:</strong> ${size} ${
        orient === 'landscape' ? 'Landscape (Mendatar)' : 'Portrait (Tegak)'
      } &bull; ${currentKelas} (${currentMapel})
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">🖨️ Cetak Dokumen Ini</button>
      <button onclick="window.close()" style="padding: 8px 14px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Tutup Tab</button>
    </div>
  </div>

  <div class="kop">
    <h3>PEMERINTAH PROVINSI ${sekolah.provinsi || 'SULAWESI TENGGARA'}</h3>
    <h2>${sekolah.namaSekolah || 'SMA NEGERI 1 KABAENA TIMUR'}</h2>
    <p>${sekolah.alamat}, Kec. ${sekolah.kecamatan}, ${sekolah.kabupaten} | NPSN: ${sekolah.npsn}</p>
  </div>

  <div class="title-box">
    <h4>REKAPITULASI PRESENSI KEHADIRAN SISWA</h4>
    <div class="meta-info">
      Kelas: <strong>${currentKelas}</strong> &bull; Mapel: <strong>${currentMapel}</strong> &bull; Semester: <strong>${selectedSemester}</strong> &bull; Tahun Ajaran: <strong>${selectedTahunAjaran}</strong>
    </div>
  </div>

  ${tableContent}

  <div class="signatures">
    <div class="sig-col">
      <p>Mengetahui,</p>
      <p style="font-weight: bold;">Kepala ${sekolah.namaSekolah}</p>
      <div class="sig-space"></div>
      <p style="font-weight: bold; text-decoration: underline;">${
        sekolah.kepalaSekolah || 'Drs. H. Syamsuddin, M.Si.'
      }</p>
      <p style="font-size: 8pt;">NIP. ${sekolah.nipKepala || '-'}</p>
    </div>
    <div class="sig-col">
      <p>${sekolah.kecamatan || 'Dongkala'}, ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}</p>
      <p style="font-weight: bold;">Guru Pengampu / Wali Kelas</p>
      <div class="sig-space"></div>
      <p style="font-weight: bold; text-decoration: underline;">${guru.nama}</p>
      <p style="font-size: 8pt;">NIP. ${guru.nip || '-'}</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
    },
    [
      currentKelasObj,
      currentMapelObj,
      rekapViewMode,
      rekapPresensi,
      uniqueDates,
      sekolah,
      selectedSemester,
      selectedTahunAjaran,
      guru,
    ]
  );

  // Open printable tab (bypasses iframe sandbox 100%)
  const handleOpenPrintTab = useCallback(
    (orient = printOrientation, size = paperSize) => {
      const html = generatePrintableHtml(orient, size);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const w = window.open(blobUrl, '_blank');
      if (!w) {
        showToast('Membuka file cetak otomatis...', 'info');
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `Cetak_Rekap_${orient}_${size}.html`;
        a.click();
      } else {
        showToast('Halaman cetak dibuka di tab baru!', 'success');
      }
    },
    [printOrientation, paperSize, generatePrintableHtml, showToast]
  );

  // Download printable HTML directly
  const handleDownloadPrintHtml = useCallback(
    (orient = printOrientation, size = paperSize) => {
      const html = generatePrintableHtml(orient, size);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Rekap_Absensi_${currentKelasObj?.namaKelas || 'Kelas'}_${orient}_${size}.html`;
      a.click();
      showToast('File dokumen cetak berhasil diunduh.', 'success');
    },
    [generatePrintableHtml, currentKelasObj, showToast]
  );

  // Execute direct print with automatic fallback
  const handleDirectPrint = useCallback(() => {
    applyPrintStyles(printOrientation, paperSize);
    try {
      window.print();
    } catch (err) {
      console.warn('Direct print blocked by sandbox:', err);
      showToast('Pencetakan langsung dibatasi di pratinjau. Membuka di tab baru...', 'info');
      handleOpenPrintTab(printOrientation, paperSize);
    }
  }, [applyPrintStyles, printOrientation, paperSize, showToast, handleOpenPrintTab]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & Navigation Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0">
            {activeSubTab === 'input' ? (
              <CalendarCheck className="w-6 h-6" />
            ) : (
              <FileSpreadsheet className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeSubTab === 'input' ? 'Input Absensi Harian' : 'Rekapitulasi Absensi'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Semester {selectedSemester}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola kehadiran harian dan cetak rekap absensi format F4 (Landscape / Portrait)
            </p>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            id="tab-input-absensi"
            type="button"
            onClick={() => handleSubTabChange('input')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'input'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Input Absensi Harian</span>
          </button>
          <button
            id="tab-rekap-absensi"
            type="button"
            onClick={() => handleSubTabChange('rekap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'rekap'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekap Absensi</span>
          </button>
        </div>
      </div>

      {/* Context Filter Selectors Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Kelas Selector */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Kelas:
              </span>
              <select
                id="select-kelas-absensi"
                value={selectedKelasId}
                onChange={(e) => onSelectKelas && onSelectKelas(e.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer pr-1"
              >
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKelas}
                  </option>
                ))}
              </select>
            </div>

            {/* Mapel Selector */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Mapel:
              </span>
              <select
                id="select-mapel-absensi"
                value={selectedMapelId}
                onChange={(e) => onSelectMapel && onSelectMapel(e.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer pr-1"
              >
                {mapelList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.namaMapel}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Selector */}
            {onSelectSemester && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-600">Semester:</span>
                <select
                  id="select-semester-absensi"
                  value={selectedSemester}
                  onChange={(e) => onSelectSemester(e.target.value as Semester)}
                  className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="1">Semester 1 (Ganjil)</option>
                  <option value="2">Semester 2 (Genap)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              Total Siswa: <strong className="text-slate-800">{activeStudents.length} siswa aktif</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MENU 1: INPUT ABSENSI HARIAN                              */}
      {/* ========================================================= */}
      {activeSubTab === 'input' && (
        <div className="space-y-4 no-print">
          {/* Action Control & Date Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Picker */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-600">Tanggal:</span>
                <input
                  id="input-tanggal-absensi"
                  type="date"
                  value={tanggalInput}
                  onChange={(e) => setTanggalInput(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer font-mono"
                />
              </div>

              {/* Quick Date Helpers */}
              <button
                type="button"
                onClick={() => setTanggalInput(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg border border-slate-200 transition text-[11px]"
              >
                Hari Ini
              </button>

              {/* Date status badge */}
              {existingDateRecords.length > 0 ? (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Sudah Ada ({existingDateRecords.length} siswa)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Presensi Baru
                </span>
              )}

              {/* Quick Date Jumper Dropdown if past dates exist */}
              {recordedDates.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-[11px]">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Pilih Pertemuan:</span>
                  <select
                    value={tanggalInput}
                    onChange={(e) => setTanggalInput(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value={tanggalInput}>Pilih tanggal...</option>
                    {recordedDates.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-semua-hadir"
                type="button"
                onClick={handleMarkAllHadir}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Semua Hadir</span>
              </button>

              <button
                id="btn-reset-absensi"
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1"
                title="Reset seluruh inputan presensi siswa"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                id="btn-simpan-absensi"
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Presensi Hari Ini</span>
              </button>
            </div>
          </div>

          {/* Quick Real-Time Summary Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">Total Siswa</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{currentSummary.total}</p>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hadir (H)
              </p>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">{currentSummary.hadir}</p>
            </div>
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
              <p className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Izin (I)
              </p>
              <p className="text-lg font-bold text-blue-800 mt-0.5">{currentSummary.ijin}</p>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 shadow-2xs">
              <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Sakit (S)
              </p>
              <p className="text-lg font-bold text-amber-800 mt-0.5">{currentSummary.sakit}</p>
            </div>
            <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-200 shadow-2xs">
              <p className="text-[11px] text-orange-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Terlambat (T)
              </p>
              <p className="text-lg font-bold text-orange-800 mt-0.5">{currentSummary.terlambat}</p>
            </div>
            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 shadow-2xs">
              <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Alpa (A)
              </p>
              <p className="text-lg font-bold text-rose-800 mt-0.5">{currentSummary.alpa}</p>
            </div>
            <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 shadow-2xs">
              <p className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Bolos (B)
              </p>
              <p className="text-lg font-bold text-purple-800 mt-0.5">{currentSummary.bolos}</p>
            </div>
          </div>

          {/* Search Filter for Student Table */}
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-siswa-absensi"
                type="text"
                placeholder="Cari siswa berdasarkan nama atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:bg-white transition"
              />
            </div>
            <div className="text-[11px] text-slate-500">
              Menampilkan {filteredStudents.length} dari {activeStudents.length} siswa
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-3 w-28">NIS</th>
                    <th className="py-3 px-4 min-w-[200px]">Nama Lengkap Siswa</th>
                    <th className="py-3 px-2 w-12 text-center">L/P</th>
                    <th className="py-3 px-3 text-center min-w-[340px]">
                      Status Kehadiran (H / I / S / T / A / B)
                    </th>
                    <th className="py-3 px-4 min-w-[220px]">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {searchQuery ? (
                          <span>Tidak ada siswa yang sesuai dengan kata kunci &quot;{searchQuery}&quot;</span>
                        ) : (
                          <span>
                            Belum ada siswa aktif di kelas {currentKelasObj?.namaKelas}. Silakan tambahkan siswa di menu Data Siswa.
                          </span>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const cur = attendanceMap[s.id] || { status: 'Hadir', keterangan: '' };
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-indigo-700">{s.nis}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {s.nama.charAt(0)}
                              </span>
                              <span>{s.nama}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                s.jenisKelamin === 'L'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-pink-50 text-pink-700 border border-pink-200'
                              }`}
                            >
                              {s.jenisKelamin}
                            </span>
                          </td>

                          {/* Quick Radio Pills for Attendance Status */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Hadir */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'Hadir')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  cur.status === 'Hadir'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                                title="Hadir"
                              >
                                <span>H</span>
                              </button>

                              {/* Ijin */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'Ijin')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  cur.status === 'Ijin'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                                title="Izin"
                              >
                                <span>I</span>
                              </button>

                              {/* Sakit */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'Sakit')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  cur.status === 'Sakit'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                                title="Sakit"
                              >
                                <span>S</span>
                              </button>

                              {/* Terlambat */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'Terlambat')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  cur.status === 'Terlambat'
                                    ? 'bg-orange-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                                }`}
                                title="Terlambat"
                              >
                                <span>T</span>
                              </button>

                              {/* Alpa */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'Alpa')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  cur.status === 'Alpa'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                                title="Alpa / Tanpa Keterangan"
                              >
                                <span>A</span>
                              </button>

                              {/* Bolos */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'Bolos')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  cur.status === 'Bolos'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                                }`}
                                title="Bolos"
                              >
                                <span>B</span>
                              </button>
                            </div>
                          </td>

                          {/* Catatan / Keterangan */}
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={cur.keterangan}
                              onChange={(e) => handleKeteranganChange(s.id, e.target.value)}
                              placeholder="Keterangan (misal: surat dokter, izin dinas)..."
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:bg-white bg-slate-50/60 transition"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom table save reminder */}
            {filteredStudents.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Pastikan mengeklik tombol simpan setelah mengisi absensi.
                </span>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Presensi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 2: REKAP ABSENSI                                     */}
      {/* ========================================================= */}
      {activeSubTab === 'rekap' && (
        <div className="space-y-6">
          {/* Rekap Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 no-print">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Pertemuan
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {rekapStats.totalPertemuan} <span className="text-xs font-normal text-slate-500">kali</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rata-rata Kehadiran
                </p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {rekapStats.avgPersentase}%
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kehadiran 100%
                </p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  {rekapStats.siswaRajin} <span className="text-xs font-normal text-slate-500">siswa</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Perlu Perhatian (BK)
                </p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">
                  {rekapStats.siswaPerhatian} <span className="text-xs font-normal text-slate-500">siswa</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Subview Toolbar & Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            {/* View Mode Toggle: Ringkasan vs Matriks & Month Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRekapViewMode('ringkasan')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    rekapViewMode === 'ringkasan'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rekap Ringkasan
                </button>
                <button
                  type="button"
                  onClick={() => setRekapViewMode('matriks')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    rekapViewMode === 'matriks'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Matriks Per Tanggal
                </button>
              </div>

              {/* Month filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Bulan:</span>
                <select
                  value={rekapBulanFilter}
                  onChange={(e) => setRekapBulanFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="">Semua Bulan (Semester {selectedSemester})</option>
                  <option value="2026-07">Juli</option>
                  <option value="2026-08">Agustus</option>
                  <option value="2026-09">September</option>
                  <option value="2026-10">Oktober</option>
                  <option value="2026-11">November</option>
                  <option value="2026-12">Desember</option>
                  <option value="2027-01">Januari</option>
                  <option value="2027-02">Februari</option>
                  <option value="2027-03">Maret</option>
                  <option value="2027-04">April</option>
                  <option value="2027-05">Mei</option>
                  <option value="2027-06">Juni</option>
                </select>
              </div>
            </div>

            {/* Print Orientation Selector & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Orientation Switcher: Landscape vs Portrait */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setPrintOrientation('landscape');
                    applyPrintStyles('landscape', paperSize);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition ${
                    printOrientation === 'landscape'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Orientasi Mendatar (Landscape) - Disarankan untuk rekap matriks"
                >
                  <LayoutGrid className="w-3.5 h-3.5 rotate-90" />
                  <span>Landscape</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrintOrientation('portrait');
                    applyPrintStyles('portrait', paperSize);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition ${
                    printOrientation === 'portrait'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Orientasi Tegak (Portrait) - Cocok untuk ringkasan"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Portrait</span>
                </button>
              </div>

              {/* Paper Size selector */}
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Kertas:</span>
                <select
                  value={paperSize}
                  onChange={(e) => {
                    const newSize = e.target.value as 'F4' | 'A4';
                    setPaperSize(newSize);
                    applyPrintStyles(printOrientation, newSize);
                  }}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
                >
                  <option value="F4">F4 (Folio 215x330mm)</option>
                  <option value="A4">A4 (210x297mm)</option>
                </select>
              </div>

              {/* Export Excel Button */}
              <button
                id="btn-export-rekap-excel"
                type="button"
                onClick={handleExportRekapExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              {/* Primary Print Button */}
              <button
                id="btn-cetak-rekap-f4"
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs cursor-pointer"
                title={`Cetak Rekap (${paperSize} ${printOrientation === 'landscape' ? 'Landscape' : 'Portrait'})`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>
                  Cetak Rekap ({printOrientation === 'landscape' ? 'Landscape' : 'Portrait'})
                </span>
              </button>
            </div>
          </div>

          {/* Printable Container on Main Page */}
          <div
            className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-none print:shadow-none print:p-0 ${
              printOrientation === 'landscape' ? 'print-landscape' : 'max-w-[215mm] mx-auto'
            }`}
          >
            {/* Kop Surat Sekolah on Print */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                PEMERINTAH PROVINSI {sekolah.provinsi || 'SULAWESI TENGGARA'}
              </h3>
              <h2 className="text-base font-extrabold uppercase text-slate-900">
                {sekolah.namaSekolah || 'SMA NEGERI 1 KABAENA TIMUR'}
              </h2>
              <p className="text-[10px] text-slate-600">
                {sekolah.alamat}, Kec. {sekolah.kecamatan}, {sekolah.kabupaten} | NPSN: {sekolah.npsn}
              </p>
              <div className="mt-2 pt-1 border-t border-slate-300">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  REKAPITULASI PRESENSI KEHADIRAN SISWA ({paperSize}{' '}
                  {printOrientation === 'landscape' ? 'LANDSCAPE' : 'PORTRAIT'})
                </h4>
                <p className="text-[10px] text-slate-700">
                  Kelas: <strong className="text-slate-900">{currentKelasObj?.namaKelas}</strong> | Mata Pelajaran:{' '}
                  <strong className="text-slate-900">{currentMapelObj?.namaMapel}</strong> | Semester:{' '}
                  <strong className="text-slate-900">{selectedSemester}</strong> | Tahun Ajaran:{' '}
                  <strong className="text-slate-900">{selectedTahunAjaran}</strong>
                </p>
              </div>
            </div>

            {/* TABEL REKAP 1: RINGKASAN AKUMULATIF */}
            {rekapViewMode === 'ringkasan' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-2.5 border border-slate-300 w-10 text-center">No</th>
                      <th className="py-2 px-2.5 border border-slate-300 w-24">NIS</th>
                      <th className="py-2 px-3 border border-slate-300 min-w-[180px]">Nama Siswa</th>
                      <th className="py-2 px-2 border border-slate-300 w-10 text-center">L/P</th>
                      <th className="py-2 px-2 border border-slate-300 text-center w-11 bg-emerald-50 text-emerald-800">H</th>
                      <th className="py-2 px-2 border border-slate-300 text-center w-11 bg-blue-50 text-blue-800">I</th>
                      <th className="py-2 px-2 border border-slate-300 text-center w-11 bg-amber-50 text-amber-800">S</th>
                      <th className="py-2 px-2 border border-slate-300 text-center w-11 bg-orange-50 text-orange-800">T</th>
                      <th className="py-2 px-2 border border-slate-300 text-center w-11 bg-rose-50 text-rose-800">A</th>
                      <th className="py-2 px-2 border border-slate-300 text-center w-11 bg-purple-50 text-purple-800">B</th>
                      <th className="py-2 px-2.5 border border-slate-300 text-center w-24">Persentase</th>
                      <th className="py-2 px-2.5 border border-slate-300 text-center w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-800 divide-y divide-slate-200">
                    {rekapPresensi.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="py-8 text-center text-slate-400">
                          Belum ada data siswa di kelas {currentKelasObj?.namaKelas}.
                        </td>
                      </tr>
                    ) : (
                      rekapPresensi.map((r, idx) => (
                        <tr key={r.siswa.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2.5 border border-slate-300 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 border border-slate-300 font-mono font-medium text-indigo-700">
                            {r.siswa.nis}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 font-semibold">{r.siswa.nama}</td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-bold text-[10px]">
                            {r.siswa.jenisKelamin}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-emerald-700">
                            {r.hadir}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-mono text-blue-700">
                            {r.ijin}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-mono text-amber-700">
                            {r.sakit}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-mono text-orange-700">
                            {r.terlambat}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-rose-700">
                            {r.alpa}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-purple-700">
                            {r.bolos}
                          </td>
                          <td className="py-2 px-2.5 border border-slate-300 text-center font-mono font-bold">
                            <span
                              className={
                                r.persentase < 80
                                  ? 'text-rose-600 font-extrabold'
                                  : r.persentase < 90
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }
                            >
                              {r.persentase}%
                            </span>
                          </td>
                          <td className="py-2 px-2.5 border border-slate-300 text-center">
                            {r.persentase >= 90 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Sangat Baik
                              </span>
                            ) : r.persentase >= 80 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Baik
                              </span>
                            ) : r.persentase >= 70 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Cukup
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Perhatian
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABEL REKAP 2: MATRIKS PER TANGGAL */}
            {rekapViewMode === 'matriks' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-2 border border-slate-300 w-8 text-center" rowSpan={2}>
                        No
                      </th>
                      <th className="py-2 px-2 border border-slate-300 w-20" rowSpan={2}>
                        NIS
                      </th>
                      <th className="py-2 px-3 border border-slate-300 min-w-[170px]" rowSpan={2}>
                        Nama Siswa
                      </th>
                      {uniqueDates.length > 0 ? (
                        <th
                          className="py-1 px-2 border border-slate-300 text-center bg-slate-200"
                          colSpan={uniqueDates.length}
                        >
                          Tanggal Pertemuan / Pelaksanaan
                        </th>
                      ) : (
                        <th className="py-1 px-2 border border-slate-300 text-center">Tanggal</th>
                      )}
                      <th className="py-1 px-2 border border-slate-300 text-center bg-emerald-50" rowSpan={2}>
                        H
                      </th>
                      <th className="py-1 px-2 border border-slate-300 text-center bg-rose-50" rowSpan={2}>
                        A
                      </th>
                      <th className="py-1 px-2 border border-slate-300 text-center" rowSpan={2}>
                        %
                      </th>
                    </tr>
                    <tr>
                      {uniqueDates.length > 0 ? (
                        uniqueDates.map((d) => (
                          <th
                            key={d}
                            className="py-1 px-1.5 border border-slate-300 text-center text-[10px] font-mono min-w-[38px]"
                            title={d}
                          >
                            {d.slice(5)}
                          </th>
                        ))
                      ) : (
                        <th className="py-1 px-2 border border-slate-300 text-center text-slate-400 font-normal">
                          Belum ada tanggal
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-slate-800 divide-y divide-slate-200">
                    {rekapPresensi.length === 0 ? (
                      <tr>
                        <td colSpan={6 + uniqueDates.length} className="py-8 text-center text-slate-400">
                          Belum ada rekaman presensi untuk kelas {currentKelasObj?.namaKelas}.
                        </td>
                      </tr>
                    ) : (
                      rekapPresensi.map((r, idx) => (
                        <tr key={r.siswa.id} className="hover:bg-slate-50/70">
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-2 border border-slate-300 font-mono text-indigo-700">
                            {r.siswa.nis}
                          </td>
                          <td className="py-1.5 px-3 border border-slate-300 font-semibold">{r.siswa.nama}</td>

                          {/* Date status cells */}
                          {uniqueDates.length > 0 ? (
                            uniqueDates.map((d) => {
                              const st = r.dateStatusMap[d];
                              if (!st) {
                                return (
                                  <td
                                    key={d}
                                    className="py-1 px-1 border border-slate-300 text-center font-mono text-slate-300 text-[10px]"
                                  >
                                    -
                                  </td>
                                );
                              }
                              const badgeClass =
                                st === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : st === 'Ijin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : st === 'Sakit'
                                  ? 'bg-amber-100 text-amber-800'
                                  : st === 'Terlambat'
                                  ? 'bg-orange-100 text-orange-800'
                                  : st === 'Alpa'
                                  ? 'bg-rose-100 text-rose-800 font-extrabold'
                                  : 'bg-purple-100 text-purple-800 font-extrabold';

                              return (
                                <td key={d} className="py-1 px-1 border border-slate-300 text-center">
                                  <span className={`inline-block w-5 py-0.5 rounded font-bold text-[10px] ${badgeClass}`}>
                                    {st.charAt(0)}
                                  </span>
                                </td>
                              );
                            })
                          ) : (
                            <td className="py-1 px-2 border border-slate-300 text-center text-slate-400">-</td>
                          )}

                          <td className="py-1.5 px-2 border border-slate-300 text-center font-mono font-bold text-emerald-700">
                            {r.hadir}
                          </td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-mono font-bold text-rose-700">
                            {r.alpa}
                          </td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-mono font-bold">
                            {r.persentase}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature Block for Print */}
            <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs text-slate-800 print:grid">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala {sekolah.namaSekolah}</p>
                <div className="h-16" />
                <p className="font-bold underline">{sekolah.kepalaSekolah || 'Drs. H. Syamsuddin, M.Si.'}</p>
                <p className="font-mono text-[10px]">NIP. {sekolah.nipKepala || '-'}</p>
              </div>

              <div>
                <p>
                  {sekolah.kecamatan || 'Dongkala'},{' '}
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="font-semibold">Guru Pengampu / Wali Kelas</p>
                <div className="h-16" />
                <p className="font-bold underline">{guru.nama}</p>
                <p className="font-mono text-[10px]">NIP. {guru.nip || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL PRATINJAU & PENGATURAN CETAK (PRINT PREVIEW DIALOG) */}
      {/* ========================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Pratinjau & Pengaturan Cetak Absensi</h3>
                  <p className="text-[11px] text-slate-300">
                    Pilih orientasi (Landscape / Portrait) dan ukuran kertas sebelum mencetak
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Controls Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Orientasi Radio Switcher */}
                <div>
                  <span className="font-bold text-slate-700 mr-2">Orientasi Kertas:</span>
                  <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setPrintOrientation('landscape');
                        applyPrintStyles('landscape', paperSize);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                        printOrientation === 'landscape'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 rotate-90" />
                      <span>Landscape (Mendatar)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrintOrientation('portrait');
                        applyPrintStyles('portrait', paperSize);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                        printOrientation === 'portrait'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Portrait (Tegak)</span>
                    </button>
                  </div>
                </div>

                {/* Ukuran Kertas Selector */}
                <div>
                  <span className="font-bold text-slate-700 mr-2">Ukuran Kertas:</span>
                  <select
                    value={paperSize}
                    onChange={(e) => {
                      const val = e.target.value as 'F4' | 'A4';
                      setPaperSize(val);
                      applyPrintStyles(printOrientation, val);
                    }}
                    className="bg-white font-bold text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 outline-none cursor-pointer"
                  >
                    <option value="F4">F4 / Folio (215 x 330 mm)</option>
                    <option value="A4">A4 (210 x 297 mm)</option>
                  </select>
                </div>
              </div>

              {/* Mode Data Rekap */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Tampilan:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {rekapViewMode === 'ringkasan' ? 'Rekap Ringkasan' : 'Matriks Tanggal'}
                </span>
              </div>
            </div>

            {/* Modal Live Paper Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70 flex justify-center">
              <div
                className={`bg-white shadow-xl rounded-lg p-6 sm:p-8 transition-all border border-slate-300 w-full ${
                  printOrientation === 'landscape' ? 'max-w-3xl' : 'max-w-xl'
                }`}
              >
                {/* Kop Preview */}
                <div className="border-b-2 border-slate-900 pb-2.5 mb-3 text-center">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    PEMERINTAH PROVINSI {sekolah.provinsi || 'SULAWESI TENGGARA'}
                  </h4>
                  <h3 className="text-sm font-extrabold uppercase text-slate-900">
                    {sekolah.namaSekolah || 'SMA NEGERI 1 KABAENA TIMUR'}
                  </h3>
                  <p className="text-[9px] text-slate-500">
                    {sekolah.alamat}, Kec. {sekolah.kecamatan}, {sekolah.kabupaten} | NPSN: {sekolah.npsn}
                  </p>
                </div>

                <div className="text-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                    REKAPITULASI PRESENSI KEHADIRAN SISWA
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Kelas: <strong>{currentKelasObj?.namaKelas}</strong> &bull; Mapel:{' '}
                    <strong>{currentMapelObj?.namaMapel}</strong> &bull; Semester:{' '}
                    <strong>{selectedSemester}</strong> &bull; Tahun:{' '}
                    <strong>{selectedTahunAjaran}</strong>
                  </p>
                </div>

                {/* Table Preview */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] border-collapse border border-slate-400">
                    <thead className="bg-slate-100 font-bold border-b border-slate-400">
                      <tr>
                        <th className="py-1 px-1.5 border border-slate-400 text-center w-6">No</th>
                        <th className="py-1 px-1.5 border border-slate-400 w-16">NIS</th>
                        <th className="py-1 px-2 border border-slate-400 text-left">Nama Lengkap</th>
                        <th className="py-1 px-1 border border-slate-400 text-center w-6">L/P</th>
                        <th className="py-1 px-1 border border-slate-400 text-center w-6 bg-emerald-50">H</th>
                        <th className="py-1 px-1 border border-slate-400 text-center w-6 bg-blue-50">I</th>
                        <th className="py-1 px-1 border border-slate-400 text-center w-6 bg-amber-50">S</th>
                        <th className="py-1 px-1 border border-slate-400 text-center w-6 bg-orange-50">T</th>
                        <th className="py-1 px-1 border border-slate-400 text-center w-6 bg-rose-50">A</th>
                        <th className="py-1 px-1 border border-slate-400 text-center w-6 bg-purple-50">B</th>
                        <th className="py-1 px-1.5 border border-slate-400 text-center w-12">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {rekapPresensi.slice(0, 10).map((r, idx) => (
                        <tr key={r.siswa.id}>
                          <td className="py-0.5 px-1 border border-slate-400 text-center font-mono">{idx + 1}</td>
                          <td className="py-0.5 px-1 border border-slate-400 font-mono text-indigo-700">{r.siswa.nis}</td>
                          <td className="py-0.5 px-2 border border-slate-400 font-semibold">{r.siswa.nama}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center">{r.siswa.jenisKelamin}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center font-bold text-emerald-700">{r.hadir}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center text-blue-700">{r.ijin}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center text-amber-700">{r.sakit}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center text-orange-700">{r.terlambat}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center font-bold text-rose-700">{r.alpa}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center font-bold text-purple-700">{r.bolos}</td>
                          <td className="py-0.5 px-1 border border-slate-400 text-center font-bold font-mono">{r.persentase}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rekapPresensi.length > 10 && (
                    <p className="text-[9px] text-slate-400 italic text-center mt-1">
                      ... dan {rekapPresensi.length - 10} siswa lainnya (seluruhnya akan tercetak)
                    </p>
                  )}
                </div>

                {/* Signature Preview */}
                <div className="mt-6 grid grid-cols-2 text-center text-[10px] text-slate-700">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Kepala {sekolah.namaSekolah}</p>
                    <div className="h-10" />
                    <p className="font-bold underline">{sekolah.kepalaSekolah || 'Kepala Sekolah'}</p>
                  </div>
                  <div>
                    <p>{sekolah.kecamatan || 'Dongkala'}</p>
                    <p className="font-semibold">Guru Pengampu / Wali Kelas</p>
                    <div className="h-10" />
                    <p className="font-bold underline">{guru.nama}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Format: <strong>{paperSize}</strong> &bull; Orientasi:{' '}
                  <strong>{printOrientation === 'landscape' ? 'Landscape (Mendatar)' : 'Portrait (Tegak)'}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Download HTML */}
                <button
                  type="button"
                  onClick={() => handleDownloadPrintHtml(printOrientation, paperSize)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen</span>
                </button>

                {/* Open in New Tab to Print (Guaranteed to work in iframe environment) */}
                <button
                  type="button"
                  onClick={() => handleOpenPrintTab(printOrientation, paperSize)}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
                  title="Buka di tab baru (bebas dari batasan iframe)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru (Print)</span>
                </button>

                {/* Direct Print Button */}
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
