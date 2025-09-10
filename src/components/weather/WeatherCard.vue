<template>
  <v-card
    class="weather-card"
    :class="[
      { 'weather-card--featured': featured },
      getWeatherBackgroundClass,
      'animated-weather-card'
    ]"
    elevation="8"
    rounded="xl"
  >
    <!-- Header with City Info and Action Buttons -->
    <v-card-title class="header-container pa-4 pb-2">
      <!-- City Info Section -->
      <div class="city-info-container">
        <h2 class="text-h4 font-weight-bold text-white mb-1 city-title animated-title">
          {{ weatherData.name }}
        </h2>
        <div class="d-flex align-center text-white-secondary">
          <v-icon size="16" class="me-1 location-pulse">mdi-map-marker</v-icon>
          <span class="text-body-2 location-info">
            {{ getDisplayCountryCode(weatherData.sys?.country) }} • {{ getCurrentDateTime }}
          </span>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons-container">
        <!-- Favorite Button -->
        <v-btn
          icon
          variant="text"
          :size="buttonSize"
          @click="toggleFavorite"
          :disabled="favoriteLoading"
          class="action-btn favorite-btn"
          :class="{
            'favorite-active': isFavorite,
            'favorite-loading': favoriteLoading
          }"
        >
          <v-icon 
            :color="isFavorite ? 'red-accent-2' : 'white'"
            :size="iconSize"
            :class="{ 
              'animate-pulse': favoriteLoading,
              'animate-heartbeat': isFavorite && !favoriteLoading
            }"
          >
            {{ 
              favoriteLoading ? 'mdi-loading' : 
              (isFavorite ? 'mdi-heart' : 'mdi-heart-outline') 
            }}
          </v-icon>
          <v-tooltip activator="parent" location="bottom">
            {{
              favoriteLoading ? 'Updating favorite...' :
              (isFavorite ? `Remove ${weatherData.name} from favorites` : `Add ${weatherData.name} to favorites`)
            }}
          </v-tooltip>
        </v-btn>
        
        <!-- REFRESH BUTTON - Same logic as Navbar with round shape -->
        <v-btn
          icon
          variant="text"
          :size="buttonSize"
          @click="refreshWeather"
          :loading="loading"
          class="action-btn refresh-btn"
          :class="{ 'refresh-active': loading }"
        >
          <v-icon 
            color="white" 
            :size="iconSize"
            :class="{ 'animate-spin': loading }"
          >
            mdi-refresh
          </v-icon>
          <v-tooltip activator="parent" location="bottom">
            {{ loading ? 'Refreshing...' : 'Refresh weather data' }}
          </v-tooltip>
        </v-btn>
        
        <!-- Share Button -->
        <v-btn
          icon
          variant="text"
          :size="buttonSize"
          @click="shareWeather"
          :disabled="sharing"
          class="action-btn share-btn animated-share"
        >
          <v-icon 
            color="white" 
            :size="iconSize"
            :class="{ 'animate-pulse': sharing }"
          >
            {{ sharing ? 'mdi-loading' : 'mdi-share-variant' }}
          </v-icon>
          <v-tooltip activator="parent" location="bottom">
            {{ sharing ? 'Sharing weather info...' : 'Share weather info' }}
          </v-tooltip>
        </v-btn>
      </div>
    </v-card-title>

    <!-- Main Temperature Display -->
    <v-card-text class="pa-4 pt-0">
      <div class="d-flex align-center justify-space-between">
        <div class="temperature-section">
          <div class="temperature-display d-flex align-baseline">
            <span class="text-h1 font-weight-light text-white temperature-main animated-temp">
              {{ getDisplayTemp }}
            </span>
            <span class="text-h3 text-white-secondary temperature-unit">{{ getUnitSymbol }}</span>
          </div>
          
          <div class="text-body-1 text-white-secondary mb-2 fade-in-up">
            Feels like {{ getFeelsLikeTemp }}{{ getUnitSymbol }}
          </div>
          
          <!-- High/Low Temperature -->
          <div class="d-flex align-center text-white-secondary fade-in-up">
            <v-icon size="16" class="me-1 temp-arrow-up">mdi-arrow-up</v-icon>
            <span class="me-3">{{ getTempMax }}°</span>
            <v-icon size="16" class="me-1 temp-arrow-down">mdi-arrow-down</v-icon>
            <span>{{ getTempMin }}°</span>
          </div>
        </div>
        
        <!-- Weather Icon and Condition -->
        <div class="weather-icon-section text-center">
          <div class="weather-icon-container enhanced-icon-container">
            <div class="weather-animation-icon" :class="getWeatherAnimationClass"></div>
            <div class="weather-particles" :class="getWeatherParticleClass"></div>
            <v-img
              v-if="weatherData.weather?.[0]?.icon"
              :src="getWeatherIconUrl(weatherData.weather[0].icon)"
              :alt="weatherData.weather[0].description"
              width="80"
              height="80"
              class="weather-icon weather-icon-enhanced"
              :class="getWeatherIconAnimationClass"
            />
          </div>
          <div class="text-h6 text-white text-capitalize mt-2 weather-condition animated-condition">
            {{ weatherData.weather?.[0]?.description || 'Clear Sky' }}
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Weather Details Grid -->
    <v-card-text class="pa-4 pt-0">
      <v-row dense>
        <v-col cols="6" sm="3">
          <div class="weather-detail-card humidity-detail">
            <v-icon color="white" size="20" class="mb-2 icon-pulse">mdi-water-percent</v-icon>
            <div class="text-h6 text-white font-weight-bold animated-number">
              {{ Math.round(weatherData.main?.humidity || 0) }}%
            </div>
            <div class="text-caption text-white-secondary">
              HUMIDITY
            </div>
          </div>
        </v-col>
        
        <v-col cols="6" sm="3">
          <div class="weather-detail-card wind-detail">
            <v-icon color="white" size="20" class="mb-2 icon-wind">mdi-windsock</v-icon>
            <div class="text-h6 text-white font-weight-bold animated-number">
              {{ Math.round(getWindSpeed) }} {{ getWindUnit }}
            </div>
            <div class="text-caption text-white-secondary">
              WIND
            </div>
          </div>
        </v-col>
        
        <v-col cols="6" sm="3">
          <div class="weather-detail-card pressure-detail">
            <v-icon color="white" size="20" class="mb-2 icon-bounce">mdi-gauge</v-icon>
            <div class="text-h6 text-white font-weight-bold animated-number">
              {{ Math.round(weatherData.main?.pressure || 1013) }}
            </div>
            <div class="text-caption text-white-secondary">
              PRESSURE
            </div>
          </div>
        </v-col>
        
        <v-col cols="6" sm="3">
          <div class="weather-detail-card visibility-detail">
            <v-icon color="white" size="20" class="mb-2 icon-fade">mdi-eye</v-icon>
            <div class="text-h6 text-white font-weight-bold animated-number">
              {{ Math.round((weatherData.visibility || 10000) / 1000) }} km
            </div>
            <div class="text-caption text-white-secondary">
              VISIBILITY
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Footer with Additional Info -->
    <v-card-text class="pa-4 pt-0">
      <div class="d-flex justify-space-between align-center text-white-secondary footer-content">
        <div class="text-caption sun-times">
          <div class="sun-item">
            <v-icon size="16" color="orange" class="me-1">mdi-weather-sunset-up</v-icon>
            {{ getSunTime('sunrise') }}
          </div>
          <div class="sun-item mt-1">
            <v-icon size="16" color="deep-orange" class="me-1">mdi-weather-sunset-down</v-icon>
            {{ getSunTime('sunset') }}
          </div>
        </div>
        <div class="text-caption text-right update-info">
          Updated {{ getLastUpdated }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { useWeatherStore } from '@/store/weather'

export default {
  name: 'WeatherCard',
  
  props: {
    weatherData: {
      type: Object,
      required: true,
      default: () => ({
        name: 'New York',
        sys: { country: 'US' },
        main: {
          temp: 295,
          feels_like: 298,
          temp_max: 297,
          temp_min: 293,
          humidity: 65,
          pressure: 1013
        },
        wind: { speed: 2.5 },
        visibility: 10000,
        weather: [{
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        dt: Math.floor(Date.now() / 1000),
        timezone: -14400
      })
    },
    featured: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['refresh', 'favorite-toggle', 'share', 'show-snackbar'],
  
  data() {
    return {
      sharing: false,
      favoriteLoading: false,
      localIsFavorite: false
    }
  },
  
  setup() {
    const weatherStore = useWeatherStore()
    return { weatherStore }
  },
  
  computed: {
    // Use same loading logic as Navbar
    loading() {
      return this.weatherStore.loading
    },
    
    isFavorite() {
      if (this.favoriteLoading) {
        return this.localIsFavorite
      }
      
      if (this.weatherStore?.isFavorite) {
        return this.weatherStore.isFavorite(this.weatherData.name)
      }
      
      return this.localIsFavorite
    },
    
    buttonSize() {
      if (this.$vuetify?.display?.xs) return 'x-small'
      if (this.$vuetify?.display?.sm) return 'small'
      return 'small'
    },
    
    iconSize() {
      if (this.$vuetify?.display?.xs) return 14
      if (this.$vuetify?.display?.sm) return 16
      return 18
    },
    
    getUnitSymbol() {
      return this.weatherStore?.getUnitSymbol || 'C'
    },
    
    getWindUnit() {
      const units = this.weatherStore?.units || 'metric'
      return units === 'metric' ? 'km/h' : units === 'imperial' ? 'mph' : 'm/s'
    },
    
    getWindSpeed() {
      const speed = this.weatherData.wind?.speed || 0
      const units = this.weatherStore?.units || 'metric'
      
      if (units === 'metric') {
        return speed * 3.6
      } else if (units === 'imperial') {
        return speed
      }
      return speed
    },
    
    getWeatherBackgroundClass() {
      const weatherMain = this.weatherData.weather?.[0]?.main?.toLowerCase() || 'clear'
      const weatherDesc = this.weatherData.weather?.[0]?.description?.toLowerCase() || ''
      
      if (weatherMain.includes('clear') || weatherDesc.includes('clear')) {
        return 'weather-clear'
      } else if (weatherMain.includes('cloud') || weatherDesc.includes('cloud')) {
        if (weatherDesc.includes('overcast')) {
          return 'weather-overcast'
        }
        return 'weather-clouds'
      } else if (weatherMain.includes('rain') || weatherDesc.includes('rain')) {
        return 'weather-rain'
      } else if (weatherMain.includes('drizzle') || weatherDesc.includes('drizzle')) {
        return 'weather-drizzle'
      } else if (weatherMain.includes('thunderstorm') || weatherDesc.includes('thunder')) {
        return 'weather-thunderstorm'
      } else if (weatherMain.includes('snow') || weatherDesc.includes('snow')) {
        return 'weather-snow'
      } else if (weatherMain.includes('mist') || weatherDesc.includes('mist') || 
                 weatherMain.includes('fog') || weatherDesc.includes('fog') ||
                 weatherMain.includes('haze') || weatherDesc.includes('haze')) {
        return 'weather-mist'
      }
      
      return 'weather-clear'
    },
    
    getWeatherAnimationClass() {
      const weatherMain = this.weatherData.weather?.[0]?.main?.toLowerCase() || 'clear'
      
      if (weatherMain.includes('clear')) {
        return 'sun-animation'
      } else if (weatherMain.includes('cloud')) {
        return 'cloud-animation'
      } else if (weatherMain.includes('rain')) {
        return 'rain-animation'
      } else if (weatherMain.includes('snow')) {
        return 'snow-animation'
      } else if (weatherMain.includes('thunderstorm') || weatherMain.includes('thunder')) {
        return 'storm-animation'
      }
      
      return 'sun-animation'
    },

    getWeatherParticleClass() {
      const weatherMain = this.weatherData.weather?.[0]?.main?.toLowerCase() || 'clear'
      
      if (weatherMain.includes('clear')) {
        return 'particles-sunny'
      } else if (weatherMain.includes('rain')) {
        return 'particles-rain'
      } else if (weatherMain.includes('snow')) {
        return 'particles-snow'
      } else if (weatherMain.includes('thunderstorm')) {
        return 'particles-storm'
      }
      
      return 'particles-default'
    },

    getWeatherIconAnimationClass() {
      const weatherMain = this.weatherData.weather?.[0]?.main?.toLowerCase() || 'clear'
      
      if (weatherMain.includes('clear')) {
        return 'icon-sunny'
      } else if (weatherMain.includes('cloud')) {
        return 'icon-cloudy'
      } else if (weatherMain.includes('rain')) {
        return 'icon-rainy'
      } else if (weatherMain.includes('snow')) {
        return 'icon-snowy'
      } else if (weatherMain.includes('thunderstorm')) {
        return 'icon-stormy'
      }
      
      return 'icon-default'
    },
    
    getDisplayTemp() {
      const temp = this.weatherData.main?.temp || 0
      return Math.round(this.convertTemperature(temp))
    },
    
    getFeelsLikeTemp() {
      const temp = this.weatherData.main?.feels_like || 0
      return Math.round(this.convertTemperature(temp))
    },
    
    getTempMax() {
      const temp = this.weatherData.main?.temp_max || 0
      return Math.round(this.convertTemperature(temp))
    },
    
    getTempMin() {
      const temp = this.weatherData.main?.temp_min || 0
      return Math.round(this.convertTemperature(temp))
    },
    
    getCurrentDateTime() {
      try {
        const timezone = this.weatherData.timezone
        if (timezone === undefined || timezone === null) {
          return this.formatDate(new Date())
        }
        
        const now = new Date()
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
        const cityTime = new Date(utc + (timezone * 1000))
        
        return this.formatDate(cityTime)
      } catch (error) {
        console.error('Error calculating city time:', error)
        return this.formatDate(new Date())
      }
    },
    
    getLastUpdated() {
      try {
        const now = new Date()
        const updateTime = new Date((this.weatherData.dt || Math.floor(Date.now() / 1000)) * 1000)
        const diffMinutes = Math.floor((now - updateTime) / 60000)
        
        if (diffMinutes < 1) return 'Just now'
        if (diffMinutes < 60) return `${diffMinutes}m ago`
        
        const diffHours = Math.floor(diffMinutes / 60)
        if (diffHours < 24) return `${diffHours}h ago`
        
        return updateTime.toLocaleDateString()
      } catch (error) {
        return 'Just now'
      }
    }
  },
  
  mounted() {
    this.initializeFavoriteState()
  },
  
  methods: {
    initializeFavoriteState() {
      try {
        if (this.weatherStore?.isFavorite) {
          this.localIsFavorite = this.weatherStore.isFavorite(this.weatherData.name)
        }
      } catch (error) {
        console.warn('Could not initialize favorite state:', error)
        this.localIsFavorite = false
      }
    },
    
    getDisplayCountryCode(isoCode) {
      if (!isoCode) return ''
      
      const countryCodeMap = {
        'GB': 'UK', 'US': 'USA', 'DE': 'GER', 'KR': 'KOR', 'CN': 'CHN', 
        'BR': 'BRA', 'IN': 'IND', 'AU': 'AUS', 'CA': 'CAN', 'FR': 'FRA',
        'IT': 'ITA', 'ES': 'ESP', 'NL': 'NLD', 'BE': 'BEL', 'CH': 'SUI',
        'AT': 'AUT', 'SE': 'SWE', 'NO': 'NOR', 'DK': 'DEN', 'FI': 'FIN',
        'IE': 'IRL', 'PT': 'POR', 'RU': 'RUS', 'JP': 'JPN', 'MX': 'MEX',
        'AR': 'ARG', 'ZA': 'RSA', 'EG': 'EGY', 'SA': 'KSA', 'AE': 'UAE',
        'TR': 'TUR', 'GR': 'GRE', 'PL': 'POL', 'CZ': 'CZE', 'HU': 'HUN',
        'RO': 'ROM', 'BG': 'BUL', 'HR': 'CRO', 'RS': 'SRB', 'UA': 'UKR',
        'TH': 'THA', 'VN': 'VIE', 'MY': 'MAS', 'SG': 'SIN', 'ID': 'INA'
      }
      
      return countryCodeMap[isoCode] || isoCode
    },
    
    convertTemperature(kelvinTemp) {
      const units = this.weatherStore?.units || 'metric'
      
      if (kelvinTemp > 200) {
        if (units === 'imperial') {
          return ((kelvinTemp - 273.15) * 9/5) + 32
        } else {
          return kelvinTemp - 273.15
        }
      }
      
      return kelvinTemp
    },
    
    formatDate(date) {
      try {
        const options = {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }
        return date.toLocaleDateString('en-US', options)
      } catch (error) {
        console.error('Error formatting date:', error)
        return new Date().toLocaleDateString()
      }
    },
    
    getSunTime(type) {
      try {
        const timestamp = this.weatherData.sys?.[type]
        if (!timestamp) {
          return type === 'sunrise' ? '9/4/2025, 06:41 AM' : '9/4/2025, 07:41 PM'
        }
        
        let sunTime
        const timezone = this.weatherData.timezone
        
        if (timezone !== undefined && timezone !== null) {
          const utcTime = new Date(timestamp * 1000)
          const utc = utcTime.getTime() + (utcTime.getTimezoneOffset() * 60000)
          sunTime = new Date(utc + (timezone * 1000))
        } else {
          sunTime = new Date(timestamp * 1000)
        }
        
        const formatted = sunTime.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        
        return formatted
      } catch (error) {
        console.error('Error formatting sun time:', error)
        return type === 'sunrise' ? '9/4/2025, 06:41 AM' : '9/4/2025, 07:41 PM'
      }
    },
    
    getWeatherIconUrl(icon) {
      if (!icon) return ''
      return `https://openweathermap.org/img/wn/${icon}@2x.png`
    },
    
    // Working toggle favorite method
    async toggleFavorite() {
      if (this.favoriteLoading) return
      
      this.favoriteLoading = true
      const cityName = this.weatherData.name
      const wasAlreadyFavorite = this.isFavorite
      
      try {
        this.localIsFavorite = !wasAlreadyFavorite
        
        if (wasAlreadyFavorite) {
          let removed = false
          
          if (this.weatherStore?.removeFromFavorites) {
            try {
              await this.weatherStore.removeFromFavorites(cityName)
              removed = true
            } catch (error) {
              try {
                await this.weatherStore.removeFromFavorites(this.weatherData)
                removed = true
              } catch (error2) {
                // Continue to next method
              }
            }
          }
          
          if (!removed && this.weatherStore?.removeFavorite) {
            try {
              await this.weatherStore.removeFavorite(cityName)
              removed = true
            } catch (error) {
              try {
                await this.weatherStore.removeFavorite(this.weatherData)
                removed = true
              } catch (error2) {
                // Continue to next method
              }
            }
          }
          
          if (!removed && this.weatherStore?.toggleFavorite) {
            try {
              await this.weatherStore.toggleFavorite(this.weatherData)
              removed = true
            } catch (error) {
              // Continue to next method
            }
          }
          
          if (!removed && this.weatherStore?.favorites) {
            try {
              if (Array.isArray(this.weatherStore.favorites)) {
                const index = this.weatherStore.favorites.findIndex(fav => 
                  fav.name === cityName || fav === cityName
                )
                if (index !== -1) {
                  this.weatherStore.favorites.splice(index, 1)
                  removed = true
                }
              }
            } catch (error) {
              // Final fallback failed
            }
          }
          
          if (!removed) {
            throw new Error('Failed to remove from favorites')
          }
          
        } else {
          let added = false
          
          if (this.weatherStore?.addToFavorites) {
            try {
              await this.weatherStore.addToFavorites(this.weatherData)
              added = true
            } catch (error) {
              // Continue to next method
            }
          }
          
          if (!added && this.weatherStore?.addFavorite) {
            try {
              await this.weatherStore.addFavorite(this.weatherData)
              added = true
            } catch (error) {
              // Continue to next method
            }
          }
          
          if (!added && this.weatherStore?.toggleFavorite) {
            try {
              await this.weatherStore.toggleFavorite(this.weatherData)
              added = true
            } catch (error) {
              // Continue to next method
            }
          }
          
          if (!added) {
            throw new Error('Failed to add to favorites')
          }
        }
        
        this.$emit('favorite-toggle', {
          weatherData: this.weatherData,
          isFavorite: this.localIsFavorite,
          action: wasAlreadyFavorite ? 'remove' : 'add'
        })
        
        const actionText = this.localIsFavorite ? 'added to' : 'removed from'
        this.$emit('show-snackbar', {
          message: `${cityName} ${actionText} favorites`,
          color: 'success',
          timeout: 2000
        })
        
      } catch (error) {
        console.error('Error toggling favorite:', error)
        
        this.localIsFavorite = wasAlreadyFavorite
        
        this.$emit('show-snackbar', {
          message: `Failed to update ${cityName} in favorites`,
          color: 'error',
          timeout: 3000
        })
        
      } finally {
        setTimeout(() => {
          this.favoriteLoading = false
        }, 300)
      }
    },
    
    // EXACT SAME REFRESH LOGIC AS NAVBAR
    async refreshWeather() {
      try {
        await this.weatherStore.refreshCurrentWeather()
        this.$emit('show-snackbar', {
          message: 'Weather data refreshed successfully',
          color: 'success'
        })
      } catch (error) {
        console.error('Failed to refresh weather:', error)
        this.$emit('show-snackbar', {
          message: 'Failed to refresh weather data',
          color: 'error'
        })
      }
    },
    
    async shareWeather() {
      if (this.sharing) return
      
      this.sharing = true
      
      try {
        const temp = this.getDisplayTemp
        const condition = this.weatherData.weather?.[0]?.description || 'clear sky'
        const country = this.getDisplayCountryCode(this.weatherData.sys?.country)
        
        const shareText = `🌤️ Weather in ${this.weatherData.name}, ${country}:\n` +
                         `🌡️ ${temp}°${this.getUnitSymbol} (feels like ${this.getFeelsLikeTemp}°${this.getUnitSymbol})\n` +
                         `☁️ ${condition}\n` +
                         `💧 Humidity: ${this.weatherData.main?.humidity || 0}%\n` +
                         `💨 Wind: ${Math.round(this.getWindSpeed)} ${this.getWindUnit}\n` +
                         `Updated: ${this.getLastUpdated}`
        
        const shareData = {
          title: `Weather in ${this.weatherData.name}`,
          text: shareText,
          url: window.location.href
        }
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData)
          this.$emit('show-snackbar', {
            message: 'Weather info shared successfully!',
            color: 'success',
            timeout: 2000
          })
        } else {
          const textToCopy = shareText + `\n\n${window.location.href}`
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy)
            this.$emit('show-snackbar', {
              message: 'Weather info copied to clipboard!',
              color: 'success',
              timeout: 3000
            })
          } else {
            this.fallbackCopyToClipboard(textToCopy)
          }
        }
        
        this.$emit('share', this.weatherData)
        
      } catch (error) {
        console.error('Error sharing weather:', error)
        
        if (error.name === 'AbortError') {
          this.$emit('show-snackbar', {
            message: 'Sharing cancelled',
            color: 'info',
            timeout: 2000
          })
        } else {
          this.$emit('show-snackbar', {
            message: 'Failed to share weather info',
            color: 'error',
            timeout: 3000
          })
        }
      } finally {
        setTimeout(() => {
          this.sharing = false
        }, 500)
      }
    },
    
    fallbackCopyToClipboard(text) {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          this.$emit('show-snackbar', {
            message: 'Weather info copied to clipboard!',
            color: 'success',
            timeout: 3000
          })
        } else {
          throw new Error('Copy command failed')
        }
        
      } catch (err) {
        console.error('Fallback copy failed:', err)
        this.$emit('show-snackbar', {
          message: 'Unable to copy weather info. Please copy manually.',
          color: 'warning',
          timeout: 4000
        })
      }
    }
  }
}
</script>

