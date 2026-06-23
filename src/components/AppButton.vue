<template>
  <view
    class="app-button"
    :class="[variantClass, sizeClass, { disabled: disabled }]"
    @tap="handleTap"
  >
    <slot name="icon-left">
      <svg v-if="iconLeft" class="btn-icon" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <slot name="icon-left-svg"></slot>
      </svg>
    </slot>
    <text class="btn-text" :style="{ fontSize: textSize + 'px' }">{{ text }}</text>
    <slot name="icon-right">
      <svg v-if="iconRight" class="btn-icon" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <slot name="icon-right-svg"></slot>
      </svg>
    </slot>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  iconLeft?: boolean
  iconRight?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  iconLeft: false,
  iconRight: false
})

const emit = defineEmits<{
  tap: [e: any]
}>()

const variantClassMap: Record<string, string> = {
  primary: 'variant-primary',
  secondary: 'variant-secondary',
  outline: 'variant-outline',
  ghost: 'variant-ghost',
  danger: 'variant-danger'
}

const sizeClassMap: Record<string, string> = {
  sm: 'size-sm',
  md: 'size-md',
  lg: 'size-lg'
}

const variantClass = computed(() => variantClassMap[props.variant])
const sizeClass = computed(() => sizeClassMap[props.size])

const iconSize = computed(() => props.size === 'sm' ? 14 : props.size === 'lg' ? 20 : 16)
const textSize = computed(() => props.size === 'sm' ? 13 : props.size === 'lg' ? 16 : 14)

const handleTap = (e: any) => {
  if (!props.disabled) {
    emit('tap', e)
  }
}
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.app-button:active:not(.disabled) {
  transform: scale(0.97);
}

.app-button.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.btn-icon {
  flex-shrink: 0;
}

.btn-text {
  line-height: 1.4;
}

/* Flat Design: 纯色按钮，非渐变 */
.variant-primary {
  background: #0D9488;
  color: var(--text-inverse);
}

.variant-secondary {
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.variant-outline {
  background: transparent;
  border: 1.5px solid var(--border-light);
  color: var(--text-secondary);
}

.variant-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.variant-danger {
  background: #DC2626;
  color: var(--text-inverse);
}

/* Sizes */
.size-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.size-md {
  padding: 10px 20px;
  font-size: 14px;
}

.size-lg {
  padding: 14px 28px;
  font-size: 16px;
}
</style>
