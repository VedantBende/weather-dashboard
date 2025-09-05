<template>
  <v-navigation-drawer
    v-model="sidebarOpen"
    :mini-variant="collapsed"
    :expand-on-hover="collapsed"
    :temporary="mobile"
    :permanent="!mobile"
    :width="sidebarWidth"
    :mini-variant-width="72"
    :class="sidebarClasses"
    app
  >
    <!-- Header with proper collapse button -->
    <div class="sidebar-header" :class="{ 'collapsed-header': collapsed }">
      <div v-if="!collapsed" class="d-flex align-center pa-4">
        <v-avatar size="32" class="mr-3">
          <v-img :src="logoUrl" contain />
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold">Weather Dashboard</div>
          <div class="text-caption text-medium-emphasis">v1.0.0</div>
        </div>
        <v-spacer />
        <v-btn
          v-if="!mobile"
          icon="mdi-chevron-left"
          variant="text"
          size="small"
          @click="toggleCollapsed"
        />
      </div>
      
      <!-- Collapsed state header with expand button -->
      <div v-else class="collapsed-header-content">
        <div class="d-flex justify-center pa-2">
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="small"
            @click="toggleCollapsed"
            class="expand-btn"
          />
        </div>
      </div>
    </div>

    <v-divider />

    <!-- Current weather summary (when sidebar is expanded) -->
    <div v-if="!collapsed && currentWeather" class="current-weather-summary pa-4">
      <div class="d-flex align-center mb-2">
        <v-avatar size="40" class="mr-3">
          <v-img
            :src="getWeatherIconUrl(currentWeather.weather[0].icon)"
            :alt="currentWeather.weather[0].description"
          />
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">
            {{ getCurrentTemp }}{{ getUnitSymbol }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ currentWeather.name }}
          </div>
        </div>
      </div>
      <div class="text-body-2 text-capitalize">
        {{ currentWeather.weather[0].description }}
      </div>
    </div>

    <v-divider v-if="!collapsed && currentWeather" />

    <!-- Navigation menu -->
    <v-list nav class="sidebar-nav">
      <v-list-item
        v-for="item in navigationItems"
        :key="item.name"
        :to="{ name: item.name }"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.name"
        class="sidebar-nav-item"
        active-class="sidebar-nav-item--active"
      >
        <template v-if="collapsed" v-slot:default>
          <v-tooltip
            :text="item.title"
            location="end"
            activator="parent"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-2" />

    <!-- Quick actions -->
    <div class="quick-actions">
      <div v-if="!collapsed" class="text-overline text-medium-emphasis mb-2 px-4">
        Quick Actions
      </div>
      
      <v-list nav density="compact">
        <v-list-item
          prepend-icon="mdi-crosshairs-gps"
          :title="'Current Location'"
          @click="fetchLocationWeather"
          :loading="loading"
          class="quick-action-item"
        >
          <template v-if="collapsed" v-slot:default>
            <v-tooltip
              text="Get weather for current location"
              location="end"
              activator="parent"
            />
          </template>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-refresh"
          :title="'Refresh Data'"
          @click="refreshWeather"
          :loading="loading"
          class="quick-action-item"
        >
          <template v-if="collapsed" v-slot:default>
            <v-tooltip
              text="Refresh weather data"
              location="end"
              activator="parent"
            />
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- Favorites section -->
    <div v-if="!collapsed && favorites.length > 0" class="favorites-section pa-2">
      <div class="text-overline text-medium-emphasis mb-2 px-2">
        Favorite Cities
      </div>
      
      <v-list nav density="compact">
        <v-list-item
          v-for="favorite in favorites.slice(0, 5)"
          :key="favorite.id || favorite.name"
          :prepend-icon="getWeatherConditionIcon(getFavoriteCondition(favorite))"
          :title="favorite.name"
          :subtitle="favorite.country || favorite.sys?.country"
          @click="selectFavoriteCity(favorite)"
          class="favorite-item"
        >
          <template v-slot:append>
            <div v-if="isLoadingFavorite(favorite)" class="text-caption">
              <v-progress-circular size="16" indeterminate />
            </div>
            <div v-else class="text-caption">
              {{ getFavoriteTemp(favorite) }}
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- Footer -->
    <template v-slot:append>
      <div class="sidebar-footer pa-2">
        <v-divider class="mb-2" />
        <div class="d-flex align-center justify-center">
          <DarkModeToggle />
        </div>
      </div>
    </template>

    <!-- Mobile search dialog -->
    <v-dialog v-model="showSearchDialog" max-width="400">
      <v-card>
        <v-card-title>Search Cities</v-card-title>
        <v-card-text>
          <WeatherSearch @city-selected="handleCitySelected" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showSearchDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { useDisplay } from 'vuetify'
