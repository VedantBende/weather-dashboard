<template>
  <v-card class="weather-details-card glass-effect" elevation="0">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-information-outline</v-icon>
      Weather Details
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <!-- Primary details -->
        <v-col cols="12" md="6">
          <div class="detail-section">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              <v-icon size="small" class="mr-2">mdi-thermometer</v-icon>
              Temperature
            </h3>
            
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="orange">mdi-thermometer-high</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ currentTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label">Current</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="red">mdi-thermometer-plus</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ maxTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label">High</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="blue">mdi-thermometer-minus</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ minTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label">Low</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="purple">mdi-thermometer</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ feelsLikeTemp }}{{ unitSymbol }}</div>
                  <div class="detail-label">Feels like</div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Atmospheric conditions -->
        <v-col cols="12" md="6">
          <div class="detail-section">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              <v-icon size="small" class="mr-2">mdi-weather-cloudy</v-icon>
              Atmospheric
            </h3>
            
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="blue">mdi-water-percent</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ weatherData.main.humidity }}%</div>
                  <div class="detail-label">Humidity</div>
                  <v-progress-linear
                    :model-value="weatherData.main.humidity"
                    color="blue"
                    height="4"
                    rounded
                    class="mt-1"
                  />
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="grey">mdi-gauge</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ weatherData.main.pressure }}</div>
                  <div class="detail-label">Pressure (hPa)</div>
                  <div class="pressure-status">{{ getPressureStatus(weatherData.main.pressure) }}</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="cyan">mdi-eye</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ formatVisibility(weatherData.visibility) }}</div>
                  <div class="detail-label">Visibility</div>
                  <div class="visibility-status">{{ getVisibilityStatus(weatherData.visibility) }}</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <v-icon color="orange">mdi-weather-partly-cloudy</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-value">{{ weatherData.clouds?.all || 0 }}%</div>
                  <div class="detail-label">Cloud Cover</div>
                  <v-progress-linear
                    :model-value="weatherData.clouds?.all || 0"
                    color="grey"
                    height="4"
                    rounded
                    class="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Wind information -->
        <v-col cols="12" md="6">
          <div class="detail-section">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              <v-icon size="small" class="mr-2">mdi-weather-windy</v-icon>
              Wind & Air
            </h3>
            
            <div class="wind-section">
              <!-- Wind speed and direction -->
              <div class="wind-display mb-4">
                <div class="wind-compass">
                  <div class="compass-bg">
                    <v-icon size="60" color="primary">mdi-compass-outline</v-icon>
                    <div 
                      class="wind-arrow"
                      :style="{ transform: `rotate(${weatherData.wind?.deg || 0}deg)` }"
                    >
                      <v-icon size="20" color="red">mdi-navigation</v-icon>
                    </div>
                  </div>
                </div>
                
                <div class="wind-info ml-4">
                  <div class="wind-speed">
                    <span class="text-h5 font-weight-bold">
                      {{ formatWindSpeed(weatherData.wind?.speed || 0) }}
                    </span>
                  </div>
                  <div class="wind-direction text-body-2 text-medium-emphasis">
                    {{ getWindDirection(weatherData.wind?.deg || 0) }}
                    ({{ weatherData.wind?.deg || 0 }}°)
                  </div>
                  <div class="wind-description text-caption">
                    {{ getWindDescription(weatherData.wind?.speed || 0) }}
                  </div>
                </div>
              </div>
              
              <!-- Additional wind data -->
              <div class="detail-grid">
                <div v-if="weatherData.wind?.gust" class="detail-item">
                  <div class="detail-icon">
                    <v-icon color="orange">mdi-weather-windy-variant</v-icon>
                  </div>
                  <div class="detail-content">
                    <div class="detail-value">{{ formatWindSpeed(weatherData.wind.gust) }}</div>
                    <div class="detail-label">Gusts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Sun information -->
        <v-col cols="12" md="6">
          <div class="detail-section">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              <v-icon size="small" class="mr-2">mdi-weather-sunny</v-icon>
              Sun & Moon
            </h3>
            
            <div class="sun-info">
              <!-- Sunrise/Sunset -->
              <div class="sun-times mb-4">
                <div class="sun-item">
                  <div class="sun-icon">
                    <v-icon size="40" color="orange">mdi-weather-sunset-up</v-icon>
                  </div>
                  <div class="sun-details">
                    <div class="sun-time text-subtitle-1 font-weight-bold">
                      {{ formatSunTime(weatherData.sys.sunrise) }}
                    </div>
                    <div class="sun-label text-body-2">Sunrise</div>
                  </div>
                </div>
                
                <div class="sun-item">
                  <div class="sun-icon">
                    <v-icon size="40" color="deep-orange">mdi-weather-sunset-down</v-icon>
                  </div>
                  <div class="sun-details">
                    <div class="sun-time text-subtitle-1 font-weight-bold">
                      {{ formatSunTime(weatherData.sys.sunset) }}
                    </div>
                    <div class="sun-label text-body-2">Sunset</div>
                  </div>
                </div>
              </div>
              
              <!-- Daylight duration -->
              <div class="daylight-info">
                <v-card variant="tonal" class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <v-icon class="mr-2">mdi-clock-outline</v-icon>
                      <span class="text-subtitle-2">Daylight Duration</span>
                    </div>
                    <div class="text-subtitle-1 font-weight-bold">
                      {{ getDaylightDuration() }}
                    </div>
                  </div>
                </v-card>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Additional weather info -->
        <v-col cols="12">
          <v-divider class="mb-4" />
          <div class="additional-details">
            <div class="detail-row">
              <div class="detail-label">Weather Station</div>
              <div class="detail-value">{{ weatherData.name }}, {{ weatherData.sys.country }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Coordinates</div>
              <div class="detail-value">
                {{ weatherData.coord.lat.toFixed(4) }}°, {{ weatherData.coord.lon.toFixed(4) }}°
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Last Updated</div>
              <div class="detail-value">{{ formatDateTime(weatherData.dt * 1000, 'datetime') }}</div>
            </div>
            
            <div v-if="weatherData.timezone" class="detail-row">
              <div class="detail-label">Timezone</div>
              <div class="detail-value">UTC{{ getTimezoneOffset(weatherData.timezone) }}</div>
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
    
    // FIXED: Proper date/time formatting for UNIX timestamps
    formatDateTime(timestamp, type = 'datetime') {
      if (!timestamp) return ''
      
      try {
        // timestamp is already in milliseconds from the template (dt * 1000)
        let date = new Date(timestamp)
        
        // Apply timezone offset if available
        if (this.weatherData.timezone !== undefined) {
          const timezoneOffsetMs = this.weatherData.timezone * 1000 // Convert seconds to milliseconds
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
    
    // FIXED: Dedicated method for sunrise/sunset formatting
    formatSunTime(timestamp) {
      if (!timestamp) return 'N/A'
      
      try {
        // UNIX timestamp is in seconds, convert to milliseconds
        let date = new Date(timestamp * 1000)
        
        // Apply timezone offset if available
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
    
    getTimezoneOffset(timezone) {
      const hours = Math.floor(Math.abs(timezone) / 3600)
      const minutes = Math.floor((Math.abs(timezone) % 3600) / 60)
      const sign = timezone >= 0 ? '+' : '-'
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.weather-details-card {
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.detail-section {
  margin-bottom: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(var(--v-theme-surface), 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-value {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: rgb(var(--v-theme-primary));
}

.detail-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 4px;
}

.pressure-status,
.visibility-status {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wind-display {
  display: flex;
  align-items: center;
}

.wind-compass {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compass-bg {
  position: relative;
}

.wind-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.3s ease;
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
}

.sun-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sun-icon {
  margin-bottom: 8px;
}

.sun-details {
  text-align: center;
}

.additional-details {
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: 12px;
  padding: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .detail-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.detail-row .detail-value {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  text-align: right;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .wind-display {
    flex-direction: column;
    text-align: center;
  }
  
  .wind-info {
    margin-left: 0;
    margin-top: 16px;
  }
  
  .sun-times {
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-row .detail-value {
    text-align: left;
  }
}
</style>
