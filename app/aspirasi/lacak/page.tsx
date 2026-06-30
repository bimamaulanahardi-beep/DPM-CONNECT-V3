'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  ArrowLeft,
  Search,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';
import { AspirasiTimeline } from '@/components/common/timeline';

export default function LacakAspirasiPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setSearching(true);
    setSearchTriggered(false);
    try {
      const res = await fetch(`/api/aspirasi/${trackingCode.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setResult(null);
      }
    } catch (err) {
      console.error(err);
      setResult(null);
    } finally {
      setSearching(false);
      setSearchTriggered(true);
    }
  };

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
              <span className="text-xs text-slate-400 tracking-wider">ITB RIAU</span>
            </div>
          </Link>

          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Banner */}
      <section className="relative py-12 overflow-hidden bg-slate-900/30 border-b border-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Lacak Status Aspirasi Anda
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-sans">
            Masukkan kode tracking unik yang Anda dapatkan saat menyerahkan aspirasi untuk melihat riwayat peninjauan dan tindak lanjut.
          </p>
        </div>
      </section>

      {/* Search and Results Area */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          {/* Search Box */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Masukkan kode tracking (Contoh: ASP-XK72M9AB)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500 uppercase font-mono"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={searching}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shrink-0 px-6"
                >
                  {searching ? 'Mencari...' : 'Lacak Aspirasi'}
                </Button>
              </form>
              <div className="mt-4 text-xs text-slate-500 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5" />
                Tips demo: gunakan kode tracking aspirasi Anda (contoh: <strong>ASP-XK72M9AB</strong>) untuk memantau.
              </div>
            </CardContent>
          </Card>

          {/* Loading indicator */}
          {searching && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          )}

          {/* Results Container */}
          <AnimatePresence mode="wait">
            {searchTriggered && !searching && (
              result ? (
                <motion.div
                  key="result-found"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Status Summary */}
                  <Card className="bg-slate-900/40 border-slate-800 overflow-hidden">
                    <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center gap-4 flex-wrap">
                      <div className="font-mono">
                        <span className="text-[9px] text-slate-500 font-bold block">KODE TRACKING</span>
                        <span className="text-sm font-bold text-amber-500">{result.kode_tracking}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold capitalize mr-1">{result.kategori}</span>
                        <StatusBadge status={result.status} />
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-bold text-white leading-snug">{result.judul}</h2>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-900 p-4 rounded-xl font-sans whitespace-pre-wrap">
                        {result.deskripsi}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 font-sans">
                        <span>Tanggal Masuk: {formatDate(result.tanggal_masuk)}</span>
                        <span>&bull;</span>
                        <span>Update Terakhir: {formatDate(result.tanggal_update)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tracking Steps / Timeline */}
                  <Card className="bg-slate-900/40 border-slate-800">
                    <CardContent className="p-6 space-y-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Langkah Penanganan Advokasi</h3>
                      
                      <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                        <AspirasiTimeline 
                          timeline={result.timeline}
                          currentStatus={result.status}
                        />
                      </div>

                      {result.catatan_tindak_lanjut && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs rounded-xl space-y-1 leading-relaxed font-sans">
                          <strong className="block text-[10px] text-emerald-500 uppercase tracking-wide">Pernyataan DPM ITB Riau</strong>
                          <p>{result.catatan_tindak_lanjut}</p>
                          {result.petugas && (
                            <span className="block text-[9px] text-slate-500 mt-2 text-right">Moderator: {result.petugas}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="result-not-found"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <Card className="bg-slate-900/40 border-slate-800 py-12 text-center">
                    <CardContent className="space-y-3">
                      <AlertCircle className="w-12 h-12 text-red-500/60 mx-auto" />
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">Aspirasi Tidak Ditemukan</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                        Kode tracking "<strong>{trackingCode}</strong>" tidak terdaftar di sistem. Mohon periksa kembali ejaan kode Anda, pastikan menggunakan huruf besar.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-slate-500 text-xs text-center">
        <p>&copy; {new Date().getFullYear()} DPM ITB Riau. Layanan Advokasi & Aspirasi.</p>
      </footer>
    </div>
  );
}
