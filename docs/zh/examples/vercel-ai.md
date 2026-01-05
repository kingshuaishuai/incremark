# Vercel AI SDK 集成

使用 `ai` SDK。

## 示例

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
            // 将内容传递给 Incremark
            // Vercel AI SDK 响应式更新内容
            <IncremarkContent 
              content={m.content} 
              isFinished={false} // 你可以检查 status === 'ready'
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
