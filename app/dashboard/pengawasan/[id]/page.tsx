'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft,
  Calendar,
  Award,
  Save,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProkerDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [proker, setProker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(80);
  const [dpmNotes, setDpmNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProker = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pengawasan/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setProker(data);
        setScore(data.skor_evaluasi || 80);
        setDpmNotes(data.catatan_dpm || '');
      }
    } catch (e) {
      console.error('Error fetching proker detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProker();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!proker) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500/60 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Program Kerja Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mb-6">Program kerja dengan ID tersebut tidak dapat ditemukan.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <Link href="/dashboard/pengawasan">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  const userRole = session?.user ? (session.user as any).role : 'anggota';
  const isAuthorizedToEvaluate = ['pimpinan', 'ketua_komisi', 'admin'].includes(userRole);

  const handleSaveEvaluation = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pengawasan/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skor_evaluasi: Number(score),
          catatan_dpm: dpmNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProker(updated);
        toast({
          title: 'Evaluasi Disimpan',
          description: 'Penilaian dan catatan pengawasan berhasil diperbarui.',
        });
      } else {
        toast({
          title: 'Gagal Menyimpan Evaluasi',
          description: 'Terjadi kesalahan saat menyimpan evaluasi.',
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
        href="/dashboard/pengawasan" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Program
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Info Area (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* Top metadata */}
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded capitalize">
                  Divisi: {proker.divisi}
                </span>
                <StatusBadge status={proker.status} />
              </div>

              {/* Title & Desc */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">{proker.nama}</h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">{proker.deskripsi}</p>
              </div>

              <Separator className="bg-slate-800/60" />

              {/* Target & Schedule */}
              <div className="grid sm:grid-cols-2 gap-6 text-xs text-slate-400">
                <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Target & Sasaran</span>
                  <p className="text-slate-300 leading-relaxed font-sans font-bold">{proker.target}</p>
                </div>
                
                <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Timeline Pelaksanaan</span>
                  <div className="space-y-1 font-bold text-slate-300 font-sans">
                    <div>Mulai: {formatDate(proker.tanggal_mulai)}</div>
                    <div>Selesai: {formatDate(proker.tanggal_selesai)}</div>
                  </div>
                </div>
              </div>

              {/* Progress percentage slider preview */}
              <div className="space-y-2 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Progres Realisasi Kerja</span>
                  <span>{proker.progress_percentage}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-900/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full" style={{ width: `${proker.progress_percentage}%` }} />
                </div>
              </div>

              {/* BEM evidence URLs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lampiran Bukti Realisasi (Evidence)</h3>
                
                {proker.bukti_urls && proker.bukti_urls.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {proker.bukti_urls.map((url: string, i: number) => (
                      <div key={i} className="p-3 bg-slate-950/20 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400 hover:text-white hover:border-slate-800 transition-colors">
                        <span className="truncate">{url}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white" onClick={() => alert(`Mengunduh dokumen bukti: ${url} (Mock)`)}>
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Belum ada dokumen bukti yang dilampirkan oleh BEM.</p>
                )}
              </div>

              {/* BEM execution comment */}
              {proker.catatan_bem && (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pernyataan Pelaksana BEM</span>
                  <p className="text-slate-350 leading-relaxed font-sans">{proker.catatan_bem}</p>
                  <p className="text-[9px] text-slate-500 text-right mt-1.5 font-bold">P.J: {proker.penanggung_jawab}</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Area (Evaluations & Scoring) */}
        <div className="space-y-6">
          {/* Evaluation card */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-white text-xs tracking-wide uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Penilaian Kinerja
              </h3>

              {isAuthorizedToEvaluate && proker.status === 'selesai' ? (
                // Interactive form
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label htmlFor="score" className="text-slate-400">Skor Evaluasi DPM</Label>
                      <span className="text-amber-500 font-bold">{score} / 100</span>
                    </div>
                    <Input
                      id="score"
                      type="number"
                      min="10"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-400 text-xs">Catatan & Rekomendasi DPM</Label>
                    <textarea
                      id="notes"
                      rows={5}
                      placeholder="Tulis saran, kritik, atau catatan audit untuk program kerja BEM ini..."
                      value={dpmNotes}
                      onChange={(e) => setDpmNotes(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveEvaluation}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {isSaving ? 'Menyimpan...' : 'Simpan Evaluasi'}
                  </Button>
                </div>
              ) : (
                // Readonly display
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Skor Evaluasi DPM</span>
                    <span className="text-xl font-black text-amber-500">
                      {proker.skor_evaluasi ? `${proker.skor_evaluasi} / 100` : 'BELUM DINILAI'}
                    </span>
                  </div>

                  {proker.catatan_dpm && (
                    <div className="space-y-1">
                      <span className="text-slate-500 block uppercase font-bold text-[10px]">Catatan Pengawasan</span>
                      <p className="text-slate-350 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 font-sans leading-relaxed">
                        {proker.catatan_dpm}
                      </p>
                    </div>
                  )}
                  
                  {!isAuthorizedToEvaluate && proker.status === 'selesai' && (
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2 text-[10px] text-amber-500/70 leading-normal">
                      <InfoIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      <p>Hanya Pimpinan DPM dan Ketua Komisi II yang memiliki kewenangan memberikan skor evaluasi program kerja BEM.</p>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function InfoIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
