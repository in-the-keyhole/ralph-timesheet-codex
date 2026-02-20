import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { TimeEntryRequest } from '../../api/timeEntries'
import useTimeEntryForm, { TimeEntryFormValues } from './useTimeEntryForm'
import useTimeEntriesTable from './useTimeEntriesTable'

interface EditDialogState {
  entryId: number
  values: TimeEntryFormValues
}

const TimeEntriesPage = () => {
  const {
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
    deleteEntry,
    updateEntry,
  } = useTimeEntriesTable()

  const {
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
  } = useTimeEntryForm({ onSuccess: refreshEntries })

  const [editDialog, setEditDialog] = useState<EditDialogState | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  )

  const optionsLoading = loadingEmployees || loadingProjects
  const missingOptions = employees.length === 0 || projects.length === 0
  const isBaseDisabled = optionsLoading || missingOptions
  const isSubmitDisabled = isBaseDisabled || submitting
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitDisabled) {
      return
    }

    await submitForm()
  }

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    applyFilters()
  }

  const handleEditClick = (values: TimeEntryFormValues, entryId: number) => {
    setEditDialog({ entryId, values })
    setEditError(null)
    clearActionError()
  }

  const handleEditFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setEditDialog((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        values: {
          ...prev.values,
          [name]: value,
        },
      }
    })

    if (editError) {
      setEditError(null)
    }
  }

  const closeEditDialog = () => {
    setEditDialog(null)
    setEditError(null)
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editDialog) {
      return
    }

    const payload: TimeEntryRequest = {
      employeeId: Number(editDialog.values.employeeId),
      projectId: Number(editDialog.values.projectId),
      date: editDialog.values.date,
      hours: Number(editDialog.values.hours),
      description: editDialog.values.description.trim()
        ? editDialog.values.description.trim()
        : undefined,
    }

    try {
      await updateEntry(editDialog.entryId, payload)
      closeEditDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update time entry.'
      setEditError(message)
    }
  }

  const openEditDialogForEntry = (entryId: number) => {
    const entry = entries.find((item) => item.id === entryId)
    if (!entry) {
      return
    }

    handleEditClick(
      {
        employeeId: String(entry.employeeId),
        projectId: String(entry.projectId),
        date: entry.date,
        hours: entry.hours.toString(),
        description: entry.description ?? '',
      },
      entry.id,
    )
  }

  const handleDeleteClick = async (entryId: number) => {
    await deleteEntry(entryId)
  }

  return (
    <Stack spacing={3} component="article">
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Time Entries
        </Typography>
        <Typography color="text.secondary">
          Log new work against employees and projects with accurate hours and descriptions.
        </Typography>
      </Box>

      <Paper elevation={1}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          p={3}
          noValidate
          aria-label="Log time entry form"
        >
          <Stack spacing={2}>
            {(employeesError || projectsError) && (
              <Alert severity="error" role="alert">
                <Stack spacing={0.5}>
                  {employeesError && <span>{employeesError}</span>}
                  {projectsError && <span>{projectsError}</span>}
                </Stack>
              </Alert>
            )}

            {submissionError && (
              <Alert severity="error" role="alert">
                {submissionError}
              </Alert>
            )}

            {submissionSuccess && (
              <Alert severity="success" role="status">
                {submissionSuccess}
              </Alert>
            )}

            {optionsLoading && (
              <Box display="flex" alignItems="center" gap={1} aria-live="polite">
                <CircularProgress size={18} aria-label="Loading form data" />
                <Typography color="text.secondary" variant="body2">
                  Loading employees and projects...
                </Typography>
              </Box>
            )}

            {!optionsLoading && missingOptions && (
              <Alert severity="info" role="status">
                Add at least one employee and project before logging time entries.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Employee"
                  name="employeeId"
                  value={formValues.employeeId}
                  onChange={handleFieldChange}
                  required
                  fullWidth
                  disabled={isBaseDisabled || submitting}
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {`${employee.firstName} ${employee.lastName}`}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Project"
                  name="projectId"
                  value={formValues.projectId}
                  onChange={handleFieldChange}
                  required
                  fullWidth
                  disabled={isBaseDisabled || submitting}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Date"
                  name="date"
                  value={formValues.date}
                  onChange={handleFieldChange}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={isBaseDisabled || submitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  label="Hours"
                  name="hours"
                  value={formValues.hours}
                  onChange={handleFieldChange}
                  required
                  fullWidth
                  inputProps={{ step: 0.25, min: 0.25, max: 24 }}
                  disabled={isBaseDisabled || submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formValues.description}
                  onChange={handleFieldChange}
                  multiline
                  minRows={3}
                  placeholder="Optional context for this entry"
                  fullWidth
                  disabled={isBaseDisabled || submitting}
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
                {submitting ? 'Saving entry...' : 'Log time entry'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={1}>
        <Box p={3}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" component="h3" gutterBottom>
                Logged entries
              </Typography>
              <Typography color="text.secondary">
                Review submitted time entries, filter by employee and date range, or adjust records.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleFilterSubmit}
              noValidate
              aria-label="Time entry filters"
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Employee filter"
                    name="employeeId"
                    value={filters.employeeId}
                    onChange={handleFilterChange}
                    fullWidth
                  >
                    <option value="">All employees</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {`${employee.firstName} ${employee.lastName}`}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    label="Start date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    label="End date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button variant="text" onClick={resetFilters} type="button">
                  Reset
                </Button>
                <Button variant="contained" type="submit">
                  Apply filters
                </Button>
              </Box>
            </Box>

            {entriesError && (
              <Alert severity="error" role="alert">
                {entriesError}
              </Alert>
            )}

            {actionError && (
              <Alert severity="error" role="alert">
                {actionError}
              </Alert>
            )}

            {loadingEntries && (
              <Box display="flex" justifyContent="center" py={4} aria-live="polite">
                <CircularProgress aria-label="Loading time entries" />
              </Box>
            )}

            {!loadingEntries && entries.length > 0 && (
              <TableContainer>
                <Table aria-label="Time entries table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((entry) => {
                      const formattedDate = dateFormatter.format(new Date(entry.date))
                      const isDeleting = deletingEntryId === entry.id
                      const isUpdating = savingEntryId === entry.id

                      return (
                        <TableRow key={entry.id} hover>
                          <TableCell>{formattedDate}</TableCell>
                          <TableCell>{`${entry.employeeFirstName} ${entry.employeeLastName}`}</TableCell>
                          <TableCell>{entry.projectName}</TableCell>
                          <TableCell>{entry.hours.toFixed(2)}</TableCell>
                          <TableCell>{entry.description || '—'}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                  openEditDialogForEntry(entry.id)
                                }
                                disabled={isDeleting || isUpdating}
                                aria-label={`Edit time entry for ${entry.projectName} on ${entry.date}`}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                color="error"
                                onClick={() => handleDeleteClick(entry.id)}
                                disabled={isDeleting || isUpdating}
                                aria-label={`Delete time entry for ${entry.projectName} on ${entry.date}`}
                              >
                                {isDeleting ? 'Deleting…' : 'Delete'}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loadingEntries && entries.length === 0 && !entriesError && (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">
                  No time entries found for the selected filters.
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Paper>

      <Dialog open={Boolean(editDialog)} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <Box
          component="form"
          onSubmit={handleEditSubmit}
          noValidate
          aria-label="Edit time entry form"
        >
          <DialogTitle>Edit time entry</DialogTitle>
          <DialogContent>
            <Stack spacing={2} py={1}>
              {editError && (
                <Alert severity="error" role="alert">
                  {editError}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Employee"
                    name="employeeId"
                    value={editDialog?.values.employeeId || ''}
                    onChange={handleEditFieldChange}
                    fullWidth
                    required
                    disabled={!editDialog || savingEntryId === editDialog?.entryId}
                  >
                    <option value="">Select an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {`${employee.firstName} ${employee.lastName}`}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Project"
                    name="projectId"
                    value={editDialog?.values.projectId || ''}
                    onChange={handleEditFieldChange}
                    fullWidth
                    required
                    disabled={!editDialog || savingEntryId === editDialog?.entryId}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    type="date"
                    label="Date"
                    name="date"
                    value={editDialog?.values.date || ''}
                    onChange={handleEditFieldChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    required
                    disabled={!editDialog || savingEntryId === editDialog?.entryId}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    type="number"
                    label="Hours"
                    name="hours"
                    value={editDialog?.values.hours || ''}
                    onChange={handleEditFieldChange}
                    fullWidth
                    inputProps={{ step: 0.25, min: 0.25, max: 24 }}
                    required
                    disabled={!editDialog || savingEntryId === editDialog?.entryId}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={editDialog?.values.description || ''}
                    onChange={handleEditFieldChange}
                    multiline
                    minRows={3}
                    fullWidth
                    disabled={!editDialog || savingEntryId === editDialog?.entryId}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!editDialog || savingEntryId === editDialog?.entryId}
            >
              {savingEntryId === editDialog?.entryId ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}

export default TimeEntriesPage
