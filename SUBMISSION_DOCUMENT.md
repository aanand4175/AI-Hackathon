# Farmer Profitability Estimator — Hackathon Submission Document

---

## 1. Project Overview

**Project Name:** Farmer Profitability Estimator  
**Purpose:** An AI-powered decision-support tool that helps Indian farmers estimate whether a crop choice will be profitable, based on their specific location, land size, irrigation method, and cost data.

**Repository:** https://github.com/aanand4175/AI-Hackathon

---

## 2. Steps Followed

### Phase 1: Project Initialization & Architecture Design

1. Analyzed the hackathon problem statement and identified core requirements
2. Designed the system architecture (React + Express + MongoDB)
3. Created the project structure with `client/` and `server/` directories
4. Set up TypeScript configuration for both frontend and backend
5. Defined 30+ TypeScript interfaces for type safety

### Phase 2: Database & Data Modeling

1. Designed MongoDB schemas for Crop, Region, Category, State, Irrigation, CostParameter, and Admin
2. Created seed data with real Indian agriculture data:
   - 9 crops: Rice, Wheat, Cotton, Sugarcane, Soybean, Maize, Tomato, Onion, Strawberry
   - 8 regions across 6 states: Punjab (Ludhiana, Patiala), Maharashtra (Nashik), Bihar (Patna, Muzaffarpur), Kerala (Ernakulam), Gujarat (Rajkot), Karnataka (Belgaum)
3. Each crop has real MSP data, soil suitability scores, pest rules, crop rotation data, and msp history
4. Each region has unique yield multipliers, soil types, rainfall data, weather forecasts, and government schemes

### Phase 3: Core Calculation Engines (Backend)

Built 5 independent calculation engines:

1. **Yield Calculator** (`yieldCalculator.ts`)
   - Formula: `baseYieldPerAcre × regionMultiplier × irrigationMultiplier × landSize`
   - 7 irrigation multipliers (Rainfed: 0.75x to Drip: 1.2x)
   - Farming type bonuses (Protected: 1.1-1.2x, Hydroponic: 1.15-1.35x)

2. **Cost Modeler** (`costModeling.ts`)
   - Processes 7 cost categories with user overrides
   - Applies region-specific cost adjustment multipliers
   - Applies farming type cost multipliers

3. **Profit Calculator** (`profitCalculator.ts`)
   - Revenue at MSP and Market prices
   - Net profit/loss at both price points
   - ROI % calculation
   - Price difference analysis

4. **Risk Scorer** (`riskScoring.ts`)
   - 5 independent risk categories (0-100 each)
   - Weather Risk: based on rainfall thresholds
   - Water Risk: irrigation type + crop water needs
   - Price Risk: crop category volatility
   - Pest Risk: from pest rules + probability data
   - Infrastructure Risk: from region data

5. **Advanced Engines** (`advancedEngines.ts`)
   - Confidence Score: 4-factor weighted scoring
   - Water Match: crop need vs region supply
   - Crop Suitability: 5-factor AI-style scoring
   - Multi-Year Projection: 3-year forecast
   - Sensitivity Analysis: 5 what-if scenarios
   - Pest Predictions: crop-specific data

### Phase 4: Frontend — Input Form

1. Built multi-step wizard with Category → Crop → State → District → Irrigation → Land Size → Costs flow
2. Implemented smart filtering: crops filtered by category, regions filtered by crop's soil suitability
3. Added "Intelligence Auto-Fill" for cost pre-population from crop defaults
4. Created a custom dark-theme design system with 2600+ lines of CSS

### Phase 5: Frontend — Results Dashboard

1. Designed a comprehensive results page (850 lines) with:
   - Profit/Loss summary card with verdict badge
   - Revenue vs Cost bar chart
   - Cost breakdown pie chart
   - 5-category risk radar chart
   - Water match analysis gauge
   - Crop suitability radar chart
   - Multi-year projection line chart
   - MSP trend area chart
   - Sensitivity analysis table
   - Pest predictions table
   - Crop rotation suggestions
   - Government schemes info
2. Implemented PDF export with jsPDF (downloadable reports)

### Phase 6: Beyond-MVP Features

1. **AI Crop Recommendations** — Top 5 crops for a region ranked by weighted suitability score
2. **Scenario Comparison** — Side-by-side A/B testing with "Find Best Scenario" auto-optimizer
3. **Sensitivity Analysis** — Interactive slider-based what-if analysis page
4. **Profit Heatmap** — Land size vs profit visualization
5. **i18n** — English + Hindi language support

### Phase 7: Admin CMS

1. Secure login with JWT authentication
2. Full CRUD for Crops (with form for all 15+ fields)
3. Full CRUD for Regions (with form for all 15+ fields)
4. Master Data management: Categories, States, Irrigations, Cost Parameters
5. Dashboard with system health stats

### Phase 8: Mobile Responsiveness

1. Added 4 responsive breakpoints: 768px, 640px, 480px, 375px
2. Navbar collapses to hamburger menu
3. Admin sidebar converts to off-canvas overlay with backdrop
4. All grids, tables, and charts adapt to mobile screens
5. Tested on iPhone SE (375px) width

### Phase 9: Final Polish

1. Fixed PDF export (correct .pdf extension, font compatibility)
2. Results page UI alignment and centering
3. Price source toggle responsive wrapping
4. Pest table horizontal scroll for mobile

---

## 3. Prompts Used

