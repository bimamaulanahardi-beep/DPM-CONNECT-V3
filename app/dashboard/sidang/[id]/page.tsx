'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Users,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Loader2,
  Trash2,
  Vote,
  Pause,
  RotateCcw,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function SidangDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [sidang, setSidang] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notulensiText, setNotulensiText] = useState('');
  const [isSavingNotulen, setIsSavingNotulen] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Document attachments list state
  const [documents, setDocuments] = useState<any[]>([
    { name: 'Draf_Peraturan_Tata_Tertib_Sidang.pdf', size: '850 KB', url: '#' },
    { name: 'Undangan_Sidang_Paripurna_I.pdf', size: '340 KB', url: '#' }
  ]);

  const [attendance, setAttendance] = useState<Record<string, 'hadir' | 'izin' | 'alfa'>>({});

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsers(usersData);
      }

      // Fetch sidang detail
      const sidangRes = await fetch(`/api/sidang/${params.id}`);
      const sidangData = await sidangRes.json();
      if (sidangRes.ok) {
        setSidang(sidangData);
        setNotulensiText(sidangData.notulensi || '');

        // Populate initial attendance state
        const initialAttendance: Record<string, 'hadir' | 'izin' | 'alfa'> = {};
        usersData.forEach((u: any) => {
          const isParticipant = sidangData.peserta.includes(u.id);
          initialAttendance[u.id] = isParticipant ? 'hadir' : 'alfa';
        });
        setAttendance(initialAttendance);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!sidang) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500/60 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sidang Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mb-6">Sidang dengan ID tersebut tidak dapat ditemukan.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <Link href="/dashboard/sidang">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  const handleSaveNotulensi = async () => {
    setIsSavingNotulen(true);
    try {
      const res = await fetch(`/api/sidang/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notulensi: notulensiText,
          status: 'selesai', // Auto finish if minutes are submitted
        }),
      });

      if (res.ok) {
        toast({
          title: 'Notulensi Disimpan',
          description: 'Notulensi sidang telah berhasil diperbarui di database.',
        });
        // Refresh status
        const updated = await res.json();
        setSidang(updated);
      } else {
        toast({
          title: 'Gagal Menyimpan',
          description: 'Gagal memperbarui notulensi sidang.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungkan ke server.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotulen(false);
    }
  };

  const handleToggleAttendance = (userId: string, status: 'hadir' | 'izin' | 'alfa') => {
    setAttendance(prev => ({ ...prev, [userId]: status }));
  };

  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    try {
      const presentUserIds = Object.keys(attendance).filter(uid => attendance[uid] === 'hadir');
      const totalParticipants = Object.keys(attendance).length;
      const quorumAchieved = totalParticipants > 0 
        ? Math.round((presentUserIds.length / totalParticipants) * 100)
        : 0;

      const res = await fetch(`/api/sidang/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peserta: presentUserIds,
          quorum_achieved: quorumAchieved,
          status: quorumAchieved >= sidang.quorum_required ? 'berlangsung' : sidang.status,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Absensi Quorum Disimpan',
          description: `Kehadiran peserta berhasil disimpan. Quorum: ${quorumAchieved}%.`,
        });
        const updated = await res.json();
        setSidang(updated);
      } else {
        toast({
          title: 'Gagal Menyimpan Absensi',
          description: 'Terjadi kesalahan saat memperbarui absensi.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungi server.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'dijadwalkan' | 'berlangsung' | 'ditunda' | 'selesai') => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/sidang/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSidang(updated);
        const labelMap: Record<string, string> = {
          berlangsung: 'Sedang Berlangsung',
          ditunda: 'Sedang Ditunda',
          selesai: 'Sidang Selesai',
          dijadwalkan: 'Dijadwalkan',
        };
        toast({
          title: 'Status Sidang Diperbarui',
          description: `Status sidang berhasil diubah menjadi "${labelMap[newStatus] || newStatus}". Notifikasi telah dikirim ke grup WhatsApp.`,
        });
      } else {
        const data = await res.json();
        toast({
          title: 'Gagal Memperbarui Status',
          description: data.error || 'Terjadi kesalahan saat memperbarui status sidang.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungi server.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const sizeStr = data.sizeBytes > 1024 * 1024
          ? `${(data.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${(data.sizeBytes / 1024).toFixed(0)} KB`;

        setDocuments(prev => [
          ...prev,
          { name: data.name, size: sizeStr, url: data.url }
        ]);

        toast({
          title: 'Berkas Berhasil Diunggah',
          description: `Berkas "${file.name}" berhasil diunggah ke server.`,
        });
      } else {
        toast({
          title: 'Gagal Unggah Berkas',
          description: data.error || 'Gagal mengirim berkas ke server.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungi server.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSidang = () => {
    setDeleteModal(true);
  };
  
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sidang/${params.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast({
          title: 'Sidang Dihapus',
          description: 'Sidang telah berhasil dihapus dari sistem.',
        });
        setDeleteModal(false);
        router.push('/dashboard/sidang');
      } else {
        const data = await res.json();
        toast({
          title: 'Gagal Menghapus',
          description: data.error || 'Terjadi kesalahan saat menghapus sidang.',
          variant: 'destructive',
        });
        setIsDeleting(false);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungi server.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Back link & Delete Button */}
      <div className="flex justify-between items-center">
        <Link 
          href="/dashboard/sidang" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Sidang
        </Link>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDeleteSidang}
          disabled={isDeleting}
          className="flex items-center gap-1.5 h-8 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Hapus Sidang
        </Button>
      </div>

      {/* Hero Meta Info */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3.5">
              <StatusBadge status={sidang.status} />
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Sidang {sidang.jenis.replace('_', ' ')}
              </span>
              {sidang.komisi && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">
                  {sidang.komisi}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-snug">{sidang.judul}</h1>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{formatDate(sidang.tanggal)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{sidang.waktu_mulai} {sidang.waktu_selesai ? ` - ${sidang.waktu_selesai}` : ' WIB'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{sidang.lokasi}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold h-10 px-5 shadow-sm">
              <Link href={`/dashboard/voting/baru?sidang_id=${sidang.id}`} className="flex items-center gap-1.5">
                <Vote className="w-4 h-4" /> Sesi Voting
              </Link>
            </Button>
            {sidang.link_daring && (
              <Button asChild className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-5">
                <a href={sidang.link_daring} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                  <Laptop className="w-4 h-4" /> Gabung Video
                </a>
              </Button>
            )}
            <Button onClick={() => alert('Dokumen RUU terkait sidang ini berhasil diunduh (Mock PDF)')} variant="outline" className="border-slate-800 text-slate-400 hover:bg-gray-50 bg-slate-900/40">
              <Download className="w-4 h-4 mr-2" /> Draf RUU
            </Button>
          </div>
        </div>

        {/* Quorum Progress Bar */}
        {sidang.status !== 'dijadwalkan' && (
          <div className="mt-8 p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs font-bold text-slate-400">
            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span>Quorum Terpenuhi</span>
                <span className="text-amber-500">{sidang.quorum_achieved}% / {sidang.quorum_required}% Target</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900/40 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${sidang.quorum_achieved >= sidang.quorum_required ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-600'}`} 
                  style={{ width: `${Math.min(sidang.quorum_achieved, 100)}%` }} 
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {sidang.quorum_achieved >= sidang.quorum_required ? (
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4" /> QUORUM SAH
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/10">
                  <AlertCircle className="w-4 h-4" /> BELUM QUORUM
                </span>
              )}
            </div>
          </div>
        )}

        {/* Kontrol Status Sidang (Sedang Berlangsung / Sedang Ditunda / Sidang Selesai) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Ubah Status Sidang:</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">• Otomatis kirim notif ke Grup WhatsApp</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sedang Berlangsung */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUpdatingStatus || sidang.status === 'berlangsung'}
              onClick={() => handleUpdateStatus('berlangsung')}
              className={`h-9 px-3.5 text-xs font-semibold rounded-lg border transition-all ${
                sidang.status === 'berlangsung'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/50 cursor-default'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-500/40'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 mr-1.5 ${sidang.status === 'berlangsung' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              Sedang Berlangsung
            </Button>

            {/* Sedang Ditunda */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUpdatingStatus || sidang.status === 'ditunda'}
              onClick={() => handleUpdateStatus('ditunda')}
              className={`h-9 px-3.5 text-xs font-semibold rounded-lg border transition-all ${
                sidang.status === 'ditunda'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/50 cursor-default'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-amber-500/15 hover:text-amber-300 hover:border-amber-500/40'
              }`}
            >
              <Pause className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Sedang Ditunda
            </Button>

            {/* Sidang Selesai */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUpdatingStatus || sidang.status === 'selesai'}
              onClick={() => handleUpdateStatus('selesai')}
              className={`h-9 px-3.5 text-xs font-semibold rounded-lg border transition-all ${
                sidang.status === 'selesai'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-1 ring-blue-500/50 cursor-default'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-blue-500/15 hover:text-blue-300 hover:border-blue-500/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Sidang Selesai
            </Button>

            {/* Reset ke Dijadwalkan */}
            {sidang.status !== 'dijadwalkan' && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('dijadwalkan')}
                className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/80"
                title="Kembalikan status ke Dijadwalkan"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <Tabs defaultValue="agenda" className="w-full">
        <TabsList className="bg-slate-905 border border-slate-800 p-1 rounded-xl flex flex-wrap h-auto mb-6">
          <TabsTrigger value="agenda" className="text-xs sm:text-sm py-2 font-semibold flex-1 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Agenda Rapat
          </TabsTrigger>
          <TabsTrigger value="peserta" className="text-xs sm:text-sm py-2 font-semibold flex-1 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Daftar Peserta & Absensi
          </TabsTrigger>
          <TabsTrigger value="notulensi" className="text-xs sm:text-sm py-2 font-semibold flex-1 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Notulensi Hasil
          </TabsTrigger>
          <TabsTrigger value="dokumen" className="text-xs sm:text-sm py-2 font-semibold flex-1 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Lampiran Berkas
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Agenda */}
        <TabsContent value="agenda">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Susunan Agenda Sidang</h3>
              <div className="space-y-3">
                {sidang.agenda.map((item: string, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start p-3 bg-slate-950/40 rounded-xl border border-slate-900/60">
                    <span className="text-xs font-black text-amber-500 bg-amber-500/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Peserta & Absensi */}
        <TabsContent value="peserta">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daftar Kehadiran Anggota</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tandai status kehadiran para legislator undangan rapat.</p>
                </div>
                <Button 
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shrink-0 h-9"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {isSavingAttendance ? 'Menyimpan...' : 'Simpan Absensi'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => {
                  const currentStatus = attendance[user.id] || 'alfa';
                  return (
                    <div key={user.id} className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-850 shrink-0 border border-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white leading-none">{user.name}</h4>
                          <span className="text-[9px] text-slate-500 mt-1 block truncate capitalize">{user.jabatan || user.role}</span>
                        </div>
                      </div>

                      {/* Status selectors */}
                      <div className="flex items-center bg-slate-900/40 p-0.5 rounded-lg border border-slate-800 gap-0.5 text-[10px] font-bold">
                        {(['hadir', 'izin', 'alfa'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleToggleAttendance(user.id, status)}
                            className={`px-2.5 py-1 rounded capitalize transition-all ${
                              currentStatus === status 
                                ? status === 'hadir' 
                                  ? 'bg-emerald-500 text-slate-950'
                                  : status === 'izin'
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950'
                                    : 'bg-red-650 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Notulensi */}
        <TabsContent value="notulensi">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notulensi Hasil Sidang</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Catatan resmi keputusan sidang, risalah, dan kesepakatan.</p>
                </div>
                <Button 
                  onClick={handleSaveNotulensi}
                  disabled={isSavingNotulen}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shrink-0 h-9"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {isSavingNotulen ? 'Menyimpan...' : 'Simpan Notulensi'}
                </Button>
              </div>

              <textarea
                value={notulensiText}
                onChange={(e) => setNotulensiText(e.target.value)}
                placeholder="Tulis ringkasan notulensi hasil rapat di sini. Sertakan keputusan penting, jumlah perolehan suara (jika ada voting), dan tindak lanjut..."
                rows={10}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Dokumen */}
        <TabsContent value="dokumen">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Berkas Sidang Terlampir</h3>
                
                {/* Real File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button 
                    asChild 
                    disabled={isUploading}
                    variant="outline" 
                    className="border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white h-9 cursor-pointer"
                  >
                    <label htmlFor="file-upload">
                      <Upload className="w-4 h-4 mr-1.5" /> 
                      {isUploading ? 'Mengunggah...' : 'Unggah Berkas'}
                    </label>
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {documents.map((doc, i) => (
                  <div key={i} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-8 h-8 text-amber-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{doc.name}</h4>
                        <span className="text-[10px] text-slate-500 block">{doc.size || 'Unknown size'}</span>
                      </div>
                    </div>
                    {doc.url !== '#' ? (
                      <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-900">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-900" onClick={() => alert(`Mengunduh berkas ${doc.name} (Mock)`)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog 
        isOpen={deleteModal} 
        onClose={() => setDeleteModal(false)}
        onConfirm={executeDelete}
        title="Hapus Sidang?"
        description="Apakah Anda yakin ingin menghapus sidang ini? Tindakan ini tidak dapat dibatalkan."
        isLoading={isDeleting}
      />
    </div>
  );
}
