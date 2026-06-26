/**
 * Fisher-Yates 洗牌算法 - 产生均匀随机排列
 * 替代 Array.sort(() => Math.random() - 0.5) 的非均匀分布
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
