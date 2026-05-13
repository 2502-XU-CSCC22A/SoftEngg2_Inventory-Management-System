# Transaction Status Enhancement Execution Plan

## 1. Objective

Enhance the existing Sales Page and transaction system by adding transaction status support without disrupting unrelated functions.

This enhancement should allow transactions to be categorized as:

- `pending`
- `completed`
- `cancelled`

The goal is to support pending and completed transaction workflows while preserving the current sales, inventory, edit, voiding, and analytics behavior as much as possible.

This is an enhancement, not a full overhaul.

---

## 2. Current System Behavior

Based on the audit, the current system works like this:

1. The Sales Page title currently uses the text **"Sold Transactions"**.
2. All transactions are displayed in one table.
3. Transactions currently do not have a dedicated `status` field.
4. The system assumes every created transaction is automatically finalized.
5. When a transaction is created through `insertTransaction`, inventory is immediately deducted.
6. The current edit flow uses `voided_at` and `reason_for_edit` as part of its audit/voiding strategy.
7. Existing transactions should be treated as completed because the old system already treated them as finalized sales.

---

## 3. Enhancement Scope

### Included in this enhancement

This enhancement should update only the following areas:

- Transactions database schema
- Transaction model
- Transaction creation logic
- Transaction status update logic
- Sales Page table display
- Transaction detail modal
- Transaction filtering
- Inventory restoration when pending transactions are cancelled
- Dashboard and analytics filtering for completed transactions only

### Not included in this enhancement

Do not overhaul or rewrite:

- The entire sales module
- Existing product management logic
- Existing edit/void transaction behavior
- Existing receipt logic unless status display is required
- Existing inventory logic unless directly related to pending/cancelled status
- Existing analytics structure beyond filtering completed transactions
- Existing authentication or role system

---

## 4. Recommended Naming Update

Rename the Sales Page title from:

```text
Sold Transactions
```

To:

```text
Sales Transactions
```

Reason:

The phrase **"Sold Transactions"** implies that all records are already completed sales. Since the system will now support pending and cancelled transactions, the label should be broader and clearer.

---

## 5. Status Values

Use a simple status enum.

```text
pending
completed
cancelled
```

### Status Definitions

#### pending

A transaction has been created but is not yet finalized.

Inventory is already deducted/reserved.

Pending transactions should not count as realized revenue.

#### completed

A transaction is finalized.

Completed transactions count as sales and revenue.

Inventory should not be deducted again when a pending transaction becomes completed.

#### cancelled

A pending transaction has been cancelled.

Inventory should be restored once.

Cancelled transactions should not count as sales or revenue.

Cancelled transactions should remain visible for recordkeeping.

---

## 6. Recommended Status Lifecycle

Use this simple lifecycle for the first version:

```text
pending → completed
pending → cancelled
completed → locked
cancelled → locked
```

### Allowed transitions

| From | To | Allowed | Notes |
|---|---|---|---|
| pending | completed | Yes | Finalizes the transaction |
| pending | cancelled | Yes | Restores inventory |
| completed | pending | No | Avoid disrupting finalized sales |
| completed | cancelled | No for V1 | Handle refunds/cancellations later |
| cancelled | pending | No | Avoid restoring/reusing cancelled orders |
| cancelled | completed | No | Cancelled transactions are final |

---

## 7. Important Business Rules

### Rule 1: Existing behavior must remain stable

The existing direct sale flow should continue to work.

If the current transaction creation flow is meant for immediate sales, keep it as completed by default unless the user explicitly chooses pending.

Recommended creation behavior:

```text
Normal sale flow → completed
Optional save-as-pending flow → pending
```

This avoids breaking the current sales workflow.

---

### Rule 2: Inventory is deducted only once

Current system already deducts inventory when a transaction is created.

Do not deduct inventory again when status changes from pending to completed.

Correct behavior:

```text
Create pending transaction
→ deduct inventory once

Pending → Completed
→ update status only
→ do not deduct inventory again
```

