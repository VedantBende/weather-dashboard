<template>
  <div class="weather-search" :class="{ 'weather-search--compact': variant === 'compact' }">
    <v-autocomplete
      v-model="selectedCity"
      v-model:search="searchQuery"
      :items="searchResults"
      :loading="searching"
      :placeholder="placeholder"
      variant="outlined"
      :density="density"
      :hide-details="hideDetails"
      :clearable="false"
      prepend-inner-icon="mdi-magnify"
      item-title="display_name"
      item-value="name"
      return-object
      no-filter
      auto-select-first
      hide-no-data
      class="weather-search-input"
      :menu-props="{
        maxHeight: 300,
        offset: 8,
        contentClass: 'weather-search-menu'
      }"
      @update:search="onSearchInput"
      @update:model-value="onCitySelected"
      @keydown.enter="onEnterPressed"
      @focus="onFocus"
      @blur="onBlur"
    >
      <!-- Selection slot for better display -->
      <template v-slot:selection="{ item }">
        <div class="d-flex align-center">
          <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
          {{ item.raw.name }}
        </div>
      </template>

      <!-- Enhanced item display with corrected country codes -->
      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :title="item.raw.name"
          :subtitle="`${getDisplayCountryCode(item.raw.country)}${item.raw.region ? ' • ' + item.raw.region : ''}`"
          class="search-result-item"
        >
          <template v-slot:prepend>
            <v-avatar 
              size="32" 
              class="mr-3" 
              :color="getCountryIconColor(item.raw.country)"
            >
              <v-icon color="white" size="16">mdi-map-marker</v-icon>
            </v-avatar>
          </template>
          
          <template v-slot:append>
            <div class="d-flex align-center">
              <v-icon 
                v-if="item.raw.isFavorite" 
                color="red" 
                size="small" 
                class="mr-2"
              >
                mdi-heart
              </v-icon>
              <v-btn
                icon="mdi-plus"
                size="x-small"
                variant="text"
                @click.stop="quickAddToFavorites(item.raw)"
                :disabled="item.raw.isFavorite"
              >
                <v-tooltip activator="parent" location="left">
                  Add to favorites
                </v-tooltip>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </template>
      
      <!-- Loading state -->
      <template v-slot:append-item v-if="searching">
        <div class="pa-4 text-center">
          <v-progress-circular indeterminate size="24" color="primary" />
          <div class="text-caption text-medium-emphasis mt-2">
            Searching cities...
          </div>
        </div>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { useWeatherStore } from '@/store/weather'
import { searchCities } from '@/utils/api'
import { debounce } from 'lodash'

