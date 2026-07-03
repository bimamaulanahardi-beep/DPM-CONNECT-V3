'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Share2,
  Tag,
  Clock,
  ChevronRight,
  Gavel,
  BookOpen,
  Loader2,
  AlertTriangle,
  Eye,
  X,
  FileArchive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: {
    id: string;
  };
}

// Helper: parse file URL to extract fileId and filename
function parseFileUrl(url: string): { fileId: string | null; filename: string } {
  if (!url) return { fileId: null, filename: 'Dokumen' };
  const apiMatch = url.match(/\/api\/file\/([^?]+)\?name=(.+)/);
  if (apiMatch) {
    return {
      fileId: apiMatch[1],
      filename: decodeURIComponent(apiMatch[2]),
    };
  }
  const uploadsMatch = url.match(/\/uploads\/(.+)/);
  if (uploadsMatch) {
    return { fileId: null, filename: uploadsMatch[1] };
  }
  return { fileId: null, filename: url.split('/').pop() || 'Dokumen' };
}

// Helper: get file icon and color based on extension
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'PDF' };
  if (ext === 'docx' || ext === 'doc') return { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'DOCX' };
  if (ext === 'xlsx' || ext === 'xls') return { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'XLSX' };
  return { color: 'text-slate-400', bg: 'bg-slate-800/60 border-slate-700', label: ext?.toUpperCase() || 'FILE' };
}

