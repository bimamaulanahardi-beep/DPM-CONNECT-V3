'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  ArrowLeft,
  User,
  Mail,
  AlertTriangle,
  CheckCircle,
  Copy,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { generateTrackingCode } from '@/lib/utils';
import { AspirasiKategori } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AspirasiFormPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isAnonim, setIsAnonim] = useState(false);
  const [kategori, setKategori] = useState<AspirasiKategori>('fasilitas');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState('');

  const handleNext = () => {
    if (step === 1 && (!judul || !deskripsi)) {
      toast({ title: 'Mohon Lengkapi Data', description: 'Silakan isi judul dan deskripsi aspirasi Anda.', variant: 'destructive' });
      return;
    }
    if (step === 2 && !isAnonim && (!nama || !nim || !email)) {
      toast({ title: 'Mohon Lengkapi Identitas', description: 'Silakan isi nama, NIM, dan email kampus Anda atau pilih opsi Kirim Sebagai Anonim.', variant: 'destructive' });
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!agreeTerms) {
      toast({ title: 'Persetujuan Diperlukan', description: 'Anda harus menyetujui pernyataan kebenaran data.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const trackingCode = generateTrackingCode();

    try {
      const res = await fetch('/api/aspirasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          kategori,
          is_anonim: isAnonim,
          nama_pengaju: isAnonim ? '' : nama,
          nim_pengaju: isAnonim ? '' : nim,
          email_pengaju: isAnonim ? '' : email,
          kode_tracking: trackingCode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedCode(trackingCode);
        setStep(4);
      } else {
        toast({ title: 'Gagal Mengirim', description: data.error || 'Gagal mengirimkan aspirasi', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Kesalahan Jaringan', description: 'Terjadi kesalahan jaringan.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode);
    toast({ title: 'Berhasil Disalin!', description: 'Kode tracking telah disalin ke clipboard.' });
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
              <span className="text-xs text-slate-400 tracking-wider">ITB RIAU</span>
            </div>
          </Link>

          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Banner */}
      <section className="relative py-12 overflow-hidden bg-slate-900/30 border-b border-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Wadah Aspirasi Mahasiswa
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-sans">
            Sampaikan keluhan, saran, kritik, atau rekomendasi Anda secara aman. DPM akan meninjau dan memperjuangkannya ke pihak kampus.
          </p>
        </div>
      </section>

      {/* Form Content Area */}
      <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-start max-w-xl">
        <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 relative">
          
          {/* Stepper indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-8 text-[11px] font-bold text-slate-500 tracking-wider">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-amber-500' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-850'}`}>1</span>
                ASPIRASI
              </div>
              <div className="flex-1 h-[1px] bg-slate-800 mx-4" />
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-amber-500' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-850'}`}>2</span>
                PENGIRIM
              </div>
              <div className="flex-1 h-[1px] bg-slate-800 mx-4" />
              <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-amber-500' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-850'}`}>3</span>
                PREVIEW
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="kategori" className="text-slate-300">Kategori Aspirasi</Label>
                  <select
                    id="kategori"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as AspirasiKategori)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 capitalize"
                  >
                    <option value="akademik">Akademik & Kurikulum</option>
                    <option value="fasilitas">Fasilitas Kampus & Sarana</option>
                    <option value="kemahasiswaan">Kesejahteraan & Advokasi Mahasiswa</option>
                    <option value="organisasi">Kemahasiswaan & Ormawa</option>
                    <option value="lainnya">Lain-lain</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="judul" className="text-slate-300">Judul Aspirasi</Label>
                  <Input
                    id="judul"
                    type="text"
                    placeholder="Contoh: AC Rusak di Lab Komputer"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi" className="text-slate-300">Deskripsi Detail</Label>
                  <textarea
                    id="deskripsi"
                    rows={6}
                    placeholder="Jelaskan secara rinci permasalahan, saran, atau keluhan Anda. Masukkan kronologi atau solusi yang disarankan."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
                  >
                    Lanjutkan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div className="flex items-center space-x-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-6">
                  <Checkbox 
                    id="anonim" 
                    checked={isAnonim} 
                    onCheckedChange={(checked) => setIsAnonim(!!checked)}
                    className="border-slate-700 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-950"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="anonim" className="text-sm font-bold text-white cursor-pointer select-none">
                      Kirim Sebagai Anonim
                    </Label>
                    <p className="text-[10px] text-slate-500">
                      Identitas Anda tidak akan ditampilkan ke publik maupun petugas, namun tetap terverifikasi oleh sistem.
                    </p>
                  </div>
                </div>

                {!isAnonim && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="text-slate-300">Nama Lengkap</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          id="nama"
                          type="text"
                          placeholder="Masukkan nama lengkap Anda"
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          className="pl-10 bg-slate-950/50 border-slate-800 text-white focus-visible:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nim" className="text-slate-300">NIM</Label>
                        <Input
                          id="nim"
                          type="text"
                          placeholder="Contoh: 2022005001"
                          value={nim}
                          onChange={(e) => setNim(e.target.value)}
                          className="bg-slate-950/50 border-slate-800 text-white focus-visible:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email Kampus</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="nama@mahasiswa.itbriau.ac.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-slate-950/50 border-slate-800 text-white focus-visible:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleBack} 
                    variant="outline" 
                    className="w-1/3 border-slate-800 text-slate-300 hover:text-white bg-slate-950"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
                  >
                    Lanjutkan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-4 text-xs bg-slate-950/40 p-5 rounded-xl border border-slate-900 leading-relaxed font-sans">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] mb-1">Kategori</span>
                    <span className="text-amber-500 font-bold capitalize">{kategori}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] mb-1">Judul</span>
                    <span className="text-white font-bold">{judul}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] mb-1">Deskripsi</span>
                    <p className="text-slate-300 whitespace-pre-wrap">{deskripsi}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] mb-1">Identitas Pengaju</span>
                    <span className="text-slate-300">
                      {isAnonim ? 'Anonim (Tersembunyi)' : `${nama} (${nim}) — ${email}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-500/80 rounded-xl leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <p>Aspirasi ini akan diproses secara transparan. Setiap pemalsuan data atau konten provokatif SARA dapat ditindak oleh DPM.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="agree" 
                    checked={agreeTerms} 
                    onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                    className="border-slate-700 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-950"
                  />
                  <Label htmlFor="agree" className="text-xs text-slate-400 select-none cursor-pointer">
                    Saya menyatakan data ini benar & siap dihubungi jika diperlukan informasi tambahan.
                  </Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleBack} 
                    variant="outline" 
                    className="w-1/3 border-slate-800 text-slate-300 bg-slate-950"
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold"
                    disabled={isSubmitting || !agreeTerms}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Aspirasi'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Aspirasi Berhasil Dikirim</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Terima kasih atas kontribusi Anda. Simpan Kode Tracking di bawah untuk memantau status tindak lanjut aspirasi Anda secara real-time.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between gap-4 max-w-sm mx-auto">
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">KODE TRACKING</span>
                    <span className="text-base font-bold text-amber-500">{createdCode}</span>
                  </div>
                  <Button onClick={handleCopyCode} variant="ghost" size="sm" className="h-9 w-9 p-0 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                  <Button asChild className="flex-1 bg-slate-800 hover:bg-slate-750 text-white border border-slate-750">
                    <Link href="/aspirasi/lacak" className="flex items-center gap-1 justify-center">
                      Lacak Aspirasi <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
                    <Link href="/">Kembali ke Beranda</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-slate-500 text-xs text-center">
        <p>&copy; {new Date().getFullYear()} DPM ITB Riau. Layanan Advokasi & Aspirasi.</p>
      </footer>
    </div>
  );
}
