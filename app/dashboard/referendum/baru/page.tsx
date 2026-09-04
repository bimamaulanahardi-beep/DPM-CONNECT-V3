'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Vote, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function BaruReferendumPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    pertanyaan: '',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: '',
    status: 'aktif',
    is_publik: true,
  });

  const [opsiList, setOpsiList] = useState<string[]>([
    'Setuju',
    'Tidak Setuju',
    'Abstain'
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpsiChange = (index: number, val: string) => {
    const updated = [...opsiList];
    updated[index] = val;
    setOpsiList(updated);
  };

  const addOpsi = () => {
    if (opsiList.length >= 6) {
      alert('Maksimal 6 pilihan opsi dalam satu referendum.');
      return;
    }
    setOpsiList([...opsiList, `Opsi ${opsiList.length + 1}`]);
  };

  const removeOpsi = (index: number) => {
    if (opsiList.length <= 2) {
      alert('Referendum minimal harus memiliki 2 pilihan opsi.');
      return;
    }
    setOpsiList(opsiList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const filteredOpsi = opsiList.map(o => o.trim()).filter(Boolean);
    if (filteredOpsi.length < 2) {
      setErrorMsg('Minimal cantumkan 2 opsi pilihan.');
      return;
    }

    if (!formData.judul || !formData.pertanyaan || !formData.tanggal_mulai || !formData.tanggal_selesai) {
      setErrorMsg('Mohon lengkapi semua bidang bertanda bintang (*).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/referendum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          opsi: filteredOpsi,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat referendum');
      }

      router.push('/dashboard/referendum');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/referendum">
          <Button size="icon" variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Vote className="w-6 h-6 text-gold-400" />
            Buat Referendum Mahasiswa Baru
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Buka jajak pendapat resmi untuk menentukan keputusan penting bersama seluruh mahasiswa ITB Riau.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Judul Referendum <span className="text-red-400">*</span>
              </label>
              <Input
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                placeholder="Contoh: Referendum Amandemen AD/ART KM ITB Riau 2026"
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Latar Belakang & Penjelasan Isu
              </label>
              <Textarea
                name="deskripsi"
                rows={4}
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Jelaskan alasan, dasar hukum, dan dampak dari referendum ini agar mahasiswa memahami konteks sebelum memilih..."
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
              />
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-gold-400 uppercase tracking-wider block mb-1.5">
                Pertanyaan yang Diajukan ke Mahasiswa <span className="text-red-400">*</span>
              </label>
              <Input
                name="pertanyaan"
                value={formData.pertanyaan}
                onChange={handleInputChange}
                placeholder="Contoh: Apakah Anda menyetujui pembentukan UKM baru di tingkat institut?"
                className="bg-slate-900 border-slate-700 text-white font-semibold placeholder:font-normal placeholder:text-slate-500 focus:border-gold-500"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Gunakan kalimat pertanyaan yang jelas, lugas, dan tidak ambigu.
              </p>
            </div>

            {/* Opsi Pilihan */}
            <div className="border-t border-slate-800 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Pilihan Opsi Suara <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Tentukan opsi yang dapat dipilih oleh mahasiswa (minimal 2 opsi).
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addOpsi}
                  className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 text-xs gap-1.5 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Opsi
                </Button>
              </div>

              <div className="space-y-2.5">
                {opsiList.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-6 text-center">
                      #{idx + 1}
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => handleOpsiChange(idx, e.target.value)}
                      placeholder={`Opsi ${idx + 1}`}
                      className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500 text-sm"
                      required
                    />
                    {opsiList.length > 2 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOpsi(idx)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Jadwal Pelaksanaan */}
            <div className="border-t border-slate-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tanggal Mulai Pemungutan Suara <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleInputChange}
                  className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tanggal Selesai <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleInputChange}
                  className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
                  required
                />
              </div>
            </div>

            {/* Status Publikasi */}
            <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Status Awal Referendum</span>
                <span className="text-xs text-slate-500">Pilih "Aktif" agar langsung dapat diakses mahasiswa, atau "Draft" untuk ditinjau terlebih dahulu.</span>
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:border-gold-500"
              >
                <option value="aktif">Langsung Aktif</option>
                <option value="draft">Simpan Draft</option>
              </select>
            </div>

            {/* Submit */}
            <div className="border-t border-slate-800 pt-5 flex items-center justify-end gap-3">
              <Link href="/dashboard/referendum">
                <Button type="button" variant="outline" className="border-slate-700 text-slate-300">
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-bold px-6 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4" />
                    Buka Referendum
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
