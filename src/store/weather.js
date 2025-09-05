import { defineStore } from 'pinia'
import { fetchCurrentWeather, fetchWeatherForecast } from '@/utils/api'
import { getCurrentLocation } from '@/utils/geolocation'

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    // Weather data
    currentWeather: null,
    forecast: [],
    hourlyForecast: [],
    
    // User preferences
    favorites: JSON.parse(localStorage.getItem('weatherFavorites') || '[]'),
    unit: localStorage.getItem('temperatureUnit') || 'celsius',
    darkMode: JSON.parse(localStorage.getItem('darkMode') || 'false'),
    
    // UI state
    loading: false,
    error: null,
    lastUpdated: null,
    
    // Loading states for different operations
    loadingStates: {
      current: false,
      forecast: false,
      search: false,
      favorites: false,
      location: false
    },
    
    // Search and history
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
    
    // Location data
    currentLocation: null,
    locationPermission: 'unknown', // 'granted', 'denied', 'prompt', 'unknown'
    
    // App settings
    autoRefresh: JSON.parse(localStorage.getItem('autoRefresh') || 'true'),
    refreshInterval: parseInt(localStorage.getItem('refreshInterval') || '300000'), // 5 minutes
    notifications: JSON.parse(localStorage.getItem('notifications') || 'true'),
    
    // Cache with better management
    cache: new Map(),
    cacheExpiration: 10 * 60 * 1000, // 10 minutes
    maxCacheSize: 50, // Maximum number of cache entries
    
    // Performance tracking
    performanceMetrics: {
      apiCallCount: 0,
      cacheHitCount: 0,
      averageResponseTime: 0
    }
  }),

  getters: {
    // Temperature getters
    getCurrentTemp: (state) => {
      if (!state.currentWeather) return null
      const temp = state.currentWeather.main.temp
      return state.unit === 'celsius' 
        ? Math.round(temp - 273.15) 
        : Math.round((temp - 273.15) * 9/5 + 32)
    },

    getFeelsLikeTemp: (state) => {
      if (!state.currentWeather) return null
      const temp = state.currentWeather.main.feels_like
      return state.unit === 'celsius' 
        ? Math.round(temp - 273.15) 
        : Math.round((temp - 273.15) * 9/5 + 32)
    },

    getUnitSymbol: (state) => {
      return state.unit === 'celsius' ? '°C' : '°F'
    },

    // Forecast getters
    getForecastData: (state) => {
      return state.forecast.map(item => ({
        ...item,
        temp: state.unit === 'celsius' 
          ? Math.round(item.main.temp - 273.15) 
          : Math.round((item.main.temp - 273.15) * 9/5 + 32),
        temp_min: state.unit === 'celsius'
          ? Math.round(item.main.temp_min - 273.15)
          : Math.round((item.main.temp_min - 273.15) * 9/5 + 32),
        temp_max: state.unit === 'celsius'
          ? Math.round(item.main.temp_max - 273.15)
          : Math.round((item.main.temp_max - 273.15) * 9/5 + 32),
        date: new Date(item.dt * 1000),
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        day: new Date(item.dt * 1000).toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      }))
    },

    getDailyForecast: (state) => {
      const dailyData = new Map()
      
      state.forecast.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString()
        
        if (!dailyData.has(date)) {
          dailyData.set(date, {
            date: new Date(item.dt * 1000),
            temps: [],
            conditions: [],
            humidity: [],
            pressure: [],
            wind: []
          })
        }
        
        const dayData = dailyData.get(date)
        dayData.temps.push(item.main.temp)
        dayData.conditions.push(item.weather[0])
        dayData.humidity.push(item.main.humidity)
        dayData.pressure.push(item.main.pressure)
        dayData.wind.push(item.wind)
      })
      
      return Array.from(dailyData.values()).slice(0, 5).map(day => {
        const tempMin = Math.min(...day.temps)
        const tempMax = Math.max(...day.temps)
        
        return {
          date: day.date,
          temp_min: state.unit === 'celsius' 
            ? Math.round(tempMin - 273.15) 
            : Math.round((tempMin - 273.15) * 9/5 + 32),
          temp_max: state.unit === 'celsius' 
            ? Math.round(tempMax - 273.15) 
            : Math.round((tempMax - 273.15) * 9/5 + 32),
          condition: day.conditions[0], // Most common condition
          humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
          pressure: Math.round(day.pressure.reduce((a, b) => a + b) / day.pressure.length),
          windSpeed: day.wind.reduce((a, b) => a + b.speed, 0) / day.wind.length
        }
      })
    },

    // Favorites getter
    isFavorite: (state) => {
      return (cityName) => {
        return state.favorites.some(fav => 
          fav.name.toLowerCase() === cityName.toLowerCase()
        )
      }
    },

    // Weather condition helpers
    getCurrentCondition: (state) => {
      return state.currentWeather?.weather[0]?.main || 'Unknown'
    },

    getCurrentConditionDescription: (state) => {
      return state.currentWeather?.weather[0]?.description || 'No data available'
    },

    getCurrentIcon: (state) => {
      return state.currentWeather?.weather[0]?.icon || '01d'
    },

    // Air quality and additional data
    getVisibility: (state) => {
      if (!state.currentWeather?.visibility) return null
      return Math.round(state.currentWeather.visibility / 1000) // Convert to km
    },

    getUVIndex: (state) => {
      return state.currentWeather?.uvi || null
    },

    // Cache helpers
    isCacheValid: (state) => {
      return (key) => {
        const cached = state.cache.get(key)
        if (!cached) return false
        return Date.now() - cached.timestamp < state.cacheExpiration
      }
    },

    // Performance metrics
    getCacheEfficiency: (state) => {
      const total = state.performanceMetrics.apiCallCount + state.performanceMetrics.cacheHitCount
      return total > 0 ? (state.performanceMetrics.cacheHitCount / total * 100).toFixed(1) : 0
    }
  },

  actions: {
    // Enhanced caching with compression
    setCacheData(key, data) {
      try {
        // Cleanup old cache if size limit reached
        if (this.cache.size >= this.maxCacheSize) {
          this.cleanupCache()
        }
        
        const cacheData = {
          data,
          timestamp: Date.now(),
          compressed: true,
          accessCount: 0
        }
        this.cache.set(key, cacheData)
      } catch (error) {
        console.warn('Failed to set cache data:', error)
      }
    },
    
    getCacheData(key) {
      const cached = this.cache.get(key)
      if (cached && this.isCacheValid(key)) {
        cached.accessCount++
        this.performanceMetrics.cacheHitCount++
        return cached.data
      }
      return null
    },
    
    cleanupCache() {
      const now = Date.now()
      const entries = Array.from(this.cache.entries())
      
      // Sort by last access time and remove oldest entries
      entries.sort((a, b) => {
        const aTime = a[1].timestamp + (a[1].accessCount * 60000) // Bonus for frequently accessed
        const bTime = b[1].timestamp + (b[1].accessCount * 60000)
        return aTime - bTime
      })
      
      // Remove oldest 25% of entries
      const toRemove = Math.floor(entries.length * 0.25)
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0])
      }
      
      // Also remove expired entries
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.cacheExpiration) {
          this.cache.delete(key)
        }
      }
    },

    // Main weather fetching actions with enhanced error handling
    async fetchWeatherByCity(cityName) {
      if (!cityName || typeof cityName !== 'string') {
        throw new Error('Invalid city name provided')
      }

      this.loading = true
      this.loadingStates.current = true
      this.error = null
      
      const startTime = Date.now()

      try {
        // Check cache first
        const cacheKey = `weather-${cityName.toLowerCase()}`
        const cachedData = this.getCacheData(cacheKey)
        
        if (cachedData) {
          this.currentWeather = cachedData.current
          this.forecast = cachedData.forecast
          this.loading = false
          this.loadingStates.current = false
          return
        }

        const [current, forecast] = await Promise.all([
          fetchCurrentWeather(cityName),
          fetchWeatherForecast(cityName)
        ])

        this.currentWeather = current
        this.forecast = forecast.list.slice(0, 40) // 5 days * 8 readings per day
        this.lastUpdated = new Date()

        // Cache the results
        this.setCacheData(cacheKey, {
          current,
          forecast: forecast.list.slice(0, 40)
        })

        // Update performance metrics
        this.performanceMetrics.apiCallCount++
        const responseTime = Date.now() - startTime
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime + responseTime) / 2

        // Add to search history
        this.addToSearchHistory(cityName)
        
      } catch (error) {
        this.error = error.message || 'Failed to fetch weather data'
        console.error('Weather fetch error:', error)
        throw error
      } finally {
        this.loading = false
        this.loadingStates.current = false
      }
    },

    async fetchWeatherByLocation() {
      this.loading = true
      this.loadingStates.location = true
      this.error = null

      try {
        const location = await getCurrentLocation()
        this.currentLocation = location
        this.locationPermission = 'granted'

        // Check cache first
        const cacheKey = `location-${location.latitude.toFixed(2)}-${location.longitude.toFixed(2)}`
        const cachedData = this.getCacheData(cacheKey)
        
        if (cachedData) {
          this.currentWeather = cachedData.current
          this.forecast = cachedData.forecast
          this.loading = false
          this.loadingStates.location = false
          return
        }

        const [current, forecast] = await Promise.all([
          fetchCurrentWeather(null, location.latitude, location.longitude),
          fetchWeatherForecast(null, location.latitude, location.longitude)
        ])

        this.currentWeather = current
        this.forecast = forecast.list.slice(0, 40)
        this.lastUpdated = new Date()

        // Cache the results
        this.setCacheData(cacheKey, {
          current,
          forecast: forecast.list.slice(0, 40)
        })

        this.performanceMetrics.apiCallCount++
        
      } catch (error) {
        this.locationPermission = error.message.includes('denied') ? 'denied' : 'unknown'
        this.error = error.message || 'Failed to fetch weather data'
        console.error('Location weather fetch error:', error)
        throw error
      } finally {
        this.loading = false
        this.loadingStates.location = false
      }
    },

    // Batch API calls for better performance
    async batchFetchWeather(cities) {
      const batchSize = 5
      const results = []
      
      this.loadingStates.favorites = true
      
      try {
        for (let i = 0; i < cities.length; i += batchSize) {
          const batch = cities.slice(i, i + batchSize)
          const batchPromises = batch.map(city => 
            this.fetchWeatherByCity(city.name).catch(error => {
              console.warn(`Failed to fetch weather for ${city.name}:`, error)
              return null
            })
          )
          
          const batchResults = await Promise.all(batchPromises)
          results.push(...batchResults.filter(Boolean))
          
          // Small delay between batches to avoid rate limiting
          if (i + batchSize < cities.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      } finally {
        this.loadingStates.favorites = false
      }
      
      return results
    },

    // Favorites management
    addToFavorites(cityData) {
      if (!cityData || !cityData.name) {
        console.error('Invalid city data provided to addToFavorites')
        return
      }

      const favorite = {
        id: Date.now(),
        name: cityData.name,
        country: cityData.sys?.country || 'Unknown',
        coord: cityData.coord,
        timezone: cityData.timezone,
        addedAt: new Date().toISOString(),
        lastViewed: new Date().toISOString()
      }

      if (!this.isFavorite(favorite.name)) {
        this.favorites.push(favorite)
        this.saveFavorites()
      }
    },

    removeFromFavorites(cityName) {
      this.favorites = this.favorites.filter(fav => 
        fav.name.toLowerCase() !== cityName.toLowerCase()
      )
      this.saveFavorites()
    },

    updateFavoriteLastViewed(cityName) {
      const favorite = this.favorites.find(fav => 
        fav.name.toLowerCase() === cityName.toLowerCase()
      )
      if (favorite) {
        favorite.lastViewed = new Date().toISOString()
        this.saveFavorites()
      }
    },

    saveFavorites() {
      localStorage.setItem('weatherFavorites', JSON.stringify(this.favorites))
    },

    // Settings management
    setUnit(unit) {
      if (!['celsius', 'fahrenheit'].includes(unit)) {
        console.error('Invalid temperature unit:', unit)
        return
      }
      this.unit = unit
      localStorage.setItem('temperatureUnit', unit)
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem('darkMode', JSON.stringify(this.darkMode))
      this.applyDarkMode()
    },

    setDarkMode(enabled) {
      this.darkMode = enabled
      localStorage.setItem('darkMode', JSON.stringify(this.darkMode))
      this.applyDarkMode()
    },

    applyDarkMode() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },

    initializeDarkMode() {
      // Check system preference if no user preference is set
      if (localStorage.getItem('darkMode') === null) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.darkMode = systemPrefersDark
      }
      this.applyDarkMode()
    },

    // Search history management
    addToSearchHistory(cityName) {
      if (!cityName) return
      
      const normalizedName = cityName.trim()
      
      // Remove from existing position if present
      this.searchHistory = this.searchHistory.filter(city => 
        city.toLowerCase() !== normalizedName.toLowerCase()
      )
      
      // Add to beginning
      this.searchHistory.unshift(normalizedName)
      
      // Keep only last 20 searches
      this.searchHistory = this.searchHistory.slice(0, 20)
      
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory))
    },

    clearSearchHistory() {
      this.searchHistory = []
      localStorage.removeItem('searchHistory')
    },

    // App settings
    setAutoRefresh(enabled) {
      this.autoRefresh = enabled
      localStorage.setItem('autoRefresh', JSON.stringify(enabled))
    },

    setRefreshInterval(interval) {
      if (interval < 60000) { // Minimum 1 minute
        console.error('Refresh interval too short, minimum is 1 minute')
        return
      }
      this.refreshInterval = interval
      localStorage.setItem('refreshInterval', interval.toString())
    },

    setNotifications(enabled) {
      this.notifications = enabled
      localStorage.setItem('notifications', JSON.stringify(enabled))
    },

    // Utility actions
    clearError() {
      this.error = null
    },

    clearCache() {
      this.cache.clear()
      this.performanceMetrics.cacheHitCount = 0
    },

    async refreshCurrentWeather() {
      if (this.currentWeather) {
        // Clear cache for current location
        const cityName = this.currentWeather.name
        const cacheKey = `weather-${cityName.toLowerCase()}`
        this.cache.delete(cacheKey)
        
        await this.fetchWeatherByCity(cityName)
      }
    },

    // Batch operations for favorites
    async fetchFavoritesWeather() {
      if (this.favorites.length === 0) return

      try {
        const results = await this.batchFetchWeather(this.favorites.slice(0, 5))
        return results
      } catch (error) {
        console.error('Error fetching favorites weather:', error)
        return []
      }
    },

    // Reset store
    resetStore() {
      this.currentWeather = null
      this.forecast = []
      this.hourlyForecast = []
      this.error = null
      this.lastUpdated = null
      this.currentLocation = null
      this.locationPermission = 'unknown'
      this.cache.clear()
      
      // Reset loading states
      Object.keys(this.loadingStates).forEach(key => {
        this.loadingStates[key] = false
      })
      
      // Reset performance metrics
      this.performanceMetrics.apiCallCount = 0
      this.performanceMetrics.cacheHitCount = 0
      this.performanceMetrics.averageResponseTime = 0
    },

    // Advanced caching features
    preloadWeatherData(cities) {
      // Preload weather data for multiple cities in background
      cities.forEach(async (city) => {
        const cacheKey = `weather-${city.toLowerCase()}`
        if (!this.getCacheData(cacheKey)) {
          try {
            await this.fetchWeatherByCity(city)
          } catch (error) {
            console.warn(`Failed to preload weather for ${city}:`, error)
          }
        }
      })
    },

    getCacheStats() {
      return {
        size: this.cache.size,
        efficiency: this.getCacheEfficiency,
        hitCount: this.performanceMetrics.cacheHitCount,
        missCount: this.performanceMetrics.apiCallCount,
        averageResponseTime: this.performanceMetrics.averageResponseTime
      }
    }
  }
})
