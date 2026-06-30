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
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LegislasiStatus } from '@/lib/types';

interface PageProps {
  params: {
    id: string;
  };
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

  const fetchData = async () => {
    try {
      const legRes = await fetch(`/api/legislasi/${params.id}`);
      const legData = await legRes.json();

      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();

      if (legRes.ok) {
        setLegislasi(legData);
        setDocumentContent(legData.konten || `BAB I\nKETENTUAN UMUM\n\nPasal 1\nDalam Peraturan ini yang dimaksud dengan:\n1. Dewan Perwakilan Mahasiswa...\n2. Badan Eksekutif Mahasiswa...`);
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
  
  const pengaju = users.find((u) => u.id === legislasi.pengaju);
  const approvedBy = legislasi.approved_by ? users.find((u) => u.id === legislasi.approved_by) : null;

  const handleSaveDocument = async () => {
    setIsSavingContent(true);
    try {
      const nextRev = revisionsCount + 1;
      const res = await fetch(`/api/legislasi/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          konten: documentContent,
          revisi_ke: nextRev,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLegislasi(updated);
        setRevisionsCount(nextRev);
        toast({
          title: 'Draft Disimpan',
          description: 'Perubahan pada rancangan regulasi berhasil disimpan sebagai revisi baru.',
        });
      } else {
        toast({
          title: 'Gagal Menyimpan',
          description: 'Terjadi kesalahan saat menyimpan draft.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungi server.',
        variant: 'destructive',
      });
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
        // Auto assign a formal TAP number if not set
        if (!legislasi.nomor) {
          updateData.nomor = `TAP DPM ITB RIAU/${String(new Date().getFullYear()).substring(2)}/00${legislasi.id.split('-')[1] || '1'}`;
        }
      }

      const res = await fetch(`/api/legislasi/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const updated = await res.json();
        setLegislasi(updated);
        setCurrentStatus(newStatus);
        toast({
          title: 'Status Diperbarui',
          description: `Draft RUU diubah statusnya menjadi "${newStatus.replace('_', ' ')}".`,
        });
      } else {
        toast({
          title: 'Gagal Memperbarui Status',
          description: 'Gagal mengupdate status regulasi.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLegislasi = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus regulasi/RUU ini? Tindakan ini tidak dapat dibatalkan.')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/legislasi/${params.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast({
          title: 'Legislasi Dihapus',
          description: 'Regulasi/RUU telah berhasil dihapus dari sistem.',
        });
        router.push('/dashboard/legislasi');
      } else {
        const data = await res.json();
        toast({
          title: 'Gagal Menghapus',
          description: data.error || 'Terjadi kesalahan saat menghapus legislasi.',
          variant: 'destructive',
        });
        setIsDeleting(false);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat menghubungi server.',
        variant: 'destructive',
      });
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
      {/* Back Link & Delete Button */}
      <div className="flex justify-between items-center">
        <Link 
          href="/dashboard/legislasi" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Legislasi
        </Link>
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
                    
                    {isAuthorizedToApprove && (
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

                  <textarea
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    disabled={!isAuthorizedToApprove}
                    rows={16}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed disabled:opacity-80"
                  />
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
    </div>
  );
}
