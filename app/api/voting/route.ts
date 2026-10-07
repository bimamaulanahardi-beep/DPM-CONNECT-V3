import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification, ringkas, statusLabel } from '@/lib/notification';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const list = await prisma.voting.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    const formattedList = list.map((item) => ({
      id: item.id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      status: item.status,
      sidang_id: item.sidang_id || undefined,
      tanggal_mulai: item.tanggal_mulai || undefined,
      tanggal_selesai: item.tanggal_selesai || undefined,
      quorum_required: item.quorum_required,
      total_pemilih: item.total_pemilih,
      jenis: item.jenis as 'binary' | 'multipilih',
      opsi_multipilih: item.opsi_multipilih ? JSON.parse(item.opsi_multipilih) : undefined,
      hasil: {
        setuju: item.hasil_setuju,
        tidak_setuju: item.hasil_tidak_setuju,
        abstain: item.hasil_abstain,
        total: item.hasil_total,
      },
      created_by: item.created_by,
    }));

    return NextResponse.json(formattedList);
  } catch (error: any) {
    console.error('Error fetching voting:', error);
    return NextResponse.json({ error: 'Failed to fetch voting' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      judul,
      deskripsi,
      status,
      sidang_id,
      tanggal_mulai,
      tanggal_selesai,
      quorum_required,
      total_pemilih,
      jenis,
      opsi_multipilih,
      created_by,
    } = body;

    if (!judul || !deskripsi || !status || !jenis) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = body.id || `VOT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const newVoting = await prisma.voting.create({
      data: {
        id,
        judul,
        deskripsi,
        status,
        sidang_id: sidang_id || null,
        tanggal_mulai: tanggal_mulai || null,
        tanggal_selesai: tanggal_selesai || null,
        quorum_required: Number(quorum_required || 0),
        total_pemilih: Number(total_pemilih || 0),
        jenis,
        opsi_multipilih: opsi_multipilih ? JSON.stringify(opsi_multipilih) : null,
        hasil_setuju: 0,
        hasil_tidak_setuju: 0,
        hasil_abstain: 0,
        hasil_total: 0,
        created_by: created_by || '1',
      },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Membuat sesi pemungutan suara',
        modul: 'Voting',
        detail: `Membuat voting: "${judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    await createInAppNotification({
      judul: status === 'aktif' ? 'Pemungutan Suara Dibuka' : 'Sesi Voting Baru Dibuat',
      pesan:
        status === 'aktif'
          ? `Sesi voting "${judul}" telah dibuka. Silakan berikan suara Anda.`
          : `Sesi voting "${judul}" telah dibuat dan akan segera dibuka.`,
      jenis: 'voting',
      link: `/dashboard/voting/${id}`,
      detail: {
        Deskripsi: ringkas(deskripsi, 400),
        Jenis: jenis === 'binary' ? 'Setuju / Tidak Setuju / Abstain' : 'Multi Pilihan',
        Opsi:
          Array.isArray(opsi_multipilih) && opsi_multipilih.length
            ? opsi_multipilih
                .map((o: any) => (typeof o === 'string' ? o : o?.label || o?.nama || o?.text || JSON.stringify(o)))
                .join(', ')
            : undefined,
        Mulai: tanggal_mulai,
        Selesai: tanggal_selesai,
        Status: statusLabel(status),
      },
    });

    const formattedVoting = {
      id: newVoting.id,
      judul: newVoting.judul,
      deskripsi: newVoting.deskripsi,
      status: newVoting.status,
      sidang_id: newVoting.sidang_id || undefined,
      tanggal_mulai: newVoting.tanggal_mulai || undefined,
      tanggal_selesai: newVoting.tanggal_selesai || undefined,
      quorum_required: newVoting.quorum_required,
      total_pemilih: newVoting.total_pemilih,
      jenis: newVoting.jenis as 'binary' | 'multipilih',
      opsi_multipilih: newVoting.opsi_multipilih ? JSON.parse(newVoting.opsi_multipilih) : undefined,
      hasil: {
        setuju: newVoting.hasil_setuju,
        tidak_setuju: newVoting.hasil_tidak_setuju,
        abstain: newVoting.hasil_abstain,
        total: newVoting.hasil_total,
      },
      created_by: newVoting.created_by,
    };

    return NextResponse.json(formattedVoting, { status: 201 });
  } catch (error: any) {
    console.error('Error creating voting:', error);
    return NextResponse.json({ error: 'Failed to create voting' }, { status: 500 });
  }
}
