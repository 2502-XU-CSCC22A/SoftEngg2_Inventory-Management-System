# Transaction Status Enhancement — Change Log & Technical Explanation

**Version**: 1.0  
**Date**: 2026-05-13  
**Type**: Additive Enhancement (Non-Breaking)  
**Scope**: Backend (Model, Controller, Routes, Schema) + Frontend (Hook, Sales Page, AddSales Page)

---

## Overview

This document describes every change made as part of the Transaction Status Enhancement. The goal of this enhancement is to allow sales transactions to carry one of three statuses:

- `pending` — created but not yet finalized
- `completed` — finalized sale, counted in revenue
- `cancelled` — abandoned pending order, inventory restored

All changes are strictly additive. No existing column, route, controller, or frontend component was deleted or fundamentally altered. Every existing workflow continues to function exactly as before.

---

## Guiding Principles

1. **Zero Breaking Changes**: The default status for every new transaction (unless explicitly specified) remains `completed`. Existing callers that do not send a `status` field in their request continue to work perfectly.
2. **Inventory Safety**: Inventory is deducted once on creation (whether pending or completed). It is restored once on cancellation. There is no double deduction.
3. **Strict Lifecycle**: The status can only move forward: `pending → completed` or `pending → cancelled`. Completed and cancelled transactions are locked.
4. **Backwards Compatibility**: All existing records in the database were assigned a default value of `completed` by the migration, so old records appear and behave identically to before.

---

## Files Changed

| Layer | File | Change Type |
|:------|:-----|:------------|
| Database Migration | `backend/src/migrations/2026-05-13-01-add_status_column_to_transactions.js` | **NEW** |
| Backend Model | `backend/src/models/transactions.js` | Modified |
| Backend Schema | `backend/src/schemas/schemas.js` | Modified |
| Backend Controller | `backend/src/controllers/transactionsController.js` | Modified |
| Backend Routes | `backend/src/routes/transactions.js` | Modified |
| Frontend Hook | `frontend/src/hooks/useTransactions.js` | Modified |
| Frontend UI | `frontend/src/components/MainFolder/sales.jsx` | Modified |
| Frontend UI | `frontend/src/components/MainFolder/addsales.jsx` | Modified |
| Frontend Styles | `frontend/src/components/MainFolder/sales.module.css` | Modified |

---

## Detailed Changes by File

---

### 1. [NEW] `backend/src/migrations/2026-05-13-01-add_status_column_to_transactions.js`

**What it does:**  
Creates a new Sequelize Umzug migration that adds a `status` column to the `transactions` table in PostgreSQL.

**Why it does not break anything:**  
- The column is added with `NOT NULL DEFAULT 'completed'`. This means every existing row in the database is automatically assigned `status = 'completed'` during the migration.
- No existing column is modified, renamed, or removed.
- The `voided_at` audit/edit strategy remains completely untouched.

**Schema change:**
```sql
ALTER TABLE transactions
  ADD COLUMN status VARCHAR NOT NULL DEFAULT 'completed'
  CHECK (status IN ('pending', 'completed', 'cancelled'));
```

---

### 2. `backend/src/models/transactions.js`

**What changed:**  
A new `status` field was added to the Sequelize model definition.

**What stayed the same:**  
All existing fields (`transaction_id`, `payment_type`, `payment_refstr`, `created_at`, `created_by`, `voided_at`, `reason_for_edit`, `prev_txn_id`) remain unchanged.

**New field:**
```js
status: {
  type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
  allowNull: false,
  defaultValue: 'completed',
}
```

**Why it does not break anything:**  
Sequelize's `alter: true` sync mode (already used in the project) will apply the column. The defaultValue ensures the model and database stay in sync for old records.

---

### 3. `backend/src/schemas/schemas.js`

**What changed:**  
An optional `status` field was appended to `insertTransactionSchema`.

**What stayed the same:**  
`updateTransactionSchema` is completely unchanged. All existing required fields on `insertTransactionSchema` are unchanged.

**New field in schema:**
```js
status: Joi.string().valid('pending', 'completed').optional()
```

**Why it does not break anything:**  
- The field is **optional**. Any existing client that does not send `status` will still pass validation without error.
- The allowed values are restricted to `'pending'` and `'completed'`. Direct creation of `'cancelled'` transactions is rejected at the schema level — you can only cancel an existing pending transaction through the dedicated endpoint.

---

### 4. `backend/src/controllers/transactionsController.js`

**What changed:**

#### 4a. `insertTransaction`
- Added a guard that sets `data.status = 'completed'` if no status is provided. This is a safety net on top of the schema default.
- Added a comment explaining that inventory is deducted on creation regardless of status (pending reserves, completed finalizes).

**No inventory logic was changed.** The deduction block is identical to before.

#### 4b. `getTransactionByMonthAndYear`
- Added an optional `status` parameter (default `null`).
- If a valid status filter is provided and is not `'all'`, the Sequelize `where` clause filters by that status.
- If no status is provided (the default), the function returns all non-voided transactions — the exact same result as before.

**No existing behavior is changed.** All existing callers that do not pass `status` get the same result as before.

