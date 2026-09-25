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
  *"We start by connecting to the Midnight Preview network. ShieldScore connects either via the Lace Midnight wallet extension or through direct client proof sessions, giving us instant zero-friction access to the privacy ledger."*

---

### STEP 2: Ingest Verified Financial Credentials
**[TASK: Load authentic, cryptographically signed credit attestation into private browser RAM]**

* **Go to:** Center of the screen.
* **Click button:** **`Explore Interactive Demo`** (in the hero banner, or click the **`Borrower Passport`** tab in the navbar).
* **Screen lands on:** `STEP 1 • VERIFIABLE FINANCIAL ATTESTATION INGESTION`.
* **Under the title, you will see 4 data source cards:**
  * Card 1: **Experian Credit Bureau** (FICO 790)
  * Card 2: **Equifax Verified API** (Cashflow 730)
  * Card 3: **TransUnion Zero-Trust** (TLS 760)
  * Card 4: **Decentralized Oracle Node** (Dev Sandbox)
* **Click card:** **`Experian Credit Bureau`** (1st card on the left).
* **Values automatically populated into the form:**
  * **Credit Score:** `790`  
    *Why this value:* Must be $\ge 700$ (the baseline lender threshold). A 790 score proves exceptional creditworthiness and qualifies you for Tier A Prime (lowest interest rate and lowest collateral).
  * **Annual Income (USD):** `120000` ($120,000)  
    *Why this value:* Must be $\ge \$50,000$. Proves strong recurring earning capacity to service debt obligations.
  * **Monthly Debt (USD):** `2800` ($2,800)  
    *Why this value:* Automatically calculates Debt-to-Income (DTI) at 28.0% (well below the lender's 40% maximum ceiling). The banking golden ratio is under 30%.
  * **Collateral Buffer Value (USD):** `210000` ($210,000)  
    *Why this value:* Automatically calculates 210.0% collateral coverage (exceeds the 150% minimum solvency benchmark).
  * **Identity Blinding Salt:** Auto-filled with a 256-bit cryptographic witness key.  
    *Why this value:* A secret random blinding salt. Even if another user shares a 790 score, this salt ensures the cryptographic hash is completely unique, preventing external observers from linking loans.
* **Notice the green badge that lights up:** `CRYPTOGRAPHIC SIGNATURE VERIFIED` with issuer `did:key:z6MkuExperianUS04`.
* **User Perspective / Voiceover:**  
  *"Rather than self-reporting unverified numbers, the borrower loads a cryptographically signed attestation from Experian directly into their local browser RAM. Crucially, this financial data never leaves the user's device—it remains strictly in private memory."*

---

### STEP 3: Execute Local Compact ZK Circuit
**[CIRCUIT: `verifyCreditPassport()` — Zero-Knowledge Solvency Proof Generation]**

* **Go to:** Bottom of the credential vault form.
* **Click button:** **`Generate Private ZK Proof & Disclose Result`** (large cyan button).
* **What happens behind the scenes (~2 seconds):**
  1. The local Compact ZK circuit executes in your browser's private memory.
  2. It asserts all underwriting invariants:  
     $$\text{score} \ge 700 \;\wedge\; \text{income} \ge \$50,000 \;\wedge\; \text{DTI} \le 40\% \;\wedge\; \text{collateral} \ge 150\%$$
  3. All mathematical assertions pass, assigning Risk Tier 1 (Prime).
  4. A succinct Groth16 ZK-SNARK proof ($\pi$) and blinded Pedersen commitment are generated and verified on Midnight Preview.
* **Visual Result:** Screen smoothly reveals `STEP 2 • VERIFIER & PUBLIC LEDGER AUDIT`:
  * **Badge:** `STATUS: VERIFIED • ZK-SNARK VALID` (green checkmark).
  * **Risk Tier:** `Tier A — Prime Solvency` (cyan glowing text).
  * **Blinded Commitment (ZK Witness):** Shows `0x4bb06f8e4e3a...` with a note: *"Private witness salt kept secret from public view"*.
  * **Settlement Block:** `#1016024`.
  * **On-Chain Contract:** Clickable link `0x0794f000...` that opens the live contract on Midnight Preview Explorer!
  * **Top Right Link:** Click **`Audit in Preview Explorer ↗`** to show the live contract on camera!
  * **Right Terminal JSON:** Displays live on-chain state with `containsPersonallyIdentifiableInformation: false` (0 PII leaked).
* **User Perspective / Voiceover:**  
  *"We invoke Midnight's Compact circuit `verifyCreditPassport`. The circuit evaluates all mathematical solvency constraints locally. The blockchain records that the applicant is Tier A Prime, but zero personally identifiable financial information—no income, no score, no debt—is ever revealed on-chain."*

---

### STEP 4: Transfer Verified Proof to DeFi Loan Engine
**[TASK: Bridge verified credit passport to decentralized undercollateralized lending pool]**

* **Go to:** Inside the verified result card (bottom-left).
* **Click button:** **`Apply Verified Passport to DeFi Loan Engine →`** (cyan button).
* **Visual Result:** The app smoothly transitions directly to the **DeFi Loan Engine** section.
* **User Perspective / Voiceover:**  
  *"Now we apply our verified zero-knowledge passport directly into the lending market with a single click, without re-entering any data."*

---

### STEP 5: Configure Undercollateralized Borrowing Terms
**[TASK: Lock in high-efficiency borrowing terms with 70% collateral reduction]**

* **Go to:** Left card under **Requested Borrow Amount**.
* **Action:** Drag the slider to **`$50,000`** (or drag to **`$100,000`**).
* **Why this matters / Hover mouse over the comparison metrics on the right:**
  * **Borrow APR:** Notice the APR drops from **14.8%** (anonymous DeFi penalty) down to **6.2% fixed APR**!
  * **Interest Savings:** Highlights over **$4,300+ saved** in interest costs.
  * **Required Collateral:** Drops from **180%** ($90,000 in Maker/Aave) down to **110%** ($55,000 in ShieldScore).
  * **Capital Freed Up:** Points to **+$35,000 of liquid capital** freed up for the borrower to use elsewhere instead of locking it in an overcollateralized vault.
* **Click button:** **`Lock Instant Zero-Knowledge Loan Offer`** (cyan button at the bottom).
* **Visual Result:** A green confirmation banner appears: *"Loan Term Sheet Locked at 6.2% APR for 24 hours with 110% collateral requirement."*
* **User Perspective / Voiceover:**  
  *"Because the borrower proved Tier A creditworthiness through Midnight, their borrowing rate drops from 14.8% to 6.2%, and collateral requirements drop from 180% to 110%, unlocking massive capital efficiency in DeFi."*

---

### STEP 6: Institutional Underwriting Policy Configuration
**[CIRCUIT: `updatePolicy()` — On-Chain Lender Underwriting Configuration]**

* **Go to:** Top navigation bar.
* **Click tab:** **`Lender Console`** (3rd tab).
* **Screen displays:** *Institutional Underwriting & Policy Governance*.
* **In the left form, adjust these values:**
  * **Minimum Credit Score:** Drag slider to **`710`** (was 700).  
    *Why change this:* As an institutional underwriter, tightening the credit floor in response to market volatility.
  * **Minimum Annual Income ($):** Drag slider to **`$55,000`** (was $50,000).  
    *Why change this:* Updates baseline verifiable salary requirement.
  * **Maximum Debt-to-Income (%):** Adjust slider to **`38%`** (was 40%).
  * **Minimum Collateral Ratio (%):** Adjust slider to **`160%`** (was 150%).
* **Click button:** **`Commit Policy to Midnight Preview Ledger`** (cyan button at bottom).
* **What happens behind the scenes:** Invokes the Midnight smart contract circuit `updatePolicy()` to write these updated underwriting thresholds directly into the public ledger state.
* **Visual Result:** A green confirmation box appears:
  * *"Policy parameters committed to Midnight Preview ledger!"*
  * Displays Tx: `00c2304e46dfba925be34227e69b9b2876b3117b...` with a clickable link: **`Audit on Explorer ↗`**.
* **User Perspective / Voiceover:**  
  *"Lenders publish their underwriting policies transparently on Midnight using the `updatePolicy` circuit. Lenders maintain total risk control, while borrowers can verify against those rules with complete privacy."*

---

### STEP 7: Dual-State Cryptographic Audit & Unit Economics
**[TASK: Demonstrate Midnight's dual-state ledger model & protocol business model]**

* **Go to:** Top navigation bar.
* **Click tab:** **`Dual-State Audit`** (4th tab).
* **Screen displays:** Side-by-side comparison of **Private Witness State** vs **Public Consensus State**.
  * **Left Column (Private Witness / RAM Only):** Points out Credit Score (790), Annual Income ($120k), Debt ($2.8k/mo), and Secret Blinding Salt. Highlight that these variables are cryptographically sealed.
  * **Right Column (Public Consensus / Midnight Ledger):** Points out Verified Boolean (`true`), Assigned Tier (`Tier A`), Settlement Block (`#1016024`), and Contract Address (`0x0794f000...`).
* **Scroll down to Protocol Unit Economics:**
  * Shows **$14.2M Origination Capacity**, **$1.13M Projected Annual Revenue**, and **+42.5% Collateral Efficiency Gain**.
* **User Perspective / Voiceover:**  
  *"This is the breakthrough of Midnight Network: private financial inputs stay strictly with the user, while the verified proof is settled transparently on the public ledger. ShieldScore solves the multi-billion-dollar overcollateralization problem in DeFi."*
