import client from './client'

export interface TimeEntryRequest {
  employeeId: number
  projectId: number
  date: string
  hours: number
  description?: string
}

export interface TimeEntry {
  id: number
  employeeId: number
  employeeFirstName: string
  employeeLastName: string
  employeeEmail: string
  projectId: number
  projectName: string
  projectCode: string
  date: string
  hours: number
  description: string | null
}

export interface TimeEntryFilters {
  employeeId?: number
  projectId?: number
  startDate?: string
  endDate?: string
}

const buildQueryParams = (filters?: TimeEntryFilters) => {
  if (!filters) {
    return undefined
  }

  return Object.entries(filters).reduce<Record<string, string | number>>(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value
      }
      return acc
    },
    {},
  )
}

export const getTimeEntries = async (
  filters?: TimeEntryFilters,
): Promise<TimeEntry[]> => {
  const response = await client.get<TimeEntry[]>('/time-entries', {
    params: buildQueryParams(filters),
  })

  return response.data
}

export const getTimeEntry = async (id: number): Promise<TimeEntry> => {
  const response = await client.get<TimeEntry>(`/time-entries/${id}`)
  return response.data
}

export const createTimeEntry = async (
  payload: TimeEntryRequest,
): Promise<TimeEntry> => {
  const response = await client.post<TimeEntry>('/time-entries', payload)
  return response.data
}

export const updateTimeEntry = async (
  id: number,
  payload: TimeEntryRequest,
): Promise<TimeEntry> => {
  const response = await client.put<TimeEntry>(`/time-entries/${id}`, payload)
  return response.data
}

export const deleteTimeEntry = async (id: number): Promise<void> => {
  await client.delete(`/time-entries/${id}`)
}
