<template>
  <v-card class="air-quality-card">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2" :color="aqiColor">mdi-leaf</v-icon>
      <span>Air Quality</span>
      <v-spacer />
      <v-btn
        icon
        size="small"
        variant="text"
        :loading="loading"
        @click="fetchAirQuality"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
        <div class="text-body-2 text-medium-emphasis mt-2">Loading air quality data...</div>
      </div>

      <!-- Data Available -->
      <div v-else-if="airQuality && airQuality.main" class="air-quality-data">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="text-h3 font-weight-bold">{{ airQuality.main.aqi }}</div>
          <v-chip :color="aqiColor" text-color="white" size="small">
            {{ aqiCategory }}
          </v-chip>
        </div>

        <div class="text-caption text-medium-emphasis mb-2">Pollutant Levels</div>
        <v-row dense>
          <v-col cols="6" sm="4">
            <div class="pollutant-item">
              <div class="text-caption text-medium-emphasis">PM2.5</div>
              <div class="text-body-2 font-weight-medium">{{ formatValue(airQuality.components.pm2_5) }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="pollutant-item">
              <div class="text-caption text-medium-emphasis">PM10</div>
              <div class="text-body-2 font-weight-medium">{{ formatValue(airQuality.components.pm10) }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="pollutant-item">
              <div class="text-caption text-medium-emphasis">CO</div>
              <div class="text-body-2 font-weight-medium">{{ formatValue(airQuality.components.co) }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="pollutant-item">
              <div class="text-caption text-medium-emphasis">NO2</div>
              <div class="text-body-2 font-weight-medium">{{ formatValue(airQuality.components.no2) }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="pollutant-item">
              <div class="text-caption text-medium-emphasis">SO2</div>
              <div class="text-body-2 font-weight-medium">{{ formatValue(airQuality.components.so2) }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="pollutant-item">
              <div class="text-caption text-medium-emphasis">O3</div>
              <div class="text-body-2 font-weight-medium">{{ formatValue(airQuality.components.o3) }}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- No Data Available -->
      <div v-else class="text-center py-6">
        <v-icon size="48" color="grey" class="mb-3">mdi-leaf-off</v-icon>
        <div class="text-body-2 text-medium-emphasis mb-2">Air quality data not available</div>
        <v-btn 
          variant="text" 
          size="small" 
          @click="fetchAirQuality"
          color="primary"
        >
          Try Again
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'AirQuality',
  
  props: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    apiKey: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      airQuality: null,
      loading: false,
      error: null
    }
  },
  
  computed: {
    aqiColor() {
      if (!this.airQuality || !this.airQuality.main) return 'grey'
      
      const aqi = this.airQuality.main.aqi
      const colors = {
        1: 'green',     // Good
        2: 'light-green', // Fair
        3: 'orange',    // Moderate
        4: 'red',       // Poor
        5: 'purple'     // Very Poor
      }
      return colors[aqi] || 'grey'
    },
    
    aqiCategory() {
      if (!this.airQuality || !this.airQuality.main) return 'Unknown'
      
      const aqi = this.airQuality.main.aqi
      const categories = {
        1: 'Good',
        2: 'Fair',
        3: 'Moderate',
        4: 'Poor',
        5: 'Very Poor'
      }
      return categories[aqi] || 'Unknown'
    }
  },
  
  watch: {
    latitude: 'fetchAirQuality',
    longitude: 'fetchAirQuality'
  },
  
  mounted() {
    this.fetchAirQuality()
  },
  
  methods: {
    async fetchAirQuality() {
      if (!this.latitude || !this.longitude || !this.apiKey) {
        console.warn('Missing required props for air quality fetch')
        this.airQuality = null
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${this.latitude}&lon=${this.longitude}&appid=${this.apiKey}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data && data.list && data.list.length > 0) {
          this.airQuality = data.list[0]
          console.log('Air quality data fetched successfully:', this.airQuality)
        } else {
          this.airQuality = null
          console.warn('No air quality data available in response')
        }
        
      } catch (error) {
        console.error('Failed to fetch air quality data:', error)
        this.error = error.message
        this.airQuality = null
      } finally {
        this.loading = false
      }
    },
    
    formatValue(value) {
      if (value === null || value === undefined) return 'N/A'
      return `${Math.round(value * 100) / 100} μg/m³`
    }
  }
}
</script>

<style scoped>
.air-quality-card {
  max-width: 100%;
}

.pollutant-item {
  padding: 8px;
  border-radius: 6px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  text-align: center;
  margin-bottom: 4px;
}

.air-quality-data {
  min-height: 120px;
}
</style>
