import {
  Alert,
  Box,
  Chip,
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
import useProjects from './useProjects'

const ProjectsPage = () => {
  const { projects, loading, error } = useProjects()
  const hasProjects = projects.length > 0

  return (
    <Stack spacing={3} component="article">
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Projects
        </Typography>
        <Typography color="text.secondary">
          Review ongoing initiatives, their scope, and current activation status.
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6} aria-live="polite">
          <CircularProgress aria-label="Loading projects" />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" role="alert">
          Unable to load projects. {error}
        </Alert>
      )}

      {!loading && !error && hasProjects && (
        <TableContainer component={Paper} elevation={1}>
          <Table aria-label="Projects table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.code}</TableCell>
                  <TableCell>{project.description || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={project.active ? 'Active' : 'Inactive'}
                      color={project.active ? 'success' : 'default'}
                      variant={project.active ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && !hasProjects && (
        <Paper elevation={1}>
          <Box p={3}>
            <Typography>No projects available yet. Start by adding your first initiative.</Typography>
          </Box>
        </Paper>
      )}
    </Stack>
  )
}

export default ProjectsPage
