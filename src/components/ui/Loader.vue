<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <!-- Spinner -->
      <div 
        v-if="type === 'spinner'"
        class="animate-spin rounded-full border-t-2 border-b-2"
        :class="[sizeClass, colorClass]"
      ></div>
      
      <!-- Pulse -->
      <div 
        v-else-if="type === 'pulse'"
        class="animate-pulse rounded-full"
        :class="[sizeClass, pulseColorClass]"
      ></div>
      
      <!-- Dots -->
      <div v-else-if="type === 'dots'" class="flex space-x-2">
        <div 
          v-for="i in 3" 
          :key="i"
          class="animate-bounce rounded-full"
          :class="[dotSizeClass, colorClass]"
          :style="{ animationDelay: `${i * 0.1}s` }"
        ></div>
      </div>
      
      <!-- Weather animation -->
      <div v-else-if="type === 'weather'" class="relative">
        <div class="animate-weather-float">
          <svg 
            class="w-12 h-12 text-blue-500" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M6.08 15C4.93 15 4 14.07 4 12.92c0-.8.46-1.53 1.15-1.85-.08-.33-.15-.66-.15-1.07 0-2.76 2.24-5 5-5 2.05 0 3.81 1.24 4.58 3.01.25-.04.52-.06.77-.06 2.21 0 4 1.79 4 4 0 1.29-.62 2.44-1.58 3.16-.36.24-.8.39-1.27.39H6.08z"/>
          </svg>
        </div>
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div class="flex space-x-1">
            <div class="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading text -->
    <p v-if="text" class="ml-3 text-sm font-medium" :class="textColorClass">
      {{ text }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'Loader',
  props: {
    type: {
      type: String,
      default: 'spinner',
      validator: (value) => ['spinner', 'pulse', 'dots', 'weather'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    color: {
      type: String,
      default: 'primary'
    },
    text: {
      type: String,
      default: ''
    },
    fullScreen: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerClass() {
      return this.fullScreen 
        ? 'fixed inset-0 bg-black bg-opacity-50 z-50' 
        : 'p-4'
    },
    
    sizeClass() {
      const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
      }
      return sizes[this.size]
    },
    
    dotSizeClass() {
      const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
        xl: 'w-5 h-5'
      }
      return sizes[this.size]
    },
    
    colorClass() {
      const colors = {
        primary: 'border-primary-500',
        secondary: 'border-secondary-500',
        white: 'border-white',
        blue: 'border-blue-500',
        green: 'border-green-500',
        yellow: 'border-yellow-500',
        red: 'border-red-500'
      }
      return colors[this.color] || 'border-primary-500'
    },
    
    pulseColorClass() {
      const colors = {
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
        white: 'bg-white',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500'
      }
      return colors[this.color] || 'bg-primary-500'
    },
    
    textColorClass() {
      return this.fullScreen ? 'text-white' : 'text-gray-600 dark:text-gray-300'
    }
  }
}
</script>

<style scoped>
@keyframes weather-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-weather-float {
  animation: weather-float 2s ease-in-out infinite;
}
</style>
