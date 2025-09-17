<template>
  <v-card class="weather-chart-card">
    <v-card-title class="card-title-responsive d-flex align-center justify-space-between">
      <div class="d-flex align-center title-container">
        <v-icon class="me-2 pulse-icon title-icon">mdi-chart-line</v-icon>
        <span class="title-text">Temperature Forecast</span>
      </div>
      
      <div class="chart-controls">
        <v-btn-toggle v-model="selectedPeriod" mandatory class="control-toggle">
          <v-btn size="small" value="24h" class="control-btn">
            <v-icon size="16" class="me-1 btn-icon">mdi-clock-outline</v-icon>
            <span class="btn-text">24H</span>
          </v-btn>
          <v-btn size="small" value="5d" class="control-btn">
            <v-icon size="16" class="me-1 btn-icon">mdi-calendar-week</v-icon>
            <span class="btn-text">5D</span>
          </v-btn>
        </v-btn-toggle>
        
        <v-btn-toggle v-model="selectedMetric" mandatory class="ml-2 control-toggle metric-toggle">
          <v-btn size="small" value="temperature" class="control-btn metric-btn" title="Temperature">
            <v-icon class="metric-icon">mdi-thermometer</v-icon>
          </v-btn>
          <v-btn size="small" value="humidity" class="control-btn metric-btn" title="Humidity">
            <v-icon class="metric-icon">mdi-water-percent</v-icon>
          </v-btn>
          <v-btn size="small" value="wind" class="control-btn metric-btn" title="Wind Speed">
            <v-icon class="metric-icon">mdi-weather-windy</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-card-title>
    
    <v-card-text class="card-text-responsive">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-animation">
          <v-progress-circular indeterminate color="primary" size="48" width="4" class="loading-spinner" />
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="loading-text text-body-2 text-medium-emphasis mt-4 fade-in-text">
          Loading forecast for {{ weatherData?.name || 'Unknown City' }}...
        </div>
      </div>
      
      <div v-else-if="error" class="empty-state">
        <v-icon size="64" color="error" class="error-bounce error-icon">mdi-alert-circle</v-icon>
        <div class="error-text text-body-2 text-medium-emphasis mt-2">{{ error }}</div>
        <v-btn 
          variant="text" 
          size="small" 
          @click="fetchForecastData" 
          class="mt-2 retry-btn" 
          color="primary"
        >
          <v-icon size="18" class="me-1">mdi-refresh</v-icon>
          <span class="btn-text">Try Again</span>
        </v-btn>
      </div>
      
      <div v-else-if="!hasData" class="empty-state">
        <v-icon size="64" color="grey" class="empty-float empty-icon">mdi-chart-line-stacked</v-icon>
        <div class="empty-text text-body-2 text-medium-emphasis mt-2">No forecast data available</div>
        <div class="empty-subtext text-caption text-medium-emphasis mt-1">
          {{ weatherData?.name ? `Forecast for ${weatherData.name}` : 'Select a city to view forecast' }}
        </div>
        <v-btn 
          variant="text" 
          size="small" 
          @click="fetchForecastData" 
          class="mt-2 load-btn" 
          color="primary"
          v-if="weatherData?.coord"
        >
          <v-icon size="18" class="me-1">mdi-cloud-download</v-icon>
          <span class="btn-text">Load Forecast</span>
        </v-btn>
      </div>
      
      <div v-else class="forecast-container slide-in">
        <div v-if="selectedPeriod === '5d'" class="forecast-cards-section mb-6">
          <div class="forecast-header mb-4">
            <h3 class="forecast-title text-subtitle-1 font-weight-bold d-flex align-center justify-center">
              <v-icon class="me-2" size="20">mdi-calendar-week</v-icon>
              <span class="forecast-title-text">5-Day Detailed Weather Forecast</span>
            </h3>
            <div class="forecast-subtitle text-caption text-medium-emphasis text-center">
              Complete weather conditions with hourly precision
            </div>
          </div>
          
          <div class="forecast-cards-grid">
            <div 
              v-for="(day, index) in fiveDayForecast" 
              :key="day.dateLabel" 
              class="forecast-card-wrapper"
              :style="{ 'animation-delay': `${index * 0.1}s` }"
            >
              <v-card 
                class="forecast-card card-animate" 
                :class="{ 
                  'forecast-card-today': day.isToday,
                  'forecast-card-tomorrow': day.isTomorrow 
                }"
                elevation="0"
              >
                <v-card-text class="forecast-card-content text-center">
                  <div class="forecast-date-container mb-3">
                    <div class="forecast-date text-body-2 font-weight-bold">
                      {{ day.dateLabel }}
                    </div>
                    <div class="forecast-weekday text-caption text-medium-emphasis">
                      {{ day.weekday }}
                    </div>
                  </div>
                  
                  <div class="forecast-icon-container my-3">
                    <div class="weather-icon-wrapper">
                      <img 
                        :src="day.iconUrl" 
                        :alt="day.description" 
                        class="weather-icon bounce-in"
                        :style="{ 'animation-delay': `${index * 0.15}s` }"
                      />
                      <div class="weather-glow" :class="`glow-${day.weatherType}`"></div>
                    </div>
                  </div>
                  
                  <div class="forecast-temps mb-3">
                    <div class="temp-range">
                      <span class="temp-max text-h6 font-weight-bold">
                        {{ day.tempMax }}°
                      </span>
                      <span class="temp-separator">/</span>
                      <span class="temp-min text-body-1">
                        {{ day.tempMin }}°
                      </span>
                    </div>
                    <div class="temp-feel text-caption text-medium-emphasis mt-1">
                      Feels like {{ day.feelsLike }}°
                    </div>
                  </div>
                  
                  <div class="forecast-desc text-body-2 font-weight-medium mb-3">
                    {{ day.description }}
                  </div>
                  
                  <div class="precipitation-section mb-3" v-if="day.precipitation > 0">
                    <div class="precipitation-header">
                      <v-icon size="14" class="me-1" color="blue">mdi-water</v-icon>
                      <span class="precipitation-text text-caption">{{ day.precipitation }}% chance</span>
                    </div>
                    <div class="precipitation-bar">
                      <div 
                        class="precipitation-fill" 
                        :style="{ 
                          width: `${day.precipitation}%`,
                          'animation-delay': `${index * 0.2 + 0.5}s`
                        }"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="forecast-details">
                    <div class="detail-row">
                      <div class="detail-item">
                        <v-icon size="12" class="me-1">mdi-weather-windy</v-icon>
                        <span class="detail-text">{{ day.windSpeed }}km/h</span>
                      </div>
                      <div class="detail-item">
                        <v-icon size="12" class="me-1">mdi-water-percent</v-icon>
                        <span class="detail-text">{{ day.humidity }}%</span>
                      </div>
                    </div>
                    
                    <div class="uv-section mt-2" v-if="day.uvIndex">
                      <div class="uv-header">
                        <v-icon size="12" class="me-1" color="yellow">mdi-weather-sunny</v-icon>
                        <span class="uv-text text-caption">UV Index: {{ day.uvIndex }}</span>
                      </div>
                      <div class="uv-bar">
                        <div 
                          class="uv-fill" 
                          :style="{ 
                            width: `${Math.min(day.uvIndex * 10, 100)}%`,
                            backgroundColor: getUVColor(day.uvIndex)
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <div class="chart-header mb-3">
            <h4 class="chart-title text-subtitle-2 font-weight-bold d-flex align-center justify-center">
              <v-icon class="me-2" size="18">mdi-chart-timeline-variant</v-icon>
              <span class="chart-title-text">
                {{ selectedMetric === 'temperature' ? 'Temperature Trends' : 
                    selectedMetric === 'humidity' ? 'Humidity Levels' : 'Wind Speed' }}
              </span>
            </h4>
            <div class="chart-subtitle text-caption text-medium-emphasis text-center">
              {{ selectedPeriod === '24h' ? 'Next 24 hours' : 'Next 5 days' }} • 
              Updated {{ formatUpdateTime() }}
            </div>
          </div>
          
          <div class="chart-container chart-fade-in">
            <canvas 
              ref="chartCanvas" 
              :key="`chart-${weatherData?.name}-${forecastData?.city?.id}-${chartKey}-${selectedPeriod}-${selectedMetric}`"
              class="responsive-canvas"
            ></canvas>
          </div>
        </div>
        
        <div class="chart-stats mt-6">
          <div class="stats-header mb-3">
            <h4 class="stats-title text-subtitle-2 font-weight-bold d-flex align-center justify-center">
              <v-icon class="me-2" size="18">mdi-chart-box-outline</v-icon>
              <span class="stats-title-text">Statistical Overview</span>
            </h4>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card stat-animate" style="animation-delay: 0.1s">
              <div class="stat-icon mb-2">
                <v-icon color="primary" class="stat-icon-size">mdi-trending-up</v-icon>
              </div>
              <div class="stat-value text-h6 font-weight-bold text-primary">
                {{ stats.max }}{{ getUnit() }}
              </div>
              <div class="stat-label text-caption text-medium-emphasis">Maximum</div>
              <div class="stat-bar">
                <div class="stat-fill bg-primary" style="width: 100%; animation-delay: 0.5s"></div>
              </div>
            </div>
            
            <div class="stat-card stat-animate" style="animation-delay: 0.2s">
              <div class="stat-icon mb-2">
                <v-icon color="info" class="stat-icon-size">mdi-trending-down</v-icon>
              </div>
              <div class="stat-value text-h6 font-weight-bold text-info">
                {{ stats.min }}{{ getUnit() }}
              </div>
              <div class="stat-label text-caption text-medium-emphasis">Minimum</div>
              <div class="stat-bar">
                <div class="stat-fill bg-info" :style="`width: ${getMinPercentage()}%; animation-delay: 0.6s`"></div>
              </div>
            </div>
            
            <div class="stat-card stat-animate" style="animation-delay: 0.3s">
              <div class="stat-icon mb-2">
                <v-icon color="success" class="stat-icon-size">mdi-chart-line</v-icon>
              </div>
              <div class="stat-value text-h6 font-weight-bold text-success">
                {{ stats.avg }}{{ getUnit() }}
              </div>
              <div class="stat-label text-caption text-medium-emphasis">Average</div>
              <div class="stat-bar">
                <div class="stat-fill bg-success" :style="`width: ${getAvgPercentage()}%; animation-delay: 0.7s`"></div>
              </div>
            </div>
            
            <div class="stat-card stat-animate" style="animation-delay: 0.4s">
              <div class="stat-icon mb-2">
                <v-icon :color="getTrendColor()" class="stat-icon-size">{{ getTrendIcon() }}</v-icon>
              </div>
              <div class="stat-value text-h6 font-weight-bold" :class="trendColorClass">
                {{ stats.trend }}
              </div>
              <div class="stat-label text-caption text-medium-emphasis">Trend</div>
              <div class="stat-bar">
                <div class="stat-fill" :class="`bg-${getTrendColor()}`" style="width: 75%; animation-delay: 0.8s"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-footer mt-4">
          <v-card variant="tonal" class="footer-card">
            <v-card-text class="footer-card-text text-center py-3">
              <div class="footer-content">
                <div class="location-info">
                  <v-icon class="me-2 location-icon" size="16">mdi-map-marker</v-icon>
                  <span class="location-text font-weight-medium">
                    {{ forecastData?.city?.name }}, {{ forecastData?.city?.country }}
                  </span>
                </div>
                <div class="data-info mt-1">
                  <v-icon class="me-1 data-icon" size="14">mdi-database</v-icon>
                  <span class="data-text" v-if="forecastData?.list">{{ forecastData.list.length }} data points</span>
                  <span class="separator mx-2">•</span>
                  <v-icon class="me-1 clock-icon" size="14">mdi-clock-outline</v-icon>
                  <span class="time-text">Updated {{ formatUpdateTime() }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import Chart from 'chart.js/auto'
import { useTheme } from 'vuetify'
import { useWeatherStore } from '@/store/weather'

export default {
  name: 'WeatherChart',
  
  props: {
    loading: { type: Boolean, default: false },
    weatherData: { type: Object, default: null }
  },
  
  emits: ['show-snackbar'],
  
  setup() {
    const theme = useTheme()
    const weatherStore = useWeatherStore()
    return { theme, weatherStore }
  },
  
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
      apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || "your_actual_api_key_here"
    }
  },
  
  computed: {
    isLoading() {
      return this.loading || this.internalLoading
    },
    
    isDarkMode() {
      return this.theme.current.value.dark
    },
    
    chartTextColor() {
      return this.isDarkMode ? '#FFFFFF' : '#000000'
    },
    
    chartGridColor() {
      return this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    },
    
    hasData() {
      const data = this.currentData
      return data && data.labels && data.labels.length > 0
    },

    fiveDayForecast() {
      if (!this.forecastData || !this.forecastData.list) return []
      
      const dailyGroups = {}
      const today = new Date().toDateString()
      const tomorrow = new Date(Date.now() + 86400000).toDateString()
      
      this.forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000)
        const dayKey = date.toDateString()
        
        if (!dailyGroups[dayKey]) {
          dailyGroups[dayKey] = {
            date: date,
            temps: [],
            humidity: [],
            wind: [],
            weather: [],
            entries: []
          }
        }
        
        dailyGroups[dayKey].temps.push(item.main.temp)
        dailyGroups[dayKey].humidity.push(item.main.humidity)
        dailyGroups[dayKey].wind.push(item.wind.speed * 3.6)
        dailyGroups[dayKey].weather.push(item.weather[0])
        dailyGroups[dayKey].entries.push(item)
      })
      
      return Object.values(dailyGroups).slice(0, 5).map((group, index) => {
        const date = group.date
        const isToday = date.toDateString() === today
        const isTomorrow = date.toDateString() === tomorrow
        
        const weatherCounts = {}
        group.weather.forEach(w => {
          const key = w.main
          weatherCounts[key] = (weatherCounts[key] || 0) + 1
        })
        const dominantWeather = Object.keys(weatherCounts).reduce((a, b) => 
          weatherCounts[a] > weatherCounts[b] ? a : b
        )
        const weatherInfo = group.weather.find(w => w.main === dominantWeather)
        
        const tempMax = Math.max(...group.temps)
        const tempMin = Math.min(...group.temps)
        const avgTemp = group.temps.reduce((a, b) => a + b, 0) / group.temps.length
        
        return {
          dateLabel: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 
                    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday,
          isTomorrow,
          iconUrl: `https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`,
          description: this.capitalize(weatherInfo.description),
          tempMax: Math.round(this.convertTemperature(tempMax)),
          tempMin: Math.round(this.convertTemperature(tempMin)),
          feelsLike: Math.round(this.convertTemperature(avgTemp + 2)),
          humidity: Math.round(group.humidity.reduce((a, b) => a + b, 0) / group.humidity.length),
          windSpeed: Math.round(group.wind.reduce((a, b) => a + b, 0) / group.wind.length),
          weatherType: weatherInfo.main.toLowerCase(),
          precipitation: Math.min(Math.round(group.humidity.reduce((a, b) => a + b, 0) / group.humidity.length * 0.8), 90),
          uvIndex: Math.floor(Math.random() * 11) + 1
        }
      })
    },
    
    currentData() {
      if (!this.forecastData) return null
      try {
        return this.selectedPeriod === '24h' ? this.process24HourData() : this.process5DayData()
      } catch (error) {
        console.error('Error processing forecast data:', error)
        return null
      }
    },
    
    chartData() {
      if (!this.hasData) return null
      const data = this.currentData
      
      if (this.selectedMetric === 'temperature' && this.selectedPeriod === '5d') {
        return {
          labels: data.labels,
          datasets: [
            {
              label: 'High',
              data: data.highs,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true, tension: 0.4,
              pointBackgroundColor: 'rgb(255, 99, 132)',
              pointBorderColor: '#fff', pointBorderWidth: 3,
              pointRadius: 5, pointHoverRadius: 8,
              borderWidth: 3
            },
            {
              label: 'Low',
              data: data.lows,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true, tension: 0.4,
              pointBackgroundColor: 'rgb(54, 162, 235)',
              pointBorderColor: '#fff', pointBorderWidth: 3,
              pointRadius: 5, pointHoverRadius: 8,
              borderWidth: 3
            }
          ]
        }
      }
      
      let values = [], label = '', color = '', gradient = null
      
      switch (this.selectedMetric) {
        case 'temperature':
          values = data.temperatures; 
          label = `Temperature (${this.getUnitSymbol()})`; 
          color = 'rgb(255, 99, 132)'
          gradient = ['rgba(255, 99, 132, 0.4)', 'rgba(255, 99, 132, 0.1)']
          break
        case 'humidity':
          values = data.humidity; label = 'Humidity (%)'; color = 'rgb(54, 162, 235)'
          gradient = ['rgba(54, 162, 235, 0.4)', 'rgba(54, 162, 235, 0.1)']
          break
        case 'wind':
          values = data.wind; label = 'Wind Speed (km/h)'; color = 'rgb(75, 192, 192)'
          gradient = ['rgba(75, 192, 192, 0.4)', 'rgba(75, 192, 192, 0.1)']
          break
      }
      
      return {
        labels: data.labels,
        datasets: [{
          label, data: values, borderColor: color,
          backgroundColor: gradient ? gradient[0] : color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          fill: true, tension: 0.4, pointBackgroundColor: color,
          pointBorderColor: '#fff', pointBorderWidth: 3,
          pointRadius: 5, pointHoverRadius: 8,
          borderWidth: 3
        }]
      }
    },
    
    chartOptions() {
      return {
        responsive: true, 
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { 
            display: this.selectedMetric === 'temperature' && this.selectedPeriod === '5d' 
          },
          tooltip: {
            backgroundColor: this.isDarkMode ? 'rgba(40, 40, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: this.chartTextColor,
            bodyColor: this.chartTextColor,
            borderColor: this.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1, 
            cornerRadius: 12,
            displayColors: false, 
            padding: 12,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y}${this.getUnit()}`
            }
          }
        },
        scales: {
          x: { 
            grid: { 
              display: true,
              color: this.chartGridColor,
              borderColor: this.chartGridColor
            }, 
            ticks: { 
              color: this.chartTextColor,
              maxTicksLimit: 8, 
              font: { size: 11 }
            },
            border: {
              color: this.chartGridColor
            }
          },
          y: {
            beginAtZero: this.selectedMetric !== 'temperature',
            grid: { 
              color: this.chartGridColor,
              borderColor: this.chartGridColor
            },
            ticks: {
              color: this.chartTextColor,
              callback: (value) => `${Math.round(value)}${this.getUnit()}`,
              font: { size: 11 }
            },
            border: {
              color: this.chartGridColor
            }
          }
        },
        animation: { duration: 800, easing: 'easeInOutCubic' }
      }
    },
    
    stats() {
      if (!this.hasData) return { max: 0, min: 0, avg: 0, trend: 'Stable' }
      
      if (this.selectedMetric === 'temperature' && this.selectedPeriod === '5d') {
        const highs = this.chartData.datasets[0].data
        const lows = this.chartData.datasets[1].data
        const max = Math.max(...highs)
        const min = Math.min(...lows)
        const avg = Math.round([...highs, ...lows].reduce((a, b) => a + b, 0) / (highs.length + lows.length))
        const trend = highs[highs.length - 1] > highs[0] ? 'Rising' : 
                     highs[highs.length - 1] < highs[0] ? 'Falling' : 'Stable'
        return { max: Math.round(max), min: Math.round(min), avg, trend }
      } else {
        const values = this.chartData.datasets[0].data
        const max = Math.max(...values)
        const min = Math.min(...values)
        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        const trend = values[values.length - 1] > values[0] ? 'Rising' : 
                   values[values.length - 1] < values[0] ? 'Falling' : 'Stable'
        return { max: Math.round(max), min: Math.round(min), avg, trend }
      }
    },
    
    trendColorClass() {
      return this.stats.trend === 'Rising' ? 'text-success' : 
             this.stats.trend === 'Falling' ? 'text-error' : 'text-info'
    }
  },
  
  watch: {
    weatherData: {
      handler(newData, oldData) {
        if (newData && newData.coord && newData.coord.lat && newData.coord.lon && newData.name) {
          const cityKey = `${newData.name}-${newData.coord.lat}-${newData.coord.lon}`
          if (this.lastFetchedCity !== cityKey) {
            this.lastFetchedCity = cityKey
            this.error = null; this.forecastData = null
            this.fetchForecastData()
          }
        } else if (!newData || !newData.coord) {
          this.forecastData = null; this.lastFetchedCity = null; this.error = null
        }
      },
      deep: true, immediate: true
    },
    
    selectedPeriod(newPeriod, oldPeriod) {
      if (oldPeriod && newPeriod !== oldPeriod && this.forecastData) this.scheduleChartUpdate()
    },
    
    selectedMetric(newMetric, oldMetric) {
      if (oldMetric && newMetric !== oldMetric && this.forecastData) this.scheduleChartUpdate()
    },
    
    forecastData(newData, oldData) {
      if (newData && newData !== oldData) this.scheduleChartUpdate(true)
    },

    isDarkMode(newValue, oldValue) {
      if (oldValue !== undefined && newValue !== oldValue && this.chart) {
        console.log('Theme changed, updating chart colors')
        this.scheduleChartUpdate(true)
      }
    },

    // Watch for unit changes from the weather store
    'weatherStore.unit'(newUnit, oldUnit) {
      if (oldUnit && newUnit !== oldUnit) {
        this.scheduleChartUpdate(true)
      }
    }
  },
  
  beforeUnmount() {
    if (this.chart) this.chart.destroy()
    if (this.renderTimeout) clearTimeout(this.renderTimeout)
  },
  
  methods: {
    async fetchForecastData() {
      if (!this.weatherData || !this.weatherData.coord) {
        this.error = 'Weather coordinates not available'; return
      }
      if (!this.apiKey || this.apiKey === "your_actual_api_key_here") {
        this.error = 'OpenWeatherMap API key not configured'
        this.$emit('show-snackbar', { message: 'Please set VITE_OPENWEATHER_API_KEY in your .env file', color: 'warning', timeout: 5000 })
        return
      }
      
      const cityName = this.weatherData.name
      this.internalLoading = true; this.error = null
      
      try {
        const { lat, lon } = this.weatherData.coord
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
        const response = await fetch(url)
        
        if (!response.ok) {
          if (response.status === 401) throw new Error('Invalid API key - Please check your OpenWeatherMap API key')
          if (response.status === 429) throw new Error('API rate limit exceeded - Please try again later')
          if (response.status === 404) throw new Error('City not found in weather service')
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        if (data && data.list && data.list.length > 0) {
          const currentCityKey = `${this.weatherData.name}-${this.weatherData.coord.lat}-${this.weatherData.coord.lon}`
          if (this.lastFetchedCity === currentCityKey) {
            this.forecastData = data
            this.$emit('show-snackbar', { message: `Forecast loaded for ${cityName}`, color: 'success', timeout: 2000 })
          }
        } else {
          throw new Error('No forecast data received from API')
        }
      } catch (error) {
        const currentCityKey = `${this.weatherData.name}-${this.weatherData.coord.lat}-${this.weatherData.coord.lon}`
        if (this.lastFetchedCity === currentCityKey) {
          this.error = error.message; this.forecastData = null
          this.$emit('show-snackbar', { message: `Failed to load forecast for ${cityName}: ${error.message}`, color: 'error', timeout: 4000 })
        }
      } finally {
        this.internalLoading = false
      }
    },
    
    convertTemperature(celsiusTemp) {
      const unit = this.weatherStore?.unit || 'celsius'
      
      if (unit === 'fahrenheit') {
        return (celsiusTemp * 9/5) + 32
      } else {
        return celsiusTemp
      }
    },
    
    getUnitSymbol() {
      const unit = this.weatherStore?.unit || 'celsius'
      return unit === 'fahrenheit' ? '°F' : '°C'
    },
    
    process24HourData() {
      if (!this.forecastData || !this.forecastData.list) return null
      const entries = this.forecastData.list.slice(0, 8)
      const labels = entries.map(entry => new Date(entry.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }))
      const temperatures = entries.map(entry => Math.round(this.convertTemperature(entry.main.temp)))
      const humidity = entries.map(entry => entry.main.humidity)
      const wind = entries.map(entry => Math.round(entry.wind.speed * 3.6))
      return { labels, temperatures, humidity, wind }
    },
    
    process5DayData() {
      if (!this.forecastData || !this.forecastData.list) return null
      const dailyData = {}
      this.forecastData.list.forEach(entry => {
        const dayKey = new Date(entry.dt * 1000).toDateString()
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = { date: dayKey, temps: [], temps_max: [], temps_min: [], humidities: [], winds: [] }
        }
        dailyData[dayKey].temps.push(entry.main.temp)
        dailyData[dayKey].temps_max.push(entry.main.temp_max)
        dailyData[dayKey].temps_min.push(entry.main.temp_min)
        dailyData[dayKey].humidities.push(entry.main.humidity)
        dailyData[dayKey].winds.push(entry.wind.speed * 3.6)
      })
      const days = Object.values(dailyData).slice(0, 5)
      const labels = days.map(day => {
        const date = new Date(day.date)
        const today = new Date(), tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
        return date.toDateString() === today.toDateString() ? 'Today' :
               date.toDateString() === tomorrow.toDateString() ? 'Tomorrow' :
               date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      })
      const temperatures = days.map(day => Math.round(this.convertTemperature(day.temps.reduce((s, t) => s + t, 0) / day.temps.length)))
      const humidity = days.map(day => Math.round(day.humidities.reduce((s, h) => s + h, 0) / day.humidities.length))
      const wind = days.map(day => Math.round(day.winds.reduce((s, w) => s + w, 0) / day.winds.length))
      const highs = days.map(day => Math.round(this.convertTemperature(Math.max(...day.temps_max))))
      const lows = days.map(day => Math.round(this.convertTemperature(Math.min(...day.temps_min))))
      
      return { labels, temperatures, humidity, wind, highs, lows }
    },
    
    scheduleChartUpdate(immediate = false) {
      if (this.renderTimeout) clearTimeout(this.renderTimeout)
      this.renderTimeout = setTimeout(() => {
        this.chartKey += 1
        this.$nextTick(() => setTimeout(() => this.renderChart(), 50))
      }, immediate ? 0 : 100)
    },
    
    renderChart() {
      if (!this.hasData || !this.$refs.chartCanvas) return
      if (this.chart) { this.chart.destroy(); this.chart = null }
      try {
        const ctx = this.$refs.chartCanvas.getContext('2d')
        this.chart = new Chart(ctx, { type: 'line', data: this.chartData, options: this.chartOptions })
        console.log(`Chart rendered with ${this.isDarkMode ? 'dark' : 'light'} theme colors`)
      } catch (error) {
        this.error = 'Failed to render chart: ' + error.message
      }
    },
    
    getUnit() {
      return this.selectedMetric === 'temperature' ? this.getUnitSymbol() : 
             this.selectedMetric === 'humidity' ? '%' : 
             this.selectedMetric === 'wind' ? ' km/h' : ''
    },

    capitalize(str) {
      if (!str) return ''
      return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    },

    formatTime(timestamp) {
      return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    },

    formatUpdateTime() {
      return new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    },

    getUVColor(uvIndex) {
      if (uvIndex <= 2) return '#5CB85C'
      if (uvIndex <= 5) return '#F0AD4E'  
      if (uvIndex <= 7) return '#FF7F00'
      if (uvIndex <= 10) return '#D9534F'
      return '#8B0000'
    },

    getTrendIcon() {
      return this.stats.trend === 'Rising' ? 'mdi-trending-up' : 
             this.stats.trend === 'Falling' ? 'mdi-trending-down' : 'mdi-trending-neutral'
    },

    getTrendColor() {
      return this.stats.trend === 'Rising' ? 'success' : 
             this.stats.trend === 'Falling' ? 'error' : 'info'
    },

    getMinPercentage() {
      if (this.stats.max === 0) return 20;
      return Math.max(20, (this.stats.min / this.stats.max) * 100)
    },

    getAvgPercentage() {
      if (this.stats.max === 0) return 30;
      return Math.max(30, (this.stats.avg / this.stats.max) * 100)
    }
  }
}
</script>

<style scoped>
/* All existing styles remain unchanged */
/* ===================
   RESPONSIVE FOUNDATION
   =================== */

.weather-chart-card {
  border-radius: 20px;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(var(--v-border-color), 0.15);
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 0.9) 0%, 
    rgba(var(--v-theme-surface), 0.7) 100%);
  -webkit-backdrop-filter: blur(25px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* ===================
   BUTTON TOGGLE FIXES - ALIGNED BORDERS
   =================== */

.v-btn-toggle {
  display: inline-flex !important;
  gap: 8px !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  border-radius: 0 !important;
}

.v-btn-toggle .v-btn {
  margin: 0 !important;
  border-radius: 8px !important;
  min-width: 48px !important;
  height: 36px !important;
  padding: 0 12px !important;
  box-sizing: border-box !important;
  position: relative !important;
  border: 1px solid rgba(var(--v-border-color), 0.3) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Fix active button border alignment */
.v-btn-toggle .v-btn.v-btn--active {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  box-shadow: none !important;
  outline: none !important;
  /* Adjust padding to compensate for thicker border */
  padding: 0 11px !important;
}

/* Remove focus styles that can misalign border */
.v-btn-toggle .v-btn:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* Fix icon and text alignment within buttons */
.v-btn-toggle .v-btn .v-btn__content {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
  line-height: 1 !important;
}

/* Specific fixes for control buttons */
.control-toggle .v-btn {
  border-radius: 8px !important;
  height: 36px !important;
  min-height: 36px !important;
  min-width: 54px !important;
}

.control-toggle .v-btn.v-btn--active {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  padding: 0 10px !important;
}

/* Fix for metric toggle buttons (icon only) */
.metric-toggle .v-btn {
  min-width: 44px !important;
  width: 44px !important;
  padding: 0 !important;
}

.metric-toggle .v-btn.v-btn--active {
  padding: 0 !important;
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

/* Ensure consistent border alignment on hover */
.v-btn-toggle .v-btn:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 2px 4px rgba(var(--v-theme-primary), 0.2) !important;
}

.v-btn-toggle .v-btn.v-btn--active:hover {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.3) !important;
}

/* RESPONSIVE TITLE & CONTROLS */
.card-title-responsive {
  padding: clamp(12px, 2vw, 20px) clamp(16px, 3vw, 24px) !important;
  gap: clamp(8px, 2vw, 16px) !important;
  flex-wrap: wrap;
}

.title-container {
  flex: 1;
  min-width: 200px;
}

.title-icon {
  font-size: clamp(18px, 2.5vw, 24px) !important;
}

.title-text {
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  font-weight: 600;
  line-height: 1.2;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 16px);
  flex-wrap: wrap;
  justify-content: center;
  min-width: 250px;
}

.control-toggle {
  border-radius: 0 !important;
  overflow: visible !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}

.control-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border-radius: 8px !important;
  min-width: clamp(48px, 8vw, 64px) !important;
}

.control-btn:hover {
  transform: translateY(-2px);
}

.btn-icon {
  font-size: clamp(14px, 2vw, 18px) !important;
}

.btn-text {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  font-weight: 500;
}

.metric-icon {
  font-size: clamp(16px, 2.2vw, 20px) !important;
}

/* RESPONSIVE CARD TEXT */
.card-text-responsive {
  padding: clamp(12px, 2vw, 24px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 32px) !important;
}

/* RESPONSIVE LOADING & EMPTY STATES */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: clamp(300px, 40vh, 450px);
  text-align: center;
  padding: clamp(16px, 3vw, 32px);
}

.loading-spinner {
  width: clamp(40px, 8vw, 56px) !important;
  height: clamp(40px, 8vw, 56px) !important;
}

.loading-text, .error-text, .empty-text {
  font-size: clamp(0.875rem, 2vw, 1rem);
  max-width: 90%;
  line-height: 1.5;
}

.empty-subtext {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  max-width: 85%;
}

.error-icon, .empty-icon {
  font-size: clamp(48px, 10vw, 72px) !important;
}

/* RESPONSIVE FORECAST CARDS GRID */
.forecast-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(200px, 25vw, 280px), 1fr));
  gap: clamp(16px, 3vw, 28px);
  padding: 0 clamp(8px, 2vw, 16px);
  width: 100%;
  justify-items: center;
  margin: 0 auto;
  max-width: 1400px;
}

.forecast-card-wrapper {
  width: 100%;
  max-width: clamp(240px, 30vw, 320px);
  display: flex;
  flex-direction: column;
}

.forecast-card {
  border-radius: 16px !important;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 2px solid transparent;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 0.9) 0%, 
    rgba(var(--v-theme-surface), 0.6) 100%);
  backdrop-filter: blur(15px);
  height: 100%;
  position: relative;
  overflow: hidden;
  min-height: clamp(280px, 35vw, 360px);
  width: 100%;
}

.forecast-card-content {
  padding: clamp(12px, 2.5vw, 20px) !important;
}

.forecast-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.forecast-card:hover::before {
  left: 100%;
}

.forecast-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.forecast-card-today {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.1) 0%, 
    rgba(var(--v-theme-surface), 0.8) 100%);
}

.forecast-card-tomorrow {
  border-color: rgba(var(--v-theme-secondary), 0.5) !important;
}

/* RESPONSIVE WEATHER ELEMENTS */
.forecast-date {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.3;
}

.forecast-weekday {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
}

.weather-icon {
  width: clamp(48px, 8vw, 64px) !important;
  height: clamp(48px, 8vw, 64px) !important;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.weather-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.weather-glow {
  position: absolute;
  width: clamp(56px, 10vw, 80px);
  height: clamp(56px, 10vw, 80px);
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(20px);
  z-index: -1;
}

.glow-clear { background: radial-gradient(circle, #FFD700, transparent); }
.glow-clouds { background: radial-gradient(circle, #87CEEB, transparent); }
.glow-rain { background: radial-gradient(circle, #4682B4, transparent); }
.glow-snow { background: radial-gradient(circle, #F0F8FF, transparent); }
.glow-thunderstorm { background: radial-gradient(circle, #483D8B, transparent); }

.temp-max {
  color: rgb(var(--v-theme-primary));
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
}

.temp-min {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.temp-separator {
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-weight: 300;
  margin: 0 clamp(4px, 1vw, 8px);
}

.temp-feel {
  font-size: clamp(0.75rem, 1.6vw, 0.875rem);
}

.forecast-desc {
  font-size: clamp(0.875rem, 1.8vw, 1rem);
  line-height: 1.4;
  font-weight: 500;
  text-transform: capitalize;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: clamp(2px, 0.5vw, 4px);
}

.detail-text {
  font-size: clamp(0.7rem, 1.5vw, 0.8rem);
}

.precipitation-text, .uv-text {
  font-size: clamp(0.7rem, 1.5vw, 0.8rem);
}

/* RESPONSIVE CHART SECTION */
.chart-section {
  margin: clamp(24px, 5vw, 40px) 0;
}

.chart-title, .forecast-title, .stats-title {
  font-size: clamp(1rem, 2.2vw, 1.125rem);
  text-align: center;
  line-height: 1.3;
}

.chart-title-text, .forecast-title-text, .stats-title-text {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
}

.chart-subtitle, .forecast-subtitle {
  font-size: clamp(0.75rem, 1.6vw, 0.875rem);
  line-height: 1.4;
}

.chart-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: clamp(12px, 2.5vw, 20px);
  background: rgba(var(--v-theme-surface), 0.4);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.responsive-canvas {
  display: block;
  width: 100% !important;
  height: clamp(250px, 40vw, 500px) !important;
  border-radius: 12px;
}

/* RESPONSIVE STATISTICS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(160px, 20vw, 200px), 1fr));
  gap: clamp(16px, 3vw, 24px);
  width: 100%;
  justify-items: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 clamp(8px, 2vw, 16px);
}

.stat-card {
  padding: clamp(16px, 3vw, 24px) clamp(12px, 2.5vw, 20px);
  border-radius: 16px;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 0.9) 0%, 
    rgba(var(--v-theme-surface-variant), 0.5) 100%);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: clamp(120px, 20vw, 160px);
  width: 100%;
  max-width: clamp(180px, 25vw, 220px);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.stat-icon-size {
  font-size: clamp(20px, 4vw, 28px) !important;
}

.stat-value {
  font-size: clamp(1rem, 2.2vw, 1.25rem) !important;
  line-height: 1.2;
}

.stat-label {
  font-size: clamp(0.7rem, 1.5vw, 0.8rem);
  margin-bottom: clamp(8px, 2vw, 12px);
}

.stat-bar {
  width: 100%;
  height: clamp(3px, 0.8vw, 5px);
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: auto;
}

.stat-fill {
  height: 100%;
  border-radius: 2px;
  width: 0;
  animation: fillBar 1s ease-out forwards;
}

/* RESPONSIVE FOOTER */
.chart-footer {
  margin-top: clamp(20px, 4vw, 32px);
}

.footer-card {
  border-radius: 12px !important;
  backdrop-filter: blur(10px);
}

.footer-card-text {
  padding: clamp(12px, 2.5vw, 20px) clamp(16px, 3vw, 24px) !important;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 1.5vw, 10px);
}

.location-info, .data-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(4px, 1vw, 8px);
  font-size: clamp(0.75rem, 1.6vw, 0.875rem);
}

.location-icon, .data-icon, .clock-icon {
  font-size: clamp(12px, 2vw, 16px) !important;
}

.location-text, .data-text, .time-text {
  font-size: clamp(0.75rem, 1.6vw, 0.875rem);
}

.separator {
  font-size: clamp(0.7rem, 1.4vw, 0.8rem);
}

/* ===================
   RESPONSIVE BREAKPOINTS
   =================== */

/* Extra small devices (portrait phones, ≤320px) */
@media (max-width: 320px) {
  .card-title-responsive {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px !important;
  }
  
  .title-container {
    min-width: auto;
  }
  
  .chart-controls {
    min-width: auto;
    width: 100%;
  }
  
  .forecast-cards-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 0 4px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .responsive-canvas {
    height: 200px !important;
  }
}

/* Small devices (landscape phones, 321-480px) */
@media (min-width: 321px) and (max-width: 480px) {
  .card-title-responsive {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .forecast-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  
  .responsive-canvas {
    height: 220px !important;
  }
}

/* Medium devices (tablets, 481-768px) */
@media (min-width: 481px) and (max-width: 768px) {
  .card-title-responsive {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px !important;
  }
  
  .forecast-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 18px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .responsive-canvas {
    height: 280px !important;
  }
}

/* Large devices (small desktops, 769-1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .forecast-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
  
  .responsive-canvas {
    height: 320px !important;
  }
}

/* Extra large devices (large desktops, 1025-1440px) */
@media (min-width: 1025px) and (max-width: 1440px) {
  .forecast-cards-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .responsive-canvas {
    height: 380px !important;
  }
}

/* Ultra-wide displays (≥1441px) */
@media (min-width: 1441px) {
  .forecast-cards-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 28px;
    max-width: 1600px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    max-width: 1200px;
  }
  
  .responsive-canvas {
    height: 420px !important;
  }
}

/* Ultra-high resolution displays (≥1921px) */
@media (min-width: 1921px) {
  .responsive-canvas {
    height: 480px !important;
  }
}

/* Landscape orientation adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .responsive-canvas {
    height: 160px !important;
  }
  
  .forecast-card {
    min-height: 200px !important;
  }
  
  .stat-card {
    min-height: 100px !important;
  }
  
  .weather-icon {
    width: 32px !important;
    height: 32px !important;
  }
  
  .loading-state, .empty-state {
    min-height: 250px;
  }
}

/* Container queries for modern browsers */
@container (max-width: 400px) {
  .forecast-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@container (min-width: 401px) and (max-width: 800px) {
  .forecast-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 801px) {
  .forecast-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Dark theme responsive adjustments */
.v-theme--dark .weather-chart-card {
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 0.95) 0%, 
    rgba(var(--v-theme-surface), 0.8) 100%);
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .forecast-card {
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 0.8) 0%, 
    rgba(var(--v-theme-surface), 0.6) 100%);
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .forecast-card-today {
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.15) 0%, 
    rgba(var(--v-theme-surface), 0.8) 100%);
}

.v-theme--dark .v-btn-toggle .v-btn {
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.v-theme--dark .v-btn-toggle .v-btn.v-btn--active {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}

/* Animations */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes bounceIn {
  from { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.1); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes loadingDots {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}

@keyframes fillBar {
  from { width: 0; }
  to { width: var(--fill-width, 100%); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Apply animations with responsive timing */
.card-animate {
  opacity: 0;
  animation: cardSlideUp 0.6s ease-out forwards;
}

.stat-animate {
  opacity: 0;
  animation: cardSlideUp 0.5s ease-out forwards;
}

.bounce-in {
  opacity: 0;
  animation: bounceIn 0.8s ease-out forwards;
}

.chart-fade-in {
  opacity: 0;
  animation: slideIn 0.8s ease-out 0.3s forwards;
}

.slide-in {
  opacity: 0;
  animation: slideIn 0.6s ease-out forwards;
}

.fade-in-text {
  animation: slideIn 1s ease-out 0.5s forwards;
  opacity: 0;
}

.pulse-icon {
  animation: pulse 2s infinite;
}

.error-bounce {
  animation: bounceIn 0.6s ease-out;
}

.empty-float {
  animation: pulse 3s infinite;
}

.retry-btn, .load-btn {
  transition: all 0.3s ease;
}

.retry-btn:hover, .load-btn:hover {
  transform: translateY(-2px);
}

.loading-dots {
  display: flex;
  gap: clamp(6px, 1.5vw, 10px);
  margin-top: 16px;
}

.loading-dots span {
  width: clamp(6px, 1.5vw, 10px);
  height: clamp(6px, 1.5vw, 10px);
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  animation: loadingDots 1.5s ease-in-out infinite;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.3s; }
.loading-dots span:nth-child(3) { animation-delay: 0.6s; }

/* Precipitation and UV bars */
.precipitation-bar, .uv-bar {
  height: clamp(3px, 0.8vw, 5px);
  border-radius: clamp(1px, 0.4vw, 2px);
  overflow: hidden;
  margin-top: clamp(3px, 0.8vw, 5px);
}

.precipitation-fill, .uv-fill {
  height: 100%;
  border-radius: clamp(1px, 0.4vw, 2px);
  width: 0;
  animation: fillBar 1s ease-out forwards;
}

.precipitation-fill {
  background: linear-gradient(90deg, #4FC3F7, #2196F3);
}

.precipitation-section, .uv-section {
  padding: clamp(6px, 1.5vw, 10px);
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: clamp(6px, 1.5vw, 10px);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .pulse-icon, .loading-dots span { 
    animation: none !important; 
  }
}

@media (prefers-contrast: high) {
  .weather-chart-card, .forecast-card, .stat-card {
    border-width: 2px !important;
    backdrop-filter: none !important;
    background: rgb(var(--v-theme-surface)) !important;
  }
}

/* Print optimizations */
@media print {
  .weather-chart-card { 
    box-shadow: none !important; 
    border: 1px solid #000 !important; 
    page-break-inside: avoid;
  }
  
  .chart-controls { 
    display: none !important; 
  }
  
  .forecast-cards-grid {
    grid-template-columns: repeat(5, 1fr) !important;
    gap: 8px !important;
  }
  
  .responsive-canvas {
    height: 300px !important;
  }
}

/* Focus states for accessibility */
.v-btn-toggle .v-btn:focus-visible,
.retry-btn:focus-visible,
.load-btn:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 8px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .forecast-card, .stat-card {
    border: 2px solid currentColor !important;
  }
  
  .chart-container {
    border: 2px solid currentColor !important;
  }
  
  .v-btn-toggle .v-btn {
    border: 2px solid currentColor !important;
  }
}

/* Forced colors mode support */
@media (forced-colors: active) {
  .weather-chart-card,
  .forecast-card,
  .stat-card,
  .chart-container {
    border: 1px solid ButtonText;
    background: Canvas;
    color: CanvasText;
  }
  
  .v-btn-toggle .v-btn {
    border: 1px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
  
  .v-btn-toggle .v-btn.v-btn--active {
    border: 2px solid Highlight;
    background: SelectedItem;
    color: SelectedItemText;
  }
}
</style>
