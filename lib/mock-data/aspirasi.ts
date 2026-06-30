import { Aspirasi } from '@/lib/types';

export const mockAspirasi: Aspirasi[] = [
  {
    id: 'ASP-001',
    kode_tracking: 'ASP-XK72M9AB',
    judul: 'Permohonan Perbaikan AC Ruang Kuliah Gedung A',
    deskripsi:
      'Kondisi AC di ruang kuliah Gedung A Lantai 2 sudah tidak berfungsi optimal selama 3 minggu terakhir. Suhu ruangan sangat panas dan mengganggu konsentrasi belajar mahasiswa. Sudah dilaporkan ke bagian kemahasiswaan tapi belum ada tindak lanjut.',
    kategori: 'fasilitas',
    status: 'ditindaklanjuti',
    is_anonim: false,
    nama_pengaju: 'Rahmat Hidayat',
    nim_pengaju: '2022005001',
    email_pengaju: 'rahmat.hidayat@mahasiswa.itbriau.ac.id',
    tanggal_masuk: '2024-11-10',
    tanggal_update: '2024-11-25',
    catatan_tindak_lanjut:
      'DPM telah berkoordinasi dengan pihak rektorat. Teknisi AC dijadwalkan datang minggu ini.',
    petugas: 'Indah Permata Sari',
    timeline: [
      {
        status: 'diterima',
        keterangan: 'Aspirasi diterima oleh sistem DPM',
        tanggal: '2024-11-10',
      },
      {
        status: 'ditinjau',
        keterangan: 'Tim Komisi III sedang meninjau aspirasi ini',
        tanggal: '2024-11-12',
        petugas: 'Indah Permata Sari',
      },
      {
        status: 'ditindaklanjuti',
        keterangan:
          'DPM telah berkoordinasi dengan pihak rektorat dan bagian sarana prasarana',
        tanggal: '2024-11-25',
        petugas: 'Indah Permata Sari',
      },
    ],
  },
  {
    id: 'ASP-002',
    kode_tracking: 'ASP-RT45PLW2',
    judul: 'Sistem SKS yang Tidak Transparan',
    deskripsi:
      'Mahasiswa tidak mendapatkan penjelasan yang cukup mengenai mekanisme konversi nilai dan perhitungan SKS. Banyak mahasiswa yang komplain soal nilai yang tidak sesuai ekspektasi tanpa penjelasan yang jelas dari dosen.',
    kategori: 'akademik',
    status: 'ditinjau',
    is_anonim: true,
    tanggal_masuk: '2024-12-05',
    tanggal_update: '2024-12-08',
    petugas: 'Indah Permata Sari',
    timeline: [
      {
        status: 'diterima',
        keterangan: 'Aspirasi diterima oleh sistem DPM',
        tanggal: '2024-12-05',
      },
      {
        status: 'ditinjau',
        keterangan:
          'Tim Komisi III sedang meninjau dan mengumpulkan data terkait',
        tanggal: '2024-12-08',
        petugas: 'Indah Permata Sari',
      },
    ],
  },
  {
    id: 'ASP-003',
    kode_tracking: 'ASP-MN90QRS3',
    judul: 'Penambahan Waktu Operasional Perpustakaan',
    deskripsi:
      'Perpustakaan kampus tutup terlalu awal (jam 16.00). Mahasiswa yang memiliki jadwal kuliah sore tidak dapat memanfaatkan fasilitas perpustakaan secara maksimal. Mohon perpustakaan bisa buka hingga jam 20.00 atau setidaknya 18.00.',
    kategori: 'fasilitas',
    status: 'selesai',
    is_anonim: false,
    nama_pengaju: 'Anisa Putri',
    nim_pengaju: '2023001001',
    email_pengaju: 'anisa.putri@mahasiswa.itbriau.ac.id',
    tanggal_masuk: '2024-10-01',
    tanggal_update: '2024-11-30',
    catatan_tindak_lanjut:
      'Perpustakaan telah memperpanjang jam operasional menjadi 19.00 WIB mulai 1 Desember 2024.',
    petugas: 'Fajar Setiawan',
    timeline: [
      {
        status: 'diterima',
        keterangan: 'Aspirasi diterima',
        tanggal: '2024-10-01',
      },
      {
        status: 'ditinjau',
        keterangan: 'Ditinjau oleh Komisi III',
        tanggal: '2024-10-05',
        petugas: 'Fajar Setiawan',
      },
      {
        status: 'ditindaklanjuti',
        keterangan: 'Koordinasi dengan kepala perpustakaan',
        tanggal: '2024-10-20',
        petugas: 'Fajar Setiawan',
      },
      {
        status: 'selesai',
        keterangan: 'Jam operasional diperpanjang menjadi 19.00 WIB',
        tanggal: '2024-11-30',
        petugas: 'Fajar Setiawan',
      },
    ],
  },
  {
    id: 'ASP-004',
    kode_tracking: 'ASP-VB23TUV4',
    judul: 'Ketidakjelasan Biaya UKT Semester Ini',
    deskripsi:
      'Banyak mahasiswa yang bingung dengan nominal UKT yang berbeda dari yang diinformasikan awal. Ada beberapa kasus di mana UKT naik tanpa penjelasan yang jelas. Mohon DPM dapat mempertanyakan hal ini ke pihak institusi.',
    kategori: 'kemahasiswaan',
    status: 'diterima',
    is_anonim: false,
    nama_pengaju: 'Doni Prasetyo',
    nim_pengaju: '2023002001',
    email_pengaju: 'doni.prasetyo@mahasiswa.itbriau.ac.id',
    tanggal_masuk: '2025-01-08',
    tanggal_update: '2025-01-08',
    timeline: [
      {
        status: 'diterima',
        keterangan: 'Aspirasi diterima oleh sistem DPM',
        tanggal: '2025-01-08',
      },
    ],
  },
  {
    id: 'ASP-005',
    kode_tracking: 'ASP-CX67YZA5',
    judul: 'Kurangnya Fasilitas Olahraga untuk Mahasiswa',
    deskripsi:
      'Lapangan olahraga kampus tidak memadai untuk jumlah mahasiswa yang ada. Tidak ada fasilitas gym atau ruang fitness. Mohon DPM dapat memperjuangkan penambahan fasilitas olahraga.',
    kategori: 'fasilitas',
    status: 'diterima',
    is_anonim: true,
    tanggal_masuk: '2025-01-09',
    tanggal_update: '2025-01-09',
    timeline: [
      {
        status: 'diterima',
        keterangan: 'Aspirasi diterima oleh sistem DPM',
        tanggal: '2025-01-09',
      },
    ],
  },
];

export const aspirasiBulanData = [
  { bulan: 'Jul', total: 8, ditindaklanjuti: 6 },
  { bulan: 'Agu', total: 12, ditindaklanjuti: 10 },
  { bulan: 'Sep', total: 15, ditindaklanjuti: 12 },
  { bulan: 'Okt', total: 20, ditindaklanjuti: 17 },
  { bulan: 'Nov', total: 18, ditindaklanjuti: 15 },
  { bulan: 'Des', total: 22, ditindaklanjuti: 18 },
  { bulan: 'Jan', total: 10, ditindaklanjuti: 4 },
];

export function getAspirasiByKode(kode: string): Aspirasi | undefined {
  return mockAspirasi.find((a) => a.kode_tracking === kode);
}
