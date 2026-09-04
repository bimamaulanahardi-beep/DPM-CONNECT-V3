'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Printer, 
  Share2, 
  BookOpen, 
  Building, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';

export default function DetailPublicLPJPage() {
  const params = useParams();
  const id = params?.id as string;

  const [lpj, setLpj] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lpj/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLpj(data);
          if (data.sections && data.sections.length > 0) {
            setActiveSection(data.sections[0].id);
          }
        } else {
          setErrorMsg('Dokumen LPJ tidak ditemukan atau belum diterbitkan.');
        }
      } catch (err) {
        setErrorMsg('Gagal memuat dokumen LPJ.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: lpj?.judul || 'Laporan Pertanggungjawaban ITB Riau',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan dokumen berhasil disalin ke clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
        <p className="text-sm text-slate-400">Memuat naskah dokumen LPJ...</p>
      </div>
    );
  }

  if (!lpj) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-white">Dokumen Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
          {errorMsg || 'Dokumen yang Anda cari tidak tersedia.'}
        </p>
        <Link href="/lpj" className="mt-4">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Arsip LPJ
          </Button>
        </Link>
      </div>
    );
  }

  const isDpm = lpj.lembaga?.toLowerCase().includes('dpm');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
      {/* Non-print Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 print:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/lpj">
              <Button size="icon" variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="hidden sm:block">
              <span className="font-bold text-sm text-white truncate max-w-md block">
                {lpj.judul}
              </span>
              <span className="text-[11px] text-slate-400">
                {lpj.lembaga} — Periode {lpj.periode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs gap-1.5 h-8"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-xs gap-1.5 h-8 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Document Layout */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Table of Contents (Sticky on Desktop) */}
          <div className="hidden lg:block lg:col-span-1 print:hidden">
            <div className="sticky top-20 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold-400" />
                Daftar Isi Dokumen
              </h3>
              <nav className="space-y-1 text-xs">
                <a
                  href="#ringkasan"
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors truncate"
                >
                  • Ringkasan Eksekutif
                </a>
                {lpj.sections && lpj.sections.map((sec: any, idx: number) => (
                  <a
                    key={sec.id || idx}
                    href={`#sec-${sec.id || idx}`}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors truncate"
                  >
                    • {sec.judul}
                  </a>
                ))}
              </nav>

              <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500">
                <p>Status: <strong className="text-emerald-400">Resmi Diterbitkan</strong></p>
                <p className="mt-1">Format: Dokumen Digital Transparansi</p>
              </div>
            </div>
          </div>

          {/* Right: Document Content (Paper-like Card) */}
          <div className="lg:col-span-3 space-y-8">
            <article className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 md:p-10 shadow-2xl space-y-8 print:border-none print:shadow-none print:p-0 print:bg-transparent">
              {/* Document Header / Kop Surat */}
              <div className="border-b border-slate-800 print:border-black pb-6 space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider print:text-black">
                  {lpj.lembaga}
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white print:text-black tracking-tight max-w-2xl mx-auto">
                  {lpj.judul}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 print:text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-400 print:text-black" />
                    Periode Kepengurusan: <strong>{lpj.periode}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-400 print:text-black" />
                    Ketua Lembaga: <strong>{lpj.ketua}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 print:text-black font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Disahkan
                  </span>
                </div>
              </div>

              {/* Ringkasan Eksekutif */}
              {lpj.ringkasan && (
                <section id="ringkasan" className="space-y-3 scroll-mt-24">
                  <h2 className="text-sm font-bold text-gold-400 uppercase tracking-wider border-l-2 border-gold-400 pl-3 print:text-black">
                    Ringkasan Eksekutif
                  </h2>
                  <div className="bg-slate-950/60 print:bg-gray-100 p-5 rounded-xl border border-slate-800 print:border-gray-300 text-sm text-slate-200 print:text-black leading-relaxed whitespace-pre-wrap">
                    {lpj.ringkasan}
                  </div>
                </section>
              )}

              {/* Sections / Bagian-bagian LPJ */}
              <div className="space-y-8">
                {lpj.sections && lpj.sections.map((sec: any, idx: number) => (
                  <section
                    key={sec.id || idx}
                    id={`sec-${sec.id || idx}`}
                    className="space-y-3 scroll-mt-24 pt-2 border-t border-slate-800/60 print:border-gray-300"
                  >
                    <h2 className="text-base font-bold text-white print:text-black flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gold-500/20 text-gold-400 print:bg-gray-200 print:text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      {sec.judul}
                    </h2>
                    <div className="text-sm text-slate-300 print:text-black leading-relaxed whitespace-pre-wrap pl-8">
                      {sec.konten}
                    </div>
                  </section>
                ))}
              </div>

              {/* Document Sign-off */}
              <div className="border-t border-slate-800 print:border-black pt-8 mt-12 grid grid-cols-2 text-center text-xs text-slate-400 print:text-black">
                <div className="space-y-12">
                  <p>Mengetahui,<br/><strong>{lpj.lembaga}</strong></p>
                  <p className="font-bold text-white print:text-black underline">{lpj.ketua}</p>
                </div>
                <div className="space-y-12">
                  <p>DPM ITB Riau<br/><strong>Badan Pengawas & Legislasi</strong></p>
                  <p className="font-bold text-white print:text-black underline">Ketua DPM ITB Riau</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 print:hidden">
        <p>© {new Date().getFullYear()} DPM ITB Riau — Arsip Dokumen Transparansi Publik</p>
      </footer>
    </div>
  );
}
