<template>
  <div 
    class="rounded-lg p-4 mb-4 border-l-4 transition-all duration-300"
    :class="[typeClasses, { 'animate-slide-down': show }]"
    v-if="show"
  >
    <div class="flex items-start">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <v-icon 
          :icon="iconName" 
          :class="iconClasses"
          size="20"
        />
      </div>
      
      <!-- Content -->
      <div class="ml-3 flex-1">
        <h3 v-if="title" class="text-sm font-medium" :class="titleClasses">
          {{ title }}
        </h3>
        
        <div class="text-sm" :class="messageClasses">
          <p v-if="typeof message === 'string'">{{ message }}</p>
          <ul v-else-if="Array.isArray(message)" class="list-disc list-inside space-y-1">
            <li v-for="(msg, index) in message" :key="index">{{ msg }}</li>
          </ul>
        </div>
        
        <!-- Actions -->
        <div v-if="showRetry || showDismiss" class="mt-3 flex space-x-2">
          <button
            v-if="showRetry"
            @click="$emit('retry')"
            class="text-xs font-medium px-3 py-1 rounded transition-colors"
            :class="retryButtonClasses"
          >
            Try Again
          </button>
          
          <button
            v-if="showDismiss"
            @click="dismiss"
            class="text-xs font-medium px-3 py-1 rounded transition-colors"
            :class="dismissButtonClasses"
          >
            Dismiss
          </button>
        </div>
      </div>
      
      <!-- Close button -->
      <div v-if="dismissible" class="flex-shrink-0">
        <button
          @click="dismiss"
          class="rounded-md p-1.5 transition-colors"
          :class="closeButtonClasses"
        >
          <v-icon icon="mdi-close" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    type: {
      type: String,
      default: 'error',
      validator: (value) => ['error', 'warning', 'info', 'success'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: [String, Array],
      required: true
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    showRetry: {
      type: Boolean,
      default: false
    },
    showDismiss: {
      type: Boolean,
      default: false
    },
    autoHide: {
      type: [Boolean, Number],
      default: false
    }
  },
  
  emits: ['dismiss', 'retry'],
  
  data() {
    return {
      show: true,
      autoHideTimer: null
    }
  },
  
  computed: {
    typeClasses() {
      const classes = {
        error: 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600',
        warning: 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-600',
        info: 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-600',
        success: 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-600'
      }
      return classes[this.type]
    },
    
    iconName() {
      const icons = {
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information',
        success: 'mdi-check-circle'
      }
      return icons[this.type]
    },
    
    iconClasses() {
      const classes = {
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400',
        success: 'text-green-400'
      }
      return classes[this.type]
    },
    
    titleClasses() {
      const classes = {
        error: 'text-red-800 dark:text-red-200',
        warning: 'text-yellow-800 dark:text-yellow-200',
        info: 'text-blue-800 dark:text-blue-200',
        success: 'text-green-800 dark:text-green-200'
      }
      return classes[this.type]
    },
    
    messageClasses() {
      const classes = {
        error: 'text-red-700 dark:text-red-300',
        warning: 'text-yellow-700 dark:text-yellow-300',
        info: 'text-blue-700 dark:text-blue-300',
        success: 'text-green-700 dark:text-green-300'
      }
      return classes[this.type]
    },
    
    retryButtonClasses() {
      const classes = {
        error: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700',
        info: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700',
        success: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700'
      }
      return classes[this.type]
    },
    
    dismissButtonClasses() {
      const classes = {
        error: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
        warning: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
        info: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
        success: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
      }
      return classes[this.type]
    },
    
    closeButtonClasses() {
      const classes = {
        error: 'text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-800',
        warning: 'text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-800',
        info: 'text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800',
        success: 'text-green-400 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-800'
      }
      return classes[this.type]
    }
  },
  
  mounted() {
    if (this.autoHide) {
      const delay = typeof this.autoHide === 'number' ? this.autoHide : 5000
      this.autoHideTimer = setTimeout(() => {
        this.dismiss()
      }, delay)
    }
  },
  
  beforeUnmount() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer)
    }
  },
  
  methods: {
    dismiss() {
      this.show = false
      this.$emit('dismiss')
      
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer)
      }
    }
  }
}
</script>

<style scoped>
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
</style>
