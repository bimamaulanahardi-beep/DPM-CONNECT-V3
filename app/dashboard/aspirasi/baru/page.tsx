'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { mockAspirasi } from '@/lib/mock-data/aspirasi';
import { generateTrackingCode } from '@/lib/utils';
import { AspirasiKategori } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function BaruAspirasiPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<AspirasiKategori>('fasilitas');
  const [deskripsi, setDeskripsi] = useState('');
  const [isAnonim, setIsAnonim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = session?.user as any;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !deskripsi) {
      alert('Judul dan Deskripsi aspirasi harus diisi');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const code = generateTrackingCode();
      
      mockAspirasi.push({
        id: 'ASP-' + Math.floor(Math.random() * 1000),
        kode_tracking: code,
        judul,
        deskripsi,
        kategori,
        status: 'diterima',
        is_anonim: isAnonim,
        nama_pengaju: isAnonim ? undefined : user?.name,
        nim_pengaju: isAnonim ? undefined : user?.nim,
        email_pengaju: isAnonim ? undefined : user?.email,
        tanggal_masuk: new Date().toISOString().split('T')[0],
        tanggal_update: new Date().toISOString().split('T')[0],
        timeline: [
          { status: 'diterima', keterangan: 'Aspirasi diterima oleh sistem DPM Connect', tanggal: new Date().toISOString().split('T')[0] }
        ]
      });

      setIsSubmitting(false);

      toast({
        title: 'Aspirasi Terkirim',
        description: `Aspirasi berhasil diusulkan dengan Kode Tracking: ${code}`,
      });

      router.push('/dashboard/aspirasi');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <Link 
        href="/dashboard/aspirasi" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Aspirasi
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-sans">Kirim Aspirasi Baru</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Gunakan formulir ini untuk mengajukan aspirasi resmi Anda langsung ke DPM ITB Riau.</p>
      </div>

      <Card className="bg-slate-900/40 border-slate-800">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="kategori" className="text-slate-355 font-semibold text-xs">Kategori Masalah *</Label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as AspirasiKategori)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 capitalize font-sans"
              >
                <option value="akademik">Akademik & Kurikulum</option>
                <option value="fasilitas">Fasilitas Kampus & Sarana</option>
                <option value="kemahasiswaan">Kesejahteraan & Advokasi Mahasiswa</option>
                <option value="organisasi">Kemahasiswaan & Ormawa</option>
                <option value="lainnya">Lain-lain</option>
              </select>
            </div>

            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="judul" className="text-slate-355 font-semibold text-xs">Judul Aspirasi *</Label>
              <Input
                id="judul"
                type="text"
                placeholder="Contoh: Perbaikan Kursi Rusak di Ruang 304 Gedung B"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-650 focus-visible:ring-amber-500 font-sans"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="deskripsi" className="text-slate-355 font-semibold text-xs">Detail Pengaduan / Usulan *</Label>
              <textarea
                id="deskripsi"
                rows={6}
                placeholder="Jelaskan secara detail permasalahan, lokasi, dampak, dan rekomendasi solusi yang Anda usulkan..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-xs sm:text-sm text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Anonim */}
            <div className="flex items-center space-x-2.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <Checkbox 
                id="anonim" 
                checked={isAnonim} 
                onCheckedChange={(checked) => setIsAnonim(!!checked)}
                className="border-slate-700 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-950"
                disabled={isSubmitting}
              />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="anonim" className="text-xs font-bold text-white cursor-pointer select-none">
                  Kirim Sebagai Anonim
                </Label>
                <p className="text-[9px] text-slate-500">
                  Identitas Anda tidak akan ditampilkan ke publik maupun petugas moderasi, namun tetap terverifikasi oleh sistem.
                </p>
              </div>
            </div>

            {/* Info panel */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl leading-relaxed text-xs text-amber-500/80">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <p>Setiap laporan yang masuk akan segera diverifikasi oleh Tim Komisi III (Aspirasi & Kemahasiswaan). Pengirim berhak mendapatkan status pemantauan alur.</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-800/60 font-sans">
              <Button 
                type="button"
                onClick={() => router.push('/dashboard/aspirasi')}
                variant="outline" 
                className="w-1/3 border-slate-800 text-slate-400 hover:text-white bg-slate-950"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" /> Kirim Aspirasi
                  </>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
