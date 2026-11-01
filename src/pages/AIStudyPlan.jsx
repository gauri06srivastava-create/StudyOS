
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function AIStudyPlan() {
  const [subjects, setSubjects] = useState('')
  const [examDate, setExamDate] = useState('')
  const [hours, setHours] = useState(3)
  const [weakTopics, setWeakTopics] = useState('')
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedPlans, setSavedPlans] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('studyos_saved_plans')) || []
  } catch {
    return []
  }
})
  const generatePlan = async (e) => {
    e.preventDefault()

    if (!subjects.trim() || !examDate || !hours) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError('')
    setPlan('')

    try {
      const response = await fetch(
        'https://studyos-08bx.onrender.com/generate-study-plan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subjects: subjects.trim(),
            exam_date: examDate,
            daily_hours: Number(hours),
            weak_topics: weakTopics.trim()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail
            ? JSON.stringify(data.detail)
            : data.error || 'Failed to generate study plan.'
        )
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.plan) {
        throw new Error('AI did not return a study plan. Please try again.')
      }

      setPlan(data.plan)

    } catch (err) {
      console.error('Study Plan Error:', err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }
const savePlan = () => {
  if (!plan) return

  const newPlan = {
    id: Date.now(),
    subjects,
    examDate,
    hours,
    plan,
    savedAt: new Date().toLocaleDateString()
  }

  const updatedPlans = [newPlan, ...savedPlans]

  setSavedPlans(updatedPlans)
  localStorage.setItem(
    'studyos_saved_plans',
    JSON.stringify(updatedPlans)
  )

  alert('Study Plan Saved Successfully!')
}

const deletePlan = (id) => {
  const updatedPlans = savedPlans.filter(item => item.id !== id)

  setSavedPlans(updatedPlans)
  localStorage.setItem(
    'studyos_saved_plans',
    JSON.stringify(updatedPlans)
  )
}
  return (
    <div className="page">

      <h1>AI Study Planner 🧠</h1>
      <p>Create a personalized study timetable with AI.</p>

      <div className="progress-section">
        <div className="progress-card">

          <h2>Plan Your Preparation 📚</h2>

          <form onSubmit={generatePlan}>

            <label>Subjects *</label>
            <textarea
              rows="3"
              placeholder="Example: DSA, DBMS, Operating Systems, Computer Networks"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              required
            />

            <label>Exam Date *</label>
            <input
              type="date"
              value={examDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />

            <label>Daily Available Study Hours *</label>
            <input
              type="number"
              min="1"
              max="16"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />

            <label>Weak Topics (Optional)</label>
            <textarea
              rows="3"
              placeholder="Example: Trees, SQL Joins, Deadlocks..."
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
            />

            <button
              type="submit"
              className="generate-plan-btn"
              disabled={loading}
            >
              {loading
                ? 'Generating Your Plan...'
                : '✨ Generate My Study Plan'}
            </button>

          </form>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </div>
      </div>

      {plan && (
        <div className="progress-section">
          <div className="progress-card">

            <h2>Your Personalized Study Plan 🎯</h2>

            <div className="study-plan-result">
                <button
  type="button"
  className="generate-plan-btn"
  onClick={savePlan}
>
  💾 Save This Study Plan
</button>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {plan}
              </ReactMarkdown>
            </div>

          </div>
        </div>
      )}
<div className="progress-section">
  <div className="progress-card">
    <h2>📚 My Saved Study Plans</h2>

    {savedPlans.length === 0 ? (
      <p>No saved plans yet. Generate and save your first plan!</p>
    ) : (
      savedPlans.map((item) => (
        <div className="saved-plan-card" key={item.id}>
          <h3>{item.subjects}</h3>

          <p>Exam Date: {item.examDate}</p>
          <p>Daily Hours: {item.hours}</p>
          <p>Saved On: {item.savedAt}</p>

          <details>
            <summary>View Study Plan</summary>

            <div className="study-plan-result">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.plan}
              </ReactMarkdown>
            </div>
          </details>

          <button
            type="button"
            onClick={() => deletePlan(item.id)}
          >
            🗑️ Delete Plan
          </button>
        </div>
      ))
    )}
  </div>
</div>
    </div>
  )
}

export default AIStudyPlan
