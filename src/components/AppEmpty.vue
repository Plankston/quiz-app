<template>
  <view class="app-empty" :style="{ padding: padding + 'px' }">
    <view class="app-empty-icon">
      <slot name="icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </slot>
    </view>
    <text class="app-empty-title">{{ title }}</text>
    <text class="app-empty-desc" v-if="desc">{{ desc }}</text>
    <slot name="action"></slot>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
  padding?: number
}>()
</script>

<style scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.app-empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  margin-bottom: 16px;
}

.app-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.app-empty-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
