/**
 * Sahridayata Savings - Transaction Engine
 * 
 * Core financial transaction processing engine
 * Server-authoritative processing with full audit trail
 * Follows: Authentication → Authorization → Validation → Business Rules → 
 *          Transaction Validation → Transaction Engine → Accounting → Audit
 * 
 * ALL financial operations MUST go through this engine
 * Frontend must NEVER directly modify Google Sheets for financial data
 */

/**
 * Process a deposit transaction
 * @param {object} request - Deposit request object
 * @returns {object} Transaction result
 */
function processDeposit(request) {
  const requestId = request.requestId || generateRequestId();
  let lock = null;
  
  try {
    // ========== AUTHENTICATION ==========
    const authResult = validateMemberAuth(request.memberId);
    if (!authResult.isValid) {
      logSecurityEvent('DEPOSIT_AUTH_FAILED', request.memberId, 'Invalid member authentication', 'WARNING');
      return {
        success: false,
        error: authResult.error,
        requestId: requestId
      };
    }
    
    const member = authResult.member;
    const language = member.language || 'en';
    
    // ========== AUTHORIZATION ==========
    if (member.role === CONFIG.ROLES.MEMBER || member.role === CONFIG.ROLES.ACCOUNTANT || member.role === CONFIG.ROLES.ADMIN) {
      // Members can deposit to their own accounts
    } else {
      logSecurityEvent('DEPOSIT_UNAUTHORIZED', request.memberId, 'Unauthorized deposit attempt', 'WARNING');
      return {
        success: false,
        error: t('unauthorizedAccess', language),
        requestId: requestId
      };
    }
    
    // ========== IDEMPOTENCY CHECK ==========
    if (isDuplicateRequest(requestId)) {
      return {
        success: false,
        error: t('duplicateRequest', language),
        requestId: requestId,
        isDuplicate: true
      };
    }
    
    // ========== VALIDATION ==========
    const amountValidation = validateAmount(
      request.amount,
      CONFIG.CONSTRAINTS.MIN_DEPOSIT_AMOUNT,
      CONFIG.CONSTRAINTS.MAX_WITHDRAWAL_AMOUNT
    );
    
    if (!amountValidation.isValid) {
      return {
        success: false,
        error: amountValidation.error,
        requestId: requestId
      };
    }
    
    const amount = amountValidation.amount;
    
    // Get member account
    const account = getMemberAccount(request.memberId);
    if (account.error) {
      return {
        success: false,
        error: account.error,
        requestId: requestId
      };
    }
    
    // ========== BUSINESS RULES ==========
    // Deposits generally have no business rule restrictions beyond validation
    
    // ========== TRANSACTION VALIDATION ==========
    const currentBalance = account.savingsBalance;
    const newBalance = safeAdd(currentBalance, amount);
    
    // ========== ACQUIRE LOCK ==========
    lock = acquireLock('account_' + account.accountId);
    if (!lock) {
      return {
        success: false,
        error: t('processing', language) + '...',
        requestId: requestId
      };
    }
    
    // Re-check balance after acquiring lock (prevent race conditions)
    const freshAccount = getMemberAccount(request.memberId);
    if (freshAccount.error || freshAccount.savingsBalance !== currentBalance) {
      releaseLock(lock);
      return {
        success: false,
        error: t('pleaseTryAgain', language),
        requestId: requestId
      };
    }
    
    // ========== TRANSACTION ENGINE ==========
    const transactionId = generateTransactionId();
    const timestamp = new Date().toISOString();
    
    // Create transaction record
    const transaction = {
      transactionId: transactionId,
      requestId: requestId,
      accountId: account.accountId,
      type: CONFIG.TRANSACTION_TYPES.DEPOSIT,
      amount: amount,
      balanceAfter: newBalance,
      timestamp: timestamp,
      status: CONFIG.STATUS.COMPLETED,
      description: t('depositReceived', language),
      reference: request.reference || ''
    };
    
    // ========== ACCOUNTING ==========
    // Update account balance
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const accountSheet = ss.getSheetByName(CONFIG.SHEETS.ACCOUNTS);
    const transSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    // Find and update account row
    const accountData = accountSheet.getDataRange().getValues();
    const accountHeaders = CONFIG.COLUMNS.ACCOUNTS;
    
    for (let i = 1; i < accountData.length; i++) {
      if (accountData[i][accountHeaders.indexOf('accountId')] === account.accountId) {
        accountSheet.getRange(i + 1, accountHeaders.indexOf('savingsBalance') + 1).setValue(newBalance);
        accountSheet.getRange(i + 1, accountHeaders.indexOf('lastUpdated') + 1).setValue(timestamp);
        break;
      }
    }
    
    // Add transaction record
    const transHeaders = CONFIG.COLUMNS.TRANSACTIONS;
    transSheet.appendRow([
      transaction.transactionId,
      transaction.requestId,
      transaction.accountId,
      transaction.type,
      transaction.amount,
      transaction.balanceAfter,
      transaction.timestamp,
      transaction.status,
      transaction.description,
      transaction.reference
    ]);
    
    // ========== AUDIT ==========
    logSecurityEvent(
      'DEPOSIT_COMPLETED',
      member.memberId,
      JSON.stringify({
        transactionId: transactionId,
        amount: amount,
        previousBalance: currentBalance,
        newBalance: newBalance
      }),
      'INFO'
    );
    
    // Mark request as processed
    markRequestProcessed(requestId);
    
    // Release lock
    releaseLock(lock);
    
    // Invalidate cache
    if (CACHE_CONFIG.ENABLED) {
      const cache = CacheService.getUserCache();
      cache.remove('balance_' + account.accountId);
      cache.remove('dashboard_' + member.memberId);
    }
    
    // ========== SUCCESS RESPONSE ==========
    return {
      success: true,
      transactionId: transactionId,
      requestId: requestId,
      amount: amount,
      newBalance: newBalance,
      message: t('depositSuccess', language)
    };
    
  } catch (error) {
    // Release lock on error
    releaseLock(lock);
    
    // Log technical error
    logTechnicalError('processDeposit', error, { requestId: requestId });
    
    // Return safe error message
    return {
      success: false,
      error: getUserErrorMessage(error, request.language || 'en', requestId),
      requestId: requestId
    };
  }
}

