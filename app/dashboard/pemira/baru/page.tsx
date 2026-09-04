'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function BuatPemiraPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
  });

  const [candidates, setCandidates] = useState([
    { nama_ketua: '', nama_wakil: '', visi: '', misi: '', foto_url: '' }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCandidateChange = (index: number, field: string, value: string) => {
    const newCandidates = [...candidates];
    newCandidates[index] = { ...newCandidates[index], [field]: value };
    setCandidates(newCandidates);
  };

  const addCandidate = () => {
    setCandidates([...candidates, { nama_ketua: '', nama_wakil: '', visi: '', misi: '', foto_url: '' }]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length <= 1) return;
    const newCandidates = [...candidates];
    newCandidates.splice(index, 1);
    setCandidates(newCandidates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.tanggal_mulai || !formData.tanggal_selesai) {
      return toast({ title: 'Error', description: 'Harap isi data wajib pemilu', variant: 'destructive' });
    }
    if (candidates.some(c => !c.nama_ketua || !c.visi || !c.misi)) {
      return toast({ title: 'Error', description: 'Harap lengkapi nama ketua, visi, dan misi tiap kandidat', variant: 'destructive' });
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pemira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          candidates
        })
      });

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Event Pemilu Raya berhasil dibuat.' });
        router.push('/dashboard/pemira');
        router.refresh();
      } else {
        const error = await res.json();
        toast({ title: 'Gagal', description: error.error || 'Terjadi kesalahan.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan pada server.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/pemira" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pemira
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Buat Pemilu Raya Baru</h1>
        <p className="text-sm text-slate-400 mt-1">Siapkan event pemilihan presiden mahasiswa dan masukkan daftar pasangan calon.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Detail Event */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Informasi Event</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Judul Pemilu Raya <span className="text-red-500">*</span></label>
              <Input
                name="judul"
                placeholder="Contoh: Pemilihan Presiden BEM ITB Riau 2026"
                value={formData.judul}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Waktu Mulai <span className="text-red-500">*</span></label>
                <Input
                  type="datetime-local"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                  className="bg-slate-950 border-slate-800 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Waktu Selesai <span className="text-red-500">*</span></label>
                <Input
                  type="datetime-local"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleChange}
                  className="bg-slate-950 border-slate-800 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Deskripsi / Peraturan</label>
              <Textarea
                name="deskripsi"
                placeholder="Tuliskan deskripsi atau peraturan pemilu..."
                value={formData.deskripsi}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Total DPT (Daftar Pemilih Tetap)</label>
              <Input
                type="number"
                name="total_dpt"
                placeholder="Contoh: 3500 (Jumlah mahasiswa berhak pilih)"
                value={(formData as any).total_dpt || ''}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Digunakan untuk menghitung Persentase Data Masuk (ala KPU). Biarkan kosong jika tidak diketahui.</p>
            </div>
          </div>
        </div>

        {/* Kandidat */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Daftar Pasangan Calon (Kandidat)</h2>
            <Button type="button" onClick={addCandidate} variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
              <Plus className="w-4 h-4 mr-2" /> Tambah Paslon
            </Button>
          </div>

          {candidates.map((c, index) => (
            <div key={index} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 relative">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-sm px-4 py-1 rounded-bl-xl rounded-tr-xl">
                Paslon {index + 1}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Nama Calon Ketua <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="Nama Lengkap"
                    value={c.nama_ketua}
                    onChange={(e) => handleCandidateChange(index, 'nama_ketua', e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Nama Calon Wakil</label>
                  <Input
                    placeholder="Nama Lengkap (opsional)"
                    value={c.nama_wakil}
                    onChange={(e) => handleCandidateChange(index, 'nama_wakil', e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">URL Foto Paslon (Opsional)</label>
                <Input
                  placeholder="https://contoh.com/foto.jpg"
                  value={c.foto_url}
                  onChange={(e) => handleCandidateChange(index, 'foto_url', e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Visi <span className="text-red-500">*</span></label>
                  <Textarea
                    placeholder="Visi paslon..."
                    value={c.visi}
                    onChange={(e) => handleCandidateChange(index, 'visi', e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white min-h-[120px]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Misi <span className="text-red-500">*</span></label>
                  <Textarea
                    placeholder="Misi paslon (pisahkan dengan enter)..."
                    value={c.misi}
                    onChange={(e) => handleCandidateChange(index, 'misi', e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white min-h-[120px]"
                    required
                  />
                </div>
              </div>
              
              {candidates.length > 1 && (
                <div className="mt-4 flex justify-end border-t border-slate-800 pt-4">
                  <Button type="button" onClick={() => removeCandidate(index)} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Paslon Ini
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
          <Button type="button" variant="outline" className="border-slate-700 text-slate-300" onClick={() => router.push('/dashboard/pemira')}>
            Batal
          </Button>
          <Button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Simpan Pemilu Raya'}
          </Button>
        </div>
      </form>
    </div>
  );
}
