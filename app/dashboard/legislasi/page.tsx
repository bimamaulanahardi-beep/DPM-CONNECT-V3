'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  ChevronRight,
  BookOpen,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';

export default function LegislasiListPage() {
  const [legislasiList, setLegislasiList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [jenisFilter, setJenisFilter] = useState('semua');

  const fetchData = async () => {
    setLoading(true);
    try {
      const legRes = await fetch('/api/legislasi');
      const legData = await legRes.json();

      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();

      if (legRes.ok) setLegislasiList(legData);
      if (usersRes.ok) setUsers(usersData);
    } catch (e) {
      console.error('Error fetching legislasi list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLegislasi = legislasiList.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.isi_ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    const matchesJenis = jenisFilter === 'semua' || item.jenis === jenisFilter;
    return matchesSearch && matchesStatus && matchesJenis;
  });

  const jenisList = ['semua', 'ad_art', 'gbhk', 'tata_tertib', 'peraturan', 'ketetapan', 'keputusan'];
  const statusList = ['semua', 'diajukan', 'dibahas', 'direvisi', 'disahkan', 'diundangkan', 'ditolak'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Produk Legislasi & RUU</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Kelola dan pantau rancangan peraturan mahasiswa (RUU) dan ketetapan DPM.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchData} 
            variant="outline" 
            className="border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-900 h-10"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shrink-0">
            <Link href="/dashboard/legislasi/baru" className="flex items-center">
              <Plus className="w-4 h-4 mr-1.5" /> Usulkan Legislasi Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Cari draf RUU berdasarkan judul atau konten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Jenis:</span>
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-500 capitalize"
            >
              {jenisList.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-500 capitalize"
            >
              {statusList.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredLegislasi.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLegislasi.map((item, i) => {
            const pengajuUser = users.find(u => u.id === item.pengaju);
            return (
              <div key={item.id}>
                <Card className="bg-slate-900/40 border-slate-800 hover:border-amber-500/20 transition-all duration-300 h-full flex flex-col justify-between">
                  <CardContent className="p-6">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.jenis.replace('_', ' ')}
                        </span>
                      </div>
                      {item.nomor && (
                        <span className="text-[10px] text-slate-500 font-mono">{item.nomor}</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-white text-base leading-snug mb-2 line-clamp-2 hover:text-amber-500 transition-colors">
                      <Link href={`/dashboard/legislasi/${item.id}`}>
                        {item.judul}
                      </Link>
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed font-sans">
                      {item.isi_ringkasan}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {item.tags.map((tag: string) => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-auto">
                      <div className="flex items-center gap-2">
                        {pengajuUser ? (
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-850 shrink-0 border border-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={pengajuUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pengajuUser.name}`} alt={pengajuUser.name} className="w-full h-full object-cover" />
                          </div>
                        ) : null}
                        <div>
                          <span className="text-[10px] text-slate-500 block leading-none">Diusulkan Oleh</span>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{pengajuUser?.name || 'Anggota Dewan'}</span>
                        </div>
                      </div>

                      <Button asChild variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 hover:bg-slate-900 text-xs font-bold h-8">
                        <Link href={`/dashboard/legislasi/${item.id}`} className="flex items-center gap-1">
                          Akses Draf <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Draf RUU Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">Tidak ada produk legislasi atau draf RUU yang cocok dengan kriteria filter Anda.</p>
        </div>
      )}
    </div>
  );
}
