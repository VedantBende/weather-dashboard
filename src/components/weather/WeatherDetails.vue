<template>
  <v-card class="weather-details-card glass-effect card-entrance" elevation="0">
    <v-card-title class="d-flex align-center title-slide-in">
      <v-icon class="mr-2">mdi-information-outline</v-icon>
      Weather Details
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <!-- Primary details -->
        <v-col cols="12" md="6">
          <div class="detail-section section-fade-in" style="animation-delay: 0.1s">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 header-glow">
              <v-icon size="small" class="mr-2">mdi-thermometer</v-icon>
              Temperature
            </h3>
            
            <div class="detail-grid">
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.2s" @click="handleCardClick('current')">
                <div class="detail-icon icon-container">
                  <v-icon color="orange">mdi-thermometer-high</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ currentTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label label-transform">Current</div>
                  <div class="value-bar value-animate" style="animation-delay: 0.3s"></div>
                </div>
              </div>
              
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.3s" @click="handleCardClick('max')">
                <div class="detail-icon icon-container">
                  <v-icon color="red">mdi-thermometer-plus</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ maxTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label label-transform">High</div>
                  <div class="value-bar value-animate" style="animation-delay: 0.4s"></div>
                </div>
              </div>
              
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.4s" @click="handleCardClick('min')">
                <div class="detail-icon icon-container">
                  <v-icon color="blue">mdi-thermometer-minus</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ minTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label label-transform">Low</div>
                  <div class="value-bar value-animate" style="animation-delay: 0.5s"></div>
                </div>
              </div>
              
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.5s" @click="handleCardClick('feels')">
                <div class="detail-icon icon-container">
                  <v-icon color="purple">mdi-thermometer</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ feelsLikeTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label label-transform">Feels like</div>
                  <div class="value-bar value-animate" style="animation-delay: 0.6s"></div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Atmospheric conditions -->
        <v-col cols="12" md="6">
          <div class="detail-section section-fade-in" style="animation-delay: 0.2s">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 header-glow">
              <v-icon size="small" class="mr-2">mdi-weather-cloudy</v-icon>
              Atmospheric
            </h3>
            
            <div class="detail-grid">
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.6s" @click="handleCardClick('humidity')">
                <div class="detail-icon icon-container">
                  <v-icon color="blue">mdi-water-percent</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ weatherData.main.humidity }}%</div>
                  <div class="detail-label label-transform">Humidity</div>
                  <v-progress-linear
                    :model-value="weatherData.main.humidity"
                    color="blue"
                    height="6"
                    rounded
                    class="mt-1 progress-animate progress-glow"
                    style="animation-delay: 0.7s"
                  />
                </div>
              </div>
              
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.7s" @click="handleCardClick('pressure')">
                <div class="detail-icon icon-container">
                  <v-icon color="grey">mdi-gauge</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ weatherData.main.pressure }}</div>
                  <div class="detail-label label-transform">Pressure (hPa)</div>
                  <div class="pressure-status status-fade-in status-pulse">{{ getPressureStatus(weatherData.main.pressure) }}</div>
                </div>
              </div>
              
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.8s" @click="handleCardClick('visibility')">
                <div class="detail-icon icon-container">
                  <v-icon color="cyan">mdi-eye</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ formatVisibility(weatherData.visibility) }}</div>
                  <div class="detail-label label-transform">Visibility</div>
                  <div class="visibility-status status-fade-in status-pulse">{{ getVisibilityStatus(weatherData.visibility) }}</div>
                </div>
              </div>
              
              <div class="detail-item item-slide-up interactive-card" style="animation-delay: 0.9s" @click="handleCardClick('clouds')">
                <div class="detail-icon icon-container">
                  <v-icon color="orange">mdi-weather-partly-cloudy</v-icon>
                  <div class="icon-ripple-effect"></div>
                </div>
                <div class="detail-content">
                  <div class="detail-value number-count-up number-morph">{{ weatherData.clouds?.all || 0 }}%</div>
                  <div class="detail-label label-transform">Cloud Cover</div>
                  <v-progress-linear
                    :model-value="weatherData.clouds?.all || 0"
                    color="grey"
                    height="6"
                    rounded
                    class="mt-1 progress-animate progress-glow"
                    style="animation-delay: 1s"
                  />
                </div>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Wind information -->
        <v-col cols="12" md="6">
          <div class="detail-section section-fade-in" style="animation-delay: 0.3s">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 header-glow">
              <v-icon size="small" class="mr-2 wind-icon">mdi-weather-windy</v-icon>
              Wind & Air
            </h3>
            
            <div class="wind-section">
              <!-- Wind speed and direction -->
              <div class="wind-display mb-4 wind-fade-in" style="animation-delay: 1s">
                <div class="wind-compass compass-interactive" @click="handleCompassClick">
                  <div class="compass-bg compass-rotate">
                    <v-icon size="60" color="primary">mdi-compass-outline</v-icon>
                    <div 
                      class="wind-arrow arrow-animate arrow-pulse"
                      :style="{ 
                        transform: `rotate(${weatherData.wind?.deg || 0}deg)`,
                        'animation-delay': '1.2s'
                      }"
                    >
                      <v-icon size="20" color="red">mdi-navigation</v-icon>
                    </div>
                    <div class="compass-rings">
                      <div class="compass-ring ring-1"></div>
                      <div class="compass-ring ring-2"></div>
                      <div class="compass-ring ring-3"></div>
                    </div>
                  </div>
                </div>
                
                <div class="wind-info ml-4">
                  <div class="wind-speed">
                    <span class="text-h5 font-weight-bold number-scale-in number-glow" style="animation-delay: 1.1s">
                      {{ formatWindSpeed(weatherData.wind?.speed || 0) }}
                    </span>
                  </div>
                  <div class="wind-direction text-body-2 text-medium-emphasis text-fade-in text-wave" style="animation-delay: 1.3s">
                    {{ getWindDirection(weatherData.wind?.deg || 0) }}
                    ({{ weatherData.wind?.deg || 0 }}°)
                  </div>
                  <div class="wind-description text-caption text-fade-in text-wave" style="animation-delay: 1.4s">
                    {{ getWindDescription(weatherData.wind?.speed || 0) }}
                  </div>
                </div>
              </div>
              
              <!-- Additional wind data -->
              <div class="detail-grid">
                <div v-if="weatherData.wind?.gust" class="detail-item item-slide-up interactive-card" style="animation-delay: 1.5s" @click="handleCardClick('gust')">
                  <div class="detail-icon icon-container">
                    <v-icon color="orange">mdi-weather-windy-variant</v-icon>
                    <div class="icon-ripple-effect"></div>
                  </div>
                  <div class="detail-content">
                    <div class="detail-value number-count-up number-morph">{{ formatWindSpeed(weatherData.wind.gust) }}</div>
                    <div class="detail-label label-transform">Gusts</div>
                    <div class="value-bar value-animate" style="animation-delay: 1.6s"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Sun information -->
        <v-col cols="12" md="6">
          <div class="detail-section section-fade-in" style="animation-delay: 0.4s">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 header-glow">
              <v-icon size="small" class="mr-2">mdi-weather-sunny</v-icon>
              Sun & Moon
            </h3>
            
            <div class="sun-info">
              <!-- Sunrise/Sunset -->
              <div class="sun-times mb-4">
                <div class="sun-item sun-rise-animate interactive-sun" style="animation-delay: 1.6s" @click="handleSunClick('sunrise')">
                  <div class="sun-icon">
                    <v-icon size="40" color="orange">mdi-weather-sunset-up</v-icon>
                    <div class="sun-ripple"></div>
                  </div>
                  <div class="sun-details">
                    <div class="sun-time text-subtitle-1 font-weight-bold time-fade-in time-glow" style="animation-delay: 1.7s">
                      {{ formatSunTime(weatherData.sys.sunrise) }}
                    </div>
                    <div class="sun-label text-body-2 label-fade">Sunrise</div>
                  </div>
                </div>
                
                <div class="sun-item sun-set-animate interactive-sun" style="animation-delay: 1.8s" @click="handleSunClick('sunset')">
                  <div class="sun-icon">
                    <v-icon size="40" color="deep-orange">mdi-weather-sunset-down</v-icon>
                    <div class="sun-ripple"></div>
                  </div>
                  <div class="sun-details">
                    <div class="sun-time text-subtitle-1 font-weight-bold time-fade-in time-glow" style="animation-delay: 1.9s">
                      {{ formatSunTime(weatherData.sys.sunset) }}
                    </div>
                    <div class="sun-label text-body-2 label-fade">Sunset</div>
                  </div>
                </div>
              </div>
              
              <!-- Daylight duration -->
              <div class="daylight-info daylight-fade-in" style="animation-delay: 2s">
                <v-card variant="tonal" class="pa-3 daylight-card-hover interactive-daylight" @click="handleDaylightClick">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <v-icon class="mr-2">mdi-clock-outline</v-icon>
                      <span class="text-subtitle-2">Daylight Duration</span>
                    </div>
                    <div class="text-subtitle-1 font-weight-bold duration-scale duration-glow">
                      {{ getDaylightDuration() }}
                    </div>
                  </div>
                  <div class="daylight-progress">
                    <div class="daylight-bar" :style="{ width: getDaylightPercentage() + '%' }"></div>
                  </div>
                </v-card>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Additional weather info -->
        <v-col cols="12">
          <v-divider class="mb-4 divider-expand divider-glow" style="animation-delay: 2.1s" />
          <div class="additional-details details-fade-in" style="animation-delay: 2.2s">
            <div class="detail-row row-slide-in interactive-row" style="animation-delay: 2.3s" @click="handleInfoClick('station')">
              <div class="detail-label">Weather Station</div>
              <div class="detail-value value-highlight">{{ weatherData.name }}, {{ weatherData.sys.country }}</div>
            </div>
            
            <div class="detail-row row-slide-in interactive-row" style="animation-delay: 2.4s" @click="handleInfoClick('coords')">
              <div class="detail-label">Coordinates</div>
              <div class="detail-value value-highlight">
                {{ weatherData.coord.lat.toFixed(4) }}°, {{ weatherData.coord.lon.toFixed(4) }}°
              </div>
            </div>
            
            <div class="detail-row row-slide-in interactive-row" style="animation-delay: 2.5s" @click="handleInfoClick('updated')">
              <div class="detail-label">Last Updated</div>
              <div class="detail-value value-highlight">{{ formatDateTime(weatherData.dt * 1000, 'datetime') }}</div>
            </div>
            
            <div v-if="weatherData.timezone" class="detail-row row-slide-in interactive-row" style="animation-delay: 2.6s" @click="handleInfoClick('timezone')">
              <div class="detail-label">Timezone</div>
              <div class="detail-value value-highlight">UTC{{ getTimezoneOffset(weatherData.timezone) }}</div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { 
  formatWindSpeed, 
  getWindDirection,
  formatHumidity,
  formatPressure
} from '@/utils/formatters'

