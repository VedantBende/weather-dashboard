/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<Object>} Location coordinates and accuracy
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        let errorMessage = 'Failed to get location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
          default:
            errorMessage = 'An unknown error occurred while getting location'
        }
        
        reject(new Error(errorMessage))
      },
      options
    )
  })
}

/**
 * Watch user's location for changes
 * @param {Function} callback - Callback function for location updates
 * @param {Function} errorCallback - Callback function for errors
 * @returns {number} Watch ID for clearing the watch
 */
export const watchLocation = (callback, errorCallback) => {
  if (!navigator.geolocation) {
    errorCallback(new Error('Geolocation is not supported by this browser'))
    return null
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      })
    },
    (error) => {
      let errorMessage = 'Failed to watch location'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out'
          break
        default:
          errorMessage = 'An unknown error occurred while watching location'
      }
      
      errorCallback(new Error(errorMessage))
    },
    options
  )
}

/**
 * Clear location watch
 * @param {number} watchId - Watch ID returned by watchLocation
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180)
}

/**
 * Check if geolocation permission is granted
 * @returns {Promise<string>} Permission state
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    return 'unknown'
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' })
    return permission.state // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.warn('Unable to check location permission:', error)
    return 'unknown'
  }
}

/**
 * Get location with timeout and retry logic
 * @param {number} retries - Number of retry attempts
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Location coordinates
 */
export const getLocationWithRetry = async (retries = 3, timeout = 8000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const location = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Location request timed out'))
        }, timeout)

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId)
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
          },
          (error) => {
            clearTimeout(timeoutId)
            reject(error)
          },
          {
            enableHighAccuracy: i === 0, // Use high accuracy on first attempt
            timeout: timeout - 1000,
            maximumAge: i > 0 ? 300000 : 0 // Use cached location on retries
          }
        )
      })
      
      return location
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
