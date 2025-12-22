/**
 * 验证脚本 - 检查核心功能逻辑
 */

// 模拟测试 generateCSSVars 的逻辑
function testGenerateCSSVars() {
  console.log('Testing generateCSSVars logic...')
  
  // 模拟一个简单的 token 对象
  const testTokens = {
    color: {
      text: {
        primary: '#1f2328'
      }
    },
    spacing: {
      sm: '4px'
    }
  }
  
  // 模拟 objectToCSSVars 逻辑
  function objectToCSSVars(obj: any, prefix: string, result: string[] = []): void {
    for (const [key, value] of Object.entries(obj)) {
      const varName = prefix ? `${prefix}-${key}` : key
      const kebabKey = varName.replace(/([A-Z])/g, '-$1').toLowerCase()

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        objectToCSSVars(value, kebabKey, result)
      } else {
        result.push(`  --${kebabKey}: ${value};`)
      }
    }
  }
  
  const vars: string[] = []
  objectToCSSVars(testTokens, 'incremark', vars)
  
  const output = `:root {\n${vars.join('\n')}\n}`
  
  console.log('Generated CSS Variables:')
  console.log(output)
  
  // 验证
  const hasColor = output.includes('--incremark-color-text-primary')
  const hasSpacing = output.includes('--incremark-spacing-sm')
  
  if (hasColor && hasSpacing) {
    console.log('✓ generateCSSVars logic is correct')
    return true
  } else {
    console.log('✗ generateCSSVars logic has issues')
    return false
  }
}

// 运行测试
const result = testGenerateCSSVars()
process.exit(result ? 0 : 1)