---

### Rule 3: Cancelled pending transactions restore inventory

When a pending transaction is cancelled:

```text
Pending → Cancelled
→ restore inventory once
```

Make sure inventory restoration cannot run multiple times for the same transaction.

---

### Rule 4: Completed transactions should be locked

For version 1, completed transactions should not be cancellable through the normal flow.

Reason:

Cancelling completed transactions may affect:

- Revenue reports
- Inventory
- Receipts
- Payment records
- Audit logs
- Refund logic

This should be handled as a separate future enhancement.

---

### Rule 5: Analytics should count completed transactions only

Revenue, sales count, and dashboard metrics should only include:

```text
status = 'completed'
```

Pending and cancelled transactions should be excluded from realized revenue.

---

## 8. Database Implementation

### Add `status` column to `transactions`

Add a new column:

```sql
status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'completed'
```

Recommended default:

```text
completed
```

Reason:

The current system already treats created transactions as finalized sales. Setting the default to `completed` reduces the chance of accidentally changing existing behavior.

---

## 9. Migration Plan

### Step 1: Add the status column

Create a Sequelize migration to add the `status` column to the `transactions` table.

Example migration logic:

```js
await queryInterface.addColumn('transactions', 'status', {
  type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
  allowNull: false,
  defaultValue: 'completed',
});
```

---

### Step 2: Migrate existing active transactions

Existing active transactions should become completed.

```sql
UPDATE transactions
SET status = 'completed'
WHERE status IS NULL;
```

If the database column is added with `NOT NULL DEFAULT 'completed'`, this may already be handled automatically.

---

### Step 3: Do not reinterpret old voided transactions yet

Do not automatically convert old `voided_at` records to `cancelled`.

Reason:

`voided_at` currently appears to support the edit/audit strategy. A voided transaction is not necessarily the same as a cancelled pending transaction.

Keep the existing `voided_at` behavior unchanged.

---

## 10. Backend Implementation Plan

### 10.1 Update Transaction Model

Add `status` to the transaction model.

Example:

```js
status: {
  type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
  allowNull: false,
  defaultValue: 'completed',
}
```

---

### 10.2 Update Transaction Creation Logic

When creating a transaction, allow an optional `status`.

Accepted values:

```text
pending
completed
```

Do not allow creating a transaction directly as `cancelled`.

Recommended behavior:

```js
const status = req.body.status || 'completed';
```

Validation:

```js
if (!['pending', 'completed'].includes(status)) {
  return res.status(400).json({
    message: 'Invalid transaction status during creation.'
  });
}
```

Inventory deduction should remain the same on creation.

Meaning:

```text
pending creation → deduct/reserve inventory
completed creation → deduct inventory as normal
```

This preserves existing behavior.

---

### 10.3 Add Status Update Endpoint

Add a dedicated endpoint:

```http
PATCH /transactions/:id/status
```

Request body:

```json
{
  "status": "completed"
}
```

or:

```json
{
  "status": "cancelled"
}
```

---

### 10.4 Status Update Rules

The endpoint should enforce strict transitions.

Pseudo logic:

```js
if (transaction.status === 'pending' && newStatus === 'completed') {
  // update status only
}

if (transaction.status === 'pending' && newStatus === 'cancelled') {
  // restore inventory
  // update status to cancelled
}

if (transaction.status === 'completed') {
  // reject status changes in V1
}

if (transaction.status === 'cancelled') {
  // reject status changes
}
```

---

### 10.5 Inventory Logic for Status Update

#### Pending to completed

```text
No inventory change
```

Reason:

Inventory was already deducted/reserved when the pending transaction was created.

#### Pending to cancelled

```text
Restore inventory
```

Example:

```js
for (const item of transaction.items) {
  await Product.increment(
    { quantity: item.quantity },
    { where: { id: item.product_id }, transaction: sequelizeTransaction }
  );
}
```

#### Completed to cancelled

Do not allow this in V1.

Return:

