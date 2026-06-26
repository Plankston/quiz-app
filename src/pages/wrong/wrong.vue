<template>
  <view class="page-wrong">
    <!-- 头部 -->
    <view class="wrong-header">
      <view class="header-main">
        <text class="title">错题本</text>
        <AppBadge v-if="totalCount > 0" :content="totalCount" size="md" color="#EF4444" />
      </view>
      <view v-if="totalCount > 0" class="clear-btn" @tap="clearWrongs">
        <IconSet name="trash" :size="16" />
        <text>清除</text>
      </view>
    </view>

    <!-- 按题库统计 -->
    <view class="bank-stats" v-if="bankStats.length > 0">
      <text class="section-title">按题库统计</text>
      <view class="bank-stat-list">
        <view 
          class="bank-stat-card" 
          v-for="stat in bankStats" 
          :key="stat.bankName"
          @tap="startBankReview(stat)"
          hover-class="action-press"
        >
          <view class="bank-stat-icon">
            <IconSet name="book" :size="20" />
          </view>
          <view class="bank-stat-info">
            <text class="bank-stat-name">{{ stat.bankName || '未分类' }}</text>
            <text class="bank-stat-count">{{ stat.count }}道错题</text>
          </view>
          <view class="bank-stat-arrow">
            <IconSet name="chevron_right" :size="16" color="#94A3B8" />
          </view>
        </view>
      </view>
    </view>

    <!-- 全部错题列表 -->
    <view class="wrong-section" v-if="wrongList.length > 0">
      <text class="section-title">全部错题 ({{ wrongList.length }})</text>
      <view class="wrong-list">
        <view class="wrong-card" v-for="(item, i) in wrongList" :key="i">
          <view class="card-header">
            <view class="card-meta">
              <view class="wrong-index">{{ i + 1 }}</view>
              <view class="wrong-type" :class="item.question?.type">{{ typeText(item.question?.type) }}</view>
              <view class="wrong-count">
                <IconSet name="clock" :size="12" />
                <text>错{{ item.wrongCount }}次</text>
              </view>
            </view>
          </view>

          <text class="wrong-content">{{ item.question?.content }}</text>

          <view class="wrong-options" v-if="item.question?.options">
            <view
              class="option-static"
              v-for="(opt, j) in item.question.options"
              :key="j"
              :class="{ 'option-correct': item.question.answer.includes(opt) }"
            >
              <text class="option-letter">{{ String.fromCharCode(65 + j) }}</text>
              <text class="option-text">{{ opt }}</text>
            </view>
          </view>

          <view class="card-footer">
            <view class="master-btn" @tap="masterQuestion(item.id!)">
              <IconSet name="check" :size="14" />
              <text>标记已掌握</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <AppEmpty
      v-if="wrongList.length === 0 && bankStats.length === 0"
      title="没有错题"
      desc="继续加油，保持正确率！"
      :padding="80"
    >
      <template #icon>
        <IconSet name="check_circle" :size="40" color="#22C55E" :stroke-width="1.5" />
      </template>
    </AppEmpty>

    <!-- 底部按钮 -->
    <view class="bottom-bar" v-if="wrongList.length > 0">
      <view class="review-btn" @tap="startAllReview" hover-class="action-press">
        <IconSet name="rotate_ccw" :size="18" />
        <text>全部错题复考 ({{ wrongList.length }}题)</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getWrongWithDetails, masterWrong, clearAllWrongs } from '@/utils/db'
import AppBadge from '@/components/AppBadge.vue'
import AppEmpty from '@/components/AppEmpty.vue'
import IconSet from '@/components/IconSet.vue'

const wrongList = ref<any[]>([])

// 按题库统计
const bankStats = computed(() => {
  const map = new Map<string, number>()
  wrongList.value.forEach(w => {
    const name = w.bankName || '未分类'
    map.set(name, (map.get(name) || 0) + 1)
  })
  return Array.from(map.entries())
    .map(([bankName, count]) => ({ bankName, count }))
    .sort((a, b) => b.count - a.count)
})

const totalCount = computed(() => wrongList.value.length)

onMounted(async () => {
  await loadWrong()
})

const loadWrong = async () => {
  wrongList.value = await getWrongWithDetails()
}

const typeText = (type: string) => {
  const map: Record<string, string> = { single: '单选', multiple: '多选', judge: '判断' }
  return map[type] || '单选'
}

const masterQuestion = async (id: number) => {
  await masterWrong(id)
  await loadWrong()
  uni.showToast({ title: '已掌握', icon: 'success' })
}

const clearWrongs = async () => {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有错题记录吗？',
    success: async (res) => {
      if (res.confirm) {
        await clearAllWrongs()
        await loadWrong()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}

// 按题库进入错题答题
const startBankReview = (stat: { bankName: string; count: number }) => {
  const ids = wrongList.value
    .filter(w => (w.bankName || '未分类') === stat.bankName)
    .map(w => w.questionId)
    .join(',')
  uni.navigateTo({
    url: `/pages/practice/practice?bankId=0&name=${encodeURIComponent(stat.bankName)}错题复考&ids=${ids}`
  })
}

// 全部错题复考
const startAllReview = () => {
  const ids = wrongList.value.map(w => w.questionId).join(',')
  uni.navigateTo({
    url: `/pages/practice/practice?bankId=0&name=错题复考&ids=${ids}`
  })
}
</script>

<style scoped>
.page-wrong {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 16px;
  padding-bottom: 100px;
}

/* 头部 */
.wrong-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748B;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-muted);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.clear-btn:active {
  background: #E2E8F0;
}

/* 分区标题 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: block;
}

/* 按题库统计 */
.bank-stats {
  margin-bottom: 24px;
}

.bank-stat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-stat-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.bank-stat-card:active {
  background: var(--bg-hover);
}

.bank-stat-icon {
  width: 40px;
  height: 40px;
  background: #F0FDFA;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0D9488;
  margin-right: 12px;
  flex-shrink: 0;
}

.bank-stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bank-stat-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.bank-stat-count {
  font-size: 13px;
  color: #DC2626;
  font-weight: 500;
}

.bank-stat-arrow {
  flex-shrink: 0;
  margin-left: 8px;
}

/* 错题列表 */
.wrong-section {
  margin-bottom: 20px;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wrong-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 18px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wrong-index {
  width: 28px;
  height: 28px;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.wrong-type {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  color: #FFFFFF;
  font-weight: 600;
}

.wrong-type.single { background: #0D9488; }
.wrong-type.multiple { background: #F59E0B; }
.wrong-type.judge { background: #22C55E; }

.wrong-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #DC2626;
  margin-left: auto;
  font-weight: 500;
}

.wrong-content {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 14px;
}

.wrong-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.option-static {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-sm);
}

.option-correct {
  background: #ECFDF5;
  border: 1px solid #22C55E;
}

.option-letter {
  width: 22px;
  height: 22px;
  background: var(--border-light);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.option-correct .option-letter {
  background: #22C55E;
  color: #FFFFFF;
}

.option-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.master-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-primary);
  padding: 8px 14px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.master-btn:active {
  background: var(--color-primary-50);
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + var(--safe-area-bottom));
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  z-index: 10;
}

.review-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #F59E0B;
  padding: 14px;
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast);
  cursor: pointer;
}

.action-press {
  transform: scale(0.98);
}

.review-btn text {
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
}
</style>
