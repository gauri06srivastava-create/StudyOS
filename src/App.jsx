import { Routes, Route } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AITutor from './pages/AITutor'
import Document from './pages/Document'
import Quiz from './pages/Quiz'
import RevisionPlanner from './pages/RevisionPlanner'
import Progress from './pages/prog.jsx'
import StudyTimer from './pages/StudyTimer'
import AIStudyPlan from './pages/AIStudyPlan'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<Document />} />
          <Route path="/tutor" element={<AITutor />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/timer" element={<StudyTimer />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/revision" element={<RevisionPlanner />} />
          <Route path="/study-plan" element={<AIStudyPlan />} />
        </Routes>
      </main>
    </div>
  )
}

export default App