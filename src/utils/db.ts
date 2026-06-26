import Dexie from 'dexie'

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
  const bankId = await db.banks.add({ name, total: questions.length, createdAt: new Date() })
  const batch = questions.map(q => ({ ...q, bankId: bankId as number }))
  await db.questions.bulkAdd(batch as Question[])
  return bankId
}

export const getBanks = () => db.banks.toArray()
export const getQuestionsByBank = (bankId: number) => db.questions.where('bankId').equals(bankId).toArray()

export const getRandomQuestions = async (bankId: number, count: number) => {
  const questions = await db.questions.where('bankId').equals(bankId).toArray()
  const shuffled = questions.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(q => ({ ...q, id: q.id }))
}

export const getAllRandomQuestions = async (count: number) => {
  const questions = await db.questions.toArray()
  const shuffled = questions.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(q => ({ ...q, id: q.id }))
}

export const getQuestionsByIds = async (ids: number[]) => {
  const questions = await Promise.all(ids.map(id => db.questions.get(id)))
  return questions.filter(Boolean).map(q => ({ ...q!, id: q!.id }))
}

// 按题型获取随机题目
export const getRandomQuestionsByType = async (type: string, count: number) => {
  const questions = await db.questions.where('type').equals(type).toArray()
  const shuffled = questions.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(q => ({ ...q, id: q.id }))
}

// 按题库和题型获取随机题目
export const getRandomQuestionsByBankAndType = async (bankId: number, type: string, count: number) => {
  const questions = await db.questions.where('bankId').equals(bankId).toArray()
  const filtered = questions.filter(q => q.type === type)
  const shuffled = filtered.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(q => ({ ...q, id: q.id }))
}

// 模拟考试出题：判断:单选:多选 = 2:5:3，共150题
export const getExamQuestions = async () => {
  const totalQuestions = 150
  const judgeCount = 30  // 2/10 * 150
  const singleCount = 75 // 5/10 * 150
  const multipleCount = 45 // 3/10 * 150

  const allQuestions = await db.questions.toArray()
  const judgeQuestions = allQuestions.filter(q => q.type === 'judge')
  const singleQuestions = allQuestions.filter(q => q.type === 'single')
  const multipleQuestions = allQuestions.filter(q => q.type === 'multiple')

  const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5)

  const selectedJudge = shuffle(judgeQuestions).slice(0, judgeCount).map(q => ({ ...q, id: q.id }))
  const selectedSingle = shuffle(singleQuestions).slice(0, singleCount).map(q => ({ ...q, id: q.id }))
  const selectedMultiple = shuffle(multipleQuestions).slice(0, multipleCount).map(q => ({ ...q, id: q.id }))

  return [...selectedJudge, ...selectedSingle, ...selectedMultiple]
}

export const getTotalQuestionCount = () => db.questions.count()

export const addRecord = (questionId: number, userAnswer: string, isCorrect: boolean) =>
  db.records.add({ questionId, userAnswer, isCorrect: isCorrect ? 1 : 0, createdAt: new Date() }) as Promise<number>

export const addWrong = async (questionId: number, bankName?: string) => {
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
}

export const getWrongQuestions = () => db.wrongs.where('isMastered').equals(0).toArray()

export const getWrongWithDetails = async () => {
  const wrongs = await db.wrongs.where('isMastered').equals(0).toArray()
  const details = await Promise.all(
    wrongs.map(async w => ({
      ...w,
      question: await db.questions.get(w.questionId)
    }))
  )
  return details.filter(d => d.question)
}

export const masterWrong = (id: number) => db.wrongs.update(id, { isMastered: 1 })

export const masterWrongByQuestionId = async (questionId: number) => {
  const existing = await db.wrongs.where('questionId').equals(questionId).first()
  if (existing) {
    await db.wrongs.update(existing.id!, { isMastered: 1 })
  }
}

export const clearAllWrongs = () => db.wrongs.clear()

export const getStats = async () => {
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
}

export const getChapterStats = async (bankId: number) => {
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
}

export default db