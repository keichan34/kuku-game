import { atom } from 'jotai'
import { buildQuestionSet } from '../game/questions'
import type {
  FeedbackType,
  GamePhase,
  HistoryEntry,
  ModeSelection,
  Question,
} from '../game/types'

export const phaseAtom = atom<GamePhase>('setup')
export const focusDanAtom = atom<number | null>(null)
export const questionsAtom = atom<Question[]>(buildQuestionSet(null))
export const selectedModeAtom = atom<ModeSelection>('random')
export const selectedDanAtom = atom<number>(2)
export const currentIndexAtom = atom(0)
export const inputValueAtom = atom('')
export const scoreAtom = atom(0)
export const currentStreakAtom = atom(0)
export const bestStreakAtom = atom(0)
export const gameStatusAtom = atom<'running' | 'completed'>('running')
export const feedbackAtom = atom<{ type: FeedbackType; message: string } | null>(null)
export const historyAtom = atom<HistoryEntry[]>([])
