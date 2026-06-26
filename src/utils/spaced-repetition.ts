/**
 * 间隔重复调度算法 — 基于遗忘曲线 (SM-2 简化版)
 * 
 * 复习间隔: 1天 → 3天 → 7天 → 14天 → 30天 → 60天
 * 每次答对: 间隔升级
 * 每次答错: 间隔重置为1天
 */

/** 间隔天数序列 */
const INTERVALS = [1, 3, 7, 14, 30, 60]

export interface ReviewItem {
  questionId: number
  wrongCount: number
  lastWrongAt: Date
  lastReviewAt?: Date
  isMastered: number
  bankName?: string
}

export interface ReviewSchedule {
  /** 距离下次复习剩余天数（负数=已到期） */
  daysUntilReview: number
  /** 优先级分数（越小越需要复习） */
  priority: number
  /** 当前间隔等级 */
  intervalLevel: number
  /** 是否建议今天复习 */
  shouldReviewToday: boolean
}

/**
 * 计算复习间隔天数
 * @param wrongCount 累计答错次数
 * @returns 建议间隔天数
 */
export function getReviewInterval(wrongCount: number): number {
  const index = Math.min(wrongCount, INTERVALS.length - 1)
  return INTERVALS[index]
}

/**
 * 计算复习调度
 * @param item 错题记录
 * @param now 当前时间
 */
export function getReviewSchedule(item: ReviewItem, now: Date = new Date()): ReviewSchedule {
  const intervalDays = getReviewInterval(item.wrongCount)
  const intervalLevel = Math.min(item.wrongCount, INTERVALS.length - 1)
  
  // 计算上次错误到下次可复习的时间
  const lastWrongTime = new Date(item.lastWrongAt).getTime()
  const lastReviewTime = item.lastReviewAt 
    ? new Date(item.lastReviewAt).getTime() 
    : lastWrongTime
  
  const msPerDay = 1000 * 60 * 60 * 24
  const daysSinceLastReview = (now.getTime() - lastReviewTime) / msPerDay
  const daysUntilReview = intervalDays - daysSinceLastReview
  
  // 优先级: 等级越高越紧急，逾期越久越紧急
  const overdue = Math.max(0, -daysUntilReview)
  const priority = (overdue * 10) + (intervalLevel * 2) + item.wrongCount
  
  return {
    daysUntilReview: Math.round(daysUntilReview * 10) / 10,
    priority,
    intervalLevel,
    shouldReviewToday: daysUntilReview <= 0
  }
}

/**
 * 对错题列表排序：优先级高的排前面
 */
export function sortByReviewPriority(items: ReviewItem[]): (ReviewItem & { schedule: ReviewSchedule })[] {
  const now = new Date()
  return items
    .map(item => ({ ...item, schedule: getReviewSchedule(item, now) }))
    .sort((a, b) => b.schedule.priority - a.schedule.priority)
}

/**
 * 获取复习统计
 */
export function getReviewStats(items: ReviewItem[]): {
  total: number
  dueToday: number
  overdue: number
  mastered: number
  avgInterval: number
} {
  const now = new Date()
  const schedules = items.map(item => getReviewSchedule(item, now))
  
  const dueToday = schedules.filter(s => s.shouldReviewToday).length
  const overdue = schedules.filter(s => s.daysUntilReview < 0).length
  const mastered = items.filter(i => i.isMastered === 1).length
  const avgInterval = schedules.length > 0
    ? schedules.reduce((sum, s) => sum + getReviewInterval(Math.max(0, s.intervalLevel)), 0) / schedules.length
    : 0

  return {
    total: items.length,
    dueToday,
    overdue,
    mastered,
    avgInterval: Math.round(avgInterval * 10) / 10
  }
}
