'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  FileText, 
  MessageSquare, 
  Sparkles,
  Vote,
  Send,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/common/stat-card';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDateShort } from '@/lib/utils';
import Link from 'next/link';


export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [recentSidang, setRecentSidang] = useState<any[]>([]);
  const [recentProker, setRecentProker] = useState<any[]>([]);
  const [recentAspirasi, setRecentAspirasi] = useState<any[]>([]);
  const [aspirasiBulanData, setAspirasiBuilanData] = useState<any[]>([]);
  const [kehadiranSidangData, setKehadiranSidangData] = useState<any[]>([]);
  const [prokerStatusData, setProkerStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const user = session.user as any;
      if (user.role === 'bem') {
        router.replace('/dashboard/pengawasan');
        return;
      }
      
      const fetchDashboardData = async () => {
        try {
          const res = await fetch(`/api/dashboard/stats?nim=${(session.user as any).nim}`);
          const data = await res.json();
          if (res.ok && data.success) {
            setStats(data.stats);
            setRecentSidang(data.recentSidang || []);
            setRecentProker(data.recentProker || []);
            setRecentAspirasi(data.recentAspirasi || []);
            setAspirasiBuilanData(data.aspirasiBulanData || []);
            setKehadiranSidangData(data.kehadiranSidangData || []);
            setProkerStatusData(data.prokerStatusData || []);
          }
        } catch (e) {
          console.error('Error fetching dashboard statistics:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [session]);

  if (!session || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const user = session.user as any;
  const role = user.role || 'mahasiswa';

  const totalSidang = stats?.totalSidang ?? 0;
  const activeSidangCount = stats?.activeSidangCount ?? 0;
  const legislasiProcessCount = stats?.legislasiProcessCount ?? 0;
  const aspirasiPendingCount = stats?.aspirasiPendingCount ?? 0;
  const bemProkerActive = stats?.bemProkerActive ?? 0;
  const activeVotingCount = stats?.activeVotingCount ?? 0;

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Selamat Pagi';
    if (hrs < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-900 p-6 sm:p-8"
      >
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              PORTAL DPM CONNECT
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              {getGreeting()}, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Anda masuk sebagai <strong className="text-slate-300 capitalize">{role.replace('_', ' ')}</strong> DPM ITB Riau.
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            {role === 'mahasiswa' ? (
              <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shadow-sm">
                <Link href="/dashboard/aspirasi/baru">
                  <Send className="w-4 h-4 mr-2" /> Kirim Aspirasi
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="outline" className="border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800 shadow-sm">
                  <Link href="/dashboard/sidang">Lihat Sidang</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-semibold shadow-sm">
                  <Link href="/dashboard/legislasi/baru">Buat Draf RUU</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Role specific dashboard views */}
      
      {/* 1. Legislator View (Pimpinan, Ketua Komisi, Anggota) */}
      {role !== 'mahasiswa' && (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="Sidang Bulan Ini" 
              value={totalSidang} 
              icon={CalendarDays}
              description={`${activeSidangCount} sidang berlangsung`}
              change="+15%"
              changeType="positive"
            />
            <StatCard 
              title="Draft RUU Dibahas" 
              value={legislasiProcessCount} 
              icon={FileText}
              description="Dari semua komisi legislasi"
              change="+2 RUU"
              changeType="positive"
            />
            <StatCard 
              title="Aspirasi Pending" 
              value={aspirasiPendingCount} 
              icon={MessageSquare}
              description="Butuh respon & tindak lanjut"
              change="-8%"
              changeType="negative"
            />
            <StatCard 
              title="Voting Aktif" 
              value={activeVotingCount} 
              icon={Vote}
              description="Membutuhkan suara Anda"
            />
          </div>

          {/* Charts area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart: Aspirasi Per Bulan */}
            <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Laporan Aspirasi Masuk</CardTitle>
                <CardDescription className="text-xs text-slate-500">Statistik jumlah keluhan & saran mahasiswa 6 bulan terakhir</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {aspirasiBulanData.every(d => d.total === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                    <MessageSquare className="w-8 h-8 text-slate-700" />
                    <p className="text-xs text-slate-500">Belum ada data aspirasi dalam 6 bulan terakhir.</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aspirasiBulanData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="bulan" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} 
                      labelStyle={{ color: '#fff', fontSize: 11 }}
                      itemStyle={{ color: '#d4af37', fontSize: 11 }}
                    />
                    <Line type="monotone" dataKey="total" name="Aspirasi Masuk" stroke="#d4af37" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="ditindaklanjuti" name="Ditindaklanjuti" stroke="#10b981" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart: Kehadiran Sidang */}
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Tingkat Kehadiran Sidang</CardTitle>
                <CardDescription className="text-xs text-slate-500">Rata-rata persentase kehadiran anggota DPM</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {kehadiranSidangData.every(d => d.jumlah_sidang === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                    <CalendarDays className="w-8 h-8 text-slate-700" />
                    <p className="text-xs text-slate-500">Belum ada data sidang dalam 6 bulan terakhir.</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kehadiranSidangData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="bulan" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                      itemStyle={{ color: '#d4af37', fontSize: 11 }}
                      formatter={(val: any, name: string) => [`${val}%`, 'Kehadiran']}
                    />
                    <Bar dataKey="persentase" name="Kehadiran (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart: Status Proker BEM */}
            <Card className="bg-slate-900/40 border-slate-800 lg:col-span-3">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Status Program Kerja BEM</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Distribusi status pelaksanaan proker BEM ITB Riau</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                {prokerStatusData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                    <Sparkles className="w-8 h-8 text-slate-700" />
                    <p className="text-xs text-slate-500">Belum ada data program kerja BEM.</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prokerStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {prokerStatusData.map((entry, index) => {
                        const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                )}
                {prokerStatusData.length > 0 && (
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {prokerStatusData.map((entry, index) => {
                      const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
                      return (
                        <div key={index} className="flex items-center gap-2 text-xs text-slate-300">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                          <span className="flex-1">{entry.name}</span>
                          <span className="font-bold">{entry.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Agenda & Quick Actions Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sidang Terdekat */}
            <Card className="bg-slate-900/40 border-slate-800 flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Sidang Mendatang & Berlangsung</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Jadwal rapat & sidang paripurna DPM terdekat</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-amber-500 hover:text-amber-400">
                  <Link href="/dashboard/sidang">Lihat Semua</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-2">
                <div className="space-y-4">
                  {recentSidang.length > 0 ? (
                    recentSidang.map((sidang) => (
                      <div key={sidang.id} className="flex gap-4 items-start p-3 bg-slate-950/40 rounded-xl border border-slate-900/60">
                        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-center shrink-0">
                          <span className="text-[10px] font-bold block text-slate-500 uppercase">Status</span>
                          <span className="text-xs font-black block text-amber-500 capitalize">{sidang.status}</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{sidang.judul}</h4>
                          <div className="flex gap-3 text-[10px] text-slate-500">
                            <span>{formatDateShort(sidang.tanggal)}</span>
                            <span>&bull;</span>
                            <span className="max-w-[120px] truncate">{sidang.lokasi}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">Belum ada jadwal sidang terbaru.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Program Kerja BEM dipantau */}
            <Card className="bg-slate-900/40 border-slate-800 flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Pemantauan Program Kerja BEM</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Evaluasi & progres program kerja BEM ITB Riau</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-amber-500 hover:text-amber-400">
                  <Link href="/dashboard/pengawasan">Lihat Detail</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-2">
                <div className="space-y-4">
                  {recentProker.length > 0 ? (
                    recentProker.map((proker) => (
                      <div key={proker.id} className="space-y-2 p-3 bg-slate-950/40 rounded-xl border border-slate-900/60">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{proker.nama}</h4>
                          <StatusBadge status={proker.status} />
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Progress bar */}
                          <div className="flex-1 h-1.5 rounded-full bg-slate-900/40 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full" style={{ width: `${proker.progress_percentage}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{proker.progress_percentage}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">Belum ada program kerja BEM terpantau.</div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </>
      )}

      {/* 2. Mahasiswa (Public Registered) View */}
      {role === 'mahasiswa' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aspirasi Terkini Saya */}
          <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Aspirasi Saya</CardTitle>
              <CardDescription className="text-xs text-slate-500">Daftar usulan & keluhan yang pernah Anda ajukan</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Show user's mock aspirations */}
              <div className="space-y-4">
                {recentAspirasi.length > 0 ? (
                  recentAspirasi.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.judul}</h4>
                          <span className="text-[10px] text-slate-500 block font-mono mt-0.5">KODE: {item.kode_tracking}</span>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                      {item.catatan_tindak_lanjut && (
                        <div className="text-[11px] p-2.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                          <strong>Update DPM:</strong> {item.catatan_tindak_lanjut}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    Anda belum pernah mengirim aspirasi. Silakan ajukan aspirasi baru.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Links */}
          <div className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Menu Aspirasi</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gunakan form pengaduan resmi untuk melaporkan kendala akademik, fasilitas bermasalah, atau saran organisasi.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold">
                    <Link href="/dashboard/aspirasi/baru">
                      <Send className="w-4 h-4 mr-2" /> Buat Aspirasi Baru
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-slate-800 text-slate-400 hover:text-white bg-slate-950/50">
                    <Link href="/dashboard/aspirasi">Semua Aspirasi</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Pengumuman Sidang</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Penyampaian aspirasi Anda akan dibahas secara resmi dalam agenda Sidang Komisi III (Aspirasi & Kemahasiswaan).
                </p>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
                  <span className="font-bold text-amber-500 block">Komisi III (Aspirasi & Advokasi)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Penanggung jawab: Indah Permata Sari</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
