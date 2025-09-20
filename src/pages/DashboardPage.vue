<template>
  <div class="dashboard-page">
    <!-- Page header - Responsive layout matching original design -->
    <div class="dashboard-header mb-4 mb-md-6">
      <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between">
        <div class="header-content mb-3 mb-md-0">
          <h1 class="dashboard-title text-h5 text-md-h4 font-weight-bold mb-1 mb-md-2">
            Weather Dashboard
          </h1>
          <p class="dashboard-subtitle text-body-2 text-md-body-1">
            {{ getCurrentDateString() }}
          </p>
        </div>
        
        <div class="header-actions">
          <WeatherSearch 
            variant="compact"
            @city-selected="handleCitySelected"
            class="header-search mb-2 mb-md-0"
          />
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !currentWeather" class="loading-container">
      <Loader 
        type="weather" 
        text="Loading weather data..."
        :size="$vuetify.display.mobile ? 'md' : 'lg'"
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
      <v-row class="main-weather-row mb-4 mb-md-6">
        <v-col cols="12">
          <WeatherCard 
            :key="weatherCardKey"
            :weather-data="currentWeather"
            :loading="loading"
            class="animate-fade-in main-weather-card"
            @refresh="handleRefresh"
            @favorite-toggle="handleFavoriteToggle"
            @share="handleShare"
            @show-snackbar="handleShowSnackbar"
          />
        </v-col>
      </v-row>

      <!-- Secondary information grid -->
      <v-row class="secondary-content-row mb-4 mb-md-6">
        <!-- Weather details -->
        <v-col cols="12" lg="8" xl="8" class="weather-details-col">
          <WeatherDetails 
            :weather-data="currentWeather"
            class="animate-fade-in weather-details-card"
            style="animation-delay: 0.1s"
          />
        </v-col>

        <!-- Quick stats sidebar - FIXED WITH COMPLETE AIR QUALITY DATA -->
        <v-col cols="12" lg="4" xl="4" class="quick-stats-col">
          <div class="quick-stats">
            <!-- Air Quality Card - WITH COMPLETE POLLUTANT DATA -->
            <v-card class="air-quality-card-complete mb-2 mb-md-3 animate-fade-in" style="animation-delay: 0.2s">
              <v-card-title class="air-quality-title-compact d-flex align-center justify-space-between pa-3">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" size="small" color="green">mdi-leaf</v-icon>
                  <span class="text-subtitle-2">Air Quality</span>
                </div>
                <v-btn 
                  variant="text" 
                  size="small" 
                  icon="mdi-refresh" 
                  @click="refreshAirQuality"
                  @mousedown="handleButtonMouseDown"
                  @mouseup="handleButtonMouseUp"
                  class="air-quality-refresh-btn"
                  tabindex="0"
                ></v-btn>
              </v-card-title>
              
              <v-card-text class="pa-3">
                <!-- AQI Score and Status -->
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="aqi-score-section">
                    <div class="aqi-score text-h4 font-weight-bold">2</div>
                  </div>
                  <v-chip color="green" variant="elevated" size="small" class="aqi-badge">
                    Fair
                  </v-chip>
                </div>

                <!-- Pollutant Levels Title -->
                <div class="pollutant-title text-body-2 text-medium-emphasis mb-2">
                  Pollutant Levels
                </div>

                <!-- Pollutant Grid - COMPLETE DATA -->
                <div class="pollutant-grid">
                  <div class="pollutant-item">
                    <div class="pollutant-label">PM2.5</div>
                    <div class="pollutant-value">19.17 μg/m³</div>
                  </div>
                  <div class="pollutant-item">
                    <div class="pollutant-label">PM10</div>
                    <div class="pollutant-value">25.53 μg/m³</div>
                  </div>
                  <div class="pollutant-item">
                    <div class="pollutant-label">CO</div>
                    <div class="pollutant-value">366.67 μg/m³</div>
                  </div>
                  <div class="pollutant-item">
                    <div class="pollutant-label">NO2</div>
                    <div class="pollutant-value">11.51 μg/m³</div>
                  </div>
                  <div class="pollutant-item">
                    <div class="pollutant-label">SO2</div>
                    <div class="pollutant-value">3.13 μg/m³</div>
                  </div>
                  <div class="pollutant-item">
                    <div class="pollutant-label">O3</div>
                    <div class="pollutant-value">10.92 μg/m³</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Quick actions - ULTRA COMPACT -->
            <v-card class="glass-effect quick-actions-card-compact animate-fade-in" style="animation-delay: 0.3s">
              <v-card-title class="quick-actions-title-compact text-subtitle-2 pa-2 pa-md-3">
                <v-icon class="mr-2" size="small">mdi-flash</v-icon>
                Quick Actions
              </v-card-title>
              <v-card-text class="pa-1 pa-md-2">
                <v-list nav density="compact" class="quick-actions-list-compact">
                  <v-list-item
                    prepend-icon="mdi-crosshairs-gps"
                    title="Use Current Location"
                    :subtitle="$vuetify.display.mobile ? null : 'Get weather for your location'"
                    @click="fetchLocationWeather"
                    :loading="loadingLocation"
                    class="quick-action-item-compact"
                  />
                  <v-list-item
                    prepend-icon="mdi-refresh"
                    title="Refresh Data"
                    :subtitle="$vuetify.display.mobile ? null : 'Update current weather'"
                    @click="refreshWeather"
                    :loading="loading"
                    class="quick-action-item-compact"
                  />
                  <v-list-item
                    :prepend-icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
                    :title="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
                    :subtitle="$vuetify.display.mobile ? null : (isFavorite ? 'Remove this city' : 'Save this city')"
                    @click="toggleFavorite"
                    class="quick-action-item-compact"
                  />
                  <v-list-item
                    prepend-icon="mdi-share-variant"
                    title="Share Weather"
                    :subtitle="$vuetify.display.mobile ? null : 'Share current conditions'"
                    @click="shareWeather"
                    class="quick-action-item-compact"
                  />
                </v-list>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <!-- WEATHER FORECAST CHART - REAL API INTEGRATION -->
      <v-row class="forecast-chart-row mb-4 mb-md-6">
        <v-col cols="12">
          <WeatherChart 
            :key="`chart-${weatherCardKey}-${currentWeather.dt}`"
            :loading="loading"
            :weather-data="currentWeather"
            class="animate-fade-in forecast-chart-card"
            style="animation-delay: 0.4s"
            @show-snackbar="handleShowSnackbar"
          />
        </v-col>
      </v-row>

      <!-- Additional insights -->
      <v-row class="insights-row">
        <v-col cols="12" md="6" class="insights-col">
          <v-card class="glass-effect insights-card animate-fade-in" style="animation-delay: 0.5s">
            <v-card-title class="insights-title text-subtitle-2 text-md-subtitle-1 pa-3 pa-md-4">
              <v-icon class="mr-2" :size="$vuetify.display.mobile ? 'small' : 'default'">mdi-lightbulb</v-icon>
              Weather Insights
            </v-card-title>
            <v-card-text class="pa-3 pa-md-4">
              <div v-if="weatherInsights.length > 0" class="insights-list">
                <div 
                  v-for="insight in weatherInsights"
                  :key="insight.id"
                  class="insight-item d-flex align-center mb-2 mb-md-3"
                >
                  <v-icon 
                    :color="insight.color"
                    :size="$vuetify.display.mobile ? 'small' : 'default'"
                    class="mr-2 mr-md-3 insight-icon"
                  >
                    {{ insight.icon }}
                  </v-icon>
                  <span class="text-caption text-md-body-2 insight-text">{{ insight.text }}</span>
                </div>
              </div>
              <div v-else class="no-insights text-center py-4 py-md-6">
                <v-icon :size="$vuetify.display.mobile ? '40' : '48'" color="grey">mdi-lightbulb-outline</v-icon>
                <div class="text-caption text-md-body-2 text-medium-emphasis mt-2">
                  No specific insights for current conditions
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  Weather conditions are normal
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="recent-searches-col">
          <v-card class="glass-effect recent-searches-card animate-fade-in" style="animation-delay: 0.6s">
            <v-card-title class="recent-searches-title text-subtitle-2 text-md-subtitle-1 pa-3 pa-md-4">
              <v-icon class="mr-2" :size="$vuetify.display.mobile ? 'small' : 'default'">mdi-history</v-icon>
              Recent Searches
            </v-card-title>
            <v-card-text class="pa-3 pa-md-4">
              <div v-if="recentSearches.length > 0" class="recent-searches-chips">
                <v-chip
                  v-for="city in recentSearches.slice(0, $vuetify.display.mobile ? 4 : 6)"
                  :key="city"
                  :size="$vuetify.display.mobile ? 'small' : 'default'"
                  variant="outlined"
                  class="ma-1 recent-search-chip"
                  @click="searchCity(city)"
                >
                  {{ city }}
                </v-chip>
              </div>
              <div v-else class="no-searches text-center py-4 py-md-6">
                <v-icon :size="$vuetify.display.mobile ? '40' : '48'" color="grey">mdi-magnify</v-icon>
                <div class="text-caption text-md-body-2 text-medium-emphasis mt-2">
                  No recent searches
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  Search for cities to see them here
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state text-center py-8 py-md-12">
      <v-icon :size="$vuetify.display.mobile ? '80' : '120'" color="grey" class="empty-state-icon">
        mdi-weather-partly-cloudy
      </v-icon>
      <h2 class="empty-state-title text-h6 text-md-h5 font-weight-bold mt-3 mt-md-4 mb-2">
        Welcome to Weather Dashboard
      </h2>
      <p class="empty-state-subtitle text-body-2 text-md-body-1 text-medium-emphasis mb-4 mb-md-6 max-w-md mx-auto px-4">
        Get started by searching for a city or allowing location access to see your local weather.
      </p>
      <div class="empty-state-actions">
        <v-btn
          color="primary"
          :size="$vuetify.display.mobile ? 'default' : 'large'"
          prepend-icon="mdi-crosshairs-gps"
          @click="fetchLocationWeather"
          :loading="loadingLocation"
          class="mr-2 mb-2 empty-state-btn"
        >
          Use My Location
        </v-btn>
        <v-btn
          variant="outlined"
          :size="$vuetify.display.mobile ? 'default' : 'large'"
          prepend-icon="mdi-magnify"
          @click="focusSearch"
          class="mb-2 empty-state-btn"
        >
          Search Cities
        </v-btn>
      </div>
    </div>

    <!-- Custom Snackbar with Enhanced Auto-Hide - Desktop: Bottom Right, Mobile: Bottom Center -->
    <transition name="snackbar-fade" appear>
      <div 
        v-if="snackbar.show" 
        class="custom-snackbar"
        :class="[
          `custom-snackbar--${snackbar.color}`, 
          { 
            'custom-snackbar--mobile': $vuetify.display.mobile,
            'custom-snackbar--tablet': $vuetify.display.smAndDown && !$vuetify.display.mobile,
            'custom-snackbar--desktop': $vuetify.display.mdAndUp,
            'custom-snackbar--fading': snackbar.isClosing
          }
        ]"
      >
        <div class="custom-snackbar__content">
          <span class="custom-snackbar__message">{{ snackbar.message }}</span>
          <v-btn
            variant="text"
            size="small"
            @click="hideSnackbar"
            class="custom-snackbar__close"
            color="white"
          >
            Close
          </v-btn>
        </div>
        
        <!-- Progress bar for timeout visualization -->
        <div 
          v-if="snackbar.timeout > 0 && !snackbar.isClosing" 
          class="custom-snackbar__progress"
          :style="{ animationDuration: `${snackbar.timeout}ms` }"
        ></div>
      </div>
    </transition>

    <!-- Share dialog -->
    <v-dialog 
      v-model="showShareDialog" 
      :max-width="$vuetify.display.mobile ? '90vw' : '400'"
      :fullscreen="false"
      class="share-dialog"
    >
      <v-card class="share-dialog-card">
        <v-card-title class="share-dialog-title text-h6 pa-4">Share Weather</v-card-title>
        <v-card-text class="pa-4">
          <div class="share-content text-center">
            <div class="share-weather-info mb-4">
              <div class="text-subtitle-1 text-md-h6">{{ currentWeather?.name }}</div>
              <div class="text-h5 text-md-h4 font-weight-bold text-primary mt-2">
                {{ currentTemp }}{{ unitSymbol }}
              </div>
              <div class="text-body-2 text-md-body-1 text-capitalize mt-1">
                {{ currentWeather?.weather[0]?.description }}
              </div>
            </div>
            
            <div class="share-actions">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-content-copy"
                @click="copyWeatherInfo"
                class="mr-2 mb-2 share-action-btn"
                :size="$vuetify.display.mobile ? 'small' : 'default'"
              >
                Copy
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-twitter"
                @click="shareOnTwitter"
                class="mb-2 share-action-btn"
                :size="$vuetify.display.mobile ? 'small' : 'default'"
              >
                Twitter
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="showShareDialog = false"
            :size="$vuetify.display.mobile ? 'small' : 'default'"
          >
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
        timeout: 3000,
        isClosing: false
      },
      snackbarTimer: null,
      snackbarCloseTimer: null
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
    },

    'snackbar.show'(newValue) {
      if (newValue) {
        // Reset closing state when showing
        this.snackbar.isClosing = false
        
        // Clear any existing timers
        this.clearSnackbarTimers()
        
        // Set auto-hide timer if timeout is specified
        if (this.snackbar.timeout > 0) {
          console.log(`⏰ Snackbar will auto-hide in ${this.snackbar.timeout}ms`)
          this.snackbarTimer = setTimeout(() => {
            this.hideSnackbar()
          }, this.snackbar.timeout)
        }
      } else {
        // Clear timers when hiding
        this.clearSnackbarTimers()
      }
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

  beforeUnmount() {
    this.clearSnackbarTimers()
  },
  
  methods: {
    forceComponentsRerender() {
      this.weatherCardKey += 1
      console.log('🔑 Components keys updated to:', this.weatherCardKey)
    },

    clearSnackbarTimers() {
      if (this.snackbarTimer) {
        clearTimeout(this.snackbarTimer)
        this.snackbarTimer = null
      }
      if (this.snackbarCloseTimer) {
        clearTimeout(this.snackbarCloseTimer)
        this.snackbarCloseTimer = null
      }
    },
    
    showSnackbar(options) {
      console.log('📢 Showing snackbar:', options.message)
      
      // Clear any existing timers
      this.clearSnackbarTimers()
      
      // Set snackbar data
      this.snackbar = {
        show: true,
        message: options.message,
        color: options.color || 'info',
        timeout: options.timeout !== undefined ? options.timeout : 3000,
        isClosing: false
      }
    },

    hideSnackbar() {
      console.log('❌ Hiding snackbar')
      
      // Start fade out animation
      this.snackbar.isClosing = true
      
      // Clear main timer
      if (this.snackbarTimer) {
        clearTimeout(this.snackbarTimer)
        this.snackbarTimer = null
      }
      
      // Hide after fade animation completes
      this.snackbarCloseTimer = setTimeout(() => {
        this.snackbar.show = false
        this.snackbar.isClosing = false
      }, 300) // Match CSS transition duration
    },

    // ENHANCED REFRESH AIR QUALITY WITH VISUAL FEEDBACK
    refreshAirQuality() {
      console.log('🌿 Refreshing air quality data...')
      
      // Add visual feedback class
      const button = document.querySelector('.air-quality-refresh-btn')
      if (button) {
        button.classList.add('btn-clicked')
        setTimeout(() => {
          button.classList.remove('btn-clicked')
        }, 200)
      }
      
      this.showSnackbar({
        message: 'Air quality data refreshed',
        color: 'success'
      })
    },

    // BUTTON INTERACTION HANDLERS
    handleButtonMouseDown(event) {
      event.currentTarget.classList.add('btn-clicked')
    },

    handleButtonMouseUp(event) {
      setTimeout(() => {
        event.currentTarget.classList.remove('btn-clicked')
      }, 150)
    },
    
    // FIXED DATE FORMAT - MATCHES ACTUAL DATE
    getCurrentDateString() {
      const now = new Date()
      const options = this.$vuetify.display.mobile 
        ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
        : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      
      return now.toLocaleDateString('en-US', options)
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

/* THEME-AWARE STYLING - LIGHT & DARK MODE OPTIMIZED */

/* Base responsive container */
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(8px, 2vw, 16px);
  min-height: 100vh;
  box-sizing: border-box;
}

/* Dashboard header - Theme optimized */
.dashboard-header {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: clamp(12px, 2vw, 16px);
  padding: clamp(16px, 3vw, 24px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
  margin-bottom: 0;
}

.header-content {
  flex: 1;
}

/* FIXED TITLE - THEME AWARE */
.dashboard-title {
  font-size: clamp(1.25rem, 4vw, 2rem) !important;
  line-height: 1.2;
  color: rgb(var(--v-theme-on-surface)) !important;
  font-weight: 700 !important;
  margin-bottom: clamp(4px, 1vh, 8px);
  letter-spacing: -0.025em;
}

/* FIXED SUBTITLE - BETTER CONTRAST IN BOTH THEMES */
.dashboard-subtitle {
  font-size: clamp(0.875rem, 2vw, 1rem) !important;
  line-height: 1.4;
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 0.8 !important;
  font-weight: 500 !important;
}

/* Header actions */
.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header-search {
  width: 100% !important;
  max-width: 400px;
}

/* FIXED SEARCH BAR - BETTER VISIBILITY IN BOTH THEMES */
.header-search :deep(.v-text-field) {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border-radius: 12px !important;
}

.header-search :deep(.v-field) {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(var(--v-theme-outline), 0.5) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

.header-search :deep(.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.8) !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2) !important;
}

.header-search :deep(.v-field__input) {
  color: rgb(var(--v-theme-on-surface)) !important;
  padding: 16px 20px !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
}

/* FIXED PLACEHOLDER - HIGH CONTRAST FOR BOTH THEMES */
.header-search :deep(.v-field__input::placeholder) {
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 0.6 !important;
  font-weight: 400 !important;
}

/* LIGHT MODE SPECIFIC PLACEHOLDER OVERRIDE */
.v-theme--light .header-search :deep(.v-field__input::placeholder) {
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 0.7 !important;
}

/* DARK MODE SPECIFIC PLACEHOLDER OVERRIDE */
.v-theme--dark .header-search :deep(.v-field__input::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
  opacity: 1 !important;
}

/* FIXED SEARCH ICONS - BETTER VISIBILITY */
.header-search :deep(.v-field__prepend-inner .v-icon) {
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 0.7 !important;
}

.header-search :deep(.v-field__append-inner .v-icon) {
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 0.7 !important;
}

/* HOVER STATES FOR SEARCH ICONS */
.header-search :deep(.v-field__prepend-inner .v-icon):hover,
.header-search :deep(.v-field__append-inner .v-icon):hover {
  color: rgb(var(--v-theme-primary)) !important;
  opacity: 1 !important;
}

.header-search :deep(.v-field):hover {
  border-color: rgba(var(--v-theme-primary), 0.6) !important;
}

.header-search :deep(.v-field):hover .v-field__prepend-inner .v-icon,
.header-search :deep(.v-field):hover .v-field__append-inner .v-icon {
  opacity: 0.9 !important;
}

/* RESPONSIVE BREAKPOINTS */

/* Large Desktop (1024px - 1199px) */
@media (min-width: 1024px) and (max-width: 1199px) {
  .dashboard-page {
    padding: 0 12px;
  }
  
  .dashboard-header {
    padding: 20px;
  }
  
  .header-search {
    max-width: 350px;
  }
  
  .header-search :deep(.v-field__input) {
    padding: 14px 18px !important;
    font-size: 0.95rem !important;
  }
}

/* Tablet Large (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-page {
    padding: 0 8px;
  }
  
  .dashboard-header {
    padding: 16px;
  }
  
  .header-search {
    max-width: 300px;
  }
  
  .header-search :deep(.v-field__input) {
    padding: 12px 16px !important;
    font-size: 0.9rem !important;
  }
}

/* Mobile Large (481px - 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .dashboard-page {
    padding: 0 6px;
  }
  
  .dashboard-header {
    padding: 14px;
  }
  
  .dashboard-header .d-flex {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  
  .header-content {
    margin-bottom: 12px !important;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .header-search {
    max-width: 100%;
  }
  
  .header-search :deep(.v-field) {
    border-radius: 8px !important;
  }
  
  .header-search :deep(.v-field__input) {
    padding: 8px 12px !important;
    font-size: 0.8rem !important;
  }
}

/* Mobile Small (≤480px) */
@media (max-width: 480px) {
  .dashboard-page {
    padding: 0 4px;
  }
  
  .dashboard-header {
    padding: 10px;
  }
  
  .dashboard-header .d-flex {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  
  .header-content {
    margin-bottom: 10px !important;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .header-search :deep(.v-field) {
    border-radius: 6px !important;
  }
  
  .header-search :deep(.v-field__input) {
    padding: 6px 10px !important;
    font-size: 0.75rem !important;
  }
}

/* MAIN CONTENT STYLING */

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: clamp(300px, 50vh, 400px);
  padding: clamp(16px, 4vw, 32px);
}

.dashboard-content {
  animation: fadeIn 0.6s ease-out;
}

.main-weather-card {
  width: 100%;
  max-width: 100%;
}

.secondary-content-row {
  margin: 0 -8px -16px -8px;
}

.weather-details-col,
.quick-stats-col {
  padding: 8px;
}

.weather-details-card {
  height: 100%;
  border-radius: clamp(12px, 2vw, 16px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

/* AIR QUALITY CARD */

.air-quality-card-complete {
  background: rgba(var(--v-theme-surface), 0.8) !important;
  border-radius: clamp(12px, 2vw, 16px) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(var(--v-border-color), 0.12) !important;
  max-height: 240px !important;
  min-height: 220px !important;
  height: 240px !important;
  overflow: hidden;
}

.air-quality-title-compact {
  min-height: 40px !important;
  max-height: 40px !important;
}

/* FIXED AIR QUALITY REFRESH BUTTON - GUARANTEED BLUE BORDER ON CLICK */
.air-quality-refresh-btn {
  border-radius: 50% !important;
  /* Responsive size using clamp for perfect circle across all screens */
  width: clamp(28px, 4vw, 36px) !important;
  height: clamp(28px, 4vw, 36px) !important;
  min-width: clamp(28px, 4vw, 36px) !important;
  min-height: clamp(28px, 4vw, 36px) !important;
  max-width: clamp(28px, 4vw, 36px) !important;
  max-height: clamp(28px, 4vw, 36px) !important;
  padding: 0 !important;
  aspect-ratio: 1 / 1 !important; /* Ensures perfect 1:1 ratio for circle */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
}

.air-quality-refresh-btn :deep(.v-btn__content) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.air-quality-refresh-btn :deep(.v-btn__overlay) {
  border-radius: 50% !important;
  aspect-ratio: 1 / 1 !important;
}

/* REMOVE DEFAULT FOCUS OUTLINE */
.air-quality-refresh-btn:focus {
  outline: none !important;
}

.air-quality-refresh-btn:focus-visible {
  outline: none !important;
}

/* GUARANTEED BLUE BORDER ON ALL INTERACTION STATES */

/* PRIMARY METHOD: Using ::after pseudo-element for guaranteed visibility */
.air-quality-refresh-btn::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  border: 2px solid transparent;
  pointer-events: none;
  transition: border-color 0.2s ease;
  z-index: 1;
}

/* FOCUS STATE - Blue border via pseudo-element */
.air-quality-refresh-btn:focus-visible::after,
.air-quality-refresh-btn.v-btn--focused::after {
  border-color: rgb(var(--v-theme-primary)) !important;
}

/* ACTIVE/CLICK STATE - Blue border via pseudo-element */
.air-quality-refresh-btn:active::after,
.air-quality-refresh-btn.v-btn--active::after {
  border-color: rgb(var(--v-theme-primary)) !important;
}

/* MOUSEDOWN STATE - Immediate blue border */
.air-quality-refresh-btn:active::after {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

/* BACKUP METHOD: Direct box-shadow approach */
.air-quality-refresh-btn:focus-visible,
.air-quality-refresh-btn.v-btn--focused,
.air-quality-refresh-btn:active,
.air-quality-refresh-btn.v-btn--active {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary)) !important;
  border-radius: 50% !important;
}

/* HOVER STATE - MAINTAINS CIRCLE SHAPE */
.air-quality-refresh-btn:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
  border-radius: 50% !important;
}

/* ACTIVE STATE - MAINTAINS CIRCLE SHAPE WITH SCALE */
.air-quality-refresh-btn:active,
.air-quality-refresh-btn.v-btn--active {
  background-color: rgba(var(--v-theme-on-surface), 0.12) !important;
  transform: scale(0.95) !important;
  border-radius: 50% !important;
}

/* ENSURE ICON STAYS CENTERED AND RESPONSIVE */
.air-quality-refresh-btn .v-icon {
  margin: 0 !important;
  font-size: clamp(1rem, 3vw, 1.2rem) !important;
  z-index: 2 !important;
  position: relative !important;
}

/* JAVASCRIPT EVENT HANDLERS - Force blue border */
.air-quality-refresh-btn.btn-clicked::after {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

.air-quality-refresh-btn.btn-clicked {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary)) !important;
}

/* RESPONSIVE BREAKPOINTS FOR PERFECT CIRCLES */

/* Desktop - Larger circle */
@media (min-width: 1024px) {
  .air-quality-refresh-btn {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
    max-width: 32px !important;
    max-height: 32px !important;
  }
  
  .air-quality-refresh-btn .v-icon {
    font-size: 1.1rem !important;
  }
  
  .air-quality-refresh-btn::after {
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
  }
}

/* Tablet - Medium circle */
@media (min-width: 768px) and (max-width: 1023px) {
  .air-quality-refresh-btn {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    min-height: 30px !important;
    max-width: 30px !important;
    max-height: 30px !important;
  }
  
  .air-quality-refresh-btn .v-icon {
    font-size: 1rem !important;
  }
  
  .air-quality-refresh-btn::after {
    top: -2.5px;
    left: -2.5px;
    right: -2.5px;
    bottom: -2.5px;
  }
}

/* Mobile - Smaller but still perfectly circular */
@media (max-width: 767px) {
  .air-quality-refresh-btn {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;
    max-width: 28px !important;
    max-height: 28px !important;
  }
  
  .air-quality-refresh-btn .v-icon {
    font-size: 0.9rem !important;
  }
  
  .air-quality-refresh-btn::after {
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-width: 1.5px;
  }
  
  .air-quality-refresh-btn:focus-visible,
  .air-quality-refresh-btn.v-btn--focused,
  .air-quality-refresh-btn:active,
  .air-quality-refresh-btn.v-btn--active {
    box-shadow: 0 0 0 1.5px rgb(var(--v-theme-primary)) !important;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .air-quality-refresh-btn {
    width: 26px !important;
    height: 26px !important;
    min-width: 26px !important;
    min-height: 26px !important;
    max-width: 26px !important;
    max-height: 26px !important;
  }
  
  .air-quality-refresh-btn .v-icon {
    font-size: 0.85rem !important;
  }
  
  .air-quality-refresh-btn::after {
    top: -1.5px;
    left: -1.5px;
    right: -1.5px;
    bottom: -1.5px;
    border-width: 1.5px;
  }
}

/* HIGH CONTRAST MODE - MAINTAINS CIRCLE WITH STRONGER BORDER */
@media (prefers-contrast: high) {
  .air-quality-refresh-btn::after {
    border-width: 3px;
  }
  
  .air-quality-refresh-btn:focus-visible,
  .air-quality-refresh-btn.v-btn--focused,
  .air-quality-refresh-btn:active,
  .air-quality-refresh-btn.v-btn--active {
    box-shadow: 0 0 0 3px rgb(var(--v-theme-primary)) !important;
    border-radius: 50% !important;
  }
}

/* FORCE CIRCULAR SHAPE ON ALL VUETIFY BUTTON STATES */
.air-quality-refresh-btn:hover:deep(.v-btn__overlay),
.air-quality-refresh-btn:focus:deep(.v-btn__overlay),
.air-quality-refresh-btn:active:deep(.v-btn__overlay),
.air-quality-refresh-btn.v-btn--focused:deep(.v-btn__overlay),
.air-quality-refresh-btn.v-btn--active:deep(.v-btn__overlay) {
  border-radius: 50% !important;
}

/* OVERRIDE VUETIFY DEFAULT FOCUS STYLES */
.air-quality-refresh-btn.v-btn--variant-text:focus {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary)) !important;
}

