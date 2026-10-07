export type UserRole = 'admin' | 'pimpinan' | 'ketua_komisi' | 'anggota' | 'mahasiswa';

export type SidangStatus = 'dijadwalkan' | 'berlangsung' | 'selesai' | 'dibatalkan';
export type SidangJenis = 'paripurna' | 'komisi' | 'dengar_pendapat' | 'istimewa';

export type LegislasiStatus =
  | 'diajukan'
  | 'dibahas'
  | 'direvisi'
  | 'disahkan'
  | 'diundangkan'
  | 'ditolak';
export type LegislasiJenis = 'ketetapan' | 'peraturan' | 'keputusan' | 'gbhk' | 'tata_tertib' | 'ad_art';

export type AspirasiStatus =
  | 'diterima'
  | 'ditinjau'
  | 'ditindaklanjuti'
  | 'selesai'
  | 'ditolak';
export type AspirasiKategori =
  | 'akademik'
  | 'fasilitas'
  | 'kemahasiswaan'
  | 'organisasi'
  | 'lainnya';

export type PengawasanStatus = 'belum_mulai' | 'berjalan' | 'selesai' | 'terlambat';

export type VotingStatus = 'draft' | 'aktif' | 'selesai';
export type VotingOpsi = 'setuju' | 'tidak_setuju' | 'abstain';

export type SuratJenis = 'masuk' | 'keluar';
export type SuratStatus = 'draft' | 'terkirim' | 'diterima' | 'diarsip';

export interface User {
  id: string;
  nim: string;
  name: string;
  email: string;
  role: UserRole;
  komisi?: string;
  jabatan?: string;
  avatar?: string;
  phone?: string;
  angkatan?: string;
  prodi?: string;
}

export interface Sidang {
  id: string;
  judul: string;
  jenis: SidangJenis;
  status: SidangStatus;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai?: string;
  lokasi: string;
  link_daring?: string;
  komisi?: string;
  agenda: string[];
  peserta: string[];
  notulensi?: string;
  quorum_required: number;
  quorum_achieved: number;
  created_by: string;
  created_at: string;
}

export interface Legislasi {
  id: string;
  nomor?: string;
  judul: string;
  jenis: LegislasiJenis;
  status: LegislasiStatus;
  komisi: string;
  pengaju: string;
  tanggal_diajukan: string;
  tanggal_disahkan?: string;
  isi_ringkasan: string;
  konten?: string;
  tags: string[];
  revisi_ke: number;
  approved_by?: string;
  sidang_id?: string;
}

export interface Aspirasi {
  id: string;
  kode_tracking: string;
  judul: string;
  deskripsi: string;
  kategori: AspirasiKategori;
  status: AspirasiStatus;
  is_anonim: boolean;
  nama_pengaju?: string;
  nim_pengaju?: string;
  email_pengaju?: string;
  lampiran?: string[];
  tanggal_masuk: string;
  tanggal_update: string;
  catatan_tindak_lanjut?: string;
  petugas?: string;
  timeline: AspirasiTimeline[];
}

export interface AspirasiTimeline {
  status: AspirasiStatus;
  keterangan: string;
  tanggal: string;
  petugas?: string;
}

export interface ProgramKerjaBEM {
  id: string;
  nama: string;
  divisi: string;
  deskripsi: string;
  target: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: PengawasanStatus;
  progress_percentage: number;
  bukti_urls?: string[];
  skor_evaluasi?: number;
  catatan_dpm?: string;
  catatan_bem?: string;
  penanggung_jawab: string;
}

export interface Voting {
  id: string;
  judul: string;
  deskripsi: string;
  status: VotingStatus;
  sidang_id?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  quorum_required: number;
  total_pemilih: number;
  jenis: 'binary' | 'multipilih';
  opsi_multipilih?: string[];
  hasil: VotingHasil;
  created_by: string;
}

export interface VotingHasil {
  setuju: number;
  tidak_setuju: number;
  abstain: number;
  total: number;
}

export interface AnggotaDPM {
  id: string;
  user: User;
  komisi: string;
  jabatan: string;
  periode: string;
  tanggal_bergabung: string;
  kehadiran_sidang: number;
  total_sidang: number;
  ruu_diajukan: number;
  voting_diikuti: number;
  is_active: boolean;
}

export interface Surat {
  id: string;
  nomor: string;
  perihal: string;
  jenis: SuratJenis;
  status: SuratStatus;
  dari: string;
  kepada: string;
  tanggal: string;
  isi_singkat: string;
  lampiran?: string[];
  disposisi_kepada?: string;
  disposisi_catatan?: string;
  created_by: string;
}

export interface Notifikasi {
  id: string;
  judul: string;
  pesan: string;
  jenis: 'sidang' | 'legislasi' | 'aspirasi' | 'voting' | 'pengumuman' | 'surat' | 'izin' | 'pengawasan' | 'lpj' | 'pemira' | 'referendum' | 'anggota' | 'kegiatan';
  is_read: boolean;
  tanggal: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  aksi: string;
  modul: string;
  detail: string;
  ip_address: string;
  tanggal: string;
}

export interface DashboardStats {
  total_sidang_bulan_ini: number;
  ruu_dalam_proses: number;
  aspirasi_masuk: number;
  aspirasi_ditindaklanjuti: number;
  total_anggota_aktif: number;
  program_bem_berjalan: number;
}
