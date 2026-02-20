import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { getProjects } from '../../api/projects'
import ProjectsPage from '.'

vi.mock('../../api/projects', () => ({
  getProjects: vi.fn(),
}))

const mockProjects = [
  {
    id: 1,
    name: 'Atlas Payroll',
    code: 'AT-PAY',
    description: 'Payroll modernization',
    active: true,
  },
  {
    id: 2,
    name: 'Beacon Reporting',
    code: 'BCN-RPT',
    description: 'Executive dashboards',
    active: false,
  },
]

describe('ProjectsPage', () => {
  const mockGetProjects = vi.mocked(getProjects)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders projects in a table after loading', async () => {
    mockGetProjects.mockResolvedValue(mockProjects)

    render(<ProjectsPage />)

    expect(screen.getByLabelText(/loading projects/i)).toBeInTheDocument()

    expect(await screen.findByRole('cell', { name: /atlas payroll/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /at-pay/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /payroll modernization/i })).toBeInTheDocument()
    expect(screen.getByText(/^Active$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Inactive$/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByLabelText(/loading projects/i)).not.toBeInTheDocument()
    })
  })

  it('renders an error state when the request fails', async () => {
    mockGetProjects.mockRejectedValue(new Error('Network unavailable'))

    render(<ProjectsPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to load projects/i)
  })
})
