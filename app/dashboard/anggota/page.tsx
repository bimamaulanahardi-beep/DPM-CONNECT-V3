'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Users2, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Award,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { mockUsers } from '@/lib/mock-data/users';

export default function AnggotaListPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [komisiFilter, setKomisiFilter] = React.useState('semua');

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setUsers(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
      setUsers(mockUsers);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Filter only DPM staff/council members (exclude students who only have mahasiswa role without commission/jabatan details)
  const dpmAnggota = users.filter(u => u.role !== 'mahasiswa');

  const filteredAnggota = dpmAnggota.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.jabatan && item.jabatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.nim.includes(searchQuery);
    const matchesKomisi = komisiFilter === 'semua' || item.komisi === komisiFilter;
    return matchesSearch && matchesKomisi;
  });

  const komisiList = ['semua', 'Pimpinan', 'Komisi I', 'Komisi II', 'Komisi III'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Struktur & Keanggotaan DPM</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Daftar anggota resmi Dewan Perwakilan Mahasiswa ITB Riau Periode 2024/2025.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Cari anggota berdasarkan nama, NIM, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder-slate-655 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Komisi:</span>
          <select
            value={komisiFilter}
            onChange={(e) => setKomisiFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500 capitalize"
          >
            {komisiList.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {filteredAnggota.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAnggota.map((member, i) => (
            <div
              key={member.id}
              className="group"
            >
              <Card className="bg-slate-900/40 border-slate-800 hover:border-amber-500/20 transition-all duration-300 h-full flex flex-col justify-between overflow-hidden">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  
                  {/* Photo area */}
                  <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center p-6 border-b border-slate-800">
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-[#007bff]/20 px-2 py-0.5 rounded uppercase">
                        {member.komisi}
                      </span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-32 h-32 rounded-full object-cover border border-slate-800 group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>

                  {/* Text details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1 leading-snug group-hover:text-amber-500 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">{member.jabatan}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{member.prodi} &bull; {member.nim}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-4 mt-5">
                      <Button asChild variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-slate-950 border border-slate-850/60 hover:border-slate-800 text-[11px] h-8 font-bold">
                        <Link href={`/dashboard/anggota/${member.id}`} className="flex items-center justify-center gap-1">
                          Profil Legislatif <ChevronRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <Users2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Anggota Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">Tidak ada anggota DPM yang cocok dengan kriteria filter pencarian Anda.</p>
        </div>
      )}
    </div>
  );
}
