/**
 * bem.ts
 *
 * BEM 命名工具函数
 * 简单的 BEM 命名生成器，不依赖第三方库
 */

/**
 * BEM 类名生成器
 *
 * @param block - Block 名称
 * @param namespace - 命名空间前缀（可选）
 * @returns BEM 命名函数
 *
 * @example
 * // 默认配置
 * const b = createBem('button');
 * b(); // 'button'
 * b({ active: true }); // 'button button--active'
 * b('icon'); // 'button__icon'
 * b('icon', { large: true }); // 'button__icon button__icon--large'
 *
 * // 带命名空间
 * const b = createBem('button', 'im-');
 * b(); // 'im-button'
 * b({ active: true }); // 'im-button im-button--active'
 * b('icon'); // 'im-button__icon'
 * b('icon', { large: true }); // 'im-button__icon im-button__icon--large'
 */
export function createBem(block: string, namespace: string = '') {
  const ns = namespace;
  const blockName = ns ? `${ns}${block}` : block;

  /**
   * 生成 BEM 类名
   *
   * @param element - 元素名称（可选）
   * @param modifiers - 修饰符对象或字符串
   * @returns 类名字符串
   */
  return function bem(
    element?: string,
    modifiers?: Record<string, boolean | string | number> | string
  ): string {
    const classes: string[] = [];

    // Block 或 Block__Element
    if (element) {
      classes.push(`${blockName}__${element}`);
    } else {
      classes.push(blockName);
    }

    // Modifiers
    if (modifiers) {
      if (typeof modifiers === 'string') {
        // 字符串修饰符：'loading' => 'block--loading'
        classes.push(`${blockName}${element ? `__${element}` : ''}--${modifiers}`);
      } else {
        // 对象修饰符：{ active: true, size: 'large' }
        for (const [key, value] of Object.entries(modifiers)) {
          if (value) {
            const modValue = value === true ? '' : `-${value}`;
            classes.push(`${blockName}${element ? `__${element}` : ''}--${key}${modValue}`);
          }
        }
      }
    }

    return classes.join(' ');
  };
}

/**
 * 创建带命名空间的 BEM 生成器
 * 专用于 Incremark Chat UI 组件（im- 前缀）
 *
 * @param block - Block 名称（会自动添加 im- 前缀）
 * @returns BEM 命名函数
 *
 * @example
 * const b = createImBem('cot');
 * b(); // 'im-cot'
 * b({ expanded: true }); // 'im-cot im-cot--expanded'
 * b('header'); // 'im-cot__header'
 * b('icon', 'loading'); // 'im-cot__icon im-cot__icon--loading'
 */
export function createImBem(block: string) {
  return createBem(block, 'im-');
}

