'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function BaruSuratPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [nomor, setNomor] = useState('016/DPM-ITBR/VI/2026');
  const [perihal, setPerihal] = useState('');
  const [kepada, setKepada] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [isi, setIsi] = useState('Dengan hormat,\nSehubungan dengan akan dilaksanakannya agenda Rapat Koordinasi Tahunan DPM ITB Riau, kami mengundang Saudara/i untuk hadir pada:\n\nHari/Tanggal: ...\nWaktu: ...\nTempat: ...\n\nDemikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Saudara/i, kami ucapkan terima kasih.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perihal || !kepada || !isi) {
      alert('Mohon isi Perihal, Penerima, dan Isi Surat');
      return;
    }

    setIsSubmitting(true);
    const user = session?.user as any;

    try {
      const res = await fetch('/api/surat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomor,
          perihal,
          jenis: 'keluar',
          status: 'terkirim',
          dari: 'DPM ITB Riau',
          kepada,
          tanggal,
          isi_singkat: isi,
          created_by: user?.id || '1',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Surat Keluar Dibuat',
          description: 'Draft surat berhasil disimpan dan terdaftar sebagai arsip keluar.',
        });
        router.push('/dashboard/surat');
      } else {
        toast({
          title: 'Gagal Menyimpan Surat',
          description: data.error || 'Terjadi kesalahan.',
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/surat" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Surat
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Buat Surat Keluar Baru</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Formulir draft persuratan dengan template kop surat otomatis DPM ITB Riau.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Input Form */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Nomor Surat */}
              <div className="space-y-2">
                <Label htmlFor="nomor" className="text-slate-350 font-semibold text-xs">Nomor Surat *</Label>
                <Input
                  id="nomor"
                  type="text"
                  value={nomor}
                  onChange={(e) => setNomor(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 font-sans"
                  required
                />
              </div>

              {/* Perihal */}
              <div className="space-y-2">
                <Label htmlFor="perihal" className="text-slate-355 font-semibold text-xs">Perihal Surat *</Label>
                <Input
                  id="perihal"
                  type="text"
                  placeholder="Contoh: Undangan Sidang Paripurna Luar Biasa"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-650 focus-visible:ring-amber-500"
                  required
                />
              </div>

              {/* Penerima */}
              <div className="space-y-2">
                <Label htmlFor="kepada" className="text-slate-355 font-semibold text-xs">Penerima Surat (Kepada) *</Label>
                <Input
                  id="kepada"
                  type="text"
                  placeholder="Contoh: Ketua BEM ITB Riau atau Rektorat ITB Riau"
                  value={kepada}
                  onChange={(e) => setKepada(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-650 focus-visible:ring-amber-500"
                  required
                />
              </div>

              {/* Tanggal */}
              <div className="space-y-2">
                <Label htmlFor="tanggal" className="text-slate-355 font-semibold text-xs">Tanggal Surat *</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 font-sans"
                  required
                />
              </div>

              {/* Isi Surat */}
              <div className="space-y-2">
                <Label htmlFor="isi" className="text-slate-355 font-semibold text-xs">Isi Surat / Pesan Utama *</Label>
                <textarea
                  id="isi"
                  rows={8}
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800/60">
                <Button 
                  type="button"
                  onClick={() => router.push('/dashboard/surat')}
                  variant="outline" 
                  className="w-1/3 border-slate-800 text-slate-400 hover:text-white bg-slate-950"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
                >
                  <Mail className="w-4 h-4 mr-1.5" /> 
                  {isSubmitting ? 'Menyimpan...' : 'Buat & Simpan Surat'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Right Side: Kop Surat Preview */}
        <div className="space-y-4">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">PREVIEW TAMPILAN CETAK</span>
          
          <div className="bg-slate-900/40 text-slate-900 p-8 sm:p-12 shadow-xl rounded-xl font-serif text-[10px] sm:text-xs leading-relaxed select-text min-h-[500px]">
            {/* Header / KOP SURAT */}
            <div className="text-center border-b-4 border-double border-slate-800 pb-4 mb-6">
              <h2 className="text-sm sm:text-base font-bold tracking-wider leading-normal">DEWAN PERWAKILAN MAHASISWA</h2>
              <h2 className="text-sm sm:text-base font-bold tracking-wider leading-none">INSTITUT TEKNOLOGI DAN BISNIS (ITB) RIAU</h2>
              <p className="text-[8px] sm:text-[9px] font-sans text-slate-600 mt-1.5 italic font-semibold">
                Gedung Kemahasiswaan Lt. 2, Jalan Sudirman No. 45, Pekanbaru, Riau &bull; Email: dpm@itbriau.ac.id
              </p>
            </div>

            {/* Letter Metadata */}
            <div className="flex justify-between items-start gap-4 mb-6 font-sans">
              <div className="space-y-0.5">
                <div>Nomor : {nomor || '........................................'}</div>
                <div>Perihal : <strong>{perihal || '........................................'}</strong></div>
                <div>Lampiran : -</div>
              </div>
              <div>
                Pekanbaru, {tanggal ? new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '.........................'}
              </div>
            </div>

            {/* Address */}
            <div className="mb-6 font-sans">
              <div>Kepada Yth.</div>
              <div className="font-bold">{kepada || '..........................................................'}</div>
              <div>Di tempat</div>
            </div>

            {/* Body Content */}
            <div className="whitespace-pre-line mb-10 font-serif leading-relaxed text-slate-800">
              {isi || 'Silakan isi konten pesan surat utama...'}
            </div>

            {/* Signature Block */}
            <div className="flex justify-end pt-6 font-sans">
              <div className="text-center space-y-16 w-48">
                <div>
                  <span className="block leading-none">Hormat Kami,</span>
                  <span className="block font-bold">Ketua DPM ITB Riau</span>
                </div>
                <div>
                  <span className="block font-bold underline">Ahmad Fadhillah Ramadhan</span>
                  <span className="text-[8px] text-slate-500 block">NIM: 2021001001</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
