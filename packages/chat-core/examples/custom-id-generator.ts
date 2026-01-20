/**
 * Example: Custom ID Generators
 *
 * This example demonstrates how to use custom ID generators with ChatEngine
 */

import { ChatEngine, defaultIDGenerator, type IDGenerator } from '@incremark/chat-core';
import { MockTransport } from '@incremark/chat-core/protocol';

// ============================================
// Example 1: Using the default nanoid generator
// ============================================
const engine1 = new ChatEngine({
  transport: new MockTransport()
  // Uses default: nanoid with 'msg_' prefix
});

// Generated IDs will look like: msg_V1StGXR8_Z5jdHi6B-myT
console.log('Default nanoid IDs:', engine1.getState().messages);


// ============================================
// Example 2: Custom prefix with nanoid
// ============================================
import { nanoid } from 'nanoid';

const customIDGenerator: IDGenerator = () => `chat_${nanoid(12)}`;

const engine2 = new ChatEngine({
  transport: new MockTransport(),
  idGenerator: customIDGenerator
});

// Generated IDs will look like: chat_V1StGXR8_Z5j
console.log('Custom prefix IDs:', engine2.getState().messages);


// ============================================
// Example 3: Using crypto.randomUUID() (modern browsers)
// ============================================
const uuidGenerator: IDGenerator = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `msg_${nanoid()}`;
};

const engine3 = new ChatEngine({
  transport: new MockTransport(),
  idGenerator: uuidGenerator
});

// Generated IDs will look like: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
console.log('UUID IDs:', engine3.getState().messages);


// ============================================
// Example 4: Using a simple counter (for testing)
// ============================================
let counter = 0;
const counterGenerator: IDGenerator = () => `msg_${++counter}`;

const engine4 = new ChatEngine({
  transport: new MockTransport(),
  idGenerator: counterGenerator
});

// Generated IDs will look like: msg_1, msg_2, msg_3, ...
console.log('Counter IDs:', engine4.getState().messages);


// ============================================
// Example 5: Using timestamp-based IDs
// ============================================
const timestampGenerator: IDGenerator = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const engine5 = new ChatEngine({
  transport: new MockTransport(),
  idGenerator: timestampGenerator
});

// Generated IDs will look like: msg_1736600000000_abc123
console.log('Timestamp IDs:', engine5.getState().messages);


// ============================================
// Example 6: Using UUID library (if installed)
// ============================================
// import { v4 as uuidv4 } from 'uuid';
//
// const uuidLibraryGenerator: IDGenerator = () => uuidv4();
//
// const engine6 = new ChatEngine({
//   transport: new MockTransport(),
//   idGenerator: uuidLibraryGenerator
// });


// ============================================
// Example 7: Snowflake ID (for distributed systems)
// ============================================
// import { Snowflake } from '@sapphire/snowflake';
//
// const snowflake = new Snowflake(1n); // worker ID
// const snowflakeGenerator: IDGenerator = () => snowflake.generate().toString();
//
// const engine7 = new ChatEngine({
//   transport: new MockTransport(),
//   idGenerator: snowflakeGenerator
// });


// ============================================
// Best Practices
// ============================================
console.log(`
Best Practices for ID Generators:

1. Use default nanoid for most cases
   - Fast, collision-resistant, URL-safe
   - Compact: 21 characters vs 36 for UUID

2. Use crypto.randomUUID() when you need:
   - Standard UUID v4 format
   - Browser-native implementation
   - No additional dependencies

3. Use custom prefix for easier debugging:
   - 'msg_' for messages
   - 'sess_' for sessions
   - 'conv_' for conversations

4. Avoid sequential IDs in production:
   - Can expose information about your system
   - Not suitable for distributed systems
   - Use only for testing/debugging

5. Consider your requirements:
   - Uniqueness guarantee (UUID/nanoid)
   - Sortability (timestamp + random)
   - Distributed systems (snowflake)
   - Performance (nanoid is fastest)
`);
