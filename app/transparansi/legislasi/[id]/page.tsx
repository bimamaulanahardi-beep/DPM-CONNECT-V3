'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Share2,
  Tag,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Gavel,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockLegislasi } from '@/lib/mock-data/legislasi';
import { mockUsers } from '@/lib/mock-data/users';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: {
    id: string;
  };
}

export default function LegislasiDetailPage({ params }: PageProps) {
  const router = useRouter();
  const legislasi = mockLegislasi.find((l) => l.id === params.id);
  const pengaju = legislasi ? mockUsers.find((u) => u.id === legislasi.pengaju) : null;
  const approvedBy = legislasi && legislasi.approved_by ? mockUsers.find((u) => u.id === legislasi.approved_by) : null;

  if (!legislasi) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Dokumen Tidak Ditemukan</h2>
          <p className="text-slate-400 text-sm mb-6">Produk legislasi dengan ID tersebut tidak dapat ditemukan di database.</p>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
            <Link href="/transparansi">Kembali ke Portal</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Define steps of approval workflow based on status
  const workflowSteps = [
    { label: 'Diajukan', status: 'diajukan', date: legislasi.tanggal_diajukan },
    { label: 'Tahap Pembahasan', status: 'dibahas', date: null },
    { label: 'Penyusunan Draft Akhir', status: 'direvisi', date: null },
    { label: 'Disahkan', status: 'disahkan', date: legislasi.tanggal_disahkan || null },
    { label: 'Diundangkan', status: 'diundangkan', date: legislasi.tanggal_disahkan || null },
  ];

  // Map status index to active steps
  const statusOrder = ['diajukan', 'dibahas', 'direvisi', 'disahkan', 'diundangkan'];
  const currentStatusIndex = statusOrder.indexOf(legislasi.status);

  const handleDownload = () => {
    // Mock download PDF notice
    alert(`Mengunduh dokumen "${legislasi.judul}"...\nFormat: PDF (Mock)\nUkuran: 1.2 MB`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: legislasi.judul,
        text: legislasi.isi_ringkasan,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan halaman berhasil disalin ke clipboard!');
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
            href="/transparansi" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Info Area (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 sm:p-8"
            >
              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <StatusBadge status={legislasi.status} />
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {legislasi.jenis.replace('_', ' ')}
                </span>
                {legislasi.nomor && (
                  <span className="text-xs font-mono text-amber-500 font-semibold">{legislasi.nomor}</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
                {legislasi.judul}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Diajukan: {formatDate(legislasi.tanggal_diajukan)}</span>
                </div>
                {legislasi.tanggal_disahkan && (
                  <div className="flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-amber-500" />
                    <span>Disahkan: {formatDate(legislasi.tanggal_disahkan)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Revisi ke-{legislasi.revisi_ke}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {legislasi.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400 inline-flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <Separator className="bg-slate-800 my-6" />

              {/* Ringkasan */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Ringkasan Eksekutif
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-900 font-sans">
                  {legislasi.isi_ringkasan}
                </p>
              </div>

              {/* Full Content Preview (if any) */}
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  Isi Batang Tubuh Dokumen
                </h3>
                <div className="text-slate-400 text-xs sm:text-sm leading-relaxed p-6 bg-slate-950/20 border border-slate-900 rounded-xl max-h-[350px] overflow-y-auto scrollbar-thin select-text">
                  {legislasi.konten || (
                    <div className="text-center py-8">
                      <p className="text-slate-500 italic mb-4">Batang tubuh dokumen lengkap masih dalam tahap pemrosesan digital.</p>
                      <Button onClick={handleDownload} variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:text-white bg-slate-950">
                        <Download className="w-4 h-4 mr-2" /> Unduh Draf PDF
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Metadata (Right 1 col) */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase">Tindakan Dokumen</h3>
                  
                  <Button 
                    onClick={handleDownload} 
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
                  >
                    <Download className="w-4 h-4 mr-2" /> Unduh Dokumen PDF
                  </Button>

                  <Button 
                    onClick={handleShare} 
                    variant="outline" 
                    className="w-full border-slate-800 text-slate-300 hover:text-white bg-slate-950/50 hover:bg-slate-900"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Bagikan Dokumen
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Workflow Timeline Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase">Workflow Pengesahan</h3>
                  
                  <div className="relative border-l border-slate-800 ml-3 space-y-6">
                    {workflowSteps.map((step, idx) => {
                      const isActive = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;
                      return (
                        <div key={idx} className="relative pl-6">
                          {/* Bullet Icon */}
                          <div className={`absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                            isCurrent
                              ? 'bg-amber-500 border-amber-500 shadow-md shadow-amber-500/20 scale-110'
                              : isActive
                                ? 'bg-slate-950 border-emerald-500'
                                : 'bg-slate-950 border-slate-800'
                          }`} />
                          
                          <div className="space-y-1">
                            <h4 className={`text-xs font-bold leading-none ${
                              isCurrent 
                                ? 'text-amber-500' 
                                : isActive 
                                  ? 'text-slate-200' 
                                  : 'text-slate-600'
                            }`}>
                              {step.label}
                            </h4>
                            {step.date && isActive && (
                              <p className="text-[10px] text-slate-500">{formatDate(step.date)}</p>
                            )}
                            {isCurrent && (
                              <span className="inline-block text-[9px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mt-1.5">
                                Status Sekarang
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Author Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase">Pihak Pengusul</h3>
                  
                  {pengaju ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pengaju.avatar} alt={pengaju.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{pengaju.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-normal">{pengaju.jabatan}</p>
                        <p className="text-[9px] font-mono text-slate-500">{pengaju.prodi} - {pengaju.nim}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Pengusul: DPM ITB Riau</p>
                  )}

                  {approvedBy && (
                    <>
                      <Separator className="bg-slate-800/60 my-4" />
                      <h3 className="font-bold text-white text-sm tracking-wide uppercase">Disahkan Oleh</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={approvedBy.avatar} alt={approvedBy.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{approvedBy.name}</h4>
                          <p className="text-[9px] text-slate-400">{approvedBy.jabatan}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-slate-500 text-xs text-center">
        <p>&copy; {new Date().getFullYear()} DPM ITB Riau. Portal Transparansi Publik.</p>
      </footer>
    </div>
  );
}
