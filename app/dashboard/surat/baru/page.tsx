'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft,
  Mail,
  Upload,
  X,
  FileText,
  Loader2,
  PenLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SignaturePad } from '@/components/common/signature-pad';

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
  const [lampiranFile, setLampiranFile] = useState<File | null>(null);
  const [isUploadingLampiran, setIsUploadingLampiran] = useState(false);
  const [tandaTangan, setTandaTangan] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perihal || !kepada || !isi) {
      alert('Mohon isi Perihal, Penerima, dan Isi Surat');
      return;
    }

    setIsSubmitting(true);
    const user = session?.user as any;

    try {
      // Upload lampiran file if any
      let lampiranList: any[] = [];
      if (lampiranFile) {
        setIsUploadingLampiran(true);
        const formData = new FormData();
        formData.append('file', lampiranFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        setIsUploadingLampiran(false);
        if (!uploadRes.ok) throw new Error('Gagal mengunggah lampiran.');
        const uploadData = await uploadRes.json();
        lampiranList = [{ name: uploadData.name, url: uploadData.url, fileId: uploadData.fileId }];
      }

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
          lampiran: lampiranList.length > 0 ? lampiranList : null,
          tanda_tangan: tandaTangan || null,
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

              {/* Lampiran Upload */}
              <div className="space-y-2">
                <Label className="text-slate-355 font-semibold text-xs">Lampiran Surat (Opsional)</Label>
                {lampiranFile ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-700 rounded-lg">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs text-slate-300 flex-1 truncate">{lampiranFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setLampiranFile(null)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setLampiranFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex items-center gap-2 p-3 bg-slate-950/60 border border-dashed border-slate-700 rounded-lg hover:border-amber-500/40 transition-colors">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-500">Klik untuk unggah lampiran (PDF/Word/Gambar)</span>
                    </div>
                  </label>
                )}
              </div>

              {/* Tanda Tangan Digital */}
              <div className="space-y-2 border-t border-slate-800/60 pt-4">
                <Label className="text-slate-355 font-semibold text-xs flex items-center gap-2">
                  <PenLine className="w-3.5 h-3.5 text-amber-500" />
                  Tanda Tangan Digital (Opsional)
                </Label>
                {!showSignaturePad && !tandaTangan && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSignaturePad(true)}
                    className="w-full border-dashed border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 hover:bg-slate-950 h-10"
                  >
                    <PenLine className="w-4 h-4 mr-2" />
                    Klik untuk Bubuhkan Tanda Tangan
                  </Button>
                )}
                {showSignaturePad && !tandaTangan && (
                  <div className="p-3 bg-slate-950/60 border border-slate-700 rounded-lg">
                    <p className="text-xs text-slate-400 mb-3">Tanda tangani di kanvas putih di bawah ini menggunakan mouse atau jari:</p>
                    <SignaturePad
                      onSave={(data) => {
                        if (data) {
                          setTandaTangan(data);
                          setShowSignaturePad(false);
                        }
                      }}
                      width={360}
                      height={160}
                    />
                  </div>
                )}
                {tandaTangan && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <div className="bg-white rounded p-1 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tandaTangan} alt="TTD" className="h-10 w-auto object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-emerald-400 font-semibold">✓ Tanda Tangan Tersimpan</p>
                      <p className="text-[10px] text-slate-500">Akan ditampilkan di bagian bawah kanan surat.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setTandaTangan(null); setShowSignaturePad(false); }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
              <div className="text-center space-y-2 w-48">
                <div>
                  <span className="block leading-none">Hormat Kami,</span>
                  <span className="block font-bold">Ketua DPM ITB Riau</span>
                </div>
                {tandaTangan ? (
                  <div className="flex justify-center py-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tandaTangan} alt="Tanda Tangan" className="h-16 w-auto object-contain" />
                  </div>
                ) : (
                  <div className="h-16 flex items-end justify-center">
                    <span className="text-[9px] text-slate-400 italic">(tanda tangan)</span>
                  </div>
                )}
                <div>
                  <span className="block font-bold underline">{(session?.user as any)?.name || 'Ahmad Fadhillah Ramadhan'}</span>
                  <span className="text-[8px] text-slate-500 block">NIM: {(session?.user as any)?.nim || '2021001001'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
