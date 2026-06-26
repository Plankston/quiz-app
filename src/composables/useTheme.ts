/**
 * 深色模式管理
 * CSS 变量 + localStorage 持久化
 */
import { ref, watch } from 'vue'

const STORAGE_KEY = 'quizapp-theme'

type Theme = 'light' | 'dark'

const theme = ref<Theme>((typeof localStorage !== 'undefined' 
  ? localStorage.getItem(STORAGE_KEY) as Theme 
  : null) || 'light')

function applyTheme(t: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(STORAGE_KEY, t)
  }
}

// 初始化
applyTheme(theme.value)

// 监听变化
watch(theme, applyTheme)

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const isDark = () => theme.value === 'dark'

  return { theme, toggleTheme, isDark }
}
