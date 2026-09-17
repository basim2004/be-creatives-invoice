/**
 * BE CREATIVES — PREMIUM INVOICE MANAGEMENT SYSTEM
 * Master Visual Reference Match Application Engine
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_INVOICES_KEY = 'be_creatives_master_invoices_v1';
  const STORAGE_SETTINGS_KEY = 'be_creatives_master_settings_v1';
  const STORAGE_FINANCE_KEY = 'be_creatives_transactions_v1';

  // Master Default Business Settings with B BADGE and original BE CREATIVES logo
  const DEFAULT_SETTINGS = {
    name: 'BE CREATIVES',
    tagline: 'Creative Solutions, Limitless Possibilities',
    instagram: '@be_creatives__',
    instagramUrl: 'https://instagram.com/be_creatives__',
    accountName: 'BASIM ASLAM P',
    bankName: 'Indian Post Payment Bank',
    accountNumber: '026210067305',
    ifsc: 'IPOS0000001',
    gpay: '+91 8547931509',
    primaryUpi: '8547931509@ibl',
    secondaryUpi: 'basimaslam419@okaxis',
    paymentNote: 'Kindly share the payment screenshot after the transfer.',
    logoUrl: 'be creatives agency.png',
    stampUrl: 'B BADGE.png',
    signatureUrl: 'assets/signature-be-creatives.svg',
    signatoryCaption: 'Authorized Signature'
  };

  // Master Reference Seed Invoices
  const SEED_INVOICES = [
    {
      id: 'inv_seed_bc78',
      invoiceNumber: 'BC-78',
      date: '16-09-2026',
      dueDate: '',
      showDueDate: false,
      status: 'PAID',
      currency: '₹',
      client: {
        name: 'ALAM ENGAZ',
        address: '',
        email: '',
        phone: ''
      },
      items: [
        {
          id: 'item_1',
          title: 'ALAM ENGAZ',
          subtitle: 'Staff Web Portal – Email Signature Hub',
          url: 'https://alam-engaz-email-signature-hub.netlify.app/',
          showUrl: true,
          quantity: 1,
          rate: 1750,
          amount: 1750
        },
        {
          id: 'item_2',
          title: 'ALAM ENGAZ PORT SERVICES',
          subtitle: 'Staff Web Portal – Email Signature Hub',
          url: 'https://alam-engaz-port-email-signature-hub.netlify.app/',
          showUrl: true,
          quantity: 1,
          rate: 1750,
          amount: 1750
        }
      ],
      subtotal: 3500,
      discount: 0,
      total: 3500,
      deliverables: [
        'Staff Web Portal Development',
        'Email Signature Management System',
        'Employee Portal Setup',
        'Firebase / System Integration',
        'Website Deployment & Configuration',
        'Final Website Setup'
      ],
      websiteLinks: [
        {
          id: 'link_1',
          title: 'ALAM ENGAZ Staff Portal',
          url: 'https://alam-engaz-email-signature-hub.netlify.app/'
        },
        {
          id: 'link_2',
          title: 'ALAM ENGAZ Port Services Staff Portal',
          url: 'https://alam-engaz-port-email-signature-hub.netlify.app/'
        }
      ],
      payment: {
        accountName: 'BASIM ASLAM P',
        bankName: 'Indian Post Payment Bank',
        accountNumber: '026210067305',
        ifsc: 'IPOS0000001',
        gpay: '+91 8547931509',
        primaryUpi: '8547931509@ibl',
        secondaryUpi: 'basimaslam419@okaxis',
        note: 'Kindly share the payment screenshot after the transfer.',
        showQr: true,
        qrMode: 'generate', // 'generate' or 'upload'
        customQrUrl: '',
        showUpiId: true,
        showGpay: true,
        showBank: true,
        showAccountNo: true,
        showIfsc: true
      },
      business: { ...DEFAULT_SETTINGS }
    }
  ];

  // State
  let invoices = [];
  let businessSettings = {};
  let currentInvoice = null;
  let activeFilter = 'ALL';
  let searchQuery = '';
  let pendingDeleteId = null;

  // Finance State
  let financeTransactions = [];
  let financeFilterType = 'ALL';
  let financeFilterMonth = 'ALL';
  let financeSearch = '';
  let financeCurrentPage = 1;
  const FINANCE_PAGE_SIZE = 25;

  // DOM Elements
  const views = {
    dashboard: document.getElementById('viewDashboard'),
    finance: document.getElementById('viewFinance'),
    editor: document.getElementById('viewEditor')
  };

  const nav = {
    dashboardBtn: document.getElementById('navDashboardBtn'),
    financeBtn: document.getElementById('navFinanceBtn'),
    newInvoiceBtn: document.getElementById('navNewInvoiceBtn'),
    settingsBtn: document.getElementById('navSettingsBtn'),
    dataMenuBtn: document.getElementById('navDataMenuBtn'),
    dataMenu: document.getElementById('navDataMenu'),
    logoHome: document.getElementById('navLogoHome')
  };

  const dash = {
    btnNew: document.getElementById('btnDashboardNewInvoice'),
    tableBody: document.getElementById('invoicesTableBody'),
    mobileCards: document.getElementById('mobileInvoicesCards'),
    emptyState: document.getElementById('emptyState'),
    btnEmptyCreate: document.getElementById('btnEmptyCreateInvoice'),
    searchInput: document.getElementById('invoiceSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    filterPills: document.querySelectorAll('.filter-pill'),
    badgeCount: document.getElementById('invoicesCountBadge'),
    metricTotal: document.getElementById('metricTotalInvoices'),
    metricPaid: document.getElementById('metricPaidRevenue'),
    metricPaidCount: document.getElementById('metricPaidCount'),
    metricPending: document.getElementById('metricPendingRevenue'),
    metricPendingCount: document.getElementById('metricPendingCount'),
    metricOverall: document.getElementById('metricOverallTotal'),
    exportBackupBtn: document.getElementById('exportBackupBtn'),
    importBackupInput: document.getElementById('importBackupInput'),
    resetSampleDataBtn: document.getElementById('resetSampleDataBtn')
  };

  const finance = {
    metricCredit: document.getElementById('financeMetricCredit'),
    metricCreditCount: document.getElementById('financeMetricCreditCount'),
    metricDebit: document.getElementById('financeMetricDebit'),
    metricDebitCount: document.getElementById('financeMetricDebitCount'),
    metricBalance: document.getElementById('financeMetricBalance'),
    metricBalanceSub: document.getElementById('financeMetricBalanceSub'),
    metricEntries: document.getElementById('financeMetricEntries'),
    countBadge: document.getElementById('financeCountBadge'),
    searchInput: document.getElementById('financeSearchInput'),
    searchClearBtn: document.getElementById('financeSearchClearBtn'),
    monthSelect: document.getElementById('financeMonthSelect'),
    typePills: document.querySelectorAll('#financeTypePills .filter-pill'),
    table: document.getElementById('financeTable'),
    tableBody: document.getElementById('financeTableBody'),
    mobileCards: document.getElementById('mobileFinanceCards'),
    emptyState: document.getElementById('financeEmptyState'),
    paginationBar: document.getElementById('financePaginationBar'),
    paginationInfo: document.getElementById('financePaginationInfo'),
    pageIndicator: document.getElementById('financePageIndicator'),
    btnPrev: document.getElementById('btnFinancePrev'),
    btnNext: document.getElementById('btnFinanceNext'),
    btnExportCsv: document.getElementById('btnExportFinanceCsv'),
    btnOpenAdd: document.getElementById('btnOpenAddTransaction')
  };

  const zoom = {
    btnIn: document.getElementById('btnZoomIn'),
    btnOut: document.getElementById('btnZoomOut'),
    btnFit: document.getElementById('btnFitScreen'),
    btnReset: document.getElementById('btnZoomReset'),
    percent: document.getElementById('zoomPercent'),
    wrapper: document.getElementById('previewSheetWrapper')
  };

  const ed = {
    backBtn: document.getElementById('btnEditorBack'),
    saveBtn: document.getElementById('btnEditorSave'),
    printBtn: document.getElementById('btnEditorPrint'),
    downloadPdfBtn: document.getElementById('btnEditorDownloadPdf'),
    duplicateBtn: document.getElementById('btnEditorDuplicate'),
    titleTag: document.getElementById('editorCurrentInvoiceTitle'),
    statusIndicator: document.getElementById('editorStatusIndicator'),
    // Inputs
    inputInvoiceNumber: document.getElementById('inputInvoiceNumber'),
    inputInvoiceDate: document.getElementById('inputInvoiceDate'),
    selectInvoiceStatus: document.getElementById('selectInvoiceStatus'),
    toggleDueDate: document.getElementById('toggleDueDate'),
    inputInvoiceDueDate: document.getElementById('inputInvoiceDueDate'),
    inputCurrencySymbol: document.getElementById('inputCurrencySymbol'),
    inputClientName: document.getElementById('inputClientName'),
    inputClientAddress: document.getElementById('inputClientAddress'),
    inputClientEmail: document.getElementById('inputClientEmail'),
    itemsList: document.getElementById('itemsEditorList'),
    btnAddItem: document.getElementById('btnAddItemBtn'),
    btnAddItemSecondary: document.getElementById('btnAddItemBtnSecondary'),
    deliverablesList: document.getElementById('deliverablesEditorList'),
    btnAddDeliverable: document.getElementById('btnAddDeliverableBtn'),
    websiteLinksList: document.getElementById('websiteLinksEditorList'),
    btnAddWebsiteLink: document.getElementById('btnAddWebsiteLinkBtn'),
    // QR Code Controls
    toggleShowQr: document.getElementById('toggleShowQr'),
    qrControlsContainer: document.getElementById('qrControlsContainer'),
    qrModeGenerate: document.getElementById('qrModeGenerate'),
    qrModeUpload: document.getElementById('qrModeUpload'),
    qrUploadSection: document.getElementById('qrUploadSection'),
    qrGenerateSection: document.getElementById('qrGenerateSection'),
    inputUploadQrFile: document.getElementById('inputUploadQrFile'),
    btnRemoveUploadedQr: document.getElementById('btnRemoveUploadedQr'),
    uploadedQrPreviewImg: document.getElementById('uploadedQrPreviewImg'),
    uploadQrBtnText: document.getElementById('uploadQrBtnText'),
    inputQrUpiId: document.getElementById('inputQrUpiId'),
    inputQrPayeeName: document.getElementById('inputQrPayeeName'),
    // Payment toggles & fields
    toggleShowUpiId: document.getElementById('toggleShowUpiId'),
    toggleShowGpay: document.getElementById('toggleShowGpay'),
    toggleShowBank: document.getElementById('toggleShowBank'),
    toggleShowAccountNo: document.getElementById('toggleShowAccountNo'),
    toggleShowIfsc: document.getElementById('toggleShowIfsc'),
    inputPayeeName: document.getElementById('inputPayeeName'),
    inputBankName: document.getElementById('inputBankName'),
    inputAccountNumber: document.getElementById('inputAccountNumber'),
    inputIfscCode: document.getElementById('inputIfscCode'),
    inputGpayNumber: document.getElementById('inputGpayNumber'),
    inputPrimaryUpi: document.getElementById('inputPrimaryUpi'),
    inputSecondaryUpi: document.getElementById('inputSecondaryUpi'),
    inputPaymentNote: document.getElementById('inputPaymentNote'),
    inputDiscountAmount: document.getElementById('inputDiscountAmount'),
    calcTotalSummaryDisplay: document.getElementById('calcTotalSummaryDisplay')
  };

  const sheet = {
    container: document.getElementById('a4InvoiceSheet'),
    polygonLogo: document.getElementById('sheetPolygonLogo'),
    agencyName: document.getElementById('sheetAgencyName'),
    agencyTagline: document.getElementById('sheetAgencyTagline'),
    instagramBadge: document.getElementById('sheetInstagramBadge'),
    instagramHandle: document.getElementById('sheetInstagramHandle'),
    invoiceNumber: document.getElementById('sheetInvoiceNumber'),
    invoiceDate: document.getElementById('sheetInvoiceDate'),
    invoiceDueDate: document.getElementById('sheetInvoiceDueDate'),
    dueDateRow: document.getElementById('sheetDueDateRow'),
    clientName: document.getElementById('sheetClientName'),
    clientSubdetails: document.getElementById('sheetClientSubdetails'),
    itemsTableBody: document.getElementById('sheetItemsTableBody'),
    totalPayable: document.getElementById('sheetTotalPayable'),
    deliverablesList: document.getElementById('sheetDeliverablesList'),
    websiteLinksList: document.getElementById('sheetWebsiteLinksList'),
    paymentCard: document.getElementById('sheetPaymentCard'),
    accountName: document.getElementById('sheetAccountName'),
    bankName: document.getElementById('sheetBankName'),
    accountNumber: document.getElementById('sheetAccountNumber'),
    ifscCode: document.getElementById('sheetIfscCode'),
    gpayNumber: document.getElementById('sheetGpayNumber'),
    primaryUpi: document.getElementById('sheetPrimaryUpi'),
    secondaryUpi: document.getElementById('sheetSecondaryUpi'),
    paymentNoteRow: document.getElementById('sheetPaymentNoteRow'),
    paymentNoteText: document.getElementById('sheetPaymentNoteText'),
    rowAccountName: document.getElementById('rowAccountName'),
    rowBankName: document.getElementById('rowBankName'),
    rowAccountNumber: document.getElementById('rowAccountNumber'),
    rowIfsc: document.getElementById('rowIfsc'),
    rowGpay: document.getElementById('rowGpay'),
    rowUpi: document.getElementById('rowUpi'),
    qrCol: document.getElementById('sheetQrCol'),
    dynamicQrBox: document.getElementById('sheetDynamicQrBox'),
    qrCenterBadge: document.getElementById('sheetQrCenterBadge'),
    qrCaption: document.getElementById('sheetQrCaption'),
    stampImg: document.getElementById('sheetStampImg'),
    sigImg: document.getElementById('sheetSigImg'),
    sigCaption: document.getElementById('sheetSigCaption')
  };

  const modals = {
    settings: document.getElementById('modalSettings'),
    closeSettingsBtn: document.getElementById('closeSettingsModalBtn'),
    cancelSettingsBtn: document.getElementById('btnCancelSettings'),
    saveSettingsBtn: document.getElementById('btnSaveSettings'),
    resetSettingsBtn: document.getElementById('btnResetSettings'),
    settingBusinessName: document.getElementById('settingBusinessName'),
    settingTagline: document.getElementById('settingTagline'),
    settingInstagram: document.getElementById('settingInstagram'),
    settingInstagramUrl: document.getElementById('settingInstagramUrl'),
    settingAccountName: document.getElementById('settingAccountName'),
    settingBankName: document.getElementById('settingBankName'),
    settingAccountNumber: document.getElementById('settingAccountNumber'),
    settingIfsc: document.getElementById('settingIfsc'),
    settingGpay: document.getElementById('settingGpay'),
    settingPrimaryUpi: document.getElementById('settingPrimaryUpi'),
    settingSecondaryUpi: document.getElementById('settingSecondaryUpi'),
    settingLogoPreview: document.getElementById('settingLogoPreview'),
    settingLogoUpload: document.getElementById('settingLogoUpload'),
    settingStampPreview: document.getElementById('settingStampPreview'),
    settingStampUpload: document.getElementById('settingStampUpload'),
    settingSigPreview: document.getElementById('settingSigPreview'),
    settingSigUpload: document.getElementById('settingSigUpload'),
    deleteModal: document.getElementById('modalDeleteConfirm'),
    deleteTargetInvNum: document.getElementById('deleteTargetInvNum'),
    cancelDeleteBtn: document.getElementById('btnCancelDelete'),
    confirmDeleteBtn: document.getElementById('btnConfirmDelete')
  };

  const toastContainer = document.getElementById('toastContainer');

  // Helpers
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  function formatCurrency(amount, symbol = '₹') {
    const num = Number(amount) || 0;
    return `${symbol}${num.toLocaleString('en-IN')}`;
  }

  function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'fa-circle-check';
    if (type === 'danger') icon = 'fa-triangle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${msg}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.25s forwards';
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Storage
  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      businessSettings = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      businessSettings = { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(businessSettings));
    } catch (e) {
      console.error(e);
    }
  }

  function loadInvoices() {
    try {
      const stored = localStorage.getItem(STORAGE_INVOICES_KEY);
      if (stored) {
        invoices = JSON.parse(stored);
      } else {
        invoices = JSON.parse(JSON.stringify(SEED_INVOICES));
        saveInvoices();
      }
    } catch (e) {
      invoices = JSON.parse(JSON.stringify(SEED_INVOICES));
    }
  }

  function saveInvoices() {
    try {
      localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(invoices));
    } catch (e) {
      showToast('Storage full or error saving!', 'danger');
    }
  }

  // Sequential Numbering
  function getNextInvoiceNumber() {
    let maxNum = 77;
    invoices.forEach(inv => {
      if (!inv.invoiceNumber) return;
      const m = inv.invoiceNumber.match(/BC-(\d+)/i);
      if (m && m[1]) {
        const val = parseInt(m[1], 10);
        if (val > maxNum) maxNum = val;
      }
    });
    return `BC-${maxNum + 1}`;
  }

  // Dynamic Real-Time UPI QR Code Engine
  function renderDynamicUpiQr(amount, upiId, payeeName) {
    if (!sheet.dynamicQrBox) return;
    sheet.dynamicQrBox.innerHTML = '';

    const safeAmount = Math.max(0, Number(amount) || 0);
    const safeUpi = (upiId || businessSettings.secondaryUpi || 'basimaslam419@okaxis').trim();
    const safePayee = (payeeName || businessSettings.accountName || 'BASIM ASLAM P').trim();

    // Standard NPCI URI
    const upiUri = `upi://pay?pa=${safeUpi}&pn=${encodeURIComponent(safePayee)}&am=${safeAmount}&cu=INR`;

    try {
      if (typeof qrcode === 'function') {
        const qr = qrcode(0, 'M');
        qr.addData(upiUri);
        qr.make();
        const svgTag = qr.createSvgTag(3.4, 1);
        sheet.dynamicQrBox.innerHTML = svgTag;
        return;
      }
    } catch (err) {
      console.warn('QR error:', err);
    }

    // Fallback if needed
    const img = document.createElement('img');
    img.src = 'qr code.png';
    sheet.dynamicQrBox.appendChild(img);
  }

  // Dashboard Sync
  function updateDashboard() {
    const totalCount = invoices.length;
    let paidSum = 0;
    let paidCount = 0;
    let pendingSum = 0;
    let pendingCount = 0;
    let overallSum = 0;

    invoices.forEach(inv => {
      const tot = Number(inv.total) || 0;
      overallSum += tot;
      if (inv.status === 'PAID') {
        paidSum += tot;
        paidCount++;
      } else {
        pendingSum += tot;
        pendingCount++;
      }
    });

    dash.metricTotal.textContent = totalCount;
    dash.metricPaid.textContent = formatCurrency(paidSum);
    dash.metricPaidCount.textContent = `${paidCount} invoice${paidCount === 1 ? '' : 's'} paid`;
    dash.metricPending.textContent = formatCurrency(pendingSum);
    dash.metricPendingCount.textContent = `${pendingCount} pending`;
    dash.metricOverall.textContent = formatCurrency(overallSum);

    // Filter
    const filtered = invoices.filter(inv => {
      if (activeFilter !== 'ALL' && inv.status !== activeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nMatch = (inv.invoiceNumber || '').toLowerCase().includes(q);
        const cMatch = (inv.client?.name || '').toLowerCase().includes(q);
        if (!nMatch && !cMatch) return false;
      }
      return true;
    });

    dash.badgeCount.textContent = `${filtered.length} of ${invoices.length} records`;

    if (filtered.length === 0) {
      dash.tableBody.innerHTML = '';
      if (dash.mobileCards) dash.mobileCards.innerHTML = '';
      dash.emptyState.style.display = 'flex';
      return;
    }

    dash.emptyState.style.display = 'none';

    // Sorted descending by number
    const sorted = [...filtered].sort((a, b) => {
      const na = parseInt((a.invoiceNumber || '').replace(/\D/g, ''), 10) || 0;
      const nb = parseInt((b.invoiceNumber || '').replace(/\D/g, ''), 10) || 0;
      return nb - na;
    });

    let html = '';
    let mobileHtml = '';
    sorted.forEach(inv => {
      const isPaid = inv.status === 'PAID';
      const formattedTotal = formatCurrency(inv.total, inv.currency || '₹');
      html += `
        <tr data-id="${inv.id}">
          <td><span class="table-inv-no">${inv.invoiceNumber}</span></td>
          <td><span class="table-client-name">${inv.client?.name || 'Untitled'}</span></td>
          <td><span>${inv.date || ''}</span></td>
          <td style="text-align:right;"><span class="table-amount">${formattedTotal}</span></td>
          <td style="text-align:center;">
            <button type="button" class="status-badge ${isPaid ? 'paid' : 'pending'}" data-action="toggle-status" data-id="${inv.id}">
              <span class="status-dot"></span>
              <span>${inv.status}</span>
            </button>
          </td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn-icon-action" data-action="view" data-id="${inv.id}" title="View / Edit in Live Canvas"><i class="fa-solid fa-eye"></i></button>
              <button type="button" class="btn-icon-action" data-action="edit" data-id="${inv.id}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
              <button type="button" class="btn-icon-action" data-action="duplicate" data-id="${inv.id}" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
              <button type="button" class="btn-icon-action" data-action="pdf" data-id="${inv.id}" title="Download PDF"><i class="fa-solid fa-file-pdf"></i></button>
              <button type="button" class="btn-icon-action danger" data-action="delete" data-id="${inv.id}" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </td>
        </tr>
      `;

      mobileHtml += `
        <div class="mobile-inv-card" data-id="${inv.id}">
          <div class="mobile-card-top">
            <span class="mobile-card-number">${inv.invoiceNumber}</span>
            <button type="button" class="status-badge ${isPaid ? 'paid' : 'pending'}" data-action="toggle-status" data-id="${inv.id}">
              <span class="status-dot"></span>
              <span>${inv.status}</span>
            </button>
          </div>
          <div class="mobile-card-details">
            <div class="mobile-card-client">${inv.client?.name || 'Untitled Client'}</div>
            <div class="mobile-card-meta">
              <span><i class="fa-regular fa-calendar"></i> ${inv.date || 'No Date'}</span>
              <span class="mobile-card-amount">${formattedTotal}</span>
            </div>
          </div>
          <div class="mobile-card-actions">
            <button type="button" class="btn btn-outline" data-action="view" data-id="${inv.id}"><i class="fa-solid fa-eye"></i> View</button>
            <button type="button" class="btn btn-outline" data-action="edit" data-id="${inv.id}"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button type="button" class="btn btn-outline" data-action="pdf" data-id="${inv.id}"><i class="fa-solid fa-file-pdf"></i> PDF</button>
            <button type="button" class="btn btn-outline icon-only" data-action="duplicate" data-id="${inv.id}" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
            <button type="button" class="btn btn-outline danger icon-only" data-action="delete" data-id="${inv.id}" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      `;
    });

    dash.tableBody.innerHTML = html;
    if (dash.mobileCards) dash.mobileCards.innerHTML = mobileHtml;
  }

  function showDashboard() {
    if (views.finance) views.finance.classList.remove('active');
    if (nav.financeBtn) nav.financeBtn.classList.remove('active');
    views.editor.classList.remove('active');
    views.dashboard.classList.add('active');
    nav.dashboardBtn.classList.add('active');
    updateDashboard();
  }

  function showEditor() {
    if (views.finance) views.finance.classList.remove('active');
    if (nav.financeBtn) nav.financeBtn.classList.remove('active');
    views.dashboard.classList.remove('active');
    views.editor.classList.add('active');
    nav.dashboardBtn.classList.remove('active');
    setTimeout(() => {
      if (typeof applyZoom === 'function') applyZoom('fit');
    }, 50);
  }

  function showFinance() {
    views.dashboard.classList.remove('active');
    views.editor.classList.remove('active');
    if (views.finance) views.finance.classList.add('active');
    nav.dashboardBtn.classList.remove('active');
    if (nav.financeBtn) nav.financeBtn.classList.add('active');
    renderFinance();
  }

  function loadFinanceTransactions() {
    try {
      const saved = localStorage.getItem(STORAGE_FINANCE_KEY);
      if (saved) {
        financeTransactions = JSON.parse(saved);
      } else if (window.KHATABOOK_SEED_DATA && Array.isArray(window.KHATABOOK_SEED_DATA.transactions)) {
        financeTransactions = JSON.parse(JSON.stringify(window.KHATABOOK_SEED_DATA.transactions));
        saveFinanceTransactions();
      }
    } catch (err) {
      console.error('Error loading finance data:', err);
      if (window.KHATABOOK_SEED_DATA && Array.isArray(window.KHATABOOK_SEED_DATA.transactions)) {
        financeTransactions = JSON.parse(JSON.stringify(window.KHATABOOK_SEED_DATA.transactions));
      }
    }
  }

  function saveFinanceTransactions() {
    try {
      localStorage.setItem(STORAGE_FINANCE_KEY, JSON.stringify(financeTransactions));
    } catch (e) {
      console.warn('Storage full or error saving finance:', e);
    }
  }

  function populateFinanceMonthDropdown() {
    if (!finance.monthSelect) return;
    const currentVal = finance.monthSelect.value || 'ALL';
    finance.monthSelect.innerHTML = '<option value="ALL">All Months (17 Months)</option>';

    const months = [];
    financeTransactions.forEach(t => {
      if (t.monthHeader && !months.includes(t.monthHeader)) {
        months.push(t.monthHeader);
      }
    });

    months.forEach(m => {
      const count = financeTransactions.filter(t => t.monthHeader === m).length;
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = `${m} (${count})`;
      finance.monthSelect.appendChild(opt);
    });

    finance.monthSelect.value = currentVal;
  }

  function getFilteredFinanceTransactions() {
    return financeTransactions.filter(tx => {
      if (financeFilterType !== 'ALL' && tx.type !== financeFilterType) return false;
      if (financeFilterMonth !== 'ALL' && tx.monthHeader !== financeFilterMonth) return false;
      if (financeSearch.trim()) {
        const q = financeSearch.toLowerCase().trim();
        const nameMatch = (tx.name || '').toLowerCase().includes(q);
        const detailsMatch = (tx.details || '').toLowerCase().includes(q);
        const dateMatch = (tx.date || '').toLowerCase().includes(q);
        const amtMatch = String(tx.amount || tx.credit || tx.debit || '').includes(q);
        if (!nameMatch && !detailsMatch && !dateMatch && !amtMatch) return false;
      }
      return true;
    });
  }

  function renderFinance() {
    const filtered = getFilteredFinanceTransactions();
    const totalCount = filtered.length;

    let totalCredit = 0;
    let totalDebit = 0;
    let creditCount = 0;
    let debitCount = 0;

    filtered.forEach(tx => {
      const cr = Number(tx.credit) || (tx.type === 'CREDIT' ? Number(tx.amount) || 0 : 0);
      const db = Number(tx.debit) || (tx.type === 'DEBIT' ? Number(tx.amount) || 0 : 0);
      totalCredit += cr;
      totalDebit += db;
      if (tx.type === 'CREDIT' || cr > 0) creditCount++;
      if (tx.type === 'DEBIT' || db > 0) debitCount++;
    });

    const netBalance = totalCredit - totalDebit;

    if (finance.metricCredit) finance.metricCredit.textContent = formatCurrency(totalCredit);
    if (finance.metricCreditCount) finance.metricCreditCount.textContent = `${creditCount} credit entries`;
    if (finance.metricDebit) finance.metricDebit.textContent = formatCurrency(totalDebit);
    if (finance.metricDebitCount) finance.metricDebitCount.textContent = `${debitCount} debit entries`;
    if (finance.metricBalance) {
      finance.metricBalance.textContent = `${formatCurrency(Math.abs(netBalance))} ${netBalance >= 0 ? 'Cr' : 'Dr'}`;
      finance.metricBalance.style.color = netBalance >= 0 ? 'var(--brand-maroon)' : '#dc2626';
    }
    if (finance.metricBalanceSub) {
      finance.metricBalanceSub.textContent = netBalance >= 0 ? 'Positive Net Balance' : 'Negative Net Outflow';
    }
    if (finance.metricEntries) finance.metricEntries.textContent = totalCount;
    if (finance.countBadge) finance.countBadge.textContent = `${totalCount} of ${financeTransactions.length} records`;

    const totalPages = Math.max(1, Math.ceil(totalCount / FINANCE_PAGE_SIZE));
    if (financeCurrentPage > totalPages) financeCurrentPage = totalPages;
    if (financeCurrentPage < 1) financeCurrentPage = 1;

    const startIdx = (financeCurrentPage - 1) * FINANCE_PAGE_SIZE;
    const endIdx = Math.min(startIdx + FINANCE_PAGE_SIZE, totalCount);
    const pageItems = filtered.slice(startIdx, endIdx);

    if (finance.paginationInfo) {
      finance.paginationInfo.textContent = totalCount === 0 
        ? 'Showing 0 entries' 
        : `Showing ${startIdx + 1}–${endIdx} of ${totalCount} entries`;
    }
    if (finance.pageIndicator) {
      finance.pageIndicator.textContent = `Page ${financeCurrentPage} of ${totalPages}`;
    }
    if (finance.btnPrev) finance.btnPrev.disabled = financeCurrentPage <= 1;
    if (finance.btnNext) finance.btnNext.disabled = financeCurrentPage >= totalPages;

    if (totalCount === 0) {
      if (finance.tableBody) finance.tableBody.innerHTML = '';
      if (finance.mobileCards) finance.mobileCards.innerHTML = '';
      if (finance.emptyState) finance.emptyState.style.display = 'flex';
      if (finance.paginationBar) finance.paginationBar.style.display = 'none';
      return;
    }

    if (finance.emptyState) finance.emptyState.style.display = 'none';
    if (finance.paginationBar) finance.paginationBar.style.display = 'flex';

    let tableHtml = '';
    let mobileHtml = '';

    pageItems.forEach(tx => {
      const isCredit = tx.type === 'CREDIT' || (Number(tx.credit) > 0);
      const badgeClass = isCredit ? 'badge-credit' : 'badge-debit';
      const badgeIcon = isCredit ? 'fa-arrow-down-left' : 'fa-arrow-up-right';
      const badgeText = isCredit ? 'Credit' : 'Debit';
      const amtClass = isCredit ? 'tx-amount-credit' : 'tx-amount-debit';
      const amtSign = isCredit ? '+' : '-';
      const amtVal = isCredit ? (tx.credit || tx.amount) : (tx.debit || tx.amount);

      tableHtml += `
        <tr>
          <td><span class="table-tx-date">${escapeHtml(tx.date || '')}</span></td>
          <td><span class="table-tx-name">${escapeHtml(tx.name || '—')}</span></td>
          <td><span class="table-tx-details">${escapeHtml(tx.details || '—')}</span></td>
          <td>
            <span class="${badgeClass}">
              <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
            </span>
          </td>
          <td style="text-align: right;">
            <span class="${amtClass}">${amtSign} ₹${Number(amtVal).toLocaleString('en-IN')}</span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn-icon-action danger btn-delete-tx" data-id="${tx.id}" title="Delete Record">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;

      mobileHtml += `
        <div class="mobile-invoice-card" style="border-left: 4px solid ${isCredit ? '#10b981' : '#dc2626'};">
          <div class="mobile-card-top">
            <span class="table-tx-date" style="font-weight: 700; color: var(--slate-700);">${escapeHtml(tx.date || '')}</span>
            <span class="${badgeClass}">
              <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
            </span>
          </div>
          <div class="mobile-card-middle" style="margin: 8px 0;">
            <div style="font-weight: 700; color: var(--slate-900); font-size: 0.95rem;">${escapeHtml(tx.name || '—')}</div>
            <div style="font-size: 0.8rem; color: var(--slate-500); margin-top: 3px;">${escapeHtml(tx.details || '—')}</div>
          </div>
          <div class="mobile-card-bottom" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--slate-100); padding-top: 8px; margin-top: 8px;">
            <span class="${amtClass}" style="font-size: 1.05rem;">${amtSign} ₹${Number(amtVal).toLocaleString('en-IN')}</span>
            <button type="button" class="btn-icon-action danger btn-delete-tx" data-id="${tx.id}" title="Delete Record">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    });

    if (finance.tableBody) finance.tableBody.innerHTML = tableHtml;
    if (finance.mobileCards) finance.mobileCards.innerHTML = mobileHtml;
  }

  // Create New Invoice
  function createNewInvoice() {
    const today = new Date();
    const dStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const nextNum = getNextInvoiceNumber();

    currentInvoice = {
      id: generateId('inv'),
      invoiceNumber: nextNum,
      date: dStr,
      dueDate: '',
      showDueDate: false,
      status: 'PENDING',
      currency: '₹',
      client: {
        name: '',
        address: '',
        email: '',
        phone: ''
      },
      items: [
        {
          id: generateId('item'),
          title: '',
          subtitle: '',
          url: '',
          showUrl: true,
          quantity: 1,
          rate: 0,
          amount: 0
        }
      ],
      subtotal: 0,
      discount: 0,
      total: 0,
      deliverables: [...SEED_INVOICES[0].deliverables],
      websiteLinks: [],
      payment: {
        accountName: businessSettings.accountName,
        bankName: businessSettings.bankName,
        accountNumber: businessSettings.accountNumber,
        ifsc: businessSettings.ifsc,
        gpay: businessSettings.gpay,
        primaryUpi: businessSettings.primaryUpi,
        secondaryUpi: businessSettings.secondaryUpi,
        note: businessSettings.paymentNote,
        showQr: true,
        qrMode: 'generate',
        customQrUrl: '',
        showUpiId: true,
        showGpay: true,
        showBank: true,
        showAccountNo: true,
        showIfsc: true
      },
      business: { ...businessSettings }
    };

    populateForm(currentInvoice);
    showEditor();
    showToast(`Created fresh invoice ${nextNum}`, 'info');
  }

  // Duplicate Invoice
  function duplicateInvoice(id) {
    const src = invoices.find(i => i.id === id);
    if (!src) return;

    const nextNum = getNextInvoiceNumber();
    const clonedItems = (src.items || []).map(it => ({ ...it, id: generateId('item') }));
    const clonedLinks = (src.websiteLinks || []).map(lk => ({ ...lk, id: generateId('link') }));

    currentInvoice = {
      ...JSON.parse(JSON.stringify(src)),
      id: generateId('inv'),
      invoiceNumber: nextNum,
      status: 'PENDING',
      items: clonedItems,
      websiteLinks: clonedLinks,
      business: { ...(src.business || businessSettings) }
    };

    populateForm(currentInvoice);
    showEditor();
    showToast(`Duplicated as new invoice ${nextNum}`, 'success');
  }

  // Delete Invoice with Confirmation
  function promptDelete(id) {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    pendingDeleteId = id;
    modals.deleteTargetInvNum.textContent = inv.invoiceNumber;
    modals.deleteModal.style.display = 'flex';
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    const inv = invoices.find(i => i.id === pendingDeleteId);
    const num = inv ? inv.invoiceNumber : '';
    invoices = invoices.filter(i => i.id !== pendingDeleteId);
    saveInvoices();
    modals.deleteModal.style.display = 'none';
    pendingDeleteId = null;
    updateDashboard();
    showToast(`Invoice ${num} deleted.`, 'danger');
  }

  // Toggle Status directly from table
  function toggleStatus(id) {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    inv.status = inv.status === 'PAID' ? 'PENDING' : 'PAID';
    saveInvoices();
    updateDashboard();
    showToast(`Invoice ${inv.invoiceNumber} status: ${inv.status}`, 'info');
  }

  // Form Population
  function populateForm(inv) {
    ed.titleTag.textContent = inv.invoiceNumber;
    ed.statusIndicator.textContent = inv.status;
    ed.statusIndicator.className = `editor-status-indicator ${inv.status.toLowerCase()}`;

    ed.inputInvoiceNumber.value = inv.invoiceNumber || '';
    ed.inputInvoiceDate.value = inv.date || '';
    ed.selectInvoiceStatus.value = inv.status || 'PENDING';
    ed.toggleDueDate.checked = !!inv.showDueDate;
    ed.inputInvoiceDueDate.value = inv.dueDate || '';
    ed.inputInvoiceDueDate.style.display = inv.showDueDate ? 'block' : 'none';
    ed.inputCurrencySymbol.value = inv.currency || '₹';

    ed.inputClientName.value = inv.client?.name || '';
    ed.inputClientAddress.value = inv.client?.address || '';
    ed.inputClientEmail.value = inv.client?.email || '';

    // QR & Payment Setup
    const p = inv.payment || businessSettings;
    ed.toggleShowQr.checked = p.showQr !== false;
    ed.qrControlsContainer.style.display = p.showQr !== false ? 'block' : 'none';

    // QR Mode: Generate vs Upload
    const qrMode = p.qrMode || 'generate';
    if (qrMode === 'upload') {
      ed.qrModeUpload.checked = true;
      ed.qrUploadSection.style.display = 'block';
      ed.qrGenerateSection.style.display = 'none';
    } else {
      ed.qrModeGenerate.checked = true;
      ed.qrUploadSection.style.display = 'none';
      ed.qrGenerateSection.style.display = 'block';
    }

    if (p.customQrUrl) {
      ed.uploadedQrPreviewImg.src = p.customQrUrl;
      ed.btnRemoveUploadedQr.style.display = 'inline-flex';
      ed.uploadQrBtnText.textContent = 'Replace QR Image';
    } else {
      ed.uploadedQrPreviewImg.src = 'qr code.png';
      ed.btnRemoveUploadedQr.style.display = 'none';
      ed.uploadQrBtnText.textContent = 'Upload QR Image';
    }

    ed.inputQrUpiId.value = p.secondaryUpi || businessSettings.secondaryUpi || 'basimaslam419@okaxis';
    ed.inputQrPayeeName.value = p.accountName || businessSettings.accountName || 'BASIM ASLAM P';

    // Payment toggles & fields
    ed.toggleShowUpiId.checked = p.showUpiId !== false;
    ed.toggleShowGpay.checked = p.showGpay !== false;
    ed.toggleShowBank.checked = p.showBank !== false;
    ed.toggleShowAccountNo.checked = p.showAccountNo !== false;
    ed.toggleShowIfsc.checked = p.showIfsc !== false;

    ed.inputPayeeName.value = p.accountName || '';
    ed.inputBankName.value = p.bankName || '';
    ed.inputAccountNumber.value = p.accountNumber || '';
    ed.inputIfscCode.value = p.ifsc || '';
    ed.inputGpayNumber.value = p.gpay || '';
    ed.inputPrimaryUpi.value = p.primaryUpi || '';
    ed.inputSecondaryUpi.value = p.secondaryUpi || '';
    ed.inputPaymentNote.value = p.note || '';

    ed.inputDiscountAmount.value = inv.discount || 0;

    renderItemsEditor(inv.items);
    renderDeliverablesEditor(inv.deliverables);
    renderWebsiteLinksEditor(inv.websiteLinks);

    syncLivePreview();
  }

  // Render Service Items in Editor
  function renderItemsEditor(items) {
    ed.itemsList.innerHTML = '';
    (items || []).forEach(item => {
      const row = document.createElement('div');
      row.className = 'item-editor-row';
      row.setAttribute('data-id', item.id);

      row.innerHTML = `
        <div class="item-row-top">
          <input type="text" class="item-title-input" placeholder="Item Title (e.g. ALAM ENGAZ)" value="${escapeHtml(item.title || '')}" required>
          <button type="button" class="btn-icon-action danger btn-del-item" title="Delete row"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <input type="text" class="item-subtitle-input" placeholder="Subtitle / Service (e.g. Staff Web Portal – Email Signature Hub)" value="${escapeHtml(item.subtitle || '')}">
        </div>
        <div class="item-row-middle">
          <input type="url" class="item-url-input" placeholder="Website URL (e.g. https://example.com/portal)" value="${escapeHtml(item.url || '')}">
          <label class="toggle-switch-label" style="font-size:0.75rem;">
            <input type="checkbox" class="item-show-url-toggle" ${item.showUrl !== false ? 'checked' : ''}>
            <span>Show Link</span>
          </label>
        </div>
        <div class="item-row-bottom">
          <div class="form-group">
            <label style="font-size:0.7rem;">Qty</label>
            <input type="number" class="item-qty-input" min="1" step="1" value="${item.quantity || 1}">
          </div>
          <div class="form-group">
            <label style="font-size:0.7rem;">Rate (₹)</label>
            <input type="number" class="item-rate-input" min="0" step="any" value="${item.rate || 0}">
          </div>
          <div>
            <label style="font-size:0.7rem; color:var(--slate-400);">Amount</label>
            <div class="item-line-total">${formatCurrency(item.amount || 0)}</div>
          </div>
        </div>
      `;

      // Events
      row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
        updateItemRowAmount(row);
        syncLivePreview();
      }));
      row.querySelector('.item-show-url-toggle').addEventListener('change', syncLivePreview);
      row.querySelector('.btn-del-item').addEventListener('click', () => {
        row.remove();
        syncLivePreview();
      });

      ed.itemsList.appendChild(row);
    });
  }

  function updateItemRowAmount(row) {
    const qty = parseFloat(row.querySelector('.item-qty-input').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate-input').value) || 0;
    const total = Math.max(0, qty * rate);
    row.querySelector('.item-line-total').textContent = formatCurrency(total);
  }

  function collectItems() {
    const rows = ed.itemsList.querySelectorAll('.item-editor-row');
    const list = [];
    rows.forEach(r => {
      const id = r.getAttribute('data-id') || generateId('item');
      const title = r.querySelector('.item-title-input')?.value || '';
      const subtitle = r.querySelector('.item-subtitle-input')?.value || '';
      const url = r.querySelector('.item-url-input')?.value || '';
      const showUrl = r.querySelector('.item-show-url-toggle')?.checked !== false;
      const qty = parseFloat(r.querySelector('.item-qty-input')?.value) || 1;
      const rate = parseFloat(r.querySelector('.item-rate-input')?.value) || 0;
      const amount = Math.max(0, qty * rate);
      list.push({ id, title, subtitle, url, showUrl, quantity: qty, rate, amount });
    });
    return list;
  }

  // Deliverables Editor
  function renderDeliverablesEditor(list) {
    ed.deliverablesList.innerHTML = '';
    (list || []).forEach(text => {
      const row = document.createElement('div');
      row.className = 'deliverable-item-row';
      row.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color:var(--brand-maroon); font-size:12px;"></i>
        <input type="text" class="deliverable-text-input" value="${escapeHtml(text)}" placeholder="Deliverable name">
        <button type="button" class="btn-icon-action danger btn-del-deliv" style="width:24px; height:24px;"><i class="fa-solid fa-xmark"></i></button>
      `;
      row.querySelector('input').addEventListener('input', syncLivePreview);
      row.querySelector('.btn-del-deliv').addEventListener('click', () => {
        row.remove();
        syncLivePreview();
      });
      ed.deliverablesList.appendChild(row);
    });
  }

  function collectDeliverables() {
    const inputs = ed.deliverablesList.querySelectorAll('.deliverable-text-input');
    const arr = [];
    inputs.forEach(inp => {
      if (inp.value.trim()) arr.push(inp.value.trim());
    });
    return arr;
  }

  // Website Links Editor
  function renderWebsiteLinksEditor(links) {
    ed.websiteLinksList.innerHTML = '';
    (links || []).forEach(link => {
      const row = document.createElement('div');
      row.className = 'website-link-item-row';
      row.setAttribute('data-id', link.id || generateId('link'));
      row.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
          <input type="text" class="link-title-input" placeholder="Portal Title (e.g. ALAM ENGAZ Staff Portal)" value="${escapeHtml(link.title || '')}">
          <input type="url" class="link-url-input" placeholder="https://..." value="${escapeHtml(link.url || '')}">
        </div>
        <button type="button" class="btn-icon-action danger btn-del-link" style="width:28px; height:28px;"><i class="fa-solid fa-trash"></i></button>
      `;
      row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', syncLivePreview));
      row.querySelector('.btn-del-link').addEventListener('click', () => {
        row.remove();
        syncLivePreview();
      });
      ed.websiteLinksList.appendChild(row);
    });
  }

  function collectWebsiteLinks() {
    const rows = ed.websiteLinksList.querySelectorAll('.website-link-item-row');
    const arr = [];
    rows.forEach(r => {
      const title = r.querySelector('.link-title-input')?.value || '';
      const url = r.querySelector('.link-url-input')?.value || '';
      if (title.trim() || url.trim()) {
        arr.push({ id: r.getAttribute('data-id'), title, url });
      }
    });
    return arr;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Master Live Synchronizer: Keeps Editor and A4 Document 100% In Sync
  function syncLivePreview() {
    const invNum = ed.inputInvoiceNumber.value.trim() || 'BC-XX';
    const dateVal = ed.inputInvoiceDate.value.trim();
    const statusVal = ed.selectInvoiceStatus.value;
    const showDue = ed.toggleDueDate.checked;
    const dueVal = ed.inputInvoiceDueDate.value.trim();
    const clientName = ed.inputClientName.value.trim() || 'ALAM ENGAZ';
    const clientAddr = ed.inputClientAddress.value.trim();
    const clientEmail = ed.inputClientEmail.value.trim();

    // Items
    const items = collectItems();
    let subtotal = 0;
    items.forEach(it => subtotal += it.amount);

    const discount = parseFloat(ed.inputDiscountAmount.value) || 0;
    const grandTotal = Math.max(0, subtotal - discount);

    // Header updates
    sheet.invoiceNumber.textContent = invNum;
    sheet.invoiceDate.textContent = dateVal;
    if (showDue && dueVal) {
      sheet.dueDateRow.style.display = 'table-row';
      sheet.invoiceDueDate.textContent = dueVal;
    } else {
      sheet.dueDateRow.style.display = 'none';
    }

    ed.titleTag.textContent = invNum;
    ed.statusIndicator.textContent = statusVal;
    ed.statusIndicator.className = `editor-status-indicator ${statusVal.toLowerCase()}`;

    // Client
    sheet.clientName.textContent = clientName;
    if (clientAddr || clientEmail) {
      sheet.clientSubdetails.style.display = 'block';
      sheet.clientSubdetails.innerHTML = `${clientAddr ? `<div>${escapeHtml(clientAddr)}</div>` : ''}${clientEmail ? `<div>${escapeHtml(clientEmail)}</div>` : ''}`;
    } else {
      sheet.clientSubdetails.style.display = 'none';
    }

    // Service Table Rows
    let tableHtml = '';
    items.forEach(it => {
      const linkHtml = (it.showUrl && it.url) ? `
        <div class="item-link-wrap">
          <i class="fa-solid fa-link"></i>
          <a href="${it.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.url)}</a>
        </div>
      ` : '';

      tableHtml += `
        <tr>
          <td>
            <div class="item-main-title">${escapeHtml(it.title || 'SERVICE ITEM')}</div>
            ${it.subtitle ? `<div class="item-sub-desc">${escapeHtml(it.subtitle)}</div>` : ''}
            ${linkHtml}
          </td>
          <td class="td-qty">${it.quantity || 1}</td>
          <td class="td-rate">₹${(it.rate || 0).toLocaleString('en-IN')}</td>
          <td class="td-amount">₹${(it.amount || 0).toLocaleString('en-IN')}</td>
        </tr>
      `;
    });
    sheet.itemsTableBody.innerHTML = tableHtml;

    // Total Amount Payable Bar
    const formattedTotal = `₹${grandTotal.toLocaleString('en-IN')}/-`;
    sheet.totalPayable.textContent = formattedTotal;
    ed.calcTotalSummaryDisplay.textContent = formattedTotal;

    // Deliverables Checklist
    const delivs = collectDeliverables();
    let delivHtml = '';
    delivs.forEach(text => {
      delivHtml += `
        <div class="deliverable-sheet-item">
          <i class="fa-solid fa-circle-check deliverable-check-icon"></i>
          <span>${escapeHtml(text)}</span>
        </div>
      `;
    });
    sheet.deliverablesList.innerHTML = delivHtml;

    // Website Links Cards
    const weblinks = collectWebsiteLinks();
    let linksHtml = '';
    weblinks.forEach(lk => {
      linksHtml += `
        <div class="link-sheet-card">
          <div class="link-square-icon"><i class="fa-solid fa-link"></i></div>
          <div class="link-details-stack">
            <span class="link-portal-title">${escapeHtml(lk.title)}</span>
            <a href="${lk.url}" target="_blank" rel="noopener noreferrer" class="link-portal-url">${escapeHtml(lk.url)}</a>
          </div>
        </div>
      `;
    });
    sheet.websiteLinksList.innerHTML = linksHtml;

    // Payment Section & Toggles
    const showQr = ed.toggleShowQr.checked;
    ed.qrControlsContainer.style.display = showQr ? 'block' : 'none';

    const showUpi = ed.toggleShowUpiId.checked;
    const showGpay = ed.toggleShowGpay.checked;
    const showBank = ed.toggleShowBank.checked;
    const showAcc = ed.toggleShowAccountNo.checked;
    const showIfsc = ed.toggleShowIfsc.checked;

    sheet.rowBankName.style.display = showBank ? 'table-row' : 'none';
    sheet.rowAccountNumber.style.display = showAcc ? 'table-row' : 'none';
    sheet.rowIfsc.style.display = showIfsc ? 'table-row' : 'none';
    sheet.rowGpay.style.display = showGpay ? 'table-row' : 'none';
    sheet.rowUpi.style.display = showUpi ? 'table-row' : 'none';

    sheet.accountName.textContent = ed.inputPayeeName.value;
    sheet.bankName.textContent = ed.inputBankName.value;
    sheet.accountNumber.textContent = ed.inputAccountNumber.value;
    sheet.ifscCode.textContent = ed.inputIfscCode.value;
    sheet.gpayNumber.textContent = ed.inputGpayNumber.value;
    sheet.primaryUpi.textContent = ed.inputPrimaryUpi.value;
    sheet.secondaryUpi.textContent = ed.inputSecondaryUpi.value;

    const note = ed.inputPaymentNote.value.trim();
    if (note) {
      sheet.paymentNoteRow.style.display = 'flex';
      sheet.paymentNoteText.textContent = note;
    } else {
      sheet.paymentNoteRow.style.display = 'none';
    }

    // QR Code Handling: Upload vs Generate (Requirement 3, 4, 5)
    if (showQr) {
      sheet.qrCol.style.display = 'flex';
      sheet.paymentCard.classList.remove('no-qr');

      const isUploadMode = ed.qrModeUpload.checked;
      const customQr = currentInvoice?.payment?.customQrUrl;

      if (isUploadMode && customQr) {
        // DISPLAY UPLOADED QR IMAGE (Do NOT overwrite with generated QR)
        sheet.dynamicQrBox.innerHTML = `<img src="${customQr}" alt="Payment QR" style="max-width:100%; max-height:100%; width:100%; height:100%; object-fit:contain; display:block;">`;
        sheet.qrCenterBadge.style.display = 'none'; // Hide overlay since uploaded QR already has its own emblem
        sheet.qrCaption.textContent = `UPI ID: ${ed.inputSecondaryUpi.value.trim() || 'basimaslam419@okaxis'}`;
      } else {
        // GENERATE REAL WORKING DYNAMIC UPI QR
        const targetUpi = ed.inputQrUpiId.value.trim() || ed.inputSecondaryUpi.value.trim() || 'basimaslam419@okaxis';
        const targetPayee = ed.inputQrPayeeName.value.trim() || ed.inputPayeeName.value.trim() || 'BASIM ASLAM P';
        sheet.qrCenterBadge.style.display = 'flex';
        sheet.qrCaption.textContent = `UPI ID: ${targetUpi}`;
        renderDynamicUpiQr(grandTotal, targetUpi, targetPayee);
      }
    } else {
      // HIDE QR COMPLETELY — REFLOW PAYMENT CARD (No empty gap)
      sheet.qrCol.style.display = 'none';
      sheet.paymentCard.classList.add('no-qr');
    }

    // Badge & Logo Check
    const stampSrc = currentInvoice?.business?.stampUrl || businessSettings.stampUrl || 'B BADGE.png';
    sheet.stampImg.src = stampSrc;

    const logoSrc = currentInvoice?.business?.logoUrl || businessSettings.logoUrl || 'be creatives agency.png';
    sheet.polygonLogo.src = logoSrc;
  }

  // Save Current Invoice
  function saveCurrentInvoice() {
    const invNum = ed.inputInvoiceNumber.value.trim();
    if (!invNum) {
      showToast('Please enter an Invoice Number!', 'danger');
      return;
    }

    const clientName = ed.inputClientName.value.trim();
    if (!clientName) {
      showToast('Please enter Client Name!', 'danger');
      return;
    }

    const items = collectItems();
    let subtotal = 0;
    items.forEach(it => subtotal += it.amount);
    const discount = parseFloat(ed.inputDiscountAmount.value) || 0;
    const grandTotal = Math.max(0, subtotal - discount);

    const record = {
      id: currentInvoice?.id || generateId('inv'),
      invoiceNumber: invNum,
      date: ed.inputInvoiceDate.value.trim(),
      dueDate: ed.inputInvoiceDueDate.value.trim(),
      showDueDate: ed.toggleDueDate.checked,
      status: ed.selectInvoiceStatus.value,
      currency: ed.inputCurrencySymbol.value.trim() || '₹',
      client: {
        name: clientName,
        address: ed.inputClientAddress.value.trim(),
        email: ed.inputClientEmail.value.trim()
      },
      items: items,
      subtotal: subtotal,
      discount: discount,
      total: grandTotal,
      deliverables: collectDeliverables(),
      websiteLinks: collectWebsiteLinks(),
      payment: {
        accountName: ed.inputPayeeName.value.trim(),
        bankName: ed.inputBankName.value.trim(),
        accountNumber: ed.inputAccountNumber.value.trim(),
        ifsc: ed.inputIfscCode.value.trim(),
        gpay: ed.inputGpayNumber.value.trim(),
        primaryUpi: ed.inputPrimaryUpi.value.trim(),
        secondaryUpi: ed.inputSecondaryUpi.value.trim(),
        note: ed.inputPaymentNote.value.trim(),
        showQr: ed.toggleShowQr.checked,
        qrMode: ed.qrModeUpload.checked ? 'upload' : 'generate',
        customQrUrl: currentInvoice?.payment?.customQrUrl || '',
        showUpiId: ed.toggleShowUpiId.checked,
        showGpay: ed.toggleShowGpay.checked,
        showBank: ed.toggleShowBank.checked,
        showAccountNo: ed.toggleShowAccountNo.checked,
        showIfsc: ed.toggleShowIfsc.checked
      },
      business: currentInvoice?.business || { ...businessSettings }
    };

    // Check existing
    const idx = invoices.findIndex(i => i.id === record.id);
    if (idx >= 0) {
      invoices[idx] = record;
    } else {
      invoices.unshift(record);
    }

    saveInvoices();
    currentInvoice = record;
    showToast(`Invoice ${record.invoiceNumber} saved!`, 'success');
  }

  // Print & PDF Downloads
  function printInvoice() {
    window.print();
  }

  async function downloadPdf() {
    const invNum = (ed.inputInvoiceNumber.value.trim() || 'BC-78').replace(/[^a-zA-Z0-9_-]/g, '');
    const client = (ed.inputClientName.value.trim() || 'CLIENT').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `BE-Creatives-Invoice-${invNum}-${client}.pdf`;

    showToast(`Generating ${filename}...`, 'info');

    const sheetEl = sheet.container;
    if (!sheetEl) {
      window.print();
      return;
    }

    // Save previous styles so preview state is preserved exactly
    const savedTransform = sheetEl.style.transform;
    const savedMarginBottom = sheetEl.style.marginBottom;
    const savedTransition = sheetEl.style.transition;
    const savedBoxShadow = sheetEl.style.boxShadow;

    try {
      // 1. Neutralize all preview-only transforms and transitions
      sheetEl.style.transition = 'none';
      sheetEl.style.transform = 'none';
      sheetEl.style.marginBottom = '0px';
      sheetEl.style.boxShadow = 'none';

      // Exact single-page A4 standard dimensions at 96dpi (210mm x 297mm)
      const targetWidth = 794;
      const targetHeight = 1122;

      // 2. Ensure all images (logo, badge, signature, QR) are fully loaded
      const images = Array.from(sheetEl.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 800);
        });
      }));

      // Wait a frame for layout stability
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      const hasHtml2Canvas = typeof window.html2canvas === 'function';
      const hasJsPdf = window.jspdf && typeof window.jspdf.jsPDF === 'function';

      if (hasHtml2Canvas && hasJsPdf) {
        // High-definition render of the EXACT live preview element
        const canvas = await window.html2canvas(sheetEl, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: targetWidth,
          height: targetHeight,
          windowWidth: targetWidth,
          windowHeight: targetHeight,
          scrollX: 0,
          scrollY: 0
        });

        // Initialize strictly 1-page A4 PDF (210mm x 297mm)
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        // Add exact single-page canvas image covering exactly 210mm x 297mm with 0 margin
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

        // Preserve clickable hyperlinks at exact millimeter positions
        const sheetRect = sheetEl.getBoundingClientRect();
        const links = sheetEl.querySelectorAll('a[href]');
        links.forEach(linkEl => {
          const href = linkEl.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
          const targetBox = linkEl.closest('.link-sheet-card') || linkEl.closest('.item-link-wrap') || linkEl;
          const rect = targetBox.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const xMm = ((rect.left - sheetRect.left) / sheetRect.width) * 210;
            const yMm = ((rect.top - sheetRect.top) / sheetRect.height) * 297;
            const wMm = (rect.width / sheetRect.width) * 210;
            const hMm = (rect.height / sheetRect.height) * 297;
            pdf.link(xMm, yMm, wMm, hMm, { url: href });
          }
        });

        // Strictly enforce 1-page output: delete any extra page if present
        const totalPages = pdf.internal.getNumberOfPages();
        for (let p = totalPages; p > 1; p--) {
          pdf.deletePage(p);
        }

        pdf.save(filename);
        showToast(`Downloaded ${filename}`, 'success');
      } else if (typeof html2pdf === 'function') {
        // Fallback: html2pdf
        const opt = {
          margin: 0,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            width: targetWidth,
            height: targetHeight
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const pdfObj = await html2pdf().set(opt).from(sheetEl).toPdf().get('pdf');
        const totalPages = pdfObj.internal.getNumberOfPages();
        for (let p = totalPages; p > 1; p--) {
          pdfObj.deletePage(p);
        }
        await pdfObj.save();
        showToast(`Downloaded ${filename}`, 'success');
      } else {
        window.print();
      }
    } catch (err) {
      console.error('PDF export error, falling back to print:', err);
      showToast('PDF export error, opening print dialog...', 'warning');
      window.print();
    } finally {
      // Always restore preview transform and appearance
      sheetEl.style.transform = savedTransform;
      sheetEl.style.marginBottom = savedMarginBottom;
      sheetEl.style.boxShadow = savedBoxShadow;
      setTimeout(() => {
        sheetEl.style.transition = savedTransition;
      }, 50);
    }
  }

  // Business Settings Modal
  function openSettingsModal() {
    modals.settingBusinessName.value = businessSettings.name;
    modals.settingTagline.value = businessSettings.tagline;
    modals.settingInstagram.value = businessSettings.instagram;
    modals.settingInstagramUrl.value = businessSettings.instagramUrl;
    modals.settingAccountName.value = businessSettings.accountName;
    modals.settingBankName.value = businessSettings.bankName;
    modals.settingAccountNumber.value = businessSettings.accountNumber;
    modals.settingIfsc.value = businessSettings.ifsc;
    modals.settingGpay.value = businessSettings.gpay;
    modals.settingPrimaryUpi.value = businessSettings.primaryUpi;
    modals.settingSecondaryUpi.value = businessSettings.secondaryUpi;

    if (businessSettings.logoUrl) modals.settingLogoPreview.src = businessSettings.logoUrl;
    if (businessSettings.stampUrl) modals.settingStampPreview.src = businessSettings.stampUrl;
    if (businessSettings.signatureUrl) modals.settingSigPreview.src = businessSettings.signatureUrl;

    modals.settings.style.display = 'flex';
  }

  function closeSettingsModal() {
    modals.settings.style.display = 'none';
  }

  function saveBusinessSettings() {
    businessSettings.name = modals.settingBusinessName.value.trim() || 'BE CREATIVES';
    businessSettings.tagline = modals.settingTagline.value.trim();
    businessSettings.instagram = modals.settingInstagram.value.trim();
    businessSettings.instagramUrl = modals.settingInstagramUrl.value.trim();
    businessSettings.accountName = modals.settingAccountName.value.trim();
    businessSettings.bankName = modals.settingBankName.value.trim();
    businessSettings.accountNumber = modals.settingAccountNumber.value.trim();
    businessSettings.ifsc = modals.settingIfsc.value.trim();
    businessSettings.gpay = modals.settingGpay.value.trim();
    businessSettings.primaryUpi = modals.settingPrimaryUpi.value.trim();
    businessSettings.secondaryUpi = modals.settingSecondaryUpi.value.trim();

    saveSettings();

    // Propagate updated agency assets and business settings to current invoice
    if (currentInvoice) {
      if (!currentInvoice.business) currentInvoice.business = {};
      Object.assign(currentInvoice.business, businessSettings);
    }

    // Immediately re-render live invoice sheet so newly uploaded badge/logo/signature updates on screen & PDF
    renderLiveInvoice();

    closeSettingsModal();
    showToast('Business settings & agency assets saved permanently!', 'success');
  }

  function handleUpload(input, preview, key) {
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const b64 = ev.target.result;
        preview.src = b64;
        businessSettings[key] = b64;
        if (key === 'stampUrl' && sheet.stampImg) {
          sheet.stampImg.src = b64;
        } else if (key === 'logoUrl' && sheet.polygonLogo) {
          sheet.polygonLogo.src = b64;
        } else if (key === 'signatureUrl' && sheet.sigImg) {
          sheet.sigImg.src = b64;
        }
        showToast('Asset uploaded. Click "Save Defaults" to apply permanently.', 'info');
      };
      reader.readAsDataURL(file);
    });
  }

  // Backup & Reset
  function exportBackup() {
    const data = { businessSettings, invoices };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BE-Creatives-Invoices-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported!', 'success');
  }

  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const d = JSON.parse(e.target.result);
        if (Array.isArray(d.invoices)) {
          invoices = d.invoices;
          saveInvoices();
          if (d.businessSettings) {
            businessSettings = { ...DEFAULT_SETTINGS, ...d.businessSettings };
            saveSettings();
          }
          updateDashboard();
          showToast(`Imported ${invoices.length} invoices!`, 'success');
        }
      } catch (err) {
        showToast('Invalid backup JSON.', 'danger');
      }
    };
    reader.readAsText(file);
  }

  function resetToSample() {
    if (confirm('Reset to master reference invoice (BC-78 ALAM ENGAZ)?')) {
      invoices = JSON.parse(JSON.stringify(SEED_INVOICES));
      businessSettings = { ...DEFAULT_SETTINGS };
      saveInvoices();
      saveSettings();
      updateDashboard();
      showToast('Reset to BC-78 reference invoice.', 'info');
    }
  }

  // Events Attachment
  function attachEvents() {
    nav.dashboardBtn.addEventListener('click', showDashboard);
    if (nav.financeBtn) nav.financeBtn.addEventListener('click', showFinance);
    const btnDashboardGoFinance = document.getElementById('btnDashboardGoFinance');
    if (btnDashboardGoFinance) btnDashboardGoFinance.addEventListener('click', showFinance);
    nav.logoHome.addEventListener('click', showDashboard);
    nav.newInvoiceBtn.addEventListener('click', createNewInvoice);
    nav.settingsBtn.addEventListener('click', openSettingsModal);
    dash.btnNew.addEventListener('click', createNewInvoice);
    dash.btnEmptyCreate.addEventListener('click', createNewInvoice);

    // Finance Search and Filters
    if (finance.searchInput) {
      finance.searchInput.addEventListener('input', e => {
        financeSearch = e.target.value;
        if (finance.searchClearBtn) finance.searchClearBtn.style.display = financeSearch ? 'block' : 'none';
        financeCurrentPage = 1;
        renderFinance();
      });
    }

    if (finance.searchClearBtn) {
      finance.searchClearBtn.addEventListener('click', () => {
        if (finance.searchInput) finance.searchInput.value = '';
        financeSearch = '';
        finance.searchClearBtn.style.display = 'none';
        financeCurrentPage = 1;
        renderFinance();
      });
    }

    if (finance.monthSelect) {
      finance.monthSelect.addEventListener('change', e => {
        financeFilterMonth = e.target.value;
        financeCurrentPage = 1;
        renderFinance();
      });
    }

    if (finance.typePills) {
      finance.typePills.forEach(p => p.addEventListener('click', () => {
        finance.typePills.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        financeFilterType = p.getAttribute('data-type');
        financeCurrentPage = 1;
        renderFinance();
      }));
    }

    // Finance Pagination
    if (finance.btnPrev) {
      finance.btnPrev.addEventListener('click', () => {
        if (financeCurrentPage > 1) {
          financeCurrentPage--;
          renderFinance();
        }
      });
    }

    if (finance.btnNext) {
      finance.btnNext.addEventListener('click', () => {
        financeCurrentPage++;
        renderFinance();
      });
    }

    // Finance Delete Record
    const handleFinanceDelete = e => {
      const btn = e.target.closest('.btn-delete-tx');
      if (!btn) return;
      const txId = btn.getAttribute('data-id');
      if (!txId) return;
      if (confirm('Delete this transaction record?')) {
        financeTransactions = financeTransactions.filter(t => t.id !== txId);
        saveFinanceTransactions();
        populateFinanceMonthDropdown();
        renderFinance();
        showToast('Transaction record deleted.', 'info');
      }
    };

    if (finance.tableBody) finance.tableBody.addEventListener('click', handleFinanceDelete);
    if (finance.mobileCards) finance.mobileCards.addEventListener('click', handleFinanceDelete);

    // Finance Export CSV
    if (finance.btnExportCsv) {
      finance.btnExportCsv.addEventListener('click', () => {
        const records = getFilteredFinanceTransactions();
        if (!records.length) {
          showToast('No records to export.', 'info');
          return;
        }
        const headers = ['Date', 'Name / Party', 'Details / Note', 'Type', 'Debit (INR)', 'Credit (INR)', 'Amount (INR)'];
        const rows = records.map(r => [
          `"${(r.date || '').replace(/"/g, '""')}"`,
          `"${(r.name || '').replace(/"/g, '""')}"`,
          `"${(r.details || '').replace(/"/g, '""')}"`,
          `"${r.type}"`,
          r.debit || 0,
          r.credit || 0,
          r.amount || (r.type === 'CREDIT' ? r.credit : r.debit) || 0
        ]);
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BE_Creatives_Cashbook_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Exported ${records.length} transactions to CSV!`, 'success');
      });
    }

    // Finance Add Modal
    const modalAddTx = document.getElementById('modalAddTransaction');
    const formAddTx = document.getElementById('formAddTransaction');
    const btnCloseAddTx = document.getElementById('btnCloseAddTxModal');
    const btnCancelAddTx = document.getElementById('btnCancelAddTx');

    if (finance.btnOpenAdd && modalAddTx) {
      finance.btnOpenAdd.addEventListener('click', () => {
        const today = new Date();
        const iso = today.toISOString().split('T')[0];
        if (formAddTx) formAddTx.reset();
        const dateInput = document.getElementById('inputTxDate');
        if (dateInput) dateInput.value = iso;
        modalAddTx.style.display = 'flex';
      });
    }

    if (btnCloseAddTx && modalAddTx) {
      btnCloseAddTx.addEventListener('click', () => { modalAddTx.style.display = 'none'; });
    }
    if (btnCancelAddTx && modalAddTx) {
      btnCancelAddTx.addEventListener('click', () => { modalAddTx.style.display = 'none'; });
    }

    if (formAddTx) {
      formAddTx.addEventListener('submit', e => {
        e.preventDefault();
        const dateVal = document.getElementById('inputTxDate').value;
        const typeVal = document.getElementById('selectTxType').value;
        const nameVal = document.getElementById('inputTxName').value.trim();
        const amtVal = parseFloat(document.getElementById('inputTxAmount').value) || 0;
        const detailsVal = document.getElementById('inputTxDetails').value.trim();

        if (!nameVal || amtVal <= 0) {
          showToast('Please enter a valid party name and amount.', 'danger');
          return;
        }

        const dObj = new Date(dateVal);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const dStr = isNaN(dObj.getTime()) ? dateVal : `${dObj.getDate()} ${months[dObj.getMonth()]} ${dObj.getFullYear()}`;
        const mHeader = isNaN(dObj.getTime()) ? 'Recent' : `${fullMonths[dObj.getMonth()]} ${dObj.getFullYear()}`;

        const newTx = {
          id: 'tx_user_' + Date.now(),
          date: dStr,
          isoDate: dateVal,
          year: isNaN(dObj.getTime()) ? new Date().getFullYear() : dObj.getFullYear(),
          monthHeader: mHeader,
          name: nameVal,
          details: detailsVal,
          type: typeVal,
          amount: amtVal,
          debit: typeVal === 'DEBIT' ? amtVal : 0,
          credit: typeVal === 'CREDIT' ? amtVal : 0
        };

        financeTransactions.unshift(newTx);
        saveFinanceTransactions();
        populateFinanceMonthDropdown();
        if (modalAddTx) modalAddTx.style.display = 'none';
        renderFinance();
        showToast('Transaction added successfully!', 'success');
      });
    }

    // Dropdown
    nav.dataMenuBtn.addEventListener('click', e => {
      e.stopPropagation();
      nav.dataMenu.classList.toggle('active');
    });
    document.addEventListener('click', () => nav.dataMenu.classList.remove('active'));

    dash.exportBackupBtn.addEventListener('click', exportBackup);
    dash.importBackupInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) importBackup(e.target.files[0]);
    });
    dash.resetSampleDataBtn.addEventListener('click', resetToSample);

    // Search and Filters
    dash.searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      dash.searchClearBtn.style.display = searchQuery ? 'block' : 'none';
      updateDashboard();
    });
    dash.searchClearBtn.addEventListener('click', () => {
      dash.searchInput.value = '';
      searchQuery = '';
      dash.searchClearBtn.style.display = 'none';
      updateDashboard();
    });
    dash.filterPills.forEach(p => p.addEventListener('click', () => {
      dash.filterPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      activeFilter = p.getAttribute('data-filter');
      updateDashboard();
    }));

    // Invoices Table & Mobile Cards Actions
    const handleInvoiceAction = (action, id) => {
      if (!action || !id) return;

      if (action === 'toggle-status') {
        toggleStatus(id);
      } else if (action === 'view' || action === 'edit') {
        const inv = invoices.find(i => i.id === id);
        if (inv) {
          currentInvoice = inv;
          populateForm(inv);
          showEditor();
          setTimeout(() => applyZoom('fit'), 60);
        }
      } else if (action === 'duplicate') {
        duplicateInvoice(id);
      } else if (action === 'pdf') {
        const inv = invoices.find(i => i.id === id);
        if (inv) {
          currentInvoice = inv;
          populateForm(inv);
          showEditor();
          downloadPdf();
        }
      } else if (action === 'delete') {
        promptDelete(id);
      }
    };

    dash.tableBody.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      handleInvoiceAction(btn.getAttribute('data-action'), btn.getAttribute('data-id'));
    });

    if (dash.mobileCards) {
      dash.mobileCards.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        handleInvoiceAction(btn.getAttribute('data-action'), btn.getAttribute('data-id'));
      });
    }

    // Editor Actions
    ed.backBtn.addEventListener('click', showDashboard);
    ed.saveBtn.addEventListener('click', saveCurrentInvoice);
    ed.printBtn.addEventListener('click', printInvoice);
    ed.downloadPdfBtn.addEventListener('click', downloadPdf);
    ed.duplicateBtn.addEventListener('click', () => {
      if (currentInvoice && currentInvoice.id) duplicateInvoice(currentInvoice.id);
    });

    // Add Item
    const addItemFn = () => {
      const newItem = { id: generateId('item'), title: '', subtitle: '', url: '', showUrl: true, quantity: 1, rate: 0, amount: 0 };
      const existing = collectItems();
      existing.push(newItem);
      renderItemsEditor(existing);
      syncLivePreview();
    };
    ed.btnAddItem.addEventListener('click', addItemFn);
    ed.btnAddItemSecondary.addEventListener('click', addItemFn);

    // Add Deliverable
    ed.btnAddDeliverable.addEventListener('click', () => {
      const delivs = collectDeliverables();
      delivs.push('New Deliverable Service');
      renderDeliverablesEditor(delivs);
      syncLivePreview();
    });

    // Add Website Link
    ed.btnAddWebsiteLink.addEventListener('click', () => {
      const links = collectWebsiteLinks();
      links.push({ id: generateId('link'), title: 'Portal Name', url: 'https://' });
      renderWebsiteLinksEditor(links);
      syncLivePreview();
    });

    // Due Date Toggle
    ed.toggleDueDate.addEventListener('change', () => {
      ed.inputInvoiceDueDate.style.display = ed.toggleDueDate.checked ? 'block' : 'none';
      syncLivePreview();
    });

    // QR Mode Radio Switching (Generate vs Upload)
    ed.qrModeGenerate.addEventListener('change', () => {
      if (ed.qrModeGenerate.checked) {
        ed.qrUploadSection.style.display = 'none';
        ed.qrGenerateSection.style.display = 'block';
        if (currentInvoice && currentInvoice.payment) {
          currentInvoice.payment.qrMode = 'generate';
        }
        syncLivePreview();
      }
    });

    ed.qrModeUpload.addEventListener('change', () => {
      if (ed.qrModeUpload.checked) {
        ed.qrUploadSection.style.display = 'block';
        ed.qrGenerateSection.style.display = 'none';
        if (currentInvoice && currentInvoice.payment) {
          currentInvoice.payment.qrMode = 'upload';
        }
        syncLivePreview();
      }
    });

    // Upload Custom QR Image
    ed.inputUploadQrFile.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = ev => {
        const b64 = ev.target.result;
        ed.uploadedQrPreviewImg.src = b64;
        ed.btnRemoveUploadedQr.style.display = 'inline-flex';
        ed.uploadQrBtnText.textContent = 'Replace QR Image';

        if (!currentInvoice.payment) currentInvoice.payment = {};
        currentInvoice.payment.customQrUrl = b64;
        currentInvoice.payment.qrMode = 'upload';
        ed.qrModeUpload.checked = true;
        ed.qrUploadSection.style.display = 'block';
        ed.qrGenerateSection.style.display = 'none';

        syncLivePreview();
        showToast('Custom QR image uploaded successfully!', 'info');
      };
      reader.readAsDataURL(file);
    });

    // Remove Uploaded QR Image
    ed.btnRemoveUploadedQr.addEventListener('click', () => {
      if (currentInvoice && currentInvoice.payment) {
        currentInvoice.payment.customQrUrl = '';
        currentInvoice.payment.qrMode = 'generate';
      }
      ed.uploadedQrPreviewImg.src = 'qr code.png';
      ed.btnRemoveUploadedQr.style.display = 'none';
      ed.uploadQrBtnText.textContent = 'Upload QR Image';
      ed.qrModeGenerate.checked = true;
      ed.qrUploadSection.style.display = 'none';
      ed.qrGenerateSection.style.display = 'block';

      syncLivePreview();
      showToast('Uploaded QR removed. Switched to Dynamic UPI QR.', 'info');
    });

    // Form inputs live binding
    const liveInputs = [
      ed.inputInvoiceNumber,
      ed.inputInvoiceDate,
      ed.selectInvoiceStatus,
      ed.inputInvoiceDueDate,
      ed.inputCurrencySymbol,
      ed.inputClientName,
      ed.inputClientAddress,
      ed.inputClientEmail,
      ed.toggleShowQr,
      ed.inputQrUpiId,
      ed.inputQrPayeeName,
      ed.toggleShowUpiId,
      ed.toggleShowGpay,
      ed.toggleShowBank,
      ed.toggleShowAccountNo,
      ed.toggleShowIfsc,
      ed.inputPayeeName,
      ed.inputBankName,
      ed.inputAccountNumber,
      ed.inputIfscCode,
      ed.inputGpayNumber,
      ed.inputPrimaryUpi,
      ed.inputSecondaryUpi,
      ed.inputPaymentNote,
      ed.inputDiscountAmount
    ];
    liveInputs.forEach(el => {
      el.addEventListener('input', syncLivePreview);
      el.addEventListener('change', syncLivePreview);
    });

    // Modals
    modals.closeSettingsBtn.addEventListener('click', closeSettingsModal);
    modals.cancelSettingsBtn.addEventListener('click', closeSettingsModal);
    modals.saveSettingsBtn.addEventListener('click', saveBusinessSettings);
    modals.resetSettingsBtn.addEventListener('click', () => {
      businessSettings = { ...DEFAULT_SETTINGS };
      saveSettings();
      openSettingsModal();
      showToast('Settings reset to defaults.', 'info');
    });

    handleUpload(modals.settingLogoUpload, modals.settingLogoPreview, 'logoUrl');
    handleUpload(modals.settingStampUpload, modals.settingStampPreview, 'stampUrl');
    handleUpload(modals.settingSigUpload, modals.settingSigPreview, 'signatureUrl');

    modals.cancelDeleteBtn.addEventListener('click', () => {
      modals.deleteModal.style.display = 'none';
      pendingDeleteId = null;
    });
    modals.confirmDeleteBtn.addEventListener('click', confirmDelete);

    // Shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeSettingsModal();
        modals.deleteModal.style.display = 'none';
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && views.editor.classList.contains('active')) {
        e.preventDefault();
        saveCurrentInvoice();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && views.editor.classList.contains('active')) {
        e.preventDefault();
        printInvoice();
      }
    });

    // Zoom & Fit-to-screen Live A4 Preview Engine
    let currentZoomMode = 'fit';
    let zoomScale = 1;

    function applyZoom(modeOrScale) {
      if (!zoom.wrapper || !sheet.container) return;

      if (modeOrScale === 'fit') {
        currentZoomMode = 'fit';
        const availableWidth = zoom.wrapper.clientWidth - 24;
        zoomScale = Math.min(1.0, Math.max(0.32, availableWidth / 794));
        if (zoom.percent) zoom.percent.textContent = 'Fit';
      } else {
        currentZoomMode = 'manual';
        zoomScale = Math.min(1.6, Math.max(0.32, Math.round(modeOrScale * 100) / 100));
        if (zoom.percent) zoom.percent.textContent = `${Math.round(zoomScale * 100)}%`;
      }

      sheet.container.style.transform = `scale(${zoomScale})`;
      const baseHeight = 1123;
      const scaledHeight = baseHeight * zoomScale;
      sheet.container.style.marginBottom = `${Math.max(0, scaledHeight - baseHeight + 24)}px`;
    }

    if (zoom.btnIn) {
      zoom.btnIn.addEventListener('click', () => {
        applyZoom(zoomScale + 0.1);
      });
    }

    if (zoom.btnOut) {
      zoom.btnOut.addEventListener('click', () => {
        applyZoom(zoomScale - 0.1);
      });
    }

    if (zoom.btnFit) {
      zoom.btnFit.addEventListener('click', () => {
        applyZoom('fit');
      });
    }

    if (zoom.btnReset) {
      zoom.btnReset.addEventListener('click', () => {
        applyZoom(1.0);
      });
    }

    window.addEventListener('resize', () => {
      if (currentZoomMode === 'fit') {
        applyZoom('fit');
      }
    });

    // Collapsible Accordion Cards Handler
    document.querySelectorAll('.form-card.collapsible').forEach(card => {
      const header = card.querySelector('.form-card-header');
      if (header) {
        header.addEventListener('click', e => {
          if (e.target.closest('button') || e.target.closest('input') || e.target.closest('label') || e.target.closest('.header-action-btn')) {
            return;
          }
          card.classList.toggle('collapsed');
        });
      }
    });

    // Mobile Bottom Action Bar Listeners
    const mobBtnSave = document.getElementById('mobBtnSave');
    const mobBtnPdf = document.getElementById('mobBtnPdf');
    const mobBtnPrint = document.getElementById('mobBtnPrint');
    const mobBtnNew = document.getElementById('mobBtnNew');

    if (mobBtnSave) {
      mobBtnSave.addEventListener('click', () => {
        if (!views.editor.classList.contains('active')) {
          showEditor();
          setTimeout(() => applyZoom('fit'), 60);
        }
        saveCurrentInvoice();
      });
    }

    if (mobBtnPdf) {
      mobBtnPdf.addEventListener('click', () => {
        if (!views.editor.classList.contains('active')) {
          showEditor();
          setTimeout(() => applyZoom('fit'), 60);
        }
        downloadPdf();
      });
    }

    if (mobBtnPrint) {
      mobBtnPrint.addEventListener('click', () => {
        if (!views.editor.classList.contains('active')) {
          showEditor();
          setTimeout(() => applyZoom('fit'), 60);
        }
        printInvoice();
      });
    }

    if (mobBtnNew) {
      mobBtnNew.addEventListener('click', createNewInvoice);
    }

    // PWA Standalone & Installation Handlers
    let deferredInstallPrompt = null;
    const pwaInstallBtn = document.getElementById('btnInstallApp');
    const badgeInstalled = document.getElementById('badgeAppInstalled');
    const iosInstallBtn = document.getElementById('btnIosInstallHelp');
    const modalIos = document.getElementById('modalIosInstall');
    const btnCloseIos = document.getElementById('btnCloseIosModal');
    const btnGotItIos = document.getElementById('btnGotItIos');

    function isStandalone() {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true ||
             document.referrer.includes('android-app://');
    }

    function updateInstallState() {
      if (isStandalone()) {
        if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
        if (iosInstallBtn) iosInstallBtn.style.display = 'none';
        if (badgeInstalled) badgeInstalled.style.display = 'inline-flex';
      } else {
        if (badgeInstalled) badgeInstalled.style.display = 'none';
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIos && iosInstallBtn) {
          iosInstallBtn.style.display = 'inline-flex';
        }
        if (deferredInstallPrompt && pwaInstallBtn) {
          pwaInstallBtn.style.display = 'inline-flex';
        }
      }
    }

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredInstallPrompt = e;
      updateInstallState();
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      updateInstallState();
      showToast('BE Creatives Invoice installed as standalone app!', 'success');
    });

    if (pwaInstallBtn) {
      pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
          showToast('Installation prompt available via Chrome menu or when prompted.', 'info');
          return;
        }
        deferredInstallPrompt.prompt();
        const result = await deferredInstallPrompt.userChoice;
        if (result && result.outcome === 'accepted') {
          showToast('Installing BE Creatives Invoice...', 'info');
        }
        deferredInstallPrompt = null;
        updateInstallState();
      });
    }

    if (iosInstallBtn && modalIos) {
      iosInstallBtn.addEventListener('click', () => {
        modalIos.style.display = 'flex';
      });
      if (btnCloseIos) btnCloseIos.addEventListener('click', () => { modalIos.style.display = 'none'; });
      if (btnGotItIos) btnGotItIos.addEventListener('click', () => { modalIos.style.display = 'none'; });
    }

    // Register Service Worker for Offline PWA Support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(reg => {
            console.log('BE Invoice PWA ServiceWorker active:', reg.scope);
            reg.update().catch(() => {});
          })
          .catch(err => {
            console.warn('ServiceWorker registration error:', err);
          });
      });
    }

    updateInstallState();
  }

  // Initialization
  function init() {
    loadSettings();
    loadInvoices();
    loadFinanceTransactions();
    populateFinanceMonthDropdown();
    attachEvents();

    // Default to first invoice (BC-78)
    if (invoices.length > 0) {
      currentInvoice = invoices[0];
      populateForm(currentInvoice);
    }
    showDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
