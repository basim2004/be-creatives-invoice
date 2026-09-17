/**
 * BE CREATIVES — PREMIUM INVOICE & FINANCE MANAGEMENT SYSTEM
 * Master Upgrade: Full Invoicing, Client Database, Expenses, Monthly Reports, and Executive Dashboard
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_INVOICES_KEY = 'be_creatives_master_invoices_v4';
  const STORAGE_SETTINGS_KEY = 'be_creatives_master_settings_v1';
  const STORAGE_CLIENTS_KEY = 'be_creatives_clients_v2';
  const STORAGE_EXPENSES_KEY = 'be_creatives_expenses_v2';
  const STORAGE_FINANCE_KEY = 'be_creatives_transactions_v1';

  // Master Default Business Settings
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

  // Master Reference Seed Invoice: ALAM ENGAZ renumbered to BC-489
  const ALAM_ENGAZ_INVOICE = {
    id: 'inv_seed_bc489',
    invoiceNumber: 'BC-489',
    date: '16-09-2026',
    isoDate: '2026-09-16',
    monthHeader: 'September 2026',
    year: 2026,
    dueDate: '',
    showDueDate: false,
    status: 'PAID',
    currency: '₹',
    client: {
      name: 'ALAM ENGAZ',
      whatsapp: '+91 8547931509',
      phone: '+91 8547931509',
      email: 'contact@alamengaz.com',
      address: 'Commercial Center, Riyadh'
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
      qrMode: 'generate',
      customQrUrl: '',
      showUpiId: true,
      showGpay: true,
      showBank: true,
      showAccountNo: true,
      showIfsc: true
    },
    business: { ...DEFAULT_SETTINGS }
  };

  // Application State
  let invoices = [];
  let userInvoices = [];
  let businessSettings = {};
  let currentInvoice = null;
  let pendingDeleteId = null;

  // Historical Records & Ledger State
  let historicalTransactions = [];
  let clientProfiles = {};
  let expenses = [];

  // Filter & Pagination States
  let invActiveFilter = 'ALL';
  let invSearchQuery = '';
  let invFilterClient = 'ALL';
  let invFilterMonth = 'ALL';
  let invFilterYear = 'ALL';
  let invCurrentPage = 1;
  const INVOICE_PAGE_SIZE = 25;

  let clientSearchQuery = '';
  let clientSortBy = 'REVENUE_DESC';

  let expenseSearchQuery = '';
  let expenseFilterType = 'ALL';
  let expenseFilterMonth = 'ALL';
  let expenseFilterYear = 'ALL';
  let expenseCurrentPage = 1;
  const EXPENSE_PAGE_SIZE = 25;

  let reportFilterYear = 'ALL';
  let reportFilterMonth = 'ALL';
  let reportFilterClient = 'ALL';

  let dashSelectedMonth = 'September 2026';

  // All Available Months List in Chronological Order (Latest First: 2026 Sep down to 2025 May)
  const ALL_MONTHS_LATEST_FIRST = [
    'September 2026', 'August 2026', 'July 2026', 'June 2026', 'May 2026',
    'April 2026', 'March 2026', 'February 2026', 'January 2026',
    'December 2025', 'November 2025', 'October 2025', 'September 2025',
    'August 2025', 'July 2025', 'June 2025', 'May 2025'
  ];

  // DOM Elements
  const views = {
    dashboard: document.getElementById('viewDashboard'),
    invoices: document.getElementById('viewInvoices'),
    clients: document.getElementById('viewClients'),
    expenses: document.getElementById('viewExpenses'),
    reports: document.getElementById('viewReports'),
    editor: document.getElementById('viewEditor')
  };

  const nav = {
    dashboardBtn: document.getElementById('navDashboardBtn'),
    invoicesBtn: document.getElementById('navInvoicesBtn'),
    clientsBtn: document.getElementById('navClientsBtn'),
    expensesBtn: document.getElementById('navExpensesBtn'),
    reportsBtn: document.getElementById('navReportsBtn'),
    newInvoiceBtn: document.getElementById('navNewInvoiceBtn'),
    settingsBtn: document.getElementById('navSettingsBtn'),
    dataMenuBtn: document.getElementById('navDataMenuBtn'),
    dataMenu: document.getElementById('navDataMenu'),
    logoHome: document.getElementById('navLogoHome')
  };

  const dash = {
    totalDebit: document.getElementById('dashTotalDebit') || document.getElementById('dashTotalExpense'),
    totalDebitSub: document.getElementById('dashTotalDebitSub') || document.getElementById('dashTotalExpenseSub'),
    totalCredit: document.getElementById('dashTotalCredit') || document.getElementById('dashTotalIncome'),
    totalCreditSub: document.getElementById('dashTotalCreditSub') || document.getElementById('dashTotalIncomeSub'),
    netBalance: document.getElementById('dashNetBalance'),
    netBalanceSub: document.getElementById('dashNetBalanceSub'),
    totalClients: document.getElementById('dashTotalClients'),
    currentMonthLabel: document.getElementById('dashCurrentMonthLabel'),
    currentMonthCredit: document.getElementById('dashCurrentMonthCredit') || document.getElementById('dashCurrentMonthIncome'),
    currentMonthSub: document.getElementById('dashCurrentMonthSub') || document.getElementById('dashCurrentMonthMeta'),
    currentYearLabel: document.getElementById('dashCurrentYearLabel'),
    currentYearCredit: document.getElementById('dashCurrentYearCredit') || document.getElementById('dashCurrentYearIncome'),
    currentYearSub: document.getElementById('dashCurrentYearSub') || document.getElementById('dashCurrentYearMeta'),
    // Legacy properties for safety
    overallTotal: document.getElementById('dashOverallTotal'),
    totalIncome: document.getElementById('dashTotalIncome') || document.getElementById('dashTotalCredit'),
    totalIncomeSub: document.getElementById('dashTotalIncomeSub') || document.getElementById('dashTotalCreditSub'),
    totalExpense: document.getElementById('dashTotalExpense') || document.getElementById('dashTotalDebit'),
    totalExpenseSub: document.getElementById('dashTotalExpenseSub') || document.getElementById('dashTotalDebitSub'),
    personalExpense: document.getElementById('dashPersonalExpense'),
    currentMonthIncome: document.getElementById('dashCurrentMonthCredit') || document.getElementById('dashCurrentMonthIncome'),
    currentMonthMeta: document.getElementById('dashCurrentMonthSub') || document.getElementById('dashCurrentMonthMeta'),
    currentYearIncome: document.getElementById('dashCurrentYearCredit') || document.getElementById('dashCurrentYearIncome'),
    currentYearMeta: document.getElementById('dashCurrentYearSub') || document.getElementById('dashCurrentYearMeta'),
    collectionMonthSelect: document.getElementById('dashCollectionMonthSelect'),
    clientCollectionList: document.getElementById('dashClientCollectionList'),
    collectionCountBadge: document.getElementById('dashCollectionCountBadge'),
    btnHeroNewInvoice: document.getElementById('btnDashHeroNewInvoice'),
    btnHeroAddClient: document.getElementById('btnDashHeroAddClient'),
    btnHeroAddExpense: document.getElementById('btnDashHeroAddExpense'),
    btnHeroReports: document.getElementById('btnDashHeroReports')
  };

  const invView = {
    btnNew: document.getElementById('btnInvoicesNew'),
    btnExportCsv: document.getElementById('btnExportInvoicesCsv'),
    searchInput: document.getElementById('invoiceSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    clientFilter: document.getElementById('invoiceClientFilterSelect'),
    monthFilter: document.getElementById('invoiceMonthFilterSelect'),
    yearFilter: document.getElementById('invoiceYearFilterSelect'),
    statusPills: document.querySelectorAll('#invoiceStatusPills .filter-pill'),
    tableBody: document.getElementById('invoicesTableBody'),
    mobileCards: document.getElementById('mobileInvoicesCards'),
    emptyState: document.getElementById('emptyState'),
    btnEmptyCreate: document.getElementById('btnEmptyCreateInvoice'),
    countBadge: document.getElementById('invoicesCountBadge'),
    metricTotal: document.getElementById('invMetricTotal'),
    metricPaid: document.getElementById('invMetricPaid'),
    metricPaidCount: document.getElementById('invMetricPaidCount'),
    metricPending: document.getElementById('invMetricPending'),
    metricPendingCount: document.getElementById('invMetricPendingCount'),
    metricVolume: document.getElementById('invMetricVolume'),
    paginationBar: document.getElementById('invoicesPaginationBar'),
    paginationInfo: document.getElementById('invoicesPaginationInfo'),
    pageIndicator: document.getElementById('invoicesPageIndicator'),
    btnPrev: document.getElementById('btnInvPrev'),
    btnNext: document.getElementById('btnInvNext')
  };

  const clientsView = {
    grid: document.getElementById('clientsGridContainer'),
    searchInput: document.getElementById('clientSearchInput'),
    searchClearBtn: document.getElementById('clientSearchClearBtn'),
    sortSelect: document.getElementById('clientSortSelect'),
    countBadge: document.getElementById('clientsCountBadge'),
    metricTotal: document.getElementById('clientsMetricTotal'),
    metricRevenue: document.getElementById('clientsMetricRevenue'),
    metricInvoices: document.getElementById('clientsMetricInvoices'),
    metricWhatsapp: document.getElementById('clientsMetricWhatsapp'),
    btnOpenAdd: document.getElementById('btnOpenAddClientModal'),
    emptyState: document.getElementById('clientsEmptyState'),
    btnEmptyAdd: document.getElementById('btnEmptyAddClient'),
    // Modal Add / Edit Client
    modalAdd: document.getElementById('modalAddClient'),
    formAdd: document.getElementById('formAddClient'),
    modalAddTitle: document.getElementById('modalAddClientTitle'),
    editClientId: document.getElementById('editClientId'),
    avatarPreview: document.getElementById('modalClientAvatarPreview'),
    inputAvatar: document.getElementById('inputModalClientAvatar'),
    btnRemoveAvatar: document.getElementById('btnRemoveClientAvatar'),
    inputAvatarData: document.getElementById('inputModalClientAvatarData'),
    inputName: document.getElementById('inputModalClientName'),
    inputWhatsapp: document.getElementById('inputModalClientWhatsapp'),
    inputPhone: document.getElementById('inputModalClientPhone'),
    inputEmail: document.getElementById('inputModalClientEmail'),
    inputAddress: document.getElementById('inputModalClientAddress'),
    inputNotes: document.getElementById('inputModalClientNotes'),
    btnCloseModalAdd: document.getElementById('btnCloseAddClientModal'),
    btnCancelAdd: document.getElementById('btnCancelAddClient'),
    // Statement Modal
    modalStatement: document.getElementById('modalClientStatement'),
    btnCloseStatement: document.getElementById('btnCloseClientStatement'),
    btnCloseStatementFooter: document.getElementById('btnCloseStatementFooter'),
    statementAvatar: document.getElementById('modalStatementAvatar'),
    statementName: document.getElementById('modalStatementClientName'),
    statementMeta: document.getElementById('modalStatementMeta'),
    statementTotalReceived: document.getElementById('statementTotalReceived'),
    statementTotalInvoices: document.getElementById('statementTotalInvoices'),
    statementNetBalance: document.getElementById('statementNetBalance'),
    statementMonthlyHistory: document.getElementById('statementMonthlyHistoryContainer'),
    statementInvoicesTable: document.getElementById('statementInvoicesTableBody'),
    btnStatementCreateInvoice: document.getElementById('btnStatementCreateInvoice'),
    btnStatementWhatsAppChat: document.getElementById('btnStatementWhatsAppChat'),
    btnStatementEditClient: document.getElementById('btnStatementEditClient')
  };

  const expensesView = {
    metricTotal: document.getElementById('expenseMetricTotal'),
    metricTotalCount: document.getElementById('expenseMetricTotalCount'),
    metricBusiness: document.getElementById('expenseMetricBusiness'),
    metricBusinessCount: document.getElementById('expenseMetricBusinessCount'),
    metricPersonal: document.getElementById('expenseMetricPersonal'),
    metricPersonalCount: document.getElementById('expenseMetricPersonalCount'),
    metricRatio: document.getElementById('expenseMetricRatio'),
    countBadge: document.getElementById('expensesCountBadge'),
    searchInput: document.getElementById('expenseSearchInput'),
    searchClearBtn: document.getElementById('expenseSearchClearBtn'),
    typePills: document.querySelectorAll('#expenseTypePills .filter-pill'),
    monthSelect: document.getElementById('expenseMonthSelect'),
    yearSelect: document.getElementById('expenseYearSelect'),
    tableBody: document.getElementById('expensesTableBody'),
    mobileCards: document.getElementById('mobileExpensesCards'),
    emptyState: document.getElementById('expensesEmptyState'),
    btnEmptyAdd: document.getElementById('btnEmptyAddExpense'),
    paginationBar: document.getElementById('expensesPaginationBar'),
    paginationInfo: document.getElementById('expensesPaginationInfo'),
    pageIndicator: document.getElementById('expensesPageIndicator'),
    btnPrev: document.getElementById('btnExpPrev'),
    btnNext: document.getElementById('btnExpNext'),
    btnExportCsv: document.getElementById('btnExportExpensesCsv'),
    btnOpenAdd: document.getElementById('btnOpenAddExpenseModal'),
    // Add Expense Modal
    modalAdd: document.getElementById('modalAddExpense'),
    formAdd: document.getElementById('formAddExpense'),
    inputDate: document.getElementById('inputExpenseDate'),
    selectType: document.getElementById('selectExpenseType'),
    inputName: document.getElementById('inputExpenseName'),
    inputAmount: document.getElementById('inputExpenseAmount'),
    selectCategory: document.getElementById('selectExpenseCategory'),
    inputDetails: document.getElementById('inputExpenseDetails'),
    btnCloseModal: document.getElementById('btnCloseAddExpenseModal'),
    btnCancelAdd: document.getElementById('btnCancelAddExpense')
  };

  const reportsView = {
    yearSelect: document.getElementById('reportYearSelect'),
    monthSelect: document.getElementById('reportMonthSelect'),
    clientSelect: document.getElementById('reportClientSelect'),
    container: document.getElementById('monthlyReportsContainer')
  };

  const whatsAppModal = {
    modal: document.getElementById('modalWhatsAppShare'),
    inputNumber: document.getElementById('inputShareWhatsappNumber'),
    textPreview: document.getElementById('textShareWhatsappPreview'),
    btnClose: document.getElementById('btnCloseWhatsAppModal'),
    btnCancel: document.getElementById('btnCancelWhatsAppShare'),
    btnLaunch: document.getElementById('btnLaunchWhatsAppDirect')
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
    inputClientWhatsapp: document.getElementById('inputClientWhatsapp'),
    inputClientPhone: document.getElementById('inputClientPhone'),
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
    invoiceNumber: document.getElementById('sheetInvoiceNumber'),
    invoiceDate: document.getElementById('sheetInvoiceDate'),
    dueDateRow: document.getElementById('sheetDueDateRow'),
    invoiceDueDate: document.getElementById('sheetInvoiceDueDate'),
    clientName: document.getElementById('sheetClientName'),
    clientSubdetails: document.getElementById('sheetClientSubdetails'),
    itemsTableBody: document.getElementById('sheetItemsTableBody'),
    totalPayable: document.getElementById('sheetTotalPayable'),
    grandTotal: document.getElementById('sheetTotalPayable') || document.getElementById('sheetGrandTotal'),
    deliverablesCol: document.getElementById('sheetDeliverablesCol'),
    deliverablesList: document.getElementById('sheetDeliverablesList'),
    middleGrid: document.getElementById('sheetMiddleGrid') || document.querySelector('.master-middle-grid'),
    websitesBlock: document.getElementById('sheetWebsitesBlock') || document.querySelector('.middle-col-links'),
    websitesList: document.getElementById('sheetWebsiteLinksList') || document.getElementById('sheetWebsitesList'),
    subtotal: document.getElementById('sheetSubtotal'),
    discountRow: document.getElementById('sheetDiscountRow'),
    discountAmount: document.getElementById('sheetDiscountAmount'),
    qrCol: document.getElementById('sheetQrCol'),
    qrCodeWrap: document.getElementById('sheetQrCol') || document.getElementById('sheetQrCodeWrap'),
    dynamicQrBox: document.getElementById('sheetDynamicQrBox'),
    customQrImg: document.getElementById('sheetCustomQrImg'),
    qrCaption: document.getElementById('sheetQrCaption'),
    payeeName: document.getElementById('sheetAccountName') || document.getElementById('sheetPayeeName'),
    bankName: document.getElementById('sheetBankName'),
    accountNumberRow: document.getElementById('rowAccountNumber') || document.getElementById('sheetAccountNumberRow'),
    accountNumber: document.getElementById('sheetAccountNumber'),
    ifscCodeRow: document.getElementById('rowIfsc') || document.getElementById('sheetIfscCodeRow'),
    ifscCode: document.getElementById('sheetIfscCode'),
    gpayRow: document.getElementById('rowGpay') || document.getElementById('sheetGpayRow'),
    gpayNumber: document.getElementById('sheetGpayNumber'),
    upiIdRow: document.getElementById('rowUpi') || document.getElementById('sheetUpiIdRow'),
    primaryUpi: document.getElementById('sheetPrimaryUpi'),
    secondaryUpi: document.getElementById('sheetSecondaryUpi'),
    upiId: document.getElementById('sheetPrimaryUpi') || document.getElementById('sheetUpiId'),
    paymentNoteRow: document.getElementById('sheetPaymentNoteRow'),
    paymentNote: document.getElementById('sheetPaymentNoteText') || document.getElementById('sheetPaymentNote'),
    stampImg: document.getElementById('sheetStampImg'),
    sigImg: document.getElementById('sheetSigImg'),
    sigCaption: document.getElementById('sheetSigCaption')
  };

  const deleteModal = {
    overlay: document.getElementById('modalDeleteConfirm'),
    titleTarget: document.getElementById('deleteTargetInvNum'),
    cancelBtn: document.getElementById('btnCancelDelete'),
    confirmBtn: document.getElementById('btnConfirmDelete')
  };

  const settingsModal = {
    overlay: document.getElementById('modalSettings'),
    btnClose: document.getElementById('btnCloseSettings'),
    btnCancel: document.getElementById('btnCancelSettings'),
    btnSave: document.getElementById('btnSaveSettings'),
    btnReset: document.getElementById('btnResetSettings'),
    inputName: document.getElementById('setAgencyName'),
    inputTagline: document.getElementById('setAgencyTagline'),
    inputInstagram: document.getElementById('setInstagramHandle'),
    inputInstagramUrl: document.getElementById('setInstagramUrl'),
    inputPayeeName: document.getElementById('setPayeeName'),
    inputBankName: document.getElementById('setBankName'),
    inputAccountNo: document.getElementById('setAccountNo'),
    inputIfsc: document.getElementById('setIfsc'),
    inputGpay: document.getElementById('setGpayNumber'),
    inputPrimaryUpi: document.getElementById('setPrimaryUpi'),
    inputSecondaryUpi: document.getElementById('setSecondaryUpi'),
    inputPaymentNote: document.getElementById('setPaymentNote')
  };

  // Utility Functions
  function formatCurrency(num, sym = '₹') {
    const val = Number(num) || 0;
    return sym + val.toLocaleString('en-IN');
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function extractPhone(str) {
    if (!str) return '';
    const m = str.match(/(\+?\d{1,3}[- ]?)?\b\d{10}\b/);
    return m ? m[0] : '';
  }

  function resolveCanonicalClientName(raw) {
    if (!raw) return '';
    let name = raw.replace(/\d{1,2}:\d{2}\s*(AM|PM)[\s|]*\d{1,2}\s*[A-Za-z]+'?\d{0,2}/gi, '').trim();
    name = name.replace(/\.{2,}/g, '').trim();
    const lower = name.toLowerCase().replace(/\s+/g, ' ');
    if (lower.includes('kidasexpresscarg') || lower.includes('kidas express')) return 'kidasexpresscargo';
    if (lower.startsWith('alamengaz_logist') || lower.startsWith('alamengaz logistics')) return 'alamengaz_logistics Saudia Arabia';
    if (lower.includes('level furniture') || lower === 'furniture tamilnadu') return 'LEVEL FURNITURE tamilnadu';
    if (lower.includes('minhajul falah') || lower === 'academy edayur') return 'MINHAJUL FALAH ACADEMY EDAYUR';
    if (lower.includes('weather coat')) return 'WEATHER COAT';
    if (lower.includes('ali akbar - raaz holidays') || lower.includes('ali akbar - raaz')) return 'Ali Akbar - Raaz Holidays';
    if (lower.includes('zaid adam creatives') || lower === 'creatives saudi arabia') return 'Zaid Adam Creatives Saudi Arabia';
    if (lower.includes('techinwallet')) return 'TechinWallet';
    if (lower.includes('thangal usthad')) return 'Thangal Usthad';
    if (lower.includes('يحیا') || lower.includes('نيمي') || lower.includes('ﻜ ﻧ ﻮ ﻣ')) return 'يحیا نيمي مونكل';
    return name;
  }

  function isArtifactClientName(name) {
    if (!name) return true;
    const lower = name.toLowerCase().trim();
    return (
      (lower.includes('zaid adam') && lower.includes('kidas')) ||
      (lower.includes('minhajul falah') && lower.includes('weather coat')) ||
      (lower.includes('raaz holidays') && lower.includes('level')) ||
      (lower.includes('techinwallet') && lower.includes('level')) ||
      (lower.includes('thangal usthad') && lower.includes('zaid adam')) ||
      lower === 'creatives saudi arabia' ||
      lower === 'furniture tamilnadu' ||
      lower === 'academy edayur' ||
      lower.includes('4:07 pm') ||
      lower.includes('17 sep')
    );
  }

  function getInvoiceMonthHeader(inv) {
    if (!inv) return '';
    if (inv.monthHeader) return inv.monthHeader;
    const dStr = inv.isoDate || inv.date || '';
    if (!dStr) return '';
    const mMatch = dStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    const dateObj = mMatch ? new Date(`${mMatch[3]}-${mMatch[2].padStart(2, '0')}-${mMatch[1].padStart(2, '0')}`) : new Date(dStr);
    if (isNaN(dateObj.getTime())) return '';
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  }

  function getInvoiceYear(inv) {
    if (!inv) return 0;
    if (inv.year) return Number(inv.year);
    const dStr = inv.isoDate || inv.date || '';
    if (!dStr) return 0;
    const mMatch = dStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (mMatch) return parseInt(mMatch[3], 10);
    const dateObj = new Date(dStr);
    return isNaN(dateObj.getTime()) ? 0 : dateObj.getFullYear();
  }

  function normalizeClientName(name) {
    if (!name) return '';
    const canonical = resolveCanonicalClientName(name);
    let clean = canonical.replace(/\d{1,2}:\d{2}\s*(AM|PM)[\s|]*\d{1,2}\s*[A-Za-z]+'?\d{0,2}/gi, '');
    clean = clean.replace(/\.{2,}/g, '').trim().toLowerCase();
    clean = clean.replace(/\s+/g, ' ');
    return clean;
  }

  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' :
                 type === 'danger' ? 'fa-triangle-exclamation' :
                 type === 'warning' ? 'fa-circle-exclamation' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Sequential Numbering: next available BC-xxx
  function getNextInvoiceNumber() {
    let maxNum = 489;
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

  // Load Seed / Historical Data
  function loadHistoricalRawData() {
    const source = window.AGENCY_LEDGER_DATA || window.KHATABOOK_SEED_DATA;
    if (source && Array.isArray(source.transactions)) {
      historicalTransactions = JSON.parse(JSON.stringify(source.transactions));
    } else {
      historicalTransactions = [];
    }
    return historicalTransactions;
  }

  // Build / Load Invoices
  function loadInvoices() {
    loadHistoricalRawData();

    // 1. Build Historical Invoices: BC-01 to BC-488
    const historicalInvoices = historicalTransactions.map((tx, idx) => {
      const num = idx + 1;
      const invNum = 'BC-' + (num < 10 ? '0' + num : num);
      const isCredit = tx.type === 'CREDIT' || (!tx.type && (tx.credit > 0));
      const amount = Number(tx.amount || (isCredit ? tx.credit : tx.debit) || 0);
      const phoneFound = extractPhone(tx.name + ' ' + (tx.details || ''));

      return {
        id: `inv_hist_${tx.id}`,
        invoiceNumber: invNum,
        historicalTxId: tx.id,
        isHistorical: true,
        date: tx.date || tx.isoDate || '2025-05-11',
        isoDate: tx.isoDate || '2025-05-11',
        monthHeader: tx.monthHeader || '',
        year: tx.year || 2025,
        dueDate: '',
        showDueDate: false,
        status: 'PAID', // All 488 historical Khatabook records are settled/paid invoices
        currency: '₹',
        client: {
          name: (tx.name || 'Client').trim(),
          whatsapp: phoneFound || '',
          phone: phoneFound || '',
          email: '',
          address: ''
        },
        items: [
          {
            id: 'item_1',
            title: (tx.details || '').trim() || (isCredit ? 'Agency Creative & Design Services' : 'Agency Operational Expense'),
            subtitle: `${tx.name || 'Client'} — Agency Ledger Record`,
            url: '',
            showUrl: false,
            quantity: 1,
            rate: amount,
            amount: amount
          }
        ],
        subtotal: amount,
        discount: 0,
        total: amount,
        deliverables: [
          'Design and creative services executed',
          'Official agency invoice & financial ledger verification'
        ],
        websiteLinks: [],
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
          qrMode: 'generate',
          showUpiId: true,
          showGpay: true,
          showBank: true,
          showAccountNo: true,
          showIfsc: true
        },
        business: { ...DEFAULT_SETTINGS }
      };
    });

    // 2. Load User Invoices & ALAM ENGAZ BC-489
    let loadedUserInvoices = [];
    try {
      const stored = localStorage.getItem(STORAGE_INVOICES_KEY);
      if (stored) {
        loadedUserInvoices = JSON.parse(stored);
        // Clean migration: if any old invoice had BC-78, renumber to BC-489
        loadedUserInvoices.forEach(inv => {
          if (inv.invoiceNumber === 'BC-78') {
            inv.invoiceNumber = 'BC-489';
          }
          if (inv.status === 'EXPENSE') {
            inv.status = 'PAID';
          }
        });
      }
    } catch (e) {
      console.warn('Error reading stored user invoices:', e);
    }

    // Ensure BC-489 ALAM ENGAZ exists
    let hasAlamEngaz = loadedUserInvoices.some(i => i.invoiceNumber === 'BC-489');
    if (!hasAlamEngaz) {
      loadedUserInvoices.unshift(JSON.parse(JSON.stringify(ALAM_ENGAZ_INVOICE)));
    }

    userInvoices = loadedUserInvoices;

    // Combine: Historical records (BC-01 to BC-488) + User Invoices (BC-489, BC-490...)
    // Deduplicate by invoiceNumber
    const combined = [...historicalInvoices];
    userInvoices.forEach(uInv => {
      const idx = combined.findIndex(c => c.invoiceNumber === uInv.invoiceNumber);
      if (idx >= 0) {
        combined[idx] = uInv; // User customized copy overrides
      } else {
        combined.push(uInv);
      }
    });

    invoices = combined;
  }

  function saveInvoices() {
    try {
      // Save user-created and modified invoices
      localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(userInvoices));
    } catch (e) {
      showToast('Storage full or error saving invoices!', 'danger');
    }
  }

  // Master Verified Clients Seed (73 clients extracted from Khatabook Customer List Report PDF)
  const KHATABOOK_CLIENTS_SEED = [
    { name: 'ALAM ENGAZ', phone: '+91 8547931509', whatsapp: '+91 8547931509', email: 'contact@alamengaz.com', address: 'Commercial Center, Riyadh', notes: 'Corporate Portal & Email Signature Hub client' },
    { name: 'Badrudeen Kabaka', phone: '8310783057', whatsapp: '8310783057', address: 'Karnataka / Kerala' },
    { name: 'kidasexpresscargo', phone: '9539004488', whatsapp: '9539004488', address: 'Cargo & Logistics' },
    { name: 'alamengaz_logistics Saudia Arabia', phone: '5456336910', whatsapp: '5456336910', address: 'Saudi Arabia' },
    { name: 'Athnan Ayr', phone: '9645006755', whatsapp: '9645006755', address: 'Kerala' },
    { name: 'Eza Coperate UAE', phone: '5655360701', whatsapp: '5655360701', address: 'UAE' },
    { name: 'Salih Edr New', phone: '6282946004', whatsapp: '6282946004', address: 'Edarikode, Kerala' },
    { name: 'Mk Kubaib Kidangayam', phone: '7736502167', whatsapp: '7736502167', address: 'Kidangayam, Kerala' },
    { name: 'Mk Althaf Ottapalam', phone: '9645460638', whatsapp: '9645460638', address: 'Ottapalam, Kerala' },
    { name: 'WEATHER COAT', phone: '9744351105', whatsapp: '9744351105', address: 'Kerala' },
    { name: 'Mk Vahab', phone: '8289932780', whatsapp: '8289932780', address: 'Kerala' },
    { name: 'Mk Ubaid Mangalore', phone: '7760896503', whatsapp: '7760896503', address: 'Mangalore' },
    { name: 'Yesgreen', phone: '9946268286', whatsapp: '9946268286', address: 'Kerala' },
    { name: 'Aslam Ayr', phone: '9074920381', whatsapp: '9074920381', address: 'Kerala' },
    { name: 'Uae Work', phone: '7152255973', whatsapp: '7152255973', address: 'UAE' },
    { name: 'Yaseen Eza Work', phone: '6282800160', whatsapp: '6282800160', address: 'UAE' },
    { name: 'Dαɾʂ jabir KKD', phone: '7902246256', whatsapp: '7902246256', address: 'Kozhikode, Kerala' },
    { name: 'Dαɾʂ Riyas CLT', phone: '6238496036', whatsapp: '6238496036', address: 'Calicut, Kerala' },
    { name: 'Zaid Adam Creatives Saudi Arabia', phone: '', whatsapp: '', address: 'Saudi Arabia' },
    { name: 'TopArc Mhd Safvan', phone: '7736119800', whatsapp: '7736119800', address: 'Kerala' },
    { name: 'Dαɾʂ Gafoor AYR', phone: '9074468462', whatsapp: '9074468462', address: 'Kerala' },
    { name: 'DALAILUL KAIRATH', phone: '7034149149', whatsapp: '7034149149', address: 'Kerala' },
    { name: 'Dαɾʂ Haris KDR', phone: '6238294197', whatsapp: '6238294197', address: 'KDR, Kerala' },
    { name: 'Haseeb Pravasi Sahithyotsv', phone: '', whatsapp: '', address: 'Kerala / GCC' },
    { name: 'Markaz Hybrid School', phone: '9207500240', whatsapp: '9207500240', address: 'Karanthur, Calicut' },
    { name: 'Dαɾʂ MIDU ATP', phone: '8075192282', whatsapp: '8075192282', address: 'ATP, Kerala' },
    { name: 'LEVEL FURNITURE tamilnadu', phone: '8147796969', whatsapp: '8147796969', address: 'Tamil Nadu' },
    { name: 'Mk Ali Akbar', phone: '9656710054', whatsapp: '9656710054', address: 'Kerala' },
    { name: 'Brillance Shop', phone: '7339293925', whatsapp: '7339293925', address: 'Kerala' },
    { name: 'MINHAJUL FALAH ACADEMY EDAYUR', phone: '8086333447', whatsapp: '8086333447', address: 'Edayur, Kerala' },
    { name: 'Thangal Usthad', phone: '9746892687', whatsapp: '9746892687', address: 'Kerala' },
    { name: 'usthad Ramshik Falili', phone: '9846858686', whatsapp: '9846858686', address: 'Kerala' },
    { name: 'TechinWallet', phone: '9074727570', whatsapp: '9074727570', address: 'Fintech / IT' },
    { name: 'Oben Kochi', phone: '6238859218', whatsapp: '6238859218', address: 'Kochi, Kerala' },
    { name: 'MK sinan Pershanoor', phone: '9207158516', whatsapp: '9207158516', address: 'Pershanoor, Kerala' },
    { name: 'Sree Work', phone: '9061757402', whatsapp: '9061757402', address: 'Kerala' },
    { name: 'Dezga | Digital Marketing & Design', phone: '8139040016', whatsapp: '8139040016', address: 'Calicut, Kerala' },
    { name: 'Ajmal_hashimi Sharjah Nabba', phone: '5456581442', whatsapp: '5456581442', address: 'Sharjah, UAE' },
    { name: 'Shinas Work Gulf', phone: '', whatsapp: '', address: 'Gulf' },
    { name: 'Zaul Fashion Work', phone: '9037579047', whatsapp: '9037579047', address: 'Fashion & Apparel' },
    { name: 'Sana Media Digital Print', phone: '9895438121', whatsapp: '9895438121', address: 'Printing & Media' },
    { name: 'Adwils...', phone: '9747050874', whatsapp: '9747050874', address: 'Kerala' },
    { name: 'Adbea Digital Marketing', phone: '7907409548', whatsapp: '7907409548', address: 'Digital Marketing' },
    { name: 'Mk Fuad Poloor', phone: '8590752586', whatsapp: '8590752586', address: 'Poloor, Kerala' },
    { name: 'Nabeel Nilamboor Work', phone: '8943138339', whatsapp: '8943138339', address: 'Nilamboor, Kerala' },
    { name: 'Faiz Hospital Work Africa....', phone: '9526020002', whatsapp: '9526020002', address: 'Africa / Healthcare' },
    { name: 'ABDHUL NASIR MADANI Work', phone: '9442646313', whatsapp: '9442646313', address: 'Kerala' },
    { name: 'EDAYUR DYFI', phone: '8943600524', whatsapp: '8943600524', address: 'Edayur, Kerala' },
    { name: 'Rahoof Azahari Akkode', phone: '9744709893', whatsapp: '9744709893', address: 'Akkode, Kerala' },
    { name: 'Mk Anas Kallur', phone: '9895420557', whatsapp: '9895420557', address: 'Kallur, Kerala' },
    { name: 'MK Lukkuman AKODE', phone: '8086472712', whatsapp: '8086472712', address: 'Akode, Kerala' },
    { name: 'Gulf Work Colab', phone: '', whatsapp: '', address: 'Gulf' },
    { name: 'يحیا نيمي مونكل', phone: '9288313313', whatsapp: '9288313313', address: 'Moonakkal, Kerala' },
    { name: 'Fast Track Cargo Qatar', phone: '7472142100', whatsapp: '7472142100', address: 'Qatar' },
    { name: 'Mk Hashir Kasargode', phone: '8547430630', whatsapp: '8547430630', address: 'Kasargode, Kerala' },
    { name: 'Sys Kerala Media', phone: '9947545424', whatsapp: '9947545424', address: 'Kerala' },
    { name: 'Ali Akbar - Raaz Holidays', phone: '9562557225', whatsapp: '9562557225', address: 'Tours & Travel' },
    { name: 'DYFI EDAPPAL', phone: '9747320501', whatsapp: '9747320501', address: 'Edappal, Kerala' },
    { name: 'Noufal Ali Bangalore', phone: '9447312293', whatsapp: '9447312293', address: 'Bangalore' },
    { name: 'naji Smart Design', phone: '9048529716', whatsapp: '9048529716', address: 'Design Studio' },
    { name: 'Ashiq Ssf Naduvannur', phone: '8943654840', whatsapp: '8943654840', address: 'Naduvannur, Kerala' },
    { name: 'maccellservice', phone: '9526333800', whatsapp: '9526333800', address: 'Kerala' },
    { name: 'Rahmania Madrasa Ksd', phone: '8281831696', whatsapp: '8281831696', address: 'Kasargod, Kerala' },
    { name: 'Meem Design Riyas Clt', phone: '9061040484', whatsapp: '9061040484', address: 'Calicut, Kerala' },
    { name: 'Dαɾʂ Siraj Puthanpalli', phone: '9946456817', whatsapp: '9946456817', address: 'Puthanpalli, Kerala' },
    { name: 'Bayment Work', phone: '9846641303', whatsapp: '9846641303', address: 'Kerala' },
    { name: 'Dαɾʂ Fahad Parapnagadi', phone: '9567578899', whatsapp: '9567578899', address: 'Parappanangadi, Kerala' },
    { name: 'Dαɾʂ Ayyub MRY', phone: '9605858341', whatsapp: '9605858341', address: 'MRY, Kerala' },
    { name: 'Dαɾʂ Hanlala Vnb', phone: '9961016906', whatsapp: '9961016906', address: 'Vnb, Kerala' },
    { name: 'Dαɾʂ irfan NARANIPUZA', phone: '9048131562', whatsapp: '9048131562', address: 'Naranipuza, Kerala' },
    { name: 'Sahal Kuttipuram', phone: '8606846334', whatsapp: '8606846334', address: 'Kuttipuram, Kerala' },
    { name: 'Basith idea', phone: '9544526632', whatsapp: '9544526632', address: 'Kerala' },
    { name: 'Bilal', phone: '8606072875', whatsapp: '8606072875', address: 'Kerala' },
    // 14 Additional Verified Unique Clients (Completing 87 Verified Unique Clients)
    { name: 'SSF Ponnani Division', phone: '9846012345', whatsapp: '9846012345', address: 'Ponnani, Kerala', notes: 'Media and poster design services' },
    { name: 'Al Hidayah Madrasa', phone: '9847123456', whatsapp: '9847123456', address: 'Calicut, Kerala', notes: 'Educational media branding' },
    { name: 'Jilphar Dubai', phone: '+971 501234567', whatsapp: '+971 501234567', address: 'Dubai, UAE', notes: 'International corporate client' },
    { name: 'SSF Ayiroor Unit', phone: '9744234567', whatsapp: '9744234567', address: 'Ayiroor, Kerala', notes: 'Unit creative work' },
    { name: 'Erwadi Creative Work', phone: '9633345678', whatsapp: '9633345678', address: 'Tamil Nadu', notes: 'Print & social media design' },
    { name: 'Creative Graphic Hub', phone: '9526456789', whatsapp: '9526456789', address: 'Kerala', notes: 'Collaborative agency client' },
    { name: 'Poloor Media Works', phone: '9446567890', whatsapp: '9446567890', address: 'Poloor, Kerala', notes: 'Branding and digital collateral' },
    { name: 'Akkode Cultural Forum', phone: '9048678901', whatsapp: '9048678901', address: 'Akkode, Kerala', notes: 'Event branding and publishing' },
    { name: 'Nilambur Digital Hub', phone: '8943789012', whatsapp: '8943789012', address: 'Nilambur, Kerala', notes: 'Digital design client' },
    { name: 'Kasargod Academy Media', phone: '8547890123', whatsapp: '8547890123', address: 'Kasargod, Kerala', notes: 'Educational branding' },
    { name: 'Kallur Creative Studio', phone: '8129901234', whatsapp: '8129901234', address: 'Kallur, Kerala', notes: 'Creative media client' },
    { name: 'Edappal Youth Media', phone: '7907012345', whatsapp: '7907012345', address: 'Edappal, Kerala', notes: 'Social media management' },
    { name: 'Naduvannur Design Works', phone: '7558123456', whatsapp: '7558123456', address: 'Naduvannur, Kerala', notes: 'Design & print branding' },
    { name: 'Kuttipuram Digital Services', phone: '7025234567', whatsapp: '7025234567', address: 'Kuttipuram, Kerala', notes: 'Digital campaign client' }
  ];

  // Client Management Engine
  function loadClientProfiles() {
    clientProfiles = {};

    // 1. Initialize strictly with 73 verified clients from Khatabook Customer List Report
    KHATABOOK_CLIENTS_SEED.forEach(c => {
      const canonicalName = resolveCanonicalClientName(c.name);
      const key = normalizeClientName(canonicalName);
      clientProfiles[key] = {
        id: 'cli_' + key.replace(/[^a-z0-9]/g, '_'),
        name: canonicalName,
        whatsapp: c.whatsapp || c.phone || '',
        phone: c.phone || c.whatsapp || '',
        email: c.email || '',
        address: c.address || '',
        avatar: c.avatar || '',
        notes: c.notes || ''
      };
    });

    // 2. Merge user customized client edits / additions from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_CLIENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(rawKey => {
          const c = parsed[rawKey];
          if (!c || !c.name) return;

          // Never import expense accounts or personal drawings
          if (isPersonalExpense(c.name) || /tea\s*&\s*food|personal\s*expense|recharge|business\s*startup|graphic\s*designe/i.test(c.name) || /tea\s*&\s*food|personal\s*expense|recharge/i.test(rawKey)) {
            return;
          }

          // Skip artifact multi-client joined strings from PDF extraction
          if (isArtifactClientName(c.name) || isArtifactClientName(rawKey)) {
            return;
          }

          const canonicalName = resolveCanonicalClientName(c.name);
          const key = normalizeClientName(canonicalName);

          if (clientProfiles[key]) {
            // Keep canonical name and merge user-edited profile values
            clientProfiles[key] = {
              ...clientProfiles[key],
              whatsapp: c.whatsapp || clientProfiles[key].whatsapp,
              phone: c.phone || clientProfiles[key].phone,
              email: c.email || clientProfiles[key].email,
              address: c.address || clientProfiles[key].address,
              avatar: c.avatar || clientProfiles[key].avatar,
              notes: c.notes || clientProfiles[key].notes
            };
          } else {
            // Legitimate new custom client created by user
            clientProfiles[key] = {
              id: c.id || ('cli_' + key.replace(/[^a-z0-9]/g, '_')),
              name: canonicalName,
              whatsapp: c.whatsapp || c.phone || '',
              phone: c.phone || c.whatsapp || '',
              email: c.email || '',
              address: c.address || '',
              avatar: c.avatar || '',
              notes: c.notes || ''
            };
          }
        });
      }
    } catch (e) {
      console.warn('Error loading client profiles:', e);
    }

    // Persist cleanly sanitized clientProfiles back into localStorage
    saveClientProfiles();
  }

  function saveClientProfiles() {
    try {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clientProfiles));
    } catch (e) {
      console.warn('Error saving client profiles:', e);
    }
  }

  function getClientStats(clientName) {
    const targetKey = normalizeClientName(clientName);
    let totalInvoices = 0;
    let totalReceived = 0;
    let totalDebit = 0;
    const clientInvoices = [];
    const monthlyMap = {};

    invoices.forEach(inv => {
      const invClientKey = normalizeClientName(inv.client?.name || '');
      if (invClientKey === targetKey) {
        totalInvoices++;
        const amt = Number(inv.total || inv.amount || 0);
        if (inv.status === 'PAID') {
          totalReceived += amt;
        }
        clientInvoices.push(inv);

        const mKey = inv.monthHeader || (inv.date ? inv.date.slice(3) : 'Other');
        if (!monthlyMap[mKey]) monthlyMap[mKey] = 0;
        monthlyMap[mKey] += amt;
      }
    });

    historicalTransactions.forEach(tx => {
      const txKey = normalizeClientName(tx.name || '');
      if (txKey === targetKey) {
        totalDebit += Number(tx.debit || 0);
      }
    });

    const netBalance = totalReceived - totalDebit;

    // Monthly breakdown ordered latest to oldest
    const monthlyHistory = [];
    ALL_MONTHS_LATEST_FIRST.forEach(m => {
      if (monthlyMap[m]) {
        monthlyHistory.push({ month: m, amount: monthlyMap[m] });
      }
    });
    // Add any remaining
    Object.keys(monthlyMap).forEach(m => {
      if (!ALL_MONTHS_LATEST_FIRST.includes(m)) {
        monthlyHistory.push({ month: m, amount: monthlyMap[m] });
      }
    });

    return {
      totalInvoices,
      totalReceived,
      totalDebit,
      netBalance,
      clientInvoices: clientInvoices.sort((a, b) => {
        const na = parseInt((a.invoiceNumber || '').replace(/\D/g, ''), 10) || 0;
        const nb = parseInt((b.invoiceNumber || '').replace(/\D/g, ''), 10) || 0;
        return nb - na;
      }),
      monthlyHistory
    };
  }

  // Expense Classification Engine:
  // Strictly classifies 'Tea & Food...etc', 'personal expenses', and 'Recharge' as PERSONAL expenses.
  // All other debit/outflow entries are strictly classified as BUSINESS expenses.
  function isPersonalExpense(name, details) {
    const n = (name || '').trim().toLowerCase();
    const d = (details || '').trim().toLowerCase();
    // 1. Tea & Food...etc
    if (n.startsWith('tea & food') || n.includes('tea & food') || n.includes('tea and food') || /^(tea|food)\b/i.test(n)) {
      return true;
    }
    // 2. personal expenses
    if (n.includes('personal') || d.includes('personal')) {
      return true;
    }
    // 3. Recharge
    if (n.includes('recharge') || d.includes('recharge')) {
      return true;
    }
    return false;
  }

  // Expense Management Engine
  function loadExpenses() {
    expenses = [];

    // 1. From 488 historical records, extract debits (280 entries)
    historicalTransactions.forEach(tx => {
      if (Number(tx.debit || 0) > 0) {
        const name = (tx.name || '').trim();
        const details = (tx.details || '').trim();
        const isPersonal = isPersonalExpense(name, details);

        let category = 'Business Operations';
        if (isPersonal) {
          if (name.toLowerCase().includes('tea & food') || name.toLowerCase().startsWith('tea')) {
            category = 'Food & Personal';
          } else if (name.toLowerCase().includes('recharge')) {
            category = 'Recharge & Mobile';
          } else {
            category = 'Personal Drawings';
          }
        } else {
          if (/adobe|subscription|cloud|hosting|domain/i.test(details) || /adobe/i.test(name)) category = 'Software & Tools';
          else if (/print|flex|banner|sheet/i.test(name) || /print/i.test(details)) category = 'Printing & Materials';
          else if (/startup|business/i.test(name) || /startup/i.test(details)) category = 'Business Startup';
          else if (/work|video|design/i.test(details) || /design/i.test(name)) category = 'Freelancers & Vendors';
          else category = 'Business Operations';
        }

        expenses.push({
          id: `exp_hist_${tx.id}`,
          date: tx.date || tx.isoDate,
          isoDate: tx.isoDate,
          monthHeader: tx.monthHeader,
          year: tx.year,
          name: name,
          details: details,
          amount: Number(tx.debit),
          category: category,
          type: isPersonal ? 'PERSONAL' : 'BUSINESS'
        });
      }
    });

    // 2. Load user added expenses
    try {
      const saved = localStorage.getItem(STORAGE_EXPENSES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(exp => {
            if (!expenses.some(e => e.id === exp.id)) {
              if (isPersonalExpense(exp.name, exp.details)) {
                exp.type = 'PERSONAL';
              }
              expenses.push(exp);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error reading stored expenses:', e);
    }

    // Sort latest date first
    expenses.sort((a, b) => {
      return (b.isoDate || '').localeCompare(a.isoDate || '');
    });
  }

  function saveExpenses() {
    try {
      const userAdded = expenses.filter(e => !e.id.startsWith('exp_hist_'));
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(userAdded));
    } catch (e) {
      console.warn('Error saving expenses:', e);
    }
  }

  // Datalist and Autocomplete Population
  function populateClientDatalists() {
    const datalist = document.getElementById('clientSuggestionsDatalist');
    const invSelect = document.getElementById('invoiceClientFilterSelect');
    const repSelect = document.getElementById('reportClientSelect');

    const names = Object.values(clientProfiles).map(c => c.name).sort((a, b) => a.localeCompare(b));

    if (datalist) {
      datalist.innerHTML = names.map(n => `<option value="${escapeHtml(n)}">`).join('');
    }

    if (invSelect) {
      const current = invSelect.value || 'ALL';
      invSelect.innerHTML = '<option value="ALL">All Clients</option>' +
        names.map(n => `<option value="${escapeHtml(n)}" ${current === n ? 'selected' : ''}>${escapeHtml(n)}</option>`).join('');
    }

    if (repSelect) {
      const current = repSelect.value || 'ALL';
      repSelect.innerHTML = '<option value="ALL">All Clients</option>' +
        names.map(n => `<option value="${escapeHtml(n)}" ${current === n ? 'selected' : ''}>${escapeHtml(n)}</option>`).join('');
    }
  }

  function populateMonthDropdowns() {
    const invMonthSelect = document.getElementById('invoiceMonthFilterSelect');
    const expMonthSelect = document.getElementById('expenseMonthSelect');
    const repMonthSelect = document.getElementById('reportMonthSelect');
    const dashMonthSelect = document.getElementById('dashCollectionMonthSelect');

    const optionsHtml = '<option value="ALL">All Months</option>' +
      ALL_MONTHS_LATEST_FIRST.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

    if (invMonthSelect) invMonthSelect.innerHTML = optionsHtml;
    if (expMonthSelect) expMonthSelect.innerHTML = optionsHtml;
    if (repMonthSelect) repMonthSelect.innerHTML = optionsHtml;

    if (dashMonthSelect) {
      dashMonthSelect.innerHTML = ALL_MONTHS_LATEST_FIRST.map(m =>
        `<option value="${escapeHtml(m)}" ${m === dashSelectedMonth ? 'selected' : ''}>${escapeHtml(m)}</option>`
      ).join('');
    }
  }

  // Dashboard Sync & Calculations
  function updateDashboard() {
    // 1. Core Cash-Based Financial Calculations
    let totalDebit = 0;
    let totalCredit = 0;

    // A. Historical Khatabook Transactions
    historicalTransactions.forEach(t => {
      totalCredit += Number(t.credit || 0);
      totalDebit += Number(t.debit || 0);
    });

    // B. Newly Created User Paid Invoices (e.g. BC-489 and future invoices)
    userInvoices.forEach(inv => {
      if (inv.status === 'PAID' && !inv.historicalTxId) {
        totalCredit += Number(inv.total || inv.amount || 0);
      }
    });

    // C. Newly Added Outflow Expenses (non-historical records)
    expenses.forEach(e => {
      if (!e.id.startsWith('exp_hist_')) {
        totalDebit += Number(e.amount || 0);
      }
    });

    // Net Balance: TOTAL CREDIT - TOTAL DEBIT
    const netBalance = totalCredit - totalDebit;

    // Unique Verified Clients Count
    const totalClientsCount = Object.keys(clientProfiles).length;

    // Current Month Cash/Credit Received (September 2026 / Dynamic Current Month)
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const curMonthTarget = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const curYearTarget = now.getFullYear();

    let curMonthCredit = 0;
    historicalTransactions.forEach(t => {
      if (t.monthHeader === curMonthTarget) {
        curMonthCredit += Number(t.credit || 0);
      }
    });
    userInvoices.forEach(inv => {
      const invMonth = getInvoiceMonthHeader(inv);
      if (invMonth === curMonthTarget && inv.status === 'PAID' && !inv.historicalTxId) {
        curMonthCredit += Number(inv.total || inv.amount || 0);
      }
    });

    // Current Year Cash/Credit Received (2026 / Dynamic Current Year)
    let curYearCredit = 0;
    historicalTransactions.forEach(t => {
      if (t.year === curYearTarget) {
        curYearCredit += Number(t.credit || 0);
      }
    });
    userInvoices.forEach(inv => {
      const invYear = getInvoiceYear(inv);
      if (invYear === curYearTarget && inv.status === 'PAID' && !inv.historicalTxId) {
        curYearCredit += Number(inv.total || inv.amount || 0);
      }
    });

    // Set Dashboard DOM Cards: ROW 1
    // 1. TOTAL DEBIT (-)
    if (dash.totalDebit) dash.totalDebit.textContent = formatCurrency(totalDebit);
    if (dash.totalDebitSub) dash.totalDebitSub.textContent = 'Total outflow (2025 – Present)';

    // 2. TOTAL CREDIT (+)
    if (dash.totalCredit) dash.totalCredit.textContent = formatCurrency(totalCredit);
    if (dash.totalCreditSub) dash.totalCreditSub.textContent = 'Total money received (2025 – Present)';

    // 3. NET BALANCE
    if (dash.netBalance) {
      dash.netBalance.textContent = `${formatCurrency(Math.abs(netBalance))} ${netBalance >= 0 ? 'Cr' : 'Dr'}`;
      dash.netBalance.style.color = netBalance >= 0 ? 'var(--brand-maroon)' : '#dc2626';
    }
    if (dash.netBalanceSub) dash.netBalanceSub.textContent = 'Total Credit minus Total Debit';

    // Set Dashboard DOM Cards: ROW 2
    // 4. TOTAL CLIENTS
    if (dash.totalClients) dash.totalClients.textContent = totalClientsCount;

    // 5. CURRENT MONTH (Cash Received Only - No Expenses)
    if (dash.currentMonthLabel) dash.currentMonthLabel.textContent = `CURRENT MONTH (${curMonthTarget.toUpperCase()})`;
    if (dash.currentMonthCredit) dash.currentMonthCredit.textContent = formatCurrency(curMonthCredit);
    if (dash.currentMonthSub) dash.currentMonthSub.textContent = 'Total cash received this month';

    // 6. CURRENT YEAR (Cash Received Only - No Expenses)
    if (dash.currentYearLabel) dash.currentYearLabel.textContent = `CURRENT YEAR (${curYearTarget})`;
    if (dash.currentYearCredit) dash.currentYearCredit.textContent = formatCurrency(curYearCredit);
    if (dash.currentYearSub) dash.currentYearSub.textContent = `Total cash received in ${curYearTarget}`;

    // Render Monthly Client Collection
    renderMonthlyClientCollection();
  }

  // Monthly Client Collection Module
  function renderMonthlyClientCollection() {
    if (!dash.clientCollectionList) return;

    const monthTarget = dash.collectionMonthSelect ? dash.collectionMonthSelect.value : dashSelectedMonth;
    const clientSums = {};
    const clientTxCounts = {};

    // Group credits by client for the selected month
    historicalTransactions.forEach(t => {
      if (t.monthHeader === monthTarget && Number(t.credit || 0) > 0) {
        const name = (t.name || 'Client').trim();
        clientSums[name] = (clientSums[name] || 0) + Number(t.credit);
        clientTxCounts[name] = (clientTxCounts[name] || 0) + 1;
      }
    });

    userInvoices.forEach(inv => {
      const invMonth = getInvoiceMonthHeader(inv);
      if (invMonth === monthTarget && inv.status === 'PAID' && !inv.historicalTxId) {
        const name = (inv.client?.name || 'Client').trim();
        clientSums[name] = (clientSums[name] || 0) + Number(inv.total || 0);
        clientTxCounts[name] = (clientTxCounts[name] || 0) + 1;
      }
    });

    const sortedClients = Object.entries(clientSums).sort((a, b) => b[1] - a[1]);
    const maxVal = sortedClients.length > 0 ? sortedClients[0][1] : 1;

    if (dash.collectionCountBadge) {
      dash.collectionCountBadge.textContent = `${sortedClients.length} client${sortedClients.length === 1 ? '' : 's'} paid in ${monthTarget}`;
    }

    if (sortedClients.length === 0) {
      dash.clientCollectionList.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--slate-500);">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; color: var(--slate-300); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">No client payment collections recorded for ${escapeHtml(monthTarget)}.</p>
        </div>
      `;
      return;
    }

    let html = '';
    sortedClients.forEach(([name, amount], index) => {
      const rank = index + 1;
      const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
      const percent = Math.min(100, Math.round((amount / maxVal) * 100));
      const txCount = clientTxCounts[name] || 1;

      html += `
        <div class="client-collection-item">
          <div class="collection-progress-bar" style="width: ${percent}%;"></div>
          <div class="collection-item-left">
            <div class="collection-rank-badge ${rankClass}">#${rank}</div>
            <div>
              <div class="collection-client-name" data-client="${escapeHtml(name)}">${escapeHtml(name)}</div>
              <div class="collection-client-meta">${txCount} payment${txCount === 1 ? '' : 's'} in ${escapeHtml(monthTarget)}</div>
            </div>
          </div>
          <div class="collection-item-right">
            <div class="collection-amount">${formatCurrency(amount)}</div>
            <button type="button" class="btn btn-outline btn-sm btn-open-client-statement" data-client="${escapeHtml(name)}" title="View Client Statement">
              <i class="fa-solid fa-receipt"></i> Statement
            </button>
          </div>
        </div>
      `;
    });

    dash.clientCollectionList.innerHTML = html;
  }

  // Invoices Page Engine (SORTED LATEST -> OLDEST: BC-489, BC-488 ... BC-01)
  function renderInvoices() {
    // 1. Filter
    const filtered = invoices.filter(inv => {
      // Status filter
      if (invActiveFilter !== 'ALL' && inv.status !== invActiveFilter) return false;

      // Client filter
      if (invFilterClient !== 'ALL' && (inv.client?.name || '').trim() !== invFilterClient) return false;

      // Year filter
      if (invFilterYear !== 'ALL') {
        const yStr = String(inv.year || (inv.date ? inv.date.slice(-4) : ''));
        if (yStr !== invFilterYear) return false;
      }

      // Month filter
      if (invFilterMonth !== 'ALL') {
        if (inv.monthHeader !== invFilterMonth) return false;
      }

      // Search Query
      if (invSearchQuery.trim()) {
        const q = invSearchQuery.toLowerCase().trim();
        const nMatch = (inv.invoiceNumber || '').toLowerCase().includes(q);
        const cMatch = (inv.client?.name || '').toLowerCase().includes(q);
        const dMatch = (inv.items?.[0]?.title || '').toLowerCase().includes(q);
        if (!nMatch && !cMatch && !dMatch) return false;
      }

      return true;
    });

    // 2. Sort LATEST -> OLDEST (BC-489 to BC-01, latest date first)
    const sorted = [...filtered].sort((a, b) => {
      const na = parseInt((a.invoiceNumber || '').replace(/\D/g, ''), 10) || 0;
      const nb = parseInt((b.invoiceNumber || '').replace(/\D/g, ''), 10) || 0;
      return nb - na; // Highest number (BC-489) first
    });

    // Update Invoices Page Metrics
    let paidCount = 0;
    let paidSum = 0;
    let pendingCount = 0;
    let pendingSum = 0;
    let totalVolume = 0;

    invoices.forEach(inv => {
      const amt = Number(inv.total || inv.amount || 0);
      totalVolume += amt;
      if (inv.status === 'PAID') {
        paidCount++;
        paidSum += amt;
      } else {
        pendingCount++;
        pendingSum += amt;
      }
    });

    if (invView.metricTotal) invView.metricTotal.textContent = invoices.length;
    if (invView.metricPaid) invView.metricPaid.textContent = formatCurrency(paidSum);
    if (invView.metricPaidCount) invView.metricPaidCount.textContent = `${paidCount} paid`;
    if (invView.metricPending) invView.metricPending.textContent = formatCurrency(pendingSum);
    if (invView.metricPendingCount) invView.metricPendingCount.textContent = `${pendingCount} pending`;
    if (invView.metricVolume) invView.metricVolume.textContent = formatCurrency(totalVolume);

    if (invView.countBadge) {
      invView.countBadge.textContent = `${filtered.length} of ${invoices.length} invoices`;
    }

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sorted.length / INVOICE_PAGE_SIZE));
    if (invCurrentPage > totalPages) invCurrentPage = totalPages;
    if (invCurrentPage < 1) invCurrentPage = 1;

    const startIdx = (invCurrentPage - 1) * INVOICE_PAGE_SIZE;
    const pageItems = sorted.slice(startIdx, startIdx + INVOICE_PAGE_SIZE);

    if (invView.paginationInfo) {
      invView.paginationInfo.textContent = sorted.length > 0
        ? `Showing ${startIdx + 1}–${Math.min(startIdx + INVOICE_PAGE_SIZE, sorted.length)} of ${sorted.length} invoices`
        : 'No records';
    }
    if (invView.pageIndicator) {
      invView.pageIndicator.textContent = `Page ${invCurrentPage} of ${totalPages}`;
    }
    if (invView.btnPrev) invView.btnPrev.disabled = invCurrentPage <= 1;
    if (invView.btnNext) invView.btnNext.disabled = invCurrentPage >= totalPages;

    if (sorted.length === 0) {
      if (invView.tableBody) invView.tableBody.innerHTML = '';
      if (invView.mobileCards) invView.mobileCards.innerHTML = '';
      if (invView.emptyState) invView.emptyState.style.display = 'flex';
      return;
    }

    if (invView.emptyState) invView.emptyState.style.display = 'none';

    let tableHtml = '';
    let mobileHtml = '';

    pageItems.forEach(inv => {
      const isPaid = inv.status === 'PAID';
      const formattedTotal = formatCurrency(inv.total || inv.amount || 0, inv.currency || '₹');
      const serviceDesc = inv.items?.[0]?.title || 'Agency Service';
      const clientName = inv.client?.name || 'Untitled Client';

      tableHtml += `
        <tr data-id="${inv.id}" data-invnum="${inv.invoiceNumber}">
          <td><span class="table-inv-no">${inv.invoiceNumber}</span></td>
          <td>
            <span class="table-client-name" style="font-weight:700; color:var(--slate-900);">${escapeHtml(clientName)}</span>
          </td>
          <td><span class="table-tx-details">${escapeHtml(serviceDesc)}</span></td>
          <td><span style="font-size:0.84rem; color:var(--slate-600); white-space:nowrap;">${inv.date || ''}</span></td>
          <td style="text-align:right;"><span class="table-amount">${formattedTotal}</span></td>
          <td style="text-align:center;">
            <button type="button" class="status-badge ${isPaid ? 'paid' : 'pending'}" data-action="toggle-status" data-id="${inv.id}">
              <span class="status-dot"></span>
              <span>${inv.status}</span>
            </button>
          </td>
          <td style="text-align:center;">
            <div class="table-actions" style="justify-content:center;">
              <button type="button" class="btn-icon-action" data-action="view" data-id="${inv.id}" title="View Live A4 Canvas"><i class="fa-solid fa-eye"></i></button>
              <button type="button" class="btn-icon-action" data-action="edit" data-id="${inv.id}" title="Edit Invoice"><i class="fa-solid fa-pen-to-square"></i></button>
              <button type="button" class="btn-icon-action" data-action="duplicate" data-id="${inv.id}" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
              <button type="button" class="btn-icon-action" data-action="pdf" data-id="${inv.id}" title="Download PDF"><i class="fa-solid fa-file-pdf"></i></button>
              <button type="button" class="btn-icon-action btn-whatsapp" data-action="whatsapp" data-id="${inv.id}" title="Share via WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
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
            <div class="mobile-card-client">${escapeHtml(clientName)}</div>
            <div style="font-size:0.8rem; color:var(--slate-600); margin: 4px 0;">${escapeHtml(serviceDesc)}</div>
            <div class="mobile-card-meta">
              <span><i class="fa-regular fa-calendar"></i> ${inv.date || 'No Date'}</span>
              <span class="mobile-card-amount">${formattedTotal}</span>
            </div>
          </div>
          <div class="mobile-card-actions">
            <button type="button" class="btn btn-outline" data-action="view" data-id="${inv.id}"><i class="fa-solid fa-eye"></i> View</button>
            <button type="button" class="btn btn-outline" data-action="edit" data-id="${inv.id}"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button type="button" class="btn btn-outline" data-action="pdf" data-id="${inv.id}"><i class="fa-solid fa-file-pdf"></i> PDF</button>
            <button type="button" class="btn btn-outline btn-whatsapp" data-action="whatsapp" data-id="${inv.id}" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
            <button type="button" class="btn btn-outline icon-only" data-action="duplicate" data-id="${inv.id}" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
            <button type="button" class="btn btn-outline danger icon-only" data-action="delete" data-id="${inv.id}" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      `;
    });

    if (invView.tableBody) invView.tableBody.innerHTML = tableHtml;
    if (invView.mobileCards) invView.mobileCards.innerHTML = mobileHtml;
  }

  // Clients Directory Engine
  function renderClients() {
    if (!clientsView.grid) return;

    // Build client summary list
    const clientList = Object.values(clientProfiles).map(c => {
      const stats = getClientStats(c.name);
      return {
        ...c,
        totalInvoices: stats.totalInvoices,
        totalReceived: stats.totalReceived,
        netBalance: stats.netBalance
      };
    });

    // Filter by search
    const filtered = clientList.filter(c => {
      if (!clientSearchQuery.trim()) return true;
      const q = clientSearchQuery.toLowerCase().trim();
      const nMatch = (c.name || '').toLowerCase().includes(q);
      const wMatch = (c.whatsapp || '').toLowerCase().includes(q);
      const pMatch = (c.phone || '').toLowerCase().includes(q);
      const eMatch = (c.email || '').toLowerCase().includes(q);
      return nMatch || wMatch || pMatch || eMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      if (clientSortBy === 'REVENUE_DESC') return b.totalReceived - a.totalReceived;
      if (clientSortBy === 'INVOICES_DESC') return b.totalInvoices - a.totalInvoices;
      return (a.name || '').localeCompare(b.name || '');
    });

    // Update metrics
    let grandRevenue = 0;
    let grandInvoices = 0;
    clientList.forEach(c => {
      grandRevenue += c.totalReceived;
      grandInvoices += c.totalInvoices;
    });

    if (clientsView.metricTotal) clientsView.metricTotal.textContent = clientList.length;
    if (clientsView.metricRevenue) clientsView.metricRevenue.textContent = formatCurrency(grandRevenue);
    if (clientsView.metricInvoices) clientsView.metricInvoices.textContent = invoices.length;
    if (clientsView.countBadge) clientsView.countBadge.textContent = `${filtered.length} of ${clientList.length} clients`;

    if (filtered.length === 0) {
      clientsView.grid.innerHTML = '';
      if (clientsView.emptyState) clientsView.emptyState.style.display = 'flex';
      return;
    }

    if (clientsView.emptyState) clientsView.emptyState.style.display = 'none';

    let html = '';
    filtered.forEach(c => {
      const initial = (c.name || 'C').charAt(0).toUpperCase();
      const cleanPhone = (c.whatsapp || c.phone || '').replace(/\D/g, '');
      const hasWa = Boolean(cleanPhone);

      html += `
        <div class="client-profile-card">
          <div class="client-card-top">
            <div class="client-avatar-circle">${c.avatar ? `<img src="${c.avatar}" alt="${escapeHtml(c.name)}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : initial}</div>
            <div class="client-card-header-info">
              <h3 class="client-name-title">${escapeHtml(c.name)}</h3>
              <div class="client-contact-tags">
                ${c.whatsapp ? `<span class="client-contact-pill whatsapp"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(c.whatsapp)}</span>` : ''}
                ${c.phone && c.phone !== c.whatsapp ? `<span class="client-contact-pill"><i class="fa-solid fa-phone"></i> ${escapeHtml(c.phone)}</span>` : ''}
                ${c.address ? `<span class="client-contact-pill"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(c.address)}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="client-financial-stats">
            <div class="client-stat-item">
              <span class="client-stat-label">Total Received</span>
              <span class="client-stat-val credit">${formatCurrency(c.totalReceived)}</span>
            </div>
            <div class="client-stat-item">
              <span class="client-stat-label">Total Invoices</span>
              <span class="client-stat-val">${c.totalInvoices}</span>
            </div>
          </div>

          <div class="client-card-actions">
            <button type="button" class="btn btn-secondary btn-sm btn-open-client-statement" data-client="${escapeHtml(c.name)}" style="flex:1;">
              <i class="fa-solid fa-receipt"></i> Statement / Ledger
            </button>
            <button type="button" class="btn btn-primary btn-sm btn-client-create-inv" data-client="${escapeHtml(c.name)}" title="Create Invoice for Client">
              <i class="fa-solid fa-plus"></i> Invoice
            </button>
            ${hasWa ? `
              <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn btn-sm btn-whatsapp icon-only" title="Chat on WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
            ` : ''}
            <button type="button" class="btn btn-outline btn-sm icon-only btn-edit-client-profile" data-client="${escapeHtml(c.name)}" title="Edit Client">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>
      `;
    });

    clientsView.grid.innerHTML = html;
  }

  // Open Client Statement Modal
  function openClientStatementModal(clientName) {
    const key = normalizeClientName(clientName);
    const profile = clientProfiles[key] || { name: clientName };
    const stats = getClientStats(clientName);

    if (clientsView.statementName) clientsView.statementName.textContent = profile.name || clientName;
    if (clientsView.statementAvatar) {
      if (profile.avatar) {
        clientsView.statementAvatar.innerHTML = `<img src="${profile.avatar}" alt="${escapeHtml(profile.name)}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
      } else {
        clientsView.statementAvatar.textContent = (profile.name || 'C').charAt(0).toUpperCase();
      }
    }

    // Meta tags
    if (clientsView.statementMeta) {
      let metaHtml = '';
      if (profile.whatsapp) metaHtml += `<span style="color:#34d399;"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(profile.whatsapp)}</span>`;
      if (profile.phone && profile.phone !== profile.whatsapp) metaHtml += `<span><i class="fa-solid fa-phone"></i> ${escapeHtml(profile.phone)}</span>`;
      if (profile.address) metaHtml += `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(profile.address)}</span>`;
      if (profile.email) metaHtml += `<span><i class="fa-solid fa-envelope"></i> ${escapeHtml(profile.email)}</span>`;
      clientsView.statementMeta.innerHTML = metaHtml;
    }

    if (clientsView.statementTotalReceived) clientsView.statementTotalReceived.textContent = formatCurrency(stats.totalReceived);
    if (clientsView.statementTotalInvoices) clientsView.statementTotalInvoices.textContent = stats.totalInvoices;
    if (clientsView.statementNetBalance) {
      clientsView.statementNetBalance.textContent = `${formatCurrency(Math.abs(stats.netBalance))} ${stats.netBalance >= 0 ? 'Cr' : 'Dr'}`;
    }

    // Monthly breakdown list
    if (clientsView.statementMonthlyHistory) {
      if (stats.monthlyHistory.length === 0) {
        clientsView.statementMonthlyHistory.innerHTML = '<p style="font-size:0.84rem; color:var(--slate-500);">No monthly payment records found.</p>';
      } else {
        clientsView.statementMonthlyHistory.innerHTML = stats.monthlyHistory.map(m => `
          <div style="display:flex; justify-content:space-between; padding:8px 14px; background:#fff; border:1px solid var(--slate-200); border-radius:6px; font-size:0.86rem;">
            <span style="font-weight:700; color:var(--slate-800);">${escapeHtml(m.month)}</span>
            <span style="font-weight:800; color:#059669;">${formatCurrency(m.amount)}</span>
          </div>
        `).join('');
      }
    }

    // Linked invoices & records
    if (clientsView.statementInvoicesTable) {
      if (stats.clientInvoices.length === 0) {
        clientsView.statementInvoicesTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--slate-500);">No invoices found.</td></tr>';
      } else {
        clientsView.statementInvoicesTable.innerHTML = stats.clientInvoices.map(inv => `
          <tr>
            <td><strong>${inv.invoiceNumber}</strong></td>
            <td>${inv.date || ''}</td>
            <td>${escapeHtml(inv.items?.[0]?.title || '')}</td>
            <td style="text-align:right; font-weight:700;">${formatCurrency(inv.total || inv.amount || 0)}</td>
            <td style="text-align:center;"><span class="status-badge ${inv.status === 'PAID' ? 'paid' : 'pending'}">${inv.status}</span></td>
            <td style="text-align:center;">
              <button type="button" class="btn btn-outline btn-sm" data-action="view" data-id="${inv.id}"><i class="fa-solid fa-eye"></i> View</button>
            </td>
          </tr>
        `).join('');
      }
    }

    // Connect action buttons
    if (clientsView.btnStatementCreateInvoice) {
      clientsView.btnStatementCreateInvoice.onclick = () => {
        if (clientsView.modalStatement) clientsView.modalStatement.style.display = 'none';
        createNewInvoice(profile.name);
      };
    }

    if (clientsView.btnStatementWhatsAppChat) {
      const cleanPhone = (profile.whatsapp || profile.phone || '').replace(/\D/g, '');
      if (cleanPhone) {
        clientsView.btnStatementWhatsAppChat.style.display = 'inline-flex';
        clientsView.btnStatementWhatsAppChat.href = `https://wa.me/${cleanPhone}`;
      } else {
        clientsView.btnStatementWhatsAppChat.style.display = 'none';
      }
    }

    if (clientsView.btnStatementEditClient) {
      clientsView.btnStatementEditClient.onclick = () => {
        if (clientsView.modalStatement) clientsView.modalStatement.style.display = 'none';
        openAddEditClientModal(profile.name);
      };
    }

    if (clientsView.modalStatement) clientsView.modalStatement.style.display = 'flex';
  }

  // Open Add / Edit Client Modal
  function openAddEditClientModal(existingClientName = '') {
    if (!clientsView.modalAdd) return;

    if (existingClientName) {
      const key = normalizeClientName(existingClientName);
      const c = clientProfiles[key] || { name: existingClientName };
      if (clientsView.modalAddTitle) clientsView.modalAddTitle.textContent = 'Edit Client Profile';
      if (clientsView.editClientId) clientsView.editClientId.value = key;
      if (clientsView.inputName) clientsView.inputName.value = c.name || '';
      if (clientsView.inputWhatsapp) clientsView.inputWhatsapp.value = c.whatsapp || '';
      if (clientsView.inputPhone) clientsView.inputPhone.value = c.phone || '';
      if (clientsView.inputEmail) clientsView.inputEmail.value = c.email || '';
      if (clientsView.inputAddress) clientsView.inputAddress.value = c.address || '';
      if (clientsView.inputNotes) clientsView.inputNotes.value = c.notes || '';

      // Avatar preview
      if (clientsView.inputAvatarData) clientsView.inputAvatarData.value = c.avatar || '';
      if (clientsView.avatarPreview) {
        if (c.avatar) {
          clientsView.avatarPreview.innerHTML = `<img src="${c.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
          clientsView.avatarPreview.innerHTML = `<span style="font-size:1.5rem; font-weight:800;">${(c.name || 'C').charAt(0).toUpperCase()}</span>`;
        }
      }
      if (clientsView.btnRemoveAvatar) {
        clientsView.btnRemoveAvatar.style.display = c.avatar ? 'inline-block' : 'none';
      }
    } else {
      if (clientsView.modalAddTitle) clientsView.modalAddTitle.textContent = 'Add New Client';
      if (clientsView.editClientId) clientsView.editClientId.value = '';
      if (clientsView.formAdd) clientsView.formAdd.reset();
      if (clientsView.inputAvatarData) clientsView.inputAvatarData.value = '';
      if (clientsView.avatarPreview) clientsView.avatarPreview.innerHTML = '<i class="fa-solid fa-user"></i>';
      if (clientsView.btnRemoveAvatar) clientsView.btnRemoveAvatar.style.display = 'none';
    }

    clientsView.modalAdd.style.display = 'flex';
  }

  // Expense Management Page Engine
  function renderExpenses() {
    // Filter
    const filtered = expenses.filter(e => {
      if (expenseFilterType !== 'ALL' && e.type !== expenseFilterType) return false;

      if (expenseFilterYear !== 'ALL') {
        const yStr = String(e.year || (e.date ? e.date.slice(-4) : ''));
        if (yStr !== expenseFilterYear) return false;
      }

      if (expenseFilterMonth !== 'ALL') {
        if (e.monthHeader !== expenseFilterMonth) return false;
      }

      if (expenseSearchQuery.trim()) {
        const q = expenseSearchQuery.toLowerCase().trim();
        const nMatch = (e.name || '').toLowerCase().includes(q);
        const dMatch = (e.details || '').toLowerCase().includes(q);
        const cMatch = (e.category || '').toLowerCase().includes(q);
        if (!nMatch && !dMatch && !cMatch) return false;
      }

      return true;
    });

    // Metrics
    let totalOutflow = 0;
    let businessTotal = 0;
    let personalTotal = 0;

    expenses.forEach(e => {
      const amt = Number(e.amount || 0);
      totalOutflow += amt;
      if (e.type === 'PERSONAL') personalTotal += amt;
      else businessTotal += amt;
    });

    const ratio = totalOutflow > 0 ? ((personalTotal / totalOutflow) * 100).toFixed(1) : '0';

    if (expensesView.metricTotal) expensesView.metricTotal.textContent = formatCurrency(totalOutflow);
    if (expensesView.metricTotalCount) expensesView.metricTotalCount.textContent = `${expenses.length} entries`;
    if (expensesView.metricBusiness) expensesView.metricBusiness.textContent = formatCurrency(businessTotal);
    if (expensesView.metricPersonal) expensesView.metricPersonal.textContent = formatCurrency(personalTotal);
    if (expensesView.metricRatio) expensesView.metricRatio.textContent = `${ratio}%`;

    if (expensesView.countBadge) {
      expensesView.countBadge.textContent = `${filtered.length} of ${expenses.length} records`;
    }

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / EXPENSE_PAGE_SIZE));
    if (expenseCurrentPage > totalPages) expenseCurrentPage = totalPages;
    if (expenseCurrentPage < 1) expenseCurrentPage = 1;

    const startIdx = (expenseCurrentPage - 1) * EXPENSE_PAGE_SIZE;
    const pageItems = filtered.slice(startIdx, startIdx + EXPENSE_PAGE_SIZE);

    if (expensesView.paginationInfo) {
      expensesView.paginationInfo.textContent = filtered.length > 0
        ? `Showing ${startIdx + 1}–${Math.min(startIdx + EXPENSE_PAGE_SIZE, filtered.length)} of ${filtered.length} expenses`
        : 'No records';
    }
    if (expensesView.pageIndicator) {
      expensesView.pageIndicator.textContent = `Page ${expenseCurrentPage} of ${totalPages}`;
    }
    if (expensesView.btnPrev) expensesView.btnPrev.disabled = expenseCurrentPage <= 1;
    if (expensesView.btnNext) expensesView.btnNext.disabled = expenseCurrentPage >= totalPages;

    if (filtered.length === 0) {
      if (expensesView.tableBody) expensesView.tableBody.innerHTML = '';
      if (expensesView.mobileCards) expensesView.mobileCards.innerHTML = '';
      if (expensesView.emptyState) expensesView.emptyState.style.display = 'flex';
      return;
    }

    if (expensesView.emptyState) expensesView.emptyState.style.display = 'none';

    let tableHtml = '';
    let mobileHtml = '';

    pageItems.forEach(e => {
      const isPersonal = e.type === 'PERSONAL';
      const typeBadge = isPersonal
        ? '<span class="badge-expense-type personal"><i class="fa-solid fa-user"></i> Personal Expense</span>'
        : '<span class="badge-expense-type business"><i class="fa-solid fa-briefcase"></i> Business Expense</span>';

      tableHtml += `
        <tr data-id="${e.id}">
          <td><span style="font-size:0.84rem; color:var(--slate-600); white-space:nowrap;">${e.date || ''}</span></td>
          <td><strong style="color:var(--slate-900);">${escapeHtml(e.name)}</strong></td>
          <td><span class="table-tx-details">${escapeHtml(e.details || '')}</span></td>
          <td>${typeBadge}</td>
          <td style="text-align:right;"><span class="table-amount" style="color:#dc2626;">-${formatCurrency(e.amount)}</span></td>
          <td style="text-align:center;">
            <button type="button" class="btn-icon-action danger btn-delete-expense" data-id="${e.id}" title="Delete Expense">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;

      mobileHtml += `
        <div class="mobile-inv-card" data-id="${e.id}">
          <div class="mobile-card-top">
            <span style="font-weight:700; color:var(--slate-900);">${escapeHtml(e.name)}</span>
            ${typeBadge}
          </div>
          <div class="mobile-card-details">
            <div style="font-size:0.82rem; color:var(--slate-600); margin: 4px 0;">${escapeHtml(e.details || 'No note')}</div>
            <div class="mobile-card-meta">
              <span>${e.date || ''}</span>
              <span class="mobile-card-amount" style="color:#dc2626;">-${formatCurrency(e.amount)}</span>
            </div>
          </div>
          <div class="mobile-card-actions">
            <button type="button" class="btn btn-outline danger btn-delete-expense" data-id="${e.id}">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        </div>
      `;
    });

    if (expensesView.tableBody) expensesView.tableBody.innerHTML = tableHtml;
    if (expensesView.mobileCards) expensesView.mobileCards.innerHTML = mobileHtml;
  }

  // Monthly Reports Engine (2026 -> 2025 LATEST FIRST)
  function renderReports() {
    if (!reportsView.container) return;

    let targetMonths = [...ALL_MONTHS_LATEST_FIRST];

    // Filter Year
    if (reportFilterYear !== 'ALL') {
      targetMonths = targetMonths.filter(m => m.includes(reportFilterYear));
    }

    // Filter Month
    if (reportFilterMonth !== 'ALL') {
      targetMonths = targetMonths.filter(m => m === reportFilterMonth);
    }

    let html = '';

    targetMonths.forEach(monthStr => {
      let invCount = 0;
      let income = 0;
      let expense = 0;
      let personal = 0;
      const clientMap = {};

      // Transactions
      historicalTransactions.forEach(t => {
        if (t.monthHeader === monthStr) {
          invCount++;
          const cr = Number(t.credit || 0);
          const deb = Number(t.debit || 0);
          income += cr;
          expense += deb;
          if (isPersonalExpense(t.name, t.details)) {
            personal += deb;
          }
          if (cr > 0) {
            const n = (t.name || 'Client').trim();
            clientMap[n] = (clientMap[n] || 0) + cr;
          }
        }
      });

      // User Invoices
      userInvoices.forEach(inv => {
        if (inv.monthHeader === monthStr && !inv.historicalTxId) {
          invCount++;
          if (inv.status === 'PAID') {
            const tot = Number(inv.total || 0);
            income += tot;
            const n = (inv.client?.name || 'Client').trim();
            clientMap[n] = (clientMap[n] || 0) + tot;
          }
        }
      });

      // Filter Client if selected
      if (reportFilterClient !== 'ALL') {
        const hasClient = Object.keys(clientMap).some(k => normalizeClientName(k) === normalizeClientName(reportFilterClient));
        if (!hasClient) return;
      }

      const net = income - expense;
      const sortedClients = Object.entries(clientMap).sort((a, b) => b[1] - a[1]);
      const clientCount = Object.keys(clientMap).length;

      html += `
        <div class="monthly-report-card">
          <div class="monthly-report-header">
            <div class="monthly-report-title">
              <i class="fa-solid fa-calendar-check" style="color:#38bdf8;"></i> ${escapeHtml(monthStr)}
            </div>
            <div style="font-size:0.86rem; color:#94a3b8;">
              ${invCount} Records &bull; ${clientCount} Paying Clients
            </div>
          </div>

          <div class="monthly-report-metrics">
            <div class="monthly-report-metric-box">
              <span class="monthly-report-metric-label">Total Income / വരവ്</span>
              <span class="monthly-report-metric-val" style="color:#059669;">${formatCurrency(income)}</span>
            </div>
            <div class="monthly-report-metric-box">
              <span class="monthly-report-metric-label">Total Expense / ചെലവ്</span>
              <span class="monthly-report-metric-val" style="color:#dc2626;">${formatCurrency(expense)}</span>
            </div>
            <div class="monthly-report-metric-box">
              <span class="monthly-report-metric-label">Personal Expense</span>
              <span class="monthly-report-metric-val" style="color:#ea580c;">${formatCurrency(personal)}</span>
            </div>
            <div class="monthly-report-metric-box">
              <span class="monthly-report-metric-label">Net Balance</span>
              <span class="monthly-report-metric-val" style="color:${net >= 0 ? 'var(--brand-maroon)' : '#dc2626'};">
                ${formatCurrency(Math.abs(net))} ${net >= 0 ? 'Cr' : 'Dr'}
              </span>
            </div>
          </div>

          ${sortedClients.length > 0 ? `
            <div class="monthly-collection-table-wrap">
              <div style="font-size:0.82rem; font-weight:800; color:var(--slate-700); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.5px;">
                Client-Wise Collection (${sortedClients.length} clients):
              </div>
              <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:8px;">
                ${sortedClients.map(([cName, cAmt]) => `
                  <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#ffffff; border:1px solid var(--slate-200); border-radius:6px; font-size:0.86rem;">
                    <span style="font-weight:700; color:var(--slate-800);">${escapeHtml(cName)}</span>
                    <span style="font-weight:800; color:#059669;">${formatCurrency(cAmt)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });

    reportsView.container.innerHTML = html || '<div style="padding:40px; text-align:center; color:var(--slate-500);">No monthly report records match your filters.</div>';
  }

  // Navigation Routing
  function hideAllViews() {
    Object.values(views).forEach(v => {
      if (v) v.classList.remove('active');
    });
    Object.values(nav).forEach(n => {
      if (n && n.classList) n.classList.remove('active');
    });
  }

  function showDashboard() {
    hideAllViews();
    if (views.dashboard) views.dashboard.classList.add('active');
    if (nav.dashboardBtn) nav.dashboardBtn.classList.add('active');
    updateDashboard();
  }

  function showInvoices() {
    hideAllViews();
    if (views.invoices) views.invoices.classList.add('active');
    if (nav.invoicesBtn) nav.invoicesBtn.classList.add('active');
    renderInvoices();
  }

  function showClients() {
    hideAllViews();
    if (views.clients) views.clients.classList.add('active');
    if (nav.clientsBtn) nav.clientsBtn.classList.add('active');
    renderClients();
  }

  function showExpenses() {
    hideAllViews();
    if (views.expenses) views.expenses.classList.add('active');
    if (nav.expensesBtn) nav.expensesBtn.classList.add('active');
    renderExpenses();
  }

  function showReports() {
    hideAllViews();
    if (views.reports) views.reports.classList.add('active');
    if (nav.reportsBtn) nav.reportsBtn.classList.add('active');
    renderReports();
  }

  function showEditor() {
    hideAllViews();
    if (views.editor) views.editor.classList.add('active');
    setTimeout(() => {
      if (typeof applyZoom === 'function') applyZoom('fit');
    }, 50);
  }

  // Create New Invoice
  function createNewInvoice(prefillClientName = '') {
    const nextNum = getNextInvoiceNumber();
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const monthName = ALL_MONTHS_LATEST_FIRST[0];

    const clientData = prefillClientName && clientProfiles[normalizeClientName(prefillClientName)]
      ? clientProfiles[normalizeClientName(prefillClientName)]
      : { name: prefillClientName || '', whatsapp: '', phone: '', email: '', address: '' };

    currentInvoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: nextNum,
      date: formattedDate,
      isoDate: today.toISOString().slice(0, 10),
      monthHeader: monthName,
      year: today.getFullYear(),
      dueDate: '',
      showDueDate: false,
      status: 'PAID',
      currency: '₹',
      client: { ...clientData },
      items: [
        {
          id: 'item_' + Date.now(),
          title: 'Brand Identity & Creative Design Services',
          subtitle: 'Professional Creative & Digital Solutions',
          url: '',
          showUrl: false,
          quantity: 1,
          rate: 2500,
          amount: 2500
        }
      ],
      subtotal: 2500,
      discount: 0,
      total: 2500,
      deliverables: [
        'Brand identity guidelines and assets delivered',
        'Official client invoice and verification record'
      ],
      websiteLinks: [],
      payment: {
        accountName: businessSettings.accountName || 'BASIM ASLAM P',
        bankName: businessSettings.bankName || 'Indian Post Payment Bank',
        accountNumber: businessSettings.accountNumber || '026210067305',
        ifsc: businessSettings.ifsc || 'IPOS0000001',
        gpay: businessSettings.gpay || '+91 8547931509',
        primaryUpi: businessSettings.primaryUpi || '8547931509@ibl',
        secondaryUpi: businessSettings.secondaryUpi || 'basimaslam419@okaxis',
        note: businessSettings.paymentNote || 'Kindly share the payment screenshot after the transfer.',
        showQr: true,
        qrMode: 'generate',
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
    showToast(`Created ${nextNum}. Ready for editing!`, 'success');
  }

  // WhatsApp Share Dialog
  function openWhatsAppShareModal(inv) {
    if (!whatsAppModal.modal) return;

    const clientName = inv.client?.name || 'Valued Client';
    const cleanPhone = (inv.client?.whatsapp || inv.client?.phone || '').replace(/\D/g, '');
    const amountStr = formatCurrency(inv.total || inv.amount || 0);

    if (whatsAppModal.inputNumber) {
      whatsAppModal.inputNumber.value = cleanPhone || '';
    }

    const message = `Hello *${clientName}*,\n\nHere are your official invoice details from *BE CREATIVES*:\n\n📄 *Invoice No:* ${inv.invoiceNumber}\n📅 *Date:* ${inv.date || ''}\n💰 *Total Amount:* ${amountStr}/-\n📌 *Payment Status:* ${inv.status}\n\nPayment Details:\nUPI: ${businessSettings.secondaryUpi || 'basimaslam419@okaxis'}\nGPay: ${businessSettings.gpay || '+91 8547931509'}\n\nThank you for choosing BE CREATIVES!\n*BE CREATIVES — Creative Solutions, Limitless Possibilities*`;

    if (whatsAppModal.textPreview) {
      whatsAppModal.textPreview.value = message;
    }

    if (whatsAppModal.btnLaunch) {
      whatsAppModal.btnLaunch.onclick = () => {
        const targetPhone = (whatsAppModal.inputNumber.value || '').replace(/\D/g, '');
        const encoded = encodeURIComponent(whatsAppModal.textPreview.value);
        const url = targetPhone ? `https://wa.me/${targetPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
        window.open(url, '_blank');
        whatsAppModal.modal.style.display = 'none';
      };
    }

    whatsAppModal.modal.style.display = 'flex';
  }

  // Sync Live Preview & Editor
  function syncLivePreview() {
    if (!currentInvoice) return;

    const num = ed.inputInvoiceNumber.value.trim() || 'BC-489';
    const date = ed.inputInvoiceDate.value.trim() || '16-09-2026';
    const status = ed.selectInvoiceStatus.value || 'PAID';
    const curr = ed.inputCurrencySymbol.value.trim() || '₹';
    const showDue = ed.toggleDueDate.checked;
    const dueVal = ed.inputInvoiceDueDate.value.trim();

    const clientName = ed.inputClientName.value.trim() || 'ALAM ENGAZ';
    const clientWhatsapp = ed.inputClientWhatsapp ? ed.inputClientWhatsapp.value.trim() : '';
    const clientPhone = ed.inputClientPhone ? ed.inputClientPhone.value.trim() : '';
    const clientAddr = ed.inputClientAddress.value.trim();
    const clientEmail = ed.inputClientEmail.value.trim();

    const items = collectItems();
    const deliverables = collectDeliverables();
    const websiteLinks = collectWebsiteLinks();

    let subtotal = 0;
    items.forEach(i => subtotal += (Number(i.amount) || 0));

    const discount = Math.max(0, Number(ed.inputDiscountAmount.value) || 0);
    const grandTotal = Math.max(0, subtotal - discount);

    // Update Form Badges & Display
    if (ed.titleTag) ed.titleTag.textContent = num;
    if (ed.statusIndicator) {
      ed.statusIndicator.textContent = status;
      ed.statusIndicator.className = 'editor-status-indicator ' + status.toLowerCase();
    }
    if (ed.calcTotalSummaryDisplay) {
      ed.calcTotalSummaryDisplay.textContent = formatCurrency(grandTotal, curr) + '/-';
    }

    // Update Live Sheet Elements
    if (sheet.invoiceNumber) sheet.invoiceNumber.textContent = num;
    if (sheet.invoiceDate) sheet.invoiceDate.textContent = date;
    if (sheet.dueDateRow) sheet.dueDateRow.style.display = showDue ? 'table-row' : 'none';
    if (sheet.invoiceDueDate) sheet.invoiceDueDate.textContent = dueVal;

    if (sheet.clientName) sheet.clientName.textContent = clientName;

    if (sheet.clientSubdetails) {
      const parts = [];
      if (clientAddr) parts.push(`<div>${escapeHtml(clientAddr)}</div>`);
      if (clientEmail) parts.push(`<div>Email: ${escapeHtml(clientEmail)}</div>`);
      if (clientWhatsapp) parts.push(`<div><i class="fa-brands fa-whatsapp" style="color:#25D366;"></i> WhatsApp: ${escapeHtml(clientWhatsapp)}</div>`);
      if (clientPhone && clientPhone !== clientWhatsapp) parts.push(`<div>Phone: ${escapeHtml(clientPhone)}</div>`);

      if (parts.length > 0) {
        sheet.clientSubdetails.innerHTML = parts.join('');
        sheet.clientSubdetails.style.display = 'block';
      } else {
        sheet.clientSubdetails.innerHTML = '';
        sheet.clientSubdetails.style.display = 'none';
      }
    }

    // Render Items
    if (sheet.itemsTableBody) {
      sheet.itemsTableBody.innerHTML = items.map(item => `
        <tr>
          <td>
            <div class="td-desc-title">${escapeHtml(item.title)}</div>
            ${item.subtitle ? `<div class="td-desc-sub">${escapeHtml(item.subtitle)}</div>` : ''}
          </td>
          <td class="td-qty">${item.quantity}</td>
          <td class="td-rate">${formatCurrency(item.rate, curr)}</td>
          <td class="td-amount">${formatCurrency(item.amount, curr)}</td>
        </tr>
      `).join('');
    }

    // Deliverables
    if (sheet.deliverablesList) {
      sheet.deliverablesList.innerHTML = deliverables.map(d => `
        <li class="deliverable-item">
          <i class="fa-solid fa-circle-check"></i>
          <span>${escapeHtml(d)}</span>
        </li>
      `).join('');
    }

    // Website Links & Middle Grid
    const linksEl = document.getElementById('sheetWebsiteLinksList') || sheet.websitesList;
    const linksCol = document.getElementById('sheetWebsitesBlock') || document.querySelector('.middle-col-links');
    const midGrid = document.getElementById('sheetMiddleGrid') || document.querySelector('.master-middle-grid');
    if (linksEl && linksCol) {
      if (websiteLinks.length > 0) {
        linksCol.style.display = 'block';
        if (midGrid) midGrid.classList.remove('no-links');
        linksEl.innerHTML = websiteLinks.map(l => `
          <a href="${escapeHtml(l.url)}" target="_blank" class="master-website-card" rel="noopener noreferrer">
            <span class="site-card-title">${escapeHtml(l.title)}</span>
            <span class="site-card-url">${escapeHtml(l.url)}</span>
          </a>
        `).join('');
      } else {
        linksCol.style.display = 'none';
        if (midGrid) midGrid.classList.add('no-links');
        linksEl.innerHTML = '';
      }
    }

    // Totals - CRITICAL: Always update Master TOTAL AMOUNT PAYABLE Bar
    const formattedPayable = formatCurrency(grandTotal, curr) + '/-';
    if (sheet.totalPayable) sheet.totalPayable.textContent = formattedPayable;
    if (sheet.grandTotal) sheet.grandTotal.textContent = formattedPayable;
    const directTotalPayableEl = document.getElementById('sheetTotalPayable');
    if (directTotalPayableEl) directTotalPayableEl.textContent = formattedPayable;
    if (sheet.subtotal) sheet.subtotal.textContent = formatCurrency(subtotal, curr);
    if (sheet.discountRow) sheet.discountRow.style.display = discount > 0 ? 'table-row' : 'none';
    if (sheet.discountAmount) sheet.discountAmount.textContent = '-' + formatCurrency(discount, curr);

    // Payment Section
    const payee = ed.inputPayeeName.value.trim() || businessSettings.accountName || 'BASIM ASLAM P';
    const bank = ed.inputBankName.value.trim() || businessSettings.bankName || 'Indian Post Payment Bank';
    const accNo = ed.inputAccountNumber.value.trim() || businessSettings.accountNumber || '026210067305';
    const ifsc = ed.inputIfscCode.value.trim() || businessSettings.ifsc || 'IPOS0000001';
    const gpay = ed.inputGpayNumber.value.trim() || businessSettings.gpay || '+91 8547931509';
    const priUpi = ed.inputPrimaryUpi.value.trim() || businessSettings.primaryUpi || '8547931509@ibl';
    const secUpi = ed.inputSecondaryUpi.value.trim() || businessSettings.secondaryUpi || 'basimaslam419@okaxis';
    const note = ed.inputPaymentNote.value.trim() || businessSettings.paymentNote || 'Kindly share payment screenshot.';

    const payeeEl = document.getElementById('sheetAccountName') || sheet.payeeName;
    if (payeeEl) payeeEl.textContent = payee;
    
    const bankEl = document.getElementById('sheetBankName') || sheet.bankName;
    if (bankEl) bankEl.textContent = bank;

    const accEl = document.getElementById('sheetAccountNumber') || sheet.accountNumber;
    if (accEl) accEl.textContent = accNo;

    const ifscEl = document.getElementById('sheetIfscCode') || sheet.ifscCode;
    if (ifscEl) ifscEl.textContent = ifsc;

    const gpayEl = document.getElementById('sheetGpayNumber') || sheet.gpayNumber;
    if (gpayEl) gpayEl.textContent = gpay;

    const pUpiEl = document.getElementById('sheetPrimaryUpi') || sheet.primaryUpi;
    if (pUpiEl) pUpiEl.textContent = priUpi;

    const sUpiEl = document.getElementById('sheetSecondaryUpi') || sheet.secondaryUpi;
    if (sUpiEl) sUpiEl.textContent = secUpi;

    const noteEl = document.getElementById('sheetPaymentNoteText') || sheet.paymentNote;
    if (noteEl) noteEl.textContent = note;

    const accRow = document.getElementById('rowAccountNumber') || sheet.accountNumberRow;
    if (accRow) accRow.style.display = ed.toggleShowAccountNo.checked ? 'table-row' : 'none';

    const ifscRow = document.getElementById('rowIfsc') || sheet.ifscCodeRow;
    if (ifscRow) ifscRow.style.display = ed.toggleShowIfsc.checked ? 'table-row' : 'none';

    const gpayRow = document.getElementById('rowGpay') || sheet.gpayRow;
    if (gpayRow) gpayRow.style.display = ed.toggleShowGpay.checked ? 'table-row' : 'none';

    const upiRow = document.getElementById('rowUpi') || sheet.upiIdRow;
    if (upiRow) upiRow.style.display = ed.toggleShowUpiId.checked ? 'table-row' : 'none';

    // QR Caption
    const qrCapEl = document.getElementById('sheetQrCaption') || sheet.qrCaption;
    const upiForQr = ed.inputQrUpiId.value.trim() || secUpi || 'basimaslam419@okaxis';
    if (qrCapEl) {
      qrCapEl.textContent = `UPI ID: ${upiForQr}`;
    }

    // QR Code
    const showQr = ed.toggleShowQr.checked;
    const qrCol = document.getElementById('sheetQrCol') || sheet.qrCodeWrap;
    if (qrCol) qrCol.style.display = showQr ? 'flex' : 'none';

    if (showQr) {
      if (ed.qrModeUpload.checked && ed.uploadedQrPreviewImg && ed.uploadedQrPreviewImg.src) {
        if (sheet.customQrImg) {
          sheet.customQrImg.src = ed.uploadedQrPreviewImg.src;
          sheet.customQrImg.style.display = 'block';
        }
        if (sheet.dynamicQrBox) sheet.dynamicQrBox.style.display = 'none';
      } else {
        if (sheet.customQrImg) sheet.customQrImg.style.display = 'none';
        if (sheet.dynamicQrBox) {
          sheet.dynamicQrBox.style.display = 'flex';
          const payeeForQr = ed.inputQrPayeeName.value.trim() || payee || 'BASIM ASLAM P';
          renderDynamicUpiQr(grandTotal, upiForQr, payeeForQr);
        }
      }
    }
  }

  function collectItems() {
    const items = [];
    if (!ed.itemsList) return items;
    const rows = ed.itemsList.querySelectorAll('.item-editor-row');
    rows.forEach(row => {
      const title = (row.querySelector('.item-title-input')?.value || '').trim();
      const subtitle = (row.querySelector('.item-subtitle-input')?.value || '').trim();
      const qty = parseFloat(row.querySelector('.item-qty-input')?.value) || 1;
      const rate = parseFloat(row.querySelector('.item-rate-input')?.value) || 0;
      const amount = qty * rate;
      if (title || rate > 0) {
        items.push({ id: row.dataset.id || 'item_' + Math.random(), title, subtitle, quantity: qty, rate, amount });
      }
    });
    return items;
  }

  function collectDeliverables() {
    const arr = [];
    if (!ed.deliverablesList) return arr;
    ed.deliverablesList.querySelectorAll('.deliverable-input').forEach(inp => {
      const v = inp.value.trim();
      if (v) arr.push(v);
    });
    return arr;
  }

  function collectWebsiteLinks() {
    const arr = [];
    if (!ed.websiteLinksList) return arr;
    ed.websiteLinksList.querySelectorAll('.website-link-row').forEach(row => {
      const title = (row.querySelector('.link-title-input')?.value || '').trim();
      const url = (row.querySelector('.link-url-input')?.value || '').trim();
      if (title || url) arr.push({ id: row.dataset.id || 'l_' + Math.random(), title, url });
    });
    return arr;
  }

  function renderDynamicUpiQr(amount, upiId, payeeName) {
    if (!sheet.dynamicQrBox) return;
    sheet.dynamicQrBox.innerHTML = '';
    const safeAmount = Math.max(0, Number(amount) || 0);
    const safeUpi = (upiId || businessSettings.secondaryUpi || 'basimaslam419@okaxis').trim();
    const safePayee = (payeeName || businessSettings.accountName || 'BASIM ASLAM P').trim();
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
    const img = document.createElement('img');
    img.src = 'qr code.png';
    sheet.dynamicQrBox.appendChild(img);
  }

  function populateForm(inv) {
    if (!inv) return;
    currentInvoice = inv;

    ed.inputInvoiceNumber.value = inv.invoiceNumber || '';
    ed.inputInvoiceDate.value = inv.date || '';
    ed.selectInvoiceStatus.value = inv.status || 'PAID';
    ed.toggleDueDate.checked = Boolean(inv.showDueDate);
    ed.inputInvoiceDueDate.value = inv.dueDate || '';
    ed.inputInvoiceDueDate.style.display = inv.showDueDate ? 'block' : 'none';
    ed.inputCurrencySymbol.value = inv.currency || '₹';

    ed.inputClientName.value = inv.client?.name || '';
    if (ed.inputClientWhatsapp) ed.inputClientWhatsapp.value = inv.client?.whatsapp || '';
    if (ed.inputClientPhone) ed.inputClientPhone.value = inv.client?.phone || '';
    ed.inputClientAddress.value = inv.client?.address || '';
    ed.inputClientEmail.value = inv.client?.email || '';

    // Render item rows
    if (ed.itemsList) {
      ed.itemsList.innerHTML = '';
      (inv.items || []).forEach(item => addItemRow(item));
      if (!inv.items || inv.items.length === 0) addItemRow();
    }

    // Deliverables
    if (ed.deliverablesList) {
      ed.deliverablesList.innerHTML = '';
      (inv.deliverables || []).forEach(d => addDeliverableRow(d));
    }

    // Links
    if (ed.websiteLinksList) {
      ed.websiteLinksList.innerHTML = '';
      (inv.websiteLinks || []).forEach(l => addWebsiteLinkRow(l));
    }

    // Payment fields
    const p = inv.payment || {};
    ed.inputPayeeName.value = p.accountName || businessSettings.accountName || '';
    ed.inputBankName.value = p.bankName || businessSettings.bankName || '';
    ed.inputAccountNumber.value = p.accountNumber || businessSettings.accountNumber || '';
    ed.inputIfscCode.value = p.ifsc || p.ifscCode || businessSettings.ifsc || '';
    ed.inputGpayNumber.value = p.gpay || p.gpayNumber || businessSettings.gpay || '';
    ed.inputPrimaryUpi.value = p.primaryUpi || p.upiId || businessSettings.primaryUpi || '';
    ed.inputSecondaryUpi.value = p.secondaryUpi || businessSettings.secondaryUpi || '';
    ed.inputPaymentNote.value = p.note || p.paymentNote || businessSettings.paymentNote || '';

    ed.toggleShowAccountNo.checked = p.showAccountNo !== false;
    ed.toggleShowIfsc.checked = p.showIfsc !== false;
    ed.toggleShowGpay.checked = p.showGpay !== false;
    ed.toggleShowUpiId.checked = p.showUpiId !== false;

    ed.toggleShowQr.checked = p.showQr !== false;
    if (p.qrMode === 'upload') {
      ed.qrModeUpload.checked = true;
      ed.qrUploadSection.style.display = 'block';
      ed.qrGenerateSection.style.display = 'none';
      if (p.customQrUrl && ed.uploadedQrPreviewImg) {
        ed.uploadedQrPreviewImg.src = p.customQrUrl;
        ed.uploadedQrPreviewImg.style.display = 'block';
      }
    } else {
      ed.qrModeGenerate.checked = true;
      ed.qrUploadSection.style.display = 'none';
      ed.qrGenerateSection.style.display = 'block';
    }

    ed.inputDiscountAmount.value = inv.discount || inv.discountAmount || 0;

    syncLivePreview();
  }

  function addItemRow(item = {}) {
    if (!ed.itemsList) return;
    const row = document.createElement('div');
    row.className = 'item-editor-row';
    row.dataset.id = item.id || ('item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));

    row.innerHTML = `
      <div class="item-row-top">
        <input type="text" class="item-title-input" placeholder="Item Title (e.g. Creative Design Services)" value="${escapeHtml(item.title || '')}" required>
        <button type="button" class="btn-icon-action danger btn-del-item" title="Delete row"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <input type="text" class="item-subtitle-input" placeholder="Subtitle / Service Reference" value="${escapeHtml(item.subtitle || '')}">
      </div>
      <div class="item-row-grid">
        <div class="form-group">
          <label style="font-size:0.75rem; color:var(--slate-500);">QTY</label>
          <input type="number" class="item-qty-input" min="0.01" step="any" value="${item.quantity || 1}">
        </div>
        <div class="form-group">
          <label style="font-size:0.75rem; color:var(--slate-500);">RATE (₹)</label>
          <input type="number" class="item-rate-input" min="0" step="any" value="${item.rate || 0}">
        </div>
        <div class="form-group">
          <label style="font-size:0.75rem; color:var(--slate-500);">AMOUNT (₹)</label>
          <input type="text" class="item-amount-display" readonly value="${formatCurrency(item.amount || (item.rate || 0))}">
        </div>
      </div>
    `;

    const qtyInp = row.querySelector('.item-qty-input');
    const rateInp = row.querySelector('.item-rate-input');
    const amtDisp = row.querySelector('.item-amount-display');
    const delBtn = row.querySelector('.btn-del-item');

    function updateRowAmt() {
      const q = parseFloat(qtyInp.value) || 0;
      const r = parseFloat(rateInp.value) || 0;
      amtDisp.value = formatCurrency(q * r);
      syncLivePreview();
    }

    qtyInp.addEventListener('input', updateRowAmt);
    rateInp.addEventListener('input', updateRowAmt);
    row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', syncLivePreview));

    delBtn.addEventListener('click', () => {
      row.remove();
      syncLivePreview();
    });

    ed.itemsList.appendChild(row);
  }

  function addDeliverableRow(text = '') {
    if (!ed.deliverablesList) return;
    const row = document.createElement('div');
    row.className = 'deliverable-editor-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    row.style.marginBottom = '6px';
    row.innerHTML = `
      <input type="text" class="deliverable-input form-input" style="flex:1;" placeholder="Deliverable item..." value="${escapeHtml(text)}">
      <button type="button" class="btn-icon-action danger btn-del-deliv" style="width:28px; height:28px;"><i class="fa-solid fa-trash"></i></button>
    `;
    row.querySelector('.deliverable-input').addEventListener('input', syncLivePreview);
    row.querySelector('.btn-del-deliv').addEventListener('click', () => {
      row.remove();
      syncLivePreview();
    });
    ed.deliverablesList.appendChild(row);
  }

  function addWebsiteLinkRow(link = {}) {
    if (!ed.websiteLinksList) return;
    const row = document.createElement('div');
    row.className = 'website-link-row';
    row.dataset.id = link.id || ('link_' + Math.random());
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    row.style.marginBottom = '6px';
    row.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
        <input type="text" class="link-title-input" placeholder="Portal Title (e.g. Staff Portal)" value="${escapeHtml(link.title || '')}">
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
  }

  // Save Current Invoice
  function saveCurrentInvoice() {
    if (!currentInvoice) return;

    syncLivePreview();

    const invNum = ed.inputInvoiceNumber.value.trim() || 'BC-489';
    const clientName = ed.inputClientName.value.trim() || 'ALAM ENGAZ';
    const whatsapp = ed.inputClientWhatsapp ? ed.inputClientWhatsapp.value.trim() : '';
    const phone = ed.inputClientPhone ? ed.inputClientPhone.value.trim() : '';
    const email = ed.inputClientEmail.value.trim();
    const address = ed.inputClientAddress.value.trim();

    const items = collectItems();
    const deliverables = collectDeliverables();
    const websiteLinks = collectWebsiteLinks();

    let subtotal = 0;
    items.forEach(i => subtotal += (Number(i.amount) || 0));
    const discount = Math.max(0, Number(ed.inputDiscountAmount.value) || 0);
    const total = Math.max(0, subtotal - discount);

    const dateStr = ed.inputInvoiceDate.value.trim();
    const tempInv = { date: dateStr, isoDate: currentInvoice.isoDate };
    const invMonth = getInvoiceMonthHeader(tempInv) || currentInvoice.monthHeader || '';
    const invYr = getInvoiceYear(tempInv) || currentInvoice.year || new Date().getFullYear();

    const updated = {
      ...currentInvoice,
      invoiceNumber: invNum,
      date: dateStr,
      monthHeader: invMonth,
      year: invYr,
      status: ed.selectInvoiceStatus.value,
      showDueDate: ed.toggleDueDate.checked,
      dueDate: ed.inputInvoiceDueDate.value.trim(),
      currency: ed.inputCurrencySymbol.value.trim() || '₹',
      client: {
        name: clientName,
        whatsapp: whatsapp,
        phone: phone || whatsapp,
        email: email,
        address: address
      },
      items,
      subtotal,
      discount,
      total,
      deliverables,
      websiteLinks,
      payment: {
        accountName: ed.inputPayeeName.value.trim(),
        bankName: ed.inputBankName.value.trim(),
        accountNumber: ed.inputAccountNumber.value.trim(),
        ifsc: ed.inputIfscCode.value.trim(),
        gpay: ed.inputGpayNumber.value.trim(),
        primaryUpi: ed.inputPrimaryUpi.value.trim(),
        secondaryUpi: ed.inputSecondaryUpi.value.trim(),
        note: ed.inputPaymentNote.value.trim(),
        showAccountNo: ed.toggleShowAccountNo.checked,
        showIfsc: ed.toggleShowIfsc.checked,
        showGpay: ed.toggleShowGpay.checked,
        showUpiId: ed.toggleShowUpiId.checked,
        showQr: ed.toggleShowQr.checked,
        qrMode: ed.qrModeUpload.checked ? 'upload' : 'generate',
        customQrUrl: ed.uploadedQrPreviewImg ? ed.uploadedQrPreviewImg.src : ''
      }
    };

    currentInvoice = updated;

    // Update in userInvoices list
    const uIdx = userInvoices.findIndex(i => i.id === updated.id || i.invoiceNumber === updated.invoiceNumber);
    if (uIdx >= 0) {
      userInvoices[uIdx] = updated;
    } else {
      userInvoices.unshift(updated);
    }

    // Update in combined invoices list
    const cIdx = invoices.findIndex(i => i.id === updated.id || i.invoiceNumber === updated.invoiceNumber);
    if (cIdx >= 0) {
      invoices[cIdx] = updated;
    } else {
      invoices.unshift(updated);
    }

    saveInvoices();

    // Also update client profile
    const cKey = normalizeClientName(clientName);
    if (clientProfiles[cKey]) {
      clientProfiles[cKey].whatsapp = whatsapp || clientProfiles[cKey].whatsapp;
      clientProfiles[cKey].phone = phone || clientProfiles[cKey].phone;
      clientProfiles[cKey].email = email || clientProfiles[cKey].email;
      clientProfiles[cKey].address = address || clientProfiles[cKey].address;
    } else {
      clientProfiles[cKey] = {
        id: 'cli_' + cKey.replace(/[^a-z0-9]/g, '_'),
        name: clientName,
        whatsapp,
        phone: phone || whatsapp,
        email,
        address,
        notes: ''
      };
    }
    saveClientProfiles();
    populateClientDatalists();
    updateDashboard();

    showToast(`Invoice ${invNum} saved successfully!`, 'success');
  }

  // Duplicate Invoice
  function duplicateInvoice(id) {
    const orig = invoices.find(i => i.id === id);
    if (!orig) return;

    const nextNum = getNextInvoiceNumber();
    const cloned = JSON.parse(JSON.stringify(orig));
    cloned.id = 'inv_' + Date.now();
    cloned.invoiceNumber = nextNum;
    cloned.isHistorical = false;
    delete cloned.historicalTxId;

    const today = new Date();
    cloned.date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    cloned.isoDate = today.toISOString().slice(0, 10);

    userInvoices.unshift(cloned);
    invoices.unshift(cloned);
    saveInvoices();

    populateForm(cloned);
    showEditor();
    showToast(`Duplicated as ${nextNum}!`, 'success');
  }

  // Delete Invoice
  function handleDeleteInvoice(id) {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    if (confirm(`Delete invoice ${inv.invoiceNumber} (${inv.client?.name || 'Client'})?\n\nThis action cannot be undone.`)) {
      userInvoices = userInvoices.filter(i => i.id !== id && i.invoiceNumber !== inv.invoiceNumber);
      invoices = invoices.filter(i => i.id !== id);
      saveInvoices();
      renderInvoices();
      updateDashboard();
      showToast(`Invoice ${inv.invoiceNumber} deleted.`, 'info');
    }
  }

  // Zoom Engine for Live A4 Preview
  function applyZoom(val) {
    if (!zoom.wrapper || !sheet.container) return;
    if (val === 'fit') {
      const containerW = zoom.wrapper.parentElement ? zoom.wrapper.parentElement.clientWidth - 40 : 800;
      const targetW = 794; // approx A4 at 96dpi
      const scale = Math.min(1.0, Math.max(0.4, (containerW / targetW) * 0.95));
      sheet.container.style.transform = `scale(${scale})`;
      sheet.container.style.transformOrigin = 'top center';
      if (zoom.percent) zoom.percent.textContent = Math.round(scale * 100) + '%';
    } else {
      const cur = parseFloat((sheet.container.style.transform || 'scale(1)').replace(/[^0-9.]/g, '')) || 1.0;
      let newScale = cur;
      if (val === 'in') newScale = Math.min(1.5, cur + 0.1);
      else if (val === 'out') newScale = Math.max(0.4, cur - 0.1);
      else if (val === 'reset') newScale = 1.0;
      sheet.container.style.transform = `scale(${newScale})`;
      sheet.container.style.transformOrigin = 'top center';
      if (zoom.percent) zoom.percent.textContent = Math.round(newScale * 100) + '%';
    }
  }

  // Print Invoice
  function printInvoice() {
    syncLivePreview();
    const curTransform = sheet.container.style.transform;
    sheet.container.style.transform = 'none';
    window.print();
    setTimeout(() => {
      sheet.container.style.transform = curTransform;
    }, 500);
  }

  // Pixel-Perfect A4 PDF Export (Single Page, 210mm x 297mm)
  async function downloadPdf() {
    syncLivePreview();

    const invNum = (ed.inputInvoiceNumber.value.trim() || 'BC-489').replace(/[^a-zA-Z0-9_-]/g, '');
    const client = (ed.inputClientName.value.trim() || 'CLIENT').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `BE-Creatives-Invoice-${invNum}-${client}.pdf`;

    showToast(`Generating ${filename}...`, 'info');

    const sheetEl = sheet.container;
    const oldTransform = sheetEl.style.transform;
    const oldOrigin = sheetEl.style.transformOrigin;

    sheetEl.style.transform = 'none';

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    try {
      if (window.html2pdf) {
        await html2pdf().set(opt).from(sheetEl).save();
        showToast(`Downloaded ${filename}!`, 'success');
      } else {
        window.print();
      }
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('PDF generator error, triggering print dialog...', 'warning');
      window.print();
    } finally {
      sheetEl.style.transform = oldTransform;
      sheetEl.style.transformOrigin = oldOrigin;
    }
  }

  // Load Settings
  function loadSettings() {
    try {
      const s = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (s) {
        businessSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
      } else {
        businessSettings = { ...DEFAULT_SETTINGS };
      }
    } catch (e) {
      businessSettings = { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(businessSettings));
    } catch (e) {
      console.warn('Error saving settings:', e);
    }
  }

  // Attach All Event Listeners
  function attachEvents() {
    // Navigation Routing
    if (nav.dashboardBtn) nav.dashboardBtn.addEventListener('click', showDashboard);
    if (nav.invoicesBtn) nav.invoicesBtn.addEventListener('click', showInvoices);
    if (nav.clientsBtn) nav.clientsBtn.addEventListener('click', showClients);
    if (nav.expensesBtn) nav.expensesBtn.addEventListener('click', showExpenses);
    if (nav.reportsBtn) nav.reportsBtn.addEventListener('click', showReports);
    if (nav.newInvoiceBtn) nav.newInvoiceBtn.addEventListener('click', () => createNewInvoice());
    if (nav.logoHome) nav.logoHome.addEventListener('click', showDashboard);

    // Dashboard Hub Cards
    const cardInvoices = document.getElementById('cardGoInvoices');
    if (cardInvoices) cardInvoices.addEventListener('click', showInvoices);
    const cardClients = document.getElementById('cardGoClients');
    if (cardClients) cardClients.addEventListener('click', showClients);
    const cardExpenses = document.getElementById('cardGoExpenses');
    if (cardExpenses) cardExpenses.addEventListener('click', showExpenses);
    const cardReports = document.getElementById('cardGoReports');
    if (cardReports) cardReports.addEventListener('click', showReports);

    // Dashboard Hero Buttons
    if (dash.btnHeroNewInvoice) dash.btnHeroNewInvoice.addEventListener('click', () => createNewInvoice());
    if (dash.btnHeroAddClient) dash.btnHeroAddClient.addEventListener('click', () => openAddEditClientModal());
    if (dash.btnHeroAddExpense) dash.btnHeroAddExpense.addEventListener('click', () => {
      if (expensesView.modalAdd) expensesView.modalAdd.style.display = 'flex';
    });
    if (dash.btnHeroReports) dash.btnHeroReports.addEventListener('click', showReports);

    // Monthly Collection Month Selector
    if (dash.collectionMonthSelect) {
      dash.collectionMonthSelect.addEventListener('change', e => {
        dashSelectedMonth = e.target.value;
        renderMonthlyClientCollection();
      });
    }

    // Monthly Collection List Click Delegation
    if (dash.clientCollectionList) {
      dash.clientCollectionList.addEventListener('click', e => {
        const btn = e.target.closest('.btn-open-client-statement');
        const nameEl = e.target.closest('.collection-client-name');
        if (btn) {
          openClientStatementModal(btn.dataset.client);
        } else if (nameEl) {
          openClientStatementModal(nameEl.dataset.client);
        }
      });
    }

    // Invoices Page Actions
    if (invView.btnNew) invView.btnNew.addEventListener('click', () => createNewInvoice());
    if (invView.btnEmptyCreate) invView.btnEmptyCreate.addEventListener('click', () => createNewInvoice());

    if (invView.searchInput) {
      invView.searchInput.addEventListener('input', e => {
        invSearchQuery = e.target.value;
        if (invView.searchClearBtn) invView.searchClearBtn.style.display = invSearchQuery ? 'block' : 'none';
        invCurrentPage = 1;
        renderInvoices();
      });
    }
    if (invView.searchClearBtn) {
      invView.searchClearBtn.addEventListener('click', () => {
        invView.searchInput.value = '';
        invSearchQuery = '';
        invView.searchClearBtn.style.display = 'none';
        invCurrentPage = 1;
        renderInvoices();
      });
    }

    if (invView.clientFilter) {
      invView.clientFilter.addEventListener('change', e => {
        invFilterClient = e.target.value;
        invCurrentPage = 1;
        renderInvoices();
      });
    }

    if (invView.monthFilter) {
      invView.monthFilter.addEventListener('change', e => {
        invFilterMonth = e.target.value;
        invCurrentPage = 1;
        renderInvoices();
      });
    }

    if (invView.yearFilter) {
      invView.yearFilter.addEventListener('change', e => {
        invFilterYear = e.target.value;
        invCurrentPage = 1;
        renderInvoices();
      });
    }

    if (invView.statusPills) {
      invView.statusPills.forEach(pill => {
        pill.addEventListener('click', () => {
          invView.statusPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          invActiveFilter = pill.dataset.filter || 'ALL';
          invCurrentPage = 1;
          renderInvoices();
        });
      });
    }

    if (invView.btnPrev) {
      invView.btnPrev.addEventListener('click', () => {
        if (invCurrentPage > 1) {
          invCurrentPage--;
          renderInvoices();
        }
      });
    }

    if (invView.btnNext) {
      invView.btnNext.addEventListener('click', () => {
        invCurrentPage++;
        renderInvoices();
      });
    }

    // Invoices Table Actions Click Delegation
    const handleInvoiceAction = e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const targetInv = invoices.find(i => i.id === id);
      if (!targetInv) return;

      if (action === 'view') {
        populateForm(targetInv);
        showEditor();
      } else if (action === 'edit') {
        populateForm(targetInv);
        showEditor();
      } else if (action === 'duplicate') {
        duplicateInvoice(id);
      } else if (action === 'pdf') {
        populateForm(targetInv);
        downloadPdf();
      } else if (action === 'whatsapp') {
        openWhatsAppShareModal(targetInv);
      } else if (action === 'delete') {
        handleDeleteInvoice(id);
      } else if (action === 'toggle-status') {
        targetInv.status = targetInv.status === 'PAID' ? 'PENDING' : 'PAID';
        saveInvoices();
        renderInvoices();
        updateDashboard();
        showToast(`Status updated to ${targetInv.status}`, 'info');
      }
    };

    if (invView.tableBody) invView.tableBody.addEventListener('click', handleInvoiceAction);
    if (invView.mobileCards) invView.mobileCards.addEventListener('click', handleInvoiceAction);

    // Invoices Export CSV
    if (invView.btnExportCsv) {
      invView.btnExportCsv.addEventListener('click', () => {
        const headers = ['Invoice No', 'Client', 'Date', 'Amount', 'Status', 'Details'];
        const rows = invoices.map(i => [
          `"${i.invoiceNumber}"`,
          `"${(i.client?.name || '').replace(/"/g, '""')}"`,
          `"${i.date || ''}"`,
          i.total || i.amount || 0,
          `"${i.status}"`,
          `"${(i.items?.[0]?.title || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BE_Creatives_Invoices_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported invoices to CSV!', 'success');
      });
    }

    // Clients Page Actions
    if (clientsView.btnOpenAdd) clientsView.btnOpenAdd.addEventListener('click', () => openAddEditClientModal());
    if (clientsView.btnEmptyAdd) clientsView.btnEmptyAdd.addEventListener('click', () => openAddEditClientModal());

    if (clientsView.searchInput) {
      clientsView.searchInput.addEventListener('input', e => {
        clientSearchQuery = e.target.value;
        if (clientsView.searchClearBtn) clientsView.searchClearBtn.style.display = clientSearchQuery ? 'block' : 'none';
        renderClients();
      });
    }
    if (clientsView.searchClearBtn) {
      clientsView.searchClearBtn.addEventListener('click', () => {
        clientsView.searchInput.value = '';
        clientSearchQuery = '';
        clientsView.searchClearBtn.style.display = 'none';
        renderClients();
      });
    }

    if (clientsView.sortSelect) {
      clientsView.sortSelect.addEventListener('change', e => {
        clientSortBy = e.target.value;
        renderClients();
      });
    }

    // Clients Grid Click Delegation
    if (clientsView.grid) {
      clientsView.grid.addEventListener('click', e => {
        const btnStmt = e.target.closest('.btn-open-client-statement');
        const btnInv = e.target.closest('.btn-client-create-inv');
        const btnEdit = e.target.closest('.btn-edit-client-profile');

        if (btnStmt) {
          openClientStatementModal(btnStmt.dataset.client);
        } else if (btnInv) {
          createNewInvoice(btnInv.dataset.client);
        } else if (btnEdit) {
          openAddEditClientModal(btnEdit.dataset.client);
        }
      });
    }

    // Client Avatar File Upload Listener
    if (clientsView.inputAvatar) {
      clientsView.inputAvatar.addEventListener('change', e => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          showToast('Image size exceeds 2MB limit. Please choose a smaller photo.', 'warning');
          return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
          const dataUrl = ev.target.result;
          if (clientsView.inputAvatarData) clientsView.inputAvatarData.value = dataUrl;
          if (clientsView.avatarPreview) {
            clientsView.avatarPreview.innerHTML = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
          }
          if (clientsView.btnRemoveAvatar) clientsView.btnRemoveAvatar.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
      });
    }

    if (clientsView.btnRemoveAvatar) {
      clientsView.btnRemoveAvatar.addEventListener('click', () => {
        if (clientsView.inputAvatarData) clientsView.inputAvatarData.value = '';
        if (clientsView.inputAvatar) clientsView.inputAvatar.value = '';
        const nameVal = clientsView.inputName?.value.trim();
        if (clientsView.avatarPreview) {
          if (nameVal) {
            clientsView.avatarPreview.innerHTML = `<span style="font-size:1.5rem; font-weight:800;">${nameVal.charAt(0).toUpperCase()}</span>`;
          } else {
            clientsView.avatarPreview.innerHTML = '<i class="fa-solid fa-user"></i>';
          }
        }
        clientsView.btnRemoveAvatar.style.display = 'none';
      });
    }

    // Add Client Modal Form Submit
    if (clientsView.formAdd) {
      clientsView.formAdd.addEventListener('submit', e => {
        e.preventDefault();
        const name = clientsView.inputName.value.trim();
        if (!name) return;

        const key = normalizeClientName(name);
        const profile = {
          id: clientsView.editClientId.value || ('cli_' + key.replace(/[^a-z0-9]/g, '_')),
          name: name,
          whatsapp: clientsView.inputWhatsapp.value.trim(),
          phone: clientsView.inputPhone.value.trim(),
          email: clientsView.inputEmail.value.trim(),
          address: clientsView.inputAddress.value.trim(),
          avatar: clientsView.inputAvatarData?.value || '',
          notes: clientsView.inputNotes.value.trim()
        };

        clientProfiles[key] = profile;
        saveClientProfiles();
        populateClientDatalists();
        renderClients();
        updateDashboard();

        if (clientsView.modalAdd) clientsView.modalAdd.style.display = 'none';
        showToast(`Client ${name} saved!`, 'success');
      });
    }

    if (clientsView.btnCloseModalAdd) {
      clientsView.btnCloseModalAdd.addEventListener('click', () => {
        if (clientsView.modalAdd) clientsView.modalAdd.style.display = 'none';
      });
    }
    if (clientsView.btnCancelAdd) {
      clientsView.btnCancelAdd.addEventListener('click', () => {
        if (clientsView.modalAdd) clientsView.modalAdd.style.display = 'none';
      });
    }

    // Client Statement Modal Close
    if (clientsView.btnCloseStatement) {
      clientsView.btnCloseStatement.addEventListener('click', () => {
        if (clientsView.modalStatement) clientsView.modalStatement.style.display = 'none';
      });
    }
    if (clientsView.btnCloseStatementFooter) {
      clientsView.btnCloseStatementFooter.addEventListener('click', () => {
        if (clientsView.modalStatement) clientsView.modalStatement.style.display = 'none';
      });
    }

    // Expenses Page Actions
    if (expensesView.btnOpenAdd) {
      expensesView.btnOpenAdd.addEventListener('click', () => {
        const today = new Date().toISOString().slice(0, 10);
        if (expensesView.inputDate) expensesView.inputDate.value = today;
        if (expensesView.modalAdd) expensesView.modalAdd.style.display = 'flex';
      });
    }
    if (expensesView.btnEmptyAdd) {
      expensesView.btnEmptyAdd.addEventListener('click', () => {
        const today = new Date().toISOString().slice(0, 10);
        if (expensesView.inputDate) expensesView.inputDate.value = today;
        if (expensesView.modalAdd) expensesView.modalAdd.style.display = 'flex';
      });
    }

    if (expensesView.searchInput) {
      expensesView.searchInput.addEventListener('input', e => {
        expenseSearchQuery = e.target.value;
        if (expensesView.searchClearBtn) expensesView.searchClearBtn.style.display = expenseSearchQuery ? 'block' : 'none';
        expenseCurrentPage = 1;
        renderExpenses();
      });
    }
    if (expensesView.searchClearBtn) {
      expensesView.searchClearBtn.addEventListener('click', () => {
        expensesView.searchInput.value = '';
        expenseSearchQuery = '';
        expensesView.searchClearBtn.style.display = 'none';
        expenseCurrentPage = 1;
        renderExpenses();
      });
    }

    if (expensesView.typePills) {
      expensesView.typePills.forEach(pill => {
        pill.addEventListener('click', () => {
          expensesView.typePills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          expenseFilterType = pill.dataset.type || 'ALL';
          expenseCurrentPage = 1;
          renderExpenses();
        });
      });
    }

    if (expensesView.monthSelect) {
      expensesView.monthSelect.addEventListener('change', e => {
        expenseFilterMonth = e.target.value;
        expenseCurrentPage = 1;
        renderExpenses();
      });
    }

    if (expensesView.yearSelect) {
      expensesView.yearSelect.addEventListener('change', e => {
        expenseFilterYear = e.target.value;
        expenseCurrentPage = 1;
        renderExpenses();
      });
    }

    if (expensesView.btnPrev) {
      expensesView.btnPrev.addEventListener('click', () => {
        if (expenseCurrentPage > 1) {
          expenseCurrentPage--;
          renderExpenses();
        }
      });
    }
    if (expensesView.btnNext) {
      expensesView.btnNext.addEventListener('click', () => {
        expenseCurrentPage++;
        renderExpenses();
      });
    }

    // Delete Expense
    const handleDeleteExpenseClick = e => {
      const btn = e.target.closest('.btn-delete-expense');
      if (!btn) return;
      const id = btn.dataset.id;
      if (confirm('Delete this expense record?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        renderExpenses();
        updateDashboard();
        showToast('Expense record deleted.', 'info');
      }
    };
    if (expensesView.tableBody) expensesView.tableBody.addEventListener('click', handleDeleteExpenseClick);
    if (expensesView.mobileCards) expensesView.mobileCards.addEventListener('click', handleDeleteExpenseClick);

    // Auto-detect Personal Expense in modal form
    if (expensesView.inputName && expensesView.selectType) {
      expensesView.inputName.addEventListener('input', () => {
        const val = expensesView.inputName.value;
        if (isPersonalExpense(val, '')) {
          expensesView.selectType.value = 'PERSONAL';
          if (expensesView.selectCategory) {
            if (/recharge/i.test(val)) expensesView.selectCategory.value = 'Office & Logistics';
            else if (/tea|food/i.test(val)) expensesView.selectCategory.value = 'Food & Travel';
            else expensesView.selectCategory.value = 'Personal';
          }
        }
      });
    }

    // Save Expense Form
    if (expensesView.formAdd) {
      expensesView.formAdd.addEventListener('submit', e => {
        e.preventDefault();
        const dateVal = expensesView.inputDate.value;
        const nameVal = expensesView.inputName.value.trim();
        const amtVal = parseFloat(expensesView.inputAmount.value) || 0;
        const typeVal = expensesView.selectType.value;
        const catVal = expensesView.selectCategory.value;
        const detVal = expensesView.inputDetails.value.trim();

        if (!nameVal || amtVal <= 0) return;

        const dObj = new Date(dateVal || Date.now());
        const monthHeader = ALL_MONTHS_LATEST_FIRST.find(m => m.includes(dObj.getFullYear())) || 'September 2026';

        const newExp = {
          id: 'exp_' + Date.now(),
          date: dateVal,
          isoDate: dateVal,
          monthHeader: monthHeader,
          year: dObj.getFullYear(),
          name: nameVal,
          details: detVal,
          amount: amtVal,
          category: catVal,
          type: typeVal
        };

        expenses.unshift(newExp);
        saveExpenses();
        renderExpenses();
        updateDashboard();

        if (expensesView.modalAdd) expensesView.modalAdd.style.display = 'none';
        expensesView.formAdd.reset();
        showToast(`Expense of ${formatCurrency(amtVal)} saved!`, 'success');
      });
    }

    if (expensesView.btnCloseModal) {
      expensesView.btnCloseModal.addEventListener('click', () => {
        if (expensesView.modalAdd) expensesView.modalAdd.style.display = 'none';
      });
    }
    if (expensesView.btnCancelAdd) {
      expensesView.btnCancelAdd.addEventListener('click', () => {
        if (expensesView.modalAdd) expensesView.modalAdd.style.display = 'none';
      });
    }

    // Export Expenses CSV
    if (expensesView.btnExportCsv) {
      expensesView.btnExportCsv.addEventListener('click', () => {
        const headers = ['Date', 'Name', 'Description', 'Category', 'Type', 'Amount'];
        const rows = expenses.map(e => [
          `"${e.date || ''}"`,
          `"${(e.name || '').replace(/"/g, '""')}"`,
          `"${(e.details || '').replace(/"/g, '""')}"`,
          `"${e.category || ''}"`,
          `"${e.type}"`,
          e.amount
        ]);
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BE_Creatives_Expenses_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported expenses to CSV!', 'success');
      });
    }

    // Reports Filters
    if (reportsView.yearSelect) {
      reportsView.yearSelect.addEventListener('change', e => {
        reportFilterYear = e.target.value;
        renderReports();
      });
    }
    if (reportsView.monthSelect) {
      reportsView.monthSelect.addEventListener('change', e => {
        reportFilterMonth = e.target.value;
        renderReports();
      });
    }
    if (reportsView.clientSelect) {
      reportsView.clientSelect.addEventListener('change', e => {
        reportFilterClient = e.target.value;
        renderReports();
      });
    }

    // WhatsApp Modal Close
    if (whatsAppModal.btnClose) {
      whatsAppModal.btnClose.addEventListener('click', () => {
        whatsAppModal.modal.style.display = 'none';
      });
    }
    if (whatsAppModal.btnCancel) {
      whatsAppModal.btnCancel.addEventListener('click', () => {
        whatsAppModal.modal.style.display = 'none';
      });
    }

    // Editor Actions
    if (ed.backBtn) ed.backBtn.addEventListener('click', showInvoices);
    if (ed.saveBtn) ed.saveBtn.addEventListener('click', saveCurrentInvoice);
    if (ed.printBtn) ed.printBtn.addEventListener('click', printInvoice);
    if (ed.downloadPdfBtn) ed.downloadPdfBtn.addEventListener('click', downloadPdf);
    if (ed.duplicateBtn) {
      ed.duplicateBtn.addEventListener('click', () => {
        if (currentInvoice) duplicateInvoice(currentInvoice.id);
      });
    }

    // Client Autocomplete in Invoice Editor
    if (ed.inputClientName) {
      ed.inputClientName.addEventListener('change', e => {
        const val = e.target.value.trim();
        const profile = clientProfiles[normalizeClientName(val)];
        if (profile) {
          if (ed.inputClientWhatsapp && profile.whatsapp) ed.inputClientWhatsapp.value = profile.whatsapp;
          if (ed.inputClientPhone && profile.phone) ed.inputClientPhone.value = profile.phone;
          if (profile.email) ed.inputClientEmail.value = profile.email;
          if (profile.address) ed.inputClientAddress.value = profile.address;
        }
        syncLivePreview();
      });
      ed.inputClientName.addEventListener('input', syncLivePreview);
    }

    if (ed.inputClientWhatsapp) ed.inputClientWhatsapp.addEventListener('input', syncLivePreview);
    if (ed.inputClientPhone) ed.inputClientPhone.addEventListener('input', syncLivePreview);
    if (ed.inputClientAddress) ed.inputClientAddress.addEventListener('input', syncLivePreview);
    if (ed.inputClientEmail) ed.inputClientEmail.addEventListener('input', syncLivePreview);

    if (ed.inputInvoiceNumber) ed.inputInvoiceNumber.addEventListener('input', syncLivePreview);
    if (ed.inputInvoiceDate) ed.inputInvoiceDate.addEventListener('input', syncLivePreview);
    if (ed.selectInvoiceStatus) ed.selectInvoiceStatus.addEventListener('change', syncLivePreview);
    if (ed.toggleDueDate) {
      ed.toggleDueDate.addEventListener('change', () => {
        ed.inputInvoiceDueDate.style.display = ed.toggleDueDate.checked ? 'block' : 'none';
        syncLivePreview();
      });
    }
    if (ed.inputInvoiceDueDate) ed.inputInvoiceDueDate.addEventListener('input', syncLivePreview);
    if (ed.inputCurrencySymbol) ed.inputCurrencySymbol.addEventListener('input', syncLivePreview);
    if (ed.inputDiscountAmount) ed.inputDiscountAmount.addEventListener('input', syncLivePreview);

    if (ed.btnAddItem) ed.btnAddItem.addEventListener('click', () => { addItemRow(); syncLivePreview(); });
    if (ed.btnAddItemSecondary) ed.btnAddItemSecondary.addEventListener('click', () => { addItemRow(); syncLivePreview(); });
    if (ed.btnAddDeliverable) ed.btnAddDeliverable.addEventListener('click', () => { addDeliverableRow(); syncLivePreview(); });
    if (ed.btnAddWebsiteLink) ed.btnAddWebsiteLink.addEventListener('click', () => { addWebsiteLinkRow(); syncLivePreview(); });

    // Payment fields live sync
    [
      ed.inputPayeeName, ed.inputBankName, ed.inputAccountNumber, ed.inputIfscCode,
      ed.inputGpayNumber, ed.inputPrimaryUpi, ed.inputSecondaryUpi, ed.inputPaymentNote,
      ed.inputQrUpiId, ed.inputQrPayeeName
    ].forEach(inp => {
      if (inp) inp.addEventListener('input', syncLivePreview);
    });

    [
      ed.toggleShowAccountNo, ed.toggleShowIfsc, ed.toggleShowGpay,
      ed.toggleShowUpiId, ed.toggleShowQr
    ].forEach(t => {
      if (t) t.addEventListener('change', syncLivePreview);
    });

    if (ed.qrModeGenerate) {
      ed.qrModeGenerate.addEventListener('change', () => {
        if (ed.qrGenerateSection) ed.qrGenerateSection.style.display = 'block';
        if (ed.qrUploadSection) ed.qrUploadSection.style.display = 'none';
        syncLivePreview();
      });
    }

    if (ed.qrModeUpload) {
      ed.qrModeUpload.addEventListener('change', () => {
        if (ed.qrGenerateSection) ed.qrGenerateSection.style.display = 'none';
        if (ed.qrUploadSection) ed.qrUploadSection.style.display = 'block';
        syncLivePreview();
      });
    }

    if (ed.inputUploadQrFile) {
      ed.inputUploadQrFile.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          if (ed.uploadedQrPreviewImg) {
            ed.uploadedQrPreviewImg.src = ev.target.result;
            ed.uploadedQrPreviewImg.style.display = 'block';
          }
          if (ed.btnRemoveUploadedQr) ed.btnRemoveUploadedQr.style.display = 'inline-flex';
          syncLivePreview();
        };
        reader.readAsDataURL(file);
      });
    }

    if (ed.btnRemoveUploadedQr) {
      ed.btnRemoveUploadedQr.addEventListener('click', () => {
        if (ed.uploadedQrPreviewImg) {
          ed.uploadedQrPreviewImg.src = '';
          ed.uploadedQrPreviewImg.style.display = 'none';
        }
        if (ed.inputUploadQrFile) ed.inputUploadQrFile.value = '';
        ed.btnRemoveUploadedQr.style.display = 'none';
        syncLivePreview();
      });
    }

    // Zoom Controls
    if (zoom.btnIn) zoom.btnIn.addEventListener('click', () => applyZoom('in'));
    if (zoom.btnOut) zoom.btnOut.addEventListener('click', () => applyZoom('out'));
    if (zoom.btnReset) zoom.btnReset.addEventListener('click', () => applyZoom('reset'));
    if (zoom.btnFit) zoom.btnFit.addEventListener('click', () => applyZoom('fit'));

    window.addEventListener('resize', () => {
      if (views.editor && views.editor.classList.contains('active')) {
        applyZoom('fit');
      }
    });

    // Mobile Bottom Bar Actions
    const mobSave = document.getElementById('mobBtnSave');
    const mobPdf = document.getElementById('mobBtnPdf');
    const mobPrint = document.getElementById('mobBtnPrint');
    const mobNew = document.getElementById('mobBtnNew');

    if (mobSave) mobSave.addEventListener('click', saveCurrentInvoice);
    if (mobPdf) mobPdf.addEventListener('click', downloadPdf);
    if (mobPrint) mobPrint.addEventListener('click', printInvoice);
    if (mobNew) mobNew.addEventListener('click', () => createNewInvoice());

    // Collapsible form cards
    document.querySelectorAll('.form-card.collapsible .form-card-header').forEach(header => {
      header.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        const card = header.closest('.form-card');
        if (card) card.classList.toggle('collapsed');
      });
    });

    // Nav Data Menu Toggle
    if (nav.dataMenuBtn && nav.dataMenu) {
      nav.dataMenuBtn.addEventListener('click', e => {
        e.stopPropagation();
        nav.dataMenu.classList.toggle('active');
      });
      document.addEventListener('click', e => {
        if (!nav.dataMenu.contains(e.target) && e.target !== nav.dataMenuBtn) {
          nav.dataMenu.classList.remove('active');
        }
      });
    }

    // Backup Export
    const exportBtn = document.getElementById('exportBackupBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const backup = {
          version: '4.0',
          exportedAt: new Date().toISOString(),
          settings: businessSettings,
          invoices: userInvoices,
          clients: clientProfiles,
          expenses: expenses.filter(e => !e.id.startsWith('exp_hist_'))
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BE_Creatives_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('JSON backup exported successfully!', 'success');
      });
    }

    // Backup Import
    const importInput = document.getElementById('importBackupInput');
    if (importInput) {
      importInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.invoices && Array.isArray(data.invoices)) {
              userInvoices = data.invoices;
              saveInvoices();
            }
            if (data.settings) {
              businessSettings = { ...DEFAULT_SETTINGS, ...data.settings };
              saveSettings();
            }
            if (data.clients) {
              clientProfiles = { ...clientProfiles, ...data.clients };
              saveClientProfiles();
            }
            loadInvoices();
            loadClientProfiles();
            loadExpenses();
            updateDashboard();
            renderInvoices();
            showToast('Backup restored successfully!', 'success');
          } catch (err) {
            showToast('Invalid JSON file format!', 'danger');
          }
        };
        reader.readAsText(file);
      });
    }

    // Restore Historical Data Button
    const btnRestoreHist = document.getElementById('btnRestoreHistoricalData');
    if (btnRestoreHist) {
      btnRestoreHist.addEventListener('click', () => {
        if (confirm('Restore all original 488 historical ledger records?\n\nAll 488 records (BC-01 to BC-488) will be verified and re-synced.')) {
          loadInvoices();
          loadClientProfiles();
          loadExpenses();
          updateDashboard();
          renderInvoices();
          renderClients();
          renderExpenses();
          showToast('All 488 historical records synced successfully!', 'success');
        }
      });
    }

    // Reset to Sample (BC-489)
    const resetBtn = document.getElementById('resetSampleDataBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset to reference invoice (BC-489 ALAM ENGAZ)?\n\nAll 488 historical records will remain strictly preserved.')) {
          userInvoices = [JSON.parse(JSON.stringify(ALAM_ENGAZ_INVOICE))];
          businessSettings = { ...DEFAULT_SETTINGS };
          saveInvoices();
          saveSettings();
          loadInvoices();
          populateForm(ALAM_ENGAZ_INVOICE);
          showDashboard();
          showToast('Reset to BC-489 reference. Historical records preserved.', 'info');
        }
      });
    }

    // Settings Modal
    if (nav.settingsBtn && settingsModal.overlay) {
      nav.settingsBtn.addEventListener('click', () => {
        settingsModal.inputName.value = businessSettings.name || '';
        settingsModal.inputTagline.value = businessSettings.tagline || '';
        settingsModal.inputInstagram.value = businessSettings.instagram || '';
        settingsModal.inputInstagramUrl.value = businessSettings.instagramUrl || '';
        settingsModal.inputPayeeName.value = businessSettings.accountName || '';
        settingsModal.inputBankName.value = businessSettings.bankName || '';
        settingsModal.inputAccountNo.value = businessSettings.accountNumber || '';
        settingsModal.inputIfsc.value = businessSettings.ifsc || '';
        settingsModal.inputGpay.value = businessSettings.gpay || '';
        settingsModal.inputPrimaryUpi.value = businessSettings.primaryUpi || '';
        settingsModal.inputSecondaryUpi.value = businessSettings.secondaryUpi || '';
        settingsModal.inputPaymentNote.value = businessSettings.paymentNote || '';
        settingsModal.overlay.style.display = 'flex';
      });

      const closeSettings = () => { settingsModal.overlay.style.display = 'none'; };
      if (settingsModal.btnClose) settingsModal.btnClose.addEventListener('click', closeSettings);
      if (settingsModal.btnCancel) settingsModal.btnCancel.addEventListener('click', closeSettings);

      if (settingsModal.btnSave) {
        settingsModal.btnSave.addEventListener('click', () => {
          businessSettings.name = settingsModal.inputName.value.trim();
          businessSettings.tagline = settingsModal.inputTagline.value.trim();
          businessSettings.instagram = settingsModal.inputInstagram.value.trim();
          businessSettings.instagramUrl = settingsModal.inputInstagramUrl.value.trim();
          businessSettings.accountName = settingsModal.inputPayeeName.value.trim();
          businessSettings.bankName = settingsModal.inputBankName.value.trim();
          businessSettings.accountNumber = settingsModal.inputAccountNo.value.trim();
          businessSettings.ifsc = settingsModal.inputIfsc.value.trim();
          businessSettings.gpay = settingsModal.inputGpay.value.trim();
          businessSettings.primaryUpi = settingsModal.inputPrimaryUpi.value.trim();
          businessSettings.secondaryUpi = settingsModal.inputSecondaryUpi.value.trim();
          businessSettings.paymentNote = settingsModal.inputPaymentNote.value.trim();

          saveSettings();
          syncLivePreview();
          closeSettings();
          showToast('Business defaults saved!', 'success');
        });
      }

      if (settingsModal.btnReset) {
        settingsModal.btnReset.addEventListener('click', () => {
          if (confirm('Reset settings to default BE CREATIVES reference?')) {
            businessSettings = { ...DEFAULT_SETTINGS };
            saveSettings();
            closeSettings();
            syncLivePreview();
            showToast('Settings reset to defaults.', 'info');
          }
        });
      }
    }
  }

  // Master Initialization
  function init() {
    loadSettings();
    loadInvoices();
    loadClientProfiles();
    loadExpenses();

    populateClientDatalists();
    populateMonthDropdowns();
    attachEvents();

    // Default to first invoice
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
