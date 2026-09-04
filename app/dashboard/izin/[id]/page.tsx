'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  CalendarCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  Phone, 
  Mail, 
  Building, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Trash2, 
  Loader2, 
  Send,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

export default function DetailIzinPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;

  const [izin, setIzin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [catatanDpm, setCatatanDpm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentUser = session?.user as any;
  // Khusus Ketua DPM / Pimpinan / Admin
  const isAuthorizedToApprove = 
    currentUser?.role === 'pimpinan' || 
    currentUser?.role === 'admin' || 
    (currentUser?.jabatan && currentUser.jabatan.toLowerCase().includes('ketua'));

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/izin/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIzin(data);
        if (data.catatan_dpm) {
          setCatatanDpm(data.catatan_dpm);
        }
      } else {
        setErrorMsg('Data permohonan izin tidak ditemukan.');
      }
    } catch (err) {
      setErrorMsg('Gagal memuat detail permohonan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus: 'disetujui' | 'ditolak' | 'perlu_revisi') => {
    if (!isAuthorizedToApprove) {
      setErrorMsg('Hanya Ketua DPM atau Pimpinan yang memiliki wewenang persetujuan izin kegiatan.');
      return;
    }

    if ((newStatus === 'ditolak' || newStatus === 'perlu_revisi') && !catatanDpm.trim()) {
      setErrorMsg('Mohon cantumkan catatan alasan penolakan atau perbaikan permohonan.');
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/izin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          catatan_dpm: catatanDpm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui status');
      }

      setIzin(data);
      const statusLabels = {
        disetujui: 'Izin kegiatan berhasil DISETUJUI!',
        ditolak: 'Permohonan izin kegiatan telah DITOLAK.',
        perlu_revisi: 'Permintaan perbaikan/revisi telah dikirim ke pemohon.',
      };
      setSuccessMsg(statusLabels[newStatus]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus arsip permohonan izin ini?')) return;

    try {
      const res = await fetch(`/api/izin/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/izin');
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert('Gagal menghapus');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
        <p className="text-sm">Memuat detail permohonan izin...</p>
      </div>
    );
  }

  if (!izin) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Izin Tidak Ditemukan</h2>
        <Link href="/dashboard/izin" className="mt-4 inline-block">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar
          </Button>
        </Link>
      </div>
    );
  }

  const cleanPhone = izin.no_hp_pj?.replace(/[^0-9]/g, '');
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Halo ${izin.penanggung_jawab}, mengenai permohonan izin kegiatan "${izin.nama_kegiatan}" (Kode: ${izin.kode}) oleh DPM ITB Riau...`)}`
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/izin">
            <Button size="icon" variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                {izin.kode}
              </span>
              <StatusBadge status={izin.status} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
              {izin.nama_kegiatan}
            </h1>
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 self-start sm:self-auto gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Arsip
          </Button>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Detail Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gold-400" />
                  Rincian Acara & Waktu
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block mb-1">Organisasi Penyelenggara</span>
                    <span className="text-white font-bold text-sm">{izin.penyelenggara}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block mb-1">Lokasi Kegiatan</span>
                    <span className="text-white font-bold text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      {izin.lokasi}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block mb-1">Tanggal Pelaksanaan</span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      {izin.tanggal_mulai}
                      {izin.tanggal_selesai && izin.tanggal_selesai !== izin.tanggal_mulai
                        ? ` s/d ${izin.tanggal_selesai}`
                        : ''}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block mb-1">Waktu & Estimasi Peserta</span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      {izin.waktu_mulai} WIB ({izin.estimasi_peserta || 0} Peserta)
                    </span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="border-t border-slate-800 pt-5">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold-400" />
                  Deskripsi & Rancangan Acara
                </h3>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {izin.deskripsi}
                </div>
              </div>

              {/* Berkas Proposal */}
              {izin.lampiran && (
                <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Tautan Dokumen / Proposal</span>
                    <span className="text-xs text-slate-500 truncate max-w-md block">{izin.lampiran}</span>
                  </div>
                  <a
                    href={izin.lampiran}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 gap-1.5">
                      <ExternalLink className="w-4 h-4" />
                      Buka Dokumen
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Riwayat */}
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" />
                Riwayat Status & Catatan
              </h3>
              <div className="space-y-4">
                {izin.timeline && izin.timeline.length > 0 ? (
                  izin.timeline.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-400 mt-1.5 ring-4 ring-gold-400/20 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {item.keterangan}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ({item.tanggal})
                          </span>
                        </div>
                        {item.petugas && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Petugas: {item.petugas}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Belum ada riwayat update.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact PJ & Approval Box */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-gold-400" />
                Penanggung Jawab Kegiatan
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Nama Lengkap PJ</span>
                  <span className="text-white font-bold text-sm">{izin.penanggung_jawab}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Kontak WhatsApp</span>
                  <span className="text-white font-mono">{izin.no_hp_pj}</span>
                </div>

                {izin.email_pj && (
                  <div>
                    <span className="text-slate-500 block">Email Tembusan</span>
                    <span className="text-slate-300 font-mono">{izin.email_pj}</span>
                  </div>
                )}
              </div>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2"
                >
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md shadow-emerald-900/30"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Hubungi via WhatsApp
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Panel Keputusan Ketua DPM */}
          <Card className={`border shadow-xl ${
            isAuthorizedToApprove ? 'bg-slate-900/90 border-gold-500/30' : 'bg-slate-900/40 border-slate-800'
          }`}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wider text-gold-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Keputusan Ketua DPM
                </h3>
                {isAuthorizedToApprove && (
                  <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded font-semibold border border-gold-500/30">
                    Otorisasi Pimpinan
                  </span>
                )}
              </div>

              {isAuthorizedToApprove ? (
                <>
                  <p className="text-xs text-slate-400">
                    Sebagai Ketua DPM / Pimpinan, Anda memiliki wewenang untuk menyetujui, meminta perbaikan berkas, atau menolak izin ini.
                  </p>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Catatan / Disposisi Resmi:
                    </label>
                    <Textarea
                      rows={3}
                      value={catatanDpm}
                      onChange={(e) => setCatatanDpm(e.target.value)}
                      placeholder="Tuliskan arahan, syarat ruangan, atau alasan revisi/penolakan..."
                      className="bg-slate-950/80 border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => handleUpdateStatus('disetujui')}
                      disabled={actionLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 py-2"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Setujui Izin Kegiatan
                    </Button>

                    <Button
                      onClick={() => handleUpdateStatus('perlu_revisi')}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs gap-2 py-2"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                      Minta Perbaikan / Revisi
                    </Button>

                    <Button
                      onClick={() => handleUpdateStatus('ditolak')}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs gap-2 py-2"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Tolak Permohonan
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Wewenang Terbatas
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hanya <strong>Ketua DPM</strong> atau <strong>Pimpinan</strong> yang berwenang mengambil keputusan resmi atas permohonan izin kegiatan ini.
                  </p>
                  {izin.catatan_dpm && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                      <span className="text-slate-500 block mb-1">Catatan Pimpinan:</span>
                      <p className="text-slate-200">{izin.catatan_dpm}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
