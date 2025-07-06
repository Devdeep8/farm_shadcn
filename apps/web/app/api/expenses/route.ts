/* eslint-disable @typescript-eslint/no-explicit-any */
import {prisma} from "@deva/db";
import { NextRequest , NextResponse } from "next/server";


export async function POST(requset : NextRequest) {

    try {
        const data = await requset.json();
        console.log("data" , data); 
        const destrucutreDataFromFunction = await destrucutredData(data);

        const createdExpense = await createExpense(destrucutreDataFromFunction)
        return NextResponse.json(createdExpense);
        console.log(destrucutreDataFromFunction.amount , destrucutreDataFromFunction.category);
    }   catch (error) {
        NextResponse.json(error);
    }
    
}



async function destrucutredData(data : any) {
    const {amount , category , farmerId} = data
    return { amount , category  , farmerId};
}

async function createExpense(data: any) {
  try {
    const expense = await prisma.expense.create({
      data: {
        farmerId: data.farmerId,
        amount: parseFloat(data.amount.toString()), // Ensure amount is a float
        category: data.category,
        description: data.description || undefined, // Optional field
        cropName: data.cropName || undefined, // Optional field
        date: data.date ? new Date(data.date) : new Date(), // Use provided date or default to now
      },
    });
    return expense;
  } catch (err : any) {
    console.error('Error creating expense:', err);
    throw new Error(`Failed to create expense: ${err.message}`);
  } 
}



async function getExpensesByFarmerId(farmerId: string) {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        farmerId,
      },
      orderBy: {
        date: 'desc', // Sort by date in descending order
      },
    });
    return expenses;
  } catch (err: any) {
    console.error('Error fetching expenses:', err);
    throw new Error(`Failed to fetch expenses: ${err.message}`);
  } 
}

// API handler for GET requests (SRP: Request handling)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log(searchParams);
    const farmerId = searchParams.get('farmerId');

    if (!farmerId) {
      return NextResponse.json(
        { error: 'farmerId is required' },
        { status: 400 }
      );
    }

    const expenses = await getExpensesByFarmerId(farmerId);
    return NextResponse.json(expenses, { status: 200 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}


async function deleteExpenses(farmerId: string, id: number) {
  try {
    const earning = await prisma.expense.findFirst({
      where: { id, farmerId },
    });

    if (!earning) {
      throw new Error('Earning not found or does not belong to this farmer');
    }

    await prisma.expense.delete({
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

    const result = await deleteExpenses(farmerId, parseInt(id));
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete earning' }, { status: error.message.includes('not found') ? 404 : 500 });
  }
}