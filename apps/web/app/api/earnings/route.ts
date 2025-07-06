/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@deva/db';
import { NextRequest, NextResponse } from 'next/server';

interface Earning {
  id: number;
  farmerId: string;
  amount: number;
  source: string;
  description?: string;
  cropName?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function getEarningsByFarmerId(farmerId: string): Promise<Earning[]> {
  try {
    const earnings = await prisma.earning.findMany({
      where: { farmerId },
      orderBy: { date: 'desc' },
    });
    return earnings.map(e => ({
      ...e,
      cropName: e.cropName ?? undefined,
      description:  undefined,
    }));
  } catch (err: any) {
    console.error('Error fetching earnings:', err);
    throw new Error(`Failed to fetch earnings: ${err.message}`);
  } 
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log(searchParams);
    const farmerId = searchParams.get('farmerId');
    if (!farmerId) {
      return NextResponse.json({ error: 'farmerId is required' }, { status: 400 });
    }

    const earnings = await getEarningsByFarmerId(farmerId);
    return NextResponse.json(earnings, { status: 200 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch earnings' }, { status: 500 });
  }
}

async function createEarning(data: any) {
  try {
    const earning = await prisma.earning.create({
      data: {
        farmerId: data.farmerId,
        amount: parseFloat(data.amount.toString()),
        source: data.source,
        cropName: data.cropName || undefined,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
    return earning;
  } catch (err: any) {
    console.error('Error creating earning:', err);
    throw new Error(`Failed to create earning: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    if (!data.farmerId || !data.amount || !data.source) {
      return NextResponse.json({ error: 'farmerId, amount, and source are required' }, { status: 400 });
    }

    const createdEarning = await createEarning(data);
    return NextResponse.json(createdEarning, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create earning' }, { status: 500 });
  }
}



async function deleteEarning(farmerId: string, id: number) {
  try {
    const earning = await prisma.earning.findFirst({
      where: { id, farmerId },
    });

    if (!earning) {
      throw new Error('Earning not found or does not belong to this farmer');
    }

    await prisma.earning.delete({
      where: { id },
    });

    return { message: 'Earning deleted successfully' };
  } catch (err: any) {
    console.error('Error deleting earning:', err);
    throw new Error(`Failed to delete earning: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const id = searchParams.get('id');

    if (!farmerId || !id) {
      return NextResponse.json({ error: 'farmerId and id are required' }, { status: 400 });
    }

    const result = await deleteEarning(farmerId, parseInt(id));
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete earning' }, { status: error.message.includes('not found') ? 404 : 500 });
  }
}