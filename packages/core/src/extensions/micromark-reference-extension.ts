/**
 * @file Micromark 扩展：支持增量解析的 Reference 语法
 * 
 * @description
 * 在增量解析场景中，引用式图片/链接（如 `![Alt][id]`）可能在定义（`[id]: url`）之前出现。
 * 标准 micromark 会检查 parser.defined，如果 id 未定义就解析为文本。
 * 
 * 本扩展通过覆盖 labelEnd 构造，移除 parser.defined 检查，
 * 使得 reference 语法总是被解析为 reference token，
 * 由渲染层根据实际的 definitionMap 决定如何渲染。
 * 
 * @module micromark-reference-extension
 * 
 * @features
 * - ✅ 支持所有 resource 语法（带 title 的图片/链接）
 * - ✅ 支持所有 reference 语法（full, collapsed, shortcut）
 * - ✅ 延迟验证：解析时不检查定义是否存在
 * - ✅ 使用官方 factory 函数，保证与 CommonMark 标准一致
 * 
 * @dependencies
 * - micromark-factory-destination: 解析 URL（支持尖括号、括号平衡）
 * - micromark-factory-title: 解析 title（支持三种引号，支持多行）
 * - micromark-factory-label: 解析 label（支持转义、长度限制）
 * - micromark-factory-whitespace: 解析空白符（正确生成 lineEnding/linePrefix token）
 * - micromark-util-character: 字符判断工具
 * - micromark-util-symbol: 常量（codes, types, constants）
 * - micromark-util-types: TypeScript 类型定义
 * 
 * @see {@link https://github.com/micromark/micromark} - micromark 官方文档
 * @see {@link https://spec.commonmark.org/0.30/#images} - CommonMark 图片规范
 * @see {@link https://spec.commonmark.org/0.30/#links} - CommonMark 链接规范
 * 
 * @example
 * ```typescript
 * import { micromarkReferenceExtension } from './micromark-reference-extension'
 * import { fromMarkdown } from 'mdast-util-from-markdown'
 * 
 * const extensions = [micromarkReferenceExtension()]
 * const ast = fromMarkdown(text, { extensions })
 * ```
 * 
 * @author Incremark Team
 * @license MIT
 */

import type {
  Code,
  Construct,
  Extension,
  Event,
  Resolver,
  State,
  TokenizeContext,
  Tokenizer,
  Token
} from 'micromark-util-types'
import { codes, types, constants } from 'micromark-util-symbol'
import { 
  markdownLineEnding, 
  markdownSpace, 
  markdownLineEndingOrSpace 
} from 'micromark-util-character'
import { factoryDestination } from 'micromark-factory-destination'
import { factoryTitle } from 'micromark-factory-title'
import { factoryLabel } from 'micromark-factory-label'
import { factoryWhitespace } from 'micromark-factory-whitespace'

/**
 * 创建支持增量解析的 reference 扩展
 * 
 * 这个扩展覆盖了 micromark-core-commonmark 中的 labelEnd 构造，
 * 移除了对 parser.defined 的检查，使得 reference 语法总是被解析为 reference token，
 * 即使对应的 definition 尚未出现。
 * 
 * @returns Micromark 扩展对象
 * 
 * @remarks
 * - labelEnd 在 text 中注册，键是 `codes.rightSquareBracket`（']'）
 * - 我们使用相同的键来覆盖它
 * - 根据 combineExtensions 的逻辑，后添加的扩展会先被尝试
 * 
 * @example
 * ```typescript
 * // 在 IncremarkParser 中使用
 * const extensions = [
 *   gfm(),
 *   micromarkReferenceExtension() // 最后添加，确保覆盖
 * ]
 * const ast = fromMarkdown(text, { extensions })
 * ```
 */
export function micromarkReferenceExtension(): Extension {
  // 关键：不使用 disable，直接覆盖
  // 根据 combineExtensions 的逻辑，后添加的扩展会先被尝试（before 数组会被插入到 existing 的开头）
  return {
    // 在 text 中使用 codes.rightSquareBracket 键覆盖 labelEnd
    text: {
      [codes.rightSquareBracket]: {
        name: 'labelEnd',
        resolveAll: resolveAllLabelEnd,
        resolveTo: resolveToLabelEnd,
        tokenize: tokenizeLabelEnd,
        // 添加 add: 'before' 确保先被尝试
        add: 'before'
      } as Construct
    }
  }
}

/**
 * Resolve all label end events.
 * 从原始代码复制，保持不变。
 */
