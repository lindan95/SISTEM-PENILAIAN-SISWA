import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import {
  MenuItemId,
  ProfilGuru,
  ProfilSekolah,
  TahunAjaran,
  Semester,
  Kelas,
  Mapel,
  RelasiKelasMapel,
  Siswa,
  AbsensiRecord,
  NilaiSiswa,
  BobotNilai,
  AppSettings,
  GasConnectionConfig,
  CatatanRefleksiPertemuan,
} from './types';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { ProfilGuruView } from './components/ProfilGuruView';
import { ProfilSekolahView } from './components/ProfilSekolahView';
import { TahunAjaranView } from './components/TahunAjaranView';
import { KelasMapelView } from './components/KelasMapelView';
import { DataSiswaView } from './components/DataSiswaView';
import { AbsensiView } from './components/AbsensiView';
import { PenilaianView } from './components/PenilaianView';
import { RekapNilaiView } from './components/RekapNilaiView';
import { RaporView } from './components/RaporView';
import { SiswaBermasalahView } from './components/SiswaBermasalahView';
import { GasCodeView } from './components/GasCodeView';
import { BackupPengaturanView } from './components/BackupPengaturanView';
import { CloudSyncModal } from './components/CloudSyncModal';

// Firebase Services & Auth
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  syncDataToCloud,
  loadDataFromCloud,
} from './services/firebase';

