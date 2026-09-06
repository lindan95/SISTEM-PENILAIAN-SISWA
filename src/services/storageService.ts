import {
  ProfilGuru,
  ProfilSekolah,
  TahunAjaran,
  Kelas,
  Mapel,
  RelasiKelasMapel,
  Siswa,
  AbsensiRecord,
  KomponenNilai,
  NilaiDetail,
  BobotNilai,
  NilaiAkhir,
  AppSettings,
  LogAktivitas,
  SiswaBermasalahItem,
  Semester,
  JenisPenilaian,
  NilaiSiswa,
  SiswaBermasalah,
  GasConnectionConfig,
  StatusTahunAjaran,
  CatatanRefleksiPertemuan,
} from '../types';

const STORAGE_KEYS = {
  GURU: 'sps_guru_v1',
  SEKOLAH: 'sps_sekolah_v1',
  TAHUN_AJARAN: 'sps_tahun_ajaran_v1',
  KELAS: 'sps_kelas_v1',
  MAPEL: 'sps_mapel_v1',
  RELASI: 'sps_relasi_v1',
  SISWA: 'sps_siswa_v1',
  ABSENSI: 'sps_absensi_v1',
  KOMPONEN_NILAI: 'sps_komponen_nilai_v1',
  NILAI_DETAIL: 'sps_nilai_detail_v1',
  BOBOT_NILAI: 'sps_bobot_nilai_v1',
  SETTINGS: 'sps_settings_v1',
  LOGS: 'sps_logs_v1',
  CATATAN_REFLEKSI: 'sps_catatan_refleksi_v1',
};

// Default Initial Data
const defaultGuru: ProfilGuru = {
  id: 'guru-1',
  nama: 'Sudirman, S.Pd., M.Pd.',
  nip: '19820514 200801 1 008',
  nuptk: '4538760662200002',
  fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  jenisKelamin: 'L',
  tempatLahir: 'Bajo',
  tanggalLahir: '1982-05-14',
  pendidikan: 'S2 Pendidikan Matematika',
  pangkat: 'Penata Tk. I / III/d',
  jabatan: 'Guru Ahli Madya',
  mapel: 'Matematika',
  noHp: '081245678901',
  email: 'sudirmanbajokabaenatimur@gmail.com',
  alamat: 'Jl. Poros Dongkala - Sikeli, Kec. Kabaena Timur',
};

const defaultSekolah: ProfilSekolah = {
  id: 'sekolah-1',
  namaSekolah: 'SMA NEGERI 1 KABAENA TIMUR',
  npsn: '40402189',
  nss: '301200602001',
  alamat: 'Jl. Pendidikan No. 12, Dongkala',
  desa: 'Dongkala',
  kecamatan: 'Kabaena Timur',
  kabupaten: 'Kab. Bombana',
  provinsi: 'Sulawesi Tenggara',
  kodePos: '93781',
  email: 'sman1kabaenatimur@gmail.sch.id',
  website: 'https://sman1kabaenatimur.sch.id',
  kepalaSekolah: 'Drs. H. Syamsuddin, M.Si.',
  nipKepala: '19681112 199412 1 002',
  logoSekolah: '',
  logoPendidikan: '',
};

const defaultTahunAjaran: TahunAjaran[] = [
  {
    id: 'ta-2026-1',
    tahunAjaran: '2026/2027',
    semester: '1',
    tanggalMulai: '2026-07-15',
    tanggalSelesai: '2026-12-20',
    status: 'Aktif',
  },
  {
    id: 'ta-2026-2',
    tahunAjaran: '2026/2027',
    semester: '2',
    tanggalMulai: '2027-01-08',
    tanggalSelesai: '2027-06-25',
    status: 'Nonaktif',
  },
  {
    id: 'ta-2025-2',
    tahunAjaran: '2025/2026',
    semester: '2',
    tanggalMulai: '2026-01-05',
    tanggalSelesai: '2026-06-20',
    status: 'Arsip',
  },
];

const defaultKelas: Kelas[] = [
  {
    id: 'kls-xa',
    tahunAjaran: '2026/2027',
    tingkat: 'X',
    namaKelas: 'X A',
    waliKelas: 'Sudirman, S.Pd., M.Pd.',
    status: 'Aktif',
  },
  {
    id: 'kls-xb',
    tahunAjaran: '2026/2027',
    tingkat: 'X',
    namaKelas: 'X B',
    waliKelas: 'Nurhayati, S.Pd.',
    status: 'Aktif',
  },
  {
    id: 'kls-xi1',
    tahunAjaran: '2026/2027',
    tingkat: 'XI',
    namaKelas: 'XI MIPA 1',
    waliKelas: 'Drs. Amiruddin',
    status: 'Aktif',
  },
];

const defaultMapel: Mapel[] = [
  {
    id: 'mpl-mat-x',
    kode: 'MAT-X',
    namaMapel: 'Matematika Fase E',
    kelompok: 'Umum',
    kktp: 75,
    jamPelajaran: 4,
    status: 'Aktif',
  },
  {
    id: 'mpl-mat-xi',
    kode: 'MAT-XI',
    namaMapel: 'Matematika Tingkat Lanjut',
    kelompok: 'Peminatan',
    kktp: 75,
    jamPelajaran: 5,
    status: 'Aktif',
  },
  {
    id: 'mpl-mat-w-xi',
    kode: 'MAT-W-XI',
    namaMapel: 'Matematika Wajib Fase F',
    kelompok: 'Umum',
    kktp: 72,
    jamPelajaran: 3,
    status: 'Aktif',
  },
];

const defaultRelasi: RelasiKelasMapel[] = [
  {
    id: 'rel-1',
    kelasId: 'kls-xa',
    mapelId: 'mpl-mat-x',
    tahunAjaran: '2026/2027',
    semester: '1',
  },
  {
    id: 'rel-2',
    kelasId: 'kls-xb',
    mapelId: 'mpl-mat-x',
    tahunAjaran: '2026/2027',
    semester: '1',
  },
  {
    id: 'rel-3',
    kelasId: 'kls-xi1',
    mapelId: 'mpl-mat-xi',
    tahunAjaran: '2026/2027',
    semester: '1',
  },
];