function resolveAllLabelEnd(events: Event[]): Event[] {
  let index = -1
  const newEvents: Event[] = []
  while (++index < events.length) {
    const token = events[index][1]
    newEvents.push(events[index])

    if (
      token.type === types.labelImage ||
      token.type === types.labelLink ||
      token.type === types.labelEnd
    ) {
      // Remove the marker.
      const offset = token.type === types.labelImage ? 4 : 2
      token.type = types.data
      index += offset
    }
  }

  // If the events are equal, we don't have to copy newEvents to events
  if (events.length !== newEvents.length) {
    // 简化：直接替换
    events.length = 0
    events.push(...newEvents)
  }

  return events
}

/**
 * Resolve to label end.
 * 这是关键函数，负责将 labelEnd 和 reference 关联到 image/link。
 * 需要完整实现，否则 mdast 无法找到 image/link token。
 */
function resolveToLabelEnd(events: Event[], context: any): Event[] {
  let index = events.length
  let offset = 0
  /** @type {any} */
  let token: any
  /** @type {number | undefined} */
  let open: number | undefined
  /** @type {number | undefined} */
  let close: number | undefined
  /** @type {Array<Event>} */
  let media: Event[]

  // Find an opening.
  while (index--) {
    token = events[index][1]

    if (open !== undefined) {
      // If we see another link, or inactive link label, we've been here before.
      if (
        token.type === types.link ||
        (token.type === types.labelLink && token._inactive)
      ) {
        break
      }

      // Mark other link openings as inactive, as we can't have links in links.
      if (events[index][0] === 'enter' && token.type === types.labelLink) {
        token._inactive = true
      }
    } else if (close !== undefined) {
      if (
        events[index][0] === 'enter' &&
        (token.type === types.labelImage || token.type === types.labelLink) &&
        !token._balanced
      ) {
        open = index

        if (token.type !== types.labelLink) {
          offset = 2
          break
        }
      }
    } else if (token.type === types.labelEnd) {
      close = index
    }
  }

  if (open === undefined || close === undefined) {
    // 如果没有找到匹配的 open 和 close，直接返回
    return events
  }

  const group = {
    type: events[open][1].type === types.labelLink ? types.link : types.image,
    start: {...events[open][1].start},
    end: {...events[events.length - 1][1].end}
  }

  const label = {
    type: types.label,
    start: {...events[open][1].start},
    end: {...events[close][1].end}
  }

  const text = {
    type: types.labelText,
    start: {...events[open + offset + 2][1].end},
    end: {...events[close - 2][1].start}
  }

  media = [
    ['enter', group, context],
    ['enter', label, context]
  ]

  // Opening marker.
  media.push(...events.slice(open + 1, open + offset + 3))

  // Text open.
  media.push(['enter', text, context])

  // Between (label text content)
  // 简化：直接使用 events，不调用 resolveAll
  media.push(...events.slice(open + offset + 4, close - 3))

  // Text close, marker close, label close.
  media.push(
    ['exit', text, context],
    events[close - 2],
    events[close - 1],
    ['exit', label, context]
  )

  // Reference, resource, or so.
  media.push(...events.slice(close + 1))

  // Media close.
  media.push(['exit', group, context])

  // 替换 events
  events.splice(open, events.length - open, ...media)

  return events
}

/**
 * Tokenize label end，支持增量解析
 * 
 * 关键修改：
 * 1. 移除了对 parser.defined 的检查
 * 2. 在 after 函数中，总是尝试解析为 reference
 * 3. 在 referenceFullAfter 中，总是返回 ok
 * 
 * 注意：这是一个简化实现，主要目的是让 reference 语法总是被解析为 reference token。
 * 完整的实现需要 factoryLabel、factoryDestination 等工具函数，但这些不在公共 npm 包中。
 * 这个简化版本应该能够处理基本的 reference 语法。
 */
