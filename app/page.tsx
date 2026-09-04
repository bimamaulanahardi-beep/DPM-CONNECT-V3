'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  MessageSquareText, 
  FileCheck2, 
  Search, 
  ChevronRight, 
  Vote, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Users2,
  CalendarDays,
  Menu,
  X,
  FileText,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    sidangTerlaksana: 0,
    produkLegislasi: 0,
    aspirasiMasuk: 0,
    tindakLanjut: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/publik/stats');
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (e) {
        console.error('Error fetching public stats:', e);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Sidang Terlaksana', value: statsData.sidangTerlaksana.toString(), desc: 'Sidang paripurna & komisi' },
    { label: 'Produk Legislasi', value: statsData.produkLegislasi.toString(), desc: 'RUU & Tap DPM disahkan' },
    { label: 'Aspirasi Masuk', value: statsData.aspirasiMasuk.toString(), desc: 'Dari seluruh mahasiswa' },
    { label: 'Tindak Lanjut', value: statsData.tindakLanjut.toString(), desc: 'Penyelesaian aspirasi' },
  ];

  const komisiList = [
    {
      nama: 'Komisi I',
      bidang: 'Hukum & Legislasi',
      deskripsi: 'Merumuskan, membahas, dan merevisi peraturan kemahasiswaan serta tata tertib di lingkungan kampus.',
      icon: FileCheck2,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400'
    },
    {
      nama: 'Komisi II',
      bidang: 'Anggaran & Pengawasan',
      deskripsi: 'Mengawasi kinerja BEM dan organisasi kemahasiswaan serta mengaudit pengelolaan dana kemahasiswaan.',
      icon: ShieldCheck,
      color: 'from-amber-500/20 to-amber-500/20 text-amber-500'
    },
    {
      nama: 'Komisi III',
      bidang: 'Aspirasi & Hubungan Mahasiswa',
      deskripsi: 'Menyerap aspirasi, menindaklanjuti keluhan mahasiswa, dan menjadi jembatan penghubung dengan institusi.',
      icon: MessageSquareText,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400'
    }
  ];

  const workflow = [
    { step: '01', title: 'Kirim Aspirasi', desc: 'Isi form aspirasi publik secara anonim atau dengan identitas lengkap.' },
    { step: '02', title: 'Verifikasi & Kategori', desc: 'Komisi III melakukan peninjauan awal dan mengkategorikan aspirasi.' },
    { step: '03', title: 'Koordinasi Tindak Lanjut', desc: 'DPM berkoordinasi dengan pihak terkait (BEM/Rektorat) untuk penyelesaian.' },
    { step: '04', title: 'Selesai & Lacak', desc: 'Pantau kemajuan tindak lanjut secara langsung menggunakan kode tracking.' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="lg" className="group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-bold text-lg leading-none block tracking-wide text-white group-hover:text-amber-400 transition-colors">
                DPM CONNECT
              </span>
              <span className="text-xs text-slate-400 tracking-wider">ITB RIAU</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/transparansi" className="text-slate-300 hover:text-amber-400 transition-colors">
              Transparansi
            </Link>
            <Link href="/aspirasi" className="text-slate-300 hover:text-amber-400 transition-colors">
              Kirim Aspirasi
            </Link>
            <Link href="/aspirasi/lacak" className="text-slate-300 hover:text-amber-400 transition-colors">
              Lacak Aspirasi
            </Link>
            <Link href="/lpj" className="text-slate-300 hover:text-amber-400 transition-colors">
              Laporan LPJ
            </Link>
            <Link href="/pemira" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors">
              <Vote className="w-4 h-4" /> E-Voting Pemira
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-semibold shadow-lg shadow-amber-500/20">
              <Link href="/login">Portal Anggota</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 py-6 px-4 flex flex-col gap-4 shadow-xl"
          >
            <Link 
              href="/transparansi" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-amber-400 py-2 border-b border-slate-900"
            >
              Transparansi
            </Link>
            <Link 
              href="/aspirasi" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-amber-400 py-2 border-b border-slate-900"
            >
              Kirim Aspirasi
            </Link>
            <Link 
              href="/aspirasi/lacak" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-amber-400 py-2 border-b border-slate-900"
            >
              Lacak Aspirasi
            </Link>
            <Link 
              href="/lpj" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-amber-400 py-2 border-b border-slate-900"
            >
              Laporan LPJ
            </Link>
            <Link 
              href="/pemira" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-amber-400 font-bold py-2 border-b border-slate-900"
            >
              <Vote className="w-4 h-4" /> E-Voting Pemira
            </Link>
            <div className="flex flex-col gap-3 pt-4">
              <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-semibold w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Portal Anggota</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden flex-1 flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-amber-400 font-semibold tracking-wide mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            PLATFORM PARLEMEN MAHASISWA MODERN V3.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
          >
            Menghubungkan Suara Mahasiswa, <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Mewujudkan Transparansi Nyata
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            DPM Connect adalah pusat informasi legislasi, pengawasan, dan wadah aspirasi resmi mahasiswa ITB Riau. Bersama kita bangun kampus yang demokratis, inklusif, dan akuntabel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4"
          >
            <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 border border-blue-400/20">
              <Link href="/pemira" className="flex items-center gap-2">
                <Vote className="w-5 h-5" /> Masuk Bilik Suara Pemira
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold px-8 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300">
              <Link href="/aspirasi" className="flex items-center gap-2">
                Aspirasikan Suaramu <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-900 bg-slate-950/40 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-200 mb-1">{stat.label}</div>
                <div className="text-xs text-slate-500">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Komisi Section */}
      <section className="py-24 bg-slate-950 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Kenali Komisi DPM</h2>
            <p className="text-slate-400">
              DPM ITB Riau terbagi menjadi 3 Komisi utama yang berfokus melayani kepentingan legislasi, pengawasan, dan advokasi mahasiswa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {komisiList.map((komisi, i) => {
              const Icon = komisi.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 hover:border-amber-500/20 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${komisi.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{komisi.nama}</h3>
                  <div className="text-sm text-amber-500 font-semibold mb-4">{komisi.bidang}</div>
                  <p className="text-sm text-slate-400 leading-relaxed">{komisi.deskripsi}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 border-t border-slate-900 bg-slate-950/20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Alur Aspirasi Mahasiswa</h2>
            <p className="text-slate-400">
              Bagaimana aspirasi yang Anda berikan diproses oleh DPM untuk menghasilkan perubahan nyata di kampus.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {workflow.map((flow, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center p-4"
              >
                <div className="text-6xl font-black text-slate-800/20 mb-4 select-none absolute -top-8 left-4 sm:-top-10 sm:left-6">
                  {flow.step}
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-bold mb-4 z-10 shadow-lg">
                  {i + 1}
                </div>
                <h3 className="font-bold text-white mb-2 z-10">{flow.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed z-10">{flow.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold px-8 shadow-lg shadow-amber-500/20">
              <Link href="/aspirasi" className="flex items-center gap-2">
                Kirim Aspirasi Sekarang <MessageSquareText className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-900 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Punya Keluhan atau Saran?
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Setiap aspirasi sangat berharga untuk perbaikan kualitas layanan akademik, fasilitas, dan kemahasiswaan ITB Riau. Kirimkan aspirasimu hari ini secara aman dan tertutup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold px-8">
              <Link href="/aspirasi" className="flex items-center gap-2">
                Kirim Aspirasi <MessageSquareText className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-slate-800 text-slate-300 hover:text-white bg-transparent hover:bg-slate-900 px-8">
              <Link href="/aspirasi/lacak" className="flex items-center gap-2">
                Lacak Status Aspirasimu <CheckCircle className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-500 text-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Logo size="sm" />
                <span className="font-bold text-white tracking-wide">DPM CONNECT</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
                Dewan Perwakilan Mahasiswa Institut Teknologi dan Bisnis (ITB) Riau. Lembaga legislatif mahasiswa tertinggi di tingkat institusi.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Navigasi</h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><Link href="/transparansi" className="hover:text-amber-400 transition-colors">Transparansi Publik</Link></li>
                <li><Link href="/aspirasi" className="hover:text-amber-400 transition-colors">Kirim Aspirasi</Link></li>
                <li><Link href="/aspirasi/lacak" className="hover:text-amber-400 transition-colors">Lacak Status</Link></li>
                <li><Link href="/lpj" className="hover:text-amber-400 transition-colors">Laporan LPJ</Link></li>
                <li><Link href="/pemira" className="hover:text-amber-400 transition-colors">E-Voting Pemira</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Kontak Kami</h4>
              <ul className="flex flex-col gap-2 text-xs text-slate-400">
                <li>Email: dpmitbriau@gmail.com</li>
                <li>Gedung Kemahasiswaan Lt. 2</li>
                <li>Pekanbaru, Riau, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col items-center justify-between gap-2 sm:flex-row text-xs">
            <p>&copy; {new Date().getFullYear()} DPM ITB Riau. All rights reserved.</p>
            <div className="text-center sm:text-right">
              <p className="text-slate-600">Built with Next.js 14 & Tailwind CSS - Version 3.0</p>
              <p className="text-slate-500 mt-1">By : ZeroniX Digital Studio</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
