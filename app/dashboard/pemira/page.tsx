'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus, Users, Vote, Loader2, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/common/confirm-dialog';

export default function PemiraListPage() {
  const [pemiraList, setPemiraList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', judul: '' });

  const { data: session } = useSession();
  const { toast } = useToast();
  
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'admin' || userRole === 'pimpinan';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pemira');
      if (res.ok) {
        const data = await res.json();
        setPemiraList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: string, judul: string) => {
    setDeleteModal({ isOpen: true, id, judul });
  };

  const executeDelete = async () => {
    setDeletingId(deleteModal.id);
    try {
      const res = await fetch(`/api/pemira/${deleteModal.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPemiraList(prev => prev.filter(p => p.id !== deleteModal.id));
        toast({ title: 'Berhasil', description: 'Pemilu Raya berhasil dihapus.' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menghapus event.', variant: 'destructive' });
      }
    } finally {
      setDeletingId(null);
      setDeleteModal({ isOpen: false, id: '', judul: '' });
    }
  };

  const filtered = pemiraList.filter(p => p.judul.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Vote className="w-6 h-6 text-amber-500" /> Pemilu Raya (Pemira)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Portal demokrasi digital kampus ITB Riau untuk memilih pemimpin mahasiswa.</p>
        </div>
        {isAdmin && (
          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shrink-0">
            <Link href="/dashboard/pemira/baru">
              <Plus className="w-4 h-4 mr-2" /> Buat Pemira Baru
            </Link>
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Cari event pemilu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-slate-900/40 border-slate-800 text-white placeholder-slate-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((pemira) => (
            <Card key={pemira.id} className="bg-slate-900/40 border-slate-800 hover:border-amber-500/30 transition-all flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <StatusBadge status={pemira.status} />
                    <CardTitle className="text-lg font-bold text-white mt-2 leading-snug">
                      <Link href={`/dashboard/pemira/${pemira.id}`} className="hover:text-amber-500 transition-colors">
                        {pemira.judul}
                      </Link>
                    </CardTitle>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pemira.id, pemira.judul)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <p className="text-xs text-slate-400 line-clamp-3 mb-4 flex-1 font-sans">{pemira.deskripsi}</p>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold mb-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  <div>
                    <span className="block text-slate-600 mb-1">DIBUKA</span>
                    <span className="text-white">{formatDate(pemira.tanggal_mulai)}</span>
                  </div>
                  <div>
                    <span className="block text-slate-600 mb-1">DITUTUP</span>
                    <span className="text-white">{formatDate(pemira.tanggal_selesai)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Users className="w-4 h-4 text-blue-500" /> {pemira._count?.candidates || 0} Paslon
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Vote className="w-4 h-4 text-emerald-500" /> {pemira._count?.records || 0} Suara
                    </span>
                  </div>
                  <Button asChild size="sm" className="bg-slate-800 hover:bg-slate-700 text-white text-xs h-8">
                    <Link href={`/dashboard/pemira/${pemira.id}`}>Lihat Paslon</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <Vote className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">Belum Ada Pemilu Raya</h3>
          <p className="text-xs text-slate-500">Event pemilihan raya akan muncul di sini.</p>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: '', judul: '' })}
        onConfirm={executeDelete}
        title="Hapus Pemilu Raya?"
        description={`Apakah Anda yakin ingin menghapus "${deleteModal.judul}"? Semua data kandidat dan suara akan hilang.`}
        isLoading={deletingId === deleteModal.id}
      />
    </div>
  );
}
