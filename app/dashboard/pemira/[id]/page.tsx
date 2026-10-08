'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function AdminPemiraDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/pemira/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds for Live Quick Count
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading && !event) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  if (!event) {
    return <div className="text-center py-20 text-white">Event tidak ditemukan.</div>;
  }

  // Data for Quick Count Chart
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
  const pieData = event.candidates.map((c: any, index: number) => ({
    name: `Paslon ${c.nomor_urut} - ${c.nama_ketua}`,
    value: c.total_suara,
    fill: colors[index % colors.length]
  }));

  const totalVotes = event.candidates.reduce((sum: number, c: any) => sum + c.total_suara, 0);
  let dataMasukPct = "0.00";
  if (event.total_dpt > 0) {
    dataMasukPct = ((totalVotes / event.total_dpt) * 100).toFixed(2);
  } else if (totalVotes > 0) {
    dataMasukPct = "100.00"; // Fallback
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/dashboard/pemira" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
        </Link>
        <Link 
          href={`/pemira/${params.id}`} 
          target="_blank"
          className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
        >
          Lihat Halaman Publik &rarr;
        </Link>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <StatusBadge status={event.status} />
            <select
              value={event.status}
              onChange={async (e) => {
                const newStatus = e.target.value;
                if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;
                try {
                  const res = await fetch(`/api/pemira/${params.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                  });
                  if (res.ok) {
                    setEvent({ ...event, status: newStatus });
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              className="bg-slate-950 text-xs text-white border border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
            >
              <option value="draft">Draft (Belum Aktif)</option>
              <option value="aktif">Aktif (Buka Pemilihan)</option>
              <option value="selesai">Selesai (Tutup Pemilihan)</option>
            </select>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            {event.total_voters} Suara Masuk
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-snug mb-3 relative z-10">
          {event.judul}
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl relative z-10 font-sans">
          {event.deskripsi}
        </p>
      </div>

      {/* RESULT SCREEN ONLY */}
      <div className="space-y-6">
        <Card className="bg-slate-900/40 border-slate-800">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Live Quick Count (Admin)</h3>
              <p className="text-xs text-slate-500 font-sans">Data diperbarui secara otomatis setiap 10 detik.</p>
            </div>
          </div>
          <CardContent className="p-6">
            {/* KPU Style Half Donut Chart */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-full max-w-md h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius="65%"
                      outerRadius="100%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}
                      formatter={(value: any, name: string) => [`${value} Suara`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
                  <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-1">Data Masuk</p>
                  <div className="text-5xl font-black text-white flex items-baseline gap-1 drop-shadow-md">
                    {dataMasukPct}
                    <span className="text-2xl text-amber-500">%</span>
                  </div>
                  {event.total_dpt > 0 && (
                    <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                      {totalVotes} dari {event.total_dpt} Pemilih
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Paslon Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.candidates.map((c: any, index: number) => {
                const pct = totalVotes > 0 ? ((c.total_suara / totalVotes) * 100).toFixed(1) : "0.0";
                const colorClass = index % 2 === 0 ? 'from-blue-500 to-indigo-600' : 'from-amber-500 to-yellow-600';
                const bgLine = index % 2 === 0 ? 'bg-blue-500' : 'bg-amber-500';
                
                return (
                  <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className={`absolute top-0 left-0 h-1.5 ${bgLine} shadow-[0_0_15px_rgba(245,158,11,0.5)]`} style={{ width: `${pct}%`, transition: 'width 1.5s ease-in-out' }} />
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-300">
                        {c.nomor_urut}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm uppercase line-clamp-1">{c.nama_ketua}</h4>
                        <p className="text-xs text-slate-500">{c.total_suara} Suara Sah</p>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br ${colorClass} tracking-tighter drop-shadow-sm`}>
                        {pct}
                      </span>
                      <span className="text-3xl font-bold text-slate-700">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
