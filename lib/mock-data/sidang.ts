import { Sidang } from '@/lib/types';

export const mockSidang: Sidang[] = [
  {
    id: 'SDG-001',
    judul: 'Sidang Paripurna I - Pengesahan GBHK 2024/2025',
    jenis: 'paripurna',
    status: 'selesai',
    tanggal: '2024-09-15',
    waktu_mulai: '09:00',
    waktu_selesai: '13:30',
    lokasi: 'Aula Utama ITB Riau',
    komisi: 'Semua Komisi',
    agenda: [
      'Pembukaan dan doa',
      'Pengecekan quorum',
      'Pembacaan agenda',
      'Presentasi GBHK oleh Komisi I',
      'Diskusi dan tanya jawab',
      'Voting pengesahan GBHK',
      'Penutup',
    ],
    peserta: ['1', '2', '3', '4', '5', '6', '7', '8'],
    notulensi:
      'Sidang Paripurna I telah dilaksanakan dengan hasil voting 12 setuju, 0 tidak setuju, 1 abstain. GBHK 2024/2025 resmi disahkan.',
    quorum_required: 75,
    quorum_achieved: 100,
    created_by: '1',
    created_at: '2024-09-01',
  },
  {
    id: 'SDG-002',
    judul: 'Sidang Komisi I - Pembahasan Rancangan Tata Tertib',
    jenis: 'komisi',
    status: 'selesai',
    tanggal: '2024-10-05',
    waktu_mulai: '14:00',
    waktu_selesai: '16:00',
    lokasi: 'Ruang Komisi I, Gedung Kemahasiswaan',
    komisi: 'Komisi I',
    agenda: [
      'Review draft tata tertib',
      'Pembahasan pasal-pasal kritis',
      'Revisi dan finalisasi',
    ],
    peserta: ['3', '5'],
    notulensi:
      'Draft tata tertib telah dibahas dengan 3 pasal perlu revisi lebih lanjut.',
    quorum_required: 50,
    quorum_achieved: 100,
    created_by: '3',
    created_at: '2024-09-28',
  },
  {
    id: 'SDG-003',
    judul: 'Dengar Pendapat BEM - Evaluasi Semester Ganjil',
    jenis: 'dengar_pendapat',
    status: 'selesai',
    tanggal: '2024-11-20',
    waktu_mulai: '10:00',
    waktu_selesai: '12:30',
    lokasi: 'Ruang Rapat DPM',
    komisi: 'Komisi II',
    agenda: [
      'Pemaparan laporan kinerja BEM semester ganjil',
      'Sesi tanya jawab DPM kepada BEM',
      'Rekomendasi DPM',
    ],
    peserta: ['2', '4', '6'],
    notulensi:
      'BEM memaparkan 15 program kerja dengan 10 sudah selesai, 3 berjalan, dan 2 terlambat.',
    quorum_required: 50,
    quorum_achieved: 100,
    created_by: '2',
    created_at: '2024-11-10',
  },
  {
    id: 'SDG-004',
    judul: 'Sidang Paripurna II - Pengesahan RUU Pengelolaan Dana Kemahasiswaan',
    jenis: 'paripurna',
    status: 'dijadwalkan',
    tanggal: '2025-01-15',
    waktu_mulai: '09:00',
    lokasi: 'Aula Utama ITB Riau',
    komisi: 'Semua Komisi',
    agenda: [
      'Pembukaan',
      'Pengecekan quorum',
      'Presentasi RUU Pengelolaan Dana',
      'Diskusi umum',
      'Voting pengesahan',
      'Penutup',
    ],
    peserta: ['1', '2', '3', '4', '5', '6', '7', '8'],
    quorum_required: 75,
    quorum_achieved: 0,
    created_by: '1',
    created_at: '2025-01-02',
  },
  {
    id: 'SDG-005',
    judul: 'Sidang Komisi III - Pembahasan Aspirasi Mahasiswa Q4 2024',
    jenis: 'komisi',
    status: 'berlangsung',
    tanggal: '2025-01-10',
    waktu_mulai: '13:00',
    lokasi: 'Zoom Meeting',
    link_daring: 'https://zoom.us/j/123456789',
    komisi: 'Komisi III',
    agenda: [
      'Review aspirasi masuk bulan Oktober-Desember',
      'Kategorisasi dan prioritasi',
      'Rencana tindak lanjut',
    ],
    peserta: ['8', '7'],
    quorum_required: 50,
    quorum_achieved: 100,
    created_by: '8',
    created_at: '2025-01-05',
  },
];

export function getSidangById(id: string): Sidang | undefined {
  return mockSidang.find((s) => s.id === id);
}

export function getSidangByStatus(status: Sidang['status']): Sidang[] {
  return mockSidang.filter((s) => s.status === status);
}
