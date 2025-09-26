import { NextRequest } from "next/server"
import { addSseWriter, removeSseWriter } from "@/lib/sse"


// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export const runtime = "nodejs"

const encoder = new TextEncoder()

export async function GET(_req: NextRequest) {
  const stream = new TransformStream<Uint8Array, Uint8Array>()
  const writer = stream.writable.getWriter()

  addSseWriter(writer)

  const response = new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  })

  await writer.write(encoder.encode(`data: ${JSON.stringify({ ping: Date.now() })}

`))

  const notifyClose = () => {
    removeSseWriter(writer)
    writer.releaseLock()
  }

  // @ts-expect-error: onclose is Node extension
  response.onclose = notifyClose
  // @ts-expect-error: onclose is Node extension
  response.onerror = notifyClose

  return response
}
