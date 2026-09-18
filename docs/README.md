# Sahridayata Savings Application

## Overview

Sahridayata Savings is a mobile-first financial application built for Google Apps Script and Google Sheets. It provides members with savings management, deposit/withdrawal capabilities, loan tracking, and transaction history - all optimized for smartphones and low-bandwidth networks.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (HTML/CSS/JS)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   index.html│  │  main.css   │  │      app.js         │  │
│  │  (Mobile-   │  │ (Mobile-    │  │  (SPA Navigation,   │  │
│  │   first UI) │  │   first     │  │   API calls,        │  │
│  │             │  │   styles)   │  │   Translations)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   CONFIGURATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │  appConfig  │  │translations │                           │
│  │     .js     │  │     .js     │                           │
│  │  (Sheets,   │  │  (EN/NE     │                           │
│  │   Sheets,   │  │   bilingual │                           │
│  │   Roles)    │  │   dict)     │                           │
│  └─────────────┘  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Google Apps Script)              │
│  ┌─────────────┐  ┌─────────────────────┐                   │
│  │   utils.js  │  │ transactionEngine.js│                   │
│  │  (Logging,  │  │  (processDeposit,   │                   │
│  │   Locks,    │  │   processWithdrawal,│                   │
│  │   Validation│  │   approveWithdrawal,│                   │
│  │   Helpers)  │  │   getMemberLedger)  │                   │
│  └─────────────┘  └─────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      GOOGLE SHEETS                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ Members  │ │ Accounts │ │ Transactions │ │ AuditLog   │  │
│  └──────────┘ └──────────┘ └──────────────┘ └────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐                 │
│  │  Loans   │ │LoanPaymts│ │    Config    │                 │
│  └──────────┘ └──────────┘ └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
/workspace/
├── config/
│   ├── appConfig.js       # Application configuration, sheet names, constraints
│   └── translations.js    # English/Nepali translation dictionary
├── backend/
│   ├── utils.js           # Server utilities, validation, logging, security
│   └── transactionEngine.js # Core financial transaction processing
├── frontend/
│   ├── index.html         # Main HTML (mobile-first SPA)
│   ├── css/
│   │   └── main.css       # Mobile-first responsive styles
│   └── js/
│       └── app.js         # Frontend application logic
├── docs/
│   └── README.md          # This file
└── Readme.md              # Project root readme
```

## Google Sheets Setup

### Required Sheets

Create a Google Sheet with the following sheets (exact names):

1. **Members** - Member information
   - Columns: memberId, name, phone, email, role, status, registeredDate, language

2. **Accounts** - Member savings accounts
   - Columns: accountId, memberId, savingsBalance, status, openedDate, lastUpdated

3. **Transactions** - All financial transactions
   - Columns: transactionId, requestId, accountId, type, amount, balanceAfter, timestamp, status, description, reference

4. **Loans** - Loan records
   - Columns: loanId, memberId, principal, outstanding, interestRate, status, issuedDate, dueDate, nextPaymentAmount, nextPaymentDate

5. **LoanPayments** - Loan payment history
   - Columns: paymentId, loanId, accountId, amount, principalPortion, interestPortion, date, transactionId

6. **AuditLog** - Security and audit trail
   - Columns: auditId, transactionId, action, actor, actorRole, timestamp, details, ipAddress

7. **Config** - System configuration key-value pairs
   - Columns: key, value, updatedDate

### Initial Setup Steps

1. Create a new Google Sheet
2. Rename the default sheet to "Members"
3. Add header row: `memberId | name | phone | email | role | status | registeredDate | language`
4. Create additional sheets: Accounts, Transactions, Loans, LoanPayments, AuditLog, Config
5. Add appropriate headers to each sheet
6. Copy your Spreadsheet ID from the URL
7. Update `CONFIG.SPREADSHEET_ID` in `/config/appConfig.js`

## Deployment Instructions

### Step 1: Configure Backend

1. Open Google Apps Script editor (Extensions → Apps Script)
2. Copy contents of:
   - `/config/appConfig.js`
   - `/config/translations.js`
   - `/backend/utils.js`
   - `/backend/transactionEngine.js`
3. Paste into separate `.gs` files in the Apps Script editor
4. Update `SPREADSHEET_ID` in appConfig.js with your actual Sheet ID

### Step 2: Deploy as Web App

1. In Apps Script editor, click **Deploy → New deployment**
2. Select type: **Web app**
3. Set **Execute as**: Me (your email)
4. Set **Who has access**: Anyone with link (or appropriate restriction)
5. Click **Deploy**
6. Copy the web app URL

### Step 3: Host Frontend

The frontend can be hosted in several ways:

**Option A: Google Sites**
- Upload index.html, css/main.css, js/app.js to Google Sites
- Update script paths to match your hosting

**Option B: Static Hosting (Netlify, Vercel, GitHub Pages)**
- Push files to repository
- Deploy to static hosting service
- Update API endpoints in app.js to call your Apps Script web app URL

**Option C: Blogger (as mentioned in requirements)**
- Create a new page in Blogger
- Switch to HTML view
- Paste the entire index.html content
- Upload CSS and JS as external resources or inline

### Step 4: Connect Frontend to Backend

In `/frontend/js/app.js`, replace mock API calls with actual Apps Script calls:

```javascript
// Replace mock setTimeout calls with:
google.script.run
  .withSuccessHandler(function(response) {
    // Handle success
  })
  .withFailureHandler(function(error) {
    // Handle error
  })
  .processDeposit({
    memberId: AppState.memberId,
    amount: amount,
    reference: reference,
    requestId: requestId
  });
