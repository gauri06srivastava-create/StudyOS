
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

  // Calculate quiz statistics
  const totalQuizzes = history.length

  const averageScore = totalQuizzes > 0
    ? history.reduce(
        (sum, item) => sum + item.percentage,
        0
      ) / totalQuizzes
    : 0

  const bestScore = totalQuizzes > 0
    ? Math.max(...history.map(item => item.percentage))
    : 0

  // Identify weak topics
  const topicStats = {}

  history.forEach((attempt) => {
    (attempt.incorrectTopics || []).forEach((topic) => {
      topicStats[topic] = (topicStats[topic] || 0) + 1
    })
  })

  const weakTopics = Object.entries(topicStats)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="page">

      <h1>My Progress 📊</h1>
      <p>Track your learning journey with StudyOS.</p>

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Quizzes Completed</h3>
          <h2>{totalQuizzes}</h2>
          <p>Practice sessions completed</p>
        </div>

        <div className="stat-card">
          <h3>Average Score</h3>
          <h2>{averageScore.toFixed(1)}%</h2>
          <p>Your overall quiz performance</p>
        </div>

        <div className="stat-card">
          <h3>Best Score</h3>
          <h2>{bestScore.toFixed(1)}%</h2>
          <p>Your highest quiz score</p>
        </div>

      </div>

      {/* Learning Overview */}
      <div className="progress-section">
        <h2>Learning Overview</h2>

        <div className="progress-card">
          <h3>Overall Learning Progress</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${averageScore}%` }}
            ></div>
          </div>

          <p>
            Your average quiz performance is{' '}
            {averageScore.toFixed(1)}%.
          </p>
        </div>
      </div>

      {/* Recent Quiz History */}
      <div className="progress-section">
        <h2>Recent Quiz History 📝</h2>

        {history.length === 0 ? (
          <div className="progress-card">
            <p>No quiz attempts yet.</p>
            <p>Complete a quiz to see your progress here!</p>
          </div>
        ) : (
          history.map((attempt) => (
            <div className="progress-card" key={attempt.id}>
              <h3>{attempt.documentName}</h3>

              <p>
                Score: {attempt.score} / {attempt.totalQuestions}
              </p>

              <p>
                Percentage: {attempt.percentage}%
              </p>

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
            <p>
              Complete a new quiz and answer some questions
              incorrectly to identify topics for revision.
            </p>
          </div>
        ) : (
          weakTopics.map(([topic, count]) => (
            <div className="progress-card" key={topic}>
              <h3>{topic}</h3>

              <p>
                Incorrect Answers: {count}
              </p>

              <p>
                📚 Recommendation: Revise this topic and
                attempt another quiz.
              </p>
            </div>
          ))
        )}
      </div>

      {/* Study Hours */}
      <div className="progress-section">
        <h2>Study Hours ⏱️</h2>

        <div className="progress-card">
          <h3>Not tracked yet</h3>
          <p>
            Study time tracking will be added in a future update.
          </p>
        </div>
      </div>

    </div>
  )
}

export default Progress
