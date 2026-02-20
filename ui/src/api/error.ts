import axios from 'axios'

interface ApiErrorPayload {
  message?: string
  errors?: string[]
  error?: string
}

const isErrorPayload = (payload: unknown): payload is ApiErrorPayload =>
  typeof payload === 'object' && payload !== null

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorPayload | string | undefined

    if (typeof data === 'string' && data.trim().length > 0) {
      return data
    }

    if (isErrorPayload(data)) {
      if (data.message) {
        return data.message
      }

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(' ')
      }

      if (data.error) {
        return data.error
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export const buildUserFriendlyError = (prefix: string, error: unknown): string =>
  `${prefix} ${getApiErrorMessage(error)}`
