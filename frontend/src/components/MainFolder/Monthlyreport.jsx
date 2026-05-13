import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Navbar } from './Navbar';
import styles from './Monthlyreport.module.css';
import { useTransactions } from '../../hooks/useTransactions.js';
import { formatToPesos } from '../../utils/utils.js';


const PAD = { top: 18, right: 16, bottom: 36, left: 52 };

function formatK(val) {
  if (val >= 1_000_000) return `₱${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1000) return `₱${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  return `₱${val}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const ChartSVG = ({ data, totalDays, activeDay }) => {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [svgSize, setSvgSize] = useState({ w: 600, h: 220 });

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSvgSize({ w: Math.max(width, 100), h: Math.max(height, 60) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxVal = Math.max(...data, 1);
  if (data.length < 2 || maxVal === 0) {
    return <div className={styles.chartEmpty}>No sales this month</div>;
  }

  const { w, h } = svgSize;
  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;
  const toX = i => PAD.left + (i / (data.length - 1)) * innerW;
  const toY = v => PAD.top + innerH - (v / maxVal) * innerH;

  const linePath = data.reduce((acc, val, i) => {
    const x = toX(i), y = toY(val);
    if (i === 0) return `M ${x},${y}`;
    const px = toX(i - 1), py = toY(data[i - 1]);
    const cpX = (px + x) / 2;
    return `${acc} C ${cpX},${py} ${cpX},${y} ${x},${y}`;
  }, '');

  const areaPath = `${linePath} L ${toX(data.length - 1)},${PAD.top + innerH} L ${toX(0)},${PAD.top + innerH} Z`;
  const yTicks = [0, 1, 2, 3, 4].map(i => (maxVal * i) / 4);

  const xLabelIndices = new Set();
  for (let d = 1; d <= totalDays; d += 5) xLabelIndices.add(d - 1);
  xLabelIndices.add(totalDays - 1);

  const handleMouseMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (w / rect.width) - PAD.left;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mx / innerW) * (data.length - 1))));
    setTooltip({ idx, x: toX(idx), y: toY(data[idx]), val: data[idx] });
  };

  return (
    <svg
      ref={svgRef}
      className={styles.chartSvg}
      viewBox={`0 0 ${w} ${h}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      <defs>
        <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ab4cc" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#5ab4cc" stopOpacity="0.01" />
        </linearGradient>
        <clipPath id="monthlyClip">
          <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH + 1} />
        </clipPath>
      </defs>

      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            className={i === 0 ? styles.gridLineSolid : styles.gridLineDashed}
            x1={PAD.left} y1={toY(tick)} x2={PAD.left + innerW} y2={toY(tick)}
          />
          <text className={styles.axisLabel} x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end">
            {formatK(Math.round(tick))}
          </text>
        </g>
      ))}

      {data.map((_, i) => {
        if (!xLabelIndices.has(i)) return null;
        return (
          <text
            key={i}
            className={i === activeDay - 1 ? styles.axisLabelActive : styles.axisLabel}
            x={toX(i)} y={PAD.top + innerH + 22}
            textAnchor="middle"
          >
            {i + 1}
          </text>
        );
      })}

      <path className={styles.chartArea} d={areaPath} fill="url(#monthlyGrad)" clipPath="url(#monthlyClip)" />
      <path className={styles.chartLine} d={linePath} clipPath="url(#monthlyClip)" />

      {data.map((val, i) => {
        if (data.length > 15 && !xLabelIndices.has(i) && i !== activeDay - 1) return null;
        return <circle key={i} className={styles.dataDot} cx={toX(i)} cy={toY(val)} />;
      })}

      {activeDay >= 1 && activeDay <= data.length && (
        <>
          <circle className={styles.activeRing} cx={toX(activeDay - 1)} cy={toY(data[activeDay - 1])} />
          <circle className={styles.activeDot} cx={toX(activeDay - 1)} cy={toY(data[activeDay - 1])} />
        </>
      )}

      {tooltip && (() => {
        const bw = 110, bh = 28;
        const bx = tooltip.x + 12 + bw > w ? tooltip.x - bw - 12 : tooltip.x + 12;
        const by = Math.max(PAD.top, tooltip.y - bh / 2);
        return (
          <g>
            <line className={styles.tooltipLine} x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + innerH} />
            <rect className={styles.tooltipRect} x={bx} y={by} width={bw} height={bh} rx="8" />
            <text className={styles.tooltipText} x={bx + bw / 2} y={by + 18} textAnchor="middle">
              Day {tooltip.idx + 1}: {formatK(tooltip.val)}
            </text>
            <circle className={styles.tooltipDot} cx={tooltip.x} cy={tooltip.y} />
          </g>
        );
      })()}
    </svg>
  );
};


