import { useCallback, useEffect, useState } from 'react'
import { Employee, getEmployees } from '../../api/employees'
import { buildUserFriendlyError } from '../../api/error'

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
    } catch (error) {
      setError(buildUserFriendlyError('Unable to load employees.', error))
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
