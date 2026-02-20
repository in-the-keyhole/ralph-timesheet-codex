import { useCallback, useEffect, useState } from 'react'
import { Project, getProjects } from '../../api/projects'
import { buildUserFriendlyError } from '../../api/error'

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
    } catch (error) {
      setError(buildUserFriendlyError('Unable to load projects.', error))
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
