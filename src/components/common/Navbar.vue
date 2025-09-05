<template>
  <v-app-bar
    :elevation="mobile ? 1 : 2"
    :density="mobile ? 'compact' : 'default'"
    :height="mobile ? 56 : 64"
    class="navbar glass-effect"
    app
    fixed
  >
    <v-container fluid class="d-flex align-center pa-0">
      <v-row no-gutters class="align-center w-100" style="min-height: inherit;">
        <!-- Left Section: Mobile Menu + Logo -->
        <v-col cols="auto" class="d-flex align-center">
          <!-- Mobile menu button -->
          <v-app-bar-nav-icon
            v-if="mobile"
            @click="$emit('toggle-sidebar')"
            class="me-2"
            size="small"
          />
          
          <!-- Logo and title -->
          <div class="d-flex align-center logo-section">
            <v-avatar 
              :size="mobile ? 32 : 40" 
              :class="mobile ? 'me-2' : 'me-3'"
            >
              <v-img
                :src="logoUrl"
                :alt="appName"
                contain
              />
            </v-avatar>
            
            <div class="title-section">
              <h1 
                :class="[
                  mobile ? 'text-subtitle-1' : 'text-h6',
                  'font-weight-bold mb-0'
                ]"
              >
                {{ appName }}
              </h1>
              <p v-if="!mobile" class="text-caption text-medium-emphasis mb-0 mt-n1">
                {{ appTagline }}
              </p>
            </div>
          </div>
        </v-col>

        <!-- Spacer -->
        <v-spacer />

        <!-- Right Section: Weather Info + Action buttons -->
        <v-col cols="auto">
          <div class="d-flex align-center">
            <!-- Current weather info (Desktop Only) -->
            <div 
              v-if="mdAndUp && currentWeather" 
              class="current-weather-info d-flex align-center me-4"
            >
              <v-avatar size="32" class="me-3">
                <v-img
                  :src="getWeatherIconUrl(currentWeather.weather[0].icon)"
                  :alt="currentWeather.weather[0].description"
                />
              </v-avatar>
              
              <div class="weather-text">
                <div class="text-body-2 font-weight-medium">
                  {{ getCurrentTemp }}{{ getUnitSymbol }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ currentWeather.name }}
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="actions-section d-flex align-center">
              <!-- Refresh button -->
              <v-btn
                icon
                variant="text"
                :size="mobile ? 'small' : 'default'"
                @click="refreshWeather"
                :loading="loading"
                class="action-btn"
                :class="mobile ? 'me-1' : 'me-2'"
              >
                <v-icon 
                  :class="{ 'animate-spin': loading }" 
                  :size="mobile ? 18 : 24"
                >
                  mdi-refresh
                </v-icon>
                <v-tooltip v-if="!mobile" activator="parent" location="bottom">
                  {{ loading ? 'Refreshing...' : 'Refresh weather data' }}
                </v-tooltip>
              </v-btn>

              <!-- Notifications button (hide on xs screens) -->
              <v-menu 
                v-if="!xs" 
                location="bottom end" 
                offset="8"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    :size="mobile ? 'small' : 'default'"
                    v-bind="props"
                    class="action-btn"
                    :class="mobile ? 'me-1' : 'me-2'"
                  >
                    <v-badge 
                      :content="unreadNotificationCount" 
                      :value="unreadNotificationCount > 0"
                      color="red"
                      overlap
                      :dot="mobile"
                    >
                      <v-icon :size="mobile ? 18 : 24">
                        {{ notifications ? 'mdi-bell' : 'mdi-bell-off' }}
                      </v-icon>
                    </v-badge>
                    <v-tooltip v-if="!mobile" activator="parent" location="bottom">
                      Notifications
                      {{ unreadNotificationCount > 0 ? `(${unreadNotificationCount})` : '' }}
                    </v-tooltip>
                  </v-btn>
                </template>
                
                <v-card 
                  :min-width="mobile ? 280 : 320" 
                  :max-width="mobile ? 340 : 400"
                  class="notification-card"
                >
                  <v-card-title class="d-flex align-center py-3">
                    <v-icon class="me-2" size="20">mdi-bell</v-icon>
                    <span class="text-subtitle-1">Notifications</span>
                    <v-spacer />
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      @click="toggleNotifications"
                    >
                      <v-icon size="18">
                        {{ notifications ? 'mdi-bell-off' : 'mdi-bell' }}
                      </v-icon>
                    </v-btn>
                  </v-card-title>
                  
                  <v-divider />
                  
                  <v-card-text class="pa-0">
                    <v-list 
                      v-if="notificationList.length > 0" 
                      :max-height="mobile ? 250 : 300" 
                      class="overflow-y-auto"
                      density="compact"
                    >
                      <v-list-item 
                        v-for="notification in notificationList" 
                        :key="notification.id"
                        @click="markAsRead(notification.id)"
                        :class="{ 
                          'bg-grey-lighten-5': !notification.read,
                          'v-theme--dark bg-grey-darken-3': !notification.read && $vuetify.theme.current.dark
                        }"
                        class="py-2"
                      >
                        <template v-slot:prepend>
                          <v-icon 
                            :color="getNotificationIconColor(notification.type)"
                            size="18"
                            class="me-3"
                          >
                            {{ getNotificationIcon(notification.type) }}
                          </v-icon>
                        </template>
                        
                        <v-list-item-title class="text-body-2 font-weight-medium">
                          {{ notification.title }}
                        </v-list-item-title>
                        
                        <v-list-item-subtitle class="text-caption mt-1">
                          {{ notification.message }}
                        </v-list-item-subtitle>
                        
                        <template v-slot:append>
                          <div class="text-caption text-medium-emphasis">
                            {{ formatNotificationTime(notification.timestamp) }}
                          </div>
                        </template>
                      </v-list-item>
                    </v-list>
                    
                    <div v-else class="pa-8 text-center">
                      <v-icon size="48" color="grey" class="mb-4">mdi-bell-off</v-icon>
                      <div class="text-body-2 text-medium-emphasis">No notifications</div>
                    </div>
                  </v-card-text>
                  
                  <v-divider v-if="notificationList.length > 0" />
                  
                  <v-card-actions v-if="notificationList.length > 0" class="justify-center pa-3">
                    <v-btn variant="text" size="small" @click="clearAllNotifications">
                      Clear All
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>

              <!-- Dark mode toggle -->
              <DarkModeToggle 
                class="action-btn"
                :class="mobile ? 'me-1' : 'me-2'"
                :size="mobile ? 'small' : 'default'"
              />

              <!-- Settings menu -->
              <v-menu location="bottom end" offset="8">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    :size="mobile ? 'small' : 'default'"
                    v-bind="props"
                    class="action-btn"
                  >
                    <v-icon :size="mobile ? 18 : 24">mdi-dots-vertical</v-icon>
                    <v-tooltip v-if="!mobile" activator="parent" location="bottom">
                      More options
                    </v-tooltip>
                  </v-btn>
                </template>
                
                <v-list :min-width="mobile ? 180 : 200" density="compact">
                  <v-list-item
                    prepend-icon="mdi-cog"
                    title="Settings"
                    @click="navigateToSettings"
                    class="py-2"
                  />
                  <v-list-item
                    prepend-icon="mdi-information"
                    title="About"
                    @click="showAboutDialog = true"
                    class="py-2"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-help-circle"
                    title="Help"
                    @click="showHelpDialog = true"
                    class="py-2"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- About dialog -->
    <v-dialog 
      v-model="showAboutDialog" 
      :max-width="mobile ? 360 : 420" 
      :fullscreen="xs"
    >
      <v-card class="dialog-card">
        <v-card-title :class="[mobile ? 'text-h6' : 'text-h5', 'py-4']">
          About Weather Dashboard
        </v-card-title>
        <v-divider />
        <v-card-text class="py-4">
          <div :class="[mobile ? 'text-body-2' : 'text-body-1', 'mb-4']">
            A modern, responsive weather dashboard built with cutting-edge web technologies.
          </div>
          <div class="text-body-2 text-medium-emphasis">
            <div class="mb-2"><strong>Version:</strong> 1.0.0</div>
            <div class="mb-2"><strong>Framework:</strong> Vue 3 + Vuetify 3</div>
            <div><strong>Data Source:</strong> OpenWeatherMap API</div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 justify-end">
          <v-btn variant="text" color="primary" @click="showAboutDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Help dialog -->
    <v-dialog 
      v-model="showHelpDialog" 
      :max-width="mobile ? 380 : 520" 
      :fullscreen="xs"
    >
      <v-card class="dialog-card">
        <v-card-title :class="[mobile ? 'text-h6' : 'text-h5', 'py-4']">
          Help & Support
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-expansion-panels variant="accordion" class="help-panels">
            <v-expansion-panel>
              <v-expansion-panel-title class="py-3">
                <v-icon class="me-3" color="primary">mdi-magnify</v-icon>
                How to search for cities
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 py-3">
                Use the search bar in the main dashboard to find weather information for any city worldwide. 
                You can search by city name or combine it with country code for more precise results.
              </v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title class="py-3">
                <v-icon class="me-3" color="red">mdi-heart</v-icon>
                Adding favorites
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 py-3">
                Click the heart icon on any weather card to save cities to your favorites list for quick access.
                Your favorites are stored locally and persist between sessions.
              </v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title class="py-3">
                <v-icon class="me-3" color="green">mdi-map-marker</v-icon>
                Location services
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 py-3">
                Allow location access to automatically show weather for your current location.
                This provides the most accurate local weather information.
              </v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title class="py-3">
                <v-icon class="me-3" color="orange">mdi-bell</v-icon>
                Notifications
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 py-3">
                Enable notifications to receive weather alerts and updates.
                You can customize notification preferences in the settings.
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 justify-end">
          <v-btn variant="text" color="primary" @click="showHelpDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { useDisplay } from 'vuetify'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'

