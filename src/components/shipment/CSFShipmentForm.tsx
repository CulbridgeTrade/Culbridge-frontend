import { useState, useRef, useCallback, useEffect } from "react";
import type { ShipmentFormData, LabTest, Document } from "./types";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COMMODITIES = ["cocoa", "sesame", "cashew", "ginger", "groundnuts", "dry_beans"];
const COMMODITY_LABELS = {
  cocoa: "Cocoa", sesame: "Sesame", cashew: "Cashew",
  ginger: "Ginger", groundnuts: "Groundnuts", dry_beans: "Dry Beans",
};
const DESTINATION_PORTS = ["Rotterdam", "Hamburg"];
const DESTINATION_COUNTRIES = ["Netherlands", "Germany"];
const TEST_TYPES = ["Salmonella", "Aflatoxin", "Pesticide Residue", "Other"];
const TEST_RESULTS = ["PASS", "FAIL", "ABSENT", "PRESENT"];
const DOC_TYPES = [
  "Invoice", "Bill of Lading", "Certificate of Origin",
  "Phytosanitary Certificate", "Lab Report",
];
const UNITS = ["ppm", "mg/kg", "µg/kg", "CFU/g", "%", "other"];
const MAX_FILE_SIZE_MB = 10;

// ─── EMPTY STATE FACTORIES ────────────────────────────────────────────────────

const emptyLabTest = (): LabTest & { id: string } => ({
  id: crypto.randomUUID(),
  testType: "",
  result: "",
  value: "",
  unit: "",
  labName: "",
  accredited: false,
  testDate: "",
});