export default {
  name: 'WeatherSearch',
  
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'compact', 'minimal'].includes(value)
    },
    placeholder: {
      type: String,
      default: 'Search for a city...'
    },
    autoFocus: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['city-selected', 'search', 'clear', 'show-snackbar'],
  
  data() {
    return {
      selectedCity: null,
      searchQuery: '',
      searchResults: [],
      searching: false,
      isFocused: false,
      searchDebounced: null
    }
  },
  
  computed: {
    weatherStore() {
      return useWeatherStore()
    },
    
    density() {
      return this.variant === 'compact' ? 'compact' : 'default'
    },
    
    hideDetails() {
      return this.variant === 'compact'
    }
  },
  
  mounted() {
    this.searchDebounced = debounce(this.performSearch, 300)
    
    if (this.autoFocus) {
      this.$nextTick(() => {
        const input = this.$el.querySelector('input')
        if (input) input.focus()
      })
    }
  },
  
  methods: {
    // Convert country codes to display codes
    getDisplayCountryCode(isoCode) {
      if (!isoCode) return ''
      
      // Country code conversion map
      const countryCodeMap = {
        'GB': 'UK',        // Great Britain -> United Kingdom
        'US': 'USA',       // United States -> USA  
        'DE': 'GER',       // Germany -> GER
        'KR': 'KOR',       // South Korea -> KOR
        'CN': 'CHN',       // China -> CHN
        'BR': 'BRA',       // Brazil -> BRA
        'IN': 'IND',       // India -> IND
        'AU': 'AUS',       // Australia -> AUS
        'CA': 'CAN',       // Canada -> CAN
        'FR': 'FRA',       // France -> FRA
        'IT': 'ITA',       // Italy -> ITA
        'ES': 'ESP',       // Spain -> ESP
        'NL': 'NLD',       // Netherlands -> NLD
        'BE': 'BEL',       // Belgium -> BEL
        'CH': 'SUI',       // Switzerland -> SUI
        'AT': 'AUT',       // Austria -> AUT
        'SE': 'SWE',       // Sweden -> SWE
        'NO': 'NOR',       // Norway -> NOR
        'DK': 'DEN',       // Denmark -> DEN
        'FI': 'FIN',       // Finland -> FIN
        'IE': 'IRL',       // Ireland -> IRL
        'PT': 'POR',       // Portugal -> POR
        'RU': 'RUS',       // Russia -> RUS
        'JP': 'JPN',       // Japan -> JPN
        'MX': 'MEX',       // Mexico -> MEX
        'AR': 'ARG',       // Argentina -> ARG
        'ZA': 'RSA',       // South Africa -> RSA
        'EG': 'EGY',       // Egypt -> EGY
        'SA': 'KSA',       // Saudi Arabia -> KSA
        'AE': 'UAE',       // United Arab Emirates -> UAE
        'TR': 'TUR',       // Turkey -> TUR
        'GR': 'GRE',       // Greece -> GRE
        'PL': 'POL',       // Poland -> POL
        'CZ': 'CZE',       // Czech Republic -> CZE
        'HU': 'HUN',       // Hungary -> HUN
        'RO': 'ROM',       // Romania -> ROM
        'BG': 'BUL',       // Bulgaria -> BUL
        'HR': 'CRO',       // Croatia -> CRO
        'RS': 'SRB',       // Serbia -> SRB
        'UA': 'UKR',       // Ukraine -> UKR
        'BY': 'BLR',       // Belarus -> BLR
        'LT': 'LTU',       // Lithuania -> LTU
        'LV': 'LAT',       // Latvia -> LAT
        'EE': 'EST',       // Estonia -> EST
        'SK': 'SVK',       // Slovakia -> SVK
        'SI': 'SVN',       // Slovenia -> SVN
        'TH': 'THA',       // Thailand -> THA
        'VN': 'VIE',       // Vietnam -> VIE
        'MY': 'MAS',       // Malaysia -> MAS
        'SG': 'SIN',       // Singapore -> SIN
        'ID': 'INA',       // Indonesia -> INA
        'PH': 'PHI',       // Philippines -> PHI
        'BD': 'BAN',       // Bangladesh -> BAN
        'PK': 'PAK',       // Pakistan -> PAK
        'LK': 'SRI',       // Sri Lanka -> SRI
        'NP': 'NEP',       // Nepal -> NEP
        'MM': 'MYA',       // Myanmar -> MYA
        'KH': 'CAM',       // Cambodia -> CAM
        'LA': 'LAO',       // Laos -> LAO
        'MN': 'MON',       // Mongolia -> MON
        'KZ': 'KAZ',       // Kazakhstan -> KAZ
        'UZ': 'UZB',       // Uzbekistan -> UZB
        'TM': 'TKM',       // Turkmenistan -> TKM
        'KG': 'KGZ',       // Kyrgyzstan -> KGZ
        'TJ': 'TJK',       // Tajikistan -> TJK
        'AF': 'AFG',       // Afghanistan -> AFG
        'IR': 'IRI',       // Iran -> IRI
        'IQ': 'IRQ',       // Iraq -> IRQ
        'SY': 'SYR',       // Syria -> SYR
        'LB': 'LIB',       // Lebanon -> LIB
        'JO': 'JOR',       // Jordan -> JOR
        'IL': 'ISR',       // Israel -> ISR
        'PS': 'PLE',       // Palestine -> PLE
        'CY': 'CYP',       // Cyprus -> CYP
        'GE': 'GEO',       // Georgia -> GEO
        'AM': 'ARM',       // Armenia -> ARM
        'AZ': 'AZE',       // Azerbaijan -> AZE
        'KW': 'KUW',       // Kuwait -> KUW
        'BH': 'BHR',       // Bahrain -> BHR
        'QA': 'QAT',       // Qatar -> QAT
        'OM': 'OMA',       // Oman -> OMA
        'YE': 'YEM',       // Yemen -> YEM
        'MA': 'MAR',       // Morocco -> MAR
        'DZ': 'ALG',       // Algeria -> ALG
        'TN': 'TUN',       // Tunisia -> TUN
        'LY': 'LBY',       // Libya -> LBY
        'SD': 'SUD',       // Sudan -> SUD
        'ET': 'ETH',       // Ethiopia -> ETH
        'KE': 'KEN',       // Kenya -> KEN
        'UG': 'UGA',       // Uganda -> UGA
        'TZ': 'TAN',       // Tanzania -> TAN
        'RW': 'RWA',       // Rwanda -> RWA
        'BI': 'BDI',       // Burundi -> BDI
        'DJ': 'DJI',       // Djibouti -> DJI
        'SO': 'SOM',       // Somalia -> SOM
        'ER': 'ERI',       // Eritrea -> ERI
        'MW': 'MAW',       // Malawi -> MAW
        'ZM': 'ZAM',       // Zambia -> ZAM
        'ZW': 'ZIM',       // Zimbabwe -> ZIM
        'BW': 'BOT',       // Botswana -> BOT
        'LS': 'LES',       // Lesotho -> LES
        'SZ': 'SWZ',       // Eswatini -> SWZ
        'MZ': 'MOZ',       // Mozambique -> MOZ
        'MG': 'MAD',       // Madagascar -> MAD
        'MU': 'MRI',       // Mauritius -> MRI
        'SC': 'SEY',       // Seychelles -> SEY
        'KM': 'COM',       // Comoros -> COM
        'CV': 'CPV',       // Cape Verde -> CPV
        'ST': 'STP',       // São Tomé and Príncipe -> STP
        'GQ': 'EQG',       // Equatorial Guinea -> EQG
        'GA': 'GAB',       // Gabon -> GAB
        'CG': 'CGO',       // Republic of the Congo -> CGO
        'CD': 'COD',       // Democratic Republic of the Congo -> COD
        'CF': 'CAF',       // Central African Republic -> CAF
        'TD': 'CHA',       // Chad -> CHA
        'CM': 'CMR',       // Cameroon -> CMR
        'NG': 'NIG',       // Nigeria -> NIG
        'NE': 'NER',       // Niger -> NER
        'BF': 'BUR',       // Burkina Faso -> BUR
        'ML': 'MLI',       // Mali -> MLI
        'SN': 'SEN',       // Senegal -> SEN
        'GW': 'GNB',       // Guinea-Bissau -> GNB
        'GN': 'GUI',       // Guinea -> GUI
        'SL': 'SLE',       // Sierra Leone -> SLE
        'LR': 'LBR',       // Liberia -> LBR
        'CI': 'CIV',       // Côte d'Ivoire -> CIV
        'GH': 'GHA',       // Ghana -> GHA
        'TG': 'TOG',       // Togo -> TOG
        'BJ': 'BEN',       // Benin -> BEN
      }
      
      // Return mapped code or original if no mapping exists
      return countryCodeMap[isoCode] || isoCode
    },

    // FIXED: Enhanced city filtering with correct country prioritization
    filterUniqueCities(cities) {
      const cityMap = new Map()
      
      // Define correct country mappings for commonly ambiguous cities
      const correctCountryMappings = {
        'delhi': 'IN',           // Delhi should be India
        'london': 'GB',          // London should be UK
        'paris': 'FR',           // Paris should be France
        'berlin': 'DE',          // Berlin should be Germany
        'milan': 'IT',           // Milan should be Italy
        'madrid': 'ES',          // Madrid should be Spain
        'rome': 'IT',            // Rome should be Italy
        'athens': 'GR',          // Athens should be Greece
        'cairo': 'EG',           // Cairo should be Egypt
        'moscow': 'RU',          // Moscow should be Russia
        'beijing': 'CN',         // Beijing should be China
        'tokyo': 'JP',           // Tokyo should be Japan
        'mumbai': 'IN',          // Mumbai should be India
        'kolkata': 'IN',         // Kolkata should be India
        'chennai': 'IN',         // Chennai should be India
        'bangalore': 'IN',       // Bangalore should be India
        'hyderabad': 'IN',       // Hyderabad should be India
        'pune': 'IN',            // Pune should be India
        'ahmedabad': 'IN',       // Ahmedabad should be India
        'surat': 'IN',           // Surat should be India
        'jaipur': 'IN',          // Jaipur should be India
        'lucknow': 'IN',         // Lucknow should be India
        'kanpur': 'IN',          // Kanpur should be India
        'nagpur': 'IN',          // Nagpur should be India
        'indore': 'IN',          // Indore should be India
        'thane': 'IN',           // Thane should be India
        'bhopal': 'IN',          // Bhopal should be India
        'visakhapatnam': 'IN',   // Visakhapatnam should be India
        'pimpri': 'IN',          // Pimpri should be India
        'patna': 'IN',           // Patna should be India
        'vadodara': 'IN',        // Vadodara should be India
        'ghaziabad': 'IN',       // Ghaziabad should be India
        'ludhiana': 'IN',        // Ludhiana should be India
        'agra': 'IN',            // Agra should be India
        'nashik': 'IN',          // Nashik should be India
        'faridabad': 'IN',       // Faridabad should be India
        'meerut': 'IN',          // Meerut should be India
        'rajkot': 'IN',          // Rajkot should be India
        'kalyan': 'IN',          // Kalyan should be India
        'vasai': 'IN',           // Vasai should be India
        'varanasi': 'IN',        // Varanasi should be India
        'srinagar': 'IN',        // Srinagar should be India
        'dhanbad': 'IN',         // Dhanbad should be India
        'jodhpur': 'IN',         // Jodhpur should be India
        'amritsar': 'IN',        // Amritsar should be India
        'raipur': 'IN',          // Raipur should be India
        'allahabad': 'IN',       // Allahabad should be India
        'coimbatore': 'IN',      // Coimbatore should be India
        'jabalpur': 'IN',        // Jabalpur should be India
        'gwalior': 'IN',         // Gwalior should be India
        'vijayawada': 'IN',      // Vijayawada should be India
        'madurai': 'IN',         // Madurai should be India
        'guwahati': 'IN',        // Guwahati should be India
        'chandigarh': 'IN',      // Chandigarh should be India
        'hubli': 'IN',           // Hubli should be India
        'mysore': 'IN',          // Mysore should be India
        'tiruchirappalli': 'IN', // Tiruchirappalli should be India
        'bareilly': 'IN',        // Bareilly should be India
        'aligarh': 'IN',         // Aligarh should be India
        'salem': 'IN',           // Salem should be India
        'mira': 'IN',            // Mira should be India
        'bhiwandi': 'IN',        // Bhiwandi should be India
        'saharanpur': 'IN',      // Saharanpur should be India
        'gorakhpur': 'IN',       // Gorakhpur should be India
        'bikaner': 'IN',         // Bikaner should be India
        'amravati': 'IN',        // Amravati should be India
        'noida': 'IN',           // Noida should be India
        'jamshedpur': 'IN',      // Jamshedpur should be India
        'bhilai': 'IN',          // Bhilai should be India
        'cuttack': 'IN',         // Cuttack should be India
        'firozabad': 'IN',       // Firozabad should be India
        'kochi': 'IN',           // Kochi should be India
        'nellore': 'IN',         // Nellore should be India
        'bhavnagar': 'IN',       // Bhavnagar should be India
        'dehradun': 'IN',        // Dehradun should be India
        'durgapur': 'IN',        // Durgapur should be India
        'asansol': 'IN',         // Asansol should be India
        'rourkela': 'IN',        // Rourkela should be India
        'nanded': 'IN',          // Nanded should be India
        'kolhapur': 'IN',        // Kolhapur should be India
        'ajmer': 'IN',           // Ajmer should be India
        'akola': 'IN',           // Akola should be India
        'gulbarga': 'IN',        // Gulbarga should be India
        'jamnagar': 'IN',        // Jamnagar should be India
        'ujjain': 'IN',          // Ujjain should be India
        'loni': 'IN',            // Loni should be India
        'siliguri': 'IN',        // Siliguri should be India
        'jhansi': 'IN',          // Jhansi should be India
        'ulhasnagar': 'IN',      // Ulhasnagar should be India
        'jammu': 'IN',           // Jammu should be India
        'sangli': 'IN',          // Sangli should be India
        'mangalore': 'IN',       // Mangalore should be India
        'erode': 'IN',           // Erode should be India
        'belgaum': 'IN',         // Belgaum should be India
        'ambattur': 'IN',        // Ambattur should be India
        'tirunelveli': 'IN',     // Tirunelveli should be India
        'malegaon': 'IN',        // Malegaon should be India
        'gaya': 'IN',            // Gaya should be India
        'jalgaon': 'IN',         // Jalgaon should be India
        'udaipur': 'IN',         // Udaipur should be India
        'maheshtala': 'IN',      // Maheshtala should be India
        'davanagere': 'IN',      // Davanagere should be India
        'kozhikode': 'IN',       // Kozhikode should be India
        'kurnool': 'IN',         // Kurnool should be India
        'rajpur': 'IN',          // Rajpur should be India
        'sitapur': 'IN',         // Sitapur should be India
        'new york': 'US',        // New York should be USA
        'los angeles': 'US',     // Los Angeles should be USA
        'chicago': 'US',         // Chicago should be USA
        'houston': 'US',         // Houston should be USA
        'phoenix': 'US',         // Phoenix should be USA
        'philadelphia': 'US',    // Philadelphia should be USA
        'san antonio': 'US',     // San Antonio should be USA
        'san diego': 'US',       // San Diego should be USA
        'dallas': 'US',          // Dallas should be USA
        'san jose': 'US',        // San Jose should be USA
        'austin': 'US',          // Austin should be USA
        'jacksonville': 'US',    // Jacksonville should be USA
        'san francisco': 'US',   // San Francisco should be USA
        'columbus': 'US',        // Columbus should be USA
        'fort worth': 'US',      // Fort Worth should be USA
        'indianapolis': 'US',    // Indianapolis should be USA
        'charlotte': 'US',       // Charlotte should be USA
        'seattle': 'US',         // Seattle should be USA
        'denver': 'US',          // Denver should be USA
        'washington': 'US',      // Washington should be USA
        'boston': 'US',          // Boston should be USA
        'el paso': 'US',         // El Paso should be USA
        'detroit': 'US',         // Detroit should be USA
        'nashville': 'US',       // Nashville should be USA
        'portland': 'US',        // Portland should be USA
        'memphis': 'US',         // Memphis should be USA
        'oklahoma city': 'US',   // Oklahoma City should be USA
        'las vegas': 'US',       // Las Vegas should be USA
        'louisville': 'US',      // Louisville should be USA
        'baltimore': 'US',       // Baltimore should be USA
        'milwaukee': 'US',       // Milwaukee should be USA
        'albuquerque': 'US',     // Albuquerque should be USA
        'tucson': 'US',          // Tucson should be USA
        'fresno': 'US',          // Fresno should be USA
        'mesa': 'US',            // Mesa should be USA
        'sacramento': 'US',      // Sacramento should be USA
        'atlanta': 'US',         // Atlanta should be USA
        'kansas city': 'US',     // Kansas City should be USA
        'colorado springs': 'US', // Colorado Springs should be USA
        'miami': 'US',           // Miami should be USA
        'raleigh': 'US',         // Raleigh should be USA
        'omaha': 'US',           // Omaha should be USA
        'long beach': 'US',      // Long Beach should be USA
        'virginia beach': 'US',  // Virginia Beach should be USA
        'oakland': 'US',         // Oakland should be USA
        'minneapolis': 'US',     // Minneapolis should be USA
        'tulsa': 'US',           // Tulsa should be USA
        'arlington': 'US',       // Arlington should be USA
        'tampa': 'US',           // Tampa should be USA
        'new orleans': 'US',     // New Orleans should be USA
        'wichita': 'US',         // Wichita should be USA
        'cleveland': 'US',       // Cleveland should be USA
        'bakersfield': 'US',     // Bakersfield should be USA
        'toronto': 'CA',         // Toronto should be Canada
        'montreal': 'CA',        // Montreal should be Canada
        'vancouver': 'CA',       // Vancouver should be Canada
        'calgary': 'CA',         // Calgary should be Canada
        'edmonton': 'CA',        // Edmonton should be Canada
        'ottawa': 'CA',          // Ottawa should be Canada
        'winnipeg': 'CA',        // Winnipeg should be Canada
        'quebec city': 'CA',     // Quebec City should be Canada
        'hamilton': 'CA',        // Hamilton should be Canada
        'kitchener': 'CA',       // Kitchener should be Canada
        'sydney': 'AU',          // Sydney should be Australia
        'melbourne': 'AU',       // Melbourne should be Australia
        'brisbane': 'AU',        // Brisbane should be Australia
        'perth': 'AU',           // Perth should be Australia
        'adelaide': 'AU',        // Adelaide should be Australia
        'gold coast': 'AU',      // Gold Coast should be Australia
        'newcastle': 'AU',       // Newcastle should be Australia
        'canberra': 'AU',        // Canberra should be Australia
        'sunshine coast': 'AU',  // Sunshine Coast should be Australia
        'wollongong': 'AU',      // Wollongong should be Australia
      }
      
      // Priority countries (major countries get preference)
      const priorityCountries = ['GB', 'US', 'FR', 'DE', 'IT', 'ES', 'CA', 'AU', 'JP', 'CN', 'IN', 'BR', 'RU', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI']
      
      // Sort cities to prioritize by relevance
      const sortedCities = cities.sort((a, b) => {
        const countryA = a.sys?.country || a.country
        const countryB = b.sys?.country || b.country
        const nameA = a.name.toLowerCase().trim()
        const nameB = b.name.toLowerCase().trim()
        
        // Check if this city has a correct country mapping
        const correctCountryA = correctCountryMappings[nameA]
        const correctCountryB = correctCountryMappings[nameB]
        
        // Prioritize cities with correct country codes
        if (correctCountryA && countryA === correctCountryA && (!correctCountryB || countryB !== correctCountryB)) {
          return -1
        }
        if (correctCountryB && countryB === correctCountryB && (!correctCountryA || countryA !== correctCountryA)) {
          return 1
        }
        
        // Both have correct countries or neither do, check priority countries
        const priorityA = priorityCountries.indexOf(countryA)
        const priorityB = priorityCountries.indexOf(countryB)
        
        if (priorityA !== -1 && priorityB === -1) return -1
        if (priorityA === -1 && priorityB !== -1) return 1
        if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB
        
        // Prioritize by population if available
        const popA = a.population || 0
        const popB = b.population || 0
        if (popA !== popB) return popB - popA
        
        return 0
      })
      
      // Keep only the first (most relevant) city for each name
      for (const city of sortedCities) {
        const cityName = city.name.toLowerCase().trim()
        
        if (!cityMap.has(cityName)) {
          cityMap.set(cityName, city)
        }
      }
      
      return Array.from(cityMap.values())
    },
    
    onSearchInput(value) {
      this.searchQuery = value
      this.$emit('search', value)
      
      if (value && value.length >= 2) {
        this.searchDebounced(value)
      } else {
        this.searchResults = []
        this.searching = false
      }
    },
    
    async performSearch(query) {
      if (!query || query.length < 2) return
      
      this.searching = true
      
      try {
        const results = await searchCities(query)
        
        // Filter out duplicates and keep only most relevant cities with correct countries
        const uniqueCities = this.filterUniqueCities(results)
        
        this.searchResults = uniqueCities.map(city => ({
          name: city.name,
          country: city.sys?.country || city.country,
          region: city.state || city.region,
          coord: city.coord,
          display_name: city.name,
          isFavorite: this.weatherStore.isFavorite(city.name),
          population: city.population || 0,
          id: `${city.name}_${city.sys?.country || city.country}` // Unique identifier
        })).slice(0, 6) // Limit to 6 results for better UX
        
      } catch (error) {
        console.error('Search failed:', error)
        this.searchResults = []
      } finally {
        this.searching = false
      }
    },
    
    onCitySelected(city) {
      if (!city) return
      
      this.selectedCity = city
      this.searchQuery = city.name
      
      // Add to search history if weatherStore has this method
      try {
        this.weatherStore?.addToSearchHistory?.(city.name)
      } catch (error) {
        console.warn('Failed to add to search history:', error)
      }
      
      this.$emit('city-selected', city)
      
      this.$nextTick(() => {
        this.selectedCity = null
        this.searchQuery = ''
        this.searchResults = []
      })
    },
    
    onEnterPressed() {
      if (this.searchQuery && this.searchQuery.length >= 2) {
        if (this.searchResults.length > 0) {
          // Select the first result
          this.onCitySelected(this.searchResults[0])
        } else {
          // Search directly for the typed city name
          this.searchDirectly()
        }
      }
    },
    
    searchDirectly() {
      const directCity = {
        name: this.searchQuery,
        display_name: this.searchQuery,
        country: null,
        region: null,
        coord: null,
        isFavorite: false,
        population: 0,
        id: `${this.searchQuery}_direct`
      }
      this.onCitySelected(directCity)
    },
    
    onClear() {
      this.selectedCity = null
      this.searchQuery = ''
      this.searchResults = []
      this.searching = false
      this.$emit('clear')
    },
    
    onFocus() {
      this.isFocused = true
    },
    
    onBlur() {
      this.isFocused = false
    },
    
    async quickAddToFavorites(city) {
      try {
        const weatherData = { 
          name: city.name, 
          sys: { country: city.country } 
        }
        
        // Add to favorites if weatherStore has this method
        this.weatherStore?.addToFavorites?.(weatherData)
        
        // Update the local state
        const resultIndex = this.searchResults.findIndex(result => result.id === city.id)
        if (resultIndex !== -1) {
          this.searchResults[resultIndex].isFavorite = true
        }
        
        // Show success message
        this.$emit('show-snackbar', {
          message: `${city.name} added to favorites`,
          color: 'success'
        })
        
      } catch (error) {
        console.error('Failed to add to favorites:', error)
        this.$emit('show-snackbar', {
          message: 'Failed to add to favorites',
          color: 'error'
        })
      }
    },
    
    getCountryIconColor(country) {
      const colors = {
        'US': 'blue', 'GB': 'red', 'FR': 'blue', 'DE': 'amber',
        'JP': 'red', 'AU': 'green', 'CA': 'red', 'IN': 'orange',
        'CN': 'red', 'BR': 'green', 'RU': 'red', 'IT': 'green',
        'ES': 'orange', 'NL': 'orange', 'BE': 'amber', 'CH': 'red',
        'AT': 'red', 'SE': 'blue', 'NO': 'blue', 'DK': 'red',
        'FI': 'blue', 'IE': 'green', 'PT': 'green', 'KR': 'red',
        'TH': 'red', 'VN': 'red', 'MY': 'blue', 'SG': 'red',
        'ID': 'red', 'PH': 'blue', 'BD': 'green', 'PK': 'green'
      }
      return colors[country] || 'primary'
    }
  }
}
</script>

