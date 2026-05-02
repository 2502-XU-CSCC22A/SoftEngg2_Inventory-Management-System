import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './Navbar';
import styles from './Monthlyreport.module.css';

const PAD = { top: 18, right: 16, bottom: 36, left: 52 };

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function formatK(val) {
  if (val >= 1000) return `₱${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  return `₱${val}`;
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

  if (!data || data.length < 2) return null;

  const { w, h } = svgSize;
  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data, 1);
  const range = maxVal || 1;

  const toX = i => PAD.left + (i / (data.length - 1)) * innerW;
  const toY = v => PAD.top + innerH - (v / range) * innerH;

  const linePath = data.reduce((acc, val, i) => {
    const x = toX(i);
    const y = toY(val);
    if (i === 0) return `M ${x},${y}`;
    const px = toX(i - 1);
    const py = toY(data[i - 1]);
    const cpX = (px + x) / 2;
    return `${acc} C ${cpX},${py} ${cpX},${y} ${x},${y}`;
  }, '');

  const areaPath = `${linePath} L ${toX(data.length - 1)},${PAD.top + innerH} L ${toX(0)},${PAD.top + innerH} Z`;
  const yTicks = [0, 1, 2, 3, 4].map(i => (range * i) / 4);
  const xLabelIndices = new Set();
  for (let d = 1; d <= totalDays; d += 5) xLabelIndices.add(d - 1);
  xLabelIndices.add(totalDays - 1);

  const handleMouseMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (w / rect.width) - PAD.left;
    const idx = Math.round((mx / innerW) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setTooltip({ idx: clamped, x: toX(clamped), y: toY(data[clamped]), val: data[clamped] });
  };

  return (
    <svg ref={svgRef} className={styles.chartSvg} viewBox={`0 0 ${w} ${h}`} onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ab4cc" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#5ab4cc" stopOpacity="0.01" />
        </linearGradient>
        <clipPath id="chartClip">
          <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH + 1} />
        </clipPath>
      </defs>

      {/* Y-axis grid lines + labels */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line className={i === 0 ? styles.gridLineSolid : styles.gridLineDashed}
            x1={PAD.left} y1={toY(tick)}
            x2={PAD.left + innerW} y2={toY(tick)}
          />
          <text className={styles.axisLabel} x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end">
            {formatK(Math.round(tick))}
          </text>
        </g>
      ))}

      {data.map((_, i) => {
        if (!xLabelIndices.has(i)) return null;
        const isActive = i === activeDay - 1;
        return (
          <text key={i} className={isActive ? styles.axisLabelActive : styles.axisLabel} x={toX(i)} y={PAD.top + innerH + 22} textAnchor="middle"> {i + 1} </text>
        );
      })}

      <path className={styles.chartArea} d={areaPath} clipPath="url(#chartClip)" />
      <path className={styles.chartLine} d={linePath} clipPath="url(#chartClip)" />

      {data.map((val, i) => {
        if (data.length > 15 && !xLabelIndices.has(i) && i !== activeDay - 1) return null;
        return ( <circle key={i} className={styles.dataDot} cx={toX(i)} cy={toY(val)} />);
      })}


      {activeDay >= 1 && activeDay <= data.length && (
        <>
          <circle className={styles.activeRing} cx={toX(activeDay - 1)} cy={toY(data[activeDay - 1])} />
          <circle className={styles.activeDot} cx={toX(activeDay - 1)} cy={toY(data[activeDay - 1])}/>
        </>
      )}

      {tooltip && (() => {
        const bw = 96, bh = 28;
        const bx = tooltip.x + 12 + bw > w ? tooltip.x - bw - 12 : tooltip.x + 12;
        const by = Math.max(PAD.top, tooltip.y - bh / 2);
        return (
          <g>
            <line className={styles.tooltipLine} x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + innerH}/>
            <rect className={styles.tooltipRect} x={bx} y={by} width={bw} height={bh} />
            <text className={styles.tooltipText} x={bx + bw / 2} y={by + 18}textAnchor="middle">
              Day {tooltip.idx + 1}: {formatK(tooltip.val)}
            </text>
            <circle className={styles.tooltipDot} cx={tooltip.x} cy={tooltip.y} />
          </g>
        );
      })()}
    </svg>
  );
};

const Monthlyreport = () => {
  const [currentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [monthNames] = useState(['January','February','March','April','May','June','July','August','September','October','November','December',]);
  const [reportData, setReportData] = useState({revenue: 0, quantity: 0, dailyData: [], loading: true, error: null,});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const today = new Date();
  const activeDay = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth ? today.getDate() : totalDays;

  useEffect(() => {
    const fetchData = async () => {
      setReportData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Updated to use the correct API endpoint with proxy
        const response = await fetch(`/api/reports/daily-revenue?year=${currentYear}&month=${currentMonth}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch monthly revenue data');
        }
        
        const result = await response.json();
        
        // Handle the response format - adjust based on your backend response structure
        const dailyData = result.data || [];
        
        // Create array for all days in month with revenue data
        const dailyRevenueArray = Array.from({ length: totalDays }, (_, i) => {
          const dayEntry = dailyData.find(item => item.day === i + 1);
          return dayEntry?.revenue || 0;
        });
        
        const revenue = dailyRevenueArray.reduce((sum, v) => sum + v, 0);
        const quantity = dailyData.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        setReportData({ 
          revenue, 
          quantity, 
          dailyData: dailyRevenueArray, 
          loading: false, 
          error: null 
        });
      } catch (err) {
        console.error('Error fetching monthly report:', err);
        setReportData(prev => ({ 
          ...prev, 
          loading: false, 
          error: err.message 
        }));
      }
    };
    
    if (currentYear && currentMonth) {
      fetchData();
    }
  }, [currentYear, currentMonth, totalDays]);

  const handleMonthSelect = (monthIndex) => {
    setCurrentMonth(monthIndex + 1);
    setIsPopupOpen(false);
  };

  if (reportData.loading) return <div className={styles.loadingState}>Loading monthly report...</div>;
  if (reportData.error) return <div className={styles.errorState}>Error: {reportData.error}</div>;
  
  const dailyData = reportData.dailyData;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        
        <div className={styles.leftPanel}>
          <div className={styles.leftContent}>
            <h1 className={styles.revenueAmount}>₱{reportData.revenue.toLocaleString()}</h1>
            <p className={styles.date}>{monthNames[currentMonth - 1]} {currentYear}</p>
          </div>
          <button className={styles.revenueBtn} onClick={() => { window.location.href = '/totalrevenue'; }}>
            Overall Revenue
          </button>
        </div>
      
        <div className={styles.rightPanel}>
          <div className={styles.chartBox}>
            <ChartSVG data={dailyData} totalDays={totalDays} activeDay={activeDay} />
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
              <p className={styles.value}>₱{reportData.revenue.toLocaleString()}</p>
            </div>

            <hr className={styles.divider} />

            <div className={styles.infoItem}>
              <span className={styles.starIcon}>☆</span>
              <div className={styles.infoText}>
                <p className={styles.label}>Quantity Sold</p>
                <p className={styles.subLabel}>Overall Sold Products</p>
              </div>
              <p className={styles.value}>{reportData.quantity}</p>
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
              {monthNames.map((month, idx) => (
                <button key={month} className={`${styles.monthOption} ${currentMonth === idx + 1 ? styles.monthOptionActive : ''}`} onClick={() => handleMonthSelect(idx)}>
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Monthlyreport;