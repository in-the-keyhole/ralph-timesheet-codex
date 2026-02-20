import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in application tree', error, errorInfo)
  }

  private handleReload = () => {
    this.setState({ hasError: false, message: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minHeight="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="#f5f5f5"
          px={2}
        >
          <Paper elevation={3} sx={{ maxWidth: 520, width: '100%' }}>
            <Box p={4}>
              <Stack spacing={2}>
                <Typography variant="h4" component="h1">
                  Something went wrong
                </Typography>
                <Typography color="text.secondary">
                  We hit an unexpected error while rendering the app. Refresh to continue working or
                  contact support if the issue persists.
                </Typography>
                {this.state.message && (
                  <Alert severity="error" role="alert">
                    {this.state.message}
                  </Alert>
                )}
                <Box>
                  <Button variant="contained" onClick={this.handleReload}>
                    Reload app
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
