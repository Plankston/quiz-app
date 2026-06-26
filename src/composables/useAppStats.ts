/**
 * 统计数据 Composable
 * 提取自 stats.vue 逻辑
 */
import { ref } from 'vue'
import { getStats, getChapterStats } from '@/utils/db'
import type { AppStats, ChapterStat } from '@/types'

export function useAppStats() {
  const stats = ref<AppStats>({
    totalBanks: 0,
    totalQuestions: 0,
    totalRecords: 0,
    correctRate: 0,
    totalWrongs: 0
  })
  const chapterStats = ref<ChapterStat[]>([])
  const isLoading = ref(false)
  const selectedBankId = ref(0)

  const loadStats = async () => {
    isLoading.value = true
    try {
      stats.value = await getStats()
    } catch (error) {
      console.error('loadStats failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const loadChapterStats = async (bankId: number) => {
    selectedBankId.value = bankId
    try {
      chapterStats.value = await getChapterStats(bankId)
    } catch (error) {
      console.error('loadChapterStats failed:', error)
      chapterStats.value = []
    }
  }

  return {
    stats, chapterStats, isLoading, selectedBankId,
    loadStats, loadChapterStats
  }
}