function tokenizeLabelEnd(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: State,
  nok: State
): State {
  const self = this
  let index = self.events.length
  /** @type {any} */
  let labelStart: any

  // Find an opening.
  while (index--) {
    if (
      (self.events[index][1].type === types.labelImage ||
        self.events[index][1].type === types.labelLink) &&
      !self.events[index][1]._balanced
    ) {
      labelStart = self.events[index][1]
      break
    }
  }

  return start as State

  /**
   * Start of label end.
   */
  function start(code: Code): State | void {
    // If there is not an okay opening.
    if (!labelStart) {
      return nok(code)
    }

    // If the corresponding label (link) start is marked as inactive,
    // it means we'd be wrapping a link, like this:
    //
    // ```markdown
    // > | a [b [c](d) e](f) g.
    //                  ^
    // ```
    //
    // We can't have that, so it's just balanced brackets.
    if (labelStart._inactive) {
      return labelEndNok(code)
    }

    // 检测脚注引用：如果标签以 ^ 开头，交给 GFM 脚注扩展处理
    // 注意：这里只检查 labelLink，不检查 labelImage
    // 因为脚注引用是 [^1]，不是 ![^1]
    if (labelStart.type === types.labelLink) {
      const labelText = self.sliceSerialize({start: labelStart.end, end: self.now()})
      if (labelText.startsWith('^')) {
        // 这是脚注引用，交给 GFM 脚注扩展处理
        return nok(code)
      }
    }

    // 关键修改：移除了对 parser.defined 的检查
    // 原始代码会检查：
    // defined = self.parser.defined.includes(
    //   normalizeIdentifier(
    //     self.sliceSerialize({start: labelStart.end, end: self.now()})
    //   )
    // )

    effects.enter(types.labelEnd)
    effects.enter(types.labelMarker)
    effects.consume(code)
    effects.exit(types.labelMarker)
    effects.exit(types.labelEnd)
    return after as State
  }

  /**
   * After `]`.
   */
  function after(code: Code): State | void {
    // Resource (`[asd](fgh)`)?
    if (code === codes.leftParenthesis) {
      // 对于 resource，保持原始逻辑（总是尝试解析）
      // 注意：resource 不依赖于 definition，所以应该总是能正确解析
      // 如果解析失败，返回 labelEndNok，避免被错误解析为 shortcut reference
      return effects.attempt(
        {
          tokenize: tokenizeResource,
          partial: false
        },
        labelEndOk as State,
        labelEndNok as State  // 修复：resource 解析失败时返回 nok
      )(code)
    }

    // Full (`[asd][fgh]`) or collapsed (`[asd][]`) reference?
    if (code === codes.leftSquareBracket) {
      // 关键修改：总是尝试解析为 reference，不检查 defined
      return effects.attempt(
        {
          tokenize: tokenizeReferenceFull,
          partial: false
        },
        labelEndOk as State,
        referenceNotFull as State  // 修改：即使不是 full reference，也尝试 collapsed
      )(code)
    }

    // Shortcut (`[asd]`) reference?
    // 关键修改：总是返回 ok，让后续处理
    return labelEndOk(code) as State
  }

  /**
   * After `]`, at `[`, but not at a full reference.
   */
  function referenceNotFull(code: Code): State | void {
    return effects.attempt(
      {
        tokenize: tokenizeReferenceCollapsed,
        partial: false
      },
      labelEndOk as State,
      labelEndOk as State  // 修改：即使失败也返回 ok
    )(code)
  }

  /**
   * Done, we found something.
   */
  function labelEndOk(code: Code): State | void {
    return ok(code) as State
  }

  /**
   * Done, it's nothing.
   */
  function labelEndNok(code: Code): State | void {
    labelStart._balanced = true
    return nok(code)
  }
}

/**
 * 解析 resource 语法：[text](url) 或 [text](url "title")
 * 
 * 支持的语法：
 * - [text](url)
 * - [text](url "title")
 * - [text](url 'title')
 * - [text](url (title))
 * - [text](<url with spaces>)
 * - [text](url "title with \"escaped\"")
 * 
 * 完整实现：使用官方 factory 函数保证与 CommonMark 标准一致
 * 
 * @param effects - Token 生成器
 * @param ok - 成功时的状态函数
 * @param nok - 失败时的状态函数
 * @returns 起始状态函数
 */
function tokenizeResource(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: State,
  nok: State
): State {
  return resourceStart

  /**
   * 在 resource 起始位置，期望 '('
   * 
   * ```markdown
   * > | [a](b) c
   *        ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceStart(code: Code): State | undefined {
    if (code !== codes.leftParenthesis) {
      return nok(code)
    }
    
    effects.enter(types.resource)
    effects.enter(types.resourceMarker)
    effects.consume(code)
    effects.exit(types.resourceMarker)
    return resourceBefore
  }

  /**
   * 在 '(' 之后，可能有空白符
   * 
   * ```markdown
   * > | [a]( b) c
   *         ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceBefore(code: Code): State | undefined {
    return markdownLineEndingOrSpace(code)
      ? factoryWhitespace(effects, resourceOpen)(code)
      : resourceOpen(code)
  }

  /**
   * 在空白符之后，期望 destination 或 ')'
   * 
   * ```markdown
   * > | [a](b) c
   *         ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceOpen(code: Code): State | undefined {
    // 空 resource: [text]()
    if (code === codes.rightParenthesis) {
      return resourceEnd(code)
    }

    // 使用官方 factoryDestination 解析 URL
    return factoryDestination(
      effects,
      resourceDestinationAfter,
      resourceDestinationMissing,
      types.resourceDestination,
      types.resourceDestinationLiteral,
      types.resourceDestinationLiteralMarker,
      types.resourceDestinationRaw,
      types.resourceDestinationString,
      constants.linkResourceDestinationBalanceMax
    )(code)
  }

  /**
   * 在 destination 之后，可能有空白符或 title
   * 
   * ```markdown
   * > | [a](b ) c
   *          ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceDestinationAfter(code: Code): State | undefined {
    return markdownLineEndingOrSpace(code)
      ? factoryWhitespace(effects, resourceBetween)(code)
      : resourceEnd(code)
  }

  /**
   * Destination 解析失败（格式错误）
   * 
   * ```markdown
   * > | [a](<<) b
   *         ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceDestinationMissing(code: Code): State | undefined {
    return nok(code)
  }

  /**
   * 在 destination 和空白符之后，可能有 title
   * 
   * ```markdown
   * > | [a](b "c") d
   *           ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceBetween(code: Code): State | undefined {
    // 检测 title 起始标记：双引号、单引号或左括号
    if (
      code === codes.quotationMark ||
      code === codes.apostrophe ||
      code === codes.leftParenthesis
    ) {
      // 使用官方 factoryTitle 解析 title
      return factoryTitle(
        effects,
        resourceTitleAfter,
        nok,
        types.resourceTitle,
        types.resourceTitleMarker,
        types.resourceTitleString
      )(code)
    }

    // 没有 title，直接结束
    return resourceEnd(code)
  }

  /**
   * 在 title 之后，可能有空白符
   * 
   * ```markdown
   * > | [a](b "c" ) d
   *              ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceTitleAfter(code: Code): State | undefined {
    return markdownLineEndingOrSpace(code)
      ? factoryWhitespace(effects, resourceEnd)(code)
      : resourceEnd(code)
  }

  /**
   * 在 resource 结束位置，期望 ')'
   * 
   * ```markdown
   * > | [a](b) c
   *          ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function resourceEnd(code: Code): State | undefined {
    if (code === codes.rightParenthesis) {
      effects.enter(types.resourceMarker)
      effects.consume(code)
      effects.exit(types.resourceMarker)
      effects.exit(types.resource)
      return ok
    }

    return nok(code)
  }
}

/**
 * 解析 full reference：[text][id]
 * 
 * 注意：不检查 id 是否已定义（支持增量解析的核心特性）
 * 
 * @param effects - Token 生成器
 * @param ok - 成功时的状态函数
 * @param nok - 失败时的状态函数
 * @returns 起始状态函数
 */
function tokenizeReferenceFull(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: State,
  nok: State
): State {
  const self = this

  return referenceFull

  /**
   * 在 reference 起始位置，期望 '['
   * 
   * ```markdown
   * > | [a][b] d
   *        ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function referenceFull(code: Code): State | undefined {
    if (code !== codes.leftSquareBracket) {
      return nok(code)
    }
    
    // 使用官方 factoryLabel 解析 [id]
    // 使用 .call() 确保正确的 this 上下文
    return factoryLabel.call(
      self,
      effects,
      referenceFullAfter,
      referenceFullMissing,
      types.reference,
      types.referenceMarker,
      types.referenceString
    )(code)
  }

  /**
   * 在 reference 结束后
   * 
   * 🔑 核心特性：总是返回 ok，不检查 parser.defined
   * 这使得增量解析场景下，前向引用能够正常工作
   * 
   * ```markdown
   * > | [a][b] d
   *          ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function referenceFullAfter(code: Code): State | undefined {
    // 关键修改：不检查 parser.defined
    // 
    // 原始 micromark-core-commonmark 的代码：
    // return self.parser.defined.includes(
    //   normalizeIdentifier(
    //     self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1)
    //   )
    // ) ? ok(code) : nok(code)
    //
    // 修改后：总是返回 ok，延迟验证到渲染层
    return ok(code)
  }

  /**
   * Reference label 格式错误
   * 
   * ```markdown
   * > | [a][b d
   *        ^
   * ```
   * 
   * @param code - 当前字符编码
   */
  function referenceFullMissing(code: Code): State | undefined {
    return nok(code)
  }
}

/**
 * Tokenize collapsed reference (e.g., `[text][]`).
 */
function tokenizeReferenceCollapsed(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: State,
  nok: State
): State {
  return referenceCollapsedStart as State

  function referenceCollapsedStart(code: Code): State | void {
    if (code !== codes.leftSquareBracket) {
      return nok(code)
    }
    effects.enter(types.reference)
    effects.enter(types.referenceMarker)
    effects.consume(code)
    effects.exit(types.referenceMarker)
    return referenceCollapsedOpen as State
  }

  function referenceCollapsedOpen(code: Code): State | void {
    if (code === codes.rightSquareBracket) {
      effects.enter(types.referenceMarker)
      effects.consume(code)
      effects.exit(types.referenceMarker)
      effects.exit(types.reference)
      return ok as State
    }
    return nok(code)
  }
}

