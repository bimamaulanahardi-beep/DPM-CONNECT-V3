'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  Award,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  TrendingUp,
  History,
  Scale,
  Users,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockUsers } from '@/lib/mock-data/users';
import { StatCard } from '@/components/common/stat-card';
import { getInitials } from '@/lib/utils';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AnggotaDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [member, setMember] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const found = data.find((u: any) => u.id === params.id);
            if (found) {
              setMember(found);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user details:', err);
      }
      
      // Fallback
      const fallback = mockUsers.find((u) => u.id === params.id);
      if (fallback) {
        setMember(fallback);
      }
      setIsLoading(false);
    };
    fetchMember();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500/60 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Anggota Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mb-6">Anggota dengan ID tersebut tidak dapat ditemukan.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <Link href="/dashboard/anggota">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  // Mock specific member stats
  const stats = {
    attendance: member.id === '1' ? 95 : member.id === '2' ? 90 : 85,
    totalMeetings: 20,
    ruuProposed: member.id === '3' ? 4 : member.id === '4' ? 3 : 1,
    votesParticipated: 15
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/anggota" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Anggota
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Card: Profile & Contact Card */}
        <Card className="bg-slate-900/40 border-slate-800 text-center overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-600/10 p-8 border-b border-slate-800 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-950 border-2 border-amber-500/40 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
            </div>
            
            <h2 className="font-extrabold text-white text-lg tracking-wide leading-snug">{member.name}</h2>
            <span className="inline-block text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-[#007bff]/20 px-2.5 py-0.5 rounded mt-2.5 uppercase tracking-wider">
              {member.komisi}
            </span>
          </div>

          <CardContent className="p-6 text-left space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Jabatan Parlemen</span>
              <span className="text-slate-300 font-bold font-sans">{member.jabatan}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">NIM / Prodi</span>
              <span className="text-slate-300 font-bold font-sans">{member.nim} &bull; {member.prodi}</span>
            </div>

            <Separator className="bg-slate-850" />

            <div className="space-y-3">
              <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kontak Penghubung</h3>
              
              <div className="flex items-center gap-2.5 text-slate-350 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 font-mono truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{member.email}</span>
              </div>

              {member.phone && (
                <div className="flex items-center gap-2.5 text-slate-350 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Area: Performance Stats & Activity Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900/40 border-slate-800 p-4 flex flex-col justify-between">
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">KEHADIRAN SIDANG</div>
              <div className="space-y-1">
                <span className="text-2xl font-black text-amber-500">{stats.attendance}%</span>
                <p className="text-[9px] text-slate-400 font-bold">Hadir dalam {stats.totalMeetings} sidang</p>
              </div>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 p-4 flex flex-col justify-between">
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">USULAN RUU</div>
              <div className="space-y-1">
                <span className="text-2xl font-black text-amber-500">{stats.ruuProposed} RUU</span>
                <p className="text-[9px] text-slate-400 font-bold">Rancangan Regulasi diajukan</p>
              </div>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 p-4 flex flex-col justify-between">
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">VOTING DIIKUTI</div>
              <div className="space-y-1">
                <span className="text-2xl font-black text-amber-500">{stats.votesParticipated} Suara</span>
                <p className="text-[9px] text-slate-400 font-bold">Mengikuti voting penentu</p>
              </div>
            </Card>
          </div>

          {/* Activity Timeline logs */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                Riwayat Aktivitas Parlemen
              </h3>

              <div className="relative border-l border-slate-800 ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 bg-slate-950 border-amber-500" />
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500">Juni 2026</span>
                    <h4 className="font-bold text-white">Menyetujui Hasil Sidang Komisi RUU Kemahasiswaan</h4>
                    <p className="text-slate-400">Ikut serta dalam voting legalitas dana organisasi tingkat kampus.</p>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 bg-slate-950 border-slate-800" />
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500">Mei 2026</span>
                    <h4 className="font-bold text-white">Menghadiri Sidang Pleno Dengar Pendapat BEM</h4>
                    <p className="text-slate-400">Melakukan audit dan peninjauan program kerja orientasi mahasiswa.</p>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 bg-slate-950 border-slate-800" />
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500">April 2026</span>
                    <h4 className="font-bold text-white">Menerima dan Meninjau Keluhan AC Rusak Gedung A</h4>
                    <p className="text-slate-400">Melakukan advokasi lapangan dan mengajukan surat perbaikan ke Biro Sarpras.</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
