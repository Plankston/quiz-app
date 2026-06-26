export const APP_CONFIG = {
  // 练习配置
  practice: {
    autoNextDelay: 3,                    // 自动下一题延迟（秒）
    presetCounts: [10, 20, 30, 50, 100], // 预设题数
    defaultCount: 20,                    // 默认题数
    maxCustomCount: 500,                 // 自定义最大题数
  },

  // 考试配置
  exam: {
    totalQuestions: 150,                  // 总题数
    distribution: {                      // 题型比例
      judge: 0.2,                        // 判断 20%
      single: 0.5,                       // 单选 50%
      multiple: 0.3,                     // 多选 30%
    },
    minQuestionsPerType: {               // 每种题型最少题数
      judge: 30,
      single: 75,
      multiple: 45,
    }
  },

  // 题型映射
  questionTypes: {
    single: '单选',
    multiple: '多选',
    judge: '判断',
  } as Record<string, string>,

  // 路由配置
  routes: {
    home: '/pages/index/index',
    bank: '/pages/bank/bank',
    wrong: '/pages/wrong/wrong',
    stats: '/pages/stats/stats',
    practice: '/pages/practice/practice',
  } as const,

  // 数据库配置
  db: {
    name: 'QuizApp',
    currentVersion: 2,
  }
} as const