const MONTH_NAMES = [ 'January','February','March','April','May','June', 'July','August','September','October','November','December',];

const Monthlyreport = () => {
  const { query } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const monthlyData = useMemo(() => {
    const rawData = query.data?.data ?? query.data ?? [];
    // Only count completed transactions in revenue analytics
    const transactions = Array.isArray(rawData)
      ? rawData.filter(txn => !txn.status || txn.status === 'completed')
      : [];
    const grouped = {};
    let unusualTransactions = [];

    transactions.forEach(txn => {
      const date = new Date(txn.created_at);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      if (!grouped[key]) grouped[key] = { revenue: 0, quantity: 0, month, year };

      txn.transaction_items?.forEach(item => {
        if (item.product_unit_price > 10_000_000) {
          unusualTransactions.push({
            transaction_id: txn.transaction_id,
            product_name: item.product_name,
            unit_price_cents: item.product_unit_price,
            unit_price_pesos: item.product_unit_price / 100,
            quantity: item.quantity_bought,
            month, year
          });
          return;
        }
        const revenue = item.quantity_bought * item.product_unit_price;
        grouped[key].revenue += revenue;
        grouped[key].quantity += item.quantity_bought;
      });
    });

    if (unusualTransactions.length > 0) {
      console.warn(' Unusually high unit prices detected ( > ₱100,000 ). These were excluded from calculations:', unusualTransactions);
    }

    return grouped;
  }, [query.data]);

  const currentData = useMemo(() => {
    const key = `${selectedYear}-${selectedMonth}`;
    return monthlyData[key] || { revenue: 0, quantity: 0 };
  }, [monthlyData, selectedMonth, selectedYear]);

  const dailyChartData = useMemo(() => {
    const rawData = query.data?.data ?? query.data ?? [];
    // Only count completed transactions in the daily chart
    const transactions = Array.isArray(rawData)
      ? rawData.filter(txn => !txn.status || txn.status === 'completed')
      : [];
    const totalDays = getDaysInMonth(selectedYear, selectedMonth);
    const dayMap = {};

    transactions.forEach(txn => {
      const date = new Date(txn.created_at);
      if (date.getMonth() + 1 !== selectedMonth || date.getFullYear() !== selectedYear) return;
      const day = date.getDate();

      txn.transaction_items?.forEach(item => {
        if (item.product_unit_price > 10_000_000) return;
        const revenue = item.quantity_bought * item.product_unit_price;
        dayMap[day] = (dayMap[day] || 0) + revenue;
      });
    });

    return Array.from({ length: totalDays }, (_, i) => (dayMap[i + 1] || 0) / 100);
  }, [query.data, selectedMonth, selectedYear]);

  const availableMonths = useMemo(() => { return Object.values(monthlyData) .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month); }, [monthlyData]);

  const today = new Date();
  const totalDays = getDaysInMonth(selectedYear, selectedMonth);
  const activeDay =
    today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth
      ? today.getDate()
      : totalDays;

  const handleMonthSelect = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsPopupOpen(false);
  };

  const handleExport = () => {
    const rawData = query.data?.data ?? query.data ?? [];
    // Only export completed transactions
    const transactions = Array.isArray(rawData)
      ? rawData.filter(txn => !txn.status || txn.status === 'completed')
      : [];
    const rows = [['Transaction ID', 'Date', 'Product', 'Quantity', 'Unit Price', 'Revenue']];

    transactions.forEach(txn => {
      const date = new Date(txn.created_at);
      if (date.getMonth() + 1 !== selectedMonth || date.getFullYear() !== selectedYear) return;
      txn.transaction_items?.forEach(item => {
        if (item.product_unit_price > 10_000_000) return;
        rows.push([
          txn.transaction_id,
          date.toLocaleDateString('en-US'),
          item.product_name,
          item.quantity_bought,
          (item.product_unit_price / 100).toFixed(2),
          ((item.quantity_bought * item.product_unit_price) / 100).toFixed(2),
        ]);
      });
    });

    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_report_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (query.isLoading) return <div className={styles.loadingState}>Loading monthly data</div>;
  if (query.isError) return <div className={styles.errorState}>Failed to load transactions, log in is needed.</div>;

  return (
    <>
      <Navbar />
      <div className={styles.container}>

        <div className={styles.leftPanel}>
          <div className={styles.leftContent}>
            <h1 className={styles.revenueAmount}>{formatToPesos(currentData.revenue)}</h1>
            <p className={styles.date}>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</p>
          </div>
          <button className={styles.revenueBtn} onClick={() => { window.location.href = '/totalrevenue'; }}>
            Overall Revenue
          </button>
          <button className={styles.exportBtn} onClick={handleExport}>
            Export Monthly Revenue into CSV
          </button>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.chartBox}>
            <ChartSVG key={`${selectedYear}-${selectedMonth}`} data={dailyChartData} totalDays={totalDays} activeDay={activeDay} />
          </div>

          <div className={styles.info}>
            <div className={styles.monthSelect}>
              <h2 className={styles.monthSelectTitle}>Select a Month</h2>
              <button className={styles.arrowBtn} onClick={() => setIsPopupOpen(true)} aria-label="Select month">
                <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10.25" strokeWidth="2" />
                  <path d="M8 11l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <hr className={styles.divider} />

            <div className={styles.infoItem}>
              <span className={styles.starIcon}>☆</span>
              <div className={styles.infoText}>
                <p className={styles.label}>Income</p>
                <p className={styles.subLabel}>Overall Sales</p>
              </div>
              <p className={styles.value}>{formatToPesos(currentData.revenue)}</p>
            </div>

            <hr className={styles.divider} />

            <div className={styles.infoItem}>
              <span className={styles.starIcon}>☆</span>
              <div className={styles.infoText}>
                <p className={styles.label}>Quantity Sold</p>
                <p className={styles.subLabel}>Overall Sold Products</p>
              </div>
              <p className={styles.value}>{currentData.quantity}</p>
            </div>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <div className={styles.monthPopupOverlay} onClick={() => setIsPopupOpen(false)}>
          <div className={styles.monthPopupCard} onClick={e => e.stopPropagation()}>
            <div className={styles.monthPopupHeader}>
              <h3 className={styles.monthPopupTitle}>Select a Month</h3>
              <button className={styles.closePopup} onClick={() => setIsPopupOpen(false)}>✕</button>
            </div>
            <div className={styles.monthGrid}>
              {availableMonths.length === 0 ? (
                <p className={styles.noData}>No transactions yet.</p>
              ) : (
                availableMonths.map(({ month, year }) => (
                  <button
                    key={`${year}-${month}`}
                    className={`${styles.monthOption} ${selectedMonth === month && selectedYear === year ? styles.monthOptionActive : ''}`}
                    onClick={() => handleMonthSelect(month, year)}
                  >
                    {MONTH_NAMES[month - 1]} {year}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Monthlyreport;