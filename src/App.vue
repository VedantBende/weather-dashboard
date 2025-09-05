<template>
  <v-app>
    <!-- Global loading overlay -->
    <v-overlay 
      v-model="isGlobalLoading" 
      class="align-center justify-center"
      persistent
    >
      <Loader 
        type="weather" 
        text="Loading weather data..." 
        color="white" 
        size="lg" 
      />
    </v-overlay>

    <!-- Main application content -->
    <router-view />

    <!-- Global error snackbar -->
    <v-snackbar
      v-model="showErrorSnackbar"
      :color="errorType"
      timeout="5000"
      location="top right"
      variant="tonal"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ errorType === 'error' ? 'mdi-alert-circle' : 'mdi-information' }}
        </v-icon>
        {{ globalError }}
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="clearGlobalError"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Update available notification -->
    <v-snackbar
      v-model="showUpdateNotification"
      color="primary"
      timeout="-1"
      location="bottom"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-download</v-icon>
        A new version is available!
      </div>
      
      <template v-slot:actions>
        <v-btn variant="text" @click="refreshApp">
          Update
        </v-btn>
        <v-btn variant="text" @click="showUpdateNotification = false">
          Later
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import Loader from '@/components/ui/Loader.vue'

export default {
  name: 'App',
  components: {
    Loader
  },
  
  data() {
    return {
      showUpdateNotification: false,
      showErrorSnackbar: false,
      errorType: 'error'
    }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    isGlobalLoading() {
      return this.weatherStore.loading
    },
    
    globalError() {
      return this.weatherStore.error
    }
  },
  
  watch: {
    globalError(newError) {
      if (newError) {
        this.showErrorSnackbar = true
        this.errorType = newError.includes('not found') ? 'warning' : 'error'
      }
    }
  },
  
  async mounted() {
    // Initialize dark mode
    this.weatherStore.initializeDarkMode()
    
    // Try to get user's location and fetch weather
    await this.initializeWeatherData()
    
    // Check for app updates (PWA functionality)
    this.checkForUpdates()
    
    // Set up error handling
    this.setupGlobalErrorHandling()
  },
  
  methods: {
    async initializeWeatherData() {
      try {
        // Try to get weather for user's location
        await this.weatherStore.fetchWeatherByLocation()
      } catch (error) {
        console.warn('Could not get location weather, using default city')
        // Fallback to a default city
        try {
          await this.weatherStore.fetchWeatherByCity('London')
        } catch (fallbackError) {
          console.error('Failed to load default weather data:', fallbackError)
        }
      }
    },
    
    checkForUpdates() {
      // Service Worker registration for PWA updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            this.showUpdateNotification = true
          })
        })
      }
    },
    
    setupGlobalErrorHandling() {
      // Global error handler for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason)
        this.weatherStore.error = 'An unexpected error occurred'
      })
      
      // Global error handler for JavaScript errors
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error)
        if (!this.weatherStore.error) {
          this.weatherStore.error = 'An unexpected error occurred'
        }
      })
    },
    
    clearGlobalError() {
      this.showErrorSnackbar = false
      this.weatherStore.clearError()
    },
    
    refreshApp() {
      // Reload the app to get the latest version
      window.location.reload()
    }
  }
}
</script>

<style>
/* Global app styles */
.v-application {
  font-family: 'Inter', sans-serif !important;
}

/* Custom scrollbar for the app */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* Dark mode scrollbar */
.v-theme--dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.v-theme--dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

.v-theme--dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Smooth transitions for theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