<style scoped>
/* Base weather card styles */
.weather-card {
  color: white;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
}

/* Enhanced card entrance animation */
.animated-weather-card {
  animation: cardSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes cardSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Weather backgrounds */
.weather-clear {
  background: linear-gradient(135deg, #FF7B54 0%, #FF9A56 50%, #FFAD84 100%);
}

.weather-clouds {
  background: linear-gradient(135deg, #757F9A 0%, #8B94A3 50%, #A1A8B5 100%);
}

.weather-overcast {
  background: linear-gradient(135deg, #5C6670 0%, #6B7480 50%, #7A8290 100%);
}

.weather-rain {
  background: linear-gradient(135deg, #4A6FA5 0%, #5B7FB8 50%, #6C90CB 100%);
}

.weather-drizzle {
  background: linear-gradient(135deg, #6B9BD2 0%, #7CAEE5 50%, #8DC1F8 100%);
}

.weather-thunderstorm {
  background: linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #455A6C 100%);
}

.weather-snow {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%);
}

.weather-mist {
  background: linear-gradient(135deg, #8E9AAF 0%, #9DA8BC 50%, #ACB6C9 100%);
}

.weather-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 1;
}

.weather-card > * {
  position: relative;
  z-index: 2;
}

/* Enhanced title animation */
.animated-title {
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% { 
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
    transform: translateX(0);
  }
  100% { 
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
    transform: translateX(2px);
  }
}

/* Location pulse animation */
.location-pulse {
  animation: locationPulse 2s ease-in-out infinite;
}

@keyframes locationPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Header layout - prevents overlap */
.header-container {
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
  gap: 16px !important;
  width: 100% !important;
}

.city-info-container {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
  padding-right: 8px !important;
}

.city-title {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  margin-bottom: 4px !important;
}

.location-info {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.action-buttons-container {
  flex: 0 0 auto !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  margin-left: auto !important;
}

/* ROUND ACTION BUTTONS - Maintaining perfect circular shape */
.action-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  min-width: 44px !important;
  min-height: 44px !important;
  width: 44px !important;
  height: 44px !important;
  flex-shrink: 0 !important;
  position: relative;
  overflow: hidden;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.action-btn .v-icon {
  margin: 0 !important;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.3s ease;
  z-index: 1;
}

.action-btn:hover::before {
  transform: scale(1);
}

.action-btn:hover:not(:disabled) {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.action-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Enhanced share button animation */
.animated-share:hover {
  animation: shareGlow 0.6s ease forwards;
}

@keyframes shareGlow {
  0% { box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2); }
  100% { box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4); }
}

/* Enhanced favorite button states */
.favorite-btn.favorite-active {
  background: rgba(244, 67, 54, 0.25) !important;
  border-color: rgba(244, 67, 54, 0.4) !important;
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.3);
}

.favorite-btn.favorite-active:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.35) !important;
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.4);
}

.favorite-btn.favorite-loading {
  background: rgba(255, 193, 7, 0.2) !important;
  border-color: rgba(255, 193, 7, 0.3) !important;
}

/* Enhanced refresh button states */
.refresh-btn.refresh-active {
  background: rgba(33, 150, 243, 0.25) !important;
  border-color: rgba(33, 150, 243, 0.4) !important;
  box-shadow: 0 0 15px rgba(33, 150, 243, 0.3);
}

.refresh-btn.refresh-active:hover:not(:disabled) {
  background: rgba(33, 150, 243, 0.35) !important;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
}

/* Enhanced temperature animation */
.animated-temp {
  animation: temperaturePulse 4s ease-in-out infinite, temperatureCountUp 1.5s cubic-bezier(0.23, 1, 0.320, 1) forwards;
}

@keyframes temperaturePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes temperatureCountUp {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.8); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

/* Temperature arrows animation */
.temp-arrow-up {
  color: #ff5722 !important;
  animation: arrowBounceUp 2s ease-in-out infinite;
}

.temp-arrow-down {
  color: #2196f3 !important;
  animation: arrowBounceDown 2s ease-in-out infinite;
}

@keyframes arrowBounceUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes arrowBounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(2px); }
}

