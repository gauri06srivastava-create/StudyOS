
import { useState } from 'react'

function Progress() {
  const [history] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('studyos_quiz_history') || '[]'
      )
    } catch {
      return []
    }
  })

  const [studyMinutes] = useState(() => {
    try {
      return Number(
        localStorage.getItem('studyos_total_study_minutes') || 0
      )
    } catch {
      return 0
    }
  })

  const totalQuizzes = history.length

  const averageScore = totalQuizzes
    ? history.reduce(
        (sum, item) => sum + Number(item.percentage || 0),
        0
      ) / totalQuizzes
    : 0

  const bestScore = totalQuizzes
    ? Math.max(...history.map(item => Number(item.percentage || 0)))
    : 0

  const totalCorrect = history.reduce(
    (sum, item) => sum + Number(item.score || 0),
    0
  )

  const totalQuestions = history.reduce(
    (sum, item) => sum + Number(item.totalQuestions || 0),
    0
  )

  const totalIncorrect = totalQuestions - totalCorrect

  const topicStats = {}

  history.forEach(attempt => {
    ;(attempt.incorrectTopics || []).forEach(topic => {
      topicStats[topic] = (topicStats[topic] || 0) + 1
    })
  })

  const weakTopics = Object.entries(topicStats)
    .sort((a, b) => b[1] - a[1])

  const maxMistakes = Math.max(
    1,
    ...weakTopics.map(([, count]) => count)
  )

  const studyHours = Math.floor(studyMinutes / 60)
  const remainingMinutes = studyMinutes % 60

  const getPerformanceMessage = () => {
    if (totalQuizzes === 0) {
      return 'Start your first quiz to track your performance!'
    }

    if (averageScore >= 85) {
      return 'Excellent work! Keep maintaining your performance.'
    }

    if (averageScore >= 70) {
      return 'Great progress! Keep practising to improve further.'
    }

    if (averageScore >= 50) {
      return 'Good effort! Focus on your weak topics.'
    }

    return 'Keep learning! Regular revision will help you improve.'
  }

  return (
    <div className="page">

      <h1>My Progress 📊</h1>
      <p>Track your learning journey with StudyOS.</p>

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Quizzes Completed</h3>
          <h2>{totalQuizzes}</h2>
          <p>Total practice sessions</p>
        </div>

        <div className="stat-card">
          <h3>Average Score</h3>
          <h2>{averageScore.toFixed(1)}%</h2>
          <p>Overall performance</p>
        </div>

        <div className="stat-card">
          <h3>Best Score</h3>
          <h2>{bestScore.toFixed(1)}%</h2>
          <p>Your highest score</p>
        </div>

        <div className="stat-card">
          <h3>Correct Answers</h3>
          <h2>{totalCorrect}</h2>
          <p>Across all attempts</p>
        </div>

      </div>

      {/* Learning Overview */}
      <div className="progress-section">

        <h2>Learning Overview 📈</h2>

        <div className="progress-card">

          <h3>Overall Learning Progress</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, averageScore)}%`
              }}
            />
          </div>

          <p>
            Average quiz performance: {averageScore.toFixed(1)}%
          </p>

          <p>{getPerformanceMessage()}</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  totalQuestions
                    ? (totalCorrect / totalQuestions) * 100
                    : 0
                }%`
              }}
            />
          </div>

          <p>
            Correct: {totalCorrect} | Incorrect: {totalIncorrect}
          </p>

        </div>

      </div>

      {/* Study Hours */}
      <div className="progress-section">

        <h2>Study Hours ⏱️</h2>

        <div className="progress-card">
          <h3>
            {studyHours}h {remainingMinutes}m
          </h3>
          <p>Total tracked study time</p>
        </div>

      </div>

      {/* Recent Quiz History */}
      <div className="progress-section">

        <h2>Recent Quiz History 📝</h2>

        {history.length === 0 ? (

          <div className="progress-card">
            <p>No quiz attempts yet.</p>
            <p>Complete your first quiz to see your progress!</p>
          </div>

        ) : (

          history.slice(0, 5).map(attempt => (

            <div className="progress-card" key={attempt.id}>

              <h3>{attempt.documentName}</h3>

              <p>
                Score: {attempt.score} / {attempt.totalQuestions}
              </p>

              <p>
                Percentage: {attempt.percentage}%
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Number(attempt.percentage) || 0
                    )}%`
                  }}
                />
              </div>

              <p>Date: {attempt.date}</p>

            </div>

          ))

        )}

      </div>

      {/* Weak Topic Analysis */}
      <div className="progress-section">

        <h2>Topics to Improve 🎯</h2>

        {weakTopics.length === 0 ? (

          <div className="progress-card">
            <p>No weak topics identified yet.</p>
            <p>Complete quizzes to discover topics that need revision.</p>
          </div>

        ) : (

          weakTopics.map(([topic, count]) => (

            <div className="progress-card" key={topic}>

              <h3>{topic}</h3>

              <p>Incorrect Answers: {count}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(count / maxMistakes) * 100}%`
                  }}
                />
              </div>

              <p>
                📚 Recommendation: Revise this topic and attempt another quiz.
              </p>

            </div>

          ))

        )}

      </div>

    </div>
  )
}

export default Progress
