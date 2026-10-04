import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, clearToken, getToken, saveToken } from './api'
import type { CurrentUser } from '../types'

interface LoginResponse {
  access_token?: string
  accessToken?: string
  user?: CurrentUser
}

interface AuthContextValue {
  user: CurrentUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<CurrentUser>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const token = getToken()

    if (!token) {
      setUser(null)
      return
    }

    try {
      const currentUser = await api.get<CurrentUser>('/auth/me')
      setUser(currentUser)
    } catch {
      clearToken()
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [])

  const login = async (
    email: string,
    password: string,
  ): Promise<CurrentUser> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    })

    const token = response.access_token || response.accessToken

    if (!token) {
      throw new Error('Login succeeded but no authentication token was returned.')
    }

    saveToken(token)

    const currentUser =
      response.user || (await api.get<CurrentUser>('/auth/me'))

    setUser(currentUser)

    return currentUser
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}