/* Fade in up animation for supporting text */
.fade-in-up {
  animation: fadeInUp 0.8s ease forwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced weather icon container */
.enhanced-icon-container {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  padding: 10px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: inline-block;
  overflow: visible;
}

/* Weather animation icon */
.weather-animation-icon {
  position: absolute;
  top: 50%;
  right: 10%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  transform: translateY(-50%);
  opacity: 0.4;
  z-index: 1;
  transition: all 0.3s ease;
}

.sun-animation {
  background: radial-gradient(circle, #FFD700 0%, #FF8C00 100%);
  animation: sunshine 4s ease-in-out infinite alternate, sunRotate 20s linear infinite;
}

.cloud-animation {
  background: radial-gradient(circle, #B0B0B0 0%, #808080 100%);
  animation: cloudFloat 8s ease-in-out infinite;
}

.rain-animation {
  background: radial-gradient(circle, #4169E1 0%, #191970 100%);
  animation: rainPulse 2s ease-in-out infinite;
}

.snow-animation {
  background: radial-gradient(circle, #F0F8FF 0%, #B0E0E6 100%);
  animation: snowDrift 6s ease-in-out infinite;
}

.storm-animation {
  background: radial-gradient(circle, #4B0082 0%, #2F4F4F 100%);
  animation: stormFlash 2s ease-in-out infinite;
}

/* Weather icon specific animations */
.icon-sunny {
  animation: iconSunny 20s linear infinite, iconGlow 3s ease-in-out infinite alternate;
}

.icon-cloudy {
  animation: iconFloat 8s ease-in-out infinite;
}

.icon-rainy {
  animation: iconRain 1.5s ease-in-out infinite;
}

.icon-snowy {
  animation: iconSnow 6s ease-in-out infinite;
}

.icon-stormy {
  animation: iconStorm 2s ease-in-out infinite;
}

/* Weather particles */
.weather-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: 50%;
  overflow: hidden;
}

.particles-sunny::after {
  content: '✨';
  position: absolute;
  top: 20%;
  left: 80%;
  animation: sparkle 3s ease-in-out infinite;
}

.particles-rain::before,
.particles-rain::after {
  content: '💧';
  position: absolute;
  font-size: 12px;
  animation: rainDrop 2s ease-in-out infinite;
}

.particles-rain::before {
  top: 10%;
  left: 30%;
  animation-delay: 0.5s;
}

.particles-rain::after {
  top: 15%;
  left: 70%;
}

.particles-snow::before,
.particles-snow::after {
  content: '❄️';
  position: absolute;
  font-size: 10px;
  animation: snowFall 4s ease-in-out infinite;
}

.particles-snow::before {
  top: 5%;
  left: 25%;
  animation-delay: 1s;
}

.particles-snow::after {
  top: 10%;
  left: 75%;
  animation-delay: 2s;
}

/* Animation keyframes */
@keyframes sunshine {
  0% { opacity: 0.4; transform: translateY(-50%) scale(1); }
  100% { opacity: 0.6; transform: translateY(-50%) scale(1.1); }
}

@keyframes sunRotate {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

@keyframes cloudFloat {
  0%, 100% { transform: translateY(-50%) translateX(0); }
  50% { transform: translateY(-50%) translateX(5px); }
}

@keyframes rainPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

@keyframes snowDrift {
  0%, 100% { transform: translateY(-50%) rotate(0deg); }
  50% { transform: translateY(-50%) rotate(180deg); }
}

@keyframes stormFlash {
  0%, 90%, 100% { opacity: 0.4; }
  5%, 15% { opacity: 0.8; }
}

@keyframes iconSunny {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes iconGlow {
  0% { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6)); }
  100% { filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.9)); }
}

@keyframes iconFloat {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}

@keyframes iconRain {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes iconSnow {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

@keyframes iconStorm {
  0%, 90%, 100% { opacity: 1; }
  5%, 15% { opacity: 0.3; }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes rainDrop {
  0% { transform: translateY(-10px); opacity: 1; }
  100% { transform: translateY(40px); opacity: 0; }
}

@keyframes snowFall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(40px) rotate(360deg); opacity: 0; }
}

/* Enhanced weather icon */
.weather-icon-enhanced {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.weather-icon-enhanced:hover {
  transform: scale(1.1) rotate(5deg);
}

/* Enhanced weather condition */
.animated-condition {
  animation: conditionFadeIn 1s ease 0.5s both;
}

@keyframes conditionFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Detail card enhancements */
.weather-detail-card {
  text-align: center;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.weather-detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.weather-detail-card:hover::before {
  left: 100%;
}

.weather-detail-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Specific detail card animations */
.humidity-detail:hover {
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.wind-detail:hover {
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
}

.pressure-detail:hover {
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.visibility-detail:hover {
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
}

/* Icon specific animations */
.icon-pulse {
  animation: iconPulse 2s ease-in-out infinite;
}

.icon-wind {
  animation: iconWind 3s ease-in-out infinite;
}

.icon-bounce {
  animation: iconBounce 2s ease-in-out infinite;
}

.icon-fade {
  animation: iconFade 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes iconWind {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes iconFade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Animated numbers */
.animated-number {
  animation: numberCountUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes numberCountUp {
  0% { 
    opacity: 0; 
    transform: scale(0.3) rotateY(90deg); 
  }
  70% { 
    transform: scale(1.1) rotateY(0deg); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1) rotateY(0deg); 
  }
}

/* Footer content animation */
.footer-content {
  animation: footerSlideIn 0.8s ease 0.8s both;
}

@keyframes footerSlideIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button animations */
@keyframes animate-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes animate-heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
  75% { transform: scale(1.05); }
}

.animate-pulse {
  animation: animate-pulse 1.5s ease-in-out infinite;
}

.animate-heartbeat {
  animation: animate-heartbeat 2s ease-in-out infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.weather-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3) !important;
}

.weather-card--featured {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.temperature-section {
  flex: 1;
}

.temperature-display {
  line-height: 0.8;
  margin-bottom: 8px;
}

.temperature-main {
  font-size: 4rem !important;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.temperature-unit {
  font-size: 1.8rem !important;
  margin-left: 4px;
  align-self: flex-start;
  margin-top: 0.5rem;
}

.weather-icon-section {
  flex-shrink: 0;
  margin-left: 16px;
}

.weather-icon-container {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  padding: 10px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: inline-block;
}

.weather-icon {
  position: relative;
  z-index: 2;
}

.weather-condition {
  max-width: 120px;
  line-height: 1.2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.text-white-secondary {
  color: rgba(255, 255, 255, 0.85) !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.text-white, .text-h4, .text-h6, .text-body-1, .text-body-2, .text-caption {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
}

.sun-times .sun-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.update-info {
  animation: updateInfoPulse 4s ease-in-out infinite;
}

@keyframes updateInfoPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Responsive adjustments for round buttons */
@media (max-width: 900px) {
  .header-container {
    gap: 12px !important;
  }
  
  .city-info-container {
    padding-right: 6px !important;
  }
  
  .city-title {
    font-size: 1.4rem !important;
  }
}

@media (max-width: 600px) {
  .header-container {
    gap: 8px !important;
    align-items: center !important;
  }
  
  .city-info-container {
    padding-right: 4px !important;
  }
  
  .city-title {
    font-size: 1.2rem !important;
    margin-bottom: 2px !important;
  }
  
  .location-info {
    font-size: 0.75rem !important;
  }
  
  .action-buttons-container {
    gap: 4px !important;
  }
  
  .action-btn {
    min-width: 36px !important;
    min-height: 36px !important;
    width: 36px !important;
    height: 36px !important;
  }
  
  .temperature-main {
    font-size: 3rem !important;
  }
  
  .temperature-unit {
    font-size: 1.5rem !important;
  }
  
  .weather-detail-card {
    padding: 12px 8px;
  }
  
  .weather-icon-section {
    margin-left: 8px;
  }
  
  .weather-icon-container {
    padding: 8px;
  }
  
  .weather-animation-icon {
    width: 50px;
    height: 50px;
  }

  /* Reduce animation intensity on mobile */
  .animated-weather-card,
  .animated-title,
  .animated-temp {
    animation-duration: 1.5s;
  }

  .sun-animation,
  .cloud-animation {
    animation-duration: 8s;
  }
}

@media (max-width: 400px) {
  .header-container {
    gap: 6px !important;
  }
  
  .city-title {
    font-size: 1.1rem !important;
  }
  
  .location-info {
    font-size: 0.7rem !important;
  }
  
  .action-buttons-container {
    gap: 3px !important;
  }
  
  .action-btn {
    min-width: 32px !important;
    min-height: 32px !important;
    width: 32px !important;
    height: 32px !important;
  }
  
  .temperature-main {
    font-size: 2.5rem !important;
  }
  
  .weather-condition {
    font-size: 0.9rem !important;
  }
}

.v-theme--dark .weather-card::before {
  background: rgba(0, 0, 0, 0.25);
}

.v-theme--dark .weather-detail-card {
  background: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .action-btn {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

@media (prefers-contrast: high) {
  .action-btn {
    border: 2px solid rgba(255, 255, 255, 0.5) !important;
  }
  
  .action-btn:hover:not(:disabled) {
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-btn,
  .weather-animation-icon,
  .weather-card,
  .animated-weather-card,
  .animated-title,
  .animated-temp,
  .animated-condition,
  .animated-number,
  .weather-icon-enhanced,
  .location-pulse,
  .temp-arrow-up,
  .temp-arrow-down,
  .icon-pulse,
  .icon-wind,
  .icon-bounce,
  .icon-fade {
    transition: none !important;
    animation: none !important;
  }
  
  .action-btn:hover:not(:disabled) {
    transform: none !important;
  }

  .weather-icon-enhanced:hover {
    transform: none !important;
  }
}
</style>
