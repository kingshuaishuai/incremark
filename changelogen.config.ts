export default {
  // 输出文件
  output: 'CHANGELOG.md',

  // 提交类型配置
  types: {
    // 会显示在 changelog 中的类型
    feat: { title: '🚀 Features / 新功能' },
    fix: { title: '🐛 Bug Fixes / 修复' },
    perf: { title: '⚡ Performance / 性能优化' },

    // 可选显示（默认会显示，但可以配置隐藏）
    docs: { title: '📖 Documentation / 文档' },
    refactor: { title: '♻️ Refactor / 重构' },

    // 不会显示在 changelog 中的类型（demo、测试等）
    chore: false,
    style: false,
    test: false,
    ci: false,
    build: false,
  },

  // 仓库信息（用于生成 commit 链接）
  repo: {
    type: 'github',
    repo: 'user/incremark', // 替换为你的 GitHub 仓库
  },

  // 从哪个版本开始生成
  from: '',

  // 到哪个版本（默认 HEAD）
  to: '',

  // 是否包含作者信息
  contributors: true,

  // 排除的路径（可选，如果想排除某些目录的提交）
  // excludeAuthors: [],
}

