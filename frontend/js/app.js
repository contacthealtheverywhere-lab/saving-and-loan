/**
 * Sahridayata Savings - Frontend Application
 * Mobile-first single-page application
 * Handles navigation, API calls, and UI updates
 */

(function() {
  'use strict';
  
  // ========== APPLICATION STATE ==========
  const AppState = {
    currentLanguage: 'en',
    currentView: 'home',
    memberId: null,
    memberInfo: null,
    accountInfo: null,
    isLoading: false,
    lastRequestId: null
  };
  
  // ========== INITIALIZATION ==========
  document.addEventListener('DOMContentLoaded', function() {
    initApp();
  });
  
  function initApp() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLanguage);
    
    // Setup event listeners
    setupNavigation();
    setupForms();
    setupActionButtons();
    
    // Hide loading screen, show app
    setTimeout(function() {
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('app-shell').style.display = 'flex';
      
      // Load initial data
      loadDashboard();
    }, 500);
  }
  
  // ========== NAVIGATION ==========
  function setupNavigation() {
    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
      item.addEventListener('click', function() {
        const viewName = this.getAttribute('data-view');
        navigateTo(viewName);
      });
    });
    
    // Back buttons
    document.querySelectorAll('[data-action="back"]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        navigateTo('home');
      });
    });
  }
  
  function navigateTo(viewName) {
    // Update active view
    document.querySelectorAll('.view').forEach(function(view) {
      view.classList.remove('active');
    });
    
    const targetView = document.getElementById('view-' + viewName);
    if (targetView) {
      targetView.classList.add('active');
      AppState.currentView = viewName;
      
      // Update bottom nav
      document.querySelectorAll('.nav-item').forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('data-view') === viewName);
      });
      
      // Load view-specific data
      switch(viewName) {
        case 'home':
          loadDashboard();
          break;
        case 'deposit':
          prepareDepositForm();
          break;
        case 'withdraw':
          prepareWithdrawForm();
          break;
        case 'ledger':
          loadLedger();
          break;
        case 'loan':
          loadLoanInfo();
          break;
        case 'profile':
          loadProfile();
          break;
      }
    }
  }
  
  // ========== FORMS ==========
  function setupForms() {
    // Deposit form
    const depositForm = document.getElementById('deposit-form');
    if (depositForm) {
      depositForm.addEventListener('submit', handleDeposit);
    }
    
    // Withdrawal form
    const withdrawForm = document.getElementById('withdraw-form');
    if (withdrawForm) {
      withdrawForm.addEventListener('submit', handleWithdrawal);
      withdrawForm.addEventListener('input', updateWithdrawPreview);
    }
  }
  
  function setupActionButtons() {
    // Quick action buttons on dashboard
    document.querySelectorAll('.action-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        if (action) {
          navigateTo(action);
        }
      });
    });
    
    // Language toggle
    const langToggle = document.getElementById('language-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', toggleLanguage);
    }
    
    // Profile button
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', function() {
        navigateTo('profile');
      });
    }
    
    // Refresh ledger
    const refreshLedgerBtn = document.getElementById('refresh-ledger');
    if (refreshLedgerBtn) {
      refreshLedgerBtn.addEventListener('click', function() {
        loadLedger();
      });
    }
  }
  
  // ========== LANGUAGE ==========
  function setLanguage(language) {
    if (!language || !isSupportedLanguage(language)) {
      language = 'en';
    }
    
    AppState.currentLanguage = language;
    localStorage.setItem('preferredLanguage', language);
    
    // Update all elements with data-t attribute
    document.querySelectorAll('[data-t]').forEach(function(el) {
      const key = el.getAttribute('data-t');
      el.textContent = t(key, language);
    });
    
    // Update language button
    const langDisplay = document.getElementById('current-language');
    if (langDisplay) {
      langDisplay.textContent = language.toUpperCase();
    }
  }
  
  function toggleLanguage() {
    const newLanguage = AppState.currentLanguage === 'en' ? 'ne' : 'en';
    setLanguage(newLanguage);
  }
  
  // ========== DASHBOARD ==========
  function loadDashboard() {
    if (AppState.isLoading) return;
    AppState.isLoading = true;
    
    // Simulate API call to get dashboard data
    // In production, this would call google.script.run or fetch API
    setTimeout(function() {
      // Mock data for demonstration
      const mockData = {
        balance: 12500.00,
        monthDeposits: 3500.00,
        monthWithdrawals: 1200.00,
        loanOutstanding: 4250.00,
        nextPayment: 450.00,
        dueDate: '2026-10-05',
        recentTransactions: [
          { id: 'TXN-20260917-001', type: 'DEPOSIT', amount: 500.00, date: '2026-09-17', status: 'COMPLETED' },
          { id: 'TXN-20260916-002', type: 'WITHDRAWAL', amount: 200.00, date: '2026-09-16', status: 'COMPLETED' },
          { id: 'TXN-20260915-003', type: 'DEPOSIT', amount: 1000.00, date: '2026-09-15', status: 'COMPLETED' }
        ]
      };
      
      updateDashboard(mockData);
      AppState.isLoading = false;
    }, 300);
  }
  
  function updateDashboard(data) {
    // Update balance
    document.getElementById('balance-value').textContent = formatCurrency(data.balance);
    document.getElementById('balance-timestamp').textContent = new Date().toLocaleTimeString();
    
    // Update summary
    document.getElementById('month-deposits').textContent = formatCurrency(data.monthDeposits);
    document.getElementById('month-withdrawals').textContent = formatCurrency(data.monthWithdrawals);
    
    // Update loan info if applicable
    if (data.loanOutstanding > 0) {
      document.getElementById('loan-summary-card').style.display = 'block';
      document.getElementById('loan-outstanding').textContent = formatCurrency(data.loanOutstanding);
      document.getElementById('next-payment').textContent = formatCurrency(data.nextPayment);
      document.getElementById('payment-due-date').textContent = formatDate(data.dueDate);
    }
    
    // Update recent transactions
    const transactionsList = document.getElementById('recent-transactions-list');
    if (data.recentTransactions && data.recentTransactions.length > 0) {
      transactionsList.innerHTML = '';
      data.recentTransactions.forEach(function(trans) {
        transactionsList.appendChild(createTransactionCard(trans));
      });
    }
  }
  
  // ========== DEPOSIT ==========
  function prepareDepositForm() {
    const form = document.getElementById('deposit-form');
    if (form) {
      form.reset();
    }
  }
  
  function handleDeposit(event) {
    event.preventDefault();
    
    const form = event.target;
    const amount = form.querySelector('[name="amount"]').value;
    const reference = form.querySelector('[name="reference"]').value;
    
    if (!amount || parseFloat(amount) <= 0) {
      showToast(t('invalidAmount', AppState.currentLanguage), 'error');
      return;
    }
    
    // Disable submit button to prevent double submission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = t('processing', AppState.currentLanguage);
    
    // Generate request ID for idempotency
    const requestId = generateRequestId();
    AppState.lastRequestId = requestId;
    
    // Call backend API
    // In production: google.script.run.withSuccessHandler(...).processDeposit({...})
    setTimeout(function() {
      // Mock success response
      const response = {
        success: true,
        transactionId: 'TXN-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-001',
        amount: parseFloat(amount),
        newBalance: 12500.00 + parseFloat(amount),
        message: t('depositSuccess', AppState.currentLanguage)
      };
      
      if (response.success) {
        showSuccessModal({
          transactionId: response.transactionId,
          amount: formatCurrency(response.amount),
          newBalance: formatCurrency(response.newBalance),
          message: response.message
        });
        form.reset();
        navigateTo('home');
      } else {
        showErrorModal(response.error || t('transactionFailed', AppState.currentLanguage));
      }
      
      submitBtn.disabled = false;
      submitBtn.textContent = t('confirm', AppState.currentLanguage);
    }, 1000);
  }
  
  // ========== WITHDRAWAL ==========
  function prepareWithdrawForm() {
    const form = document.getElementById('withdraw-form');
    if (form) {
      form.reset();
    }
    document.getElementById('withdraw-preview').style.display = 'none';
  }
  
  function updateWithdrawPreview(event) {
    const form = event.target;
    const amountInput = form.querySelector('[name="amount"]');
    const amount = parseFloat(amountInput.value) || 0;
    
    if (amount > 0) {
      const currentBalance = 12500.00; // Would come from AppState.accountInfo
      const newBalance = currentBalance - amount;
      
      document.getElementById('preview-amount').textContent = formatCurrency(amount);
      document.getElementById('preview-balance').textContent = formatCurrency(currentBalance);
      document.getElementById('preview-new-balance').textContent = formatCurrency(newBalance);
      
      document.getElementById('withdraw-preview').style.display = 'block';
    } else {
      document.getElementById('withdraw-preview').style.display = 'none';
    }
  }
  
  function handleWithdrawal(event) {
    event.preventDefault();
    
    const form = event.target;
    const amount = form.querySelector('[name="amount"]').value;
    const reference = form.querySelector('[name="reference"]').value;
    
    if (!amount || parseFloat(amount) <= 0) {
      showToast(t('invalidAmount', AppState.currentLanguage), 'error');
      return;
    }
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = t('processing', AppState.currentLanguage);
    
    // Generate request ID for idempotency
    const requestId = generateRequestId();
    AppState.lastRequestId = requestId;
    
    // Call backend API
    setTimeout(function() {
      // Mock response
      const response = {
        success: true,
        transactionId: 'TXN-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-002',
        amount: parseFloat(amount),
        newBalance: 12500.00 - parseFloat(amount),
        requiresApproval: false,
        message: t('withdrawSuccess', AppState.currentLanguage)
      };
      
      if (response.success) {
        showSuccessModal({
          transactionId: response.transactionId,
          amount: formatCurrency(response.amount),
          newBalance: formatCurrency(response.newBalance),
          message: response.message
        });
        form.reset();
        navigateTo('home');
      } else {
        showErrorModal(response.error || t('transactionFailed', AppState.currentLanguage));
      }
      
      submitBtn.disabled = false;
      submitBtn.textContent = t('confirm', AppState.currentLanguage);
    }, 1000);
  }
  
  // ========== LEDGER ==========
  function loadLedger() {
    const ledgerList = document.getElementById('ledger-list');
    ledgerList.innerHTML = '<div class="loading-state" data-t="loading">Loading...</div>';
    
    // Call backend API
    setTimeout(function() {
      // Mock data
      const transactions = [
        { id: 'TXN-20260917-001', type: 'DEPOSIT', amount: 500.00, date: '2026-09-17', status: 'COMPLETED', description: 'Deposit received' },
        { id: 'TXN-20260916-002', type: 'WITHDRAWAL', amount: 200.00, date: '2026-09-16', status: 'COMPLETED', description: 'Withdrawal' },
        { id: 'TXN-20260915-003', type: 'DEPOSIT', amount: 1000.00, date: '2026-09-15', status: 'COMPLETED', description: 'Deposit received' },
        { id: 'TXN-20260914-004', type: 'WITHDRAWAL', amount: 150.00, date: '2026-09-14', status: 'COMPLETED', description: 'Withdrawal' },
        { id: 'TXN-20260913-005', type: 'DEPOSIT', amount: 750.00, date: '2026-09-13', status: 'COMPLETED', description: 'Deposit received' }
      ];
      
      ledgerList.innerHTML = '';
      transactions.forEach(function(trans) {
        ledgerList.appendChild(createTransactionCard(trans));
      });
    }, 500);
  }
  
  function createTransactionCard(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    
    const isPositive = transaction.type === 'DEPOSIT' || transaction.type === 'INTEREST_CREDIT';
    const amountClass = isPositive ? 'positive' : 'negative';
    const sign = isPositive ? '+' : '-';
    
    const translatedType = t(transaction.type.toLowerCase() || 'transaction', AppState.currentLanguage);
    
    div.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-type">${translatedType}</div>
        <div class="transaction-date">${formatDate(transaction.date)}</div>
      </div>
      <div class="transaction-amount ${amountClass}">${sign}${formatCurrency(transaction.amount)}</div>
    `;
    
    div.addEventListener('click', function() {
      showTransactionDetails(transaction);
    });
    
    return div;
  }
  
  function showTransactionDetails(transaction) {
    // Show transaction details in a modal
    const details = {
      transactionId: transaction.id,
      date: formatDate(transaction.date),
      type: t(transaction.type.toLowerCase() || 'transaction', AppState.currentLanguage),
      amount: formatCurrency(transaction.amount),
      description: transaction.description || '',
      status: t(transaction.status.toLowerCase() || 'pending', AppState.currentLanguage)
    };
    
    showSuccessModal(details);
  }
  
  // ========== LOAN ==========
  function loadLoanInfo() {
    // Mock loan data
    const loanData = {
      outstanding: 4250.00,
      principal: 5000.00,
      interest: 750.00,
      paid: 1750.00,
      nextAmount: 450.00,
      nextDue: '2026-10-05'
    };
    
    document.getElementById('loan-main-amount').textContent = formatCurrency(loanData.outstanding);
    document.getElementById('loan-principal').textContent = formatCurrency(loanData.principal);
    document.getElementById('loan-interest').textContent = formatCurrency(loanData.interest);
    document.getElementById('loan-paid').textContent = formatCurrency(loanData.paid);
    document.getElementById('loan-next-amount').textContent = formatCurrency(loanData.nextAmount);
    document.getElementById('loan-next-due').textContent = formatDate(loanData.nextDue);
  }
  
  // ========== PROFILE ==========
  function loadProfile() {
    // Mock profile data
    const profileData = {
      name: 'John Doe',
      memberId: 'MEM-001234',
      phone: '+971 50 123 4567',
      email: 'john.doe@example.com',
      language: 'English',
      registered: '2025-01-15'
    };
    
    document.getElementById('profile-name').textContent = profileData.name;
    document.getElementById('profile-id').textContent = profileData.memberId;
    document.getElementById('profile-phone').textContent = profileData.phone;
    document.getElementById('profile-email').textContent = profileData.email;
    document.getElementById('profile-language').textContent = profileData.language;
    document.getElementById('profile-registered').textContent = formatDate(profileData.registered);
  }
  
  // ========== UTILITIES ==========
  function formatCurrency(amount) {
    return 'AED ' + Number(amount).toFixed(2);
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString(AppState.currentLanguage === 'ne' ? 'ne-NP' : 'en-AE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  function generateRequestId() {
    return 'REQ-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  
  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'error') {
      toast.style.backgroundColor = 'var(--error-color)';
    } else if (type === 'success') {
      toast.style.backgroundColor = 'var(--success-color)';
    } else {
      toast.style.backgroundColor = 'var(--text-primary)';
    }
    
    setTimeout(function() {
      toast.classList.remove('show');
    }, 3000);
  }
  
  function showErrorModal(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').style.display = 'flex';
  }
  
  function closeErrorModal() {
    document.getElementById('error-modal').style.display = 'none';
  }
  
  function showSuccessModal(details) {
    const detailsDiv = document.getElementById('success-details');
    
    if (typeof details === 'string') {
      detailsDiv.innerHTML = '<p>' + details + '</p>';
    } else {
      let html = '<div class="transaction-preview">';
      for (const key in details) {
        if (details.hasOwnProperty(key)) {
          const label = t(key, AppState.currentLanguage) || key;
          html += '<div class="preview-row"><span>' + label + '</span><strong>' + details[key] + '</strong></div>';
        }
      }
      html += '</div>';
      detailsDiv.innerHTML = html;
    }
    
    document.getElementById('success-modal').style.display = 'flex';
  }
  
  function closeSuccessModal() {
    document.getElementById('success-modal').style.display = 'none';
  }
  
  // Expose functions globally for inline handlers
  window.closeErrorModal = closeErrorModal;
  window.closeSuccessModal = closeSuccessModal;
  
})();
