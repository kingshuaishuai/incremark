import { defineConfig } from 'tsup'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,  // d.ts 由 generate 脚本生成
  splitting: false,
  sourcemap: true,
  clean: false,  // 不清理，保留 generate 生成的 d.ts
  treeshake: true,
  esbuildPlugins: [
    {
      name: 'svg-raw-loader',
      setup(build) {
        build.onResolve({ filter: /\.svg\?raw$/ }, args => {
          const svgPath = args.path.replace('?raw', '')
          return {
            path: resolve(dirname(args.importer), svgPath),
            namespace: 'svg-raw'
          }
        })
        
        build.onLoad({ filter: /.*/, namespace: 'svg-raw' }, args => {
          const content = readFileSync(args.path, 'utf-8')
          return {
            contents: `export default ${JSON.stringify(content.trim())}`,
            loader: 'js'
          }
        })
      }
    }
  ]
})
