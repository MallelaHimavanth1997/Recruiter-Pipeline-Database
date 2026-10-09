# 📊 Recruiter Tracking System (RTR)

A cloud-based tracking system designed to organize recruiter outreach, manage Right to Represent (RTR) submissions, and monitor staffing firm relationships during the job search process. 

## 🏗️ Workflow & Data Pipeline

```mermaid
graph TD
    A[📧 Recruiter Outreach] -->|Extract Info| B[(📊 Google Sheets Tracker)]
    B -->|Log Details| C{Status Update}
    
    C -->|Trigger Script| D(⚙️ Google Apps Script)
    D -->|Auto-Timestamp| B
    
    C -->|Proceed| E[📝 RTR Signed]
    C -->|Passed| F[❌ Closed / Not a Fit]
    
    E --> G[🗣️ Client Interview]
    G --> H[🎉 Offer / Placement]
    
    style A fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#0F9D58,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#F4B400,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#306998,stroke:#fff,stroke-width:2px,color:#fff
    style E fill:#DB4437,stroke:#fff,stroke-width:2px,color:#fff
    style H fill:#00BFA5,stroke:#fff,stroke-width:2px,color:#fff
```

## 🎯 Purpose
Managing high-volume recruiter communications requires structured data. This system transforms scattered messages and emails into a centralized pipeline, ensuring no opportunity is lost and follow-ups are timely.

## ✨ Key Features
* **Standardized Logging:** `RTR_Template.csv` structural framework for tracking firm details, direct contacts, and role specs.
* **Apps Script Automation:** `rtr_automation.js` listens for status changes (e.g., from "Initial Contact" to "RTR Signed") and automatically injects a "Last Updated" timestamp.
* **Pipeline Visibility:** Centralized view of all pending submissions, client interviews, and requested salary ranges.

## 👨‍💻 Author
**Himavanth Mallela**  
Data Engineer | Cloud & Big Data Specialist