.air-quality-refresh-btn.v-btn--variant-text:active {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary)) !important;
}

/* ENSURE BORDER APPEARS ON TAB FOCUS */
.air-quality-refresh-btn[tabindex]:focus {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary)) !important;
  outline: none !important;
}

/* DARK THEME SPECIFIC ADJUSTMENTS */
.v-theme--dark .air-quality-refresh-btn::after {
  border-color: transparent;
}

.v-theme--dark .air-quality-refresh-btn:focus-visible::after,
.v-theme--dark .air-quality-refresh-btn.v-btn--focused::after,
.v-theme--dark .air-quality-refresh-btn:active::after,
.v-theme--dark .air-quality-refresh-btn.v-btn--active::after {
  border-color: rgb(var(--v-theme-primary)) !important;
}

.aqi-score-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.aqi-score {
  font-size: 2rem !important;
  line-height: 1 !important;
  color: var(--v-theme-primary) !important;
  font-weight: 700 !important;
}

.aqi-badge {
  font-size: 0.75rem !important;
  padding: 2px 8px !important;
  border-radius: 12px !important;
}

.pollutant-title {
  margin-bottom: 8px !important;
  opacity: 0.8;
}

.pollutant-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 6px !important;
  margin-top: 8px !important;
}

.pollutant-item {
  background: rgba(var(--v-theme-surface), 0.6) !important;
  padding: 6px 8px !important;
  border-radius: 6px !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  min-height: 45px !important;
  max-height: 45px !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.pollutant-label {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.8) !important;
  line-height: 1 !important;
  margin-bottom: 2px !important;
}

