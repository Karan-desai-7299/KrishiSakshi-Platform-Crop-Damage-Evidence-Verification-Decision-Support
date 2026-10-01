# KrishiSakshi (कृषीसाक्षी)

> **"Capture the loss early. Help verify it faster."**  
> *(लवकर नोंद, जलद पंचनामा)*  
> **Challenge:** Seva First Innovation Challenge, Maharashtra Zone 2026 (Agriculture Theme, Track 3)  
> **Tagline:** Early crop loss capture & rule-based field verification triage for Maharashtra.

---

## 1. Official Challenge Submission Alignment

### Understanding of the Problem
> "When crops are damaged by heavy rain, floods, hailstorms, storms or drought, farmers need to report the loss and get it verified for insurance or government relief. For certain crop-insurance loss situations, applicable rules may require loss intimation within a specified time window, such as 72 hours. At the same time, officials may have to check many affected farms, especially when a large area is hit by the same event. The damage can also change quickly when farmers remove, harvest or replant the damaged crop. Maharashtra already has e-Pik Pahani for recording crop information and e-Panchanama for official damage assessment. The gap we see is the period immediately after the disaster: how to quickly record when and where the event happened, collect early loss reports, connect them with available weather and satellite information, and help officials know where field verification should be given priority."

### Estimated Number
> **1,000 farm units — proposed initial pilot target** (Demonstrated in Karveer Taluka, Kolhapur District with 8 high-density spatial clusters).

### Proposed Solution
> "KrishiSakshi is a simple digital support system for the period immediately after crop damage. When a major weather event is detected, the system creates a time- and location-based event record using available weather and satellite information. Farmers can receive alerts in Marathi and quickly report crop damage through a simple, low-bandwidth-friendly mobile interface. Their report, crop information and supporting photos can be organized into one case file. The system then compares reports with weather data, satellite information and nearby reports to identify areas where crop damage may be concentrated. An officer dashboard shows these areas and helps officials decide where field verification should be prioritised. KrishiSakshi does not replace e-Pik Pahani or the official Panchnama process, and it does not approve compensation. It helps bring early information and supporting evidence together so that the existing verification process can be faster and better organised."

### How KrishiSakshi Directly Solves Every Gap Identified

| Gap Identified in Submission | How KrishiSakshi Solves It | Active Implementation in Prototype |
| :--- | :--- | :--- |
| **72-hour intimation requirement** | Automated Marathi alert triggers fast 3-step mobile submission before farmers remove/replant crops. | Screen 2: `/farmer` with instant Case ID generator (`KS-2026-XXXXXX`) and replay timeline tracking. |
| **Large area hit, mass unverified reports** | Spatial proximity grouping (1 km radius) clusters scattered individual reports into actionable geographic pockets. | Screen 3 & 4: `/intelligence` & `/officer` grouping 109+ farm reports into 8 priority clusters. |
| **Connecting weather & satellite data** | Fuses gridded reanalysis rainfall (Open-Meteo ERA5) with simulated SAR proxy flood extent and farmer reports. | Screen 3: 3-column evidence comparison table and 5-factor deterministic priority scoring (0–100). |
| **Helping officials prioritize field visits** | District HQ dashboard ranks potential damage clusters by severity with transparent "WHY this priority?" checklist. | Screen 4: Officer dashboard with priority list, Mapbox GIS pins, and offline CSV panchnama download. |
| **Respects existing e-Pik Pahani & Panchnama** | Does NOT replace existing state systems or approve compensation; acts strictly as an evidence organizer. | Screen 5: `/verification/:caseId` organizing crop records, photos, and official observation recorder with audit log. |

---

## 2. Non-Negotiable Data Honesty & Boundaries of Truth

In strict accordance with the project specification and government integrity standards:

1. **Rule-Based Decision Support (Never Claim "AI"):**
   All priority calculations, consistency scoring, and spatial grouping are deterministic, rule-based heuristics. We never use black-box "AI" claims.
2. **Gridded Reanalysis Attribution (Open-Meteo):**
   Rainfall data is strictly labeled: `"Gridded reanalysis estimate (Open-Meteo)"`. Reanalysis grid resolution is ~9–25 km; 1 km cluster radius does not imply 1 km weather precision.
3. **5-Day Historical Replay Boundary:**
   ERA5 reanalysis operates with a 5-day latency delay from ECMWF. The system enforces date validation rejecting dates later than `today - 5 days`, operating as a realistic historical event replay.
