import { useEffect, useState } from 'react'
import { getEmployees } from '../../api/employees'
import { buildUserFriendlyError } from '../../api/error'
import { getProjects } from '../../api/projects'
import { createTimeEntry } from '../../api/timeEntries'
import type { ChangeEvent } from 'react'
import type { Employee } from '../../api/employees'
import type { Project } from '../../api/projects'
import type { TimeEntryRequest } from '../../api/timeEntries'
import { useToast } from '../../components/ToastProvider'

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
  handleFieldChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  submitForm: () => Promise<void>
}

interface UseTimeEntryFormOptions {
  onSuccess?: () => void
}

const createInitialFormValues = (): TimeEntryFormValues => ({
  employeeId: '',
  projectId: '',
  date: '',
  hours: '',
  description: '',
})

const useTimeEntryForm = ({ onSuccess }: UseTimeEntryFormOptions = {}): UseTimeEntryFormResult => {
  const [formValues, setFormValues] = useState<TimeEntryFormValues>(createInitialFormValues)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [employeesError, setEmployeesError] = useState<string | null>(null)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const { showSuccess } = useToast()

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true)
      setEmployeesError(null)
      try {
        const data = await getEmployees()
        setEmployees(data)
      } catch (error) {
        setEmployeesError(buildUserFriendlyError('Unable to load employees.', error))
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
        setProjectsError(buildUserFriendlyError('Unable to load projects.', error))
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

  }

  const submitForm = async () => {
    setSubmitting(true)
    setSubmissionError(null)

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
      showSuccess('Time entry recorded successfully.')
      onSuccess?.()
    } catch (error) {
      setSubmissionError(buildUserFriendlyError('Unable to log time entry.', error))
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
    handleFieldChange,
    submitForm,
  }
}

export default useTimeEntryForm
export type { TimeEntryFormValues }
