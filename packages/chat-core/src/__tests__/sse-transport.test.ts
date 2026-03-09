import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSSETransport } from '../transport/sse-transport.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(chunks: string[]) {
  let index = 0;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
  return new Response(stream, { status: 200 });
}

describe('createSSETransport', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should parse SSE events', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse([
        'data: {"type":"text","content":"hello"}\n\n',
        'data: {"type":"text","content":" world"}\n\n',
        'data: {"type":"done"}\n\n',
      ])
    );

    const transport = createSSETransport({ url: '/api/chat' });
    const events: any[] = [];
    for await (const event of transport.send([])) {
      events.push(event);
    }

    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: 'text', content: 'hello' });
    expect(events[1]).toEqual({ type: 'text', content: ' world' });
    expect(events[2]).toEqual({ type: 'done' });
  });

  it('should handle chunked SSE data', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse([
        'data: {"type":"te',
        'xt","content":"hello"}\n\ndata: {"type":"done"}\n\n',
      ])
    );

    const transport = createSSETransport({ url: '/api/chat' });
    const events: any[] = [];
    for await (const event of transport.send([])) {
      events.push(event);
    }

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: 'text', content: 'hello' });
  });

  it('should use buildRequest for custom request body', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(['data: {"type":"done"}\n\n'])
    );

    const transport = createSSETransport({
      url: '/api/chat',
      buildRequest(messages, options) {
        return {
          method: 'POST',
          headers: { 'X-Custom': 'true' },
          body: JSON.stringify({ messages, model: options?.metadata?.model }),
        };
      },
    });

    const events: any[] = [];
    for await (const event of transport.send([], { metadata: { model: 'gpt-4' } })) {
      events.push(event);
    }

    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'X-Custom': 'true' }),
    }));
  });

  it('should pass abort signal to fetch', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(['data: {"type":"done"}\n\n'])
    );

    const controller = new AbortController();
    const transport = createSSETransport({ url: '/api/chat' });

    const events: any[] = [];
    for await (const event of transport.send([], { signal: controller.signal })) {
      events.push(event);
    }

    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      signal: controller.signal,
    }));
  });

  it('should throw on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Not Found', { status: 404 }));

    const transport = createSSETransport({ url: '/api/chat' });

    await expect(async () => {
      for await (const _ of transport.send([])) { /* consume */ }
    }).rejects.toThrow('SSE request failed: 404');
  });
});
