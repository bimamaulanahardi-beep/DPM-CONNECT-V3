'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { 
  LayoutDashboard, 
  BookOpen, 
  Scale, 
  Vote, 
  ShieldCheck, 
  ShieldAlert,
  History,
  MessageSquareText, 
  Users2, 
  Mail, 
  Settings, 
  LogOut, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight,
  User,
  Search,
  CheckCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { getInitials } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[]; // Allowed roles: pimpinan, ketua_komisi, anggota, mahasiswa
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifList, setNotifList] = useState<any[]>([]);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Fetch real notifications
  useEffect(() => {
    if (session?.user) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch('/api/notifikasi');
          if (res.ok) {
            const data = await res.json();
            setNotifList(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      };
      fetchNotifications();
      // Optional: Poll every 1 minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-xs uppercase font-bold tracking-widest text-slate-500">DPM Connect Loading</p>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as any;
  const userRole = user.role || 'mahasiswa';

  // Navigation Items
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'pimpinan', 'ketua_komisi', 'anggota', 'mahasiswa'] },
    { label: 'Sidang DPM', href: '/dashboard/sidang', icon: BookOpen, roles: ['pimpinan', 'ketua_komisi', 'anggota'] },
    { label: 'Legislasi / RUU', href: '/dashboard/legislasi', icon: Scale, roles: ['pimpinan', 'ketua_komisi', 'anggota'] },
    { label: 'Sesi Voting', href: '/dashboard/voting', icon: Vote, roles: ['pimpinan', 'ketua_komisi', 'anggota'] },
    { label: 'Pengawasan BEM', href: '/dashboard/pengawasan', icon: ShieldCheck, roles: ['pimpinan', 'ketua_komisi', 'anggota', 'bem'] },
    { label: 'Aspirasi Masuk', href: '/dashboard/aspirasi', icon: MessageSquareText, roles: ['pimpinan', 'ketua_komisi', 'anggota'] },
    { label: 'Daftar Anggota', href: '/dashboard/anggota', icon: Users2, roles: ['admin', 'pimpinan', 'ketua_komisi', 'anggota', 'mahasiswa'] },
    { label: 'Surat Menyurat', href: '/dashboard/surat', icon: Mail, roles: ['pimpinan', 'ketua_komisi', 'anggota'] },
    { label: 'Manajemen Pengguna', href: '/dashboard/admin/users', icon: ShieldAlert, roles: ['admin', 'pimpinan'] },
    { label: 'Log Aktivitas', href: '/dashboard/admin/audit-logs', icon: History, roles: ['admin', 'pimpinan'] },
    { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: Settings, roles: ['admin', 'pimpinan', 'ketua_komisi', 'anggota', 'mahasiswa', 'bem'] },
  ];

  // Filter navigation by user role
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleMarkAllRead = () => {
    setNotifList(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifList.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-sans select-none">
      
      {/* 1. Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r border-[#4b545c] bg-[#343a40] transition-all duration-300 shrink-0 shadow-lg ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#4b545c] flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <Logo size="md" />
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="font-bold text-sm tracking-wide block text-white">DPM CONNECT</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">ITB Riau</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-thin">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold tracking-wide transition-all group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-sm' 
                    : 'text-[#c2c7d0] hover:text-white hover:bg-[#494e53]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-[#c2c7d0] group-hover:text-white'}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#4b545c]">
          <Button 
            onClick={handleSignOut}
            variant="ghost" 
            className={`w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded text-xs font-bold gap-3 px-3 h-10 ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Keluar</span>}
          </Button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Toggle button desktop */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:block p-1.5 text-slate-400 hover:text-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Toggle button mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-400 hover:text-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Section Name */}
            <span className="text-sm font-semibold text-slate-300 hidden sm:inline-block">
              {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>

          <div className="flex items-center gap-2 relative">
            
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-400 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full" />
                )}
              </Button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg overflow-hidden z-40"
                    >
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
                        <span className="text-xs font-bold text-white tracking-wide">Notifikasi</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-amber-500 font-bold hover:underline"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100 scrollbar-thin">
                        {notifList.length > 0 ? (
                          notifList.map((notif) => (
                            <Link 
                              key={notif.id}
                              href={notif.link || '/dashboard'}
                              onClick={() => {
                                setNotificationsOpen(false);
                                setNotifList(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                              }}
                              className={`block p-4 transition-colors hover:bg-gray-50 ${
                                !notif.is_read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex gap-2.5 items-start">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${!notif.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-bold text-white line-clamp-1">{notif.judul}</h4>
                                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{notif.pesan}</p>
                                  <span className="text-[8px] text-slate-500 block pt-1">{new Date(notif.tanggal).toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-8 text-center text-xs text-slate-400">Tidak ada notifikasi baru</div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Avatar className="h-9 w-9 border border-slate-800">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-slate-800 text-amber-500 font-bold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-35" onClick={() => setUserDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg overflow-hidden z-40 p-1"
                    >
                      <div className="p-3.5 border-b border-slate-850 mb-1">
                        <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 capitalize">{user.role.replace('_', ' ')}</p>
                        {user.jabatan && (
                          <span className="inline-block text-[9px] text-blue-700 font-semibold bg-amber-500/10 text-amber-500 border border-blue-200 px-2 py-0.5 rounded mt-1.5">
                            {user.jabatan}
                          </span>
                        )}
                      </div>
                      
                      <Link 
                        href="/dashboard/pengaturan" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded text-xs font-semibold text-slate-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profil Saya
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/5 transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Dashboard Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 scrollbar-thin">
          {children}
        </main>

      </div>

      {/* 3. Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-[#343a40] border-r border-[#4b545c] z-50 p-4 flex flex-col justify-between md:hidden"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#4b545c] pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <Logo size="sm" />
                    <div>
                      <span className="font-bold text-xs tracking-wide text-white block">DPM CONNECT</span>
                      <span className="text-[9px] text-slate-500 uppercase">ITB Riau</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold tracking-wide transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold' 
                            : 'text-[#c2c7d0] hover:text-white hover:bg-[#494e53]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#c2c7d0]'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div>
                <Button 
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    handleSignOut();
                  }}
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/5 text-xs font-bold gap-3 px-3 h-10"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Keluar</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
