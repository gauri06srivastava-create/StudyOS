
import { useState } from 'react'

function AITutor() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your StudyOS AI Tutor. Ask me anything about your study materials.'
    }
  ])

  const handleSend = () => {
    if (!message.trim()) return

    setMessages([
      ...messages,
      { role: 'user', text: message }
    ])

    setMessage('')
  }

  return (
    <div className="page tutor-page">
      <h1>AI Tutor 🤖</h1>
      <p>Your personal assistant for learning.</p>

      <div className="chat-container">
        <div className="chat-header">
          <h3>StudyOS Assistant</h3>
          <span>Ready to help you learn</span>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask your question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
          />

          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default AITutor
