'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  BookOpen, 
  Building, 
  User, 
  Calendar, 
  Layers, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

export default function DashboardLPJPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  const fetchLPJList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lpj');
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch (err) {
      console.error('Error fetching LPJ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLPJList();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen LPJ ini?')) return;

    try {
      const res = await fetch(`/api/lpj/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLPJList();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert('Gagal menghapus');
    }
  };

  const filteredList = list.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.lembaga.toLowerCase().includes(search.toLowerCase()) ||
      item.ketua.toLowerCase().includes(search.toLowerCase()) ||
      item.periode.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'semua' ? true : item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = list.length;
  const diterbitkan = list.filter(l => l.status === 'diterbitkan').length;
  const draft = list.filter(l => l.status === 'draft').length;

  const canManage = user && ['admin', 'pimpinan', 'ketua_komisi', 'anggota', 'bem'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-gold-400" />
            Laporan Pertanggungjawaban (LPJ)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola, susun, dan terbitkan naskah pertanggungjawaban kepengurusan DPM dan BEM ITB Riau secara digital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLPJList}
            disabled={loading}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/lpj" target="_blank">
            <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Laman Publik
            </Button>
          </Link>
          {canManage && (
            <Link href="/dashboard/lpj/baru">
              <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-1.5">
                <Plus className="w-4 h-4" />
                Buat Dokumen LPJ
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Dokumen LPJ</p>
              <p className="text-2xl font-bold text-white mt-1">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">Telah Diterbitkan (Publik)</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{diterbitkan}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400">Draf / Belum Terbit</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{draft}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari naskah LPJ, lembaga, ketua..."
            className="pl-9 bg-slate-950/60 border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-gold-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'semua', label: 'Semua Status' },
            { id: 'diterbitkan', label: 'Diterbitkan' },
            { id: 'draft', label: 'Draf Internal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-gold-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
          <p className="text-sm">Memuat daftar laporan pertanggungjawaban...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Tidak ada dokumen LPJ ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'semua'
              ? 'Tidak ada laporan yang cocok dengan kriteria pencarian Anda.'
              : 'Belum ada dokumen LPJ yang disimpan.'}
          </p>
          {canManage && !search && statusFilter === 'semua' && (
            <Link href="/dashboard/lpj/baru" className="mt-4 inline-block">
              <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-1.5">
                <Plus className="w-4 h-4" />
                Buat Dokumen LPJ Pertama
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.lembaga.toLowerCase().includes('dpm')
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    {item.lembaga}
                  </span>
                  <span className="text-xs font-mono font-semibold text-gold-400">
                    Periode {item.periode}
                  </span>
                  <span className="text-slate-600">•</span>
                  <StatusBadge status={item.status} />
                </div>

                <h3 className="text-base font-bold text-white truncate">
                  {item.judul}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Ketua: {item.ketua}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    {item.sections?.length || 0} Bagian Dokumen
                  </span>
                  <span className="text-slate-500">
                    Dibuat oleh: {item.created_by}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <Link href={`/lpj/${item.id}`} target="_blank">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 bg-slate-950 text-slate-300 hover:text-white text-xs gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Buka Publik
                  </Button>
                </Link>

                <Link href={`/dashboard/lpj/${item.id}`}>
                  <Button
                    size="sm"
                    className="bg-slate-800 hover:bg-gold-500 hover:text-slate-950 text-slate-200 font-semibold gap-1.5 border border-slate-700 hover:border-gold-500 transition-colors text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Kelola Naskah
                  </Button>
                </Link>

                {(user?.role === 'admin' || user?.role === 'pimpinan') && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 w-8"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
