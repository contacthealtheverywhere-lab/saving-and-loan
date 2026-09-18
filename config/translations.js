/**
 * Sahridayata Savings - Bilingual Translation Dictionary
 * 
 * Central translation dictionary for English and Nepali
 * Backend remains English-only; frontend uses this for bilingual UI
 * All user-facing communications must use these translations
 */

const TRANSLATIONS = {
  // ========== NAVIGATION & MENU ==========
  en: {
    // Navigation
    home: 'Home',
    savings: 'Savings',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    ledger: 'Ledger',
    loan: 'Loan',
    repayment: 'Repayment',
    statement: 'Statement',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    
    // Staff Menu
    dashboard: 'Dashboard',
    members: 'Members',
    deposits: 'Deposits',
    withdrawals: 'Withdrawals',
    loans: 'Loans',
    payments: 'Payments',
    accounting: 'Accounting',
    reconciliation: 'Reconciliation',
    reports: 'Reports',
    email: 'Email',
    approvals: 'Approvals',
    audit: 'Audit',
    backup: 'Backup',
    systemJobs: 'System Jobs',
    configuration: 'Configuration',
    investments: 'Investments',
    profit: 'Profit',
    finance: 'Finance',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    
    // Financial Terms
    balance: 'Balance',
    availableBalance: 'Available Balance',
    savingsBalance: 'Savings Balance',
    outstanding: 'Outstanding',
    principal: 'Principal',
    interest: 'Interest',
    fee: 'Fee',
    amount: 'Amount',
    total: 'Total',
    paid: 'Paid',
    due: 'Due',
    overdue: 'Overdue',
    transactionId: 'Transaction ID',
    requestId: 'Request ID',
    reference: 'Reference',
    description: 'Description',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    type: 'Type',
    
    // Dashboard
    currentMonthDeposits: 'This Month\'s Deposits',
    currentMonthWithdrawals: 'This Month\'s Withdrawals',
    nextRepayment: 'Next Payment',
    dueDate: 'Due Date',
    profitCredited: 'Profit Credited',
    recentTransactions: 'Recent Transactions',
    
    // Deposit
    depositAmount: 'Deposit Amount',
    depositReceived: 'Deposit Received',
    depositSuccess: 'Deposit Successful',
    depositFailed: 'Deposit Failed',
    enterDepositAmount: 'Enter amount to deposit',
    
    // Withdrawal
    withdrawAmount: 'Withdrawal Amount',
    withdrawSuccess: 'Withdrawal Successful',
    withdrawFailed: 'Withdrawal Failed',
    insufficientBalance: 'Insufficient Balance',
    minimumBalanceRequired: 'Minimum Balance Required',
    withdrawalFee: 'Withdrawal Fee',
    netAmount: 'Net Amount',
    approvalRequired: 'Approval Required',
    pendingApproval: 'Pending Approval',
    
    // Loan
    loanOutstanding: 'Loan Outstanding',
    loanPrincipal: 'Loan Principal',
    loanInterest: 'Loan Interest',
    nextPayment: 'Next Payment',
    paymentHistory: 'Payment History',
    loanStatement: 'Loan Statement',
    applyForLoan: 'Apply for Loan',
    loanApproved: 'Loan Approved',
    loanRejected: 'Loan Rejected',
    loanDisbursed: 'Loan Disbursed',
    
    // Ledger
    transactionHistory: 'Transaction History',
    runningBalance: 'Running Balance',
    noTransactions: 'No transactions found',
    viewDetails: 'View Details',
    
    // Statement
    monthlyStatement: 'Monthly Statement',
    openingBalance: 'Opening Balance',
    closingBalance: 'Closing Balance',
    totalDeposits: 'Total Deposits',
    totalWithdrawals: 'Total Withdrawals',
    totalInterest: 'Total Interest',
    statementReady: 'Statement Ready',
    downloadStatement: 'Download Statement',
    
    // Notifications
    newNotification: 'New Notification',
    markAsRead: 'Mark as Read',
    markAllAsRead: 'Mark All as Read',
    noNotifications: 'No notifications',
    loanPaymentReminder: 'Loan Payment Reminder',
    monthlyStatementReady: 'Monthly Statement Ready',
    
    // Profile
    memberName: 'Member Name',
    memberId: 'Member ID',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    language: 'Language',
    registeredDate: 'Registered Date',
    updateProfile: 'Update Profile',
    
    // Authentication
    username: 'Username',
    password: 'Password',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    
    // Errors
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    info: 'Information',
    unableToComplete: 'Unable to complete',
    pleaseTryAgain: 'Please try again',
    networkError: 'Network Error',
    serverError: 'Server Error',
    unauthorizedAccess: 'Unauthorized Access',
    sessionExpired: 'Session Expired',
    invalidInput: 'Invalid Input',
    duplicateRequest: 'Duplicate Request',
    transactionFailed: 'Transaction Failed',
    
    // Messages
    confirmAction: 'Are you sure you want to proceed?',
    actionSuccessful: 'Action completed successfully',
    actionFailed: 'Action failed',
    dataSaved: 'Data saved successfully',
    dataDeleted: 'Data deleted successfully',
    loading: 'Loading...',
    processing: 'Processing...',
    saving: 'Saving...',
    deleting: 'Deleting...',
    
    // Validation
    requiredField: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    invalidAmount: 'Invalid amount',
    amountTooLarge: 'Amount too large',
    amountTooSmall: 'Amount too small',
    minLength: 'Minimum length not met',
    maxLength: 'Maximum length exceeded'
  },
  
  ne: {
    // Navigation
    home: 'होम',
    savings: 'बचत',
    deposit: 'जम्मा',
    withdraw: 'झिक्ने',
    ledger: 'लेजर',
    loan: 'ऋण',
    repayment: 'भुक्तानी',
    statement: 'विवरण',
    notifications: 'सूचनाहरू',
    profile: 'प्रोफाइल',
    logout: 'लग आउट',
    login: 'लग इन',
    
    // Staff Menu
    dashboard: 'ड्यासबोर्ड',
    members: 'सदस्यहरू',
    deposits: 'जम्मा',
    withdrawals: 'झिकाइ',
    loans: 'ऋण',
    payments: 'भुक्तानी',
    accounting: 'खाता',
    reconciliation: 'मिलापत्र',
    reports: 'प्रतिवेदन',
    email: 'इमेल',
    approvals: 'स्वीकृति',
    audit: 'अडिट',
    backup: 'ब्याकअप',
    systemJobs: 'प्रणाली कार्य',
    configuration: 'कन्फिगरेसन',
    investments: 'लगानी',
    profit: 'नाफा',
    finance: 'वित्त',
    
    // Actions
    save: 'सुरक्षित गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    confirm: 'पुष्टि गर्नुहोस्',
    delete: 'मेटाउनुहोस्',
    edit: 'सम्पादन गर्नुहोस्',
    view: 'हेर्नुहोस्',
    search: 'खोज्नुहोस्',
    filter: 'फिल्टर',
    export: 'निर्यात',
    import: 'आयात',
    refresh: 'ताजा गर्नुहोस्',
    back: 'पछाडि',
    next: 'अर्को',
    previous: 'अघिल्लो',
    submit: 'पेश गर्नुहोस्',
    close: 'बन्द गर्नुहोस्',
    approve: 'स्वीकृत',
    reject: 'अस्वीकार',
    pending: 'विचाराधीन',
    
    // Financial Terms
    balance: 'मौज्दात',
    availableBalance: 'उपलब्ध मौज्दात',
    savingsBalance: 'बचत मौज्दात',
    outstanding: 'बाँकी',
    principal: 'मुख्य रकम',
    interest: 'ब्याज',
    fee: 'शुल्क',
    amount: 'रकम',
    total: 'जम्मा',
    paid: 'भुक्तानी भएको',
    due: 'देय',
    overdue: 'समय नाघेको',
    transactionId: 'कारोबार परिचय नम्बर',
    requestId: 'अनुरोध परिचय नम्बर',
    reference: 'सन्दर्भ',
    description: 'विवरण',
    date: 'मिति',
    time: 'समय',
    status: 'स्थिति',
    type: 'प्रकार',
    
    // Dashboard
    currentMonthDeposits: 'यस महिनाको जम्मा',
    currentMonthWithdrawals: 'यस महिनाको झिकाइ',
    nextRepayment: 'अर्को भुक्तानी',
    dueDate: 'भुक्तानी मिति',
    profitCredited: 'क्रेडिट भएको नाफा',
    recentTransactions: 'हालैका कारोबारहरू',
    
    // Deposit
    depositAmount: 'जम्मा रकम',
    depositReceived: 'जम्मा प्राप्त भयो',
    depositSuccess: 'जम्मा सफल',
    depositFailed: 'जम्मा असफल',
    enterDepositAmount: 'जम्मा गर्ने रकम राख्नुहोस्',
    
    // Withdrawal
    withdrawAmount: 'झिक्ने रकम',
    withdrawSuccess: 'झिकाइ सफल',
    withdrawFailed: 'झिकाइ असफल',
    insufficientBalance: 'अपर्याप्त मौज्दात',
    minimumBalanceRequired: 'न्यूनतम मौज्दात आवश्यक',
    withdrawalFee: 'झिकाइ शुल्क',
    netAmount: 'नेट रकम',
    approvalRequired: 'स्वीकृति आवश्यक',
    pendingApproval: 'स्वीकृति विचाराधीन',
    
    // Loan
    loanOutstanding: 'बाँकी ऋण',
    loanPrincipal: 'ऋण मुख्य रकम',
    loanInterest: 'ऋण ब्याज',
    nextPayment: 'अर्को भुक्तानी',
    paymentHistory: 'भुक्तानी इतिहास',
    loanStatement: 'ऋण विवरण',
    applyForLoan: 'ऋणको लागि निवेदन',
    loanApproved: 'ऋण स्वीकृत',
    loanRejected: 'ऋण अस्वीकार',
    loanDisbursed: 'ऋण वितरण',
    
    // Ledger
    transactionHistory: 'कारोबार इतिहास',
    runningBalance: 'चालु मौज्दात',
    noTransactions: 'कुनै कारोबार फेला परेन',
    viewDetails: 'विस्तृत विवरण हेर्नुहोस्',
    
    // Statement
    monthlyStatement: 'मासिक विवरण',
    openingBalance: 'सुरुवाती मौज्दात',
    closingBalance: 'समापन मौज्दात',
    totalDeposits: 'जम्मा जम्मा',
    totalWithdrawals: 'जम्मा झिकाइ',
    totalInterest: 'जम्मा ब्याज',
    statementReady: 'विवरण तयार छ',
    downloadStatement: 'विवरण डाउनलोड',
    
    // Notifications
    newNotification: 'नयाँ सूचना',
    markAsRead: 'पढेको रूपमा चिन्ह लगाउनुहोस्',
    markAllAsRead: 'सबै पढेको रूपमा चिन्ह लगाउनुहोस्',
    noNotifications: 'कुनै सूचना छैन',
    loanPaymentReminder: 'ऋण भुक्तानी सम्झना',
    monthlyStatementReady: 'मासिक विवरण तयार छ',
    
    // Profile
    memberName: 'सदस्य नाम',
    memberId: 'सदस्य परिचय नम्बर',
    phoneNumber: 'फोन नम्बर',
    emailAddress: 'इमेल ठेगाना',
    language: 'भाषा',
    registeredDate: 'दर्ता मिति',
    updateProfile: 'प्रोफाइल अपडेट',
    
    // Authentication
    username: 'प्रयोगकर्ता नाम',
    password: 'पासवर्ड',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    forgotPassword: 'पासवर्ड बिर्सनुभयो?',
    resetPassword: 'पासवर्ड रिसेट',
    changePassword: 'पासवर्ड परिवर्तन',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नयाँ पासवर्ड',
    confirmPassword: 'पासवर्ड पुष्टि',
    
    // Errors
    error: 'त्रुटि',
    warning: 'चेतावनी',
    success: 'सफल',
    info: 'सूचना',
    unableToComplete: 'पूरा गर्न सकिएन',
    pleaseTryAgain: 'कृपया पुनः प्रयास गर्नुहोस्',
    networkError: 'सञ्जाल त्रुटि',
    serverError: 'सर्भर त्रुटि',
    unauthorizedAccess: 'अनधिकृत पहुँच',
    sessionExpired: 'सत्र समाप्त',
    invalidInput: 'अमान्य इनपुट',
    duplicateRequest: 'दोहोरिएको अनुरोध',
    transactionFailed: 'कारोबार असफल',
    
    // Messages
    confirmAction: 'के तपाईं अगाडि बढ्न चाहनुहुन्छ?',
    actionSuccessful: 'कार्य सफलतापूर्वक पूरा भयो',
    actionFailed: 'कार्य असफल',
    dataSaved: 'डाटा सफलतापूर्वक सुरक्षित गरियो',
    dataDeleted: 'डाटा सफलतापूर्वक मेटाइयो',
    loading: 'लोड हुँदैछ...',
    processing: 'प्रशोधन हुँदैछ...',
    saving: 'सुरक्षित हुँदैछ...',
    deleting: 'मेटाउँदैछ...',
    
    // Validation
    requiredField: 'यो क्षेत्र आवश्यक छ',
    invalidEmail: 'अमान्य इमेल ठेगाना',
    invalidPhone: 'अमान्य फोन नम्बर',
    invalidAmount: 'अमान्य रकम',
    amountTooLarge: 'रकम धेरै ठूलो छ',
    amountTooSmall: 'रकम धेरै सानो छ',
    minLength: 'न्यूनतम लम्बाइ पूरा भएन',
    maxLength: 'अधिकतम लम्बाइ नाघ्यो'
  }
};

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string} language - Language code ('en' or 'ne')
 * @param {object} params - Optional parameters for string interpolation
 * @returns {string} Translated string
 */