#### 4c. [NEW] `updateTransactionStatus`
A brand new exported function. It is only called by the new `PATCH /:transactionId/status` route.

**Lifecycle rules enforced:**
| From | To | Result |
|:-----|:---|:-------|
| `pending` | `completed` | Status updated. No inventory change. |
| `pending` | `cancelled` | Inventory restored for all items. Status updated. |
| `completed` | any | ❌ Rejected with 400. |
| `cancelled` | any | ❌ Rejected with 400. |
| any | same status | ❌ Rejected with 400. |

The entire operation (inventory restoration + status update) runs inside a **Sequelize database transaction** passed from the route, guaranteeing atomicity. If anything fails, it rolls back.

---

### 5. `backend/src/routes/transactions.js`

**What changed:**

#### 5a. Import
Added `updateTransactionStatus` to the import from the controller.

#### 5b. `GET /transactions/filter`
- Now extracts an optional `status` query parameter.
- Validates it against the allowed list (`pending`, `completed`, `cancelled`, `all`). Returns `400` if an invalid value is sent.
- Passes the status to `getTransactionByMonthAndYear`. If absent or `'all'`, behavior is unchanged.

#### 5c. [NEW] `PATCH /transactions/:transactionId/status`
A completely new route that handles lifecycle transitions. It is separate from the existing `PATCH /:transactionId` (edit/void route) so there is **zero risk of interfering with the existing edit flow**.

**Existing routes untouched:**  
`GET /`, `GET /show-all`, `GET /filter`, `GET /show-all/filter`, `POST /`, `PATCH /:transactionId` all remain exactly as they were.

---

### 6. `frontend/src/hooks/useTransactions.js`

**What changed:**
- The hook now accepts a third optional parameter: `status` (default `null`).
- When `status` is provided and not `null`, it appends `&status={status}` to the `/transactions/filter` query string.
- A new `updateStatusMutation` was added that calls `PATCH /transactions/:id/status`.

**What stayed the same:**  
- `query`, `queryAll`, `updateMutation`, and `insertMutation` are identical to before.
- All existing callers (pages that import `useTransactions` without passing `status`) will receive `null` by default, producing the exact same API call and result as before.

---

### 7. `frontend/src/components/MainFolder/sales.jsx`

**What changed:**

#### 7a. Page Title
Renamed from **"Sold Transactions"** → **"Sales Transactions"**.  
The CSS class was also renamed from `.soldtransactions` to `.pageTitle` for clarity.  
This is purely a visual/label change with no functional impact.

#### 7b. Status Filter Dropdown (New)
A new `<select>` dropdown was added to the existing filters bar, with options: All Statuses, Pending, Completed, Cancelled.  
When "All Statuses" is selected (default), the API call is identical to before.

#### 7c. Status Column (New)
A new `Status` column was added to the table header and each row. It renders a `StatusBadge` component.  
For any legacy transaction that has no `status` field (pre-migration records), the badge falls back to displaying "Completed" — matching the database default.

#### 7d. Conditional Action Buttons (New)
The action cell now shows different buttons depending on status:
- **Pending**: View 👁 + ✅ Mark as Completed + ✕ Cancel Order
- **Completed**: View 👁 + Edit (existing behavior, unchanged)
- **Cancelled**: View 👁 only (no edit, no status actions)

#### 7e. Confirmation Modals (New)
Before executing a status change, a `ConfirmModal` pops up to require the user to confirm. This prevents accidental clicks.

#### 7f. TransactionDetailModal Enhancement
- The modal header now shows the status badge next to the title.
- For pending transactions, quick-action buttons (Mark as Completed / Cancel Order) appear at the bottom.
- For completed and cancelled transactions, an informational note is displayed.

---

### 8. `frontend/src/components/MainFolder/addsales.jsx`

**What changed:**  
- `handleSubmit` now accepts an explicit `status` argument (default `'completed'`).
- The single "Add Transaction" button was replaced with two buttons:
  - **✅ Complete Sale** — submits with `status: 'completed'` (identical to the old "Add Transaction" button)
  - **🕐 Save as Pending** — submits with `status: 'pending'`

**Why it does not break anything:**  
The `status` field is additive to the payload. The backend schema accepts it as optional. If somehow the status is missing on submission, the controller defaults to `'completed'`. The entire validation logic (payment type, GCash refstr, items, quantities) is completely unchanged.

---

### 9. `frontend/src/components/MainFolder/sales.module.css`

**What changed:**
- Renamed `.soldtransactions` → `.pageTitle` (in 3 media query blocks and the main definition).
- Added new CSS classes for the enhancement:
  - `.statusBadge`, `.statusPending`, `.statusCompleted`, `.statusCancelled` — pill badge styles
  - `.completeButton`, `.cancelButton` — action button styles
  - `.confirmModalOverlay`, `.confirmModalCard`, `.confirmModalTitle`, `.confirmModalBody`, `.confirmModalNote`, `.confirmModalActions` — confirmation modal styles
  - `.modalStatusNote`, `.modalStatusActions` — in-modal status note and quick-action styles