<style scoped>
.weather-search {
  position: relative;
  width: 100%;
}

.weather-search--compact {
  max-width: 350px;
}

/* ENSURE MINIMUM WIDTH FOR FULL TEXT DISPLAY */
.weather-search-input {
  width: 100%;
  min-width: 320px !important; /* Increased to ensure full placeholder text shows */
  flex-grow: 1 !important;
}

/* FORCE PROPER SIZING AND VISIBILITY */
.weather-search-input :deep(.v-field) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
  width: 100% !important;
  border-radius: 12px !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 2px solid rgba(var(--v-border-color), 0.23) !important;
  transform: none !important;
  transition: border-color 0.3s ease !important;
}

/* OPTIMIZED INPUT CONTAINER - MORE SPACE FOR TEXT */
.weather-search-input :deep(.v-field__input) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
  display: flex !important;
  align-items: center !important;
  /* OPTIMIZED PADDING - More space for text, less for icons */
  padding: 0 16px 0 8px !important;
  background-color: transparent !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  flex: 1 1 auto !important;
  overflow: visible !important;
}

/* ENSURE INPUT TEXT TAKES MAXIMUM AVAILABLE SPACE */
.weather-search-input :deep(.v-field__input input) {
  height: 100% !important;
  background-color: transparent !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  width: 100% !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  
  /* PREVENT TEXT FROM BEING HIDDEN */
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  
  /* REMOVE BROWSER DEFAULTS */
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}

