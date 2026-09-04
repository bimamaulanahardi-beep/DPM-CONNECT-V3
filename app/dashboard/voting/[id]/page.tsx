'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  AlertTriangle,
  Users,
  Vote as VoteIcon,
  Loader2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function VotingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [vote, setVote] = useState<any>(null);
  const [sidang, setSidang] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [userSelection, setUserSelection] = useState<string | null>(null);
  const [results, setResults] = useState({ setuju: 0, tidak_setuju: 0, abstain: 0, total: 0 });

  const fetchData = async () => {
    try {
      const voteRes = await fetch(`/api/voting/${params.id}`);
      const voteData = await voteRes.json();

      if (voteRes.ok) {
        setVote(voteData);
        setResults(voteData.hasil);
        setHasVoted(voteData.has_voted || false); // Sinkronisasi dengan database backend
        
        if (voteData.sidang_id) {
          const sidangRes = await fetch(`/api/sidang/${voteData.sidang_id}`);
          const sidangData = await sidangRes.json();
          if (sidangRes.ok) {
            setSidang(sidangData);
          }
        }
      }
    } catch (e) {
      console.error('Error loading voting details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!vote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500/60 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sesi Voting Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mb-6">Voting dengan ID tersebut tidak dapat ditemukan.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <Link href="/dashboard/voting">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  const handleVote = async (option: 'setuju' | 'tidak_setuju' | 'abstain') => {
    try {
      const res = await fetch(`/api/voting/${params.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pilihan: option }),
      });

      const updatedVote = await res.json();
      if (res.ok) {
        setUserSelection(option);
        setHasVoted(true);
        setVote(updatedVote);
        setResults(updatedVote.hasil);
        toast({
          title: 'Suara Anda Disimpan',
          description: `Anda berhasil memilih: ${option.toUpperCase().replace('_', ' ')}.`,
        });
      } else {
        toast({
          title: 'Gagal Memilih',
          description: updatedVote.error || 'Terjadi kesalahan.',
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
    }
  };

  // Pie chart data formatting
  const chartData = [
    { name: 'Setuju', value: results.setuju, color: '#10b981' },
    { name: 'Tolak', value: results.tidak_setuju, color: '#ef4444' },
    { name: 'Abstain', value: results.abstain, color: '#64748b' },
  ].filter(item => item.value > 0);

  // If no one voted yet, add dummy entries for render
  const safeChartData = chartData.length > 0 ? chartData : [
    { name: 'Belum Ada Suara', value: 1, color: '#1e293b' }
  ];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/voting" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Voting
      </Link>

      {/* Meta Info banner */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <StatusBadge status={vote.status === 'aktif' && hasVoted ? 'selesai' : vote.status} />
          <span className="text-xs font-mono text-slate-500">PEMILU EKSPRES DPM</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-snug mb-3">{vote.judul}</h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mb-4 font-sans">{vote.deskripsi}</p>
        
        {sidang && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Agenda Sidang:</span>
            <span className="font-bold text-slate-350">{sidang.judul}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Area (Live voting or Results) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 sm:p-8">
              
              <AnimatePresence mode="wait">
                {vote.status === 'aktif' && !hasVoted ? (
                  <motion.div
                    key="active-voting-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="text-center max-w-md mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500 mb-2">
                        <VoteIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">Salurkan Hak Suara Anda</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Pilihan Anda bersifat rahasia dan sah secara hukum tata tertib organisasi mahasiswa ITB Riau.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleVote('setuju')}
                        className="p-6 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/35 rounded-2xl text-center space-y-3 group transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform font-bold text-sm">
                          Setuju
                        </div>
                        <span className="text-xs font-bold text-slate-400 block">SETUJU (YEA)</span>
                      </button>

                      <button
                        onClick={() => handleVote('tidak_setuju')}
                        className="p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/35 rounded-2xl text-center space-y-3 group transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform font-bold text-sm">
                          Tolak
                        </div>
                        <span className="text-xs font-bold text-slate-400 block">TOLAK (NAY)</span>
                      </button>

                      <button
                        onClick={() => handleVote('abstain')}
                        className="p-6 bg-slate-800/20 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl text-center space-y-3 group transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-950 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform font-bold text-sm">
                          Abstain
                        </div>
                        <span className="text-xs font-bold text-slate-400 block">ABSTAIN (NV)</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                  >
                    {/* Recharts Pie Chart */}
                    <div className="h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={safeChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {safeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                            itemStyle={{ color: '#fff', fontSize: 11 }}
                          />
                          <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[11px] text-slate-400 font-bold">{value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 text-center">
                        <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Total</span>
                        <span className="text-2xl font-black text-white block leading-none mt-1">
                          {results.total}
                        </span>
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rincian Hasil</h4>
                      
                      <div className="space-y-2.5">
                        <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">Setuju</span>
                          <span className="text-sm font-black text-emerald-500">{results.setuju} Suara</span>
                        </div>

                        <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">Tolak</span>
                          <span className="text-sm font-black text-red-500">{results.tidak_setuju} Suara</span>
                        </div>

                        <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">Abstain</span>
                          <span className="text-sm font-black text-slate-400">{results.abstain} Suara</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </CardContent>
          </Card>
        </div>

        {/* Right Panel (Metadata & Quorum) */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-white text-xs tracking-wide uppercase">Ketentuan Suara</h3>
              
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed font-sans">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                  <span>Jenis Voting</span>
                  <span className="font-bold text-white capitalize">{vote.jenis}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                  <span>Target Quorum</span>
                  <span className="font-bold text-white">{vote.quorum_required}% Pemilih</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Partisipasi Real-time</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {results.total} Anggota
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