export default {
  name: 'WeatherDetails',
  
  props: {
    weatherData: {
      type: Object,
      required: true
    }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    currentTemp() {
      return this.weatherStore.getCurrentTemp
    },
    
    feelsLikeTemp() {
      return this.weatherStore.getFeelsLikeTemp
    },
    
    unitSymbol() {
      return this.weatherStore.getUnitSymbol
    },
    
    maxTemp() {
      const temp = this.weatherData.main.temp_max
      return this.weatherStore.unit === 'celsius' 
        ? Math.round(temp - 273.15) 
        : Math.round((temp - 273.15) * 9/5 + 32)
    },
    
    minTemp() {
      const temp = this.weatherData.main.temp_min
      return this.weatherStore.unit === 'celsius' 
        ? Math.round(temp - 273.15) 
        : Math.round((temp - 273.15) * 9/5 + 32)
    }
  },
  
  methods: {
    getWindDirection,
    
    formatDateTime(timestamp, type = 'datetime') {
      if (!timestamp) return ''
      
      try {
        let date = new Date(timestamp)
        
        if (this.weatherData.timezone !== undefined) {
          const timezoneOffsetMs = this.weatherData.timezone * 1000
          const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
          date = new Date(utcTime + timezoneOffsetMs)
        }
        
        if (type === 'time') {
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        } else if (type === 'datetime') {
          return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        }
        
        return date.toLocaleDateString()
        
      } catch (error) {
        console.error('Error formatting date:', error)
        return type === 'time' ? '12:00 PM' : '01/01/2025'
      }
    },
    
    formatSunTime(timestamp) {
      if (!timestamp) return 'N/A'
      
      try {
        let date = new Date(timestamp * 1000)
        
        if (this.weatherData.timezone !== undefined) {
          const timezoneOffsetMs = this.weatherData.timezone * 1000
          const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
          date = new Date(utcTime + timezoneOffsetMs)
        }
        
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        
      } catch (error) {
        console.error('Error formatting sun time:', error)
        return 'N/A'
      }
    },
    
    formatWindSpeed(speed) {
      return formatWindSpeed(speed, this.weatherStore.unit === 'celsius' ? 'metric' : 'imperial')
    },
    
    formatVisibility(visibility) {
      if (!visibility) return 'N/A'
      const km = Math.round(visibility / 1000)
      if (this.weatherStore.unit === 'celsius') {
        return `${km} km`
      } else {
        const miles = Math.round(km * 0.621371)
        return `${miles} mi`
      }
    },
    
    getPressureStatus(pressure) {
      if (pressure > 1020) return 'High'
      if (pressure < 1000) return 'Low' 
      return 'Normal'
    },
    
    getVisibilityStatus(visibility) {
      if (!visibility) return 'Unknown'
      const km = visibility / 1000
      if (km > 10) return 'Excellent'
      if (km > 5) return 'Good'
      if (km > 2) return 'Fair'
      return 'Poor'
    },
    
    getWindDescription(speed) {
      const kmh = speed * 3.6
      if (kmh < 2) return 'Calm'
      if (kmh < 12) return 'Light air'
      if (kmh < 20) return 'Light breeze'
      if (kmh < 29) return 'Gentle breeze'
      if (kmh < 39) return 'Moderate breeze'
      if (kmh < 50) return 'Fresh breeze'
      if (kmh < 62) return 'Strong breeze'
      if (kmh < 75) return 'Near gale'
      if (kmh < 89) return 'Gale'
      return 'Strong gale'
    },
    
    getDaylightDuration() {
      const sunrise = new Date(this.weatherData.sys.sunrise * 1000)
      const sunset = new Date(this.weatherData.sys.sunset * 1000)
      const duration = sunset - sunrise
      const hours = Math.floor(duration / 3600000)
      const minutes = Math.floor((duration % 3600000) / 60000)
      return `${hours}h ${minutes}m`
    },
    
    getDaylightPercentage() {
      const now = new Date()
      const sunrise = new Date(this.weatherData.sys.sunrise * 1000)
      const sunset = new Date(this.weatherData.sys.sunset * 1000)
      
      if (now < sunrise) return 0
      if (now > sunset) return 100
      
      const totalDaylight = sunset - sunrise
      const elapsed = now - sunrise
      return Math.round((elapsed / totalDaylight) * 100)
    },
    
    getTimezoneOffset(timezone) {
      const hours = Math.floor(Math.abs(timezone) / 3600)
      const minutes = Math.floor((Math.abs(timezone) % 3600) / 60)
      const sign = timezone >= 0 ? '+' : '-'
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    },

    handleCardClick(type) {
      console.log(`Clicked ${type} card`)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    },

    handleCompassClick() {
      console.log('Compass clicked')
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }
    },

    handleSunClick(type) {
      console.log(`Clicked ${type}`)
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    },

    handleDaylightClick() {
      console.log('Daylight duration clicked')
    },

    handleInfoClick(type) {
      console.log(`Info ${type} clicked`)
    }
  }
}
</script>

