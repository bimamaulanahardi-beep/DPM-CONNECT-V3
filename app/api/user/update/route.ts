import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone } = await req.json();

    if (!name || name.length > 100) {
      return NextResponse.json({ error: 'Name is required and must be under 100 characters' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (phone && phone.length > 20) {
      return NextResponse.json({ error: 'Phone number is too long' }, { status: 400 });
    }

    const user = session.user as any;

    const updatedUser = await prisma.user.update({
      where: { nim: user.nim },
      data: {
        name,
        email,
        phone,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
