'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  Search, 
  ArrowLeft,
  Filter,
  FileText,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';

export default function TransparansiPage() {
  const [activeTab, setActiveTab] = useState<'legislasi' | 'sidang'>('legislasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [typeFilter, setTypeFilter] = useState('semua');

  const [legislasiList, setLegislasiList] = useState<any[]>([]);
  const [sidangList, setSidangList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const legRes = await fetch('/api/legislasi');
      const legData = await legRes.json();
      if (legRes.ok) setLegislasiList(legData);

      const sidangRes = await fetch('/api/sidang');
      const sidangData = await sidangRes.json();
      if (sidangRes.ok) setSidangList(sidangData);
    } catch (e) {
      console.error('Error fetching transparency data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Legislasi filtering logic
  const filteredLegislasi = legislasiList.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.nomor && item.nomor.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.isi_ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    const matchesType = typeFilter === 'semua' || item.jenis === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sidang filtering logic
  const filteredSidang = sidangList.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.agenda.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    const matchesType = typeFilter === 'semua' || item.jenis === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Types list for filters
  const legislasiTypes = ['semua', 'ad_art', 'gbhk', 'tata_tertib', 'peraturan', 'ketetapan', 'keputusan'];
  const legislasiStatuses = ['semua', 'diajukan', 'dibahas', 'direvisi', 'disahkan', 'diundangkan', 'ditolak'];
  
  const sidangTypes = ['semua', 'paripurna', 'komisi', 'dengar_pendapat', 'istimewa'];
  const sidangStatuses = ['semua', 'dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan'];

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
      <section className="relative py-16 overflow-hidden bg-slate-900/30 border-b border-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Portal Transparansi Publik
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
            Wujud komitmen DPM ITB Riau dalam transparansi organisasi. Akses semua informasi rancangan ketetapan, undang-undang mahasiswa, dan hasil sidang secara terbuka.
          </p>
        </div>
      </section>

      {/* Content Container */}
      <main className="container mx-auto px-4 py-12 flex-1 max-w-6xl">
        {/* Toggle & Search Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch justify-between mb-8">
          {/* Tab buttons */}
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => {
                setActiveTab('legislasi');
                setStatusFilter('semua');
                setTypeFilter('semua');
              }}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'legislasi'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Produk Legislasi
            </button>
            <button
              onClick={() => {
                setActiveTab('sidang');
                setStatusFilter('semua');
                setTypeFilter('semua');
              }}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'sidang'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Daftar Sidang DPM
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder={activeTab === 'legislasi' ? 'Cari judul, nomor, isi ringkasan...' : 'Cari judul sidang, lokasi, agenda...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 mb-10 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            FILTER:
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Jenis:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 capitalize"
            >
              {activeTab === 'legislasi' 
                ? legislasiTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))
                : sidangTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))
              }
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 capitalize"
            >
              {activeTab === 'legislasi' 
                ? legislasiStatuses.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))
                : sidangStatuses.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))
              }
            </select>
          </div>
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : activeTab === 'legislasi' ? (
          filteredLegislasi.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {filteredLegislasi.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="bg-slate-900/40 border-slate-800 hover:border-amber-500/20 transition-all duration-300 h-full flex flex-col justify-between">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.jenis.replace('_', ' ')}
                          </span>
                        </div>
                        {item.nomor && (
                          <span className="text-xs text-slate-500 font-mono">{item.nomor}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-white mb-2 line-clamp-2 hover:text-amber-500 transition-colors">
                        <Link href={`/transparansi/legislasi/${item.id}`}>
                          {item.judul}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed font-sans">
                        {item.isi_ringkasan}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {item.tags.map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <Separator className="bg-slate-800/60 my-4" />

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Diajukan: {formatDate(item.tanggal_diajukan)}</span>
                        <Link 
                          href={`/transparansi/legislasi/${item.id}`}
                          className="text-amber-500 hover:text-amber-400 font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">Tidak Ada Hasil</h3>
              <p className="text-xs text-slate-500">Tidak ada produk legislasi yang cocok dengan filter pencarian Anda.</p>
            </div>
          )
        ) : (
          filteredSidang.length > 0 ? (
            <div className="space-y-4">
              {filteredSidang.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-amber-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={item.status} />
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Sidang {item.jenis.replace('_', ' ')}
                      </span>
                      {item.komisi && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">
                          {item.komisi}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug">{item.judul}</h3>

                    <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(item.tanggal)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.waktu_mulai}{item.waktu_selesai ? ` - ${item.waktu_selesai}` : ''} WIB</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="max-w-[200px] truncate">{item.lokasi}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 justify-between md:justify-end">
                    {item.link_daring && item.status === 'berlangsung' && (
                      <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                        <a href={item.link_daring} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          Gabung Zoom <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    )}
                    {item.status === 'selesai' && item.notulensi && (
                      <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white bg-slate-900 border border-slate-880" onClick={() => {
                        alert(`Ringkasan Notulensi Sidang:\n\n${item.notulensi}`);
                      }}>
                        Lihat Notulen
                      </Button>
                    )}
                    <span className="text-[10px] text-slate-500">ID: {item.id}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">Tidak Ada Hasil</h3>
              <p className="text-xs text-slate-500">Tidak ada jadwal sidang yang cocok dengan filter pencarian Anda.</p>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-slate-500 text-xs text-center">
        <p>&copy; {new Date().getFullYear()} DPM ITB Riau. Portal Transparansi Publik.</p>
      </footer>
    </div>
  );
}
