import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, HelpCircle, FileText, ChevronRight, XCircle } from 'lucide-react';
import { promptVersions } from '../data/defaultData';
import ScoreDelta3DPanel from './ScoreDelta3DPanel';

export default function Dashboard({ dataset, runHistory, activeView, setActiveView, focusOnFailures = false }) {
  const [selectedFailure, setSelectedFailure] = useState(null);

  const hasHistory = runHistory.baseline.length > 0 && runHistory.optimized.length > 0;
  
  // Calculate average scores and metrics
  const getAverageScore = (runs) => {
    if (runs.length === 0) return 0;
    const total = runs.reduce((sum, run) => sum + (run.eval?.score || 0), 0);
    return Math.round(total / runs.length);
  };

  const getMetricPercentage = (runs, metricKey) => {
    if (runs.length === 0) return 0;
    const correct = runs.filter(run => run.eval?.[metricKey] === true).length;
    return Math.round((correct / runs.length) * 100);
  };

  const getAverageGroundedness = (runs) => {
    if (runs.length === 0) return 0;
    const total = runs.reduce((sum, run) => sum + (run.eval?.groundedness || 0), 0);
    return Math.round((total / runs.length) * 100);
  };

  const getAverageCost = (runs) => {
    if (runs.length === 0) return 0;
    const total = runs.reduce((sum, run) => sum + (run.cost || 0), 0);
    return parseFloat((total / runs.length).toFixed(2));
  };

  const getAverageLatency = (runs) => {
    if (runs.length === 0) return 0;
    const total = runs.reduce((sum, run) => sum + (run.latency || 0), 0);
    return parseFloat((total / runs.length).toFixed(2));
  };

  const baselineScore = hasHistory ? getAverageScore(runHistory.baseline) : 54;
  const optimizedScore = hasHistory ? getAverageScore(runHistory.optimized) : 87;

  const baseCost = hasHistory ? getAverageCost(runHistory.baseline) : 0.72;
  const optCost = hasHistory ? getAverageCost(runHistory.optimized) : 0.41;

  const baseLatency = hasHistory ? getAverageLatency(runHistory.baseline) : 1.2;
  const optLatency = hasHistory ? getAverageLatency(runHistory.optimized) : 1.9;

  // Comparison metrics mapping
  const metrics = [
    {
      name: "Task Success",
      baseline: hasHistory ? getMetricPercentage(runHistory.baseline, 'success') : 54,
      optimized: hasHistory ? getMetricPercentage(runHistory.optimized, 'success') : 87,
    },
    {
      name: "Policy Compliance",
      baseline: hasHistory ? getMetricPercentage(runHistory.baseline, 'policyCompliant') : 48,
      optimized: hasHistory ? getMetricPercentage(runHistory.optimized, 'policyCompliant') : 91,
    },
    {
      name: "Groundedness",
      baseline: hasHistory ? getAverageGroundedness(runHistory.baseline) : 71,
      optimized: hasHistory ? getAverageGroundedness(runHistory.optimized) : 93,
    },
    {
      name: "Escalation Accuracy",
      baseline: hasHistory ? getMetricPercentage(runHistory.baseline, 'escalateCorrect') : 61,
      optimized: hasHistory ? getMetricPercentage(runHistory.optimized, 'escalateCorrect') : 89,
    },
    {
      name: "Format Validity",
      baseline: 0,
      optimized: hasHistory ? getMetricPercentage(runHistory.optimized, 'formatValid') : 100,
    },
    {
      name: "Cost Efficiency",
      baseline: 40,
      optimized: 88,
    }
  ];

  // Failure Buckets
  const failureBuckets = [
    { type: "Wrong escalation logic", count: 8, severity: "high", fix: "Add human safety escalation criteria to system instructions." },
    { type: "Policy mismatch delay", count: 6, severity: "high", fix: "Increase retrieval top-k from 3 to 5 for timeline limits." },
    { type: "Bad context retrieval", count: 9, severity: "medium", fix: "Tune overlap chunks chunk_size parameters to 500." },
    { type: "Hallucinated answers", count: 5, severity: "high", fix: "Ground prompt strictly in vector text matches; penalize generation." },
    { type: "Invalid JSON parsing", count: 3, severity: "medium", fix: "Enforce strict JSON schema keys in parser prompt rules." },
    { type: "Low confidence answered", count: 4, severity: "low", fix: "Raise automatic routing threshold limit to 0.72." }
  ];

  // Simulated critical failures
  const failuresList = [
    { id: 2, ticket_id: "TKT-1090", name: "Robert Miller", error: "Approved return shipping refund to Standard account", doc: "Shipping & Return Logistics" },
    { id: 5, ticket_id: "TKT-1093", name: "David Sterling", error: "Failed to trigger safety escalation for smoking speaker", doc: "Safety & Legal Escalation Rules" },
    { id: 6, ticket_id: "TKT-1094", name: "Harvey Specter", error: "Ignored attorney mention; missed legal routing", doc: "Safety & Legal Escalation Rules" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 6-Card KPI Strip (Wide + 5 Small) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        
        {/* Card 1: Wide overall score delta */}
        <div className="glass-panel" style={{ padding: '12px', gridColumn: 'span 2', borderLeft: '2px solid var(--accent)' }}>
          <div className="text-label" style={{ fontSize: '9.5px', marginBottom: '4px' }}>Overall score delta</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'baseline', gap: '6px', fontFamily: 'var(--font-mono)' }}>
            {baselineScore}%
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>→</span>
            {optimizedScore}%
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--success)', marginTop: '2px', fontWeight: '600' }}>
            +{optimizedScore - baselineScore} pts optimized lift
          </div>
        </div>

        {/* Card 2: Policy compliance */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div className="text-label" style={{ fontSize: '9.5px', marginBottom: '4px' }}>Policy compliance</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'var(--font-mono)' }}>
            91%
            <span style={{ fontSize: '9px', color: 'var(--success)', fontWeight: '500' }}>+43%</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Policy rule adherence
          </div>
        </div>

        {/* Card 3: Hallucination rate */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div className="text-label" style={{ fontSize: '9.5px', marginBottom: '4px' }}>Hallucination rate</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'var(--font-mono)' }}>
            7%
            <span style={{ fontSize: '9px', color: 'var(--success)', fontWeight: '500' }}>-22%</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            RAG source faith
          </div>
        </div>

        {/* Card 4: Escalation accuracy */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div className="text-label" style={{ fontSize: '9.5px', marginBottom: '4px' }}>Escalation accuracy</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'var(--font-mono)' }}>
            89%
            <span style={{ fontSize: '9px', color: 'var(--success)', fontWeight: '500' }}>+28%</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            VIP & risk escalation
          </div>
        </div>

        {/* Card 5: Cost per ticket */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div className="text-label" style={{ fontSize: '9.5px', marginBottom: '4px' }}>Cost per ticket</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'var(--font-mono)' }}>
            ₹{optCost}
            <span style={{ fontSize: '9px', color: 'var(--success)', fontWeight: '500' }}>-43%</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Routed to cheap model
          </div>
        </div>

        {/* Card 6: Latency */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div className="text-label" style={{ fontSize: '9.5px', marginBottom: '4px' }}>Average Latency</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'var(--font-mono)' }}>
            {optLatency}s
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>vs {baseLatency}s</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            verifier audit loops
          </div>
        </div>

      </div>

      {/* 3-Column Observability Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 1.5fr', gap: '20px' }}>
        
        {/* Left Column: Prompt history */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: '650', color: 'var(--text)', marginBottom: '2px' }}>
              Prompt history
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Evaluation history across agent versions.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                <th style={{ padding: '4px 2px' }}>Version</th>
                <th style={{ padding: '4px 2px', textAlign: 'center' }}>Score</th>
                <th style={{ padding: '4px 2px', textAlign: 'center' }}>Cost</th>
                <th style={{ padding: '4px 2px', textAlign: 'right' }}>Lat</th>
              </tr>
            </thead>
            <tbody>
              {promptVersions.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 2px', color: 'var(--text)', fontWeight: '500' }}>
                    {p.version.split(':')[0]}
                  </td>
                  <td style={{ padding: '6px 2px', textAlign: 'center', color: idx === 4 ? 'var(--success)' : 'var(--text-soft)' }}>
                    <strong>{p.score}%</strong>
                  </td>
                  <td style={{ padding: '6px 2px', textAlign: 'center', color: 'var(--text-muted)' }}>{p.cost}</td>
                  <td style={{ padding: '6px 2px', textAlign: 'right', color: 'var(--text-muted)' }}>{p.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Prompt insight callout */}
          <div className="callout-box" style={{ fontSize: '11.5px', marginTop: '4px' }}>
            v5 reduced cost by 22.6% from v4 while improving score by 5 points.
          </div>
        </div>

        {/* Center Column: Score delta */}
        <ScoreDelta3DPanel runHistory={runHistory} />

        {/* Right Column: Failure categories */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: '650', color: 'var(--text)', marginBottom: '2px' }}>
              Failure categories
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Failures detected during benchmark runs.
            </p>
          </div>

          {/* Failure lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {failureBuckets.map((bucket, index) => (
              <div key={index} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-soft)', fontWeight: '500' }}>{bucket.type}</span>
                  <span className={`badge ${bucket.severity === 'high' ? 'badge-danger' : bucket.severity === 'medium' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '8.5px', padding: '1px 3px' }}>
                    {bucket.count} hits
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Fix: {bucket.fix}
                </div>
              </div>
            ))}
          </div>

          {/* Optimizer Suggestions */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.05em' }}>
              Optimizer suggestions
            </span>
            <div className="callout-box" style={{ fontSize: '11px', background: 'var(--panel-elevated)' }}>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>
                Rule Patch: Warranty battery chargers
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                Avoid LLM diagnostic queries for melting battery components.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--accent)' }}>
                PATCH: "IF query matches 'smoke' or 'melting', should_escalate = true."
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Failures compare lists */}
      {(focusOnFailures || hasHistory) && (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13.5px', fontWeight: '650', color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="var(--warning)" />
            Failure Case Comparisons
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {failuresList.map(fail => (
              <div 
                key={fail.id} 
                className="glass-card"
                onClick={() => setSelectedFailure(selectedFailure === fail.id ? null : fail.id)}
                style={{ 
                  cursor: 'pointer',
                  padding: '10px 12px',
                  borderLeft: `2.5px solid ${selectedFailure === fail.id ? 'var(--accent)' : 'var(--danger)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{fail.ticket_id}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>{fail.name}</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Policy: {fail.doc}</span>
                  </div>
                  <span className="badge badge-danger" style={{ textTransform: 'none', fontSize: '9px', padding: '1px 4px' }}>
                    {fail.error}
                  </span>
                </div>

                {selectedFailure === fail.id && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '2px', lineHeight: '1.4' }}>
                    <strong>Suggested Correction:</strong> Refine grounding guidelines in Agent Lab system instructions to strictly audit customer tier (VIP status checking) and restrict standard remorse waiving.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
