import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Upload,
  Save,
  CheckCircle,
  FileBadge,
} from 'lucide-react';
import { ProfilGuru } from '../types';

interface ProfilGuruViewProps {
  guru: ProfilGuru;
  onSave: (guru: ProfilGuru) => void;
  showToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const ProfilGuruView: React.FC<ProfilGuruViewProps> = ({ guru, onSave, showToast }) => {
  const [formData, setFormData] = useState<ProfilGuru>({ ...guru });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal adalah 2MB', 'warning');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setFormData((prev) => ({ ...prev, fotoUrl: base64 }));
      setIsUploading(false);
      showToast('Foto berhasil dimuat. Jangan lupa klik "Simpan Profil".', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showToast('Nama guru tidak boleh kosong', 'warning');
      return;
    }
    onSave(formData);
    showToast('Profil guru berhasil disimpan!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Profil Guru Pengampu</h2>
          <p className="text-xs text-slate-500">
            Identitas guru akan otomatis tercetak pada lembar penilaian, rekapitulasi, dan buku rapor siswa.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Top Avatar Banner */}
        <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-md bg-indigo-100 flex items-center justify-center font-bold text-2xl text-indigo-700">
              {formData.fotoUrl ? (
                <img
                  src={formData.fotoUrl}
                  alt={formData.nama}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-12 h-12 text-indigo-400" />
              )}
            </div>
            <label className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-semibold">
              <Upload className="w-5 h-5 mb-1" />
              <span>Ganti Foto</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900">{formData.nama || 'Nama Guru Belum Diisi'}</h3>
            <p className="text-xs text-slate-500 font-mono">NIP: {formData.nip || '-'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Briefcase className="w-3 h-3" />
                {formData.jabatan || 'Guru Mata Pelajaran'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileBadge className="w-3 h-3" />
                {formData.mapel || 'Matematika'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Contoh: Sudirman, S.Pd., M.Pd."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">NIP</label>
            <input
              type="text"
              name="nip"
              value={formData.nip}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-mono"
              placeholder="19820514 200801 1 008"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">NUPTK</label>
            <input
              type="text"
              name="nuptk"
              value={formData.nuptk}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-mono"
              placeholder="4538760662200002"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
            <select
              name="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
            <input
              type="text"
              name="tempatLahir"
              value={formData.tempatLahir}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Bajo"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
            <input
              type="date"
              name="tanggalLahir"
              value={formData.tanggalLahir}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
            <input
              type="text"
              name="pendidikan"
              value={formData.pendidikan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="S2 Pendidikan Matematika"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pangkat / Golongan</label>
            <input
              type="text"
              name="pangkat"
              value={formData.pangkat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Penata Tk. I / III/d"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jabatan Guru</label>
            <input
              type="text"
              name="jabatan"
              value={formData.jabatan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Guru Ahli Madya"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran Utama</label>
            <input
              type="text"
              name="mapel"
              value={formData.mapel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Matematika"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor HP / WhatsApp</label>
            <input
              type="text"
              name="noHp"
              value={formData.noHp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="081245678901"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="sudirmanbajokabaenatimur@gmail.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili</label>
            <textarea
              name="alamat"
              rows={2}
              value={formData.alamat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Alamat lengkap tempat tinggal"
            />
          </div>
        </div>

        {/* Submit Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Data tersimpan aman di basis data lokal dan siap disinkronkan ke Google Sheets.
          </p>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Profil Guru</span>
          </button>
        </div>
      </form>
    </div>
  );
};
