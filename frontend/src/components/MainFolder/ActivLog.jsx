import React, { useState } from 'react';
import { Navbar } from './Navbar';
import styles from './ActivLog.module.css';
import { useActivityLogs } from '../../hooks/useActivityLogs';

const ACTION_BADGES = {
  TRANSACTION_CREATED: { label: 'Created', className: 'badgeCreate' },
  TRANSACTION_UPDATED: { label: 'Updated', className: 'badgeUpdate' },
  PRODUCT_ADDED:       { label: 'Added',   className: 'badgeCreate' },
  PRODUCT_UPDATED:     { label: 'Updated', className: 'badgeUpdate' },
  USER_ADDED:          { label: 'Added',   className: 'badgeCreate' },
  USER_ARCHIVED:       { label: 'Archived', className: 'badgeArchive' },
  USER_LOGIN:          { label: 'Login',   className: 'badgeAuth' },
  USER_LOGOUT:         { label: 'Logout',  className: 'badgeAuth' },
};

const ActivLog = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useActivityLogs(page, 10);

  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return (
      <>
        <span className={styles['dt-date']}>{date}</span>
        <span className={styles['dt-time']}>{time}</span>
      </>
    );
  };

  const getBadge = (action) => {
    const badge = ACTION_BADGES[action] || { label: action, className: 'badgeDefault' };
    return <span className={`${styles.badge} ${styles[badge.className]}`}>{badge.label}</span>;
  };

  const capitalizeModule = (mod) => {
    if (!mod) return '—';
    return mod.charAt(0).toUpperCase() + mod.slice(1);
  };

  return (
    <>
      <Navbar />

      <section id="activity-log" className={styles.page}>
        <div className={styles.actions}>
          <div className={styles['center-title']}>
            <h2 className={styles.title}>Activity Log</h2>
            {pagination.totalLogs > 0 && (
              <p className={styles['result-note']}>
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalLogs} total logs)
              </p>
            )}
          </div>
        </div>

        <div className={styles['table-container']}>
          {isLoading ? (
            <div className={styles['state-message']}>
              <p>Loading activity logs...</p>
            </div>
          ) : isError ? (
            <div className={styles['state-message']}>
              <p className={styles['error-text']}>Failed to load activity logs: {error?.message || 'Unknown error'}</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Description</th>
                    <th>User</th>
                    <th>Module</th>
                    <th>Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr className={styles['empty-row']}>
                      <td colSpan="5">No activity logs found.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.log_id}>
                        <td>{getBadge(log.action)}</td>
                        <td className={styles['desc-cell']}>{log.description}</td>
                        <td>{log.performed_by_user?.username || '—'}</td>
                        <td>{capitalizeModule(log.module)}</td>
                        <td>{formatDateTime(log.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles['pagination-btn']}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage}
                  >
                    ← Previous
                  </button>
                  <span className={styles['page-info']}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    className={styles['pagination-btn']}
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ActivLog;