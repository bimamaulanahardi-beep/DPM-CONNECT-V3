'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Save, 
  CheckCircle2,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface SectionInput {
  judul: string;
  konten: string;
}

export default function BaruLPJPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    periode: '2025/2026',
    lembaga: 'DPM ITB Riau',
    ketua: '',
    ringkasan: '',
    status: 'draft',
  });

  const [sections, setSections] = useState<SectionInput[]>([
    {
      judul: 'I. Pendahuluan, Visi & Misi Kepengurusan',
      konten: 'Tuliskan latar belakang kepengurusan, visi, misi, dan struktur susunan pengurus pada periode ini...'
    },
    {
      judul: 'II. Realisasi Program Kerja & Kinerja Organisasi',
      konten: 'Rincian pelaksanaan seluruh program kerja yang telah terealisasi, capaian indikator kinerja, serta dokumentasi kegiatan...'
    },
    {
      judul: 'III. Laporan Realisasi Anggaran & Pengelolaan Keuangan',
      konten: 'Rekapitulasi penerimaan dana, pengeluaran per kegiatan, bukti pelaporan keuangan, dan saldo akhir periode...'
    },
    {
      judul: 'IV. Evaluasi Hambatan & Rekomendasi Kepengurusan Mendatang',
      konten: 'Kendala yang dihadapi selama masa jabatan dan rekomendasi strategis bagi pengurus periode berikutnya...'
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (index: number, field: 'judul' | 'konten', val: string) => {
    const updated = [...sections];
    updated[index][field] = val;
    setSections(updated);
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        judul: `Bagian ${sections.length + 1}. Judul Bagian Baru`,
        konten: ''
      }
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) {
      alert('Dokumen LPJ minimal harus memiliki 1 bagian laporan.');
      return;
    }
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = async (submitStatus: 'draft' | 'diterbitkan') => {
    setErrorMsg(null);

    if (!formData.judul || !formData.periode || !formData.lembaga || !formData.ketua) {
      setErrorMsg('Mohon lengkapi judul, periode, lembaga, dan nama ketua.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        status: submitStatus,
        sections: sections.map((s, idx) => ({
          judul: s.judul,
          konten: s.konten,
          urutan: idx + 1,
        })),
      };

      const res = await fetch('/api/lpj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan dokumen LPJ');
      }

      router.push('/dashboard/lpj');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/lpj">
          <Button size="icon" variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-gold-400" />
            Susun Dokumen LPJ Baru
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan pertanggungjawaban akhir periode untuk DPM atau BEM ITB Riau.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Metadata Card */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
        <CardContent className="p-6 md:p-8 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-gold-400" />
            Informasi Dokumen Lembaga
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Judul Laporan Pertanggungjawaban <span className="text-red-400">*</span>
              </label>
              <Input
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                placeholder="Contoh: Laporan Pertanggungjawaban Akhir Masa Jabatan DPM ITB Riau 2025/2026"
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Lembaga Organisasi <span className="text-red-400">*</span>
              </label>
              <select
                name="lembaga"
                value={formData.lembaga}
                onChange={handleInputChange}
                className="w-full bg-slate-950/60 border border-slate-800 text-white text-xs rounded-lg px-3 py-2.5 focus:border-gold-500"
              >
                <option value="DPM ITB Riau">DPM ITB Riau</option>
                <option value="BEM ITB Riau">BEM ITB Riau</option>
                <option value="UKM ITB Riau">UKM ITB Riau</option>
                <option value="HIMA ITB Riau">HIMA ITB Riau</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Periode Kepengurusan <span className="text-red-400">*</span>
              </label>
              <Input
                name="periode"
                value={formData.periode}
                onChange={handleInputChange}
                placeholder="Contoh: 2025/2026"
                className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Nama Ketua Lembaga <span className="text-red-400">*</span>
              </label>
              <Input
                name="ketua"
                value={formData.ketua}
                onChange={handleInputChange}
                placeholder="Nama Ketua DPM / Presiden Mahasiswa BEM"
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Ringkasan Eksekutif
              </label>
              <Textarea
                name="ringkasan"
                rows={3}
                value={formData.ringkasan}
                onChange={handleInputChange}
                placeholder="Ringkasan umum mengenai capaian dan akuntabilitas kepengurusan..."
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-gold-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Builder Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-gold-400" />
              Susunan Bagian Naskah LPJ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Anda dapat menambah atau menyunting isi tiap bab naskah pertanggungjawaban.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addSection}
            className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Bagian Bab
          </Button>
        </div>

        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <Card key={idx} className="bg-slate-900/80 border-slate-800 shadow-lg">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Judul Bab #{idx + 1}
                    </label>
                    <Input
                      value={sec.judul}
                      onChange={(e) => handleSectionChange(idx, 'judul', e.target.value)}
                      placeholder={`Judul Bab ${idx + 1}`}
                      className="bg-slate-950/70 border-slate-800 text-sm font-semibold text-white focus:border-gold-500"
                    />
                  </div>
                  {sections.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeSection(idx)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 self-end"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Isi & Naskah Laporan
                  </label>
                  <Textarea
                    rows={6}
                    value={sec.konten}
                    onChange={(e) => handleSectionChange(idx, 'konten', e.target.value)}
                    placeholder="Ketik isi uraian laporan pada bab ini..."
                    className="bg-slate-950/60 border-slate-800 text-xs text-slate-200 leading-relaxed font-sans placeholder:text-slate-600 focus:border-gold-500"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <Link href="/dashboard/lpj">
          <Button type="button" variant="outline" className="border-slate-700 text-slate-300 w-full sm:w-auto">
            Batal
          </Button>
        </Link>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => handleSubmit('draft')}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-850 text-xs gap-1.5 flex-1 sm:flex-initial"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Sebagai Draf
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('diterbitkan')}
            className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-bold text-xs gap-1.5 flex-1 sm:flex-initial shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terbitkan ke Publik
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
