'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  ShieldAlert, 
  Globe, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Database,
  UserCheck,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime, getInitials } from '@/lib/utils';

interface AuditLogData {
  id: string;
  user: string;
  aksi: string;
  modul: string;
  detail: string;
  ip_address: string;
  tanggal: string;
}

export default function AdminAuditLogsPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const userRole = currentUser?.role || 'mahasiswa';

  // State Management
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modulFilter, setModulFilter] = useState('all');
  const [aksiFilter, setAksiFilter] = useState('all');
  const [limit, setLimit] = useState('50');
  const [deleteDate, setDeleteDate] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?limit=${limit}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.auditLogs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'pimpinan') {
      fetchLogs();
    }
  }, [userRole, limit]);

  // Access Control check
  if (userRole !== 'admin' && userRole !== 'pimpinan') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500/60 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak</h2>
        <p className="text-xs text-slate-500 mb-6">Hanya Administrator atau Pimpinan DPM yang dapat melihat log audit sistem.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <a href="/dashboard">Kembali ke Dashboard</a>
        </Button>
      </div>
    );
  }

  // Get unique modules and actions for filter dropdowns
  const uniqueModules = ['all', ...Array.from(new Set(logs.map(log => log.modul)))];
  
  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.aksi.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModul = modulFilter === 'all' || log.modul === modulFilter;
    
    const matchesAksi = 
      aksiFilter === 'all' || 
      (aksiFilter === 'buat' && log.aksi.toLowerCase().includes('membuat') || log.aksi.toLowerCase().includes('mengajukan') || log.aksi.toLowerCase().includes('mengarsipkan') || log.aksi.toLowerCase().includes('menambahkan')) ||
      (aksiFilter === 'ubah' && log.aksi.toLowerCase().includes('memperbarui') || log.aksi.toLowerCase().includes('mengubah')) ||
      (aksiFilter === 'hapus' && log.aksi.toLowerCase().includes('menghapus')) ||
      (aksiFilter === 'suara' && log.aksi.toLowerCase().includes('suara') || log.aksi.toLowerCase().includes('memilih'));

    return matchesSearch && matchesModul && matchesAksi;
  });

  // Calculate statistics
  const stats = {
    total: filteredLogs.length,
    today: filteredLogs.filter(log => {
      const todayStr = new Date().toISOString().split('T')[0];
      return log.tanggal.startsWith(todayStr);
    }).length,
    userManagement: filteredLogs.filter(log => log.modul === 'Manajemen Pengguna').length,
    criticalActions: filteredLogs.filter(log => log.aksi.toLowerCase().includes('hapus') || log.aksi.toLowerCase().includes('password')).length
  };

  const getActionColor = (aksi: string) => {
    const act = aksi.toLowerCase();
    if (act.includes('hapus') || act.includes('password') || act.includes('ditolak')) {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    if (act.includes('buat') || act.includes('tambah') || act.includes('mengajukan') || act.includes('mengarsipkan')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (act.includes('perbarui') || act.includes('ubah')) {
      return 'bg-amber-500/10 text-amber-400 border-[#007bff]/20';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const handleDeleteDailyLogs = async () => {
    if (!deleteDate) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?date=${deleteDate}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(logs.filter(log => !log.tanggal.startsWith(deleteDate)));
        setShowDeleteModal(false);
        setDeleteDate('');
        fetchLogs(); // Refresh the list
      } else {
        console.error('Delete error:', data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <History className="w-6 h-6 text-amber-500" />
            Log Aktivitas & Audit Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau dan audit seluruh riwayat aktivitas anggota DPM secara detail dan real-time.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowDeleteModal(true)} 
            variant="destructive" 
            className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold gap-2 h-9"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hapus Log</span> Harian
          </Button>

          <Button 
            onClick={fetchLogs} 
            disabled={loading}
            variant="outline" 
            className="bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold gap-2 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Segarkan</span> Data
          </Button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Hapus Log Aktivitas Harian
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              Pilih tanggal untuk menghapus semua log pada hari tersebut secara permanen.
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-slate-400">Pilih Tanggal</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  type="date"
                  value={deleteDate}
                  onChange={(e) => setDeleteDate(e.target.value)}
                  className="pl-9 bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-white">
                Batal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteDailyLogs} 
                disabled={!deleteDate || isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus Permanen'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900/40 border-slate-800/80 shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Aktivitas</span>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/25 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80 shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Aktivitas Hari Ini</span>
              <h3 className="text-2xl font-bold text-emerald-450 tracking-tight">{stats.today}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80 shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Manajemen Pengguna</span>
              <h3 className="text-2xl font-bold text-amber-500 tracking-tight">{stats.userManagement}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80 shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tindakan Kritis</span>
              <h3 className="text-2xl font-bold text-red-400 tracking-tight">{stats.criticalActions}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/25 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Cari pelaku, tindakan, atau detail aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Modul:</span>
            <select
              value={modulFilter}
              onChange={(e) => setModulFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500 capitalize"
            >
              {uniqueModules.map(m => (
                <option key={m} value={m}>{m === 'all' ? 'Semua Modul' : m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tindakan:</span>
            <select
              value={aksiFilter}
              onChange={(e) => setAksiFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Tindakan</option>
              <option value="buat">Pembuatan / Penambahan</option>
              <option value="ubah">Perubahan / Pengeditan</option>
              <option value="hapus">Penghapusan / Reset</option>
              <option value="suara">Pemungutan Suara</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tampilkan:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500"
            >
              <option value="10">10 Entri</option>
              <option value="50">50 Entri</option>
              <option value="100">100 Entri</option>
              <option value="all">Semua Entri</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table Area */}
      <Card className="bg-slate-900/40 border-slate-800 overflow-hidden shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Memuat Log Audit...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-400 text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Pelaku</th>
                    <th className="p-4">Modul</th>
                    <th className="p-4">Tindakan</th>
                    <th className="p-4">Detail</th>
                    <th className="p-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-900/20 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                        {formatDateTime(log.tanggal)}
                      </td>

                      {/* Actor User */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-[10px] font-bold text-amber-500 shadow-sm shrink-0">
                            {getInitials(log.user)}
                          </div>
                          <span className="font-bold text-white">{log.user}</span>
                        </div>
                      </td>

                      {/* Module */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-450 font-semibold uppercase tracking-wider">
                          {log.modul}
                        </span>
                      </td>

                      {/* Action Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionColor(log.aksi)}`}>
                          {log.aksi}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="p-4 font-medium text-slate-300 min-w-[240px]">
                        {log.detail}
                      </td>

                      {/* Client IP */}
                      <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-600" />
                          {log.ip_address}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <History className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <h3 className="text-base font-bold text-white mb-1">Tidak Ada Log Aktivitas</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Tidak ada log aktivitas audit yang cocok dengan filter pencarian Anda saat ini.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
