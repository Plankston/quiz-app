/** 题库 */
export interface QuestionBank {
  id?: number
  name: string
  total: number
  createdAt: Date
}

/** 题目 */
export interface Question {
  id?: number
  bankId: number
  type: 'single' | 'multiple' | 'judge'
  content: string
  options: string[]
  answer: string
  analysis?: string
  chapter?: string
  difficulty?: string
}

/** 答题记录 */
export interface AnswerRecord {
  id?: number
  questionId: number
  userAnswer: string
  isCorrect: number
  createdAt: Date
}

/** 错题 */
export interface WrongQuestion {
  id?: number
  questionId: number
  wrongCount: number
  lastWrongAt: Date
  isMastered: number
  bankName?: string
}

/** 错题详情（含题目信息） */
export interface WrongQuestionDetail extends WrongQuestion {
  question: Question
}

/** 练习结果 */
export interface PracticeResult {
  questionId: number
  isCorrect: boolean
}

/** 统计数据 */
export interface AppStats {
  totalBanks: number
  totalQuestions: number
  totalRecords: number
  correctRate: number
  totalWrongs: number
}

/** 章节统计 */
export interface ChapterStat {
  chapter: string
  total: number
  done: number
  correctRate: number
}

/** 练习参数 */
export interface PracticeParams {
  bankId?: number
  bankName?: string
  count?: number
  ids?: number[]
  type?: 'exam' | 'special'
  typeValue?: string
}
