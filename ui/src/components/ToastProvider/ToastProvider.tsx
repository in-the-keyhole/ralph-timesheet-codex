import { Alert, Snackbar } from '@mui/material'
import type { AlertColor, SnackbarCloseReason } from '@mui/material'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ReactNode, SyntheticEvent } from 'react'

interface ToastMessage {
  key: number
  message: string
  severity: AlertColor
  duration?: number
}

interface ToastContextValue {
  showToast: (message: string, severity?: AlertColor, duration?: number) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback(
    (message: string, severity: AlertColor = 'info', duration = 4000) => {
      setToast({ key: Date.now(), message, severity, duration })
    },
    [],
  )

  const handleClose = (_?: Event | SyntheticEvent | null, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return
    }

    setToast(null)
  }

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
      showSuccess: (message: string) => showToast(message, 'success'),
      showError: (message: string) => showToast(message, 'error'),
      showInfo: (message: string) => showToast(message, 'info'),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={toast?.duration ?? 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast?.severity ?? 'info'}
          elevation={6}
          variant="filled"
          onClose={handleClose}
          sx={{ width: '100%' }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}

export { ToastProvider, useToast }