/* PLACEHOLDER SHOULD SHOW FULLY */
.weather-search-input :deep(.v-field__input input::placeholder) {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  overflow: hidden !important;
}

/* OPTIMIZE ICON POSITIONING - COMPACT ICONS */
.weather-search-input :deep(.v-field__prepend-inner) {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  padding-right: 8px !important;
  padding-left: 12px !important;
  margin-right: 0 !important;
  flex-shrink: 0 !important;
}

/* COMPACT APPEND ICONS (dropdown arrow, clear button) */
.weather-search-input :deep(.v-field__append-inner) {
  padding-left: 4px !important;
  padding-right: 12px !important;
  margin-left: 0 !important;
  flex-shrink: 0 !important;
  gap: 4px !important;
}

/* MAKE DROPDOWN ARROW SMALLER */
.weather-search-input :deep(.v-autocomplete__menu-icon) {
  font-size: 18px !important;
  width: 18px !important;
  height: 18px !important;
}

/* HIDE CLEAR BUTTON COMPLETELY */
.weather-search-input :deep(.v-field__clearable) {
  display: none !important;
}

/* COMPLETELY REMOVE ALL BROWSER FOCUS OUTLINES AND RINGS */
.weather-search-input,
.weather-search-input *,
.weather-search-input :deep(*),
.weather-search-input :deep(.v-field),
.weather-search-input :deep(.v-field *),
.weather-search-input :deep(.v-field:focus),
.weather-search-input :deep(.v-field:focus-within),
.weather-search-input :deep(.v-field--focused),
.weather-search-input :deep(.v-autocomplete),
.weather-search-input :deep(.v-autocomplete:focus),
.weather-search-input :deep(.v-autocomplete:focus-within),
.weather-search-input :deep(.v-input),
.weather-search-input :deep(.v-input:focus),
.weather-search-input :deep(.v-input:focus-within),
.weather-search-input :deep(input),
.weather-search-input :deep(input:focus),
.weather-search-input :deep(input:focus-within) {
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
  outline-color: transparent !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  border-color: rgba(var(--v-border-color), 0.23) !important;
}

