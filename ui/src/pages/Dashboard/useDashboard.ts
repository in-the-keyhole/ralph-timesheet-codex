import { useCallback, useEffect, useMemo, useState } from 'react'
import { Employee, getEmployees } from '../../api/employees'
import { getApiErrorMessage } from '../../api/error'
import { TimeEntry, getTimeEntries } from '../../api/timeEntries'

interface ProjectColumn {
  id: number
  name: string
  code: string
}

interface DaySummary {
  date: string
  label: string
  hoursByProject: Record<number, number>
  total: number
}

export interface WeeklySummary {
  projectColumns: ProjectColumn[]
  days: DaySummary[]
  totalsByProject: Record<number, number>
  grandTotal: number
}

interface UseDashboardResult {
  employees: Employee[]
  employeesLoading: boolean
  employeesError: string | null
  selectedEmployeeId: string
  weekRangeLabel: string
  summary: WeeklySummary | null
  summaryLoading: boolean
  summaryError: string | null
  handleEmployeeChange: (employeeId: string) => void
}

interface WeekBounds {
  start: Date
  end: Date
}

interface WeekDay {
  date: string
  label: string
}

const dayLabelFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const rangeLabelFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getWeekBounds = (baseDate: Date): WeekBounds => {
  const start = new Date(baseDate)
  start.setHours(0, 0, 0, 0)
  const dayOfWeek = start.getDay()
  const diffToMonday = (dayOfWeek + 6) % 7
  start.setDate(start.getDate() - diffToMonday)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return { start, end }
}

const createWeekDays = (weekStart: Date): WeekDay[] =>
  Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)

    return {
      date: formatDateInput(date),
      label: dayLabelFormatter.format(date),
    }
  })

const formatWeekRange = (start: Date, end: Date): string => {
  const startLabel = rangeLabelFormatter.format(start)
  const endLabel = rangeLabelFormatter.format(end)

  if (start.getFullYear() === end.getFullYear()) {
    return `${startLabel} – ${endLabel}, ${start.getFullYear()}`
  }

  return `${startLabel}, ${start.getFullYear()} – ${endLabel}, ${end.getFullYear()}`
}

const buildWeeklySummary = (entries: TimeEntry[], weekDays: WeekDay[]): WeeklySummary => {
  const projectLookup = new Map<number, ProjectColumn>()
  const totalsByProject: Record<number, number> = {}

  entries.forEach((entry) => {
    if (!projectLookup.has(entry.projectId)) {
      projectLookup.set(entry.projectId, {
        id: entry.projectId,
        name: entry.projectName,
        code: entry.projectCode,
      })
    }

    totalsByProject[entry.projectId] = (totalsByProject[entry.projectId] ?? 0) + entry.hours
  })

  const projectColumns = Array.from(projectLookup.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )

  const hoursByDay = weekDays.reduce<Record<string, Record<number, number>>>((acc, day) => {
    acc[day.date] = {}
    return acc
  }, {})

  entries.forEach((entry) => {
    if (!hoursByDay[entry.date]) {
      hoursByDay[entry.date] = {}
    }

    hoursByDay[entry.date][entry.projectId] =
      (hoursByDay[entry.date][entry.projectId] ?? 0) + entry.hours
  })

  const days: DaySummary[] = weekDays.map((day) => {
    const rowHours = hoursByDay[day.date] ?? {}
    const total = projectColumns.reduce(
      (sum, project) => sum + (rowHours[project.id] ?? 0),
      0,
    )

    return {
      date: day.date,
      label: day.label,
      hoursByProject: rowHours,
      total,
    }
  })

  const grandTotal = entries.reduce((sum, entry) => sum + entry.hours, 0)

  return { projectColumns, days, totalsByProject, grandTotal }
}

const useDashboard = (): UseDashboardResult => {
  const { start: currentWeekStart, end: currentWeekEnd } = useMemo(
    () => getWeekBounds(new Date()),
    [],
  )

  const weekDays = useMemo(() => createWeekDays(currentWeekStart), [currentWeekStart])
  const weekRangeLabel = useMemo(
    () => formatWeekRange(currentWeekStart, currentWeekEnd),
    [currentWeekStart, currentWeekEnd],
  )
  const weekStartIso = useMemo(() => formatDateInput(currentWeekStart), [currentWeekStart])
  const weekEndIso = useMemo(() => formatDateInput(currentWeekEnd), [currentWeekEnd])

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(true)
  const [employeesError, setEmployeesError] = useState<string | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')

  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
  }

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true)
    setEmployeesError(null)

    try {
      const data = await getEmployees()
      setEmployees(data)
      setSelectedEmployeeId((prev) => {
        if (prev && data.some((employee) => String(employee.id) === prev)) {
          return prev
        }

        return data.length > 0 ? String(data[0].id) : ''
      })
    } catch (error) {
      setEmployees([])
      setSelectedEmployeeId('')
      setEmployeesError(getApiErrorMessage(error))
    } finally {
      setEmployeesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const loadSummary = useCallback(
    async (employeeId: number) => {
      setSummaryLoading(true)
      setSummaryError(null)
      setSummary(null)

      try {
        const entries = await getTimeEntries({
          employeeId,
          startDate: weekStartIso,
          endDate: weekEndIso,
        })
        setSummary(buildWeeklySummary(entries, weekDays))
    } catch (error) {
      setSummary(null)
      setSummaryError(getApiErrorMessage(error))
      } finally {
        setSummaryLoading(false)
      }
    },
    [weekDays, weekStartIso, weekEndIso],
  )

  useEffect(() => {
    if (!selectedEmployeeId) {
      setSummary(null)
      return
    }

    void loadSummary(Number(selectedEmployeeId))
  }, [selectedEmployeeId, loadSummary])

  return {
    employees,
    employeesLoading,
    employeesError,
    selectedEmployeeId,
    weekRangeLabel,
    summary,
    summaryLoading,
    summaryError,
    handleEmployeeChange,
  }
}

export default useDashboard
