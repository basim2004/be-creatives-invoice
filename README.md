# BE CREATIVES — Premium Invoice Management System

A fully editable, professional invoice management web application built for **BE CREATIVES**. It strictly replicates the exact visual hierarchy, layout, typography, and maroon/burgundy branding of the master reference invoice while enabling full browser-based editability, dynamic UPI payment QR codes, flexible payment method toggles, and 1-click A4 PDF generation.

---

## 🌟 Features & Capabilities

1. **Exact Visual Master Reference Match**:
   - **Header**: Top-left slanted maroon polygon with `be CREATIVES` logo and `DESIGN | BRAND | DIGITAL | SOLUTIONS` vertical stack; top-right `BE CREATIVES` title, tagline, Instagram badge (`@be_creatives__`), and `IDEAS / BRANDS / EXPERIENCES` spaced block.
   - **Invoice Details**: Bold maroon `INVOICE` title with spaced `C R E A T I V E  S E R V I C E S`, colon-aligned metadata (`INVOICE NO : BC-78`, `DATE : 16-09-2026`), divider line, and `BILL TO:` / `ALAM ENGAZ`.
   - **Service Items Table**: Solid maroon table header (`DESCRIPTION`, `QTY`, `RATE (₹)`, `AMOUNT (₹)`), multi-line item titles with live clickable portal links, and the full-width solid maroon `TOTAL AMOUNT PAYABLE` bar (`₹3,500/-`).
   - **Two-Column Middle Section**:
     - Left: Rounded pill badge `DELIVERABLES` with maroon circular checkmarks (editable list).
     - Right: Rounded pill badge `WEBSITE LINKS` with cards containing maroon link icons, portal titles, and clickable Netlify URLs.
   - **Flexible Payment Card**: Aligned bank details, GPay number, primary and secondary UPI IDs (`8547931509@ibl` & `basimaslam419@okaxis`), payment screenshot note, and working dynamic UPI QR code with Google Pay center emblem.
     - **Individual Toggles**: Show/Hide QR, UPI ID, GPay, Bank Details, Account Number, IFSC. If QR is disabled, the card reflows smoothly with zero empty gaps.
   - **Footer**: Stylized cursive *"Thank You!"* note on the left, authentic circular BE CREATIVES stamp in the center, and authorized signature line on the right with bottom-right maroon angled corner accents.

2. **Sequential Auto-Numbering Engine**:
   - Automatically increments invoice numbers (`BC-78` $\rightarrow$ `BC-79` $\rightarrow$ `BC-80` $\rightarrow$ `...`).
   - Supports manual editing while protecting against accidental overwrites.

3. **Multi-Invoice Database (`localStorage`)**:
   - Stores multiple independent invoice records under `be_creatives_master_invoices_v1`.
   - Scalable to 100+ invoices without UI lag.
   - Includes JSON Backup Export & Import.

4. **Working Real-Time UPI QR Code**:
   - Standard NPCI URI: `upi://pay?pa=basimaslam419@okaxis&pn=BASIM%20ASLAM%20P&am=3500&cu=INR`
   - Dynamically re-generates whenever the invoice total or UPI ID is updated in the editor.

5. **Client-Ready PDF & Print Engine**:
   - Strict A4 portrait format (`210mm × 297mm`).
   - 1-click **Download PDF** generating clean vector files formatted as `BE-Creatives-Invoice-{invoiceNumber}-{clientName}.pdf`.
   - Native browser print styling (`@media print`) isolating solely the A4 document sheet.

---

## 📁 File Structure

```
be invoice/
├── index.html                 # Master HTML Application
├── style.css                  # Master Visual Reference Stylesheet
├── styles.css                 # Synchronized Stylesheet
├── script.js                  # Application Logic & LocalStorage Engine
├── app.js                     # Synchronized Logic Engine
├── be creatives agency.png    # Primary BE CREATIVES Agency Logo
├── qr code.png                # Reference QR Asset
├── assets/
│   ├── be-creatives-stamp.svg # Circular Official Seal SVG
│   ├── signature-be-creatives.svg # Cursive Authorized Signature SVG
│   ├── gpay-logo.svg          # QR Center Emblem
│   ├── qrcode.js              # Standalone Offline QR Engine
│   └── html2pdf.bundle.min.js # Standalone PDF Engine
├── server.js                  # Local Development Static Server
└── README.md                  # Project Documentation
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Access
Simply double-click `index.html` in your file explorer to open the app directly in any modern web browser.

### Option 2: Local HTTP Server
Run the included lightweight Node.js static server:
```bash
node server.js
```
Then navigate to `http://localhost:3000/` in your browser.

---

## 🌐 Deploy to Netlify

This project uses pure Vanilla HTML5, CSS3, and JavaScript with zero build steps or heavy dependencies:

1. **Drag and Drop**:
   - Log in to your [Netlify](https://www.netlify.com/) account.
   - Go to the **Sites** tab and drag the entire `be invoice` folder into the Netlify deployment dropzone.
   - Your site will go live immediately with a custom `.netlify.app` URL.

2. **Git Repository**:
   - Push this repository to GitHub or GitLab.
   - In Netlify, click **Add new site** $\rightarrow$ **Import an existing project**.
   - Select the repository. Leave the build command blank and publish directory as `.`.
   - Click **Deploy Site**.
