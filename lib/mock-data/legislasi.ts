import { Legislasi } from '@/lib/types';

export const mockLegislasi: Legislasi[] = [
  {
    id: 'LEG-001',
    nomor: 'TAP DPM ITB RIAU/I/2024',
    judul:
      'Ketetapan tentang Garis Besar Haluan Kerja (GBHK) Periode 2024/2025',
    jenis: 'gbhk',
    status: 'diundangkan',
    komisi: 'Komisi I',
    pengaju: '3',
    tanggal_diajukan: '2024-08-20',
    tanggal_disahkan: '2024-09-15',
    isi_ringkasan:
      'GBHK ini menetapkan arah dan kebijakan umum organisasi kemahasiswaan di lingkungan ITB Riau untuk periode 2024/2025.',
    tags: ['GBHK', 'Kebijakan Umum', 'Prioritas'],
    revisi_ke: 2,
    approved_by: '1',
    sidang_id: 'SDG-001',
  },
  {
    id: 'LEG-002',
    nomor: 'TAP DPM ITB RIAU/II/2024',
    judul: 'Peraturan tentang Tata Tertib Sidang DPM ITB Riau',
    jenis: 'tata_tertib',
    status: 'disahkan',
    komisi: 'Komisi I',
    pengaju: '3',
    tanggal_diajukan: '2024-10-01',
    tanggal_disahkan: '2024-11-01',
    isi_ringkasan:
      'Peraturan ini mengatur tata cara pelaksanaan sidang DPM ITB Riau, termasuk mekanisme pengambilan keputusan dan hak suara anggota.',
    tags: ['Tata Tertib', 'Sidang', 'Prosedur'],
    revisi_ke: 1,
    approved_by: '1',
    sidang_id: 'SDG-002',
  },
  {
    id: 'LEG-003',
    judul: 'Rancangan Peraturan Pengelolaan Dana Kemahasiswaan',
    jenis: 'peraturan',
    status: 'dibahas',
    komisi: 'Komisi II',
    pengaju: '4',
    tanggal_diajukan: '2024-12-01',
    isi_ringkasan:
      'Mengatur mekanisme pengajuan, pencairan, pertanggungjawaban, dan audit dana kemahasiswaan yang bersumber dari iuran mahasiswa dan bantuan institusi.',
    tags: ['Keuangan', 'Dana Kemahasiswaan', 'Transparansi'],
    revisi_ke: 2,
    sidang_id: 'SDG-004',
  },
  {
    id: 'LEG-004',
    judul: 'Rancangan Ketetapan tentang Mekanisme Pengawasan Program Kerja BEM',
    jenis: 'ketetapan',
    status: 'diajukan',
    komisi: 'Komisi II',
    pengaju: '4',
    tanggal_diajukan: '2025-01-03',
    isi_ringkasan:
      'Ketetapan ini mengatur prosedur DPM dalam melakukan pengawasan terhadap pelaksanaan program kerja Badan Eksekutif Mahasiswa (BEM), termasuk mekanisme evaluasi dan sanksi.',
    tags: ['Pengawasan', 'BEM', 'Akuntabilitas'],
    revisi_ke: 0,
  },
  {
    id: 'LEG-005',
    judul: 'Rancangan Peraturan tentang Pengelolaan Aspirasi Mahasiswa',
    jenis: 'peraturan',
    status: 'direvisi',
    komisi: 'Komisi III',
    pengaju: '8',
    tanggal_diajukan: '2024-11-15',
    isi_ringkasan:
      'Mengatur alur penerimaan, pemrosesan, dan tindak lanjut aspirasi mahasiswa oleh DPM, termasuk batas waktu respons dan mekanisme eskalasi.',
    tags: ['Aspirasi', 'Mahasiswa', 'Layanan'],
    revisi_ke: 1,
  },
];

export function getLegislasiById(id: string): Legislasi | undefined {
  return mockLegislasi.find((l) => l.id === id);
}

export function getLegislasiByStatus(status: Legislasi['status']): Legislasi[] {
  return mockLegislasi.filter((l) => l.status === status);
}
