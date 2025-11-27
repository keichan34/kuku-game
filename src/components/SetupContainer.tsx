import SetupScreen from './SetupScreen'
import { useAtom } from 'jotai'
import {
  bestStreakAtom,
  currentIndexAtom,
  currentStreakAtom,
  feedbackAtom,
  focusDanAtom,
  gameStatusAtom,
  historyAtom,
  inputValueAtom,
  phaseAtom,
  questionsAtom,
  scoreAtom,
  selectedDanAtom,
  selectedModeAtom,
} from '../state/atoms'
import type { ModeSelection } from '../game/types'
import { buildQuestionSet } from '../game/questions'

const SetupContainer = () => {
  const [, setPhase] = useAtom(phaseAtom)
  const [selectedMode, setSelectedMode] = useAtom(selectedModeAtom)
  const [selectedDan, setSelectedDan] = useAtom(selectedDanAtom)
  const [, setFocusDan] = useAtom(focusDanAtom)
  const [, setQuestions] = useAtom(questionsAtom)
  const [, setCurrentIndex] = useAtom(currentIndexAtom)
  const [, setInputValue] = useAtom(inputValueAtom)
  const [, setScore] = useAtom(scoreAtom)
  const [, setCurrentStreak] = useAtom(currentStreakAtom)
  const [, setBestStreak] = useAtom(bestStreakAtom)
  const [, setGameStatus] = useAtom(gameStatusAtom)
  const [, setFeedback] = useAtom(feedbackAtom)
  const [, setHistory] = useAtom(historyAtom)

  const handleModeChange = (mode: ModeSelection) => {
    setSelectedMode(mode)
  }

  const handleSelectedDanChange = (dan: number) => {
    setSelectedDan(dan)
  }

  const handleStartGame = () => {
    const nextFocusDan = selectedMode === 'random' ? null : selectedDan
    setQuestions(buildQuestionSet(nextFocusDan))
    setFocusDan(nextFocusDan)
    setCurrentIndex(0)
    setInputValue('')
    setScore(0)
    setCurrentStreak(0)
    setBestStreak(0)
    setGameStatus('running')
    setFeedback(null)
    setHistory([])
    setPhase('game')
  }

  return (
    <SetupScreen
      selectedMode={selectedMode}
      selectedDan={selectedDan}
      onModeChange={handleModeChange}
      onSelectedDanChange={handleSelectedDanChange}
      onStart={handleStartGame}
    />
  )
}

export default SetupContainer
