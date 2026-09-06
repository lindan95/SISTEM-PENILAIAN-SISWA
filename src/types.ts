export type JenisKelamin = 'L' | 'P';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export type StatusSiswa = 'Aktif' | 'Pindah' | 'Lulus' | 'Nonaktif';

export type StatusTahunAjaran = 'Aktif' | 'Nonaktif' | 'Arsip';

export type Semester = '1' | '2';

export type StatusAbsensi = 'Hadir' | 'Ijin' | 'Sakit' | 'Terlambat' | 'Alpa' | 'Bolos';

export type PredikatKelakuan = 'A' | 'B' | 'C' | 'D';

export interface PenilaianKelakuan {
  kedisiplinan: PredikatKelakuan;
  tanggungJawab: PredikatKelakuan;
  kejujuran: PredikatKelakuan;
  kerjasama: PredikatKelakuan;
  kesopanan: PredikatKelakuan;
  deskripsi: string;
}

export type JenisPenilaian =
  | 'Kehadiran'
  | 'Tugas'
  | 'Catatan'
  | 'Kelakuan'
  | 'Formatif'
  | 'Sumatif'
  | 'PAS';

export interface ProfilGuru {
  id: string;
  nama: string;
  nip: string;
  nuptk: string;
  fotoUrl: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  pendidikan: string;
  pangkat: string;
  jabatan: string;
  mapel: string;
  noHp: string;
  email: string;
  alamat: string;
}

export interface ProfilSekolah {
  id: string;
  namaSekolah: string;
  npsn: string;
  nss: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepala: string;
  logoSekolah: string;
  logoPendidikan: string;
}

export type Guru = ProfilGuru;
export type Sekolah = ProfilSekolah;

export interface TahunAjaran {
  id: string;
  tahunAjaran: string; // e.g. "2026/2027"
  semester: Semester;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: StatusTahunAjaran;
}

export interface Kelas {
  id: string;
  tahunAjaran: string;
  tingkat: string; // e.g. "X", "XI", "XII"
  namaKelas: string; // e.g. "X A", "X B"
  waliKelas: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface Mapel {
  id: string;
  kode: string;
  namaMapel: string;
  kelompok: string; // e.g. "Umum", "Peminatan", "Kejuruan", "Muatan Lokal"
  kktp: number; // e.g. 75
  jamPelajaran: number;
  status: 'Aktif' | 'Nonaktif';
}

export interface RelasiKelasMapel {
  id: string;
  kelasId: string;
  mapelId: string;
  tahunAjaran: string;
  semester: Semester;
}

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  ayah: string;
  ibu: string;
  noHpOrangTua: string;
  kelasId: string;
  tahunAjaran: string;
  status: StatusSiswa;
  fotoUrl?: string;
}

export interface AbsensiRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  siswaId: string;
  kelasId: string;
  mapelId: string;
  tahunAjaran: string;
  semester: Semester;
  status: StatusAbsensi;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface KomponenNilai {
  id: string;
  jenis: JenisPenilaian;
  namaKomponen: string;
  tanggal: string;
  materi?: string;
  bobot?: number;
  pertemuanKe?: number;
  kelasId: string;
  mapelId: string;
  tahunAjaran: string;
  semester: Semester;
}

