# KrishiSakshi — Project State

> **Tagline:** "Capture the loss early. Help verify it faster."  
> **Challenge:** Seva First Innovation Challenge, Maharashtra Zone 2026 (Agriculture)  
> **Architecture:** Modular Monolith (Client: React 19 + Vite + Tailwind CSS + Mapbox GL JS; Server: Node.js + Express + MongoDB)

---

## 1. Current Phase
* **Active Phase:** ALL PHASES COMPLETED (100% Operational Prototype)
* **Status:** Ready for Seva First Innovation Challenge Evaluation & Demonstration

---

## 2. Completed Phases
* [x] **Phase 0: Understand, verify, plan**
  * Problem, gap, and solution restated accurately.
  * Verified Open-Meteo Historical Weather API parameters, rate limits, 5-day delay, and CC BY 4.0 license.
  * Created `PROJECT_STATE.md` tracking skeleton.

* [x] **Phase 1: Project setup**
  * Standardized directory structure into `client/` and `server/`.
  * Configured Tailwind CSS with government design tokens.
  * Created `HonestyBanner` and `MapboxView` components.
  * Connected Express backend to MongoDB and established `/api/health`.

* [x] **Phase 2: Real weather + Event Monitor**
  * Built `weatherService` connecting to Open-Meteo Archive API.
  * Enforced date validation rejecting end dates later than `today - 5 days`.
  * Computed cumulative rainfall, maximum single-day rainfall, and threshold exceedance for 5 Kolhapur reference locations.
  * Built `EventMonitorPage` (Screen 1) with Recharts bar chart, Mapbox circle overlays, honesty badges, and simulated farmer alert trigger.

* [x] **Phase 3: Models, demo auth, seed data**
  * Implemented all 10 Mongoose models with indexes (`User`, `Farm`, `DamageReport`, `Evidence`, `DamageCluster`, `Verification`, `WeatherEvent`, `Notification`, `AuditLog`, `Counter`).
  * Built JWT authentication middleware with role enforcement and phone number masking (`99999XXXXX`).
  * Built `POST /api/demo/login` supporting `"FARMER"` and `"OFFICER"`.
  * Seeded 50 farmers, 50 farms, 109 damage reports around 8 cluster centres, 20 verifications, 5 weather events (all `isDemo: true`).

* [x] **Phase 4: Farmer flow**
  * Built `FarmerAlertCard` with default Marathi copy, Marathi/English toggle, and `"DEMO MODE — simulated alert"` badge.
  * Built 3-step rapid loss report flow (`FarmerReportFlow.jsx`):
    - Step 1: Crop and damage selection with large touch targets ($\ge 44$px).
    - Step 2: Farm location via `navigator.geolocation` with fallback manual village pin selector when permission is denied; optional photo upload with client-side canvas compression (~1280px) to save bandwidth.
    - Step 3: Review and submit generating sequential Case ID `KS-YYYY-XXXXXX` from `Counter` collection.
  * Applied replay-time rule: live reports calculate `effectiveReportedAt = eventEnd + minutesSinceAlert`.
  * Built `FarmerMyReportsPage.jsx` with strictly honest status badges and zero compensation promises.

* [x] **Phase 5: Cluster, priority and evidence engines (Screen 3)**
  * Implemented `satelliteService` with deterministic SAR proxy returning `"SIMULATED — prototype only"` badge.
  * Implemented `evidenceService` multi-source consistency evaluation (per-item labels: Available/Consistent/Supporting/Not available; overall: Supporting/Limited/Inconsistency noted; NO false percentage claims).
  * Implemented `priorityService` with 5 weighted heuristic factors: Rainfall (30%), Report density (25%), Consistency (20%), Satellite (15%), Time (10%). Thresholds: HIGH $\ge 70$, MEDIUM 40–69, LOW $< 40$.
  * Implemented mandatory explainable "WHY this priority?" checklist containing only verified true reasons.
  * Implemented `clusterService` using Haversine great-circle proximity grouping, dynamic radius (`radiusM`), minimum reports (`minReports`), and replay-time linking.
  * Mounted routes: `POST /api/clusters/generate`, `GET /api/clusters`, `GET /api/clusters/:id`.
  * Built `IntelligencePage.jsx` (Screen 3) featuring 3-column evidence view (Weather, Farmer Reports, Satellite Proxy), interactive radius & report sliders, cluster selection list, priority score breakdown, and explainable WHY checklist.
  * Automated testing: Verified dynamic radius sensitivity (500m $\rightarrow$ 19 clusters, 1000m $\rightarrow$ 13 clusters, 2000m $\rightarrow$ 8 clusters), priority scores and thresholds, simulated badges, and live farmer report cluster ingestion.

