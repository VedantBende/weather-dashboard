/**
 * Convert temperature from Kelvin to Celsius
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Celsius
 */
export const kelvinToCelsius = (kelvin) => {
  return Math.round(kelvin - 273.15)
}

/**
 * Convert temperature from Kelvin to Fahrenheit
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Fahrenheit
 */
export const kelvinToFahrenheit = (kelvin) => {
  return Math.round((kelvin - 273.15) * 9/5 + 32)
}

/**
 * Convert temperature from Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius) => {
  return Math.round(celsius * 9/5 + 32)
}

/**
 * Convert temperature from Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export const fahrenheitToCelsius = (fahrenheit) => {
  return Math.round((fahrenheit - 32) * 5/9)
}

/**
 * Format temperature with unit
 * @param {number} temp - Temperature value
 * @param {string} unit - Temperature unit ('celsius' or 'fahrenheit')
 * @returns {string} Formatted temperature string
 */
export const formatTemperature = (temp, unit = 'celsius') => {
  const symbol = unit === 'celsius' ? '°C' : '°F'
  return `${temp}${symbol}`
}

/**
 * Convert wind speed from m/s to km/h
 * @param {number} mps - Wind speed in m/s
 * @returns {number} Wind speed in km/h
 */
export const mpsToKmh = (mps) => {
  return Math.round(mps * 3.6)
}

/**
 * Convert wind speed from m/s to mph
 * @param {number} mps - Wind speed in m/s
 * @returns {number} Wind speed in mph
 */
export const mpsToMph = (mps) => {
  return Math.round(mps * 2.237)
}

/**
 * Format wind speed with unit
 * @param {number} speed - Wind speed in m/s
 * @param {string} unit - Unit preference ('metric' or 'imperial')
 * @returns {string} Formatted wind speed
 */
export const formatWindSpeed = (speed, unit = 'metric') => {
  if (unit === 'imperial') {
    return `${mpsToMph(speed)} mph`
  }
  return `${mpsToKmh(speed)} km/h`
}

/**
 * Get wind direction from degrees
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Wind direction abbreviation
 */
export const getWindDirection = (degrees) => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ]
  
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

/**
 * Format pressure
 * @param {number} pressure - Pressure in hPa
 * @returns {string} Formatted pressure
 */
export const formatPressure = (pressure) => {
  return `${pressure} hPa`
}

/**
 * Format humidity
 * @param {number} humidity - Humidity percentage
 * @returns {string} Formatted humidity
 */
export const formatHumidity = (humidity) => {
  return `${humidity}%`
}

/**
 * Format date and time
 * @param {Date|number} date - Date object or timestamp
 * @param {string} format - Format type ('date', 'time', 'datetime', 'short')
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date, format = 'datetime') => {
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
  
  const options = {
    date: { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    },
    datetime: { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    },
    short: { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }
  }
  
  return dateObj.toLocaleDateString('en-US', options[format])
}

/**
 * Get weather icon name based on OpenWeather icon code
 * @param {string} iconCode - OpenWeather icon code
 * @returns {string} Local icon filename
 */
export const getWeatherIcon = (iconCode) => {
  const iconMap = {
    '01d': 'sunny.svg',        // clear sky day
    '01n': 'clear-night.svg',  // clear sky night
    '02d': 'partly-cloudy.svg', // few clouds day
    '02n': 'partly-cloudy-night.svg', // few clouds night
    '03d': 'cloudy.svg',       // scattered clouds
    '03n': 'cloudy.svg',       // scattered clouds
    '04d': 'overcast.svg',     // broken clouds
    '04n': 'overcast.svg',     // broken clouds
    '09d': 'rainy.svg',        // shower rain
    '09n': 'rainy.svg',        // shower rain
    '10d': 'rainy.svg',        // rain day
    '10n': 'rainy.svg',        // rain night
    '11d': 'stormy.svg',       // thunderstorm
    '11n': 'stormy.svg',       // thunderstorm
    '13d': 'snowy.svg',        // snow
    '13n': 'snowy.svg',        // snow
    '50d': 'foggy.svg',        // mist
    '50n': 'foggy.svg',        // mist
  }
  
  return iconMap[iconCode] || 'sunny.svg'
}

/**
 * Get weather condition color theme
 * @param {string} condition - Weather main condition
 * @returns {Object} Color theme object
 */
export const getWeatherTheme = (condition) => {
  const themes = {
    Clear: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      background: 'from-yellow-400 to-orange-500',
      text: 'text-yellow-900'
    },
    Clouds: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      background: 'from-gray-400 to-gray-600',
      text: 'text-gray-900'
    },
    Rain: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: 'from-blue-400 to-blue-600',
      text: 'text-blue-900'
    },
    Drizzle: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      background: 'from-cyan-400 to-cyan-600',
      text: 'text-cyan-900'
    },
    Thunderstorm: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      background: 'from-purple-400 to-purple-600',
      text: 'text-purple-900'
    },
    Snow: {
      primary: '#e5e7eb',
      secondary: '#f3f4f6',
      background: 'from-gray-200 to-gray-400',
      text: 'text-gray-900'
    },
    Mist: {
      primary: '#9ca3af',
      secondary: '#d1d5db',
      background: 'from-gray-300 to-gray-500',
      text: 'text-gray-900'
    },
    default: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: 'from-blue-400 to-blue-600',
      text: 'text-blue-900'
    }
  }
  
  return themes[condition] || themes.default
}

/**
 * Calculate feels like description
 * @param {number} temp - Actual temperature
 * @param {number} feelsLike - Feels like temperature
 * @returns {string} Description of how it feels
 */
export const getFeelsLikeDescription = (temp, feelsLike) => {
  const diff = feelsLike - temp
  
  if (Math.abs(diff) < 2) {
    return 'Feels about the same'
  } else if (diff > 0) {
    return `Feels ${Math.abs(diff)}° warmer`
  } else {
    return `Feels ${Math.abs(diff)}° cooler`
  }
}

/**
 * Get UV index description
 * @param {number} uvIndex - UV index value
 * @returns {Object} UV index info with level and description
 */
export const getUVIndexInfo = (uvIndex) => {
  if (uvIndex <= 2) {
    return { level: 'Low', color: 'text-green-500', description: 'Minimal protection required' }
  } else if (uvIndex <= 5) {
    return { level: 'Moderate', color: 'text-yellow-500', description: 'Some protection required' }
  } else if (uvIndex <= 7) {
    return { level: 'High', color: 'text-orange-500', description: 'Protection essential' }
  } else if (uvIndex <= 10) {
    return { level: 'Very High', color: 'text-red-500', description: 'Extra protection needed' }
  } else {
    return { level: 'Extreme', color: 'text-purple-500', description: 'Stay indoors if possible' }
  }
}
