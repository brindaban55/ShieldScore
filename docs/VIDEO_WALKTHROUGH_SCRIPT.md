# ShieldScore — Official Video Recording & Demonstration Script

> **Purpose**: Step-by-step, button-by-button instructions for screen recording the live Midnight hackathon demonstration video.

---

### 🎬 Screen Recording Pre-Flight Checklist
- Browser URL: `http://localhost:5174/` (or production URL)
- Window: Full screen (1080p / 16:9), zoom at 100%
- Mic: Active for voiceover / narration

---

## 📹 Complete Step-by-Step Recording Flow

### STEP 1: Wallet Connection
**[TASK: Authenticate client session with Midnight Preview dual-state ledger]**

* **Go to:** Top-right corner of the navigation bar.
* **Click button:** **`Connect Wallet`** (bright cyan button).
* **In the popup modal:**
  * Click button: **`Preview Explorer Mode Launch →`** (the 4th option at the bottom).
  * *(Or select Lace / 1AM if you have the extension installed).*
* **Visual Result:** The modal closes. The navbar displays your connected address `mn_addr_preview170a...` with a green live pulse indicator.
* **User Perspective / Voiceover:**  
  *"We start by connecting to the Midnight Preview network. ShieldScore connects either via the Lace Midnight wallet extension or through direct client proof sessions, giving institutional counterparties instant zero-friction access to the confidential solvency ledger."*

---

### STEP 2: Ingest Verified Institutional Financial Credentials
**[TASK: Load authenticated, cryptographically signed solvency attestation into private browser RAM]**

* **Go to:** Center of the screen.
* **Click button:** **`Explore Interactive Demo`** (in the hero banner, or click the **`Solvency Attestation`** tab in the navbar).
* **Screen lands on:** `STEP 1 • VERIFIABLE FINANCIAL ATTESTATION INGESTION`.
* **Under the title, you will see 4 data source cards:**
  * Card 1: **Institutional Credit Bureau** (Solvency 790)
  * Card 2: **Verified Financial API** (Cashflow 730)
  * Card 3: **Zero-Trust Audit Node** (TLS 760)
  * Card 4: **Decentralized Oracle Node** (Dev Sandbox)
