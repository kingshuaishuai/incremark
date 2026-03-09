import type { StreamProcessor } from '../engine/types.js';

interface ServerIdEvent {
  type: 'user-message-saved' | 'assistant-message-created';
  tempId: string;
  messageId: string;
}

function isServerIdEvent(event: unknown): event is ServerIdEvent {
  const e = event as any;
  return (
    (e.type === 'user-message-saved' || e.type === 'assistant-message-created') &&
    typeof e.tempId === 'string' &&
    typeof e.messageId === 'string'
  );
}

export function serverIdMapping(): StreamProcessor {
  return {
    name: 'server-id-mapping',
    process(event, actions) {
      if (isServerIdEvent(event)) {
        actions.replaceMessageId(event.tempId, event.messageId);
        return null;
      }
      return event;
    },
  };
}
