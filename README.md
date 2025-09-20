# 🌦️ Weather Dashboard

A **fast**, **installable**, and **user-friendly** weather application that provides real-time conditions, forecasts, saved favorites, and a smooth experience across all devices.

---

## 🚀 Vision & Goals

**🎯 Purpose:**
Deliver a quick, reliable, and accessible way to check weather conditions, forecasts, and manage favorite locations.

**👥 Target Users:**

* 🌍 Individuals who regularly check weather updates.
* ⭐ Users who prefer storing frequently accessed locations.
* 🎨 Users who want customizable themes and accessibility options.

**📌 Success Criteria:**

* ⚡ Sub-second interactions.
* 📲 Fully installable as a Progressive Web App (PWA).
* ♿ Accessible user interface (WCAG compliance).
* 🛡️ Resilient error handling for network and API failures.

---

## 🛠️ Tech Stack

* 🖥️ **Frontend Framework:** Vue 3 + Vite
* 📦 **State Management:** Pinia
* 🎨 **UI Libraries:** Vuetify + Tailwind CSS
* 🧪 **Testing:** Vitest (unit) + Playwright (end-to-end)
* ⚙️ **Build & Deployment:** Vite + static hosting (SPA fallback)
* 📲 **PWA Support:** Workbox + Web App Manifest

---

## 📂 Project Structure

```
weather-dashboard/                  # 📁 Project root
│
├── .git/                           # 🔧 Git repo config
├── .vscode/                        # 📝 VSCode workspace settings
├── dist/                           # 📦 Production build
├── e2e/                            # 🧪 End-to-end tests
│   ├── tsconfig.json
│   └── vue.spec.ts
├── node_modules/                   # 📚 Dependencies
│
├── public/                         # 🌍 Public assets (served as-is)
│   ├── favicon.ico
│   └── logo.svg
│
├── src/                            # 🖥️ Source code
│   ├── __tests__/                  # 🧪 Unit tests
│   │   └── App.spec.ts
│   │
│   ├── assets/                     # 🎨 Images, icons, static media
│   │   ├── bg/                     # 🏞️ Background images
│   │   │   ├── clear.jpg
│   │   │   ├── cloudy.jpg
│   │   │   └── rainy.jpg
│   │   ├── weather-icons/          # ☁️ Weather SVG icons
│   │   │   ├── cloudy.svg
│   │   │   ├── rainy.svg
│   │   │   ├── snowy.svg
│   │   │   └── sunny.svg
│   │   └── logo.svg
│   │
│   ├── components/                 # ⚛️ Reusable Vue components
│   │   ├── common/                 # 🔄 Layout/UI essentials
│   │   │   ├── DarkModeToggle.vue
│   │   │   ├── Footer.vue
│   │   │   ├── Navbar.vue
│   │   │   └── Sidebar.vue
│   │   ├── ui/                     # 🎛️ UI helpers
│   │   │   ├── ErrorMessage.vue
│   │   │   └── Loader.vue
│   │   ├── weather/                # 🌤️ Weather-specific components
│   │   │   ├── WeatherCard.vue
│   │   │   ├── WeatherChart.vue
│   │   │   ├── WeatherDetails.vue
│   │   │   └── WeatherSearch.vue
│   │   └── AirQuality.vue
│   │
│   ├── layouts/                    # 🏗️ Page layouts
│   │   └── DashboardLayout.vue
│   │
│   ├── pages/                      # 📄 Router pages
│   │   ├── DashboardPage.vue
│   │   ├── FavoritesPage.vue
│   │   └── SettingsPage.vue
│   │
│   ├── router/                     # 🛣️ Vue Router setup
│   │   ├── index.js
│   │   └── index.ts
│   │
│   ├── store/                      # 🗃️ Vuex/Pinia (JS store)
│   │   └── weather.js
│   ├── stores/                     # 🗂️ Pinia (TS store)
│   │   └── counter.ts
│   │
│   ├── styles/                     # 🎨 Global styles
│   │   └── globals.css
│   │
│   ├── utils/                      # 🛠️ Helpers & utilities
│   │   ├── api.js                  # 🌐 API calls
│   │   ├── formatters.js           # 🔢 Data formatting
│   │   └── geolocation.js          # 📍 Geolocation utilities
│   │
│   ├── App.vue                     # 🌟 Root Vue component
│   ├── main.js                     # 🚀 JS entry point
│   ├── main.ts                     # 🚀 TS entry point
│   └── vue-shims.d.ts              # 📝 TS shims
│
├── .editorconfig                   # ✏️ Editor settings
├── .env                            # 🔐 Env vars (dev)
├── .env.production                 # 🔐 Env vars (prod)
├── .gitattributes                  # 🔧 Git attributes
├── .gitignore                      # 🚫 Git ignore rules
├── .prettierrc.json                # 🎨 Prettier config
├── CNAME                           # 🌐 Custom domain
├── README.md                       # 📖 Project docs
├── env.d.ts                        # 📝 TS env typing
├── eslint.config.ts                # 🚨 ESLint config
├── index.html                      # 🏠 App entry HTML
├── package-lock.json               # 📦 Lockfile
├── package.json                    # 📦 Project dependencies
├── playwright.config.ts            # 🎭 Playwright config
├── postcss.config.cjs              # 🎨 PostCSS config
├── tailwind.config.js              # 🎨 TailwindCSS config
├── tsconfig.*.json                 # ⚙️ TypeScript configs
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── tsconfig.vitest.json
├── vite.config.ts                  # ⚡ Vite config
└── vitest.config.ts                # 🧪 Vitest config

```

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed:

