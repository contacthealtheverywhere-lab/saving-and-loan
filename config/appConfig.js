/**
 * Sahridayata Savings - Application Configuration
 * 
 * Central configuration for both frontend and backend
 * Keep backend configuration English-only
 * Frontend uses translation dictionary for bilingual support
 */

// Application version for cache busting
const APP_VERSION = '1.0.0';

// Google Sheets Configuration
const CONFIG = {
  // Replace with your actual Google Sheet ID
  SPREADSHEET_ID: '', // TODO: Set your Google Sheet ID
  
  // Sheet names (must match exactly in Google Sheets)
  SHEETS: {
    MEMBERS: 'Members',
    ACCOUNTS: 'Accounts',
    TRANSACTIONS: 'Transactions',
    LOANS: 'Loans',
    LOAN_PAYMENTS: 'LoanPayments',
    AUDIT_LOG: 'AuditLog',
    CONFIG: 'Config'
  },
  
  // Column indices (0-based) for each sheet
  COLUMNS: {
    MEMBERS: ['memberId', 'name', 'phone', 'email', 'role', 'status', 'registeredDate', 'language'],
    ACCOUNTS: ['accountId', 'memberId', 'savingsBalance', 'status', 'openedDate', 'lastUpdated'],
    TRANSACTIONS: ['transactionId', 'requestId', 'accountId', 'type', 'amount', 'balanceAfter', 'timestamp', 'status', 'description', 'reference'],
    LOANS: ['loanId', 'memberId', 'principal', 'outstanding', 'interestRate', 'status', 'issuedDate', 'dueDate', 'nextPaymentAmount', 'nextPaymentDate'],
    LOAN_PAYMENTS: ['paymentId', 'loanId', 'accountId', 'amount', 'principalPortion', 'interestPortion', 'date', 'transactionId'],
    AUDIT_LOG: ['auditId', 'transactionId', 'action', 'actor', 'actorRole', 'timestamp', 'details', 'ipAddress']
  },
  
  // Transaction types
  TRANSACTION_TYPES: {
    DEPOSIT: 'DEPOSIT',
    WITHDRAWAL: 'WITHDRAWAL',
    LOAN_DISBURSEMENT: 'LOAN_DISBURSEMENT',
    LOAN_REPAYMENT: 'LOAN_REPAYMENT',
    INTEREST_CREDIT: 'INTEREST_CREDIT',
    FEE: 'FEE'
  },
  
  // Transaction statuses
  STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
  },
  
  // Member roles
  ROLES: {
    MEMBER: 'MEMBER',
    ACCOUNTANT: 'ACCOUNTANT',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN'
  },
  
  // Financial constraints
  CONSTRAINTS: {
    MIN_SAVINGS_BALANCE: 0, // Minimum balance after withdrawal
    MAX_WITHDRAWAL_AMOUNT: 100000, // Maximum single withdrawal
    MIN_DEPOSIT_AMOUNT: 1, // Minimum deposit
    DECIMAL_PLACES: 2, // Decimal precision for amounts
    LOCK_TIMEOUT_MS: 30000 // Lock timeout for concurrent operations
  }
};

// Cache configuration
const CACHE_CONFIG = {
  ENABLED: true,
  DASHBOARD_TTL_SECONDS: 300, // 5 minutes
  BALANCE_TTL_SECONDS: 60, // 1 minute
  LEDGER_TTL_SECONDS: 300, // 5 minutes
  LOAN_TTL_SECONDS: 300 // 5 minutes
};

// Security configuration
const SECURITY_CONFIG = {
  SESSION_TIMEOUT_MS: 1800000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 900000, // 15 minutes
  REQUIRE_2FA_FOR_ADMIN: false // Set to true if 2FA is implemented
};

// Notification settings
const NOTIFICATION_CONFIG = {
  ENABLE_EMAIL: true,
  ENABLE_SMS: false, // Requires SMS gateway integration
  ENABLE_PUSH: false, // Requires Firebase or similar
  DEFAULT_LANGUAGE: 'en'
};

/**
 * Get a configuration value by key
 * @param {string} key - Configuration key
 * @param {any} defaultValue - Default value if key not found
 * @returns {any} Configuration value
 */
function getConfig(key, defaultValue) {
  try {
    const cache = CacheService.getUserCache();
    const cacheKey = 'config_' + key;
    
    // Try cache first
    if (CACHE_CONFIG.ENABLED) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    // Fall back to Config sheet
    if (CONFIG.SPREADSHEET_ID) {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIG);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === key) {
            const value = data[i][1];
            // Cache the value
            if (CACHE_CONFIG.ENABLED) {
              cache.put(cacheKey, JSON.stringify(value), 3600);
            }
            return value;
          }
        }
      }
    }
    
    // Fall back to default
    return defaultValue !== undefined ? defaultValue : null;
  } catch (error) {
    Logger.log('Error getting config ' + key + ': ' + error.toString());
    return defaultValue !== undefined ? defaultValue : null;
  }
}

/**
 * Set a configuration value
 * @param {string} key - Configuration key
 * @param {any} value - Configuration value
 * @returns {boolean} Success status
 */
function setConfig(key, value) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIG);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.CONFIG);
      sheet.appendRow(['key', 'value', 'updatedDate']);
    }
    
    const data = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(new Date());
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([key, value, new Date()]);
    }
    
    // Invalidate cache
    if (CACHE_CONFIG.ENABLED) {
      const cache = CacheService.getUserCache();
      cache.remove('config_' + key);
    }
    
    return true;
  } catch (error) {
    Logger.log('Error setting config ' + key + ': ' + error.toString());
    return false;
  }
}

// Export for frontend use (will be included via script tag)
if (typeof window !== 'undefined') {
  window.APP_CONFIG = CONFIG;
  window.APP_VERSION = APP_VERSION;
}
