# Anthropic 集成

使用 `@anthropic-ai/sdk` 库。

## 示例

```ts
import Anthropic from '@anthropic-ai/sdk'
import { IncremarkContent } from '@incremark/react'

const anthropic = new Anthropic({
  apiKey: 'YOUR_API_KEY',
})

function App() {
  const [stream, setStream] = useState(null)

  async function startChat() {
    async function* getStream() {
      const stream = await anthropic.messages.create({
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello, Claude' }],
        model: 'claude-3-opus-20240229',
        stream: true,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          yield chunk.delta.text
        }
      }
    }
    
    setStream(() => getStream)
  }

  return (
    <>
      <button onClick={startChat}>Send</button>
      <IncremarkContent stream={stream} />
    </>
  )
}
```