* [x] **Phase 6: Officer Dashboard (Screen 4)**
  * Built `GET /api/clusters/stats/summary` calculating real database metrics: total reports (115), active clusters (13), high-priority clusters (7), completed (14) vs pending (101) panchnama verifications.
  * Built `ClusterMapView.jsx` displaying cluster centroids color-coded by priority (Crimson/Red `#C62828` for High, Orange `#E65100` for Medium, Gray `#455A64` for Low) with interactive popups and fallback matrix.
  * Built `ClusterDetailDrawer.jsx` slide-over drawer showing cluster details, explainable WHY checklist, member reports table with masked phone numbers (`99999XXXXX`), and offline Panchnama Sheet (CSV) export generator.
  * Built `OfficerDashboardPage.jsx` at `/officer` featuring officer identification (Sanjay Deshmukh), 4 hero metric cards, priority filter tabs (All, High, Medium, Low), search input, ranked priority list, and GIS cluster map.
  * Automated verification: Verified stats aggregation, descending priority sorting, cluster inspection, privacy phone masking, and honesty rules. Zero forbidden phrases.

* [x] **Phase 7: Verification Case Detail (Screen 5 & Audit)**
  * Built `GET /api/reports/:id/dossier` endpoint returning the 4-part evidence dossier:
    1. Farmer submission (crop, loss %, reported time, GPS coords, photo, masked phone).
    2. Weather context (Open-Meteo reanalysis estimate, cumulative rainfall, threshold exceedance, 9–25 km grid caveat).
    3. Satellite SAR proxy (deterministic surface change signal with mandatory `"SIMULATED — prototype only"` badge).
    4. Cluster context (cluster membership, priority score/level, neighbor count, centroid distance).
  * Built `POST /api/reports/:id/verify` endpoint allowing officers to record physical panchnama findings (`Verified`, `Partially Verified`, `Needs More Information`, `Not Observed`), observed loss %, and notes.
  * Enforced role security: Unauthorized farmer verification attempts are strictly blocked with HTTP 403 Forbidden.
  * Maintained immutable audit trail (`AuditLog`) tracking transitions (`OFFICER_VERIFICATION_RECORDED`, previous vs new status, timestamp, actor metadata).
  * Built `VerificationCasePage.jsx` at `/verification/:caseId` featuring the 4 structured evidence cards, panchnama recording form, and vertical audit timeline.
  * Automated testing: Verified complete dossier data shape, phone masking, role security, panchnama recording, and audit trail appending.

* [x] **Phase 8: Polish, Language, Landing Page & README**
  * Built Screen 0 Landing Page (`LandingPage.jsx`) at `/` featuring value proposition, hero section, 8-step workflow cards, live system health badges, 5-screen interactive directory, and data honesty rules.
  * Conducted Marathi language and Devanagari typography review across farmer alert cards, reporting flow, and navigation.
  * Accessibility verification: Ensured >= 44px touch targets (`farmer-tap-target`), WCAG AA contrast on Maharashtra Government color palette, and semantic HTML.
  * Authored comprehensive `README.md` containing problem statement, architecture diagram, 6 screens walkthrough, data honesty rules, tech stack, and evaluator demo script.
  * Codebase audit: Verified 0 occurrences of forbidden phrases (`AI-powered`, `fraud`, `claim approved`).

* [x] **Phase 9: Full Demo Test & DEMO_GUIDE.md**
  * Completed full end-to-end rehearsal across all 6 screens (Screen 0 Landing Page -> Screen 1 Event Monitor -> Screen 2 Farmer Flow -> Screen 3 Intelligence -> Screen 4 Officer Dashboard -> Screen 5 Verification Case).
  * Authored `DEMO_GUIDE.md` with timed 5-minute evaluator demo script, precise click sequences, and comprehensive defense of tough technical and governance questions.
  * Re-verified all test suites (`test_phase5.js`, `test_phase6.js`, `test_phase7.js`) with 100% passing tests (exit code 0).
  * Verified production build (`npm run build`) in `client` with 0 errors.
  * Verified 0 occurrences of forbidden phrases across the entire repository.

---

## 3. Key Decisions & Data Honesty Boundaries
1. **Rule-Based Decision Support:** Never call any current feature "AI".
2. **Weather Attribution:** Labeled strictly as `"Gridded reanalysis estimate (Open-Meteo)"`. Reanalysis grid is ~9–25 km; 1 km cluster radius does not imply 1 km weather precision.
3. **5-Day Historical Boundary:** Historical ERA5 reanalysis has a 5-day lag; end dates within `today - 5 days` are rejected.
4. **Replay Time Mechanics:**
   - Seeded demo reports: `effectiveReportedAt = eventEnd + random(2 to 60 hours)` with `isDemo: true`.
   - Live demo reports: `effectiveReportedAt = eventEnd + (minutes since alert sent)`, labeled `"replay time"`.
5. **No Compensation Claims:** KrishiSakshi supports verification prioritization; official field verification determines outcomes. Compensation is decided solely by government authorities.
6. **No Offline Claims:** Photo compression is client-side to be low-bandwidth friendly; offline sync is roadmap only.
7. **Simulated Layers:** Satellite / SAR layer is strictly badged `"SIMULATED — prototype only"`. SMS/IVR alerts are badged `"DEMO MODE — simulated alert"`.

