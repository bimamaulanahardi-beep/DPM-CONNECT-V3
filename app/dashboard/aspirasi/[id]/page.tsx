'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft,
  Save,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AspirasiTimeline } from '@/components/common/timeline';
import { AspirasiStatus } from '@/lib/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AspirasiDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AspirasiStatus>('diterima');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [petugas, setPetugas] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAspirasiDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aspirasi/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setItem(data);
        setStatus(data.status as AspirasiStatus);
        setFeedbackNotes(data.catatan_tindak_lanjut || '');
        setPetugas(data.petugas || '');
      }
    } catch (e) {
      console.error('Error fetching aspirasi detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirasiDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500/60 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Aspirasi Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mb-6">Aspirasi dengan ID tersebut tidak dapat ditemukan.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <Link href="/dashboard/aspirasi">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  const userRole = session?.user ? (session.user as any).role : 'mahasiswa';
  const isAuthorizedToModerate = ['pimpinan', 'ketua_komisi', 'anggota', 'admin'].includes(userRole);

  const handleUpdateAspirasi = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/aspirasi/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          catatan_tindak_lanjut: feedbackNotes,
          petugas,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setItem(updated);
        toast({
          title: 'Status Aspirasi Diperbarui',
          description: 'Tindak lanjut dan catatan moderasi berhasil disimpan.',
        });
      } else {
        toast({
          title: 'Gagal Menyimpan Perubahan',
          description: 'Terjadi kesalahan saat mengupdate aspirasi.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungi server.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/aspirasi" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Aspirasi
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Info (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* Top metadata tags */}
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={item.status} />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-800 text-slate-350 capitalize">
                    {item.kategori}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 font-bold">KODE: {item.kode_tracking}</span>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-snug">{item.judul}</h1>
                <p className="text-xs text-slate-500">Masuk pada: {formatDate(item.tanggal_masuk)}</p>
              </div>

              <Separator className="bg-slate-800/60" />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Isi Laporan / Usulan</h3>
                <p className="text-xs sm:text-sm text-slate-400 bg-slate-950/40 border border-slate-800 p-5 rounded-xl font-sans whitespace-pre-wrap leading-relaxed select-text">
                  {item.deskripsi}
                </p>
              </div>

              {/* Timeline list */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Riwayat Progress Alur</h3>
                <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-800">
                  <AspirasiTimeline 
                    timeline={item.timeline}
                    currentStatus={item.status}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Panel (Moderation Panel) */}
        {isAuthorizedToModerate && (
          <div className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-white text-xs tracking-wide uppercase">Tindak Lanjut & Status</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="status-select" className="text-slate-400 text-xs">Ubah Status</Label>
                    <select
                      id="status-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as AspirasiStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-400 focus:outline-none focus:border-amber-500 capitalize"
                    >
                      <option value="diterima">Diterima</option>
                      <option value="ditinjau">Ditinjau Komisi</option>
                      <option value="ditindaklanjuti">Ditindaklanjuti</option>
                      <option value="selesai">Selesai</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="officer" className="text-slate-400 text-xs">Petugas Penanggung Jawab</Label>
                    <Input
                      id="officer"
                      type="text"
                      placeholder="Contoh: Indah Permata (Komisi III)"
                      value={petugas}
                      onChange={(e) => setPetugas(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="feedback" className="text-slate-400 text-xs">Catatan Tindak Lanjut</Label>
                    <textarea
                      id="feedback"
                      rows={5}
                      placeholder="Masukkan progres tindak lanjut ke rektorat atau keputusan DPM..."
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <Button 
                    onClick={handleUpdateAspirasi}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    {isSaving ? 'Menyimpan...' : 'Perbarui Status'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
