import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileEdit,
  Save,
  Plus,
  Trash2,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Smile,
  Zap,
} from 'lucide-react';
import {
  Siswa,
  Kelas,
  Mapel,
  NilaiSiswa,
  BobotNilai,
  Semester,
  PredikatKelakuan,
  CatatanRefleksiPertemuan,
  ProfilSekolah,
  ProfilGuru,
} from '../types';
import { StorageService } from '../services/storageService';
import { CatatanRefleksiView } from './CatatanRefleksiView';

interface PenilaianViewProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  mapelList: Mapel[];
  nilaiList: NilaiSiswa[];
  bobotNilai: BobotNilai;
  selectedTahunAjaran: string;
  selectedSemester: Semester;
  selectedKelasId: string;
  selectedMapelId: string;
  onSaveBatchNilai: (records: NilaiSiswa[]) => void;
  onSaveBobot: (bobot: BobotNilai) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  initialTab?: 'tugas' | 'formatif' | 'sumatifLm' | 'sas' | 'kelakuan' | 'catatan' | 'bobot';
  catatanRefleksiList?: CatatanRefleksiPertemuan[];
  onSaveCatatanRefleksiList?: (list: CatatanRefleksiPertemuan[]) => void;
  sekolah?: ProfilSekolah;
  guru?: ProfilGuru;
}

