<template>
  <v-card class="weather-chart-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-chart-line</v-icon>
        <span>Temperature Forecast</span>
      </div>
      
      <div class="chart-controls">
        <v-btn-toggle v-model="selectedPeriod" mandatory>
          <v-btn size="small" value="24h">24H</v-btn>
          <v-btn size="small" value="5d">5D</v-btn>
        </v-btn-toggle>
        
        <v-btn-toggle v-model="selectedMetric" mandatory class="ml-2">
          <v-btn size="small" value="temperature" icon="mdi-thermometer" />
          <v-btn size="small" value="humidity" icon="mdi-water-percent" />
          <v-btn size="small" value="wind" icon="mdi-weather-windy" />
        </v-btn-toggle>
      </div>
    </v-card-title>
    
    <v-card-text>
      <div v-if="isLoading" class="loading-state">
        <v-progress-circular indeterminate color="primary" />
        <div class="text-body-2 text-medium-emphasis mt-2">
          Loading forecast for {{ weatherData?.name || 'Unknown City' }}...
        </div>
      </div>
      
      <div v-else-if="error" class="empty-state">
        <v-icon size="64" color="error">mdi-alert-circle</v-icon>
        <div class="text-body-2 text-medium-emphasis mt-2">{{ error }}</div>
        <v-btn variant="text" size="small" @click="fetchForecastData" class="mt-2" color="primary">
          Try Again
        </v-btn>
      </div>
      
      <div v-else-if="!hasData" class="empty-state">
        <v-icon size="64" color="grey">mdi-chart-line-stacked</v-icon>
        <div class="text-body-2 text-medium-emphasis mt-2">No forecast data available</div>
        <div class="text-caption text-medium-emphasis mt-1">
          {{ weatherData?.name ? `Forecast for ${weatherData.name}` : 'Select a city to view forecast' }}
        </div>
        <v-btn 
          variant="text" 
          size="small" 
          @click="fetchForecastData" 
          class="mt-2" 
          color="primary"
          v-if="weatherData?.coord"
        >
          Load Forecast
        </v-btn>
      </div>
      
      <div v-else class="chart-container">
        <!-- Dynamic canvas key forces complete re-render for different cities -->
        <canvas 
          ref="chartCanvas" 
          :key="`chart-${weatherData?.name}-${forecastData?.city?.id}-${chartKey}-${selectedPeriod}-${selectedMetric}`"
        ></canvas>
        
        <!-- Chart Statistics -->
        <div class="chart-stats mt-4">
          <v-row>
            <v-col cols="3">
              <div class="stat-card">
                <div class="text-h6 font-weight-bold text-primary">{{ stats.max }}{{ getUnit() }}</div>
                <div class="text-caption text-medium-emphasis">Maximum</div>
              </div>
            </v-col>
            <v-col cols="3">
              <div class="stat-card">
                <div class="text-h6 font-weight-bold text-info">{{ stats.min }}{{ getUnit() }}</div>
                <div class="text-caption text-medium-emphasis">Minimum</div>
              </div>
            </v-col>
            <v-col cols="3">
              <div class="stat-card">
                <div class="text-h6 font-weight-bold text-success">{{ stats.avg }}{{ getUnit() }}</div>
                <div class="text-caption text-medium-emphasis">Average</div>
              </div>
            </v-col>
            <v-col cols="3">
              <div class="stat-card">
                <div class="text-h6 font-weight-bold" :class="trendColor">{{ stats.trend }}</div>
                <div class="text-caption text-medium-emphasis">Trend</div>
              </div>
            </v-col>
          </v-row>
        </div>
        
        <!-- City Info Footer -->
        <div class="chart-footer mt-3 text-center">
          <div class="text-caption text-medium-emphasis">
            Forecast for {{ forecastData?.city?.name }}, {{ forecastData?.city?.country }}
            <span v-if="forecastData?.list">• {{ forecastData.list.length }} data points</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'WeatherChart',
  
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    weatherData: {
      type: Object,
      default: null
    }
  },
  
  emits: ['show-snackbar'],
  
  data() {
    return {
      chart: null,
      chartKey: 0,
      selectedPeriod: '24h',
      selectedMetric: 'temperature',
      forecastData: null,
      internalLoading: false,
      error: null,
      lastFetchedCity: null,
      renderTimeout: null,
      // Replace with your actual API key
      apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || "your_actual_api_key_here"
    }
  },
  
  computed: {
    isLoading() {
      return this.loading || this.internalLoading
    },
    
    hasData() {
      const data = this.currentData
      return data && data.labels && data.labels.length > 0 && 
             data.temperatures && data.temperatures.length > 0
    },
    
    currentData() {
      if (!this.forecastData) return null
      
      try {
        if (this.selectedPeriod === '24h') {
          return this.process24HourData()
        } else {
          return this.process5DayData()
        }
      } catch (error) {
        console.error('Error processing forecast data:', error)
        return null
      }
    },
    
    chartData() {
      if (!this.hasData) return null
      
      const data = this.currentData
      let values = []
      let label = ''
      let color = ''
      
      switch (this.selectedMetric) {
        case 'temperature':
          values = data.temperatures
          label = 'Temperature (°C)'
          color = 'rgb(255, 99, 132)'
          break
        case 'humidity':
          values = data.humidity
          label = 'Humidity (%)'
          color = 'rgb(54, 162, 235)'
          break
        case 'wind':
          values = data.wind
          label = 'Wind Speed (km/h)'
          color = 'rgb(75, 192, 192)'
          break
      }
      
      return {
        labels: data.labels,
        datasets: [{
          label: label,
          data: values,
          borderColor: color,
          backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      }
    },
    
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y
                const unit = this.getUnit()
                return `${context.dataset.label}: ${value}${unit}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(var(--v-theme-on-surface), 0.6)',
              maxTicksLimit: 8
            }
          },
          y: {
            beginAtZero: this.selectedMetric !== 'temperature',
            grid: {
              color: 'rgba(var(--v-theme-on-surface), 0.1)'
            },
            ticks: {
              color: 'rgba(var(--v-theme-on-surface), 0.6)',
              callback: (value) => `${Math.round(value)}${this.getUnit()}`
            }
          }
        },
        animation: {
          duration: 300
        }
      }
    },
    
    stats() {
      if (!this.hasData) return { max: 0, min: 0, avg: 0, trend: 'Stable' }
      
      const values = this.chartData.datasets[0].data
      const max = Math.max(...values)
      const min = Math.min(...values)
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      
      // Calculate trend
      const first = values[0]
      const last = values[values.length - 1]
      const trend = last > first ? 'Rising' : last < first ? 'Falling' : 'Stable'
      
      return { 
        max: Math.round(max), 
        min: Math.round(min), 
        avg, 
        trend 
      }
    },
    
    trendColor() {
      switch (this.stats.trend) {
        case 'Rising': return 'text-success'
        case 'Falling': return 'text-error'
        default: return 'text-info'
      }
    }
  },
  
  watch: {
    // CRITICAL FIX: Watch for weatherData changes - this makes it work for any city
    weatherData: {
      handler(newData, oldData) {
        console.log('🏙️ WeatherData prop changed:', {
          oldCity: oldData?.name,
          newCity: newData?.name,
          oldCoords: oldData?.coord ? `${oldData.coord.lat},${oldData.coord.lon}` : 'none',
          newCoords: newData?.coord ? `${newData.coord.lat},${newData.coord.lon}` : 'none'
        })
        
        // Check if this is a valid city change
        if (newData && newData.coord && newData.coord.lat && newData.coord.lon && newData.name) {
          const cityKey = `${newData.name}-${newData.coord.lat}-${newData.coord.lon}`
          
          // Only fetch if this is actually a different city
          if (this.lastFetchedCity !== cityKey) {
            console.log('📊 Fetching forecast for new city:', newData.name)
            this.lastFetchedCity = cityKey
            this.error = null
            this.forecastData = null // Clear old data immediately
            this.fetchForecastData()
          } else {
            console.log('📊 Same city, skipping fetch:', newData.name)
          }
        } else if (!newData || !newData.coord) {
          // Clear data if no valid weather data
          console.log('🚫 Invalid weather data, clearing forecast')
          this.forecastData = null
          this.lastFetchedCity = null
          this.error = null
        }
      },
      deep: true,
      immediate: true
    },
    
    // Watch for period changes
    selectedPeriod: {
      handler(newPeriod, oldPeriod) {
        if (oldPeriod && newPeriod !== oldPeriod && this.forecastData) {
          console.log('📊 Period changed to:', newPeriod)
          this.scheduleChartUpdate()
        }
      }
    },
    
    // Watch for metric changes
    selectedMetric: {
      handler(newMetric, oldMetric) {
        if (oldMetric && newMetric !== oldMetric && this.forecastData) {
          console.log('📊 Metric changed to:', newMetric)
          this.scheduleChartUpdate()
        }
      }
    },
    
    // Watch for data changes and render immediately
    forecastData: {
      handler(newData, oldData) {
        if (newData && newData !== oldData) {
          console.log('📊 Forecast data updated for:', newData.city?.name)
          this.scheduleChartUpdate(true) // Immediate render for new data
        }
      }
    }
  },
  
  mounted() {
    console.log('📊 WeatherChart mounted with weatherData:', this.weatherData?.name)
  },
  
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
      console.log('📊 Chart destroyed on unmount')
    }
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
    }
  },
  
  methods: {
    async fetchForecastData() {
      if (!this.weatherData || !this.weatherData.coord) {
        console.warn('⚠️ Cannot fetch forecast: missing weather data coordinates')
        this.error = 'Weather coordinates not available'
        return
      }
      
      if (!this.apiKey || this.apiKey === "your_actual_api_key_here") {
        console.error('❌ Cannot fetch forecast: missing API key')
        this.error = 'OpenWeatherMap API key not configured'
        this.$emit('show-snackbar', {
          message: 'Please set VITE_OPENWEATHER_API_KEY in your .env file',
          color: 'warning',
          timeout: 5000
        })
        return
      }
      
      const cityName = this.weatherData.name
      console.log('📊 Fetching forecast data for:', cityName)
      
      this.internalLoading = true
      this.error = null
      
      try {
        const { lat, lon } = this.weatherData.coord
        const units = 'metric'
        
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`
        
        console.log('🌐 Making API request for:', cityName, `(${lat}, ${lon})`)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid API key - Please check your OpenWeatherMap API key')
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded - Please try again later')
          } else if (response.status === 404) {
            throw new Error('City not found in weather service')
          } else {
            throw new Error(`API error: ${response.status} ${response.statusText}`)
          }
        }
        
        const data = await response.json()
        
        console.log('✅ Forecast data received:', {
          city: data.city?.name,
          country: data.city?.country,
          listLength: data.list?.length,
          firstTemp: data.list?.[0]?.main?.temp
        })
        
        if (data && data.list && data.list.length > 0) {
          // Verify this is still the current city (prevent race conditions)
          const currentCityKey = `${this.weatherData.name}-${this.weatherData.coord.lat}-${this.weatherData.coord.lon}`
          if (this.lastFetchedCity === currentCityKey) {
            this.forecastData = data
            console.log('📈 Forecast data set for:', cityName)
            
            this.$emit('show-snackbar', {
              message: `Forecast loaded for ${cityName}`,
              color: 'success',
              timeout: 2000
            })
          } else {
            console.log('🚫 Ignoring forecast data for outdated city:', cityName)
          }
        } else {
          throw new Error('No forecast data received from API')
        }
        
      } catch (error) {
        console.error('❌ Failed to fetch forecast for', cityName, ':', error)
        
        // Only show error if this is still the current city
        const currentCityKey = `${this.weatherData.name}-${this.weatherData.coord.lat}-${this.weatherData.coord.lon}`
        if (this.lastFetchedCity === currentCityKey) {
          this.error = error.message
          this.forecastData = null
          
          this.$emit('show-snackbar', {
            message: `Failed to load forecast for ${cityName}: ${error.message}`,
            color: 'error',
            timeout: 4000
          })
        }
      } finally {
        this.internalLoading = false
      }
    },
    
    process24HourData() {
      if (!this.forecastData || !this.forecastData.list) return null
      
      console.log('📊 Processing 24H data for:', this.forecastData.city?.name)
      
      const entries = this.forecastData.list.slice(0, 8) // Next 24 hours (8 * 3h intervals)
      
      const labels = entries.map(entry => {
        const date = new Date(entry.dt * 1000)
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        })
      })
      
      const temperatures = entries.map(entry => Math.round(entry.main.temp))
      const humidity = entries.map(entry => entry.main.humidity)
      const wind = entries.map(entry => Math.round(entry.wind.speed * 3.6)) // Convert m/s to km/h
      
      console.log('📊 24H processed:', {
        labels: labels.length,
        tempRange: `${Math.min(...temperatures)}°C - ${Math.max(...temperatures)}°C`
      })
      
      return { labels, temperatures, humidity, wind }
    },
    
    process5DayData() {
      if (!this.forecastData || !this.forecastData.list) return null
      
      console.log('📊 Processing 5D data for:', this.forecastData.city?.name)
      
      const dailyData = {}
      
      this.forecastData.list.forEach(entry => {
        const date = new Date(entry.dt * 1000)
        const dayKey = date.toDateString()
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            date: dayKey,
            temps: [],
            humidities: [],
            winds: []
          }
        }
        
        dailyData[dayKey].temps.push(entry.main.temp)
        dailyData[dayKey].humidities.push(entry.main.humidity)
        dailyData[dayKey].winds.push(entry.wind.speed * 3.6)
      })
      
      const days = Object.values(dailyData).slice(0, 5)
      
      const labels = days.map(day => {
        const date = new Date(day.date)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        
        if (date.toDateString() === today.toDateString()) {
          return 'Today'
        } else if (date.toDateString() === tomorrow.toDateString()) {
          return 'Tomorrow'
        } else {
          return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
        }
      })
      
      const temperatures = days.map(day => 
        Math.round(day.temps.reduce((sum, temp) => sum + temp, 0) / day.temps.length)
      )
      
      const humidity = days.map(day => 
        Math.round(day.humidities.reduce((sum, hum) => sum + hum, 0) / day.humidities.length)
      )
      
      const wind = days.map(day => 
        Math.round(day.winds.reduce((sum, w) => sum + w, 0) / day.winds.length)
      )
      
      console.log('📊 5D processed:', {
        labels: labels.length,
        tempRange: `${Math.min(...temperatures)}°C - ${Math.max(...temperatures)}°C`
      })
      
      return { labels, temperatures, humidity, wind }
    },
    
    scheduleChartUpdate(immediate = false) {
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout)
      }
      
      const delay = immediate ? 0 : 100
      
      this.renderTimeout = setTimeout(() => {
        this.chartKey += 1
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderChart()
          }, 50)
        })
      }, delay)
    },
    
    renderChart() {
      if (!this.hasData) {
        console.warn('⚠️ Cannot render chart: no data available')
        return
      }
      
      if (!this.$refs.chartCanvas) {
        console.warn('⚠️ Cannot render chart: canvas ref not available')
        return
      }
      
      console.log('📈 Rendering chart for:', this.forecastData?.city?.name, {
        metric: this.selectedMetric,
        period: this.selectedPeriod,
        dataPoints: this.chartData?.datasets[0]?.data?.length
      })
      
      // Destroy existing chart
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
      
      try {
        const ctx = this.$refs.chartCanvas.getContext('2d')
        
        this.chart = new Chart(ctx, {
          type: 'line',
          data: this.chartData,
          options: this.chartOptions
        })
        
        console.log('✅ Chart rendered successfully for:', this.forecastData?.city?.name)
      } catch (error) {
        console.error('❌ Failed to render chart:', error)
        this.error = 'Failed to render chart: ' + error.message
      }
    },
    
    getUnit() {
      switch (this.selectedMetric) {
        case 'temperature': return '°C'
        case 'humidity': return '%'
        case 'wind': return ' km/h'
        default: return ''
      }
    }
  }
}
</script>

