
import { useState } from 'react'

function Quiz() {
  const [documents] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('studyos_documents') || '[]'
      )
    } catch {
      return []
    }
  })

  const [selectedDoc, setSelectedDoc] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [quiz, setQuiz] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [quizHistory, setQuizHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('studyos_quiz_history') || '[]'
      )
    } catch {
      return []
    }
  })

  const [error, setError] = useState('')

  // Generate AI Quiz
  const generateQuiz = async () => {
    const doc = documents.find(
      item => String(item.id) === String(selectedDoc)
    )

    if (!doc) {
      setError('Please select a document!')
      return
    }

    if (!doc.text?.trim()) {
      setError('This document has no readable text. Please upload it again.')
      return
    }

    setLoading(true)
    setError('')
    setQuiz([])
    setSelectedAnswers({})
    setSubmitted(false)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/generate-quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: doc.text,
            num_questions: numQuestions
          })
        }
      )

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('No questions received from AI.')
      }

      setQuiz(data.questions)

    } catch (err) {
      console.error('Quiz generation error:', err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate score
  const calculateScore = () => {
    return quiz.filter(
      (question, index) =>
        selectedAnswers[index] === question.answer
    ).length
  }

  // Submit Quiz
  const submitQuiz = () => {
    if (Object.keys(selectedAnswers).length !== quiz.length) {
      setError('Please answer all questions before submitting.')
      return
    }

    setError('')

    const score = calculateScore()

    const doc = documents.find(
      item => String(item.id) === String(selectedDoc)
    )

    const incorrectTopics = quiz
      .filter((question, index) =>
        selectedAnswers[index] !== question.answer
      )
      .map(question => question.topic || 'Uncategorized')

    const attempt = {
      id: Date.now(),
      documentName: doc?.name || 'Unknown Document',
      score: score,
      totalQuestions: quiz.length,
      percentage: Number(
        ((score / quiz.length) * 100).toFixed(2)
      ),
      date: new Date().toLocaleString(),
      incorrectTopics: incorrectTopics
    }

    setQuizHistory(prev => {
      const updatedHistory = [attempt, ...prev]

      localStorage.setItem(
        'studyos_quiz_history',
        JSON.stringify(updatedHistory)
      )

      return updatedHistory
    })

    setSubmitted(true)
  }

  return (
    <div className="page">

      <h1>AI Quiz Generator 📝</h1>
      <p>Generate quizzes from your uploaded study materials.</p>

      <div className="quiz-generator">

        <h2>Generate Your Quiz</h2>

        {documents.length === 0 ? (
          <p>
            No documents found. Please upload a PDF first
            from the Documents page.
          </p>
        ) : (
          <>
            <label>Select Study Material</label>

            <select
              value={selectedDoc}
              onChange={e => setSelectedDoc(e.target.value)}
            >
              <option value="">Choose a document</option>

              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>

            <label>Number of Questions</label>

            <select
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>

            <button
              onClick={generateQuiz}
              disabled={loading || !selectedDoc}
            >
              {loading ? 'Generating Quiz...' : '✨ Generate AI Quiz'}
            </button>
          </>
        )}

        {error && <p className="quiz-error">{error}</p>}

      </div>

      {quiz.length > 0 && (
        <div className="quiz-content">

          <h2>Your AI Generated Quiz</h2>
          <p>Total Questions: {quiz.length}</p>

          {quiz.map((question, index) => (

            <div className="quiz-question" key={index}>

              <h3>
                Q{index + 1}. {question.question}
              </h3>

              <div className="quiz-options">

                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="quiz-option"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={selectedAnswers[index] === option}
                      disabled={submitted}
                      onChange={() =>
                        setSelectedAnswers(prev => ({
                          ...prev,
                          [index]: option
                        }))
                      }
                    />

                    {option}
                  </label>
                ))}

              </div>

              {submitted && (
                <div className="quiz-explanation">

                  <p>
                    <strong>Topic:</strong> {question.topic || 'Uncategorized'}
                  </p>

                  <p>
                    <strong>Correct Answer:</strong> {question.answer}
                  </p>

                  <p>
                    <strong>Explanation:</strong> {question.explanation}
                  </p>

                  <p>
                    {selectedAnswers[index] === question.answer
                      ? '✅ Correct!'
                      : '❌ Incorrect'}
                  </p>

                </div>
              )}

            </div>

          ))}

          {!submitted ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(selectedAnswers).length !== quiz.length}
            >
              Submit Quiz
            </button>
          ) : (
            <div className="quiz-result">

              <h2>🎉 Quiz Completed!</h2>

              <h3>
                Your Score: {calculateScore()} / {quiz.length}
              </h3>

              <h3>
                Percentage: {(
                  (calculateScore() / quiz.length) * 100
                ).toFixed(2)}%
              </h3>

              <button onClick={generateQuiz}>
                Generate New Quiz
              </button>

            </div>
          )}

        </div>
      )}

      <div className="quiz-history">

        <h2>📊 Quiz History</h2>

        {quizHistory.length === 0 ? (
          <p>No quiz attempts yet. Complete your first quiz!</p>
        ) : (
          quizHistory.map(attempt => (
            <div
              className="quiz-history-card"
              key={attempt.id}
            >
              <h3>{attempt.documentName}</h3>

              <p>
                Score: {attempt.score} / {attempt.totalQuestions}
              </p>

              <p>Percentage: {attempt.percentage}%</p>
              <p>Date: {attempt.date}</p>
            </div>
          ))
        )}

      </div>

    </div>
  )
}

export default Quiz
