
import { useState } from 'react'

function RevisionPlanner() {
  const [history] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('studyos_quiz_history') || '[]'
      )
    } catch {
      return []
    }
  })

  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('studyos_completed_revisions') || '[]'
      )
    } catch {
      return []
    }
  })

  // Calculate weak topics
  const topicStats = {}

  history.forEach(attempt => {
    (attempt.incorrectTopics || []).forEach(topic => {
      topicStats[topic] = (topicStats[topic] || 0) + 1
    })
  })

  const tasks = Object.entries(topicStats)
    .map(([topic, count]) => ({
      topic,
      count,
      priority: count >= 4 ? 'High' : count >= 2 ? 'Medium' : 'Low'
    }))
    .sort((a, b) => b.count - a.count)

  const toggleTask = topic => {
    const updated = completed.includes(topic)
      ? completed.filter(item => item !== topic)
      : [...completed, topic]

    setCompleted(updated)

    localStorage.setItem(
      'studyos_completed_revisions',
      JSON.stringify(updated)
    )
  }

  const completedCount = tasks.filter(
    task => completed.includes(task.topic)
  ).length

  const percentage = tasks.length > 0
    ? Math.round((completedCount / tasks.length) * 100)
    : 0

  return (
    <div className="page">

      <h1>Smart Revision Planner 📚</h1>
      <p>Your personalized revision plan based on quiz performance.</p>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Topics</h3>
          <h2>{tasks.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <h2>{completedCount}</h2>
        </div>

        <div className="stat-card">
          <h3>Remaining</h3>
          <h2>{tasks.length - completedCount}</h2>
        </div>

      </div>

      <div className="progress-section">

        <h2>Revision Progress</h2>

        <div className="progress-card">

          <h3>{percentage}% Completed</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p>
            {completedCount} out of {tasks.length} topics revised.
          </p>

        </div>

      </div>

      <div className="progress-section">

        <h2>My Revision Tasks 🎯</h2>

        {tasks.length === 0 ? (
          <div className="progress-card">
            <h3>No revision tasks yet!</h3>
            <p>Complete a quiz and answer some questions incorrectly to generate your revision plan.</p>
          </div>
        ) : (
          tasks.map(task => (

            <div className="progress-card" key={task.topic}>

              <div className="revision-task-header">

                <h3>{task.topic}</h3>

                <span className={`priority ${task.priority.toLowerCase()}`}>
                  {task.priority} Priority
                </span>

              </div>

              <p>Incorrect Answers: {task.count}</p>

              <p>Suggested Activity: Revise your notes and practice MCQs on this topic.</p>

              <label className="revision-checkbox">

                <input
                  type="checkbox"
                  checked={completed.includes(task.topic)}
                  onChange={() => toggleTask(task.topic)}
                />

                Mark as Completed

              </label>

            </div>

          ))
        )}

      </div>

    </div>
  )
}

export default RevisionPlanner
