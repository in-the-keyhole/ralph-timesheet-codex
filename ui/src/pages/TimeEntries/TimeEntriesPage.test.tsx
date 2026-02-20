import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getEmployees } from '../../api/employees'
import { getProjects } from '../../api/projects'
import {
  createTimeEntry,
  deleteTimeEntry,
  getTimeEntries,
  updateTimeEntry,
} from '../../api/timeEntries'
import TimeEntriesPage from '.'

vi.mock('../../api/employees', () => ({
  getEmployees: vi.fn(),
}))

vi.mock('../../api/projects', () => ({
  getProjects: vi.fn(),
}))

vi.mock('../../api/timeEntries', () => ({
  createTimeEntry: vi.fn(),
  getTimeEntries: vi.fn(),
  deleteTimeEntry: vi.fn(),
  updateTimeEntry: vi.fn(),
}))

const mockEmployees = [
  { id: 1, firstName: 'Avery', lastName: 'Stone', email: 'avery@example.com', department: 'Product' },
  { id: 2, firstName: 'Blake', lastName: 'West', email: 'blake@example.com', department: 'Engineering' },
]

const mockProjects = [
  { id: 101, name: 'Atlas Payroll', code: 'AT-PAY', description: 'Payroll revamp', active: true },
  { id: 205, name: 'Beacon Reporting', code: 'BCN-RPT', description: 'Executive dashboards', active: true },
]

const mockTimeEntries = [
  {
    id: 500,
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
  },
  {
    id: 501,
    employeeId: 2,
    employeeFirstName: 'Blake',
    employeeLastName: 'West',
    employeeEmail: 'blake@example.com',
    projectId: 205,
    projectName: 'Beacon Reporting',
    projectCode: 'BCN-RPT',
    date: '2024-11-06',
    hours: 2.5,
    description: null,
  },
]

describe('TimeEntriesPage', () => {
  const mockGetEmployees = vi.mocked(getEmployees)
  const mockGetProjects = vi.mocked(getProjects)
  const mockCreateTimeEntry = vi.mocked(createTimeEntry)
  const mockGetTimeEntries = vi.mocked(getTimeEntries)
  const mockDeleteTimeEntry = vi.mocked(deleteTimeEntry)
  const mockUpdateTimeEntry = vi.mocked(updateTimeEntry)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEmployees.mockResolvedValue(mockEmployees)
    mockGetProjects.mockResolvedValue(mockProjects)
    mockGetTimeEntries.mockResolvedValue(mockTimeEntries)
    mockCreateTimeEntry.mockResolvedValue(mockTimeEntries[0])
    mockDeleteTimeEntry.mockResolvedValue()
    mockUpdateTimeEntry.mockResolvedValue(mockTimeEntries[0])
  })

  it('renders time entries in a table', async () => {
    render(<TimeEntriesPage />)

    const table = await screen.findByRole('table', { name: /time entries table/i })
    expect(within(table).getByText(/atlas payroll/i)).toBeInTheDocument()
    expect(within(table).getByText(/beacon reporting/i)).toBeInTheDocument()
  })

  it('applies filters when submitted', async () => {
    render(<TimeEntriesPage />)

    await waitFor(() => expect(mockGetTimeEntries).toHaveBeenCalledTimes(1))

    const employeeFilter = screen.getByLabelText(/employee filter/i)
    const startDate = screen.getByLabelText(/start date/i)
    const endDate = screen.getByLabelText(/end date/i)

    const user = userEvent.setup()
    await user.selectOptions(employeeFilter, '1')
    await user.type(startDate, '2024-11-01')
    await user.type(endDate, '2024-11-30')
    await user.click(screen.getByRole('button', { name: /apply filters/i }))

    await waitFor(() => expect(mockGetTimeEntries).toHaveBeenCalledTimes(2))
    expect(mockGetTimeEntries.mock.calls[1][0]).toEqual({
      employeeId: 1,
      startDate: '2024-11-01',
      endDate: '2024-11-30',
    })
  })

  it('deletes a time entry and refreshes the table', async () => {
    render(<TimeEntriesPage />)

    await waitFor(() => expect(mockGetTimeEntries).toHaveBeenCalledTimes(1))

    const deleteButton = await screen.findByRole('button', {
      name: /delete time entry for atlas payroll on 2024-11-05/i,
    })

    const user = userEvent.setup()
    await user.click(deleteButton)

    await waitFor(() => expect(mockDeleteTimeEntry).toHaveBeenCalledWith(500))
    await waitFor(() => expect(mockGetTimeEntries).toHaveBeenCalledTimes(2))
  })

  it('edits a time entry with updated values', async () => {
    render(<TimeEntriesPage />)

    const editButton = await screen.findByRole('button', {
      name: /edit time entry for atlas payroll on 2024-11-05/i,
    })

    const user = userEvent.setup()
    await user.click(editButton)

    const dialog = await screen.findByRole('dialog', { name: /edit time entry/i })
    const hoursInput = within(dialog).getByLabelText(/hours/i) as HTMLInputElement
    await user.clear(hoursInput)
    await user.type(hoursInput, '6')
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }))

    await waitFor(() =>
      expect(mockUpdateTimeEntry).toHaveBeenCalledWith(500, {
        employeeId: 1,
        projectId: 101,
        date: '2024-11-05',
        hours: 6,
        description: 'Feature work',
      }),
    )
    await waitFor(() => expect(mockGetTimeEntries).toHaveBeenCalledTimes(2))
  })

  it('submits a new time entry, resets the form, and refreshes the table', async () => {
    render(<TimeEntriesPage />)

    const createForm = await screen.findByRole('form', { name: /log time entry/i })
    const employeeSelect = createForm.querySelector<HTMLSelectElement>('select[name="employeeId"]')!
    const projectSelect = createForm.querySelector<HTMLSelectElement>('select[name="projectId"]')!
    const dateInput = createForm.querySelector<HTMLInputElement>('input[name="date"]')!
    const hoursInput = createForm.querySelector<HTMLInputElement>('input[name="hours"]')!
    const descriptionInput = createForm.querySelector<HTMLTextAreaElement>('textarea[name="description"]')!

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

    await waitFor(() => expect(mockGetTimeEntries).toHaveBeenCalledTimes(2))
  })

  it('surfaces backend validation errors to the user', async () => {
    mockCreateTimeEntry.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Hours must be in 15-minute increments.' } },
    })

    render(<TimeEntriesPage />)

    const createForm = await screen.findByRole('form', { name: /log time entry/i })
    const employeeSelect = createForm.querySelector<HTMLSelectElement>('select[name="employeeId"]')!
    const projectSelect = createForm.querySelector<HTMLSelectElement>('select[name="projectId"]')!
    const dateInput = createForm.querySelector<HTMLInputElement>('input[name="date"]')!
    const hoursInput = createForm.querySelector<HTMLInputElement>('input[name="hours"]')!

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

    render(<TimeEntriesPage />)

    expect(
      await screen.findByText(/unable to load employees/i),
    ).toBeInTheDocument()
  })
})