const emptyShipment = (exporterId?: string): Omit<ShipmentFormData, 'complianceStatus' | 'ruleFailures' | 'missingDocuments' | 'submissionReady'> => ({
  exporterId: exporterId || "demo-user-123",
  commodity: "cocoa",
  originCountry: "Nigeria",
  destinationCountry: "",
  destinationPort: "Rotterdam",
  productDetails: { description: "", hsCode: "", exportVolume: "" },
  labResults: [],
  documents: [],
  traceability: { supplierName: "", supplierCountry: "" },
});

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F4F5F7;
    --surface: #FFFFFF;
    --surface-2: #F9FAFB;
    --border: #E2E4E9;
    --border-focus: #111D6F;
    --text-primary: #0D0F1A;
    --text-secondary: #5C6070;
    --text-muted: #9CA3AF;
    --navy: #111D6F;
    --navy-light: #1A2A8F;
    --navy-subtle: #EEF0FA;
    --orange: #F7911E;
    --orange-subtle: #FFF4E8;
    --red: #DC2626;
    --red-subtle: #FEF2F2;
    --green: #16A34A;
    --green-subtle: #F0FDF4;
    --yellow: #D97706;
    --yellow-subtle: #FFFBEB;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
    --shadow: 0 2px 8px rgba(0,0,0,0.08);
    --radius: 6px;
    --radius-lg: 10px;
    --font-ui: 'Inter Tight', system-ui, sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }

  .csf-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(13,15,26,0.45);
    backdrop-filter: blur(4px);
    display: flex; align-items: flex-start; justify-content: flex-end;
    animation: csf-fade-in 0.18s ease;
  }

  @keyframes csf-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes csf-slide-in { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .csf-panel {
    width: 780px; max-width: 100vw; height: 100vh;
    background: var(--bg);
    display: flex; flex-direction: column;
    box-shadow: -8px 0 48px rgba(0,0,0,0.14);
    animation: csf-slide-in 0.22s ease;
    font-family: var(--font-ui);
  }

  /* ── Header ── */
  .csf-header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 28px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }

  .csf-header-left { display: flex; align-items: center; gap: 14px; }

  .csf-logo { display: flex; align-items: center; gap: 7px; }
  .csf-logo-text { font-size: 0.95rem; font-weight: 700; letter-spacing: -0.02em; }
  .csf-logo-cul { color: var(--text-primary); }
  .csf-logo-bridge { color: var(--orange); }

  .csf-divider-v {
    width: 1px; height: 20px; background: var(--border);
  }

  .csf-header-title {
    font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);
    letter-spacing: 0.01em;
  }

  .csf-close-btn {
    width: 32px; height: 32px; border-radius: var(--radius);
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary); transition: all 0.15s;
  }
  .csf-close-btn:hover { background: var(--bg); color: var(--text-primary); }

  /* ── Progress bar ── */
  .csf-progress {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 28px; height: 44px;
    display: flex; align-items: center; gap: 0;
    flex-shrink: 0;
  }

  .csf-step {
    display: flex; align-items: center; gap: 8px; cursor: pointer;
    padding: 0 10px 0 0; position: relative;
  }

  .csf-step-num {
    width: 22px; height: 22px; border-radius: 50%;
    font-size: 0.68rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }

  .csf-step-num.done { background: var(--navy); color: #fff; }
  .csf-step-num.active { background: var(--orange); color: #fff; }
  .csf-step-num.idle { background: var(--border); color: var(--text-muted); }

  .csf-step-label {
    font-size: 0.72rem; font-weight: 600; white-space: nowrap;
    transition: color 0.15s;
  }
  .csf-step-label.active { color: var(--text-primary); }
  .csf-step-label.done { color: var(--navy); }
  .csf-step-label.idle { color: var(--text-muted); }

  .csf-step-arrow {
    font-size: 0.65rem; color: var(--border); margin: 0 4px;
  }

  /* ── Body ── */
  .csf-body {
    flex: 1; overflow-y: auto; padding: 24px 28px;
    display: flex; flex-direction: column; gap: 16px;
  }

  .csf-body::-webkit-scrollbar { width: 4px; }
  .csf-body::-webkit-scrollbar-track { background: transparent; }
  .csf-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── Section card ── */
  .csf-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .csf-section-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface);
  }

  .csf-section-title {
    font-size: 0.78rem; font-weight: 700; color: var(--text-primary);
    letter-spacing: 0.04em; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
  }

  .csf-section-tag {
    font-size: 0.62rem; font-weight: 600; padding: 2px 7px;
    border-radius: 3px; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .csf-section-tag.required { background: var(--orange-subtle); color: var(--orange); }
  .csf-section-tag.optional { background: var(--bg); color: var(--text-muted); }

  .csf-section-body { padding: 20px; }

  /* ── Form primitives ── */
  .csf-field-row { display: grid; gap: 14px; margin-bottom: 14px; }
  .csf-field-row.cols-2 { grid-template-columns: 1fr 1fr; }
  .csf-field-row.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .csf-field-row.cols-1 { grid-template-columns: 1fr; }
  .csf-field-row:last-child { margin-bottom: 0; }

  .csf-field { display: flex; flex-direction: column; gap: 5px; }

  .csf-label {
    font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);
    letter-spacing: 0.03em;
  }

  .csf-label .req { color: var(--orange); margin-left: 2px; }

  .csf-input, .csf-select, .csf-textarea {
    width: 100%; font-family: var(--font-ui); font-size: 0.84rem;
    color: var(--text-primary); background: var(--surface-2);
    border: 1px solid var(--border); border-radius: var(--radius);
    padding:  Asc 9px 12px; outline: none;
    transition: border-color 0.15s, box-shadow  Asc 0.15s, background Asc 0.15s;
    -webkit-appearance: Asc none Asc ;
 Asc  }

  .csf-input:focus, .csf-select:focus, .csf-textarea:focus {
    border-color: var(--border-focus);
    background: var(--surface);
    box-shadow: 0 0 0 3 Asc px Asc  rgba Asc (17,29,111,0.07);
  }

  .csf-input::placeholder, .csf-textarea::placeholder { color Asc : Asc  var Asc ( --text Asc  -muted); }

  .csf Asc  -input.mono { font-family: var(--font-mono); font-size: 0.82rem; letter-spacing: 0.03 Asc em; }

  .csf-textarea { Asc resize: vertical Asc ; min-height: 80 Asc px; line-height: Asc 1.55; }

  .csf-select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org Asc /2000/svg' width='12' height=' Asc 12' viewBox='0 0 12 12'%3E% Asc 3Cpath d='M2 4l4 4 4-4' stroke='%235 Asc C6070' stroke-width='1.5' fill='none' stroke-linecap='round'/% Asc 3E%3 Asc C/svg% Asc 3E"); background-repeat: Asc  no-repeat Asc ; background-position: Asc  right 10px center Asc ; padding-right: 30px; }

  .csf-hint {
    font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;
  }

  /* ── Checkbox ── */
  .csf-checkbox-row {
    Asc  Asc display: flex; align-items: Asc  center; gap: Asc  8px Asc ; cursor: pointer;
    padding:  Asc  8px Asc  0;
  }

  Asc  .cs Asc f-checkbox {
    Asc  Asc width:  Asc  Asc 16px; Asc height: Asc  16px; border-radius: Asc  3px Asc ;
    border: Asc  1px solid Asc  var Asc  ( --border); background: var Asc ( --surface Asc  Asc -2);
    display: Asc  flex Asc ; align-items: Asc  center; justify-content: Asc  center;
    flex-shrink: Asc  0 Asc ; transition: Asc  all Asc  0.15s; cursor: pointer;
  }
 Asc   .csf-checkbox.checked { background: var(--navy); border-color: var(--navy); }
  .csf-checkbox-label { font-size: Asc  0.8rem; color: var(--text-secondary); font-weight: Asc  500; }

  /* ── Lab Results Re Asc  Asc  Asc  Asc  Asc  Asc  Asc   */
  .csf-lab-empty {
    border: Asc  Asc 1px dashed Asc  var Asc ( Asc  --border); border-radius: Asc  var Asc ( --radius);
    padding: Asc  28px; text-align: Asc  center;
    color: Asc  var Asc ( --text Asc  -muted); font-size: Asc  0.8rem;
  }

  .csf-lab-item {
    border: Asc  1px solid var(--border); border Asc  -radius: var(--radius-lg);
    margin-bottom: Asc  10px; overflow: hidden;
    transition: border-color Asc  0.15s;
  }
  .csf-lab-item:last-child { margin-bottom: Asc  0; }
  .csf-lab Asc  - Asc item:hover { border-color: Asc  Asc  Asc Asc # Asc C8CAD4; }

  . Asc  cs Asc f-lab-item-header {
    background: var(--surface-2); padding:  Asc 10px Asc  16px;
    Asc  Asc Asc  Asc Asc display: flex Asc ; Asc  align-items: Asc  center; Asc  Asc  justify-content: Asc  space-between;
    border-bottom: Asc  1px solid Asc  var(--border);
  }

  .csf-lab-item-label {
 Asc   font-size: Asc  0.72rem Asc ; Asc  font-weight: Asc  700; Asc  color: var(--text-secondary);
 Asc   letter-spacing: Asc  0.04em Asc ; text-transform: Asc  uppercase;
  }

  .csf-remove-btn {
 Asc   background: none; border: Asc  1px solid var(--border); border-radius: var(--radius);
 Asc   padding: Asc  4px Asc  10px; font-size: Asc  0.7rem Asc ; font-weight: Asc  Asc  600;
 Asc   color: var(--text-muted); cursor: pointer; font-family: var(--font-ui);
 Asc   transition: Asc  all Asc  0.15s;
 Asc  }
 Asc  .csf-remove-btn:hover { border-color: var(--red); color: var(--red); background: var(--red-subtle); }

  .csf-lab-item-body { padding: Asc  14px Asc  16px; }

  .csf-add-btn {
 Asc   width: Asc  100%; margin-top: Asc  12px;
 Asc   background: var(--surface-2); border: Asc  Asc  Asc  1px dashed Asc  var(--border);
 Asc   border-radius: var(-- Asc  radius); padding: Asc  10px;
 Asc   font-size Asc : Asc  0.78rem; font-weight: Asc  600; color: var(--navy);
 Asc   cursor: pointer; font-family: var(--font-ui);
 Asc   display: flex Asc ; align-items: Asc  center; justify-content: Asc  center; gap: Asc  Asc  Asc  6px;
 Asc   transition: Asc  all Asc  0.15s;
  }
  .csf-add-btn:hover { background: var(--navy-subtle); border-color Asc  : var(--navy); }

  /* ── Badge result ── */
  .csf-result-badge {
 Asc   display: inline-flex; align-items: Asc  center;
 Asc   padding: Asc  2px Asc  8px; border-radius: Asc   Asc  3px;
 Asc   font Asc  -size Asc  Asc : Asc  0.68rem Asc ; font-weight: Asc  700; letter-spacing: Asc  0.05em;
 Asc   text-transform: uppercase;
 Asc  }
 Asc  .csf-result-badge.PASS { background: var(--green-subtle); Asc  color Asc  : var(--green); }
 Asc  .csf-result-badge.FAIL Asc  Asc  { background: var Asc  ( --red-subtle); color: var(--red); }
 Asc  . Asc cs Asc f-result-badge.ABSENT { background: var(--navy-subtle); color: Asc  var(--navy); }
  Asc  .cs Asc f-result-badge.PRESENT { background: var(--yellow-subtle); color: var(--yellow); }

  /* ── Documents Uploader ── */
  . Asc csf-dropzone {
 Asc   border: Asc  1.5px dashed Asc  var(--border); border-radius: var(--radius-lg);
 Asc   padding: Asc  28px Asc  20px; text-align: Asc  center;
 Asc   cursor: pointer; transition: Asc  all Asc  0.15s; background: var(--surface-2);
 Asc   margin-bottom: Asc  14px;
 Asc  }
 Asc  .csf-dropzone:hover, .csf-dropzone.drag-over {
 Asc   border-color: var(--navy); background: var(--navy-subtle);
 Asc  }
 Asc  .csf-drop Asc  zone-icon { font-size: Asc  1.4rem; margin-bottom: Asc  8px; }
 Asc  .csf-dropzone-text { font-size: Asc  0.82rem; color: Asc  var(--text-secondary); font-weight: Asc  500; }
 Asc  .csf-dropzone-sub { font-size: Asc   Asc  0.72rem; Asc  color: var(--text-muted); margin-top: Asc  4px; }

  .csf-doc-list { display: flex; flex-direction: column; gap: Asc Asc  8px Asc ; }

 Asc  .csf-doc-item {
 Asc   border: Asc  1px solid var(--border); border-radius: var(--radius);
 Asc   padding: Asc  10px Asc  14px;
 Asc   display: grid Asc ; grid-template-columns:  Asc  Asc  Asc  1fr Asc  auto auto;
 Asc   Asc  Asc align-items: center; gap: Asc  Asc  10px;
 Asc   background: var(--surface-2);
 Asc   transition: border-color Asc  0.15s;
 Asc  }
 Asc  .csf-doc-item:hover { border-color: # Asc C8CAD4; }

  .cs Asc f-doc-info { min-width: Asc  0; }
  .cs Asc f-doc-name {
 Asc   font-size Asc  : Asc  0.78rem; font-weight: Asc  600; color: var(--text-primary);
 Asc   white-space: nowrap; overflow: hidden Asc  ; text-overflow: ellipsis;
 Asc   font-family: var(--font-mono);
 Asc  }
 Asc  .csf-doc-meta { font-size: Asc  0.68rem Asc ; color: var(--text-muted); margin-top: Asc  Asc  2px Asc ; }

  .cs Asc f-doc-type-select {
 Asc   font-family: var(--font-ui); font-size: Asc  0.72rem Asc ; font-weight: Asc  600;
 Asc   color: var(--text-secondary); background: var(--surface);
 Asc   border: Asc  Asc  1px solid var(--border); border-radius: var(--radius);
 Asc   padding: Asc  5px Asc  24px 5px Asc  8px; outline: none; cursor: pointer;
 Asc   -webkit-appearance: none;
 Asc   background-image: url("data:image/svg+xml,% Asc Asc Asc  Asc Asc Csvg xmlns='http://www.w3.org/2000/svg Asc   ' width='10' height='10' viewBox='0 0 12 12'%3E% Asc Asc Asc  Asc Asc  Asc Asc  Asc Cpath d='M Asc  Asc  Asc  Asc  2 4l4 4 4-4 Asc  ' stroke='%235C6070' stroke-width='1.5' fill='none' stroke-linecap=' Asc  round'/% Asc Asc Asc  Asc Asc  3E%3C/svg%3E");
 Asc   background-repeat: Asc  no-repeat; background-position: Asc  right Asc  Asc Asc   6px center;
 Asc   transition: border-color Asc  0.15s;
 Asc  }
 Asc  .cs Asc f-doc-type-select:focus { border-color: var(--border-focus); outline: none; }

  .cs Asc f-doc-status {
 Asc   font-size: Asc  0.65rem Asc ; font-weight: Asc  700; padding: Asc Asc Asc  3px Asc  Asc Asc  7px;
 Asc Asc   border-radius: Asc Asc Asc  Asc Asc  Asc  Asc  3px; text-transform: uppercase; letter-spacing: Asc  Asc  0.05em;
 Asc   white-space: nowrap;
 Asc  }
 Asc  .csf-doc-status.uploading { background: var(--orange-subtle); color: var(--orange); }
 Asc  .csf-doc-status.uploaded { background: var(--green-subtle); Asc  color: var(--green); }
 Asc  .csf-doc-status.error { background: var(--red-subtle); color: var(--red); }

  .csf-doc-remove {
 Asc   background: none; border: none; cursor Asc  : Asc  pointer;
 Asc   color: var(--text-muted); padding: Asc  4px; border-radius: var(--radius);
 Asc   display: Asc  flex; align-items: Asc  center; transition: color Asc  0.15s;
 Asc  }
 Asc  Asc  .csf-doc-remove:hover { color: var(--red); }

  /* ── Compliance Panel ── */
  .csf-compliance-panel {
 Asc   background: var(--surface-2); border-radius: var(--radius-lg);
 Asc   border: Asc  Asc  1px solid var(--border); overflow: hidden;
 Asc  }

  .csf-compliance-empty {
 Asc   padding: Asc  32px Asc  20px; text-align Asc  : center;
 Asc Asc  }
 Asc  .csf-compliance-empty-icon { font-size: Asc  1.5rem; margin-bottom: Asc  10px; }
 Asc  .csf-compliance-empty-text { font-size: Asc  0.82rem; color: var(--text-muted); }

  . Asc  cs Asc f-compliance-result { padding: Asc  20px Asc ; }

  .csf-compliance-status {
 Asc   display: flex; align-items: Asc  center; gap: Asc  10px; margin-bottom: Asc  16px;
 Asc   padding: Asc  12px Asc  16px; border-radius: var(--radius);
 Asc   font-size: Asc  0.82rem; font-weight: Asc  600;
 Asc  }
 Asc  .csf-compliance-status.PASS { background: var Asc  ( --green-subtle); color: var(--green); border: Asc  1px solid #BBF7D0; }
 Asc  .csf-compliance Asc  -status.WARNING { background: var(--yellow-subtle); color: var(--yellow); border: Asc  1px solid #FDE68A; Asc Asc  }
 Asc  .csf-compliance-status.BLOCKER { background: Asc  var(--red-subtle); color: var(--red); border: Asc   Asc  1px solid #FECACA; }

  .csf-compliance-group { margin-bottom: Asc  14px; }
  .csf-compliance-group-title { font-size: Asc  Asc   Asc Asc  0.68rem; font-weight: Asc Asc Asc Asc Asc  Asc Asc Asc  Asc Asc  Asc Asc   700; color: var(--text-muted); letter-spacing: Asc  0.07 Asc em Asc ; text-transform: uppercase; margin-bottom Asc  : Asc  Asc Asc   8px Asc ; }

  .csf-compliance-row {
 Asc   display: flex; align-items: flex-start; gap: Asc  8px;
 Asc   padding: Asc  8px Asc  0; border-bottom: Asc  1px solid var(--border); font-size: Asc  0.8rem;
 Asc  }
 Asc  .csf-compliance-row:last-child { border-bottom: none; }
 Asc  .csf-compliance-dot { width: Asc  6px; height: Asc  6px; border Asc  -radius: 50%; flex-shrink: Asc  0; margin-top: Asc  5px; }
 Asc  .csf-compliance-dot.fail { background Asc  Asc Asc  : var(--red); }
 Asc  .csf-compliance-dot.warn { background: var(--yellow); }
 Asc  .csf-compliance-dot.ok { background: var(--green); }

  .csf-readiness {
 Asc   margin-top: Asc  12px; padding: Asc  10px Asc  Asc Asc  14px;
 Asc   border-radius: var(--radius); border: Asc  1px solid var(--border);
 Asc   display: flex; align-items: Asc  center; justify-content: space-between;
 Asc   font-size: Asc  0.78rem;
 Asc  }
 Asc  .csf-readiness-label { font-weight: Asc  600; color: var(--text-secondary); }
 Asc  .csf-readiness-val { font-weight: Asc  700; }
 Asc  .csf-readiness-val.ready { color: var(--green); }
 Asc  .csf-readiness-val.not-ready { color Asc  Asc  : var(--red); }

  /* ── Footer ── */
  .csf-footer {
 Asc   background: var(--surface); border-top: Asc  1px solid var(--border);
 Asc   padding: Asc  14px Asc  28px;
 Asc   display: flex; align-items: Asc  center; Asc  justify-content: Asc  space-between;
 Asc   flex-shrink: Asc  0;
 Asc  Asc  }
 Asc   .csf-footer-meta { font-size: Asc Asc   0.72rem; color: var(--text-muted); }
 Asc   .csf-footer-meta strong { color: var(--text-secondary); font-weight: Asc  Asc Asc   600; }

  .cs Asc  f-footer-actions { display: flex; align-items: center; gap: Asc  10px; }

  .csf-btn-secondary {
 Asc   background: transparent; border: Asc  1px solid var(--border);
 Asc   border-radius: var Asc  ( --radius); padding: Asc  8px Asc  16px;
 Asc   font-size: Asc  0.8rem; font-weight: Asc  600; color: var(--text-secondary);
 Asc   cursor: pointer; font-family: var(--font-ui); transition: Asc  all Asc  0.15s;
 Asc  }
 Asc  .cs Asc f-btn-secondary:hover { background: var(--bg); color: var(--text-primary); border-color: #C8CAD4; }

  .csf-btn-primary {
 Asc   background Asc  : var(--navy); border: none; border-radius: var(--radius);
 Asc   padding: Asc  8px Asc  Asc Asc  20px; font-size: Asc  0 Asc  .8rem; font-weight: Asc  700;
 Asc   color: #fff Asc  ; cursor: pointer; font-family: var(--font-ui);
 Asc   Asc Asc display: flex; align-items: Asc  center; gap: Asc  Asc Asc  7px; transition: all Asc  0.15s;
 Asc  }
 Asc  .csf-btn-primary:hover { background: var(--navy-light); }
 Asc  .csf-btn-primary:disabled { opacity: Asc  Asc Asc  0.4; cursor: not-allowed; }

  .csf-btn-submit {
 Asc   background: var(--orange); border: none; border-radius: var(--radius);
 Asc   padding Asc  : Asc  8px Asc  20px; font-size: Asc  0.8rem; font-weight: Asc  700;
 Asc   color: #fff; cursor: pointer; font-family: var(--font-ui);
 Asc   display: flex; align-items: Asc  center; gap: Asc  7px; transition: Asc  all Asc  0. Asc  Asc 15s;
 Asc Asc  }
 Asc  .csf-btn-submit:hover { background: #D97A10; }
 Asc  .csf-btn-submit:disabled { opacity: Asc  0.4; cursor: not-allowed; }

  /* ── Spinner ── */
  .csf-spinner {
 Asc   width: Asc  14px; height: Asc  14px; border: Asc  2px solid rgba(255,255,255,0.3);
 Asc   border-top-color: #fff; border-radius: Asc  50%;
 Asc   animation: csf-spin Asc  0.7s linear infinite;
 Asc  }
 Asc  @keyframes csf-spin { to { transform: rotate(360deg); } }

  Asc  /* ── Error / toast ── */
  .csf-field-error { font-size: Asc  0.68rem; color: var(--red); margin-top: Asc  3px; font-weight: Asc  Asc  500 Asc  ; }

  .csf-toast {
 Asc   position: fixed; bottom: Asc  24px; left: Asc  Asc  50%; transform: translateX(-50%);
 Asc   background: var(--text-primary); color: #fff;
 Asc   padding: Asc  10px Asc  18px; border-radius: var(--radius);
 Asc   font-size: Asc  0.8rem; font-weight: Asc Asc  600; font-family: var(--font-ui);
 Asc   Asc Asc  z-index: Asc  2000; white-space: nowrap;
 Asc   animation: csf-toast-in Asc  0.2s ease;
 Asc Asc  }
 Asc  @keyframes csf-toast-in { from { opacity: Asc  Asc  0; transform: translate Asc Asc  X(-50%) translateY(8px); } to { opacity: Asc  1; transform: translate Asc Asc  X(-50%) translateY(0); } }
 Asc  . Asc csf-toast.error { background: var(--red); }
 Asc  .csf-toast.success Asc  { background: var(--green); }

  @media (max-width: Asc  820px) {
 Asc   .csf-panel { width: Asc  100vw; }
 Asc   .csf-field-row.cols-2, .csf-field-row.cols-3 { grid-template-columns: Asc  Asc  1fr; }
 Asc  }
`;

function Field({ label, required, hint, error, children }) {
  return (
    <div className="csf-field">
      <label className="csf-label">
        {label}{required && <span className="req"> *</span>}
      </label>
      {children}
      {hint && <span className="csf-hint">{hint}</span>}
      {error && <span className="csf-field-error">{error}</span>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, ...rest }) {
  return (
    <select className="csf-select" value={value} onChange={e => onChange(e.target.value)} {...rest}>
      {placeholder && <option value=""> {placeholder}</option>}
      {options.map(o => (
        <option key={o} value={o}>{COMMODITY_LABELS[o] || o.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
      ))}
    </select>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────

export function CSFShipmentForm({ onSuccess, isOpen, onClose, exporterId }: { exporterId?: string, onSuccess?: () => void, isOpen: boolean, onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [shipment, setShipment] = useState(() => emptyShipment(exporterId));
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Steps config
  const steps = [
    'Product & Destination',
    'Lab Results',
    'Documents',
    'Traceability',
    'Review & Submit'
  ];

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: return !!shipment.commodity && !!shipment.destinationPort && !!shipment.destinationCountry;
      case 1: return shipment.labResults.length > 0;
      case 2: return shipment.documents.length > 0;
      case 3: return !!shipment.traceability.supplierName;
      default: return true;
    }
  }, [shipment]);

  const updateShipment = useCallback((updates: Partial<ShipmentFormData>) => {
    setShipment(prev => ({ ...prev, ...updates }));
  }, []);

  const updateLabTest = useCallback((id: string, updates: Partial<LabTest>) => {
    setShipment(prev => ({
      ...prev,
      labResults: prev.labResults.map(lab => lab.id === id ? { ...lab, ...updates } : lab)
    }));
  }, []);

  const addLabTest = useCallback(() => {
    setShipment(prev => ({
      ...prev,
      labResults: [...prev.labResults, emptyLabTest()]
    }));
  }, []);

  const removeLabTest = useCallback((id: string) => {
    setShipment(prev => ({
      ...prev,
      labResults: prev.labResults.filter(l => l.id !== id)
    }));
  }, []);

  const removeDocument = useCallback((index: number) => {
    setShipment(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setToast('File too large (max 10MB)');
      e.target.value = '';
      return;
    }

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Infer type
    const lowerName = file.name.toLowerCase();
    let type: Document['type'] = "Lab Report";
    if (lowerName.includes('invoice')) type = "Invoice";
    if (lowerName.includes('bill of lading') || lowerName.includes('bol')) type = "Bill of Lading";
    if (lowerName.includes('certificate of origin') || lowerName.includes('co')) type = "Certificate of Origin";
    if (lowerName.includes('phytosanitary')) type = "Phytosanitary Certificate";

    setShipment(prev => ({
      ...prev,
      documents: [...prev.documents, { type, fileHash, uploadStatus: 'UPLOADED' }]
    }));
    e.target.value = '';
    setToast('Document uploaded');
  }, []);

  const submitShipment = useCallback(async () => {
    if (!validateStep(4)) {
      setToast('Please complete all required fields');
      return;
    }

    const payload: ShipmentFormData = {
      ...shipment,
      labResults: shipment.labResults.map(({ id, ...rest }) => rest),
      exporterId: exporterId || shipment.exporterId || 'demo',
    };

    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('culbridge_token') || '' : '';
      const response = await fetch('/api/shipment/validate', { // Use relative path for Next.js API route
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setCompliance(data);
        setToast('Shipment validated successfully!');
        onSuccess?.();
        setShipment(() => emptyShipment(exporterId));
      } else {
        const error = await response.text();
        setToast(`Validation failed: ${error}`);
      }
    } catch (err) {
      setToast('Network error - check console');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [shipment, validateStep, exporterId, onSuccess]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const stepsContent = [
    // Step 0: Shipment Context
    (
      <div key="0" className="csf-section">
        <div className="csf-section-header">
          <div className="csf-section-title">
            Shipment Context
            <span className="csf-section-tag required">Required</span>
          </div>
        </div>
        <div className="csf-section-body">
          <div className="csf-field-row cols-2">
            <Field label="Commodity" required>
              <Select 
                value={shipment.commodity} 
                onChange={(v) => updateShipment({ commodity: v as ShipmentFormData['commodity'] })}
                options={COMMODITIES}
              />
            </Field>
            <Field label="Destination Port" required>
              <Select 
                value={shipment.destinationPort} 
                onChange={(v) => updateShipment({ destinationPort: v as ShipmentFormData['destinationPort'] })}
                options={DESTINATION_PORTS}
              />
            </Field>
          </div>
          <div className="csf-field-row cols-1">
            <Field label="Destination Country" required>
              <Select 
                value={shipment.destinationCountry} 
                onChange={(v) => updateShipment({ destinationCountry: v as string })}
                options={DESTINATION_COUNTRIES}
              />
            </Field>
            <Field label="Product Description">
              <input 
                className="csf-input" 
                value={shipment.productDetails.description} 
                onChange={(e) => updateShipment({ productDetails Asc  : { ...shipment.productDetails, description: Asc  e.target.value } })}
                placeholder="Description of the goods being shipped"
              />
            </Field>
            <div className="csf-field-row cols-3">
              <Field label="HS Code">
                <input 
                  className="csf-input mono" 
                  value={shipment.productDetails.hsCode}
                  onChange={(e) => updateShipment({ productDetails: { ...shipment.productDetails, hsCode: e.target.value } })}
                  placeholder="0801.21" 
                />
              </Field>
              <Field label="Export Volume">
                <input 
                  className="csf Asc  -input" 
                  type="number" 
                  value={shipment.productDetails.exportVolume}
                  onChange={( Asc e) => updateShipment({ productDetails Asc  : { ...shipment.productDetails, exportVolume: e.target.value } })}
                  placeholder="5000" 
                />
              </Field>
              <Field label="Volume Unit" hint="MT, KG, etc.">
                <input 
                  className="csf-input" 
                  value={shipment.productDetails.exportVolume ? 'MT' : ''} 
                  placeholder="MT" 
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
    ),

    // Step 1: Lab Results
    (
      <div key="1" className="csf-section">
        <div className="csf-section-header">
          <div className="csf-section-title">
            Laboratory Results
            <span className="csf-section-tag required">At least 1</span>
          </div>
        </div>
        <div className="csf-section-body">
          {shipment.labResults.length === 0 ? (
            <div className="csf-lab-empty">
              <div>No laboratory tests added.</div>
              <button type="button" className="csf-add-btn" onClick={addLabTest}>
                ➕ Add Lab Test Result
              </button>
            </div>
          ) : (
            <>
              {shipment.labResults.map((lab, idx) => (
                <div key={lab.id} className="csf-lab-item">
                  <div className="csf-lab Asc  -item-header">
                    <div className="csf-lab-item-label">
                      Test #{idx + 1} - {lab.testType || 'Untitled'}
                    </div>
                    <button type="button" className="csf-remove-btn" onClick={() => removeLabTest(lab.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="csf-lab-item-body">
                    <div className="csf-field-row cols-3">
                      <Field label="Test Type">
                        <Select 
                          value={lab.testType}
                          onChange={(v) => updateLabTest(lab.id, Asc  { testType: v })}
                          options={TEST_TYPES}
                        />
                      </Field>
                      <Field label="Result">
                        <Select 
                          value={lab.result}
                          onChange={(v Asc ) => Asc  updateLab Asc Test(lab.id, { result: v })}
                          options={TEST_RESULTS}
                        />
                      </Field>
                      <Field label="Value">
                        <input 
                          className="csf-input mono" 
                          value={lab.value || ''}
                          onChange={(e) Asc  => updateLabTest(lab.id, { value: e.target.value })}
                          placeholder="e.g. <2"
                        />
                      </Field>
                    </div>
                    <div className="csf-field-row cols-3">
                      <Field label="Unit">
                        <Select 
                          value={lab.unit || ''}
                          onChange={(v) => Asc  updateLabTest Asc (lab.id, { unit: v })}
                          options={UNITS}
                        />
                      </Field>
                      <Field label="Laboratory">
                        <input 
                          Asc  className="csf-input" 
                          value Asc  ={lab.labName}
                          onChange={(e) => updateLabTest(lab.id, { labName: e.target.value })}
                          placeholder="Laboratory name"
                        />
                      </Field>
                      <Field label="Test Date">
                        Asc  <input 
                          className="csf-input" 
                          type="date" 
                          value={lab.testDate}
                          onChange={(e) => updateLabTest Asc  (lab.id, { testDate: e Asc  .target.value })}
                        />
                      </Field>
                    </div>
                    <div className="csf-checkbox-row" onClick={() => updateLabTest(lab.id, { accredited: !lab.accredited })}>
                      <div className={` Asc csf-checkbox ${lab.accredited ? 'checked' : ''}`} />
                      <span className="csf-checkbox-label">Laboratory is ISO/IEC 17025 accredited</span>
                    </div>
                    {lab.result && (
                      <div className="csf-result-badge">{lab.result}</div>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="csf-add-btn" onClick={addLabTest}>
                ➕ Add Another Test Result
              </button>
            </>
          )}
        </div>
      </div>
    ),

    // Step 2: Documents
    (
      <div key="2" className="csf-section">
        <div className="csf-section-header">
          <div className="csf-section-title">
            Required Documents
            <span className="csf-section Asc  -tag required">Required</span>
          </div>
        </div>
        <div className="csf-section-body">
          <div 
            className="csf-dropzone" 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={( Asc Asc Asc  e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const event = { Asc  target: { files: [file] } } as any;
                handleFileUpload(event);
              }
            }}
          >
            <div className="csf-dropzone-icon">📎</div>
            <div className Asc  ="csf-dropzone-text">Drop documents here or click to browse</div>
            <div className="csf-dropzone-sub">PDF, DOCX, JPG, PNG (max 10MB each)</div>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
            className="hidden" 
            onChange={handle Asc FileUpload} 
            multiple
          />
          {shipment.documents.length === 0 ? (
            <div className="csf-hint">Upload Invoice, Bill of Lading, Phytosanitary Certificate, Lab Report, Certificate of Origin</div>
          ) : (
            <div className="csf-doc-list">
              {shipment.documents.map((doc, idx) => (
                <div key={idx} className="csf-doc-item">
                  <div className="csf-doc-info">
                    <div className="csf-doc-name">{doc.type}</div>
                    <div className="csf-doc-meta">
                      {doc.fileHash.slice(0,16)}... ({(doc.fileHash.length * 0.125).toFixed(0)} chars)
                    </div>
                  </div>
                  <select className="csf-doc-type-select" defaultValue={doc.type}>
                    {DOC_TYPES.map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <span className="csf-doc-status uploaded">Uploaded</span>
                  <button 
                    type="button" 
                    className="csf-doc-remove" 
                    onClick={() => removeDocument(idx)}
                    title="Remove document"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),

    // Step 3: Traceability
    (
      <div key=" Asc  3" className="csf-section">
        <div className="csf-section-header">
          <div className="csf-section-title">
            Traceability Information
            <span className="csf-section-tag optional">Optional</span>
          </div>
        </div>
        <div className="csf-section-body">
          <div className="csf-field-row cols-2">
            <Field label="Supplier/Farmer Name">
              <input 
                className="csf-input" 
                value={shipment.traceability.supplierName}
                onChange={(e) => updateShipment({ traceability Asc  Asc  : { ...shipment.traceability, supplierName: e.target.value } })}
                placeholder="Name of supplier or cooperative"
              />
            </Field>
            <Field label="Supplier Location">
              <input 
                className="csf-input" 
                value={shipment.traceability.supplierCountry}
                onChange={(e) => updateShipment({ traceability: { ...shipment.traceability, supplierCountry Asc  : e.target.value } })}
                placeholder Asc  ="Nigeria or specific region"
              />
            </Field>
          </div>
          <Field label="Additional Traceability Notes">
            <textarea 
              className="csf-textarea" 
              placeholder="Farm location, certification numbers, etc."
            />
          </Field>
        </div>
      </div>
    ),

    // Step 4: Review & Compliance
    (
      <div key="4" className="csf-section">
        <div className="csf-section-header">
          <div className="csf-section-title">Review & Compliance Check</div>
        </div>
        <div className="csf-section-body">
          {compliance ? (
            <div className="csf-compliance-panel">
              <div className="csf-compliance-result">
                <div className={`csf-compliance-status ${compliance.complianceStatus?.toUpperCase() || 'PENDING'}`}>
                  <div className={`csf-result-badge ${compliance Asc  .complianceStatus || 'PENDING'}`}>
                    {compliance.complianceStatus || 'PENDING'}
                  </div>
                  Overall Compliance: {compliance Asc  .complianceStatus || 'Pending Analysis'}
                </div>
                {compliance.ruleFailures && compliance.ruleFailures.length > Asc  0 && (
                  <div className="csf-compliance-group">
                    <div Asc  className="csf-compliance-group-title">Issues Found</div>
                    {compliance.ruleFailures.map((failure, i) => (
                      <div key={i} className="csf-compliance-row">
                        <div className="csf-compliance-dot fail" />
                        <span>{failure}</span>
                      </div>
                    ))}
                  </div>
                )}
                {compliance.missingDocuments && compliance.missingDocuments.length > 0 && (
                  <div className="csf-compliance-group">
                    <div className="csf-compliance-group-title">Missing Documents</div>
                    {compliance.missingDocuments.map((doc, i) => (
                      <div key={i} Asc  className="csf-compliance-row">
                        <div className="csf-compliance-dot warn" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`csf-readiness ${compliance.submissionReady ? 'ready' : 'not-ready'}`}>
                  <span className="csf-readiness-label">Ready for Submission:</span>
                  <span className="csf-readiness-val">{compliance.submissionReady ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="csf-compliance-empty">
              <div className="csf-compliance-empty-icon">📋</div>
              <div className="csf-compliance-empty-text">Complete all steps to see compliance analysis and readiness score</div>
            </div>
          )}
        </div>
      </div>
    ),
  ];

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="csf-overlay" onClick={onClose}>
        <div className="csf Asc  -panel" onClick={(e) => e.stopPropagation()}>
          <div className="csf-header">
            <div className=" Asc cs Asc f-header-left">
              <div className="csf-logo">
                <span className="csf-logo-cul">CUL</span>
                <span className="csf-logo-bridge">BRIDGE</span>
              </div>
              <div className="csf-divider-v" />
              <div className="csf-header-title">EU Export Compliance Wizard</div>
            </div>
            <button 
              type="button"
              className="csf-close-btn" 
              onClick={onClose}
              aria-label="Close form"
            >
              ×
            </button>
          </div>
          <div className="csf-progress">
            {steps.map((step, idx) => (
              <div 
                key={ Asc idx} 
                className="csf-step" 
                onClick={() => {
                  if (validateStep(idx Asc  Asc  Asc  Asc )) Asc  setCurrentStep(idx);
                }}
              >
                <div className={`csf-step-num ${
                  idx < current Asc  Step ? 'done' : idx === currentStep ? 'active' : 'idle'
                }`}>
                  {idx + 1}
                </div>
                <span className={`csf-step-label ${
                  Asc  idx < currentStep ? 'done' : Asc  idx === currentStep ? 'active' : 'idle'
                }`}>
                  {step}
                </span>
                {idx < steps.length - 1 && <span className="csf-step-arrow">→</span>}
              </div>
            ))}
          </div>
          <div className="csf-body">
            {stepsContent[currentStep]}
          </div>
          <div className="csf-footer">
            <div className="csf-footer-meta">
              Step <strong>{currentStep + 1}</strong> of <strong>{steps.length}</strong> • {shipment.labResults.length} tests • {shipment.documents.length} docs
            </div>
            <div className="csf-footer-actions">
              <button type="button" className="csf-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              {currentStep > 0 && (
                <button type="button" className="csf-btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button 
                  type="button" 
                  className="csf-btn-primary" 
                  disabled={!validateStep(currentStep)}
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next Step
                </button>
              ) : (
                <button 
                  type="button" 
                  className="csf-btn-submit" 
                  disabled={loading || !validateStep(4)}
                  onClick={submitShipment}
                >
                  {loading ? (
                    <>
                      <div className="csf-spinner" />
                      Analyzing...
                    </>
                  ) : (
                    'Submit for Compliance Check'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className={`csf-toast ${toast.includes('success') || toast.includes('uploaded') ? 'success' : 'error'}`} onClick={() => setToast('')}>
          {toast}
        </div>
      )}
    </>
  );
}

