import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import GameScreen from './GameScreen'
import { RANDOM_TOTAL_QUESTIONS } from '../game/config'
import useAudio from '../hooks/useAudio'
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
} from '../state/atoms'

const GameContainer = () => {
  const [phase, setPhase] = useAtom(phaseAtom)
  const [focusDan] = useAtom(focusDanAtom)
  const [questions] = useAtom(questionsAtom)
  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom)
  const [inputValue, setInputValue] = useAtom(inputValueAtom)
  const [score, setScore] = useAtom(scoreAtom)
  const [currentStreak, setCurrentStreak] = useAtom(currentStreakAtom)
  const [bestStreak, setBestStreak] = useAtom(bestStreakAtom)
  const [gameStatus, setGameStatus] = useAtom(gameStatusAtom)
  const [feedback, setFeedback] = useAtom(feedbackAtom)
  const [history, setHistory] = useAtom(historyAtom)
  const [speechSupport, setSpeechSupport] = useState(false)
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null)
  const { playSuccessSound, playFailSound } = useAudio()

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }
    const synth = window.speechSynthesis
    setSpeechSupport(true)

    const pickVoice = () => {
      const voices = synth.getVoices().filter((voice) => voice.lang.startsWith('ja'))
      if (!voices.length) {
        return
      }
      const lower = (value: string | undefined) => value?.toLowerCase() ?? ''
      const googleVoice = voices.find((voice) => lower(voice.name).includes('google'))
      const kyokoVoice = voices.find((voice) => lower(voice.name).includes('kyoko'))
      const fallbackVoice = voices[voices.length - 1] ?? null
      setPreferredVoice(googleVoice ?? kyokoVoice ?? fallbackVoice)
    }

    pickVoice()
    synth.addEventListener('voiceschanged', pickVoice)
    return () => synth.removeEventListener('voiceschanged', pickVoice)
  }, [])

  const speakFeedback = useCallback(
    (message: string) => {
      if (!speechSupport || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return
      }
      const utterance = new SpeechSynthesisUtterance(message)
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    },
    [preferredVoice, speechSupport],
  )

  const totalQuestions = questions.length
  const answeredCount = Math.min(currentIndex, totalQuestions)
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0
  const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0
  const currentQuestion = questions[currentIndex]

  const completionSummary = useMemo(() => {
    if (gameStatus !== 'completed') {
      return ''
    }
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
    const danPart = focusDan === null ? 'ランダムモード' : `${focusDan}の段集中モード`
    return `ゲーム終了！最終スコアは ${score}/${totalQuestions} (${percentage}%)。最高連続正解数は ${bestStreak} でした。（${danPart}）`
  }, [bestStreak, focusDan, gameStatus, score, totalQuestions])

  const modeLabel =
    focusDan === null ? `ランダム${RANDOM_TOTAL_QUESTIONS}問` : `${focusDan}の段集中`
  const introText =
    focusDan === null
      ? `ランダム${RANDOM_TOTAL_QUESTIONS}問でスコアと連続正解に挑戦しましょう！`
      : `${focusDan}の段だけが出題されます。${totalQuestions}問で集中練習しましょう。`

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (gameStatus === 'completed' || !currentQuestion) {
      return
    }

    const trimmed = inputValue.trim()
    if (!trimmed) {
      setFeedback({ type: 'warning', message: '入力が空です。数字を入力してください。' })
      return
    }

    const parsed = Number(trimmed)
    if (!Number.isInteger(parsed)) {
      setFeedback({ type: 'warning', message: '数字で答えてください。' })
      return
    }

    const { multiplicand, multiplier, answer } = currentQuestion
    const isCorrect = parsed === answer

    if (isCorrect) {
      const nextStreak = currentStreak + 1
      setScore((prev) => prev + 1)
      setCurrentStreak(nextStreak)
      setBestStreak((prev) => Math.max(prev, nextStreak))
      setFeedback({ type: 'success', message: '正解！' })
      playSuccessSound()
    } else {
      setCurrentStreak(0)
      const explanation = `${multiplicand} かける ${multiplier} の正しい答えは ${answer} です。`
      const message = `不正解。${explanation}`
      setFeedback({
        type: 'danger',
        message,
      })
      void playFailSound().finally(() => speakFeedback(explanation))
    }

    setHistory((prev) => [
      {
        label: `${multiplicand} × ${multiplier}`,
        correct: isCorrect,
        userAnswer: parsed,
        answer,
      },
      ...prev,
    ])

    setInputValue('')
    const nextIndex = currentIndex + 1
    if (nextIndex >= totalQuestions) {
      setCurrentIndex(nextIndex)
      setGameStatus('completed')
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  const handleReset = () => {
    setPhase('setup')
  }

  if (phase === 'setup') {
    return null
  }

  return (
    <GameScreen
      introText={introText}
      modeLabel={modeLabel}
      answeredCount={answeredCount}
      totalQuestions={totalQuestions}
      progressPercent={progressPercent}
      accuracy={accuracy}
      gameStatus={gameStatus}
      currentQuestion={currentQuestion}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSubmit={handleSubmit}
      feedback={feedback}
      score={score}
      bestStreak={bestStreak}
      currentStreak={currentStreak}
      history={history}
      completionSummary={completionSummary}
      onReset={handleReset}
    />
  )
}

export default GameContainer
