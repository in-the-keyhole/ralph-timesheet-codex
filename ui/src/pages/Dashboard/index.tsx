import { useMemo } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import useDashboard from './useDashboard'

const DashboardPage = () => {
  const {
    employees,
    employeesLoading,
    employeesError,
    selectedEmployeeId,
    weekRangeLabel,
    summary,
    summaryLoading,
    summaryError,
    handleEmployeeChange,
  } = useDashboard()

  const hasEmployees = employees.length > 0
  const hasSummaryData = Boolean(summary && summary.projectColumns.length > 0)
  const hoursFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  )

  const formatHours = (value: number) => (value > 0 ? `${hoursFormatter.format(value)} h` : '—')

  return (
    <Stack spacing={3} component="article">
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Review weekly coverage by employee and project to ensure hours stay balanced.
        </Typography>
      </Box>

      {employeesLoading && (
        <Box display="flex" justifyContent="center" py={6} aria-live="polite">
          <CircularProgress aria-label="Loading employees" />
        </Box>
      )}

      {!employeesLoading && employeesError && (
        <Alert severity="error" role="alert">
          Unable to load employees. {employeesError}
        </Alert>
      )}

      {!employeesLoading && !employeesError && !hasEmployees && (
        <Paper elevation={1}>
          <Box p={3}>
            <Typography>
              No employees are available yet. Add a team member from the Employees page to start
              tracking activity.
            </Typography>
          </Box>
        </Paper>
      )}

      {hasEmployees && (
        <Paper elevation={1}>
          <Box p={3}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Weekly overview
                </Typography>
                <Typography color="text.secondary">
                  Select a teammate to review their hours for the week of {weekRangeLabel}.
                </Typography>
              </Box>

              <TextField
                select
                SelectProps={{ native: true }}
                label="Employee"
                value={selectedEmployeeId}
                onChange={(event) => handleEmployeeChange(event.target.value)}
                sx={{ maxWidth: 360 }}
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {`${employee.firstName} ${employee.lastName}`}
                  </option>
                ))}
              </TextField>

              <Typography color="text.secondary">Current week: {weekRangeLabel}</Typography>
            </Stack>
          </Box>
        </Paper>
      )}

      {hasEmployees && summaryError && (
        <Alert severity="error" role="alert">
          Unable to load the weekly summary. {summaryError}
        </Alert>
      )}

      {hasEmployees && summaryLoading && (
        <Box display="flex" justifyContent="center" py={6} aria-live="polite">
          <CircularProgress aria-label="Loading weekly summary" />
        </Box>
      )}

      {hasEmployees && !summaryLoading && !summaryError && summary && hasSummaryData && (
        <TableContainer component={Paper} elevation={1}>
          <Table aria-label="Weekly summary table">
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                {summary.projectColumns.map((project) => (
                  <TableCell key={project.id} align="center">
                    <Typography fontWeight={600}>{project.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.code}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="right">Daily total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.days.map((day) => (
                <TableRow key={day.date} hover>
                  <TableCell component="th" scope="row">
                    {day.label}
                  </TableCell>
                  {summary.projectColumns.map((project) => {
                    const projectHours = day.hoursByProject[project.id] ?? 0
                    return (
                      <TableCell key={`${day.date}-${project.id}`} align="center">
                        {formatHours(projectHours)}
                      </TableCell>
                    )
                  })}
                  <TableCell align="right">{formatHours(day.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell component="th" scope="row">
                  Weekly total
                </TableCell>
                {summary.projectColumns.map((project) => (
                  <TableCell key={`total-${project.id}`} align="center">
                    {formatHours(summary.totalsByProject[project.id] ?? 0)}
                  </TableCell>
                ))}
                <TableCell align="right">{formatHours(summary.grandTotal)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}

      {hasEmployees && !summaryLoading && !summaryError && summary && !hasSummaryData && (
        <Paper elevation={1}>
          <Box p={3}>
            <Typography>
              No time has been logged for this employee in the week of {weekRangeLabel}. Have them
              record entries from the Time Entries page to populate this view.
            </Typography>
          </Box>
        </Paper>
      )}
    </Stack>
  )
}

export default DashboardPage
