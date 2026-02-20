import { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import useTimeEntryForm from './useTimeEntryForm'

const TimeEntriesPage = () => {
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
  } = useTimeEntryForm()

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
        <Box component="form" onSubmit={handleSubmit} p={3} noValidate>
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
    </Stack>
  )
}

export default TimeEntriesPage
