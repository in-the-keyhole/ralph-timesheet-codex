import { useCallback, useEffect, useState } from 'react'
import { Employee, getEmployees } from '../../api/employees'

interface UseEmployeesResult {
  employees: Employee[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const useEmployees = (): UseEmployeesResult => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred while loading employees.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { employees, loading, error, refresh }
}

export default useEmployees