```json
{
  "message": "Completed transactions cannot be cancelled in this version."
}
```

---

### 10.6 Use Sequelize Transaction for Status Updates

When cancelling a pending transaction, use a database transaction to keep inventory and transaction status consistent.

Example flow:

```text
Start DB transaction
→ Find transaction
→ Validate status transition
→ Restore inventory if cancelling
→ Update transaction status
→ Commit DB transaction
```

If anything fails:

```text
Rollback DB transaction
```

---

## 11. API Filtering

Update transaction list endpoint to accept status filtering.

Example:

```http
GET /transactions?status=pending
GET /transactions?status=completed
GET /transactions?status=cancelled
GET /transactions?status=all
```

Backend logic:

```js
if (status && status !== 'all') {
  where.status = status;
}
```

Validate the status query:

```js
const allowedStatuses = ['pending', 'completed', 'cancelled', 'all'];

if (status && !allowedStatuses.includes(status)) {
  return res.status(400).json({
    message: 'Invalid status filter.'
  });
}
```

---

## 12. Analytics and Dashboard Updates

Update sales analytics and dashboard queries so they only count completed transactions.

### Revenue query

Use:

```sql
WHERE status = 'completed'
```

### Sales count query

Use:

```sql
WHERE status = 'completed'
```

### Product sold count

Use:

```sql
WHERE transactions.status = 'completed'
```

### Pending and cancelled should not count as revenue

Pending transactions are reserved but not finalized.

Cancelled transactions are not sales.

---

## 13. Frontend Implementation Plan

### 13.1 Update Sales Page Title

Change:

```text
Sold Transactions
```

To:

```text
Sales Transactions
```

---

### 13.2 Add Status Column

Add a new column to the transaction table:

```text
Status
```

Each row should show a badge.

Example:

```jsx
<StatusBadge status={transaction.status} />
```

---

### 13.3 Create Status Badge Component

Create a reusable component.

Example:

```jsx
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const labels = {
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.completed}`}>
      {labels[status] || 'Completed'}
    </span>
  );
};
```

---

### 13.4 Add Status Filter

Add a dropdown beside the existing month/year filters.

Options:

```text
All
Pending
Completed
Cancelled
```

Frontend state:

```js
const [statusFilter, setStatusFilter] = useState('all');
```

When fetching transactions:

```js
fetchTransactions({
  year,
  month,
  status: statusFilter,
});
```

---

### 13.5 Update Transaction Actions

For pending transactions, show:

```text
Mark as Completed
Cancel Order
View
```

For completed transactions, show:

```text
View
Edit
```

For cancelled transactions, show:

```text
View
```

Disable edit for cancelled transactions.

Recommended action logic:

```jsx
{transaction.status === 'pending' && (
  <>
    <button onClick={() => markAsCompleted(transaction.id)}>
      Mark as Completed
    </button>

    <button onClick={() => openCancelModal(transaction)}>
      Cancel Order
    </button>
  </>
)}

{transaction.status === 'completed' && (
  <>
    <button onClick={() => viewTransaction(transaction)}>
      View
    </button>

    <button onClick={() => editTransaction(transaction)}>
      Edit
    </button>
  </>
)}

{transaction.status === 'cancelled' && (
  <button onClick={() => viewTransaction(transaction)}>
    View
  </button>
)}
```

---

### 13.6 Add Confirmation Modal for Cancel

Before cancelling a pending transaction, show confirmation.

Modal message:

```text
Are you sure you want to cancel this pending transaction?

This action will restore the reserved inventory and mark the transaction as cancelled. This cannot be undone.
```

Buttons:

```text
Cancel
Confirm Cancellation
```

---

### 13.7 Add Confirmation Modal for Complete

Before completing a pending transaction, show confirmation.

Modal message:

```text
Mark this transaction as completed?

