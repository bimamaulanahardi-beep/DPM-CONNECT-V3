'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Calendar, 
  MapPin, 
  Building, 
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

export default function DashboardIzinPage() {
  const { data: session } = useSession();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  const fetchIzinList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/izin');
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch (err) {
      console.error('Error fetching izin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIzinList();
  }, []);

  const filteredList = list.filter((item) => {
    const matchSearch =
      item.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.penyelenggara.toLowerCase().includes(search.toLowerCase()) ||
      item.kode.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'semua' ? true : item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = list.length;
  const menunggu = list.filter(i => i.status === 'menunggu').length;
  const disetujui = list.filter(i => i.status === 'disetujui').length;
  const ditolak = list.filter(i => i.status === 'ditolak' || i.status === 'perlu_revisi').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-gold-400" />
            Perizinan Kegiatan Kemahasiswaan
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar pengajuan izin penyelenggaraan acara dari UKM, HIMA, dan BEM ITB Riau.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIzinList}
            disabled={loading}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/izin-kegiatan" target="_blank">
            <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Formulir Publik
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Permohonan</p>
              <p className="text-2xl font-bold text-white mt-1">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400">Menunggu Tinjauan</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{menunggu}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">Telah Disetujui</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{disetujui}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-400">Revisi / Ditolak</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{ditolak}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
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
            placeholder="Cari kegiatan, organisasi, kode..."
            className="pl-9 bg-slate-950/60 border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-gold-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'menunggu', label: 'Menunggu' },
            { id: 'disetujui', label: 'Disetujui' },
            { id: 'perlu_revisi', label: 'Perlu Revisi' },
            { id: 'ditolak', label: 'Ditolak' },
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

      {/* List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
          <p className="text-sm">Memuat data perizinan kegiatan...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Tidak ada permohonan izin ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'semua'
              ? 'Tidak ada permohonan yang sesuai dengan filter pencarian Anda.'
              : 'Belum ada pengajuan izin kegiatan dari mahasiswa atau UKM.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                    {item.kode}
                  </span>
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-slate-500">
                    Diajukan {item.tanggal_diajukan}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white truncate">
                  {item.nama_kegiatan}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {item.penyelenggara}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.tanggal_mulai}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {item.lokasi}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link href={`/dashboard/izin/${item.id}`}>
                  <Button
                    size="sm"
                    className="bg-slate-800 hover:bg-gold-500 hover:text-slate-950 text-slate-200 font-semibold gap-1.5 border border-slate-700 hover:border-gold-500 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Tinjau Izin
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
