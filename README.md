# 🌾 Farmer Profitability Estimator

> **AI-Powered Decision Support Tool for Indian Agriculture**  
> Helps farmers estimate whether a crop choice will be profitable based on region, irrigation, and real cost data.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Installation & Setup](#-installation--setup)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)

---

## ✨ Features

### Core (MVP)

- ✅ Crop + Land Size + District/Region + Irrigation Type input form
- ✅ Yield estimation engine with region-based multipliers
- ✅ MSP vs Market price comparison
- ✅ Cost modeling with 7 categories (seeds, fertilizer, pesticide, labor, irrigation, transport, misc)
- ✅ Net Profit/Loss projection with ROI%
- ✅ 5-category risk scoring (Weather, Price, Pest, Water, Infrastructure)
- ✅ Result summary screen with interactive charts

### Beyond MVP

- 📊 **9+ Chart Types** — Bar, Line, Pie, Radar, Area via Recharts
- 📄 **PDF Export** — Downloadable detailed reports
- 🔍 **AI Crop Recommendations** — Top 5 crops ranked by suitability score
- ⚖️ **Scenario Compare** — Side-by-side A/B comparison with "Find Best Scenario"
- 📈 **Sensitivity Analysis** — Live slider-based what-if analysis
- 🗺️ **Profit Heatmap** — Land size vs profit visualization
- 🕐 **Multi-Year Projection** — 3-year forecast with MSP trend + cost inflation
- 💧 **Water Match Analysis** — Surplus/Deficit/Critical status
- 🛡️ **Admin CMS** — Full CRUD for all master data with JWT auth
- 🐛 **Pest & Disease Predictions** — Crop-specific pest probability data
- 📱 **Full Mobile Responsive** — All pages + admin panel with sidebar overlay
- 🌱 **Farming Type Support** — Open Field, Protected (Polyhouse), Hydroponic
- 🎯 **Confidence Score** — 4-factor weighted reliability metric
- 💰 **Multi-Price Sources** — MSP, Market, Mandi, Online pricing

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| **Frontend**   | React 18 + TypeScript + Vite        |
| **UI/Charts**  | Vanilla CSS (Dark Theme) + Recharts |
| **PDF Export** | jsPDF + jsPDF-AutoTable             |
| **Routing**    | React Router v6                     |
| **State**      | React Hooks (useState, useEffect)   |
| **Backend**    | Express.js + TypeScript             |
| **Database**   | MongoDB + Mongoose                  |
| **Auth**       | JWT (jsonwebtoken) + bcryptjs       |
| **i18n**       | react-i18next (English + Hindi)     |

---

## 📁 Project Structure

```
AI-Hackathon/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.tsx           # Navigation with hamburger menu
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx      # Admin layout with sidebar toggle
│   │   │   └── PublicLayout.tsx     # Public pages layout
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Estimator.tsx        # Multi-step input form
│   │   │   ├── Results.tsx          # Full results dashboard + PDF export
│   │   │   ├── Recommendations.tsx  # AI crop recommendations
│   │   │   ├── Compare.tsx          # Scenario comparison
│   │   │   ├── Sensitivity.tsx      # What-if analysis
│   │   │   ├── Heatmap.tsx          # Land size profit heatmap
│   │   │   └── admin/              # 10 admin pages (CRUD)
│   │   ├── services/api.ts          # API service layer
│   │   ├── types/index.ts           # TypeScript types
│   │   ├── index.css                # Full design system (~2600 lines)
│   │   └── admin.css                # Admin-specific styles
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/db.ts             # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── estimateController.ts   # Main estimation logic
│   │   │   ├── cropController.ts       # Crop CRUD
│   │   │   ├── regionController.ts     # Region CRUD
│   │   │   ├── adminController.ts      # Admin auth + CRUD
│   │   │   └── masterDataController.ts # Master data APIs
│   │   ├── models/
│   │   │   ├── Crop.ts              # Crop schema
│   │   │   ├── Region.ts            # Region schema
│   │   │   ├── Category.ts          # Category schema
│   │   │   ├── State.ts             # State schema
│   │   │   ├── Irrigation.ts        # Irrigation schema
│   │   │   ├── CostParameter.ts     # Cost parameter schema
│   │   │   └── Admin.ts             # Admin user schema
│   │   ├── utils/
│   │   │   ├── yieldCalculator.ts   # Yield estimation engine
│   │   │   ├── costModeling.ts      # Cost calculation engine
│   │   │   ├── profitCalculator.ts  # Profit computation engine
│   │   │   ├── riskScoring.ts       # Risk scoring engine
│   │   │   └── advancedEngines.ts   # Confidence, Water Match, Sensitivity, etc.
│   │   ├── routes/                  # API route definitions
│   │   ├── seed/seedData.ts         # Database seed with real Indian agriculture data
│   │   └── server.ts                # Express app entry point
│   └── package.json
│
└── .gitignore
```

---

## 🗄️ Database Schema

### Crop Collection

| Field                 | Type   | Description                                                                     |
| --------------------- | ------ | ------------------------------------------------------------------------------- |
| name                  | String | Crop name (e.g., Rice, Wheat)                                                   |
| category              | String | Category (Cereals, Cash Crops, etc.)                                            |
| baseYieldPerAcre      | Number | Base yield in quintals per acre                                                 |
| growthDurationDays    | Number | Growth period in days                                                           |
| waterRequirement      | Enum   | Low / Medium / High                                                             |
| waterRequirementMM    | Number | Water needed in millimeters                                                     |
| mspPerQuintal         | Number | Minimum Support Price per quintal                                               |
| marketPricePerQuintal | Number | Market price per quintal                                                        |
| mandiPrice            | Number | Local mandi price                                                               |
| onlinePrice           | Number | Online market price                                                             |
| marketDemand          | Enum   | High / Medium / Low                                                             |
| defaultCosts          | Object | Default costs: seeds, fertilizer, pesticide, labor, irrigation, transport, misc |
| mspHistory            | Array  | Year-wise MSP trend data                                                        |
| pestRules             | Array  | Pest name, probability, severity, season                                        |
| cropRotation          | Array  | Next crop suggestions with benefits                                             |
| soilSuitability       | Object | Soil type → suitability score (0-100)                                           |
| temperatureRange      | Object | Min/Max temperature range                                                       |
| costTips              | Array  | Cost optimization tips                                                          |

### Region Collection

| Field                       | Type   | Description                       |
| --------------------------- | ------ | --------------------------------- |
| district                    | String | District name                     |
| state                       | String | State name                        |
| soilType                    | String | Predominant soil type             |
| avgRainfallMM               | Number | Average annual rainfall in mm     |
| yieldMultiplier             | Number | Region-specific yield multiplier  |
| irrigationAvailability      | Enum   | Good / Moderate / Poor            |
| waterAvailabilityMM         | Number | Total water available per season  |
| supportedFarmingTypes       | Array  | open_field, protected, hydroponic |
| recommendedIrrigationTypes  | Array  | Best irrigation types for region  |
| costAdjustmentByCategory    | Object | Category-wise cost multipliers    |
| costAdjustmentByFarmingType | Object | Farming type cost multipliers     |
| riskFactors                 | Array  | Region-specific risks             |
| govSchemes                  | Array  | Government schemes available      |
| weatherMock                 | Object | 7-day weather forecast data       |

### Other Collections

| Collection        | Key Fields                                           |
| ----------------- | ---------------------------------------------------- |
| **Category**      | name, description                                    |
| **State**         | name, code                                           |
| **Irrigation**    | typeName, description, efficiencyRating, costPerAcre |
| **CostParameter** | name, defaultUnit, category                          |
| **Admin**         | username, passwordHash (bcrypt)                      |

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas cloud)
- **npm** or **yarn**

