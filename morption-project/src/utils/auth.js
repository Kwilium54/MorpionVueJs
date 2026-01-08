import { setApiKey } from '@/api'

export const initAuth = () => {
  const apiKey = sessionStorage.getItem('morpion_api_key')
  if (apiKey) {
    setApiKey(apiKey)
  }
  return apiKey
}

export const isAuthenticated = () => {
  return !!sessionStorage.getItem('morpion_api_key')
}
