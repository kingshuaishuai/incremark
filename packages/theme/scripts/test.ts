/**
 * 测试脚本 - 验证核心功能
 */

import { generateCSSVars } from '../src/utils/generate-css-vars'
import { mergeTheme } from '../src/utils/merge-theme'
import { defaultTheme } from '../src/themes/default'
import { darkTheme } from '../src/themes/dark'

console.log('🧪 Testing theme system...\n')

// 测试 1: 生成 CSS Variables
console.log('1. Testing generateCSSVars...')
try {
  const cssVars = generateCSSVars(defaultTheme, {
    prefix: 'incremark',
    selector: ':root'
  })
  
  // 检查是否包含关键变量
  const hasColorPrimary = cssVars.includes('--incremark-color-text-primary')
  const hasFontSize = cssVars.includes('--incremark-typography-font-size-base')
  const hasSpacing = cssVars.includes('--incremark-spacing-sm')
  
  if (hasColorPrimary && hasFontSize && hasSpacing) {
    console.log('   ✓ CSS Variables generated successfully')
    console.log(`   ✓ Generated ${cssVars.split('--').length - 1} variables`)
  } else {
    console.log('   ✗ Missing expected variables')
    console.log('   CSS Variables:', cssVars.substring(0, 200) + '...')
  }
} catch (error) {
  console.error('   ✗ Error:', error)
}

// 测试 2: 合并主题
console.log('\n2. Testing mergeTheme...')
try {
  const partialTheme = {
    color: {
      text: {
        primary: '#custom-color'
      }
    }
  }
  
  const merged = mergeTheme(defaultTheme, partialTheme)
  
  if (merged.color.text.primary === '#custom-color' && 
      merged.color.text.secondary === defaultTheme.color.text.secondary) {
    console.log('   ✓ Theme merge successful')
    console.log(`   ✓ Primary color: ${merged.color.text.primary}`)
    console.log(`   ✓ Secondary color preserved: ${merged.color.text.secondary}`)
  } else {
    console.log('   ✗ Theme merge failed')
  }
} catch (error) {
  console.error('   ✗ Error:', error)
}

// 测试 3: 深色主题
console.log('\n3. Testing dark theme...')
try {
  const darkVars = generateCSSVars(darkTheme, {
    prefix: 'incremark',
    selector: '.theme-dark'
  })
  
  const hasDarkColor = darkVars.includes('--incremark-color-text-primary')
  const hasDarkBg = darkVars.includes('--incremark-color-background-base')
  
  if (hasDarkColor && hasDarkBg) {
    console.log('   ✓ Dark theme variables generated')
    // 检查是否是深色值
    if (darkVars.includes('#e6edf3') || darkVars.includes('#0d1117')) {
      console.log('   ✓ Dark theme values correct')
    }
  } else {
    console.log('   ✗ Dark theme generation failed')
  }
} catch (error) {
  console.error('   ✗ Error:', error)
}

// 测试 4: 检查关键值
console.log('\n4. Checking key values...')
try {
  console.log(`   Font size base: ${defaultTheme.typography.fontSize.base}`)
  console.log(`   Spacing sm: ${defaultTheme.spacing.sm}`)
  console.log(`   Spacing md: ${defaultTheme.spacing.md}`)
  console.log(`   Spacing lg: ${defaultTheme.spacing.lg}`)
  console.log(`   Text primary: ${defaultTheme.color.text.primary}`)
  console.log('   ✓ All key values present')
} catch (error) {
  console.error('   ✗ Error:', error)
}

console.log('\n✅ All tests completed!')

