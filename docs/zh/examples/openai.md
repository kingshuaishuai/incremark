# OpenAI 集成

使用 `openai` Node.js 库。

## 示例

```ts
import OpenAI from 'openai'
import { IncremarkContent } from '@incremark/react'

const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  dangerouslyAllowBrowser: true // 仅用于客户端演示
})

function App() {
  const [stream, setStream] = useState(null)

  async function startChat() {
    async function* getStream() {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: "Explain quantum computing" }],
        stream: true,
      })

      for await (const chunk of completion) {
        yield chunk.choices[0]?.delta?.content || ''
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
