import type { FormEventHandler } from 'react'
import type { FeedbackType, HistoryEntry, Question } from '../game/types'

interface GameScreenProps {
  introText: string
  modeLabel: string
  answeredCount: number
  totalQuestions: number
  progressPercent: number
  accuracy: number
  gameStatus: 'running' | 'completed'
  currentQuestion?: Question
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  feedback: { type: FeedbackType; message: string } | null
  score: number
  bestStreak: number
  currentStreak: number
  history: HistoryEntry[]
  completionSummary: string
  onReset: () => void
}

const GameScreen = ({
  introText,
  modeLabel,
  answeredCount,
  totalQuestions,
  progressPercent,
  accuracy,
  gameStatus,
  currentQuestion,
  inputValue,
  onInputChange,
  onSubmit,
  feedback,
  score,
  bestStreak,
  currentStreak,
  history,
  completionSummary,
  onReset,
}: GameScreenProps) => (
  <div className="container py-4">
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">九九トレーニング</h1>
        <p className="text-muted mb-0">{introText}</p>
      </div>
      <button type="button" className="btn btn-outline-primary flex-shrink-0" onClick={onReset}>
        新しいゲームを作成
      </button>
    </div>

    <div className="row g-4">
      <div className="col-lg-7">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
              <span className="fw-semibold text-secondary">{answeredCount}/{totalQuestions} 問</span>
              <div className="d-flex align-items-center gap-2">
                <span className="badge text-bg-secondary">{modeLabel}</span>
                <span className="badge text-bg-light">正答率 {accuracy}%</span>
              </div>
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
                  {currentQuestion.multiplicand} × {currentQuestion.multiplier} = ?
                </p>
                <form className="row g-2 align-items-end" onSubmit={onSubmit}>
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
                      onChange={(event) => onInputChange(event.target.value)}
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
                <p className="mb-1">最終スコア: {score}/{totalQuestions}</p>
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
                  <div className="text-muted small">/ {totalQuestions}</div>
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

export default GameScreen
