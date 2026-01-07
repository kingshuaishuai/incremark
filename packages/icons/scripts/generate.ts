/**
 * 自动生成 src/index.ts
 * 
 * 运行: pnpm generate
 */

import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SVGS_DIR = join(__dirname, '../svgs')
const SRC_DIR = join(__dirname, '../src')
const DIST_DIR = join(__dirname, '../dist')

function generate() {
  const files = readdirSync(SVGS_DIR).filter(f => f.endsWith('.svg'))
  const names = files.map(f => f.replace('.svg', ''))
  
  // 生成 src/index.ts
  const indexTs = [
    '/**',
    ' * @incremark/icons',
    ' * ',
    ' * 此文件由 scripts/generate.ts 自动生成',
    ' * 运行 pnpm generate 重新生成',
    ' */',
    '',
    ...names.map(name => `// @ts-ignore\nexport { default as ${name} } from '../svgs/${name}.svg?raw'`),
    ''
  ].join('\n')
  
  writeFileSync(join(SRC_DIR, 'index.ts'), indexTs)
  
  // 确保 dist 目录存在
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true })
  }
  
  // 生成 dist/index.d.ts
  const indexDts = [
    '/**',
    ' * @incremark/icons 类型声明',
    ' * ',
    ' * 此文件由 scripts/generate.ts 自动生成',
    ' */',
    '',
    ...names.map(name => `export declare const ${name}: string`),
    ''
  ].join('\n')
  
  writeFileSync(join(DIST_DIR, 'index.d.ts'), indexDts)
  
  console.log(`✅ Generated ${names.length} icons: ${names.join(', ')}`)
}

generate()
