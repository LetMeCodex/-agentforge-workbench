import React, { useState, useRef } from 'react';
import { 
  TrendingUp, 
  MoreHorizontal, 
  Search, 
  HelpCircle, 
  Bell, 
  Calendar, 
  Sliders, 
  Share2, 
  Download, 
  RefreshCw, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { domainsData } from '../data/defaultData';

export default function ApexifyDashboard({ selectedDomain = 'support' }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRow, setSelectedRow] = useState(1); // Row 1 selected by default
  
  // Interactive Chart Tooltip State
  const chartRef = useRef(null);
  const [hoverX, setHoverX] = useState(380); // Default vertical line position at Run 5
  const [isHoveringChart, setIsHoveringChart] = useState(true);

  // Active domain configurations
  const activeDomainData = domainsData[selectedDomain] || domainsData.support;
  const metricsCategories = activeDomainData.categories;
  const metrics = activeDomainData.metrics;
  const executionHistory = activeDomainData.executionHistory;

  const getChartConfigs = () => {
    if (selectedDomain === 'healthcare') {
      return {
        dates: ["Run 1 (v1_base_intake)", "Run 2 (v2_patient_triage)", "Run 3 (v3_rag_hipaa)", "Run 4 (v4_verified_triage_router)", "Run 5 (v4_clinical_triage)", "Run 6 (v4_eval_01)", "Run 7 (v4_eval_02)", "Run 8 (v4_final_approved)"],
        revs: ["64%", "69%", "75%", "82%", "88%", "90%", "92%", "94%"],
        targets: ["60%", "62%", "63%", "64%", "64%", "64%", "65%", "65%"]
      };
    }
    if (selectedDomain === 'finance') {
      return {
        dates: ["Run 1 (v1_credit_review)", "Run 2 (v2_dti_calculator)", "Run 3 (v3_kyc_aml_verifier)", "Run 4 (v4_compliance_underwriting)", "Run 5 (v4_refinancing_run)", "Run 6 (v4_eval_01)", "Run 7 (v4_eval_02)", "Run 8 (v4_final_compliance)"],
        revs: ["59%", "65%", "73%", "80%", "86%", "90%", "92%", "94%"],
        targets: ["52%", "53%", "54%", "54%", "54%", "55%", "56%", "56%"]
      };
    }
    return {
      dates: ["Run 1 (v1_base_agent)", "Run 2 (v2_prompt_tuning)", "Run 3 (v3_base_router)", "Run 4 (v4_rag_router)", "Run 5 (v5_verified_rag_router)", "Run 6 (v5_run_042_eval)", "Run 7 (v5_run_043_eval)", "Run 8 (v5_final_optimized)"],
      revs: ["54%", "61%", "74%", "82%", "87%", "89%", "91%", "93%"],
      targets: ["51%", "53%", "54%", "54%", "54%", "55%", "56%", "56%"]
    };
  };

  // Render Premium Category Icons in high fidelity
  const renderCategoryIcon = (code) => {
    if (code === 'success') {
      return (
        <div style={{ display: 'flex', width: '20px', height: '15px', background: 'rgba(34,197,94,0.15)', borderRadius: '4px', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34,197,94,0.2)' }}>
          <svg width="10" height="8" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
      );
    }
    if (code === 'policy') {
      return (
        <div style={{ display: 'flex', width: '20px', height: '15px', background: 'rgba(140,82,255,0.15)', borderRadius: '4px', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(140,82,255,0.2)' }}>
          <svg width="10" height="8" viewBox="0 0 24 24" fill="none" stroke="#8C52FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
      );
    }
    if (code === 'grounded') {
      return (
        <div style={{ display: 'flex', width: '20px', height: '15px', background: 'rgba(59,130,246,0.15)', borderRadius: '4px', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}>
          <svg width="10" height="8" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
      );
    }
    if (code === 'escalation') {
      return (
        <div style={{ display: 'flex', width: '20px', height: '15px', background: 'rgba(245,158,11,0.15)', borderRadius: '4px', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
          <svg width="10" height="8" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
        </div>
      );
    }
    return null;
  };

  // Interactive Chart mouse tracking
  const handleChartMouseMove = (e) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const boundedX = Math.max(50, Math.min(550, x));
    setHoverX(boundedX);
  };

  // Calculate mock data depending on chart mouse hover
  const getChartDataAtX = (x) => {
    const ratio = (x - 50) / 500;
    
    // Run 5 matches approximately x = 380
    const isRun5 = Math.abs(x - 380) < 15;
    const configs = getChartConfigs();

    if (isRun5) {
      return {
        date: configs.dates[4],
        revenue: configs.revs[4],
        target: configs.targets[4],
        yRev: 105,
        yTarget: 140
      };
    }

    const index = Math.round(ratio * 7);
    const dates = configs.dates;
    const revs = configs.revs;
    const targets = configs.targets;

    const yRev = 180 - (ratio * 120) + Math.sin(ratio * 12) * 20;
    const yTarget = 140 - (ratio * 40) + Math.cos(ratio * 8) * 10;

    return {
      date: dates[Math.min(7, Math.max(0, index))],
      revenue: revs[Math.min(7, Math.max(0, index))],
      target: targets[Math.min(7, Math.max(0, index))],
      yRev,
      yTarget
    };
  };

  const chartPoint = getChartDataAtX(hoverX);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#F8FAFC', fontFamily: "'Geist', 'Inter', -apple-system, sans-serif" }}>
      
      {/* Scope specific styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .apex-gradient-card {
          background: linear-gradient(135deg, #7F56D9 0%, #D846EF 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 4px 20px rgba(127, 86, 217, 0.25);
        }
        .apex-card {
          background-color: #121319;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 18px;
          box-sizing: border-box;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .apex-card:hover {
          border-color: rgba(255, 255, 255, 0.09);
        }
        .apex-pill-success {
          background-color: rgba(34, 197, 94, 0.12);
          color: #22C55E;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .apex-pill-danger {
          background-color: rgba(239, 68, 68, 0.12);
          color: #EF4444;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .apex-dot-processing {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #A1AAB8;
          margin-right: 6px;
        }
        .apex-dot-success {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #22C55E;
          margin-right: 6px;
        }
        .apex-search-input {
          background-color: #15161E;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 6px 12px 6px 32px;
          color: #F8FAFC;
          font-size: 12.5px;
          width: 240px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .apex-search-input:focus {
          border-color: #8C52FF;
        }
        .apex-button-purple {
          background-color: #8C52FF;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .apex-button-purple:hover {
          background-color: #7B46E5;
        }
        .apex-button-border {
          background-color: transparent;
          color: #CBD5E1;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .apex-button-border:hover {
          background-color: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .apex-tab-underline {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #8C52FF;
        }
        .apex-table {
          width: 100%;
          border-collapse: collapse;
        }
        .apex-table th {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6B7280;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-weight: 600;
        }
        .apex-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: 12.5px;
          vertical-align: middle;
        }
        .apex-table tr:hover td {
          background-color: rgba(255, 255, 255, 0.008);
        }
        .avatar-initials {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9.5px;
          font-weight: bold;
          color: white;
        }
      ` }} />

      {/* Main Sub-Header Row: Date range, filter, share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
        
        {/* Navigation tabs matching Overview, Notifications, Run history */}
        <div style={{ display: 'flex', gap: '24px', position: 'relative' }}>
          {['overview', 'notifications', 'runHistory'].map(tab => {
            const label = tab === 'overview' ? 'Overview' : tab === 'notifications' ? 'Notifications' : 'Run history';
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#F8FAFC' : '#6B7280',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '600' : '500',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {label}
                {isActive && <div className="apex-tab-underline" />}
              </button>
            );
          })}
        </div>

        {/* Date, Filters, Share Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          
          {/* Date Selector Pill */}
          <div className="apex-button-border" style={{ cursor: 'default' }}>
            <Calendar size={13} color="#8C52FF" />
            <span style={{ fontSize: '12.5px' }}>28 Aug - 15 Dec, 2024</span>
          </div>

          {/* Filter button */}
          <button className="apex-button-border">
            <Sliders size={13} />
            <span>Filter</span>
          </button>

          {/* Share button */}
          <button className="apex-button-purple">
            <Share2 size={13} />
            <span>Share</span>
          </button>

        </div>

      </div>

      {/* Overview tab content */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Card Strip (4 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            
            {/* Card 1: Overall Avg Score (Purple Gradient background) */}
            <div className="apex-card apex-gradient-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="12" y1="10" x2="12" y2="14" /><circle cx="12" cy="12" r="2" /></svg>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metrics.card1Title}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '750', color: 'white' }}>{metrics.card1Val}</span>
                <span className="apex-pill-success" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>{metrics.card1Pill}</span>
              </div>
              <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)' }}>Compared to baseline</div>
            </div>

            {/* Card 2: Policy Adherence */}
            <div className="apex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(140,82,255,0.1)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C52FF" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metrics.card2Title}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '750', color: 'white' }}>{metrics.card2Val}</span>
                <span className="apex-pill-success">{metrics.card2Pill}</span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280' }}>Compared to baseline</div>
            </div>

            {/* Card 3: Hallucination Rate */}
            <div className="apex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(140,82,255,0.1)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C52FF" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metrics.card3Title}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '750', color: 'white' }}>{metrics.card3Val}</span>
                <span className="apex-pill-success">{metrics.card3Pill}</span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280' }}>Compared to baseline</div>
            </div>

            {/* Card 4: Avg Cost / Ticket */}
            <div className="apex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(140,82,255,0.1)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C52FF" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metrics.card4Title}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '750', color: 'white' }}>{metrics.card4Val}</span>
                <span className="apex-pill-success">{metrics.card4Pill}</span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280' }}>Compared to baseline</div>
            </div>

          </div>

          {/* Middle Row Layout (Chart + Session by country) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.1fr', gap: '16px' }}>
            
            {/* Left Box: Performance trend line chart */}
            <div className="apex-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
              
              {/* Chart Title row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '650', color: 'white' }}>Model Performance Trend</h3>
                
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  
                  {/* Progress dropdown button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1C1D24', border: '1px solid rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', color: '#A1AAB8', cursor: 'pointer' }}>
                    <span>Score Progress</span>
                    <ChevronDown size={11} />
                  </div>

                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                    <MoreHorizontal size={14} />
                  </button>

                </div>
              </div>

              {/* Dotted lines grid scale representation */}
              <div 
                ref={chartRef}
                onMouseMove={handleChartMouseMove}
                onMouseEnter={() => setIsHoveringChart(true)}
                onMouseLeave={() => setIsHoveringChart(false)}
                style={{ position: 'relative', width: '100%', height: '240px', marginTop: '10px', cursor: 'crosshair' }}
              >
                
                {/* SVG Graph rendering curves */}
                <svg width="100%" height="100%" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                  
                  {/* Grids */}
                  <line x1="50" y1="30" x2="550" y2="30" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                  <line x1="50" y1="70" x2="550" y2="70" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                  <line x1="50" y1="110" x2="550" y2="110" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                  <line x1="50" y1="150" x2="550" y2="150" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                  <line x1="50" y1="190" x2="550" y2="190" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />

                  {/* Gradient Area under Revenue line */}
                  <defs>
                    <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8C52FF" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#8C52FF" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Purple Area filled path */}
                  <path d="M 50 210 L 50 180 C 100 190, 120 145, 175 140 C 230 135, 250 90, 310 110 C 370 130, 420 50, 480 90 C 510 100, 520 60, 550 45 L 550 210 Z" fill="url(#purpleAreaGrad)" />

                  {/* Lines */}
                  {/* Revenue Line (Purple) */}
                  <path 
                    d="M 50 180 C 100 190, 120 145, 175 140 C 230 135, 250 90, 310 110 C 370 130, 420 50, 480 90 C 510 100, 520 60, 550 45" 
                    stroke="#8C52FF" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />

                  {/* Target Line (Yellow) */}
                  <path 
                    d="M 50 130 C 100 135, 130 110, 180 120 C 230 130, 270 115, 320 120 C 370 125, 410 100, 470 115 C 510 125, 530 105, 550 110" 
                    stroke="#F59E0B" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />

                  {/* Static Labels (Left axes) */}
                  <text x="15" y="34" fill="#6B7280" fontSize="10.5" fontFamily="monospace">100%</text>
                  <text x="20" y="74" fill="#6B7280" fontSize="10.5" fontFamily="monospace">80%</text>
                  <text x="20" y="114" fill="#6B7280" fontSize="10.5" fontFamily="monospace">60%</text>
                  <text x="20" y="154" fill="#6B7280" fontSize="10.5" fontFamily="monospace">40%</text>
                  <text x="20" y="194" fill="#6B7280" fontSize="10.5" fontFamily="monospace">20%</text>
                  <text x="25" y="230" fill="#6B7280" fontSize="10.5" fontFamily="monospace">0%</text>

                  {/* Static Labels (Bottom axes runs) */}
                  <text x="50" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 1</text>
                  <text x="120" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 2</text>
                  <text x="190" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 3</text>
                  <text x="260" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 4</text>
                  <text x="330" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 5</text>
                  <text x="400" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 6</text>
                  <text x="470" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 7</text>
                  <text x="540" y="238" fill="#6B7280" fontSize="10" textAnchor="middle">Run 8</text>

                  {/* Hover vertical dashed guide line */}
                  {isHoveringChart && (
                    <line 
                      x1={hoverX} 
                      y1="25" 
                      x2={hoverX} 
                      y2="210" 
                      stroke="#ffffff" 
                      strokeWidth="1" 
                      strokeDasharray="4 4" 
                      opacity="0.6"
                    />
                  )}

                  {/* Hover indicators dots */}
                  {isHoveringChart && (
                    <>
                      {/* Dotted target highlight */}
                      <circle cx={hoverX} cy={chartPoint.yTarget} r="4.5" fill="#F59E0B" stroke="#ffffff" strokeWidth="1" />
                      
                      {/* Dotted revenue highlight */}
                      <circle cx={hoverX} cy={chartPoint.yRev} r="6.5" fill="#8C52FF" stroke="#ffffff" strokeWidth="1.5" />
                    </>
                  )}

                </svg>

                {/* Floating tooltip element positioned relative to cursor */}
                {isHoveringChart && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${hoverX}px`,
                      top: `${chartPoint.yRev - 45}px`,
                      transform: 'translateX(-50%)',
                      background: '#1C1D24',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      pointerEvents: 'none',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 20,
                      width: '180px'
                    }}
                  >
                    <span style={{ fontSize: '9.5px', color: '#6B7280', fontWeight: '600' }}>{chartPoint.date}</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '500' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8C52FF' }} />
                      <span style={{ color: '#CBD5E1' }}>Optimized:</span>
                      <strong style={{ color: 'white', marginLeft: 'auto' }}>{chartPoint.revenue}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '500' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                      <span style={{ color: '#CBD5E1' }}>Baseline:</span>
                      <strong style={{ color: 'white', marginLeft: 'auto' }}>{chartPoint.target}</strong>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Box: Success by Category */}
            <div className="apex-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '650', color: 'white' }}>Success by Category</h3>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>

              {/* Progress columns */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {metricsCategories.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderCategoryIcon(c.code)}
                        <span style={{ color: '#CBD5E1', fontWeight: '500' }}>{c.name}</span>
                      </div>
                      <span style={{ color: 'white', fontWeight: '600' }}>{c.percentage}%</span>
                    </div>

                    {/* Progress track */}
                    <div style={{ width: '100%', height: '8px', background: '#1C1D24', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${c.percentage}%`, height: '100%', background: c.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row: Benchmark Execution History */}
          <div className="apex-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Header controls bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '650', color: 'white' }}>Benchmark Execution History</h3>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="apex-button-border" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  <Download size={12} />
                  <span>Download</span>
                </button>
                
                <button className="apex-button-purple" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  <RefreshCw size={12} />
                  <span>Run Arena</span>
                </button>

                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', paddingLeft: '4px' }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="apex-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', paddingLeft: '14px' }}>
                      <div style={{ width: '14px', height: '14px', border: '1px solid #6B7280', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', background: '#8C52FF', borderRadius: '1px' }} />
                      </div>
                    </th>
                    <th>Agent Version</th>
                    <th>Accuracy / Score</th>
                    <th style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Date</span>
                      <ChevronDown size={11} />
                    </th>
                    <th>Status</th>
                    <th>Triggered by</th>
                    <th style={{ textAlign: 'right', paddingRight: '14px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  
                  {executionHistory.map((row, idx) => (
                    <tr 
                      key={row.id}
                      onClick={() => setSelectedRow(row.id)}
                      style={{ background: selectedRow === row.id ? 'rgba(255,255,255,0.015)' : 'none', cursor: 'pointer' }}
                    >
                      <td style={{ paddingLeft: '14px' }}>
                        <div 
                          style={{ 
                            width: '14px', height: '14px', 
                            border: selectedRow === row.id ? '1px solid #8C52FF' : '1px solid #6B7280', 
                            borderRadius: '3px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: selectedRow === row.id ? '#8C52FF' : 'transparent'
                          }}
                        >
                          {selectedRow === row.id && <Check size={10} color="white" strokeWidth={3} />}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: row.bg || '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                            {row.version.startsWith('v5') ? 'G' : row.version.startsWith('v4') ? 'G' : 'C'}
                          </div>
                          <div>
                            <strong style={{ color: 'white' }}>{row.version}</strong>
                            <div style={{ fontSize: '10.5px', color: '#6B7280' }}>{row.engine}</div>
                          </div>
                        </div>
                      </td>
                      <td><strong style={{ color: 'white' }}>{row.accuracy}</strong></td>
                      <td style={{ color: '#A1AAB8' }}>{row.date}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', color: '#22C55E' }}>
                          <span className="apex-dot-success" /> Completed
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar-initials" style={{ background: row.bg || '#7C3AED' }}>{row.initial}</div>
                          <div>
                            <strong style={{ color: 'white' }}>{row.name}</strong>
                            <div style={{ fontSize: '10px', color: '#6B7280' }}>{row.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '14px' }}>
                        <button className="apex-button-border" style={{ display: 'inline-flex', padding: '4px 10px', fontSize: '11.5px' }}>More</button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>

          </div>

        </>
      )}

    </div>
  );
}
