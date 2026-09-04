'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Vote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';
import { Logo } from '@/components/common/logo';
import { motion } from 'framer-motion';

export default function PublicPemiraListPage() {
  const [pemiraList, setPemiraList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/publik/pemira');
        if (res.ok) {
          const data = await res.json();
          setPemiraList(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-bold text-white tracking-wide">DPM CONNECT</span>
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Vote className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Portal Pemilu Raya</h1>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Pilih event pemilihan mahasiswa yang sedang aktif di bawah ini untuk menyalurkan hak suara Anda. Suara Anda menentukan masa depan kampus.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : pemiraList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pemiraList.map((pemira, i) => (
              <motion.div key={pemira.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-slate-900/40 border-slate-800 hover:border-amber-500/50 transition-all flex flex-col h-full">
                  <CardHeader className="pb-3 border-b border-slate-800/50">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <StatusBadge status={pemira.status} />
                        <CardTitle className="text-lg font-bold text-white mt-2 leading-snug">
                          {pemira.judul}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col">
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 flex-1">{pemira.deskripsi}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold mb-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                      <div>
                        <span className="block text-slate-600 mb-1">DIBUKA</span>
                        <span className="text-white">{formatDate(pemira.tanggal_mulai)}</span>
                      </div>
                      <div>
                        <span className="block text-slate-600 mb-1">DITUTUP</span>
                        <span className="text-white">{formatDate(pemira.tanggal_selesai)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/50">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Users className="w-4 h-4 text-blue-500" /> {pemira._count?.candidates || 0} Paslon
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Vote className="w-4 h-4 text-emerald-500" /> {pemira._count?.records || 0} Suara
                        </span>
                      </div>
                      {pemira.status === 'aktif' ? (
                        <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold">
                          <Link href={`/pemira/${pemira.id}`}>Ikut Memilih</Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          <Link href={`/pemira/${pemira.id}`}>Lihat Hasil</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <Vote className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-1">Tidak Ada Pemilu Raya Aktif</h3>
            <p className="text-xs text-slate-500">Saat ini tidak ada event pemilihan raya yang sedang berlangsung.</p>
          </div>
        )}
      </main>
    </div>
  );
}
