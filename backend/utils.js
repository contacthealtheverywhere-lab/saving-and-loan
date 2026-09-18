/**
 * Sahridayata Savings - Backend Utilities
 * 
 * Server-side utilities for Google Apps Script
 * Handles logging, validation, security, and common operations
 * All financial business rules must be validated server-side
 */

// Include configuration and translations
// (These will be loaded via script order in Apps Script)

/**
 * Generate a unique transaction ID
 * Format: TXN-YYYYMMDD-XXXXXX
 * @returns {string} Transaction ID
 */
function generateTransactionId() {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
  const randomPart = Utilities.generateUuid().substring(0, 6).toUpperCase();
  return 'TXN-' + dateStr + '-' + randomPart;
}

/**
 * Generate a unique request ID for idempotency
 * Format: REQ-YYYYMMDD-XXXXXX
 * @returns {string} Request ID
 */
function generateRequestId() {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
  const randomPart = Utilities.generateUuid().substring(0, 6).toUpperCase();
  return 'REQ-' + dateStr + '-' + randomPart;
}

/**
 * Generate a unique audit ID
 * Format: AUD-YYYYMMDD-XXXXXX
 * @returns {string} Audit ID
 */
function generateAuditId() {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
  const randomPart = Utilities.generateUuid().substring(0, 6).toUpperCase();
  return 'AUD-' + dateStr + '-' + randomPart;
}

/**
 * Validate amount format and range
 * Uses integer arithmetic to avoid floating-point errors
 * @param {number|string} amount - Amount to validate
 * @param {number} minAmount - Minimum allowed amount
 * @param {number} maxAmount - Maximum allowed amount
 * @returns {object} Validation result with isValid and error message
 */
function validateAmount(amount, minAmount = 0.01, maxAmount = 1000000) {
  try {
    // Convert to number if string
    let numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Invalid amount format' };
    }
    
    // Convert to minor units (paisa) for precise calculation
    let minorUnits = Math.round(numAmount * 100);
    
    if (minorUnits <= 0) {
      return { isValid: false, error: 'Amount must be positive' };
    }
    
    let minMinor = Math.round(minAmount * 100);
    let maxMinor = Math.round(maxAmount * 100);
    
    if (minorUnits < minMinor) {
      return { isValid: false, error: 'Amount too small (minimum: ' + minAmount + ')' };
    }
    
    if (minorUnits > maxMinor) {
      return { isValid: false, error: 'Amount too large (maximum: ' + maxAmount + ')' };
    }
    
    return { 
      isValid: true, 
      amount: numAmount,
      minorUnits: minorUnits,
      error: null
    };
  } catch (error) {
    Logger.log('Error validating amount: ' + error.toString());
    return { isValid: false, error: 'Amount validation failed' };
  }
}

/**
 * Convert minor units to major units safely
 * @param {number} minorUnits - Amount in minor units (e.g., paisa)
 * @returns {number} Amount in major units (e.g., rupees/dollars)
 */
function minorToMajor(minorUnits) {
  return Math.round(minorUnits) / 100;
}

/**
 * Convert major units to minor units safely
 * @param {number} majorUnits - Amount in major units
 * @returns {number} Amount in minor units
 */
function majorToMinor(majorUnits) {
  return Math.round(majorUnits * 100);
}

/**
 * Safe addition using minor units
 * @param {number} a - First amount
 * @param {number} b - Second amount
 * @returns {number} Sum
 */
function safeAdd(a, b) {
  return minorToMajor(majorToMinor(a) + majorToMinor(b));
}

/**
 * Safe subtraction using minor units
 * @param {number} a - First amount
 * @param {number} b - Second amount
 * @returns {number} Difference
 */
function safeSubtract(a, b) {
  return minorToMajor(majorToMinor(a) - majorToMinor(b));
}

/**
 * Round to 2 decimal places safely
 * @param {number} value - Value to round
 * @returns {number} Rounded value
 */