<style scoped>

/* Wind icon rotation with maximum specificity */
.v-icon.wind-icon,
.header-glow .v-icon.wind-icon {
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  transform-origin: center center !important;
  cursor: pointer !important;
  will-change: transform !important;
}

.v-icon.wind-icon:hover,
.header-glow .v-icon.wind-icon:hover {
  transform: rotate(180deg) !important;
}

/* Disabled all animations and transitions on v-icon components except wind-icon */
.v-icon:not(.wind-icon),
.v-icon:not(.wind-icon) svg,
.v-icon:not(.wind-icon)::before,
.v-icon:not(.wind-icon)::after {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* Disabled hover and focus effects on icons except wind-icon */
.v-icon:not(.wind-icon):hover,
.v-icon:not(.wind-icon):focus,
.v-icon:not(.wind-icon):active {
  transform: none !important;
  animation: none !important;
  transition: none !important;
  opacity: 1 !important;
}

/* Disabled all child element animations within icons except wind-icon */
.v-icon:not(.wind-icon) *,
.v-icon:not(.wind-icon) *::before,
.v-icon:not(.wind-icon) *::after {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* Override specific icon animation classes */
.icon-bounce,
.icon-pulse,
.icon-breathe,
.icon-hover-rotate,
.icon-glow,
.icon-ripple,
.icon-tick,
.icon-spin,
.sun-glow,
.sunrise-bounce,
.sunset-bounce,
.sun-rays,
.compass-hover,
.compass-icon {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* Disabled icon-related keyframe animations */
@keyframes iconBounceEnhanced {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes iconPulseGlow {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes iconBreathe {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes iconGlowPulse {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes sunBounceUp {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes sunBounceDown {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes sunRaysRotate {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes tickRotateGentle {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes iconSpinFull {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

@keyframes compassSpinHover {
  0%, 100% {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

/* MAIN COMPONENT STYLES  */

.weather-details-card {
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
  position: relative;
  overflow: hidden;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 20vw, 220px), 1fr));
  gap: clamp(12px, 2vw, 20px);
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: clamp(12px, 2.5vw, 20px);
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.detail-icon {
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-value {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 600;
  margin-bottom: 4px;
  color: rgb(var(--v-theme-primary));
}

.detail-label {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 4px;
}

.pressure-status,
.visibility-status {
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wind-display {
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 24px);
}

.wind-compass {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.compass-bg {
  position: relative;
}

.wind-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.wind-info {
  flex: 1;
}

.wind-speed {
  margin-bottom: 8px;
}

.wind-direction {
  margin-bottom: 4px;
}

.sun-times {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: clamp(16px, 3vw, 32px);
}

.sun-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.sun-icon {
  margin-bottom: 8px;
  position: relative;
}

.sun-details {
  text-align: center;
}

.additional-details {
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: 12px;
  padding: clamp(12px, 2.5vw, 20px);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(6px, 1.5vw, 12px) 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .detail-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
}

.detail-row .detail-value {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  color: rgb(var(--v-theme-on-surface));
  text-align: right;
}

/* ENHANCED ANIMATIONS & INTERACTIONS (EXCLUDING ICONS) */

/* Main card entrance with bounce */
.card-entrance {
  opacity: 0;
  animation: cardBounceScale 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

@keyframes cardBounceScale {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  60% {
    opacity: 1;
    transform: scale(1.08) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Title slide in with bounce */
.title-slide-in {
  opacity: 0;
  animation: titleBounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
}

@keyframes titleBounceIn {
  0% {
    opacity: 0;
    transform: translateX(-50px) scale(0.8);
  }
  70% {
    transform: translateX(5px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Header glow effect */
.header-glow {
  position: relative;
  overflow: visible;
}

.header-glow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.1), transparent);
  border-radius: 8px;
  opacity: 0;
  animation: headerGlowSweep 3s ease-in-out infinite;
}

@keyframes headerGlowSweep {
  0%, 100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
    transform: translateX(100%);
  }
}

/* Section fade in with stagger */
.section-fade-in {
  opacity: 0;
  animation: sectionFadeSlide 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes sectionFadeSlide {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced item slide up */
.item-slide-up {
  opacity: 0;
  animation: itemSlideUpBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes itemSlideUpBounce {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
  }
  70% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Interactive card effects */
.interactive-card {
  position: relative;
  overflow: hidden;
}

.interactive-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.interactive-card:hover::before {
  left: 100%;
}

.interactive-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.interactive-card:active {
  transform: translateY(-4px) scale(0.98);
  transition-duration: 0.1s;
}

/* Icon container effects (excluding the icons themselves) */
.icon-container {
  position: relative;
}

.icon-ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.3), transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.3s ease;
}

.interactive-card:hover .icon-ripple-effect {
  transform: translate(-50%, -50%) scale(1.5);
  opacity: 1;
}

/* Number animations */
.number-count-up {
  animation: numberCountScale 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes numberCountScale {
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

.number-morph {
  transition: all 0.3s ease;
}

.interactive-card:hover .number-morph {
  transform: scale(1.1);
  color: rgb(var(--v-theme-secondary));
}

.number-scale-in {
  opacity: 0;
  animation: numberFlipScale 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

@keyframes numberFlipScale {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateX(90deg);
  }
  60% {
    transform: scale(1.1) rotateX(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0deg);
  }
}

.number-glow {
  position: relative;
  overflow: visible;
}

.number-glow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(10px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.number-glow:hover::after {
  opacity: 0.5;
}

/* Label animations */
.label-transform {
  transition: all 0.3s ease;
}

.interactive-card:hover .label-transform {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  transform: translateY(-2px);
}

/* Value bar animation */
.value-bar {
  height: 2px;
  width: 0;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 1px;
  margin-top: 8px;
  animation: valueBarGrow 0.8s ease forwards;
}

@keyframes valueBarGrow {
  from { width: 0; }
  to { width: 100%; }
}

/* Progress bar enhancements */
.progress-animate {
  opacity: 0;
  animation: progressSlideGlow 1.2s ease forwards;
  position: relative;
}

@keyframes progressSlideGlow {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

.progress-glow {
  position: relative;
  overflow: visible;
}

.progress-glow::after {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  bottom: -2px;
  background: inherit;
  filter: blur(8px);
  opacity: 0.5;
  border-radius: inherit;
  z-index: -1;
}

/* Status animations */
.status-fade-in {
  opacity: 0;
  animation: statusAppearScale 0.8s ease forwards;
}

@keyframes statusAppearScale {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.status-pulse {
  animation: statusPulseGlow 3s ease-in-out infinite;
}

@keyframes statusPulseGlow {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* Wind compass animations (excluding icons) */
.compass-rotate {
  animation: compassGentleRotate 8s ease-in-out infinite;
}

@keyframes compassGentleRotate {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
}

.compass-interactive {
  transition: all 0.3s ease;
}

.compass-interactive:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 20px rgba(var(--v-theme-primary), 0.5));
}

.compass-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.compass-ring {
  position: absolute;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring-1 {
  width: 80px;
  height: 80px;
  animation: ringPulse 3s ease-in-out infinite;
}

.ring-2 {
  width: 100px;
  height: 100px;
  animation: ringPulse 3s ease-in-out infinite 1s;
}

.ring-3 {
  width: 120px;
  height: 120px;
  animation: ringPulse 3s ease-in-out infinite 2s;
}

@keyframes ringPulse {
  0%, 100% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* Arrow animations */
.arrow-animate {
  opacity: 0;
  animation: arrowAppearSpin 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes arrowAppearSpin {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(var(--rotation, 0deg));
  }
}

.arrow-pulse {
  animation: arrowPulseGlow 2s ease-in-out infinite;
}

@keyframes arrowPulseGlow {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 0 transparent);
  }
  50% {
    filter: brightness(1.4) drop-shadow(0 0 8px red);
  }
}

.arrow-icon {
  transition: all 0.3s ease;
}

.compass-interactive:hover .arrow-icon {
  transform: scale(1.2);
  filter: drop-shadow(0 0 10px red);
}

/* Text wave animations */
.text-fade-in {
  opacity: 0;
  animation: textWaveIn 0.8s ease forwards;
}

@keyframes textWaveIn {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.text-wave {
  position: relative;
  overflow: hidden;
}

.text-wave::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.1), transparent);
  animation: textWaveSweep 3s ease-in-out infinite;
}

@keyframes textWaveSweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

.wind-fade-in {
  opacity: 0;
  animation: windSectionAppear 1s ease forwards;
}

@keyframes windSectionAppear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Sun animations (excluding icons) */
.sun-rise-animate {
  opacity: 0;
  animation: sunRiseEffect 1.2s ease forwards;
}

@keyframes sunRiseEffect {
  0% {
    opacity: 0;
    transform: translateY(40px) rotate(-15deg) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
}

.sun-set-animate {
  opacity: 0;
  animation: sunSetEffect 1.2s ease forwards;
}

@keyframes sunSetEffect {
  0% {
    opacity: 0;
    transform: translateY(-40px) rotate(15deg) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
}

.interactive-sun {
  transition: all 0.3s ease;
}

.interactive-sun:hover {
  transform: scale(1.05) translateY(-5px);
}

.sun-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 165, 0, 0.3), transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.3s ease;
}

.interactive-sun:hover .sun-ripple {
  transform: translate(-50%, -50%) scale(1.5);
  opacity: 1;
}

/* Time display animations */
.time-fade-in {
  opacity: 0;
  animation: timeReveal 1s ease forwards;
}

@keyframes timeReveal {
  0% {
    opacity: 0;
    transform: scale(0.7) rotateX(90deg);
    filter: blur(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0deg);
    filter: blur(0);
  }
}

.time-glow {
  position: relative;
  transition: all 0.3s ease;
}

.time-glow:hover {
  color: rgb(var(--v-theme-primary));
  text-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.5);
}

.label-fade {
  opacity: 0;
  animation: labelSlideUp 0.6s ease 0.2s forwards;
}

@keyframes labelSlideUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Daylight duration animations */
.daylight-fade-in {
  opacity: 0;
  animation: daylightCardAppear 0.8s ease forwards;
}

@keyframes daylightCardAppear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.daylight-card-hover {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.daylight-card-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.daylight-card-hover:hover::before {
  left: 100%;
}

.daylight-card-hover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.interactive-daylight {
  position: relative;
}

.duration-scale {
  transition: all 0.3s ease;
  position: relative;
}

.duration-scale:hover {
  transform: scale(1.1);
  color: rgb(var(--v-theme-primary));
}

.duration-glow {
  position: relative;
}

.duration-glow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.duration-glow:hover::after {
  opacity: 0.4;
}

.daylight-progress {
  height: 4px;
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.daylight-bar {
  height: 100%;
  background: linear-gradient(90deg, orange, gold);
  border-radius: 2px;
  transition: width 1s ease;
  position: relative;
}

.daylight-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: daylightShimmer 2s ease-in-out infinite;
}

@keyframes daylightShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Additional details animations */
.divider-expand {
  transform: scaleX(0);
  animation: dividerGrow 1s ease forwards;
  transform-origin: center;
}

@keyframes dividerGrow {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.divider-glow {
  position: relative;
  overflow: visible;
}

.divider-glow::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.5), transparent);
  transform: translateY(-50%);
  opacity: 0;
  animation: dividerGlowSweep 2s ease-in-out infinite;
}

@keyframes dividerGlowSweep {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.details-fade-in {
  opacity: 0;
  animation: detailsContainerFade 0.8s ease forwards;
}

@keyframes detailsContainerFade {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.row-slide-in {
  opacity: 0;
  animation: rowSlideReveal 0.6s ease forwards;
}

@keyframes rowSlideReveal {
  0% {
    opacity: 0;
    transform: translateX(-40px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.interactive-row {
  transition: all 0.3s ease;
  position: relative;
}

.interactive-row::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.interactive-row:hover::before {
  opacity: 1;
}

.interactive-row:hover {
  transform: translateX(5px);
  padding-left: 15px;
}

.value-highlight {
  transition: all 0.3s ease;
  position: relative;
}

.interactive-row:hover .value-highlight {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: clamp(8px, 2vw, 16px);
  }
  
  .wind-display {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .wind-info {
    margin-left: 0;
  }
  
  .sun-times {
    flex-direction: column;
    gap: 20px;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px 0;
  }
  
  .detail-row .detail-value {
    text-align: left;
  }

  /* Mobile animation optimizations */
  .card-entrance {
    animation-duration: 0.8s;
  }
  
  .item-slide-up {
    animation-duration: 0.6s;
  }
  
  .compass-rotate {
    animation-duration: 6s;
  }

  /* Reduce complex animations on mobile */
  .compass-rings,
  .text-wave::after {
    display: none;
  }
}

@media (max-width: 480px) {
  .detail-item {
    padding: 12px;
  }
  
  .interactive-card:hover {
    transform: translateY(-4px) scale(1.02);
  }
}

/* Reduce animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .compass-rotate,
  .arrow-pulse,
  .status-pulse,
  .text-wave::after,
  .daylight-bar::after,
  .divider-glow::after {
    animation: none !important;
  }

  .interactive-card:hover,
  .interactive-sun:hover,
  .daylight-card-hover:hover {
    transform: none !important;
  }
  
  /* Keep wind icon animation even for reduced motion users */
  .v-icon.wind-icon,
  .header-glow .v-icon.wind-icon {
    transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .v-icon.wind-icon:hover,
  .header-glow .v-icon.wind-icon:hover {
    transform: rotate(180deg) !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .detail-item,
  .weather-details-card {
    border: 2px solid currentColor !important;
    background: rgb(var(--v-theme-surface)) !important;
    backdrop-filter: none !important;
  }
  
  .progress-glow::after {
    display: none !important;
  }
}

/* Dark theme enhancements */
@media (prefers-color-scheme: dark) {
  .interactive-card:hover {
    box-shadow: 0 20px 40px rgba(255, 255, 255, 0.1);
  }
  
  .daylight-card-hover:hover {
    box-shadow: 0 12px 30px rgba(255, 255, 255, 0.1);
  }
}

/* Print optimizations */
@media print {
  .weather-details-card {
    box-shadow: none !important;
    border: 1px solid #000 !important;
    page-break-inside: avoid;
  }
  
  .interactive-card,
  .interactive-sun,
  .daylight-card-hover {
    transform: none !important;
    box-shadow: none !important;
  }
  
  .progress-glow::after,
  .compass-rings {
    display: none !important;
  }
}
</style>
