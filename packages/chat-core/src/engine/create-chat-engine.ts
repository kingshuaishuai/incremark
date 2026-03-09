import { nanoid } from 'nanoid';
import type { ChatMessage } from '../protocol/message.js';
import type { StreamPart } from '../protocol/transport.js';
import type {
  ChatEngine,
  ChatEngineConfig,
  ChatEngineState,
  EngineError,
  EngineEventHandler,
  EngineEventMap,
  EngineStatus,
  ProcessorActions,
  SendOptions,
} from './types.js';

function defaultIdGenerator(): string {
  return `msg_${nanoid()}`;
}

export function createChatEngine(config: ChatEngineConfig): ChatEngine {
  const {
    transport,
    processors = [],
    initialMessages = [],
    idGenerator = defaultIdGenerator,
  } = config;

  // Internal State
  let messages: ChatMessage[] = [...initialMessages];
  let status: EngineStatus = 'idle';
  let error: string | undefined;
  let abortController: AbortController | null = null;

  // Listeners
  const stateListeners = new Set<(state: ChatEngineState) => void>();
  const eventHandlers: {
    [K in keyof EngineEventMap]?: Set<EngineEventHandler<K>>;
  } = {};

  function getState(): ChatEngineState {
    return { messages: [...messages], status, error };
  }

  function notify() {
    const state = getState();
    for (const listener of stateListeners) {
      try { listener(state); } catch (e) { console.error('Listener error:', e); }
    }
    emitEvent('stateChange', state);
  }

  function emitEvent<K extends keyof EngineEventMap>(
    event: K,
    payload: EngineEventMap[K]
  ) {
    const handlers = eventHandlers[event] as Set<EngineEventHandler<K>> | undefined;
    if (handlers) {
      for (const handler of handlers) {
        if (payload === undefined) {
          (handler as () => void)();
        } else {
          (handler as (p: EngineEventMap[K]) => void)(payload);
        }
      }
    }
  }

  // Atomic Operations
  function replaceMessageId(oldId: string, newId: string) {
    const msg = messages.find(m => m.id === oldId);
    if (msg) {
      msg.id = newId;
      notify();
    }
  }

  function updateMessage(id: string, updater: (msg: ChatMessage) => void) {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      updater(msg);
      notify();
    }
  }

  function removeMessages(predicate: (msg: ChatMessage) => boolean) {
    const before = messages.length;
    messages = messages.filter(m => !predicate(m));
    if (messages.length !== before) {
      notify();
    }
  }

  // Processor Actions
  const processorActions: ProcessorActions = {
    replaceMessageId,
    updateMessage,
    removeMessages,
    getMessages: () => [...messages],
    emit: (hookName, payload) => {
      emitEvent(hookName as keyof EngineEventMap, payload as any);
    },
  };

  // Stream Processing
  function runProcessors(event: StreamPart): StreamPart | null {
    let current: StreamPart | null = event;
    for (const processor of processors) {
      if (current === null) break;
      current = processor.process(current, processorActions);
    }
    return current;
  }

  function applyStandardEvent(msg: ChatMessage, event: StreamPart) {
    switch (event.type) {
      case 'text': {
        let lastText: typeof msg.parts[number] | undefined;
        for (let i = msg.parts.length - 1; i >= 0; i--) {
          if (msg.parts[i].type === 'text') { lastText = msg.parts[i]; break; }
        }
        if (lastText && lastText.type === 'text') {
          lastText.content += event.content;
        } else {
          msg.parts.push({
            type: 'text',
            content: event.content,
            format: event.format ?? 'markdown',
          });
        }
        break;
      }
      case 'reasoning': {
        let lastReasoning: typeof msg.parts[number] | undefined;
        for (let i = msg.parts.length - 1; i >= 0; i--) {
          if (msg.parts[i].type === 'reasoning') { lastReasoning = msg.parts[i]; break; }
        }
        if (lastReasoning && lastReasoning.type === 'reasoning') {
          lastReasoning.content += event.content;
        } else {
          msg.parts.push({ type: 'reasoning', content: event.content });
        }
        break;
      }
      case 'tool-call': {
        msg.parts.push({
          type: 'tool-call',
          toolCallId: event.toolCallId || idGenerator(),
          toolName: event.toolName,
          args: event.args,
          state: 'executing',
        });
        break;
      }
      case 'ui': {
        msg.parts.push({
          type: 'ui',
          component: event.component,
          props: event.props,
        });
        break;
      }
      case 'done': {
        msg.status = 'success';
        for (const p of msg.parts) {
          if (p.type === 'tool-call' && p.state === 'executing') {
            p.state = 'output-available';
          }
        }
        break;
      }
      case 'error': {
        msg.status = 'error';
        msg.metadata = { ...msg.metadata, error: event.error };
        break;
      }
      default: {
        emitEvent('unknown-event', event);
        break;
      }
    }
  }

  function cleanupExecutingToolCalls(msg: ChatMessage) {
    for (const p of msg.parts) {
      if (p.type === 'tool-call' && p.state === 'executing') {
        p.state = 'output-available';
      }
    }
  }

  async function consumeStream(
    stream: AsyncIterable<StreamPart>,
    assistantMsg: ChatMessage
  ) {
    for await (const event of stream) {
      const processed = runProcessors(event);
      if (processed === null) continue;
      applyStandardEvent(assistantMsg, processed);
      notify();
    }
  }

  // Public API
  async function send(text: string, options?: SendOptions) {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    const userMsg: ChatMessage = {
      id: idGenerator(),
      role: 'user',
      parts: [{ type: 'text', content: text, format: 'plain' }],
      status: 'success',
      createdAt: Date.now(),
    };
    messages.push(userMsg);

    let assistantMsg: ChatMessage;
    if (options?.targetMessageId) {
      const existing = messages.find(m => m.id === options.targetMessageId);
      if (existing) {
        existing.parts = [];
        existing.status = 'streaming';
        assistantMsg = existing;
      } else {
        assistantMsg = {
          id: options.targetMessageId,
          role: 'assistant',
          parts: [],
          status: 'streaming',
          createdAt: Date.now(),
        };
        messages.push(assistantMsg);
      }
    } else {
      assistantMsg = {
        id: idGenerator(),
        role: 'assistant',
        parts: [],
        status: 'streaming',
        createdAt: Date.now(),
      };
      messages.push(assistantMsg);
    }

    status = 'streaming';
    error = undefined;
    notify();

    try {
      const stream = transport.send(
        [...messages],
        { signal: abortController.signal, metadata: options?.metadata }
      );
      await consumeStream(stream, assistantMsg);

      if (assistantMsg.status === 'streaming') {
        assistantMsg.status = 'success';
      }
      status = 'idle';
      emitEvent('done', undefined);
      notify();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (assistantMsg.parts.length > 0) {
          assistantMsg.status = 'success';
          cleanupExecutingToolCalls(assistantMsg);
        } else {
          messages = messages.filter(m => m.id !== assistantMsg.id);
        }
        status = 'idle';
        notify();
        return;
      }

      const engineError: EngineError = {
        type: err instanceof TypeError ? 'network' : 'stream',
        original: err,
        message: err instanceof Error ? err.message : String(err),
      };
      assistantMsg.status = 'error';
      assistantMsg.metadata = { ...assistantMsg.metadata, error: engineError.message };
      status = 'error';
      error = engineError.message;
      emitEvent('error', engineError);
      notify();
    } finally {
      abortController = null;
    }
  }

  function abort() {
    if (abortController) {
      abortController.abort();
      transport.abort?.();
    }
  }

  function on<K extends keyof EngineEventMap>(
    event: K,
    handler: EngineEventHandler<K>
  ): () => void {
    if (!eventHandlers[event]) {
      eventHandlers[event] = new Set() as any;
    }
    (eventHandlers[event] as Set<EngineEventHandler<K>>).add(handler);
    return () => {
      (eventHandlers[event] as Set<EngineEventHandler<K>>).delete(handler);
    };
  }

  function subscribe(listener: (state: ChatEngineState) => void): () => void {
    stateListeners.add(listener);
    return () => stateListeners.delete(listener);
  }

  return {
    getState,
    subscribe,
    send,
    abort,
    replaceMessageId,
    updateMessage,
    removeMessages,
    on,
  };
}