export default {
  name: 'Navbar',
  components: {
    DarkModeToggle
  },
  
  emits: ['toggle-sidebar', 'show-snackbar'],
  
  data() {
    return {
      appName: 'Weather Dashboard',
      appTagline: 'Your personal weather companion',
      showAboutDialog: false,
      showHelpDialog: false,
      notificationList: [
        {
          id: 1,
          type: 'weather',
          title: 'Severe Weather Alert',
          message: 'Heavy rainfall expected in your area',
          timestamp: new Date(Date.now() - 3600000),
          read: false
        },
        {
          id: 2,
          type: 'update',
          title: 'App Updated',
          message: 'New features and improvements available',
          timestamp: new Date(Date.now() - 86400000),
          read: true
        },
        {
          id: 3,
          type: 'warning',
          title: 'Location Access',
          message: 'Please allow location access for better weather updates',
          timestamp: new Date(Date.now() - 7200000),
          read: false
        }
      ]
    }
  },
  
  setup() {
    const { mobile, xs, sm, md, mdAndUp, lgAndUp } = useDisplay()
    return { mobile, xs, sm, md, mdAndUp, lgAndUp }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    currentWeather() {
      return this.weatherStore.currentWeather
    },
    
    loading() {
      return this.weatherStore.loading
    },
    
    notifications() {
      return this.weatherStore.notifications
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
    
    logoUrl() {
      try {
        return new URL('@/assets/logo.svg', import.meta.url).href
      } catch {
        return '/logo.svg'
      }
    },
    
    formatLastUpdated() {
      if (!this.lastUpdated) return ''
      return new Date(this.lastUpdated).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    
    unreadNotificationCount() {
      return this.notificationList.filter(n => !n.read).length
    }
  },
  
  methods: {
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
    
    toggleNotifications() {
      this.weatherStore.setNotifications(!this.notifications)
    },
    
    navigateToSettings() {
      this.$router.push({ name: 'Settings' })
    },
    
    getWeatherIconUrl(icon) {
      return `https://openweathermap.org/img/wn/${icon}.png`
    },
    
    markAsRead(notificationId) {
      const notification = this.notificationList.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        notification.read = true
      }
    },
    
    clearAllNotifications() {
      this.notificationList = []
    },
    
    getNotificationIcon(type) {
      const icons = {
        weather: 'mdi-weather-lightning',
        update: 'mdi-update',
        info: 'mdi-information',
        warning: 'mdi-alert'
      }
      return icons[type] || 'mdi-bell'
    },
    
    getNotificationIconColor(type) {
      const colors = {
        weather: 'orange',
        update: 'green',
        info: 'blue',
        warning: 'red'
      }
      return colors[type] || 'grey'
    },
    
    formatNotificationTime(timestamp) {
      const now = new Date()
      const diff = now - timestamp
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      return 'Just now'
    }
  }
}
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.logo-section {
  flex-shrink: 0;
  min-width: 0;
}

.title-section {
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
}

.current-weather-info {
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.9);
  border: 1px solid rgba(var(--v-border-color), 0.15);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.current-weather-info:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.weather-text {
  line-height: 1.2;
  min-width: 0;
}

.actions-section {
  flex-shrink: 0;
}

.action-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px !important;
  min-width: 44px !important;
  min-height: 44px !important;
}

