'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  UserCheck,
  Shield, 
  Building,
  Key,
  X,
  Plus,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';

interface UserData {
  id: string;
  nim: string;
  name: string;
  email: string;
  role: string;
  komisi: string | null;
  jabatan: string | null;
  avatar: string | null;
  phone: string | null;
  angkatan: string | null;
  prodi: string | null;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const currentUser = session?.user as any;

  // State Management
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [komisiFilter, setKomisiFilter] = useState('all');
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form States
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('mahasiswa');
  const [komisi, setKomisi] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [phone, setPhone] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [prodi, setProdi] = useState('');
  const [password, setPassword] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      } else {
        toast({
          title: 'Gagal Memuat Pengguna',
          description: data.error || 'Terjadi kesalahan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat memuat data dari server.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Form for Add
  const handleOpenAdd = () => {
    setSelectedUser(null);
    setNim('');
    setName('');
    setEmail('');
    setRole('mahasiswa');
    setKomisi('');
    setJabatan('');
    setPhone('');
    setAngkatan('');
    setProdi('');
    setPassword('');
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (user: UserData) => {
    setSelectedUser(user);
    setNim(user.nim);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setKomisi(user.komisi || '');
    setJabatan(user.jabatan || '');
    setPhone(user.phone || '');
    setAngkatan(user.angkatan || '');
    setProdi(user.prodi || '');
    setPassword(''); // Leave blank for edit unless resetting
    setIsFormOpen(true);
  };

  // Open Confirm Delete
  const handleOpenDelete = (user: UserData) => {
    if (user.id === currentUser?.id) {
      toast({
        title: 'Tindakan Ditolak',
        description: 'Anda tidak dapat menghapus akun Anda sendiri.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Form Submit (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const isEdit = !!selectedUser;
    const url = isEdit ? `/api/admin/users/${selectedUser!.id}` : '/api/admin/users';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nim,
          name,
          email,
          role,
          komisi: komisi || null,
          jabatan: jabatan || null,
          phone: phone || null,
          angkatan: angkatan || null,
          prodi: prodi || null,
          password: password || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: isEdit ? 'Pengguna Diperbarui' : 'Pengguna Ditambahkan',
          description: `Berhasil ${isEdit ? 'memperbarui' : 'menyimpan'} pengguna ${name} ke database.`,
        });
        setIsFormOpen(false);
        fetchUsers();
      } else {
        toast({
          title: 'Operasi Gagal',
          description: data.error || 'Terjadi kesalahan saat menyimpan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Kesalahan Koneksi',
        description: 'Gagal menghubungkan ke API server.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Confirm Submit
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: 'Pengguna Dihapus',
          description: `Akun ${selectedUser.name} berhasil dihapus permanen.`,
        });
        setIsDeleteOpen(false);
        fetchUsers();
      } else {
        toast({
          title: 'Gagal Menghapus',
          description: data.error || 'Terjadi kesalahan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Kesalahan Koneksi',
        description: 'Gagal menghubungkan ke API server.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtering Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesKomisi = 
      komisiFilter === 'all' || 
      (komisiFilter === 'none' && !user.komisi) || 
      user.komisi === komisiFilter;

    return matchesSearch && matchesRole && matchesKomisi;
  });

  // Role Badge Styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'pimpinan':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      case 'ketua_komisi':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'anggota':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.replace('_', ' ').toUpperCase();
  };

  // Summary counts
  const totalCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const dpmCount = users.filter(u => u.role === 'pimpinan' || u.role === 'ketua_komisi' || u.role === 'anggota').length;
  const mahasiswaCount = users.filter(u => u.role === 'mahasiswa').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Manajemen Pengguna</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Kelola data login akun DPM, mahasiswa, beserta pemberian hak akses role sistem.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchUsers}
            variant="outline" 
            className="border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-900"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:shadow-md hover:shadow-amber-500/10"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Akun
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Pengguna</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white block mt-1">{totalCount}</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Administrator</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white block mt-1">{adminCount}</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-red-500/10 text-red-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fungsionaris DPM</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white block mt-1">{dpmCount}</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mahasiswa Umum</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white block mt-1">{mahasiswaCount}</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="bg-slate-900/20 border-slate-800">
        <CardHeader className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              type="text"
              placeholder="Cari nama, NIM, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Role Filter */}
            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-350 focus:outline-none border-none cursor-pointer pr-4 font-semibold"
              >
                <option value="all" className="bg-slate-950 text-white">Semua Peran</option>
                <option value="admin" className="bg-slate-950 text-white">Admin</option>
                <option value="pimpinan" className="bg-slate-950 text-white">Pimpinan</option>
                <option value="ketua_komisi" className="bg-slate-950 text-white">Ketua Komisi</option>
                <option value="anggota" className="bg-slate-950 text-white">Anggota DPM</option>
                <option value="mahasiswa" className="bg-slate-950 text-white">Mahasiswa</option>
              </select>
            </div>

            {/* Komisi Filter */}
            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={komisiFilter}
                onChange={(e) => setKomisiFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-350 focus:outline-none border-none cursor-pointer pr-4 font-semibold"
              >
                <option value="all" className="bg-slate-950 text-white">Semua Komisi</option>
                <option value="Pimpinan" className="bg-slate-950 text-white">Pimpinan DPM</option>
                <option value="Komisi I" className="bg-slate-950 text-white">Komisi I</option>
                <option value="Komisi II" className="bg-slate-950 text-white">Komisi II</option>
                <option value="Komisi III" className="bg-slate-950 text-white">Komisi III</option>
                <option value="none" className="bg-slate-950 text-white">Non Komisi (Mahasiswa)</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider">Memuat data pengguna...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6">Profil</th>
                    <th className="p-4">NIM</th>
                    <th className="p-4">Peran</th>
                    <th className="p-4">Komisi & Jabatan</th>
                    <th className="p-4">Kontak & Program Studi</th>
                    <th className="p-4 text-right pr-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 bg-slate-950/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                      {/* Profil */}
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-850 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center font-bold text-amber-500 text-[11px]">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white block text-[13px]">{user.name}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{user.email}</span>
                        </div>
                      </td>

                      {/* NIM */}
                      <td className="p-4 font-mono font-bold text-slate-350">{user.nim}</td>

                      {/* Peran */}
                      <td className="p-4">
                        <span className={`inline-block border px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      {/* Komisi & Jabatan */}
                      <td className="p-4">
                        {user.komisi ? (
                          <div>
                            <span className="font-bold text-white block">{user.komisi}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{user.jabatan || '-'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Kontak & Prodi */}
                      <td className="p-4">
                        {user.prodi ? (
                          <div>
                            <span className="font-semibold text-slate-350 block">{user.prodi} ({user.angkatan || '-'})</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{user.phone || '-'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleOpenEdit(user)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleOpenDelete(user)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Users className="w-10 h-10 text-slate-700 mb-3" />
              <span className="text-sm font-bold text-slate-400">Pengguna tidak ditemukan</span>
              <span className="text-xs text-slate-650 mt-1">Coba gunakan kata kunci pencarian atau filter lain.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. Modal Dialog Add/Edit User */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-slate-900/40 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                <div>
                  <h3 className="font-bold text-white text-base">
                    {selectedUser ? 'Edit Detail Akun' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {selectedUser ? 'Perbarui profil dan wewenang pengguna.' : 'Masukkan identitas lengkap dan tetapkan role.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-950/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Scrollable Form Content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                  {/* NIM & Nama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="nim" className="text-slate-400 text-xs font-semibold">NIM (Nomor Induk Mahasiswa)</Label>
                      <Input
                        id="nim"
                        type="text"
                        placeholder="Contoh: 2021001001"
                        value={nim}
                        onChange={(e) => setNim(e.target.value)}
                        className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-slate-400 text-xs font-semibold">Nama Lengkap</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Email & Peran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-slate-400 text-xs font-semibold">Email Kampus</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contoh@itbriau.ac.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="role" className="text-slate-400 text-xs font-semibold">Peran Hak Akses (Role)</Label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="mahasiswa">Mahasiswa (Umum)</option>
                        <option value="anggota">Anggota DPM</option>
                        <option value="ketua_komisi">Ketua Komisi</option>
                        <option value="pimpinan">Pimpinan DPM</option>
                        <option value="admin">Administrator Sistem</option>
                      </select>
                    </div>
                  </div>

                  {/* Komisi & Jabatan (Only if role !== mahasiswa) */}
                  {role !== 'mahasiswa' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-950/30 rounded-xl border border-slate-800">
                      <div className="space-y-1.5">
                        <Label htmlFor="komisi" className="text-slate-400 text-xs font-semibold">Penempatan Komisi</Label>
                        <select
                          id="komisi"
                          value={komisi}
                          onChange={(e) => setKomisi(e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="">Pilih Komisi (Jika Ada)</option>
                          <option value="Pimpinan">Pimpinan DPM</option>
                          <option value="Komisi I">Komisi I (Hukum & Legislasi)</option>
                          <option value="Komisi II">Komisi II (Anggaran & Pengawasan)</option>
                          <option value="Komisi III">Komisi III (Aspirasi & Kemahasiswaan)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="jabatan" className="text-slate-400 text-xs font-semibold">Jabatan Spesifik</Label>
                        <Input
                          id="jabatan"
                          type="text"
                          placeholder="Contoh: Ketua Komisi I"
                          value={jabatan}
                          onChange={(e) => setJabatan(e.target.value)}
                          className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Prodi & Angkatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="prodi" className="text-slate-400 text-xs font-semibold">Program Studi</Label>
                      <Input
                        id="prodi"
                        type="text"
                        placeholder="Contoh: Teknik Informatika"
                        value={prodi}
                        onChange={(e) => setProdi(e.target.value)}
                        className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="angkatan" className="text-slate-400 text-xs font-semibold">Angkatan</Label>
                        <Input
                          id="angkatan"
                          type="text"
                          placeholder="2022"
                          value={angkatan}
                          onChange={(e) => setAngkatan(e.target.value)}
                          className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-slate-400 text-xs font-semibold">No WA</Label>
                        <Input
                          id="phone"
                          type="text"
                          placeholder="0812..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password (Optional for updates, default for new) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <Label htmlFor="pass" className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      {selectedUser ? 'Ganti Password Akun (Opsional)' : 'Password Log Masuk'}
                    </Label>
                    <Input
                      id="pass"
                      type="password"
                      placeholder={selectedUser ? 'Biarkan kosong jika tidak ingin diubah' : 'Kosongkan untuk gunakan password default "user123"'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 text-xs"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/10 shrink-0">
                  <Button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    variant="outline"
                    className="border-slate-800 bg-transparent text-slate-400 hover:text-white"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold"
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {selectedUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Dialog Confirm Delete */}
      <AnimatePresence>
        {isDeleteOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setIsDeleteOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-slate-900/40 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-white text-base">Hapus Akun Pengguna?</h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Apakah Anda yakin ingin menghapus akun <span className="font-bold text-white">{selectedUser.name}</span> (NIM: <span className="font-mono text-white font-bold">{selectedUser.nim}</span>)? 
                    Tindakan ini akan menghapus data akses login secara permanen.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-955/20 text-right">
                <Button
                  onClick={() => setIsDeleteOpen(false)}
                  variant="outline"
                  className="border-slate-800 bg-transparent text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteSubmit}
                  className="bg-red-650 hover:bg-red-700 text-white font-bold border-red-750"
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Hapus Akun
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