function safeRound(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Log security event
 * @param {string} action - Action type
 * @param {string} actor - User performing action
 * @param {string} details - Additional details
 * @param {string} severity - Severity level (INFO, WARNING, ERROR, CRITICAL)
 */
function logSecurityEvent(action, actor, details, severity = 'INFO') {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      actor: actor,
      details: details,
      severity: severity,
      sessionId: Session.getTemporaryVariable('sessionId') || 'unknown'
    };
    
    Logger.log('SECURITY [' + severity + ']: ' + JSON.stringify(logEntry));
    
    // Store in AuditLog sheet if available
    if (CONFIG.SPREADSHEET_ID) {
      try {
        const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        let auditSheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT_LOG);
        
        if (!auditSheet) {
          auditSheet = ss.insertSheet(CONFIG.SHEETS.AUDIT_LOG);
          auditSheet.appendRow(['auditId', 'transactionId', 'action', 'actor', 'actorRole', 'timestamp', 'details', 'ipAddress']);
        }
        
        auditSheet.appendRow([
          generateAuditId(),
          '',
          action,
          actor,
          'UNKNOWN',
          new Date().toISOString(),
          JSON.stringify(logEntry),
          ''
        ]);
      } catch (sheetError) {
        Logger.log('Failed to write to audit sheet: ' + sheetError.toString());
      }
    }
  } catch (error) {
    Logger.log('Error logging security event: ' + error.toString());
  }
}

/**
 * Log technical error (backend only - never expose to users)
 * @param {string} operation - Operation being performed
 * @param {Error} error - Error object
 * @param {object} context - Additional context
 */
function logTechnicalError(operation, error, context = {}) {
  try {
    const errorLog = {
      timestamp: new Date().toISOString(),
      operation: operation,
      errorMessage: error.toString(),
      stackTrace: error.stack ? error.stack : 'No stack trace',
      context: context,
      sessionId: Session.getTemporaryVariable('sessionId') || 'unknown'
    };
    
    Logger.log('TECHNICAL ERROR: ' + JSON.stringify(errorLog));
    
    // Store in a dedicated ErrorLog sheet if needed
    // This is backend-only and never exposed to users
  } catch (logError) {
    Logger.log('Failed to log technical error: ' + logError.toString());
  }
}

/**
 * Get user-facing error message (safe, no technical details)
 * @param {Error} error - Error object
 * @param {string} language - Language code
 * @param {string} requestId - Request ID for tracking
 * @returns {string} Safe error message
 */
function getUserErrorMessage(error, language = 'en', requestId = '') {
  // Log the full error internally
  logTechnicalError('UserOperation', error, { requestId: requestId });
  
  // Return safe, translated message
  const baseMessage = t('unableToComplete', language);
  const retryMessage = t('pleaseTryAgain', language);
  
  let message = baseMessage + '.\n' + retryMessage;
  
  if (requestId) {
    const reqIdLabel = t('requestId', language);
    message += '\n\n' + reqIdLabel + ': ' + requestId;
  }
  
  return message;
}

/**
 * Acquire lock for concurrent operation prevention
 * @param {string} lockName - Name of the lock
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {LockService.Lock} Lock object or null
 */
function acquireLock(lockName, timeoutMs = CONFIG.CONSTRAINTS.LOCK_TIMEOUT_MS) {
  try {
    const lock = LockService.getUserLock();
    const acquired = lock.tryLock(timeoutMs);
    
    if (acquired) {
      return lock;
    } else {
      Logger.log('Failed to acquire lock: ' + lockName);
      return null;
    }
  } catch (error) {
    Logger.log('Error acquiring lock: ' + error.toString());
    return null;
  }
}

/**
 * Release lock safely
 * @param {LockService.Lock} lock - Lock object
 */
function releaseLock(lock) {
  try {
    if (lock) {
      lock.releaseLock();
    }
  } catch (error) {
    Logger.log('Error releasing lock: ' + error.toString());
  }
}

/**
 * Check if request is duplicate (idempotency check)
 * @param {string} requestId - Request ID to check
 * @returns {boolean} True if request was already processed
 */
function isDuplicateRequest(requestId) {
  if (!requestId || !CONFIG.SPREADSHEET_ID) {
    return false;
  }
  
  try {
    const cache = CacheService.getUserCache();
    const cacheKey = 'processed_request_' + requestId;
    
    // Check cache first (faster)
    if (CACHE_CONFIG.ENABLED) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return true;
      }
    }
    
    // Check Transactions sheet
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const transSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    if (transSheet) {
      const data = transSheet.getDataRange().getValues();
      const requestIdCol = CONFIG.COLUMNS.TRANSACTIONS.indexOf('requestId');
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][requestIdCol] === requestId) {
          // Cache this for future checks
          if (CACHE_CONFIG.ENABLED) {
            cache.put(cacheKey, 'true', 86400); // Cache for 24 hours
          }
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    Logger.log('Error checking duplicate request: ' + error.toString());
    return false;
  }
}

