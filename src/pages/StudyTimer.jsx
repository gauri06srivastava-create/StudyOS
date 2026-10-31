
import { useEffect, useState } from 'react'

function getTodayKey() {
  const date = new Date()

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function StudyTimer() {
  const studyTime = 25 * 60
  const breakTime = 5 * 60

  const [mode, setMode] = useState('study')
  const [seconds, setSeconds] = useState(studyTime)
  const [isRunning, setIsRunning] = useState(false)

  const [sessions, setSessions] = useState(() =>
    Number(localStorage.getItem('studyos_timer_sessions') || 0)
  )

  const [totalMinutes, setTotalMinutes] = useState(() =>
    Number(localStorage.getItem('studyos_total_study_minutes') || 0)
  )

  const [dailyGoal, setDailyGoal] = useState(() =>
    Number(localStorage.getItem('studyos_daily_goal') || 2)
  )

  const [todayMinutes, setTodayMinutes] = useState(() => {
    if (localStorage.getItem('studyos_daily_date') !== getTodayKey()) {
      localStorage.setItem('studyos_daily_date', getTodayKey())
      localStorage.setItem('studyos_daily_minutes', '0')
      return 0
    }

    return Number(localStorage.getItem('studyos_daily_minutes') || 0)
  })

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setSeconds(previous => {
        if (previous <= 1) {
          clearInterval(timer)
          setIsRunning(false)

          if (mode === 'study') {
            setSessions(current => {
              const updated = current + 1
              localStorage.setItem('studyos_timer_sessions', updated)
              return updated
            })

            setTotalMinutes(current => {
              const updated = current + 25
              localStorage.setItem('studyos_total_study_minutes', updated)
              return updated
            })

            setTodayMinutes(current => {
              const updated =
                localStorage.getItem('studyos_daily_date') === getTodayKey()
                  ? current + 25
                  : 25

              localStorage.setItem('studyos_daily_minutes', updated)
              localStorage.setItem('studyos_daily_date', getTodayKey())

              return updated
            })

            setMode('break')
            return breakTime
          } else {
            setMode('study')
            return studyTime
          }
        }

        return previous - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, mode])

  // Start timer
  const startTimer = () => {
    setIsRunning(true)
  }

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false)
  }

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(mode === 'study' ? studyTime : breakTime)
  }

  // Change timer mode
  const changeMode = selectedMode => {
    setIsRunning(false)
    setMode(selectedMode)
    setSeconds(selectedMode === 'study' ? studyTime : breakTime)
  }

  // Update daily goal
  const updateDailyGoal = value => {
    if (value === '') {
      setDailyGoal('')
      return
    }

    const updated = Math.min(24, Math.max(1, Number(value)))

    setDailyGoal(updated)
    localStorage.setItem('studyos_daily_goal', updated)
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const goalMinutes = Number(dailyGoal) * 60

  const goalPercentage = goalMinutes > 0
    ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100))
    : 0

  return (
    <div className="page">

      <h1>Study Timer ⏱️</h1>
      <p>Stay focused. Learn better. Achieve more.</p>

      {/* Pomodoro Timer */}
      <div className="timer-card">

        <div className="timer-modes">

          <button
            className={mode === 'study' ? 'active-mode' : ''}
            onClick={() => changeMode('study')}
          >
            Study
          </button>

          <button
            className={mode === 'break' ? 'active-mode' : ''}
            onClick={() => changeMode('break')}
          >
            Short Break
          </button>

        </div>

        <h2 className="timer-display">
          {String(minutes).padStart(2, '0')}:
          {String(remainingSeconds).padStart(2, '0')}
        </h2>

        <p>
          {mode === 'study' ? 'Time to focus! 📚' : 'Take a break! ☕'}
        </p>

        <div className="timer-buttons">

          <button onClick={startTimer} disabled={isRunning}>
            Start
          </button>

          <button onClick={pauseTimer}>
            Pause
          </button>

          <button onClick={resetTimer}>
            Reset
          </button>

        </div>

      </div>

      {/* Daily Study Goal */}
      <div className="progress-section">

        <h2>Daily Study Goal 🎯</h2>

        <div className="progress-card">

          <h3>Set Your Daily Target</h3>

          <input
            type="number"
            min="1"
            max="24"
            value={dailyGoal}
            onChange={event => updateDailyGoal(event.target.value)}
            onBlur={() => {
              if (dailyGoal === '') {
                updateDailyGoal(2)
              }
            }}
            id="dailyGoal"
          />

          <p>Target hours per day</p>

          <h3>Today's Progress</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>

          <h3>
            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
            {' / '}
            {dailyGoal || 2}h
          </h3>

          <p>{goalPercentage}% of your daily goal completed!</p>

          {goalPercentage >= 100 && (
            <p>🎉 Congratulations! Daily study goal completed!</p>
          )}

        </div>

      </div>

      {/* Study Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Completed Sessions</h3>
          <h2>{sessions}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Study Time</h3>
          <h2>{totalMinutes} min</h2>
        </div>

      </div>

    </div>
  )
}

export default StudyTimer
