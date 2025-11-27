export interface Question {
  multiplicand: number
  multiplier: number
  answer: number
}

export type FeedbackType = 'success' | 'danger' | 'warning' | 'info'
export type ModeSelection = 'random' | 'focus'
export type GamePhase = 'setup' | 'game'

export interface HistoryEntry {
  label: string
  correct: boolean
  userAnswer: number
  answer: number
}