.pollutant-value {
  font-size: 0.65rem !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  line-height: 1.1 !important;
  font-weight: 500 !important;
}

/* QUICK ACTIONS CARD */

.quick-actions-card-compact {
  background: rgba(var(--v-theme-surface), 0.8) !important;
  border-radius: clamp(12px, 2vw, 16px) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(var(--v-border-color), 0.12) !important;
  max-height: 260px !important;
  min-height: 240px !important;
  height: 260px !important;
  overflow: hidden;
}

.quick-actions-title-compact {
  padding: 8px 12px !important;
  font-size: 0.875rem !important;
  min-height: 36px !important;
  max-height: 36px !important;
}

.quick-actions-list-compact {
  padding: 0 !important;
}

.quick-action-item-compact {
  border-radius: 6px !important;
  margin-bottom: 2px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  transition: all 0.2s ease;
  padding: 6px 8px !important;
}

.quick-action-item-compact:hover {
  background: rgba(var(--v-theme-primary), 0.06) !important;
}

.quick-action-item-compact :deep(.v-list-item__prepend) {
  margin-right: 8px !important;
}

.quick-action-item-compact :deep(.v-list-item-title) {
  font-size: 0.85rem !important;
  line-height: 1.3 !important;
}

.quick-action-item-compact :deep(.v-list-item-subtitle) {
  font-size: 0.75rem !important;
  line-height: 1.2 !important;
  opacity: 0.7 !important;
}

