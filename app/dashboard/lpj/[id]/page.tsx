'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
  Building, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';

interface SectionInput {
  id?: string;
  judul: string;
  konten: string;
}

export default function EditLPJPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    periode: '',
    lembaga: '',
    ketua: '',
    ringkasan: '',
    status: 'draft',
  });

  const [sections, setSections] = useState<SectionInput[]>([]);

  useEffect(() => {
    const fetchLPJ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lpj/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            judul: data.judul || '',
            periode: data.periode || '',
            lembaga: data.lembaga || '',
            ketua: data.ketua || '',
            ringkasan: data.ringkasan || '',
            status: data.status || 'draft',
          });
          if (data.sections && data.sections.length > 0) {
            setSections(data.sections.map((s: any) => ({
              id: s.id,
              judul: s.judul,
              konten: s.konten,
            })));
          }
        } else {
          setErrorMsg('Dokumen LPJ tidak ditemukan.');
        }
      } catch (err) {
        setErrorMsg('Gagal memuat dokumen LPJ.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLPJ();
  }, [id]);

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

  const handleSave = async (overrideStatus?: 'draft' | 'diterbitkan') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetStatus = overrideStatus || formData.status;

    if (!formData.judul || !formData.periode || !formData.lembaga || !formData.ketua) {
      setErrorMsg('Mohon lengkapi judul, periode, lembaga, dan nama ketua.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        status: targetStatus,
        sections: sections.map((s, idx) => ({
          id: s.id,
          judul: s.judul,
          konten: s.konten,
          urutan: idx + 1,
        })),
      };

      const res = await fetch(`/api/lpj/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan perubahan');
      }

      setFormData(prev => ({ ...prev, status: targetStatus }));
      setSuccessMsg('Dokumen LPJ berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus naskah LPJ ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      const res = await fetch(`/api/lpj/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/lpj');
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert('Gagal menghapus');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
        <p className="text-sm">Memuat naskah LPJ...</p>
      </div>
    );
  }

  const user = session?.user as any;
  const canDelete = user?.role === 'admin' || user?.role === 'pimpinan';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/lpj">
            <Button size="icon" variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">
                {formData.lembaga}
              </span>
              <StatusBadge status={formData.status} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1 truncate max-w-md">
              {formData.judul}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/lpj/${id}`} target="_blank">
            <Button size="sm" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 text-xs gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Laman Publik
            </Button>
          </Link>
          {canDelete && (
            <Button
              size="icon"
              variant="outline"
              onClick={handleDelete}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 w-8"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metadata Card */}
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
                className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
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
                className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
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
                className="bg-slate-950/60 border-slate-800 text-white focus:border-gold-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-gold-400" />
              Susunan Bab Naskah LPJ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sunting naskah pertanggungjawaban pada masing-masing bab.
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
            Tambah Bab Baru
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
                    className="bg-slate-950/60 border-slate-800 text-xs text-slate-200 leading-relaxed font-sans focus:border-gold-500"
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
            Kembali
          </Button>
        </Link>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {formData.status === 'diterbitkan' ? (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs gap-1.5 flex-1 sm:flex-initial"
            >
              Ubah Jadi Draf
            </Button>
          ) : (
            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSave('diterbitkan')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 flex-1 sm:flex-initial"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Terbitkan ke Publik
            </Button>
          )}

          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-bold text-xs gap-1.5 flex-1 sm:flex-initial shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
