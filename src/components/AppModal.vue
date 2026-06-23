<template>
  <view v-if="visible" class="app-modal-mask" @tap="handleClose" :style="{ zIndex }">
    <view class="app-modal-content" :style="{ maxWidth: width + 'px' }" @tap.stop>
      <!-- Header -->
      <view v-if="title || $slots.header" class="app-modal-header">
        <slot name="header">
          <text class="app-modal-title">{{ title }}</text>
        </slot>
        <view v-if="closable" class="app-modal-close" @tap="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </view>
      </view>

      <!-- Body -->
      <view class="app-modal-body">
        <slot></slot>
      </view>

      <!-- Footer -->
      <view v-if="$slots.footer || actions.length > 0" class="app-modal-footer">
        <slot name="footer">
          <view v-for="(action, i) in actions" :key="i" class="app-modal-action" :class="action.type" @tap="handleAction(action)">
            <text>{{ action.label }}</text>
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  width?: number
  closable?: boolean
  zIndex?: number
  actions?: Array<{ label: string; type?: 'primary' | 'secondary'; handler?: () => void }>
}>(), {
  title: '',
  width: 340,
  closable: true,
  zIndex: 1000,
  actions: () => []
})

const emit = defineEmits<{
  close: []
  action: [action: any]
}>()

const handleClose = () => {
  emit('close')
}

const handleAction = (action: any) => {
  if (action.handler) action.handler()
  emit('action', action)
}
</script>

<style scoped>
.app-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: v-bind('zIndex');
}

.app-modal-content {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: modalIn 0.2s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.app-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
}

.app-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.app-modal-close {
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

.app-modal-close:active {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.app-modal-body {
  padding: 12px 24px 20px;
}

.app-modal-footer {
  display: flex;
  border-top: 1px solid var(--border-light);
}

.app-modal-action {
  flex: 1;
  padding: 14px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.app-modal-action:active {
  background: var(--bg-muted);
}

.app-modal-action.secondary {
  color: var(--text-muted);
}

.app-modal-action.primary {
  color: var(--color-primary);
}
</style>
