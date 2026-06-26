<template>
  <view class="container">
    <!-- 未完成状态 -->
    <view v-if="!finished" class="practice-split">
      <!-- 左侧题目区 70% -->
      <view class="left-panel">
        <!-- 题目内容区 -->
        <view class="question-area">
          <view class="question-type" :class="questions[currentIndex]?.type">{{ typeText }}</view>
          <text class="question-content">{{ questions[currentIndex]?.content }}</text>
          <view class="options">
            <view
              v-for="(option, i) in questions[currentIndex]?.options"
              :key="i"
              class="option-item"
              :class="{
                'selected': isOptionSelected(option)
              }"
              @tap="selectOption(option)"
            >
              <text class="option-label">{{ labels[i] }}.</text>
              <text class="option-text">{{ option }}</text>
              <view class="option-check" v-if="isOptionSelected(option)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="bottom-bar">
          <view class="bottom-left">
            <view v-if="questions[currentIndex]?.type === 'multiple' && !autoNextTimer" class="confirm-btn" @tap="confirmMultiple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <text class="btn-text">确认</text>
            </view>
            <view v-else-if="autoNextTimer" class="auto-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <text class="auto-hint-text">{{ autoNextCountdown }}s 后自动下一题</text>
            </view>
          </view>
          <view class="finish-btn" @tap="confirmFinish">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <text class="btn-text">交卷</text>
          </view>
        </view>
      </view>

      <!-- 右侧面板 30% -->
      <view class="right-panel">
        <!-- 右上：答题进度 -->
        <view class="progress-section">
          <view class="progress-info">
            <text class="progress-text">第 {{ currentIndex + 1 }}/{{ questions.length }} 题</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: answeredPercent + '%' }"></view>
          </view>
          <text class="progress-percent">{{ answeredPercent }}%</text>

          <view v-if="autoNextCountdown > 0" class="countdown-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <text class="countdown-text">{{ autoNextCountdown }}s 后自动下一题</text>
          </view>
        </view>

        <!-- 右下：题号导航 -->
        <scroll-view class="nav-panel" scroll-y>
          <view class="nav-grid">
            <view
              v-for="(q, i) in questions"
              :key="i"
              class="nav-item"
              :class="{
                'active': i === currentIndex,
                'answered': userAnswers[i] !== undefined && userAnswers[i] !== ''
              }"
              @tap="goToQuestion(i)"
            >
              <text class="nav-num">{{ i + 1 }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 完成状态 -->
    <view v-else class="result-area">
      <view class="result-header">
        <view class="result-icon-wrapper">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </view>
        <text class="result-title">练习完成</text>
      </view>

      <!-- 4个 KPI 卡片 2×2 网格 -->
      <view class="result-kpi-grid">
        <view class="kpi-card">
          <text class="kpi-value correct">{{ correctCount }}</text>
          <text class="kpi-label">正确</text>
        </view>
        <view class="kpi-card">
          <text class="kpi-value wrong">{{ wrongCount }}</text>
          <text class="kpi-label">错误</text>
        </view>
        <view class="kpi-card">
          <text class="kpi-value rate">{{ correctRate }}%</text>
          <text class="kpi-label">正确率</text>
        </view>
        <view class="kpi-card">
          <text class="kpi-value total">{{ questions.length }}</text>
          <text class="kpi-label">总题数</text>
        </view>
      </view>

      <view class="wrong-section" v-if="wrongQuestions.length > 0">
        <text class="section-title">错题 ({{ wrongQuestions.length }}题)</text>
        <scroll-view class="wrong-list" scroll-y>
          <view class="wrong-item" v-for="(wq, i) in wrongQuestions" :key="i">
            <text class="wrong-index">{{ i + 1 }}</text>
            <view class="wrong-detail">
              <text class="wrong-content">{{ wq.content }}</text>
              <view class="wrong-answers">
                <text class="wrong-your">你的答案：{{ getYourAnswer(wq) }}</text>
                <text class="wrong-correct">正确答案：{{ getCorrectText(wq) || wq.answer }}</text>
              </view>
              <view v-if="wq.analysis" class="wrong-analysis">
                <text class="wrong-analysis-text">{{ wq.analysis }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="review-btn" @tap="startReview">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <text class="btn-text">错题复考</text>
        </view>
      </view>

      <view class="action-buttons">
        <view class="back-btn" @tap="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <text class="btn-text">返回题库</text>
        </view>
        <view class="retry-btn" @tap="retryAll">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <text class="btn-text">重新刷题</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getRandomQuestions, getAllRandomQuestions, getQuestionsByIds, addRecord, addWrong, masterWrongByQuestionId } from '@/utils/db'

const questions = ref<any[]>([])
const currentIndex = ref(0)
const currentAnswer = ref('')
const userAnswers = ref<Record<number, string>>({})
const results = ref<{ questionId: number; isCorrect: boolean }[]>([])
const finished = ref(false)
const wrongQuestions = ref<any[]>([])

const bankId = ref(0)
const bankName = ref('')
const countParam = ref(100)
const idsParam = ref('')

const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

let autoNextTimer: ReturnType<typeof setTimeout> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null
const autoNextCountdown = ref(0)

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  bankId.value = Number(page.options.bankId || 0)
  bankName.value = decodeURIComponent(page.options.name || '')
  countParam.value = Number(page.options.count || 100)
  idsParam.value = page.options.ids || ''
  uni.setNavigationBarTitle({ title: bankName.value })
  loadQuestions()
})