/**
 * Process a withdrawal transaction
 * @param {object} request - Withdrawal request object
 * @returns {object} Transaction result
 */
function processWithdrawal(request) {
  const requestId = request.requestId || generateRequestId();
  let lock = null;
  
  try {
    // ========== AUTHENTICATION ==========
    const authResult = validateMemberAuth(request.memberId);
    if (!authResult.isValid) {
      logSecurityEvent('WITHDRAW_AUTH_FAILED', request.memberId, 'Invalid member authentication', 'WARNING');
      return {
        success: false,
        error: authResult.error,
        requestId: requestId
      };
    }
    
    const member = authResult.member;
    const language = member.language || 'en';
    
    // ========== AUTHORIZATION ==========
    if (member.role !== CONFIG.ROLES.MEMBER && member.role !== CONFIG.ROLES.ACCOUNTANT && member.role !== CONFIG.ROLES.ADMIN) {
      logSecurityEvent('WITHDRAW_UNAUTHORIZED', request.memberId, 'Unauthorized withdrawal attempt', 'WARNING');
      return {
        success: false,
        error: t('unauthorizedAccess', language),
        requestId: requestId
      };
    }
    
    // ========== IDEMPOTENCY CHECK ==========
    if (isDuplicateRequest(requestId)) {
      return {
        success: false,
        error: t('duplicateRequest', language),
        requestId: requestId,
        isDuplicate: true
      };
    }
    
    // ========== VALIDATION ==========
    const amountValidation = validateAmount(
      request.amount,
      CONFIG.CONSTRAINTS.MIN_DEPOSIT_AMOUNT,
      CONFIG.CONSTRAINTS.MAX_WITHDRAWAL_AMOUNT
    );
    
    if (!amountValidation.isValid) {
      return {
        success: false,
        error: amountValidation.error,
        requestId: requestId
      };
    }
    
    const amount = amountValidation.amount;
    
    // Get member account
    const account = getMemberAccount(request.memberId);
    if (account.error) {
      return {
        success: false,
        error: account.error,
        requestId: requestId
      };
    }
    
    // ========== BUSINESS RULES ==========
    const currentBalance = account.savingsBalance;
    const minBalance = CONFIG.CONSTRAINTS.MIN_SAVINGS_BALANCE;
    const maxWithdrawal = Math.max(0, safeSubtract(currentBalance, minBalance));
    
    if (amount > maxWithdrawal) {
      return {
        success: false,
        error: t('insufficientBalance', language),
        requestId: requestId,
        availableBalance: currentBalance,
        maxWithdrawal: maxWithdrawal
      };
    }
    
    // Check if approval is required for large withdrawals
    const approvalThreshold = getConfig('WITHDRAWAL_APPROVAL_THRESHOLD', 50000);
    let requiresApproval = amount > approvalThreshold;
    
    // ========== ACQUIRE LOCK ==========
    lock = acquireLock('account_' + account.accountId);
    if (!lock) {
      return {
        success: false,
        error: t('processing', language) + '...',
        requestId: requestId
      };
    }
    
    // Re-check balance after acquiring lock
    const freshAccount = getMemberAccount(request.memberId);
    if (freshAccount.error || freshAccount.savingsBalance !== currentBalance) {
      releaseLock(lock);
      return {
        success: false,
        error: t('pleaseTryAgain', language),
        requestId: requestId
      };
    }
    
    // ========== TRANSACTION ENGINE ==========
    const transactionId = generateTransactionId();
    const timestamp = new Date().toISOString();
    const newBalance = safeSubtract(currentBalance, amount);
    
    // Determine initial status
    const initialStatus = requiresApproval ? CONFIG.STATUS.PENDING : CONFIG.STATUS.COMPLETED;
    
    // Create transaction record
    const transaction = {
      transactionId: transactionId,
      requestId: requestId,
      accountId: account.accountId,
      type: CONFIG.TRANSACTION_TYPES.WITHDRAWAL,
      amount: amount,
      balanceAfter: newBalance,
      timestamp: timestamp,
      status: initialStatus,
      description: t('withdrawAmount', language),
      reference: request.reference || ''
    };
    
    // ========== ACCOUNTING ==========
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const accountSheet = ss.getSheetByName(CONFIG.SHEETS.ACCOUNTS);
    const transSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    // Update account balance only if no approval required
    if (!requiresApproval) {
      const accountData = accountSheet.getDataRange().getValues();
      const accountHeaders = CONFIG.COLUMNS.ACCOUNTS;
      
      for (let i = 1; i < accountData.length; i++) {
        if (accountData[i][accountHeaders.indexOf('accountId')] === account.accountId) {
          accountSheet.getRange(i + 1, accountHeaders.indexOf('savingsBalance') + 1).setValue(newBalance);
          accountSheet.getRange(i + 1, accountHeaders.indexOf('lastUpdated') + 1).setValue(timestamp);
          break;
        }
      }
    }
    
    // Add transaction record
    const transHeaders = CONFIG.COLUMNS.TRANSACTIONS;
    transSheet.appendRow([
      transaction.transactionId,
      transaction.requestId,
      transaction.accountId,
      transaction.type,
      transaction.amount,
      transaction.balanceAfter,
      transaction.timestamp,
      transaction.status,
      transaction.description,
      transaction.reference
    ]);
    
    // ========== AUDIT ==========
    logSecurityEvent(
      'WITHDRAWAL_' + (requiresApproval ? 'PENDING_APPROVAL' : 'COMPLETED'),
      member.memberId,
      JSON.stringify({
        transactionId: transactionId,
        amount: amount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        requiresApproval: requiresApproval
      }),
      'INFO'
    );
    
    // Mark request as processed
    markRequestProcessed(requestId);
    
    // Release lock
    releaseLock(lock);
    
    // Invalidate cache
    if (CACHE_CONFIG.ENABLED) {
      const cache = CacheService.getUserCache();
      cache.remove('balance_' + account.accountId);
      cache.remove('dashboard_' + member.memberId);
    }
    
    // ========== SUCCESS RESPONSE ==========
    return {
      success: true,
      transactionId: transactionId,
      requestId: requestId,
      amount: amount,
      newBalance: requiresApproval ? currentBalance : newBalance,
      requiresApproval: requiresApproval,
      status: initialStatus,
      message: requiresApproval ? t('pendingApproval', language) : t('withdrawSuccess', language)
    };
    
  } catch (error) {
    releaseLock(lock);
    logTechnicalError('processWithdrawal', error, { requestId: requestId });
    
    return {
      success: false,
      error: getUserErrorMessage(error, request.language || 'en', requestId),
      requestId: requestId
    };
  }
}