This will finalize the transaction and include it in sales reports and revenue analytics.
```

Buttons:

```text
Cancel
Mark as Completed
```

---

### 13.8 Update Transaction Detail Modal

Show the status badge in the modal header.

Example:

```text
Transaction #0001    [Pending]
```

For pending transactions, show quick actions:

```text
Mark as Completed
Cancel Order
```

For cancelled transactions, show a note:

```text
This transaction was cancelled and is not included in sales revenue.
```

For completed transactions, show:

```text
This transaction is completed and included in sales reports.
```

---

## 14. Add Transaction Creation Status Option

If the Add Sales page currently always creates a completed sale, keep that as default.

Add an optional selector or button.

Recommended UX:

```text
Complete Sale
Save as Pending
```

### Option 1: Two submit buttons

```text
[Save as Pending] [Complete Sale]
```

This is clearer for users.

Behavior:

```text
Save as Pending → creates transaction with status = pending
Complete Sale → creates transaction with status = completed
```

### Option 2: Status dropdown

```text
Transaction Status:
- Completed
- Pending
```

For simplicity and clarity, use **two submit buttons**.

---

## 15. Empty States

When no transactions match the selected filter, show:

```text
No transactions found for this status.
```

Examples:

```text
No pending transactions found.
No completed transactions found.
No cancelled transactions found.
```

---

## 16. Error Handling

### Invalid status

```json
{
  "message": "Invalid transaction status."
}
```

### Invalid transition

```json
{
  "message": "This transaction status cannot be changed."
}
```

### Already completed

```json
{
  "message": "This transaction is already completed."
}
```

### Already cancelled

```json
{
  "message": "This transaction is already cancelled."
}
```

### Inventory restoration failed

```json
{
  "message": "Unable to restore inventory. Transaction cancellation was not completed."
}
```

---

## 17. QA Checklist

### Database

- [ ] `status` column exists in `transactions`
- [ ] Default status is `completed`
- [ ] Existing transactions are marked as `completed`
- [ ] `voided_at` behavior is not broken
- [ ] No unrelated table was modified

---

### Backend

- [ ] Transaction creation supports `pending`
- [ ] Transaction creation supports `completed`
- [ ] Transaction creation does not allow direct `cancelled`
- [ ] Pending transaction deducts inventory once
- [ ] Completed transaction deducts inventory once
- [ ] Pending to completed does not deduct inventory again
- [ ] Pending to cancelled restores inventory once
- [ ] Completed to cancelled is blocked
- [ ] Cancelled to completed is blocked
- [ ] Cancelled to pending is blocked
- [ ] Status update uses database transaction
- [ ] Invalid status returns error
- [ ] Invalid transition returns error

---

### Frontend

- [ ] Sales Page title changed to `Sales Transactions`
- [ ] Status column is visible
- [ ] Status badges display correctly
- [ ] Status filter works
- [ ] Pending transactions show `Mark as Completed`
- [ ] Pending transactions show `Cancel Order`
- [ ] Completed transactions show existing normal actions
- [ ] Cancelled transactions disable edit
- [ ] Detail modal shows status
- [ ] Empty state displays properly
- [ ] Mobile view still shows the status badge clearly

---

### Analytics

- [ ] Pending transactions do not count as revenue
- [ ] Cancelled transactions do not count as revenue
- [ ] Completed transactions count as revenue
- [ ] Dashboard sales count only uses completed transactions
- [ ] Monthly/yearly reports only count completed transactions
- [ ] Product sold reports only count completed transactions

---

### Inventory

- [ ] Creating pending transaction reduces product quantity
- [ ] Completing pending transaction does not reduce product quantity again
- [ ] Cancelling pending transaction restores product quantity
- [ ] Cancelling same transaction twice is not allowed
- [ ] Completed transactions cannot accidentally restore inventory
- [ ] Cancelled transactions cannot be edited into active sales

---

## 18. Testing Scenarios

### Scenario 1: Create completed transaction

Steps:

1. Create a new transaction using normal sale flow.
2. Select `Complete Sale`.
3. Check transaction list.
4. Check inventory.
5. Check dashboard revenue.

Expected result:

```text
Transaction status is completed.
Inventory is deducted.
Revenue increases.
Transaction appears in completed filter.
```

---

### Scenario 2: Create pending transaction

Steps:

1. Create a new transaction.
2. Select `Save as Pending`.
3. Check transaction list.
4. Check inventory.
5. Check dashboard revenue.

Expected result:

```text
Transaction status is pending.
Inventory is deducted/reserved.
Revenue does not increase.
Transaction appears in pending filter.
```

---

### Scenario 3: Complete pending transaction

Steps:

1. Open a pending transaction.
2. Click `Mark as Completed`.
3. Confirm action.
4. Check inventory.
5. Check dashboard revenue.

Expected result:

```text
Transaction status changes to completed.
Inventory does not deduct again.
Revenue increases.
Transaction appears in completed filter.
```

---

### Scenario 4: Cancel pending transaction

Steps:

1. Open a pending transaction.
2. Click `Cancel Order`.
3. Confirm cancellation.
4. Check inventory.
5. Check dashboard revenue.

Expected result:

```text
Transaction status changes to cancelled.
Inventory is restored.
Revenue does not increase.
Transaction appears in cancelled filter.
```

---

### Scenario 5: Try to cancel completed transaction

Steps:

1. Open a completed transaction.
2. Try to cancel it.

Expected result:

```text
Cancel action is not available.
Backend also blocks the request if manually called.
No inventory change occurs.
No revenue change occurs.
```

---

### Scenario 6: Try to complete cancelled transaction

Steps:

1. Open a cancelled transaction.
2. Try to complete it manually or through API.

Expected result:

```text
Action is blocked.
Transaction remains cancelled.
Inventory does not change.
Revenue does not change.
```

---

## 19. Developer Notes

This enhancement must be implemented carefully because transaction status affects inventory and analytics.

The most important protection is to avoid double inventory deduction.

Correct inventory behavior:

```text
Create pending → deduct once
Pending to completed → no deduction
Pending to cancelled → restore once
```

Do not treat status updates like new transactions.

Do not rewrite existing edit or void logic.

Do not convert all `voided_at` records into cancelled transactions unless the business confirms that old voided transactions are truly cancelled orders.

---

## 20. Recommended Implementation Order

Follow this sequence:

### Phase 1: Database

1. Add `status` column.
2. Set default to `completed`.
3. Confirm existing transactions are completed.
4. Do not alter `voided_at`.

### Phase 2: Backend

1. Update transaction model.
2. Add optional status on creation.
3. Add `PATCH /transactions/:id/status`.
4. Add transition validation.
5. Add inventory restoration on pending cancellation.
6. Add status filtering to transaction list endpoint.
7. Update analytics to use only completed transactions.

### Phase 3: Frontend

1. Rename page title to `Sales Transactions`.
2. Add status column.
3. Add status badges.
4. Add status filter.
5. Add pending transaction actions.
6. Add confirmation modals.
7. Update transaction detail modal.
8. Add pending/completed creation buttons.

### Phase 4: QA

1. Test transaction creation.
2. Test inventory deduction.
3. Test pending completion.
4. Test pending cancellation.
5. Test analytics.
6. Test existing completed transactions.
7. Test old edit/void behavior.
8. Test mobile responsiveness.

---

## 21. Final Recommendation

Implement the transaction status enhancement using a simple `status` field on the existing `transactions` table.

Use only these statuses for version 1:

```text
pending
completed
cancelled
```

Keep the current sales behavior stable by defaulting new transactions to `completed`, unless the user explicitly chooses to save the transaction as pending.

Use strict transition rules:

```text
pending → completed
pending → cancelled
completed → locked
cancelled → locked
```

Do not allow completed transaction cancellation in version 1.

Do not create a separate transaction status history table yet.

Do not overhaul unrelated functions.

This implementation gives the system pending and completed transaction support while minimizing risk to inventory, reports, analytics, and existing sales behavior.