The project was built iteratively using an AI coding assistant (Gemini/Antigravity). Key prompt categories:

### Architecture & Setup

- "Create a Farmer Profitability Estimator with React frontend and Express backend"
- "Design MongoDB schemas for crops with MSP data, yield info, and regional variations"
- "Add TypeScript types for all estimation interfaces"

### Core Engines

- "Build a yield calculator that uses base yield × region multiplier × irrigation multiplier"
- "Create a 5-category risk scoring engine (Weather, Price, Pest, Water, Infrastructure)"
- "Add cost modeling with region-specific adjustment multipliers"
- "Create a profitability calculator comparing MSP vs market price"

### Frontend Development

- "Build a multi-step estimator form with Category → Crop → Region cascade"
- "Create a comprehensive results dashboard with Recharts visualizations"
- "Add PDF export functionality using jsPDF"
- "Build a scenario comparison page with side-by-side A/B testing"

### Admin Panel

- "Create a secure admin panel with JWT authentication"
- "Build CRUD forms for crop and region management with all fields"
- "Add master data management for categories, states, and irrigations"

### Responsive Design

- "Make the entire project mobile responsive — test at 375px width"
- "Add hamburger menu for admin sidebar on mobile"

### Bug Fixes & Polish

- "Fix PDF filename and extension issues"
- "Ensure different regions show different data in estimations"
- "Fix price toggle button wrapping on mobile"

---

## 4. Tools & Agents Used

| Tool/Agent                                   | Purpose                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| **Gemini Antigravity (AI Coding Assistant)** | Primary development partner — code generation, debugging, architecture design |
| **VS Code**                                  | Code editor                                                                   |
| **Vite**                                     | Frontend build tool and dev server                                            |
| **Express.js**                               | Backend API framework                                                         |
| **MongoDB Atlas / Local**                    | Database                                                                      |
| **Mongoose**                                 | MongoDB ODM for schema validation                                             |
| **React + TypeScript**                       | Frontend framework                                                            |
| **Recharts**                                 | Data visualization (9+ chart types)                                           |
| **jsPDF + AutoTable**                        | PDF report generation                                                         |
| **react-i18next**                            | Internationalization (English + Hindi)                                        |
| **react-select**                             | Enhanced dropdown components                                                  |
| **jsonwebtoken + bcryptjs**                  | Authentication                                                                |
| **Git + GitHub**                             | Version control and code hosting                                              |

---

## 5. Development Method

### Approach: AI-Assisted Iterative Development

The project was built using a **prompt-driven iterative development methodology** with an AI coding assistant (Gemini Antigravity). The development followed these principles:

1. **Plan First:** Each feature started with a clear requirement analysis and architecture planning before any code was written.

2. **Engine-First Backend:** All 5 calculation engines were built and tested independently before connecting to the API layer, ensuring mathematical correctness.

3. **Component-Based Frontend:** The UI was built component-by-component, starting with the design system (CSS variables, dark theme) and then assembling pages from reusable patterns.

4. **Real Data Seeding:** Instead of placeholder data, the seed script contains realistic Indian agriculture data — actual MSP prices, soil types per region, rainfall data, and pest information.

5. **Iterative Polish:** After the MVP was complete, each feature was revisited for UI polish, responsive design, edge case handling, and performance optimization.

6. **Continuous Testing:** Every change was verified in the browser at both desktop and mobile widths before committing.

### Development Timeline

- **Phase 1-3:** Backend architecture, database design, and 5 calculation engines
- **Phase 4-5:** Frontend input form and results dashboard with 9+ charts
- **Phase 6:** Beyond-MVP features (Recommendations, Compare, Sensitivity, Heatmap)
- **Phase 7:** Admin CMS with JWT auth and full CRUD
- **Phase 8-9:** Mobile responsiveness and final polish

---

## 6. How to Run the Project

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Quick Start

```bash
# Clone repository
git clone https://github.com/aanand4175/AI-Hackathon.git
cd AI-Hackathon

# Setup & start backend
cd server
npm install
# Create .env file with: PORT=5001, MONGO_URI=mongodb://localhost:27017/farmer-profitability, JWT_SECRET=your_secret
npm run seed    # Seed database with Indian agriculture data
npm run dev     # Starts on http://localhost:5001

# Setup & start frontend (new terminal)
cd ../client
npm install
npm run dev     # Starts on http://localhost:5173
```

### Admin Access

- URL: http://localhost:5173/admin/login
- Username: `admin`
- Password: `admin123`

---

## 7. Key Highlights for Judges

1. **All 12 Requirements Met** — Every single item from the problem statement is fully implemented with real calculation logic, not just UI mockups.

2. **5 Independent Calculation Engines** — Yield, Cost, Profit, Risk, and Advanced engines each run independently and can be unit tested.

3. **Region-Based Variation** — Each of the 8 regions has unique yield multipliers, soil types, rainfall data, and cost adjustment factors that create genuinely different results.

4. **12 Beyond-MVP Features** — Including AI recommendations, scenario comparison, sensitivity analysis, multi-year projections, and more.

5. **Production-Quality Admin CMS** — Full master data management with JWT authentication, not just a demo.

6. **Mobile-First Design** — Fully responsive with 4 breakpoints, admin sidebar overlay, and touch-friendly UI.

7. **Real Indian Agriculture Data** — Seeded with actual MSP prices (2024-25), real soil types, and region-specific data for 6 Indian states.