/**
 * Mark request as processed (for idempotency)
 * @param {string} requestId - Request ID
 */
function markRequestProcessed(requestId) {
  if (!requestId) {
    return;
  }
  
  try {
    const cache = CacheService.getUserCache();
    const cacheKey = 'processed_request_' + requestId;
    
    if (CACHE_CONFIG.ENABLED) {
      cache.put(cacheKey, 'true', 86400); // Cache for 24 hours
    }
  } catch (error) {
    Logger.log('Error marking request as processed: ' + error.toString());
  }
}

/**
 * Validate member authentication status
 * @param {string} memberId - Member ID to validate
 * @returns {object} Validation result with member info or error
 */
function validateMemberAuth(memberId) {
  if (!memberId || !CONFIG.SPREADSHEET_ID) {
    return { isValid: false, error: 'Invalid member ID' };
  }
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const memberSheet = ss.getSheetByName(CONFIG.SHEETS.MEMBERS);
    
    if (!memberSheet) {
      return { isValid: false, error: 'Members sheet not found' };
    }
    
    const data = memberSheet.getDataRange().getValues();
    const headers = CONFIG.COLUMNS.MEMBERS;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('memberId')] === memberId) {
        const status = data[i][headers.indexOf('status')];
        
        if (status !== 'ACTIVE') {
          return { 
            isValid: false, 
            error: 'Member account is not active',
            memberStatus: status
          };
        }
        
        return {
          isValid: true,
          member: {
            memberId: data[i][headers.indexOf('memberId')],
            name: data[i][headers.indexOf('name')],
            role: data[i][headers.indexOf('role')],
            language: data[i][headers.indexOf('language')] || 'en',
            status: status
          }
        };
      }
    }
    
    return { isValid: false, error: 'Member not found' };
  } catch (error) {
    logTechnicalError('validateMemberAuth', error, { memberId: memberId });
    return { isValid: false, error: 'Authentication failed' };
  }
}

/**
 * Get member's account information
 * @param {string} memberId - Member ID
 * @returns {object} Account information or error
 */
function getMemberAccount(memberId) {
  if (!memberId || !CONFIG.SPREADSHEET_ID) {
    return { error: 'Invalid member ID' };
  }
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const accountSheet = ss.getSheetByName(CONFIG.SHEETS.ACCOUNTS);
    
    if (!accountSheet) {
      return { error: 'Accounts sheet not found' };
    }
    
    const data = accountSheet.getDataRange().getValues();
    const headers = CONFIG.COLUMNS.ACCOUNTS;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('memberId')] === memberId) {
        const status = data[i][headers.indexOf('status')];
        
        if (status !== 'ACTIVE') {
          return { error: 'Account is not active' };
        }
        
        return {
          accountId: data[i][headers.indexOf('accountId')],
          memberId: memberId,
          savingsBalance: Number(data[i][headers.indexOf('savingsBalance')]) || 0,
          status: status,
          openedDate: data[i][headers.indexOf('openedDate')],
          lastUpdated: data[i][headers.indexOf('lastUpdated')]
        };
      }
    }
    
    return { error: 'Account not found' };
  } catch (error) {
    logTechnicalError('getMemberAccount', error, { memberId: memberId });
    return { error: 'Failed to retrieve account' };
  }
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'AED', locale = 'en-AE') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return currency + ' ' + amount.toFixed(2);
  }
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type (short, long, iso)
 * @param {string} language - Language code
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'short', language = 'en') {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const timeZone = Session.getScriptTimeZone();
    
    if (format === 'iso') {
      return dateObj.toISOString();
    }
    
    if (format === 'short') {
      return Utilities.formatDate(dateObj, timeZone, 'dd/MM/yyyy');
    }
    
    if (format === 'long') {
      return Utilities.formatDate(dateObj, timeZone, 'dd MMMM yyyy');
    }
    
    return Utilities.formatDate(dateObj, timeZone, 'dd/MM/yyyy');
  } catch (error) {
    Logger.log('Error formatting date: ' + error.toString());
    return date.toString();
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized string
 */
function sanitizeInput(input, maxLength = 500) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Escape HTML
  sanitized = escapeHtml(sanitized);
  
  return sanitized;
}
