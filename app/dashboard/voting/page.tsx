'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  ChevronRight,
  Users,
  Loader2,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/hooks/use-toast';

export default function VotingListPage() {
  const [votingList, setVotingList] = useState<any[]>([]);
  const [sidangs, setSidangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', judul: '' });
  const { data: session } = useSession();
  const { toast } = useToast();
  const userRole = (session?.user as any)?.role;
  const canDelete = userRole && userRole !== 'mahasiswa';

  const fetchData = async () => {
    setLoading(true);
    try {
      const voteRes = await fetch('/api/voting');
      const voteData = await voteRes.json();

      const sidangRes = await fetch('/api/sidang');
      const sidangData = await sidangRes.json();

      if (voteRes.ok) setVotingList(voteData);
      if (sidangRes.ok) setSidangs(sidangData);
    } catch (e) {
      console.error('Error fetching voting list:', e);
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
    const { id, judul } = deleteModal;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/voting/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVotingList(prev => prev.filter(v => v.id !== id));
        toast({ title: 'Voting Dihapus', description: `"${judul}" berhasil dihapus.` });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Pemungutan Suara (Voting)</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Pantau dan ikuti pemungutan suara pengambilan keputusan sidang DPM secara real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchData} 
            variant="outline" 
            className="border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-900 h-10"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shadow-sm shrink-0">
            <Link href="/dashboard/voting/baru" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Buat Voting Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Voting List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : votingList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {votingList.map((vote, i) => {
            const sidangTerkait = sidangs.find(s => s.id === vote.sidang_id);
            
            return (
              <div key={vote.id}>
                <Card className="bg-slate-900/40 border-slate-800 hover:border-amber-500/20 transition-all duration-300 h-full flex flex-col justify-between">
                  <CardContent className="p-6">
                    
                    {/* Status & ID */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <StatusBadge status={vote.status} />
                      <span className="text-[10px] text-slate-500 font-mono">ID: {vote.id}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-white text-base leading-snug mb-3 hover:text-amber-500 transition-colors">
                      <Link href={`/dashboard/voting/${vote.id}`}>
                        {vote.judul}
                      </Link>
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 mb-5 leading-relaxed font-sans">
                      {vote.deskripsi}
                    </p>

                    {/* Sidang Terkait */}
                    {sidangTerkait && (
                      <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1 mb-6">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Sidang Terkait</span>
                        <span className="text-xs text-slate-350 line-clamp-1 font-semibold">{sidangTerkait.judul}</span>
                      </div>
                    )}

                    {/* Results preview (for completed) */}
                    {vote.status === 'selesai' && (
                      <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-950/50 rounded-xl border border-slate-850/50 text-center text-[10px] font-bold text-slate-400 mb-6">
                        <div>
                          <span className="text-emerald-500 block text-xs font-black">{vote.hasil.setuju}</span>
                          SETUJU
                        </div>
                        <div className="border-x border-slate-800">
                          <span className="text-red-500 block text-xs font-black">{vote.hasil.tidak_setuju}</span>
                          TOLAK
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs font-black">{vote.hasil.abstain}</span>
                          ABSTAIN
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        {vote.status === 'selesai' ? `${vote.total_pemilih} Pemilih` : 'Menunggu Partisipasi'}
                      </div>

                      <div className="flex items-center gap-2">
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vote.id, vote.judul)}
                            disabled={deletingId === vote.id}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                            title="Hapus Voting"
                          >
                            {deletingId === vote.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold h-8 text-xs px-4">
                          <Link href={`/dashboard/voting/${vote.id}`} className="flex items-center gap-1">
                            {vote.status === 'aktif' ? 'Ikuti Voting' : 'Lihat Hasil'} <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-1">Voting Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">Belum ada sesi voting dewan yang terjadwal.</p>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: '', judul: '' })}
        onConfirm={executeDelete}
        title="Hapus Voting?"
        description={`Apakah Anda yakin ingin menghapus voting "${deleteModal.judul}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deletingId === deleteModal.id}
      />
    </div>
  );
}
