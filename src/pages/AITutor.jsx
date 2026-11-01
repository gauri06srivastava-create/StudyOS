import { useState } from 'react'

function AITutor() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your StudyOS AI Tutor. Ask me anything about your study materials.'
    }
  ])

  const handleSend = async () => {
    if (!message.trim() || loading) return

    const userMessage = message.trim()

    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMessage }
    ])

    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(
        'https://studyos-08bx.onrender.com/ai-tutor',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userMessage
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'AI Tutor request failed')
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'I could not generate a response.'
        }
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Error: ${error.message}`
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page tutor-page">
      <h1>AI Tutor 🤖</h1>
      <p>Your personal assistant for learning.</p>

      <div className="chat-container">
        <div className="chat-header">
          <h3>StudyOS Assistant</h3>
          <span>{loading ? 'Thinking...' : 'Ready to help you learn'}</span>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role}`}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              Thinking...
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask your question..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend()
            }}
          />

          <button onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AITutor