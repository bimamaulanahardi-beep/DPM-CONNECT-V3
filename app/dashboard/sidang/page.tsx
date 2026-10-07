'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  ChevronRight,
  BookOpen,
  Laptop,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { ExportButtons } from '@/components/common/export-buttons';
import { formatDate } from '@/lib/utils';

export default function SidangListPage() {
  const [sidangList, setSidangList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [jenisFilter, setJenisFilter] = useState('semua');

  const fetchSidang = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sidang');
      const data = await res.json();
      if (res.ok) {
        setSidangList(data);
      }
    } catch (e) {
      console.error('Error fetching sidang list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidang();
  }, []);

  const filteredSidang = sidangList.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    const matchesJenis = jenisFilter === 'semua' || item.jenis === jenisFilter;
    return matchesSearch && matchesStatus && matchesJenis;
  });

  const jenisList = ['semua', 'paripurna', 'komisi', 'dengar_pendapat', 'istimewa'];
  const statusList = [
    { value: 'semua', label: 'Semua Status' },
    { value: 'dijadwalkan', label: 'Dijadwalkan' },
    { value: 'berlangsung', label: 'Sedang Berlangsung' },
    { value: 'ditunda', label: 'Sedang Ditunda' },
    { value: 'selesai', label: 'Sidang Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Jadwal & Hasil Sidang</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Daftar sidang paripurna, sidang komisi, dan rapat dengar pendapat DPM.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <ExportButtons 
            data={filteredSidang} 
            filename="Laporan_Sidang_DPM" 
            columns={[
              { header: 'ID', dataKey: 'id' },
              { header: 'Judul', dataKey: 'judul' },
              { header: 'Jenis', dataKey: 'jenis' },
              { header: 'Komisi', dataKey: 'komisi' },
              { header: 'Tanggal', dataKey: 'tanggal' },
              { header: 'Lokasi', dataKey: 'lokasi' },
              { header: 'Status', dataKey: 'status' }
            ]} 
          />
          <Button 
            onClick={fetchSidang} 
            variant="outline" 
            className="border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-900 h-10"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shrink-0 h-10">
            <Link href="/dashboard/sidang/baru" className="flex items-center">
              <Plus className="w-4 h-4 mr-1.5" /> Buat Sidang Baru
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
            placeholder="Cari sidang berdasarkan judul atau lokasi..."
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
                <option key={type} value={type}>{type === 'semua' ? 'Semua Jenis' : type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-500"
            >
              {statusList.map(st => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sidang Cards Listing */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredSidang.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSidang.map((sidang, i) => (
            <div key={sidang.id}>
              <Card className="bg-slate-900/40 border-slate-880 hover:border-amber-500/20 transition-all duration-300 h-full flex flex-col justify-between">
                <CardContent className="p-6">
                  {/* Top line metadata */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={sidang.status} />
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {sidang.jenis.replace('_', ' ')}
                      </span>
                    </div>
                    {sidang.komisi && (
                      <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                        {sidang.komisi}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-base leading-snug mb-3 hover:text-amber-500 transition-colors">
                    <Link href={`/dashboard/sidang/${sidang.id}`}>
                      {sidang.judul}
                    </Link>
                  </h3>

                  {/* Date, Time, Location details */}
                  <div className="space-y-2 text-xs text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{formatDate(sidang.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{sidang.waktu_mulai}{sidang.waktu_selesai ? ` - ${sidang.waktu_selesai}` : ''} WIB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{sidang.lokasi}</span>
                    </div>
                  </div>

                  {/* Participant and Quorum info */}
                  {sidang.status !== 'dijadwalkan' && (
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60 flex items-center justify-between mb-6 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {sidang.peserta.length} Undangan
                      </span>
                      <span>Quorum: {sidang.quorum_achieved}% / {sidang.quorum_required}%</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-auto">
                    {sidang.link_daring && (sidang.status === 'berlangsung' || sidang.status === 'dijadwalkan') ? (
                      <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold h-8 text-[11px]">
                        <a href={sidang.link_daring} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          <Laptop className="w-3 h-3" /> Link Video
                        </a>
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">ID: {sidang.id}</span>
                    )}

                    <Button asChild variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 hover:bg-slate-900 text-xs font-bold h-8">
                      <Link href={`/dashboard/sidang/${sidang.id}`} className="flex items-center gap-1">
                        Akses Sidang <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Sidang Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">Tidak ada jadwal atau hasil sidang yang cocok dengan kriteria filter Anda.</p>
        </div>
      )}
    </div>
  );
}
