'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  ArrowLeft, 
  Vote, 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar, 
  AlertCircle, 
  LogIn, 
  BarChart3, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

export default function PublicReferendumPage() {
  const { data: session, status: authStatus } = useSession();
  const user = session?.user as any;

  const [referendums, setReferendums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'aktif' | 'selesai'>('aktif');

  // Voting state per referendum id
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [votingLoading, setVotingLoading] = useState<Record<string, boolean>>({});
  const [votingErrors, setVotingErrors] = useState<Record<string, string>>({});
  const [votingSuccess, setVotingSuccess] = useState<Record<string, string>>({});

  const fetchReferendums = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/referendum?public=true');
      if (res.ok) {
        const data = await res.json();
        setReferendums(data);
      }
    } catch (err) {
      console.error('Error fetching referendums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferendums();
  }, [session]);

  const handleSelectOption = (refId: string, option: string) => {
    setSelectedOptions(prev => ({ ...prev, [refId]: option }));
    setVotingErrors(prev => ({ ...prev, [refId]: '' }));
  };

  const handleVote = async (refId: string) => {
    const pilihan = selectedOptions[refId];
    if (!pilihan) {
      setVotingErrors(prev => ({ ...prev, [refId]: 'Pilihlah salah satu opsi sebelum mengirim suara.' }));
      return;
    }

    setVotingLoading(prev => ({ ...prev, [refId]: true }));
    setVotingErrors(prev => ({ ...prev, [refId]: '' }));

    try {
      const res = await fetch(`/api/referendum/${refId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilihan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan suara');
      }

      setVotingSuccess(prev => ({ ...prev, [refId]: `Suara Anda ("${pilihan}") berhasil dicatat!` }));
      // Refresh list to update counts and status
      fetchReferendums();
    } catch (err: any) {
      setVotingErrors(prev => ({ ...prev, [refId]: err.message || 'Terjadi kesalahan sistem' }));
    } finally {
      setVotingLoading(prev => ({ ...prev, [refId]: false }));
    }
  };

  const activeList = referendums.filter(r => r.status === 'aktif');
  const selesaiList = referendums.filter(r => r.status === 'selesai');
  const currentList = activeTab === 'aktif' ? activeList : selesaiList;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-gold-500/30 selection:text-gold-200">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="lg" />
            <div>
              <span className="font-bold text-lg leading-none block tracking-wide text-white group-hover:text-gold-400 transition-colors">
                DPM CONNECT
              </span>
              <span className="text-xs text-slate-400 font-medium">ITB RIAU</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            {session ? (
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/referendum">
                <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-1.5">
                  <LogIn className="w-4 h-4" />
                  Masuk dengan NIM
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Vote className="w-3.5 h-3.5" />
            Demokrasi & Jajak Pendapat Kampus
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Referendum Mahasiswa ITB Riau
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Salurkan hak suara Anda secara langsung pada penentuan kebijakan penting, isu kemahasiswaan, dan arah strategis kampus secara transparan dan akuntabel.
          </p>

          {/* User status alert */}
          {user ? (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Masuk sebagai: <strong className="text-white">{user.name}</strong> (NIM: <code className="text-gold-400">{user.nim}</code>)
            </div>
          ) : (
            <div className="mt-5 p-3.5 max-w-md mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Masuk dengan NIM Anda untuk memberikan suara.</span>
              </div>
              <Link href="/login?callbackUrl=/referendum">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-7 px-3">
                  Masuk
                </Button>
              </Link>
            </div>
          )}

          {/* Tab Selector */}
          <div className="mt-8 flex justify-center">
            <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl flex items-center gap-1 shadow-lg shadow-black/40">
              <button
                type="button"
                onClick={() => setActiveTab('aktif')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'aktif'
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Vote className="w-4 h-4" />
                Referendum Aktif ({activeList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('selesai')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'selesai'
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Hasil & Arsip Selesai ({selesaiList.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
            <p className="text-sm">Memuat daftar referendum mahasiswa...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <Vote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">
              {activeTab === 'aktif'
                ? 'Tidak ada referendum yang sedang berlangsung saat ini'
                : 'Belum ada arsip referendum yang selesai'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'aktif'
                ? 'DPM ITB Riau akan membuka referendum baru bila terdapat isu strategis yang membutuhkan keputusan bersama mahasiswa.'
                : 'Hasil referendum terdahulu akan diarsipkan di sini setelah masa pemungutan suara berakhir.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentList.map((ref) => {
              const totalSuara = ref.total_pemilih || 0;
              const hasVoted = ref.hasVoted;
              const isSelectedOption = selectedOptions[ref.id];
              const isVoting = votingLoading[ref.id];
              const err = votingErrors[ref.id];
              const succ = votingSuccess[ref.id];

              return (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl transition-all"
                >
                  {/* Header Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
                          Oleh {ref.created_by}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {ref.tanggal_mulai} s/d {ref.tanggal_selesai}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {ref.judul}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300">
                        <Users className="w-3.5 h-3.5 text-gold-400" />
                        <span><strong>{totalSuara}</strong> Mahasiswa Memilih</span>
                      </div>
                      <StatusBadge status={ref.status} />
                    </div>
                  </div>

                  {/* Deskripsi Isu */}
                  {ref.deskripsi && (
                    <div className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                      {ref.deskripsi}
                    </div>
                  )}

                  {/* Pertanyaan Utama */}
                  <div className="bg-slate-950 border border-gold-500/20 rounded-xl p-5 mb-6">
                    <span className="text-xs font-bold text-gold-400 uppercase tracking-wider block mb-1.5">
                      Pertanyaan Referendum:
                    </span>
                    <p className="text-base font-semibold text-white">
                      "{ref.pertanyaan}"
                    </p>
                  </div>

                  {/* Feedback Messages */}
                  {err && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  )}
                  {succ && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{succ}</span>
                    </div>
                  )}

                  {/* Kondisi 1: Sudah Vote ATAU Referendum Telah Selesai -> Tampilkan Hasil Diagram */}
                  {hasVoted || ref.status === 'selesai' ? (
                    <div className="space-y-4">
                      {hasVoted && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Anda telah memberikan suara untuk referendum ini.
                          </span>
                          {ref.myVote && (
                            <span className="font-bold bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30">
                              Pilihan Anda: {ref.myVote}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                          <span>Perolehan Suara Real-time:</span>
                          <span>Total Partisipasi: {totalSuara} Suara</span>
                        </div>

                        {ref.opsi.map((opt: string) => {
                          const count = ref.voteCounts?.[opt] || 0;
                          const percentage = totalSuara > 0 ? Math.round((count / totalSuara) * 100) : 0;
                          const isMyChoice = ref.myVote === opt;

                          return (
                            <div key={opt} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-white flex items-center gap-2">
                                  {opt}
                                  {isMyChoice && (
                                    <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded font-bold border border-gold-500/30">
                                      Pilihan Anda
                                    </span>
                                  )}
                                </span>
                                <span className="text-slate-300 font-mono font-bold">
                                  {count} suara ({percentage}%)
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    isMyChoice
                                      ? 'bg-gradient-to-r from-gold-500 to-amber-500'
                                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Kondisi 2: Belum Vote & Status Aktif */
                    <div>
                      {user ? (
                        <div className="space-y-4">
                          <span className="text-xs font-semibold text-slate-400 block">
                            Tentukan Pilihan Anda:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ref.opsi.map((opt: string) => {
                              const isSelected = selectedOptions[ref.id] === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleSelectOption(ref.id, opt)}
                                  className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-gold-500/10 border-gold-500 text-white shadow-md shadow-gold-500/10'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                                  }`}
                                >
                                  <span className="font-semibold text-sm">{opt}</span>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? 'border-gold-400 bg-gold-500 text-slate-950'
                                      : 'border-slate-700'
                                  }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                            <span className="text-[11px] text-slate-500">
                              Hak suara hanya dapat diberikan 1 kali dan tidak dapat diubah setelah dikirim.
                            </span>
                            <Button
                              onClick={() => handleVote(ref.id)}
                              disabled={isVoting || !selectedOptions[ref.id]}
                              className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-bold px-6 gap-2"
                            >
                              {isVoting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Mengirimkan...
                                </>
                              ) : (
                                <>
                                  <Vote className="w-4 h-4" />
                                  Kirim Pilihan Saya
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 text-center">
                          <p className="text-xs text-slate-400 mb-3">
                            Setiap mahasiswa aktif ITB Riau berhak memberikan 1 suara untuk referendum ini.
                          </p>
                          <Link href="/login?callbackUrl=/referendum">
                            <Button className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-xs gap-2">
                              <LogIn className="w-4 h-4" />
                              Masuk dengan Akun Kampus untuk Memberi Suara
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} DPM ITB Riau — Dewan Perwakilan Mahasiswa Institut Teknologi & Bisnis Riau</p>
      </footer>
    </div>
  );
}
