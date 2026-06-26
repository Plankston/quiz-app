import Dexie from 'dexie'
import { shuffleArray } from './shuffle'

interface QuestionBank {
  id?: number
  name: string
  total: number
  createdAt: Date
}

interface Question {
  id?: number
  bankId: number
  type: string
  content: string
  options: string[]
  answer: string
  analysis?: string
  chapter?: string
  difficulty?: string
}

interface AnswerRecord {
  id?: number
  questionId: number
  userAnswer: string
  isCorrect: number
  createdAt: Date
}

interface WrongQuestion {
  id?: number
  questionId: number
  wrongCount: number
  lastWrongAt: Date
  isMastered: number
  bankName?: string
}

class QuizDatabase extends Dexie {
  banks!: Dexie.Table<QuestionBank, number>
  questions!: Dexie.Table<Question, number>
  records!: Dexie.Table<AnswerRecord, number>
  wrongs!: Dexie.Table<WrongQuestion, number>

  constructor() {
    super('QuizApp')
    this.version(1).stores({
      banks: '++id, name',
      questions: '++id, bankId, chapter, difficulty',
      records: '++id, questionId, createdAt',
      wrongs: '++id, questionId, isMastered'
    })
    this.version(2).stores({
      questions: '++id, bankId, chapter, difficulty, type',
      wrongs: '++id, questionId, isMastered, bankName'
    })
  }
}

const db = new QuizDatabase()

export const addBank = async (name: string, questions: Omit<Question, 'id' | 'bankId'>[]) => {
  try {
    const bankId = await db.banks.add({ name, total: questions.length, createdAt: new Date() })
    const batch = questions.map(q => ({ ...q, bankId: bankId as number }))
    await db.questions.bulkAdd(batch as Question[])
    return bankId
  } catch (error) {
    console.error('addBank failed:', error)
    uni.showToast({ title: '创建题库失败', icon: 'none' })
    throw error
  }
}

export const getBanks = async () => {
  try {
    return await db.banks.toArray()
  } catch (error) {
    console.error('getBanks failed:', error)
    return []
  }
}

export const getQuestionsByBank = async (bankId: number) => {
  try {
    return await db.questions.where('bankId').equals(bankId).toArray()
  } catch (error) {
    console.error('getQuestionsByBank failed:', error)
    return []
  }
}

export const getRandomQuestions = async (bankId: number, count: number) => {
  try {
    const questions = await db.questions.where('bankId').equals(bankId).toArray()
    return shuffleArray(questions).slice(0, count).map(q => ({ ...q, id: q.id }))
  } catch (error) {
    console.error('getRandomQuestions failed:', error)
    return []
  }
}

export const getAllRandomQuestions = async (count: number) => {
  try {
    const questions = await db.questions.toArray()
    return shuffleArray(questions).slice(0, count).map(q => ({ ...q, id: q.id }))
  } catch (error) {
    console.error('getAllRandomQuestions failed:', error)
    return []
  }
}

export const getQuestionsByIds = async (ids: number[]) => {
  try {
    const questions = await Promise.all(ids.map(id => db.questions.get(id)))
    return questions.filter(Boolean).map(q => ({ ...q!, id: q!.id }))
  } catch (error) {
    console.error('getQuestionsByIds failed:', error)
    return []
  }
}

// 按题型获取随机题目
export const getRandomQuestionsByType = async (type: string, count: number) => {
  try {
    const questions = await db.questions.where('type').equals(type).toArray()
    return shuffleArray(questions).slice(0, count).map(q => ({ ...q, id: q.id }))
  } catch (error) {
    console.error('getRandomQuestionsByType failed:', error)
    return []
  }
}

// 按题库和题型获取随机题目
export const getRandomQuestionsByBankAndType = async (bankId: number, type: string, count: number) => {
  try {
    const questions = await db.questions.where('bankId').equals(bankId).toArray()
    const filtered = questions.filter(q => q.type === type)
    return shuffleArray(filtered).slice(0, count).map(q => ({ ...q, id: q.id }))
  } catch (error) {
    console.error('getRandomQuestionsByBankAndType failed:', error)
    return []
  }
}

// 模拟考试出题：判断:单选:多选 = 2:5:3，共150题
export const getExamQuestions = async () => {
  try {
    const totalQuestions = 150
    const judgeCount = 30  // 2/10 * 150
    const singleCount = 75 // 5/10 * 150
    const multipleCount = 45 // 3/10 * 150

    const allQuestions = await db.questions.toArray()
    const judgeQuestions = allQuestions.filter(q => q.type === 'judge')
    const singleQuestions = allQuestions.filter(q => q.type === 'single')
    const multipleQuestions = allQuestions.filter(q => q.type === 'multiple')

    const selectedJudge = shuffleArray(judgeQuestions).slice(0, judgeCount).map(q => ({ ...q, id: q.id }))
    const selectedSingle = shuffleArray(singleQuestions).slice(0, singleCount).map(q => ({ ...q, id: q.id }))
    const selectedMultiple = shuffleArray(multipleQuestions).slice(0, multipleCount).map(q => ({ ...q, id: q.id }))

    return [...selectedJudge, ...selectedSingle, ...selectedMultiple]
  } catch (error) {
    console.error('getExamQuestions failed:', error)
    return []
  }
}

