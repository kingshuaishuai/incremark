import type { ChatMessage } from '../protocol/message.js';

/**
 * Get linear thread from root to the specified leaf message
 */
export function getLinearThread(
  messages: readonly ChatMessage[],
  leafId: string
): ChatMessage[] {
  const byId = new Map(messages.map(m => [m.id, m]));
  const path: ChatMessage[] = [];

  let current = byId.get(leafId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}

/**
 * Get all direct children (branches) of a parent message
 */
export function getBranches(
  messages: readonly ChatMessage[],
  parentId: string
): ChatMessage[] {
  return messages.filter(m => m.parentId === parentId);
}
