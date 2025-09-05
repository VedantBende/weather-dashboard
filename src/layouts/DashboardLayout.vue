<template>
  <v-app>
    <!-- Navigation bar -->
    <Navbar @toggle-sidebar="toggleSidebar" />
    
    <!-- Sidebar -->
    <Sidebar v-model="sidebarOpen" />
    
    <!-- Main content area -->
    <v-main>
      <v-container fluid class="main-container">
        <!-- Page transition wrapper -->
        <transition
          name="page"
          mode="out-in"
          appear
        >
          <router-view v-slot="{ Component, route }">
            <keep-alive :include="['DashboardPage']">
              <component :is="Component" :key="route.name" />
            </keep-alive>
          </router-view>
        </transition>
      </v-container>
    </v-main>
    
    <!-- Footer -->
    <Footer />
    
    <!-- Global notifications -->
    <v-snackbar
      v-model="showNotification"
      :color="notification.type"
      :timeout="notification.timeout"
      location="top right"
      variant="tonal"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ notification.icon }}
        </v-icon>
        {{ notification.message }}
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="dismissNotification"
        >
          Dismiss
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Loading overlay for major operations -->
    <v-overlay
      v-model="globalLoading"
      class="align-center justify-center"
      contained
      persistent
    >
      <div class="text-center">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
          class="mb-4"
        />
        <div class="text-h6 text-white">
          {{ loadingMessage }}
        </div>
      </div>
    </v-overlay>

    <!-- Offline indicator -->
    <v-snackbar
      v-model="showOfflineIndicator"
      color="warning"
      timeout="-1"
      location="bottom"
      variant="tonal"
      class="offline-indicator"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-wifi-off</v-icon>
        You're currently offline. Some features may not work properly.
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="checkConnection"
        >
          Retry
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Update available notification -->
    <v-snackbar
      v-model="showUpdateNotification"
      color="info"
      timeout="-1"
      location="bottom right"
      variant="tonal"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-download</v-icon>
        A new version of Weather Dashboard is available!
      </div>
      
      <template v-slot:actions>
        <v-btn variant="text" @click="updateApp">
          Update Now
        </v-btn>
        <v-btn variant="text" @click="showUpdateNotification = false">
          Later
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Keyboard shortcuts help -->
    <v-dialog v-model="showKeyboardHelp" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-keyboard</v-icon>
          Keyboard Shortcuts
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="shortcut in keyboardShortcuts"
              :key="shortcut.key"
              class="px-0"
            >
              <template v-slot:prepend>
                <v-chip size="small" variant="outlined">
                  {{ shortcut.key }}
                </v-chip>
              </template>
              
              <v-list-item-title>{{ shortcut.description }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showKeyboardHelp = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { useDisplay } from 'vuetify'
import Navbar from '@/components/common/Navbar.vue'
import Sidebar from '@/components/common/Sidebar.vue'
import Footer from '@/components/common/Footer.vue'

export default {
  name: 'DashboardLayout',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  
  data() {
    return {
      sidebarOpen: true,
      showNotification: false,
      notification: {
        message: '',
        type: 'info',
        icon: 'mdi-information',
        timeout: 4000
      },
      globalLoading: false,
      loadingMessage: 'Loading...',
      showOfflineIndicator: false,
      showUpdateNotification: false,
      showKeyboardHelp: false,
      keyboardShortcuts: [
        { key: '/', description: 'Focus search' },
        { key: 'r', description: 'Refresh weather data' },
        { key: 'd', description: 'Toggle dark mode' },
        { key: 'f', description: 'Go to favorites' },
        { key: 's', description: 'Go to settings' },
        { key: 'h', description: 'Go to dashboard' },
        { key: '?', description: 'Show this help' }
      ]
    }
  },
  
  setup() {
    const { mobile } = useDisplay()
    return { mobile }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    }
  },
  
  watch: {
    // Watch for errors from the store
    'weatherStore.error'(newError) {
      if (newError) {
        this.showNotificationMessage(newError, 'error', 'mdi-alert-circle')
      }
    },
    
    // Watch for mobile/desktop changes
    mobile(isMobile) {
      if (isMobile) {
        this.sidebarOpen = false
      } else {
        this.sidebarOpen = true
      }
    }
  },
  
  async mounted() {
    // Initialize layout based on screen size
    this.initializeLayout()
    
    // Set up event listeners
    this.setupEventListeners()
    
    // Check for updates
    this.checkForUpdates()
    
    // Monitor connection status
    this.monitorConnection()
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts()
    
    // Initialize auto-refresh if enabled
    this.initializeAutoRefresh()
  },
  
  beforeUnmount() {
    // Clean up event listeners
    this.removeEventListeners()
    
    // Clear intervals
    this.clearAutoRefresh()
  },
  
  methods: {
    initializeLayout() {
      // Set initial sidebar state based on screen size and saved preference
      if (this.mobile) {
        this.sidebarOpen = false
      } else {
        const savedState = localStorage.getItem('sidebarOpen')
        this.sidebarOpen = savedState !== null ? JSON.parse(savedState) : true
      }
    },
    
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      
      // Save state for desktop
      if (!this.mobile) {
        localStorage.setItem('sidebarOpen', JSON.stringify(this.sidebarOpen))
      }
    },
    
    showNotificationMessage(message, type = 'info', icon = 'mdi-information', timeout = 4000) {
      this.notification = {
        message,
        type,
        icon,
        timeout
      }
      this.showNotification = true
    },
    
    dismissNotification() {
      this.showNotification = false
      // Clear store error if it was an error notification
      if (this.notification.type === 'error') {
        this.weatherStore.clearError()
      }
    },
    
    setupEventListeners() {
      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      
      // Listen for beforeinstallprompt (PWA)
      window.addEventListener('beforeinstallprompt', this.handleInstallPrompt)
      
      // Listen for visibility changes (for auto-refresh)
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    },
    
    removeEventListeners() {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
      window.removeEventListener('beforeinstallprompt', this.handleInstallPrompt)
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    },
    
    handleOnline() {
      this.showOfflineIndicator = false
      this.showNotificationMessage('Connection restored!', 'success', 'mdi-wifi')
      
      // Refresh data when coming back online
      if (this.weatherStore.currentWeather) {
        this.weatherStore.refreshCurrentWeather()
      }
    },
    
    handleOffline() {
      this.showOfflineIndicator = true
    },
    
    checkConnection() {
      // Force a connection check by trying to fetch weather data
      this.weatherStore.refreshCurrentWeather().catch(() => {
        // Still offline
      })
    },
    
    monitorConnection() {
      // Set initial offline state
      if (!navigator.onLine) {
        this.showOfflineIndicator = true
      }
    },
    
    checkForUpdates() {
      // Check for service worker updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            this.showUpdateNotification = true
          })
        })
      }
    },
    
    updateApp() {
      // Reload the page to get the latest version
      this.showUpdateNotification = false
      window.location.reload()
    },
    
    handleInstallPrompt(event) {
      // Show PWA install prompt
      event.preventDefault()
      this.installPromptEvent = event
      
      this.showNotificationMessage(
        'Install Weather Dashboard for a better experience!',
        'info',
        'mdi-download',
        8000
      )
    },
    
    handleVisibilityChange() {
      // Refresh data when tab becomes visible again (if auto-refresh is enabled)
      if (!document.hidden && this.weatherStore.autoRefresh) {
        const lastUpdate = this.weatherStore.lastUpdated
        if (lastUpdate) {
          const now = new Date()
          const diffMinutes = (now - new Date(lastUpdate)) / 60000
          
          // Refresh if data is older than 10 minutes
          if (diffMinutes > 10) {
            this.weatherStore.refreshCurrentWeather()
          }
        }
      }
    },
    
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (event) => {
        // Don't trigger shortcuts if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          return
        }
        
        // Handle keyboard shortcuts
        switch (event.key) {
          case '/':
            event.preventDefault()
            // Focus search (would need to emit event to navbar)
            break
          case 'r':
            event.preventDefault()
            this.weatherStore.refreshCurrentWeather()
            break
          case 'd':
            event.preventDefault()
            this.weatherStore.toggleDarkMode()
            break
          case 'f':
            event.preventDefault()
            this.$router.push({ name: 'Favorites' })
            break
          case 's':
            event.preventDefault()
            this.$router.push({ name: 'Settings' })
            break
          case 'h':
            event.preventDefault()
            this.$router.push({ name: 'Dashboard' })
            break
          case '?':
            event.preventDefault()
            this.showKeyboardHelp = true
            break
        }
      })
    },
    
    initializeAutoRefresh() {
      if (this.weatherStore.autoRefresh) {
        this.autoRefreshInterval = setInterval(() => {
          if (this.weatherStore.currentWeather && !document.hidden) {
            this.weatherStore.refreshCurrentWeather()
          }
        }, this.weatherStore.refreshInterval)
      }
    },
    
    clearAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval)
      }
    }
  }
}
</script>

<style scoped>
.main-container {
  min-height: calc(100vh - 64px - 80px); /* Adjust based on navbar and footer height */
  padding: 24px;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.offline-indicator {
  z-index: 9999;
}

/* Mobile adjustments */
@media (max-width: 960px) {
  .main-container {
    padding: 16px;
    min-height: calc(100vh - 56px - 120px);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .main-container {
    background: var(--v-theme-background);
  }
}

/* Print styles */
@media print {
  .v-navigation-drawer,
  .v-app-bar,
  .v-footer,
  .v-snackbar,
  .v-overlay {
    display: none !important;
  }
  
  .main-container {
    padding: 0;
    min-height: auto;
  }
}
</style>
