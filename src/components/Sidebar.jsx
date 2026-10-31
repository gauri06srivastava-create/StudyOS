import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>StudyOS</h2>

      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/documents">My Documents</NavLink>
        <NavLink to="/tutor">AI Tutor</NavLink>
        <NavLink to="/quiz">Quiz & Practice</NavLink>
        <NavLink to="/progress">My Progress</NavLink>
        <NavLink to="/revision">📚 Smart Revision</NavLink>
        <NavLink to="/timer">⏱️ Study Timer</NavLink>
        <NavLink to="/study-plan">
  🧠 AI Study Plan
</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar