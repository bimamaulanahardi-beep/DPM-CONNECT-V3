'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Search, 
  Mail, 
  Download, 
  Inbox, 
  Send,
  Loader2,
  Trash2,
  ExternalLink,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function SuratListPage() {
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk');
  const [searchQuery, setSearchQuery] = useState('');
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: session } = useSession();
  const { toast } = useToast();
  const userRole = (session?.user as any)?.role;
  const canDelete = userRole && userRole !== 'mahasiswa';

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/surat');
      const data = await res.json();
      if (res.ok) {
        setSuratList(data);
      }
    } catch (e) {
      console.error('Error fetching letters:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurat();
  }, []);

  const handleDelete = async (id: string, perihal: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus surat "${perihal}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/surat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuratList(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Surat Dihapus', description: `"${perihal}" berhasil dihapus.` });
      } else {
        const data = await res.json();
        toast({ title: 'Gagal Menghapus', description: data.error || 'Terjadi kesalahan.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Kesalahan Jaringan', description: 'Tidak dapat menghubungi server.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/kirim-surat`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: 'Link Disalin!', description: 'Bagikan link ini ke pihak luar yang ingin mengirim surat.' });
  };

  const filteredSurat = suratList.filter((item) => {
    const matchesTab = item.jenis === activeTab;
    const matchesSearch = item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.dari.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.kepada.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Persuratan & Arsip Dokumen</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Daftar arsip korespondensi surat masuk dan surat keluar resmi DPM.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shrink-0">
          <Link href="/dashboard/surat/baru">
            <Plus className="w-4 h-4 mr-1.5" /> Buat Surat Keluar
          </Link>
        </Button>
      </div>

      {/* Portal Publik Banner */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
            <ExternalLink className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Portal Penerimaan Surat Masuk Aktif</p>
            <p className="text-xs text-slate-400">Bagikan link ini kepada pihak luar agar mereka bisa mengirim surat langsung secara digital.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white h-8 px-3 gap-1.5"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Link'}
          </Button>
          <Button asChild size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 gap-1.5">
            <Link href="/kirim-surat" target="_blank">
              <ExternalLink className="w-3.5 h-3.5" /> Buka Portal
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Control & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
        
        {/* Tabs */}
        <div className="flex bg-slate-900/40 p-1.5 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('masuk')}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'masuk'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Surat Masuk
          </button>
          <button
            onClick={() => setActiveTab('keluar')}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'keluar'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            Surat Keluar
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Cari perihal, nomor, pengirim, penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder-slate-655 focus-visible:ring-amber-500"
          />
        </div>

      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredSurat.length > 0 ? (
        <div className="space-y-4">
          {filteredSurat.map((surat) => (
            <div
              key={surat.id}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-amber-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={surat.status} />
                  <span className="text-[10px] text-slate-500 font-mono font-bold">NO: {surat.nomor}</span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">{surat.perihal}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl leading-relaxed font-sans">{surat.isi_singkat}</p>

                <div className="flex items-center gap-4 text-[10px] text-slate-550 font-bold pt-1 font-sans">
                  <span>Dari: {surat.dari}</span>
                  <span>&bull;</span>
                  <span>Kepada: {surat.kepada}</span>
                  <span>&bull;</span>
                  <span>Tanggal: {formatDate(surat.tanggal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 justify-end">
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(surat.id, surat.perihal)}
                    disabled={deletingId === surat.id}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    title="Hapus Surat"
                  >
                    {deletingId === surat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                )}
                {(surat.lampiran && surat.lampiran.length > 0) ? (
                  surat.lampiran.map((lamp: any, idx: number) => {
                    const fileName = lamp.name || lamp.url?.split('/').pop() || `surat-${surat.id}.pdf`;
                    const downloadUrl = lamp.url || lamp;
                    return (
                      <Button
                        key={idx}
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-amber-500 hover:text-amber-400 hover:bg-slate-900 border border-slate-800 hover:border-slate-800 font-bold text-xs h-8 px-4 flex items-center gap-1.5"
                      >
                        <a href={downloadUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3.5 h-3.5" /> Unduh PDF
                        </a>
                      </Button>
                    );
                  })
                ) : (
                  <span className="text-[10px] text-slate-600 italic px-2">Tidak ada lampiran</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <Mail className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Arsip Surat Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 font-sans">Tidak ada arsip dokumen korespondensi surat yang cocok dengan filter pencarian Anda.</p>
        </div>
      )}
    </div>
  );
}
