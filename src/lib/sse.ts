import type { WritableStreamDefaultWriter } from 'stream/web'

const encoder = new TextEncoder()

export type SseWriter = WritableStreamDefaultWriter<Uint8Array>;

declare global {
  // eslint-disable-next-line no-var
  var __SSE_WRITERS__: Set<SseWriter> | undefined;
}

function getWriterSet(): Set<SseWriter> {
  if (!globalThis.__SSE_WRITERS__) {
    globalThis.__SSE_WRITERS__ = new Set()
  }
  return globalThis.__SSE_WRITERS__
}

export function addSseWriter(writer: SseWriter) {
  getWriterSet().add(writer)
}

export async function broadcastSseEvent(payload: Record<string, unknown>) {
  const data = encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
  const writers = getWriterSet()
  for (const writer of writers) {
    try {
      await writer.write(data)
    } catch (error) {
      console.warn('[SSE] Failed to write, removing writer', error)
      writers.delete(writer)
    }
  }
}

export function removeSseWriter(writer: SseWriter) {
  getWriterSet().delete(writer)
}