4. **Simulated Satellite Proxy:**
   SAR satellite surface change detection is badged with: `"SIMULATED — prototype only"`. Real Sentinel-1 orbital processing is documented on the roadmap.
5. **No Automated Compensation or Claim Approvals:**
   KrishiSakshi never approves claims or calculates compensation amounts. Clusters represent *"potential damage clusters"* to assist physical panchnama scheduling. Statutory physical verification by designated revenue and agriculture officers determines all outcomes.
6. **Privacy Protection:**
   Farmer phone numbers are masked (`99999XXXXX`) across all officer dashboards and cluster exports.

---

## 3. The 8-Step Operational Workflow

```
[1. Weather Event] (Monsoon Deluge exceeding 100 mm threshold)
        │
        ▼
[2. Event Flag & Trigger] (Sequential Event ID: EVT-YYYY-XXXX)
        │
        ▼
[3. Farmer Alert] (Marathi default SMS/advisory: DEMO MODE)
        │
        ▼
[4. Rapid Loss Report] (3-step mobile submission: Crop, GPS, Photo)
        │
        ▼
[5. Evidence Fusion] (Weather Reanalysis + Farmer Claims + Simulated SAR)
        │
        ▼
[6. Spatial Clustering] (Haversine proximity grouping: 1 km radius)
        │
        ▼
[7. Priority Engine] (5 weighted factors: Rainfall 30%, Density 25%, Consistency 20%, SAR 15%, Time 10%)
        │
        ▼
[8. Field Verification & Panchnama] (Officer on-site inspection, status updates, immutable audit log)
```

---

## 4. The 6 Application Screens

| Screen | Route | Description | Key Features |
| :--- | :--- | :--- | :--- |
| **Screen 0** | `/` | **Landing Page & Architecture Overview** | Hero value proposition, persona switcher, 8-step workflow cards, live health metrics, and 6 Data Honesty rules. |
| **Screen 1** | `/event-monitor` | **Weather Event Monitor** | Historical Open-Meteo ERA5 archive replay. 5 Kolhapur reference points, Recharts cumulative bar charts, 100 mm threshold exceedance marker, and simulated alert trigger. |
| **Screen 2** | `/farmer` | **Farmer Flow (Marathi / English)** | Mobile-first portal for Ram Patil. Localized Marathi alert card, 3-step rapid report flow (Crop, GPS with manual fallback, photo upload), and "My Reports" tracking. |
| **Screen 3** | `/intelligence` | **Cluster Intelligence & Fusion** | 3-column evidence view (Weather, Farmer Reports, Satellite SAR Proxy), dynamic proximity radius slider (500m–2000m), priority score breakdown, and explainable "WHY this priority?" checklist. |
| **Screen 4** | `/officer` | **Officer Field Triage Dashboard** | District HQ dashboard for Officer Sanjay Deshmukh. 4 hero metric cards, priority-ranked cluster list, Mapbox GL JS cluster map with priority pins, inspection drawer, and offline CSV panchnama download. |
| **Screen 5** | `/verification/:caseId` | **Verification Case Dossier & Audit** | Single-case dossier: 4 structured evidence cards, official field panchnama observation recording form, finding selector, loss % assessment, and immutable vertical audit timeline (`AuditLog`). |

---

## 5. Technology Stack

- **Frontend:**
  - React 19 + Vite (Fast ESM build tool)
  - Tailwind CSS v3 with Maharashtra Government Design Tokens (`#F7F9FA` background, `#FFFFFF` cards, `#D9E0E6` borders, `#1565C0` primary, `#2E7D32` agriculture)
  - Mapbox GL JS (Interactive vector maps and GIS cluster markers)
  - Recharts (Meteorological rainfall bar charts)
  - Lucide React (Accessible iconography)
- **Backend:**
  - Node.js (v22+) + Express 5
  - MongoDB + Mongoose 9 (with geospatial `2dsphere` indexes on farms, reports, and clusters)
  - Helmet (Security headers) & CORS
  - Multer (Local file photo uploads with MIME validation)
  - JSON Web Tokens (JWT) for demo persona authentication
- **External Data Source:**
  - Open-Meteo Historical Weather Archive API (`https://archive-api.open-meteo.com/v1/archive`)
  - ECMWF ERA5 Gridded Atmospheric Reanalysis (~9–25 km resolution)

---

## 6. Directory Structure

