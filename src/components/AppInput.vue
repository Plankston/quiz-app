<template>
  <view class="app-input-wrap">
    <text v-if="label" class="app-input-label">{{ label }}</text>
    <view class="app-input-container" :class="{ focused, error }">
      <slot name="prefix"></slot>
      <input
        class="app-input-field"
        :placeholder="placeholder"
        :value="modelValue"
        :type="inputType"
        :placeholder-style="'color: ' + placeholderColor"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <slot name="suffix">
        <view v-if="modelValue" class="app-input-clear" @tap="clearValue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </view>
      </slot>
    </view>
    <text v-if="error" class="app-input-error">{{ error }}</text>
    <text v-else-if="hint" class="app-input-hint">{{ hint }}</text>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string]
  focus: []
  blur: []
}>()

const inputType = computed(() => props.type || 'text')
const focused = ref(false)
const placeholderColor = '#94A3B8'

const handleInput = (e: any) => {
  emit('update:modelValue', e.detail.value)
}

const handleFocus = () => {
  focused.value = true
  emit('focus')
}

const handleBlur = () => {
  focused.value = false
  emit('blur')
}

const clearValue = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.app-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.app-input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.app-input-container {
  display: flex;
  align-items: center;
  padding: 0 14px;
  height: 44px;
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  background: #FFFFFF;
  transition: all var(--transition-fast);
}

.app-input-container.focused {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.app-input-container.error {
  border-color: var(--color-danger);
}

.app-input-field {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
}

.app-input-clear {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.app-input-clear:active {
  color: var(--text-primary);
}

.app-input-error {
  font-size: 12px;
  color: var(--color-danger);
}

.app-input-hint {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