onUnmounted(() => {
  clearAutoNext()
})

const clearAutoNext = () => {
  if (autoNextTimer) {
    clearTimeout(autoNextTimer)
    autoNextTimer = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  autoNextCountdown.value = 0
}

const startAutoNext = () => {
  clearAutoNext()
  autoNextCountdown.value = 3
  countdownInterval = setInterval(() => {
    autoNextCountdown.value--
    if (autoNextCountdown.value <= 0) {
      if (countdownInterval) clearInterval(countdownInterval)
      countdownInterval = null
    }
  }, 1000)
  autoNextTimer = setTimeout(() => {
    autoNextTimer = null
    clearAutoNext()
    nextQuestion()
  }, 3000)
}

const loadQuestions = async () => {
  uni.showLoading({ title: '加载中...' })
  const count = countParam.value || 100

  if (idsParam.value) {
    const ids = idsParam.value.split(',').map(Number).filter(Boolean)
    questions.value = await getQuestionsByIds(ids)
  } else if (bankId.value === 0) {
    questions.value = await getAllRandomQuestions(count)
  } else {
    questions.value = await getRandomQuestions(bankId.value, count)
  }

  uni.hideLoading()
}

const typeText = computed(() => {
  const type = questions.value[currentIndex.value]?.type
  const typeMap: Record<string, string> = { single: '单选', multiple: '多选', judge: '判断' }
  return typeMap[type] || '单选'
})

const answeredCount = computed(() => {
  return Object.values(userAnswers.value).filter(a => a !== undefined && a !== '').length
})

const answeredPercent = computed(() => {
  return questions.value.length > 0
    ? Math.round((answeredCount.value / questions.value.length) * 100)
    : 0
})

const correctCount = computed(() => results.value.filter(r => r.isCorrect).length)
const wrongCount = computed(() => results.value.filter(r => !r.isCorrect).length)
const correctRate = computed(() => {
  return results.value.length > 0
    ? Math.round((correctCount.value / results.value.length) * 100)
    : 0
})

const selectOption = (option: string) => {
  const q = questions.value[currentIndex.value]
  const optIdx = q.options.indexOf(option)
  if (optIdx < 0) return
  const label = labels[optIdx]
  if (q.type === 'single' || q.type === 'judge') {
    currentAnswer.value = label
    userAnswers.value[currentIndex.value] = label
    startAutoNext()
  } else if (q.type === 'multiple') {
    const arr = currentAnswer.value ? currentAnswer.value.split(',') : []
    const idx = arr.indexOf(label)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(label)
    currentAnswer.value = arr.sort().join(',')
    userAnswers.value[currentIndex.value] = currentAnswer.value
  }
}

const isOptionSelected = (option: string): boolean => {
  const q = questions.value[currentIndex.value]
  const optIdx = q.options.indexOf(option)
  if (optIdx < 0) return false
  const label = labels[optIdx]
  if (q.type === 'multiple') {
    return currentAnswer.value.split(',').includes(label)
  }
  return currentAnswer.value === label
}

const confirmMultiple = () => {
  userAnswers.value[currentIndex.value] = currentAnswer.value
  startAutoNext()
}

const nextQuestion = () => {
  clearAutoNext()
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    currentAnswer.value = userAnswers.value[currentIndex.value] || ''
  }
}

const goToQuestion = (index: number) => {
  clearAutoNext()
  currentIndex.value = index
  currentAnswer.value = userAnswers.value[index] || ''
}

const confirmFinish = () => {
  const unanswered = questions.value.length - answeredCount.value
  if (unanswered > 0) {
    uni.showModal({
      title: '提示',
      content: `还有 ${unanswered} 题未作答，确定交卷吗？`,
      success: (res) => {
        if (res.confirm) finishPractice()
      }
    })
  } else {
    finishPractice()
  }
}