```

### Step 5: Test

1. Test on small Android phone (primary target)
2. Test on slow/unstable network
3. Test duplicate submissions
4. Test English and Nepali language switching
5. Test unauthorized access attempts
6. Test all financial transactions

## Security Features

### Implemented

1. **Server-Authoritative Processing**
   - All financial operations processed on backend
   - Frontend never directly modifies Google Sheets
   - Balances, approvals, and validations done server-side

2. **Idempotency Protection**
   - Request IDs prevent duplicate transactions
   - Cache-based duplicate detection
   - Database-level request tracking

3. **Authentication & Authorization**
   - Member validation before any operation
   - Role-based access control
   - Session timeout enforcement

4. **Concurrent Operation Prevention**
   - LockService prevents race conditions
   - Balance re-check after lock acquisition
   - Atomic updates to accounts and transactions

5. **Input Validation**
   - Amount validation using integer arithmetic
   - Range checking (min/max amounts)
   - Input sanitization and escaping

6. **Audit Trail**
   - All operations logged to AuditLog sheet
   - Transaction IDs for traceability
   - Request IDs for debugging

7. **Error Handling**
   - Technical errors logged server-side only
   - User-facing messages are safe and translated
   - Request IDs included in error messages

### Not Yet Implemented (Requires Additional Integration)

1. Two-factor authentication for admin users
2. IP-based rate limiting
3. Encrypted data at rest (beyond Google's encryption)
4. SMS/Email notifications
5. Session management beyond basic timeout

## Mobile-First Design Principles

### Implemented

1. **Touch-Friendly Interface**
   - Minimum 44px touch targets
   - Large buttons and form inputs
   - No hover-only interactions

2. **Responsive Layout**
   - Mobile-first CSS breakpoints
   - Bottom navigation for phones
   - Card-based transaction display

3. **Low-Bandwidth Optimization**
   - Minimal JavaScript payload
   - CSS variables for theming
   - Browser caching with version busting

4. **Accessibility**
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation support
   - Focus indicators
   - Reduced motion support

5. **Bilingual Support**
   - Centralized translation dictionary
   - English and Nepali throughout
   - Language preference saved locally

## Financial Processing Flow

Every financial transaction follows this sequence:

```
1. Authentication → Validate member identity
2. Authorization → Check role permissions
3. Idempotency Check → Prevent duplicate requests
4. Validation → Verify amount format and range
5. Business Rules → Apply withdrawal limits, approval thresholds
6. Transaction Validation → Verify sufficient balance
7. Acquire Lock → Prevent concurrent modifications
8. Re-validate → Confirm state hasn't changed
9. Transaction Engine → Generate transaction record
10. Accounting → Update account balance
11. Audit → Log the operation
12. Release Lock → Allow other operations
13. Invalidate Cache → Force fresh data on next read
14. Return Response → Success or error to user
```

## Testing Checklist

### Mobile Testing
- [ ] Small Android phone layout (< 375px width)
- [ ] One-handed operation feasibility
- [ ] Touch target sizes (minimum 44px)
- [ ] Numeric keyboard for amount inputs
- [ ] No horizontal scrolling on main screens

### Network Testing
- [ ] Slow 3G connection behavior
- [ ] Unstable network recovery
- [ ] Timeout handling
- [ ] Offline state indication

### Financial Testing
- [ ] Duplicate deposit prevention
- [ ] Duplicate withdrawal prevention
- [ ] Insufficient balance rejection
- [ ] Approval workflow for large withdrawals
- [ ] Concurrent transaction handling
- [ ] Balance accuracy after multiple operations

### Security Testing
- [ ] Unauthorized member access rejection
- [ ] Role-based permission enforcement
- [ ] Input validation bypass attempts
- [ ] Request ID manipulation
- [ ] Session timeout behavior

### Bilingual Testing
- [ ] English labels throughout
- [ ] Nepali labels throughout
- [ ] Language toggle functionality
- [ ] Language preference persistence
- [ ] Error messages in both languages

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Focus visibility
- [ ] Color contrast
- [ ] Text scaling

## Configuration Options

Edit `/config/appConfig.js` to customize:

```javascript
CONFIG.CONSTRAINTS = {
  MIN_SAVINGS_BALANCE: 0,        // Minimum balance after withdrawal
  MAX_WITHDRAWAL_AMOUNT: 100000, // Maximum single withdrawal
  MIN_DEPOSIT_AMOUNT: 1,         // Minimum deposit
  DECIMAL_PLACES: 2,             // Decimal precision
  LOCK_TIMEOUT_MS: 30000         // Lock timeout
};

