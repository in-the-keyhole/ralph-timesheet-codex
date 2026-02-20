import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { getEmployees } from '../../api/employees'
import EmployeesPage from '.'

vi.mock('../../api/employees', () => ({
  getEmployees: vi.fn(),
}))

const mockEmployees = [
  {
    id: 1,
    firstName: 'Avery',
    lastName: 'Carter',
    email: 'avery@example.com',
    department: 'Product',
  },
  {
    id: 2,
    firstName: 'Blake',
    lastName: 'Hughes',
    email: 'blake@example.com',
    department: 'Engineering',
  },
]

describe('EmployeesPage', () => {
  const mockGetEmployees = vi.mocked(getEmployees)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employees in a table after loading', async () => {
    mockGetEmployees.mockResolvedValue(mockEmployees)

    render(<EmployeesPage />)

    expect(screen.getByLabelText(/loading employees/i)).toBeInTheDocument()

    expect(await screen.findByRole('cell', { name: /avery carter/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /avery@example.com/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /product/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByLabelText(/loading employees/i)).not.toBeInTheDocument()
    })
  })

  it('renders an error state when the request fails', async () => {
    mockGetEmployees.mockRejectedValue(new Error('Network unavailable'))

    render(<EmployeesPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unable to load employees/i,
    )
  })
})
