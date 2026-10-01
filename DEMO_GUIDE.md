# KrishiSakshi (कृषीसाक्षी) — Evaluator & Judge Demo Guide

> **"Capture the loss early. Help verify it faster."**  
> *(लवकर नोंद, जलद पंचनामा)*  
> **Challenge:** Seva First Innovation Challenge, Maharashtra Zone 2026 (Agriculture Theme, Track 3)  
> **Target District:** Kolhapur (Heavy monsoon flood & waterlogging zone)

---

## 1. Executive Summary for Evaluators

KrishiSakshi is an event-triggered decision support prototype designed for Maharashtra's critical **72-hour crop loss reporting window**. It bridges the operational gap between distressed farmers and overburdened taluka agriculture officers during sudden weather disasters (floods, deluges, hailstorms).

### Why It Wins
- **Compliant with Maharashtra Governance:** Operates strictly alongside *e-Pik Pahani* and statutory *panchnama* protocols.
- **Strict Data Honesty:** Zero black-box "AI" claims; uses transparent, explainable 5-factor rule-based heuristics.
- **Multi-Source Evidence Synthesis:** Fuses gridded atmospheric reanalysis rainfall, independent farmer submissions, and simulated SAR satellite proxy data.
- **Actionable for Field Officers:** Proximity clustering (1 km) ranks priority areas, provides offline CSV panchnama sheets, and records immutable audit logs.

---

## 2. Five-Minute Timed Demonstration Script

| Time | Screen | Action / What to Click | What to Say & Point Out |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:45** | **Screen 0: Landing Page** (`/`) | Scroll through hero, 8-step workflow, and data honesty rules. Notice the live health status pills. | *"KrishiSakshi addresses the statutory 72-hour crop loss notice deadline under PMFBY and Maharashtra relief funds. Notice our 6 non-negotiable Data Honesty rules prominently presented on the landing page — we never claim black-box AI or automated compensation approval."* |
| **0:45 – 1:30** | **Screen 1: Weather Event Monitor** (`/event-monitor`) | Click **"Event Monitor"**. Review July 2024 Kolhapur monsoon deluge replay. Click **"Analyze Event & Replay Data"**. | *"We fetch real gridded atmospheric reanalysis from Open-Meteo ERA5. Point out the Recharts bar chart showing 184 mm cumulative rainfall exceeding the 100 mm threshold across Kolhapur stations. Notice the sequential Event ID `EVT-2024-0001` and the simulated Marathi farmer advisory alert triggered in the database."* |
| **1:30 – 2:30** | **Screen 2: Farmer Flow** (`/farmer`) | Switch role to Farmer **Ram Patil** (Shiroli). View the Marathi alert card. Click **"नुकसान नोंदवा (3 पायऱ्या)"**. | *"Experience the mobile-first farmer flow. Step 1: Select Sugarcane and Waterlogging. Step 2: High-accuracy GPS capture with a manual village selector fallback when geolocation is denied. Notice client-side canvas compression (~1280px) for low-bandwidth 2G/3G networks. Step 3: Review and submit. Notice the sequential Case ID `KS-2026-XXXXXX` generated from the MongoDB Counter collection, and the replay time calculation linking this live demo report directly to the replayed deluge event."* |
| **2:30 – 3:30** | **Screen 3: Cluster Intelligence** (`/intelligence`) | Navigate to **"Cluster Intelligence"**. Explore the 3 evidence columns. Drag the radius slider from 1000m to 500m and 2000m. | *"Here is the evidence fusion engine. Column 1: Gridded reanalysis estimate. Column 2: Independent farmer submissions. Column 3: Satellite SAR proxy badged `SIMULATED — prototype only`. Notice how dragging the proximity slider dynamically reclusters reports (500m yields 19 tight clusters; 2000m merges them into 8 regional clusters). Inspect the explainable 'WHY this priority?' checklist — every reason is a verified true statement."* |
| **3:30 – 4:15** | **Screen 4: Officer Dashboard** (`/officer`) | Switch role to Officer **Sanjay Deshmukh** (Taluka Agriculture Officer, Karveer / Kolhapur HQ). View the 4 hero metric cards. | *"Here is the administrative field triage dashboard. 4 hero metric cards show 117 reports, 13 active clusters, 7 high-priority areas, and 14 completed panchnama records. Filter by 'High Priority'. On the Mapbox GIS map, clusters are color-coded: Red (High $\ge 70$), Orange (Medium 40–69), Gray (Low $< 40$). Click on top cluster `CLU-EVT-2024-0001-001` to open the inspection drawer. Notice farmer phone numbers are masked (`99999XXXXX`) for privacy. Click 'Export Panchnama Sheet (CSV)' to download a field-ready schedule for visiting officers."* |
| **4:15 – 5:00** | **Screen 5: Verification Case** (`/verification/KS-2026-000001`) | Open case dossier `KS-2026-000001`. Review the 4 structured evidence cards. Fill out the official panchnama form. | *"This is the single-case evidence dossier. It synthesizes farmer submission, weather context, satellite proxy, and cluster density. As the visiting officer, select finding 'Verified', set observed loss to 70%, type field notes, and submit. The report status updates to 'Verification Completed', and a new entry is permanently appended to the immutable case audit log timeline."* |

