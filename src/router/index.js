import { createRouter, createWebHistory } from 'vue-router'
import { useWeatherStore } from '@/store/weather'

// Layout
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Pages
import DashboardPage from '@/pages/DashboardPage.vue'
import FavoritesPage from '@/pages/FavoritesPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'

// Route definitions
const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        meta: {
          title: 'Weather Dashboard',
          description: 'Current weather conditions and forecast',
          icon: 'mdi-view-dashboard',
          requiresData: true
        }
      },
      {
        path: '/favorites',
        name: 'Favorites',
        component: FavoritesPage,
        meta: {
          title: 'Favorite Cities',
          description: 'Your saved locations and their weather',
          icon: 'mdi-heart',
          requiresData: false
        }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: SettingsPage,
        meta: {
          title: 'Settings',
          description: 'App preferences and configuration',
          icon: 'mdi-cog',
          requiresData: false
        }
      }
    ]
  },
  // Catch-all route for 404s
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard'
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Return to saved position if available (browser back/forward)
    if (savedPosition) {
      return savedPosition
    }
    
    // Scroll to anchor if present
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // Scroll to top for new routes
    return { top: 0, behavior: 'smooth' }
  }
})

// Global navigation guards
router.beforeEach(async (to, from, next) => {
  const weatherStore = useWeatherStore()
  
  // Update document title
  if (to.meta?.title) {
    document.title = `${to.meta.title} | Weather Dashboard`
  } else {
    document.title = 'Weather Dashboard'
  }
  
  // Update meta description
  if (to.meta?.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }
    metaDescription.content = to.meta.description
  }
  
  // Check if route requires weather data
  if (to.meta?.requiresData && !weatherStore.currentWeather && !weatherStore.loading) {
    try {
      // Try to load weather data if not available
      await weatherStore.fetchWeatherByLocation()
    } catch (error) {
      // If location fails, try with a default city
      try {
        await weatherStore.fetchWeatherByCity('London')
      } catch (fallbackError) {
        console.error('Failed to load any weather data:', fallbackError)
      }
    }
  }
  
  // Analytics tracking (if implemented)
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: to.meta?.title || to.name,
      page_location: window.location.href
    })
  }
  
  // Clear any previous errors when navigating
  if (weatherStore.error && to.name !== from.name) {
    weatherStore.clearError()
  }
  
  next()
})

router.afterEach((to, from) => {
  // Update favorites last viewed if coming from dashboard
  if (from.name === 'Dashboard' && to.name === 'Favorites') {
    const weatherStore = useWeatherStore()
    if (weatherStore.currentWeather) {
      weatherStore.updateFavoriteLastViewed(weatherStore.currentWeather.name)
    }
  }
  
  // Log navigation for debugging in development
  if (import.meta.env.DEV) {
    console.log(`Navigation: ${from.name || 'Unknown'} -> ${to.name || 'Unknown'}`)
  }
})

// Error handling for navigation failures
router.onError((error) => {
  console.error('Router error:', error)
  
  // Navigate to dashboard if there's a routing error
  if (router.currentRoute.value.name !== 'Dashboard') {
    router.push('/dashboard')
  }
})

// Export router instance
export default router

// Export route names for JavaScript (without TypeScript const assertion)
export const RouteNames = {
  DASHBOARD: 'Dashboard',
  FAVORITES: 'Favorites',
  SETTINGS: 'Settings'
}

// Helper function to navigate with error handling
export const navigateTo = async (routeName, params = {}) => {
  try {
    await router.push({ name: routeName, params })
  } catch (error) {
    console.error(`Navigation to ${routeName} failed:`, error)
    // Fallback to dashboard
    await router.push('/dashboard')
  }
}

// Helper function to check if route is active
export const isRouteActive = (routeName) => {
  return router.currentRoute.value.name === routeName
}
