import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Import styles
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './styles/globals.css'

// Import root component and router
import App from './App.vue'
import router from './router'

// Enhanced Vuetify theme configuration
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'light',
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 2,
      darken: 2,
    },
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
          success: '#10b981',
          surface: '#ffffff',
          background: '#f8fafc',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#1e293b',
          'on-background': '#1e293b',
          // Weather specific colors
          'weather-sunny': '#f59e0b',
          'weather-cloudy': '#6b7280',
          'weather-rainy': '#3b82f6',
          'weather-snowy': '#e5e7eb',
          'weather-stormy': '#7c3aed',
          'weather-night': '#1e293b'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#60a5fa',
          secondary: '#94a3b8',
          accent: '#fbbf24',
          error: '#f87171',
          warning: '#fbbf24',
          info: '#22d3ee',
          success: '#34d399',
          surface: '#1e293b',
          background: '#0f172a',
          'on-primary': '#1e293b',
          'on-secondary': '#1e293b',
          'on-surface': '#f1f5f9',
          'on-background': '#f1f5f9',
          // Weather specific colors (dark theme)
          'weather-sunny': '#fbbf24',
          'weather-cloudy': '#9ca3af',
          'weather-rainy': '#60a5fa',
          'weather-snowy': '#f3f4f6',
          'weather-stormy': '#8b5cf6',
          'weather-night': '#334155'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      style: 'text-transform: none; font-weight: 500;'
    },
    VCard: {
      elevation: 2,
      rounded: 'lg'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable'
    }
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  }
})

// Create Pinia store
const pinia = createPinia()

// Create Vue application
const app = createApp(App)

// Use plugins
app.use(pinia)
app.use(router)
app.use(vuetify)

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('Global Vue error:', error, info)
  
  // Send error to monitoring service in production
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error)
  }
}

// Global warning handler
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue warning:', msg, trace)
}

// Global properties
app.config.globalProperties.$version = '1.0.0'
app.config.globalProperties.$buildDate = new Date().toISOString()

// Initialize theme sync
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('darkMode')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = savedTheme ? JSON.parse(savedTheme) : prefersDark
  
  if (isDark) {
    document.documentElement.classList.add('dark')
  }
  
  // Setup system theme change listener
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (localStorage.getItem('darkMode') === null) {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  })
}

// Development tools
if (import.meta.env.DEV) {
  app.config.devtools = true
  
  // Performance monitoring in development
  app.config.performance = true
  
  // Global debug helpers
  window.app = app
  window.router = router
}

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration)
      },
      (registrationError) => {
        console.log('SW registration failed: ', registrationError)
      }
    )
  })
}

// Initialize theme before mounting
initializeTheme()

// Mount the application
app.mount('#app')

// Expose app instance for debugging
if (import.meta.env.DEV) {
  window.__VUE_APP__ = app
}
