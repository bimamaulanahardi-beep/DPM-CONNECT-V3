'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function TambahProkerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    divisi: '',
    penanggung_jawab: '',
    status: 'belum_mulai',
    deskripsi: '',
    target: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/pengawasan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          progress_percentage: 0,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Berhasil Menambahkan Program',
          description: 'Program kerja baru telah ditambahkan ke sistem pengawasan.',
        });
        router.push('/dashboard/pengawasan');
        router.refresh();
      } else {
        const err = await res.json();
        toast({
          title: 'Gagal Menambahkan',
          description: err.error || 'Terjadi kesalahan saat menyimpan data.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link 
        href="/dashboard/pengawasan" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Program
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Tambah Program Kerja BEM</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Isi formulir di bawah ini untuk menambahkan program kerja baru ke dalam sistem pengawasan.</p>
      </div>

      <Card className="bg-slate-900/40 border-slate-800">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Program */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nama" className="text-slate-400">Nama Program Kerja <span className="text-red-500">*</span></Label>
                <Input 
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Contoh: Pekan Orientasi Mahasiswa Baru 2024"
                  className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                  required
                />
              </div>

              {/* Divisi */}
              <div className="space-y-2">
                <Label htmlFor="divisi" className="text-slate-400">Divisi Penanggung Jawab <span className="text-red-500">*</span></Label>
                <Input 
                  id="divisi"
                  name="divisi"
                  value={formData.divisi}
                  onChange={handleChange}
                  placeholder="Contoh: Kementerian Dalam Negeri"
                  className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                  required
                />
              </div>

              {/* Penanggung Jawab */}
              <div className="space-y-2">
                <Label htmlFor="penanggung_jawab" className="text-slate-400">Nama Penanggung Jawab <span className="text-red-500">*</span></Label>
                <Input 
                  id="penanggung_jawab"
                  name="penanggung_jawab"
                  value={formData.penanggung_jawab}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso"
                  className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-400">Status Awal <span className="text-red-500">*</span></Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="belum_mulai">Belum Mulai</option>
                  <option value="berjalan">Berjalan</option>
                  <option value="selesai">Selesai</option>
                  <option value="terlambat">Terlambat</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target" className="text-slate-400">Target Pelaksanaan</Label>
              <textarea
                id="target"
                name="target"
                value={formData.target}
                onChange={handleChange}
                rows={2}
                placeholder="Contoh: Seluruh mahasiswa baru angkatan 2024"
                className="w-full rounded-md bg-slate-950/50 border border-slate-800 p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi" className="text-slate-400">Deskripsi Program</Label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={4}
                placeholder="Penjelasan singkat mengenai program kerja ini..."
                className="w-full rounded-md bg-slate-950/50 border border-slate-800 p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tanggal_mulai" className="text-slate-400">Tanggal Mulai</Label>
                <Input 
                  id="tanggal_mulai"
                  name="tanggal_mulai"
                  type="date"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                  className="bg-slate-950/50 border-slate-800 text-white focus-visible:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal_selesai" className="text-slate-400">Tanggal Selesai Target</Label>
                <Input 
                  id="tanggal_selesai"
                  name="tanggal_selesai"
                  type="date"
                  value={formData.tanggal_selesai}
                  onChange={handleChange}
                  className="bg-slate-950/50 border-slate-800 text-white focus-visible:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push('/dashboard/pengawasan')} className="text-slate-400 hover:text-white">
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:bg-amber-600 text-slate-950 font-bold min-w-[120px]">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Simpan Program</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
