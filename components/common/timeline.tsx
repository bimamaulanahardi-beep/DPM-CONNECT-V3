import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, Circle, XCircle } from 'lucide-react';
import { AspirasiStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TimelineItem {
  status: string;
  label: string;
  keterangan: string;
  tanggal?: string;
  petugas?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isRejected?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-0', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          {/* Icon column */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 transition-all',
                item.isCompleted && !item.isRejected && 'border-emerald-500 bg-emerald-500 text-white',
                item.isCurrent && 'border-blue-500 bg-blue-500 text-white animate-pulse',
                item.isRejected && 'border-rose-500 bg-rose-500 text-white',
                !item.isCompleted && !item.isCurrent && 'border-muted-foreground/30 bg-muted text-muted-foreground'
              )}
            >
              {item.isRejected ? (
                <XCircle className="h-4 w-4" />
              ) : item.isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : item.isCurrent ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>
            {index < items.length - 1 && (
              <div
                className={cn(
                  'w-0.5 flex-1 min-h-8',
                  item.isCompleted ? 'bg-emerald-200' : 'bg-muted'
                )}
              />
            )}
          </div>

          {/* Content column */}
          <div className="pb-6 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p
                  className={cn(
                    'font-semibold text-sm',
                    item.isCompleted || item.isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.keterangan}</p>
                {item.petugas && (
                  <p className="text-xs text-muted-foreground">Petugas: {item.petugas}</p>
                )}
              </div>
              {item.tanggal && (
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(item.tanggal)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const aspirasiStatusLabels: Record<AspirasiStatus, string> = {
  diterima: 'Aspirasi Diterima',
  ditinjau: 'Sedang Ditinjau',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const aspirasiStatusOrder: AspirasiStatus[] = [
  'diterima',
  'ditinjau',
  'ditindaklanjuti',
  'selesai',
];

interface AspirasiTimelineProps {
  timeline: { status: AspirasiStatus; keterangan: string; tanggal: string; petugas?: string }[];
  currentStatus: AspirasiStatus;
}

export function AspirasiTimeline({ timeline, currentStatus }: AspirasiTimelineProps) {
  const timelineMap = new Map(timeline.map((t) => [t.status, t]));
  const isRejected = currentStatus === 'ditolak';

  const items: TimelineItem[] = aspirasiStatusOrder.map((status, index) => {
    const entry = timelineMap.get(status);
    const currentIndex = aspirasiStatusOrder.indexOf(currentStatus);
    const isCompleted = index <= currentIndex || (isRejected && index < currentIndex);
    const isCurrent = status === currentStatus && !isRejected;

    return {
      status,
      label: aspirasiStatusLabels[status],
      keterangan: entry?.keterangan ?? 'Menunggu...',
      tanggal: entry?.tanggal,
      petugas: entry?.petugas,
      isCompleted,
      isCurrent,
    };
  });

  if (isRejected) {
    const rejectEntry = timelineMap.get('ditolak');
    items.push({
      status: 'ditolak',
      label: 'Ditolak',
      keterangan: rejectEntry?.keterangan ?? 'Aspirasi ditolak',
      tanggal: rejectEntry?.tanggal,
      petugas: rejectEntry?.petugas,
      isCompleted: true,
      isCurrent: false,
      isRejected: true,
    });
  }

  return <Timeline items={items} />;
}
