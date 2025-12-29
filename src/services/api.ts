const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/api/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })

  if (!response.ok) {
    throw new Error(response.status === 401 ? 'Invalid credentials' : 'Login failed')
  }

  return response.json()
}

export async function register(username: string, email: string, password: string) {
  const errorMessages = new Map([
    [409, 'Account already exists'],
    [422, 'Password does not meet requirements'],
    [500, 'Registration failed, please try again'],
  ])

  const response = await fetch(`${API_URL}/api/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  })

  if (!response.ok) {
    const status = response.status
    if (status === 400) {
      const data = await response.json()
      if (data.username) throw new Error('Username already exists')
      if (data.email) throw new Error('Email already in use')
      throw new Error(data.detail || 'Registration failed')
    }

    if (errorMessages.has(status)) {
      throw new Error(errorMessages.get(status) ?? response.statusText)
    }

    throw new Error('Registration failed')
  }

  return response.json()
}

export function setTokens(access: string) {
  localStorage.setItem('accessToken', access)
}

export function getAccessToken() {
  return localStorage.getItem('accessToken')
}

export function clearTokens() {
  localStorage.removeItem('accessToken')
}