import { reactive } from 'vue'
import WeatherSearch from '@/components/weather/WeatherSearch.vue'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'

export default {
  name: 'Sidebar',
  components: {
    WeatherSearch,
    DarkModeToggle
  },
  
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['update:modelValue'],
  
  data() {
    return {
      collapsed: false,
      showSearchDialog: false,
      // FIXED: Use reactive Maps for proper Vue reactivity
      favoriteWeatherData: reactive(new Map()),
      loadingStates: reactive(new Map()),
      // API Key - Replace with your actual key
      apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || "b8e1a5c9d4f2e8b7a1c3d5e9f8b2c4a6",
      navigationItems: [
        {
          name: 'Dashboard',
          title: 'Dashboard',
          icon: 'mdi-view-dashboard'
        },
        {
          name: 'Favorites',
          title: 'Favorites',
          icon: 'mdi-heart'
        },
        {
          name: 'Settings',
          title: 'Settings',
          icon: 'mdi-cog'
        }
      ]
    }
  },
  
  setup() {
    const { mobile } = useDisplay()
    return { mobile }
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
  
  computed: {
    sidebarOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    
    weatherStore() {
      return useWeatherStore()
    },
    
    currentWeather() {
      return this.weatherStore.currentWeather
    },
    
    favorites() {
      return this.weatherStore.favorites || []
    },
    
    loading() {
      return this.weatherStore.loading
    },
    
    lastUpdated() {
      return this.weatherStore.lastUpdated
    },
    
    getCurrentTemp() {
      return this.weatherStore.getCurrentTemp
    },
    
    getUnitSymbol() {
      return this.weatherStore.getUnitSymbol
    },
    
    sidebarWidth() {
      return this.collapsed ? 72 : 280
    },
    
    sidebarClasses() {
      return [
        'sidebar',
        'glass-effect',
        {
          'sidebar--collapsed': this.collapsed
        }
      ]
    },
    
    logoUrl() {
      try {
        return new URL('@/assets/logo.svg', import.meta.url).href
      } catch {
        return '/logo.svg'
      }
    },
    
    formatLastUpdated() {
      if (!this.lastUpdated) return 'Never'
      const now = new Date()
      const diff = now - new Date(this.lastUpdated)
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      return 'Over a day ago'
    }
  },
  
  methods: {
    // FIXED: Direct API fetch method
    async fetchWeatherAPI(cityName) {
      if (!this.apiKey) {
        console.warn('⚠️ API key not configured')
        return null
      }
      
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`
        
        console.log('🌐 Fetching weather for:', cityName)
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('✅ Weather received for:', data.name)
        return data
        
      } catch (error) {
        console.error('❌ Failed to fetch weather for', cityName, ':', error)
        return null
      }
    },
    
    // FIXED: Fetch weather for all favorites
    async fetchAllFavoritesWeather(favoritesList) {
      console.log('📊 Fetching weather for all favorites')
      
      for (const favorite of favoritesList) {
        await this.fetchSingleFavoriteWeather(favorite)
      }
    },
    
    // FIXED: Fetch weather for single favorite
    async fetchSingleFavoriteWeather(favorite) {
      const cityKey = favorite.id || favorite.name
      const cityName = favorite.name
      
      if (!cityName || this.loadingStates.get(cityKey)) {
        return
      }
      
      console.log('🌍 Fetching weather for favorite:', cityName)
      
      // Set loading state
      this.loadingStates.set(cityKey, true)
      
      try {
        const weatherData = await this.fetchWeatherAPI(cityName)
        
        if (weatherData) {
          // Store weather data
          this.favoriteWeatherData.set(cityKey, weatherData)
          console.log('✅ Weather stored for:', cityName)
        }
        
      } catch (error) {
        console.error('❌ Error fetching weather for', cityName, ':', error)
      } finally {
        // Clear loading state
        this.loadingStates.set(cityKey, false)
      }
    },
    
    // FIXED: Get weather data for favorite
    getWeatherDataForFavorite(favorite) {
      const key = favorite.id || favorite.name
      return this.favoriteWeatherData.get(key) || null
    },
    
    // FIXED: Check if favorite is loading
    isLoadingFavorite(favorite) {
      const key = favorite.id || favorite.name
      return this.loadingStates.get(key) || false
    },
    
    // FIXED: Get weather condition for icon
    getFavoriteCondition(favorite) {
      const weatherData = this.getWeatherDataForFavorite(favorite)
      if (weatherData && weatherData.weather && weatherData.weather[0]) {
        return weatherData.weather[0].main
      }
      return 'Unknown'
    },
    
    // FIXED: Get temperature for favorite
    getFavoriteTemp(favorite) {
      const weatherData = this.getWeatherDataForFavorite(favorite)
      if (weatherData && weatherData.main) {
        return Math.round(weatherData.main.temp) + '°C'
      }
      return '--°'
    },
    
    toggleCollapsed() {
      this.collapsed = !this.collapsed
      localStorage.setItem('sidebarCollapsed', JSON.stringify(this.collapsed))
    },
    
    async fetchLocationWeather() {
      try {
        await this.weatherStore.fetchWeatherByLocation()
      } catch (error) {
        console.error('Failed to fetch location weather:', error)
      }
    },
    
    async refreshWeather() {
      try {
        await this.weatherStore.refreshCurrentWeather()
        // Also refresh favorites
        if (this.favorites.length > 0) {
          await this.fetchAllFavoritesWeather(this.favorites)
        }
      } catch (error) {
        console.error('Failed to refresh weather:', error)
      }
    },
    
    async selectFavoriteCity(favorite) {
      try {
        await this.weatherStore.fetchWeatherByCity(favorite.name)
        if (this.mobile) {
          this.sidebarOpen = false
        }
      } catch (error) {
        console.error('Failed to fetch favorite city weather:', error)
      }
    },
    
    handleCitySelected(city) {
      this.showSearchDialog = false
      if (this.mobile) {
        this.sidebarOpen = false
      }
    },
    
    getWeatherIconUrl(icon) {
      return `https://openweathermap.org/img/wn/${icon}.png`
    },
    
    getWeatherConditionIcon(condition) {
      const iconMap = {
        'Clear': 'mdi-weather-sunny',
        'Clouds': 'mdi-weather-cloudy',
        'Rain': 'mdi-weather-rainy',
        'Drizzle': 'mdi-weather-partly-rainy',
        'Thunderstorm': 'mdi-weather-lightning',
        'Snow': 'mdi-weather-snowy',
        'Mist': 'mdi-weather-fog',
        'Fog': 'mdi-weather-fog'
      }
      return iconMap[condition] || 'mdi-weather-partly-cloudy'
    }
  },
  
  mounted() {
    const collapsed = localStorage.getItem('sidebarCollapsed')
    if (collapsed !== null) {
      this.collapsed = JSON.parse(collapsed)
    }
    
    console.log('📊 Sidebar mounted')
    console.log('📊 API key available:', this.apiKey ? 'Yes' : 'No')
    console.log('📊 Favorites count:', this.favorites.length)
  }
}
</script>

<style scoped>
.sidebar {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

.sidebar-header {
  background: rgba(var(--v-theme-surface), 0.8);
  min-height: 72px;
}

.collapsed-header {
  min-height: 56px !important;
}

.collapsed-header-content {
  padding: 8px 0;
}

.expand-btn {
  background: rgba(var(--v-theme-primary), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
  margin-bottom: 8px;
}

.current-weather-summary {
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Navigation items - Clean and simple */
.sidebar-nav {
  padding: 8px 8px;
}

.sidebar-nav-item {
  margin: 4px 8px;
  border-radius: 8px !important;
  min-height: 48px;
}

.sidebar-nav-item--active {
  background: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.sidebar-nav-item--active .v-icon {
  color: rgb(var(--v-theme-primary)) !important;
}

/* Mini variant - ONLY hide text, keep everything else visible */
.v-navigation-drawer--mini-variant .v-list-item-title {
  display: none !important;
}

.v-navigation-drawer--mini-variant .v-list-item-subtitle {
  display: none !important;
}

/* Center icons in mini variant */
.v-navigation-drawer--mini-variant .sidebar-nav-item,
.v-navigation-drawer--mini-variant .quick-action-item {
  justify-content: center !important;
}

.v-navigation-drawer--mini-variant .v-list-item__prepend {
  margin-inline-end: 0 !important;
}

/* Quick actions styling */
.quick-actions {
  padding: 8px 0;
}

.quick-action-item {
  margin: 4px 8px;
  border-radius: 8px;
  min-height: 48px;
}

/* Favorites section styling */
.favorites-section .favorite-item {
  margin: 2px 4px;
  border-radius: 6px;
  min-height: 40px;
}

/* Footer styling */
.sidebar-footer {
  background: rgba(var(--v-theme-surface), 0.5);
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Hide content in collapsed state */
.sidebar--collapsed .current-weather-summary,
.sidebar--collapsed .favorites-section {
  display: none;
}

/* Hover effects */
.sidebar-nav-item:hover,
.quick-action-item:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

.favorite-item:hover {
  background: rgba(var(--v-theme-surface), 0.8) !important;
}

/* Dark mode optimizations */
.v-theme--dark .expand-btn {
  background: rgba(var(--v-theme-primary), 0.15) !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .sidebar {
    position: fixed !important;
    z-index: 1006 !important;
  }
}
</style>