* 🖥️ **Git** → [Download Git](https://git-scm.com/)
* 🟢 **Node.js (>=18.x)** → [Download Node.js](https://nodejs.org/)
* 📦 **npm (comes with Node.js)** → Check with:

  ```bash
  node -v
  npm -v
  ```
* 🔑 **OpenWeatherMap API Key** → [Get your free API key](https://openweathermap.org/api)

---

## 🏁 Getting Started

Follow these steps to set up the project on your local machine:

### 1️⃣ Clone the Repository

```bash
# Clone the repository from GitHub
git clone https://github.com/your-username/weather-dashboard.git

# Move into the project directory
cd weather-dashboard
```

👉 If you forked the project, replace `your-username` with your GitHub username.

---

### 2️⃣ Install Dependencies

Install required packages:

```bash
npm install
```

---

### 3️⃣ Configure Environment Variables

1. Copy the provided `.env.example` file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor and add your API key:

   ```bash
   VITE_WEATHER_API_KEY=your_api_key_here
   ```

---

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Then open 👉 `http://localhost:5173` in your browser.

---

### 5️⃣ Build for Production

```bash
npm run build
npm run preview
```

Your app will be served at 👉 `http://localhost:4173`.

---

## 🤝 Contributing

* 🍴 Fork the repository
* 🌿 Create a feature branch

  ```bash
  git checkout -b feature/my-feature
  ```
* 💾 Commit your changes

  ```bash
  git commit -m "Add feature"
  ```
* 🚀 Push your branch

  ```bash
  git push origin feature/my-feature
  ```
* 🔄 Open a Pull Request

---

## 📄 License

📝 Licensed under the **MIT License**.

---

## ✅ Release Checklist

* 🔑 API key & environment variables configured
* 📦 Build size within limits
* 🔄 SPA redirects functional on host
* ♿ Accessibility verified
* 📲 PWA manifest & service worker validated
* ⭐ Favorites & preferences persist across sessions
* 🧪 Unit & E2E tests passing

---

## 📖 Summary

The **Weather Dashboard** emphasizes:

* ⚡ **Fast interactions**
* 🎨 **User preference support** (favorites, themes)
* 🛠️ **Long-term maintainability**
* 📲 **Installable as a PWA** (without offline caching)

---