// GET /api/tokens/[id]/stream - SSE stream for token status updates
import { NextRequest } from 'next/server';
import { qrTokenStore } from '@/server/qrTokenStore';

// Force dynamic for token security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface StreamParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: StreamParams) {
  const { id } = await params;

  console.log(`🔄 Starting SSE stream for token: ${id}`);

  // Check if token exists
  const initialStatus = qrTokenStore.getTokenStatus(id);
  if (!initialStatus) {
    return new Response('Token not found', { status: 404 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  let isStreamActive = true;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial status
      const initialData = `data: ${JSON.stringify(initialStatus)}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // Set up event listeners
      const onStatusChange = (token: any) => {
        if (token.id === id && isStreamActive) {
          const status = qrTokenStore.getTokenStatus(id);
          if (status) {
            const data = `data: ${JSON.stringify(status)}\n\n`;
            try {
              controller.enqueue(encoder.encode(data));
            } catch (error) {
              console.log(`SSE stream closed for token: ${id}`);
              isStreamActive = false;
            }
          }
        }
      };

      // Listen for all token events
      qrTokenStore.on('token:viewed', onStatusChange);
      qrTokenStore.on('token:consumed', onStatusChange);
      qrTokenStore.on('token:expired', onStatusChange);

      // Heartbeat every 15 seconds (reduced from 1 second)
      const heartbeatInterval = setInterval(() => {
        if (!isStreamActive) {
          clearInterval(heartbeatInterval);
          return;
        }

        const currentStatus = qrTokenStore.getTokenStatus(id);
        if (currentStatus) {
          const heartbeat = `data: ${JSON.stringify(currentStatus)}\n\n`;
          try {
            controller.enqueue(encoder.encode(heartbeat));
          } catch (error) {
            console.log(`SSE heartbeat failed for token: ${id}`);
            isStreamActive = false;
            clearInterval(heartbeatInterval);
          }
        } else {
          // Token expired or deleted
          const expiredStatus = {
            id,
            status: 'expired',
            expiresAt: Date.now(),
            isConsumed: false,
          };
          const data = `data: ${JSON.stringify(expiredStatus)}\n\n`;
          try {
            controller.enqueue(encoder.encode(data));
            controller.close();
          } catch (error) {
            // Stream already closed
          }
          isStreamActive = false;
          clearInterval(heartbeatInterval);
        }
      }, 15000); // 15 seconds heartbeat

      // Cleanup on stream close
      request.signal.addEventListener('abort', () => {
        console.log(`🔚 SSE stream aborted for token: ${id}`);
        isStreamActive = false;
        clearInterval(heartbeatInterval);
        qrTokenStore.off('token:viewed', onStatusChange);
        qrTokenStore.off('token:consumed', onStatusChange);
        qrTokenStore.off('token:expired', onStatusChange);
        try {
          controller.close();
        } catch (error) {
          // Stream already closed
        }
      });
    },

    cancel() {
      console.log(`🔚 SSE stream cancelled for token: ${id}`);
      isStreamActive = false;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
