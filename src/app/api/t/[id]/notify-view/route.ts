import { NextRequest, NextResponse } from 'next/server';
import eventEmitter from '@/lib/event-emitter';
import { getTransactionById } from '@/lib/transaction-store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Optional: Validate that the transaction exists
    const transaction = getTransactionById(id);
    if (!transaction) {
      // Even if transaction not found, we accept the request to not reveal existence
      console.warn(`Received view notification for non-existent transaction ID: ${id}`);
    } else {
       // Emit the event to any listening SSE clients (the QR page)
       eventEmitter.emit('qrScanned', id);
    }

    // Use NextResponse.json() for a standard 200 OK response
    return NextResponse.json({ success: true, message: 'Event emitted' });

  } catch (error) {
    console.error('Error in notify-view endpoint:', error);
    // Return a generic error response
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