// File Preview Modal Component
function FilePreviewModal({ 
  fileId, 
  filename, 
  onClose 
}: { 
  fileId: string | null; 
  filename: string; 
  onClose: () => void; 
}) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const isPdf = ext === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-white truncate max-w-xs">{filename}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2 min-h-0">
          {fileId ? (
            isPdf ? (
              <iframe
                src={`/api/file/preview/${fileId}?name=${encodeURIComponent(filename)}`}
                className="w-full h-[70vh] rounded-lg border border-slate-800"
                title={filename}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
                <FileArchive className="w-16 h-16 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{filename}</p>
                  <p className="text-xs text-slate-400">
                    Pratinjau tidak tersedia untuk format file ini ({ext?.toUpperCase()}).
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hanya dapat melihat file pratinjau untuk dokumen berformat PDF.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
              <AlertTriangle className="w-12 h-12 text-amber-500/60" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">File tidak dapat dimuat</p>
                <p className="text-xs text-slate-400">
                  File ini mungkin belum diunggah secara digital ke dalam sistem.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LegislasiDetailPage({ params }: PageProps) {
  const [legislasi, setLegislasi] = useState<any>(null);
  const [pengaju, setPengaju] = useState<any>(null);
  const [approvedBy, setApprovedBy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState<{ fileId: string | null; filename: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const legRes = await fetch(`/api/legislasi/${params.id}`);
        const legData = await legRes.json();

        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();

        if (legRes.ok) {
          setLegislasi(legData);
          if (usersRes.ok) {
            setPengaju(usersData.find((u: any) => u.id === legData.pengaju));
            if (legData.approved_by) {
              setApprovedBy(usersData.find((u: any) => u.id === legData.approved_by));
            }
          }
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!legislasi) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Dokumen Tidak Ditemukan</h2>
          <p className="text-slate-400 text-sm mb-6">Produk legislasi dengan ID tersebut tidak dapat ditemukan di database.</p>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
            <Link href="/transparansi">Kembali ke Portal</Link>
          </Button>
        </div>
      </div>
    );
  }

  const workflowSteps = [
    { label: 'Diajukan', status: 'diajukan', date: legislasi.tanggal_diajukan },
    { label: 'Tahap Pembahasan', status: 'dibahas', date: null },
    { label: 'Penyusunan Draft Akhir', status: 'direvisi', date: null },
    { label: 'Disahkan', status: 'disahkan', date: legislasi.tanggal_disahkan || null },
    { label: 'Diundangkan', status: 'diundangkan', date: legislasi.tanggal_disahkan || null },
  ];

  const statusOrder = ['diajukan', 'dibahas', 'direvisi', 'disahkan', 'diundangkan'];
  const currentStatusIndex = statusOrder.indexOf(legislasi.status);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: legislasi.judul,
        text: legislasi.isi_ringkasan,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan halaman berhasil disalin ke clipboard!');
    }
  };

  const konten = legislasi.konten || '';
  const isFileUrl = konten.startsWith('/api/file/') || konten.startsWith('/uploads/');
  const parsedFile = isFileUrl ? parseFileUrl(konten) : null;
  const fileInfo = parsedFile ? getFileIcon(parsedFile.filename) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-gold-500/30 selection:text-gold-200">
      {previewModal && (
        <FilePreviewModal
          fileId={previewModal.fileId}
          filename={previewModal.filename}
          onClose={() => setPreviewModal(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="lg" />
            <div>
              <span className="font-bold text-lg leading-none block tracking-wide text-white group-hover:text-gold-400 transition-colors">
                DPM CONNECT
              </span>
              <span className="text-xs text-slate-400 tracking-wider">ITB RIAU</span>
            </div>
          </Link>

          <Link 
            href="/transparansi" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <StatusBadge status={legislasi.status} />
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {legislasi.jenis.replace('_', ' ')}
                </span>
                {legislasi.nomor && (
                  <span className="text-xs font-mono text-amber-500 font-semibold">{legislasi.nomor}</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
                {legislasi.judul}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Diajukan: {formatDate(legislasi.tanggal_diajukan)}</span>
                </div>
                {legislasi.tanggal_disahkan && (
                  <div className="flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-amber-500" />
                    <span>Disahkan: {formatDate(legislasi.tanggal_disahkan)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Revisi ke-{legislasi.revisi_ke || 0}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {Array.isArray(legislasi.tags) && legislasi.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400 inline-flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <Separator className="bg-slate-800 my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Ringkasan Eksekutif
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-900 font-sans">
                  {legislasi.isi_ringkasan}
                </p>
              </div>

              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  Dokumen Batang Tubuh
                </h3>
                
                {isFileUrl && parsedFile ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 ${fileInfo?.bg}`}>
                        <FileText className={`w-6 h-6 ${fileInfo?.color}`} />
                        <span className={`text-[8px] font-black mt-0.5 ${fileInfo?.color}`}>{fileInfo?.label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{parsedFile.filename}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Dokumen naskah akademik/peraturan
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewModal({ fileId: parsedFile.fileId, filename: parsedFile.filename })}
                            className="h-7 text-[11px] font-semibold border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-1"
                          >
                            <Eye className="w-3 h-3" /> Lihat Isi Dokumen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : konten ? (
                  <div className="text-slate-400 text-xs sm:text-sm leading-relaxed p-6 bg-slate-950/20 border border-slate-900 rounded-xl max-h-[350px] overflow-y-auto scrollbar-thin select-text font-mono">
                    {konten}
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs sm:text-sm leading-relaxed p-6 bg-slate-950/20 border border-slate-900 rounded-xl text-center">
                    <p className="text-slate-500 italic mb-4">Batang tubuh dokumen lengkap masih dalam tahap pemrosesan digital atau belum diunggah.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase">Tindakan Publik</h3>

                  <Button 
                    onClick={handleShare} 
                    variant="outline" 
                    className="w-full border-slate-800 text-slate-300 hover:text-white bg-slate-950/50 hover:bg-slate-900"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Bagikan Dokumen
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase">Workflow Pengesahan</h3>
                  
                  <div className="relative border-l border-slate-800 ml-3 space-y-6">
                    {workflowSteps.map((step, idx) => {
                      const isActive = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className={`absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                            isCurrent
                              ? 'bg-amber-500 border-amber-500 shadow-md shadow-amber-500/20 scale-110'
                              : isActive
                                ? 'bg-slate-950 border-emerald-500'
                                : 'bg-slate-950 border-slate-800'
                          }`} />
                          
                          <div className="space-y-1">
                            <h4 className={`text-xs font-bold leading-none ${
                              isCurrent 
                                ? 'text-amber-500' 
                                : isActive 
                                  ? 'text-slate-200' 
                                  : 'text-slate-600'
                            }`}>
                              {step.label}
                            </h4>
                            {step.date && isActive && (
                              <p className="text-[10px] text-slate-500">{formatDate(step.date)}</p>
                            )}
                            {isCurrent && (
                              <span className="inline-block text-[9px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mt-1.5">
                                Status Sekarang
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase">Pihak Pengusul</h3>
                  
                  {pengaju ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pengaju.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pengaju.name}`} alt={pengaju.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{pengaju.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-normal">{pengaju.jabatan}</p>
                        <p className="text-[9px] font-mono text-slate-500">{pengaju.prodi} - {pengaju.nim}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Pengusul: DPM ITB Riau</p>
                  )}

                  {approvedBy && (
                    <>
                      <Separator className="bg-slate-800/60 my-4" />
                      <h3 className="font-bold text-white text-sm tracking-wide uppercase">Disahkan Oleh</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={approvedBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${approvedBy.name}`} alt={approvedBy.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{approvedBy.name}</h4>
                          <p className="text-[9px] text-slate-400">{approvedBy.jabatan}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-slate-500 text-xs text-center">
        <p>&copy; {new Date().getFullYear()} DPM ITB Riau. Portal Transparansi Publik.</p>
      </footer>
    </div>
  );
}
