/**
 * format.ts
 *
 * 格式化工具函数
 */

/**
 * 时长单位标签（国际化）
 */
const DURATION_UNITS: Record<string, { s: string; m: string; h: string }> = {
  en: { s: 's', m: 'm', h: 'h' },
  zh: { s: '秒', m: '分钟', h: '小时' },
  ja: { s: '秒', m: '分', h: '時間' },
  ko: { s: '초', m: '분', h: '시간' },
  de: { s: 's', m: 'Min', h: 'Std' },
  fr: { s: 's', m: 'min', h: 'h' },
  es: { s: 's', m: 'min', h: 'h' },
};

/**
 * 格式化时长（毫秒）为人类可读格式
 * 支持国际化
 *
 * @param ms - 时长（毫秒）
 * @param locale - 语言环境，默认 'en'
 * @returns 格式化后的时长字符串
 *
 * @example
 * formatDuration(500, 'en') // '1s'
 * formatDuration(1500, 'en') // '2s'
 * formatDuration(65000, 'en') // '1m 5s'
 * formatDuration(125000, 'en') // '2m 5s'
 * formatDuration(125000, 'zh') // '2分5秒'
 * formatDuration(3600000, 'en') // '1h'
 * formatDuration(3665000, 'en') // '1h 1m'
 */
export function formatDuration(ms: number, locale: string = 'en'): string {
  // 获取单位标签，回退到英文
  const units = DURATION_UNITS[locale] || DURATION_UNITS.en;

  // 小于 1 秒，向上取整显示为 1 秒
  if (ms < 1000) {
    return `1${units.s}`;
  }

  // 小于 1 分钟，显示秒（向上取整）
  if (ms < 60000) {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}${units.s}`;
  }

  // 小于 1 小时，显示分钟和秒
  if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.ceil((ms % 60000) / 1000);

    if (seconds === 60) {
      return `${minutes + 1}${units.m}`;
    }

    if (seconds === 0) {
      return `${minutes}${units.m}`;
    }

    // 中文、日文、韩文使用紧凑格式：2分5秒
    if (locale === 'zh' || locale === 'ja' || locale === 'ko') {
      return `${minutes}${units.m}${seconds}${units.s}`;
    }

    // 英文等使用空格分隔：2m 5s
    return `${minutes}${units.m} ${seconds}${units.s}`;
  }

  // 大于 1 小时，显示小时和分钟
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.ceil((ms % 3600000) / 60000);

  if (minutes === 60) {
    return `${hours + 1}${units.h}`;
  }

  if (minutes === 0) {
    return `${hours}${units.h}`;
  }

  // 中文、日文、韩文使用紧凑格式：1小时5分钟
  if (locale === 'zh' || locale === 'ja' || locale === 'ko') {
    return `${hours}${units.h}${minutes}${units.m}`;
  }

  // 英文等使用空格分隔：1h 5m
  return `${hours}${units.h} ${minutes}${units.m}`;
}

/**
 * 文件大小单位
 */
const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/**
 * 格式化文件大小为人类可读格式
 *
 * @param bytes - 文件大小（字节）
 * @param decimals - 小数位数，默认 1
 * @returns 格式化后的文件大小字符串
 *
 * @example
 * formatFileSize(0) // '0 B'
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1536) // '1.5 KB'
 * formatFileSize(1048576) // '1 MB'
 * formatFileSize(1073741824) // '1 GB'
 */
export function formatFileSize(bytes?: number, decimals: number = 1): string {
  if (bytes === undefined || bytes === null) return '';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  // 如果是整数，不显示小数
  if (size % 1 === 0) {
    return `${size} ${FILE_SIZE_UNITS[i]}`;
  }

  return `${size.toFixed(decimals)} ${FILE_SIZE_UNITS[i]}`;
}
