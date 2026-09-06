import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Link as LinkIcon,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react';
import { Kelas, Mapel, RelasiKelasMapel, Semester } from '../types';

interface KelasMapelViewProps {
  kelasList: Kelas[];
  mapelList: Mapel[];
  relasiList: RelasiKelasMapel[];
  selectedTahunAjaran: string;
  selectedSemester: Semester;
  onSaveKelas: (k: Kelas) => void;
  onDeleteKelas: (id: string) => void;
  onSaveMapel: (m: Mapel) => void;
  onDeleteMapel: (id: string) => void;
  onSaveRelasi: (r: RelasiKelasMapel) => void;
  onDeleteRelasi: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const KelasMapelView: React.FC<KelasMapelViewProps> = ({
  kelasList,
  mapelList,
  relasiList,
  selectedTahunAjaran,
  selectedSemester,
  onSaveKelas,
  onDeleteKelas,
  onSaveMapel,
  onDeleteMapel,
  onSaveRelasi,
  onDeleteRelasi,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'kelas' | 'mapel' | 'relasi'>('kelas');

  // Modal states
  const [kelasModal, setKelasModal] = useState<{ open: boolean; item?: Kelas }>({ open: false });
  const [mapelModal, setMapelModal] = useState<{ open: boolean; item?: Mapel }>({ open: false });
  const [relasiModal, setRelasiModal] = useState<{ open: boolean }>({ open: false });

  // Form states for Kelas
  const [kelasForm, setKelasForm] = useState<Partial<Kelas>>({
    tingkat: 'X',
    namaKelas: '',
    waliKelas: '',
    status: 'Aktif',
  });

  // Form states for Mapel
  const [mapelForm, setMapelForm] = useState<Partial<Mapel>>({
    kode: '',
    namaMapel: '',
    kelompok: 'Umum',
    kktp: 75,
    jamPelajaran: 4,
    status: 'Aktif',
  });

  // Form states for Relasi
  const [relasiForm, setRelasiForm] = useState<{ kelasId: string; mapelId: string }>({
    kelasId: kelasList[0]?.id || '',
    mapelId: mapelList[0]?.id || '',
  });

  const handleOpenKelasModal = (item?: Kelas) => {
    if (item) {
      setKelasForm(item);
    } else {
      setKelasForm({
        id: `kls-${Date.now()}`,
        tahunAjaran: selectedTahunAjaran,
        tingkat: 'X',
        namaKelas: '',
        waliKelas: '',
        status: 'Aktif',
      });
    }
    setKelasModal({ open: true, item });
  };

  const handleOpenMapelModal = (item?: Mapel) => {
    if (item) {
      setMapelForm(item);
    } else {
      setMapelForm({
        id: `mpl-${Date.now()}`,
        kode: '',
        namaMapel: '',
        kelompok: 'Umum',
        kktp: 75,
        jamPelajaran: 4,
        status: 'Aktif',
      });
    }
    setMapelModal({ open: true, item });
  };

  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasForm.namaKelas?.trim()) {
      showToast('Nama kelas tidak boleh kosong', 'warning');
      return;
    }
    onSaveKelas({
      id: kelasForm.id || `kls-${Date.now()}`,
      tahunAjaran: selectedTahunAjaran,
      tingkat: kelasForm.tingkat || 'X',
      namaKelas: kelasForm.namaKelas || '',
      waliKelas: kelasForm.waliKelas || '',
      status: kelasForm.status || 'Aktif',
    });
    setKelasModal({ open: false });
    showToast('Data kelas berhasil disimpan!', 'success');
  };

