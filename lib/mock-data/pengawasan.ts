import { ProgramKerjaBEM } from '@/lib/types';

export const mockProgramKerjaBEM: ProgramKerjaBEM[] = [
  {
    id: 'PKBEM-001',
    nama: 'Pekan Orientasi Mahasiswa Baru 2024',
    divisi: 'Kemahasiswaan',
    deskripsi:
      'Kegiatan orientasi pengenalan kampus dan lingkungan akademik bagi mahasiswa baru angkatan 2024.',
    target: 'Seluruh mahasiswa baru angkatan 2024 (±300 mahasiswa)',
    tanggal_mulai: '2024-08-26',
    tanggal_selesai: '2024-08-30',
    status: 'selesai',
    progress_percentage: 100,
    bukti_urls: ['foto_orientasi_1.jpg', 'laporan_orientasi.pdf'],
    skor_evaluasi: 85,
    catatan_dpm:
      'Program berjalan baik. Peserta antusias. Sedikit catatan: materi hari ke-3 terlalu padat.',
    catatan_bem:
      'OMABA 2024 berhasil dilaksanakan dengan total 287 mahasiswa baru yang hadir.',
    penanggung_jawab: 'Ketua Bidang Kemahasiswaan BEM',
  },
  {
    id: 'PKBEM-002',
    nama: 'Festival Seni & Budaya ITB Riau',
    divisi: 'Seni & Budaya',
    deskripsi:
      'Festival tahunan yang menampilkan berbagai seni budaya dari mahasiswa seluruh angkatan.',
    target: 'Minimal 20 penampilan seni, 500 penonton',
    tanggal_mulai: '2024-11-01',
    tanggal_selesai: '2024-11-03',
    status: 'selesai',
    progress_percentage: 100,
    skor_evaluasi: 90,
    catatan_dpm:
      'Sangat baik. Target terlampaui dengan 25 penampilan dan 620 penonton.',
    catatan_bem:
      'Festival berjalan meriah. Penampilan tari tradisional mendapat sambutan sangat baik.',
    penanggung_jawab: 'Ketua Bidang Seni Budaya BEM',
  },
  {
    id: 'PKBEM-003',
    nama: 'Seminar Nasional Teknologi & Inovasi',
    divisi: 'Akademik & Riset',
    deskripsi:
      'Seminar nasional menghadirkan pembicara dari industri dan akademisi untuk berbagi ilmu terkini di bidang teknologi.',
    target: '200 peserta, 4 pembicara nasional',
    tanggal_mulai: '2024-12-10',
    tanggal_selesai: '2024-12-10',
    status: 'selesai',
    progress_percentage: 100,
    skor_evaluasi: 78,
    catatan_dpm:
      'Baik, namun pengelolaan waktu kurang. Sesi tanya jawab terpotong.',
    catatan_bem:
      'Seminar dihadiri 185 peserta dari 4 kampus berbeda.',
    penanggung_jawab: 'Ketua Bidang Akademik BEM',
  },
  {
    id: 'PKBEM-004',
    nama: 'Program Beasiswa Mahasiswa Berprestasi',
    divisi: 'Kesejahteraan Mahasiswa',
    deskripsi:
      'Program pemberian beasiswa kepada mahasiswa berprestasi akademik dan non-akademik yang membutuhkan dukungan finansial.',
    target: '20 penerima beasiswa, total Rp 50 juta',
    tanggal_mulai: '2024-09-01',
    tanggal_selesai: '2025-01-31',
    status: 'berjalan',
    progress_percentage: 70,
    catatan_dpm:
      'Proses seleksi sudah selesai. Masih menunggu proses pencairan dana.',
    catatan_bem:
      '18 penerima beasiswa sudah diseleksi. Proses pencairan dalam tahap administrasi.',
    penanggung_jawab: 'Ketua Bidang Kesejahteraan BEM',
  },
  {
    id: 'PKBEM-005',
    nama: 'Turnamen Olahraga Antar Angkatan',
    divisi: 'Olahraga',
    deskripsi:
      'Kompetisi olahraga (futsal, basket, badminton, voli) antar angkatan mahasiswa.',
    target: 'Minimal 8 tim per cabang olahraga, 4 cabang olahraga',
    tanggal_mulai: '2025-01-20',
    tanggal_selesai: '2025-02-28',
    status: 'belum_mulai',
    progress_percentage: 15,
    catatan_dpm:
      'Masih dalam tahap persiapan. Mohon update timeline yang lebih detail.',
    catatan_bem:
      'Pendaftaran tim sedang berjalan. 45 tim sudah mendaftar dari target 48 tim.',
    penanggung_jawab: 'Ketua Bidang Olahraga BEM',
  },
  {
    id: 'PKBEM-006',
    nama: 'Bakti Sosial ke Masyarakat Sekitar Kampus',
    divisi: 'Pengabdian Masyarakat',
    deskripsi:
      'Kegiatan bakti sosial meliputi penyuluhan kesehatan, bazar sembako murah, dan penanaman pohon di sekitar kampus.',
    target: '500 warga terbantu, 100 pohon ditanam',
    tanggal_mulai: '2024-12-20',
    tanggal_selesai: '2024-12-22',
    status: 'terlambat',
    progress_percentage: 40,
    catatan_dpm:
      'Perlu penjelasan mengapa kegiatan tidak berjalan sesuai rencana. Mohon laporan tertulis.',
    catatan_bem:
      'Terkendala perizinan dari kelurahan setempat. Kegiatan dipindah ke Februari 2025.',
    penanggung_jawab: 'Ketua Bidang Pengmas BEM',
  },
];
