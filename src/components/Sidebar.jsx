
import { NavLink } from 'react-router-dom'

function Sidebar() {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '⌂', end: true },
    { path: '/documents', label: 'My Documents', icon: '📁' },
    { path: '/tutor', label: 'AI Tutor', icon: '🤖' },
    { path: '/quiz', label: 'Quiz & Practice', icon: '📝' },
    { path: '/progress', label: 'My Progress', icon: '📊' },
    { path: '/revision', label: 'Smart Revision', icon: '📚' },
    { path: '/timer', label: 'Study Timer', icon: '⏱️' },
    { path: '/study-plan', label: 'AI Study Plan', icon: '🎯' }
  ]

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">StudyOS<span>.</span></h2>
      <p className="sidebar-subtitle">YOUR SMART STUDY SPACE</p>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>✨</span> Learn smarter, not harder.
      </div>
    </aside>
  )
}

export default Sidebar
