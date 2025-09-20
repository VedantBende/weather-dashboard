import axios from 'axios'

// OpenWeatherMap API configuration
const API_KEY = '67a172fd6aac31aee1c6644d11e18130' // API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  params: {
    appid: API_KEY
  }
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your OpenWeatherMap API key.')
    } else if (error.response?.status === 404) {
      throw new Error('City not found. Please check the city name and try again.')
    } else if (error.response?.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.')
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch weather data')
    }
  }
)

/**
 * Fetch current weather data for a city or coordinates
 * @param {string} cityName - Name of the city
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export const fetchCurrentWeather = async (cityName = null, lat = null, lon = null) => {
  try {
    let params = {}
    
    if (cityName) {
      params.q = cityName
    } else if (lat && lon) {
      params.lat = lat
      params.lon = lon
    } else {
      throw new Error('Either city name or coordinates must be provided')
    }

    const response = await api.get('/weather', { params })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Fetch 5-day weather forecast
 * @param {string} cityName - Name of the city
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Forecast data
 */
export const fetchWeatherForecast = async (cityName = null, lat = null, lon = null) => {
  try {
    let params = {}
    
    if (cityName) {
      params.q = cityName
    } else if (lat && lon) {
      params.lat = lat
      params.lon = lon
    } else {
      throw new Error('Either city name or coordinates must be provided')
    }

    const response = await api.get('/forecast', { params })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Search for cities by name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of city suggestions
 */
export const searchCities = async (query) => {
  try {
    const response = await api.get('/find', {
      params: {
        q: query,
        type: 'like',
        sort: 'population',
        cnt: 5
      }
    })
    return response.data.list || []
  } catch (error) {
    console.warn('City search failed, returning empty array')
    return []
  }
}

/**
 * Get weather data for multiple cities
 * @param {Array} cityIds - Array of city IDs
 * @returns {Promise<Array>} Array of weather data
 */
export const fetchMultipleCities = async (cityIds) => {
  try {
    const response = await api.get('/group', {
      params: {
        id: cityIds.join(',')
      }
    })
    return response.data.list || []
  } catch (error) {
    throw error
  }
}
