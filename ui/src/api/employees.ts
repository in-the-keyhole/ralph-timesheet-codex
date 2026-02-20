import client from './client'

export interface EmployeeRequest {
  firstName: string
  lastName: string
  email: string
  department: string
}

export interface Employee extends EmployeeRequest {
  id: number
}

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await client.get<Employee[]>('/employees')
  return response.data
}

export const getEmployee = async (id: number): Promise<Employee> => {
  const response = await client.get<Employee>(`/employees/${id}`)
  return response.data
}

export const createEmployee = async (
  payload: EmployeeRequest,
): Promise<Employee> => {
  const response = await client.post<Employee>('/employees', payload)
  return response.data
}

export const updateEmployee = async (
  id: number,
  payload: EmployeeRequest,
): Promise<Employee> => {
  const response = await client.put<Employee>(`/employees/${id}`, payload)
  return response.data
}
