<template>
  <view class="page-bank">
    <!-- 头部 -->
    <view class="bank-header">
      <view class="header-main">
        <text class="title">题库管理</text>
        <view class="import-btn" @tap="importExcel" hover-class="action-press">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <text>导入</text>
        </view>
      </view>
    </view>

    <!-- 题库列表 -->
    <view class="bank-list" v-if="banks.length > 0">
      <view class="bank-card" v-for="bank in banks" :key="bank.id" @tap="startPractice(bank)">
        <view class="bank-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </view>
        <view class="bank-info">
          <text class="bank-name">{{ bank.name }}</text>
          <text class="bank-count">{{ bank.total }} 题</text>
        </view>
        <view class="bank-actions" @tap.stop>
          <view class="delete-btn" @tap="deleteBank(bank.id!)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <AppEmpty
      v-else
      title="暂无题库"
      desc="点击右上角导入按钮添加Excel文件"
      :padding="80"
    >
      <template #icon>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </template>
    </AppEmpty>

    <!-- 格式提示 -->
    <view class="tips" v-if="banks.length > 0">
      <view class="tips-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <text>支持的Excel格式</text>
      </view>
      <view class="tips-content">
        <text class="tips-item">标准格式：题干、题型、选项A-H、正确答案、解析、章节、难度</text>
        <text class="tips-item">简单格式：题干、对/错（判断题）</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBanks, addBank } from '@/utils/db'
import db from '@/utils/db'
import { parseExcel } from '@/utils/parser'
import AppEmpty from '@/components/AppEmpty.vue'

interface Bank {
  id?: number
  name: string
  total: number
  createdAt: Date
}

const banks = ref<Bank[]>([])

onMounted(async () => {
  await loadBanks()
})

const loadBanks = async () => {
  banks.value = await getBanks()
}

const importExcel = async () => {
  // #ifdef H5
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const buffer = await file.arrayBuffer()
    await processExcel(buffer, file.name)
  }
  input.click()
  // #endif

  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['.xlsx', '.xls'],
    success: async (res) => {
      const file = res.tempFiles[0]
      const buffer = await readFilePath(file.path)
      await processExcel(buffer, file.name)
    }
  })
  // #endif
}

const readFilePath = (path: string): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const fs = uni.getFileSystemManager()
    fs.readFile({
      filePath: path,
      success: (res: any) => resolve(res.data),
      fail: reject
    })
  })
}

const processExcel = async (buffer: ArrayBuffer, fileName: string) => {
  uni.showLoading({ title: '解析中...' })
  try {
    const results = parseExcel(buffer)
    let totalAdded = 0
    for (const sheet of results) {
      const bankName = results.length === 1 ? fileName.replace(/\.[^.]+$/, '') : sheet.name
      await addBank(bankName, sheet.questions)
      totalAdded += sheet.questions.length
    }
    await loadBanks()
    uni.showToast({ title: `导入${totalAdded}题`, icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '导入失败', icon: 'error' })
  } finally {
    uni.hideLoading()
  }
}

const startPractice = (bank: Bank) => {
  uni.navigateTo({ url: `/pages/practice/practice?bankId=${bank.id}&name=${bank.name}` })
}

const deleteBank = async (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后不可恢复，确定删除？',
    success: async (res) => {
      if (res.confirm) {
        await db.banks.delete(id)
        await db.questions.where('bankId').equals(id).delete()
        await loadBanks()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.page-bank {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 16px;
  padding-bottom: 100px;
}

/* 头部 */
.bank-header {
  margin-bottom: 20px;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Flat Design: 纯色导入按钮 */
.import-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0D9488;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  transition: transform var(--transition-fast);
  cursor: pointer;
}

.action-press {
  transform: scale(0.97);
}

/* 题库列表 */
.bank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.bank-card {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
  cursor: pointer;
}

.bank-card:active {
  transform: scale(0.98);
}

/* Flat Design: 纯色图标背景 */
.bank-icon {
  width: 44px;
  height: 44px;
  background: #0D9488;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  margin-right: 14px;
  flex-shrink: 0;
}

.bank-info {
  flex: 1;
  min-width: 0;
}

.bank-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bank-count {
  font-size: 13px;
  color: var(--text-muted);
}

.bank-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.delete-btn:active {
  background: #FEE2E2;
  color: #DC2626;
}

/* 格式提示 */
.tips {
  padding: 16px;
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
  border: 1px solid #CCFBF1;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tips-item {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
