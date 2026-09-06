import React from 'react';
import {
  Menu,
  Calendar,
  Layers,
  BookOpen,
  PlusCircle,
  Database,
  Printer,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { TahunAjaran, Kelas, Mapel, Semester, ProfilGuru } from '../types';

interface HeaderProps {
  guru: ProfilGuru;
  tahunAjaranList: TahunAjaran[];
  kelasList: Kelas[];
  mapelList: Mapel[];
  selectedTahunAjaran: string;
  selectedSemester: Semester;
  selectedKelasId: string;
  selectedMapelId: string;
  onSelectTahunAjaran: (val: string) => void;
  onSelectSemester: (val: Semester) => void;
  onSelectKelas: (val: string) => void;
  onSelectMapel: (val: string) => void;
  onOpenNewTAModal: () => void;
  onToggleSidebar: () => void;
  onPrintCurrentView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  guru,
  tahunAjaranList,
  kelasList,
  mapelList,
  selectedTahunAjaran,
  selectedSemester,
  selectedKelasId,
  selectedMapelId,
  onSelectTahunAjaran,
  onSelectSemester,
  onSelectKelas,
  onSelectMapel,
  onOpenNewTAModal,
  onToggleSidebar,
  onPrintCurrentView,
}) => {
  // Unique academic years
  const uniqueTAYears = Array.from(new Set(tahunAjaranList.map((t) => t.tahunAjaran)));

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      {/* Top utility row */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            aria-label="Toggle menu"
            title="Buka / Ciutkan Menu Sidebar (F9)"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                SISTEM PENILAIAN SISWA
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">
                Aplikasi Administrasi & Evaluasi Pembelajaran Guru
              </p>
            </div>
          </div>
        </div>

        {/* Action icons & Teacher Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onPrintCurrentView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition"
            title="Cetak Halaman (F4)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Cetak / PDF</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Teacher Info */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20 bg-indigo-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-indigo-700">
              {guru.fotoUrl ? (
                <img
                  src={guru.fotoUrl}
                  alt={guru.nama}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                guru.nama.charAt(0)
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px] md:max-w-[180px]">
                {guru.nama}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. {guru.nip || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Academic Filter Context Bar (Tahun Ajaran -> Semester -> Kelas -> Mapel) */}
      <div className="bg-slate-50/90 border-t border-slate-200/70 px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
            <Database className="w-3 h-3 text-indigo-600" /> Konteks:
          </span>

          {/* Tahun Ajaran */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <span className="text-slate-500 mr-1 font-medium hidden md:inline">Tahun:</span>
            <select
              value={selectedTahunAjaran}
              onChange={(e) => onSelectTahunAjaran(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              {uniqueTAYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />

          {/* Semester */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
            <span className="text-slate-500 mr-1 font-medium">Sem:</span>
            <select
              value={selectedSemester}
              onChange={(e) => onSelectSemester(e.target.value as Semester)}
              className="bg-transparent font-semibold text-indigo-600 outline-none cursor-pointer"
            >
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>

          <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />

          {/* Kelas */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <span className="text-slate-500 mr-1 font-medium hidden md:inline">Kelas:</span>
            <select
              value={selectedKelasId}
              onChange={(e) => onSelectKelas(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer max-w-[120px] truncate"
            >
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />

          {/* Mata Pelajaran */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <span className="text-slate-500 mr-1 font-medium hidden md:inline">Mapel:</span>
            <select
              value={selectedMapelId}
              onChange={(e) => onSelectMapel(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer max-w-[150px] truncate"
            >
              {mapelList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.namaMapel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buat Tahun Ajaran Baru Quick Button (Requirement 3 & 47) */}
        <button
          onClick={onOpenNewTAModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition shrink-0 ml-auto"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>+ Buat Tahun Ajaran Baru</span>
        </button>
      </div>
    </header>
  );
};
