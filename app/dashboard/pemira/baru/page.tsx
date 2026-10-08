'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Link2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function BuatPemiraPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [manualUrlIndex, setManualUrlIndex] = useState<Record<number, boolean>>({});

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    total_dpt: '',
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

  const handlePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ 
        title: 'Format Tidak Sesuai', 
        description: 'Harap pilih file gambar (JPG, PNG, JPEG, WebP).', 
        variant: 'destructive' 
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: 'Ukuran Terlalu Besar', 
        description: 'Ukuran foto maksimal adalah 10MB.', 
        variant: 'destructive' 
      });
      return;
    }

    setUploadingIndex(index);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal mengunggah berkas foto');
      }

      const result = await res.json();
      handleCandidateChange(index, 'foto_url', result.url);
      toast({ 
        title: 'Foto Berhasil Diunggah', 
        description: `Foto Paslon ${index + 1} berhasil disimpan.` 
      });
    } catch (err: any) {
      toast({ 
        title: 'Gagal Unggah Foto', 
        description: err.message || 'Terjadi kesalahan saat mengunggah foto.', 
        variant: 'destructive' 
      });
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
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
                value={formData.total_dpt}
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

              {/* Upload Foto Paslon */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 block">
                    Foto Paslon (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setManualUrlIndex(prev => ({ ...prev, [index]: !prev[index] }))}
                    className="text-[11px] text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <Link2 className="w-3 h-3" />
                    {manualUrlIndex[index] ? 'Gunakan Unggah File' : 'Gunakan Tautan URL'}
                  </button>
                </div>

                {manualUrlIndex[index] ? (
                  /* Input Manual URL */
                  <div className="space-y-1.5">
                    <Input
                      placeholder="https://contoh.com/foto.jpg"
                      value={c.foto_url}
                      onChange={(e) => handleCandidateChange(index, 'foto_url', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                    <p className="text-[10px] text-slate-500">Masukkan tautan langsung gambar paslon yang dapat diakses publik.</p>
                  </div>
                ) : c.foto_url ? (
                  /* Preview Foto Terunggah */
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img 
                        src={c.foto_url} 
                        alt={`Foto Paslon ${index + 1}`} 
                        className="w-16 h-16 rounded-lg object-cover border border-amber-500/40 shadow-sm bg-slate-900"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Foto Paslon Terpasang
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5 font-mono">
                          {c.foto_url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700">
                          <Upload className="w-3.5 h-3.5" /> Ganti
                        </span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(index, e)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleCandidateChange(index, 'foto_url', '')}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Area Dropzone Unggah File */
                  <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    uploadingIndex === index 
                      ? 'border-amber-500/50 bg-amber-500/5 cursor-wait' 
                      : 'border-slate-800 hover:border-amber-500/50 bg-slate-950/40 hover:bg-slate-950/80'
                  }`}>
                    {uploadingIndex === index ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                        <span className="text-xs font-medium text-amber-400">Sedang mengunggah foto ke penyimpanan...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 text-amber-500">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200">
                          Pilih / Unggah Berkas Foto Paslon
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          Mendukung file PNG, JPG, JPEG, WebP (Maksimal 10MB)
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      disabled={uploadingIndex === index}
                      onChange={(e) => handlePhotoUpload(index, e)}
                    />
                  </label>
                )}
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCandidate(index)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Paslon
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || uploadingIndex !== null}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold h-12 text-base"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Buat Event Pemilu Raya
        </Button>
      </form>
    </div>
  );
}
