const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.notifikasi.deleteMany({});
  await prisma.surat.deleteMany({});
  await prisma.voting.deleteMany({});
  await prisma.programKerjaBEM.deleteMany({});
  await prisma.aspirasiTimeline.deleteMany({});
  await prisma.aspirasi.deleteMany({});
  await prisma.legislasi.deleteMany({});
  await prisma.sidang.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  // WARNING: These default passwords (admin123, pimpinan123, dll) are WEAK. 
  // DO NOT use these in a production environment. Change them immediately upon deployment.
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', salt);
  const pimpinanHash = await bcrypt.hash('pimpinan123', salt);
  const ketuaHash = await bcrypt.hash('ketua123', salt);
  const anggotaHash = await bcrypt.hash('anggota123', salt);

  // 1. Seed Users
  const users = [
    { id: 'admin-id', nim: 'admin', name: 'System Administrator', email: 'admin@itbriau.ac.id', password: adminHash, role: 'admin', komisi: 'Administrator', jabatan: 'Admin Sistem', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', phone: '081234567899', angkatan: '2020', prodi: 'Sistem Informasi' },
    { id: '1', nim: '2021001001', name: 'Ahmad Fadhillah Ramadhan', email: 'ahmad.fadhillah@itbriau.ac.id', password: pimpinanHash, role: 'pimpinan', komisi: 'Pimpinan', jabatan: 'Ketua DPM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad', phone: '081234567890', angkatan: '2021', prodi: 'Teknik Informatika' },
    { id: '2', nim: '2021001002', name: 'Siti Rahayu Pratiwi', email: 'siti.rahayu@itbriau.ac.id', password: pimpinanHash, role: 'pimpinan', komisi: 'Pimpinan', jabatan: 'Wakil Ketua DPM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti', phone: '081234567891', angkatan: '2021', prodi: 'Teknik Sipil' },
    { id: '3', nim: '2021002001', name: 'Budi Santoso', email: 'budi.santoso@itbriau.ac.id', password: ketuaHash, role: 'ketua_komisi', komisi: 'Komisi I', jabatan: 'Ketua Komisi I (Hukum & Legislasi)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi', phone: '081234567892', angkatan: '2021', prodi: 'Teknik Elektro' },
    { id: '4', nim: '2021003001', name: 'Dewi Anggraeni', email: 'dewi.anggraeni@itbriau.ac.id', password: ketuaHash, role: 'ketua_komisi', komisi: 'Komisi II', jabatan: 'Ketua Komisi II (Anggaran & Pengawasan)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi', phone: '081234567893', angkatan: '2021', prodi: 'Teknik Mesin' },
    { id: '5', nim: '2022001001', name: 'Rizki Maulana', email: 'rizki.maulana@itbriau.ac.id', password: anggotaHash, role: 'anggota', komisi: 'Komisi I', jabatan: 'Anggota Komisi I', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rizki', phone: '081234567894', angkatan: '2022', prodi: 'Teknik Informatika' },
    { id: '6', nim: '2022002001', name: 'Nur Hasanah', email: 'nur.hasanah@itbriau.ac.id', password: anggotaHash, role: 'anggota', komisi: 'Komisi II', jabatan: 'Anggota Komisi II', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nur', phone: '081234567895', angkatan: '2022', prodi: 'Teknik Kimia' },
    { id: '7', nim: '2022003001', name: 'Fajar Setiawan', email: 'fajar.setiawan@itbriau.ac.id', password: anggotaHash, role: 'anggota', komisi: 'Komisi III', jabatan: 'Anggota Komisi III', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar', phone: '081234567896', angkatan: '2022', prodi: 'Teknik Lingkungan' },
    { id: '8', nim: '2022004001', name: 'Indah Permata Sari', email: 'indah.permata@itbriau.ac.id', password: anggotaHash, role: 'anggota', komisi: 'Komisi III', jabatan: 'Ketua Komisi III (Aspirasi & Kemahasiswaan)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Indah', phone: '081234567897', angkatan: '2022', prodi: 'Teknik Industri' }
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  // 2. Seed Sidang
  const sidangList = [
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
      agenda: JSON.stringify([
        'Pembukaan dan doa',
        'Pengecekan quorum',
        'Pembacaan agenda',
        'Presentasi GBHK oleh Komisi I',
        'Diskusi dan tanya jawab',
        'Voting pengesahan GBHK',
        'Penutup'
      ]),
      peserta: JSON.stringify(['1', '2', '3', '4', '5', '6', '7', '8']),
      notulensi: 'Sidang Paripurna I telah dilaksanakan dengan hasil voting 12 setuju, 0 tidak setuju, 1 abstain. GBHK 2024/2025 resmi disahkan.',
      quorum_required: 75,
      quorum_achieved: 100,
      created_by: '1',
      created_at: '2024-09-01'
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
      agenda: JSON.stringify([
        'Review draft tata tertib',
        'Pembahasan pasal-pasal kritis',
        'Revisi dan finalisasi'
      ]),
      peserta: JSON.stringify(['3', '5']),
      notulensi: 'Draft tata tertib telah dibahas dengan 3 pasal perlu revisi lebih lanjut.',
      quorum_required: 50,
      quorum_achieved: 100,
      created_by: '3',
      created_at: '2024-09-28'
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
      agenda: JSON.stringify([
        'Pemaparan laporan kinerja BEM semester ganjil',
        'Sesi tanya jawab DPM kepada BEM',
        'Rekomendasi DPM'
      ]),
      peserta: JSON.stringify(['2', '4', '6']),
      notulensi: 'BEM memaparkan 15 program kerja dengan 10 sudah selesai, 3 berjalan, dan 2 terlambat.',
      quorum_required: 50,
      quorum_achieved: 100,
      created_by: '2',
      created_at: '2024-11-10'
    }
  ];

  for (const s of sidangList) {
    await prisma.sidang.create({ data: s });
  }

  // 3. Seed Legislasi
  const legislasiList = [
    {
      id: 'LEG-001',
      nomor: 'TAP DPM ITB RIAU/I/2024',
      judul: 'Ketetapan tentang Garis Besar Haluan Kerja (GBHK) Periode 2024/2025',
      jenis: 'gbhk',
      status: 'diundangkan',
      komisi: 'Komisi I',
      pengaju: '3',
      tanggal_diajukan: '2024-08-20',
      tanggal_disahkan: '2024-09-15',
      isi_ringkasan: 'GBHK ini menetapkan arah dan kebijakan umum organisasi kemahasiswaan di lingkungan ITB Riau untuk periode 2024/2025.',
      tags: JSON.stringify(['GBHK', 'Kebijakan Umum', 'Prioritas']),
      revisi_ke: 2,
      approved_by: '1',
      sidang_id: 'SDG-001'
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
      isi_ringkasan: 'Peraturan ini mengatur tata cara pelaksanaan sidang DPM ITB Riau, termasuk mekanisme pengambilan keputusan dan hak suara anggota.',
      tags: JSON.stringify(['Tata Tertib', 'Sidang', 'Prosedur']),
      revisi_ke: 1,
      approved_by: '1',
      sidang_id: 'SDG-002'
    }
  ];

  for (const leg of legislasiList) {
    await prisma.legislasi.create({ data: leg });
  }

  // 4. Seed Aspirasi & Timeline
  const aspirasiList = [
    {
      id: 'ASP-001',
      kode_tracking: 'ASP-XK72M9AB',
      judul: 'Permohonan Perbaikan AC Ruang Kuliah Gedung A',
      deskripsi: 'Kondisi AC di ruang kuliah Gedung A Lantai 2 sudah tidak berfungsi optimal selama 3 minggu terakhir. Suhu ruangan sangat panas dan mengganggu konsentrasi belajar mahasiswa. Sudah dilaporkan ke bagian kemahasiswaan tapi belum ada tindak lanjut.',
      kategori: 'fasilitas',
      status: 'ditindaklanjuti',
      is_anonim: false,
      nama_pengaju: 'Rahmat Hidayat',
      nim_pengaju: '2022005001',
      email_pengaju: 'rahmat.hidayat@mahasiswa.itbriau.ac.id',
      tanggal_masuk: '2024-11-10',
      tanggal_update: '2024-11-25',
      catatan_tindak_lanjut: 'DPM telah berkoordinasi dengan pihak rektorat. Teknisi AC dijadwalkan datang minggu ini.',
      petugas: 'Indah Permata Sari',
      timeline: {
        create: [
          { status: 'diterima', keterangan: 'Aspirasi diterima oleh sistem DPM', tanggal: '2024-11-10' },
          { status: 'ditinjau', keterangan: 'Tim Komisi III sedang meninjau aspirasi ini', tanggal: '2024-11-12', petugas: 'Indah Permata Sari' },
          { status: 'ditindaklanjuti', keterangan: 'DPM telah berkoordinasi dengan pihak rektorat dan bagian sarana prasarana', tanggal: '2024-11-25', petugas: 'Indah Permata Sari' }
        ]
      }
    }
  ];

  for (const asp of aspirasiList) {
    await prisma.aspirasi.create({ data: asp });
  }

  // 5. Seed ProgramKerjaBEM
  const prokerList = [
    {
      id: 'PKBEM-001',
      nama: 'Pekan Orientasi Mahasiswa Baru 2024',
      divisi: 'Kemahasiswaan',
      deskripsi: 'Kegiatan orientasi pengenalan kampus dan lingkungan akademik bagi mahasiswa baru angkatan 2024.',
      target: 'Seluruh mahasiswa baru angkatan 2024 (±300 mahasiswa)',
      tanggal_mulai: '2024-08-26',
      tanggal_selesai: '2024-08-30',
      status: 'selesai',
      progress_percentage: 100,
      bukti_urls: JSON.stringify(['foto_orientasi_1.jpg', 'laporan_orientasi.pdf']),
      skor_evaluasi: 85,
      catatan_dpm: 'Program berjalan baik. Peserta antusias. Sedikit catatan: materi hari ke-3 terlalu padat.',
      catatan_bem: 'OMABA 2024 berhasil dilaksanakan dengan total 287 mahasiswa baru yang hadir.',
      penanggung_jawab: 'Ketua Bidang Kemahasiswaan BEM'
    }
  ];

  for (const pk of prokerList) {
    await prisma.programKerjaBEM.create({ data: pk });
  }

  // 6. Seed Voting
  const votingList = [
    {
      id: 'VOT-001',
      judul: 'Pengesahan GBHK 2024/2025',
      deskripsi: 'Voting untuk mengesahkan Garis Besar Haluan Kerja periode 2024/2025 yang telah dibahas dalam sidang komisi.',
      status: 'selesai',
      sidang_id: 'SDG-001',
      tanggal_mulai: '2024-09-15T10:30:00',
      tanggal_selesai: '2024-09-15T10:45:00',
      quorum_required: 75,
      total_pemilih: 13,
      jenis: 'binary',
      hasil_setuju: 12,
      hasil_tidak_setuju: 0,
      hasil_abstain: 1,
      hasil_total: 13,
      created_by: '1'
    }
  ];

  for (const vt of votingList) {
    await prisma.voting.create({ data: vt });
  }

  // 7. Seed AuditLogs
  const auditLogs = [
    {
      id: 'log-1',
      user: 'System Administrator',
      aksi: 'Inisialisasi sistem database',
      modul: 'Sistem',
      detail: 'Berhasil melakukan seed data awal ke database SQLite.',
      ip_address: '127.0.0.1',
      tanggal: new Date().toISOString(),
    },
    {
      id: 'log-2',
      user: 'Ahmad Fadhillah Ramadhan',
      aksi: 'Login sistem',
      modul: 'Autentikasi',
      detail: 'Login berhasil dengan NIM 2021001001.',
      ip_address: '192.168.1.101',
      tanggal: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'log-3',
      user: 'System Administrator',
      aksi: 'Menambahkan pengguna baru',
      modul: 'Manajemen Pengguna',
      detail: 'Menambahkan pengguna Ahmad Fadhillah Ramadhan (NIM: 2021001001) sebagai Pimpinan.',
      ip_address: '127.0.0.1',
      tanggal: new Date(Date.now() - 1800000).toISOString(),
    }
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
