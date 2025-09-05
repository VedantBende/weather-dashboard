<template>
  <div class="dashboard-page">
    <!-- Page header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between">
        <div class="header-content mb-4 mb-md-0">
          <h1 class="text-h4 font-weight-bold mb-2">
            Weather Dashboard
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            {{ getCurrentDateString() }}
          </p>
        </div>
        
        <div class="header-actions">
          <WeatherSearch 
            variant="compact"
            @city-selected="handleCitySelected"
            class="mb-2 mb-md-0"
          />
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !currentWeather" class="loading-container">
      <Loader 
        type="weather" 
        text="Loading weather data..."
        size="lg"
      />
    </div>

    <!-- Error state -->
    <div v-else-if="error && !currentWeather" class="error-container">
      <ErrorMessage
        :message="error"
        type="error"
        show-retry
        @retry="retryLoadWeather"
      />
    </div>

    <!-- Main content -->
    <div v-else-if="currentWeather" class="dashboard-content">
      <!-- Primary weather card -->
      <v-row class="mb-6">
        <v-col cols="12">
          <WeatherCard 
            :key="weatherCardKey"
            :weather-data="currentWeather"
            :loading="loading"
            class="animate-fade-in"
            @refresh="handleRefresh"
            @favorite-toggle="handleFavoriteToggle"
            @share="handleShare"
            @show-snackbar="handleShowSnackbar"
          />
        </v-col>
      </v-row>

      <!-- Secondary information grid -->
      <v-row class="mb-6">
        <!-- Weather details -->
        <v-col cols="12" lg="8">
          <WeatherDetails 
            :weather-data="currentWeather"
            class="animate-fade-in"
            style="animation-delay: 0.1s"
          />
        </v-col>

        <!-- Quick stats sidebar -->
        <v-col cols="12" lg="4">
          <div class="quick-stats">
            <!-- Air Quality Card -->
            <AirQuality
              :latitude="currentLatitude"
              :longitude="currentLongitude" 
              :api-key="apiKey"
              class="glass-effect mb-4 animate-fade-in"
              style="animation-delay: 0.2s"
            />

            <!-- Quick actions -->
            <v-card class="glass-effect animate-fade-in" style="animation-delay: 0.3s">
              <v-card-title class="text-subtitle-1">
                <v-icon class="mr-2">mdi-flash</v-icon>
                Quick Actions
              </v-card-title>
              <v-card-text class="pa-2">
                <v-list nav density="compact">
                  <v-list-item
                    prepend-icon="mdi-crosshairs-gps"
                    title="Use Current Location"
                    @click="fetchLocationWeather"
                    :loading="loadingLocation"
                  />
                  <v-list-item
                    prepend-icon="mdi-refresh"
                    title="Refresh Data"
                    @click="refreshWeather"
                    :loading="loading"
                  />
                  <v-list-item
                    :prepend-icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
                    :title="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
                    @click="toggleFavorite"
                  />
                  <v-list-item
                    prepend-icon="mdi-share-variant"
                    title="Share Weather"
                    @click="shareWeather"
                  />
                </v-list>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <!-- WEATHER FORECAST CHART - REAL API INTEGRATION -->
      <v-row class="mb-6">
        <v-col cols="12">
          <WeatherChart 
            :key="`chart-${weatherCardKey}-${currentWeather.dt}`"
            :loading="loading"
            :weather-data="currentWeather"
            class="animate-fade-in"
            style="animation-delay: 0.4s"
            @show-snackbar="handleShowSnackbar"
          />
        </v-col>
      </v-row>

      <!-- Additional insights -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="glass-effect animate-fade-in" style="animation-delay: 0.5s">
            <v-card-title class="text-subtitle-1">
              <v-icon class="mr-2">mdi-lightbulb</v-icon>
              Weather Insights
            </v-card-title>
            <v-card-text>
              <div class="insights-list">
                <div 
                  v-for="insight in weatherInsights"
                  :key="insight.id"
                  class="insight-item d-flex align-center mb-3"
                >
                  <v-icon 
                    :color="insight.color"
                    size="small"
                    class="mr-3"
                  >
                    {{ insight.icon }}
                  </v-icon>
                  <span class="text-body-2">{{ insight.text }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="glass-effect animate-fade-in" style="animation-delay: 0.6s">
            <v-card-title class="text-subtitle-1">
              <v-icon class="mr-2">mdi-history</v-icon>
              Recent Searches
            </v-card-title>
            <v-card-text>
              <div v-if="recentSearches.length > 0">
                <v-chip
                  v-for="city in recentSearches.slice(0, 6)"
                  :key="city"
                  size="small"
                  variant="outlined"
                  class="ma-1"
                  @click="searchCity(city)"
                >
                  {{ city }}
                </v-chip>
              </div>
              <div v-else class="text-center py-4">
                <v-icon size="48" color="grey">mdi-magnify</v-icon>
                <div class="text-body-2 text-medium-emphasis mt-2">
                  No recent searches
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state text-center py-12">
      <v-icon size="120" color="grey">mdi-weather-partly-cloudy</v-icon>
      <h2 class="text-h5 font-weight-bold mt-4 mb-2">
        Welcome to Weather Dashboard
      </h2>
      <p class="text-body-1 text-medium-emphasis mb-6 max-w-md mx-auto">
        Get started by searching for a city or allowing location access to see your local weather.
      </p>
      <div class="empty-state-actions">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-crosshairs-gps"
          @click="fetchLocationWeather"
          :loading="loadingLocation"
          class="mr-2 mb-2"
        >
          Use My Location
        </v-btn>
        <v-btn
          variant="outlined"
          size="large"
          prepend-icon="mdi-magnify"
          @click="focusSearch"
          class="mb-2"
        >
          Search Cities
        </v-btn>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Share dialog -->
    <v-dialog v-model="showShareDialog" max-width="400">
      <v-card>
        <v-card-title>Share Weather</v-card-title>
        <v-card-text>
          <div class="share-content text-center">
            <div class="share-weather-info mb-4">
              <div class="text-h6">{{ currentWeather?.name }}</div>
              <div class="text-h4 font-weight-bold text-primary">
                {{ currentTemp }}{{ unitSymbol }}
              </div>
              <div class="text-body-1">{{ currentWeather?.weather[0]?.description }}</div>
            </div>
            
            <div class="share-actions">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-content-copy"
                @click="copyWeatherInfo"
                class="mr-2 mb-2"
              >
                Copy
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-twitter"
                @click="shareOnTwitter"
                class="mb-2"
              >
                Twitter
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showShareDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import WeatherCard from '@/components/weather/WeatherCard.vue'
import WeatherDetails from '@/components/weather/WeatherDetails.vue'
import WeatherSearch from '@/components/weather/WeatherSearch.vue'
import WeatherChart from '@/components/weather/WeatherChart.vue'
import AirQuality from '@/components/AirQuality.vue'
import Loader from '@/components/ui/Loader.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

export default {
  name: 'DashboardPage',
  components: {
    WeatherCard,
    WeatherDetails,
    WeatherSearch,
    WeatherChart,
    AirQuality,
    Loader,
    ErrorMessage
  },
  
  data() {
    return {
      loadingLocation: false,
      showShareDialog: false,
      apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
      currentLatitude: null,
      currentLongitude: null,
      weatherCardKey: 0,
      snackbar: {
        show: false,
        message: '',
        color: 'info',
        timeout: 3000
      }
    }
  },
  
  watch: {
    currentWeather: {
      handler(newWeather, oldWeather) {
        if (newWeather && oldWeather && newWeather.name !== oldWeather.name) {
          console.log('🔄 Weather changed, forcing components re-render:', {
            oldCity: oldWeather?.name,
            newCity: newWeather?.name
          })
          this.forceComponentsRerender()
        }
      },
      deep: true
    }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    currentWeather() {
      const weather = this.weatherStore.currentWeather
      return weather
    },
    
    loading() {
      return this.weatherStore.loading
    },
    
    error() {
      return this.weatherStore.error
    },
    
    currentTemp() {
      return this.weatherStore.getCurrentTemp
    },
    
    unitSymbol() {
      return this.weatherStore.getUnitSymbol
    },
    
    recentSearches() {
      return this.weatherStore.searchHistory || []
    },
    
    isFavorite() {
      return this.currentWeather ? this.weatherStore.isFavorite(this.currentWeather.name) : false
    },
    
    weatherInsights() {
      if (!this.currentWeather) return []
      
      const insights = []
      const temp = this.currentTemp
      const humidity = this.currentWeather.main.humidity
      const windSpeed = this.currentWeather.wind?.speed || 0
      const condition = this.currentWeather.weather[0].main
      
      // Temperature insights
      if (temp > 30) {
        insights.push({
          id: 'hot',
          icon: 'mdi-thermometer-high',
          color: 'red',
          text: 'It\'s quite hot today. Stay hydrated and seek shade.'
        })
      } else if (temp < 5) {
        insights.push({
          id: 'cold',
          icon: 'mdi-thermometer-low',
          color: 'blue',
          text: 'Bundle up! It\'s quite cold outside.'
        })
      }
      
      // Humidity insights
      if (humidity > 80) {
        insights.push({
          id: 'humid',
          icon: 'mdi-water-percent',
          color: 'cyan',
          text: 'High humidity levels. It may feel warmer than it is.'
        })
      } else if (humidity < 30) {
        insights.push({
          id: 'dry',
          icon: 'mdi-water-off',
          color: 'orange',
          text: 'Low humidity. Consider using a humidifier.'
        })
      }
      
      // Wind insights
      if (windSpeed > 10) {
        insights.push({
          id: 'windy',
          icon: 'mdi-weather-windy',
          color: 'green',
          text: 'It\'s quite windy. Secure loose objects outside.'
        })
      }
      
      // Condition-specific insights
      if (condition === 'Rain') {
        insights.push({
          id: 'rain',
          icon: 'mdi-umbrella',
          color: 'blue',
          text: 'Don\'t forget your umbrella!'
        })
      } else if (condition === 'Clear' && temp > 25) {
        insights.push({
          id: 'sunny',
          icon: 'mdi-sunglasses',
          color: 'orange',
          text: 'Perfect weather! Don\'t forget sunscreen.'
        })
      }
      
      return insights.slice(0, 4)
    }
  },
  
  async mounted() {
    console.log('🏢 DashboardPage mounted')
    
    // Initialize API key check
    if (!this.apiKey) {
      this.showSnackbar({
        message: 'Please set VITE_OPENWEATHER_API_KEY in your .env file',
        color: 'warning',
        timeout: 5000
      })
    }
    
    // Get current location for air quality data
    await this.getCurrentLocation()
    
    // If no weather data is available, try to load some
    if (!this.currentWeather && !this.loading) {
      await this.initializeWeatherData()
    }
  },
  
  methods: {
    forceComponentsRerender() {
      this.weatherCardKey += 1
      console.log('🔑 Components keys updated to:', this.weatherCardKey)
    },
    
    showSnackbar(options) {
      this.snackbar = {
        show: true,
        message: options.message,
        color: options.color || 'info',
        timeout: options.timeout || 3000
      }
    },
    
    getCurrentDateString() {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    async getCurrentLocation() {
      console.log('📍 Getting current location...')
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.currentLatitude = position.coords.latitude
              this.currentLongitude = position.coords.longitude
              console.log('✅ Location obtained:', { 
                lat: this.currentLatitude, 
                lon: this.currentLongitude 
              })
              resolve()
            },
            (error) => {
              console.warn('⚠️ Failed to get location:', error)
              // Set default coordinates (London)
              this.currentLatitude = 51.5074
              this.currentLongitude = -0.1278
              console.log('📍 Using default location: London')
              resolve()
            }
          )
        })
      } else {
        this.currentLatitude = 51.5074
        this.currentLongitude = -0.1278
        console.log('📍 Geolocation not supported, using London')
      }
    },
    
    async initializeWeatherData() {
      console.log('🌤️ Initializing weather data...')
      try {
        await this.weatherStore.fetchWeatherByLocation()
        console.log('✅ Weather initialized by location')
      } catch (error) {
        try {
          await this.weatherStore.fetchWeatherByCity('London')
          console.log('✅ Weather initialized with London fallback')
        } catch (fallbackError) {
          console.error('❌ Failed to load any weather data:', fallbackError)
        }
      }
    },
    
    async handleCitySelected(city) {
      console.log('🏙️ City selected from search:', city.name)
      
      try {
        await this.weatherStore.fetchWeatherByCity(city.name)
        console.log('✅ Weather fetched for:', city.name)
        
        // Update coordinates if available
        if (city.coord) {
          this.currentLatitude = city.coord.lat
          this.currentLongitude = city.coord.lon
          console.log('📍 Updated coordinates for AirQuality:', city.coord)
        }
        
      } catch (error) {
        console.error('❌ Failed to fetch city weather:', error)
        this.showSnackbar({
          message: 'Failed to load weather for ' + city.name,
          color: 'error'
        })
      }
    },
    
    async fetchLocationWeather() {
      console.log('📍 Fetching location weather...')
      this.loadingLocation = true
      try {
        await this.getCurrentLocation()
        await this.weatherStore.fetchWeatherByLocation()
        console.log('✅ Location weather fetched')
        this.showSnackbar({
          message: 'Weather updated for your location',
          color: 'success'
        })
      } catch (error) {
        console.error('❌ Failed to fetch location weather:', error)
        this.showSnackbar({
          message: 'Failed to get weather for your location',
          color: 'error'
        })
      } finally {
        this.loadingLocation = false
      }
    },
    
    async refreshWeather() {
      console.log('🔄 Refreshing weather...')
      try {
        await this.weatherStore.refreshCurrentWeather()
        console.log('✅ Weather refreshed')
        this.showSnackbar({
          message: 'Weather data refreshed',
          color: 'success'
        })
      } catch (error) {
        console.error('❌ Failed to refresh weather:', error)
        this.showSnackbar({
          message: 'Failed to refresh weather data',
          color: 'error'
        })
      }
    },
    
    async retryLoadWeather() {
      await this.initializeWeatherData()
    },
    
    toggleFavorite() {
      if (!this.currentWeather) return
      
      if (this.isFavorite) {
        this.weatherStore.removeFromFavorites(this.currentWeather.name)
        this.showSnackbar({
          message: `${this.currentWeather.name} removed from favorites`,
          color: 'info'
        })
      } else {
        this.weatherStore.addToFavorites(this.currentWeather)
        this.showSnackbar({
          message: `${this.currentWeather.name} added to favorites`,
          color: 'success'
        })
      }
    },
    
    shareWeather() {
      this.showShareDialog = true
    },
    
    async copyWeatherInfo() {
      const weatherText = `Weather in ${this.currentWeather.name}: ${this.currentTemp}${this.unitSymbol}, ${this.currentWeather.weather[0].description}`
      
      try {
        await navigator.clipboard.writeText(weatherText)
        this.showSnackbar({
          message: 'Weather info copied to clipboard!',
          color: 'success'
        })
      } catch (error) {
        console.error('❌ Failed to copy:', error)
        this.showSnackbar({
          message: 'Failed to copy weather info',
          color: 'error'
        })
      }
    },
    
    shareOnTwitter() {
      const weatherText = `Weather in ${this.currentWeather.name}: ${this.currentTemp}${this.unitSymbol}, ${this.currentWeather.weather[0].description}`
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(weatherText)}`
      window.open(twitterUrl, '_blank')
    },
    
    async searchCity(cityName) {
      console.log('🔍 Quick search for city:', cityName)
      try {
        await this.weatherStore.fetchWeatherByCity(cityName)
      } catch (error) {
        console.error('❌ Failed to search city:', error)
        this.showSnackbar({
          message: 'Failed to load weather for ' + cityName,
          color: 'error'
        })
      }
    },
    
    focusSearch() {
      const searchInput = document.querySelector('.weather-search-input input')
      if (searchInput) {
        searchInput.focus()
      }
    },
    
    // Event handlers from child components
    handleRefresh() {
      this.refreshWeather()
    },
    
    handleFavoriteToggle(event) {
      console.log('❤️ Favorite toggled:', event)
    },
    
    handleShare(weatherData) {
      console.log('🔗 Weather shared:', weatherData.name)
    },
    
    handleShowSnackbar(snackbarData) {
      this.showSnackbar(snackbarData)
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.dashboard-header {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.dashboard-content {
  animation: fadeIn 0.6s ease-out;
}

.quick-stats .v-card {
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.insight-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.insight-item:last-child {
  border-bottom: none;
}

.empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-state-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.share-weather-info {
  padding: 16px;
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: 8px;
}

.share-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out both;
}

/* Glass effect */
.glass-effect {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 0 8px;
  }
  
  .dashboard-header {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .empty-state-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .empty-state-actions .v-btn {
    width: 200px;
  }
}
</style>