.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 8px !important;
  height: 100%;
}

/* OTHER COMPONENTS */

.forecast-chart-row {
  margin: 0 -8px -16px -8px;
}

.forecast-chart-card {
  width: 100%;
  max-width: 100%;
}

.insights-row {
  margin: 0 -8px 0 -8px;
}

.insights-col,
.recent-searches-col {
  padding: 8px;
}

.insights-card,
.recent-searches-card {
  height: 100%;
  border-radius: clamp(12px, 2vw, 16px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.insights-title,
.recent-searches-title {
  padding: clamp(12px, 2vw, 16px) clamp(16px, 3vw, 20px) !important;
  font-size: clamp(0.875rem, 2vw, 1rem) !important;
}

.insight-item {
  padding: clamp(6px, 1vw, 8px) 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
  min-height: clamp(36px, 6vw, 44px);
}

.insight-item:last-child {
  border-bottom: none;
}

.insight-icon {
  flex-shrink: 0;
}

.insight-text {
  flex: 1;
  line-height: 1.4;
  font-size: clamp(0.75rem, 2vw, 0.875rem) !important;
}

.recent-searches-chips {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(4px, 1vw, 8px);
  justify-content: flex-start;
}

.recent-search-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: clamp(0.7rem, 1.8vw, 0.875rem) !important;
}

.recent-search-chip:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  transform: translateY(-1px);
}

