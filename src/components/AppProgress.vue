<template>
  <view class="app-progress" :style="{ height: barHeight + 'px' }">
    <view class="app-progress-fill" :style="{ width: percent + '%', background: trackColor }"></view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  percent: number
  color?: string
  barHeight?: number
}>()

/* Flat Design: 纯色进度条，非渐变 */
const trackColor = computed(() => props.color || '#0D9488')
</script>

<style scoped>
.app-progress {
  width: 100%;
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.app-progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease-out;
}
</style>