export default function App() {
  // Navigation & context states
  const [activeMenu, setActiveMenu] = useState<MenuItemId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sps_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sps_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut listener for F9 or Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' || (e.ctrlKey && e.key.toLowerCase() === 'b') || (e.metaKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        if (window.innerWidth < 1024) {
          setIsMobileSidebarOpen((prev) => !prev);
        } else {
          toggleDesktopSidebar();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  // Entity States from LocalStorage / StorageService
  const [guru, setGuru] = useState<ProfilGuru>(() => StorageService.getGuru());
  const [sekolah, setSekolah] = useState<ProfilSekolah>(() => StorageService.getSekolah());
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>(() => StorageService.getTahunAjaranList());
  const [kelasList, setKelasList] = useState<Kelas[]>(() => StorageService.getKelasList());
  const [mapelList, setMapelList] = useState<Mapel[]>(() => StorageService.getMapelList());
  const [relasiList, setRelasiList] = useState<RelasiKelasMapel[]>(() => StorageService.getRelasiList());
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => StorageService.getSiswaList());
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>(() => StorageService.getAbsensiList());
  const [nilaiList, setNilaiList] = useState<NilaiSiswa[]>(() => StorageService.getNilaiList());
  const [bobotNilai, setBobotNilai] = useState<BobotNilai>(() => StorageService.getBobotNilai());
  const [catatanRefleksiList, setCatatanRefleksiList] = useState<CatatanRefleksiPertemuan[]>(() =>
    StorageService.getCatatanRefleksiList()
  );
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [gasConfig, setGasConfig] = useState<GasConnectionConfig>(() => StorageService.getGasConfig());

  // Firebase Multi-Device Cloud Sync States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sps_last_cloud_sync');
    } catch {
      return null;
    }
  });

  // Global Context Filter States
  const activeTA = tahunAjaranList.find((t) => t.status === 'Aktif') || tahunAjaranList[0];
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>(activeTA?.tahunAjaran || '2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<Semester>(activeTA?.semester || '1');
  const [selectedKelasId, setSelectedKelasId] = useState<string>(kelasList[0]?.id || '');
  const [selectedMapelId, setSelectedMapelId] = useState<string>(mapelList[0]?.id || '');

  // Keep active context aligned if classes or mapels change
  useEffect(() => {
    if (kelasList.length > 0 && !kelasList.some((k) => k.id === selectedKelasId)) {
      setSelectedKelasId(kelasList[0].id);
    }
  }, [kelasList, selectedKelasId]);

  useEffect(() => {
    if (mapelList.length > 0 && !mapelList.some((m) => m.id === selectedMapelId)) {
      setSelectedMapelId(mapelList[0].id);
    }
  }, [mapelList, selectedMapelId]);

  // Synchronize active academic year when changed in header
  const handleTahunAjaranChange = (newTa: string) => {
    setSelectedTahunAjaran(newTa);
    const found = tahunAjaranList.find((t) => t.tahunAjaran === newTa);
    if (found) {
      setSelectedSemester(found.semester);
    }
  };

  // Profile Guru & Sekolah Handlers
  const handleSaveGuru = (updated: ProfilGuru) => {
    StorageService.saveGuru(updated);
    setGuru(updated);
  };

  const handleSaveSekolah = (updated: ProfilSekolah) => {
    StorageService.saveSekolah(updated);
    setSekolah(updated);
  };

  // Academic Year Handlers
  const handleSetActiveTahunAjaran = (id: string) => {
    const updated = tahunAjaranList.map((t) => ({
      ...t,
      status: (t.id === id ? 'Aktif' : 'Nonaktif') as 'Aktif' | 'Nonaktif' | 'Arsip',
    }));
    StorageService.saveTahunAjaranList(updated);
    setTahunAjaranList(updated);

    const activeItem = updated.find((t) => t.id === id);
    if (activeItem) {
      setSelectedTahunAjaran(activeItem.tahunAjaran);
      setSelectedSemester(activeItem.semester);
    }
  };

  const handleSaveTahunAjaran = (item: TahunAjaran) => {
    StorageService.saveTahunAjaran(item);
    setTahunAjaranList(StorageService.getTahunAjaranList());
  };

  const handleCreateNewAcademicYear = (
    tahunBaru: string,
    semesterBaru: Semester,
    salinKelas: boolean,
    salinSiswa: boolean,
    salinMapel: boolean
  ) => {
    const res = StorageService.createNewAcademicYear(tahunBaru, semesterBaru, salinKelas, salinSiswa, salinMapel);
    setTahunAjaranList(res.tahunAjaranList);
    setKelasList(res.kelasList);
    setSiswaList(res.siswaList);
    setRelasiList(res.relasiList);
    setSelectedTahunAjaran(tahunBaru);
    setSelectedSemester(semesterBaru);
  };

  // Kelas Handlers
  const handleSaveKelas = (k: Kelas) => {
    StorageService.saveKelas(k);
    setKelasList(StorageService.getKelasList());
  };

  const handleDeleteKelas = (id: string) => {
    StorageService.deleteKelas(id);
    setKelasList(StorageService.getKelasList());
  };

  // Mapel Handlers
  const handleSaveMapel = (m: Mapel) => {
    StorageService.saveMapel(m);
    setMapelList(StorageService.getMapelList());
  };

  const handleDeleteMapel = (id: string) => {
    StorageService.deleteMapel(id);
    setMapelList(StorageService.getMapelList());
  };

  // Relasi Handlers
  const handleSaveRelasi = (r: RelasiKelasMapel) => {
    StorageService.saveRelasi(r);
    setRelasiList(StorageService.getRelasiList());
  };

  const handleDeleteRelasi = (id: string) => {
    StorageService.deleteRelasi(id);
    setRelasiList(StorageService.getRelasiList());
  };

  // Siswa Handlers
  const handleSaveSiswa = (s: Siswa) => {
    StorageService.saveSiswa(s);
    setSiswaList(StorageService.getSiswaList());
  };

  const handleSaveSiswaBatch = (arr: Siswa[]) => {
    StorageService.saveSiswaBatch(arr);
    setSiswaList(StorageService.getSiswaList());
  };

  const handleDeleteSiswa = (id: string) => {
    StorageService.deleteSiswa(id);
    setSiswaList(StorageService.getSiswaList());
  };

  // Absensi Batch Save
  const handleSaveAbsensiBatch = (records: AbsensiRecord[]) => {
    StorageService.saveAbsensiBatch(records);
    setAbsensiList(StorageService.getAbsensiList());
  };

  // Nilai Batch Save
  const handleSaveNilaiBatch = (records: NilaiSiswa[]) => {
    StorageService.saveNilaiBatch(records);
    setNilaiList(StorageService.getNilaiList());
  };

  // Bobot Save
  const handleSaveBobot = (b: BobotNilai) => {
    StorageService.saveBobotNilai(b);
    setBobotNilai(b);
  };

  // Settings & GAS
  const handleUpdateSettings = (newSettings: AppSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSaveGasConfig = (newConfig: GasConnectionConfig) => {
    StorageService.saveGasConfig(newConfig);
    setGasConfig(newConfig);
  };

  const handleSaveCatatanRefleksiList = (newList: CatatanRefleksiPertemuan[]) => {
    StorageService.saveCatatanRefleksiList(newList);
    setCatatanRefleksiList(newList);
  };

  // Reset & Restore
  const handleResetAllData = () => {
    StorageService.resetToDefaults();
    setGuru(StorageService.getGuru());
    setSekolah(StorageService.getSekolah());
    setTahunAjaranList(StorageService.getTahunAjaranList());
    setKelasList(StorageService.getKelasList());
    setMapelList(StorageService.getMapelList());
    setRelasiList(StorageService.getRelasiList());
    setSiswaList(StorageService.getSiswaList());
    setAbsensiList(StorageService.getAbsensiList());
    setNilaiList(StorageService.getNilaiList());
    setBobotNilai(StorageService.getBobotNilai());
    setCatatanRefleksiList(StorageService.getCatatanRefleksiList());
    setSettings(StorageService.getSettings());
    setGasConfig(StorageService.getGasConfig());
  };

  const handleRestoreJson = (jsonData: any) => {
    StorageService.restoreAllData(jsonData);
    setGuru(StorageService.getGuru());
    setSekolah(StorageService.getSekolah());
    setTahunAjaranList(StorageService.getTahunAjaranList());
    setKelasList(StorageService.getKelasList());
    setMapelList(StorageService.getMapelList());
    setRelasiList(StorageService.getRelasiList());
    setSiswaList(StorageService.getSiswaList());
    setAbsensiList(StorageService.getAbsensiList());
    setNilaiList(StorageService.getNilaiList());
    setBobotNilai(StorageService.getBobotNilai());
    if (jsonData.catatanRefleksi) {
      setCatatanRefleksiList(jsonData.catatanRefleksi);
    } else {
      setCatatanRefleksiList(StorageService.getCatatanRefleksiList());
    }
    setSettings(StorageService.getSettings());
    setGasConfig(StorageService.getGasConfig());
  };

  // ==========================================
  // FIREBASE MULTI-DEVICE CLOUD SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setIsSyncing(true);
          // Check if cloud data exists
          const cloudData = await loadDataFromCloud(user.uid);
          if (cloudData) {
            // Apply cloud data to local database so new device immediately receives old data
            handleRestoreJson(cloudData);
            const nowIso = new Date().toISOString();
            setLastSyncTime(nowIso);
            try {
              localStorage.setItem('sps_last_cloud_sync', nowIso);
            } catch {
              // ignore
            }
            showToast(`Data lama berhasil dimuat dari Cloud untuk akun ${user.email}!`, 'success');
          } else {
            // First time logging in: backup current local database to cloud so other devices can pull it
            const currentAllData = StorageService.exportAllData();
            await syncDataToCloud(user.uid, currentAllData);
            const nowIso = new Date().toISOString();
            setLastSyncTime(nowIso);
            try {
              localStorage.setItem('sps_last_cloud_sync', nowIso);
            } catch {
              // ignore
            }
            showToast('Data lokal Anda telah dicadangkan ke Cloud untuk perangkat baru.', 'info');
          }
        } catch (err) {
          console.error('Initial cloud sync error:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsub();
  }, []);

  const handleLoginGoogle = async () => {
    try {
      setIsSyncing(true);
      const user = await loginWithGoogle();
      showToast(`Berhasil masuk sebagai ${user.displayName || user.email}`, 'success');
    } catch (err: any) {
      showToast(`Gagal login Google: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogoutGoogle = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      showToast('Berhasil keluar dari akun Google.', 'info');
    } catch (err: any) {
      showToast(`Gagal keluar: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const handleSyncToCloud = async () => {
    if (!currentUser) {
      setIsCloudModalOpen(true);
      return;
    }
    try {
      setIsSyncing(true);
      const allData = StorageService.exportAllData();
      await syncDataToCloud(currentUser.uid, allData);
      const nowIso = new Date().toISOString();
      setLastSyncTime(nowIso);
      try {
        localStorage.setItem('sps_last_cloud_sync', nowIso);
      } catch {
        // ignore
      }
      showToast('Data berhasil disimpan ke Cloud! Dapat langsung dibuka di perangkat lain.', 'success');
    } catch (err: any) {
      showToast(`Gagal menyimpan ke Cloud: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!currentUser) {
      setIsCloudModalOpen(true);
      return;
    }
    try {
      setIsSyncing(true);
      const cloudData = await loadDataFromCloud(currentUser.uid);
      if (!cloudData) {
        showToast('Belum ada data tersimpan di Cloud untuk akun ini.', 'warning');
        return;
      }
      handleRestoreJson(cloudData);
      const nowIso = new Date().toISOString();
      setLastSyncTime(nowIso);
      try {
        localStorage.setItem('sps_last_cloud_sync', nowIso);
      } catch {
        // ignore
      }
      showToast('Data berhasil diperbarui dari Cloud!', 'success');
    } catch (err: any) {
      showToast(`Gagal memuat data dari Cloud: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync debounced to Cloud whenever critical states change and user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(async () => {
      try {
        const allData = StorageService.exportAllData();
        await syncDataToCloud(currentUser.uid, allData);
        const nowIso = new Date().toISOString();
        setLastSyncTime(nowIso);
        try {
          localStorage.setItem('sps_last_cloud_sync', nowIso);
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Auto cloud sync error:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    currentUser,
    guru,
    sekolah,
    tahunAjaranList,
    kelasList,
    mapelList,
    relasiList,
    siswaList,
    absensiList,
    nilaiList,
    bobotNilai,
    catatanRefleksiList,
    settings,
  ]);

  // Quick Problem Student Count for Badge
  const problemCount = StorageService.detectProblemStudents(
    siswaList,
    absensiList,
    nilaiList,
    settings,
    selectedTahunAjaran,
    selectedSemester,
    selectedKelasId,
    selectedMapelId
  ).length;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col antialiased overflow-hidden">
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Global Top Header (Hidden on print) */}
      <Header
        guru={guru}
        tahunAjaranList={tahunAjaranList}
        kelasList={kelasList}
        mapelList={mapelList}
        selectedTahunAjaran={selectedTahunAjaran}
        selectedSemester={selectedSemester}
        selectedKelasId={selectedKelasId}
        selectedMapelId={selectedMapelId}
        currentUser={currentUser}
        isSyncing={isSyncing}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onSelectTahunAjaran={handleTahunAjaranChange}
        onSelectSemester={setSelectedSemester}
        onSelectKelas={setSelectedKelasId}
        onSelectMapel={setSelectedMapelId}
        onOpenNewTAModal={() => setActiveMenu('tahun-ajaran')}
        onPrintCurrentView={() => window.print()}
        onToggleSidebar={() => {
          if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
          } else {
            toggleDesktopSidebar();
          }
        }}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Hidden on print) */}
        <Sidebar
          activeMenu={activeMenu}
          onSelectMenu={(menu) => {
            setActiveMenu(menu);
            setIsMobileSidebarOpen(false);
          }}
          isOpen={isMobileSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          siswaBermasalahCount={problemCount}
          problemStudentCount={problemCount}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={toggleDesktopSidebar}
        />

        {/* View Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* DASHBOARD VIEW */}
          {activeMenu === 'dashboard' && (
            <DashboardView
              guru={guru}
              sekolah={sekolah}
              tahunAjaranList={tahunAjaranList}
              kelasList={kelasList}
              mapelList={mapelList}
              siswaList={siswaList}
              absensiList={absensiList}
              nilaiList={nilaiList}
              settings={settings}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedSemester={selectedSemester}
              selectedKelasId={selectedKelasId}
              selectedMapelId={selectedMapelId}
              onNavigate={setActiveMenu}
              showToast={showToast}
            />
          )}

          {/* PROFIL GURU */}
          {activeMenu === 'guru' && (
            <ProfilGuruView guru={guru} onSave={handleSaveGuru} showToast={showToast} />
          )}

          {/* PROFIL SEKOLAH */}
          {activeMenu === 'sekolah' && (
            <ProfilSekolahView sekolah={sekolah} onSave={handleSaveSekolah} showToast={showToast} />
          )}

          {/* TAHUN AJARAN */}
          {activeMenu === 'tahun-ajaran' && (
            <TahunAjaranView
              list={tahunAjaranList}
              onSetActive={handleSetActiveTahunAjaran}
              onSave={handleSaveTahunAjaran}
              onCreateNewAcademicYear={handleCreateNewAcademicYear}
              showToast={showToast}
            />
          )}

          {/* KELAS / MAPEL / RELASI */}
          {(activeMenu === 'kelas' ||
            activeMenu === 'mapel' ||
            activeMenu === 'relasi' ||
            activeMenu === 'kelas-mapel') && (
            <KelasMapelView
              kelasList={kelasList}
              mapelList={mapelList}
              relasiList={relasiList}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedSemester={selectedSemester}
              onSaveKelas={handleSaveKelas}
              onDeleteKelas={handleDeleteKelas}
              onSaveMapel={handleSaveMapel}
              onDeleteMapel={handleDeleteMapel}
              onSaveRelasi={handleSaveRelasi}
              onDeleteRelasi={handleDeleteRelasi}
              showToast={showToast}
            />
          )}

          {/* DATA SISWA */}
          {activeMenu === 'siswa' && (
            <DataSiswaView
              siswaList={siswaList}
              kelasList={kelasList}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedKelasId={selectedKelasId}
              onSaveSiswa={handleSaveSiswa}
              onSaveSiswaBatch={handleSaveSiswaBatch}
              onDeleteSiswa={handleDeleteSiswa}
              showToast={showToast}
            />
          )}

          {/* ABSENSI HARIAN & REKAP */}
          {(activeMenu === 'absensi' ||
            activeMenu === 'rekap-absensi' ||
            activeMenu === 'absensi-rekap') && (
            <AbsensiView
              key={activeMenu === 'rekap-absensi' || activeMenu === 'absensi-rekap' ? 'rekap' : 'input'}
              siswaList={siswaList}
              kelasList={kelasList}
              mapelList={mapelList}
              absensiList={absensiList}
              sekolah={sekolah}
              guru={guru}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedSemester={selectedSemester}
              selectedKelasId={selectedKelasId}
              selectedMapelId={selectedMapelId}
              onSaveBatch={handleSaveAbsensiBatch}
              showToast={showToast}
              isRekapMode={activeMenu === 'rekap-absensi' || activeMenu === 'absensi-rekap'}
              onSelectMode={(mode) => setActiveMenu(mode === 'rekap' ? 'absensi-rekap' : 'absensi')}
              onSelectKelas={setSelectedKelasId}
              onSelectMapel={setSelectedMapelId}
              onSelectSemester={setSelectedSemester}
              onSelectTahunAjaran={handleTahunAjaranChange}
            />
          )}

          {/* PENILAIAN */}
          {(activeMenu === 'nilai' ||
            activeMenu === 'penilaian-kehadiran' ||
            activeMenu === 'penilaian-tugas' ||
            activeMenu === 'penilaian-catatan' ||
            activeMenu === 'penilaian-kelakuan' ||
            activeMenu === 'penilaian-formatif' ||
            activeMenu === 'penilaian-sumatif' ||
            activeMenu === 'penilaian-pas') && (
            <PenilaianView
              siswaList={siswaList}
              kelasList={kelasList}
              mapelList={mapelList}
              nilaiList={nilaiList}
              bobotNilai={bobotNilai}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedSemester={selectedSemester}
              selectedKelasId={selectedKelasId}
              selectedMapelId={selectedMapelId}
              onSaveBatchNilai={handleSaveNilaiBatch}
              onSaveBobot={handleSaveBobot}
              showToast={showToast}
              catatanRefleksiList={catatanRefleksiList}
              onSaveCatatanRefleksiList={handleSaveCatatanRefleksiList}
              sekolah={sekolah}
              guru={guru}
              initialTab={
                activeMenu === 'penilaian-formatif'
                  ? 'formatif'
                  : activeMenu === 'penilaian-sumatif'
                  ? 'sumatifLm'
                  : activeMenu === 'penilaian-pas'
                  ? 'sas'
                  : activeMenu === 'penilaian-kelakuan'
                  ? 'kelakuan'
                  : activeMenu === 'penilaian-catatan'
                  ? 'catatan'
                  : activeMenu === 'penilaian-kehadiran'
                  ? 'bobot'
                  : 'tugas'
              }
            />
          )}

          {/* REKAPITULASI NILAI SATU KELAS (F4 LANDSCAPE PRINT) */}
          {activeMenu === 'rekap-nilai' && (
            <RekapNilaiView
              siswaList={siswaList}
              kelasList={kelasList}
              mapelList={mapelList}
              nilaiList={nilaiList}
              sekolah={sekolah}
              guru={guru}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedSemester={selectedSemester}
              selectedKelasId={selectedKelasId}
              selectedMapelId={selectedMapelId}
              showToast={showToast}
            />
          )}

          {/* RAPOR SISWA (F4 PORTRAIT PRINT) */}
          {activeMenu === 'rapor' && (
            <RaporView
              siswaList={siswaList}
              kelasList={kelasList}
              mapelList={mapelList}
              nilaiList={nilaiList}
              absensiList={absensiList}
              sekolah={sekolah}
              guru={guru}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedSemester={selectedSemester}
              selectedKelasId={selectedKelasId}
              selectedMapelId={selectedMapelId}
              showToast={showToast}
            />
          )}

          {/* SISWA BERMASALAH (DETEKSI OTOMATIS) */}
          {activeMenu === 'siswa-bermasalah' && (
            <SiswaBermasalahView
              siswaList={siswaList}
              kelasList={kelasList}
              mapelList={mapelList}
              nilaiList={nilaiList}
              absensiList={absensiList}
              settings={settings}
              sekolah={sekolah}
              guru={guru}
              selectedTahunAjaran={selectedTahunAjaran}
              selectedSemester={selectedSemester}
              selectedKelasId={selectedKelasId}
              selectedMapelId={selectedMapelId}
              onUpdateSettings={handleUpdateSettings}
              showToast={showToast}
            />
          )}

          {/* PUSAT KODE GOOGLE APPS SCRIPT */}
          {activeMenu === 'gas-code' && (
            <GasCodeView
              gasConfig={gasConfig}
              onSaveGasConfig={handleSaveGasConfig}
              showToast={showToast}
            />
          )}

          {/* PENGATURAN & BACKUP */}
          {(activeMenu === 'pengaturan' || activeMenu === 'backup') && (
            <BackupPengaturanView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetAllData}
              onRestoreJson={handleRestoreJson}
              showToast={showToast}
              currentUser={currentUser}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
              onSyncToCloud={handleSyncToCloud}
              onPullFromCloud={handlePullFromCloud}
              lastSyncTime={lastSyncTime}
              isSyncing={isSyncing}
            />
          )}
        </main>
      </div>

      {/* Cloud Sync Modal for Multi-Device synchronization */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLoginGoogle}
        onLogout={handleLogoutGoogle}
        onSyncToCloud={handleSyncToCloud}
        onPullFromCloud={handlePullFromCloud}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        totalStats={{
          siswa: siswaList.length,
          kelas: kelasList.length,
          mapel: mapelList.length,
          nilai: nilaiList.length,
          absensi: absensiList.length,
          refleksi: catatanRefleksiList.length,
        }}
      />
    </div>
  );
}
