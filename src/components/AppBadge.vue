<template>
  <view class="app-badge" :class="[size, { dot }]" :style="{ backgroundColor: color }">
    <text v-if="!dot && showContent" class="badge-text">{{ displayValue }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  content?: string | number
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  color?: string
  max?: number
}>()

const showContent = computed(() => !props.dot && props.content !== undefined && props.content !== '')
const displayValue = computed(() => {
  if (props.max && typeof props.content === 'number' && props.content > props.max) {
    return props.content + '+'
  }
  return props.content
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: #FFFFFF;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.badge-text {
  line-height: 1;
  white-space: nowrap;
}

.size-sm {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
}

.size-md {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
}

.size-lg {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  min-width: unset;
  padding: 0;
  border-radius: var(--radius-full);
}
</style>