.no-searches,
.no-insights {
  padding: clamp(16px, 4vw, 24px);
  text-align: center;
}

/* Empty state */
.empty-state {
  min-height: clamp(400px, 60vh, 500px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: clamp(24px, 6vw, 48px);
}

.empty-state-icon {
  opacity: 0.7;
}

.empty-state-title {
  font-size: clamp(1.125rem, 3vw, 1.5rem) !important;
  text-align: center;
  line-height: 1.3;
}

.empty-state-subtitle {
  font-size: clamp(0.875rem, 2vw, 1rem) !important;
  text-align: center;
  line-height: 1.5;
  max-width: 90%;
}

.empty-state-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(8px, 2vw, 12px);
  width: 100%;
  max-width: 400px;
}

.empty-state-btn {
  min-width: clamp(140px, 25vw, 160px);
}

/* Share dialog */
.share-dialog-card {
  border-radius: clamp(12px, 2vw, 16px);
}

.share-dialog-title {
  padding: clamp(16px, 3vw, 20px) !important;
  font-size: clamp(1rem, 2.5vw, 1.25rem) !important;
}

.share-weather-info {
  padding: clamp(12px, 3vw, 16px);
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: clamp(8px, 1.5vw, 12px);
  margin-bottom: clamp(16px, 3vw, 20px);
}

.share-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(8px, 2vw, 12px);
}

.share-action-btn {
  min-width: clamp(80px, 20vw, 100px);
}

/* CUSTOM SNACKBAR */

.custom-snackbar {
  position: fixed !important;
  z-index: 10000 !important;
  border-radius: 8px !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: hidden !important;
}

.custom-snackbar--desktop {
  bottom: 24px !important;
  right: 24px !important;
  max-width: 400px !important;
  min-width: 300px !important;
  transform: none !important;
}

.custom-snackbar--tablet {
  bottom: 16px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  max-width: 500px !important;
  min-width: 300px !important;
}

.custom-snackbar--mobile {
  bottom: 16px !important;
  left: 8px !important;
  right: 8px !important;
  transform: none !important;
  max-width: calc(100vw - 16px) !important;
  min-width: calc(100vw - 16px) !important;
  width: calc(100vw - 16px) !important;
}

.custom-snackbar--fading {
  opacity: 0 !important;
  transform: translateY(20px) !important;
}

.custom-snackbar--desktop.custom-snackbar--fading {
  transform: translateX(20px) !important;
}

.custom-snackbar--tablet.custom-snackbar--fading {
  transform: translateX(-50%) translateY(20px) !important;
}

.custom-snackbar__content {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 14px 18px !important;
  width: 100% !important;
  position: relative !important;
}

