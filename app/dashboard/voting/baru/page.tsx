'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Vote,
  AlignLeft,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function VotingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sidangId = searchParams?.get('sidang_id') || '';
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    jenis: 'binary',
    status: 'dijadwalkan',
    quorum_required: '50',
    total_pemilih: '',
    sidang_id: sidangId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.deskripsi) {
      toast({
        title: 'Formulir Tidak Lengkap',
        description: 'Judul dan Deskripsi wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          judul: formData.judul,
          deskripsi: formData.deskripsi,
          jenis: formData.jenis,
          status: formData.status,
          quorum_required: Number(formData.quorum_required),
          total_pemilih: Number(formData.total_pemilih),
          sidang_id: formData.sidang_id || null,
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Voting Berhasil Dibuat',
          description: 'Sesi pemungutan suara telah disimpan.',
        });
        if (formData.sidang_id) {
          router.push(`/dashboard/sidang/${formData.sidang_id}`);
        } else {
          router.push('/dashboard/voting');
        }
      } else {
        toast({
          title: 'Gagal Membuat Voting',
          description: data.error || 'Terjadi kesalahan pada server.',
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
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link 
            href={sidangId ? `/dashboard/sidang/${sidangId}` : "/dashboard/voting"} 
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {sidangId ? 'Kembali ke Sidang' : 'Kembali ke Daftar Voting'}
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Buat Sesi Voting Baru</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Persiapkan sesi pemungutan suara untuk pengambilan keputusan.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-slate-900/40 border border-slate-800 overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="divide-y divide-slate-800/60">
            {/* General Info Section */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 text-amber-500 mb-4">
                <AlignLeft className="w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-wider text-white">Informasi Umum</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="judul" className="text-slate-300">Judul Sesi Voting <span className="text-red-500">*</span></Label>
                  <Input 
                    id="judul" 
                    name="judul" 
                    placeholder="Contoh: Pengesahan RUU Pemilu Raya 2026" 
                    value={formData.judul}
                    onChange={handleChange}
                    className="bg-slate-850 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi" className="text-slate-300">Deskripsi / Latar Belakang <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="deskripsi" 
                    name="deskripsi" 
                    rows={4} 
                    placeholder="Jelaskan secara singkat apa yang sedang di-votingkan..."
                    value={formData.deskripsi}
                    onChange={handleChange}
                    className="bg-slate-850 border-slate-800 resize-none text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidang_id" className="text-slate-300">Tautkan ke ID Sidang (Opsional)</Label>
                    <Input 
                      id="sidang_id" 
                      name="sidang_id" 
                      placeholder="Contoh: SID-001" 
                      value={formData.sidang_id}
                      onChange={handleChange}
                      className="bg-slate-850 border-slate-800 font-mono text-sm text-white"
                    />
                    <p className="text-[10px] text-slate-400">Biarkan kosong jika voting independen.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jenis" className="text-slate-300">Jenis Voting</Label>
                    <select 
                      id="jenis" 
                      name="jenis" 
                      value={formData.jenis}
                      onChange={handleChange}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-slate-800 bg-slate-850 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="binary">Setuju / Tolak / Abstain (Standar)</option>
                      <option value="multipilih">Pilihan Ganda (Kandidat)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Section */}
            <div className="p-6 sm:p-8 space-y-6 bg-slate-950/40">
              <div className="flex items-center gap-2 text-amber-500 mb-4">
                <Vote className="w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-wider text-white">Pengaturan Sidang & Kuorum</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-300">Status Awal</Label>
                  <select 
                    id="status" 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full flex h-10 items-center justify-between rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dijadwalkan">Dijadwalkan</option>
                    <option value="aktif">Langsung Aktif</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quorum_required" className="text-slate-300">Persyaratan Kuorum (%)</Label>
                  <Input 
                    id="quorum_required" 
                    name="quorum_required" 
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quorum_required}
                    onChange={handleChange}
                    className="bg-slate-900/40 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_pemilih" className="text-slate-300">Total Daftar Pemilih</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      id="total_pemilih" 
                      name="total_pemilih" 
                      type="number"
                      min="0"
                      placeholder="Anggota yang berhak"
                      value={formData.total_pemilih}
                      onChange={handleChange}
                      className="bg-slate-900/40 border-slate-800 pl-9 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-slate-900/40 flex items-center justify-end gap-3 border-t border-slate-850">
              <Button type="button" variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 shadow-sm font-bold min-w-[140px]">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Simpan Voting</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VotingBaruPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <VotingFormContent />
    </Suspense>
  );
}