```
KrishiSakshi/
├── client/                         # Frontend React 19 application
│   ├── src/
│   │   ├── components/             # Reusable UI, MapboxView, ClusterMapView, Drawer
│   │   ├── context/                # AuthContext (Farmer & Officer personas)
│   │   ├── layouts/                # FarmerLayout & Navigation
│   │   ├── pages/                  # LandingPage, EventMonitor, Farmer, Intelligence, Officer, Verification
│   │   ├── App.jsx                 # Client router and top government header
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/                         # Backend Express application
│   ├── src/
│   │   ├── controllers/            # event, auth, report, cluster controllers
│   │   ├── middleware/             # authMiddleware, uploadMiddleware
│   │   ├── models/                 # 10 Mongoose models (User, Farm, DamageReport, etc.)
│   │   ├── routes/                 # event, auth, report, cluster routes
│   │   ├── services/               # weatherService, clusterService, priorityService, evidenceService, satelliteService
│   │   ├── utils/                  # haversine, idGenerator
│   │   ├── seed/                   # seedData.js (50 farmers, 109 reports, 13 clusters)
│   │   ├── tests/                  # automated test suites (test_phase5, test_phase6, test_phase7)
│   │   └── server.js               # Express entry point
│   └── package.json
├── PROJECT_STATE.md                # Detailed phase-by-phase implementation log
├── README.md                       # Master documentation
└── package.json                    # Workspace orchestration scripts
```

---

## 7. How to Run Locally

### Prerequisites
- Node.js (v20+ recommended)
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd KrishiSakshi
npm run install:all
```

### Step 2: Configure Environment Variables
- `server/.env`:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/krishisakshi
  JWT_SECRET=krishisakshi_secure_jwt_dev_secret_key_2026
  ```
- `client/.env`:
  ```env
  VITE_API_URL=http://localhost:5000/api
  VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
  ```

### Step 3: Seed Demonstration Data
Seed 50 farmers, 50 farms, 109 damage reports, 13 clusters, and 20 verifications in Kolhapur district:
```bash
cd server
npm run seed
```

### Step 4: Launch Development Servers
Open two terminal windows:

**Terminal 1 (Backend API Server):**
```bash
npm run dev:server
# Server running at http://localhost:5000 (Health: http://localhost:5000/api/health)
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Application accessible at http://localhost:5173
```

---

## 8. Evaluator / Judge 5-Minute Demo Walkthrough

1. **Step 1: Start on Landing Page (`/`):**
   Review the value proposition, live service health badges, and the 6 Data Honesty rules.
2. **Step 2: Weather Event Monitor (`/event-monitor`):**
   Examine the July 2024 Kolhapur monsoon deluge replay. Click *"Analyze Event & Replay Data"* to see the Recharts bar chart showing cumulative rainfall exceeding the 100 mm threshold. Notice the sequential event ID (`EVT-2024-0001`) and the simulated alert log.
3. **Step 3: Farmer Flow (`/farmer`):**
   Experience the interface from farmer Ram Patil's perspective. Read the Marathi alert advisory. Click *"नुकसान नोंदवा (3 पायऱ्या)"* to enter the 3-step rapid report flow. Choose Sugarcane, Waterlogging, verify the GPS pin, and submit to receive sequential Case ID `KS-2026-XXXXXX`.
4. **Step 4: Cluster Intelligence (`/intelligence`):**
   Switch to the Intelligence Engine. Review the 3 evidence columns (Weather, Farmer Reports, Satellite SAR Proxy). Adjust the proximity slider from 1000m to 500m or 2000m to see clusters recalculate dynamically. Inspect the explainable "WHY this priority?" checklist.
5. **Step 5: Officer Dashboard (`/officer`):**
   Login as Taluka Agriculture Officer Sanjay Deshmukh. Observe the 4 hero metric cards (116 Reports, 13 Clusters, 7 High Priority, Panchnama Progress). Filter by "High Priority" and inspect cluster `CLU-EVT-2024-0001-001` on the Mapbox GIS map. Click *"Export Panchnama Sheet (CSV)"* to download an offline inspection schedule.
6. **Step 6: Verification Case Dossier (`/verification/KS-2026-000001`):**
   Open an individual case dossier. Review the 4 structured evidence cards. Fill out the official panchnama form, select `Verified`, adjust observed loss to 70%, add field notes, and submit. Observe the new entry appear instantly in the immutable case audit log timeline.

---

## 9. License & Attribution

- **License:** MIT License. Developed for demonstration purposes for the *Seva First Innovation Challenge, Maharashtra Zone 2026*.
- **Weather Data:** Gridded atmospheric reanalysis provided by [Open-Meteo](https://open-meteo.com/) under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- **Maps:** Tiles provided by [Mapbox](https://www.mapbox.com/).