export const PenilaianView: React.FC<PenilaianViewProps> = ({
  siswaList,
  kelasList,
  mapelList,
  nilaiList,
  bobotNilai,
  selectedTahunAjaran,
  selectedSemester,
  selectedKelasId,
  selectedMapelId,
  onSaveBatchNilai,
  onSaveBobot,
  showToast,
  initialTab,
  catatanRefleksiList,
  onSaveCatatanRefleksiList,
  sekolah,
  guru,
}) => {
  // Tabs for grading sub-sections
  const [activeTab, setActiveTab] = useState<'tugas' | 'formatif' | 'sumatifLm' | 'sas' | 'kelakuan' | 'catatan' | 'bobot'>(
    initialTab || 'tugas'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filter students for current class
  const activeStudents = useMemo(() => {
    return siswaList.filter((s) => s.kelasId === selectedKelasId && s.status === 'Aktif');
  }, [siswaList, selectedKelasId]);

  // Current Mapel
  const currentMapel = mapelList.find((m) => m.id === selectedMapelId);
  const kktp = currentMapel?.kktp || 75;

  // Local state for all student grade records: Map of siswaId -> NilaiSiswa
  const [gradesMap, setGradesMap] = useState<Record<string, NilaiSiswa>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dynamic column counts
  const [tugasCols, setTugasCols] = useState<number>(3);
  const [formatifCols, setFormatifCols] = useState<number>(3);
  const [sumatifCols, setSumatifCols] = useState<number>(3);

  // Local bobot state
  const [localBobot, setLocalBobot] = useState<BobotNilai>({ ...bobotNilai });

  // Initialize grade records from props or create fresh ones
  useEffect(() => {
    const map: Record<string, NilaiSiswa> = {};
    let maxT = 3;
    let maxF = 3;
    let maxS = 3;

    activeStudents.forEach((s) => {
      const existing = nilaiList.find(
        (n) =>
          n.siswaId === s.id &&
          n.kelasId === selectedKelasId &&
          n.mapelId === selectedMapelId &&
          n.tahunAjaran === selectedTahunAjaran &&
          n.semester === selectedSemester
      );

      if (existing) {
        map[s.id] = JSON.parse(JSON.stringify(existing));
        if (existing.tugas.length > maxT) maxT = existing.tugas.length;
        if (existing.formatif.length > maxF) maxF = existing.formatif.length;
        if (existing.sumatifLm.length > maxS) maxS = existing.sumatifLm.length;
      } else {
        const now = new Date().toISOString();
        map[s.id] = {
          id: `nil-${s.id}-${selectedMapelId}-${selectedSemester}`,
          siswaId: s.id,
          kelasId: selectedKelasId,
          mapelId: selectedMapelId,
          tahunAjaran: selectedTahunAjaran,
          semester: selectedSemester,
          tugas: [80, 85, 80],
          formatif: [78, 82, 80],
          sumatifLm: [80, 85, 82],
          sumatifAkhir: 80,
          rataTugas: 81.67,
          rataFormatif: 80,
          rataSumatifLm: 82.33,
          nilaiAkhir: 81,
          predikat: 'B',
          keterangan: 'Tuntas',
          catatan: '',
          kelakuan: {
            kedisiplinan: 'A',
            tanggungJawab: 'A',
            kejujuran: 'A',
            kerjasama: 'B',
            kesopanan: 'A',
            deskripsi: 'Sangat disiplin dan bersikap sopan santun.',
          },
          createdAt: now,
          updatedAt: now,
        };
      }
    });

    setTugasCols(maxT);
    setFormatifCols(maxF);
    setSumatifCols(maxS);
    setGradesMap(map);
    setHasUnsavedChanges(false);
  }, [activeStudents, nilaiList, selectedKelasId, selectedMapelId, selectedTahunAjaran, selectedSemester]);

  // Recalculate averages and final grade for a student record
  const recalculateRecord = (record: NilaiSiswa, bobot: BobotNilai): NilaiSiswa => {
    const validTugas = (record.tugas || []).filter((v) => typeof v === 'number' && !isNaN(v));
    const validFormatif = (record.formatif || []).filter((v) => typeof v === 'number' && !isNaN(v));
    const validSumatif = (record.sumatifLm || []).filter((v) => typeof v === 'number' && !isNaN(v));

    const rataTugas = validTugas.length > 0 ? validTugas.reduce((a, b) => a + b, 0) / validTugas.length : 0;
    const rataFormatif =
      validFormatif.length > 0 ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length : 0;
    const rataSumatifLm = validSumatif.length > 0 ? validSumatif.reduce((a, b) => a + b, 0) / validSumatif.length : 0;
    const sas = record.sumatifAkhir || 0;

    // Nilai Akhir Formula (Requirement 22)
    const nilaiAkhir = Math.round(
      (rataTugas * bobot.tugas) / 100 +
        (rataFormatif * bobot.formatif) / 100 +
        (rataSumatifLm * bobot.sumatifLm) / 100 +
        (sas * bobot.sumatifAkhir) / 100
    );

    let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
    if (nilaiAkhir >= 90) predikat = 'A';
    else if (nilaiAkhir >= 80) predikat = 'B';
    else if (nilaiAkhir >= kktp) predikat = 'C';
    else predikat = 'D';

    const keterangan = nilaiAkhir >= kktp ? 'Tuntas' : 'Belum Tuntas (Perlu Remedial)';

    return {
      ...record,
      rataTugas: Math.round(rataTugas * 100) / 100,
      rataFormatif: Math.round(rataFormatif * 100) / 100,
      rataSumatifLm: Math.round(rataSumatifLm * 100) / 100,
      nilaiAkhir,
      predikat,
      keterangan,
      updatedAt: new Date().toISOString(),
    };
  };

  // Input change helper for dynamic score arrays
  const handleScoreChange = (
    siswaId: string,
    type: 'tugas' | 'formatif' | 'sumatifLm',
    index: number,
    valueStr: string
  ) => {
    const val = valueStr === '' ? 0 : Math.min(100, Math.max(0, Number(valueStr)));
    setGradesMap((prev) => {
      const current = prev[siswaId];
      if (!current) return prev;

      const newArr = [...current[type]];
      newArr[index] = val;

      const updated = {
        ...current,
        [type]: newArr,
      };

      return {
        ...prev,
        [siswaId]: recalculateRecord(updated, localBobot),
      };
    });
    setHasUnsavedChanges(true);
  };

  // SAS change
  const handleSasChange = (siswaId: string, valueStr: string) => {
    const val = valueStr === '' ? 0 : Math.min(100, Math.max(0, Number(valueStr)));
    setGradesMap((prev) => {
      const current = prev[siswaId];
      if (!current) return prev;

      const updated = {
        ...current,
        sumatifAkhir: val,
      };

      return {
        ...prev,
        [siswaId]: recalculateRecord(updated, localBobot),
      };
    });
    setHasUnsavedChanges(true);
  };

  // Kelakuan change
  const handleKelakuanChange = (siswaId: string, field: string, value: any) => {
    setGradesMap((prev) => {
      const current = prev[siswaId];
      if (!current) return prev;

      const updated = {
        ...current,
        kelakuan: {
          ...current.kelakuan,
          [field]: value,
        },
      };

      return {
        ...prev,
        [siswaId]: updated,
      };
    });
    setHasUnsavedChanges(true);
  };

  // Catatan Guru change
  const handleCatatanChange = (siswaId: string, value: string) => {
    setGradesMap((prev) => {
      const current = prev[siswaId];
      if (!current) return prev;

      return {
        ...prev,
        [siswaId]: {
          ...current,
          catatan: value,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Add dynamic column
  const handleAddColumn = (type: 'tugas' | 'formatif' | 'sumatifLm') => {
    if (type === 'tugas') setTugasCols((prev) => prev + 1);
    if (type === 'formatif') setFormatifCols((prev) => prev + 1);
    if (type === 'sumatifLm') setSumatifCols((prev) => prev + 1);

    setGradesMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((sId) => {
        const item = next[sId];
        const arr = [...item[type], 0];
        next[sId] = recalculateRecord({ ...item, [type]: arr }, localBobot);
      });
      return next;
    });
    showToast(`Kolom ${type} baru berhasil ditambahkan.`, 'info');
  };

  // Save all changes
  const handleSaveAll = () => {
    const records = Object.values(gradesMap);
    onSaveBatchNilai(records);
    setHasUnsavedChanges(false);
    showToast(`Nilai siswa (${records.length} data) berhasil disimpan!`, 'success');
  };

  // Bobot Total Check
  const totalBobot =
    Number(localBobot.tugas) +
    Number(localBobot.formatif) +
    Number(localBobot.sumatifLm) +
    Number(localBobot.sumatifAkhir);

  const handleSaveBobotForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBobot !== 100) {
      showToast(`Total bobot harus tepat 100%. Saat ini total adalah ${totalBobot}%.`, 'error');
      return;
    }
    onSaveBobot(localBobot);
    // Recalculate all students with new weights
    setGradesMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((sId) => {
        next[sId] = recalculateRecord(next[sId], localBobot);
      });
      return next;
    });
    setHasUnsavedChanges(true);
    showToast('Pengaturan bobot penilaian berhasil disimpan!', 'success');
  };

  // Keyboard Navigation: Enter or Down moves to next student cell
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, curIndex: number, colKey: string) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextId = `cell_${colKey}_${curIndex + 1}`;
      const el = document.getElementById(nextId);
      if (el) (el as HTMLInputElement).focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevId = `cell_${colKey}_${curIndex - 1}`;
      const el = document.getElementById(prevId);
      if (el) (el as HTMLInputElement).focus();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Penilaian Akademik</h2>
            {hasUnsavedChanges ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Ada perubahan belum disimpan
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Semua data tersimpan
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapel: <strong className="text-slate-800">{currentMapel?.namaMapel}</strong> • KKTP:{' '}
            <strong className="text-emerald-700">{kktp}</strong> • Bobot:{' '}
            <span className="text-slate-600 font-mono">
              Tugas {localBobot.tugas}% | Formatif {localBobot.formatif}% | Sumatif {localBobot.sumatifLm}% | SAS{' '}
              {localBobot.sumatifAkhir}%
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Nilai</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NILAI TUGAS (1..N) */}
      {activeTab === 'tugas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Penilaian Tugas Harian Siswa (Dinamis 1..N)</h3>
              <p className="text-xs text-slate-500">
                Gunakan tombol panah bawah atau Enter untuk navigasi input cepat layaknya Excel.
              </p>
            </div>
            <button
              onClick={() => handleAddColumn('tugas')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-indigo-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kolom Tugas</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3 w-20">NIS</th>
                  <th className="py-3 px-4 min-w-[180px]">Nama Lengkap</th>
                  {Array.from({ length: tugasCols }).map((_, colIdx) => (
                    <th key={colIdx} className="py-3 px-2 text-center w-24">
                      Tugas {colIdx + 1}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center w-28 bg-indigo-50/60 text-indigo-900 font-bold">
                    Rata-Rata Tugas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeStudents.map((s, rowIdx) => {
                  const rec = gradesMap[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{rowIdx + 1}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-700">{s.nis}</td>
                      <td className="py-2 px-4 font-bold text-slate-900">{s.nama}</td>
                      {Array.from({ length: tugasCols }).map((_, colIdx) => {
                        const val = rec?.tugas[colIdx] ?? 0;
                        return (
                          <td key={colIdx} className="py-2 px-2 text-center">
                            <input
                              id={`cell_tugas_${colIdx}_${rowIdx}`}
                              type="number"
                              min="0"
                              max="100"
                              value={val === 0 ? '' : val}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(s.id, 'tugas', colIdx, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, `tugas_${colIdx}`)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center font-mono font-bold text-indigo-700 text-sm bg-indigo-50/30">
                        {rec?.rataTugas ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NILAI FORMATIF (1..N) */}
      {activeTab === 'formatif' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Penilaian Asesmen Formatif (Dinamis 1..N)</h3>
              <p className="text-xs text-slate-500">Nilai asesmen formatif proses belajar dan pemahaman materi.</p>
            </div>
            <button
              onClick={() => handleAddColumn('formatif')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-indigo-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kolom Formatif</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3 w-20">NIS</th>
                  <th className="py-3 px-4 min-w-[180px]">Nama Lengkap</th>
                  {Array.from({ length: formatifCols }).map((_, colIdx) => (
                    <th key={colIdx} className="py-3 px-2 text-center w-24">
                      Formatif {colIdx + 1}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center w-28 bg-emerald-50/60 text-emerald-900 font-bold">
                    Rata Formatif
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeStudents.map((s, rowIdx) => {
                  const rec = gradesMap[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{rowIdx + 1}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-700">{s.nis}</td>
                      <td className="py-2 px-4 font-bold text-slate-900">{s.nama}</td>
                      {Array.from({ length: formatifCols }).map((_, colIdx) => {
                        const val = rec?.formatif[colIdx] ?? 0;
                        return (
                          <td key={colIdx} className="py-2 px-2 text-center">
                            <input
                              id={`cell_formatif_${colIdx}_${rowIdx}`}
                              type="number"
                              min="0"
                              max="100"
                              value={val === 0 ? '' : val}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(s.id, 'formatif', colIdx, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, `formatif_${colIdx}`)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700 text-sm bg-emerald-50/30">
                        {rec?.rataFormatif ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUMATIF LINGKUP MATERI (1..N) */}
      {activeTab === 'sumatifLm' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Sumatif Lingkup Materi / Ulangan Harian (1..N)</h3>
              <p className="text-xs text-slate-500">Penilaian capaian kompetensi per bab/elemen materi.</p>
            </div>
            <button
              onClick={() => handleAddColumn('sumatifLm')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-indigo-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Sumatif LM</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3 w-20">NIS</th>
                  <th className="py-3 px-4 min-w-[180px]">Nama Lengkap</th>
                  {Array.from({ length: sumatifCols }).map((_, colIdx) => (
                    <th key={colIdx} className="py-3 px-2 text-center w-24">
                      Sumatif {colIdx + 1}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center w-28 bg-purple-50/60 text-purple-900 font-bold">
                    Rata Sumatif LM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeStudents.map((s, rowIdx) => {
                  const rec = gradesMap[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{rowIdx + 1}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-700">{s.nis}</td>
                      <td className="py-2 px-4 font-bold text-slate-900">{s.nama}</td>
                      {Array.from({ length: sumatifCols }).map((_, colIdx) => {
                        const val = rec?.sumatifLm[colIdx] ?? 0;
                        return (
                          <td key={colIdx} className="py-2 px-2 text-center">
                            <input
                              id={`cell_sumatifLm_${colIdx}_${rowIdx}`}
                              type="number"
                              min="0"
                              max="100"
                              value={val === 0 ? '' : val}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(s.id, 'sumatifLm', colIdx, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, `sumatifLm_${colIdx}`)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            />
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center font-mono font-bold text-purple-700 text-sm bg-purple-50/30">
                        {rec?.rataSumatifLm ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUMATIF AKHIR SEMESTER (SAS) & NILAI AKHIR */}
      {activeTab === 'sas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Sumatif Akhir Semester (SAS) & Hasil Nilai Rapor</h3>
              <p className="text-xs text-slate-500">
                Nilai Akhir dan Predikat terhitung otomatis berdasarkan bobot persentase resmi.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              KKTP: {kktp}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3 w-20">NIS</th>
                  <th className="py-3 px-4 min-w-[180px]">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">Rata Tugas</th>
                  <th className="py-3 px-3 text-center">Rata Formatif</th>
                  <th className="py-3 px-3 text-center">Rata Sumatif LM</th>
                  <th className="py-3 px-3 text-center w-28 bg-amber-50 text-amber-900">Nilai SAS</th>
                  <th className="py-3 px-3 text-center w-24 bg-indigo-50 text-indigo-900 font-bold">Nilai Akhir</th>
                  <th className="py-3 px-3 text-center w-16">Predikat</th>
                  <th className="py-3 px-4 text-center">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeStudents.map((s, rowIdx) => {
                  const rec = gradesMap[s.id];
                  const isTuntas = (rec?.nilaiAkhir ?? 0) >= kktp;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{rowIdx + 1}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-700">{s.nis}</td>
                      <td className="py-2 px-4 font-bold text-slate-900">{s.nama}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{rec?.rataTugas ?? 0}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{rec?.rataFormatif ?? 0}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{rec?.rataSumatifLm ?? 0}</td>
                      <td className="py-2 px-3 text-center bg-amber-50/40">
                        <input
                          id={`cell_sas_${rowIdx}`}
                          type="number"
                          min="0"
                          max="100"
                          value={rec?.sumatifAkhir === 0 ? '' : rec?.sumatifAkhir}
                          placeholder="0"
                          onChange={(e) => handleSasChange(s.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIdx, 'sas')}
                          className="w-16 px-2 py-1 text-center font-mono font-bold text-amber-900 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-extrabold text-base text-indigo-700 bg-indigo-50/40">
                        {rec?.nilaiAkhir ?? 0}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span
                          className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs ${
                            rec?.predikat === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec?.predikat === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : rec?.predikat === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec?.predikat ?? 'D'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec?.keterangan || (isTuntas ? 'Tuntas' : 'Perlu Remedial')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PENILAIAN KARAKTER & KELAKUAN (Requirement 20) */}
      {activeTab === 'kelakuan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">Penilaian Karakter & Kelakuan Siswa</h3>
            <p className="text-xs text-slate-500">
              Mencakup Kedisiplinan, Tanggung Jawab, Kejujuran, Kerjasama, Kesopanan, dan Catatan Perilaku.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[180px]">Nama Siswa</th>
                  <th className="py-3 px-2 text-center w-24">Disiplin</th>
                  <th className="py-3 px-2 text-center w-24">Tgg. Jawab</th>
                  <th className="py-3 px-2 text-center w-24">Kejujuran</th>
                  <th className="py-3 px-2 text-center w-24">Kerjasama</th>
                  <th className="py-3 px-2 text-center w-24">Kesopanan</th>
                  <th className="py-3 px-4 min-w-[240px]">Deskripsi Karakter Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeStudents.map((s, idx) => {
                  const kel = gradesMap[s.id]?.kelakuan || {
                    kedisiplinan: 'A',
                    tanggungJawab: 'A',
                    kejujuran: 'A',
                    kerjasama: 'B',
                    kesopanan: 'A',
                    deskripsi: '',
                  };

                  const renderSelect = (field: string, val: PredikatKelakuan) => (
                    <select
                      value={val}
                      onChange={(e) => handleKelakuanChange(s.id, field, e.target.value as PredikatKelakuan)}
                      className="w-16 px-1.5 py-1 text-center font-bold border border-slate-200 rounded-lg outline-none bg-white"
                    >
                      <option value="A">A (Sangat Baik)</option>
                      <option value="B">B (Baik)</option>
                      <option value="C">C (Cukup)</option>
                      <option value="D">D (Kurang)</option>
                    </select>
                  );

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{s.nama}</td>
                      <td className="py-2 px-2 text-center">{renderSelect('kedisiplinan', kel.kedisiplinan)}</td>
                      <td className="py-2 px-2 text-center">{renderSelect('tanggungJawab', kel.tanggungJawab)}</td>
                      <td className="py-2 px-2 text-center">{renderSelect('kejujuran', kel.kejujuran)}</td>
                      <td className="py-2 px-2 text-center">{renderSelect('kerjasama', kel.kerjasama)}</td>
                      <td className="py-2 px-2 text-center">{renderSelect('kesopanan', kel.kesopanan)}</td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={kel.deskripsi}
                          onChange={(e) => handleKelakuanChange(s.id, 'deskripsi', e.target.value)}
                          placeholder="Deskripsi perilaku untuk rapor"
                          className="w-full px-2.5 py-1 border border-slate-200 rounded-lg outline-none text-slate-800"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CATATAN GURU & REFLEKSI SETIAP PERTEMUAN */}
      {activeTab === 'catatan' && (
        <CatatanRefleksiView
          catatanList={catatanRefleksiList || []}
          onSaveList={onSaveCatatanRefleksiList || (() => {})}
          selectedKelasId={selectedKelasId}
          selectedMapelId={selectedMapelId}
          selectedSemester={selectedSemester}
          selectedTahunAjaran={selectedTahunAjaran}
          kelasList={kelasList}
          mapelList={mapelList}
          activeStudents={activeStudents}
          gradesMap={gradesMap}
          onCatatanSiswaChange={handleCatatanChange}
          sekolah={sekolah}
          guru={guru}
          showToast={showToast}
        />
      )}

      {/* TAB 7: PENGATURAN BOBOT NILAI (Requirement 21) */}
      {activeTab === 'bobot' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6 max-w-2xl mx-auto">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900">Pengaturan Bobot Perhitungan Nilai Rapor</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan bobot persentase komponen penilaian sesuai kurikulum sekolah. Total akumulasi bobot WAJIB tepat
              100%.
            </p>
          </div>

          <form onSubmit={handleSaveBobotForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-800 mb-1">Bobot Tugas Harian (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localBobot.tugas}
                    onChange={(e) => setLocalBobot({ ...localBobot, tugas: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl outline-none"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-800 mb-1">Bobot Asesmen Formatif (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localBobot.formatif}
                    onChange={(e) => setLocalBobot({ ...localBobot, formatif: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl outline-none"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-800 mb-1">Bobot Sumatif Lingkup Materi (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localBobot.sumatifLm}
                    onChange={(e) => setLocalBobot({ ...localBobot, sumatifLm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl outline-none"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-800 mb-1">Bobot Sumatif Akhir (SAS) (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localBobot.sumatifAkhir}
                    onChange={(e) => setLocalBobot({ ...localBobot, sumatifAkhir: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl outline-none"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>
            </div>

            {/* Total Indicator */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between font-bold text-sm ${
                totalBobot === 100
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {totalBobot === 100 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>Total Akumulasi Bobot:</span>
              </div>
              <span className="text-lg font-mono">{totalBobot}% / 100%</span>
            </div>

            {totalBobot !== 100 && (
              <p className="text-[11px] text-rose-600">
                Peringatan: Jumlah total persentase bobot harus tepat 100%. Silakan sesuaikan kembali sebelum menyimpan.
              </p>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={totalBobot !== 100}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition"
              >
                Simpan Konfigurasi Bobot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
