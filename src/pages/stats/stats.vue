<template>
  <view class="page-stats">
    <!-- 头部 -->
    <view class="stats-header">
      <text class="title">学习统计</text>
    </view>

    <!-- 概览卡片 -->
    <view class="overview-grid">
      <view class="stat-card blue">
        <view class="stat-icon">
          <IconSet name="book" :size="20" />
        </view>
        <text class="stat-value">{{ stats.totalBanks }}</text>
        <text class="stat-label">题库数</text>
      </view>
      <view class="stat-card cyan">
        <view class="stat-icon">
          <IconSet name="help_circle" :size="20" />
        </view>
        <text class="stat-value">{{ stats.totalQuestions }}</text>
        <text class="stat-label">总题数</text>
      </view>
      <view class="stat-card green">
        <view class="stat-icon">
          <IconSet name="clipboard_check" :size="20" />
        </view>
        <text class="stat-value">{{ stats.totalRecords }}</text>
        <text class="stat-label">答题数</text>
      </view>
      <view class="stat-card orange">
        <view class="stat-icon">
          <IconSet name="check_circle" :size="20" />
        </view>
        <text class="stat-value rate">{{ stats.correctRate }}%</text>
        <text class="stat-label">正确率</text>
      </view>
    </view>

    <!-- 按章节正确率 -->
    <view class="section" v-if="bankStats.length > 0">
      <text class="section-title">章节正确率</text>
      <view class="bank-section" v-for="bs in bankStats" :key="bs.bankId">
        <view class="bank-header-row">
          <text class="bank-name">{{ bs.bankName }}</text>
        </view>
        <view class="chapter-list">
          <view class="chapter-item" v-for="cs in bs.chapters" :key="cs.chapter">
            <view class="chapter-info">
              <text class="chapter-name">{{ cs.chapter }}</text>
              <text class="chapter-count">{{ cs.done }}/{{ cs.total }}</text>
            </view>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: cs.correctRate + '%', background: getColor(cs.correctRate) }"></view>
            </view>
            <text class="chapter-rate" :style="{ color: getColor(cs.correctRate) }">{{ cs.correctRate }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <AppEmpty
      v-if="stats.totalRecords === 0"
      title="暂无数据"
      desc="导入题库并开始刷题后可查看学习统计"
      :padding="60"
    >
      <template #icon>
        <IconSet name="bar_chart_styled" :size="40" color="#0D9488" :strokeWidth="1.5" />
      </template>
      <template #action>
        <view class="empty-cta" @tap="goToBank" hover-class="action-press">
          <IconSet name="book" :size="16" />
          <text>去导入题库</text>
        </view>
      </template>
    </AppEmpty>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStats, getBanks, getChapterStats } from '@/utils/db'
import AppEmpty from '@/components/AppEmpty.vue'
import IconSet from '@/components/IconSet.vue'

const stats = ref({
  totalBanks: 0,
  totalQuestions: 0,
  totalRecords: 0,
  correctRate: 0,
  totalWrongs: 0
})

const bankStats = ref<{ bankId: number; bankName: string; chapters: any[] }[]>([])

onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  stats.value = await getStats()
  const banks = await getBanks()
  bankStats.value = []

  for (const bank of banks) {
    const chapters = await getChapterStats(bank.id!)
    if (chapters.length > 0) {
      bankStats.value.push({
        bankId: bank.id!,
        bankName: bank.name,
        chapters
      })
    }
  }
}

const getColor = (rate: number) => {
  if (rate >= 80) return '#22C55E'
  if (rate >= 60) return '#F59E0B'
  return '#EF4444'
}

const goToBank = () => {
  uni.switchTab({ url: '/pages/bank/bank' })
}
</script>

<style scoped>
.page-stats {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 16px;
  padding-bottom: 100px;
}

/* 头部 */
.stats-header {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 概览卡片 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  text-align: center;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.stat-card:active {
  transform: scale(0.97);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

/* Flat Design: 不同颜色的浅色背景 */
.stat-card.blue .stat-icon {
  background: #F0FDFA;
  color: #0D9488;
}

.stat-card.cyan .stat-icon {
  background: #F0FDFA;
  color: #14B8A6;
}

.stat-card.green .stat-icon {
  background: #ECFDF5;
  color: #22C55E;
}

.stat-card.orange .stat-icon {
  background: #FFFBEB;
  color: #F59E0B;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.stat-value.rate {
  color: #22C55E;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* 章节统计 */
.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.bank-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 18px;
  margin-bottom: 12px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.bank-header-row {
  margin-bottom: 14px;
}

.bank-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-info {
  width: 110px;
  flex-shrink: 0;
}

.chapter-name {
  font-size: 13px;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-count {
  font-size: 11px;
  color: var(--text-muted);
}

/* Flat Design: 纯色进度条 */
.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease-out;
}

.chapter-rate {
  width: 48px;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
  flex-shrink: 0;
}

/* 空状态CTA */
/* Flat Design: 纯色按钮 */
.empty-cta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 12px 24px;
  background: #0D9488;
  border-radius: var(--radius-md);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.action-press {
  transform: scale(0.97);
}
</style>
