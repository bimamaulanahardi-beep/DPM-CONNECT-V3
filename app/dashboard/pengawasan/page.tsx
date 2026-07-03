'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  ShieldCheck, 
  Award,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/hooks/use-toast';

export default function PengawasanListPage() {
  const [prokerList, setProkerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', nama: '' });
  
  const { data: session } = useSession();
  const { toast } = useToast();
  const userRole = session?.user ? (session.user as any).role : 'mahasiswa';
  const isAuthorizedToAdd = userRole !== 'mahasiswa';
  const canDelete = isAuthorizedToAdd;

  const fetchProker = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pengawasan');
      const data = await res.json();
      if (res.ok) {
        setProkerList(data);
      }
    } catch (e) {
      console.error('Error fetching proker BEM:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProker();
  }, []);

  const handleDelete = (id: string, nama: string) => {
    setDeleteModal({ isOpen: true, id, nama });
  };

  const executeDelete = async () => {
    const { id, nama } = deleteModal;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/pengawasan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProkerList(prev => prev.filter(p => p.id !== id));
        toast({ title: 'Program Dihapus', description: `"${nama}" berhasil dihapus.` });
        setDeleteModal({ isOpen: false, id: '', nama: '' });
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

  const filteredProker = prokerList.filter((item) => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.divisi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['semua', 'belum_mulai', 'berjalan', 'selesai', 'terlambat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Pengawasan Program Kerja BEM</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Pantau dan evaluasi pelaksanaan program kerja Badan Eksekutif Mahasiswa (BEM) ITB Riau.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchProker} 
            variant="outline" 
            className="border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-900 h-10"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
          {isAuthorizedToAdd && (
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shrink-0 h-10">
              <Link href="/dashboard/pengawasan/baru" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tambah Program
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Cari program kerja berdasarkan nama atau divisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder-slate-650 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500 capitalize"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredProker.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProker.map((proker, i) => (
            <div key={proker.id}>
              <Card className="bg-slate-900/40 border-slate-800 hover:border-amber-500/20 transition-all duration-300 h-full flex flex-col justify-between">
                <CardContent className="p-6">
                  
                  {/* Top Header metadata */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded capitalize">
                      Divisi: {proker.divisi}
                    </span>
                    <StatusBadge status={proker.status} />
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-white text-base leading-snug mb-2 line-clamp-1 hover:text-amber-500 transition-colors">
                    <Link href={`/dashboard/pengawasan/${proker.id}`}>
                      {proker.nama}
                    </Link>
                  </h3>

                  {/* Target text */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-5 font-sans">
                    Target: {proker.target}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span>PROGRES PROGRAM</span>
                      <span>{proker.progress_percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-955 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full" 
                        style={{ width: `${proker.progress_percentage}%` }} 
                      />
                    </div>
                  </div>

                  {/* Evaluation Score (if completed) */}
                  {proker.status === 'selesai' && proker.skor_evaluasi && (
                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs mb-6">
                      <span className="text-slate-500 font-bold flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        Skor Evaluasi DPM
                      </span>
                      <span className="font-black text-amber-500 text-sm">{proker.skor_evaluasi} / 100</span>
                    </div>
                  )}

                  {/* Footer details */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-auto">
                    <span className="text-[10px] text-slate-500 font-mono">ID: {proker.id}</span>
                    <div className="flex items-center gap-2">
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(proker.id, proker.nama)}
                          disabled={deletingId === proker.id}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                          title="Hapus Program"
                        >
                          {deletingId === proker.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 hover:bg-slate-900 text-xs font-bold h-8">
                        <Link href={`/dashboard/pengawasan/${proker.id}`} className="flex items-center gap-1">
                          Detail Evaluasi <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Program BEM Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">Tidak ada program kerja BEM yang cocok dengan kriteria filter Anda.</p>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: '', nama: '' })}
        onConfirm={executeDelete}
        title="Hapus Program Kerja?"
        description={`Apakah Anda yakin ingin menghapus program kerja "${deleteModal.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deletingId === deleteModal.id}
      />
    </div>
  );
}
