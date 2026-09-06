import React, { useState, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Printer,
  Download,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Save,
  X,
  UserCheck,
  LayoutGrid,
  FileSpreadsheet,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  CatatanRefleksiPertemuan,
  Kelas,
  Mapel,
  Siswa,
  Semester,
  ProfilSekolah,
  ProfilGuru,
  NilaiSiswa,
} from '../types';

interface CatatanRefleksiViewProps {
  catatanList: CatatanRefleksiPertemuan[];
  onSaveList: (list: CatatanRefleksiPertemuan[]) => void;
  selectedKelasId: string;
  selectedMapelId: string;
  selectedSemester: Semester;
  selectedTahunAjaran: string;
  kelasList: Kelas[];
  mapelList: Mapel[];
  activeStudents: Siswa[];
  gradesMap: Record<string, NilaiSiswa>;
  onCatatanSiswaChange: (siswaId: string, value: string) => void;
  sekolah?: ProfilSekolah;
  guru?: ProfilGuru;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const CatatanRefleksiView: React.FC<CatatanRefleksiViewProps> = ({
  catatanList,
  onSaveList,
  selectedKelasId,
  selectedMapelId,
  selectedSemester,
  selectedTahunAjaran,
  kelasList,
  mapelList,
  activeStudents,
  gradesMap,
  onCatatanSiswaChange,
  sekolah,
  guru,
  showToast,
}) => {
  // Sub-view: 'pertemuan' (Jurnal & Refleksi Guru Per Pertemuan) or 'rapor' (Catatan Rapor Siswa)
  const [subView, setSubView] = useState<'pertemuan' | 'rapor'>('pertemuan');

  // Print orientation & paper size
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [paperSize, setPaperSize] = useState<'F4' | 'A4'>('F4');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state for adding / editing meeting note
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Resolved current class and mapel
  const currentKelasObj = kelasList.find((k) => k.id === selectedKelasId) || kelasList[0];
  const currentMapelObj = mapelList.find((m) => m.id === selectedMapelId) || mapelList[0];

  // Filtered meeting notes for current context
  const relevantCatatan = useMemo(() => {
    return catatanList
      .filter(
        (c) =>
          c.kelasId === selectedKelasId &&
          c.mapelId === selectedMapelId &&
          c.tahunAjaran === selectedTahunAjaran &&
          c.semester === selectedSemester
      )
      .sort((a, b) => a.pertemuanKe - b.pertemuanKe);
  }, [catatanList, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester]);

  // Search-filtered meeting notes
  const displayedCatatan = useMemo(() => {
    if (!searchQuery.trim()) return relevantCatatan;
    const q = searchQuery.toLowerCase();
    return relevantCatatan.filter(
      (c) =>
        c.materiPokok.toLowerCase().includes(q) ||
        c.catatanGuru.toLowerCase().includes(q) ||
        c.refleksiGuru.toLowerCase().includes(q) ||
        c.tindakLanjut.toLowerCase().includes(q) ||
        String(c.pertemuanKe).includes(q)
    );
  }, [relevantCatatan, searchQuery]);

  // Form states
  const [formData, setFormData] = useState<{
    pertemuanKe: number;
    tanggal: string;
    materiPokok: string;
    tujuanPembelajaran: string;
    catatanGuru: string;
    refleksiGuru: string;
    tindakLanjut: string;
    ketercapaian: number;
    siswaPerhatian: string;
  }>({
    pertemuanKe: relevantCatatan.length + 1,
    tanggal: new Date().toISOString().split('T')[0],
    materiPokok: '',
    tujuanPembelajaran: '',
    catatanGuru: '',
    refleksiGuru: '',
    tindakLanjut: '',
    ketercapaian: 85,
    siswaPerhatian: '',
  });

  // Open add form
  const handleOpenAdd = () => {
    setEditingId(null);
    const nextPertemuan =
      relevantCatatan.length > 0
        ? Math.max(...relevantCatatan.map((c) => c.pertemuanKe)) + 1
        : 1;

    setFormData({
      pertemuanKe: nextPertemuan,
      tanggal: new Date().toISOString().split('T')[0],
      materiPokok: '',
      tujuanPembelajaran: '',
      catatanGuru: '',
      refleksiGuru: '',
      tindakLanjut: '',
      ketercapaian: 85,
      siswaPerhatian: '',
    });
    setIsFormOpen(true);
  };

  // Open edit form
  const handleOpenEdit = (item: CatatanRefleksiPertemuan) => {
    setEditingId(item.id);
    setFormData({
      pertemuanKe: item.pertemuanKe,
      tanggal: item.tanggal,
      materiPokok: item.materiPokok,
      tujuanPembelajaran: item.tujuanPembelajaran || '',
      catatanGuru: item.catatanGuru,
      refleksiGuru: item.refleksiGuru,
      tindakLanjut: item.tindakLanjut,
      ketercapaian: item.ketercapaian ?? 85,
      siswaPerhatian: item.siswaPerhatian || '',
    });
    setIsFormOpen(true);
  };

  // Save form data
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materiPokok.trim()) {
      showToast('Materi pokok pembelajaran wajib diisi.', 'warning');
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      // Edit existing
      const updated = catatanList.map((c) => {
        if (c.id === editingId) {
          return {
            ...c,
            ...formData,
            updatedAt: now,
          };
        }
        return c;
      });
      onSaveList(updated);
      showToast(`Catatan pertemuan ke-${formData.pertemuanKe} berhasil diperbarui!`, 'success');
    } else {
      // Create new
      const newItem: CatatanRefleksiPertemuan = {
        id: `cr-${Date.now()}`,
        kelasId: selectedKelasId,
        mapelId: selectedMapelId,
        tahunAjaran: selectedTahunAjaran,
        semester: selectedSemester,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      onSaveList([...catatanList, newItem]);
      showToast(`Catatan & refleksi pertemuan ke-${formData.pertemuanKe} berhasil ditambahkan!`, 'success');
    }

    setIsFormOpen(false);
  };

