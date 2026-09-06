import React, { useState, useMemo } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Filter,
  FileSpreadsheet,
  X,
  User,
  Phone,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Siswa, Kelas, JenisKelamin, StatusSiswa } from '../types';

interface DataSiswaViewProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  selectedTahunAjaran: string;
  selectedKelasId: string;
  onSaveSiswa: (siswa: Siswa) => void;
  onSaveSiswaBatch: (siswaArray: Siswa[]) => void;
  onDeleteSiswa: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const DataSiswaView: React.FC<DataSiswaViewProps> = ({
  siswaList,
  kelasList,
  selectedTahunAjaran,
  selectedKelasId,
  onSaveSiswa,
  onSaveSiswaBatch,
  onDeleteSiswa,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>(selectedKelasId || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>('Aktif');

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);

  const initialFormState: Siswa = {
    id: '',
    nis: '',
    nisn: '',
    nama: '',
    jenisKelamin: 'L',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    ayah: '',
    ibu: '',
    noHpOrangTua: '',
    kelasId: selectedKelasId || (kelasList[0]?.id ?? ''),
    tahunAjaran: selectedTahunAjaran,
    status: 'Aktif',
  };

  const [formData, setFormData] = useState<Siswa>(initialFormState);

  // Filtered List
  const filteredSiswa = useMemo(() => {
    return siswaList.filter((s) => {
      const matchKelas = filterKelas === 'ALL' || s.kelasId === filterKelas;
      const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
      const matchSearch =
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery) ||
        s.nisn.includes(searchQuery);
      return matchKelas && matchStatus && matchSearch;
    });
  }, [siswaList, filterKelas, filterStatus, searchQuery]);

  const handleOpenAdd = () => {
    setEditingSiswa(null);
    setFormData({
      ...initialFormState,
      id: `sis-${Date.now()}`,
      kelasId: filterKelas !== 'ALL' ? filterKelas : (kelasList[0]?.id ?? ''),
      tahunAjaran: selectedTahunAjaran,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setFormData({ ...siswa });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nis.trim()) {
      showToast('Nama dan NIS wajib diisi', 'warning');
      return;
    }
    onSaveSiswa(formData);
    setModalOpen(false);
    showToast(`Data siswa ${formData.nama} berhasil disimpan!`, 'success');
  };

  // EXPORT EXCEL (Requirement 11)
  const handleExportExcel = () => {
    const exportRows = filteredSiswa.map((s, idx) => {
      const k = kelasList.find((x) => x.id === s.kelasId);
      return {
        No: idx + 1,
        NIS: s.nis,
        NISN: s.nisn,
        'Nama Lengkap': s.nama,
        L_P: s.jenisKelamin,
        Kelas: k?.namaKelas || s.kelasId,
        'Tempat Lahir': s.tempatLahir,
        'Tanggal Lahir': s.tanggalLahir,
        Alamat: s.alamat,
        'Nama Ayah': s.ayah,
        'Nama Ibu': s.ibu,
        'No HP Orang Tua': s.noHpOrangTua,
        Status: s.status,
        'Tahun Ajaran': s.tahunAjaran,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, `Data_Siswa_${selectedTahunAjaran.replace('/', '-')}.xlsx`);
    showToast('File Excel siswa berhasil diunduh!', 'success');
  };

  // IMPORT EXCEL / CSV (Requirement 11)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (rows.length === 0) {
          showToast('Berkas Excel kosong atau format tidak sesuai', 'warning');
          return;
        }

        const newStudents: Siswa[] = rows.map((r, i) => {
          // match class by name if exists
          const targetKelas = kelasList.find(
            (k) => k.namaKelas.toLowerCase() === String(r.Kelas || r.kelas || '').toLowerCase()
          );

          return {
            id: `sis-imp-${Date.now()}-${i}`,
            nis: String(r.NIS || r.nis || `${1000 + i}`),
            nisn: String(r.NISN || r.nisn || ''),
            nama: String(r['Nama Lengkap'] || r.Nama || r.nama || `Siswa ${i + 1}`),
            jenisKelamin: (String(r.L_P || r.JK || r.jenisKelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L') as JenisKelamin,
            tempatLahir: String(r['Tempat Lahir'] || r.tempatLahir || ''),
            tanggalLahir: String(r['Tanggal Lahir'] || r.tanggalLahir || ''),
            alamat: String(r.Alamat || r.alamat || ''),
            ayah: String(r['Nama Ayah'] || r.ayah || ''),
            ibu: String(r['Nama Ibu'] || r.ibu || ''),
            noHpOrangTua: String(r['No HP Orang Tua'] || r.noHp || r.hp || ''),
            kelasId: targetKelas ? targetKelas.id : (selectedKelasId || kelasList[0]?.id || ''),
            tahunAjaran: selectedTahunAjaran,
            status: 'Aktif',
          };
        });

        onSaveSiswaBatch(newStudents);
        showToast(`Berhasil mengimpor ${newStudents.length} siswa dari Excel!`, 'success');
      } catch (err) {
        showToast('Gagal membaca file Excel. Pastikan format kolom sesuai.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Induk Siswa</h2>
          <p className="text-xs text-slate-500">
            Kelola data siswa per kelas, import/export spreadsheet, dan informasi orang tua.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import Excel */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer shadow-2xs transition">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Excel</span>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {/* Tambah Siswa */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Kelas:</span>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-xl outline-none font-medium text-slate-800 bg-white"
            >
              <option value="ALL">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-xl outline-none font-medium text-slate-800 bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Pindah">Pindah</option>
              <option value="Lulus">Lulus</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <span className="font-mono text-xs text-slate-500">
          Menampilkan <strong className="text-slate-900">{filteredSiswa.length}</strong> siswa
        </span>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Tempat, Tgl Lahir</th>
                <th className="py-3 px-4">No HP Ortu</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((s, idx) => {
                  const k = kelasList.find((x) => x.id === s.kelasId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">{s.nis}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.nisn || '-'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.nama}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block w-5 h-5 rounded-full font-bold text-[10px] leading-5 text-center ${
                            s.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {s.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{k?.namaKelas || s.kelasId}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.tempatLahir ? `${s.tempatLahir}, ${s.tanggalLahir}` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{s.noHpOrangTua || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'Pindah'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data siswa ${s.nama}?`)) {
                              onDeleteSiswa(s.id);
                              showToast(`Data siswa ${s.nama} dihapus.`, 'info');
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL TAMBAH / EDIT SISWA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono font-bold"
                    placeholder="1001"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (Nomor Induk Siswa Nasional)</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                    placeholder="0071234501"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                    placeholder="Nama Lengkap Siswa"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as JenisKelamin })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas Rombel</label>
                  <select
                    value={formData.kelasId}
                    onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-semibold"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    placeholder="Dongkala"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={formData.ayah}
                    onChange={(e) => setFormData({ ...formData, ayah: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    placeholder="Nama Ayah"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={formData.ibu}
                    onChange={(e) => setFormData({ ...formData, ibu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    placeholder="Nama Ibu"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor HP / WA Orang Tua</label>
                  <input
                    type="text"
                    value={formData.noHpOrangTua}
                    onChange={(e) => setFormData({ ...formData, noHpOrangTua: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                    placeholder="0852xxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusSiswa })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pindah">Pindah</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    placeholder="Jalan / Dusun / Desa"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
