# AGENTS.md

## SAYRAB DEVELOPMENT RULES

### Project Identity
Sayrab is an integrated fundraising and merchandise platform with three operational modules:
1. **User Module:** Fundraisers and Donors.
2. **Admin Module:** Platform administrators, verification, and oversight.
3. **Manufacturer Module:** Tech packs, sampling, production, shipping, and quotation proposals.

It also contains public-facing pages, including Home, Campaigns, Campaign Details, Donations, Merchandise Store, Product Details, Cart, Checkout, Order Tracking, Reviews, and About Us.

---

### Non-Negotiable Development Rules
1. **Existing Application:** This is an existing application, not a new project.
2. **No Rebuilds from Scratch:** Never rebuild an existing working module from scratch.
3. **Preserve Navigation & Options:** Never remove existing dashboard options or navigation links.
4. **Preserve Identifiers & Endpoints:** Never rename existing routes, API endpoints, database fields, or status identifiers unless explicitly requested and justified.
5. **No Mock Downgrades:** Never replace working integrations with mock implementations.
6. **Preserve Security & Access:** Never change authentication, authorization, or role permissions.
7. **Protect Financial Logic:** Never modify financial calculation logic.
8. **Preserve Business Workflows:** Never alter campaign, donation, order, production, shipping, or payout workflows.
9. **No Unnecessary Migrations:** Never introduce unnecessary database migrations.
10. **Preserve Feature Parity:** Never delete existing features to simplify the UI.
11. **Component Hygiene:** Do not introduce duplicate components or redundant API calls.
12. **Shared Component Safety:** Preserve existing functionality when improving shared components.
13. **Data Integrity:** Do not fabricate dashboard statistics, reviews, payments, or other application data.
14. **Approval for Destructive Actions:** Ask for approval before destructive changes, data migrations, or operations that could affect production systems.

---

### Brand Design System
- **Primary Green:** `#89ca2e`
- **Dark Green:** `#367c35`
- **Secondary Green:** `#b4df76`
- **Dark Navy:** `#10182b`
- **Main Text:** `#172033`
- **Secondary Text:** `#64748b`
- **Main Background:** `#f7f9f5`
- **Card Background:** `#ffffff`
- **Border:** `#e5e9e3`
- **Logo Height:** `h-20` everywhere.

Use consistent typography, spacing, cards, buttons, form fields, and icons.

---

### Dashboard Design Rules
- **Public Website:** Green and white theme using brand colors.
- **Fundraiser Dashboard:** Light theme with green accents.
- **Donor Dashboard:** Light theme with green accents.
- **Admin Dashboard:** White sidebar and light content area.
- **Manufacturer Dashboard:** Dark navy sidebar and light content area with cyan/green accents.

The Admin and Manufacturer dashboard navigation structures must remain strictly intact.

---

### Financial Integrity
The existing eligible merchandise revenue-sharing structure is:
- **50%** – Fundraiser Organization (`REVENUE_SPLIT.ORGANIZATION = 0.50`)
- **45%** – Manufacturer (`REVENUE_SPLIT.MANUFACTURER = 0.45`)
- **5%** – Sayrab Platform (`REVENUE_SPLIT.SAYRAB = 0.05`)

- Use existing backend-calculated financial values.
- Do not apply this split automatically to ordinary campaign donations (which go directly to verified campaign funds).
- Never independently recalculate or hardcode financial records in the frontend.

---

### Development Workflow
For every major implementation stage:
1. **Inspect:** Inspect the existing implementation.
2. **Baseline Status:** Record the baseline build and test status.
3. **Plan:** Prepare an implementation plan.
4. **Impact Analysis:** Identify the files and modules affected.
5. **Approval:** Wait for plan review before coding.
6. **Scoped Changes:** Make scoped UI changes according to design guidelines.
7. **Run Tests:** Run relevant existing tests.
8. **Production Build:** Run the production build (`npm --prefix frontend run build`).
9. **Start Application:** Start the application locally.
10. **Verification:** Perform browser-based visual and functional verification where available.
11. **Diff Review:** Review all modified and deleted files.
12. **Walkthrough:** Generate a walkthrough documenting the changes and verification results.

- **Truth in Testing:** Never claim a test passed unless it was actually executed.
- **Transparent Reporting:** Report tests that could not be run.
- **Respect User Work:** Keep existing uncommitted user changes untouched.
- **Stage Progression:** Do not automatically proceed to the next Sayrab module without explicit instruction.
