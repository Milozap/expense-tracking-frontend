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

export function setTokens(access: string) {
  localStorage.setItem('accessToken', access)
}

export function getAccessToken() {
  return localStorage.getItem('accessToken')
}

export function clearTokens() {
  localStorage.removeItem('accessToken')
}
