/**
 * 错题管理 Composable
 * 提取自 wrong.vue 逻辑
 */
import { ref, computed } from 'vue'
import { getWrongWithDetails, masterWrong, clearAllWrongs } from '@/utils/db'
import type { WrongQuestionDetail } from '@/types'
import { sortByReviewPriority, getReviewStats, type ReviewItem } from '@/utils/spaced-repetition'

export function useWrongQuestions() {
  const wrongs = ref<WrongQuestionDetail[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')

  const filteredWrongs = computed(() => {
    if (!searchQuery.value) return wrongs.value
    const q = searchQuery.value.toLowerCase()
    return wrongs.value.filter(w =>
      w.question?.content?.toLowerCase().includes(q) ||
      w.question?.answer?.toLowerCase().includes(q)
    )
  })

  const totalCount = computed(() => wrongs.value.length)
  const displayCount = computed(() => filteredWrongs.value.length)

  // 带复习优先级的排序
  const sortedWrongs = computed(() => {
    const items: ReviewItem[] = wrongs.value.map(w => ({
      questionId: w.questionId,
      wrongCount: w.wrongCount,
      lastWrongAt: w.lastWrongAt,
      isMastered: w.isMastered,
      bankName: w.bankName
    }))
    return sortByReviewPriority(items)
  })

  const reviewStats = computed(() => {
    const items: ReviewItem[] = wrongs.value.map(w => ({
      questionId: w.questionId,
      wrongCount: w.wrongCount,
      lastWrongAt: w.lastWrongAt,
      isMastered: w.isMastered,
      bankName: w.bankName
    }))
    return getReviewStats(items)
  })

  const loadWrongs = async () => {
    isLoading.value = true
    try {
      wrongs.value = await getWrongWithDetails() as WrongQuestionDetail[]
    } catch (error) {
      console.error('loadWrongs failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const masterQuestion = async (questionId: number) => {
    try {
      await masterWrong(questionId)
      await loadWrongs()
    } catch (error) {
      console.error('masterQuestion failed:', error)
    }
  }

  const clearAll = async () => {
    try {
      await clearAllWrongs()
      await loadWrongs()
    } catch (error) {
      console.error('clearAll failed:', error)
    }
  }

  return {
    wrongs, filteredWrongs, sortedWrongs, reviewStats,
    isLoading, searchQuery, totalCount, displayCount,
    loadWrongs, masterQuestion, clearAll
  }
}
