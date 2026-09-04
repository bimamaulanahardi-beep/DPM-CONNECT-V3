'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronRight,
  MessageSquareText,
  PlusCircle,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ExportButtons } from '@/components/common/export-buttons';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AspirasiListPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [aspirasiList, setAspirasiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [kategoriFilter, setKategoriFilter] = useState('semua');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', judul: '' });

  const user = session?.user as any;
  const isMahasiswa = user?.role === 'mahasiswa';
  const canDelete = !isMahasiswa;

  const fetchAspirasi = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/aspirasi');
      const data = await res.json();
      if (res.ok) {
        setAspirasiList(data);
      }
    } catch (e) {
      console.error('Error fetching aspirasi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirasi();
  }, []);

  const handleDelete = (id: string, judul: string) => {
    setDeleteModal({ isOpen: true, id, judul });
  };

  const executeDelete = async () => {
    const { id, judul } = deleteModal;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/aspirasi/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAspirasiList(prev => prev.filter(a => a.id !== id));
        toast({ title: 'Aspirasi Dihapus', description: `"${judul}" berhasil dihapus.` });
        setDeleteModal({ isOpen: false, id: '', judul: '' });
      } else {
        const data = await res.json();
        toast({ title: 'Gagal Menghapus', description: data.error || 'Terjadi kesalahan.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Kesalahan Jaringan', description: 'Tidak dapat menghubungi server.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter aspirations based on user role.
  const baseAspirasi = isMahasiswa 
    ? aspirasiList.filter((a) => a.nim_pengaju === user?.nim || a.is_anonim === false)
    : aspirasiList;

  const filteredAspirasi = baseAspirasi.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.kode_tracking.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    const matchesKategori = kategoriFilter === 'semua' || item.kategori === kategoriFilter;
    return matchesSearch && matchesStatus && matchesKategori;
  });

  const kategoriList = ['semua', 'akademik', 'fasilitas', 'kemahasiswaan', 'organisasi', 'lainnya'];
  const statusList = ['semua', 'diterima', 'ditinjau', 'ditindaklanjuti', 'selesai', 'ditolak'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Aspirasi Mahasiswa</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMahasiswa 
              ? 'Daftar pengajuan aspirasi, saran, dan keluhan yang Anda ajukan ke DPM.'
              : 'Daftar keluhan, usulan, dan aspirasi yang dikirimkan oleh mahasiswa ITB Riau.'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <ExportButtons 
            data={filteredAspirasi} 
            filename="Laporan_Aspirasi_Mahasiswa" 
            columns={[
              { header: 'Kode', dataKey: 'kode_tracking' },
              { header: 'Kategori', dataKey: 'kategori' },
              { header: 'Tanggal Masuk', dataKey: 'tanggal_masuk' },
              { header: 'Pengaju', dataKey: 'nama_pengaju' },
              { header: 'Judul', dataKey: 'judul' },
              { header: 'Status', dataKey: 'status' }
            ]} 
          />
          <Button 
            onClick={fetchAspirasi} 
            variant="outline" 
            className="border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-900 h-10"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
          {isMahasiswa && (
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shrink-0 h-10">
              <Link href="/dashboard/aspirasi/baru" className="flex items-center">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Kirim Aspirasi Baru
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Cari berdasarkan judul, kode tracking, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder-slate-650 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Kategori:</span>
            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500 capitalize"
            >
              {kategoriList.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500 capitalize"
            >
              {statusList.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aspirasi Cards Listing */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredAspirasi.length > 0 ? (
        <div className="space-y-4">
          {filteredAspirasi.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-amber-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={item.status} />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-800 text-slate-355 capitalize">
                    {item.kategori}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    KODE: {item.kode_tracking}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug hover:text-amber-500 transition-colors">
                  <Link href={`/dashboard/aspirasi/${item.id}`}>
                    {item.judul}
                  </Link>
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl leading-relaxed font-sans">
                  {item.deskripsi}
                </p>

                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 font-semibold">
                  <span>Masuk: {formatDate(item.tanggal_masuk)}</span>
                  <span>&bull;</span>
                  <span>Pengaju: {item.is_anonim ? 'Anonim' : item.nama_pengaju}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 justify-end">
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.judul)}
                    disabled={deletingId === item.id}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    title="Hapus Aspirasi"
                  >
                    {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 hover:bg-slate-900 text-xs font-bold h-8">
                  <Link href={`/dashboard/aspirasi/${item.id}`} className="flex items-center gap-1">
                    Detail Tindak Lanjut <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <MessageSquareText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Aspirasi Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">Tidak ada aspirasi mahasiswa yang cocok dengan kriteria filter Anda.</p>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: '', judul: '' })}
        onConfirm={executeDelete}
        title="Hapus Aspirasi?"
        description={`Apakah Anda yakin ingin menghapus aspirasi "${deleteModal.judul}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deletingId === deleteModal.id}
      />
    </div>
  );
}
