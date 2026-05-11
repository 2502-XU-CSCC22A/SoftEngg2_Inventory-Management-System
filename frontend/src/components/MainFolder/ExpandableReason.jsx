import React, { useState } from 'react';
import styles from './ActivLog.module.css';

const ExpandableReason = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > 15;
  const displayed = expanded || !isLong ? text : text.slice(0, 15) + '\u2026';

  return (
    <span>
      {displayed}
      {isLong && (
        <>
          {' '}
          <button className={styles['see-toggle']} onClick={() => setExpanded(e => !e)}>
            {expanded ? 'See less' : 'See more'}
          </button>
        </>
      )}
    </span>
  );
};

export default ExpandableReason;