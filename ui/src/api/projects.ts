import client from './client'

export interface ProjectRequest {
  name: string
  code: string
  description?: string
  active: boolean
}

export interface Project extends ProjectRequest {
  id: number
}

export interface ProjectQueryParams {
  active?: boolean
}

export const getProjects = async (
  params?: ProjectQueryParams,
): Promise<Project[]> => {
  const response = await client.get<Project[]>('/projects', {
    params,
  })

  return response.data
}

export const getProject = async (id: number): Promise<Project> => {
  const response = await client.get<Project>(`/projects/${id}`)
  return response.data
}

export const createProject = async (
  payload: ProjectRequest,
): Promise<Project> => {
  const response = await client.post<Project>('/projects', payload)
  return response.data
}

export const updateProject = async (
  id: number,
  payload: ProjectRequest,
): Promise<Project> => {
  const response = await client.put<Project>(`/projects/${id}`, payload)
  return response.data
}
