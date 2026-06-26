/** 类型化错误 - 三层错误处理的基础 */
export class QuizError extends Error {
  constructor(
    message: string,
    public code: 'DB_ERROR' | 'PARSE_ERROR' | 'NOT_FOUND' | 'VALIDATION',
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'QuizError'
  }
}

/** 题库不足验证错误 */
export class InsufficientQuestionsError extends QuizError {
  constructor(judgeCount: number, singleCount: number, multipleCount: number) {
    const minJudge = 30
    const minSingle = 75
    const minMultiple = 45
    super(
      `题库不足：判断${judgeCount}/${minJudge}，单选${singleCount}/${minSingle}，多选${multipleCount}/${minMultiple}`,
      'VALIDATION',
      true
    )
  }
}

/** 数据库不可用错误 */
export class DatabaseError extends QuizError {
  public originalError?: Error
  constructor(message: string, originalError?: Error) {
    super(message, 'DB_ERROR', false)
    this.originalError = originalError
  }
}