* **Click card:** **`Institutional Credit Bureau`** (1st card on the left).
* **Values automatically populated into the form:**
  * **Solvency Score:** `790`  
    *Why this value:* Must be $\ge 700$ (the baseline underwriting covenant). A 790 score proves investment-grade solvency and qualifies for Tier A (lowest facility rate and lowest collateral requirement).
  * **Verifiable Revenue / AUM (USD):** `120000` (\$120,000)  
    *Why this value:* Must be $\ge \$50,000$. Proves strong recurring revenue capacity to service debt obligations.
  * **Monthly Debt Service (USD):** `2800` (\$2,800)  
    *Why this value:* Automatically calculates Debt Service Coverage Ratio (DSCR) at 28.0% (well below the covenant's 40% maximum ceiling). The institutional golden ratio is under 30%.
  * **Collateral Coverage Value (USD):** `210000` (\$210,000)  
    *Why this value:* Automatically calculates 210.0% collateral coverage (exceeds the 150% minimum solvency covenant).
  * **Identity Blinding Salt:** Auto-filled with a 256-bit cryptographic witness key.  
    *Why this value:* A secret random blinding salt. Even if another counterparty shares a 790 score, this salt ensures the cryptographic hash is completely unique, preventing external observers from linking transactions or identifying counterparties.
* **Notice the green badge that lights up:** `CRYPTOGRAPHIC SIGNATURE VERIFIED` with issuer `did:key:z6MkuInstitutionalUS04`.
* **User Perspective / Voiceover:**  
  *"Rather than sharing full audited financials with every syndicate member, the institutional counterparty loads a cryptographically signed solvency attestation directly into their local browser RAM. This proprietary financial data never leaves the counterparty's device — it remains strictly in private memory, invisible to the network."*

---

### STEP 3: Execute Local Compact ZK Circuit
**[CIRCUIT: `verifyCreditPassport()` — Zero-Knowledge Confidential Solvency Proof Generation]**

* **Go to:** Bottom of the credential vault form.
* **Click button:** **`Generate Private ZK Proof & Disclose Result`** (large cyan button).
* **What happens behind the scenes (~2 seconds):**
  1. The local Compact ZK circuit executes in your browser's private memory.
  2. It asserts all underwriting covenant invariants:  
     $$\text{solvency} \ge 700 \;\wedge\; \text{revenue} \ge \$50,000 \;\wedge\; \text{DSCR} \le 40\% \;\wedge\; \text{collateral} \ge 150\%$$
  3. All mathematical assertions pass, assigning Risk Tier 1 (Investment Grade).
  4. A succinct Groth16 ZK-SNARK proof ($\pi$) and blinded Pedersen commitment are generated and verified on Midnight Preview.
* **Visual Result:** Screen smoothly reveals `STEP 2 • VERIFIER & PUBLIC LEDGER AUDIT`:
  * **Badge:** `STATUS: VERIFIED • ZK-SNARK VALID` (green checkmark).
  * **Risk Tier:** `Tier A — Investment Grade` (cyan glowing text).
  * **Blinded Commitment (ZK Witness):** Shows `0x4bb06f8e4e3a...` with a note: *"Private witness salt kept secret from public view"*.
  * **Settlement Block:** `#1016024`.
  * **On-Chain Contract:** Clickable link `0x0794f000...` that opens the live contract on Midnight Preview Explorer!
  * **Top Right Link:** Click **`Audit in Preview Explorer ↗`** to show the live contract on camera!
  * **Right Terminal JSON:** Displays live on-chain state with `containsProprietaryFinancialData: false` (0 proprietary data leaked).
* **User Perspective / Voiceover:**  
  *"We invoke Midnight's Compact circuit `verifyCreditPassport`. The circuit evaluates all solvency covenant constraints locally. The blockchain records that the counterparty qualifies as Tier A Investment Grade, but zero proprietary financial data — no revenue, no solvency score, no debt service — is ever revealed on-chain. This is the breakthrough: institutional-grade underwriting with complete financial confidentiality."*

---

### STEP 4: Transfer Verified Proof to Capital Facility Engine
**[TASK: Bridge verified solvency attestation to decentralized capital facility pricing]**

* **Go to:** Inside the verified result card (bottom-left).
* **Click button:** **`Apply Verified Passport to Capital Facility Engine →`** (cyan button).
* **Visual Result:** The app smoothly transitions directly to the **Capital Facility Engine** section.
* **User Perspective / Voiceover:**  
  *"Now we apply our verified zero-knowledge solvency passport directly into the capital facility pricing engine with a single click, without re-entering any data or sharing any proprietary financials."*

---

### STEP 5: Configure Capital-Efficient Facility Terms
**[TASK: Lock in institutional-grade facility terms with 70% collateral reduction]**

* **Go to:** Left card under **Requested Facility Amount**.
* **Action:** Drag the slider to **`$50,000`** (or drag to **`$100,000`**).
* **Why this matters / Hover mouse over the comparison metrics on the right:**
  * **Facility APR:** Notice the APR drops from **14.8%** (anonymous DeFi penalty) down to **6.2% fixed APR**!
  * **Interest Savings:** Highlights over **\$4,300+ saved** in interest costs.
  * **Required Collateral:** Drops from **180%** (\$90,000 in Maker/Aave) down to **110%** (\$55,000 in ShieldScore).
  * **Capital Freed Up:** Points to **+\$35,000 of liquid capital** freed up for redeployment instead of locking in an overcollateralized vault.
* **Click button:** **`Lock Instant Zero-Knowledge Facility Offer`** (cyan button at the bottom).
* **Visual Result:** A green confirmation banner appears: *"Facility Term Sheet Locked at 6.2% APR for 24 hours with 110% collateral requirement."*
* **User Perspective / Voiceover:**  
  *"Because the counterparty proved Tier A solvency through Midnight, their facility rate drops from 14.8% to 6.2%, and collateral requirements drop from 180% to 110%, unlocking massive capital efficiency for institutional private credit."*

---

### STEP 6: Institutional Underwriting Covenant Configuration
**[CIRCUIT: `updatePolicy()` — On-Chain Institutional Covenant Governance]**

* **Go to:** Top navigation bar.
* **Click tab:** **`Underwriting Console`** (3rd tab).
* **Screen displays:** *Institutional Underwriting & Covenant Governance*.
* **In the left form, adjust these values:**
  * **Minimum Solvency Score:** Drag slider to **`710`** (was 700).  
    *Why change this:* As an institutional risk committee, tightening the solvency floor in response to credit cycle deterioration.
  * **Minimum Verifiable Revenue (\$):** Drag slider to **`$55,000`** (was \$50,000).  
    *Why change this:* Updates baseline verifiable revenue covenant.
  * **Maximum Debt Service Coverage (%):** Adjust slider to **`38%`** (was 40%).
  * **Minimum Collateral Coverage (%):** Adjust slider to **`160%`** (was 150%).
* **Click button:** **`Commit Covenant to Midnight Preview Ledger`** (cyan button at bottom).
* **What happens behind the scenes:** Invokes the Midnight smart contract circuit `updatePolicy()` to write these updated underwriting covenants directly into the public ledger state.
* **Visual Result:** A green confirmation box appears:
  * *"Covenant parameters committed to Midnight Preview ledger!"*
  * Displays Tx: `00c2304e46dfba925be34227e69b9b2876b3117b...` with a clickable link: **`Audit on Explorer ↗`**.
* **User Perspective / Voiceover:**  
  *"Risk committees publish their underwriting covenants transparently on Midnight using the `updatePolicy` circuit. Institutional lenders maintain total governance control over risk parameters, while counterparties can verify against those covenants with complete financial confidentiality."*

---

### STEP 7: Dual-State Cryptographic Audit & Protocol Economics
**[TASK: Demonstrate Midnight's dual-state ledger model & institutional capital efficiency]**

* **Go to:** Top navigation bar.
* **Click tab:** **`Dual-State Audit`** (4th tab).
* **Screen displays:** Side-by-side comparison of **Private Witness State** vs **Public Consensus State**.
  * **Left Column (Private Witness / RAM Only):** Points out Solvency Score (790), Verifiable Revenue (\$120k), Debt Service (\$2.8k/mo), and Secret Blinding Salt. Highlight that these variables are cryptographically sealed and never transmitted.
  * **Right Column (Public Consensus / Midnight Ledger):** Points out Verified Boolean (`true`), Assigned Tier (`Tier A`), Settlement Block (`#1016024`), and Contract Address (`0x0794f000...`).
* **Scroll down to Protocol Unit Economics:**
  * Shows **\$14.2M Origination Capacity**, **\$1.13M Projected Annual Revenue**, and **+42.5% Collateral Efficiency Gain**.
* **User Perspective / Voiceover:**  
  *"This is the breakthrough of Midnight Network: proprietary institutional financial data stays strictly with the counterparty, while the verified solvency attestation is settled transparently on the public ledger. ShieldScore solves the multi-billion-dollar overcollateralization problem in institutional private credit and RWA origination."*
