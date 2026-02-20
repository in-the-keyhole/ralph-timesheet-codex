import { NavLink, Outlet } from 'react-router-dom'
import './App.css'

const navigationLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/time-entries', label: 'Time Entries' },
  { to: '/employees', label: 'Employees' },
  { to: '/projects', label: 'Projects' },
]

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-overline">Ralph Timesheet</p>
        <h1>Track project hours with confidence</h1>
        <p className="app-subtitle">
          Navigate the workspace to manage employees, projects, and time entries.
        </p>
      </header>

      <div className="app-body">
        <nav className="app-nav" aria-label="Primary">
          {navigationLinks.map(({ to, label, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <section className="app-page" aria-live="polite">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default App
