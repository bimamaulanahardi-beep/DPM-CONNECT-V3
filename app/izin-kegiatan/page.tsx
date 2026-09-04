'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  ArrowLeft, 
  CalendarCheck, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  User, 
  Phone, 
  Mail,
  Building,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

export default function IzinKegiatanPage() {
  const [activeTab, setActiveTab] = useState<'ajukan' | 'lacak'>('ajukan');

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [submittedIzin, setSubmittedIzin] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    penyelenggara: '',
    penanggung_jawab: '',
    no_hp_pj: '',
    email_pj: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi: '',
    estimasi_peserta: '',
    deskripsi: '',
    lampiran: '',
  });

  // Tracking state
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nama_kegiatan || !formData.penyelenggara || !formData.penanggung_jawab || 
        !formData.no_hp_pj || !formData.tanggal_mulai || !formData.lokasi || !formData.deskripsi) {
      setFormError('Mohon lengkapi semua bidang bertanda bintang (*)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/izin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengajukan izin kegiatan');
      }

      setSubmittedIzin(data);
      setFormData({
        nama_kegiatan: '',
        penyelenggara: '',
        penanggung_jawab: '',
        no_hp_pj: '',
        email_pj: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        waktu_mulai: '',
        waktu_selesai: '',
        lokasi: '',
        estimasi_peserta: '',
        deskripsi: '',
        lampiran: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSearchTracking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = trackingCode.trim();
    if (!code) return;

    setTrackingLoading(true);
    setTrackingSearched(true);
    setTrackingError(null);
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/izin/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setTrackingError(data.error || 'Permohonan izin dengan kode tersebut tidak ditemukan.');
      } else {
        setTrackingResult(data);
      }
    } catch (err) {
      setTrackingError('Gagal menghubungi server. Silakan coba beberapa saat lagi.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const switchToTracking = (code: string) => {
    setSubmittedIzin(null);
    setActiveTab('lacak');
    setTrackingCode(code);
    setTimeout(() => {
      handleDirectSearch(code);
    }, 100);
  };

  const handleDirectSearch = async (code: string) => {
    setTrackingLoading(true);
    setTrackingSearched(true);
    setTrackingError(null);
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/izin/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok) {
        setTrackingResult(data);
      } else {
        setTrackingError(data.error || 'Data tidak ditemukan');
      }
    } catch (e) {
      setTrackingError('Gagal memuat data');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-gold-500/30 selection:text-gold-200">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="lg" />
            <div>
              <span className="font-bold text-lg leading-none block tracking-wide text-white group-hover:text-gold-400 transition-colors">
                DPM CONNECT
              </span>
              <span className="text-xs text-slate-400 font-medium">ITB RIAU</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <Link href="/login">
              <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10">
                Portal DPM
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <CalendarCheck className="w-3.5 h-3.5" />
            Layanan Terpadu Kemahasiswaan
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Perizinan Kegiatan Mahasiswa & UKM
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Ajukan permohonan izin penyelenggaraan kegiatan kampus secara transparan dan pantau status persetujuan pimpinan DPM secara langsung.
          </p>

          {/* Tab Selector */}
          <div className="mt-8 flex justify-center">
            <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl flex items-center gap-1 shadow-lg shadow-black/40">
              <button
                type="button"
                onClick={() => setActiveTab('ajukan')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'ajukan'
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Send className="w-4 h-4" />
                Ajukan Permohonan Izin
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lacak')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'lacak'
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Search className="w-4 h-4" />
                Lacak Status Izin
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Form Pengajuan */}
        {activeTab === 'ajukan' && (
          <div>
            {submittedIzin ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-b from-slate-900 to-slate-900/80 border border-gold-500/30 rounded-2xl p-6 md:p-10 shadow-2xl text-center max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Permohonan Izin Berhasil Dikirim!</h2>
                <p className="text-slate-300 text-sm mb-6">
                  Permohonan kegiatan <strong className="text-gold-400">"{submittedIzin.nama_kegiatan}"</strong> telah masuk ke dalam antrean tinjauan Ketua DPM ITB Riau.
                </p>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6 text-left">
                  <span className="text-xs text-slate-400 block mb-1">Kode Pelacakan Izin:</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xl md:text-2xl font-bold text-gold-400 tracking-wider">
                      {submittedIzin.kode}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(submittedIzin.kode)}
                      className="border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-200 gap-1.5"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Tersalin' : 'Salin'}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Simpan kode ini untuk memeriksa perkembangan persetujuan izin Anda kapan saja.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => switchToTracking(submittedIzin.kode)}
                    className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Lacak Status Sekarang
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSubmittedIzin(null)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-850"
                  >
                    Ajukan Izin Lain
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl"
              >
                <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gold-400" />
                      Formulir Permohonan Izin Kegiatan
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pastikan informasi yang diisikan benar dan dapat dipertanggungjawabkan.
                    </p>
                  </div>
                  <span className="text-xs text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2.5 py-1 rounded-full font-medium">
                    Resmi DPM ITB Riau
                  </span>
                </div>

                {formError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Seksi 1: Informasi Kegiatan */}
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-gold-400" />
                      1. Informasi Kegiatan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Nama Kegiatan <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="nama_kegiatan"
                          value={formData.nama_kegiatan}
                          onChange={handleInputChange}
                          placeholder="Contoh: Seminar Nasional Teknologi & Digitalisasi 2026"
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Organisasi / Lembaga Penyelenggara <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="penyelenggara"
                          value={formData.penyelenggara}
                          onChange={handleInputChange}
                          placeholder="Contoh: HIMA Teknik Informatika / UKM Robotika"
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Lokasi / Tempat Acara <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="lokasi"
                          value={formData.lokasi}
                          onChange={handleInputChange}
                          placeholder="Contoh: Aula Utama ITB Riau / Lapangan / Zoom"
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Tanggal Mulai <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="date"
                          name="tanggal_mulai"
                          value={formData.tanggal_mulai}
                          onChange={handleInputChange}
                          className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Tanggal Selesai
                        </label>
                        <Input
                          type="date"
                          name="tanggal_selesai"
                          value={formData.tanggal_selesai}
                          onChange={handleInputChange}
                          className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Waktu Mulai <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="time"
                          name="waktu_mulai"
                          value={formData.waktu_mulai}
                          onChange={handleInputChange}
                          className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Waktu Selesai
                        </label>
                        <Input
                          type="time"
                          name="waktu_selesai"
                          value={formData.waktu_selesai}
                          onChange={handleInputChange}
                          className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Estimasi Jumlah Peserta (Orang)
                        </label>
                        <Input
                          type="number"
                          name="estimasi_peserta"
                          value={formData.estimasi_peserta}
                          onChange={handleInputChange}
                          placeholder="Contoh: 150"
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Tautan Berkas Proposal / Surat (Google Drive dll)
                        </label>
                        <Input
                          name="lampiran"
                          value={formData.lampiran}
                          onChange={handleInputChange}
                          placeholder="https://drive.google.com/file/..."
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Deskripsi & Ringkasan Rencana Kegiatan <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                          name="deskripsi"
                          rows={4}
                          value={formData.deskripsi}
                          onChange={handleInputChange}
                          placeholder="Jelaskan tujuan kegiatan, target sasaran peserta, serta bentuk acara secara ringkas..."
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seksi 2: Kontak Penanggung Jawab */}
                  <div className="border-t border-slate-800 pt-5">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-gold-400" />
                      2. Data Penanggung Jawab Kegiatan (PJ)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Nama Lengkap PJ <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="penanggung_jawab"
                          value={formData.penanggung_jawab}
                          onChange={handleInputChange}
                          placeholder="Nama Ketua Panitia / PJ"
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Nomor WhatsApp / HP Aktif <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="no_hp_pj"
                          value={formData.no_hp_pj}
                          onChange={handleInputChange}
                          placeholder="Contoh: 081234567890"
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Email PJ (Tembusan Konfirmasi)
                        </label>
                        <Input
                          type="email"
                          name="email_pj"
                          value={formData.email_pj}
                          onChange={handleInputChange}
                          placeholder="email@itbriau.ac.id"
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Permohonan akan diproses dan ditinjau oleh Ketua DPM ITB Riau.
                    </span>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-2.5 gap-2 shadow-lg shadow-gold-500/20"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengirimkan...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Kirim Permohonan Izin
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab 2: Lacak Status Permohonan */}
        {activeTab === 'lacak' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Search Input Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-gold-400" />
                Lacak Status Permohonan Izin
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Masukkan Kode Izin (contoh: <code className="text-gold-400">IZN-XXXXX</code>) yang Anda dapatkan saat mengajukan permohonan.
              </p>
              <form onSubmit={handleSearchTracking} className="flex gap-2">
                <Input
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Masukkan Kode Izin..."
                  className="bg-slate-950/70 border-slate-800 text-white font-mono placeholder:font-sans focus:border-gold-500 uppercase"
                />
                <Button
                  type="submit"
                  disabled={trackingLoading || !trackingCode.trim()}
                  className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold gap-2 px-5 flex-shrink-0"
                >
                  {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Cek Status
                </Button>
              </form>
            </div>

            {/* Error state */}
            {trackingError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}

            {/* Result Display */}
            {trackingResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-400">Kode: {trackingResult.kode}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">Diajukan: {trackingResult.tanggal_diajukan}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      {trackingResult.nama_kegiatan}
                    </h3>
                    <p className="text-xs text-gold-400 font-medium mt-0.5">
                      Penyelenggara: {trackingResult.penyelenggara}
                    </p>
                  </div>
                  <div>
                    <StatusBadge status={trackingResult.status} />
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gold-400" /> Tanggal Acara
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {trackingResult.tanggal_mulai}
                      {trackingResult.tanggal_selesai && trackingResult.tanggal_selesai !== trackingResult.tanggal_mulai
                        ? ` s/d ${trackingResult.tanggal_selesai}`
                        : ''}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gold-400" /> Waktu
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {trackingResult.waktu_mulai}
                      {trackingResult.waktu_selesai ? ` - ${trackingResult.waktu_selesai}` : ''} WIB
                    </span>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" /> Lokasi
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {trackingResult.lokasi}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-gold-400" /> Penanggung Jawab
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {trackingResult.penanggung_jawab}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-gold-400" /> Estimasi Peserta
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {trackingResult.estimasi_peserta || 0} Orang
                    </span>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-400" /> Diproses Oleh
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {trackingResult.diproses_oleh || 'Menunggu verifikasi Ketua DPM'}
                    </span>
                  </div>
                </div>

                {/* Catatan Ketua DPM jika ada */}
                {trackingResult.catatan_dpm && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-xs font-bold text-amber-400 block mb-1">
                      Catatan Resmi Ketua DPM ITB Riau:
                    </span>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">
                      {trackingResult.catatan_dpm}
                    </p>
                  </div>
                )}

                {/* Deskripsi Kegiatan */}
                <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    Ringkasan Kegiatan:
                  </span>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {trackingResult.deskripsi}
                  </p>
                </div>

                {/* Timeline Pelacakan */}
                <div className="border-t border-slate-800 pt-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Riwayat Perkembangan Permohonan
                  </h4>
                  <div className="space-y-4">
                    {trackingResult.timeline && trackingResult.timeline.length > 0 ? (
                      trackingResult.timeline.map((item: any, idx: number) => (
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
                                Oleh: {item.petugas}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">Belum ada riwayat update lanjutan.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} DPM ITB Riau — Dewan Perwakilan Mahasiswa Institut Teknologi & Bisnis Riau</p>
      </footer>
    </div>
  );
}
