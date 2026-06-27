import * as XLSX from 'xlsx'

interface ParsedQuestion {
  type: string
  content: string
  options: string[]
  answer: string
  analysis?: string
  chapter?: string
  difficulty?: string
}

const normalizeType = (type: string): string => {
  if (!type) return 'single'
  const t = type.toLowerCase()
  if (t.includes('判断') || t.includes('对错')) return 'judge'
  if (t.includes('多选') || t.includes('复选') || t.includes('multiple') || t.includes('multi-choice') || t.includes('multi choice')) return 'multiple'
  return 'single'
}

const normalizeJudgeAnswer = (answer: string): string => {
  if (!answer) return ''
  const a = answer.trim()
  if (['对', '正确', '√', '✓', 'true'].includes(a)) return '对'
  if (['错', '错误', '×', '✗', 'false'].includes(a)) return '错'
  if (a === 'A') return '对'
  if (a === 'B') return '错'
  return a
}

const normalizeJudgeOption = (option: string): string => {
  if (['正确', '√', '✓'].includes(option)) return '对'
  if (['错误', '×', '✗'].includes(option)) return '错'
  return option
}

/**
 * 根据答案内容推断是否为多选题：
 * 含有2个以上有效字母选项（如 ABC、A,B,C、A、B、C）即判定为多选
 */
const isMultipleAnswer = (answer: string, optionsCount: number): boolean => {
  if (!answer || optionsCount < 3) return false
  // 统一分隔符后拆分
  const normalized = answer.replace(/[、，\s]+/g, ',')
  const parts = normalized.split(',').filter(Boolean)
  // 至少2个有效字母选项
  return parts.length >= 2 && parts.every(p => /^[A-Ha-h]$/.test(p.trim()))
}

/**
 * 统一答案分隔符：中文顿号、空格等统一转为英文逗号
 */
const normalizeAnswerSeparators = (answer: string): string => {
  if (!answer) return ''
  return answer.replace(/[、，\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '')
}

const isJudgeOptions = (options: string[]): boolean => {
  if (options.length !== 2) return false
  const normalized = options.map(o => o.trim().toLowerCase())
  const judgePairs = [
    ['对', '错'], ['正确', '错误'], ['√', '×'], ['是', '否'], ['true', 'false']
  ]
  return judgePairs.some(
    ([a, b]) =>
      (normalized.includes(a) && normalized.includes(b))
  )
}

const parseStandardFormat = (rows: any[][]): ParsedQuestion[] => {
  if (rows.length < 2) return []
  const headers = rows[0].map((h: any) => String(h || '').trim())

  const contentIdx = headers.findIndex(h => h.includes('题干'))
  const typeIdx = headers.findIndex(h => h.includes('题型'))
  const answerIdx = headers.findIndex(h => h.includes('正确答案'))
  const analysisIdx = headers.findIndex(h => h.includes('解析'))
  const chapterIdx = headers.findIndex(h => h.includes('章节'))
  const difficultyIdx = headers.findIndex(h => h.includes('难度'))

  const optionStart = headers.findIndex(h => h.includes('选项'))
  const optionsCount = headers.filter(h => h.includes('选项')).length

  const questions: ParsedQuestion[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row[contentIdx]) continue

    let type = normalizeType(row[typeIdx] || '')
    const rawOptions: string[] = []
    for (let j = 0; j < optionsCount; j++) {
      const val = row[optionStart + j]
      if (val !== undefined && val !== null && String(val).trim()) {
        rawOptions.push(String(val).trim())
      }
    }

    // Auto-detect judge questions by options
    if (type !== 'judge' && rawOptions.length > 0 && isJudgeOptions(rawOptions)) {
      type = 'judge'
    }

    // Auto-detect multi-select questions by answer format (fallback when type is wrong/empty)
    if (type === 'single' && isMultipleAnswer(row[answerIdx] || '', rawOptions.length)) {
      type = 'multiple'
    }

    let options: string[]
    let answer: string

    if (type === 'judge') {
      options = ['对', '错']
      answer = normalizeJudgeAnswer(row[answerIdx] || '')
    } else {
      options = rawOptions.map(normalizeJudgeOption)
      answer = normalizeAnswerSeparators((row[answerIdx] || '').trim())
    }

    questions.push({
      type,
      content: String(row[contentIdx]).trim(),
      options,
      answer,
      analysis: row[analysisIdx] ? String(row[analysisIdx]).trim() : undefined,
      chapter: row[chapterIdx] ? String(row[chapterIdx]).trim() : undefined,
      difficulty: row[difficultyIdx] ? String(row[difficultyIdx]).trim() : undefined
    })
  }
  return questions
}

const parseSimpleFormat = (rows: any[][]): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row[0]) continue
    const content = String(row[0]).trim()
    const answer = row[1] ? String(row[1]).trim() : ''
    if (!content || content.length < 2) continue
    if (['题干', '题目', '问题'].includes(content)) continue

    questions.push({
      type: 'judge',
      content,
      options: ['对', '错'],
      answer: ['对', '正确', '√'].includes(answer) ? '对' : '错'
    })
  }
  return questions
}

export const parseExcel = (data: ArrayBuffer): { name: string; questions: ParsedQuestion[] }[] => {
  const workbook = XLSX.read(data, { type: 'array' })
  const results: { name: string; questions: ParsedQuestion[] }[] = []

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

    if (rows.length < 2) return

    const headers = rows[0].map((h: any) => String(h || ''))
    const isStandard = headers.some(h => h.includes('题干')) && headers.some(h => h.includes('选项'))

    const questions = isStandard ? parseStandardFormat(rows) : parseSimpleFormat(rows)
    if (questions.length > 0) {
      results.push({ name: sheetName, questions })
    }
  })
  return results
}