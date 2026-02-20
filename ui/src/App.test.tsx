import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import {
  DashboardPage,
  EmployeesPage,
  ProjectsPage,
  TimeEntriesPage,
} from './pages'
vi.mock('./api/employees', () => ({
  getEmployees: vi.fn().mockResolvedValue([
    { id: 1, firstName: 'Avery', lastName: 'Stone', email: 'avery@example.com', department: 'Product' },
  ]),
}))

vi.mock('./api/projects', () => ({
  getProjects: vi.fn().mockResolvedValue([
    { id: 101, name: 'Atlas Payroll', code: 'AT-PAY', description: 'Payroll revamp', active: true },
  ]),
}))

vi.mock('./api/timeEntries', () => ({
  getTimeEntries: vi.fn().mockResolvedValue([]),
  createTimeEntry: vi.fn(),
  updateTimeEntry: vi.fn(),
  deleteTimeEntry: vi.fn(),
}))

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'time-entries', element: <TimeEntriesPage /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'projects', element: <ProjectsPage /> },
    ],
  },
]

describe('App shell navigation', () => {
  it('renders nav links and navigates between placeholder pages', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    const navItems = ['Dashboard', 'Time Entries', 'Employees', 'Projects']
    navItems.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: 'Time Entries' }))

    expect(screen.getByRole('heading', { name: 'Time Entries' })).toBeInTheDocument()
  })
})