CACHE_CONFIG = {
  ENABLED: true,
  DASHBOARD_TTL_SECONDS: 300,    // 5 minutes
  BALANCE_TTL_SECONDS: 60,       // 1 minute
  LEDGER_TTL_SECONDS: 300        // 5 minutes
};
```

## Known Limitations

1. **Google Apps Script Quotas**
   - 6-minute execution timeout
   - Daily quota limits
   - Concurrent execution limits

2. **Google Sheets Limitations**
   - Not a real database
   - Row limits (~10 million cells per sheet)
   - Read/write speed constraints

3. **Frontend Limitations**
   - No true offline mode (requires service worker integration)
   - Limited push notification support in Google environment
   - PWA installation depends on hosting platform

## Future Enhancements

1. **Additional Transaction Types**
   - Loan disbursement
   - Loan repayment processing
   - Interest calculation and posting
   - Fee assessments

2. **Staff Interfaces**
   - Accountant dashboard
   - Admin approval queue
   - Reconciliation tools
   - Report generation

3. **Notifications**
   - Email notifications (bilingual)
   - SMS reminders (requires gateway)
   - Push notifications (requires Firebase)

4. **Advanced Features**
   - Recurring deposits
   - Fixed deposits
   - Investment tracking
   - Profit distribution

## Support and Maintenance

### Logging

All technical errors are logged via `logTechnicalError()` function. Check:
- Apps Script execution logs
- AuditLog sheet for security events
- Error patterns in transaction failures

### Backup

Regularly backup your Google Sheet:
1. File → Make a copy
2. File → Download → Excel (.xlsx)
3. Use Google Drive version history

### Updates

When updating the application:
1. Backup all data first
2. Test changes in a copy of the Sheet
3. Update version number in appConfig.js
4. Document any schema changes
5. Communicate changes to users

## License and Credits

This application is built for Sahridayata Savings cooperative.
All financial business rules should be validated against actual cooperative policies before production use.

---

**Important Disclaimer**: This is a financial application. Before deploying to production:
1. Review all business rules with accounting staff
2. Test thoroughly with sample data
3. Implement proper access controls
4. Establish backup and recovery procedures
5. Consider legal and regulatory compliance requirements
