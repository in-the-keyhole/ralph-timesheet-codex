import { useCallback, useEffect, useState } from 'react'
import { deleteTimeEntry, getTimeEntries, updateTimeEntry } from '../../api/timeEntries'
import { buildUserFriendlyError, getApiErrorMessage } from '../../api/error'
import { useToast } from '../../components/ToastProvider'
import type { ChangeEvent } from 'react'
import type { TimeEntry, TimeEntryFilters, TimeEntryRequest } from '../../api/timeEntries'

interface TimeEntryFilterValues {
  employeeId: string
  startDate: string
  endDate: string
}

interface UseTimeEntriesTableResult {
  entries: TimeEntry[]
  loadingEntries: boolean
  entriesError: string | null
  filters: TimeEntryFilterValues
  handleFilterChange: (event: ChangeEvent<HTMLInputElement>) => void
  applyFilters: () => void
  resetFilters: () => void
  refreshEntries: () => Promise<void>
  deletingEntryId: number | null
  savingEntryId: number | null
  actionError: string | null
  clearActionError: () => void
  deleteEntry: (id: number) => Promise<void>
  updateEntry: (id: number, payload: TimeEntryRequest) => Promise<void>
}

const createInitialFilters = (): TimeEntryFilterValues => ({
  employeeId: '',
  startDate: '',
  endDate: '',
})

const buildFiltersPayload = (values: TimeEntryFilterValues): TimeEntryFilters | undefined => {
  const payload: TimeEntryFilters = {}

  if (values.employeeId) {
    payload.employeeId = Number(values.employeeId)
  }

  if (values.startDate) {
    payload.startDate = values.startDate
  }

  if (values.endDate) {
    payload.endDate = values.endDate
  }

  return Object.keys(payload).length > 0 ? payload : undefined
}

const useTimeEntriesTable = (): UseTimeEntriesTableResult => {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [entriesError, setEntriesError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TimeEntryFilterValues>(createInitialFilters)
  const [appliedFilters, setAppliedFilters] = useState<TimeEntryFilterValues>(createInitialFilters)
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null)
  const [savingEntryId, setSavingEntryId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { showSuccess } = useToast()

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true)
    setEntriesError(null)

    try {
      const data = await getTimeEntries(buildFiltersPayload(appliedFilters))
      setEntries(data)
    } catch (error) {
      setEntriesError(buildUserFriendlyError('Unable to load time entries.', error))
    } finally {
      setLoadingEntries(false)
    }
  }, [appliedFilters])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
  }

  const resetFilters = () => {
    const initial = createInitialFilters()
    setFilters(initial)
    setAppliedFilters(initial)
  }

  const refreshEntries = useCallback(async () => {
    await loadEntries()
  }, [loadEntries])

  const deleteEntryHandler = async (id: number) => {
    setActionError(null)
    setDeletingEntryId(id)
    try {
      await deleteTimeEntry(id)
      await loadEntries()
      showSuccess('Time entry deleted successfully.')
    } catch (error) {
      setActionError(buildUserFriendlyError('Unable to delete time entry.', error))
    } finally {
      setDeletingEntryId(null)
    }
  }

  const updateEntryHandler = async (id: number, payload: TimeEntryRequest) => {
    setActionError(null)
    setSavingEntryId(id)

    try {
      await updateTimeEntry(id, payload)
      await loadEntries()
      showSuccess('Time entry updated successfully.')
    } catch (error) {
      const message = buildUserFriendlyError('Unable to update time entry.', error)
      setActionError(message)
      throw new Error(getApiErrorMessage(error))
    } finally {
      setSavingEntryId(null)
    }
  }

  const clearActionError = () => setActionError(null)

  return {
    entries,
    loadingEntries,
    entriesError,
    filters,
    handleFilterChange,
    applyFilters,
    resetFilters,
    refreshEntries,
    deletingEntryId,
    savingEntryId,
    actionError,
    clearActionError,
    deleteEntry: deleteEntryHandler,
    updateEntry: updateEntryHandler,
  }
}

export default useTimeEntriesTable
export type { TimeEntryFilterValues }
