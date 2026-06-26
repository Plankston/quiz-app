<template>
  <view class="page-wrong">
    <!-- 头部 -->
    <view class="wrong-header">
      <view class="header-main">
        <text class="title">错题本</text>
        <AppBadge v-if="wrongList.length > 0" :content="wrongList.length" size="md" color="#EF4444" />
      </view>
      <view v-if="wrongList.length > 0" class="clear-btn" @tap="clearWrongs">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <text>清除</text>
      </view>
    </view>

    <!-- 错题列表 -->
    <view class="wrong-list" v-if="wrongList.length > 0">
      <view class="wrong-card" v-for="(item, i) in wrongList" :key="i">
        <view class="card-header">
          <view class="card-meta">
            <view class="wrong-index">{{ i + 1 }}</view>
            <view class="wrong-type" :class="item.question?.type">{{ typeText(item.question?.type) }}</view>
            <view class="wrong-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <text>标记已掌握</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <AppEmpty
      v-else
      title="没有错题"
      desc="继续加油，保持正确率！"
      :padding="80"
    >
      <template #icon>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </template>
    </AppEmpty>

    <!-- 底部按钮 -->
    <view class="bottom-bar" v-if="wrongList.length > 0">
      <view class="review-btn" @tap="startReview" hover-class="action-press">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
        <text>错题复考 ({{ wrongList.length }}题)</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWrongWithDetails, masterWrong, clearAllWrongs } from '@/utils/db'
import AppBadge from '@/components/AppBadge.vue'
import AppEmpty from '@/components/AppEmpty.vue'

const wrongList = ref<any[]>([])

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

const startReview = () => {
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

/* 错题列表 */
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

/* Flat Design: 纯色标签 */
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

.wrong-count svg {
  flex-shrink: 0;
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
  transition: all var(--transition-fast);
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

/* Flat Design: 纯色复考按钮 */
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