/* WEBKIT/CHROME SPECIFIC FOCUS RING REMOVAL */
.weather-search-input :deep(*):focus {
  -webkit-focus-ring-color: transparent !important;
  outline: none !important;
}

/* FIREFOX SPECIFIC FOCUS OUTLINE REMOVAL */
.weather-search-input :deep(*)::-moz-focus-inner {
  border: 0 !important;
  outline: none !important;
}

/* REMOVE ANY POTENTIAL DOUBLE BORDERS */
.weather-search-input :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
  outline: none !important;
  box-shadow: none !important;
}

/* DARK MODE SPECIFIC FIXES */
.v-theme--dark .weather-search-input :deep(.v-field) {
  background-color: rgb(var(--v-theme-surface)) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.23) !important;
}

.v-theme--dark .weather-search-input :deep(.v-field__input),
.v-theme--dark .weather-search-input :deep(.v-field__input input) {
  color: rgb(var(--v-theme-on-surface)) !important;
  background-color: transparent !important;
}

.v-theme--dark .weather-search-input :deep(.v-field__input input::placeholder) {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

/* LIGHT MODE SPECIFIC FIXES */
.v-theme--light .weather-search-input :deep(.v-field) {
  background-color: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.23) !important;
}

.v-theme--light .weather-search-input :deep(.v-field__input),
.v-theme--light .weather-search-input :deep(.v-field__input input) {
  color: rgba(0, 0, 0, 0.87) !important;
  background-color: transparent !important;
}

