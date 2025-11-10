import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import failSound from './assets/fail.mp3'
import successSound from './assets/success.mp3'

interface Question {
  multiplicand: number
  multiplier: number
  answer: number
}

type FeedbackType = 'success' | 'danger' | 'warning' | 'info'

const TOTAL_QUESTIONS = 20

const buildQuestionSet = (): Question[] => {
  const pool: Question[] = []
  for (let i = 1; i <= 9; i += 1) {
    for (let j = 1; j <= 9; j += 1) {
      pool.push({ multiplicand: i, multiplier: j, answer: i * j })
    }
  }

  for (let idx = pool.length - 1; idx > 0; idx -= 1) {
    const swapIndex = Math.floor(Math.random() * (idx + 1))
    const temp = pool[idx]
    pool[idx] = pool[swapIndex]
    pool[swapIndex] = temp
  }

  return pool.slice(0, TOTAL_QUESTIONS)
}

function App() {
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestionSet())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [score, setScore] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [gameStatus, setGameStatus] = useState<'running' | 'completed'>('running')
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null)
  const [history, setHistory] = useState<
    Array<{ label: string; correct: boolean; userAnswer: number; answer: number }>
  >([])
  const [speechSupport, setSpeechSupport] = useState(false)
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)

  const playFailSound = useCallback((): Promise<void> => {
    if (typeof window === 'undefined') {
      return Promise.resolve()
    }
    const audio = new Audio(failSound)
    audio.volume = 0.8

    return new Promise((resolve) => {
      const cleanup = () => {
        audio.removeEventListener('ended', cleanup)
        audio.removeEventListener('error', cleanup)
        resolve()
      }
      audio.addEventListener('ended', cleanup, { once: true })
      audio.addEventListener('error', cleanup, { once: true })
      const playPromise = audio.play()
      if (!playPromise) {
        cleanup()
        return
      }
      playPromise.catch(() => cleanup())
    })
  }, [])

  const playSuccessSound = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const audio = successAudioRef.current
    if (!audio) {
      return
    }
    audio.currentTime = 0
    void audio.play()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    successAudioRef.current = new Audio(successSound)
    successAudioRef.current.volume = 0.8
    return () => {
      successAudioRef.current?.pause()
      successAudioRef.current = null
    }
  }, [])

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

  const answeredCount = Math.min(currentIndex, TOTAL_QUESTIONS)
  const progressPercent = Math.round((answeredCount / TOTAL_QUESTIONS) * 100)
  const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0
  const currentQuestion = questions[currentIndex]

  const completionSummary = useMemo(() => {
    if (gameStatus !== 'completed') {
      return ''
    }
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100)
    return `ゲーム終了！最終スコアは ${score}/${TOTAL_QUESTIONS} (${percentage}%)。最高連続正解数は ${bestStreak} でした。`
  }, [bestStreak, gameStatus, score])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
      ...prev,
      {
        label: `${multiplicand} × ${multiplier}`,
        correct: isCorrect,
        userAnswer: parsed,
        answer,
      },
    ])

    setInputValue('')
    const nextIndex = currentIndex + 1
    if (nextIndex >= TOTAL_QUESTIONS) {
      setCurrentIndex(nextIndex)
      setGameStatus('completed')
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  const handleReset = () => {
    setQuestions(buildQuestionSet())
    setCurrentIndex(0)
    setInputValue('')
    setScore(0)
    setCurrentStreak(0)
    setBestStreak(0)
    setGameStatus('running')
    setFeedback(null)
    setHistory([])
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">九九トレーニング</h1>
          <p className="text-muted mb-0">ランダム20問でスコアと連続正解に挑戦しましょう！</p>
        </div>
        <button type="button" className="btn btn-outline-primary" onClick={handleReset}>
          新しいゲーム
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-semibold text-secondary">{answeredCount}/{TOTAL_QUESTIONS} 問</span>
                <span className="badge text-bg-light">正答率 {accuracy}%</span>
              </div>
              <div className="progress mb-4" style={{ height: '0.75rem' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progressPercent}%` }}
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              {gameStatus === 'running' && currentQuestion && (
                <>
                  <p className="lead fw-semibold text-center mb-4">
                    [{answeredCount + 1}/{TOTAL_QUESTIONS}] {currentQuestion.multiplicand} × {currentQuestion.multiplier} = ?
                  </p>
                  <form className="row g-2 align-items-end" onSubmit={handleSubmit}>
                    <div className="col-sm-8">
                      <label htmlFor="answer" className="form-label">
                        答え
                      </label>
                      <input
                        id="answer"
                        type="number"
                        inputMode="numeric"
                        className="form-control form-control-lg"
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="col-sm-4">
                      <button type="submit" className="btn btn-primary btn-lg w-100">
                        回答する
                      </button>
                    </div>
                  </form>
                </>
              )}

              {feedback && (
                <div className={`alert alert-${feedback.type} mt-4 mb-0`} role="alert">
                  {feedback.message}
                </div>
              )}

              {gameStatus === 'completed' && (
                <div className="text-center mt-4">
                  <p className="lead fw-semibold">ゲーム終了！</p>
                  <p className="mb-1">最終スコア: {score}/{TOTAL_QUESTIONS}</p>
                  <p className="mb-1">最高連続正解数: {bestStreak}</p>
                  <p className="text-muted mb-0">{completionSummary}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h5 mb-3">スコアボード</h2>
              <div className="row text-center g-3">
                <div className="col-4">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small">スコア</div>
                    <div className="fs-2 fw-bold">{score}</div>
                    <div className="text-muted small">/ {TOTAL_QUESTIONS}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small">連続正解</div>
                    <div className="fs-2 fw-bold">{currentStreak}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small">最高連続</div>
                    <div className="fs-2 fw-bold">{bestStreak}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">回答履歴</h2>
              {history.length === 0 ? (
                <p className="text-muted mb-0">まだ回答がありません。</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {history.map((entry, index) => (
                    <li
                      key={`${entry.label}-${index}`}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <span className="fw-semibold">{entry.label}</span>
                        <small className="text-muted d-block">あなたの答え: {entry.userAnswer}</small>
                        {!entry.correct && (
                          <small className="text-muted">正解: {entry.answer}</small>
                        )}
                      </div>
                      <span className={`badge bg-${entry.correct ? 'success' : 'danger'}`}>
                        {entry.correct ? '正解' : '不正解'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
