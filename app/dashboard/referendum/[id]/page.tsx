'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Vote, 
  BarChart3, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

export default function DetailReferendumDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;

  const [referendum, setReferendum] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/referendum/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReferendum(data);
      } else {
        setErrorMsg('Data referendum tidak ditemukan.');
      }
    } catch (err) {
      setErrorMsg('Gagal memuat detail referendum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!referendum) return;
    const newStatus = referendum.status === 'aktif' ? 'selesai' : 'aktif';
    const confirmText = newStatus === 'selesai'
      ? 'Tutup referendum ini? Mahasiswa tidak akan dapat memberikan suara lagi setelah ditutup.'
      : 'Buka kembali referendum ini agar mahasiswa dapat memberikan suara?';

    if (!confirm(confirmText)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/referendum/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReferendum((prev: any) => ({ ...prev, status: updated.status }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
        <p className="text-sm">Memuat hasil referendum...</p>
      </div>
    );
  }

  if (!referendum) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Referendum Tidak Ditemukan</h2>
        <Link href="/dashboard/referendum" className="mt-4 inline-block">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar
          </Button>
        </Link>
      </div>
    );
  }

  const totalSuara = referendum.total_pemilih || 0;

  // Cari opsi dengan suara tertinggi
  let highestOption = '';
  let highestCount = -1;
  if (referendum.opsi && referendum.voteCounts) {
    referendum.opsi.forEach((opt: string) => {
      const count = referendum.voteCounts[opt] || 0;
      if (count > highestCount && count > 0) {
        highestCount = count;
        highestOption = opt;
      }
    });
  }

  const user = session?.user as any;
  const canManage = user && ['admin', 'pimpinan', 'ketua_komisi', 'anggota'].includes(user.role);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/referendum">
            <Button size="icon" variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={referendum.status} />
              <span className="text-xs text-slate-500">
                Oleh {referendum.created_by}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
              {referendum.judul}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDetail}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Link href="/referendum" target="_blank">
            <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Laman Publik
            </Button>
          </Link>
          {canManage && (
            <Button
              size="sm"
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={
                referendum.status === 'aktif'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs'
              }
            >
              {referendum.status === 'aktif' ? 'Tutup Pemungutan Suara' : 'Aktifkan Kembali'}
            </Button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Partisipasi Mahasiswa</p>
              <p className="text-2xl font-bold text-white mt-1">{totalSuara} Suara</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gold-400">Opsi Terunggul Saat Ini</p>
              <p className="text-lg font-bold text-gold-400 mt-1 truncate max-w-[200px]">
                {highestOption || 'Belum Ada Suara'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Periode Pemilihan</p>
              <p className="text-xs font-semibold text-white mt-1">
                {referendum.tanggal_mulai} s/d {referendum.tanggal_selesai}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Hasil Perolehan Suara */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gold-400" />
                  Diagram Perolehan Suara Mahasiswa
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Hasil pemungutan suara diperbarui secara real-time saat mahasiswa memberikan suara.
                </p>

                <div className="space-y-4">
                  {referendum.opsi.map((opt: string) => {
                    const count = referendum.voteCounts?.[opt] || 0;
                    const percentage = totalSuara > 0 ? Math.round((count / totalSuara) * 100) : 0;
                    const isWinner = opt === highestOption;

                    return (
                      <div key={opt} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-2">
                            {opt}
                            {isWinner && (
                              <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded font-bold border border-gold-500/30 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-gold-400" /> Suara Terbanyak
                              </span>
                            )}
                          </span>
                          <span className="text-slate-300 font-mono font-bold">
                            {count} Suara ({percentage}%)
                          </span>
                        </div>

                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isWinner
                                ? 'bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Pertanyaan & Isu */}
              <div className="border-t border-slate-800 pt-5 space-y-3">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-gold-400 uppercase tracking-wider block mb-1">
                    Pertanyaan:
                  </span>
                  <p className="text-sm font-semibold text-white">
                    "{referendum.pertanyaan}"
                  </p>
                </div>

                {referendum.deskripsi && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">
                      Deskripsi & Konteks Kebijakan:
                    </span>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                      {referendum.deskripsi}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Partisipasi Mahasiswa (Audit) */}
        <div>
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold-400" />
                  Daftar Voter Mahasiswa
                </h3>
                <span className="text-xs font-bold text-gold-400">
                  {totalSuara} Pemilih
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Log transparansi partisipasi mahasiswa (NIM dan waktu pemberian suara).
              </p>

              <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                {referendum.voters && referendum.voters.length > 0 ? (
                  referendum.voters.map((v: any, i: number) => (
                    <div key={i} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-white font-semibold block">{v.nim}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(v.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-medium">
                        {v.pilihan}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Belum ada mahasiswa yang memberikan suara.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
