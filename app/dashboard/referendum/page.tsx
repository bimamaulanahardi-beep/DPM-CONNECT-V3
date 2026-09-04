'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Vote, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Users, 
  BarChart3, 
  Eye, 
  Calendar, 
  ExternalLink,
  RefreshCw,
  Loader2,
  Trash2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

export default function DashboardReferendumPage() {
  const { data: session } = useSession();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  const fetchReferendums = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/referendum');
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch (err) {
      console.error('Error fetching referendums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferendums();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'selesai' : 'aktif';
    const confirmMsg = newStatus === 'selesai'
      ? 'Apakah Anda yakin ingin menutup referendum ini? Mahasiswa tidak akan dapat memberikan suara lagi.'
      : 'Apakah Anda ingin mengaktifkan referendum ini kembali?';

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/referendum/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchReferendums();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus referendum ini beserta seluruh riwayat suaranya? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      const res = await fetch(`/api/referendum/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReferendums();
      }
    } catch (e) {
      console.error('Failed to delete referendum:', e);
    }
  };

  const filteredList = list.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.pertanyaan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'semua' ? true : item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = list.length;
  const aktif = list.filter(r => r.status === 'aktif').length;
  const selesai = list.filter(r => r.status === 'selesai').length;
  const totalVotes = list.reduce((acc, curr) => acc + (curr.total_pemilih || 0), 0);

  const user = session?.user as any;
  const canManage = user && ['admin', 'pimpinan', 'ketua_komisi', 'anggota'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Vote className="w-6 h-6 text-gold-400" />
            Referendum Mahasiswa
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola pemungutan suara kebijakan kampus berskala institusi yang diikuti oleh seluruh mahasiswa ITB Riau.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReferendums}
            disabled={loading}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/referendum" target="_blank">
            <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Laman Publik
            </Button>
          </Link>
          {canManage && (
            <Link href="/dashboard/referendum/baru">
              <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-1.5">
                <Plus className="w-4 h-4" />
                Buat Referendum
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Referendum</p>
              <p className="text-2xl font-bold text-white mt-1">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">Sedang Aktif</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{aktif}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">Telah Selesai</p>
              <p className="text-2xl font-bold text-white mt-1">{selesai}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gold-400">Total Suara Terkumpul</p>
              <p className="text-2xl font-bold text-gold-400 mt-1">{totalVotes}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
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
            placeholder="Cari referendum, pertanyaan..."
            className="pl-9 bg-slate-950/60 border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-gold-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'aktif', label: 'Sedang Aktif' },
            { id: 'selesai', label: 'Selesai' },
            { id: 'draft', label: 'Draft' },
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
          <p className="text-sm">Memuat data referendum...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <Vote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Tidak ada referendum ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'semua'
              ? 'Tidak ada referendum yang sesuai dengan filter pencarian.'
              : 'Belum ada agenda referendum yang dibuat.'}
          </p>
          {canManage && !search && statusFilter === 'semua' && (
            <Link href="/dashboard/referendum/baru" className="mt-4 inline-block">
              <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-1.5">
                <Plus className="w-4 h-4" />
                Buat Referendum Pertama
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
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.tanggal_mulai} s/d {item.tanggal_selesai}
                  </span>
                  <span className="text-xs text-gold-400 font-medium">
                    • {item.total_pemilih || 0} Suara Terkumpul
                  </span>
                </div>

                <h3 className="text-base font-bold text-white truncate">
                  {item.judul}
                </h3>

                <p className="text-xs text-slate-300 italic line-clamp-1">
                  "{item.pertanyaan}"
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.opsi.map((opt: string) => (
                    <span key={opt} className="text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      {opt}: <strong className="text-white">{item.voteCounts?.[opt] || 0}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                <Link href={`/dashboard/referendum/${item.id}`}>
                  <Button
                    size="sm"
                    className="bg-slate-800 hover:bg-gold-500 hover:text-slate-950 text-slate-200 font-semibold gap-1.5 border border-slate-700 hover:border-gold-500 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Hasil Suara
                  </Button>
                </Link>

                {canManage && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`text-xs ${
                        item.status === 'aktif'
                          ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                          : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {item.status === 'aktif' ? 'Tutup Referendum' : 'Aktifkan'}
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 w-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