/**
 * Approve a pending withdrawal
 * @param {string} transactionId - Transaction ID to approve
 * @param {string} approverId - Staff member approving
 * @returns {object} Approval result
 */
function approveWithdrawal(transactionId, approverId) {
  let lock = null;
  
  try {
    // Validate approver authorization
    const approverAuth = validateMemberAuth(approverId);
    if (!approverAuth.isValid || 
        (approverAuth.member.role !== CONFIG.ROLES.ACCOUNTANT && 
         approverAuth.member.role !== CONFIG.ROLES.ADMIN && 
         approverAuth.member.role !== CONFIG.ROLES.SUPER_ADMIN)) {
      return {
        success: false,
        error: 'Unauthorized - approval rights required'
      };
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const transSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    const accountSheet = ss.getSheetByName(CONFIG.SHEETS.ACCOUNTS);
    
    // Find the transaction
    const transData = transSheet.getDataRange().getValues();
    const transHeaders = CONFIG.COLUMNS.TRANSACTIONS;
    let transactionRow = -1;
    
    for (let i = 1; i < transData.length; i++) {
      if (transData[i][transHeaders.indexOf('transactionId')] === transactionId) {
        transactionRow = i;
        break;
      }
    }
    
    if (transactionRow === -1) {
      return { success: false, error: 'Transaction not found' };
    }
    
    if (transData[transactionRow][transHeaders.indexOf('status')] !== CONFIG.STATUS.PENDING) {
      return { success: false, error: 'Transaction is not pending approval' };
    }
    
    if (transData[transactionRow][transHeaders.indexOf('type')] !== CONFIG.TRANSACTION_TYPES.WITHDRAWAL) {
      return { success: false, error: 'Not a withdrawal transaction' };
    }
    
    // Acquire lock
    const accountId = transData[transactionRow][transHeaders.indexOf('accountId')];
    lock = acquireLock('account_' + accountId);
    
    if (!lock) {
      return { success: false, error: 'Unable to process - please try again' };
    }
    
    // Update transaction status
    transSheet.getRange(transactionRow + 1, transHeaders.indexOf('status') + 1).setValue(CONFIG.STATUS.COMPLETED);
    
    // Update account balance
    const amount = Number(transData[transactionRow][transHeaders.indexOf('amount')]);
    const balanceAfter = Number(transData[transactionRow][transHeaders.indexOf('balanceAfter')]);
    
    const accountData = accountSheet.getDataRange().getValues();
    const accountHeaders = CONFIG.COLUMNS.ACCOUNTS;
    
    for (let i = 1; i < accountData.length; i++) {
      if (accountData[i][accountHeaders.indexOf('accountId')] === accountId) {
        accountSheet.getRange(i + 1, accountHeaders.indexOf('savingsBalance') + 1).setValue(balanceAfter);
        accountSheet.getRange(i + 1, accountHeaders.indexOf('lastUpdated') + 1).setValue(new Date().toISOString());
        break;
      }
    }
    
    // Audit log
    logSecurityEvent(
      'WITHDRAWAL_APPROVED',
      approverId,
      JSON.stringify({
        transactionId: transactionId,
        amount: amount,
        approvedBy: approverAuth.member.name
      }),
      'INFO'
    );
    
    releaseLock(lock);
    
    // Invalidate cache
    if (CACHE_CONFIG.ENABLED) {
      const cache = CacheService.getUserCache();
      cache.remove('balance_' + accountId);
    }
    
    return {
      success: true,
      transactionId: transactionId,
      message: 'Withdrawal approved successfully'
    };
    
  } catch (error) {
    releaseLock(lock);
    logTechnicalError('approveWithdrawal', error, { transactionId: transactionId });
    
    return {
      success: false,
      error: 'Approval failed - please try again'
    };
  }
}

/**
 * Get member's transaction ledger
 * @param {string} memberId - Member ID
 * @param {number} limit - Number of transactions to return
 * @param {number} offset - Offset for pagination
 * @returns {object} Ledger data
 */
function getMemberLedger(memberId, limit = 20, offset = 0) {
  try {
    const authResult = validateMemberAuth(memberId);
    if (!authResult.isValid) {
      return { error: authResult.error };
    }
    
    const account = getMemberAccount(memberId);
    if (account.error) {
      return { error: account.error };
    }
    
    // Try cache first
    if (CACHE_CONFIG.ENABLED) {
      const cache = CacheService.getUserCache();
      const cacheKey = 'ledger_' + account.accountId + '_' + limit + '_' + offset;
      const cached = cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const transSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    if (!transSheet) {
      return { error: 'Transactions sheet not found' };
    }
    
    const data = transSheet.getDataRange().getValues();
    const headers = CONFIG.COLUMNS.TRANSACTIONS;
    
    // Filter transactions for this account
    const transactions = [];
    for (let i = data.length - 1; i >= 1 && transactions.length < limit; i--) {
      if (data[i][headers.indexOf('accountId')] === account.accountId) {
        transactions.push({
          transactionId: data[i][headers.indexOf('transactionId')],
          requestId: data[i][headers.indexOf('requestId')],
          type: data[i][headers.indexOf('type')],
          amount: Number(data[i][headers.indexOf('amount')]),
          balanceAfter: Number(data[i][headers.indexOf('balanceAfter')]),
          timestamp: data[i][headers.indexOf('timestamp')],
          status: data[i][headers.indexOf('status')],
          description: data[i][headers.indexOf('description')],
          reference: data[i][headers.indexOf('reference')]
        });
      }
    }
    
    const result = {
      transactions: transactions,
      total: transactions.length,
      hasMore: transactions.length === limit
    };
    
    // Cache the result
    if (CACHE_CONFIG.ENABLED) {
      const cache = CacheService.getUserCache();
      cache.put('ledger_' + account.accountId + '_' + limit + '_' + offset, JSON.stringify(result), CACHE_CONFIG.LEDGER_TTL_SECONDS);
    }
    
    return result;
    
  } catch (error) {
    logTechnicalError('getMemberLedger', error, { memberId: memberId });
    return { error: 'Failed to retrieve ledger' };
  }
}
