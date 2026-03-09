import { describe, it, expect } from 'vitest';
import { getLinearThread, getBranches } from '../utils/tree.js';
import type { ChatMessage } from '../protocol/message.js';

function msg(id: string, parentId?: string | null): ChatMessage {
  return {
    id,
    parentId: parentId ?? null,
    role: 'user',
    parts: [],
    status: 'success',
    createdAt: Date.now(),
  };
}

describe('getLinearThread', () => {
  it('should return linear path from root to leaf', () => {
    const messages = [msg('a', null), msg('b', 'a'), msg('c', 'b')];
    const thread = getLinearThread(messages, 'c');
    expect(thread.map(m => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('should handle single message', () => {
    const messages = [msg('a', null)];
    const thread = getLinearThread(messages, 'a');
    expect(thread.map(m => m.id)).toEqual(['a']);
  });

  it('should return only the branch path, not siblings', () => {
    const messages = [
      msg('root', null),
      msg('branch-a', 'root'),
      msg('branch-b', 'root'),
      msg('leaf-a', 'branch-a'),
    ];
    const thread = getLinearThread(messages, 'leaf-a');
    expect(thread.map(m => m.id)).toEqual(['root', 'branch-a', 'leaf-a']);
  });

  it('should return empty array for unknown leaf', () => {
    const messages = [msg('a', null)];
    expect(getLinearThread(messages, 'unknown')).toEqual([]);
  });
});

describe('getBranches', () => {
  it('should return all children of a parent', () => {
    const messages = [
      msg('root', null),
      msg('a', 'root'),
      msg('b', 'root'),
      msg('c', 'root'),
    ];
    const branches = getBranches(messages, 'root');
    expect(branches.map(m => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('should return empty array when no children', () => {
    const messages = [msg('root', null)];
    expect(getBranches(messages, 'root')).toEqual([]);
  });
});
