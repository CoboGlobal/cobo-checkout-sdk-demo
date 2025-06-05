import axios from 'axios'

// Create axios instance with custom config
const instance = axios.create({
  baseURL: '',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response
  },
  (error) => {
    // Handle errors globally
    console.error('API Error:', error)
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error (no response):', error.request)
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Request setup error:', error.message)
    }
    return Promise.reject(error)
  },
)

export default instance