const defaultSiswa: Siswa[] = [
  {
    id: 'sis-1001',
    nis: '1001',
    nisn: '0071234501',
    nama: 'Ahmad Fauzi',
    jenisKelamin: 'L',
    tempatLahir: 'Dongkala',
    tanggalLahir: '2009-02-14',
    alamat: 'Jl. Poros Dongkala No. 15',
    ayah: 'Fauzi Ismail',
    ibu: 'Siti Aminah',
    noHpOrangTua: '085211223344',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1002',
    nis: '1002',
    nisn: '0071234502',
    nama: 'Budi Santoso',
    jenisKelamin: 'L',
    tempatLahir: 'Sikeli',
    tanggalLahir: '2009-05-18',
    alamat: 'Dusun Bajo Timur',
    ayah: 'Santoso Wijaya',
    ibu: 'Halimah',
    noHpOrangTua: '085211223345',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1003',
    nis: '1003',
    nisn: '0071234503',
    nama: 'Citra Dewi Permata',
    jenisKelamin: 'P',
    tempatLahir: 'Dongkala',
    tanggalLahir: '2009-08-20',
    alamat: 'Jl. Pantai Indah No. 04',
    ayah: 'Permata Bachtiar',
    ibu: 'Dewi Sartika',
    noHpOrangTua: '085211223346',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1004',
    nis: '1004',
    nisn: '0071234504',
    nama: 'Dedi Pratama',
    jenisKelamin: 'L',
    tempatLahir: 'Lambale',
    tanggalLahir: '2009-01-10',
    alamat: 'Dusun Lambale Selatan',
    ayah: 'Pratama Surya',
    ibu: 'Hj. Rosdiana',
    noHpOrangTua: '085211223347',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1005',
    nis: '1005',
    nisn: '0071234505',
    nama: 'Eka Rahmawati',
    jenisKelamin: 'P',
    tempatLahir: 'Dongkala',
    tanggalLahir: '2009-11-23',
    alamat: 'Jl. Melati No. 8',
    ayah: 'Rahman Syah',
    ibu: 'Sri Wahyuni',
    noHpOrangTua: '085211223348',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1006',
    nis: '1006',
    nisn: '0071234506',
    nama: 'Fajar Ramadhan',
    jenisKelamin: 'L',
    tempatLahir: 'Sikeli',
    tanggalLahir: '2009-09-05',
    alamat: 'Jl. Dermaga Ferry Sikeli',
    ayah: 'Ramadhan Ali',
    ibu: 'Fatmawati',
    noHpOrangTua: '085211223349',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1007',
    nis: '1007',
    nisn: '0071234507',
    nama: 'Gita Puspita Sari',
    jenisKelamin: 'P',
    tempatLahir: 'Dongkala',
    tanggalLahir: '2009-04-12',
    alamat: 'Jl. Guru Tua No. 22',
    ayah: 'Sarifuddin',
    ibu: 'Puspa Indah',
    noHpOrangTua: '085211223350',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1008',
    nis: '1008',
    nisn: '0071234508',
    nama: 'Hendra Wijaya',
    jenisKelamin: 'L',
    tempatLahir: 'Bajo',
    tanggalLahir: '2008-12-30',
    alamat: 'Jl. Pelabuhan Rakyat Bajo',
    ayah: 'Wijaya Kusuma',
    ibu: 'Mariani',
    noHpOrangTua: '085211223351',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1009',
    nis: '1009',
    nisn: '0071234509',
    nama: 'Indah Permatasari',
    jenisKelamin: 'P',
    tempatLahir: 'Dongkala',
    tanggalLahir: '2009-07-19',
    alamat: 'Kompleks Pasar Baru',
    ayah: 'H. Sudarsono',
    ibu: 'Hj. Maryam',
    noHpOrangTua: '085211223352',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
  {
    id: 'sis-1010',
    nis: '1010',
    nisn: '0071234510',
    nama: 'Joko Susilo',
    jenisKelamin: 'L',
    tempatLahir: 'Sikeli',
    tanggalLahir: '2009-03-08',
    alamat: 'Dusun Padang Kasih',
    ayah: 'Susilo Bambang',
    ibu: 'Sumarni',
    noHpOrangTua: '085211223353',
    kelasId: 'kls-xa',
    tahunAjaran: '2026/2027',
    status: 'Aktif',
  },
];

// Prepopulated Attendance (several meetings)
const defaultAbsensi: AbsensiRecord[] = [
  // Meeting 1
  { id: 'abs-1', tanggal: '2026-08-03', siswaId: 'sis-1001', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-2', tanggal: '2026-08-03', siswaId: 'sis-1002', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-3', tanggal: '2026-08-03', siswaId: 'sis-1003', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-4', tanggal: '2026-08-03', siswaId: 'sis-1004', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Alpa', keterangan: 'Tanpa keterangan', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-5', tanggal: '2026-08-03', siswaId: 'sis-1005', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-6', tanggal: '2026-08-03', siswaId: 'sis-1006', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Terlambat', keterangan: 'Ban bocor 15 menit', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-7', tanggal: '2026-08-03', siswaId: 'sis-1007', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-8', tanggal: '2026-08-03', siswaId: 'sis-1008', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Alpa', keterangan: 'Tidak ada surat', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-9', tanggal: '2026-08-03', siswaId: 'sis-1009', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'abs-10', tanggal: '2026-08-03', siswaId: 'sis-1010', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Ijin', keterangan: 'Acara keluarga', createdAt: '2026-08-03', updatedAt: '2026-08-03' },

  // Meeting 2
  { id: 'abs-11', tanggal: '2026-08-10', siswaId: 'sis-1001', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-12', tanggal: '2026-08-10', siswaId: 'sis-1002', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-13', tanggal: '2026-08-10', siswaId: 'sis-1003', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-14', tanggal: '2026-08-10', siswaId: 'sis-1004', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Alpa', keterangan: 'Tidak masuk', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-15', tanggal: '2026-08-10', siswaId: 'sis-1005', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-16', tanggal: '2026-08-10', siswaId: 'sis-1006', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Terlambat', keterangan: 'Terlambat apel', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-17', tanggal: '2026-08-10', siswaId: 'sis-1007', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-18', tanggal: '2026-08-10', siswaId: 'sis-1008', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Bolos', keterangan: 'Meninggalkan jam ke-3', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-19', tanggal: '2026-08-10', siswaId: 'sis-1009', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Hadir', keterangan: '', createdAt: '2026-08-10', updatedAt: '2026-08-10' },
  { id: 'abs-20', tanggal: '2026-08-10', siswaId: 'sis-1010', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Sakit', keterangan: 'Demam', createdAt: '2026-08-10', updatedAt: '2026-08-10' },

  // Meeting 3
  { id: 'abs-21', tanggal: '2026-08-17', siswaId: 'sis-1004', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Alpa', keterangan: 'Alpa berturut-turut', createdAt: '2026-08-17', updatedAt: '2026-08-17' },
  { id: 'abs-22', tanggal: '2026-08-17', siswaId: 'sis-1008', kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1', status: 'Bolos', keterangan: 'Tidak masuk kelas', createdAt: '2026-08-17', updatedAt: '2026-08-17' },
];

const defaultKomponen: KomponenNilai[] = [
  // Tugas
  { id: 'komp-tug-1', jenis: 'Tugas', namaKomponen: 'Tugas 1: Eksponen & Logaritma', tanggal: '2026-08-05', materi: 'Sifat-sifat Eksponen', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },
  { id: 'komp-tug-2', jenis: 'Tugas', namaKomponen: 'Tugas 2: Persamaan Eksponen', tanggal: '2026-08-18', materi: 'Persamaan Eksponen Sederhana', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },
  { id: 'komp-tug-3', jenis: 'Tugas', namaKomponen: 'Tugas 3: Logaritma Dasar', tanggal: '2026-09-02', materi: 'Operasi Logaritma', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },

  // Catatan
  { id: 'komp-cat-1', jenis: 'Catatan', namaKomponen: 'Catatan 1: Rangkuman Bab 1', tanggal: '2026-08-12', materi: 'Kelengkapan & Kerapian Buku', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },
  { id: 'komp-cat-2', jenis: 'Catatan', namaKomponen: 'Catatan 2: Portofolio Latihan', tanggal: '2026-08-26', materi: 'Soal Mandiri', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },

  // Kelakuan per pertemuan
  { id: 'komp-kel-1', jenis: 'Kelakuan', namaKomponen: 'Kelakuan Pertemuan 1', tanggal: '2026-08-03', pertemuanKe: 1, bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },
  { id: 'komp-kel-2', jenis: 'Kelakuan', namaKomponen: 'Kelakuan Pertemuan 2', tanggal: '2026-08-10', pertemuanKe: 2, bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },

  // Formatif
  { id: 'komp-for-1', jenis: 'Formatif', namaKomponen: 'Formatif 1 (TP 1)', tanggal: '2026-08-14', materi: 'Eksponensial', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },
  { id: 'komp-for-2', jenis: 'Formatif', namaKomponen: 'Formatif 2 (TP 2)', tanggal: '2026-08-28', materi: 'Logaritma', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },

  // Sumatif
  { id: 'komp-sum-1', jenis: 'Sumatif', namaKomponen: 'Sumatif Lingkup Materi 1', tanggal: '2026-09-08', materi: 'Eksponen & Bentuk Akar', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },

  // PAS
  { id: 'komp-pas-1', jenis: 'PAS', namaKomponen: 'Penilaian Akhir Semester (PAS)', tanggal: '2026-11-28', materi: 'Seluruh Materi Sem 1', bobot: 1, kelasId: 'kls-xa', mapelId: 'mpl-mat-x', tahunAjaran: '2026/2027', semester: '1' },
];

const defaultNilaiDetail: NilaiDetail[] = [
  // Ahmad Fauzi
  { id: 'nil-1', komponenId: 'komp-tug-1', siswaId: 'sis-1001', nilai: 88, catatan: 'Baik', createdAt: '2026-08-05', updatedAt: '2026-08-05' },
  { id: 'nil-2', komponenId: 'komp-tug-2', siswaId: 'sis-1001', nilai: 90, catatan: 'Sangat rapi', createdAt: '2026-08-18', updatedAt: '2026-08-18' },
  { id: 'nil-3', komponenId: 'komp-cat-1', siswaId: 'sis-1001', nilai: 85, catatan: '', createdAt: '2026-08-12', updatedAt: '2026-08-12' },
  { id: 'nil-4', komponenId: 'komp-kel-1', siswaId: 'sis-1001', nilai: 90, catatan: 'Aktif bertanya', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'nil-5', komponenId: 'komp-for-1', siswaId: 'sis-1001', nilai: 86, catatan: '', createdAt: '2026-08-14', updatedAt: '2026-08-14' },
  { id: 'nil-6', komponenId: 'komp-sum-1', siswaId: 'sis-1001', nilai: 88, catatan: '', createdAt: '2026-09-08', updatedAt: '2026-09-08' },
  { id: 'nil-7', komponenId: 'komp-pas-1', siswaId: 'sis-1001', nilai: 85, catatan: '', createdAt: '2026-11-28', updatedAt: '2026-11-28' },

  // Citra Dewi Permata (Highest performer)
  { id: 'nil-10', komponenId: 'komp-tug-1', siswaId: 'sis-1003', nilai: 95, catatan: 'Sempurna', createdAt: '2026-08-05', updatedAt: '2026-08-05' },
  { id: 'nil-11', komponenId: 'komp-tug-2', siswaId: 'sis-1003', nilai: 96, catatan: 'Luar biasa', createdAt: '2026-08-18', updatedAt: '2026-08-18' },
  { id: 'nil-12', komponenId: 'komp-cat-1', siswaId: 'sis-1003', nilai: 95, catatan: 'Sangat lengkap', createdAt: '2026-08-12', updatedAt: '2026-08-12' },
  { id: 'nil-13', komponenId: 'komp-kel-1', siswaId: 'sis-1003', nilai: 95, catatan: 'Sopan & teladan', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'nil-14', komponenId: 'komp-for-1', siswaId: 'sis-1003', nilai: 94, catatan: '', createdAt: '2026-08-14', updatedAt: '2026-08-14' },
  { id: 'nil-15', komponenId: 'komp-sum-1', siswaId: 'sis-1003', nilai: 96, catatan: '', createdAt: '2026-09-08', updatedAt: '2026-09-08' },
  { id: 'nil-16', komponenId: 'komp-pas-1', siswaId: 'sis-1003', nilai: 95, catatan: '', createdAt: '2026-11-28', updatedAt: '2026-11-28' },

  // Dedi Pratama (Problem Student: Alpa & Under KKTP)
  { id: 'nil-20', komponenId: 'komp-tug-1', siswaId: 'sis-1004', nilai: 55, catatan: 'Belum tuntas', createdAt: '2026-08-05', updatedAt: '2026-08-05' },
  { id: 'nil-21', komponenId: 'komp-tug-2', siswaId: 'sis-1004', nilai: 58, catatan: 'Tugas terlambat', createdAt: '2026-08-18', updatedAt: '2026-08-18' },
  { id: 'nil-22', komponenId: 'komp-cat-1', siswaId: 'sis-1004', nilai: 60, catatan: 'Kurang lengkap', createdAt: '2026-08-12', updatedAt: '2026-08-12' },
  { id: 'nil-23', komponenId: 'komp-kel-1', siswaId: 'sis-1004', nilai: 65, catatan: 'Sering tidur', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'nil-24', komponenId: 'komp-for-1', siswaId: 'sis-1004', nilai: 50, catatan: 'Perlu remedial', createdAt: '2026-08-14', updatedAt: '2026-08-14' },
  { id: 'nil-25', komponenId: 'komp-sum-1', siswaId: 'sis-1004', nilai: 54, catatan: 'Remedial belum tuntas', createdAt: '2026-09-08', updatedAt: '2026-09-08' },
  { id: 'nil-26', komponenId: 'komp-pas-1', siswaId: 'sis-1004', nilai: 52, catatan: '', createdAt: '2026-11-28', updatedAt: '2026-11-28' },

  // Hendra Wijaya (Problem Student: Bolos & Perilaku Rendah)
  { id: 'nil-30', komponenId: 'komp-tug-1', siswaId: 'sis-1008', nilai: 62, catatan: '', createdAt: '2026-08-05', updatedAt: '2026-08-05' },
  { id: 'nil-31', komponenId: 'komp-tug-2', siswaId: 'sis-1008', nilai: 65, catatan: '', createdAt: '2026-08-18', updatedAt: '2026-08-18' },
  { id: 'nil-32', komponenId: 'komp-cat-1', siswaId: 'sis-1008', nilai: 60, catatan: '', createdAt: '2026-08-12', updatedAt: '2026-08-12' },
  { id: 'nil-33', komponenId: 'komp-kel-1', siswaId: 'sis-1008', nilai: 55, catatan: 'Bolos jam pelajaran', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
  { id: 'nil-34', komponenId: 'komp-for-1', siswaId: 'sis-1008', nilai: 60, catatan: '', createdAt: '2026-08-14', updatedAt: '2026-08-14' },
  { id: 'nil-35', komponenId: 'komp-sum-1', siswaId: 'sis-1008', nilai: 58, catatan: '', createdAt: '2026-09-08', updatedAt: '2026-09-08' },
  { id: 'nil-36', komponenId: 'komp-pas-1', siswaId: 'sis-1008', nilai: 62, catatan: '', createdAt: '2026-11-28', updatedAt: '2026-11-28' },

  // Other standard students
  { id: 'nil-40', komponenId: 'komp-tug-1', siswaId: 'sis-1002', nilai: 80, createdAt: '2026-08-05', updatedAt: '2026-08-05' },
  { id: 'nil-41', komponenId: 'komp-for-1', siswaId: 'sis-1002', nilai: 78, createdAt: '2026-08-14', updatedAt: '2026-08-14' },
  { id: 'nil-42', komponenId: 'komp-sum-1', siswaId: 'sis-1002', nilai: 82, createdAt: '2026-09-08', updatedAt: '2026-09-08' },
  { id: 'nil-43', komponenId: 'komp-pas-1', siswaId: 'sis-1002', nilai: 79, createdAt: '2026-11-28', updatedAt: '2026-11-28' },

  { id: 'nil-50', komponenId: 'komp-tug-1', siswaId: 'sis-1005', nilai: 85, createdAt: '2026-08-05', updatedAt: '2026-08-05' },
  { id: 'nil-51', komponenId: 'komp-for-1', siswaId: 'sis-1005', nilai: 84, createdAt: '2026-08-14', updatedAt: '2026-08-14' },
  { id: 'nil-52', komponenId: 'komp-sum-1', siswaId: 'sis-1005', nilai: 88, createdAt: '2026-09-08', updatedAt: '2026-09-08' },
  { id: 'nil-53', komponenId: 'komp-pas-1', siswaId: 'sis-1005', nilai: 85, createdAt: '2026-11-28', updatedAt: '2026-11-28' },
];

const defaultBobotNilai: BobotNilai = {
  id: 'bobot-default',
  kelasId: '', // universal or per class
  mapelId: '',
  tahunAjaran: '2026/2027',
  semester: '1',
  tugas: 20,
  formatif: 25,
  sumatifLm: 30,
  sumatifAkhir: 25,
  bobotKehadiran: 10,
  bobotTugas: 20,
  bobotCatatan: 5,
  bobotKelakuan: 5,
  bobotFormatif: 20,
  bobotSumatif: 25,
  bobotPAS: 15,
};

const defaultSettings: AppSettings = {
  gasWebAppUrl: '',
  kktpDefault: 75,
  decimalPlaces: 1,
  batasAlpa: 3,
  batasBolos: 2,
  batasTerlambat: 3,
  batasIjin: 3,
  batasSakit: 5,
  batasPersentaseKehadiran: 75,
  formatKertas: 'F4',
  namaAplikasi: 'SISTEM PENILAIAN SISWA',
  darkMode: false,
};

export class StorageService {
  // Helper methods to read/write JSON in localStorage
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  // Profil Guru
  static getGuru(): ProfilGuru {
    return this.get<ProfilGuru>(STORAGE_KEYS.GURU, defaultGuru);
  }

  static saveGuru(guru: ProfilGuru): void {
    this.set(STORAGE_KEYS.GURU, guru);
    this.addLog('Update Profil Guru', guru.nama, 'Menyimpan pembaruan data profil guru');
  }

  // Profil Sekolah
  static getSekolah(): ProfilSekolah {
    return this.get<ProfilSekolah>(STORAGE_KEYS.SEKOLAH, defaultSekolah);
  }

  static saveSekolah(sekolah: ProfilSekolah): void {
    this.set(STORAGE_KEYS.SEKOLAH, sekolah);
    this.addLog('Update Profil Sekolah', 'Admin Guru', `Menyimpan data ${sekolah.namaSekolah}`);
  }

  // Tahun Ajaran
  static getTahunAjaranList(): TahunAjaran[] {
    return this.get<TahunAjaran[]>(STORAGE_KEYS.TAHUN_AJARAN, defaultTahunAjaran);
  }

  static saveTahunAjaran(item: TahunAjaran): void {
    const list = this.getTahunAjaranList();
    const index = list.findIndex((x) => x.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
    this.set(STORAGE_KEYS.TAHUN_AJARAN, list);
    this.addLog('Simpan Tahun Ajaran', 'Guru', `Tahun ${item.tahunAjaran} Semester ${item.semester}`);
  }

  static setActiveTahunAjaran(id: string): void {
    const list = this.getTahunAjaranList().map((ta) => ({
      ...ta,
      status: ta.id === id ? ('Aktif' as const) : ta.status === 'Aktif' ? ('Nonaktif' as const) : ta.status,
    }));
    this.set(STORAGE_KEYS.TAHUN_AJARAN, list);
  }

  // Buat Tahun Ajaran Baru (Sesuai Syarat No. 3 & 47: Tanpa menghapus data lama, dapat menyalin kelas/siswa)
  static buatTahunAjaranBaru(
    tahunAjaranBaru: string,
    semesterBaru: Semester,
    salinKelas: boolean,
    salinSiswa: boolean,
    salinMapel: boolean
  ): TahunAjaran {
    const listTA = this.getTahunAjaranList();
    const newId = `ta-${Date.now()}`;
    const newTA: TahunAjaran = {
      id: newId,
      tahunAjaran: tahunAjaranBaru,
      semester: semesterBaru,
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalSelesai: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Aktif',
    };

    // Jadikan TA lain Nonaktif jika masih aktif
    const updatedList: TahunAjaran[] = listTA.map((ta) => ({
      ...ta,
      status: (ta.status === 'Aktif' ? 'Nonaktif' : ta.status) as StatusTahunAjaran,
    }));
    updatedList.unshift(newTA);
    this.set(STORAGE_KEYS.TAHUN_AJARAN, updatedList);

    const activeOldTA = listTA.find((t) => t.status === 'Aktif') || listTA[0];
    const oldTAYear = activeOldTA ? activeOldTA.tahunAjaran : '';

    const kelasIdMap = new Map<string, string>();

    // 1. Salin Kelas jika diminta
    if (salinKelas && oldTAYear) {
      const existingKelas = this.getKelasList();
      const oldKelas = existingKelas.filter((k) => k.tahunAjaran === oldTAYear);
      const newKelasList: Kelas[] = [];

      oldKelas.forEach((k) => {
        const newKid = `kls-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        kelasIdMap.set(k.id, newKid);
        newKelasList.push({
          id: newKid,
          tahunAjaran: tahunAjaranBaru,
          tingkat: k.tingkat,
          namaKelas: k.namaKelas,
          waliKelas: k.waliKelas,
          status: 'Aktif',
        });
      });

      this.set(STORAGE_KEYS.KELAS, [...existingKelas, ...newKelasList]);
    }

    // 2. Salin Siswa jika diminta
    if (salinSiswa && oldTAYear) {
      const existingSiswa = this.getSiswaList();
      const oldSiswa = existingSiswa.filter((s) => s.tahunAjaran === oldTAYear && s.status === 'Aktif');
      const newSiswaList: Siswa[] = [];

      oldSiswa.forEach((s) => {
        const mappedKelasId = kelasIdMap.get(s.kelasId) || s.kelasId;
        newSiswaList.push({
          ...s,
          id: `sis-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          tahunAjaran: tahunAjaranBaru,
          kelasId: mappedKelasId,
        });
      });

      this.set(STORAGE_KEYS.SISWA, [...existingSiswa, ...newSiswaList]);
    }

    // 3. Salin Relasi Kelas & Mapel jika diminta
    if (salinMapel && oldTAYear) {
      const existingRelasi = this.getRelasiList();
      const oldRelasi = existingRelasi.filter((r) => r.tahunAjaran === oldTAYear);
      const newRelasiList: RelasiKelasMapel[] = [];

      oldRelasi.forEach((r) => {
        const mappedKelasId = kelasIdMap.get(r.kelasId) || r.kelasId;
        newRelasiList.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          kelasId: mappedKelasId,
          mapelId: r.mapelId,
          tahunAjaran: tahunAjaranBaru,
          semester: semesterBaru,
        });
      });

      this.set(STORAGE_KEYS.RELASI, [...existingRelasi, ...newRelasiList]);
    }

    this.addLog(
      'Buat Tahun Ajaran Baru',
      'Guru',
      `Tahun ${tahunAjaranBaru} (${semesterBaru}) dibuat. Data tahun lama tetap utuh & terisolasi.`
    );

    return newTA;
  }

  // Kelas
  static getKelasList(): Kelas[] {
    return this.get<Kelas[]>(STORAGE_KEYS.KELAS, defaultKelas);
  }

  static saveKelas(kelas: Kelas): void {
    const list = this.getKelasList();
    const index = list.findIndex((x) => x.id === kelas.id);
    if (index >= 0) {
      list[index] = kelas;
    } else {
      list.push(kelas);
    }
    this.set(STORAGE_KEYS.KELAS, list);
    this.addLog('Simpan Kelas', 'Guru', `Kelas ${kelas.namaKelas} (${kelas.tahunAjaran})`);
  }

  static deleteKelas(id: string): void {
    const list = this.getKelasList().filter((x) => x.id !== id);
    this.set(STORAGE_KEYS.KELAS, list);
    this.addLog('Hapus Kelas', 'Guru', `ID Kelas: ${id}`);
  }

  // Mapel
  static getMapelList(): Mapel[] {
    return this.get<Mapel[]>(STORAGE_KEYS.MAPEL, defaultMapel);
  }

  static saveMapel(mapel: Mapel): void {
    const list = this.getMapelList();
    const index = list.findIndex((x) => x.id === mapel.id);
    if (index >= 0) {
      list[index] = mapel;
    } else {
      list.push(mapel);
    }
    this.set(STORAGE_KEYS.MAPEL, list);
    this.addLog('Simpan Mapel', 'Guru', `Mapel ${mapel.namaMapel} (KKTP: ${mapel.kktp})`);
  }

  static deleteMapel(id: string): void {
    const list = this.getMapelList().filter((x) => x.id !== id);
    this.set(STORAGE_KEYS.MAPEL, list);
    this.addLog('Hapus Mapel', 'Guru', `ID Mapel: ${id}`);
  }

  // Relasi Kelas-Mapel
  static getRelasiList(): RelasiKelasMapel[] {
    return this.get<RelasiKelasMapel[]>(STORAGE_KEYS.RELASI, defaultRelasi);
  }

  static saveRelasi(relasi: RelasiKelasMapel): void {
    const list = this.getRelasiList();
    const index = list.findIndex((x) => x.id === relasi.id);
    if (index >= 0) {
      list[index] = relasi;
    } else {
      list.push(relasi);
    }
    this.set(STORAGE_KEYS.RELASI, list);
  }

  static deleteRelasi(id: string): void {
    const list = this.getRelasiList().filter((x) => x.id !== id);
    this.set(STORAGE_KEYS.RELASI, list);
  }

  // Siswa
  static getSiswaList(): Siswa[] {
    return this.get<Siswa[]>(STORAGE_KEYS.SISWA, defaultSiswa);
  }

  static saveSiswa(siswa: Siswa): void {
    const list = this.getSiswaList();
    const index = list.findIndex((x) => x.id === siswa.id);
    if (index >= 0) {
      list[index] = siswa;
    } else {
      list.push(siswa);
    }
    this.set(STORAGE_KEYS.SISWA, list);
    this.addLog('Simpan Data Siswa', 'Guru', `Siswa: ${siswa.nama} (NIS: ${siswa.nis})`);
  }

  static saveSiswaBatch(newSiswa: Siswa[]): void {
    const list = this.getSiswaList();
    const idMap = new Map(list.map((s) => [s.id, s]));
    newSiswa.forEach((s) => idMap.set(s.id, s));
    this.set(STORAGE_KEYS.SISWA, Array.from(idMap.values()));
    this.addLog('Import Siswa', 'Guru', `Berhasil mengimpor/menyimpan ${newSiswa.length} data siswa.`);
  }

  static deleteSiswa(id: string): void {
    const list = this.getSiswaList().filter((x) => x.id !== id);
    this.set(STORAGE_KEYS.SISWA, list);
    this.addLog('Hapus Siswa', 'Guru', `Menghapus siswa ID: ${id}`);
  }

  // Absensi
  static getAbsensiList(): AbsensiRecord[] {
    return this.get<AbsensiRecord[]>(STORAGE_KEYS.ABSENSI, defaultAbsensi);
  }

  static saveAbsensiBatch(records: AbsensiRecord[]): void {
    const all = this.getAbsensiList();
    // Unique key: tanggal + siswaId + mapelId + semester + tahunAjaran
    const map = new Map<string, AbsensiRecord>();
    all.forEach((r) => {
      const key = `${r.tanggal}_${r.siswaId}_${r.mapelId}_${r.tahunAjaran}_${r.semester}`;
      map.set(key, r);
    });

    records.forEach((r) => {
      const key = `${r.tanggal}_${r.siswaId}_${r.mapelId}_${r.tahunAjaran}_${r.semester}`;
      map.set(key, r);
    });

    this.set(STORAGE_KEYS.ABSENSI, Array.from(map.values()));
    this.addLog('Simpan Absensi Massal', 'Guru', `Menyimpan ${records.length} rekaman absensi.`);
  }

  // Komponen Nilai
  static getKomponenList(): KomponenNilai[] {
    return this.get<KomponenNilai[]>(STORAGE_KEYS.KOMPONEN_NILAI, defaultKomponen);
  }

  static saveKomponen(komp: KomponenNilai): void {
    const list = this.getKomponenList();
    const index = list.findIndex((x) => x.id === komp.id);
    if (index >= 0) {
      list[index] = komp;
    } else {
      list.push(komp);
    }
    this.set(STORAGE_KEYS.KOMPONEN_NILAI, list);
    this.addLog('Simpan Komponen Nilai', 'Guru', `${komp.jenis}: ${komp.namaKomponen}`);
  }

  static deleteKomponen(id: string): void {
    const list = this.getKomponenList().filter((x) => x.id !== id);
    this.set(STORAGE_KEYS.KOMPONEN_NILAI, list);
    // Remove attached details
    const details = this.getNilaiDetailList().filter((d) => d.komponenId !== id);
    this.set(STORAGE_KEYS.NILAI_DETAIL, details);
    this.addLog('Hapus Komponen Nilai', 'Guru', `ID: ${id}`);
  }

  // Nilai Detail
  static getNilaiDetailList(): NilaiDetail[] {
    return this.get<NilaiDetail[]>(STORAGE_KEYS.NILAI_DETAIL, defaultNilaiDetail);
  }

  static saveNilaiDetailBatch(details: NilaiDetail[]): void {
    const all = this.getNilaiDetailList();
    const map = new Map<string, NilaiDetail>();
    all.forEach((d) => {
      map.set(`${d.komponenId}_${d.siswaId}`, d);
    });

    details.forEach((d) => {
      map.set(`${d.komponenId}_${d.siswaId}`, d);
    });

    this.set(STORAGE_KEYS.NILAI_DETAIL, Array.from(map.values()));
    this.addLog('Input Nilai Massal', 'Guru', `Menyimpan ${details.length} entri nilai.`);
  }

  // Bobot Nilai
  static getBobotNilai(kelasId?: string, mapelId?: string, tahunAjaran?: string, semester?: Semester): BobotNilai {
    const all = this.get<BobotNilai[]>(STORAGE_KEYS.BOBOT_NILAI, [defaultBobotNilai]);
    // Match specific or fallback to default
    const matched = all.find(
      (b) =>
        (!kelasId || b.kelasId === kelasId || b.kelasId === '') &&
        (!mapelId || b.mapelId === mapelId || b.mapelId === '') &&
        (!tahunAjaran || b.tahunAjaran === tahunAjaran) &&
        (!semester || b.semester === semester)
    );
    return matched || defaultBobotNilai;
  }

  static saveBobotNilai(bobot: BobotNilai): void {
    const all = this.get<BobotNilai[]>(STORAGE_KEYS.BOBOT_NILAI, [defaultBobotNilai]);
    const index = all.findIndex(
      (b) =>
        b.kelasId === bobot.kelasId &&
        b.mapelId === bobot.mapelId &&
        b.tahunAjaran === bobot.tahunAjaran &&
        b.semester === bobot.semester
    );
    if (index >= 0) {
      all[index] = bobot;
    } else {
      all.push(bobot);
    }
    this.set(STORAGE_KEYS.BOBOT_NILAI, all);
    this.addLog('Pengaturan Bobot', 'Guru', 'Memperbarui bobot penilaian.');
  }

  // Settings
  static getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  }

  static saveSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
    this.addLog('Update Pengaturan', 'Guru', 'Menyimpan konfigurasi sistem.');
  }

  // Logs
  static getLogs(): LogAktivitas[] {
    return this.get<LogAktivitas[]>(STORAGE_KEYS.LOGS, [
      {
        id: 'log-init',
        waktu: new Date().toLocaleString('id-ID'),
        aktivitas: 'Sistem Diinisialisasi',
        user: 'System',
        detail: 'Sistem Penilaian Siswa siap digunakan.',
      },
    ]);
  }

  static addLog(aktivitas: string, user: string, detail: string): void {
    const logs = this.getLogs();
    logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      waktu: new Date().toLocaleString('id-ID'),
      aktivitas,
      user,
      detail,
    });
    // Keep last 150 logs
    this.set(STORAGE_KEYS.LOGS, logs.slice(0, 150));
  }

  // CORE COMPUTATION: Calculate Comprehensive Student Grades & Rekap
  static calculateRekapNilai(
    kelasId: string,
    mapelId: string,
    tahunAjaran: string,
    semester: Semester
  ): {
    siswa: Siswa;
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
    totalPertemuan: number;
    alpa: number;
    bolos: number;
    terlambat: number;
    sakit: number;
    ijin: number;
    hadir: number;
  }[] {
    const siswaList = this.getSiswaList().filter((s) => s.kelasId === kelasId && s.status === 'Aktif');
    const komponenList = this.getKomponenList().filter(
      (k) =>
        k.kelasId === kelasId &&
        k.mapelId === mapelId &&
        k.tahunAjaran === tahunAjaran &&
        k.semester === semester
    );
    const nilaiDetails = this.getNilaiDetailList();
    const absensiList = this.getAbsensiList().filter(
      (a) =>
        a.kelasId === kelasId &&
        a.mapelId === mapelId &&
        a.tahunAjaran === tahunAjaran &&
        a.semester === semester
    );
    const bobot = this.getBobotNilai(kelasId, mapelId, tahunAjaran, semester);
    const mapel = this.getMapelList().find((m) => m.id === mapelId);
    const kktp = mapel ? mapel.kktp : 75;
    const settings = this.getSettings();

    // Map components by type
    const tugasKomps = komponenList.filter((k) => k.jenis === 'Tugas');
    const catatanKomps = komponenList.filter((k) => k.jenis === 'Catatan');
    const kelakuanKomps = komponenList.filter((k) => k.jenis === 'Kelakuan');
    const formatifKomps = komponenList.filter((k) => k.jenis === 'Formatif');
    const sumatifKomps = komponenList.filter((k) => k.jenis === 'Sumatif');
    const pasKomps = komponenList.filter((k) => k.jenis === 'PAS');

    // Unique meeting dates for attendance
    const uniqueDates = Array.from(new Set(absensiList.map((a) => a.tanggal)));
    const totalPertemuan = Math.max(uniqueDates.length, 1);

    return siswaList.map((siswa) => {
      // 1. Attendance calculations
      const studentAbs = absensiList.filter((a) => a.siswaId === siswa.id);
      const hadir = studentAbs.filter((a) => a.status === 'Hadir').length;
      const ijin = studentAbs.filter((a) => a.status === 'Ijin').length;
      const sakit = studentAbs.filter((a) => a.status === 'Sakit').length;
      const terlambat = studentAbs.filter((a) => a.status === 'Terlambat').length;
      const alpa = studentAbs.filter((a) => a.status === 'Alpa').length;
      const bolos = studentAbs.filter((a) => a.status === 'Bolos').length;

      // Attendance score: (hadir + terlambat * 0.8 + ijin * 0.5 + sakit * 0.7) / totalPertemuan * 100
      // or standard Indonesian formula: (Hadir / total) * 100
      const calculatedAttendance = studentAbs.length > 0
        ? Math.min(100, Math.round(((hadir + terlambat * 0.8) / Math.max(studentAbs.length, 1)) * 100))
        : 100;

      // 2. Component averages
      const getAvg = (komps: KomponenNilai[]): number => {
        if (komps.length === 0) return 0;
        const vals: number[] = [];
        komps.forEach((k) => {
          const det = nilaiDetails.find((d) => d.komponenId === k.id && d.siswaId === siswa.id);
          if (det !== undefined && det.nilai !== undefined && det.nilai !== null) {
            vals.push(det.nilai);
          }
        });
        if (vals.length === 0) return 0;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      };

      const nilaiKehadiran = calculatedAttendance;
      const nilaiTugas = getAvg(tugasKomps);
      const nilaiCatatan = getAvg(catatanKomps);
      const nilaiKelakuan = getAvg(kelakuanKomps);
      const nilaiFormatif = getAvg(formatifKomps);
      const nilaiSumatif = getAvg(sumatifKomps);
      const nilaiPAS = getAvg(pasKomps);

      // 3. Weighted Final Grade calculation
      // Formula: Sum(Component * Weight) / 100
      const rawFinal =
        (nilaiKehadiran * bobot.bobotKehadiran +
          nilaiTugas * bobot.bobotTugas +
          nilaiCatatan * bobot.bobotCatatan +
          nilaiKelakuan * bobot.bobotKelakuan +
          nilaiFormatif * bobot.bobotFormatif +
          nilaiSumatif * bobot.bobotSumatif +
          nilaiPAS * bobot.bobotPAS) /
        100;

      const roundedFinal = Number(rawFinal.toFixed(settings.decimalPlaces));
      const status: 'Mencapai KKTP' | 'Belum Mencapai KKTP' =
        roundedFinal >= kktp ? 'Mencapai KKTP' : 'Belum Mencapai KKTP';

      return {
        siswa,
        nilaiKehadiran,
        nilaiTugas: Number(nilaiTugas.toFixed(settings.decimalPlaces)),
        nilaiCatatan: Number(nilaiCatatan.toFixed(settings.decimalPlaces)),
        nilaiKelakuan: Number(nilaiKelakuan.toFixed(settings.decimalPlaces)),
        nilaiFormatif: Number(nilaiFormatif.toFixed(settings.decimalPlaces)),
        nilaiSumatif: Number(nilaiSumatif.toFixed(settings.decimalPlaces)),
        nilaiPAS: Number(nilaiPAS.toFixed(settings.decimalPlaces)),
        nilaiAkhir: roundedFinal,
        kktp,
        status,
        totalPertemuan,
        alpa,
        bolos,
        terlambat,
        sakit,
        ijin,
        hadir,
      };
    });
  }

  // AUTOMATED PROBLEM STUDENT DETECTION (Requirements No. 5 & 40)
  static getSiswaBermasalah(
    kelasId?: string,
    mapelId?: string,
    tahunAjaran?: string,
    semester?: Semester
  ): SiswaBermasalahItem[] {
    const settings = this.getSettings();
    const kelasList = this.getKelasList();
    const mapelList = this.getMapelList();
    const taList = this.getTahunAjaranList();
    const activeTA = taList.find((t) => t.status === 'Aktif') || taList[0];

    const currentYear = tahunAjaran || (activeTA ? activeTA.tahunAjaran : '2026/2027');
    const currentSem = semester || (activeTA ? activeTA.semester : '1');

    const targetKelasList = kelasId ? kelasList.filter((k) => k.id === kelasId) : kelasList;
    const targetMapel = mapelId ? mapelList.find((m) => m.id === mapelId) || mapelList[0] : mapelList[0];

    const problemItems: SiswaBermasalahItem[] = [];

    targetKelasList.forEach((k) => {
      const rekap = this.calculateRekapNilai(k.id, targetMapel.id, currentYear, currentSem);

      rekap.forEach((item) => {
        const masalahList: string[] = [];
        let scoreIssues = 0;
        let attendanceIssues = 0;

        // Check Attendance Issues
        if (item.alpa >= settings.batasAlpa) {
          masalahList.push(`Alpa mencapai ${item.alpa} kali (Batas: ≥${settings.batasAlpa})`);
          attendanceIssues += 2;
        }
        if (item.bolos >= settings.batasBolos) {
          masalahList.push(`Bolos jam pelajaran ${item.bolos} kali (Batas: ≥${settings.batasBolos})`);
          attendanceIssues += 2;
        }
        if (item.terlambat >= settings.batasTerlambat) {
          masalahList.push(`Terlambat ${item.terlambat} kali (Batas: ≥${settings.batasTerlambat})`);
          attendanceIssues += 1;
        }

        // Check Academic Issues
        if (item.nilaiAkhir > 0 && item.nilaiAkhir < item.kktp) {
          masalahList.push(`Nilai akhir (${item.nilaiAkhir}) di bawah KKTP (${item.kktp})`);
          scoreIssues += 2;
        }
        if (item.nilaiTugas > 0 && item.nilaiTugas < item.kktp) {
          masalahList.push(`Rata-rata tugas (${item.nilaiTugas}) belum mencapai KKTP`);
          scoreIssues += 1;
        }
        if (item.nilaiFormatif > 0 && item.nilaiFormatif < item.kktp) {
          masalahList.push(`Nilai formatif (${item.nilaiFormatif}) belum tuntas`);
          scoreIssues += 1;
        }
        if (item.nilaiSumatif > 0 && item.nilaiSumatif < item.kktp) {
          masalahList.push(`Nilai sumatif (${item.nilaiSumatif}) belum tuntas`);
          scoreIssues += 1;
        }

        // Check Behavior Issues
        if (item.nilaiKelakuan > 0 && item.nilaiKelakuan < 70) {
          masalahList.push(`Nilai kelakuan/sikap rendah (${item.nilaiKelakuan})`);
          scoreIssues += 1;
        }

        let status: 'Aman' | 'Perlu Perhatian' | 'Bermasalah' = 'Aman';
        if (attendanceIssues >= 2 || scoreIssues >= 2) {
          status = 'Bermasalah';
        } else if (attendanceIssues > 0 || scoreIssues > 0) {
          status = 'Perlu Perhatian';
        }

        if (status !== 'Aman') {
          problemItems.push({
            siswa: item.siswa,
            kelasNama: k.namaKelas,
            alpa: item.alpa,
            bolos: item.bolos,
            terlambat: item.terlambat,
            ijin: item.ijin,
            sakit: item.sakit,
            hadir: item.hadir,
            totalPertemuan: item.totalPertemuan,
            nilaiAkhir: item.nilaiAkhir,
            nilaiTugas: item.nilaiTugas,
            nilaiFormatif: item.nilaiFormatif,
            nilaiSumatif: item.nilaiSumatif,
            nilaiKelakuan: item.nilaiKelakuan,
            kktp: item.kktp,
            masalahList,
            status,
          });
        }
      });
    });

    return problemItems;
  }

  // Backup & Restore All Data (Requirement No. 37)
  static exportFullBackupJSON(): string {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      guru: this.getGuru(),
      sekolah: this.getSekolah(),
      tahunAjaran: this.getTahunAjaranList(),
      kelas: this.getKelasList(),
      mapel: this.getMapelList(),
      relasi: this.getRelasiList(),
      siswa: this.getSiswaList(),
      absensi: this.getAbsensiList(),
      komponenNilai: this.getKomponenList(),
      nilaiDetail: this.getNilaiDetailList(),
      bobotNilai: this.get<BobotNilai[]>(STORAGE_KEYS.BOBOT_NILAI, [defaultBobotNilai]),
      settings: this.getSettings(),
    };
    return JSON.stringify(backupObj, null, 2);
  }

  static importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.guru) this.set(STORAGE_KEYS.GURU, data.guru);
      if (data.sekolah) this.set(STORAGE_KEYS.SEKOLAH, data.sekolah);
      if (data.tahunAjaran) this.set(STORAGE_KEYS.TAHUN_AJARAN, data.tahunAjaran);
      if (data.kelas) this.set(STORAGE_KEYS.KELAS, data.kelas);
      if (data.mapel) this.set(STORAGE_KEYS.MAPEL, data.mapel);
      if (data.relasi) this.set(STORAGE_KEYS.RELASI, data.relasi);
      if (data.siswa) this.set(STORAGE_KEYS.SISWA, data.siswa);
      if (data.absensi) this.set(STORAGE_KEYS.ABSENSI, data.absensi);
      if (data.komponenNilai) this.set(STORAGE_KEYS.KOMPONEN_NILAI, data.komponenNilai);
      if (data.nilaiDetail) this.set(STORAGE_KEYS.NILAI_DETAIL, data.nilaiDetail);
      if (data.bobotNilai) this.set(STORAGE_KEYS.BOBOT_NILAI, data.bobotNilai);
      if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);

      this.addLog('Restore Data', 'Guru', `Database dipulihkan dari cadangan (${data.exportedAt || 'Eksternal'})`);
      return true;
    } catch (e) {
      console.error('Import backup failed:', e);
      return false;
    }
  }

  static resetToDefaultData(): void {
    localStorage.clear();
    this.set(STORAGE_KEYS.GURU, defaultGuru);
    this.set(STORAGE_KEYS.SEKOLAH, defaultSekolah);
    this.set(STORAGE_KEYS.TAHUN_AJARAN, defaultTahunAjaran);
    this.set(STORAGE_KEYS.KELAS, defaultKelas);
    this.set(STORAGE_KEYS.MAPEL, defaultMapel);
    this.set(STORAGE_KEYS.RELASI, defaultRelasi);
    this.set(STORAGE_KEYS.SISWA, defaultSiswa);
    this.set(STORAGE_KEYS.ABSENSI, defaultAbsensi);
    this.set(STORAGE_KEYS.KOMPONEN_NILAI, defaultKomponen);
    this.set(STORAGE_KEYS.NILAI_DETAIL, defaultNilaiDetail);
    this.set(STORAGE_KEYS.BOBOT_NILAI, [defaultBobotNilai]);
    this.set(STORAGE_KEYS.SETTINGS, defaultSettings);
    this.addLog('Reset Sistem', 'Guru', 'Database direset ke data awal pengujian.');
  }

  // Unified convenience methods for App.tsx & Views
  static saveTahunAjaranList(list: TahunAjaran[]): void {
    this.set(STORAGE_KEYS.TAHUN_AJARAN, list);
    this.addLog('Simpan Daftar Tahun Ajaran', 'Guru', `Menyimpan ${list.length} tahun ajaran`);
  }

  static createNewAcademicYear(
    tahunBaru: string,
    semesterBaru: Semester,
    salinKelas: boolean,
    salinSiswa: boolean,
    salinMapel: boolean
  ) {
    this.buatTahunAjaranBaru(tahunBaru, semesterBaru, salinKelas, salinSiswa, salinMapel);
    return {
      tahunAjaranList: this.getTahunAjaranList(),
      kelasList: this.getKelasList(),
      siswaList: this.getSiswaList(),
      relasiList: this.getRelasiList(),
    };
  }

  static getNilaiList(): NilaiSiswa[] {
    const raw = this.get<NilaiSiswa[]>('sps_nilai_siswa_v1', []);
    if (raw.length > 0) return raw;

    // Generate initial demo grades from existing Siswa if empty
    const siswa = this.getSiswaList();
    const demo: NilaiSiswa[] = siswa.map((s, idx) => {
      const na = 75 + (idx % 20);
      const isTuntas = na >= 75;
      return {
        id: `nil-${s.id}-mapel-1-1`,
        siswaId: s.id,
        kelasId: s.kelasId,
        mapelId: 'mapel-1',
        tahunAjaran: s.tahunAjaran || '2026/2027',
        semester: '1' as Semester,
        tugas: [80, 85, 82],
        formatif: [78, 80, 84],
        sumatifLm: [80, 85, 80],
        sumatifAkhir: 82,
        rataTugas: 82.33,
        rataFormatif: 80.67,
        rataSumatifLm: 81.67,
        nilaiAkhir: na,
        predikat: na >= 90 ? 'A' : na >= 80 ? 'B' : na >= 75 ? 'C' : 'D',
        keterangan: isTuntas ? 'Tuntas' : 'Belum Tuntas (Perlu Remedial)',
        catatan: 'Aktif mengikuti kegiatan pembelajaran dengan baik.',
        kelakuan: {
          kedisiplinan: 'A',
          tanggungJawab: 'A',
          kejujuran: 'A',
          kerjasama: 'B',
          kesopanan: 'A',
          deskripsi: 'Menunjukkan integritas, etika santun, dan disiplin belajar yang baik.',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    this.set('sps_nilai_siswa_v1', demo);
    return demo;
  }

  static saveNilaiBatch(records: NilaiSiswa[]): NilaiSiswa[] {
    const existing = this.getNilaiList();
    const map = new Map<string, NilaiSiswa>();
    existing.forEach((r) => map.set(r.id, r));
    records.forEach((r) => map.set(r.id, r));
    const merged = Array.from(map.values());
    this.set('sps_nilai_siswa_v1', merged);
    this.addLog('Simpan Batch Nilai', 'Guru', `Memperbarui ${records.length} nilai siswa`);
    return merged;
  }

  static getGasConfig(): GasConnectionConfig {
    return this.get<GasConnectionConfig>('sps_gas_config_v1', {
      webAppUrl: '',
      spreadsheetId: '',
      connected: false,
    });
  }

  static saveGasConfig(cfg: GasConnectionConfig): void {
    this.set('sps_gas_config_v1', cfg);
    this.addLog('Update Konfigurasi GAS', 'Guru', `Web App: ${cfg.webAppUrl ? 'Terkoneksi' : 'Kosong'}`);
  }

  static exportAllData(): any {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      guru: this.getGuru(),
      sekolah: this.getSekolah(),
      tahunAjaran: this.getTahunAjaranList(),
      kelas: this.getKelasList(),
      mapel: this.getMapelList(),
      relasi: this.getRelasiList(),
      siswa: this.getSiswaList(),
      absensi: this.getAbsensiList(),
      nilai: this.getNilaiList(),
      bobot: this.getBobotNilai(),
      settings: this.getSettings(),
      gasConfig: this.getGasConfig(),
    };
  }

  static restoreAllData(data: any): void {
    if (data.guru) this.saveGuru(data.guru);
    if (data.sekolah) this.saveSekolah(data.sekolah);
    if (data.tahunAjaran) this.saveTahunAjaranList(data.tahunAjaran);
    if (data.kelas) this.set(STORAGE_KEYS.KELAS, data.kelas);
    if (data.mapel) this.set(STORAGE_KEYS.MAPEL, data.mapel);
    if (data.relasi) this.set(STORAGE_KEYS.RELASI, data.relasi);
    if (data.siswa) this.set(STORAGE_KEYS.SISWA, data.siswa);
    if (data.absensi) this.set(STORAGE_KEYS.ABSENSI, data.absensi);
    if (data.nilai) this.set('sps_nilai_siswa_v1', data.nilai);
    if (data.bobot) this.saveBobotNilai(data.bobot);
    if (data.settings) this.saveSettings(data.settings);
    if (data.gasConfig) this.saveGasConfig(data.gasConfig);
    this.addLog('Restore Sistem', 'Guru', 'Database berhasil dipulihkan dari cadangan eksternal.');
  }

  static resetToDefaults(): void {
    this.resetToDefaultData();
    localStorage.removeItem('sps_nilai_siswa_v1');
    localStorage.removeItem('sps_active_bobot_v1');
    localStorage.removeItem('sps_gas_config_v1');
  }

  static detectProblemStudents(
    siswaList: Siswa[],
    absensiList: AbsensiRecord[],
    nilaiList: NilaiSiswa[],
    settings: AppSettings,
    selectedTahunAjaran: string,
    selectedSemester: Semester,
    selectedKelasId: string,
    selectedMapelId: string
  ): SiswaBermasalah[] {
    const studentsInClass = siswaList.filter(
      (s) => s.kelasId === selectedKelasId && s.status === 'Aktif'
    );

    const results: SiswaBermasalah[] = [];

    studentsInClass.forEach((siswa) => {
      const studentAbs = absensiList.filter(
        (a) =>
          a.siswaId === siswa.id &&
          a.kelasId === selectedKelasId &&
          a.tahunAjaran === selectedTahunAjaran &&
          a.semester === selectedSemester
      );

      const alpaCount = studentAbs.filter((a) => a.status === 'Alpa').length;
      const bolosCount = studentAbs.filter((a) => a.status === 'Bolos').length;
      const terlambatCount = studentAbs.filter((a) => a.status === 'Terlambat').length;
      const hadirCount = studentAbs.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;
      const total = studentAbs.length;
      const persentaseKehadiran = total > 0 ? Math.round((hadirCount / total) * 100) : 100;

      const grade = nilaiList.find(
        (n) =>
          n.siswaId === siswa.id &&
          n.kelasId === selectedKelasId &&
          n.mapelId === selectedMapelId &&
          n.tahunAjaran === selectedTahunAjaran &&
          n.semester === selectedSemester
      );

      const nilaiAkhir = grade?.nilaiAkhir ?? 0;
      const kktp = settings.kktpDefault || 75;
      const nilaiBawahKktp = nilaiAkhir > 0 && nilaiAkhir < kktp;

      const issues: string[] = [];
      let score = 0;

      if (alpaCount >= (settings.batasAlpa || 3)) {
        issues.push(`Alpa ${alpaCount} hari (Batas: ${settings.batasAlpa || 3} hari)`);
        score += alpaCount * 12;
      }
      if (bolosCount >= (settings.batasBolos || 2)) {
        issues.push(`Membolos ${bolosCount} kali (Batas: ${settings.batasBolos || 2} kali)`);
        score += bolosCount * 10;
      }
      if (terlambatCount >= (settings.batasTerlambat || 5)) {
        issues.push(`Terlambat ${terlambatCount} kali`);
        score += terlambatCount * 4;
      }
      if (persentaseKehadiran < (settings.batasPersentaseKehadiran || 75)) {
        issues.push(`Kehadiran rendah: ${persentaseKehadiran}% (Minimal ${settings.batasPersentaseKehadiran || 75}%)`);
        score += 20;
      }
      if (nilaiBawahKktp) {
        issues.push(`Nilai akhir ${nilaiAkhir} di bawah KKTP (${kktp})`);
        score += 15;
      }

      if (issues.length > 0) {
        let level: 'Ringan' | 'Sedang' | 'Berat' = 'Ringan';
        if (score >= 35 || alpaCount >= (settings.batasAlpa || 3) + 2) {
          level = 'Berat';
        } else if (score >= 20 || alpaCount >= (settings.batasAlpa || 3)) {
          level = 'Sedang';
        }

        results.push({
          siswa,
          level,
          score,
          alpaCount,
          bolosCount,
          terlambatCount,
          persentaseKehadiran,
          nilaiAkhir,
          nilaiBawahKktp,
          issues,
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  // ==========================================
  // CATATAN GURU & REFLEKSI SETIAP PERTEMUAN
  // ==========================================
  static getCatatanRefleksiList(): CatatanRefleksiPertemuan[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATATAN_REFLEKSI);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse catatan refleksi data', e);
      }
    }
    // Default seed data
    const initialData: CatatanRefleksiPertemuan[] = [
      {
        id: 'cr-1',
        pertemuanKe: 1,
        tanggal: '2026-07-20',
        kelasId: 'kelas-1',
        mapelId: 'mapel-1',
        tahunAjaran: '2026/2027',
        semester: '1',
        materiPokok: 'Eksponen dan Logaritma: Definisi dan Sifat Dasar',
        tujuanPembelajaran: 'Peserta didik mampu memahami konsep bilangan berpangkat dan menerapkan sifat-sifat dasar eksponen.',
        catatanGuru: 'Apersepsi diawali dengan kuis cepat konsep perkalian berulang. 85% siswa antusias dan berpartisipasi aktif dalam diskusi kelompok.',
        refleksiGuru: 'Penyampaian materi konsep berlangsung efektif. Namun alokasi waktu pada sesi latihan soal cerita agak terbatas.',
        tindakLanjut: 'Memberikan 2 soal latihan mandiri sebagai penguatan dan mereview 5 menit di awal pertemuan ke-2.',
        ketercapaian: 88,
        siswaPerhatian: 'Ahmad Rizki (perlu bantuan operasi tanda negatif pada eksponen)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cr-2',
        pertemuanKe: 2,
        tanggal: '2026-07-27',
        kelasId: 'kelas-1',
        mapelId: 'mapel-1',
        tahunAjaran: '2026/2027',
        semester: '1',
        materiPokok: 'Penyederhanaan dan Operasi Bentuk Akar',
        tujuanPembelajaran: 'Peserta didik mampu merasionalkan penyebut pecahan bentuk akar dan menyelesaikan masalah terkait.',
        catatanGuru: 'Penggunaan LKPD berbasis problem solving berhasil memicu diskusi aktif antarkelompok. Beberapa kelompok sudah mandiri mencari pola.',
        refleksiGuru: 'Metode tutor sebaya terbukti ampuh membantu siswa yang sebelumnya ragu bertanya langsung ke guru.',
        tindakLanjut: 'Melanjutkan ke materi persamaan eksponen dengan tingkat kesulitan bertahap.',
        ketercapaian: 92,
        siswaPerhatian: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cr-3',
        pertemuanKe: 3,
        tanggal: '2026-08-03',
        kelasId: 'kelas-1',
        mapelId: 'mapel-1',
        tahunAjaran: '2026/2027',
        semester: '1',
        materiPokok: 'Persamaan Eksponensial Sederhana',
        tujuanPembelajaran: 'Peserta didik mampu menentukan himpunan penyelesaian persamaan eksponen.',
        catatanGuru: 'Siswa mengerjakan asesmen formatif 1. Sebagian besar selesai tepat waktu.',
        refleksiGuru: 'Konsep dasar dipahami baik, namun perlu penekanan pada syarat basis a > 0 dan a ≠ 1.',
        tindakLanjut: 'Mengadakan sesi remedial kelompok kecil untuk 3 siswa yang belum tuntas.',
        ketercapaian: 85,
        siswaPerhatian: 'Budi Santoso & Citra Dewi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    this.saveCatatanRefleksiList(initialData);
    return initialData;
  }

  static saveCatatanRefleksiList(list: CatatanRefleksiPertemuan[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATATAN_REFLEKSI, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save catatan refleksi list', e);
    }
  }
}
