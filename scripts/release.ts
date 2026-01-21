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
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

/**
 * @typedef WorkspacePackage
 * @description 工作区包信息（用于发布排序与发布）
 * @property {string} dir 包目录名（packages 下的子目录名）
 * @property {string} name npm 包名（例如 @incremark/core）
 * @property {boolean} private 是否私有（私有包不应发布）
 * @property {Set<string>} workspaceDeps 该包依赖的其它工作区包名集合（仅 @incremark/*）
 */
type WorkspacePackage = {
  dir: string
  name: string
  private: boolean
  workspaceDeps: Set<string>
}

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

/**
 * @description 读取并解析 JSON 文件
 * @param {string} filePath JSON 文件路径
 * @returns {any} 解析后的 JSON 对象
 * @throws {Error} 当文件不存在或 JSON 无法解析时抛出异常
 */
function readJson(filePath: string): any {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function getPackageVersion(): string {
  const packageJson = readJson(join(rootDir, 'package.json'))
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

/**
 * @description 从 packages 目录扫描所有工作区包（例如 packages/<package>/package.json）
 * @returns {WorkspacePackage[]} 工作区包列表（包含 private 信息与工作区依赖集合）
 * @throws {Error} 当 packages 目录不存在或包配置不完整时抛出异常
 */
function getWorkspacePackages(): WorkspacePackage[] {
  const packagesDir = join(rootDir, 'packages')
  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const pkgs: WorkspacePackage[] = []

  for (const dir of dirs) {
    const pkgJsonPath = join(packagesDir, dir, 'package.json')
    const pkgJson = readJson(pkgJsonPath)
    const name = pkgJson?.name
    if (typeof name !== 'string' || !name) {
      throw new Error(`Invalid package.json: missing "name" in ${pkgJsonPath}`)
    }

    const deps = {
      ...(pkgJson?.dependencies || {}),
      ...(pkgJson?.peerDependencies || {}),
      ...(pkgJson?.optionalDependencies || {}),
    } as Record<string, string>

    const workspaceDeps = new Set<string>()
    for (const depName of Object.keys(deps)) {
      if (depName.startsWith('@incremark/')) workspaceDeps.add(depName)
    }

    pkgs.push({
      dir,
      name,
      private: Boolean(pkgJson?.private),
      workspaceDeps,
    })
  }

  return pkgs
}

/**
 * @description 对工作区包进行拓扑排序，确保先发布被依赖的包
 * @param {WorkspacePackage[]} packages 工作区包列表
 * @returns {WorkspacePackage[]} 按依赖顺序排序后的包列表
 * @throws {Error} 当依赖图存在环或无法完成排序时抛出异常
 */
function topoSortWorkspacePackages(packages: WorkspacePackage[]): WorkspacePackage[] {
  const byName = new Map<string, WorkspacePackage>()
  for (const pkg of packages) byName.set(pkg.name, pkg)

  // 仅保留工作区内的依赖边
  const edges = new Map<string, Set<string>>() // from -> to (from depends on to)
  const indegree = new Map<string, number>() // node -> indegree

  for (const pkg of packages) {
    edges.set(pkg.name, new Set<string>())
    indegree.set(pkg.name, 0)
  }

  for (const pkg of packages) {
    const deps = [...pkg.workspaceDeps].filter((d) => byName.has(d))
    const set = edges.get(pkg.name)!
    for (const dep of deps) set.add(dep)
  }

  // indegree 统计：A 依赖 B，则 A 有一条到 B 的边；发布顺序需要 B 在 A 前。
  // 为了用 Kahn 算法，我们构造反向邻接：dep -> dependents
  const dependents = new Map<string, Set<string>>()
  for (const pkg of packages) dependents.set(pkg.name, new Set<string>())

  for (const [from, toSet] of edges) {
    for (const to of toSet) {
      dependents.get(to)!.add(from)
      indegree.set(from, (indegree.get(from) || 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [name, deg] of indegree) {
    if (deg === 0) queue.push(name)
  }

  // 为了稳定输出：按字典序处理
  queue.sort((a, b) => a.localeCompare(b))

  const ordered: string[] = []

  while (queue.length > 0) {
    const name = queue.shift()!
    ordered.push(name)

    const deps = dependents.get(name)!
    const next = [...deps].sort((a, b) => a.localeCompare(b))
    for (const depName of next) {
      const deg = (indegree.get(depName) || 0) - 1
      indegree.set(depName, deg)
      if (deg === 0) {
        queue.push(depName)
        queue.sort((a, b) => a.localeCompare(b))
      }
    }
  }

  if (ordered.length !== packages.length) {
    const unresolved = packages
      .map((p) => p.name)
      .filter((n) => !ordered.includes(n))
    throw new Error(`Cyclic or unresolved dependencies detected among: ${unresolved.join(', ')}`)
  }

  return ordered.map((n) => byName.get(n)!)
}

type ReleaseType = 'stable' | 'alpha' | 'beta' | 'rc'

/**
 * 从版本号中检测发布类型
 * 例如: 0.4.0-alpha.1 -> alpha, 0.4.0-beta.1 -> beta, 0.4.0 -> stable
 */
function detectReleaseTypeFromVersion(version: string): ReleaseType {
  if (version.includes('-alpha')) return 'alpha'
  if (version.includes('-beta')) return 'beta'
  if (version.includes('-rc')) return 'rc'
  return 'stable'
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

  // Step 3: Get new version and detect release type
  const newVersion = getPackageVersion()
  const newTag = `v${newVersion}`
  const releaseType = detectReleaseTypeFromVersion(newVersion)
  console.log(`New version: ${newVersion}`)
  if (releaseType !== 'stable') {
    console.log(`Release type: ${releaseType} (will publish to '${releaseType}' npm tag)`)
  }

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
  // 预发布版本使用对应的 npm tag，避免影响 latest
  const npmTag = releaseType === 'stable' ? 'latest' : releaseType
  const tagFlag = `--tag ${npmTag}`

  if (isDryRun) {
    console.log(`\n📦 [DRY-RUN] Would publish with npm tag: ${npmTag}`)
    console.log(`[DRY-RUN] Command: pnpm --filter "./packages/*" publish --access public ${tagFlag} --registry https://registry.npmjs.org`)
    console.log(`[DRY-RUN] To test publish, run: pnpm --filter "./packages/*" publish --access public ${tagFlag} --dry-run --registry https://registry.npmjs.org`)
  } else {
    console.log('\n📦 Publishing packages...')
    if (releaseType !== 'stable') {
      console.log(`📌 Using npm tag: ${npmTag}`)
    }
    // Publish each package individually to handle partial failures gracefully
    const allPkgs = getWorkspacePackages().filter((p) => !p.private)
    const packages = topoSortWorkspacePackages(allPkgs)
    let successCount = 0
    let failCount = 0

    for (const pkg of packages) {
      try {
        console.log(`\n📦 Publishing ${pkg.name}...`)
        exec(
          `pnpm --filter ${pkg.name} publish --access public ${tagFlag} --registry https://registry.npmjs.org`,
          { throwOnError: false }
        )
        successCount++
        console.log(`✅ ${pkg.name} published successfully`)
      } catch (error: any) {
        const errorMessage = error.message || error.toString()
        if (errorMessage.includes('previously published versions') || errorMessage.includes('403')) {
          failCount++
          console.log(`⚠️  ${pkg.name} version ${newVersion} already exists (or permission denied), skipping...`)
        } else {
          failCount++
          console.error(`❌ Failed to publish ${pkg.name}:`, errorMessage)
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

