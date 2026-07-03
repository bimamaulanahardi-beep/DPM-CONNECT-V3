'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  FileText,
  Download,
  AlertTriangle,
  Loader2,
  Trash2,
  Upload,
  Eye,
  X,
  File,
  FileArchive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LegislasiStatus } from '@/lib/types';

interface PageProps {
  params: {
    id: string;
  };
}

// Helper: parse file URL to extract fileId and filename
function parseFileUrl(url: string): { fileId: string | null; filename: string; originalUrl: string } {
  if (!url) return { fileId: null, filename: 'Dokumen', originalUrl: '' };
  // New format: /api/file/{fileId}?name={filename}
  const apiMatch = url.match(/\/api\/file\/([^?]+)\?name=(.+)/);
  if (apiMatch) {
    return {
      fileId: apiMatch[1],
      filename: decodeURIComponent(apiMatch[2]),
      originalUrl: url
    };
  }
  // Old format: /uploads/{filename}
  const uploadsMatch = url.match(/\/uploads\/(.+)/);
  if (uploadsMatch) {
    return { fileId: null, filename: uploadsMatch[1], originalUrl: url };
  }
  // Fallback: use url as filename
  return { fileId: null, filename: url.split('/').pop() || 'Dokumen', originalUrl: url };
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
  url,
  onClose 
}: { 
  fileId: string | null; 
  filename: string; 
  url: string;
  onClose: () => void; 
}) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const isPdf = ext === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
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

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-2 min-h-0">
          {(fileId || url) ? (
            isPdf ? (
              <iframe
                src={fileId ? `/api/file/preview/${fileId}?name=${encodeURIComponent(filename)}` : url}
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
                    File ini berisi dokumen rancangan peraturan yang telah diunggah oleh pengusul.
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
                  File ini mungkin diunggah dengan versi lama sistem dan tidak dapat ditampilkan.
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
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [legislasi, setLegislasi] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LegislasiStatus>('diajukan');
  const [revisionsCount, setRevisionsCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ fileId: string | null; filename: string; url: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchData = async () => {
    try {
      const legRes = await fetch(`/api/legislasi/${params.id}`);
      const legData = await legRes.json();

      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();

      if (legRes.ok) {
        setLegislasi(legData);
        // konten is either a file URL or raw text content
        setDocumentContent(legData.konten || '');
        setCurrentStatus(legData.status as LegislasiStatus);
        setRevisionsCount(legData.revisi_ke || 0);
      }
      if (usersRes.ok) {
        setUsers(usersData);
      }
    } catch (e) {
      console.error('Error loading RUU detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!legislasi) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500/60 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Dokumen Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mb-6">Produk legislasi dengan ID tersebut tidak dapat ditemukan.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <Link href="/dashboard/legislasi">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  const userRole = session?.user ? (session.user as any).role : 'anggota';
  const isAuthorizedToApprove = ['pimpinan', 'ketua_komisi'].includes(userRole);
  const isMahasiswa = userRole === 'mahasiswa';
  
  const pengaju = users.find((u) => u.id === legislasi.pengaju);
  const approvedBy = legislasi.approved_by ? users.find((u) => u.id === legislasi.approved_by) : null;

  // Determine if konten is a file URL or raw text
  const konten = legislasi.konten || '';
  const isFileUrl = konten.startsWith('/api/file/') || konten.startsWith('/uploads/');
  const parsedFile = isFileUrl ? parseFileUrl(konten) : null;
  const fileInfo = parsedFile ? getFileIcon(parsedFile.filename) : null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Gagal mengunggah file.');
      }
      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.url;

      // Save the file URL as the document content
      const nextRev = revisionsCount + 1;
      const res = await fetch(`/api/legislasi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konten: fileUrl, revisi_ke: nextRev }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLegislasi(updated);
        setDocumentContent(fileUrl);
        setRevisionsCount(nextRev);
        toast({ title: 'File Berhasil Diunggah', description: `File "${file.name}" berhasil disimpan sebagai revisi baru.` });
      } else {
        throw new Error('Gagal menyimpan referensi file.');
      }
    } catch (err: any) {
      toast({ title: 'Gagal Mengunggah', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveDocument = async () => {
    setIsSavingContent(true);
    try {
      const nextRev = revisionsCount + 1;
      const res = await fetch(`/api/legislasi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konten: documentContent, revisi_ke: nextRev }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLegislasi(updated);
        setRevisionsCount(nextRev);
        toast({ title: 'Draft Disimpan', description: 'Perubahan pada rancangan regulasi berhasil disimpan sebagai revisi baru.' });
      } else {
        toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan draft.', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Kesalahan Jaringan', description: 'Tidak dapat menghubungi server.', variant: 'destructive' });
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleUpdateStatus = async (newStatus: LegislasiStatus) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'disahkan' || newStatus === 'diundangkan') {
        const currentUser = session?.user as any;
        updateData.approved_by = currentUser?.id || '1';
        updateData.tanggal_disahkan = new Date().toISOString().split('T')[0];
        if (!legislasi.nomor) {
          updateData.nomor = `TAP DPM ITB RIAU/${String(new Date().getFullYear()).substring(2)}/00${legislasi.id.split('-')[1] || '1'}`;
        }
      }

      const res = await fetch(`/api/legislasi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const updated = await res.json();
        setLegislasi(updated);
        setCurrentStatus(newStatus);
        toast({ title: 'Status Diperbarui', description: `Draft RUU diubah statusnya menjadi "${newStatus.replace('_', ' ')}".` });
      } else {
        toast({ title: 'Gagal Memperbarui Status', description: 'Gagal mengupdate status regulasi.', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLegislasi = () => {
    setDeleteModal(true);
  };
  
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/legislasi/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Legislasi Dihapus', description: 'Regulasi/RUU telah berhasil dihapus dari sistem.' });
        setDeleteModal(false);
        router.push('/dashboard/legislasi');
      } else {
        const data = await res.json();
        toast({ title: 'Gagal Menghapus', description: data.error || 'Terjadi kesalahan saat menghapus legislasi.', variant: 'destructive' });
        setIsDeleting(false);
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Kesalahan Jaringan', description: 'Tidak dapat menghubungi server.', variant: 'destructive' });
      setIsDeleting(false);
    }
  };

  const workflowSteps = [
    { label: 'Diajukan', status: 'diajukan' },
    { label: 'Tahap Pembahasan', status: 'dibahas' },
    { label: 'Revisi & Perbaikan', status: 'direvisi' },
    { label: 'Disahkan Sidang', status: 'disahkan' },
    { label: 'Diundangkan', status: 'diundangkan' }
  ];

  const currentStatusIndex = workflowSteps.findIndex(step => step.status === currentStatus);

  return (
    <div className="space-y-6">
      {/* Preview Modal */}
      {previewModal && (
        <FilePreviewModal
          fileId={previewModal.fileId}
          filename={previewModal.filename}
          url={previewModal.url}
          onClose={() => setPreviewModal(null)}
        />
      )}

      {/* Back Link & Delete Button */}
      <div className="flex justify-between items-center">
        <Link 
          href="/dashboard/legislasi" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Legislasi
        </Link>
        {!isMahasiswa && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteLegislasi}
            disabled={isDeleting}
            className="flex items-center gap-1.5 h-8 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Hapus Legislasi
          </Button>
        )}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left main area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 sm:p-8">
              {/* Header tags */}
              <div className="flex flex-wrap items-center gap-3.5 mb-6">
                <StatusBadge status={currentStatus} />
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {legislasi.jenis.replace('_', ' ')}
                </span>
                {legislasi.nomor && (
                  <span className="text-xs font-mono text-amber-500 font-semibold">{legislasi.nomor}</span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-snug mb-3">{legislasi.judul}</h1>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Diajukan: {formatDate(legislasi.tanggal_diajukan)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Jumlah Revisi: {revisionsCount} kali</span>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="draft" className="w-full">
                <TabsList className="bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6 flex h-auto">
                  <TabsTrigger value="draft" className="text-xs font-semibold rounded-lg py-2 flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                    Draft Peraturan
                  </TabsTrigger>
                  <TabsTrigger value="ringkasan" className="text-xs font-semibold rounded-lg py-2 flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                    Ringkasan RUU
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Draft */}
                <TabsContent value="draft" className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-slate-450 uppercase flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-500" /> Lembar Draft Naskah Akademik
                    </h3>
                    
                    {/* Authorized users: upload new file or save text */}
                    {isAuthorizedToApprove && (
                      <div className="flex items-center gap-2">
                        {/* Upload file button */}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold h-8 border transition-all
                            ${isUploading 
                              ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                            }`}>
                            {isUploading ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Mengunggah...</>
                            ) : (
                              <><Upload className="w-3 h-3" /> Unggah File</>
                            )}
                          </span>
                        </label>
                        {/* Save text content button (only if content is not a file) */}
                        {!isFileUrl && (
                          <Button 
                            onClick={handleSaveDocument}
                            disabled={isSavingContent}
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold h-8"
                          >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            {isSavingContent ? 'Menyimpan...' : 'Simpan Revisi'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* File Display Area */}
                  {isFileUrl && parsedFile ? (
                    // Display as a file card
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                      <div className="flex items-center gap-4">
                        {/* File icon */}
                        <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 ${fileInfo?.bg}`}>
                          <FileText className={`w-6 h-6 ${fileInfo?.color}`} />
                          <span className={`text-[8px] font-black mt-0.5 ${fileInfo?.color}`}>{fileInfo?.label}</span>
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{parsedFile.filename}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Dokumen draf naskah akademik
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {/* Preview button - available to everyone */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewModal({ fileId: parsedFile.fileId, filename: parsedFile.filename, url: parsedFile.originalUrl })}
                              className="h-7 text-[11px] font-semibold border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-1"
                            >
                              <Eye className="w-3 h-3" /> Lihat Isi File
                            </Button>

                            {/* Download button - only for non-mahasiswa */}
                            {!isMahasiswa && parsedFile.fileId && (
                              <Button
                                size="sm"
                                asChild
                                className="h-7 text-[11px] font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1"
                              >
                                <a 
                                  href={`/api/file/${parsedFile.fileId}?name=${encodeURIComponent(parsedFile.filename)}`}
                                  download={parsedFile.filename}
                                >
                                  <Download className="w-3 h-3" /> Unduh File
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Authorized: Replace file option */}
                      {isAuthorizedToApprove && (
                        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Ganti file dokumen:</span>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              className="hidden"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                            <span className="text-[10px] font-semibold text-amber-500 hover:text-amber-400 cursor-pointer underline">
                              Unggah file baru
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Display as editable textarea (legacy text content)
                    <textarea
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      disabled={!isAuthorizedToApprove}
                      rows={16}
                      placeholder={isAuthorizedToApprove ? "Tulis isi naskah akademik di sini atau unggah file dokumen..." : "Belum ada konten dokumen."}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed disabled:opacity-80"
                    />
                  )}
                </TabsContent>

                {/* Tab: Summary */}
                <TabsContent value="ringkasan">
                  <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Abstrak Ringkasan Pokok</span>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">{legislasi.isi_ringkasan}</p>
                    </div>
                    <Separator className="bg-slate-900/40" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tags</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {legislasi.tags.map((tag: string) => (
                          <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-slate-900/40 text-slate-400 border border-slate-800">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

            </CardContent>
          </Card>
        </div>

        {/* Right side controls */}
        <div className="space-y-6">
          {/* Status Controls */}
          {isAuthorizedToApprove && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-white text-xs tracking-wide uppercase mb-4">Pengendalian Status</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  <Button 
                    onClick={() => handleUpdateStatus('dibahas')}
                    variant={currentStatus === 'dibahas' ? 'default' : 'outline'}
                    className={`h-9 justify-start font-bold text-xs ${currentStatus === 'dibahas' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:bg-amber-600' : 'border-slate-800 hover:bg-slate-900 text-slate-400'}`}
                  >
                    Bahas Rancangan (Rapat Komisi)
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus('direvisi')}
                    variant={currentStatus === 'direvisi' ? 'default' : 'outline'}
                    className={`h-9 justify-start font-bold text-xs ${currentStatus === 'direvisi' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:bg-amber-600' : 'border-slate-800 hover:bg-slate-900 text-slate-400'}`}
                  >
                    Kembalikan untuk Revisi
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus('disahkan')}
                    variant={currentStatus === 'disahkan' ? 'default' : 'outline'}
                    className={`h-9 justify-start font-bold text-xs ${currentStatus === 'disahkan' ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600' : 'border-slate-800 hover:bg-slate-900 text-slate-400'}`}
                  >
                    Sahkan Produk (Sidang Pleno)
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus('diundangkan')}
                    variant={currentStatus === 'diundangkan' ? 'default' : 'outline'}
                    className={`h-9 justify-start font-bold text-xs ${currentStatus === 'diundangkan' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border-slate-800 hover:bg-slate-900 text-slate-400'}`}
                  >
                    Undangkan Lembar Publikasi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workflow Steps Tracker */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6">
              <h3 className="font-bold text-white text-xs tracking-wide uppercase mb-6">Workflow Legislasi</h3>
              
              <div className="relative border-l border-slate-800 ml-3 space-y-6">
                {workflowSteps.map((step, idx) => {
                  const isActive = idx <= currentStatusIndex;
                  const isCurrent = step.status === currentStatus;
                  return (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-500 shadow-md shadow-amber-500/20 scale-110'
                          : isActive
                            ? 'bg-slate-950 border-emerald-500'
                            : 'bg-slate-950 border-slate-800'
                      }`} />
                      
                      <div className="space-y-0.5">
                        <h4 className={`text-xs font-bold leading-none ${
                          isCurrent 
                            ? 'text-amber-500' 
                            : isActive 
                              ? 'text-slate-300' 
                              : 'text-slate-650'
                        }`}>
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="inline-block text-[8px] font-semibold text-amber-500 bg-amber-500/10 border border-[#007bff]/20 px-1.5 py-0.2 rounded mt-1">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pengusul & Metadata */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-white text-xs tracking-wide uppercase">Metadata Draft</h3>
              
              {pengaju ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                    <img src={pengaju.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pengaju.name}`} alt={pengaju.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{pengaju.name}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">{pengaju.jabatan || pengaju.role}</p>
                    <p className="text-[9px] font-mono text-slate-500">{pengaju.prodi || pengaju.nim}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Pengusul: Anggota Dewan</p>
              )}

              {approvedBy && (
                <>
                  <Separator className="bg-slate-800/60 my-4" />
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase">Sponsor Pengesahan</h4>
                  <div className="flex items-center gap-3.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 shrink-0">
                      <img src={approvedBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${approvedBy.name}`} alt={approvedBy.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{approvedBy.name}</h4>
                      <p className="text-[9px] text-slate-500">{approvedBy.jabatan || approvedBy.role}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      <ConfirmDialog 
        isOpen={deleteModal} 
        onClose={() => setDeleteModal(false)}
        onConfirm={executeDelete}
        title="Hapus Legislasi?"
        description="Apakah Anda yakin ingin menghapus regulasi/RUU ini? Tindakan ini tidak dapat dibatalkan."
        isLoading={isDeleting}
      />
    </div>
  );
}
