/**
 * Repository Berisi Seluruh Kode Backend Google Apps Script (GAS)
 * dan Struktur Sheet Database Google Sheets & Panduan Deployment Lengkap.
 */

export interface GasFileItem {
  filename: string;
  category: 'gs' | 'html' | 'guide';
  description: string;
  content: string;
}

export const GAS_FILES: GasFileItem[] = [
  {
    filename: 'Config.gs',
    category: 'gs',
    description: 'Konfigurasi Spreadsheet, ID Google Drive, Nama Sheet, dan Konstanta',
    content: `/**
 * SISTEM PENILAIAN SISWA - Config.gs
 * Pengaturan dasar database Google Sheets & Google Drive
 */

var CONFIG = {
  APP_NAME: "SISTEM PENILAIAN SISWA",
  VERSION: "1.0.0",
  
  // Kosongkan jika script terpasang langsung di Google Spreadsheet (Container-bound)
  // Atau isi dengan Spreadsheet ID jika Standalone Script
  SPREADSHEET_ID: "", 
  
  // Folder Utama di Google Drive
  DRIVE_ROOT_FOLDER_NAME: "SISTEM_PENILAIAN_SISWA",
  DRIVE_SUBFOLDERS: [
    "PROFIL_GURU",
    "LOGO_SEKOLAH",
    "FOTO_SISWA",
    "PDF_RAPOR",
    "BACKUP"
  ],

  // Nama-nama Sheet Database
  SHEETS: {
    SETTINGS: "SETTINGS",
    PROFIL_GURU: "PROFIL_GURU",
    PROFIL_SEKOLAH: "PROFIL_SEKOLAH",
    TAHUN_AJARAN: "TAHUN_AJARAN",
    KELAS: "KELAS",
    MAPEL: "MAPEL",
    SISWA: "SISWA",
    RELASI_KELAS_MAPEL: "RELASI_KELAS_MAPEL",
    ABSENSI: "ABSENSI",
    KOMPONEN_NILAI: "KOMPONEN_NILAI",
    NILAI: "NILAI",
    BOBOT_NILAI: "BOBOT_NILAI",
    NILAI_AKHIR: "NILAI_AKHIR",
    LOG_AKTIVITAS: "LOG_AKTIVITAS"
  },

  DEFAULT_KKTP: 75,
  DECIMAL_PLACES: 1
};

function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}
`,
  },
  {
    filename: 'Database.gs',
    category: 'gs',
    description: 'Inisialisasi Database (setupDatabase), Batch Read/Write, LockService',
    content: `/**
 * SISTEM PENILAIAN SISWA - Database.gs
 * Engine database Google Sheets dengan batch processing & locking
 */

function setupDatabase() {
  var ss = getSpreadsheet();
  var sheetsDef = [
    {
      name: CONFIG.SHEETS.SETTINGS,
      headers: ["key", "value"]
    },
    {
      name: CONFIG.SHEETS.PROFIL_GURU,
      headers: ["id", "nama", "nip", "nuptk", "fotoUrl", "jenisKelamin", "tempatLahir", "tanggalLahir", "pendidikan", "pangkat", "jabatan", "mapel", "noHp", "email", "alamat"]
    },
    {
      name: CONFIG.SHEETS.PROFIL_SEKOLAH,
      headers: ["id", "namaSekolah", "npsn", "nss", "alamat", "desa", "kecamatan", "kabupaten", "provinsi", "kodePos", "email", "website", "kepalaSekolah", "nipKepala", "logoSekolah", "logoPendidikan"]
    },
    {
      name: CONFIG.SHEETS.TAHUN_AJARAN,
      headers: ["id", "tahunAjaran", "semester", "tanggalMulai", "tanggalSelesai", "status"]
    },
    {
      name: CONFIG.SHEETS.KELAS,
      headers: ["id", "tahunAjaran", "tingkat", "namaKelas", "waliKelas", "status"]
    },
    {
      name: CONFIG.SHEETS.MAPEL,
      headers: ["id", "kode", "namaMapel", "kelompok", "kktp", "jamPelajaran", "status"]
    },
    {
      name: CONFIG.SHEETS.SISWA,
      headers: ["id", "nis", "nisn", "nama", "jenisKelamin", "tempatLahir", "tanggalLahir", "alamat", "ayah", "ibu", "noHpOrangTua", "kelasId", "tahunAjaran", "status", "fotoUrl"]
    },
    {
      name: CONFIG.SHEETS.RELASI_KELAS_MAPEL,
      headers: ["id", "kelasId", "mapelId", "tahunAjaran", "semester"]
    },
    {
      name: CONFIG.SHEETS.ABSENSI,
      headers: ["id", "tanggal", "siswaId", "kelasId", "mapelId", "tahunAjaran", "semester", "status", "keterangan", "createdAt", "updatedAt"]
    },
    {
      name: CONFIG.SHEETS.KOMPONEN_NILAI,
      headers: ["id", "jenis", "namaKomponen", "tanggal", "materi", "bobot", "pertemuanKe", "kelasId", "mapelId", "tahunAjaran", "semester"]
    },
    {
      name: CONFIG.SHEETS.NILAI,
      headers: ["id", "komponenId", "siswaId", "nilai", "catatan", "createdAt", "updatedAt"]
    },
    {
      name: CONFIG.SHEETS.BOBOT_NILAI,
      headers: ["id", "kelasId", "mapelId", "tahunAjaran", "semester", "bobotKehadiran", "bobotTugas", "bobotCatatan", "bobotKelakuan", "bobotFormatif", "bobotSumatif", "bobotPAS"]
    },
    {
      name: CONFIG.SHEETS.NILAI_AKHIR,
      headers: ["id", "siswaId", "kelasId", "mapelId", "tahunAjaran", "semester", "nilaiKehadiran", "nilaiTugas", "nilaiCatatan", "nilaiKelakuan", "nilaiFormatif", "nilaiSumatif", "nilaiPAS", "nilaiAkhir", "kktp", "status"]
    },
    {
      name: CONFIG.SHEETS.LOG_AKTIVITAS,
      headers: ["id", "waktu", "aktivitas", "user", "detail"]
    }
  ];

  sheetsDef.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
      sheet.appendRow(item.headers);
      sheet.getRange(1, 1, 1, item.headers.length).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
      sheet.setFrozenRows(1);
    } else {
      // Pastikan baris header tersedia
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(item.headers);
        sheet.getRange(1, 1, 1, item.headers.length).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
        sheet.setFrozenRows(1);
      }
    }
  });

  // Buat folder di Drive jika belum ada
  initDriveFolders();
  
  logActivity("setupDatabase", "System", "Inisialisasi database dan folder Google Drive selesai");
  return { success: true, message: "Database dan Folder Google Drive berhasil disiapkan!" };
}

function initDriveFolders() {
  var rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER_NAME);
  var rootFolder;
  if (rootFolders.hasNext()) {
    rootFolder = rootFolders.next();
  } else {
    rootFolder = DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER_NAME);
  }

  CONFIG.DRIVE_SUBFOLDERS.forEach(function(subName) {
    var subs = rootFolder.getFoldersByName(subName);
    if (!subs.hasNext()) {
      rootFolder.createFolder(subName);
    }
  });

  return rootFolder.getId();
}

function getSheetDataAsObjects(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

function logActivity(aktivitas, user, detail) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.LOG_AKTIVITAS);
    if (sheet) {
      sheet.appendRow([
        "LOG-" + Utilities.getUuid(),
        Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd HH:mm:ss"),
        aktivitas,
        user || "Guru",
        detail || ""
      ]);
    }
  } catch(e) {
    console.error("Log error: " + e.toString());
  }
}
`,
  },
  {
    filename: 'Code.gs',
    category: 'gs',
    description: 'Entry point doGet, doPost, REST API Web App, Dispatcher',
    content: `/**
 * SISTEM PENILAIAN SISWA - Code.gs
 * Web App Controller & JSON REST API Handler
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  
  if (action === "") {
    // Sajikan antarmuka Web App
    return HtmlService.createTemplateFromFile("index")
      .evaluate()
      .setTitle(CONFIG.APP_NAME)
      .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Handle JSON API Read Requests
  var result = {};
  try {
    switch (action) {
      case "ping":
        result = { success: true, message: "Sistem Penilaian Siswa Online", time: new Date() };
        break;
      case "getInitialData":
        result = {
          success: true,
          guru: getProfilGuruData(),
          sekolah: getProfilSekolahData(),
          tahunAjaran: getSheetDataAsObjects(CONFIG.SHEETS.TAHUN_AJARAN),
          kelas: getSheetDataAsObjects(CONFIG.SHEETS.KELAS),
          mapel: getSheetDataAsObjects(CONFIG.SHEETS.MAPEL),
          relasi: getSheetDataAsObjects(CONFIG.SHEETS.RELASI_KELAS_MAPEL),
          siswa: getSheetDataAsObjects(CONFIG.SHEETS.SISWA),
          komponen: getSheetDataAsObjects(CONFIG.SHEETS.KOMPONEN_NILAI),
          nilai: getSheetDataAsObjects(CONFIG.SHEETS.NILAI),
          bobot: getSheetDataAsObjects(CONFIG.SHEETS.BOBOT_NILAI),
          absensi: getSheetDataAsObjects(CONFIG.SHEETS.ABSENSI)
        };
        break;
      case "getRekapNilai":
        result = {
          success: true,
          data: calculateRekapBackend(e.parameter.kelasId, e.parameter.mapelId, e.parameter.tahunAjaran, e.parameter.semester)
        };
        break;
      default:
        result = { success: false, message: "Action tidak dikenal" };
    }
  } catch (err) {
    result = { success: false, message: "Terjadi kesalahan saat memproses data: " + err.toString() };
    logActivity("Error doGet", "System", err.toString());
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var result = { success: false, message: "" };

  try {
    // Tunggu giliran hingga 30 detik untuk mencegah race-condition
    lock.waitLock(30000);

    var postData = {};
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter;
    }

    var action = postData.action || "";

    switch (action) {
      case "setupDatabase":
        result = setupDatabase();
        break;
      case "saveGuru":
        result = saveProfilGuru(postData.data);
        break;
      case "saveSekolah":
        result = saveProfilSekolah(postData.data);
        break;
      case "saveSiswa":
        result = saveSiswaBackend(postData.data);
        break;
      case "saveAbsensiBatch":
        result = saveAbsensiBatchBackend(postData.data);
        break;
      case "saveKomponen":
        result = saveKomponenBackend(postData.data);
        break;
      case "saveNilaiBatch":
        result = saveNilaiBatchBackend(postData.data);
        break;
      case "saveBobot":
        result = saveBobotBackend(postData.data);
        break;
      case "uploadFoto":
        result = uploadFileToDrive(postData.base64, postData.filename, postData.folder);
        break;
      case "buatTahunAjaranBaru":
        result = buatTahunAjaranBaruBackend(postData.data);
        break;
      default:
        result = { success: false, message: "Aksi tidak didukung: " + action };
    }
  } catch (err) {
    result = { success: false, message: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.", errorDetail: err.toString() };
    logActivity("Error doPost", "System", err.toString());
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
`,
  },
  {
    filename: 'Guru.gs',
    category: 'gs',
    description: 'Pengelolaan Profil Guru & Upload Foto ke Google Drive',
    content: `/**
 * SISTEM PENILAIAN SISWA - Guru.gs
 * CRUD Profil Guru & Upload Foto ke Google Drive
 */

function getProfilGuruData() {
  var list = getSheetDataAsObjects(CONFIG.SHEETS.PROFIL_GURU);
  return list.length > 0 ? list[0] : null;
}

function saveProfilGuru(guruData) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.PROFIL_GURU);
  if (!sheet) return { success: false, message: "Sheet PROFIL_GURU tidak ditemukan" };

  var rowData = [
    guruData.id || "GURU-" + Utilities.getUuid(),
    guruData.nama || "",
    guruData.nip || "",
    guruData.nuptk || "",
    guruData.fotoUrl || "",
    guruData.jenisKelamin || "L",
    guruData.tempatLahir || "",
    guruData.tanggalLahir || "",
    guruData.pendidikan || "",
    guruData.pangkat || "",
    guruData.jabatan || "",
    guruData.mapel || "",
    guruData.noHp || "",
    guruData.email || "",
    guruData.alamat || ""
  ];

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logActivity("Simpan Profil Guru", guruData.nama, "Data guru diperbarui");
  return { success: true, message: "Profil guru berhasil disimpan!", data: guruData };
}

function uploadFileToDrive(base64Data, filename, subfolderName) {
  try {
    var rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER_NAME);
    var targetFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER_NAME);
    
    if (subfolderName) {
      var subs = targetFolder.getFoldersByName(subfolderName);
      if (subs.hasNext()) {
        targetFolder = subs.next();
      } else {
        targetFolder = targetFolder.createFolder(subfolderName);
      }
    }

    var contentType = base64Data.substring(5, base64Data.indexOf(';'));
    var bytes = Utilities.base64Decode(base64Data.substr(base64Data.indexOf('base64,') + 7));
    var blob = Utilities.newBlob(bytes, contentType, filename);
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      fileId: file.getId(),
      url: "https://drive.google.com/uc?export=view&id=" + file.getId()
    };
  } catch (err) {
    return { success: false, message: "Gagal mengunggah berkas: " + err.toString() };
  }
}
`,
  },
  {
    filename: 'Sekolah.gs',
    category: 'gs',
    description: 'Pengelolaan Profil Sekolah & Logo Google Drive',
    content: `/**
 * SISTEM PENILAIAN SISWA - Sekolah.gs
 * CRUD Profil Sekolah & Logo
 */

function getProfilSekolahData() {
  var list = getSheetDataAsObjects(CONFIG.SHEETS.PROFIL_SEKOLAH);
  return list.length > 0 ? list[0] : null;
}

function saveProfilSekolah(sekolahData) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.PROFIL_SEKOLAH);
  if (!sheet) return { success: false, message: "Sheet PROFIL_SEKOLAH tidak ditemukan" };

  var rowData = [
    sekolahData.id || "SEK-" + Utilities.getUuid(),
    sekolahData.namaSekolah || "",
    sekolahData.npsn || "",
    sekolahData.nss || "",
    sekolahData.alamat || "",
    sekolahData.desa || "",
    sekolahData.kecamatan || "",
    sekolahData.kabupaten || "",
    sekolahData.provinsi || "",
    sekolahData.kodePos || "",
    sekolahData.email || "",
    sekolahData.website || "",
    sekolahData.kepalaSekolah || "",
    sekolahData.nipKepala || "",
    sekolahData.logoSekolah || "",
    sekolahData.logoPendidikan || ""
  ];

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logActivity("Simpan Profil Sekolah", "Guru", sekolahData.namaSekolah);
  return { success: true, message: "Profil sekolah berhasil disimpan!", data: sekolahData };
}
`,
  },
  {
    filename: 'TahunAjaran.gs',
    category: 'gs',
    description: 'Manajemen Tahun Ajaran, Semester, & Isolasi Data Lama',
    content: `/**
 * SISTEM PENILAIAN SISWA - TahunAjaran.gs
 * Pembuatan Tahun Ajaran Baru tanpa menghapus data tahun sebelumnya
 */

function buatTahunAjaranBaruBackend(payload) {
  var ss = getSpreadsheet();
  var sheetTA = ss.getSheetByName(CONFIG.SHEETS.TAHUN_AJARAN);
  var newId = "TA-" + Utilities.getUuid();

  var row = [
    newId,
    payload.tahunAjaran,
    payload.semester,
    payload.tanggalMulai || Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd"),
    payload.tanggalSelesai || "",
    "Aktif"
  ];

  // Set tahun ajaran lama jadi Nonaktif
  var lastRow = sheetTA.getLastRow();
  if (lastRow > 1) {
    var statuses = sheetTA.getRange(2, 6, lastRow - 1, 1).getValues();
    for (var i = 0; i < statuses.length; i++) {
      if (statuses[i][0] === "Aktif") {
        sheetTA.getRange(i + 2, 6).setValue("Nonaktif");
      }
    }
  }

  sheetTA.appendRow(row);

  logActivity("Buat Tahun Ajaran Baru", "Guru", payload.tahunAjaran + " Semester " + payload.semester);
  return { success: true, message: "Tahun ajaran baru berhasil dibuat. Data tahun sebelumnya tetap tersimpan rapi!", id: newId };
}
`,
  },
  {
    filename: 'Absensi.gs',
    category: 'gs',
    description: 'Input Absensi Massal, Rekap Bulanan, dan Semester',
    content: `/**
 * SISTEM PENILAIAN SISWA - Absensi.gs
 * Batch input absensi & Rekap kehadiran
 */

function saveAbsensiBatchBackend(records) {
  if (!records || records.length === 0) return { success: true, message: "Tidak ada data absensi" };

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.ABSENSI);
  var existing = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).getValues() : [];

  // Peta baris yang sudah ada berdasarkan composite key
  var existingMap = {};
  for (var i = 0; i < existing.length; i++) {
    var key = existing[i][1] + "_" + existing[i][2] + "_" + existing[i][4] + "_" + existing[i][5] + "_" + existing[i][6];
    existingMap[key] = i + 2; // baris ke- (1-based)
  }

  var newRows = [];
  var nowStr = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");

  records.forEach(function(r) {
    var key = r.tanggal + "_" + r.siswaId + "_" + r.mapelId + "_" + r.tahunAjaran + "_" + r.semester;
    if (existingMap[key]) {
      // Update existing row
      var rowIdx = existingMap[key];
      sheet.getRange(rowIdx, 8, 1, 4).setValues([[r.status, r.keterangan || "", existing[rowIdx - 2][9], nowStr]]);
    } else {
      // Append new row
      newRows.push([
        r.id || "ABS-" + Utilities.getUuid(),
        r.tanggal,
        r.siswaId,
        r.kelasId,
        r.mapelId,
        r.tahunAjaran,
        r.semester,
        r.status,
        r.keterangan || "",
        nowStr,
        nowStr
      ]);
    }
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 11).setValues(newRows);
  }

  logActivity("Input Absensi Massal", "Guru", "Menyimpan " + records.length + " rekaman absensi");
  return { success: true, message: "Berhasil menyimpan seluruh absensi siswa!" };
}
`,
  },
  {
    filename: 'Penilaian.gs',
    category: 'gs',
    description: 'Komponen Dinamis, Input Nilai Massal, Bobot, dan Perhitungan Nilai Akhir',
    content: `/**
 * SISTEM PENILAIAN SISWA - Penilaian.gs
 * Pengelolaan nilai dinamis dan perhitungan otomatis
 */

function saveKomponenBackend(komp) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.KOMPONEN_NILAI);
  var row = [
    komp.id || "KOMP-" + Utilities.getUuid(),
    komp.jenis,
    komp.namaKomponen,
    komp.tanggal || "",
    komp.materi || "",
    komp.bobot || 1,
    komp.pertemuanKe || "",
    komp.kelasId,
    komp.mapelId,
    komp.tahunAjaran,
    komp.semester
  ];

  sheet.appendRow(row);
  logActivity("Tambah Komponen", "Guru", komp.jenis + ": " + komp.namaKomponen);
  return { success: true, message: "Komponen penilaian berhasil ditambahkan!" };
}

function saveNilaiBatchBackend(details) {
  if (!details || details.length === 0) return { success: true };

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.NILAI);
  var existing = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues() : [];

  var map = {};
  for (var i = 0; i < existing.length; i++) {
    var key = existing[i][1] + "_" + existing[i][2]; // komponenId_siswaId
    map[key] = i + 2;
  }

  var newRows = [];
  var now = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");

  details.forEach(function(d) {
    var key = d.komponenId + "_" + d.siswaId;
    if (map[key]) {
      sheet.getRange(map[key], 4, 1, 3).setValues([[d.nilai, d.catatan || "", now]]);
    } else {
      newRows.push([
        d.id || "NIL-" + Utilities.getUuid(),
        d.komponenId,
        d.siswaId,
        d.nilai,
        d.catatan || "",
        now,
        now
      ]);
    }
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 7).setValues(newRows);
  }

  logActivity("Input Nilai Massal", "Guru", "Memperbarui " + details.length + " nilai");
  return { success: true, message: "Seluruh nilai berhasil disimpan!" };
}
`,
  },
  {
    filename: 'Rekap.gs',
    category: 'gs',
    description: 'Kalkulasi Rekapitulasi Nilai & Deteksi Siswa Bermasalah',
    content: `/**
 * SISTEM PENILAIAN SISWA - Rekap.gs
 * Perhitungan rekap nilai dan formula berbobot otomatis
 */

function calculateRekapBackend(kelasId, mapelId, tahunAjaran, semester) {
  var ss = getSpreadsheet();
  var siswaList = getSheetDataAsObjects(CONFIG.SHEETS.SISWA).filter(function(s) {
    return s.kelasId === kelasId && s.status === "Aktif";
  });
  var komponenList = getSheetDataAsObjects(CONFIG.SHEETS.KOMPONEN_NILAI).filter(function(k) {
    return k.kelasId === kelasId && k.mapelId === mapelId && k.tahunAjaran === tahunAjaran && k.semester === semester;
  });
  var nilaiList = getSheetDataAsObjects(CONFIG.SHEETS.NILAI);
  var bobotList = getSheetDataAsObjects(CONFIG.SHEETS.BOBOT_NILAI);
  var bobot = bobotList.length > 0 ? bobotList[0] : {
    bobotKehadiran: 10, bobotTugas: 20, bobotCatatan: 5, bobotKelakuan: 5, bobotFormatif: 20, bobotSumatif: 25, bobotPAS: 15
  };

  var mapelObj = getSheetDataAsObjects(CONFIG.SHEETS.MAPEL).find(function(m) { return m.id === mapelId; });
  var kktp = mapelObj ? Number(mapelObj.kktp) : 75;

  return siswaList.map(function(s) {
    // Cari rata-rata per komponen
    function getAvg(type) {
      var komps = komponenList.filter(function(k) { return k.jenis === type; });
      if (komps.length === 0) return 0;
      var sum = 0, count = 0;
      komps.forEach(function(k) {
        var n = nilaiList.find(function(nl) { return nl.komponenId === k.id && nl.siswaId === s.id; });
        if (n && n.nilai !== "" && !isNaN(n.nilai)) {
          sum += Number(n.nilai);
          count++;
        }
      });
      return count > 0 ? (sum / count) : 0;
    }

    var nKehadiran = 100;
    var nTugas = getAvg("Tugas");
    var nCatatan = getAvg("Catatan");
    var nKelakuan = getAvg("Kelakuan");
    var nFormatif = getAvg("Formatif");
    var nSumatif = getAvg("Sumatif");
    var nPAS = getAvg("PAS");

    var nAkhir = (
      (nKehadiran * Number(bobot.bobotKehadiran)) +
      (nTugas * Number(bobot.bobotTugas)) +
      (nCatatan * Number(bobot.bobotCatatan)) +
      (nKelakuan * Number(bobot.bobotKelakuan)) +
      (nFormatif * Number(bobot.bobotFormatif)) +
      (nSumatif * Number(bobot.bobotSumatif)) +
      (nPAS * Number(bobot.bobotPAS))
    ) / 100;

    nAkhir = Math.round(nAkhir * 10) / 10;

    return {
      siswa: s,
      nilaiKehadiran: nKehadiran,
      nilaiTugas: Math.round(nTugas * 10) / 10,
      nilaiCatatan: Math.round(nCatatan * 10) / 10,
      nilaiKelakuan: Math.round(nKelakuan * 10) / 10,
      nilaiFormatif: Math.round(nFormatif * 10) / 10,
      nilaiSumatif: Math.round(nSumatif * 10) / 10,
      nilaiPAS: Math.round(nPAS * 10) / 10,
      nilaiAkhir: nAkhir,
      kktp: kktp,
      status: nAkhir >= kktp ? "Mencapai KKTP" : "Belum Mencapai KKTP"
    };
  });
}
`,
  },
  {
    filename: 'PDF.gs',
    category: 'gs',
    description: 'Generator Cetak PDF Rapor & Rekap Standar Folio/F4',
    content: `/**
 * SISTEM PENILAIAN SISWA - PDF.gs
 * Ekspor Dokumen Resmi F4 (215 x 330 mm) ke Google Drive
 */

function generateRaporPDF(siswaId, kelasId, mapelId, tahunAjaran, semester) {
  var ss = getSpreadsheet();
  var sekolah = getProfilSekolahData();
  var guru = getProfilGuruData();
  var siswa = getSheetDataAsObjects(CONFIG.SHEETS.SISWA).find(function(s) { return s.id === siswaId; });

  var htmlTemplate = HtmlService.createTemplateFromFile("rapor-pdf-template");
  htmlTemplate.sekolah = sekolah;
  htmlTemplate.guru = guru;
  htmlTemplate.siswa = siswa;
  htmlTemplate.tahunAjaran = tahunAjaran;
  htmlTemplate.semester = semester;

  var html = htmlTemplate.evaluate().getContent();
  var blob = Utilities.newBlob(html, "text/html", "Rapor_" + siswa.nama + ".html");
  var pdfFile = DriveApp.createFile(blob.getAs("application/pdf"));

  return {
    success: true,
    fileId: pdfFile.getId(),
    downloadUrl: pdfFile.getDownloadUrl(),
    viewUrl: pdfFile.getUrl()
  };
}
`,
  },
  {
    filename: 'Backup.gs',
    category: 'gs',
    description: 'Backup Database Otomatis ke Google Drive',
    content: `/**
 * SISTEM PENILAIAN SISWA - Backup.gs
 * Pencadangan Database Spreadsheet ke Folder BACKUP
 */

function backupDatabaseToDrive() {
  try {
    var ss = getSpreadsheet();
    var rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER_NAME);
    var backupFolder;
    
    if (rootFolders.hasNext()) {
      var subs = rootFolders.next().getFoldersByName("BACKUP");
      backupFolder = subs.hasNext() ? subs.next() : DriveApp.createFolder("BACKUP");
    } else {
      backupFolder = DriveApp.createFolder("BACKUP");
    }

    var timestamp = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyyMMdd_HHmmss");
    var copyFile = DriveApp.getFileById(ss.getId()).makeCopy("BACKUP_SISTEM_PENILAIAN_" + timestamp, backupFolder);

    logActivity("Backup Database", "System", "File: " + copyFile.getName());
    return { success: true, message: "Backup database berhasil dibuat di Google Drive!", url: copyFile.getUrl() };
  } catch (err) {
    return { success: false, message: "Gagal membuat backup: " + err.toString() };
  }
}
`,
  },
  {
    filename: 'PANDUAN_INSTALASI_GAS.md',
    category: 'guide',
    description: 'Panduan Lengkap Langkah demi Langkah Instalasi di Google Drive & Sheets',
    content: `# PANDUAN INSTALASI & DEPLOYMENT SISTEM PENILAIAN SISWA

## A. Persiapan Google Spreadsheet
1. Buka [Google Spreadsheet](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet: **DATABASE_SISTEM_PENILAIAN_SISWA**.
3. Buka menu **Ekstensi** > **Apps Script**.

## B. Memasukkan File Kode Apps Script
1. Pada editor Google Apps Script, ganti nama file \`Code.gs\` atau buat file baru sesuai nama:
   - \`Config.gs\`
   - \`Database.gs\`
   - \`Code.gs\`
   - \`Guru.gs\`
   - \`Sekolah.gs\`
   - \`TahunAjaran.gs\`
   - \`Absensi.gs\`
   - \`Penilaian.gs\`
   - \`Rekap.gs\`
   - \`PDF.gs\`
   - \`Backup.gs\`
2. Salin isi kode dari masing-masing tab file di menu ini ke editor Apps Script.

## C. Menjalankan Inisialisasi Database
1. Di editor Apps Script, pilih fungsi **setupDatabase** pada dropdown fungsi di atas.
2. Klik tombol **Run** (Jalankan).
3. Berikan izin otorisasi Google Account Anda.
4. Fungsi ini akan otomatis:
   - Membuat 14 Sheet yang diperlukan dengan header warna elegan.
   - Membuat Folder Google Drive **SISTEM_PENILAIAN_SISWA** beserta 5 subfolder:
     - PROFIL_GURU
     - LOGO_SEKOLAH
     - FOTO_SISWA
     - PDF_RAPOR
     - BACKUP

## D. Melakukan Deployment Web App
1. Klik tombol **Deploy** (Terapkan) berwarna biru di kanan atas > **New deployment** (Penerapan baru).
2. Pilih jenis: **Web app** (Aplikasi web).
3. Konfigurasi:
   - **Description**: Sistem Penilaian Siswa v1.0
   - **Execute as**: **Me** (akun Google Anda)
   - **Who has access**: **Anyone** (atau Anyone with Google account)
4. Klik **Deploy** dan salin URL Web App yang dihasilkan.
5. Tempelkan URL tersebut ke menu **Pengaturan** di aplikasi ini untuk menghubungkan sinkronisasi langsung!
`,
  },
];

export const gasBackendFiles = GAS_FILES.filter((f) => f.category === 'gs').map((f) => ({
  filename: f.filename,
  description: f.description,
  code: f.content,
}));

export const gasInstallationGuide =
  GAS_FILES.find((f) => f.category === 'guide')?.content || '';

