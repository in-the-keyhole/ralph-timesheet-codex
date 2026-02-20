import { useCallback, useEffect, useState } from 'react'
import { Project, getProjects } from '../../api/projects'

interface UseProjectsResult {
  projects: Project[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred while loading projects.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { projects, loading, error, refresh }
}

export default useProjects
