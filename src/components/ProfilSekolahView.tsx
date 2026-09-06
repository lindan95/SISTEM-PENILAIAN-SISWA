import React, { useState } from 'react';
import {
  Building2,
  Save,
  Upload,
  Globe,
  Mail,
  MapPin,
  Award,
  Image as ImageIcon,
} from 'lucide-react';
import { ProfilSekolah } from '../types';

interface ProfilSekolahViewProps {
  sekolah: ProfilSekolah;
  onSave: (sekolah: ProfilSekolah) => void;
  showToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const ProfilSekolahView: React.FC<ProfilSekolahViewProps> = ({ sekolah, onSave, showToast }) => {
  const [formData, setFormData] = useState<ProfilSekolah>({ ...sekolah });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoSekolah' | 'logoPendidikan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran berkas logo maksimal adalah 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setFormData((prev) => ({ ...prev, [field]: base64 }));
      showToast(`Logo ${field === 'logoSekolah' ? 'Sekolah' : 'Pendidikan'} berhasil dimuat!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaSekolah.trim()) {
      showToast('Nama sekolah tidak boleh kosong', 'warning');
      return;
    }
    onSave(formData);
    showToast('Profil sekolah berhasil disimpan!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Profil Sekolah</h2>
          <p className="text-xs text-slate-500">
            Identitas sekolah digunakan sebagai Kop Surat resmi pada cetak Rekap Nilai F4, Rapor, dan lembar absensi.
          </p>
        </div>
      </div>

      {/* Kop Surat Live Preview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pratinjau Kop Surat Resmi (F4 Print)
          </span>
          <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            Standar Dokumen Kedinasan
          </span>
        </div>

        <div className="border border-slate-200 p-5 rounded-xl bg-slate-50/50">
          <div className="flex items-center justify-between gap-4 border-b-2 border-slate-900 pb-3 text-center">
            {/* Logo Pendidikan Left */}
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {formData.logoPendidikan ? (
                <img
                  src={formData.logoPendidikan}
                  alt="Logo Pendidikan"
                  className="max-h-16 max-w-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center font-medium p-1">
                  Logo Tut Wuri
                </div>
              )}
            </div>

            {/* School Header Text */}
            <div className="flex-1 space-y-0.5">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                PEMERINTAH PROVINSI {formData.provinsi || 'SULAWESI TENGGARA'}
              </p>
              <p className="text-xs font-bold text-slate-700 uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                {formData.namaSekolah || 'NAMA SEKOLAH'}
              </h3>
              <p className="text-[11px] text-slate-600">
                {formData.alamat || 'Alamat Sekolah'}, Desa {formData.desa || '-'}, Kec.{' '}
                {formData.kecamatan || '-'}, {formData.kabupaten || '-'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                NPSN: {formData.npsn || '-'} | NSS: {formData.nss || '-'} | Email: {formData.email || '-'}
              </p>
            </div>

            {/* Logo Sekolah Right */}
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {formData.logoSekolah ? (
                <img
                  src={formData.logoSekolah}
                  alt="Logo Sekolah"
                  className="max-h-16 max-w-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center font-medium p-1">
                  Logo Sekolah
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan *</label>
            <input
              type="text"
              name="namaSekolah"
              value={formData.namaSekolah}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 uppercase font-bold"
              placeholder="SMA NEGERI 1 KABAENA TIMUR"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
            <input
              type="text"
              name="npsn"
              value={formData.npsn}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-mono"
              placeholder="40402189"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">NSS</label>
            <input
              type="text"
              name="nss"
              value={formData.nss}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-mono"
              placeholder="301200602001"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kode Pos</label>
            <input
              type="text"
              name="kodePos"
              value={formData.kodePos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="93781"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Desa / Kelurahan</label>
            <input
              type="text"
              name="desa"
              value={formData.desa}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Dongkala"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
            <input
              type="text"
              name="kecamatan"
              value={formData.kecamatan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Kabaena Timur"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
            <input
              type="text"
              name="kabupaten"
              value={formData.kabupaten}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Kab. Bombana"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
            <input
              type="text"
              name="provinsi"
              value={formData.provinsi}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Sulawesi Tenggara"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Sekolah</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="sman1kabaenatimur@sch.id"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Website Sekolah</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="https://sman1kabaenatimur.sch.id"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">Alamat Jalan / Gedung</label>
            <input
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
              placeholder="Jl. Pendidikan No. 12, Dongkala"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
            <input
              type="text"
              name="kepalaSekolah"
              value={formData.kepalaSekolah}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-semibold"
              placeholder="Drs. H. Syamsuddin, M.Si."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
            <input
              type="text"
              name="nipKepala"
              value={formData.nipKepala}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-mono"
              placeholder="19681112 199412 1 002"
            />
          </div>

          {/* Logo Uploads */}
          <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <label className="block font-semibold text-slate-800 mb-2">Logo Lambang Sekolah</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 p-1">
                  {formData.logoSekolah ? (
                    <img
                      src={formData.logoSekolah}
                      alt="Logo Sekolah"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer font-medium shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Logo Sekolah</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'logoSekolah')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG / JPG Transparan (Maks. 2MB)</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <label className="block font-semibold text-slate-800 mb-2">Logo Tut Wuri Handayani / Pendidikan</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 p-1">
                  {formData.logoPendidikan ? (
                    <img
                      src={formData.logoPendidikan}
                      alt="Logo Tut Wuri"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer font-medium shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Logo Pendidikan</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'logoPendidikan')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG / JPG Transparan (Maks. 2MB)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Perubahan kop surat akan otomatis diperbarui pada seluruh dokumen cetak.
          </p>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Profil Sekolah</span>
          </button>
        </div>
      </form>
    </div>
  );
};
