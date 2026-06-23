import { getQuestionsByBank, getWrongQuestions, getWrongWithDetails } from './db'

export const getRandomQuestions = async (bankId: number, count: number) => {
  const questions = await getQuestionsByBank(bankId)
  const shuffled = questions.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const getMixedQuestions = async (bankId: number, count: number) => {
  const wrongs = await getWrongWithDetails()
  const wrongIds = new Set(wrongs.filter(w => w.question && w.question.bankId === bankId).map(w => w.questionId))

  const questions = await getQuestionsByBank(bankId)
  const wrongPart = questions.filter(q => wrongIds.has(q.id!))
  const newPart = questions.filter(q => !wrongIds.has(q.id!))

  const shuffledWrong = wrongPart.sort(() => Math.random() - 0.5)
  const shuffledNew = newPart.sort(() => Math.random() - 0.5)

  const result = [...shuffledWrong]
  const remaining = count - result.length
  if (remaining > 0) {
    result.push(...shuffledNew.slice(0, remaining))
  }

  return result.sort(() => Math.random() - 0.5)
}

export const shuffleArray = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5)
}