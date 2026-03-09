import type { StreamProcessor } from '../engine/types.js';

interface ToolResultEvent {
  type: 'tool-result';
  toolCallId: string;
  output?: unknown;
}

function isToolResultEvent(event: unknown): event is ToolResultEvent {
  const e = event as any;
  return e.type === 'tool-result' && typeof e.toolCallId === 'string';
}

export function toolResultProcessor(): StreamProcessor {
  return {
    name: 'tool-result',
    process(event, actions) {
      if (isToolResultEvent(event)) {
        const messages = actions.getMessages();
        for (const msg of messages) {
          const tc = msg.parts.find(
            p => p.type === 'tool-call' && (p as any).toolCallId === event.toolCallId && (p as any).state === 'executing'
          );
          if (tc) {
            actions.updateMessage(msg.id, m => {
              const part = m.parts.find(
                p => p.type === 'tool-call' && (p as any).toolCallId === event.toolCallId
              );
              if (part && part.type === 'tool-call') {
                (part as any).state = 'output-available';
                if (event.output !== undefined) {
                  (part as any).output = event.output;
                }
              }
            });
            return null;
          }
        }
        return null;
      }
      return event;
    },
  };
}
