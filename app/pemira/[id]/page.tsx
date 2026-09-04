'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Loader2, CheckCircle2, Target, Lightbulb, Vote, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { Logo } from '@/components/common/logo';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function PublicPemiraDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Registration State
  const [isRegistered, setIsRegistered] = useState(false);
  const [voterData, setVoterData] = useState({ nama: '', nim: '', prodi: '' });
  
  // Voting State
  const [hasVoted, setHasVoted] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [voteModal, setVoteModal] = useState({ isOpen: false, candidateId: '', namaKetua: '' });
  
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/publik/pemira/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      } else {
        setEvent(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterData.nama || !voterData.nim || !voterData.prodi) {
      return toast({ title: 'Error', description: 'Semua field (Nama, NIM, Prodi) wajib diisi.', variant: 'destructive' });
    }
    
    // Optionally: Add NIM regex validation here
    // const nimRegex = /^[0-9]+$/;
    // if (!nimRegex.test(voterData.nim)) { ... }

    setIsRegistered(true);
    toast({ title: 'Akses Diberikan', description: 'Silakan pilih pasangan calon Anda.' });
  };

  const handleVoteClick = (candidateId: string, namaKetua: string) => {
    setVoteModal({ isOpen: true, candidateId, namaKetua });
  };

  const executeVote = async () => {
    const candidateId = voteModal.candidateId;
    setVotingId(candidateId);
    
    try {
      const res = await fetch(`/api/publik/pemira/${params.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidate_id: candidateId,
          voter_nama: voterData.nama,
          voter_nim: voterData.nim,
          voter_prodi: voterData.prodi
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Suara Sah!', description: 'Terima kasih telah berpartisipasi dalam Pemilu Raya.' });
        setHasVoted(true);
        fetchData(); // Refresh data to get latest count
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Gagal menghubungi server.', variant: 'destructive' });
    } finally {
      setVotingId(null);
      setVoteModal({ isOpen: false, candidateId: '', namaKetua: '' });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-20 text-white gap-4">
        <Vote className="w-12 h-12 text-slate-700 mb-2 opacity-50" />
        <h2 className="text-xl font-bold">Event tidak ditemukan</h2>
        <Link href="/pemira" className="text-amber-500 hover:underline text-sm">Kembali ke Daftar Pemilu</Link>
      </div>
    );
  }

  // Data for Quick Count Chart
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
  const pieData = event.candidates.map((c: any, index: number) => ({
    name: `Paslon ${c.nomor_urut} - ${c.nama_ketua}`,
    value: c.total_suara,
    fill: colors[index % colors.length]
  }));

  const totalVotes = event.candidates.reduce((sum: number, c: any) => sum + c.total_suara, 0);
  let dataMasukPct = "0.00";
  if (event.total_dpt > 0) {
    dataMasukPct = ((totalVotes / event.total_dpt) * 100).toFixed(2);
  } else if (totalVotes > 0) {
    dataMasukPct = "100.00"; // Fallback jika tidak ada total_dpt
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/pemira" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-bold text-white tracking-wide">DPM CONNECT</span>
          </Link>
          <Link href="/pemira" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Daftar Pemilu
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
            <StatusBadge status={event.status === 'aktif' && hasVoted ? 'selesai' : event.status} />
            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              {event.total_voters} Suara Masuk
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-snug mb-3 relative z-10">
            {event.judul}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl relative z-10 font-sans">
            {event.deskripsi}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isRegistered && event.status === 'aktif' ? (
            // REGISTRATION FORM
            <motion.div key="registration" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
              <Card className="bg-slate-900/60 border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-600" />
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                      <User className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Verifikasi Pemilih</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Silakan isi data diri Anda untuk mengakses Bilik Suara. Sistem akan mendeteksi NIM untuk memastikan prinsip 1 Mahasiswa 1 Suara.
                    </p>
                  </div>

                  <form onSubmit={handleRegistrationSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="text-slate-300">Nama Lengkap</Label>
                      <Input
                        id="nama"
                        placeholder="Contoh: Bima Maulana Hardi"
                        value={voterData.nama}
                        onChange={(e) => setVoterData({ ...voterData, nama: e.target.value })}
                        className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nim" className="text-slate-300">NIM (Nomor Induk Mahasiswa)</Label>
                      <Input
                        id="nim"
                        type="number"
                        placeholder="Contoh: 2301001"
                        value={voterData.nim}
                        onChange={(e) => setVoterData({ ...voterData, nim: e.target.value })}
                        className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prodi" className="text-slate-300">Program Studi</Label>
                      <Input
                        id="prodi"
                        placeholder="Contoh: S1 Teknik Informatika"
                        value={voterData.prodi}
                        onChange={(e) => setVoterData({ ...voterData, prodi: e.target.value })}
                        className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold mt-2">
                      Masuk Bilik Suara
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : event.status === 'aktif' && !hasVoted ? (
            // VOTING BOOTH
            <motion.div key="voting-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800/50 mb-8 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-1">Bilik Suara Digital</h2>
                <p className="text-sm font-semibold text-amber-500">Halo, {voterData.nama}!</p>
                <p className="text-xs text-slate-400 mt-2">Pilih salah satu pasangan calon di bawah ini. Pilihan bersifat LUBER JURDIL.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {event.candidates.map((c: any) => (
                  <Card key={c.id} className="bg-slate-900/60 border-slate-800 overflow-hidden flex flex-col group hover:border-amber-500/50 transition-colors">
                    <div className="bg-slate-800/50 p-6 flex flex-col items-center justify-center text-center relative border-b border-slate-800/80">
                      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg">
                        {c.nomor_urut}
                      </div>
                      {c.foto_url ? (
                        <img src={c.foto_url} alt={c.nama_ketua} className="w-24 h-24 rounded-full object-cover border-4 border-slate-900 shadow-xl mb-4" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-slate-900 shadow-xl mb-4 flex items-center justify-center">
                          <Users className="w-10 h-10 text-slate-500" />
                        </div>
                      )}
                      <h3 className="text-lg font-black text-white uppercase">{c.nama_ketua}</h3>
                      {c.nama_wakil && <p className="text-xs text-slate-400 mt-1 font-bold">Wakil: {c.nama_wakil}</p>}
                    </div>
                    
                    <CardContent className="p-5 flex-1 flex flex-col font-sans">
                      <div className="space-y-4 mb-6 flex-1">
                        <div>
                          <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" /> Visi
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed text-justify">{c.visi}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" /> Misi
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap text-justify">{c.misi}</p>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleVoteClick(c.id, c.nama_ketua)}
                        disabled={votingId !== null}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold h-12 rounded-xl text-sm"
                      >
                        {votingId === c.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Coblos Paslon Ini'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            // RESULTS SCREEN
            <motion.div key="result-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
              {hasVoted && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-center gap-3 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Terima kasih {voterData.nama}! Anda sudah berhasil menyalurkan hak suara.
                </div>
              )}
              
              <Card className="bg-slate-900/40 border-slate-800">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">Live Quick Count</h3>
                    <p className="text-xs text-slate-500 font-sans">Perolehan suara sementara secara langsung dari database.</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  {/* KPU Style Half Donut Chart */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-full max-w-md h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="65%"
                            outerRadius="100%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                          >
                            {pieData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}
                            formatter={(value: any, name: string) => [`${value} Suara`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
                        <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-1">Data Masuk</p>
                        <div className="text-5xl font-black text-white flex items-baseline gap-1 drop-shadow-md">
                          {dataMasukPct}
                          <span className="text-2xl text-amber-500">%</span>
                        </div>
                        {event.total_dpt > 0 && (
                          <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                            {totalVotes} dari {event.total_dpt} Pemilih
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Paslon Cards */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {event.candidates.map((c: any, index: number) => {
                      const pct = totalVotes > 0 ? ((c.total_suara / totalVotes) * 100).toFixed(1) : "0.0";
                      const colorClass = index % 2 === 0 ? 'from-blue-500 to-indigo-600' : 'from-amber-500 to-yellow-600';
                      const bgLine = index % 2 === 0 ? 'bg-blue-500' : 'bg-amber-500';
                      
                      return (
                        <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
                          <div className={`absolute top-0 left-0 h-1.5 ${bgLine} shadow-[0_0_15px_rgba(245,158,11,0.5)]`} style={{ width: `${pct}%`, transition: 'width 1.5s ease-in-out' }} />
                          
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-300">
                              {c.nomor_urut}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-sm uppercase line-clamp-1">{c.nama_ketua}</h4>
                              <p className="text-xs text-slate-500">{c.total_suara} Suara Sah</p>
                            </div>
                          </div>

                          <div className="flex items-baseline justify-center gap-1">
                            <span className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br ${colorClass} tracking-tighter drop-shadow-sm`}>
                              {pct}
                            </span>
                            <span className="text-3xl font-bold text-slate-700">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog 
          isOpen={voteModal.isOpen}
          onClose={() => setVoteModal({ isOpen: false, candidateId: '', namaKetua: '' })}
          onConfirm={executeVote}
          title="Konfirmasi Pilihan"
          description={`Anda yakin ingin memberikan suara untuk Paslon ${voteModal.namaKetua}? Setelah klik Coblos, suara Anda bersifat final dan tidak dapat diubah lagi.`}
          confirmText="Ya, Coblos!"
          cancelText="Batal"
          actionVariant="primary"
          isLoading={votingId !== null}
        />
      </main>
    </div>
  );
}
