import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getEmployees } from '../../api/employees'
import { getProjects } from '../../api/projects'
import { createTimeEntry } from '../../api/timeEntries'
import TimeEntriesPage from '.'

vi.mock('../../api/employees', () => ({
  getEmployees: vi.fn(),
}))

vi.mock('../../api/projects', () => ({
  getProjects: vi.fn(),
}))

vi.mock('../../api/timeEntries', () => ({
  createTimeEntry: vi.fn(),
}))

const mockEmployees = [
  { id: 1, firstName: 'Avery', lastName: 'Stone', email: 'avery@example.com', department: 'Product' },
  { id: 2, firstName: 'Blake', lastName: 'West', email: 'blake@example.com', department: 'Engineering' },
]

const mockProjects = [
  { id: 101, name: 'Atlas Payroll', code: 'AT-PAY', description: 'Payroll revamp', active: true },
  { id: 205, name: 'Beacon Reporting', code: 'BCN-RPT', description: 'Executive dashboards', active: true },
]

describe('TimeEntriesPage', () => {
  const mockGetEmployees = vi.mocked(getEmployees)
  const mockGetProjects = vi.mocked(getProjects)
  const mockCreateTimeEntry = vi.mocked(createTimeEntry)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits a new time entry and resets the form', async () => {
    mockGetEmployees.mockResolvedValue(mockEmployees)
    mockGetProjects.mockResolvedValue(mockProjects)
    mockCreateTimeEntry.mockResolvedValue({
      id: 999,
      employeeId: 1,
      employeeFirstName: 'Avery',
      employeeLastName: 'Stone',
      employeeEmail: 'avery@example.com',
      projectId: 101,
      projectName: 'Atlas Payroll',
      projectCode: 'AT-PAY',
      date: '2024-11-05',
      hours: 4,
      description: 'Feature work',
    })

    render(<TimeEntriesPage />)

    const employeeSelect = await screen.findByLabelText(/employee/i)
    const projectSelect = await screen.findByLabelText(/project/i)
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    const hoursInput = screen.getByLabelText(/hours/i) as HTMLInputElement
    const descriptionInput = screen.getByLabelText(/description/i)

    const user = userEvent.setup()
    await user.selectOptions(employeeSelect, '1')
    await user.selectOptions(projectSelect, '101')
    await user.type(dateInput, '2024-11-05')
    await user.type(hoursInput, '4')
    await user.type(descriptionInput, 'Feature work')

    await user.click(screen.getByRole('button', { name: /log time entry/i }))

    await waitFor(() => {
      expect(mockCreateTimeEntry).toHaveBeenCalledWith({
        employeeId: 1,
        projectId: 101,
        date: '2024-11-05',
        hours: 4,
        description: 'Feature work',
      })
    })

    expect(await screen.findByText(/time entry recorded successfully/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(employeeSelect).toHaveValue('')
      expect(projectSelect).toHaveValue('')
      expect(dateInput).toHaveValue('')
      expect(hoursInput.value).toBe('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  it('surfaces backend validation errors to the user', async () => {
    mockGetEmployees.mockResolvedValue(mockEmployees)
    mockGetProjects.mockResolvedValue(mockProjects)
    mockCreateTimeEntry.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Hours must be in 15-minute increments.' } },
    })

    render(<TimeEntriesPage />)

    const employeeSelect = await screen.findByLabelText(/employee/i)
    const projectSelect = await screen.findByLabelText(/project/i)
    const dateInput = screen.getByLabelText(/date/i)
    const hoursInput = screen.getByLabelText(/hours/i)

    const user = userEvent.setup()
    await user.selectOptions(employeeSelect, '1')
    await user.selectOptions(projectSelect, '101')
    await user.type(dateInput, '2024-11-05')
    await user.type(hoursInput, '5')
    await user.click(screen.getByRole('button', { name: /log time entry/i }))

    expect(
      await screen.findByText(/hours must be in 15-minute increments/i),
    ).toBeInTheDocument()
  })

  it('renders an error alert when employee data fails to load', async () => {
    mockGetEmployees.mockRejectedValue(new Error('Network unavailable'))
    mockGetProjects.mockResolvedValue(mockProjects)

    render(<TimeEntriesPage />)

    expect(
      await screen.findByText(/unable to load employees/i),
    ).toBeInTheDocument()
  })
})
