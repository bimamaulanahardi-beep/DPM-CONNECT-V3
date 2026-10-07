'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { SidangJenis } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TimeInput24 } from '@/components/common/time-input-24';

export default function BaruSidangPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState<SidangJenis>('komisi');
  const [tanggal, setTanggal] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('09:00');
  const [lokasi, setLokasi] = useState('');
  const [linkDaring, setLinkDaring] = useState('');
  const [komisi, setKomisi] = useState('Komisi I');
  const [quorumRequired, setQuorumRequired] = useState(50);
  const [agenda, setAgenda] = useState<string[]>(['Pembukaan', 'Pembahasan Pokok Rapat']);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [selectedPeserta, setSelectedPeserta] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (res.ok) {
          setUsers(data);
          // Auto select first 2 users as default participants
          if (data.length > 0) {
            setSelectedPeserta(data.slice(0, 2).map((u: any) => u.id));
          }
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddAgenda = () => {
    if (!newAgendaItem.trim()) return;
    setAgenda([...agenda, newAgendaItem.trim()]);
    setNewAgendaItem('');
  };

  const handleRemoveAgenda = (index: number) => {
    setAgenda(agenda.filter((_, idx) => idx !== index));
  };

  const handleTogglePeserta = (userId: string) => {
    if (selectedPeserta.includes(userId)) {
      setSelectedPeserta(selectedPeserta.filter(id => id !== userId));
    } else {
      setSelectedPeserta([...selectedPeserta, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !tanggal || !waktuMulai || !lokasi) {
      alert('Mohon isi field wajib (Judul, Tanggal, Waktu Mulai, Lokasi)');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sidang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judul,
          jenis,
          status: 'dijadwalkan',
          tanggal,
          waktu_mulai: waktuMulai,
          lokasi,
          link_daring: linkDaring || null,
          komisi: jenis === 'komisi' ? komisi : null,
          agenda,
          peserta: selectedPeserta,
          quorum_required: Number(quorumRequired),
          quorum_achieved: 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Sidang Berhasil Dibuat',
          description: `Sidang "${judul}" telah dijadwalkan.`,
        });
        router.push('/dashboard/sidang');
      } else {
        toast({
          title: 'Gagal Membuat Sidang',
          description: data.error || 'Terjadi kesalahan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat terhubung ke server.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back Link */}
      <Link 
        href="/dashboard/sidang" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Sidang
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Buat Jadwal Sidang Baru</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Form untuk mengagendakan rapat paripurna, sidang komisi, atau hearing dengar pendapat.</p>
      </div>

      <Card className="bg-slate-900/40 border-slate-800">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Judul Sidang */}
            <div className="space-y-2">
              <Label htmlFor="judul" className="text-slate-350 font-semibold text-xs">Judul Sidang *</Label>
              <Input
                id="judul"
                type="text"
                placeholder="Contoh: Sidang Paripurna III - Pengesahan Anggaran Kemahasiswaan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                required
              />
            </div>

            {/* Row: Jenis Sidang & Komisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenis" className="text-slate-350 font-semibold text-xs">Jenis Sidang *</Label>
                <select
                  id="jenis"
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as SidangJenis)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 capitalize"
                >
                  <option value="paripurna">Paripurna</option>
                  <option value="komisi">Sidang Komisi</option>
                  <option value="dengar_pendapat">Dengar Pendapat</option>
                  <option value="istimewa">Istimewa</option>
                </select>
              </div>

              {jenis === 'komisi' && (
                <div className="space-y-2">
                  <Label htmlFor="komisi" className="text-slate-350 font-semibold text-xs">Komisi Penanggung Jawab</Label>
                  <select
                    id="komisi"
                    value={komisi}
                    onChange={(e) => setKomisi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Komisi I">Komisi I (Hukum & Legislasi)</option>
                    <option value="Komisi II">Komisi II (Anggaran & Pengawasan)</option>
                    <option value="Komisi III">Komisi III (Aspirasi & Kemahasiswaan)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Row: Tanggal & Jam */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal" className="text-slate-350 font-semibold text-xs">Tanggal Pelaksanaan *</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500 font-sans"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waktu" className="text-slate-350 font-semibold text-xs">Waktu Mulai *</Label>
                <TimeInput24
                  id="waktu"
                  value={waktuMulai}
                  onChange={setWaktuMulai}
                  required
                />
              </div>
            </div>

            {/* Row: Lokasi & Link Meeting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lokasi" className="text-slate-350 font-semibold text-xs">Tempat / Ruangan *</Label>
                <Input
                  id="lokasi"
                  type="text"
                  placeholder="Contoh: Gedung Rektorat Lt. 3 atau Zoom Meeting"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="text-slate-350 font-semibold text-xs">Tautan Rapat Daring (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={linkDaring}
                  onChange={(e) => setLinkDaring(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                />
              </div>
            </div>

            {/* Quorum Required */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="quorum" className="text-slate-350 font-semibold text-xs">Persentase Syarat Quorum (%)</Label>
                <span className="text-xs font-bold text-amber-500">{quorumRequired}% anggota hadir</span>
              </div>
              <Input
                id="quorum"
                type="number"
                min="10"
                max="100"
                value={quorumRequired}
                onChange={(e) => setQuorumRequired(Number(e.target.value))}
                className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500"
              />
            </div>

            {/* Agenda Section */}
            <div className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800">
              <Label className="text-slate-350 font-semibold text-xs">Penyusunan Agenda Rapat</Label>
              
              <div className="space-y-2">
                {agenda.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-xs font-bold text-amber-500 w-5 text-center">{idx + 1}</span>
                    <span className="text-xs text-slate-400 flex-1">{item}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveAgenda(idx)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Tambahkan agenda rapat baru..."
                  value={newAgendaItem}
                  onChange={(e) => setNewAgendaItem(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-xs sm:text-sm text-white"
                />
                <Button 
                  type="button" 
                  onClick={handleAddAgenda}
                  className="bg-slate-800 hover:bg-slate-750 text-white shrink-0 text-xs h-9 px-3"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Agenda
                </Button>
              </div>
            </div>

            {/* Participant selector */}
            <div className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800">
              <Label className="text-slate-350 font-semibold text-xs">Undang Anggota Dewan ({selectedPeserta.length} terpilih)</Label>
              {loadingUsers ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto scrollbar-thin pr-2">
                  {users.map((u) => {
                    const isChecked = selectedPeserta.includes(u.id);
                    return (
                      <label 
                        key={u.id} 
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-amber-500/5 border-amber-500 text-white' 
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePeserta(u.id)}
                          className="sr-only"
                        />
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate">
                          <span className="text-[11px] font-bold block leading-none">{u.name}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5 block">{u.jabatan || u.role}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800/60">
              <Button 
                type="button"
                onClick={() => router.push('/dashboard/sidang')}
                variant="outline" 
                className="w-1/3 border-slate-800 text-slate-400 hover:text-white bg-slate-950"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
              >
                {isSubmitting ? 'Memproses...' : 'Buat Sidang'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