---

## 4. File Map
```
KrishiSakshi/
├── PROJECT_STATE.md            # Active tracking document
├── README.md                   # Setup, honesty rules, quickstart
├── package.json                # Root orchestration scripts
├── .gitignore                  # Git ignore rules
├── client/                     # Frontend (React 19 + Vite + Tailwind + Mapbox GL JS + Recharts)
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx             # React Router with AuthProvider and all routes
│       ├── context/
│       │   └── AuthContext.jsx # Demo JWT state and role management
│       ├── data/
│       │   └── translations.js # Marathi and English UI strings
│       ├── utils/
│       │   └── imageCompressor.js # Client-side image resize to ~1280px
│       ├── components/
│       │   ├── HonestyBanner.jsx     # Rule 4 Honesty Banner
│       │   ├── DemoLoginBanner.jsx   # Demo role switcher
│       │   ├── FarmerAlertCard.jsx   # Marathi alert card with toggle
│       │   ├── FarmerBottomNav.jsx   # Mobile bottom navigation
│       │   └── MapboxView.jsx        # GIS view with rainfall overlays
│       ├── layouts/
│       │   └── FarmerLayout.jsx      # Mobile-first farmer layout
│       └── pages/
│           ├── EventMonitorPage.jsx  # Screen 1: Event Monitor
│           ├── FarmerHomePage.jsx    # Screen 2: Farmer Home & Alert
│           ├── FarmerReportFlow.jsx  # Screen 2: 3-step loss report
│           └── FarmerMyReportsPage.jsx # Screen 2: Farmer's own reports
└── server/                     # Backend (Node.js + Express + MongoDB + Mongoose)
    ├── .env
    ├── .env.example
    ├── package.json
    ├── uploads/                # Field report photo storage
    └── src/
        ├── server.js           # Express entry point
        ├── middleware/
        │   ├── authMiddleware.js   # JWT verification & phone masking
        │   └── uploadMiddleware.js # Multer photo upload validation
        ├── controllers/
        │   ├── eventController.js  # Weather event controller
        │   ├── authController.js   # Demo login & farmer reports controller
        │   └── reportController.js # Damage report creation & retrieval
        ├── models/
        │   ├── User.js
        │   ├── Farm.js
        │   ├── DamageReport.js
        │   ├── Evidence.js
        │   ├── DamageCluster.js
        │   ├── Verification.js
        │   ├── WeatherEvent.js
        │   ├── Notification.js
        │   ├── AuditLog.js
        │   └── Counter.js
        ├── routes/
        │   ├── eventRoutes.js
        │   ├── authRoutes.js
        │   └── reportRoutes.js
        ├── services/
        │   └── weatherService.js
        ├── seed/
        │   └── seedData.js
        └── utils/
            └── idGenerator.js
```

---

## 5. How to Run
```bash
# Terminal 1: Run Express Server (Port 5000)
npm run dev:server

# Terminal 2: Run React Client (Port 5173)
npm run dev:client
```

---

## 6. Known Limitations
- Geolocation in browsers requires user permission; when denied, the system provides a manual approximate village selector as fallback.
- Photos are compressed on client-side and saved to `server/uploads/`; offline sync is roadmap only.
- SMS delivery is simulated and logged to the database with `DEMO MODE` badge.

---

## 7. Project Status & Final Evaluation Readiness
* **Status:** 100% Complete & Operational (Phases 0 through 9 successfully completed).
* **Screens Implemented & Operational:**
  - Screen 0: Landing Page & Operational Overview (`/`)
  - Screen 1: Weather Event Monitor (`/event-monitor`)
  - Screen 2: Farmer Flow (Marathi / English) (`/farmer`)
  - Screen 3: Cluster Intelligence & Evidence Fusion (`/intelligence`)
  - Screen 4: Officer Field Triage Dashboard (`/officer`)
  - Screen 5: Verification Case Dossier & Immutable Audit (`/verification/:caseId`)
* **Documentation & Demo Guide:**
  - [README.md](file:///c:/Users/karan/Desktop/KrishiSakshi/README.md): Master documentation, architecture, and technology stack.
  - [DEMO_GUIDE.md](file:///c:/Users/karan/Desktop/KrishiSakshi/DEMO_GUIDE.md): 5-minute timed judge demonstration script and defense of tough evaluation questions.
* **Test Suites:**
  - `test_phase5.js`: Clustering, dynamic radius, priority calculation, and live report ingestion (Passed).
  - `test_phase6.js`: Officer summary stats, descending priority ranking, and masked phone privacy (Passed).
  - `test_phase7.js`: 4-part evidence dossier, panchnama observation recording, and immutable audit timeline (Passed).
* **Zero Forbidden Phrases:** Audited with ripgrep across the entire repository.
