<template>
  <view class="app-card" :class="{ clickable, hoverable }" @tap="handleTap">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  clickable?: boolean
  hoverable?: boolean
}>()

const emit = defineEmits<{
  tap: [e: any]
}>()

const handleTap = (e: any) => {
  emit('tap', e)
}
</script>

<style scoped>
.app-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-normal);
}

.app-card.clickable {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.app-card.clickable:active {
  transform: scale(0.98);
}

.app-card.hoverable {
  box-shadow: var(--shadow-md);
}

.app-card.hoverable:active {
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}
</style>
