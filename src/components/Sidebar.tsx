import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  CalendarDays,
  Grid,
  Users,
  CalendarCheck,
  FileCheck2,
  BookOpenCheck,
  FileSpreadsheet,
  GraduationCap,
  AlertOctagon,
  Code2,
  DatabaseBackup,
  Settings,
  X,
  Award,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
} from 'lucide-react';
import { ActiveMenu } from '../types';

export interface SidebarProps {
  activeMenu: ActiveMenu;
  onSelectMenu: (menu: ActiveMenu) => void;
  isOpen?: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
  siswaBermasalahCount?: number;
  problemStudentCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: ActiveMenu;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  subLabel?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onSelectMenu,
  isOpen,
  isMobileOpen,
  onClose,
  onCloseMobile,
  siswaBermasalahCount,
  problemStudentCount,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Normalize mobile open state and callbacks
  const open = isOpen ?? isMobileOpen ?? false;
  const handleClose = onClose ?? onCloseMobile ?? (() => {});
  const badgeCount = siswaBermasalahCount ?? problemStudentCount ?? 0;

  // Track collapsed groups for accordion behavior
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const navGroups: NavGroup[] = [
    {
      id: 'utama',
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'siswa-bermasalah',
          label: 'Siswa Bermasalah',
          icon: AlertOctagon,
          badge: badgeCount > 0 ? badgeCount : undefined,
          badgeColor: 'bg-rose-500 text-white ring-2 ring-rose-900',
        },
      ],
    },
    {
      id: 'administrasi',
      title: 'ADMINISTRASI GURU',
      items: [
        { id: 'guru', label: 'Profil Guru', icon: UserCheck },
        { id: 'sekolah', label: 'Profil Sekolah', icon: Building2 },
        { id: 'tahun-ajaran', label: 'Tahun Ajaran', icon: CalendarDays },
        { id: 'kelas-mapel', label: 'Kelas & Pelajaran', icon: Grid },
        { id: 'siswa', label: 'Data Siswa', icon: Users },
      ],
    },
    {
      id: 'absensi',
      title: 'KEHADIRAN & ABSENSI',
      items: [
        { id: 'absensi', label: 'Input Absensi Harian', icon: CalendarCheck },
        { id: 'absensi-rekap', label: 'Rekap Absensi', icon: FileCheck2 },
      ],
    },
    {
      id: 'penilaian',
      title: 'PENILAIAN PEMBELAJARAN',
      items: [
        { id: 'penilaian-tugas', label: '1. Nilai Tugas (1..N)', icon: BookOpenCheck },
        { id: 'penilaian-formatif', label: '2. Nilai Formatif (1..N)', icon: BookOpenCheck },
        { id: 'penilaian-sumatif', label: '3. Nilai Sumatif LM', icon: BookOpenCheck },
        { id: 'penilaian-pas', label: '4. Penilaian Akhir (SAS/PAS)', icon: Award },
        { id: 'penilaian-kelakuan', label: '5. Nilai Sikap / Kelakuan', icon: ClipboardList },
        { id: 'penilaian-catatan', label: '6. Catatan Guru & Refleksi', icon: BookOpenCheck },
        { id: 'penilaian-kehadiran', label: '7. Bobot & Nilai Hadir', icon: Award },
      ],
    },
    {
      id: 'evaluasi',
      title: 'EVALUASI & RAPOR',
      items: [
        { id: 'rekap-nilai', label: 'Rekap Nilai Siswa (F4)', icon: FileSpreadsheet },
        { id: 'rapor', label: 'Nilai Rapor Siswa (F4)', icon: GraduationCap },
      ],
    },
    {
      id: 'sistem',
      title: 'SISTEM & DATABASE',
      items: [
        { id: 'gas-code', label: 'Kode Apps Script & Sheets', icon: Code2 },
        { id: 'backup', label: 'Backup & Restore Data', icon: DatabaseBackup },
        { id: 'pengaturan', label: 'Pengaturan Sistem', icon: Settings },
      ],
    },
  ];

  // Helper to test if item matches active menu
  const isItemActive = (itemId: ActiveMenu) => {
    if (activeMenu === itemId) return true;
    if (itemId === 'kelas-mapel' && (activeMenu === 'kelas' || activeMenu === 'mapel' || activeMenu === 'relasi')) {
      return true;
    }
    if (itemId === 'absensi-rekap' && activeMenu === 'rekap-absensi') {
      return true;
    }
    if (itemId === 'penilaian-tugas' && activeMenu === 'nilai') {
      return true;
    }
    return false;
  };

  // Ensure the group containing activeMenu is expanded
  useEffect(() => {
    navGroups.forEach((grp) => {
      const containsActive = grp.items.some((it) => isItemActive(it.id));
      if (containsActive && collapsedGroups[grp.id]) {
        setCollapsedGroups((prev) => ({ ...prev, [grp.id]: false }));
      }
    });
  }, [activeMenu]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleItemClick = (id: ActiveMenu) => {
    onSelectMenu(id);
    if (window.innerWidth < 1024) {
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {open && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        id="app-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out no-print border-r border-slate-800 shadow-2xl lg:shadow-none
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto h-full shrink-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Sidebar Header (App Branding & Mobile Close) */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
              SPS
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="font-bold text-white text-xs tracking-wider uppercase leading-tight">
                  Sistem Penilaian
                </p>
                <p className="text-[10px] text-indigo-400 font-medium tracking-wide truncate">
                  Guru Profesional
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3.5 text-xs scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navGroups.map((group) => {
            const isGroupCollapsed = !isCollapsed && !!collapsedGroups[group.id];

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Title or Accordion Header */}
                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 hover:text-slate-300 uppercase select-none transition group"
                  >
                    <span>{group.title}</span>
                    <span className="text-slate-500 group-hover:text-slate-400">
                      {isGroupCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                ) : (
                  <div className="h-px bg-slate-800 mx-2 my-1.5" />
                )}

                {/* Group Items */}
                {!isGroupCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          title={isCollapsed ? item.label : undefined}
                          className={`
                            w-full flex items-center rounded-lg font-medium transition-all text-left relative group
                            ${
                              isCollapsed
                                ? 'justify-center p-2.5'
                                : 'justify-between px-3 py-2'
                            }
                            ${
                              active
                                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                active
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:text-indigo-400'
                              }`}
                            />
                            {!isCollapsed && (
                              <span className="truncate text-xs">{item.label}</span>
                            )}
                          </div>

                          {/* Badge */}
                          {item.badge !== undefined && (
                            <span
                              className={`
                                font-bold rounded-full shrink-0 flex items-center justify-center
                                ${
                                  isCollapsed
                                    ? 'absolute top-1.5 right-1.5 w-2.5 h-2.5 ring-2 ring-slate-900 ' + (item.badgeColor || 'bg-rose-500')
                                    : `ml-2 px-1.5 py-0.5 text-[10px] ${item.badgeColor || 'bg-indigo-500 text-white'}`
                                }
                              `}
                            >
                              {!isCollapsed && item.badge}
                            </span>
                          )}

                          {/* Floating Tooltip in Collapsed Mode */}
                          {isCollapsed && (
                            <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-1.5 border border-slate-700">
                              <span>{item.label}</span>
                              {item.badge !== undefined && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 shrink-0 space-y-2">
          {/* Quick collapse button for desktop */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`
                hidden lg:flex w-full items-center rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer
                ${isCollapsed ? 'justify-center' : 'justify-between'}
              `}
              title={isCollapsed ? 'Perluas Menu Sidebar' : 'Ciutkan Menu Sidebar'}
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronsRight className="w-4 h-4 text-indigo-400" />
                ) : (
                  <ChevronsLeft className="w-4 h-4 text-indigo-400" />
                )}
                {!isCollapsed && (
                  <span className="text-xs font-medium text-slate-300">
                    Ciutkan Menu
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-slate-500 font-mono">F9</span>
              )}
            </button>
          )}

          {/* Version and Sync Indicator */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-1 pt-1 text-[10px] text-slate-500 border-t border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                GAS & Sheets Ready
              </span>
              <span className="font-mono text-[9px] px-1 py-0.2 bg-slate-800 rounded text-slate-400">
                v1.2.0
              </span>
            </div>
          ) : (
            <div className="flex justify-center pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online / Siap Sync" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
