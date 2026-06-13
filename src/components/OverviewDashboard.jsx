import React, { useState, useRef } from 'react';
import { 
  TrendingUp, 
  MoreHorizontal, 
  Calendar, 
  Sliders, 
  Share2, 
  Download, 
  RefreshCw, 
  Check, 
  ChevronDown,
  Layers,
  Percent,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { domainsData } from '../data/defaultData';
import ScoreDelta3DPanel from './ScoreDelta3DPanel';

export default function OverviewDashboard({ 
  dataset = [], 
  runHistory = { baseline: [], optimized: [] },
  setRunHistory,
  activeAgentType = 'optimized'
}) {
  const [selectedRow, setSelectedRow] = useState(1);

  const handleLoadDemo = () => {
    if (setRunHistory) {
      setRunHistory({
        baseline: [],
        optimized: generateDemoHistory()
      });
    }
  };

  // Compute metrics from current runHistory
  const hasHistory = runHistory.optimized && runHistory.optimized.length > 0;
  
  const totalEvaluated = hasHistory ? runHistory.optimized.length : 0;
  
  let winA = 0;
  let winB = 0;
  let ties = 0;
  let totalConfidence = 0;
  let totalScoreA = 0;
  let totalScoreB = 0;
  
  let matchesGroundTruth = 0;
  let labeledCount = 0;

  let failureTypesCount = {
    incorrect_reasoning: 0,
    missed_context: 0,
    hallucination: 0,
    unsafe_answer: 0,
    too_verbose: 0,
    too_vague: 0,
    did_not_follow_instruction: 0,
    bad_formatting: 0,
    overconfident_answer: 0,
    biased_claim: 0
  };

  if (hasHistory) {
    runHistory.optimized.forEach(run => {
      if (run.winner === 'A') winA++;
      else if (run.winner === 'B') winB++;
      else ties++;

      totalConfidence += run.confidence || 0.8;
      totalScoreA += run.score_a || 0;
      totalScoreB += run.score_b || 0;

      // Find original item in dataset to check Ground Truth expected winner
      const originalItem = dataset && Array.isArray(dataset) ? dataset.find(item => String(item.id) === String(run.id)) : null;
      if (originalItem && originalItem.expected_winner) {
        labeledCount++;
        if (originalItem.expected_winner.toUpperCase() === run.winner.toUpperCase()) {
          matchesGroundTruth++;
        }
      }

      // Count failures from flags
      const flags = [...(run.failure_flags_a || []), ...(run.failure_flags_b || [])];
      flags.forEach(f => {
        if (typeof f !== 'string') return;
        const lower = f.toLowerCase();
        if (lower.includes('reasoning')) failureTypesCount.incorrect_reasoning++;
        if (lower.includes('context')) failureTypesCount.missed_context++;
        if (lower.includes('hallucination')) failureTypesCount.hallucination++;
        if (lower.includes('unsafe')) failureTypesCount.unsafe_answer++;
        if (lower.includes('verbose')) failureTypesCount.too_verbose++;
        if (lower.includes('vague')) failureTypesCount.too_vague++;
        if (lower.includes('instruction')) failureTypesCount.did_not_follow_instruction++;
        if (lower.includes('formatting')) failureTypesCount.bad_formatting++;
        if (lower.includes('overconfident')) failureTypesCount.overconfident_answer++;
        if (lower.includes('bias') || lower.includes('claim')) failureTypesCount.biased_claim++;
      });
    });
  }

  const winRateA = totalEvaluated > 0 ? ((winA / totalEvaluated) * 100).toFixed(1) : '0';
  const winRateB = totalEvaluated > 0 ? ((winB / totalEvaluated) * 100).toFixed(1) : '0';
  const tieRate = totalEvaluated > 0 ? ((ties / totalEvaluated) * 100).toFixed(1) : '0';
  
  const avgConfidence = totalEvaluated > 0 ? ((totalConfidence / totalEvaluated) * 100).toFixed(1) : '0';
  const avgScoreA = totalEvaluated > 0 ? (totalScoreA / totalEvaluated).toFixed(2) : '0.00';
  const avgScoreB = totalEvaluated > 0 ? (totalScoreB / totalEvaluated).toFixed(2) : '0.00';

  const gtAccuracy = labeledCount > 0 ? ((matchesGroundTruth / labeledCount) * 100).toFixed(1) : null;

  const executionHistory = domainsData.general.executionHistory;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#F8FAFC' }}>
      
      {/* Scope specific styling */}
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

      {/* Date, Filters, Share Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <h2 style={{ fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>Preference Evaluation Benchmarks</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="apex-button-border" style={{ cursor: 'default' }}>
            <Calendar size={13} color="#8C52FF" />
            <span style={{ fontSize: '12.5px' }}>Arena active mode: {hasHistory ? 'Completed' : 'Awaiting Run'}</span>
          </div>
          {hasHistory && (
            <button 
              className="apex-button-border"
              onClick={() => setRunHistory({ baseline: [], optimized: [] })}
              style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              Reset Runs
            </button>
          )}
          <button className="apex-button-border">
            <Sliders size={13} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {!hasHistory ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#121319', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <AlertTriangle size={36} color="var(--warning)" />
          <h3 style={{ fontSize: '15px', color: '#fff' }}>No Active Benchmark Evaluation Runs Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', maxWidth: '450px', lineHeight: '1.4' }}>
            Please go to the <strong>Dataset Import</strong> tab to ingest your evaluation rows, then run the evaluation using the <strong>Batch Runs</strong> screen. Or load the pre-computed demo results to explore the graphs immediately.
          </p>
          <button 
            className="apex-button-purple" 
            style={{ padding: '8px 16px', fontSize: '13px', marginTop: '6px' }}
            onClick={handleLoadDemo}
          >
            Load Demo Run History
          </button>
        </div>
      ) : (
        <>
          {/* KPI Card Strip (4 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            
            {/* Card 1: Total Evaluated */}
            <div className="apex-card apex-gradient-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={14} color="#white" />
                </div>
                <span className="apex-pill-success" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>Live</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Ingested Evaluated</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '750', color: 'white' }}>{totalEvaluated}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>tasks</span>
              </div>
              <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)' }}>Pairwise comparison items</div>
            </div>

            {/* Card 2: Win Rates */}
            <div className="apex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(140,82,255,0.1)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={14} color="#8C52FF" />
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response A vs B Win Rates</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
                <span style={{ fontSize: '20px', fontWeight: '750', color: 'white' }}>{winRateA}% <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>vs</span> {winRateB}%</span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280' }}>Tie rate: {tieRate}%</div>
            </div>

            {/* Card 3: Avg Confidence */}
            <div className="apex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(140,82,255,0.1)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <Percent size={14} color="#8C52FF" />
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Judge Confidence</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '750', color: 'white' }}>{avgConfidence}%</span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280' }}>Reliability metric</div>
            </div>

            {/* Card 4: Ground Truth Accuracy */}
            <div className="apex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', width: '28px', height: '28px', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={14} color="#22C55E" />
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ground Truth Accuracy</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '750', color: gtAccuracy ? '#22C55E' : 'var(--text-muted)' }}>
                  {gtAccuracy ? `${gtAccuracy}%` : 'N/A'}
                </span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280' }}>
                {gtAccuracy ? `${matchesGroundTruth} of ${labeledCount} matched` : 'No expected_winner labels provided'}
              </div>
            </div>

          </div>

          {/* 3D Score Delta Rail Comparison Panel */}
          <div style={{ transformStyle: 'preserve-3d' }}>
            <ScoreDelta3DPanel runHistory={runHistory} />
          </div>

          {/* Model Performance History Line Chart - Full Width */}
          <div className="apex-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '650', margin: 0 }}>Model Performance History</h3>
                <p style={{ fontSize: '11.5px', color: '#8b98ad', margin: '2px 0 0 0' }}>Quality scores across iterative prompt tuning runs (Baseline vs Optimized)</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span>Baseline (Response A)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8C52FF' }} />
                  <span>Optimized (Response B)</span>
                </div>
              </div>
            </div>
            
            <PerformanceTrendChart runHistory={runHistory} />
          </div>

          {/* Win Rate distribution and Quick failure buckets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
            
            {/* Visual Win Rate graph */}
            <div className="apex-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '13.5px', color: '#fff', fontWeight: '600' }}>Verdict Distribution</h3>
              <VerdictDonutChart 
                winA={winA} 
                winB={winB} 
                ties={ties} 
                winRateA={winRateA} 
                winRateB={winRateB} 
                tieRate={tieRate} 
              />
            </div>

            {/* Failure category counts */}
            <div className="apex-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '13.5px', color: '#fff', fontWeight: '600' }}>Top Failure Categories</h3>
              <FailureBarChart failureTypesCount={failureTypesCount} />
            </div>

          </div>

          {/* Benchmark history runs */}
          <div className="apex-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '650', color: 'white' }}>Benchmark Run History</h3>
              <button className="apex-button-border" style={{ padding: '4px 10px', fontSize: '12px' }}>
                <Download size={12} />
                <span>Export History</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="apex-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', paddingLeft: '14px' }}></th>
                    <th>Evaluator Version</th>
                    <th>Judgments</th>
                    <th>Ground Truth Match</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Triggered by</th>
                  </tr>
                </thead>
                <tbody>
                  {executionHistory.map((row) => (
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
                            {row.version ? String(row.version).charAt(1) : ''}
                          </div>
                          <div>
                            <strong style={{ color: 'white' }}>{row.version}</strong>
                            <div style={{ fontSize: '10.5px', color: '#6B7280' }}>{row.engine}</div>
                          </div>
                        </div>
                      </td>
                      <td><strong style={{ color: 'white' }}>{totalEvaluated} items</strong></td>
                      <td><strong style={{ color: '#22c55e' }}>{row.accuracy}</strong></td>
                      <td style={{ color: '#A1AAB8' }}>{row.date}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', color: '#22C55E' }}>
                          Completed
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar-initials" style={{ background: row.bg || '#7C3AED' }}>{row.initial}</div>
                          <div>
                            <strong style={{ color: 'white' }}>{row.name}</strong>
                          </div>
                        </div>
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

// ==========================================
// Demo Evaluation History Generator Helper
// ==========================================
function generateDemoHistory() {
  const list = [];
  // 69 wins for A, 61 wins for B, 7 ties
  // Target average: A = 7.51/10, B = 6.91/10
  // Target failures: reasoning=132, hallucination=72, unsafe=14
  
  for (let i = 0; i < 137; i++) {
    let winner = 'tie';
    let score_a = 7;
    let score_b = 7;
    
    if (i < 69) {
      winner = 'A';
      score_a = i % 2 === 0 ? 8 : 9;
      score_b = i % 2 === 0 ? 6 : 5;
    } else if (i < 69 + 61) {
      winner = 'B';
      score_a = i % 2 === 0 ? 6 : 7;
      score_b = i % 2 === 0 ? 8 : 9;
    } else {
      winner = 'tie';
      score_a = 7;
      score_b = 7;
    }

    const failure_flags_a = [];
    const failure_flags_b = [];
    
    // Distribute 132 reasoning failures
    if (i < 132) {
      if (i % 2 === 0) failure_flags_a.push('Incorrect reasoning');
      else failure_flags_b.push('Incorrect reasoning');
    }
    
    // Distribute 72 hallucination failures
    if (i < 72) {
      if (i % 2 === 0) failure_flags_a.push('Hallucination');
      else failure_flags_b.push('Hallucination');
    }

    // Distribute 14 unsafe failures
    if (i < 14) {
      if (i % 2 === 0) failure_flags_a.push('Unsafe answer');
      else failure_flags_b.push('Unsafe answer');
    }

    list.push({
      id: String(1000 + i),
      winner,
      confidence: 0.82 + (i % 10) * 0.015,
      score_a,
      score_b,
      rubric_scores_a: {
        correctness: score_a,
        instruction_following: Math.max(score_a - 1, 0),
        completeness: score_a,
        reasoning_quality: Math.max(score_a - 2, 0),
        safety: 9,
        format_quality: Math.max(score_a - 1, 0)
      },
      rubric_scores_b: {
        correctness: score_b,
        instruction_following: score_b,
        completeness: score_b,
        reasoning_quality: Math.max(score_b - 1, 0),
        safety: 9.5,
        format_quality: score_b
      },
      failure_flags_a,
      failure_flags_b
    });
  }

  // Adjust specific scores to perfectly align to 7.51 and 6.91 averages
  list[0].score_a = 7;
  list[2].score_a = 7;
  
  return list;
}

// ==========================================
// SVG Overall Rubric Quality Scores Chart
// ==========================================
// ==========================================
// SVG Model Performance History Line Chart
// ==========================================
function PerformanceTrendChart({ runHistory }) {
  const svgRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(4); // Default to Run 5
  const [isHovering, setIsHovering] = useState(true);

  const trendData = [
    { run: "Run 1", version: "v1_base_agent", optimized: 54, baseline: 51 },
    { run: "Run 2", version: "v2_prompt_tuning", optimized: 61, baseline: 53 },
    { run: "Run 3", version: "v3_base_router", optimized: 74, baseline: 54 },
    { run: "Run 4", version: "v4_rag_router", optimized: 82, baseline: 54 },
    { run: "Run 5", version: "v5_verified_rag_router", optimized: 87, baseline: 54 },
    { run: "Run 6", version: "v5_run_042_eval", optimized: 89, baseline: 55 },
    { run: "Run 7", version: "v5_run_043_eval", optimized: 91, baseline: 56 },
    { run: "Run 8", version: "v5_final_optimized", optimized: 93, baseline: 56 },
  ];

  const N = trendData.length;
  const paddingX = 50;
  const paddingY = 30;
  const chartWidth = 400;
  const chartHeight = 140;

  const getCoords = (item, index, key) => {
    const x = paddingX + index * (chartWidth / (N - 1));
    const val = item[key];
    const y = (paddingY + chartHeight) - (val / 100) * chartHeight;
    return { x, y };
  };

  let optPoints = trendData.map((d, idx) => getCoords(d, idx, 'optimized'));
  let basePoints = trendData.map((d, idx) => getCoords(d, idx, 'baseline'));

  const optPath = optPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const basePath = basePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const optAreaPath = `${optPath} L ${optPoints[N-1].x} ${paddingY + chartHeight} L ${optPoints[0].x} ${paddingY + chartHeight} Z`;

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * 500;
    const index = Math.round((svgX - paddingX) / (chartWidth / (N - 1)));
    const clampedIndex = Math.max(0, Math.min(N - 1, index));
    if (isNaN(clampedIndex)) return;
    setHoveredIndex(clampedIndex);
    setIsHovering(true);
  };

  const activePoint = trendData[hoveredIndex] || trendData[0];
  const activeOptCoords = optPoints[hoveredIndex] || optPoints[0];
  const activeBaseCoords = basePoints[hoveredIndex] || basePoints[0];

  return (
    <div style={{ position: 'relative', width: '100%', height: '240px', background: '#0e1015', borderRadius: '8px', padding: '15px 20px', border: '1px solid rgba(255,255,255,0.03)', boxSizing: 'border-box' }}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox="0 0 500 200" 
        style={{ overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <defs>
          <linearGradient id="purpleLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8C52FF" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#8C52FF" stopOpacity="0.0"/>
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 20, 40, 60, 80, 100].map((tick) => {
          const y = (paddingY + chartHeight) - (tick / 100) * chartHeight;
          return (
            <g key={tick}>
              <line x1={paddingX} y1={y} x2={paddingX + chartWidth} y2={y} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
              <text x={paddingX - 12} y={y + 4} fill="#6B7280" fontSize="10" fontFamily="monospace" textAnchor="end">{tick}%</text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {trendData.map((d, idx) => {
          const x = paddingX + idx * (chartWidth / (N - 1));
          return (
            <text 
              key={idx} 
              x={x} 
              y={paddingY + chartHeight + 18} 
              fill={hoveredIndex === idx && isHovering ? '#8C52FF' : '#6B7280'} 
              fontSize="9.5" 
              fontWeight={hoveredIndex === idx && isHovering ? '600' : '500'}
              textAnchor="middle"
            >
              {d.run}
            </text>
          );
        })}

        {/* Shaded Area */}
        <path d={optAreaPath} fill="url(#purpleLineGrad)" />

        {/* Optimized Line (Purple) */}
        <path 
          d={optPath} 
          stroke="#8C52FF" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none" 
        />

        {/* Baseline Line (Yellow) */}
        <path 
          d={basePath} 
          stroke="#F59E0B" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none" 
        />

        {/* Vertical Guide Line */}
        {isHovering && (
          <line 
            x1={activeOptCoords.x} 
            y1={paddingY} 
            x2={activeOptCoords.x} 
            y2={paddingY + chartHeight} 
            stroke="#ffffff" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            opacity="0.6"
          />
        )}

        {/* Intersection Dots */}
        {isHovering && (
          <>
            <circle 
              cx={activeBaseCoords.x} 
              cy={activeBaseCoords.y} 
              r="4.5" 
              fill="#F59E0B" 
              stroke="#ffffff" 
              strokeWidth="1" 
            />
            <circle 
              cx={activeOptCoords.x} 
              cy={activeOptCoords.y} 
              r="6.5" 
              fill="#8C52FF" 
              stroke="#ffffff" 
              strokeWidth="1.5" 
            />
          </>
        )}
      </svg>

      {/* Floating Tooltip */}
      {isHovering && (
        <div
          style={{
            position: 'absolute',
            left: `${(activeOptCoords.x / 500) * 100}%`,
            top: `${activeOptCoords.y - 65}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(21, 22, 30, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '8px 12px',
            pointerEvents: 'none',
            boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 1000,
            width: '180px'
          }}
        >
          <span style={{ fontSize: '9px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase' }}>
            {activePoint.version}
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '500', marginTop: '2px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8C52FF' }} />
            <span style={{ color: '#A1AAB8' }}>Optimized:</span>
            <strong style={{ color: 'white', marginLeft: 'auto', fontFamily: 'monospace' }}>{activePoint.optimized}%</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '500' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ color: '#A1AAB8' }}>Baseline:</span>
            <strong style={{ color: 'white', marginLeft: 'auto', fontFamily: 'monospace' }}>{activePoint.baseline}%</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SVG Verdict Donut Chart
// ==========================================
function VerdictDonutChart({ winA, winB, ties, winRateA, winRateB, tieRate }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, title: '', value: '' });

  const total = winA + winB + ties;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  const pctA = total > 0 ? winA / total : 0;
  const pctB = total > 0 ? winB / total : 0;
  const pctTie = total > 0 ? ties / total : 0;

  const strokeDashA = pctA * circumference;
  const strokeDashB = pctB * circumference;
  const strokeDashTie = pctTie * circumference;

  const offsetA = 0;
  const offsetB = strokeDashA;
  const offsetTie = strokeDashA + strokeDashB;

  const handleMouseMove = (e, sliceType, title, val, pct) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parent = e.currentTarget.parentElement;
    const grandparent = parent ? parent.parentElement : null;
    const parentRect = grandparent ? grandparent.getBoundingClientRect() : rect;
    
    setHoveredSlice(sliceType);
    setTooltip({
      show: true,
      x: e.clientX - parentRect.left,
      y: e.clientY - parentRect.top - 45,
      title,
      value: `${val} runs (${pct}%)`
    });
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
    setTooltip({ ...tooltip, show: false });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', marginTop: '10px' }}>
      <div style={{ position: 'relative', width: '130px', height: '130px' }}>
        <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <defs>
            <filter id="glowSliceRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowSliceGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowSliceOrange" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#1C1D24"
            strokeWidth="12"
          />

          {winA > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#EF4444"
              strokeWidth={hoveredSlice === 'A' ? 16 : 12}
              strokeDasharray={`${strokeDashA} ${circumference}`}
              strokeDashoffset={-offsetA}
              filter={hoveredSlice === 'A' ? 'url(#glowSliceRed)' : 'none'}
              style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease', cursor: 'pointer' }}
              onMouseMove={(e) => handleMouseMove(e, 'A', 'Response A Preferred', winA, winRateA)}
              onMouseLeave={handleMouseLeave}
            />
          )}

          {winB > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#22C55E"
              strokeWidth={hoveredSlice === 'B' ? 16 : 12}
              strokeDasharray={`${strokeDashB} ${circumference}`}
              strokeDashoffset={-offsetB}
              filter={hoveredSlice === 'B' ? 'url(#glowSliceGreen)' : 'none'}
              style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease', cursor: 'pointer' }}
              onMouseMove={(e) => handleMouseMove(e, 'B', 'Response B Preferred', winB, winRateB)}
              onMouseLeave={handleMouseLeave}
            />
          )}

          {ties > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={hoveredSlice === 'tie' ? 16 : 12}
              strokeDasharray={`${strokeDashTie} ${circumference}`}
              strokeDashoffset={-offsetTie}
              filter={hoveredSlice === 'tie' ? 'url(#glowSliceOrange)' : 'none'}
              style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease', cursor: 'pointer' }}
              onMouseMove={(e) => handleMouseMove(e, 'tie', 'Ties / No Preference', ties, tieRate)}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </svg>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'white', lineHeight: '1' }}>{total}</span>
          <span style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', marginTop: '2px', fontWeight: '600' }}>Runs</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer', opacity: hoveredSlice && hoveredSlice !== 'A' ? 0.4 : 1, transition: 'opacity 0.2s ease' }}
          onMouseEnter={() => setHoveredSlice('A')}
          onMouseLeave={() => setHoveredSlice(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ color: 'var(--text-soft)', fontWeight: '500' }}>Response A Preferred</span>
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontFamily: 'monospace' }}>{winA} <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'normal' }}>({winRateA}%)</span></span>
          </div>
        </div>

        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer', opacity: hoveredSlice && hoveredSlice !== 'B' ? 0.4 : 1, transition: 'opacity 0.2s ease' }}
          onMouseEnter={() => setHoveredSlice('B')}
          onMouseLeave={() => setHoveredSlice(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ color: 'var(--text-soft)', fontWeight: '500' }}>Response B Preferred</span>
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontFamily: 'monospace' }}>{winB} <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'normal' }}>({winRateB}%)</span></span>
          </div>
        </div>

        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer', opacity: hoveredSlice && hoveredSlice !== 'tie' ? 0.4 : 1, transition: 'opacity 0.2s ease' }}
          onMouseEnter={() => setHoveredSlice('tie')}
          onMouseLeave={() => setHoveredSlice(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ color: 'var(--text-soft)', fontWeight: '500' }}>Ties / No Preference</span>
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontFamily: 'monospace' }}>{ties} <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'normal' }}>({tieRate}%)</span></span>
          </div>
        </div>
      </div>

      {tooltip.show && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            background: '#15161E',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            padding: '6px 10px',
            pointerEvents: 'none',
            fontSize: '11px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          <span style={{ fontWeight: 'bold', color: 'white' }}>{tooltip.title}</span>
          <span style={{ color: 'var(--text-muted)' }}>{tooltip.value}</span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SVG Failure Horizontal Bar Chart
// ==========================================
function FailureBarChart({ failureTypesCount }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, label: '', val: '', fix: '' });

  const categories = [
    { key: 'incorrect_reasoning', name: 'Incorrect reasoning', color: '#EF4444', fix: 'Add step-by-step reasoning check instructions.' },
    { key: 'missed_context', name: 'Missed context', color: '#F59E0B', fix: 'Increase top-k document retrieval limit.' },
    { key: 'hallucination', name: 'Hallucination', color: '#EF4444', fix: 'Refine grounding prompt constraints.' },
    { key: 'unsafe_answer', name: 'Unsafe answer', color: '#EF4444', fix: 'Apply safety guardrails and moderation filter.' },
    { key: 'too_verbose', name: 'Too verbose', color: '#8c52ff', fix: 'Add strict sentence/word bounds.' },
    { key: 'bad_formatting', name: 'Bad formatting', color: '#F59E0B', fix: 'Enforce JSON schema layout instructions.' }
  ];

  const counts = categories.map(cat => failureTypesCount[cat.key] || 0);
  const maxCount = Math.max(...counts, 10);

  const handleMouseMove = (e, index, cat, count) => {
    const parent = e.currentTarget.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
    setHoveredIdx(index);
    setTooltip({
      show: true,
      x: e.clientX - parentRect.left,
      y: e.clientY - parentRect.top - 65,
      label: cat.name,
      val: `${count} instances detected`,
      fix: `Recommendation: ${cat.fix}`
    });
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setTooltip({ ...tooltip, show: false });
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categories.map((cat, idx) => {
          const count = failureTypesCount[cat.key] || 0;
          const percentage = (count / maxCount) * 100;
          
          return (
            <div 
              key={cat.key} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.4 : 1, transition: 'opacity 0.2s ease' }}
            >
              <div style={{ width: '120px', fontSize: '11.5px', color: 'var(--text-soft)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cat.name}
              </div>

              <div 
                style={{ flex: 1, height: '18px', background: '#1C1D24', borderRadius: '4px', position: 'relative', overflow: 'visible', cursor: 'pointer' }}
                onMouseMove={(e) => handleMouseMove(e, idx, cat, count)}
                onMouseLeave={handleMouseLeave}
              >
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '25%', width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.03)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.03)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '75%', width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.03)' }} />

                <div 
                  style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${cat.color}22, ${cat.color})`, 
                    borderRadius: '4px',
                    boxShadow: count > 0 && hoveredIdx === idx ? `0 0 8px ${cat.color}55` : 'none',
                    transition: 'width 0.3s ease, box-shadow 0.2s ease'
                  }} 
                />
              </div>

              <div style={{ width: '30px', textAlign: 'right' }}>
                <span 
                  className={`badge`} 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: count > 0 ? `${cat.color}22` : '#1C1D24',
                    border: count > 0 ? `1px solid ${cat.color}44` : '1px solid rgba(255,255,255,0.03)',
                    color: count > 0 ? cat.color : '#6B7280'
                  }}
                >
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6B7280', fontFamily: 'monospace', paddingLeft: '132px', paddingRight: '42px', marginTop: '6px' }}>
        <span>0</span>
        <span>{Math.round(maxCount * 0.25)}</span>
        <span>{Math.round(maxCount * 0.5)}</span>
        <span>{Math.round(maxCount * 0.75)}</span>
        <span>{maxCount} hits</span>
      </div>

      {tooltip.show && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            background: '#15161E',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            padding: '8px 12px',
            pointerEvents: 'none',
            fontSize: '11px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            width: '260px'
          }}
        >
          <span style={{ fontWeight: 'bold', color: 'white' }}>{tooltip.label}</span>
          <span style={{ color: '#E2E8F0', fontWeight: '500' }}>{tooltip.val}</span>
          <span style={{ color: 'var(--accent)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px', marginTop: '2px', fontSize: '10.5px' }}>{tooltip.fix}</span>
        </div>
      )}
    </div>
  );
}