.action-btn:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Perfect badge positioning */
.v-badge :deep(.v-badge__badge) {
  font-size: 10px !important;
  min-width: 16px !important;
  height: 16px !important;
  font-weight: 600 !important;
  border: 2px solid rgb(var(--v-theme-surface)) !important;
}

/* Notification card styling */
.notification-card {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(var(--v-border-color), 0.12) !important;
}

/* Dialog styling */
.dialog-card {
  border-radius: 16px !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15) !important;
}

.help-panels :deep(.v-expansion-panel) {
  border-radius: 8px !important;
  margin-bottom: 8px !important;
}

/* ONLY FIXED POSITIONING ADDED FOR DEVICES BELOW 599px */
@media (max-width: 599px) {
  .navbar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 1005 !important;
  }

  /* Add padding to body to prevent content from going under navbar */
  body {
    padding-top: 56px !important;
  }

  .navbar :deep(.v-toolbar__content) {
    padding: 0 8px !important;
  }
  
  .logo-section .v-avatar {
    width: 28px !important;
    height: 28px !important;
  }
  
  .title-section h1 {
    font-size: 1.05rem !important;
  }
  
  .action-btn {
    min-width: 40px !important;
    min-height: 40px !important;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .navbar :deep(.v-toolbar__content) {
    padding: 0 12px !important;
  }
  
  .current-weather-info {
    padding: 6px 12px;
  }
}

@media (min-width: 960px) {
  .navbar :deep(.v-toolbar__content) {
    padding: 0 16px !important;
  }
}

/* Dark theme optimizations */
.v-theme--dark .navbar {
  background: rgba(var(--v-theme-surface), 0.95) !important;
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--dark .current-weather-info {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.v-theme--dark .notification-card,
.v-theme--dark .dialog-card {
  background: rgb(var(--v-theme-surface)) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .action-btn,
  .current-weather-info {
    transition: none !important;
  }
  
  .action-btn:hover,
  .current-weather-info:hover {
    transform: none !important;
  }
  
  .animate-spin {
    animation: none !important;
  }
}

.action-btn:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary)) !important;
  outline-offset: 2px !important;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .navbar {
    backdrop-filter: none !important;
    background: rgb(var(--v-theme-surface)) !important;
  }
  
  .current-weather-info {
    backdrop-filter: none !important;
    background: rgb(var(--v-theme-surface)) !important;
    border-width: 2px !important;
  }
}
</style>