.v-theme--light .weather-search-input :deep(.v-field__input input::placeholder) {
  color: rgba(0, 0, 0, 0.6) !important;
}

/* FOCUS ANIMATION */
.weather-search-input :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

.weather-search-input :deep(.v-field--focused .v-field__outline) {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

/* HOVER EFFECT */
.weather-search-input :deep(.v-field:hover:not(.v-field--focused)) {
  border-color: rgba(var(--v-theme-primary), 0.7) !important;
}

/* Menu styling */
:deep(.weather-search-menu) {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(var(--v-border-color), 0.12) !important;
  backdrop-filter: blur(10px) !important;
  margin-top: 4px !important;
}

.v-theme--dark :deep(.weather-search-menu) {
  background-color: rgb(var(--v-theme-surface)) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
}

/* Search result items */
.search-result-item {
  transition: all 0.2s ease !important;
  border-radius: 8px !important;
  margin: 4px 8px !important;
}

.search-result-item:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateX(4px) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .weather-search--compact {
    max-width: 100%;
  }
  
  .weather-search-input {
    min-width: 280px !important;
  }
}

@media (max-width: 480px) {
  .weather-search-input {
    min-width: 260px !important;
  }
  
  .weather-search-input :deep(.v-field) {
    min-height: 48px !important;
    max-height: 48px !important;
    height: 48px !important;
  }
  
  .weather-search-input :deep(.v-field__input) {
    min-height: 48px !important;
    max-height: 48px !important;
    height: 48px !important;
    padding: 0 12px 0 8px !important;
  }
  
  .weather-search-input :deep(.v-field__prepend-inner) {
    padding-left: 8px !important;
    padding-right: 6px !important;
  }
  
  .weather-search-input :deep(.v-field__append-inner) {
    padding-right: 8px !important;
  }
}
</style>
