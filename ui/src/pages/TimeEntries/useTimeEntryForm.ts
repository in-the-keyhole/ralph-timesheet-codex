import { ChangeEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { Employee, getEmployees } from '../../api/employees'
import { Project, getProjects } from '../../api/projects'
import { TimeEntryRequest, createTimeEntry } from '../../api/timeEntries'

interface TimeEntryFormValues {
  employeeId: string
  projectId: string
  date: string
  hours: string
  description: string
}

interface UseTimeEntryFormResult {
  formValues: TimeEntryFormValues
  employees: Employee[]
  projects: Project[]
  loadingEmployees: boolean
  loadingProjects: boolean
  employeesError: string | null
  projectsError: string | null
  submitting: boolean
  submissionError: string | null
  submissionSuccess: string | null
  handleFieldChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  submitForm: () => Promise<void>
}

const createInitialFormValues = (): TimeEntryFormValues => ({
  employeeId: '',
  projectId: '',
  date: '',
  hours: '',
  description: '',
})

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string; errors?: string[] }>(error)) {
    const data = error.response?.data

    if (data?.message) {
      return data.message
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join(' ')
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred.'
}

const useTimeEntryForm = (): UseTimeEntryFormResult => {
  const [formValues, setFormValues] = useState<TimeEntryFormValues>(createInitialFormValues)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [employeesError, setEmployeesError] = useState<string | null>(null)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true)
      setEmployeesError(null)
      try {
        const data = await getEmployees()
        setEmployees(data)
      } catch (error) {
        setEmployeesError(`Unable to load employees. ${getErrorMessage(error)}`)
      } finally {
        setLoadingEmployees(false)
      }
    }

    loadEmployees()
  }, [])

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true)
      setProjectsError(null)
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        setProjectsError(`Unable to load projects. ${getErrorMessage(error)}`)
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()
  }, [])

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (submissionError) {
      setSubmissionError(null)
    }

    if (submissionSuccess) {
      setSubmissionSuccess(null)
    }
  }

  const submitForm = async () => {
    setSubmitting(true)
    setSubmissionError(null)
    setSubmissionSuccess(null)

    const payload: TimeEntryRequest = {
      employeeId: Number(formValues.employeeId),
      projectId: Number(formValues.projectId),
      date: formValues.date,
      hours: Number(formValues.hours),
      description: formValues.description.trim() ? formValues.description.trim() : undefined,
    }

    try {
      await createTimeEntry(payload)
      setFormValues(createInitialFormValues())
      setSubmissionSuccess('Time entry recorded successfully.')
    } catch (error) {
      setSubmissionError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formValues,
    employees,
    projects,
    loadingEmployees,
    loadingProjects,
    employeesError,
    projectsError,
    submitting,
    submissionError,
    submissionSuccess,
    handleFieldChange,
    submitForm,
  }
}

export default useTimeEntryForm