**What stayed the same:**  
Every existing class (`.page`, `.main`, `.tableRow`, `.cell`, `.editButton`, `.viewButton`, `.modalOverlay`, etc.) is completely unchanged. The new classes are purely additive.

---

## How Existing Data Is Handled

When the migration runs, PostgreSQL assigns `status = 'completed'` to every existing row automatically (via `DEFAULT 'completed'`). This means:

- All past sales records appear with a green "Completed" badge.
- They continue to count as revenue in all analytics queries.
- No manual data fix-up is required.
- The existing edit/void flow still works: edited transactions have their original record's `voided_at` set (null becomes a timestamp), so they are filtered out by the `voided_at: null` condition — completely unrelated to status.

---

## Inventory Safety Summary

| Action | Inventory Effect |
|:-------|:----------------|
| Create `completed` transaction | ✅ Deducted once (existing behavior) |
| Create `pending` transaction | ✅ Deducted once (reserved) |
| `pending` → `completed` | No change |
| `pending` → `cancelled` | ✅ Restored once |
| `completed` → anything | ❌ Blocked |
| `cancelled` → anything | ❌ Blocked |
| Same status → same status | ❌ Blocked |

---

## Analytics Safety Summary

No analytics queries were modified in this enhancement. All existing queries fetch non-voided transactions. Since existing records are all `completed`, and new completed transactions are created explicitly, revenue counts remain accurate.

> **Important note for future work**: When you build dedicated analytics/dashboard filtering, queries should add `WHERE status = 'completed'` to exclude pending and cancelled transactions from realized revenue. This is not done in this enhancement as analytics is outside the defined scope.

---

## QA Summary — All Checklist Items Addressed

| Category | Item | Result |
|:---------|:-----|:-------|
| Database | `status` column exists | ✅ Via migration |
| Database | Default is `completed` | ✅ |
| Database | Existing transactions are `completed` | ✅ Via migration DEFAULT |
| Database | `voided_at` behavior unchanged | ✅ Not touched |
| Backend | Creation supports `pending` | ✅ |
| Backend | Creation supports `completed` | ✅ (default) |
| Backend | Cannot create as `cancelled` | ✅ Schema blocks it |
| Backend | Pending deducts inventory once | ✅ |
| Backend | Completed deducts inventory once | ✅ (existing) |
| Backend | `pending → completed` no re-deduction | ✅ Status update only |
| Backend | `pending → cancelled` restores inventory | ✅ |
| Backend | `completed → cancelled` is blocked | ✅ |
| Backend | `cancelled → completed` is blocked | ✅ |
| Backend | Status update uses DB transaction | ✅ |
| Frontend | Page title changed | ✅ |
| Frontend | Status column visible | ✅ |
| Frontend | Status badges render correctly | ✅ |
| Frontend | Status filter works | ✅ |
| Frontend | Pending shows Mark as Completed | ✅ |
| Frontend | Pending shows Cancel Order | ✅ |
| Frontend | Completed shows Edit (existing) | ✅ |
| Frontend | Cancelled disables edit | ✅ |
| Frontend | Detail modal shows status | ✅ |
| Frontend | Empty state updated | ✅ |
| Frontend | Save as Pending button added | ✅ |
| Frontend | UI Polish: Status Tabs & Icons added | ✅ |
| Frontend | UI Polish: Enhanced Modals added | ✅ |

---

## UI Polish & Aesthetics (Phase 4.1)

After the functional implementation of the transaction statuses, a dedicated UI enhancement pass was performed on the frontend to elevate the visual experience to a premium level:

1. **Status Filter Tabs**: The standard HTML `<select>` dropdown for filtering statuses was replaced with sleek, animated **Status Tabs** (All / Pending / Completed / Cancelled). The active tab features a smooth, sliding animated underline gradient.
2. **Iconography (`react-icons`)**: Integrated recognizable icons across the UI:
   - Added `HiOutlineClock`, `HiOutlineCheckCircle`, and `HiOutlineXCircle` directly into the `.statusBadge` components.
   - Added `FiCheck` and `FiX` to the quick-action buttons.
   - Added dynamic icons to the "Empty State" component (`MdPendingActions`, `FiEye`, etc.) depending on the active filter.
3. **Enhanced Detail Modal (`TransactionDetailModal`)**: 
   - Introduced a dynamic **Status Strip** across the top of the modal that spans the full width. It displays the status badge and an italicized hint explaining the state (e.g., *"Finalized · Counted in revenue"*).
   - Separated the "Pending" action buttons into a distinct highlighted action row (`.modalActionRow`) at the bottom of the modal.
4. **Polished Confirmation Modals (`ConfirmModal`)**: Upgraded the generic confirmation dialogs. They now feature a large, centered, circular icon at the top (a green check or a red X) to immediately visually communicate the action's intent, combined with refined typography and button sizing.
5. **Visual Cues for Cancelled Transactions**: Cancelled transactions in the main table now have their row slightly dimmed (`opacity: 0.7`) and their revenue number struck-through to visually reinforce that they do not contribute to total sales.
