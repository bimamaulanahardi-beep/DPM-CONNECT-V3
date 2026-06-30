'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  ShieldAlert, 
  Eye, 
  Save, 
  Moon, 
  Sun, 
  BellRing,
  Activity,
  Calendar,
  Lock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

export default function PengaturanPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const user = session?.user as any;

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('081234567890');
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync state when session user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '081234567890');
    }
  }, [user]);

  // Dynamic Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  React.useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Trigger NextAuth to update session data in the client
        await update();

        toast({
          title: 'Profil Diperbarui',
          description: 'Informasi data diri Anda berhasil diperbarui di database.',
        });
      } else {
        toast({
          title: 'Gagal Memperbarui',
          description: data.error || 'Terjadi kesalahan saat menyimpan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat terhubung ke server.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOld || !passwordNew) return;
    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passwordOld,
          passwordNew,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: 'Password Diubah',
          description: 'Password keamanan akun Anda berhasil diperbarui di database.',
        });
        setPasswordOld('');
        setPasswordNew('');
        fetchAuditLogs(); // Refresh logs to display the password change audit entry
      } else {
        toast({
          title: 'Gagal Mengubah Password',
          description: data.error || 'Terjadi kesalahan.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Kesalahan Jaringan',
        description: 'Tidak dapat terhubung ke server.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Pengaturan Sistem & Profil</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Kelola data profil, preferensi tema tampilan, keamanan, dan audit log aktivitas.</p>
      </div>

      <Tabs defaultValue="profil" className="w-full">
        <TabsList className="bg-slate-900/40 p-1 rounded-xl border border-slate-800 mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="profil" className="text-xs sm:text-sm font-semibold rounded-lg py-2 flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Profil & Kontak
          </TabsTrigger>
          <TabsTrigger value="keamanan" className="text-xs sm:text-sm font-semibold rounded-lg py-2 flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="tampilan" className="text-xs sm:text-sm font-semibold rounded-lg py-2 flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Tampilan & Notif
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm font-semibold rounded-lg py-2 flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            Audit Log Aktivitas
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Contact */}
        <TabsContent value="profil">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Informasi Profil Diri</CardTitle>
              <CardDescription className="text-xs text-slate-500">Perbarui rincian kontak dan profil personal Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-400 text-xs">Nama Lengkap</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-400 text-xs">Email Kampus</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-400 text-xs">Nomor Telepon (WhatsApp)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs">NIM (Nomor Induk Mahasiswa)</Label>
                    <Input
                      type="text"
                      value={user?.nim || ''}
                      className="bg-slate-950/20 border-slate-800/40 text-slate-500 select-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/60">
                  <Button 
                    type="submit" 
                    disabled={isSavingProfile}
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security */}
        <TabsContent value="keamanan">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Perbarui Password</CardTitle>
              <CardDescription className="text-xs text-slate-500">Jaga keamanan akun Anda dengan mengganti password secara berkala.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="pw-old" className="text-slate-400 text-xs">Password Saat Ini</Label>
                  <Input
                    id="pw-old"
                    type="password"
                    placeholder="••••••••"
                    value={passwordOld}
                    onChange={(e) => setPasswordOld(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pw-new" className="text-slate-400 text-xs">Password Baru</Label>
                  <Input
                    id="pw-new"
                    type="password"
                    placeholder="••••••••"
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-slate-800/60">
                  <Button 
                    type="submit"
                    disabled={isSavingPassword}
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold"
                  >
                    {isSavingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1.5" /> Perbarui Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Themes & Notifications */}
        <TabsContent value="tampilan">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Tema Antarmuka & Notifikasi</CardTitle>
              <CardDescription className="text-xs text-slate-500">Sesuaikan tampilan DPM Connect sesuai kenyamanan penglihatan Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Dark mode select */}
              <div className="space-y-3">
                <Label className="text-slate-400 text-xs">Pilih Tema Tampilan</Label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Terang (Light Mode)
                  </button>
                  
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Gelap (Dark Mode)
                  </button>
                </div>
              </div>

              <Separator className="bg-slate-850" />

              {/* Notification toggle mock */}
              <div className="space-y-3">
                <Label className="text-slate-400 text-xs">Pemberitahuan & Alert</Label>
                <div className="flex items-center space-x-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800 max-w-md">
                  <BellRing className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Email Pemberitahuan</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Kirim email pengingat instan setiap sidang baru dijadwalkan.</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Audit Logs */}
        <TabsContent value="audit">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-amber-500" />
                Audit Trail Logs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Daftar rekam jejak aktivitas terakhir yang dilakukan oleh pengguna pada sistem DPM Connect.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                      <th className="p-4">Pengguna</th>
                      <th className="p-4">Aktivitas Aksi</th>
                      <th className="p-4">Modul</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4 text-right">Tanggal & Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 bg-slate-950/10">
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
                          Memuat audit log...
                        </td>
                      </tr>
                    ) : auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 font-bold text-white">{log.user}</td>
                          <td className="p-4 text-slate-350">{log.aksi}</td>
                          <td className="p-4">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900/40 border border-slate-800 text-slate-400">
                              {log.modul}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{log.ip_address || log.ip || '-'}</td>
                          <td className="p-4 text-right text-slate-500">
                            {new Date(log.tanggal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          Tidak ada log aktivitas tercatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
