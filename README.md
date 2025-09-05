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
public/                  # 📁 Static files
├─ icons/                # 🖼️ PWA icons & shortcuts
├─ robots.txt            # 🤖 Indexing rules
├─ manifest.json         # 📲 Web app manifest
└─ index.html            # 🌐 Application HTML shell

src/                     # 🧩 Application source
├─ app/                  # ⚙️ App-level setup
│   ├─ router/           # 🛣️ Routes & guards
│   ├─ store/            # 📦 Pinia stores (weather, settings, UI)
│   ├─ plugins/          # 🔌 Vuetify, PWA, analytics
│   ├─ services/         # 🌐 API integrations
│   ├─ composables/      # ♻️ Reusable logic hooks
│   ├─ config/           # ⚙️ Configurations
│   ├─ utils/            # 🔧 Helpers (format, validate, cache)
│   └─ types/            # 📑 Global TypeScript types & DTOs
│
├─ components/           # 🧱 Reusable UI
│   ├─ common/           # 🔘 Buttons, cards, loaders
│   ├─ layout/           # 🖼️ Shell, header, nav, footer
│   ├─ weather/          # 🌦️ Search, cards, charts
│   └─ feedback/         # 🔔 Alerts, snackbars, messages
│
├─ views/                # 📄 Pages (Dashboard, Favorites, Settings)
├─ styles/               # 🎨 Global styles & themes
├─ assets/               # 🖼️ Images & SVGs
└─ main.ts               # 🚀 App entry point

tests/                   # 🧪 Testing
├─ unit/                 # 🧩 Unit tests (Vitest)
└─ e2e/                  # 🌍 End-to-end tests (Playwright)

.env.example             # 🔑 Env variables template
package.json             # 📦 Scripts & dependencies
vite.config.js           # ⚙️ Build & PWA config
tsconfig.json            # 📑 TS configuration
README.md                # 📖 Documentation
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