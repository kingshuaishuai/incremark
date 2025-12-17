export default {
  // 输出文件
  output: 'CHANGELOG.md',

  // 提交类型配置 - 只定义需要显示的类型，未定义的类型会被自动排除
  types: {
    feat: { title: '🚀 Features / 新功能' },
    fix: { title: '🐛 Bug Fixes / 修复' },
    perf: { title: '⚡ Performance / 性能优化' },
    docs: { title: '📖 Documentation / 文档' },
    refactor: { title: '♻️ Refactor / 重构' },
  },

  // 仓库信息（用于生成 commit 链接）
  repo: {
    type: 'github',
    repo: 'kingshuaishuai/incremark',
  },

  // 从哪个版本开始生成
  from: '',

  // 到哪个版本（默认 HEAD）
  to: '',

  // 是否包含作者信息
  contributors: true,
}

