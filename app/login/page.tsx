'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  Lock, 
  User, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { toast } = useToast();

  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Get callbackUrl or default to dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim || !password) {
      setErrorMsg('NIM dan password harus diisi');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn('credentials', {
        nim,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMsg('NIM atau password salah. Silakan coba lagi.');
        toast({
          title: 'Gagal Masuk',
          description: 'NIM atau password salah.',
          variant: 'destructive',
        });
      } else if (res?.ok) {
        toast({
          title: 'Berhasil Masuk',
          description: 'Selamat datang kembali di DPM Connect.',
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden font-sans select-none">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Beranda
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" className="mb-4" />
          <h2 className="text-2xl font-bold text-white tracking-wide">DPM CONNECT</h2>
          <p className="text-sm text-slate-400 mt-1">Portal Anggota Legislatif & Pengawas</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-xl"
        >
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nim" className="text-slate-300">Nomor Induk Mahasiswa (NIM)</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <Input
                  id="nim"
                  type="text"
                  placeholder="Contoh: 2021001001"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Link 
                  href="/lupa-password" 
                  className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </Button>
          </form>

          {/* Quick reference for demo */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Akun Demo Instan</h4>
            <div className="text-[11px] text-slate-500 flex justify-center gap-4 flex-wrap">
              <span><strong>Ketua DPM</strong>: 2021001001 / pimpinan123</span>
              <span><strong>Komisi I</strong>: 2021002001 / ketua123</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-xs uppercase font-bold tracking-widest text-slate-500">DPM Connect Loading</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
