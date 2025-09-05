<template>
  <div class="settings-page">
    <!-- Page header -->
    <div class="settings-header mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">
        <v-icon class="mr-2">mdi-cog</v-icon>
        Settings
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        Customize your weather dashboard experience
      </p>
    </div>

    <!-- Settings sections -->
    <v-row>
      <v-col cols="12" lg="8">
        <!-- General Settings -->
        <v-card class="settings-card glass-effect mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-tune</v-icon>
            General Settings
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <!-- Temperature Unit -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="temperatureUnit"
                  :items="temperatureUnits"
                  label="Temperature Unit"
                  variant="outlined"
                  @update:model-value="updateTemperatureUnit"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-thermometer</v-icon>
                  </template>
                </v-select>
              </v-col>
              
              <!-- Auto Refresh -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="refreshInterval"
                  :items="refreshIntervals"
                  label="Auto Refresh"
                  variant="outlined"
                  @update:model-value="updateRefreshInterval"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-refresh</v-icon>
                  </template>
                </v-select>
              </v-col>
            </v-row>
            
            <!-- Toggle Settings -->
            <div class="toggle-settings">
              <v-switch
                v-model="autoRefreshEnabled"
                label="Enable auto refresh"
                color="primary"
                hide-details
                @update:model-value="updateAutoRefresh"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-refresh-auto</v-icon>
                </template>
              </v-switch>
              
              <v-switch
                v-model="notificationsEnabled"
                label="Enable notifications"
                color="primary"
                hide-details
                @update:model-value="updateNotifications"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-bell</v-icon>
                </template>
              </v-switch>
              
              <v-switch
                v-model="locationEnabled"
                label="Use current location"
                color="primary"
                hide-details
                @update:model-value="updateLocationSetting"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-crosshairs-gps</v-icon>
                </template>
              </v-switch>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- Theme Settings -->
        <v-card class="settings-card glass-effect mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-palette</v-icon>
            Theme & Appearance
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <!-- Theme Selection -->
              <v-col cols="12">
                <v-radio-group
                  v-model="themeMode"
                  @update:model-value="updateThemeMode"
                  class="theme-radio-group"
                >
                  <div class="theme-options">
                    <v-radio
                      value="light"
                      class="theme-option"
                    >
                      <template v-slot:label>
                        <div class="theme-option-content">
                          <v-icon size="24" class="mb-2">mdi-weather-sunny</v-icon>
                          <div class="text-subtitle-2">Light</div>
                        </div>
                      </template>
                    </v-radio>
                    
                    <v-radio
                      value="dark"
                      class="theme-option"
                    >
                      <template v-slot:label>
                        <div class="theme-option-content">
                          <v-icon size="24" class="mb-2">mdi-weather-night</v-icon>
                          <div class="text-subtitle-2">Dark</div>
                        </div>
                      </template>
                    </v-radio>
                    
                    <v-radio
                      value="auto"
                      class="theme-option"
                    >
                      <template v-slot:label>
                        <div class="theme-option-content">
                          <v-icon size="24" class="mb-2">mdi-theme-light-dark</v-icon>
                          <div class="text-subtitle-2">Auto</div>
                        </div>
                      </template>
                    </v-radio>
                  </div>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        
        <!-- Data & Privacy -->
        <v-card class="settings-card glass-effect mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            Data & Privacy
          </v-card-title>
          
          <v-card-text>
            <div class="data-settings">
              <!-- Search History -->
              <div class="data-item d-flex align-center justify-space-between mb-4">
                <div class="data-info">
                  <div class="text-subtitle-2">Search History</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ searchHistoryCount }} recent searches stored locally
                  </div>
                </div>
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="clearSearchHistory"
                  :disabled="searchHistoryCount === 0"
                >
                  Clear
                </v-btn>
              </div>
              
              <!-- Favorites -->
              <div class="data-item d-flex align-center justify-space-between mb-4">
                <div class="data-info">
                  <div class="text-subtitle-2">Favorites</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ favoritesCount }} favorite cities saved
                  </div>
                </div>
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="showClearFavoritesDialog = true"
                  :disabled="favoritesCount === 0"
                >
                  Clear
                </v-btn>
              </div>
              
              <!-- Cache -->
              <div class="data-item d-flex align-center justify-space-between mb-4">
                <div class="data-info">
                  <div class="text-subtitle-2">Cache</div>
                  <div class="text-caption text-medium-emphasis">
                    Temporary weather data for faster loading
                  </div>
                </div>
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="clearCache"
                >
                  Clear
                </v-btn>
              </div>
            </div>
            
            <!-- Export/Import -->
            <v-divider class="my-4" />
            
            <div class="export-import">
              <div class="text-subtitle-2 mb-3">Backup & Restore</div>
              <div class="d-flex gap-2 flex-wrap">
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-download"
                  @click="exportSettings"
                >
                  Export Settings
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-upload"
                  @click="$refs.importFile.click()"
                >
                  Import Settings
                </v-btn>
                <input
                  ref="importFile"
                  type="file"
                  accept=".json"
                  style="display: none"
                  @change="importSettings"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- Reset Settings -->
        <v-card class="settings-card glass-effect">
          <v-card-title class="d-flex align-center text-error">
            <v-icon class="mr-2">mdi-restore</v-icon>
            Reset Settings
          </v-card-title>
          
          <v-card-text>
            <p class="text-body-2 mb-4">
              Reset all settings to their default values. This will clear all your preferences, 
              favorites, and search history.
            </p>
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-restore"
              @click="showResetDialog = true"
            >
              Reset All Settings
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Settings Info Sidebar -->
      <v-col cols="12" lg="4">
        <v-card class="settings-info glass-effect mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-information</v-icon>
            About
          </v-card-title>
          
          <v-card-text>
            <div class="app-info">
              <div class="text-center mb-4">
                <v-avatar size="64" class="mb-3">
                  <v-img :src="logoUrl" />
                </v-avatar>
                <div class="text-h6 font-weight-bold">Weather Dashboard</div>
                <div class="text-caption text-medium-emphasis">Version 1.0.0</div>
              </div>
              
              <v-list density="compact">
                <v-list-item
                  prepend-icon="mdi-web"
                  title="Built with Vue 3"
                  subtitle="Modern JavaScript framework"
                />
                <v-list-item
                  prepend-icon="mdi-weather-cloudy"
                  title="OpenWeatherMap API"
                  subtitle="Reliable weather data"
                />
                <v-list-item
                  prepend-icon="mdi-palette"
                  title="Material Design"
                  subtitle="Vuetify + Tailwind CSS"
                />
              </v-list>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- Quick Stats -->
        <v-card class="settings-info glass-effect">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-box</v-icon>
            Statistics
          </v-card-title>
          
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                title="Favorite Cities"
                :subtitle="`${favoritesCount} saved`"
                prepend-icon="mdi-heart"
              />
              <v-list-item
                title="Recent Searches"
                :subtitle="`${searchHistoryCount} cities`"
                prepend-icon="mdi-history"
              />
              <v-list-item
                title="Last Updated"
                :subtitle="lastUpdatedText"
                prepend-icon="mdi-clock"
              />
              <v-list-item
                title="API Status"
                :subtitle="apiStatusText"
                :prepend-icon="apiStatusIcon"
                :class="{ 'text-error': !apiOnline, 'text-success': apiOnline }"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Confirmation Dialogs -->
    <v-dialog v-model="showClearFavoritesDialog" max-width="400">
      <v-card>
        <v-card-title>Clear All Favorites?</v-card-title>
        <v-card-text>
          This will remove all {{ favoritesCount }} favorite cities. 
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showClearFavoritesDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="clearAllFavorites">
            Clear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-dialog v-model="showResetDialog" max-width="400">
      <v-card>
        <v-card-title>Reset All Settings?</v-card-title>
        <v-card-text>
          This will reset all settings to defaults and clear all data. 
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showResetDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="resetAllSettings">
            Reset
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useWeatherStore } from '@/store/weather'

