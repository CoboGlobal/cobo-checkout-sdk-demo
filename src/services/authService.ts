import type { AuthTokens } from '@/types'

/**
 * Mock response
 * In a real environment, you should call the actual API to get token (PSP backend authentication interface)
 */
async function getMockTokenResponse(): Promise<{ data: AuthTokens }> {
  return Promise.resolve({
    data: {
      access_token: 'xxx',
      refresh_token: 'xxx',
      token_type: 'Bearer',
      expires_in: 3600,
    },
  })
}

/**
 * Fetch new access token from API
 */
async function fetchNewToken(): Promise<AuthTokens> {
  try {
    const response = await getMockTokenResponse()
    const token: AuthTokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in || 3600,
      token_type: response.data.token_type,
    }
    return token
  } catch (error) {
    console.error('Error fetching token:', error)
    throw new Error('Failed to get access token')
  }
}

export async function getAccessToken(): Promise<AuthTokens> {
  return await fetchNewToken()
}

export default {
  getAccessToken,
}
