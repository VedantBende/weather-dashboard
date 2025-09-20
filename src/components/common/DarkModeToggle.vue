<template>
  <v-btn
    :icon="darkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    variant="text"
    :color="darkMode ? 'yellow' : 'blue'"
    @click="toggleDarkMode"
    :title="`Switch to ${darkMode ? 'light' : 'dark'} mode`"
    :disabled="isToggling"
    class="dark-mode-toggle"
  >
    <v-icon 
      :icon="darkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      :class="{ 'rotate-icon': isToggling }"
      @animationend="onAnimationEnd"
    />
    
    <v-tooltip activator="parent" location="bottom">
      {{ darkMode ? 'Switch to light mode' : 'Switch to dark mode' }}
    </v-tooltip>
  </v-btn>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { useTheme } from 'vuetify'

export default {
  name: 'DarkModeToggle',
  
  setup() {
    const theme = useTheme()
    return { theme }
  },
  
  data() {
    return {
      isToggling: false
    }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    darkMode() {
      return this.weatherStore.darkMode
    }
  },
  
  watch: {
    darkMode: {
      handler(newValue) {
        // CRITICAL: Batch all theme updates in requestAnimationFrame for synchronization
        requestAnimationFrame(() => {
          // Update Vuetify theme immediately
          this.theme.global.name.value = newValue ? 'dark' : 'light'
          
          // Single DOM class update - no individual component manipulation
          this.updateGlobalTheme(newValue)
        })
      },
      immediate: true
    }
  },
  
  methods: {
    toggleDarkMode() {
      // Prevent rapid clicking during toggle
      if (this.isToggling) return
      
      // Start icon animation
      this.isToggling = true
      
      // CRITICAL: Single synchronous store update
      this.weatherStore.toggleDarkMode()
    },
    
    // CRITICAL: Single point of DOM manipulation
    updateGlobalTheme(isDark) {
      const html = document.documentElement
      
      // Add theme switching flag to prevent transition cascading
      html.setAttribute('data-theme-switching', 'true')
      
      if (isDark) {
        html.classList.add('dark')
        html.setAttribute('data-theme', 'dark')
      } else {
        html.classList.remove('dark')
        html.setAttribute('data-theme', 'light')
      }
      
      // Remove switching flag after DOM update
      setTimeout(() => {
        html.removeAttribute('data-theme-switching')
      }, 50)
    },
    
    // Use CSS animation end event instead of setTimeout
    onAnimationEnd() {
      this.isToggling = false
    }
  },
  
  mounted() {
    // Initialize theme on component mount
    this.updateGlobalTheme(this.darkMode)
  }
}
</script>

<style scoped>
/* CRITICAL: Hardware accelerated button with no conflicting transitions */
.dark-mode-toggle {
  transition: color 0.15s ease !important;
  will-change: color;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.dark-mode-toggle:hover {
  transform: translateZ(0) scale(1.05);
}

.dark-mode-toggle:disabled {
  pointer-events: none;
  opacity: 0.8;
}

/* CRITICAL: Smooth, fast icon rotation */
.rotate-icon {
  animation: rotate-spin 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
}

@keyframes rotate-spin {
  0% { 
    transform: rotate(0deg) scale(1);
  }
  50% { 
    transform: rotate(180deg) scale(1.1);
  }
  100% { 
    transform: rotate(360deg) scale(1);
  }
}

/* CRITICAL: Prevent animation conflicts */
.v-icon {
  transition: none !important;
}
</style>

<style>
/* CRITICAL: Global synchronized theme transitions */
:root {
  --theme-transition: background-color 0.15s ease, 
                      color 0.15s ease, 
                      border-color 0.15s ease,
                      box-shadow 0.15s ease;
}

/* Apply synchronized transitions to all theme-sensitive elements */
.v-application,
.v-main,
.v-card,
.v-navigation-drawer,
.v-app-bar,
.v-btn,
.v-list,
.v-sheet,
.weather-card,
.sidebar,
.glass-effect {
  transition: var(--theme-transition) !important;
}

/* CRITICAL: Disable transitions during theme switch to prevent cascade */
html[data-theme-switching] * {
  transition: none !important;
  animation-duration: 0s !important;
}

/* Smooth text transitions */
.v-icon,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-body-1, .text-body-2, .text-caption {
  transition: color 0.15s ease !important;
}

/* Ensure root element transitions */
html {
  transition: background-color 0.15s ease !important;
}

html.dark {
  color-scheme: dark;
}

html:not(.dark) {
  color-scheme: light;
}
</style>
