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
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import useEmployees from './useEmployees'

const EmployeesPage = () => {
  const { employees, loading, error } = useEmployees()
  const hasEmployees = employees.length > 0

  return (
    <Stack spacing={3} component="article">
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Employees
        </Typography>
        <Typography color="text.secondary">
          Keep track of team members, their contact details, and departments.
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6} aria-live="polite">
          <CircularProgress aria-label="Loading employees" />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" role="alert">
          Unable to load employees. {error}
        </Alert>
      )}

      {!loading && !error && hasEmployees && (
        <TableContainer component={Paper} elevation={1}>
          <Table aria-label="Employees table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && !hasEmployees && (
        <Paper elevation={1}>
          <Box p={3}>
            <Typography>No employees available yet. Add your first team member to begin.</Typography>
          </Box>
        </Paper>
      )}
    </Stack>
  )
}

export default EmployeesPage