function t(key, language = 'en', params = {}) {
  const lang = TRANSLATIONS[language] || TRANSLATIONS['en'];
  let translation = lang[key] || TRANSLATIONS['en'][key] || key;
  
  // Simple parameter replacement
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(paramKey => {
      translation = translation.replace(`{${paramKey}}`, params[paramKey]);
    });
  }
  
  return translation;
}

/**
 * Get all translations for a language
 * @param {string} language - Language code
 * @returns {object} Translation dictionary
 */
function getTranslations(language = 'en') {
  return TRANSLATIONS[language] || TRANSLATIONS['en'];
}

/**
 * Check if language is supported
 * @param {string} language - Language code
 * @returns {boolean} True if supported
 */
function isSupportedLanguage(language) {
  return TRANSLATIONS.hasOwnProperty(language);
}

/**
 * Get supported languages
 * @returns {string[]} Array of language codes
 */
function getSupportedLanguages() {
  return Object.keys(TRANSLATIONS);
}

// Export for use in both frontend and backend
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.t = t;
  window.getTranslations = getTranslations;
  window.isSupportedLanguage = isSupportedLanguage;
  window.getSupportedLanguages = getSupportedLanguages;
}

// For Google Apps Script backend
if (typeof global !== 'undefined') {
  global.TRANSLATIONS = TRANSLATIONS;
  global.t = t;
  global.getTranslations = getTranslations;
}