---

## 3. Defense of Tough Evaluation Questions

### Q1: Why use rule-based heuristics instead of Machine Learning or "AI"?
> **Defense:**  
> In public administration, statutory compensation, and disaster relief, decisions must be **legally auditable, explainable, and accountable**. A black-box deep learning model cannot explain to a distressed farmer or a revenue appellate tribunal *why* a particular village was deprioritized. Our 5-factor weighted heuristic produces an explicit, human-readable **"WHY this priority?"** checklist (Rainfall threshold, report density, multi-source concordance, satellite signal, temporal spread). It provides decision support to human officers, preserving human accountability.

### Q2: What about the 5-day latency of ECMWF ERA5 reanalysis weather data?
> **Defense:**  
> ECMWF ERA5 is the gold-standard global gridded atmospheric reanalysis, which inherently has a 5-day quality-control publication delay. In this prototype, we strictly enforce this boundary (`end_date <= today - 5 days`) to demonstrate genuine historical monsoon replays rather than fabricating real-time weather. For live operational deployment in Maharashtra, the ingestion pipeline will interface directly with the **IMD Automatic Weather Station (AWS) network** and the state's **Mahavedh / Skymet** hourly telemetry API, reserving ERA5 for post-event dispute resolution and audit verification.

### Q3: How does KrishiSakshi integrate with existing systems like *e-Pik Pahani* and PMFBY?
> **Defense:**  
> KrishiSakshi is designed to be **complementary, not duplicative**:
> - ***e-Pik Pahani*:** Records what the farmer sowed at the start of the kharif/rabi season.
> - **KrishiSakshi:** Operates exclusively during the critical 72-hour window following an extreme event to capture early loss notice before floodwaters recede or crops rot.
> - **Official Panchnama:** Physical on-ground panchnama remains mandatory by law. KrishiSakshi does not replace panchnama; it solves the officer triage problem by telling field teams *which village clusters to visit first* to conduct those statutory panchnamas.

### Q4: Is the satellite SAR proxy layer real or mock?
> **Defense:**  
> We maintain total data honesty: it is deterministic simulated proxy data badged with **`"SIMULATED — prototype only"`**. During the monsoon season in Maharashtra, dense cloud cover renders optical satellites (Sentinel-2, Landsat) completely blind. Synthetic Aperture Radar (SAR) from satellites like Sentinel-1 penetrates cloud cover to measure ground dielectric properties and flooding extent. In this prototype, we demonstrate the architectural integration and evidence fusion of SAR data, with real Copernicus Hub processing scheduled for the post-pilot phase.

### Q5: Does KrishiSakshi approve compensation or detect fraud?
> **Defense:**  
> **Under no circumstances does KrishiSakshi approve compensation or accuse farmers of fraud.**  
> - Compensation amounts are determined exclusively by the Government of Maharashtra and PMFBY insurance companies following physical panchnama.  
> - Multi-source inconsistencies are labeled neutrally as *"Evidence Inconsistency Noted"* or *"Requires Ground Verification"*, never as "fraud". KrishiSakshi only suggests verification priority order.

### Q6: How does the system handle poor internet connectivity or low digital literacy?
> **Defense:**  
> - **Low Bandwidth:** The farmer reporting flow compresses field photos on the client side using an HTML5 canvas element to ~1280px (~150 KB), allowing submissions over 2G/3G mobile networks.
> - **Low Literacy:** The interface requires only 3 simple taps, defaults to Marathi, uses large 44px touch targets, and provides fallback manual village selection when GPS permissions fail.
> - **Offline Field Teams:** Officers can download CSV panchnama sheets to carry offline printed schedules into areas without mobile reception.

---

## 4. Verification Test Commands Reference

Run these commands from the `server/` directory to demonstrate test suite coverage to evaluators:

```bash
# Verify Clustering, Dynamic Radius & Priority Engine
node src/tests/test_phase5.js

# Verify Officer Dashboard, Summary Stats, Priority Sorting & Masked Phones
node src/tests/test_phase6.js

# Verify 4-Part Evidence Dossier, Panchnama Recording & Immutable Audit Log
node src/tests/test_phase7.js

# Verify Frontend Production Build (from client/ directory)
cd ../client && npm run build
```

---

## 5. Summary of Prototype Credentials

- **Officer Persona:** Sanjay Deshmukh (Taluka Agriculture Officer, Karveer Taluka HQ, Kolhapur)
- **Farmer Persona:** Ram Patil (Shiroli Village, Karveer, Kolhapur)
- **Historical Event:** July 2024 Monsoon Deluge (`EVT-2024-0001`, 184 mm cumulative rainfall)
- **Database:** Local MongoDB with 10 collections, geospatial 2dsphere indexes, and 100% `isDemo: true` flag isolation.
- **Frontend URL:** `http://localhost:5173`
- **Backend API URL:** `http://localhost:5000/api`