const finishPractice = async () => {
  clearAutoNext()
  uni.showLoading({ title: '交卷中...' })

  const newResults: { questionId: number; isCorrect: boolean }[] = []
  const newWrong: any[] = []

  const normalizeForCompare = (answer: string, type: string, options: string[]): string => {
    if (!answer) return ''
    if (type === 'judge') {
      return answer.split(',').map(ch => {
        const idx = labels.indexOf(ch)
        return idx >= 0 && options[idx] ? options[idx] : ch
      }).join(',')
    }
    if (type === 'multiple') {
      return answer.split(',').filter(Boolean).sort().join(',')
    }
    return answer
  }

  for (let i = 0; i < questions.value.length; i++) {
    const q = questions.value[i]
    const userLetter = userAnswers.value[i] || ''
    const normalizedUser = normalizeForCompare(userLetter, q.type, q.options || [])
    const normalizedCorrect = normalizeForCompare(q.answer || '', q.type, q.options || [])
    const isCorrect = normalizedUser !== '' && normalizedUser === normalizedCorrect

    newResults.push({ questionId: q.id!, isCorrect })
    await addRecord(q.id!, userLetter, isCorrect)

    if (!isCorrect && q.id) {
      await addWrong(q.id)
      newWrong.push({ ...q, yourAnswer: userLetter || '(未作答)' })
    } else if (isCorrect && q.id) {
      await masterWrongByQuestionId(q.id)
    }
  }

  results.value = newResults
  wrongQuestions.value = newWrong
  finished.value = true
  uni.hideLoading()
}

const getYourAnswer = (wq: any) => {
  if (!wq.yourAnswer || wq.yourAnswer === '(未作答)') return '(未作答)'
  if (wq.type === 'judge') {
    return getCorrectTextForDisplay(wq.yourAnswer, wq.options || [])
  }
  if (wq.type === 'multiple') {
    return wq.yourAnswer.split(',').filter(Boolean).sort().map((ch: string) => {
      const idx = labels.indexOf(ch)
      return idx >= 0 ? (wq.options || [])[idx] : ch
    }).join(',')
  }
  const idx = labels.indexOf(wq.yourAnswer)
  return idx >= 0 ? (wq.options || [])[idx] : wq.yourAnswer
}

const getCorrectText = (wq: any) => {
  if (!wq.options || !wq.answer) return ''
  if (wq.type === 'judge') {
    return wq.answer
  }
  if (wq.type === 'multiple') {
    return wq.answer.split(',').filter(Boolean).sort().map((ch: string) => {
      const idx = labels.indexOf(ch)
      return idx >= 0 ? wq.options[idx] : ch
    }).join(',')
  }
  const idx = labels.indexOf(wq.answer)
  return idx >= 0 ? wq.options[idx] : wq.answer
}

const getCorrectTextForDisplay = (answer: string, options: string[]) => {
  return answer.split(',').map((ch: string) => {
    const idx = labels.indexOf(ch)
    return idx >= 0 ? options[idx] : ch
  }).join(',')
}

const startReview = () => {
  questions.value = [...wrongQuestions.value].sort(() => Math.random() - 0.5)
  currentIndex.value = 0
  currentAnswer.value = ''
  userAnswers.value = {}
  results.value = []
  wrongQuestions.value = []
  finished.value = false
}

const goBack = () => {
  if (bankId.value === 0) {
    uni.switchTab({ url: '/pages/index/index' })
  } else {
    uni.switchTab({ url: '/pages/bank/bank' })
  }
}

const retryAll = () => {
  currentIndex.value = 0
  currentAnswer.value = ''
  userAnswers.value = {}
  results.value = []
  wrongQuestions.value = []
  finished.value = false
  loadQuestions()
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F0FDFA;
}

/* ===== 左右分栏布局 7:3 ===== */
.practice-split {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.left-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #E2E8F0;
}

.right-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}

/* ===== 左侧：题目区 ===== */
.question-area {
  flex: 1;
  padding: 24px 20px;
}

.question-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
}
.option-item:active {
  transform: scale(0.98);
}

.option-item.selected {
  border-color: #0D9488;
  background: #F0FDFA;
}

.option-label {
  width: 30px;
  height: 30px;
  background: #F1F5F9;
  color: #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}
.option-item.selected .option-label {
  background: #0D9488;
  color: #FFFFFF;
}

.option-text {
  font-size: 15px;
  color: var(--text-primary);
  flex: 1;
  line-height: 1.5;
}

.option-check {
  color: #0D9488;
  margin-left: 8px;
}

/* 底部操作栏 */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
}

