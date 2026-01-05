# 自定义流集成

解析原始的标准 `Response` 流。

## 示例

```ts
import { IncremarkContent } from '@incremark/react'

function App() {
  const [stream, setStream] = useState(null)

  function start() {
    async function* fetchStream() {
      const response = await fetch('/api/stream')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        yield decoder.decode(value, { stream: true })
      }
    }
    
    setStream(() => fetchStream)
  }

  return (
    <>
      <button onClick={start}>开始</button>
      <IncremarkContent stream={stream} />
    </>
  )
}
```
