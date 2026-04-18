import { NextRequest, NextResponse } from 'next/server';
import { prisma, verifyToken } from '@/lib/auth';
import type { Plan } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { plan, subscriptionStatus, subscriptionEndDate, isAdmin } = body;

    const updateData: any = {};
    if (plan) updateData.plan = plan as Plan;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (subscriptionEndDate !== undefined) updateData.subscriptionEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        isVerified: true,
        isAdmin: true,
        plan: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