### Step 1: Clone the Repository

```bash
git clone https://github.com/aanand4175/AI-Hackathon.git
cd AI-Hackathon
```

### Step 2: Setup Backend Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/farmer-profitability
JWT_SECRET=your_secret_key_here
```

### Step 3: Seed the Database

```bash
npm run seed
```

This populates the database with:

- 9 crops (Rice, Wheat, Cotton, Sugarcane, Soybean, Maize, Tomato, Onion, Strawberry)
- 8 regions across 6 Indian states
- Categories, States, Irrigation types, Cost parameters
- Default admin user (username: `admin`, password: `admin123`)

### Step 4: Start the Backend

```bash
npm run dev
```

Server starts at `http://localhost:5001`

### Step 5: Setup Frontend Client

```bash
cd ../client
npm install
npm run dev
```

Client starts at `http://localhost:5173`

### Step 6: Open in Browser

- **Public App**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login

---

## 🔌 API Endpoints

| Method | Route                                     | Description                   |
| ------ | ----------------------------------------- | ----------------------------- |
| `POST` | `/api/estimate`                           | Full profitability estimation |
| `GET`  | `/api/estimate/recommendations/:regionId` | Top 5 crop recommendations    |
| `POST` | `/api/estimate/compare`                   | Compare two scenarios         |
| `POST` | `/api/estimate/heatmap`                   | Land size profit heatmap      |
| `POST` | `/api/estimate/sensitivity`               | Sensitivity analysis          |
| `GET`  | `/api/crops`                              | List all crops                |
| `GET`  | `/api/regions`                            | List all regions              |
| `GET`  | `/api/master/categories`                  | List categories               |
| `GET`  | `/api/master/states`                      | List states                   |
| `GET`  | `/api/master/irrigations`                 | List irrigation types         |
| `POST` | `/api/admin/login`                        | Admin authentication          |
| `GET`  | `/api/admin/stats`                        | Dashboard statistics          |
| `CRUD` | `/api/admin/crops/*`                      | Admin crop management         |
| `CRUD` | `/api/admin/regions/*`                    | Admin region management       |

---

## 📸 Screenshots

### Home Page

Premium dark theme landing page with AI-powered decision support tool branding.

### Estimator (Multi-step Form)

Step 1: Crop & Location selection → Step 2: Cost inputs → Generate AI Report

### Results Dashboard

Full analysis with profit/loss summary, cost breakdown charts, risk scoring, water match analysis, pest predictions, crop rotation suggestions, and PDF export.

### AI Crop Recommendations

Top 5 crops ranked by suitability score with soil match, rainfall match, temperature match, and pest resistance factors.

### Scenario Comparison

Side-by-side A/B testing with revenue, cost, and profit comparison charts plus "Find Best Scenario" auto-search.

### Admin CMS

Full master data management with JWT authentication, responsive sidebar, and CRUD operations for all entities.

---

## 👨‍💻 Author

Built for the AI Hackathon 2026 — Farmer Profitability Estimator Challenge.

---

## 📄 License

This project is built for educational and hackathon purposes.
