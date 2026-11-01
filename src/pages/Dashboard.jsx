
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  const [documents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_documents') || '[]')
    } catch {
      return []
    }
  })

  const [history] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_quiz_history') || '[]')
    } catch {
      return []
    }
  })

  const [completed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_completed_revisions') || '[]')
    } catch {
      return []
    }
  })

  const [savedPlans] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_saved_plans') || '[]')
    } catch {
      return []
    }
  })

  const dailyGoal = Number(localStorage.getItem('studyos_daily_goal') || 3)
  const dailyMinutes = Number(localStorage.getItem('studyos_daily_minutes') || 0)


  useEffect(() => {
  fetch("https://studyos-08bx.onrender.com/health")
    .then((response) => {
      if (!response.ok) throw new Error("Backend error");
      return response.json();
    })
    .then((data) => {
      setBackendStatus(data.status === "healthy" ? "Connected" : "Disconnected");
    })
    .catch((error) => {
      console.error("Backend connection error:", error);
      setBackendStatus("Disconnected");
    });
}, []);

  // Average quiz score
  const averageScore = history.length > 0
    ? history.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / history.length
    : 0

  // Unique weak topics
  const weakTopics = [
    ...new Set(history.flatMap(attempt => attempt.incorrectTopics || []))
  ]

  // Revision progress
  const completedCount = weakTopics.filter(
    topic => completed.includes(topic)
  ).length

  const revisionProgress = weakTopics.length > 0
    ? Math.round((completedCount / weakTopics.length) * 100)
    : 0

  const recentAttempts = [...history].slice(-5).reverse()
  const chartAttempts = history.slice(-5)

  // Upcoming exams
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingExams = savedPlans
    .filter(plan => {
      if (!plan.examDate) return false
      const examDate = new Date(`${plan.examDate}T00:00:00`)
      return !isNaN(examDate.getTime()) && examDate >= today
    })
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))

  const getDaysLeft = (date) => {
    const exam = new Date(`${date}T00:00:00`)
    return Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="page">

      <div className="dashboard-header">
        <div>
          <h1>Welcome to StudyOS 👋</h1>
          <p>Backend Status: {backendStatus}</p>
          <p>Your personal learning workspace.</p>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Documents</h3>
          <h2>{documents.length}</h2>
          <p>Uploaded study materials</p>
        </div>

        <div className="stat-card">
          <h3>Quizzes Completed</h3>
          <h2>{history.length}</h2>
          <p>Test your knowledge</p>
        </div>

        <div className="stat-card">
          <h3>Average Score</h3>
          <h2>{averageScore.toFixed(1)}%</h2>
          <p>Your quiz performance</p>
        </div>

        <div className="stat-card">
          <h3>Revision Progress</h3>
          <h2>{revisionProgress}%</h2>
          <p>{completedCount} of {weakTopics.length} topics revised</p>
        </div>

      </div>

      {/* Study Overview */}
      <div className="progress-section">
        <h2>Study Overview 📚</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Saved Study Plans</h3>
            <h2>{savedPlans.length}</h2>
            <p>Your personalized preparation plans</p>
          </div>

          <div className="stat-card">
            <h3>Daily Study Goal</h3>
            <h2>{dailyGoal} Hours</h2>
            <p>Daily target set in Study Timer</p>
          </div>

          <div className="stat-card">
            <h3>Today's Study Time</h3>
            <h2>{Math.floor(dailyMinutes / 60)}h {dailyMinutes % 60}m</h2>
            <p>Time recorded by Study Timer</p>
          </div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="progress-section">
        <h2>Upcoming Exams 🎓</h2>

        <div className="progress-card">
          {upcomingExams.length === 0 ? (
            <p>No upcoming exams. Generate and save an AI Study Plan to see your exam here.</p>
          ) : (
            upcomingExams.map(plan => (
              <div className="saved-plan-card" key={plan.id}>
                <h3>{plan.subjects}</h3>
                <p>Exam Date: {plan.examDate}</p>
                <p>
                  {getDaysLeft(plan.examDate) === 0
                    ? "Your exam is today!"
                    : `${getDaysLeft(plan.examDate)} days remaining`}
                </p>
                <Link to="/study-plan">View Study Plan →</Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Study Plans */}
      <div className="progress-section">
        <h2>My Study Plans 🧠</h2>

        <div className="progress-card">
          {savedPlans.length === 0 ? (
            <p>No saved study plans yet. Create your first personalized plan!</p>
          ) : (
            savedPlans.map(plan => (
              <div className="saved-plan-card" key={plan.id}>
                <h3>{plan.subjects}</h3>
                <p>Exam Date: {plan.examDate}</p>
                <p>Daily Hours: {plan.hours}</p>
                <p>Saved On: {plan.savedAt}</p>

                <details>
                  <summary>View Plan Details</summary>
                  <pre className="dashboard-plan-text">{plan.plan}</pre>
                </details>
              </div>
            ))
          )}

          <Link to="/study-plan">+ Create New Study Plan →</Link>
        </div>
      </div>

      {/* Quiz Performance Chart */}
      <div className="progress-section">
        <h2>Quiz Performance 📈</h2>

        <div className="progress-card">
          {chartAttempts.length === 0 ? (
            <p>Complete a quiz to see your performance chart.</p>
          ) : (
            <div className="score-chart">
              {chartAttempts.map((attempt, index) => (
                <div className="chart-column" key={attempt.id || index}>
                  <div className="chart-value">
                    {attempt.percentage}%
                  </div>

                  <div className="chart-bar-wrapper">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(Number(attempt.percentage) || 0, 3)}%`
                      }}
                    />
                  </div>

                  <span>Quiz {index + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="progress-section">
        <h2>Recent Activity 🕒</h2>

        {recentAttempts.length === 0 ? (
          <div className="progress-card">
            <p>No recent activity. Start your first quiz!</p>
          </div>
        ) : (
          recentAttempts.map((attempt, index) => (
            <div className="progress-card" key={attempt.id || index}>
              <h3>📝 {attempt.documentName}</h3>
              <p>Score: {attempt.score}/{attempt.totalQuestions}</p>
              <p>Performance: {attempt.percentage}%</p>
              <p>Date: {attempt.date}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <h2 className="section-title">Quick Actions</h2>

      <div className="actions-grid">

        <Link to="/documents" className="action-card">
          <h3>📚 My Documents</h3>
          <p>Upload and manage your PDFs.</p>
        </Link>

        <Link to="/tutor" className="action-card">
          <h3>🤖 AI Tutor</h3>
          <p>Ask questions about your study material.</p>
        </Link>

        <Link to="/quiz" className="action-card">
          <h3>📝 Take a Quiz</h3>
          <p>Test your understanding.</p>
        </Link>

        <Link to="/progress" className="action-card">
          <h3>📊 My Progress</h3>
          <p>Track your learning performance.</p>
        </Link>

        <Link to="/revision" className="action-card">
          <h3>🎯 Smart Revision</h3>
          <p>Revise your weak topics.</p>
        </Link>

        <Link to="/study-plan" className="action-card">
          <h3>🧠 AI Study Plan</h3>
          <p>Generate your personalized study timetable.</p>
        </Link>

      </div>

    </div>
  )
}

export default Dashboard
