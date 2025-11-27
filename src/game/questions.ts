import { RANDOM_TOTAL_QUESTIONS } from './config'
import type { Question } from './types'

const shuffleQuestions = (pool: Question[]): Question[] => {
  const result = [...pool]
  for (let idx = result.length - 1; idx > 0; idx -= 1) {
    const swapIndex = Math.floor(Math.random() * (idx + 1))
    const temp = result[idx]
    result[idx] = result[swapIndex]
    result[swapIndex] = temp
  }
  return result
}

export const buildQuestionSet = (focusDan: number | null): Question[] => {
  if (focusDan !== null) {
    const danPool: Question[] = []
    for (let j = 1; j <= 9; j += 1) {
      danPool.push({ multiplicand: focusDan, multiplier: j, answer: focusDan * j })
    }
    return shuffleQuestions(danPool)
  }

  const pool: Question[] = []
  for (let i = 1; i <= 9; i += 1) {
    for (let j = 1; j <= 9; j += 1) {
      pool.push({ multiplicand: i, multiplier: j, answer: i * j })
    }
  }
  return shuffleQuestions(pool).slice(0, RANDOM_TOTAL_QUESTIONS)
}