  const handleSaveMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelForm.namaMapel?.trim()) {
      showToast('Nama mata pelajaran tidak boleh kosong', 'warning');
      return;
    }
    onSaveMapel({
      id: mapelForm.id || `mpl-${Date.now()}`,
      kode: mapelForm.kode || mapelForm.namaMapel.substr(0, 5).toUpperCase(),
      namaMapel: mapelForm.namaMapel || '',
      kelompok: mapelForm.kelompok || 'Umum',
      kktp: Number(mapelForm.kktp) || 75,
      jamPelajaran: Number(mapelForm.jamPelajaran) || 4,
      status: mapelForm.status || 'Aktif',
    });
    setMapelModal({ open: false });
    showToast('Data mata pelajaran berhasil disimpan!', 'success');
  };

  const handleSaveRelasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relasiForm.kelasId || !relasiForm.mapelId) {
      showToast('Silakan pilih kelas dan mata pelajaran', 'warning');
      return;
    }
    onSaveRelasi({
      id: `rel-${Date.now()}`,
      kelasId: relasiForm.kelasId,
      mapelId: relasiForm.mapelId,
      tahunAjaran: selectedTahunAjaran,
      semester: selectedSemester,
    });
    setRelasiModal({ open: false });
    showToast('Relasi kelas & mata pelajaran berhasil ditambahkan!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kelas, Mata Pelajaran & Relasi Ajar</h2>
          <p className="text-xs text-slate-500">
            Kelola kelas yang diajar, mata pelajaran, KKM/KKTP, dan alokasi jam tatap muka guru.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('kelas')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'kelas' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Kelas ({kelasList.length})
          </button>
          <button
            onClick={() => setActiveTab('mapel')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'mapel' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mata Pelajaran ({mapelList.length})
          </button>
          <button
            onClick={() => setActiveTab('relasi')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'relasi' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Relasi Pengajaran ({relasiList.length})
          </button>
        </div>
      </div>

      {/* TAB 1: KELAS */}
      {activeTab === 'kelas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Daftar Rombongan Belajar (Kelas)</h3>
              <p className="text-xs text-slate-500">Tahun Ajaran Aktif: {selectedTahunAjaran}</p>
            </div>
            <button
              onClick={() => handleOpenKelasModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Nama Kelas</th>
                  <th className="py-3 px-4">Wali Kelas</th>
                  <th className="py-3 px-4">Tahun Ajaran</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {kelasList.map((k, idx) => (
                  <tr key={k.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{k.tingkat}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700 text-sm">{k.namaKelas}</td>
                    <td className="py-3.5 px-4 font-medium">{k.waliKelas || '-'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{k.tahunAjaran}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenKelasModal(k)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kelas ${k.namaKelas}?`)) {
                            onDeleteKelas(k.id);
                            showToast(`Kelas ${k.namaKelas} dihapus.`, 'info');
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MAPEL */}
      {activeTab === 'mapel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Daftar Mata Pelajaran & Kriteria Kelulusan (KKTP)</h3>
              <p className="text-xs text-slate-500">Standar KKTP dan beban jam tatap muka per minggu</p>
            </div>
            <button
              onClick={() => handleOpenMapelModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Mapel</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Mata Pelajaran</th>
                  <th className="py-3 px-4">Kelompok</th>
                  <th className="py-3 px-4 text-center">KKTP / KKM</th>
                  <th className="py-3 px-4 text-center">Beban (JP)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mapelList.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{m.kode}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.namaMapel}</td>
                    <td className="py-3.5 px-4">{m.kelompok}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700 text-sm">
                      {m.kktp}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{m.jamPelajaran} JP</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenMapelModal(m)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Mapel"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus mapel ${m.namaMapel}?`)) {
                            onDeleteMapel(m.id);
                            showToast(`Mapel ${m.namaMapel} dihapus.`, 'info');
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Mapel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RELASI KELAS & MAPEL (Requirement 10) */}
      {activeTab === 'relasi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Pemetaan Pengajaran Guru (Relasi Kelas & Mapel)</h3>
              <p className="text-xs text-slate-500">
                Satu guru mengajar beberapa kelas dan beberapa mata pelajaran secara terorganisir
              </p>
            </div>
            <button
              onClick={() => setRelasiModal({ open: true })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Hubungkan Kelas & Mapel</span>
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relasiList.map((rel) => {
              const k = kelasList.find((x) => x.id === rel.kelasId);
              const m = mapelList.find((x) => x.id === rel.mapelId);
              return (
                <div
                  key={rel.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Kelas {k?.namaKelas || 'Unknown'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{m?.namaMapel || 'Unknown'}</h4>
                    <p className="text-[11px] text-slate-500">
                      KKTP: <span className="font-semibold text-slate-700">{m?.kktp || 75}</span> • Alokasi:{' '}
                      <span className="font-semibold text-slate-700">{m?.jamPelajaran || 4} JP</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Hapus relasi pengajaran ini?')) {
                        onDeleteRelasi(rel.id);
                        showToast('Relasi dihapus.', 'info');
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL KELAS */}
      {kelasModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {kelasModal.item ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button onClick={() => setKelasModal({ open: false })} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveKelas} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat / Fase</label>
                <select
                  value={kelasForm.tingkat}
                  onChange={(e) => setKelasForm({ ...kelasForm, tingkat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="X">Kelas X (Fase E)</option>
                  <option value="XI">Kelas XI (Fase F)</option>
                  <option value="XII">Kelas XII (Fase F)</option>
                  <option value="7">Kelas 7 (Fase D)</option>
                  <option value="8">Kelas 8 (Fase D)</option>
                  <option value="9">Kelas 9 (Fase D)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Rombel / Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X A atau XI MIPA 1"
                  value={kelasForm.namaKelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, namaKelas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  placeholder="Nama lengkap wali kelas"
                  value={kelasForm.waliKelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, waliKelas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setKelasModal({ open: false })}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MAPEL */}
      {mapelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {mapelModal.item ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h3>
              <button onClick={() => setMapelModal({ open: false })} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveMapel} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Mapel</label>
                <input
                  type="text"
                  placeholder="MAT-X"
                  value={mapelForm.kode}
                  onChange={(e) => setMapelForm({ ...mapelForm, kode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Matematika Fase E"
                  value={mapelForm.namaMapel}
                  onChange={(e) => setMapelForm({ ...mapelForm, namaMapel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKTP / KKM</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mapelForm.kktp}
                    onChange={(e) => setMapelForm({ ...mapelForm, kktp: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beban Tatap Muka (JP)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={mapelForm.jamPelajaran}
                    onChange={(e) => setMapelForm({ ...mapelForm, jamPelajaran: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelompok Mapel</label>
                <select
                  value={mapelForm.kelompok}
                  onChange={(e) => setMapelForm({ ...mapelForm, kelompok: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="Umum">Umum (Wajib)</option>
                  <option value="Peminatan">Peminatan / Tingkat Lanjut</option>
                  <option value="Kejuruan">Kejuruan</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMapelModal({ open: false })}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RELASI */}
      {relasiModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Hubungkan Kelas dengan Mata Pelajaran</h3>
              <button onClick={() => setRelasiModal({ open: false })} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRelasi} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas</label>
                <select
                  value={relasiForm.kelasId}
                  onChange={(e) => setRelasiForm({ ...relasiForm, kelasId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-medium"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKelas} (Tingkat {k.tingkat})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Mata Pelajaran</label>
                <select
                  value={relasiForm.mapelId}
                  onChange={(e) => setRelasiForm({ ...relasiForm, mapelId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-medium"
                >
                  {mapelList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.namaMapel} ({m.kode}) - KKTP: {m.kktp}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRelasiModal({ open: false })}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Tambahkan Relasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
