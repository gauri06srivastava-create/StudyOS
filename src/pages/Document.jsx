
import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch (error) {
    console.error(`${key} read failed:`, error)
    return fallback
  }
}

function Document() {
  const [documents, setDocuments] = useState(() =>
    readStorage('studyos_documents', [])
  )

  const [generatedNotes, setGeneratedNotes] = useState(() =>
    readStorage('studyos_generated_notes', {})
  )

  const [chatHistory, setChatHistory] = useState(() =>
    readStorage('studyos_chat_history', {})
  )

  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState(null)
  const [questions, setQuestions] = useState({})
  const [askingId, setAskingId] = useState(null)

  // Save documents
  useEffect(() => {
    try {
      localStorage.setItem(
        'studyos_documents',
        JSON.stringify(documents)
      )
    } catch (error) {
      console.error('Documents save failed:', error)
      alert('Unable to save documents. Browser storage may be full.')
    }
  }, [documents])

  // Save generated notes
  useEffect(() => {
    try {
      localStorage.setItem(
        'studyos_generated_notes',
        JSON.stringify(generatedNotes)
      )
    } catch (error) {
      console.error('Notes save failed:', error)
    }
  }, [generatedNotes])

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem(
        'studyos_chat_history',
        JSON.stringify(chatHistory)
      )
    } catch (error) {
      console.error('Chat history save failed:', error)
    }
  }, [chatHistory])

  // 1. Upload PDF
  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files)

    const pdfFiles = selectedFiles.filter(
      (file) => file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
    )

    if (pdfFiles.length !== selectedFiles.length) {
      alert('Only PDF files are allowed!')
    }

    if (pdfFiles.length === 0) return

    setLoading(true)

    for (const file of pdfFiles) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/upload-pdf',
          {
            method: 'POST',
            body: formData
          }
        )

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        const newDocument = {
          id: `${Date.now()}-${file.name}`,
          name: data.filename,
          size: file.size,
          text: data.text,
          characters: data.total_characters
        }

        setDocuments((prev) => [
          ...prev,
          newDocument
        ])

      } catch (error) {
        alert(`Could not upload ${file.name}: ${error.message}`)
      }
    }

    setLoading(false)
    event.target.value = ''
  }

  // 2. Generate AI Notes
  const generateNotes = async (doc) => {
    setGeneratingId(doc.id)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/generate-notes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: doc.text
          })
        }
      )

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Notes generation failed')
      }

      setGeneratedNotes((prev) => ({
        ...prev,
        [doc.id]: data.notes
      }))

    } catch (error) {
      alert(`Notes Error: ${error.message}`)
    } finally {
      setGeneratingId(null)
    }
  }

  // 3. Download AI Notes as PDF
  const downloadNotesPDF = (doc) => {
    const notes = generatedNotes[doc.id]

    if (!notes) {
      alert('Please generate AI notes first!')
      return
    }

    const pdf = new jsPDF()
    const margin = 15
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const maxWidth = pageWidth - margin * 2

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text('StudyOS - Smart Notes', margin, 20)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)

    pdf.text(
      pdf.splitTextToSize(`Document: ${doc.name}`, maxWidth),
      margin,
      30
    )

    pdf.setFontSize(11)

    const lines = pdf.splitTextToSize(
      String(notes),
      maxWidth
    )

    let y = 45

    lines.forEach((line) => {
      if (y > pageHeight - 15) {
        pdf.addPage()
        y = 20
      }

      pdf.text(line, margin, y)
      y += 7
    })

    const fileName = doc.name
      .replace(/\.pdf$/i, '')
      .replace(/[^\w-]/g, '_')

    pdf.save(`${fileName}-Smart-Notes.pdf`)
  }

  // 4. Ask Questions from PDF
  const askQuestion = async (doc) => {
    const question = questions[doc.id]?.trim()

    if (!question) {
      alert('Please enter a question!')
      return
    }

    setAskingId(doc.id)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/ask-pdf',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: doc.text,
            question: question
          })
        }
      )

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get answer')
      }

      setChatHistory((prev) => ({
        ...prev,
        [doc.id]: [
          ...(prev[doc.id] || []),
          {
            question,
            answer: data.answer
          }
        ]
      }))

      setQuestions((prev) => ({
        ...prev,
        [doc.id]: ''
      }))

    } catch (error) {
      alert(`AI Tutor Error: ${error.message}`)
    } finally {
      setAskingId(null)
    }
  }

  // 5. Remove Document
  const removeDocument = (id) => {
    setDocuments((prev) =>
      prev.filter((doc) => doc.id !== id)
    )

    setGeneratedNotes((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })

    setChatHistory((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })

    setQuestions((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  return (
    <div className="page">
      <h1>My Documents 📚</h1>
      <p>Upload and manage your study materials.</p>

      {/* PDF Upload Section */}
      <div className="upload-section">
        <h2>Upload Study Material</h2>
        <p>Select PDF files to extract their text.</p>

        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileChange}
          disabled={loading}
        />

        {loading && (
          <p>Uploading and extracting text...</p>
        )}
      </div>

      {/* Uploaded Documents */}
      <div className="documents-list">
        <h2>Uploaded Documents ({documents.length})</h2>

        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div className="document-card" key={doc.id}>
              <div>
                <h3>📄 {doc.name}</h3>

                <p>
                  {(doc.size / 1024).toFixed(2)} KB
                </p>

                <p>
                  Extracted characters: {doc.characters}
                </p>

                {/* Extracted PDF Text */}
                <details>
                  <summary>View Extracted Text</summary>
                  <pre className="extracted-text">
                    {doc.text || 'No readable text found in this PDF.'}
                  </pre>
                </details>

                {/* AI Notes Generator */}
                <div className="generated-notes-section">
                  <button
                    onClick={() => generateNotes(doc)}
                    disabled={
                      generatingId === doc.id ||
                      !doc.text?.trim()
                    }
                  >
                    {generatingId === doc.id
                      ? 'Generating Notes...'
                      : '✨ Generate AI Notes'}
                  </button>

                  {generatedNotes[doc.id] && (
                    <div className="generated-notes">
                      <h3>✨ AI Generated Notes</h3>
                      <pre>{generatedNotes[doc.id]}</pre>
                    </div>
                  )}

                  <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <button
                      className="download-notes-btn"
                      onClick={() => downloadNotesPDF(doc)}
                      disabled={!generatedNotes[doc.id]}
                    >
                      📥 Download Notes as PDF
                    </button>
                  </div>
                </div>

                {/* Ask Your PDF */}
                <div className="ask-pdf-section">
                  <h3>🤖 Ask Your PDF</h3>

                  <input
                    type="text"
                    placeholder="Ask anything about this PDF..."
                    value={questions[doc.id] || ''}
                    onChange={(event) =>
                      setQuestions((prev) => ({
                        ...prev,
                        [doc.id]: event.target.value
                      }))
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' &&
                        !event.nativeEvent.isComposing
                      ) {
                        askQuestion(doc)
                      }
                    }}
                    disabled={askingId === doc.id}
                  />

                  <button
                    onClick={() => askQuestion(doc)}
                    disabled={
                      askingId === doc.id ||
                      !doc.text?.trim()
                    }
                  >
                    {askingId === doc.id
                      ? 'Thinking...'
                      : 'Ask AI'}
                  </button>

                  {/* Chat History */}
                  <div className="chat-history">
                    {chatHistory[doc.id]?.map((chat, index) => (
                      <div className="chat-message" key={index}>
                        <div className="user-message">
                          <strong>You:</strong>
                          <p>{chat.question}</p>
                        </div>

                        <div className="ai-message">
                          <strong>StudyOS AI:</strong>
                          <p>{chat.answer}</p>
                        </div>
                      </div>
                    ))}

                    {askingId === doc.id && (
                      <div className="ai-message typing-message">
                        <p>StudyOS AI is thinking...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => removeDocument(doc.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Document
