'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LegislasiJenis } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function BaruLegislasiPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState<LegislasiJenis>('peraturan');
  const [komisi, setKomisi] = useState('Komisi I');
  const [isiRingkasan, setIsiRingkasan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['RUU', 'Kemahasiswaan']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !isiRingkasan) {
      alert('Mohon isi Judul dan Ringkasan Rancangan Undang-Undang');
      return;
    }

    setIsSubmitting(true);
    const user = session?.user as any;

    try {
      let fileUrl = '';
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Gagal mengunggah file.');
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
      }

      const res = await fetch('/api/legislasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judul,
          jenis,
          status: 'diajukan',
          komisi,
          pengaju: user?.id || '1',
          isi_ringkasan: isiRingkasan,
          konten: fileUrl,
          tags,
          revisi_ke: 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Draf RUU Diajukan',
          description: `Rancangan "${judul}" berhasil diusulkan ke Komisi terkait.`,
        });
        router.push('/dashboard/legislasi');
      } else {
        toast({
          title: 'Gagal Mengusulkan',
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
    <div className="space-y-6 max-w-3xl">
      {/* Back Link */}
      <Link 
        href="/dashboard/legislasi" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Legislasi
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Usulkan Rancangan Regulasi Baru</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Formulir inisiasi draf Peraturan Mahasiswa (RUU), Surat Keputusan, atau Ketetapan DPM.</p>
      </div>

      <Card className="bg-slate-900/40 border-slate-800">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Judul RUU */}
            <div className="space-y-2">
              <Label htmlFor="judul" className="text-slate-350 font-semibold text-xs">Judul Regulasi / RUU *</Label>
              <Input
                id="judul"
                type="text"
                placeholder="Contoh: Rancangan Peraturan tentang Tata Kelola Organisasi Kemahasiswaan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-655 focus-visible:ring-amber-500"
                required
              />
            </div>

            {/* Row: Jenis & Komisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenis" className="text-slate-350 font-semibold text-xs">Jenis Dokumen *</Label>
                <select
                  id="jenis"
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as LegislasiJenis)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 capitalize"
                >
                  <option value="peraturan">Peraturan Mahasiswa</option>
                  <option value="ketetapan">Ketetapan DPM</option>
                  <option value="keputusan">Surat Keputusan</option>
                  <option value="gbhk">GBHK</option>
                  <option value="tata_tertib">Tata Tertib</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="komisi" className="text-slate-350 font-semibold text-xs">Komisi Penanggung Jawab *</Label>
                <select
                  id="komisi"
                  value={komisi}
                  onChange={(e) => setKomisi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Komisi I">Komisi I (Hukum & Legislasi)</option>
                  <option value="Komisi II">Komisi II (Anggaran & Pengawasan)</option>
                  <option value="Komisi III">Komisi III (Aspirasi & Kemahasiswaan)</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-slate-350 font-semibold text-xs">Label / Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                  >
                    #{tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-550 hover:text-red-400 font-extrabold ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ketik tag lalu klik +"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-xs sm:text-sm text-white"
                />
                <Button 
                  type="button" 
                  onClick={handleAddTag}
                  className="bg-slate-800 hover:bg-slate-750 text-white shrink-0 text-xs h-9 px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Isi Ringkasan */}
            <div className="space-y-2">
              <Label htmlFor="ringkasan" className="text-slate-350 font-semibold text-xs">Isi Ringkasan (Deskripsi Singkat) *</Label>
              <textarea
                id="ringkasan"
                rows={3}
                placeholder="Deskripsikan ringkasan perihal RUU ini diajukan dan apa dampaknya bagi mahasiswa..."
                value={isiRingkasan}
                onChange={(e) => setIsiRingkasan(e.target.value)}
                className="w-full rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                required
              />
            </div>

            {/* Upload File Dokumen */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-slate-350 font-semibold text-xs">Unggah Dokumen RUU (PDF/Word)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-950/50 border border-slate-800 text-xs sm:text-sm text-slate-400 file:bg-slate-800 file:text-slate-300 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md file:text-xs hover:file:bg-slate-700"
                accept=".pdf,.doc,.docx"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800/60">
              <Button 
                type="button"
                onClick={() => router.push('/dashboard/legislasi')}
                variant="outline" 
                className="w-1/3 border-slate-800 text-slate-400 hover:text-white bg-slate-950"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
              >
                {isSubmitting ? 'Memproses...' : 'Ajukan Draf Regulasi'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
