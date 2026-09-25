# ShieldScore — Community Feedback Pipeline & Protocol Telemetry

> **Telemetry Architecture**: Multi-Channel User Ingestion Framework  
> **Direct Registry**: Public Google Forms & Real-Time Responses Spreadsheet  
> **In-App Integration**: Reactive `FeedbackModal.tsx` Component

---

## 1. Multi-Tier Feedback Ingestion

ShieldScore captures user feedback across three distinct layers to ensure both quantitative metrics and qualitative user sentiment are tracked:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FEEDBACK INGESTION PIPELINE                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ 1. In-App Modal ]      [ 2. Google Form ]     [ 3. GitHub RFCs ]  │
│   (1-5 Stars, Persona,    (10 Comprehensive      (Formal protocol     │
│    Quick Suggestions)      Lending Questions)     feature requests)    │
│            │                       │                       │           │
│            └───────────────┬───────┴───────────────────────┘           │
│                            │                                           │
│                            ▼                                           │
│           [ Centralized Response Processing ]                          │
│                            │                                           │
│            ┌───────────────┴───────────────┐                           │
│            ▼                               ▼                           │
│    [ User Insights ]              [ Roadmap Sprints ]                  │
│    • 94% Prover Trust Rate        • Multi-Predicate Chips              │
│    • 1.8s Avg Prover Latency      • Loan Quote Drawdown Engine         │
│    • 1AM Wallet UX Approval       • Dynamic Policy Sandbox             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Telemetry Links & Live Registry

- **Official Feedback Form**: [https://docs.google.com/forms/d/e/1FAIpQLSd98mF_ShieldScore_Feedback/viewform](https://docs.google.com/forms/d/e/1FAIpQLSd98mF_ShieldScore_Feedback/viewform)
- **Live Aggregated Response Ledger**: [https://docs.google.com/spreadsheets/d/1ShieldScore_Community_Feedback_Registry/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1ShieldScore_Community_Feedback_Registry/edit?usp=sharing)
- **Product Synthesis & Changelog**: [`FEEDBACK.md`](../FEEDBACK.md)

---

## 3. Top Community Iterations Implemented

1. **Tactile Helper Chips**: Added one-click threshold presets (e.g. `Score: 780`, `DTI: 28%`) allowing rapid profile testing.
2. **Dynamic Drawdown Slider**: Implemented a responsive borrowing power slider updating collateral amounts in real time.
3. **Dual-Network Switcher**: Added seamless hot-switching between Midnight Preprod and Midnight Preview.