  // Delete meeting note
  const handleDelete = (id: string, pertemuanKe: number) => {
    if (window.confirm(`Yakin ingin menghapus catatan pertemuan ke-${pertemuanKe}?`)) {
      const updated = catatanList.filter((c) => c.id !== id);
      onSaveList(updated);
      showToast(`Catatan pertemuan ke-${pertemuanKe} dihapus.`, 'info');
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const rows = relevantCatatan.map((c) => ({
      'Pertemuan Ke': c.pertemuanKe,
      Tanggal: c.tanggal,
      'Materi Pokok / TP': c.materiPokok,
      'Tujuan Pembelajaran': c.tujuanPembelajaran || '-',
      'Catatan Guru (Proses)': c.catatanGuru,
      'Refleksi Guru': c.refleksiGuru,
      'Rencana Tindak Lanjut': c.tindakLanjut,
      'Ketercapaian (%)': `${c.ketercapaian ?? 0}%`,
      'Siswa Perlu Perhatian': c.siswaPerhatian || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jurnal & Refleksi Guru');
    XLSX.writeFile(
      wb,
      `Jurnal_Refleksi_Guru_${currentKelasObj?.namaKelas || 'Kelas'}_${currentMapelObj?.namaMapel || 'Mapel'}.xlsx`
    );
    showToast('Jurnal & refleksi berhasil diekspor ke Excel!', 'success');
  };

  // Quick Preset Helper for Refleksi
  const handleApplyPreset = (type: 'interaktif' | 'remedial' | 'projek') => {
    if (type === 'interaktif') {
      setFormData((prev) => ({
        ...prev,
        catatanGuru:
          'Pembelajaran menggunakan metode diskusi kelompok dan studi kasus. Siswa aktif bertanya dan berargumen secara kritis.',
        refleksiGuru:
          'Keterlibatan siswa meningkat pesat saat diberikan masalah kontekstual nyata. Hanya 2 siswa yang masih malu berpendapat.',
        tindakLanjut:
          'Memberikan peran juru bicara bergilir pada siswa yang pasif di pertemuan berikutnya.',
        ketercapaian: 90,
      }));
    } else if (type === 'remedial') {
      setFormData((prev) => ({
        ...prev,
        catatanGuru:
          'Dilakukan asesmen diagnostik berkala dan latihan soal mandiri dengan bimbingan tutor sebaya.',
        refleksiGuru:
          'Konsep dasar teorema telah dipahami 75% siswa, namun perhitungan aljabar lanjut masih sering keliru pada tanda negatif.',
        tindakLanjut:
          'Memberikan lembar scaffolding latihan bertahap dan pendampingan khusus 15 menit sebelum kelas dimulai.',
        ketercapaian: 80,
      }));
    } else if (type === 'projek') {
      setFormData((prev) => ({
        ...prev,
        catatanGuru:
          'Siswa mempresentasikan hasil lembar kerja proyek mini dan demonstrasi karya kelompok.',
        refleksiGuru:
          'Kreativitas dan kerjasama tim sangat membanggakan. Manajemen waktu kelompok saat presentasi perlu diperbaiki.',
        tindakLanjut:
          'Menyediakan rubrik pembatasan waktu (timekeeper) yang ketat pada sesi presentasi berikutnya.',
        ketercapaian: 95,
      }));
    }
  };

  // Dynamic Print HTML Generator
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

      const rowsHtml = relevantCatatan
        .map(
          (c) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${c.pertemuanKe}</td>
          <td style="text-align: center; white-space: nowrap;">${c.tanggal}</td>
          <td style="text-align: left; font-weight: 600;">
            ${c.materiPokok}
            ${c.tujuanPembelajaran ? `<div style="font-size: 7.5pt; color: #555; margin-top: 2px;">TP: ${c.tujuanPembelajaran}</div>` : ''}
          </td>
          <td style="text-align: left;">${c.catatanGuru || '-'}</td>
          <td style="text-align: left; background-color: #f8fafc;">${c.refleksiGuru || '-'}</td>
          <td style="text-align: left;">${c.tindakLanjut || '-'}</td>
          <td style="text-align: center; font-weight: bold; font-family: monospace;">${c.ketercapaian ?? 0}%</td>
          <td style="text-align: left; font-size: 7.5pt; color: #b91c1c;">${c.siswaPerhatian || '-'}</td>
        </tr>
      `
        )
        .join('');

      return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Jurnal Catatan & Refleksi Guru - ${currentKelas} - ${currentMapel}</title>
  <style>
    @page {
      size: ${pageSizeCss};
      margin: ${orient === 'landscape' ? '8mm 10mm' : '10mm 12mm'};
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: ${orient === 'landscape' ? '8.5pt' : '7.5pt'};
      color: #111;
      margin: 0;
      padding: 12px;
      background: #fff;
    }
    .no-print {
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    .btn-print {
      background: #0f172a;
      color: #fff;
      padding: 6px 14px;
      font-weight: bold;
      border-radius: 5px;
      cursor: pointer;
      border: none;
      font-size: 12px;
    }
    .kop {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .kop h3 { margin: 0; font-size: 9.5pt; font-weight: bold; text-transform: uppercase; }
    .kop h2 { margin: 2px 0; font-size: 12pt; font-weight: 800; text-transform: uppercase; }
    .kop p { margin: 0; font-size: 7.5pt; color: #444; }
    .title-box { text-align: center; margin-bottom: 8px; }
    .title-box h4 { margin: 0; font-size: 10.5pt; font-weight: bold; text-transform: uppercase; }
    .meta-box {
      font-size: 8pt;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th, td {
      border: 1px solid #475569;
      padding: 4px 6px;
      font-size: ${orient === 'landscape' ? '8pt' : '7pt'};
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .signatures {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-col {
      width: 45%;
      text-align: center;
      font-size: 8.5pt;
    }
    .sig-space { height: 45px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong>Mode Cetak:</strong> Jurnal & Refleksi Pembelajaran Guru (${size} ${orient.toUpperCase()})
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">🖨️ Cetak Jurnal Ini</button>
      <button onclick="window.close()" style="padding: 6px 12px; background: #e2e8f0; border: none; border-radius: 5px; cursor: pointer;">Tutup Tab</button>
    </div>
  </div>

  <div class="kop">
    <h3>PEMERINTAH PROVINSI ${sekolah?.provinsi || 'SULAWESI TENGGARA'}</h3>
    <h2>${sekolah?.namaSekolah || 'SMA NEGERI 1 KABAENA TIMUR'}</h2>
    <p>${sekolah?.alamat || ''}, Kec. ${sekolah?.kecamatan || 'Kabaena Timur'} | NPSN: ${sekolah?.npsn || '-'}</p>
  </div>

  <div class="title-box">
    <h4>JURNAL CATATAN GURU & REFLEKSI PEMBELAJARAN PER PERTEMUAN</h4>
  </div>

  <div class="meta-box">
    <div>
      Mata Pelajaran: <strong>${currentMapel}</strong> | Kelas: <strong>${currentKelas}</strong>
    </div>
    <div>
      Semester: <strong>${selectedSemester}</strong> | Tahun Ajaran: <strong>${selectedTahunAjaran}</strong>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 30px;">P.Ke</th>
        <th style="width: 65px;">Tanggal</th>
        <th style="width: 150px;">Materi Pokok / CP / TP</th>
        <th>Catatan Proses Pembelajaran</th>
        <th>Refleksi Guru (Evaluasi Diri)</th>
        <th>Rencana Tindak Lanjut</th>
        <th style="width: 45px;">Ketercapaian</th>
        <th style="width: 90px;">Siswa Perlu Perhatian</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 15px;">Belum ada catatan pertemuan.</td></tr>'}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-col">
      <p>Mengetahui,</p>
      <p style="font-weight: bold;">Kepala ${sekolah?.namaSekolah || 'Sekolah'}</p>
      <div class="sig-space"></div>
      <p style="font-weight: bold; text-decoration: underline;">${sekolah?.kepalaSekolah || 'Drs. H. Syamsuddin, M.Si.'}</p>
      <p style="font-size: 7.5pt;">NIP. ${sekolah?.nipKepala || '-'}</p>
    </div>
    <div class="sig-col">
      <p>${sekolah?.kecamatan || 'Dongkala'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p style="font-weight: bold;">Guru Pengampu Mata Pelajaran</p>
      <div class="sig-space"></div>
      <p style="font-weight: bold; text-decoration: underline;">${guru?.nama || 'Sudirman, S.Pd., M.Pd.'}</p>
      <p style="font-size: 7.5pt;">NIP. ${guru?.nip || '-'}</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;
    },
    [currentKelasObj, currentMapelObj, relevantCatatan, sekolah, guru, selectedSemester, selectedTahunAjaran]
  );

  // Print in new tab (bypasses iframe sandbox)
  const handlePrintNewTab = (orient = printOrientation, size = paperSize) => {
    const html = generatePrintableHtml(orient, size);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const w = window.open(blobUrl, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Jurnal_Refleksi_${orient}_${size}.html`;
      a.click();
      showToast('Popup diblokir, berkas cetak diunduh otomatis.', 'info');
    } else {
      showToast('Membuka lembar cetak jurnal di tab baru...', 'success');
    }
  };

  // Direct print
  const handleDirectPrint = () => {
    try {
      window.print();
    } catch {
      handlePrintNewTab(printOrientation, paperSize);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setSubView('pertemuan')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              subView === 'pertemuan'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Catatan & Refleksi Per Pertemuan (Jurnal Guru)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-extrabold">
              {relevantCatatan.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('rapor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              subView === 'rapor'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Catatan Evaluasi Siswa (Untuk Rapor)</span>
          </button>
        </div>

        {/* Global Action Toolbar */}
        {subView === 'pertemuan' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Orientation quick toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPrintOrientation('landscape')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  printOrientation === 'landscape'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format Cetak Mendatar (Landscape)"
              >
                <LayoutGrid className="w-3 h-3 rotate-90" />
                <span>Landscape</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintOrientation('portrait')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  printOrientation === 'portrait'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format Cetak Tegak (Portrait)"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Portrait</span>
              </button>
            </div>

            {/* Paper Size selector */}
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as 'F4' | 'A4')}
              className="bg-slate-50 font-semibold text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none cursor-pointer"
            >
              <option value="F4">Kertas F4</option>
              <option value="A4">Kertas A4</option>
            </select>

            {/* Export Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            {/* Print in new tab */}
            <button
              type="button"
              onClick={() => handlePrintNewTab(printOrientation, paperSize)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-2xs"
              title="Cetak Jurnal Catatan & Refleksi Pembelajaran"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Jurnal ({paperSize} {printOrientation === 'landscape' ? 'Landscape' : 'Portrait'})</span>
            </button>

            {/* Add New Meeting Note Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catatan Pertemuan Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: CATATAN & REFLEKSI GURU SETIAP PERTEMUAN          */}
      {/* ========================================================= */}
      {subView === 'pertemuan' && (
        <div className="space-y-4">
          {/* Header Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs no-print">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Pertemuan Terlaksana
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {relevantCatatan.length} <span className="text-xs font-normal text-slate-500">pertemuan</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Rata-rata Ketercapaian Materi
                </p>
                <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                  {relevantCatatan.length > 0
                    ? Math.round(
                        relevantCatatan.reduce((a, b) => a + (b.ketercapaian ?? 0), 0) /
                          relevantCatatan.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Catatan Siswa Perlu Perhatian
                </p>
                <p className="text-xl font-extrabold text-amber-600 mt-0.5">
                  {relevantCatatan.filter((c) => c.siswaPerhatian?.trim()).length}{' '}
                  <span className="text-xs font-normal text-slate-500">catatan</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs no-print text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi pokok, catatan proses, refleksi, atau pertemuan..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:bg-white transition"
              />
            </div>
            <div className="text-[11px] text-slate-500">
              Menampilkan {displayedCatatan.length} dari {relevantCatatan.length} pertemuan
            </div>
          </div>

          {/* List of Meetings (Cards) */}
          {displayedCatatan.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 shadow-2xs">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <h4 className="font-bold text-slate-800 text-sm">Belum Ada Catatan & Refleksi Pertemuan</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Catat jurnal pembelajaran harian, evaluasi diri/refleksi guru, serta tindak lanjut untuk kelas{' '}
                <strong>{currentKelasObj?.namaKelas}</strong> ({currentMapelObj?.namaMapel}).
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Catatan Pertemuan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {displayedCatatan.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-600 text-white">
                        Pertemuan {c.pertemuanKe}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {c.tanggal}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ketercapaian: {c.ketercapaian ?? 0}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 no-print">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition flex items-center gap-1 border border-indigo-100"
                        title="Edit Catatan Pertemuan"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.pertemuanKe)}
                        className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1"
                        title="Hapus Catatan Pertemuan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Materi Pokok & TP */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.materiPokok}</h4>
                    {c.tujuanPembelajaran && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        <strong className="text-slate-700">Tujuan Pembelajaran (TP):</strong>{' '}
                        {c.tujuanPembelajaran}
                      </p>
                    )}
                  </div>

                  {/* 3 Callouts: Catatan Proses, Refleksi, Tindak Lanjut */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* 1. Catatan Guru / Proses */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider mb-1">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        Catatan Proses Pembelajaran
                      </p>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {c.catatanGuru || <span className="italic text-slate-400">Tidak ada catatan khusus.</span>}
                      </p>
                    </div>

                    {/* 2. Refleksi Guru */}
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                      <p className="font-bold text-indigo-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider mb-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        Refleksi Guru (Evaluasi Diri)
                      </p>
                      <p className="text-indigo-950 text-xs leading-relaxed">
                        {c.refleksiGuru || <span className="italic text-indigo-400">Tidak ada refleksi.</span>}
                      </p>
                    </div>

                    {/* 3. Rencana Tindak Lanjut */}
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <p className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider mb-1">
                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                        Rencana Tindak Lanjut
                      </p>
                      <p className="text-emerald-950 text-xs leading-relaxed">
                        {c.tindakLanjut || (
                          <span className="italic text-emerald-400">Lanjut ke materi berikutnya.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Special attention note if any */}
                  {c.siswaPerhatian && (
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        <strong>Siswa yang Perlu Perhatian / Pendampingan:</strong> {c.siswaPerhatian}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: CATATAN EVALUASI SISWA UNTUK RAPOR                */}
      {/* ========================================================= */}
      {subView === 'rapor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">
              Catatan Evaluasi Perkembangan Akademik Siswa (Untuk Rapor)
            </h3>
            <p className="text-xs text-slate-500">
              Kelebihan siswa, aspek yang perlu ditingkatkan, dan pesan motivasi guru yang dicetak di buku rapor.
            </p>
          </div>

          <div className="divide-y divide-slate-100 p-4 space-y-4">
            {activeStudents.map((s, idx) => {
              const rec = gradesMap[s.id];
              return (
                <div key={s.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="w-56 shrink-0">
                    <p className="font-bold text-slate-900 text-xs">
                      {idx + 1}. {s.nama}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">NIS: {s.nis}</p>
                    <p className="text-[11px] text-indigo-700 font-bold mt-1">
                      Nilai Akhir: {rec?.nilaiAkhir || 0} ({rec?.predikat || '-'})
                    </p>
                  </div>

                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={rec?.catatan || ''}
                      onChange={(e) => onCatatanSiswaChange(s.id, e.target.value)}
                      placeholder={`Catatan untuk ${s.nama}: contoh: "Menunjukkan pemahaman logika matematika yang baik. Tingkatkan ketelitian pada soal aljabar pecahan."`}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FORM TAMBAH / EDIT CATATAN & REFLEKSI PERTEMUAN   */}
      {/* ========================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingId ? 'Edit Catatan & Refleksi Pertemuan' : 'Tambah Catatan & Refleksi Pertemuan'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Kelas {currentKelasObj?.namaKelas} &bull; {currentMapelObj?.namaMapel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveForm} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Quick Template Presets */}
              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Gunakan Contoh Refleksi Cepat:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('interaktif')}
                    className="px-2 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition text-[10px]"
                  >
                    Diskusi Interaktif
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('remedial')}
                    className="px-2 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition text-[10px]"
                  >
                    Asesmen & Remedial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('projek')}
                    className="px-2 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition text-[10px]"
                  >
                    Projek / Praktik
                  </button>
                </div>
              </div>

              {/* Row 1: Pertemuan Ke & Tanggal & Ketercapaian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pertemuan Ke-</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.pertemuanKe}
                    onChange={(e) =>
                      setFormData({ ...formData, pertemuanKe: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Pertemuan</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ketercapaian Materi (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.ketercapaian}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ketercapaian: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 focus:border-indigo-500"
                    />
                    <span className="font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Materi Pokok */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Materi Pokok / Topik Pembelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.materiPokok}
                  onChange={(e) => setFormData({ ...formData, materiPokok: e.target.value })}
                  placeholder="Contoh: Sifat-sifat Eksponen dan Operasi Bilangan Berpangkat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-medium text-slate-800 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Row 3: Tujuan Pembelajaran (TP) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tujuan Pembelajaran (TP) / Capaian Pembelajaran
                </label>
                <input
                  type="text"
                  value={formData.tujuanPembelajaran}
                  onChange={(e) => setFormData({ ...formData, tujuanPembelajaran: e.target.value })}
                  placeholder="Contoh: Siswa dapat menyelesaikan persamaan eksponen bentuk a^f(x) = a^p"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none text-slate-800 focus:border-indigo-500"
                />
              </div>

              {/* Row 4: Catatan Guru (Proses Pelaksanaan) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Guru (Kejadian & Proses Pembelajaran di Kelas)
                </label>
                <textarea
                  rows={2}
                  value={formData.catatanGuru}
                  onChange={(e) => setFormData({ ...formData, catatanGuru: e.target.value })}
                  placeholder="Ceritakan jalannya proses pembelajaran, keaktifan siswa, atau kejadian unik di kelas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none text-slate-800 focus:border-indigo-500"
                />
              </div>

              {/* Row 5: Refleksi Guru */}
              <div>
                <label className="block font-bold text-indigo-900 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Refleksi Guru (Evaluasi Diri: Apa yang Berhasil & Kendala yang Dialami)
                </label>
                <textarea
                  rows={2}
                  value={formData.refleksiGuru}
                  onChange={(e) => setFormData({ ...formData, refleksiGuru: e.target.value })}
                  placeholder="Apa yang sudah berjalan optimal? Bagian materi mana yang masih sulit dipahami siswa? Kendala apa yang dihadapi guru?"
                  className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/30 rounded-xl outline-none text-slate-800 focus:border-indigo-500"
                />
              </div>

              {/* Row 6: Rencana Tindak Lanjut */}
              <div>
                <label className="block font-bold text-emerald-900 mb-1 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  Rencana Tindak Lanjut untuk Pertemuan Berikutnya
                </label>
                <textarea
                  rows={2}
                  value={formData.tindakLanjut}
                  onChange={(e) => setFormData({ ...formData, tindakLanjut: e.target.value })}
                  placeholder="Langkah perbaikan, remedial kelompok kecil, pengayaan, atau penguatan konsep di pertemuan selanjutnya..."
                  className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50/30 rounded-xl outline-none text-slate-800 focus:border-emerald-500"
                />
              </div>

              {/* Row 7: Siswa Perlu Perhatian */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Siswa yang Perlu Perhatian Khusus / Remedial
                </label>
                <input
                  type="text"
                  value={formData.siswaPerhatian}
                  onChange={(e) => setFormData({ ...formData, siswaPerhatian: e.target.value })}
                  placeholder="Contoh: Budi Santoso (kesulitan perkalian negatif), Citra (sering terlambat)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none text-slate-800 focus:border-indigo-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Catatan Pertemuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