.custom-snackbar__message {
  flex: 1 !important;
  color: white !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
  margin-right: 12px !important;
  word-break: break-word !important;
  font-weight: 500 !important;
}

.custom-snackbar__close {
  flex-shrink: 0 !important;
  color: white !important;
  opacity: 0.8 !important;
  transition: opacity 0.2s ease !important;
}

.custom-snackbar__close:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.custom-snackbar__progress {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  height: 3px !important;
  background: rgba(255, 255, 255, 0.3) !important;
  animation: progressShrink linear !important;
  animation-fill-mode: forwards !important;
}

@keyframes progressShrink {
  from { width: 100%; }
  to { width: 0%; }
}

.custom-snackbar--success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95)) !important;
  border: 1px solid rgba(129, 199, 132, 0.3) !important;
}

.custom-snackbar--error {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.95), rgba(211, 47, 47, 0.95)) !important;
  border: 1px solid rgba(239, 154, 154, 0.3) !important;
}

.custom-snackbar--warning {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(245, 124, 0, 0.95)) !important;
  border: 1px solid rgba(255, 204, 128, 0.3) !important;
}

.custom-snackbar--info {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.95), rgba(25, 118, 210, 0.95)) !important;
  border: 1px solid rgba(144, 202, 249, 0.3) !important;
}

