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
      <view class="action-card primary" @tap="openModal" hover-class="action-press">
        <view class="action-icon primary-icon">
          <IconSet name="play" :size="22" color="#fff" />
        </view>
        <view class="action-info">
          <text class="action-title">开始答题</text>
          <text class="action-desc">从所有题库中随机出题</text>
        </view>
        <IconSet name="chevron_right" :size="16" color="rgba(255,255,255,0.5)" :stroke-width="2.5" />
      </view>

      <view class="action-card danger" @tap="goToWrong" hover-class="action-press">
        <view class="action-icon danger-icon">
          <IconSet name="x_circle" :size="22" color="#fff" />
        </view>
        <view class="action-info">
          <text class="action-title">错题重考</text>
          <text class="action-desc">{{ totalWrongs }}道错题待复习</text>
        </view>
        <view v-if="totalWrongs > 0" class="clear-wrongs-btn" @tap.stop="clearWrongs">
          <IconSet name="trash" :size="14" />
        </view>
        <IconSet name="chevron_right" :size="16" color="rgba(255,255,255,0.5)" :stroke-width="2.5" />
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-section">
      <text class="section-label">快捷入口</text>
      <view class="quick-grid">
        <view class="quick-item" @tap="goToTab('/pages/bank/bank')" hover-class="action-press">
          <view class="quick-icon blue">
            <IconSet name="book" :size="20" />
          </view>
          <text class="quick-label">题库管理</text>
        </view>
      </view>
    </view>

    <!-- 空状态提示 -->
    <view class="empty-hint" v-if="totalQuestions === 0">
      <view class="empty-icon">
        <IconSet name="info_circle" :size="24" color="#0D9488" :stroke-width="1.5" />
      </view>
      <text class="empty-text">还没有导入题库</text>
      <text class="empty-sub">点击底部「题库」标签导入Excel文件开始刷题</text>
    </view>

    <!-- 刷题方式选择弹窗 -->
    <view class="modal-mask" v-if="showCountModal" @tap="showCountModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ practiceMode ? (practiceMode === 'exam' ? '模拟考试' : '专项训练') : '选择刷题方式' }}</text>
          <view class="modal-close" @tap="showCountModal = false">
            <IconSet name="x" :size="18" />
          </view>
        </view>
        <text class="modal-hint" v-if="!practiceMode">共 {{ totalQuestions }} 题可用</text>

        <!-- 第一步：选择刷题方式 -->
        <view v-if="!practiceMode" class="mode-selection">
          <view class="mode-card exam" @tap="practiceMode = 'exam'">
            <view class="mode-icon exam-icon">
              <IconSet name="file_text" :size="24" />
            </view>
            <view class="mode-info">
              <text class="mode-title">模拟考试</text>
              <text class="mode-desc">固定150题，按判断:单选:多选=2:5:3出题</text>
            </view>
            <IconSet name="chevron_right" :size="16" color="#94A3B8" />
          </view>

          <view class="mode-card special" @tap="practiceMode = 'special'">
            <view class="mode-icon special-icon">
              <IconSet name="star" :size="24" />
            </view>
            <view class="mode-info">
              <text class="mode-title">专项训练</text>
              <text class="mode-desc">按题型或科目针对性练习</text>
            </view>
            <IconSet name="chevron_right" :size="16" color="#94A3B8" />
          </view>
        </view>

        <!-- 第二步：专项训练 - 选择专项类型 -->
        <view v-if="practiceMode === 'special' && !specialType" class="special-type-selection">
          <view class="special-type-card" @tap="specialType = 'type'">
            <view class="special-type-icon">
              <IconSet name="list" :size="20" />
            </view>
            <text class="special-type-title">题型专项</text>
            <text class="special-type-desc">单选/多选/判断</text>
          </view>

          <view class="special-type-card" @tap="specialType = 'bank'">
            <view class="special-type-icon">
              <IconSet name="book" :size="20" />
            </view>
            <text class="special-type-title">科目专项</text>
            <text class="special-type-desc">按题库分类</text>
          </view>
        </view>

        <!-- 第三步：选择题型 -->
        <view v-if="practiceMode === 'special' && specialType === 'type'" class="type-selection">
          <view 
            class="type-option" 
            :class="{ active: selectedType === 'single' }"
            @tap="selectedType = 'single'"
          >
            <text class="type-label">单选</text>
          </view>
          <view 
            class="type-option" 
            :class="{ active: selectedType === 'multiple' }"
            @tap="selectedType = 'multiple'"
          >
            <text class="type-label">多选</text>
          </view>
          <view 
            class="type-option" 
            :class="{ active: selectedType === 'judge' }"
            @tap="selectedType = 'judge'"
          >
            <text class="type-label">判断</text>
          </view>
        </view>

        <!-- 第三步：选择题库 -->
        <view v-if="practiceMode === 'special' && specialType === 'bank'" class="bank-selection">
          <view 
            v-for="bank in banks" 
            :key="bank.id"
            class="bank-option" 
            :class="{ active: selectedBankId === bank.id }"
            @tap="selectedBankId = bank.id"
          >
            <text class="bank-name">{{ bank.name }}</text>
            <text class="bank-count">{{ bank.total }}题</text>
          </view>
          <view v-if="banks.length === 0" class="empty-banks">
            <text class="empty-text">暂无题库，请先导入</text>
          </view>
        </view>

        <!-- 第四步：选择题数 -->
        <view v-if="(practiceMode === 'special' && specialType && ((specialType === 'type' && selectedType) || (specialType === 'bank' && selectedBankId)))" class="count-selection">
          <text class="count-hint">选择题目数量</text>
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
        </view>

        <view class="modal-actions">
          <view class="modal-btn cancel" @tap="practiceMode ? resetModal() : showCountModal = false">
            <text class="modal-btn-text">{{ practiceMode ? '返回' : '取消' }}</text>
          </view>
          <view 
            class="modal-btn confirm" 
            :class="{ disabled: !canStartPractice }"
            @tap="canStartPractice && startPractice()"
          >
            <text class="modal-btn-text">{{ practiceMode === 'exam' ? '开始考试' : '开始练习' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import IconSet from '@/components/IconSet.vue'
import { getTotalQuestionCount, getWrongQuestions, clearAllWrongs, getBanks, getExamQuestions, getRandomQuestionsByType, getRandomQuestionsByBankAndType } from '@/utils/db'

const statusBarHeight = ref(0)
const totalQuestions = ref(0)
const totalWrongs = ref(0)

const showCountModal = ref(false)
const practiceMode = ref<'exam' | 'special' | ''>('') // 考试模式、专项模式
const specialType = ref<'type' | 'bank' | ''>('') // 题型专项、科目专项
const selectedType = ref('') // 选择的题型
const selectedBankId = ref(0) // 选择的题库ID
const banks = ref<any[]>([])

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
  banks.value = await getBanks()
}

const clearWrongs = async () => {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有错题记录吗？',
    success: async (res) => {
      if (res.confirm) {
        await clearAllWrongs()
        await loadData()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}

const selectPreset = (n: number) => {
  isCustomInput.value = false
  selectedCount.value = n
}

const resetModal = () => {
  practiceMode.value = ''
  specialType.value = ''
  selectedType.value = ''
  selectedBankId.value = 0
  selectedCount.value = 20
  isCustomInput.value = false
  customCount.value = ''
}

const openModal = () => {
  resetModal()
  showCountModal.value = true
}

const onCustomInput = (e: any) => {
  customCount.value = e.detail.value
  selectedCount.value = Number(e.detail.value) || 0
}

const canStartPractice = computed(() => {
  if (practiceMode.value === 'exam') {
    return true
  }
  if (practiceMode.value === 'special') {
    if (specialType.value === 'type') {
      return selectedType.value && selectedCount.value > 0
    }
    if (specialType.value === 'bank') {
      return selectedBankId.value && selectedCount.value > 0
    }
  }
  return false
})

const startPractice = async () => {
  if (totalQuestions.value === 0) {
    uni.showToast({ title: '请先导入题库', icon: 'none' })
    return
  }

  if (practiceMode.value === 'exam') {
    // 模拟考试模式
    showCountModal.value = false
    uni.navigateTo({
      url: `/pages/practice/practice?bankId=0&name=模拟考试&count=150&type=exam`
    })
  } else if (practiceMode.value === 'special') {
    // 专项训练模式
    if (specialType.value === 'type') {
      // 题型专项
      if (!selectedType.value) {
        uni.showToast({ title: '请选择题型', icon: 'none' })
        return
      }
      const count = isCustomInput.value ? Number(customCount.value) : selectedCount.value
      if (!count || count <= 0) {
        uni.showToast({ title: '请输入有效题数', icon: 'none' })
        return
      }
      showCountModal.value = false
      const typeName = selectedType.value === 'single' ? '单选' : selectedType.value === 'multiple' ? '多选' : '判断'
      uni.navigateTo({
        url: `/pages/practice/practice?bankId=0&name=${typeName}专项&count=${count}&type=special&typeValue=${selectedType.value}`
      })
    } else if (specialType.value === 'bank') {
      // 科目专项
      if (!selectedBankId.value) {
        uni.showToast({ title: '请选择题库', icon: 'none' })
        return
      }
      const count = isCustomInput.value ? Number(customCount.value) : selectedCount.value
      if (!count || count <= 0) {
        uni.showToast({ title: '请输入有效题数', icon: 'none' })
        return
      }
      const bank = banks.value.find(b => b.id === selectedBankId.value)
      showCountModal.value = false
      uni.navigateTo({
        url: `/pages/practice/practice?bankId=${selectedBankId.value}&name=${bank?.name || '题库'}专项&count=${count}&type=special`
      })
    }
  }
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

.clear-wrongs-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  margin-left: auto;
  transition: all var(--transition-fast);
}

.clear-wrongs-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.9);
}

/* 刷题方式选择 */
.mode-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.mode-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.mode-card:active {
  transform: scale(0.98);
}

.mode-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.exam-icon {
  background: #DBEAFE;
  color: #2563EB;
}

.special-icon {
  background: #FEF3C7;
  color: #D97706;
}

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mode-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* 专项类型选择 */
.special-type-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.special-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.special-type-card:active {
  transform: scale(0.96);
}

.special-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.special-type-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.special-type-desc {
  font-size: 11px;
  color: var(--text-muted);
}

/* 题型选择 */
.type-selection {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.type-option {
  flex: 1;
  padding: 14px 8px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  text-align: center;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.type-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.type-option:active {
  transform: scale(0.96);
}

.type-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.type-option.active .type-label {
  color: var(--color-primary);
}

/* 题库选择 */
.bank-selection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.bank-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.bank-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.bank-option:active {
  transform: scale(0.98);
}

.bank-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.bank-count {
  font-size: 13px;
  color: var(--text-muted);
}

.empty-banks {
  padding: 30px;
  text-align: center;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

/* 题数选择 */
.count-selection {
  margin-bottom: 20px;
}

.count-hint {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 12px;
}

/* 禁用按钮 */
.modal-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-btn.disabled:active {
  transform: none;
}
</style>