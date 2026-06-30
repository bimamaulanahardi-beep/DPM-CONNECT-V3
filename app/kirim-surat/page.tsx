'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Mail,
  Upload,
  CheckCircle,
  Building2,
  User,
  FileText,
  ArrowLeft,
  Send,
  Loader2,
  X,
  AlertCircle,
  Phone,
} from 'lucide-react';

type Step = 'form' | 'success';

export default function KirimSuratPublikPage() {
  const [step, setStep] = useState<Step>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [kodeBalas, setKodeBalas] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama_pengirim: '',
    instansi: '',
    email_pengirim: '',
    nomor_surat: '',
    perihal: '',
    isi_singkat: '',
    tanggal: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimum 10MB.');
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(f.type)) {
      setError('Jenis file tidak diizinkan. Gunakan PDF, JPG, atau PNG.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nama_pengirim || !formData.instansi || !formData.perihal || !formData.isi_singkat) {
      setError('Mohon lengkapi semua kolom yang wajib diisi (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);

      const res = await fetch('/api/surat/publik', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok) {
        setKodeBalas(data.kode);
        setStep('success');
      } else {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch {
      setError('Tidak dapat menghubungi server. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Success animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Surat Berhasil Terkirim!</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Surat Anda telah diterima oleh sistem DPM ITB Riau dan sedang menunggu proses tinjauan dari tim kami.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left space-y-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kode Referensi Surat Anda</p>
            <p className="font-mono text-xl font-black text-amber-400 tracking-wider">{kodeBalas}</p>
            <p className="text-xs text-slate-500">Simpan kode ini sebagai bukti pengiriman surat Anda.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-sm text-slate-400 space-y-1">
            <p className="font-semibold text-white text-xs">Langkah Selanjutnya:</p>
            <p>📩 Tim DPM akan menindaklanjuti surat Anda melalui email yang Anda daftarkan.</p>
            <p>⏱️ Estimasi respon: <span className="text-amber-400 font-semibold">3-5 hari kerja</span></p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.08),_transparent_60%)]" />
        <div className="max-w-3xl mx-auto px-6 py-8 relative">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors mb-4 group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Portal Pengiriman Surat Masuk</h1>
              <p className="text-sm text-slate-400 mt-0.5">Dewan Perwakilan Mahasiswa — Institut Teknologi dan Bisnis (ITB) Riau</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-3xl mx-auto px-6 mt-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-blue-300">Informasi: </span>
            Formulir ini khusus untuk pengiriman surat resmi dari lembaga, organisasi, atau instansi kepada DPM ITB Riau secara digital. Surat akan langsung masuk ke sistem arsip kami.
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Identitas Pengirim */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-white uppercase tracking-wider">Identitas Pengirim</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Nama Lengkap Pengirim <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="nama_pengirim"
                    value={formData.nama_pengirim}
                    onChange={handleChange}
                    placeholder="Nama lengkap Anda"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Nama Instansi / Organisasi <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleChange}
                    placeholder="Contoh: BEM ITB Riau / UKM Futsal"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Email untuk Korespondensi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="email_pengirim"
                    type="email"
                    value={formData.email_pengirim}
                    onChange={handleChange}
                    placeholder="email@instansi.ac.id"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Tanggal Surat <span className="text-red-500">*</span></label>
                <input
                  name="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Detail Surat */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-white uppercase tracking-wider">Detail Surat</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Nomor Surat (jika ada)</label>
                  <input
                    name="nomor_surat"
                    value={formData.nomor_surat}
                    onChange={handleChange}
                    placeholder="Contoh: 001/BEM-ITBR/VI/2026"
                    className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Perihal Surat <span className="text-red-500">*</span></label>
                  <input
                    name="perihal"
                    value={formData.perihal}
                    onChange={handleChange}
                    placeholder="Contoh: Permohonan Kerjasama Acara"
                    className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Isi / Maksud Surat <span className="text-red-500">*</span></label>
                <textarea
                  name="isi_singkat"
                  value={formData.isi_singkat}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Jelaskan secara singkat maksud dan tujuan pengiriman surat ini..."
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload File */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-white uppercase tracking-wider">Lampiran Surat (Opsional)</h2>
            </div>
            <div className="p-6">
              {file ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="w-7 h-7 rounded-full bg-slate-800 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-slate-700 hover:border-slate-600'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">
                    Seret & lepas file di sini, atau <span className="text-amber-500 underline cursor-pointer">klik untuk memilih</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1.5">PDF, JPG, PNG — Maksimum 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim Surat...</>
            ) : (
              <><Send className="w-4 h-4" /> Kirim Surat ke DPM ITB Riau</>
            )}
          </button>

          <p className="text-center text-xs text-slate-600">
            Dengan mengirim surat ini, Anda menyetujui bahwa informasi yang diberikan adalah benar dan dapat dipertanggungjawabkan.
          </p>
        </form>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 mt-4">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© 2026 DPM Connect — Institut Teknologi dan Bisnis Riau</p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> dpm@itbriau.ac.id</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> Sekretariat Kemahasiswaan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
