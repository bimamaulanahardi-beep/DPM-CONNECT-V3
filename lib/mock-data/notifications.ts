import { Notifikasi } from '@/lib/types';

export const mockNotifikasi: Notifikasi[] = [
  {
    id: 'NOTIF-001',
    judul: 'Sidang Paripurna II Dijadwalkan',
    pesan:
      'Sidang Paripurna II akan dilaksanakan pada 15 Januari 2025 pukul 09.00 WIB di Aula Utama.',
    jenis: 'sidang',
    is_read: false,
    tanggal: '2025-01-08T08:00:00',
    link: '/dashboard/sidang/SDG-004',
  },
  {
    id: 'NOTIF-002',
    judul: 'Aspirasi Baru Masuk',
    pesan:
      'Terdapat 2 aspirasi baru yang perlu ditinjau: masalah UKT dan fasilitas olahraga.',
    jenis: 'aspirasi',
    is_read: false,
    tanggal: '2025-01-09T09:30:00',
    link: '/dashboard/aspirasi',
  },
  {
    id: 'NOTIF-003',
    judul: 'Draft RUU Dana Kemahasiswaan Diperbarui',
    pesan:
      'Komisi II telah memperbarui draft RUU Pengelolaan Dana Kemahasiswaan (revisi ke-2).',
    jenis: 'legislasi',
    is_read: false,
    tanggal: '2025-01-07T14:15:00',
    link: '/dashboard/legislasi/LEG-003',
  },
  {
    id: 'NOTIF-004',
    judul: 'Laporan BEM Terlambat',
    pesan:
      'Program Bakti Sosial BEM mengalami keterlambatan. Mohon tindak lanjut.',
    jenis: 'pengumuman',
    is_read: true,
    tanggal: '2025-01-05T10:00:00',
    link: '/dashboard/pengawasan/PKBEM-006',
  },
  {
    id: 'NOTIF-005',
    judul: 'Voting Selesai - GBHK Disahkan',
    pesan:
      'Voting pengesahan GBHK 2024/2025 selesai dengan hasil 12 setuju, 0 tidak setuju.',
    jenis: 'voting',
    is_read: true,
    tanggal: '2024-09-15T11:00:00',
    link: '/dashboard/voting/VOT-001',
  },
];