/* Vue transitions */
.snackbar-fade-enter-active,
.snackbar-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.snackbar-fade-enter-from,
.snackbar-fade-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

.custom-snackbar--desktop.snackbar-fade-enter-from,
.custom-snackbar--desktop.snackbar-fade-leave-to {
  transform: translateX(50px);
}

.custom-snackbar--tablet.snackbar-fade-enter-from,
.custom-snackbar--tablet.snackbar-fade-leave-to {
  transform: translateX(-50%) translateY(50px);
}

/* Glass effect */
.glass-effect {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(clamp(10px, 2vw, 20px));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out both;
}

/* Dark theme adjustments */
.v-theme--dark .dashboard-header {
  background: rgba(var(--v-theme-surface), 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .glass-effect {
  background: rgba(var(--v-theme-surface), 0.6);
  border-color: rgba(255, 255, 255, 0.08);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .snackbar-fade-enter-active,
  .snackbar-fade-leave-active,
  .custom-snackbar,
  .air-quality-refresh-btn {
    animation: none !important;
    transition: none !important;
  }
  
  .recent-search-chip:hover {
    transform: none;
  }
  
  .dashboard-content {
    animation: none;
  }
  
  .quick-action-item-compact {
    transition: none;
  }

  .custom-snackbar__progress {
    animation: none !important;
  }
}

@media (prefers-contrast: high) {
  .glass-effect,
  .dashboard-header,
  .air-quality-card-complete,
  .quick-actions-card-compact {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-width: 2px !important;
    background: rgb(var(--v-theme-surface)) !important;
  }
  
  .pollutant-item {
    border-width: 2px !important;
    background: rgb(var(--v-theme-surface-container)) !important;
  }
  
  .custom-snackbar {
    backdrop-filter: none !important;
    border-width: 2px !important;
  }
  
  .header-search :deep(.v-field__prepend-inner .v-icon),
  .header-search :deep(.v-field__append-inner .v-icon) {
    color: rgb(var(--v-theme-on-surface)) !important;
  }
}

/* Print optimizations */
@media print {
  .dashboard-page {
    max-width: none;
    padding: 0;
  }
  
  .dashboard-header,
  .quick-actions-card-compact,
  .recent-searches-card {
    display: none;
  }
  
  .glass-effect {
    background: white;
    backdrop-filter: none;
    border: 1px solid #ccc;
  }
  
  .animate-fade-in {
    animation: none;
  }

  .custom-snackbar {
    display: none !important;
  }
}

/* Focus states for accessibility */
.header-search :deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.3) !important;
}

/* Hover states */
@media (hover: hover) {
  .header-search :deep(.v-field):hover {
    border-color: rgba(var(--v-theme-primary), 0.3) !important;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .glass-effect {
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
  }
}
</style>
