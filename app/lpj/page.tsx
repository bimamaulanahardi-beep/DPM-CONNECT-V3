'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  BookOpen, 
  Search, 
  Building, 
  User, 
  Calendar, 
  ChevronRight, 
  FileText, 
  Layers, 
  Download, 
  ExternalLink,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function PublicLPJPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lembagaFilter, setLembagaFilter] = useState('semua');

  const fetchLPJ = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lpj?public=true');
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch (err) {
      console.error('Error fetching LPJ list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLPJ();
  }, []);

  const filteredList = list.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.ketua.toLowerCase().includes(search.toLowerCase()) ||
      item.periode.toLowerCase().includes(search.toLowerCase()) ||
      item.ringkasan.toLowerCase().includes(search.toLowerCase());

    const matchLembaga = lembagaFilter === 'semua'
      ? true
      : item.lembaga.toLowerCase().includes(lembagaFilter.toLowerCase());

    return matchSearch && matchLembaga;
  });

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
            <Link href="/login">
              <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10">
                Portal Pengurus
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Hero Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Transparansi & Akuntabilitas KM ITB Riau
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Laporan Pertanggungjawaban (LPJ) Digital
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Pusat arsip dan keterbukaan informasi pertanggungjawaban kepengurusan DPM dan BEM ITB Riau setiap akhir periode kepengurusan.
          </p>

          {/* Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800 max-w-3xl mx-auto shadow-xl">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari laporan, periode, ketua..."
                className="pl-9 bg-slate-950/70 border-slate-800 text-xs text-white placeholder:text-slate-500 focus:border-gold-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'semua', label: 'Semua Lembaga' },
                { id: 'dpm', label: 'DPM ITB Riau' },
                { id: 'bem', label: 'BEM ITB Riau' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLembagaFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    lembagaFilter === tab.id
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Published LPJ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
            <p className="text-sm">Memuat arsip laporan pertanggungjawaban...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8 max-w-lg mx-auto">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">Tidak ada dokumen LPJ ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || lembagaFilter !== 'semua'
                ? 'Tidak ada laporan yang sesuai dengan filter pencarian.'
                : 'Dokumen LPJ resmi akan dipublikasikan di sini pada akhir periode kepengurusan masing-masing lembaga.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredList.map((item) => {
              const isDpm = item.lembaga.toLowerCase().includes('dpm');
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all"
                >
                  <div className="space-y-4">
                    {/* Badge header */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        isDpm
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        {item.lembaga}
                      </span>
                      <span className="text-xs font-mono font-semibold text-gold-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        Periode {item.periode}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white hover:text-gold-400 transition-colors">
                        {item.judul}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Ketua: <strong className="text-slate-300">{item.ketua}</strong>
                      </p>
                    </div>

                    {item.ringkasan && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                        {item.ringkasan}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Layers className="w-3.5 h-3.5 text-gold-400" />
                      <span>{item.sections?.length || 0} Bagian Laporan Dokumen Lengkap</span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Dokumen Terverifikasi
                    </span>
                    <Link href={`/lpj/${item.id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-gold-500/10">
                        <BookOpen className="w-3.5 h-3.5" />
                        Baca Dokumen Lengkap
                      </Button>
                    </Link>
                  </div>
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
