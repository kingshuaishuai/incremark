# Custom Stream Integration

Parsing a raw standard `Response` stream.

## Example

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
      <button onClick={start}>Start</button>
      <IncremarkContent stream={stream} />
    </>
  )
}
```
