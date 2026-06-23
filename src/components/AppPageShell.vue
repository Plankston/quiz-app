<template>
  <view class="app-page-shell" :style="{ paddingTop: (statusBarHeight + 8) + 'px' }">
    <!-- 占位空间 -->
    <view :style="{ height: statusBarHeight + 8 + 'px' }"></view>
    
    <!-- 页面内容 -->
    <view class="page-content">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
const statusBarHeight = ref(0)

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
})
</script>

<style scoped>
.app-page-shell {
  min-height: 100vh;
  background: var(--bg-primary);
}

.page-content {
  padding: 16px;
  padding-bottom: calc(80px + var(--safe-area-bottom));
}
</style>
