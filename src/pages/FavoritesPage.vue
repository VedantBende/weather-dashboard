<template>
  <div class="favorites-page">
    <!-- Page header -->
    <div class="favorites-header mb-6">
      <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between">
        <div class="header-content mb-4 mb-md-0">
          <h1 class="text-h4 font-weight-bold mb-2">
            <v-icon class="mr-2">mdi-heart</v-icon>
            Favorite Cities
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            {{ favorites.length }} saved location{{ favorites.length !== 1 ? 's' : '' }}
          </p>
        </div>
        
        <div class="header-actions">
          <WeatherSearch 
            variant="compact"
            placeholder="Add a city to favorites..."
            @city-selected="handleAddCity"
          />
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <div class="text-h6 mt-4">Loading favorite cities...</div>
    </div>

    <!-- Favorites grid -->
    <div v-else-if="favorites.length > 0" class="favorites-content">
      <v-row>
        <v-col
          v-for="favorite in favorites"
          :key="favorite.id || favorite.name"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card
            class="favorite-card"
            @click="selectFavorite(favorite)"
            hover
            elevation="4"
          >
            <!-- Card header -->
            <div class="favorite-card-header d-flex align-center justify-space-between pa-4">
              <div class="location-info">
                <h3 class="text-h6 font-weight-bold">{{ favorite.name }}</h3>
                <p class="text-body-2 text-medium-emphasis">
                  {{ favorite.country || favorite.sys?.country || 'Unknown' }}
                </p>
              </div>
              
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                    @click.stop
                  />
                </template>
                
                <v-list>
                  <v-list-item
                    prepend-icon="mdi-refresh"
                    title="Refresh"
                    @click="refreshFavorite(favorite)"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-delete"
                    title="Remove"
                    class="text-error"
                    @click="removeFavorite(favorite)"
                  />
                </v-list>
              </v-menu>
            </div>

            <!-- Weather content -->
            <div class="favorite-card-content pa-4 pt-0">
              <!-- Loading state -->
              <div v-if="isLoading(favorite)" class="weather-loading text-center py-4">
                <v-progress-circular indeterminate color="primary" size="32" />
                <p class="text-caption mt-2">Loading weather...</p>
              </div>

              <!-- Weather data -->
              <div v-else-if="getWeatherData(favorite)" class="weather-info">
                <div class="current-weather d-flex align-center justify-space-between mb-3">
                  <div class="temperature">
                    <span class="text-h4 font-weight-light">
                      {{ getTemperature(getWeatherData(favorite)) }}
                    </span>
                    <span class="text-h6 text-medium-emphasis ml-1">°C</span>
                  </div>
                  
                  <div class="weather-icon-small">
                    <img
                      :src="getWeatherIconUrl(getWeatherData(favorite).weather[0].icon)"
                      :alt="getWeatherData(favorite).weather[0].description"
                      width="48"
                      height="48"
                    />
                  </div>
                </div>
                
                <div class="weather-description mb-3">
                  <p class="text-body-2 text-capitalize">
                    {{ getWeatherData(favorite).weather[0].description }}
                  </p>
                </div>
                
                <div class="weather-details">
                  <div class="detail-item d-flex align-center justify-space-between">
                    <span class="text-caption text-medium-emphasis">Feels like</span>
                    <span class="text-caption">
                      {{ getFeelsLike(getWeatherData(favorite)) }}°C
                    </span>
                  </div>
                  <div class="detail-item d-flex align-center justify-space-between">
                    <span class="text-caption text-medium-emphasis">Humidity</span>
                    <span class="text-caption">{{ getWeatherData(favorite).main.humidity }}%</span>
                  </div>
                </div>
              </div>
              
              <!-- Error state -->
              <div v-else class="weather-error text-center py-4">
                <v-icon color="error" size="32" class="mb-2">mdi-alert-circle</v-icon>
                <p class="text-caption text-medium-emphasis mb-2">
                  Failed to load weather data
                </p>
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="refreshFavorite(favorite)"
                >
                  Retry
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Bulk actions -->
      <div v-if="favorites.length > 1" class="bulk-actions mt-6 text-center">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          @click="refreshAllFavorites"
          :loading="refreshingAll"
          class="mr-2"
        >
          Refresh All
        </v-btn>
        <v-btn
          variant="outlined"
          color="error"
          prepend-icon="mdi-delete-sweep"
          @click="clearAllFavorites"
        >
          Clear All
        </v-btn>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state text-center py-12">
      <v-icon size="120" color="grey">mdi-heart-outline</v-icon>
      <h2 class="text-h5 font-weight-bold mt-4 mb-2">
        No Favorite Cities Yet
      </h2>
      <p class="text-body-1 text-medium-emphasis mb-6 max-w-md mx-auto">
        Add cities to your favorites for quick access to their weather information.
      </p>
      <div class="empty-state-actions">
        <!-- UPDATED: Centered search box -->
        <div class="search-box-container d-flex justify-center">
          <WeatherSearch 
            placeholder="Search and add a city..."
            @city-selected="handleAddCity"
            class="search-box"
          />
        </div>
        <div class="popular-cities mt-6">
          <p class="text-subtitle-2 mb-3">Or try these popular cities:</p>
          <div class="popular-chips">
            <v-chip
              v-for="city in popularCities"
              :key="city.name"
              variant="outlined"
              class="ma-1"
              @click="addPopularCity(city)"
            >
              <v-icon start size="small">mdi-map-marker</v-icon>
              {{ city.name }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { reactive } from 'vue'
import WeatherSearch from '@/components/weather/WeatherSearch.vue'

export default {
  name: 'FavoritesPage',
  components: {
    WeatherSearch
  },
  
  data() {
    return {
      loading: false,
      refreshingAll: false,
      favoriteWeatherData: reactive(new Map()),
      loadingStates: reactive(new Map()),
      // Snackbar
      showSnackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      // API Key
      apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || "67a172fd6aac31aee1c6644d11e18130",
      // Popular cities
      popularCities: [
        { name: 'London', country: 'GB' },
        { name: 'New York', country: 'US' },
        { name: 'Tokyo', country: 'JP' },
        { name: 'Paris', country: 'FR' },
        { name: 'Sydney', country: 'AU' },
        { name: 'Dubai', country: 'AE' }
      ]
    }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    favorites() {
      return this.weatherStore.favorites || []
    }
  },
  
  watch: {
    favorites: {
      handler(newFavorites) {
        console.log('📊 Favorites changed, count:', newFavorites?.length || 0)
        if (newFavorites && newFavorites.length > 0) {
          this.fetchAllFavoritesWeather(newFavorites)
        }
      },
      immediate: true,
      deep: true
    }
  },
  
  async mounted() {
    console.log('📱 Favorites page mounted')
    console.log('📱 API Key available:', this.apiKey ? 'Yes' : 'No')
    console.log('📱 Favorites count:', this.favorites.length)
    
    await this.loadAllWeatherData()
  },
  
  methods: {
    // Get weather data for a specific favorite
    getWeatherData(favorite) {
      const key = favorite.id || favorite.name
      return this.favoriteWeatherData.get(key)
    },
    
    // Check if a favorite is loading
    isLoading(favorite) {
      const key = favorite.id || favorite.name
      return this.loadingStates.get(key) || false
    },
    
    // DIRECT API FETCH METHOD
    async fetchWeatherDirect(cityName) {
      if (!this.apiKey) {
        throw new Error('API key not configured')
      }
      
      console.log('🌐 Fetching weather for:', cityName)
      
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key')
        } else if (response.status === 404) {
          throw new Error('City not found')
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded')
        } else {
          throw new Error(`API error: ${response.status}`)
        }
      }
      
      const data = await response.json()
      console.log('✅ Weather data received for:', data.name)
      return data
    },
    
    // Load weather data for all favorites
    async loadAllWeatherData() {
      if (this.favorites.length === 0) return
      
      this.loading = true
      console.log('📊 Loading weather for all favorites')
      
      for (const favorite of this.favorites) {
        await this.loadSingleWeatherData(favorite)
      }
      
      this.loading = false
      this.showNotification(`Weather loaded for ${this.favorites.length} cities`, 'success')
    },
    
    // Load weather data for a single favorite
    async loadSingleWeatherData(favorite) {
      const key = favorite.id || favorite.name
      const cityName = favorite.name
      
      this.loadingStates.set(key, true)
      this.$forceUpdate() // Force reactivity
      
      try {
        console.log('📍 Loading weather for:', cityName)
        const weatherData = await this.fetchWeatherDirect(cityName)
        
        this.favoriteWeatherData.set(key, weatherData)
        console.log('✅ Weather loaded for:', cityName)
        
      } catch (error) {
        console.error('❌ Failed to load weather for', cityName, ':', error)
        this.showNotification(`Failed to load ${cityName}: ${error.message}`, 'error')
        
      } finally {
        this.loadingStates.set(key, false)
        this.$forceUpdate() // Force reactivity
      }
    },
    
    // Refresh a single favorite
    async refreshFavorite(favorite) {
      console.log('🔄 Refreshing:', favorite.name)
      await this.loadSingleWeatherData(favorite)
    },
    
    // Refresh all favorites
    async refreshAllFavorites() {
      this.refreshingAll = true
      await this.loadAllWeatherData()
      this.refreshingAll = false
    },
    
    // Add city to favorites
    async handleAddCity(city) {
      console.log('➕ Adding city:', city.name)
      
      try {
        const weatherData = await this.fetchWeatherDirect(city.name)
        await this.weatherStore.addToFavorites(weatherData)
        
        // Add to local data immediately
        const key = weatherData.name
        this.favoriteWeatherData.set(key, weatherData)
        
        this.showNotification(`${city.name} added to favorites`, 'success')
        
      } catch (error) {
        console.error('❌ Failed to add city:', error)
        this.showNotification(`Failed to add ${city.name}: ${error.message}`, 'error')
      }
    },
    
    // Add popular city
    async addPopularCity(city) {
      await this.handleAddCity(city)
    },
    
    // Remove favorite
    removeFavorite(favorite) {
      console.log('🗑️ Removing:', favorite.name)
      
      this.weatherStore.removeFromFavorites(favorite.name)
      
      const key = favorite.id || favorite.name
      this.favoriteWeatherData.delete(key)
      this.loadingStates.delete(key)
      
      this.showNotification(`${favorite.name} removed`, 'info')
    },
    
    // Clear all favorites
    clearAllFavorites() {
      console.log('🗑️ Clearing all favorites')
      
      this.favorites.forEach(favorite => {
        this.weatherStore.removeFromFavorites(favorite.name)
      })
      
      this.favoriteWeatherData.clear()
      this.loadingStates.clear()
      
      this.showNotification('All favorites cleared', 'info')
    },
    
    // Select favorite for details
    selectFavorite(favorite) {
      const weatherData = this.getWeatherData(favorite)
      if (weatherData) {
        console.log('👁️ Viewing details for:', favorite.name)
        // You can add a details modal here or navigate to a detail page
        this.showNotification(`Viewing ${favorite.name} weather details`, 'info')
      }
    },
    
    // Helper methods
    getTemperature(weatherData) {
      return weatherData ? Math.round(weatherData.main.temp) : 0
    },
    
    getFeelsLike(weatherData) {
      return weatherData ? Math.round(weatherData.main.feels_like) : 0
    },
    
    getWeatherIconUrl(icon) {
      return `https://openweathermap.org/img/wn/${icon}@2x.png`
    },
    
    showNotification(message, color = 'success') {
      this.snackbarMessage = message
      this.snackbarColor = color
      this.showSnackbar = true
    }
  }
}
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.favorites-header {
  background: rgba(var(--v-theme-surface), 0.7);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
  margin-bottom: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.favorite-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  height: 100%;
  cursor: pointer;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.favorite-card-header {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.weather-info {
  min-height: 140px;
}

.weather-loading, .weather-error {
  min-height: 140px;
}

.detail-item {
  padding: 4px 0;
}

.empty-state {
  min-height: 400px;
}

/* UPDATED: Centered search box styling */
.search-box-container {
  width: 100%;
  margin: 2rem 0;
}

.search-box {
  max-width: 400px;
  width: 100%;
}

.popular-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.bulk-actions {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  padding: 20px;
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 0 8px;
  }
  
  .favorites-header {
    padding: 16px;
  }
  
  /* Ensure search box is still centered on mobile */
  .search-box-container {
    padding: 0 16px;
  }
}
</style>
