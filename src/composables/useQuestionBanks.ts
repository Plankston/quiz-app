/**
 * 题库管理 Composable
 * 提取自 index.vue + bank.vue 共享逻辑
 */
import { ref, computed } from 'vue'
import { getBanks, addBank, getQuestionsByBank, getTotalQuestionCount } from '@/utils/db'
import type { QuestionBank } from '@/types'

export function useQuestionBanks() {
  const banks = ref<QuestionBank[]>([])
  const totalQuestions = ref(0)
  const isLoading = ref(false)

  const bankCount = computed(() => banks.value.length)

  const loadBanks = async () => {
    isLoading.value = true
    try {
      banks.value = await getBanks()
      totalQuestions.value = await getTotalQuestionCount()
    } catch (error) {
      console.error('loadBanks failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createBank = async (name: string, questions: any[]) => {
    try {
      const id = await addBank(name, questions)
      await loadBanks() // refresh
      return id
    } catch (error) {
      console.error('createBank failed:', error)
      throw error
    }
  }

  const getBankById = (id: number) => {
    return banks.value.find(b => b.id === id)
  }

  return {
    banks, totalQuestions, isLoading, bankCount,
    loadBanks, createBank, getBankById
  }
}
