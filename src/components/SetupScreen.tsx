import type { ChangeEventHandler } from 'react'
import { DAN_OPTIONS, RANDOM_TOTAL_QUESTIONS } from '../game/config'
import type { ModeSelection } from '../game/types'

interface SetupScreenProps {
  selectedMode: ModeSelection
  selectedDan: number
  onModeChange: (mode: ModeSelection) => void
  onSelectedDanChange: (dan: number) => void
  onStart: () => void
}

const SetupScreen = ({
  selectedMode,
  selectedDan,
  onModeChange,
  onSelectedDanChange,
  onStart,
}: SetupScreenProps) => {
  const handleModeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onModeChange(event.target.value as ModeSelection)
  }

  const handleDanChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    onSelectedDanChange(Number(event.target.value))
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-3">新しいゲームを作成</h1>
              <p className="text-muted">
                「通常（ランダム20問）」か「集中（9問）」を選んでゲームを始めましょう。
              </p>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="mode"
                  id="mode-random"
                  value="random"
                  checked={selectedMode === 'random'}
                  onChange={handleModeChange}
                />
                <label className="form-check-label fw-semibold" htmlFor="mode-random">
                  通常（ランダム{RANDOM_TOTAL_QUESTIONS}問）
                </label>
                <div className="text-muted small">毎回ランダムに20問出題します。</div>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="mode"
                  id="mode-focus"
                  value="focus"
                  checked={selectedMode === 'focus'}
                  onChange={handleModeChange}
                />
                <label className="form-check-label fw-semibold" htmlFor="mode-focus">
                  集中（9問）
                </label>
                <div className="text-muted small mb-2">選んだ段だけ9問出題して集中練習します。</div>
                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="selectedDan" className="form-label mb-0">
                    段を選ぶ
                  </label>
                  <select
                    id="selectedDan"
                    className="form-select"
                    style={{ maxWidth: '120px' }}
                    value={selectedDan}
                    onChange={handleDanChange}
                    disabled={selectedMode !== 'focus'}
                  >
                    {DAN_OPTIONS.map((dan) => (
                      <option key={dan} value={dan}>
                        {dan}の段
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-grid">
                <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
                  ゲームを開始
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupScreen
