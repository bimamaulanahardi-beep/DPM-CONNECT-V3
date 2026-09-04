'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, CalendarDays, 
  Clock, MapPin, BookOpen, Loader2, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/status-badge';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const JENIS_COLORS: Record<string, string> = {
  paripurna: 'bg-amber-500',
  komisi: 'bg-blue-500',
  dengar_pendapat: 'bg-emerald-500',
  istimewa: 'bg-red-500',
};

export default function KalenderPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sidangList, setSidangList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidang = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/sidang');
        const data = await res.json();
        if (res.ok) setSidangList(data);
      } catch (e) {
        console.error('Gagal memuat data sidang', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSidang();
  }, []);

  // Helpers
  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const formatDateKey = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const sidangByDate = (dateKey: string) =>
    sidangList.filter(s => s.tanggal?.startsWith(dateKey));

  const selectedSidang = selectedDate ? sidangByDate(selectedDate) : [];
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // All events this month for summary
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const thisMonthSidang = sidangList.filter(s => s.tanggal?.startsWith(monthKey));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-amber-500" />
            Kalender Kegiatan DPM
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jadwal sidang dan agenda resmi DPM ITB Riau.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold h-10">
          <Link href="/dashboard/sidang/baru" className="flex items-center">
            + Buat Sidang Baru
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          {/* Month Navigator */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white tracking-wide">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Date Cells */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first day offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = formatDateKey(day);
                const events = sidangByDate(dateKey);
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const hasEvents = events.length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={`
                      relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[52px] text-xs font-semibold transition-all duration-150 border
                      ${isSelected ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20' :
                        isToday ? 'bg-slate-800 text-amber-400 border-amber-500/40' :
                        hasEvents ? 'bg-slate-800/60 text-white border-slate-700 hover:border-amber-500/30 hover:bg-slate-800' :
                        'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-white'}
                    `}
                  >
                    <span>{day}</span>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {events.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className={`block w-1.5 h-1.5 rounded-full ${JENIS_COLORS[s.jenis] || 'bg-slate-500'} ${isSelected ? 'opacity-70' : ''}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-800">
            {Object.entries(JENIS_COLORS).map(([jenis, color]) => (
              <div key={jenis} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-[10px] text-slate-400 capitalize">{jenis.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Selected Day or Month Summary */}
        <div className="space-y-4">
          {selectedDate ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { 
                    weekday: 'long', day: 'numeric', month: 'long' 
                  })}
                </h3>
                <button onClick={() => setSelectedDate(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
              </div>

              {selectedSidang.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Tidak ada sidang pada tanggal ini.</p>
                  <Button asChild size="sm" className="mt-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/20">
                    <Link href="/dashboard/sidang/baru">+ Buat Sidang</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSidang.map(sidang => (
                    <Link key={sidang.id} href={`/dashboard/sidang/${sidang.id}`}>
                      <div className="bg-slate-950/50 border border-slate-700 hover:border-amber-500/30 rounded-xl p-3 space-y-2 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={sidang.status} />
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white ${JENIS_COLORS[sidang.jenis] || 'bg-slate-600'}`}>
                            {sidang.jenis?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug">{sidang.judul}</p>
                        <div className="space-y-1 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {sidang.waktu_mulai}{sidang.waktu_selesai ? ` – ${sidang.waktu_selesai}` : ''} WIB
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            {sidang.lokasi}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-white text-sm">
                Agenda {MONTHS[currentMonth]} {currentYear}
              </h3>
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
              ) : thisMonthSidang.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Belum ada jadwal sidang bulan ini.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {thisMonthSidang
                    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
                    .map(sidang => (
                      <Link key={sidang.id} href={`/dashboard/sidang/${sidang.id}`}>
                        <div className="flex items-center gap-3 p-2.5 bg-slate-950/40 border border-slate-800 hover:border-amber-500/20 rounded-lg transition-colors cursor-pointer">
                          <div className={`w-1 self-stretch rounded-full ${JENIS_COLORS[sidang.jenis] || 'bg-slate-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{sidang.judul}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(sidang.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {sidang.waktu_mulai}
                            </p>
                          </div>
                          <StatusBadge status={sidang.status} />
                        </div>
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3">Statistik Bulan Ini</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total Sidang', value: thisMonthSidang.length, color: 'text-amber-400' },
                { label: 'Selesai', value: thisMonthSidang.filter(s => s.status === 'selesai').length, color: 'text-emerald-400' },
                { label: 'Dijadwalkan', value: thisMonthSidang.filter(s => s.status === 'dijadwalkan').length, color: 'text-blue-400' },
                { label: 'Berlangsung', value: thisMonthSidang.filter(s => s.status === 'berlangsung').length, color: 'text-yellow-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-950/40 rounded-lg p-3 text-center">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
