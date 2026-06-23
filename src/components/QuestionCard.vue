<template>
  <view class="question-card">
    <view class="question-header">
      <text class="question-index">第 {{ index + 1 }} 题</text>
      <text class="question-type" :class="typeClass">{{ typeText }}</text>
    </view>
    <text class="question-content">{{ question.content }}</text>
    <view class="options">
      <view
        v-for="(option, i) in question.options"
        :key="i"
        class="option-item"
        :class="{
          'selected': selectedAnswer.includes(option),
          'correct': showAnswer && question.answer.includes(option),
          'wrong': showAnswer && selectedAnswer.includes(option) && !question.answer.includes(option)
        }"
        @tap="selectOption(option)"
      >
        <view class="option-label">{{ labels[i] }}</view>
        <text class="option-text">{{ option }}</text>
        <view class="option-check" v-if="selectedAnswer.includes(option)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </view>
      </view>
    </view>
    <view v-if="showAnswer && question.analysis" class="analysis">
      <view class="analysis-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <text class="analysis-title">解析</text>
      </view>
      <text class="analysis-text">{{ question.analysis }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  question: any
  index: number
  selectedAnswer: string
  showAnswer: boolean
}>()

const emit = defineEmits(['select', 'autoSubmit'])

const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const typeText = computed(() => {
  const typeMap: Record<string, string> = { single: '单选', multiple: '多选', judge: '判断' }
  return typeMap[props.question.type] || '单选'
})

const typeClass = computed(() => props.question.type)

const selectOption = (option: string) => {
  if (props.showAnswer) return
  if (props.question.type === 'judge' || props.question.type === 'single') {
    emit('select', option)
    setTimeout(() => {
      emit('autoSubmit')
    }, 100)
  } else if (props.question.type === 'multiple') {
    const arr = props.selectedAnswer ? props.selectedAnswer.split(',') : []
    const idx = arr.indexOf(option)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(option)
    emit('select', arr.sort().join(','))
  } else {
    emit('select', option)
  }
}
</script>

<style scoped>
.question-card {
  background: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: var(--space-xl, 32px);
  border: 1px solid #E2E8F0;
  box-shadow: var(--shadow-sm);
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-lg, 24px);
  gap: var(--space-md, 16px);
}

.question-index {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Flat Design: 纯色标签 */
.question-type {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  color: #FFFFFF;
  font-weight: 600;
}
.question-type.single { background: #0D9488; }
.question-type.multiple { background: #F59E0B; }
.question-type.judge { background: #22C55E; }

.question-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: var(--space-xl, 32px);
}

.options {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

.option-item {
  display: flex;
  align-items: center;
  padding: var(--space-md, 16px);
  border: 1.5px solid #E2E8F0;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  cursor: pointer;
}
.option-item:active {
  transform: scale(0.98);
}

.option-item.selected {
  border-color: #0D9488;
  background: #F0FDFA;
}
.option-item.correct {
  border-color: #22C55E;
  background: #ECFDF5;
}
.option-item.wrong {
  border-color: #EF4444;
  background: #FEF2F2;
}

.option-label {
  width: 32px;
  height: 32px;
  background: #F1F5F9;
  color: #334155;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: var(--space-md, 16px);
  flex-shrink: 0;
}

.option-item.selected .option-label {
  background: #0D9488;
  color: #FFFFFF;
}
.option-item.correct .option-label {
  background: #22C55E;
  color: #FFFFFF;
}
.option-item.wrong .option-label {
  background: #EF4444;
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
  margin-left: var(--space-sm, 8px);
}
.option-item.correct .option-check {
  color: #22C55E;
}
.option-item.wrong .option-check {
  color: #EF4444;
}

.analysis {
  margin-top: var(--space-xl, 32px);
  padding: var(--space-lg, 24px);
  background: #F8FAFC;
  border-radius: var(--radius-md);
  border-left: 4px solid #0D9488;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--space-sm, 8px);
}

.analysis-title {
  font-size: 14px;
  font-weight: 600;
  color: #0D9488;
}

.analysis-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
