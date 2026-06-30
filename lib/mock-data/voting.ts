import { Voting } from '@/lib/types';

export const mockVoting: Voting[] = [
  {
    id: 'VOT-001',
    judul: 'Pengesahan GBHK 2024/2025',
    deskripsi:
      'Voting untuk mengesahkan Garis Besar Haluan Kerja periode 2024/2025 yang telah dibahas dalam sidang komisi.',
    status: 'selesai',
    sidang_id: 'SDG-001',
    tanggal_mulai: '2024-09-15T10:30:00',
    tanggal_selesai: '2024-09-15T10:45:00',
    quorum_required: 75,
    total_pemilih: 13,
    jenis: 'binary',
    hasil: { setuju: 12, tidak_setuju: 0, abstain: 1, total: 13 },
    created_by: '1',
  },
  {
    id: 'VOT-002',
    judul: 'Persetujuan Tata Tertib Sidang DPM',
    deskripsi:
      'Voting untuk menyetujui dokumen tata tertib sidang yang telah direvisi oleh Komisi I.',
    status: 'selesai',
    sidang_id: 'SDG-002',
    tanggal_mulai: '2024-10-05T15:30:00',
    tanggal_selesai: '2024-10-05T15:45:00',
    quorum_required: 50,
    total_pemilih: 2,
    jenis: 'binary',
    hasil: { setuju: 2, tidak_setuju: 0, abstain: 0, total: 2 },
    created_by: '3',
  },
  {
    id: 'VOT-003',
    judul: 'Voting Pengesahan RUU Dana Kemahasiswaan',
    deskripsi:
      'Voting pada Sidang Paripurna II untuk mengesahkan Rancangan Peraturan Pengelolaan Dana Kemahasiswaan.',
    status: 'draft',
    sidang_id: 'SDG-004',
    quorum_required: 75,
    total_pemilih: 0,
    jenis: 'binary',
    hasil: { setuju: 0, tidak_setuju: 0, abstain: 0, total: 0 },
    created_by: '1',
  },
];

export const kehadiranSidangData = [
  { bulan: 'Sep', persentase: 92 },
  { bulan: 'Okt', persentase: 85 },
  { bulan: 'Nov', persentase: 88 },
  { bulan: 'Des', persentase: 80 },
  { bulan: 'Jan', persentase: 90 },
];
