import { render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getEmployees } from '../../api/employees'
import { getTimeEntries, type TimeEntry } from '../../api/timeEntries'
import DashboardPage from '.'

vi.mock('../../api/employees', () => ({
  getEmployees: vi.fn(),
}))

vi.mock('../../api/timeEntries', () => ({
  getTimeEntries: vi.fn(),
}))

const mockEmployees = [
  { id: 1, firstName: 'Avery', lastName: 'Stone', email: 'avery@example.com', department: 'Product' },
  { id: 2, firstName: 'Blake', lastName: 'West', email: 'blake@example.com', department: 'Engineering' },
]

let currentWeekStart = ''
let currentWeekEnd = ''

const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const computeCurrentWeekRange = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const diffToMonday = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - diffToMonday)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
  }
}

const createTimeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 500,
  employeeId: 1,
  employeeFirstName: 'Avery',
  employeeLastName: 'Stone',
  employeeEmail: 'avery@example.com',
  projectId: 10,
  projectName: 'Atlas Payroll',
  projectCode: 'AT-PAY',
  date: currentWeekStart,
  hours: 4,
  description: 'Feature work',
  ...overrides,
})

describe('DashboardPage', () => {
  const mockGetEmployees = vi.mocked(getEmployees)
  const mockGetTimeEntries = vi.mocked(getTimeEntries)

  beforeEach(() => {
    vi.clearAllMocks()
    const range = computeCurrentWeekRange()
    currentWeekStart = range.start
    currentWeekEnd = range.end
    mockGetEmployees.mockResolvedValue(mockEmployees)
    mockGetTimeEntries.mockResolvedValue([])
  })

  it('renders the weekly summary table for the selected employee', async () => {
    mockGetTimeEntries.mockResolvedValue([
      createTimeEntry({ id: 201, hours: 4 }),
      createTimeEntry({
        id: 202,
        projectId: 20,
        projectName: 'Beacon Reporting',
        projectCode: 'BCN-RPT',
        hours: 2,
      }),
    ])

    render(<DashboardPage />)

    const table = await screen.findByRole('table', { name: /weekly summary/i })
    expect(within(table).getByText(/atlas payroll/i)).toBeInTheDocument()
    expect(within(table).getByText(/beacon reporting/i)).toBeInTheDocument()
    expect(within(table).getAllByText('6 h').length).toBeGreaterThan(0)
    expect(within(table).getAllByText('2 h').length).toBeGreaterThan(0)

    await waitFor(() =>
      expect(mockGetTimeEntries).toHaveBeenCalledWith({
        employeeId: 1,
        startDate: currentWeekStart,
        endDate: currentWeekEnd,
      }),
    )
  })

  it('shows a helpful message when no entries are available for the week', async () => {
    render(<DashboardPage />)

    expect(
      await screen.findByText(/no time has been logged for this employee/i),
    ).toBeInTheDocument()
  })

  it('renders an error state when the summary request fails', async () => {
    mockGetTimeEntries.mockRejectedValue(new Error('Network unavailable'))

    render(<DashboardPage />)

    expect(
      await screen.findByText(/unable to load the weekly summary/i),
    ).toBeInTheDocument()
  })
})
