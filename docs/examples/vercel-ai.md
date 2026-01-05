# Vercel AI SDK Integration

Using the `ai` SDK.

## Example

```tsx
import { useChat } from 'ai/react'
import { IncremarkContent } from '@incremark/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  const lastMessage = messages[messages.length - 1]
  const isAssistant = lastMessage?.role === 'assistant'

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role === 'user' ? (
            <p>{m.content}</p>
          ) : (
            // Pass content to Incremark
            // Vercel AI SDK updates content reactively
            <IncremarkContent 
              content={m.content} 
              isFinished={false} // You might check if status === 'ready'
            />
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  )
}
```
