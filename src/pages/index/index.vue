<template>
  <view class="page-home">
    <!-- 头部区域 -->
    <view class="home-header">
      <view class="header-content">
        <text class="app-title">刷题助手</text>
        <text class="app-subtitle">题库共 {{ totalQuestions }} 题</text>
      </view>
    </view>

    <!-- 主操作区 -->
    <view class="actions-section">
      <view class="action-card primary" @tap="showCountModal = true" hover-class="action-press">
        <view class="action-icon primary-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </view>
        <view class="action-info">
          <text class="action-title">开始答题</text>
          <text class="action-desc">从所有题库中随机出题</text>
        </view>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </view>

      <view class="action-card danger" @tap="goToWrong" hover-class="action-press">
        <view class="action-icon danger-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </view>
        <view class="action-info">
          <text class="action-title">错题重考</text>
          <text class="action-desc">{{ totalWrongs }}道错题待复习</text>
        </view>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-section">
      <text class="section-label">快捷入口</text>
      <view class="quick-grid">
        <view class="quick-item" @tap="goToTab('/pages/bank/bank')" hover-class="action-press">
          <view class="quick-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </view>
          <text class="quick-label">题库管理</text>
        </view>
        <view class="quick-item" @tap="goToTab('/pages/stats/stats')" hover-class="action-press">
          <view class="quick-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </view>
          <text class="quick-label">学习统计</text>
        </view>
      </view>
    </view>

    <!-- 空状态提示 -->
    <view class="empty-hint" v-if="totalQuestions === 0">
      <view class="empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </view>
      <text class="empty-text">还没有导入题库</text>
      <text class="empty-sub">点击底部「题库」标签导入Excel文件开始刷题</text>
    </view>

    <!-- 题数选择弹窗 -->
    <view class="modal-mask" v-if="showCountModal" @tap="showCountModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">选择题数</text>
          <view class="modal-close" @tap="showCountModal = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </view>
        </view>
        <text class="modal-hint">共 {{ totalQuestions }} 题可用</text>

        <view class="preset-grid">
          <view
            v-for="n in presetCounts"
            :key="n"
            class="preset-item"
            :class="{ active: selectedCount === n && !isCustomInput }"
            @tap="selectPreset(n)"
          >
            <text class="preset-num">{{ n }}</text>
          </view>
          <view
            class="preset-item"
            :class="{ active: isCustomInput }"
            @tap="isCustomInput = true; selectedCount = 0"
          >
            <text class="preset-num">自定义</text>
          </view>
        </view>

        <view v-if="isCustomInput" class="custom-input-wrap">
          <input
            class="custom-input"
            type="number"
            placeholder="输入题目数量"
            :value="customCount"
            @input="onCustomInput"
          />
        </view>

        <view class="modal-actions">
          <view class="modal-btn cancel" @tap="showCountModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm" @tap="startPractice">
            <text class="modal-btn-text">开始</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTotalQuestionCount, getWrongQuestions } from '@/utils/db'

const statusBarHeight = ref(0)
const totalQuestions = ref(0)
const totalWrongs = ref(0)

const showCountModal = ref(false)
const presetCounts = [10, 20, 30, 50, 100]
const selectedCount = ref(20)
const isCustomInput = ref(false)
const customCount = ref('')

onMounted(async () => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  await loadData()
})

const loadData = async () => {
  totalQuestions.value = await getTotalQuestionCount()
  const wrongs = await getWrongQuestions()
  totalWrongs.value = wrongs.length
}

const selectPreset = (n: number) => {
  isCustomInput.value = false
  selectedCount.value = n
}

const onCustomInput = (e: any) => {
  customCount.value = e.detail.value
  selectedCount.value = Number(e.detail.value) || 0
}

const startPractice = () => {
  if (totalQuestions.value === 0) {
    uni.showToast({ title: '请先导入题库', icon: 'none' })
    return
  }

  const count = isCustomInput.value ? Number(customCount.value) : selectedCount.value
  if (!count || count <= 0) {
    uni.showToast({ title: '请输入有效题数', icon: 'none' })
    return
  }

  const actualCount = Math.min(count, totalQuestions.value)
  showCountModal.value = false
  uni.navigateTo({
    url: `/pages/practice/practice?bankId=0&name=混合练习&count=${actualCount}`
  })
}

const goToWrong = () => {
  uni.switchTab({ url: '/pages/wrong/wrong' })
}

const goToTab = (url: string) => {
  uni.switchTab({ url })
}
</script>

<style scoped>
.page-home {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 16px;
  padding-bottom: 100px;
}

/* 头部区域 */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 28px 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.app-subtitle {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 500;
}

/* 主操作区 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.action-card {
  display: flex;
  align-items: center;
  border-radius: var(--radius-lg);
  padding: 18px 16px;
  transition: transform var(--transition-fast);
}

.action-press {
  opacity: 0.9;
  transform: scale(0.98);
}

/* Flat Design: 纯色背景，非渐变 */
.action-card.primary {
  background: #0D9488;
}

.action-card.danger {
  background: #DC2626;
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.primary-icon {
  background: rgba(255, 255, 255, 0.2);
}

.danger-icon {
  background: rgba(255, 255, 255, 0.2);
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.action-title {
  font-size: 17px;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.3;
}

.action-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

/* 快捷入口 */
.quick-section {
  margin-bottom: 24px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
  cursor: pointer;
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Flat Design: 浅色纯色背景 */
.quick-icon.blue {
  background: #F0FDFA;
  color: #0D9488;
}

.quick-icon.green {
  background: #ECFDF5;
  color: #22C55E;
}

.quick-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 空状态提示 */
.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  padding: 28px 24px;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0FDFA;
  border-radius: var(--radius-full);
  margin-bottom: 4px;
}

.empty-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-sub {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 340px;
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:active {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.modal-hint {
  font-size: 13px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 20px;
}

.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.preset-item {
  flex: 1;
  min-width: calc(33.33% - 8px);
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  padding: 14px 8px;
  text-align: center;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.preset-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.preset-item:active {
  transform: scale(0.96);
}

.preset-num {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.preset-item.active .preset-num {
  color: var(--color-primary);
}

.custom-input-wrap {
  margin-bottom: 16px;
}

.custom-input {
  width: 100%;
  height: 44px;
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0 14px;
  font-size: 15px;
  color: var(--text-primary);
  background: var(--bg-card);
  transition: border-color var(--transition-fast);
}

.custom-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border-radius: var(--radius-md);
  text-align: center;
  transition: transform var(--transition-fast);
  cursor: pointer;
}

.modal-btn:active {
  transform: scale(0.97);
}

.modal-btn.cancel {
  background: var(--bg-muted);
}

/* Flat Design: 纯色确认按钮 */
.modal-btn.confirm {
  background: #0D9488;
}

.modal-btn-text {
  font-size: 15px;
  font-weight: 600;
}

.modal-btn.cancel .modal-btn-text {
  color: var(--text-secondary);
}

.modal-btn.confirm .modal-btn-text {
  color: #FFFFFF;
}
</style>
