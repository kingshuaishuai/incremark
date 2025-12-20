#!/usr/bin/env node
/**
 * Release script for Incremark
 * 
 * This script handles the complete release process:
 * 1. Bump version using bumpp (without commit/push/tag)
 * 2. Generate changelog from previous tag to new version
 * 3. Commit changes and create tag
 * 4. Push code and tags
 * 5. Build packages
 * 6. Publish packages
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

function exec(command: string, options?: { cwd?: string; stdio?: 'inherit' | 'pipe'; throwOnError?: boolean }) {
  console.log(`\n> ${command}`)
  try {
    const result = execSync(command, {
      cwd: options?.cwd || rootDir,
      stdio: options?.stdio || 'inherit',
      encoding: 'utf-8',
    })
    return result
  } catch (error: any) {
    console.error(`Error executing: ${command}`)
    console.error(error.message)
    if (options?.throwOnError !== false) {
      process.exit(1)
    }
    throw error
  }
}

function getPackageVersion(): string {
  const packageJson = JSON.parse(
    readFileSync(join(rootDir, 'package.json'), 'utf-8')
  )
  return packageJson.version
}

function getPreviousTag(): string {
  try {
    const tag = execSync('git describe --tags --abbrev=0', {
      cwd: rootDir,
      encoding: 'utf-8',
    }).trim()
    return tag
  } catch {
    return 'v0.0.0'
  }
}

function main() {
  // Check for dry-run mode
  const isDryRun = process.argv.includes('--dry') || process.argv.includes('--dry-run')
  
  if (isDryRun) {
    console.log('🧪 DRY-RUN MODE: No commits, tags, pushes, or publishes will be made\n')
  }
  
  console.log('🚀 Starting release process...\n')

  // Step 1: Get previous tag for changelog
  const prevTag = getPreviousTag()
  console.log(`Previous tag: ${prevTag}`)

  // Step 2: Bump version (without commit/push/tag)
  // In dry-run mode, we still bump to see what version would be, but user can revert
  console.log('\n📦 Bumping version...')
  if (isDryRun) {
    console.log('[DRY-RUN] Bumping version (files will be modified, but not committed)')
  }
  exec('pnpm exec bumpp package.json packages/*/package.json --no-commit --no-push --no-tag')

  // Step 3: Get new version
  const newVersion = getPackageVersion()
  const newTag = `v${newVersion}`
  console.log(`New version: ${newVersion}`)

  // Step 4: Generate changelog from previous tag to new version
  // In dry-run mode, we still generate to see what changelog would look like
  console.log('\n📝 Generating changelog...')
  if (isDryRun) {
    console.log('[DRY-RUN] Generating changelog (file will be modified, but not committed)')
  }
  exec(`pnpm exec changelogen --output CHANGELOG.md --from ${prevTag} --to ${newTag}`)

  // Step 5: Stage all changes
  if (isDryRun) {
    console.log('\n📋 [DRY-RUN] Would stage changes with: git add .')
    console.log('[DRY-RUN] Skipping git add (dry-run mode)')
  } else {
    console.log('\n📋 Staging changes...')
    exec('git add .')
  }

  // Step 6: Commit changes
  if (isDryRun) {
    console.log(`\n💾 [DRY-RUN] Would commit with: git commit -m "chore: release ${newTag}"`)
    console.log('[DRY-RUN] Skipping git commit (dry-run mode)')
  } else {
    console.log('\n💾 Committing changes...')
    exec(`git commit -m "chore: release ${newTag}"`)
  }

  // Step 7: Create tag
  if (isDryRun) {
    console.log(`\n🏷️  [DRY-RUN] Would create tag: ${newTag}`)
  } else {
    console.log('\n🏷️  Creating tag...')
    try {
      execSync(`git tag ${newTag}`, { cwd: rootDir, stdio: 'pipe' })
      console.log(`Tag ${newTag} created successfully`)
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`Tag ${newTag} already exists, skipping...`)
      } else {
        throw error
      }
    }
  }

  // Step 8: Push code and tags
  if (isDryRun) {
    console.log('\n📤 [DRY-RUN] Would push with: git push && git push --tags')
    console.log('[DRY-RUN] Skipping git push (dry-run mode)')
  } else {
    console.log('\n📤 Pushing to remote...')
    exec('git push')
    exec('git push --tags')
  }

  // Step 9: Build packages (always run, even in dry-run)
  console.log('\n🔨 Building packages...')
  exec("pnpm --filter './packages/*' build")

  // Step 10: Publish packages
  if (isDryRun) {
    console.log('\n📦 [DRY-RUN] Would publish with: pnpm --filter "./packages/*" publish --access public --registry https://registry.npmjs.org')
    console.log('[DRY-RUN] To test publish, run: pnpm --filter "./packages/*" publish --access public --dry-run --registry https://registry.npmjs.org')
  } else {
    console.log('\n📦 Publishing packages...')
    // Publish each package individually to handle partial failures gracefully
    const packages = ['core', 'devtools', 'react', 'vue']
    let successCount = 0
    let failCount = 0
    
    for (const pkg of packages) {
      try {
        console.log(`\n📦 Publishing @incremark/${pkg}...`)
        exec(
          `pnpm --filter @incremark/${pkg} publish --access public --registry https://registry.npmjs.org`,
          { throwOnError: false }
        )
        successCount++
        console.log(`✅ @incremark/${pkg} published successfully`)
      } catch (error: any) {
        const errorMessage = error.message || error.toString()
        if (errorMessage.includes('previously published versions') || errorMessage.includes('403')) {
          failCount++
          console.log(`⚠️  @incremark/${pkg} version ${newVersion} already exists, skipping...`)
        } else {
          failCount++
          console.error(`❌ Failed to publish @incremark/${pkg}:`, errorMessage)
        }
      }
    }
    
    const skipCount = failCount
    console.log(`\n📊 Publish summary: ${successCount} succeeded, ${skipCount} skipped/failed`)
    
    if (failCount > 0 && successCount === 0) {
      console.error(`\n❌ All packages failed to publish. Please check the errors above.`)
      process.exit(1)
    } else if (failCount > 0) {
      console.log(`\n⚠️  Some packages were skipped (already published) or failed, but release continues.`)
    }
  }

  if (isDryRun) {
    console.log(`\n✅ Dry-run completed! Review the changes above.`)
    console.log(`\nTo perform the actual release, run: pnpm release`)
  } else {
    console.log(`\n✅ Release ${newTag} completed successfully!`)
  }
}

main()

