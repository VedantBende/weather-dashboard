<template>
  <v-footer
    :class="footerClasses"
    app
    padless
  >
    <v-container class="py-3">
      <div class="d-flex flex-column flex-md-row align-center justify-space-between">
        <!-- Left section - App info -->
        <div class="footer-section text-center text-md-left mb-3 mb-md-0">
          <div class="d-flex align-center justify-center justify-md-start mb-2">
            <v-avatar size="24" class="mr-2">
              <v-img :src="logoUrl" contain />
            </v-avatar>
            <span class="text-body-2 font-weight-medium">
              {{ appName }}
            </span>
          </div>
          <div class="text-caption text-medium-emphasis">
            © {{ currentYear }} Weather Dashboard. Made with ❤️ for weather enthusiasts.
          </div>
        </div>

        <!-- Center section - Links -->
        <div class="footer-section d-flex flex-wrap justify-center gap-4 mb-3 mb-md-0">
          <v-btn
            variant="text"
            size="small"
            @click="showPrivacyDialog = true"
            class="footer-link"
          >
            Privacy Policy
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            @click="showTermsDialog = true"
            class="footer-link"
          >
            Terms of Service
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            href="https://openweathermap.org"
            target="_blank"
            class="footer-link"
          >
            Weather API
            <v-icon size="small" class="ml-1">mdi-open-in-new</v-icon>
          </v-btn>
        </div>

        <!-- Right section - Status and social -->
        <div class="footer-section text-center text-md-right">
          <!-- API Status -->
          <div class="d-flex align-center justify-center justify-md-end mb-2">
            <v-chip
              :color="apiStatus.color"
              size="x-small"
              variant="flat"
              class="mr-2"
            >
              <v-icon
                :icon="apiStatus.icon"
                size="x-small"
                class="mr-1"
              />
              {{ apiStatus.text }}
            </v-chip>
            
            <!-- Last update time -->
            <span class="text-caption text-medium-emphasis">
              Updated {{ formatLastUpdated }}
            </span>
          </div>

          <!-- Social links -->
          <div class="d-flex justify-center justify-md-end gap-1">
            <v-btn
              icon="mdi-github"
              variant="text"
              size="small"
              href="https://github.com/VedantBende/weather-dashboard"
              target="_blank"
              title="View source code"
            />
            <v-btn
              icon="mdi-linkedin"
              variant="text"
              size="small"
              href="https://www.linkedin.com/in/vedant-bende-3aa28b2a8/"
              target="_blank"
              title="Connect on LinkedIn"
            />
          </div>
        </div>
      </div>

      <!-- Mobile version - stacked layout -->
      <div v-if="mobile" class="mobile-footer-info mt-3 pt-3 border-t">
        <div class="text-center">
          <div class="text-caption text-medium-emphasis mb-1">
            Powered by OpenWeatherMap API
          </div>
          <div class="text-caption text-medium-emphasis">
            Version {{ appVersion }} • Built with Vue 3 & Vuetify
          </div>
        </div>
      </div>
    </v-container>

    <!-- Privacy Policy Dialog -->
    <v-dialog v-model="showPrivacyDialog" max-width="600" scrollable>
      <v-card>
        <v-card-title class="text-h5">Privacy Policy</v-card-title>
        <v-divider />
        <v-card-text class="privacy-content">
          <div class="text-body-1">
            <h3>Data Collection</h3>
            <p>
              Weather Dashboard respects your privacy. We collect minimal data necessary 
              for the app to function:
            </p>
            <ul>
              <li>Location data (only when you grant permission)</li>
              <li>Search history (stored locally)</li>
              <li>App preferences (stored locally)</li>
            </ul>

            <h3>Data Usage</h3>
            <p>
              Your data is used exclusively to:
            </p>
            <ul>
              <li>Provide weather information for your location</li>
              <li>Remember your favorite cities</li>
              <li>Maintain your app preferences</li>
            </ul>

            <h3>Data Storage</h3>
            <p>
              All personal data is stored locally on your device. We do not 
              transmit or store your personal information on our servers.
            </p>

            <h3>Third-Party Services</h3>
            <p>
              We use OpenWeatherMap API to fetch weather data. Please refer to 
              their privacy policy for information about their data practices.
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showPrivacyDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Terms of Service Dialog -->
    <v-dialog v-model="showTermsDialog" max-width="600" scrollable>
      <v-card>
        <v-card-title class="text-h5">Terms of Service</v-card-title>
        <v-divider />
        <v-card-text class="terms-content">
          <div class="text-body-1">
            <h3>Acceptance of Terms</h3>
            <p>
              By using Weather Dashboard, you agree to these terms of service.
            </p>

            <h3>Service Description</h3>
            <p>
              Weather Dashboard provides weather information through third-party APIs. 
              We strive for accuracy but cannot guarantee the reliability of weather data.
            </p>

            <h3>User Responsibilities</h3>
            <ul>
              <li>Use the service responsibly</li>
              <li>Do not abuse the API or attempt to overwhelm the servers</li>
              <li>Respect rate limits and usage guidelines</li>
            </ul>

            <h3>Limitations</h3>
            <p>
              Weather Dashboard is provided "as is" without warranties. 
              We are not liable for decisions made based on weather information provided.
            </p>

            <h3>Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. 
              Continued use implies acceptance of updated terms.
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showTermsDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-footer>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { useDisplay } from 'vuetify'