<style scoped>
.weather-chart-card {
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-surface), 0.8);
  -webkit-backdrop-filter: blur(20px);
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.chart-container {
  position: relative;
  min-height: 300px;
}

.chart-container canvas {
  width: 100% !important;
  height: 300px !important;
  border-radius: 8px;
}

.chart-stats {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
  padding-top: 16px;
  margin-top: 16px;
}

.chart-footer {
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
  padding-top: 8px;
}

.stat-card {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.stat-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Dark theme support */
.v-theme--dark .weather-chart-card {
  background: rgba(var(--v-theme-surface), 0.9);
  border-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .stat-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .chart-container canvas {
    height: 250px !important;
  }
  
  .stat-card {
    padding: 8px;
  }
}

@media (max-width: 600px) {
  .chart-controls .v-btn-toggle {
    width: 100%;
  }
  
  .chart-container canvas {
    height: 200px !important;
  }
  
  .stat-card {
    padding: 6px;
  }
}

/* Animation for smooth transitions */
.chart-container {
  transition: all 0.3s ease;
}

.stat-card {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading animation */
.loading-state .v-progress-circular {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

/* Error state styling */
.empty-state .v-icon[color="error"] {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Perfect Alignment for All Screen Sizes */

/* Desktop and Large Screens (1200px+) */
@media (min-width: 1200px) {
  .weather-chart-card {
    max-width: 100%;
    margin: 0 auto;
  }
  
  .chart-container {
    padding: 24px;
  }
  
  .chart-container canvas {
    height: 350px !important;
    width: 100% !important;
  }
  
  .chart-stats .v-row {
    margin: 0 -8px;
  }
  
  .chart-stats .v-col {
    padding: 0 8px;
  }
  
  .stat-card {
    padding: 16px;
    text-align: center;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

/* Large Tablets (1024px - 1199px) */
@media (max-width: 1199px) and (min-width: 1024px) {
  .weather-chart-card {
    margin: 0 16px;
  }
  
  .chart-container {
    padding: 20px;
  }
  
  .chart-container canvas {
    height: 320px !important;
    width: 100% !important;
  }
  
  .chart-stats .v-row {
    margin: 0 -6px;
  }
  
  .chart-stats .v-col {
    padding: 0 6px;
  }
  
  .stat-card {
    padding: 14px 12px;
    text-align: center;
    height: 90px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

/* Standard Tablets (768px - 1023px) */
@media (max-width: 1023px) and (min-width: 768px) {
  .weather-chart-card {
    margin: 0 12px;
    border-radius: 12px;
  }
  
  .v-card-title {
    padding: 16px 20px 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .chart-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
  
  .chart-container {
    padding: 16px;
  }
  
  .chart-container canvas {
    height: 280px !important;
    width: 100% !important;
  }
  
  .chart-stats .v-row {
    margin: 0 -4px;
  }
  
  .chart-stats .v-col {
    padding: 0 4px;
  }
  
  .stat-card {
    padding: 12px 8px;
    text-align: center;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
  }
}

/* Large Mobile (481px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .weather-chart-card {
    margin: 0 8px;
    border-radius: 12px;
  }
  
  .v-card-title {
    padding: 14px 16px 10px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .chart-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .chart-container {
    padding: 12px;
  }
  
  .chart-container canvas {
    height: 240px !important;
    width: 100% !important;
  }
  
  .chart-stats .v-row {
    margin: 0 -2px;
  }
  
  .chart-stats .v-col {
    padding: 0 2px;
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .stat-card {
    padding: 10px 6px;
    text-align: center;
    height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    margin-bottom: 4px;
  }
  
  .stat-card .text-h6 {
    font-size: 1rem !important;
    line-height: 1.2;
  }
  
  .stat-card .text-caption {
    font-size: 0.75rem !important;
  }
}

/* Standard Mobile (361px - 480px) */
@media (max-width: 480px) and (min-width: 361px) {
  .weather-chart-card {
    margin: 0 4px;
    border-radius: 10px;
  }
  
  .v-card-title {
    padding: 12px 14px 8px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .chart-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .chart-controls .v-btn {
    min-width: 55px;
    font-size: 0.8rem;
    padding: 0 8px;
  }
  
  .chart-container {
    padding: 10px;
  }
  
  .chart-container canvas {
    height: 200px !important;
    width: 100% !important;
  }
  
  .chart-stats .v-row {
    margin: 0 -1px;
  }
  
  .chart-stats .v-col {
    padding: 5px 5px;
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .stat-card {
    padding: 8px 4px;
    text-align: center;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    margin-bottom: 2px;
  }
  
  .stat-card .text-h6 {
    font-size: 0.9rem !important;
    line-height: 1.1;
    font-weight: 600;
  }
  
  .stat-card .text-caption {
    font-size: 0.7rem !important;
    margin-top: 2px;
  }
}

/* Small Mobile (360px and below) */
@media (max-width: 360px) {
  .weather-chart-card {
    margin: 0 2px;
    border-radius: 8px;
  }
  
  .v-card-title {
    padding: 10px 12px 6px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .chart-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .chart-controls .v-btn {
    min-width: 50px;
    font-size: 0.75rem;
    padding: 0 6px;
    height: 32px;
  }
  
  .chart-container {
    padding: 8px;
  }
  
  .chart-container canvas {
    height: 180px !important;
    width: 100% !important;
  }
  
  .chart-stats .v-row {
    margin: 0;
  }
  
  .chart-stats .v-col {
    padding: 0 1px;
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .stat-card {
    padding: 6px 3px;
    text-align: center;
    height: 55px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    margin-bottom: 2px;
  }
  
  .stat-card .text-h6 {
    font-size: 0.8rem !important;
    line-height: 1;
    font-weight: 600;
  }
  
  .stat-card .text-caption {
    font-size: 0.65rem !important;
    margin-top: 1px;
  }
}

/* Landscape Orientation Adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .chart-container canvas {
    height: 160px !important;
  }
  
  .chart-stats {
    margin-top: 8px;
  }
  
  .stat-card {
    height: 50px !important;
    padding: 4px !important;
  }
  
  .stat-card .text-h6 {
    font-size: 0.75rem !important;
  }
  
  .stat-card .text-caption {
    font-size: 0.6rem !important;
  }
}

/* Universal Alignment Rules */
.weather-chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.chart-container canvas {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  box-sizing: border-box;
}

.chart-stats {
  width: 100%;
  margin-top: 16px;
}

.chart-stats .v-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

.chart-stats .v-col {
  display: flex;
  align-items: stretch;
}

.stat-card {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

/* Ensure proper text alignment */
.text-center {
  text-align: center !important;
}

.d-flex {
  display: flex !important;
}

.flex-column {
  flex-direction: column !important;
}

.justify-center {
  justify-content: center !important;
}

.align-center {
  align-items: center !important;
}

</style>
