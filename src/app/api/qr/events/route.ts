import { NextRequest, NextResponse } from 'next/server';
import eventEmitter from '@/lib/event-emitter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const onQrScanned = (transactionId: string) => {
        // SSE messages are formatted as `event: <event_name>\ndata: <data_payload>\n\n`
        controller.enqueue(`event: qrScanned\ndata: ${JSON.stringify({ transactionId })}\n\n`);
      };

      // Add listener to the shared event emitter
      eventEmitter.on('qrScanned', onQrScanned);

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        eventEmitter.removeListener('qrScanned', onQrScanned);
        controller.close();
        console.log('SSE client disconnected.');
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
