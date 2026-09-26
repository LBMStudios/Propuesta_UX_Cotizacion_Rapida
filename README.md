# ONE-CLICK QUOTE & RETENTION ENGINE
### UX ARCHITECTURE & SINGLE-SCREEN FAST QUOTATION PROTOTYPE
`UNIVERSAL ASSISTANCE URUGUAY (A COMPANY OF ZURICH)` · `LBM STUDIOS ARCHIVE 04/06`

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ CASE STUDY: 04/06                                                       │
│ PROJECT:    ONE-CLICK QUOTE & RETENTION (UX PROTO & DATA ARCHITECTURE)  │
│ CLIENT:     UNIVERSAL ASSISTANCE URUGUAY (A COMPANY OF ZURICH)          │
│ ROLE:       LEAD UX DESIGNER & COMMERCIAL SYSTEMS ARCHITECT             │
│ STACK:      HTML5 · ES6 · KEYBOARD-FIRST ACCELERATOR · SIEBEL CRM DATA │
│ STATUS:     COMPREHENSIVE SPECIFICATION & INTERACTIVE PROTOTYPE         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 01 // PROBLEM STATEMENT & OPERATIONAL FRICTION

During inbound phone sales and call center interactions at **Universal Assistance Uruguay**, commercial agents faced severe operational friction with legacy CRM Siebel workflows:
* **Multi-Window Latency:** 8 to 12 separate modal dialogues and pop-ups required to price a simple itinerary.
* **Manual Agreement Math:** Commercial discounts for Uruguayan bank agreements (Itaú, OCA, SEMM, Santander, BROU) had to be looked up on external PDF cheat-sheets and calculated manually.
* **Lead Hemorrhage:** Average quote duration exceeded **4 minutes and 30 seconds**, driving high caller drop-off before closing.

**One-Click Quote & Retention** radically transforms this into a keyboard-accelerated, single-screen experience reducing total quote turnaround to under **20 seconds**.

```
[ INBOUND CALL ] ──▶ [ COL 1: TRIP & CONTACT ] ──▶ [ COL 2: AGREEMENTS (ITAÚ/OCA) ] ──▶ [ COL 3: TRIPLE TIER QUOTE ]
  (Caller Audio)          (Keyboard Fast Entry)            (Instant 1-Click Math)             (Instant WhatsApp Link)
```

---

## 02 // THREE-COLUMN SINGLE-SCREEN ARCHITECTURE

The application eliminates modal windows entirely, organizing the screen into three synchronous columns:

### Column 1: Contact & Travel Parameters
* Rapid single-field traveler name entry.
* Smart Uruguayan phone parser (`09x` detection triggers immediate WhatsApp dispatch capability).
* Dynamic travel duration and passenger age clustering (Adults, Seniors 65+, Children).

### Column 2: Bank Agreements & Add-on Packs
* Visual agreement selectors with auto-calculation: **Itaú (25% OFF)**, **OCA (20% OFF / 12 cuotas)**, **SEMM**, **Mastercard**, **Santander**, **Scotiabank**, **ANDA**, **BROU**.
* Instant upgrade toggles: *Preexistencias Médicas*, *Tecnología Protegida*, *Deportes Extremos*, *Mascotas*, *Cancelación Any Reason*.

### Column 3: Triple-Tier Proposal Grid
* Side-by-side comparative pricing: **Básico / Master**, **Maximum / Value (Best Value)**, **Excellence Plus (Premium)**.
* Strikethrough list pricing vs discounted partner rate.
* 1-click export actions: `[F8]` Send via WhatsApp / Email, `[F9]` Export directly to Siebel payment gateway.

---

## 03 // TECHNICAL MATRIX

| Dimension | Specification |
|:---|:---|
| **Architecture** | Single-Screen Reactive SPA (Zero Popups) |
| **Interaction Model** | Keyboard-first: `[F4]` Apply Agreements, `[F8]` Dispatch WA, `[F9]` Siebel Export, `[F10]` Reset |
| **Banking Engine** | Real-time discount matrix for all active Uruguayan financial entities |
| **CRM Interop** | Schema alignment with Siebel CRM Opportunity & Policy records |
| **Compliance** | Strict Brand Guidelines: Zurich endorsement, clear benefit ceilings |

---

## 04 // REPOSITORY STRUCTURE

```text
├── index.html                           # Full interactive working prototype
├── Documento_UX_Cotizador_Rapido.md     # UX design system, screen choreography & flow rationale
├── Ordenanza_de_Datos_Arquitectura.md   # Data normalization rules & Siebel field mapping
├── Notas_Reunion_Proceso_Comercial.md   # Stakeholder discovery notes & operational benchmarks
├── extraer-portal.js                   # Extraction script for portal catalog definitions
├── src/                                 # Prototype component logic
└── package.json
```

---

## 05 // LAUNCHING THE INTERACTIVE PROTOTYPE

```bash
# 1. Start lightweight local preview
npx serve . -p 3000
```

Open `http://localhost:3000` to interact with the full single-screen quote engine.

---

```text
© 2026 LBM STUDIOS // LUCAS BEATHYATE MASCHERINI. ALL RIGHTS RESERVED.
DEVELOPED FOR UNIVERSAL ASSISTANCE URUGUAY (A COMPANY OF ZURICH).
```