.bottom-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0D9488;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  color: #FFFFFF;
  font-weight: 600;
  transition: transform 0.2s ease;
}
.confirm-btn:active {
  transform: scale(0.95);
}
.confirm-btn .btn-text {
  color: #fff;
  font-size: 14px;
}

.auto-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
}
.auto-hint-text {
  font-size: 13px;
  color: #64748B;
}

.finish-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #F59E0B;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  color: #FFFFFF;
  font-weight: 600;
  transition: transform 0.2s ease;
}
.finish-btn:active {
  transform: scale(0.95);
}
.finish-btn .btn-text {
  color: #fff;
  font-size: 14px;
}

/* ===== 右侧：进度 + 导航 ===== */
.progress-section {
  padding: 16px;
  border-bottom: 1px solid #E2E8F0;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.question-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  color: #fff;
  font-weight: 600;
  margin-bottom: 12px;
  display: inline-block;
}
.question-type.single { background: #0D9488; }
.question-type.multiple { background: #F59E0B; }
.question-type.judge { background: #22C55E; }

.progress-bar {
  height: 6px;
  background: #E2E8F0;
  border-radius: var(--radius-full);
  margin-bottom: 6px;
}
.progress-fill {
  height: 100%;
  background: #0D9488;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-percent {
  font-size: 12px;
  color: #64748B;
}

.countdown-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 10px;
  background: #F0FDFA;
  border-radius: var(--radius-sm);
}
.countdown-text {
  font-size: 12px;
  font-weight: 500;
  color: #0D9488;
}

/* 题号导航网格 */
.nav-panel {
  flex: 1;
  padding: 12px;
  min-height: 0;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.nav-item {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #F1F5F9;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}
.nav-item:active {
  transform: scale(0.9);
}
.nav-item.active {
  border-color: #0D9488;
  background: #F0FDFA;
}
.nav-item.answered {
  background: #D1FAE5;
  border-color: transparent;
}
.nav-item.answered.active {
  border-color: #0D9488;
  background: #F0FDFA;
}

.nav-num {
  font-size: 11px;
  color: #334155;
  font-weight: 500;
}
.nav-item.answered .nav-num {
  color: #059669;
  font-weight: 600;
}

/* ===== 结果页面 ===== */
.result-area {
  padding: 40px 16px;
  max-width: 800px;
  margin: 0 auto;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.result-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #22C55E;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(34,197,94,0.2);
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.result-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.kpi-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  display: block;
  margin-bottom: 4px;
}
.kpi-value.correct { color: #22C55E; }
.kpi-value.wrong { color: #EF4444; }
.kpi-value.rate { color: #0D9488; }
.kpi-value.total { color: #334155; }

.kpi-label {
  font-size: 13px;
  color: #64748B;
}

.wrong-section {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.wrong-list {
  max-height: 400px;
  margin-bottom: 16px;
}

.wrong-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #F1F5F9;
}

.wrong-index {
  width: 28px;
  height: 28px;
  background: #EF4444;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.wrong-detail {
  flex: 1;
  min-width: 0;
}

.wrong-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 6px;
}

.wrong-answers {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 6px;
}

.wrong-your {
  font-size: 12px;
  color: #EF4444;
  font-weight: 500;
}

.wrong-correct {
  font-size: 12px;
  color: #22C55E;
  font-weight: 500;
}

.wrong-analysis {
  background: #F8FAFC;
  border-radius: 8px;
  padding: 8px 12px;
  border-left: 3px solid #0D9488;
}

.wrong-analysis-text {
  font-size: 12px;
  color: #64748B;
  line-height: 1.5;
}

.review-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #F59E0B;
  padding: 14px;
  border-radius: var(--radius-md);
  color: #FFFFFF;
  font-weight: 600;
  transition: transform 0.2s ease;
}
.review-btn:active {
  transform: scale(0.98);
}
.review-btn .btn-text {
  color: #fff;
  font-size: 15px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}
.action-buttons > view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: var(--radius-md);
  color: #FFFFFF;
  font-weight: 600;
  transition: transform 0.2s ease;
}
.action-buttons > view:active {
  transform: scale(0.98);
}
.action-buttons .btn-text {
  color: #fff;
  font-size: 15px;
}

.back-btn {
  background: #64748B;
}
.retry-btn {
  background: #0D9488;
}

/* ===== 响应式：移动端切换为单列 ===== */
@media (max-width: 768px) {
  .practice-split {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
  
  .left-panel {
    flex: none;
    border-right: none;
    min-height: auto;
  }
  
  .right-panel {
    flex: none;
    min-height: auto;
    border-top: 1px solid #E2E8F0;
  }
  
  .nav-panel {
    max-height: 200px;
  }
  
  .nav-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style>
