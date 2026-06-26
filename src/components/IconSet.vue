<!--
  IconSet.vue — 集中式图标组件
  21 个 Feather/Lucide 风格图标，替代 40 个内联 SVG
  
  用法: <IconSet name="play" :size="22" />
  颜色: 默认 currentColor，可通过 color 属性覆盖
  线宽: 默认 2，可通过 stroke-width 属性覆盖
-->
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="icon-set"
  >
    <!-- play: 播放 -->
    <g v-if="name === 'play'">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </g>

    <!-- chevron_right: 右箭头 -->
    <g v-else-if="name === 'chevron_right'">
      <polyline points="9 18 15 12 9 6"></polyline>
    </g>

    <!-- x_circle: 带圈叉 -->
    <g v-else-if="name === 'x_circle'">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </g>

    <!-- trash: 垃圾桶 -->
    <g v-else-if="name === 'trash'">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </g>

    <!-- book: 书本 -->
    <g v-else-if="name === 'book'">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </g>

    <!-- bar_chart: 柱状图 -->
    <g v-else-if="name === 'bar_chart'">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </g>

    <!-- info_circle: 信息圈 -->
    <g v-else-if="name === 'info_circle'">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </g>

    <!-- x: 关闭叉 -->
    <g v-else-if="name === 'x'">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </g>

    <!-- file_text: 文件 -->
    <g v-else-if="name === 'file_text'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </g>

    <!-- star: 星星 -->
    <g v-else-if="name === 'star'">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </g>

    <!-- list: 列表 -->
    <g v-else-if="name === 'list'">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </g>

    <!-- check: 勾选 -->
    <g v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12"></polyline>
    </g>

    <!-- clock: 时钟 -->
    <g v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </g>

    <!-- check_circle: 带圈勾 -->
    <g v-else-if="name === 'check_circle'">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </g>

    <!-- rotate_ccw: 逆时针旋转 -->
    <g v-else-if="name === 'rotate_ccw'">
      <polyline points="1 4 1 10 7 10"></polyline>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
    </g>

    <!-- arrow_left: 左箭头 -->
    <g v-else-if="name === 'arrow_left'">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </g>

    <!-- rotate_cw: 顺时针旋转 -->
    <g v-else-if="name === 'rotate_cw'">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </g>

    <!-- help_circle: 帮助圈 -->
    <g v-else-if="name === 'help_circle'">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </g>

    <!-- clipboard_check: 剪贴板勾选 -->
    <g v-else-if="name === 'clipboard_check'">
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </g>

    <!-- bar_chart_styled: 样式化柱状图 -->
    <g v-else-if="name === 'bar_chart_styled'">
      <path d="M18 20V10"></path>
      <path d="M12 20V4"></path>
      <path d="M6 20v-6"></path>
    </g>

    <!-- plus: 加号 -->
    <g v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </g>

    <!-- 未知图标 fallback -->
    <g v-else>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  name: string
  size?: number | string
  color?: string
  strokeWidth?: number | string
}>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2
})
</script>

<style scoped>
.icon-set {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
