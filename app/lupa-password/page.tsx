'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate sending email reset link
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden font-sans select-none">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <Link 
        href="/login" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Login
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" className="mb-4" />
          <h2 className="text-2xl font-bold text-white tracking-wide">DPM CONNECT</h2>
          <p className="text-sm text-slate-400 mt-1">Lupa Password Akun DPM</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-xl"
        >
          {isSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Link Reset Terkirim</h3>
              <p className="text-sm text-slate-400 mb-6">
                Kami telah mengirimkan instruksi pemulihan password ke email kampus Anda: <br />
                <strong className="text-slate-200">{email}</strong>.
              </p>
              <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                <Link href="/login">Kembali ke Halaman Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-slate-400 leading-relaxed">
                Masukkan alamat email resmi kampus Anda (domain `@itbriau.ac.id` atau `@mahasiswa.itbriau.ac.id`). Kami akan mengirimkan tautan untuk mengatur ulang password Anda.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Resmi Kampus</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@itbriau.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Mengirim Link...
                  </>
                ) : (
                  'Kirim Link Reset'
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
