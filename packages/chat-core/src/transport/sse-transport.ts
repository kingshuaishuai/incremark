import type { ChatMessage } from '../protocol/message.js';
import type { ChatTransport, StreamPart, TransportOptions } from '../protocol/transport.js';

export interface SSETransportConfig {
  url: string;
  buildRequest?: (
    messages: readonly ChatMessage[],
    options?: TransportOptions
  ) => RequestInit;
}

export function createSSETransport(config: SSETransportConfig): ChatTransport {
  const { url, buildRequest } = config;

  return {
    async *send(
      messages: readonly ChatMessage[],
      options?: TransportOptions
    ): AsyncGenerator<StreamPart> {
      const requestInit: RequestInit = buildRequest
        ? { ...buildRequest(messages, options), signal: options?.signal }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
            signal: options?.signal,
          };

      if (options?.signal && !requestInit.signal) {
        requestInit.signal = options.signal;
      }

      const response = await fetch(url, requestInit);

      if (!response.ok) {
        throw new Error(`SSE request failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data: ')) continue;
            try {
              const json = JSON.parse(line.slice(6)) as StreamPart;
              yield json;
            } catch {
              // Ignore malformed JSON
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}
