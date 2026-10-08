import * as React from 'react';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; variant: any }> = {
  // Sidang
  dijadwalkan: { label: 'Dijadwalkan', variant: 'process' },
  berlangsung: { label: 'Sedang Berlangsung', variant: 'approved' },
  ditunda: { label: 'Sedang Ditunda', variant: 'pending' },
  dibatalkan: { label: 'Dibatalkan', variant: 'rejected' },
  
  // Legislasi
  diajukan: { label: 'Diajukan', variant: 'pending' },
  dibahas: { label: 'Dibahas', variant: 'process' },
  direvisi: { label: 'Direvisi', variant: 'pending' },
  disahkan: { label: 'Disahkan', variant: 'approved' },
  diundangkan: { label: 'Diundangkan', variant: 'gold' },
  
  // Aspirasi
  diterima: { label: 'Diterima', variant: 'pending' },
  ditinjau: { label: 'Ditinjau', variant: 'process' },
  ditindaklanjuti: { label: 'Ditindaklanjuti', variant: 'approved' },
  
  // Pengawasan BEM
  belum_mulai: { label: 'Belum Mulai', variant: 'outline' },
  berjalan: { label: 'Berjalan', variant: 'process' },
  terlambat: { label: 'Terlambat', variant: 'rejected' },

  // Voting & Pemira
  draft: { label: 'Belum Aktif', variant: 'pending' },
  belum_aktif: { label: 'Belum Aktif', variant: 'pending' },
  aktif: { label: 'Aktif', variant: 'process' },

  // Letters (Surat)
  terkirim: { label: 'Terkirim', variant: 'approved' },
  diarsip: { label: 'Diarsip', variant: 'navy' },

  // Overlaps & general
  selesai: { label: 'Selesai', variant: 'navy' },
  ditolak: { label: 'Ditolak', variant: 'rejected' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status.toLowerCase()] || { label: status, variant: 'default' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Keep older named exports just in case they are used elsewhere
export function SidangStatusBadge({ status }: { status: any }) {
  return <StatusBadge status={status} />;
}

export function LegislasiStatusBadge({ status }: { status: any }) {
  return <StatusBadge status={status} />;
}

export function AspirasiStatusBadge({ status }: { status: any }) {
  return <StatusBadge status={status} />;
}

export function PengawasanStatusBadge({ status }: { status: any }) {
  return <StatusBadge status={status} />;
}