export interface NilaiDetail {
  id: string;
  komponenId: string;
  siswaId: string;
  nilai: number; // 0 - 100
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NilaiSiswa {
  id: string;
  siswaId: string;
  kelasId: string;
  mapelId: string;
  tahunAjaran: string;
  semester: Semester;
  tugas: number[];
  formatif: number[];
  sumatifLm: number[];
  sumatifAkhir: number;
  rataTugas: number;
  rataFormatif: number;
  rataSumatifLm: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  keterangan: string;
  catatan?: string;
  kelakuan?: PenilaianKelakuan;
  createdAt: string;
  updatedAt: string;
}

export interface BobotNilai {
  id?: string;
  kelasId?: string;
  mapelId?: string;
  tahunAjaran?: string;
  semester?: Semester;
  tugas: number; // 20%
  formatif: number; // 25%
  sumatifLm: number; // 30%
  sumatifAkhir: number; // 25%
  // Compatibility fields
  bobotKehadiran?: number;
  bobotTugas?: number;
  bobotCatatan?: number;
  bobotKelakuan?: number;
  bobotFormatif?: number;
  bobotSumatif?: number;
  bobotPAS?: number;
}

export interface NilaiAkhir {
  id: string;
  siswaId: string;
  kelasId: string;
  mapelId: string;
  tahunAjaran: string;
  semester: Semester;
  nilaiKehadiran: number;
  nilaiTugas: number;
  nilaiCatatan: number;
  nilaiKelakuan: number;
  nilaiFormatif: number;
  nilaiSumatif: number;
  nilaiPAS: number;
  nilaiAkhir: number;
  kktp: number;
  status: 'Mencapai KKTP' | 'Belum Mencapai KKTP';
}

export interface CatatanRefleksiPertemuan {
  id: string;
  pertemuanKe: number;
  tanggal: string; // YYYY-MM-DD
  kelasId: string;
  mapelId: string;
  tahunAjaran: string;
  semester: Semester;
  materiPokok: string; // Topik / TP / CP
  tujuanPembelajaran?: string;
  catatanGuru: string; // Catatan kejadian proses pembelajaran
  refleksiGuru: string; // Refleksi pembelajaran
  tindakLanjut: string; // Rencana tindak lanjut
  ketercapaian?: number; // 0-100%
  siswaPerhatian?: string; // Catatan siswa yang perlu perhatian khusus
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  gasWebAppUrl?: string;
  kktpDefault: number;
  decimalPlaces: 0 | 1 | 2;
  batasAlpa: number;
  batasBolos: number;
  batasTerlambat: number;
  batasIjin?: number;
  batasSakit?: number;
  batasPersentaseKehadiran: number;
  formatKertas?: 'F4' | 'A4';
  namaAplikasi?: string;
  darkMode?: boolean;
}

export interface GasConnectionConfig {
  webAppUrl: string;
  spreadsheetId?: string;
  connected?: boolean;
  lastSync?: string;
}

export interface LogAktivitas {
  id: string;
  waktu: string;
  aktivitas: string;
  user: string;
  detail: string;
}

export interface SiswaBermasalah {
  siswa: Siswa;
  level: 'Ringan' | 'Sedang' | 'Berat';
  score: number;
  alpaCount: number;
  bolosCount: number;
  terlambatCount: number;
  persentaseKehadiran: number;
  nilaiAkhir: number;
  nilaiBawahKktp: boolean;
  issues: string[];
}

export interface SiswaBermasalahItem {
  siswa: Siswa;
  kelasNama: string;
  alpa: number;
  bolos: number;
  terlambat: number;
  ijin: number;
  sakit: number;
  hadir: number;
  totalPertemuan: number;
  nilaiAkhir: number;
  nilaiTugas: number;
  nilaiFormatif: number;
  nilaiSumatif: number;
  nilaiKelakuan: number;
  kktp: number;
  masalahList: string[];
  status: 'Aman' | 'Perlu Perhatian' | 'Bermasalah';
}

export type MenuItemId =
  | 'dashboard'
  | 'guru'
  | 'sekolah'
  | 'tahun-ajaran'
  | 'kelas'
  | 'mapel'
  | 'relasi'
  | 'siswa'
  | 'absensi'
  | 'rekap-absensi'
  | 'nilai'
  | 'rekap-nilai'
  | 'rapor'
  | 'siswa-bermasalah'
  | 'gas-code'
  | 'pengaturan'
  | 'backup'
  | 'kelas-mapel'
  | 'absensi-rekap'
  | 'penilaian-kehadiran'
  | 'penilaian-tugas'
  | 'penilaian-catatan'
  | 'penilaian-kelakuan'
  | 'penilaian-formatif'
  | 'penilaian-sumatif'
  | 'penilaian-pas';

export type ActiveMenu = MenuItemId;
