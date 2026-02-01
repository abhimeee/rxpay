# RxPay TPA Copilot — Demo

A demo site for **TPA leadership** showing how AI can assist TPA teams with claims verification, pre-auth completeness, fraud detection, and IRDAI compliance — within their current workflow.

## What’s in the demo

- **Dashboard** — KPIs for pre-auth awaiting docs, under review, open fraud alerts, and compliance. Snapshot of pre-auth queue and fraud alerts with links to detail.
- **Pre-Auth Queue** — List of pre-auth requests with AI readiness score, status, and compliance. Click a row to open the detail view.
- **Pre-Auth Detail** — AI completeness checklist per IRDAI (e.g. Form A, doctor recommendation, cost breakdown, consent, investigations). Missing items show AI suggestions. Summary panel with patient, hospital, insurer, SLA, and “next steps in your workflow”.
- **Fraud Alerts** — AI-detected duplicate billing and anomalies. Each alert shows claim IDs, description, AI confidence, duplicate details (original vs duplicate, amount overlap, matching items). Actions: Under investigation, Resolved, False positive.
- **Compliance** — IRDAI-aligned rules (e.g. 48 hr pre-auth response, cashless documentation, settlement timelines). Table with rule name, IRDAI ref, description, category, status, last checked.

All data is **realistic dummy data** (Indian hospitals like Apollo, Fortis, Max; insurers like Star Health, HDFC ERGO, ICICI Lombard; policy numbers, ICD codes, IRDAI refs).

## Run the demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the sidebar to move between Dashboard, Pre-Auth Queue, Fraud Alerts, and Compliance.

## Core value props (for leadership)

1. **Pre-auth delays** — AI flags missing docs and IRDAI requirements so hospitals and TPA spend less time on back-and-forth; checklist keeps responses compliant.
2. **Fraud detection** — Surfaces likely duplicate billing (same patient/procedure/item overlap) for manual review instead of fully manual spotting.
3. **Compliance** — Checks tied to IRDAI circulars; fits into existing workflow (no replacement of current systems).

Later you can add more features (e.g. claim adjudication assistance, hospital/insurer coordination views).