export default {
  name: 'Footer',
  
  data() {
    return {
      appName: 'Weather Dashboard',
      appVersion: '1.0.0',
      showPrivacyDialog: false,
      showTermsDialog: false
    }
  },
  
  setup() {
    const { mobile } = useDisplay()
    return { mobile }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    currentYear() {
      return new Date().getFullYear()
    },
    
    lastUpdated() {
      return this.weatherStore.lastUpdated
    },
    
    loading() {
      return this.weatherStore.loading
    },
    
    error() {
      return this.weatherStore.error
    },
    
    footerClasses() {
      return [
        'app-footer',
        'glass-effect',
        'border-t'
      ]
    },
    
    logoUrl() {
      return new URL('@/assets/logo.svg', import.meta.url).href
    },
    
    apiStatus() {
      if (this.loading) {
        return {
          color: 'warning',
          icon: 'mdi-loading',
          text: 'Updating'
        }
      }
      
      if (this.error) {
        return {
          color: 'error',
          icon: 'mdi-alert-circle',
          text: 'API Error'
        }
      }
      
      return {
        color: 'success',
        icon: 'mdi-check-circle',
        text: 'Online'
      }
    },
    
    formatLastUpdated() {
      if (!this.lastUpdated) return 'never'
      
      const now = new Date()
      const diff = now - new Date(this.lastUpdated)
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'just now'
      if (minutes < 60) return `${minutes}m ago`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    }
  }
}
</script>

<style scoped>
.app-footer {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-surface), 0.8);
}

.footer-section {
  flex: 1;
}

.footer-link {
  text-transform: none;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.footer-link:hover {
  color: rgb(var(--v-theme-primary));
}

.privacy-content,
.terms-content {
  max-height: 400px;
}

.privacy-content h3,
.terms-content h3 {
  color: rgb(var(--v-theme-primary));
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem 0;
}

.privacy-content h3:first-child,
.terms-content h3:first-child {
  margin-top: 0;
}

.privacy-content p,
.terms-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.privacy-content ul,
.terms-content ul {
  margin: 0.5rem 0 1rem 1rem;
  padding-left: 1rem;
}

.privacy-content li,
.terms-content li {
  margin-bottom: 0.25rem;
}

.mobile-footer-info {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

@media (max-width: 600px) {
  .footer-section {
    flex: none;
    width: 100%;
  }
}
</style>
