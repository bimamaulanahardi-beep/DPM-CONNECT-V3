'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, CalendarDays, 
  Clock, MapPin, BookOpen, Loader2, Plus, 
  UserCheck, Tag, Trash2, CheckCircle2, 
  AlertCircle, PlayCircle, PauseCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/status-badge';
import { TimeInput24 } from '@/components/common/time-input-24';
import { useToast } from '@/hooks/use-toast';

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

const KATEGORI_COLORS: Record<string, string> = {
  'Rapat Kerja / Internal': 'bg-purple-500',
  'Pengawasan Ormawa': 'bg-sky-500',
  'Sosialisasi & Aspirasi': 'bg-teal-500',
  'Pelatihan & Kaderisasi': 'bg-emerald-500',
  'Kegiatan Umum': 'bg-pink-500',
};

interface KegiatanItem {
  id: string;
  nama: string;
  kategori: string;
  deskripsi: string | null;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string | null;
  lokasi: string | null;
  penanggung_jawab: string | null;
  status: string;
  created_by: string;
  created_at: string;
}

export default function KalenderPage() {
  const { toast } = useToast();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [sidangList, setSidangList] = useState<any[]>([]);
  const [kegiatanList, setKegiatanList] = useState<KegiatanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Buat Kegiatan DPM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState('Rapat Kerja / Internal');
  const [formTanggal, setFormTanggal] = useState('');
  const [formWaktuMulai, setFormWaktuMulai] = useState('09:00');
  const [formWaktuSelesai, setFormWaktuSelesai] = useState('');
  const [formLokasi, setFormLokasi] = useState('');
  const [formPJ, setFormPJ] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSidang, resKegiatan] = await Promise.all([
        fetch('/api/sidang'),
        fetch('/api/kegiatan'),
      ]);

      if (resSidang.ok) {
        const dataSidang = await resSidang.json();
        setSidangList(dataSidang);
      }
      if (resKegiatan.ok) {
        const dataKegiatan = await resKegiatan.json();
        setKegiatanList(dataKegiatan);
      }

      // Background trigger reminder check
      fetch('/api/cron/reminders').catch(() => {});
    } catch (e) {
      console.error('Gagal memuat agenda', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form submission for Kegiatan DPM
  const handleCreateKegiatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formTanggal || !formWaktuMulai || !formLokasi) {
      toast({
        title: 'Formulir Belum Lengkap',
        description: 'Mohon isi nama kegiatan, tanggal, waktu mulai, dan lokasi.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formNama,
          kategori: formKategori,
          tanggal: formTanggal,
          waktu_mulai: formWaktuMulai,
          waktu_selesai: formWaktuSelesai || null,
          lokasi: formLokasi,
          penanggung_jawab: formPJ || null,
          deskripsi: formDeskripsi || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan kegiatan');
      }

      toast({
        title: 'Berhasil Dibuat! 🚀',
        description: 'Kegiatan DPM berhasil disimpan & notifikasi dikirim ke Grup WhatsApp!',
      });

      // Reset form
      setFormNama('');
      setFormKategori('Rapat Kerja / Internal');
      setFormTanggal('');
      setFormWaktuMulai('09:00');
      setFormWaktuSelesai('');
      setFormLokasi('');
      setFormPJ('');
      setFormDeskripsi('');
      setIsModalOpen(false);

      // Refresh list
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: err.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick update status Kegiatan
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/kegiatan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({
          title: 'Status Diperbarui',
          description: `Status kegiatan diubah menjadi "${newStatus}" & notifikasi WA terkirim!`,
        });
        fetchData();
      } else {
        const data = await res.json();
        toast({
          title: 'Gagal Memperbarui',
          description: data.error || 'Terjadi kesalahan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Kesalahan Sistem',
        description: 'Gagal menghubungi server.',
        variant: 'destructive',
      });
    }
  };

  // Delete Kegiatan
  const handleDeleteKegiatan = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus kegiatan "${nama}"? Notifikasi pembatalan akan dikirim ke Grup WA.`)) return;

    try {
      const res = await fetch(`/api/kegiatan/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({
          title: 'Kegiatan Dihapus',
          description: 'Kegiatan berhasil dihapus dan notifikasi pembatalan terkirim.',
        });
        fetchData();
      } else {
        const data = await res.json();
        toast({
          title: 'Gagal Menghapus',
          description: data.error || 'Terjadi kesalahan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Kesalahan Sistem',
        description: 'Gagal menghapus kegiatan.',
        variant: 'destructive',
      });
    }
  };

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

  const kegiatanByDate = (dateKey: string) =>
    kegiatanList.filter(k => k.tanggal?.startsWith(dateKey));

  const selectedSidang = selectedDate ? sidangByDate(selectedDate) : [];
  const selectedKegiatan = selectedDate ? kegiatanByDate(selectedDate) : [];

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // All events this month
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const thisMonthSidang = sidangList.filter(s => s.tanggal?.startsWith(monthKey));
  const thisMonthKegiatan = kegiatanList.filter(k => k.tanggal?.startsWith(monthKey));

  // Combined Agenda this month
  const combinedAgenda = [
    ...thisMonthSidang.map(s => ({ ...s, type: 'sidang' })),
    ...thisMonthKegiatan.map(k => ({ ...k, type: 'kegiatan' })),
  ].sort((a, b) => (a.tanggal || '').localeCompare(b.tanggal || ''));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-amber-500" />
            Kalender Kegiatan & Sidang DPM
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jadwal kegiatan resmi & sidang DPM ITB Riau dengan pengingat otomatis ke WhatsApp Group.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={() => {
              if (selectedDate) setFormTanggal(selectedDate);
              setIsModalOpen(true);
            }} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Buat Kegiatan DPM
          </Button>

          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold h-10 shadow-lg shadow-amber-950/30">
            <Link href="/dashboard/sidang/baru" className="flex items-center">
              + Buat Sidang Baru
            </Link>
          </Button>
        </div>
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
                const sEvents = sidangByDate(dateKey);
                const kEvents = kegiatanByDate(dateKey);
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const hasEvents = sEvents.length > 0 || kEvents.length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={`
                      relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[58px] text-xs font-semibold transition-all duration-150 border
                      ${isSelected ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20' :
                        isToday ? 'bg-slate-800 text-amber-400 border-amber-500/40' :
                        hasEvents ? 'bg-slate-800/60 text-white border-slate-700 hover:border-amber-500/30 hover:bg-slate-800' :
                        'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-white'}
                    `}
                  >
                    <span>{day}</span>
                    {hasEvents && (
                      <div className="flex gap-1 mt-1 flex-wrap justify-center">
                        {/* Sidang dots */}
                        {sEvents.slice(0, 2).map((s, idx) => (
                          <span
                            key={`s-${idx}`}
                            title={`Sidang: ${s.judul}`}
                            className={`block w-1.5 h-1.5 rounded-full ${JENIS_COLORS[s.jenis] || 'bg-slate-500'} ${isSelected ? 'opacity-70' : ''}`}
                          />
                        ))}
                        {/* Kegiatan dots */}
                        {kEvents.slice(0, 2).map((k, idx) => (
                          <span
                            key={`k-${idx}`}
                            title={`Kegiatan: ${k.nama}`}
                            className={`block w-1.5 h-1.5 rounded-full ${KATEGORI_COLORS[k.kategori] || 'bg-cyan-400'} ring-1 ring-white/30 ${isSelected ? 'opacity-70' : ''}`}
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
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Sidang:</span>
              {Object.entries(JENIS_COLORS).map(([jenis, color]) => (
                <div key={jenis} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] text-slate-400 capitalize">{jenis.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Kegiatan:</span>
              {Object.entries(KATEGORI_COLORS).map(([kat, color]) => (
                <div key={kat} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] text-slate-400">{kat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Day or Month Summary */}
        <div className="space-y-4">
          {selectedDate ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {selectedSidang.length} Sidang · {selectedKegiatan.length} Kegiatan
                  </span>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedSidang.length === 0 && selectedKegiatan.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Tidak ada agenda pada tanggal ini.</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setFormTanggal(selectedDate);
                        setIsModalOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      + Buat Kegiatan
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs">
                      <Link href="/dashboard/sidang/baru">+ Buat Sidang</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  {/* Kegiatan List */}
                  {selectedKegiatan.map(kegiatan => (
                    <div key={kegiatan.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${KATEGORI_COLORS[kegiatan.kategori] || 'bg-purple-600'}`}>
                          {kegiatan.kategori}
                        </span>
                        <StatusBadge status={kegiatan.status} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white leading-snug">{kegiatan.nama}</p>
                        {kegiatan.deskripsi && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{kegiatan.deskripsi}</p>
                        )}
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{kegiatan.waktu_mulai}{kegiatan.waktu_selesai ? ` – ${kegiatan.waktu_selesai}` : ''} WIB</span>
                        </div>
                        {kegiatan.lokasi && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span>{kegiatan.lokasi}</span>
                          </div>
                        )}
                        {kegiatan.penanggung_jawab && (
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span>PJ: {kegiatan.penanggung_jawab}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Status & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 gap-1.5">
                        <div className="flex items-center gap-1">
                          {kegiatan.status === 'dijadwalkan' && (
                            <button
                              onClick={() => handleUpdateStatus(kegiatan.id, 'berlangsung')}
                              className="px-2 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded text-[10px] font-semibold flex items-center gap-1"
                              title="Set Sedang Berlangsung"
                            >
                              <PlayCircle className="w-3 h-3" /> Mulai
                            </button>
                          )}
                          {kegiatan.status === 'berlangsung' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(kegiatan.id, 'ditunda')}
                                className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded text-[10px] font-semibold flex items-center gap-1"
                                title="Tunda Kegiatan"
                              >
                                <PauseCircle className="w-3 h-3" /> Tunda
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(kegiatan.id, 'selesai')}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-[10px] font-semibold flex items-center gap-1"
                                title="Selesaikan Kegiatan"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Selesai
                              </button>
                            </>
                          )}
                          {kegiatan.status === 'ditunda' && (
                            <button
                              onClick={() => handleUpdateStatus(kegiatan.id, 'berlangsung')}
                              className="px-2 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded text-[10px] font-semibold flex items-center gap-1"
                              title="Lanjutkan Kegiatan"
                            >
                              <PlayCircle className="w-3 h-3" /> Lanjut
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteKegiatan(kegiatan.id, kegiatan.nama)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Sidang List */}
                  {selectedSidang.map(sidang => (
                    <Link key={sidang.id} href={`/dashboard/sidang/${sidang.id}`}>
                      <div className="bg-slate-950/50 border border-slate-800 hover:border-amber-500/30 rounded-xl p-3 space-y-2 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={sidang.status} />
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white ${JENIS_COLORS[sidang.jenis] || 'bg-slate-600'}`}>
                            Sidang {sidang.jenis?.replace('_', ' ')}
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
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">
                  Agenda {MONTHS[currentMonth]} {currentYear}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {combinedAgenda.length} Total Agenda
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
              ) : combinedAgenda.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Belum ada agenda bulan ini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {combinedAgenda.map(item => {
                    const isSidang = item.type === 'sidang';
                    const colorBar = isSidang 
                      ? (JENIS_COLORS[item.jenis] || 'bg-slate-600')
                      : (KATEGORI_COLORS[item.kategori] || 'bg-cyan-500');

                    const content = (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-950/40 border border-slate-800 hover:border-amber-500/20 rounded-lg transition-colors cursor-pointer">
                        <div className={`w-1 self-stretch rounded-full ${colorBar}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {isSidang ? 'Sidang' : 'Kegiatan'}
                            </span>
                            <span className="text-slate-600">·</span>
                            <p className="text-xs font-semibold text-white truncate">
                              {isSidang ? item.judul : item.nama}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(item.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {item.waktu_mulai} WIB {item.lokasi ? `· ${item.lokasi}` : ''}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    );

                    return isSidang ? (
                      <Link key={`s-${item.id}`} href={`/dashboard/sidang/${item.id}`}>
                        {content}
                      </Link>
                    ) : (
                      <div 
                        key={`k-${item.id}`} 
                        onClick={() => setSelectedDate(item.tanggal)}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3">Statistik Bulan Ini</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Kegiatan DPM', value: thisMonthKegiatan.length, color: 'text-cyan-400' },
                { label: 'Sidang', value: thisMonthSidang.length, color: 'text-amber-400' },
                { label: 'Dijadwalkan', value: [...thisMonthSidang, ...thisMonthKegiatan].filter(x => x.status === 'dijadwalkan').length, color: 'text-blue-400' },
                { label: 'Berlangsung', value: [...thisMonthSidang, ...thisMonthKegiatan].filter(x => x.status === 'berlangsung').length, color: 'text-yellow-400' },
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

      {/* Modal Dialog Buat Kegiatan DPM */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-400" />
                    Buat Kegiatan DPM Baru
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Agenda kegiatan akan otomatis disiarkan ke Grup WhatsApp resmi DPM ITB Riau.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateKegiatan} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1 text-xs">
                  {/* Nama Kegiatan */}
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 font-semibold text-xs">Nama Kegiatan / Agenda *</Label>
                    <Input
                      placeholder="Contoh: Rapat Kerja Komisi I, Sosialisasi Pemira, dll."
                      value={formNama}
                      onChange={e => setFormNama(e.target.value)}
                      required
                      className="h-10 bg-slate-950/70 border-slate-800 text-white rounded-xl focus:border-amber-500"
                    />
                  </div>

                  {/* Kategori & Tanggal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-semibold text-xs">Kategori Kegiatan *</Label>
                      <select
                        value={formKategori}
                        onChange={e => setFormKategori(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="w-full h-10 bg-slate-950/70 border border-slate-800 text-white rounded-xl px-3 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all cursor-pointer"
                      >
                        <option value="Rapat Kerja / Internal">Rapat Kerja / Internal</option>
                        <option value="Pengawasan Ormawa">Pengawasan Ormawa</option>
                        <option value="Sosialisasi & Aspirasi">Sosialisasi & Aspirasi</option>
                        <option value="Pelatihan & Kaderisasi">Pelatihan & Kaderisasi</option>
                        <option value="Kegiatan Umum">Kegiatan Umum</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-semibold text-xs">Tanggal Pelaksanaan *</Label>
                      <Input
                        type="date"
                        value={formTanggal}
                        onChange={e => setFormTanggal(e.target.value)}
                        required
                        style={{ colorScheme: 'dark' }}
                        className="h-10 bg-slate-950/70 border-slate-800 text-white rounded-xl focus:border-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Waktu Mulai & Waktu Selesai (2 Kolom Lebar) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-semibold text-xs">Waktu Mulai *</Label>
                      <TimeInput24
                        value={formWaktuMulai}
                        onChange={setFormWaktuMulai}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-semibold text-xs">Waktu Selesai (Opsional)</Label>
                      <TimeInput24
                        value={formWaktuSelesai}
                        onChange={setFormWaktuSelesai}
                      />
                    </div>
                  </div>

                  {/* Lokasi & PJ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-semibold text-xs">Lokasi Pelaksanaan *</Label>
                      <Input
                        placeholder="Contoh: Ruang Rapat DPM / Google Meet"
                        value={formLokasi}
                        onChange={e => setFormLokasi(e.target.value)}
                        required
                        className="h-10 bg-slate-950/70 border-slate-800 text-white rounded-xl focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-semibold text-xs">Penanggung Jawab (PJ)</Label>
                      <Input
                        placeholder="Contoh: Ketua Komisi II / Bima"
                        value={formPJ}
                        onChange={e => setFormPJ(e.target.value)}
                        className="h-10 bg-slate-950/70 border-slate-800 text-white rounded-xl focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 font-semibold text-xs">Deskripsi / Agenda Kegiatan</Label>
                    <Textarea
                      placeholder="Tuliskan gambaran jalannya kegiatan, agenda pembahasan, atau instruksi kehadiran..."
                      value={formDeskripsi}
                      onChange={e => setFormDeskripsi(e.target.value)}
                      rows={3}
                      className="bg-slate-950/70 border-slate-800 text-white text-xs rounded-xl focus:border-amber-500 resize-none p-3"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/40">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 border-slate-800 text-slate-400 hover:text-white rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan & Beritahu Grup WA'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