export default {
  name: 'SettingsPage',
  
  data() {
    return {
      showClearFavoritesDialog: false,
      showResetDialog: false,
      temperatureUnits: [
        { title: 'Celsius (°C)', value: 'celsius' },
        { title: 'Fahrenheit (°F)', value: 'fahrenheit' }
      ],
      refreshIntervals: [
        { title: 'Never', value: 0 },
        { title: 'Every minute', value: 60000 },
        { title: 'Every 5 minutes', value: 300000 },
        { title: 'Every 10 minutes', value: 600000 },
        { title: 'Every 30 minutes', value: 1800000 }
      ]
    }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    temperatureUnit: {
      get() {
        return this.weatherStore.unit
      },
      set(value) {
        // Handled by updateTemperatureUnit method
      }
    },
    
    autoRefreshEnabled: {
      get() {
        return this.weatherStore.autoRefresh
      },
      set(value) {
        // Handled by updateAutoRefresh method
      }
    },
    
    refreshInterval: {
      get() {
        return this.weatherStore.refreshInterval
      },
      set(value) {
        // Handled by updateRefreshInterval method
      }
    },
    
    notificationsEnabled: {
      get() {
        return this.weatherStore.notifications
      },
      set(value) {
        // Handled by updateNotifications method
      }
    },
    
    locationEnabled: {
      get() {
        return this.weatherStore.locationPermission === 'granted'
      },
      set(value) {
        // Handled by updateLocationSetting method
      }
    },
    
    themeMode: {
      get() {
        const darkMode = this.weatherStore.darkMode
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        // Check if user has manually set dark mode
        const storedMode = localStorage.getItem('darkMode')
        if (storedMode === null) {
          return 'auto'
        }
        
        return darkMode ? 'dark' : 'light'
      },
      set(value) {
        // Handled by updateThemeMode method
      }
    },
    
    favoritesCount() {
      return this.weatherStore.favorites.length
    },
    
    searchHistoryCount() {
      return this.weatherStore.searchHistory.length
    },
    
    lastUpdatedText() {
      const lastUpdated = this.weatherStore.lastUpdated
      if (!lastUpdated) return 'Never'
      
      const now = new Date()
      const diff = now - new Date(lastUpdated)
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes} minutes ago`
      const hours = Math.floor(minutes / 60)
      return `${hours} hours ago`
    },
    
    apiOnline() {
      return !this.weatherStore.error
    },
    
    apiStatusText() {
      return this.apiOnline ? 'Online' : 'Offline'
    },
    
    apiStatusIcon() {
      return this.apiOnline ? 'mdi-check-circle' : 'mdi-alert-circle'
    },
    
    logoUrl() {
      return new URL('@/assets/logo.svg', import.meta.url).href
    }
  },
  
  methods: {
    updateTemperatureUnit(unit) {
      this.weatherStore.setUnit(unit)
    },
    
    updateAutoRefresh(enabled) {
      this.weatherStore.setAutoRefresh(enabled)
    },
    
    updateRefreshInterval(interval) {
      this.weatherStore.setRefreshInterval(interval)
    },
    
    updateNotifications(enabled) {
      this.weatherStore.setNotifications(enabled)
    },
    
    async updateLocationSetting(enabled) {
      if (enabled) {
        try {
          await this.weatherStore.fetchWeatherByLocation()
        } catch (error) {
          console.error('Failed to enable location:', error)
        }
      }
    },
    
    updateThemeMode(mode) {
      if (mode === 'auto') {
        // Remove stored preference and use system setting
        localStorage.removeItem('darkMode')
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.weatherStore.setDarkMode(systemPrefersDark)
        
        // Listen for system theme changes
        this.setupSystemThemeListener()
      } else {
        this.weatherStore.setDarkMode(mode === 'dark')
      }
    },
    
    setupSystemThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addListener((e) => {
        if (localStorage.getItem('darkMode') === null) {
          this.weatherStore.setDarkMode(e.matches)
        }
      })
    },
    
    clearSearchHistory() {
      this.weatherStore.clearSearchHistory()
    },
    
    clearAllFavorites() {
      this.weatherStore.favorites.forEach(favorite => {
        this.weatherStore.removeFromFavorites(favorite.name)
      })
      this.showClearFavoritesDialog = false
    },
    
    clearCache() {
      this.weatherStore.clearCache()
      // Show success message
      this.$emit('show-notification', 'Cache cleared successfully', 'success')
    },
    
    exportSettings() {
      const settings = {
        unit: this.weatherStore.unit,
        darkMode: this.weatherStore.darkMode,
        autoRefresh: this.weatherStore.autoRefresh,
        refreshInterval: this.weatherStore.refreshInterval,
        notifications: this.weatherStore.notifications,
        favorites: this.weatherStore.favorites,
        searchHistory: this.weatherStore.searchHistory,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
      
      const dataStr = JSON.stringify(settings, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `weather-dashboard-settings-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    },
    
    importSettings(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result)
          
          // Validate settings structure
          if (settings.version && settings.exportedAt) {
            // Apply settings
            if (settings.unit) this.weatherStore.setUnit(settings.unit)
            if (typeof settings.darkMode === 'boolean') this.weatherStore.setDarkMode(settings.darkMode)
            if (typeof settings.autoRefresh === 'boolean') this.weatherStore.setAutoRefresh(settings.autoRefresh)
            if (settings.refreshInterval) this.weatherStore.setRefreshInterval(settings.refreshInterval)
            if (typeof settings.notifications === 'boolean') this.weatherStore.setNotifications(settings.notifications)
            
            // Import favorites and search history
            if (settings.favorites) {
              this.weatherStore.favorites = settings.favorites
              this.weatherStore.saveFavorites()
            }
            if (settings.searchHistory) {
              this.weatherStore.searchHistory = settings.searchHistory
              localStorage.setItem('searchHistory', JSON.stringify(settings.searchHistory))
            }
            
            this.$emit('show-notification', 'Settings imported successfully', 'success')
          } else {
            throw new Error('Invalid settings file format')
          }
        } catch (error) {
          console.error('Failed to import settings:', error)
          this.$emit('show-notification', 'Failed to import settings. Invalid file format.', 'error')
        }
      }
      reader.readAsText(file)
      
      // Clear the input
      event.target.value = ''
    },
    
    resetAllSettings() {
      // Clear all local storage
      localStorage.clear()
      
      // Reset store to defaults
      this.weatherStore.resetStore()
      
      // Refresh page to ensure clean state
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.settings-header {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.settings-card,
.settings-info {
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

/* ✅ 100% SOLUTION: Remove blue outline from all focus states */
:deep(.v-input input:focus),
:deep(.v-input:focus-within),
:deep(.v-select:focus-within),
:deep(.v-select input:focus),
:deep(.v-text-field:focus-within),
:deep(.v-text-field input:focus),
:deep(.v-field input:focus),
:deep(.v-field:focus-within) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
  -webkit-tap-highlight-color: transparent !important;
}

/* ✅ Remove default browser focus glow */
:deep(.v-field__field),
:deep(.v-field__input),
:deep(.v-field__control) {
  outline: none !important;
}

/* ✅ Override Vuetify's focus styles */
:deep(.v-field--focused) {
  outline: none !important;
  box-shadow: none !important;
}

/* ✅ For Firefox and other browsers */
:deep(input:focus),
:deep(input:focus-visible),
:deep(*:focus),
:deep(*:focus-visible) {
  outline: none !important;
  /* -webkit-appearance: none; */
  -webkit-tap-highlight-color: transparent;
}

/* ✅ Custom focus indicator (optional - can remove if you want no focus indication) */
:deep(.v-field--focused .v-field__outline) {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 1px !important;
}

.toggle-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.theme-radio-group {
  margin: 0;
}

.theme-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.theme-option {
  flex: 1;
  min-width: 120px;
}

.theme-option-content {
  text-align: center;
  padding: 16px;
  border: 2px solid rgba(var(--v-border-color), 0.12);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.theme-option-content:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.v-radio .v-selection-control__input {
  opacity: 0;
}

.v-radio--checked .theme-option-content {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.data-settings {
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: 8px;
  padding: 16px;
}

.data-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.data-item:last-child {
  border-bottom: none;
}

.export-import {
  background: rgba(var(--v-theme-surface), 0.3);
  border-radius: 8px;
  padding: 16px;
}

.app-info {
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .settings-page {
    padding: 0 8px;
  }
  
  .settings-header {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .theme-options {
    flex-direction: column;
  }
  
  .theme-option {
    min-width: auto;
  }
  
  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .export-import .d-flex {
    flex-direction: column;
    gap: 8px;
  }
  
  .export-import .v-btn {
    width: 100%;
  }
}
</style>