export const getTotalQuestionCount = async () => {
  try {
    return await db.questions.count()
  } catch (error) {
    console.error('getTotalQuestionCount failed:', error)
    return 0
  }
}

export const addRecord = async (questionId: number, userAnswer: string, isCorrect: boolean) => {
  try {
    return await db.records.add({ questionId, userAnswer, isCorrect: isCorrect ? 1 : 0, createdAt: new Date() }) as number
  } catch (error) {
    console.error('addRecord failed:', error)
    throw error
  }
}

export const addWrong = async (questionId: number, bankName?: string) => {
  try {
    if (!questionId) {
      console.error('addWrong: questionId is undefined')
      return
    }
    const existing = await db.wrongs.where('questionId').equals(questionId).first()
    if (existing) {
      await db.wrongs.update(existing.id!, {
        wrongCount: existing.wrongCount + 1,
        lastWrongAt: new Date()
      })
    } else {
      await db.wrongs.add({ questionId, wrongCount: 1, lastWrongAt: new Date(), isMastered: 0, bankName })
    }
  } catch (error) {
    console.error('addWrong failed:', error)
    throw error
  }
}

export const getWrongQuestions = async () => {
  try {
    return await db.wrongs.where('isMastered').equals(0).toArray()
  } catch (error) {
    console.error('getWrongQuestions failed:', error)
    return []
  }
}

// P2修复: 批量查询替代 N+1 逐条查询
export const getWrongWithDetails = async () => {
  try {
    const wrongs = await db.wrongs.where('isMastered').equals(0).toArray()
    if (wrongs.length === 0) return []

    const questionIds = wrongs.map(w => w.questionId)
    const questions = await db.questions.where('id').anyOf(questionIds).toArray()
    const questionMap = new Map(questions.map(q => [q.id, q]))

    return wrongs
      .map(w => ({ ...w, question: questionMap.get(w.questionId) }))
      .filter(d => d.question)
  } catch (error) {
    console.error('getWrongWithDetails failed:', error)
    return []
  }
}

export const masterWrong = async (id: number) => {
  try {
    return await db.wrongs.update(id, { isMastered: 1 })
  } catch (error) {
    console.error('masterWrong failed:', error)
    throw error
  }
}

export const masterWrongByQuestionId = async (questionId: number) => {
  try {
    const existing = await db.wrongs.where('questionId').equals(questionId).first()
    if (existing) {
      await db.wrongs.update(existing.id!, { isMastered: 1 })
    }
  } catch (error) {
    console.error('masterWrongByQuestionId failed:', error)
    throw error
  }
}

export const clearAllWrongs = async () => {
  try {
    return await db.wrongs.clear()
  } catch (error) {
    console.error('clearAllWrongs failed:', error)
    throw error
  }
}

export const getStats = async () => {
  try {
    const totalBanks = await db.banks.count()
    const totalQuestions = await db.questions.count()
    const totalRecords = await db.records.count()
    const correctRecords = await db.records.where('isCorrect').equals(1).count()
    const totalWrongs = await db.wrongs.where('isMastered').equals(0).count()

    return {
      totalBanks,
      totalQuestions,
      totalRecords,
      correctRate: totalRecords > 0 ? Math.round((correctRecords / totalRecords) * 100) : 0,
      totalWrongs
    }
  } catch (error) {
    console.error('getStats failed:', error)
    return { totalBanks: 0, totalQuestions: 0, totalRecords: 0, correctRate: 0, totalWrongs: 0 }
  }
}

export const getChapterStats = async (bankId: number) => {
  try {
    const questions = await db.questions.where('bankId').equals(bankId).toArray()
    const chapters = [...new Set(questions.map(q => q.chapter || '未分类'))]

    return Promise.all(
      chapters.map(async chapter => {
        const chapterQuestions = questions.filter(q => (q.chapter || '未分类') === chapter)
        const questionIds = chapterQuestions.map(q => q.id!)
        const records = await db.records.where('questionId').anyOf(questionIds).toArray()
        const correct = records.filter(r => r.isCorrect).length
        return {
          chapter,
          total: chapterQuestions.length,
          done: records.length,
          correctRate: records.length > 0 ? Math.round((correct / records.length) * 100) : 0
        }
      })
    )
  } catch (error) {
    console.error('getChapterStats failed:', error)
    return []
  }
}

export default db
