import React, { useState } from 'react';
import { Award, Check, AlertTriangle, ShieldAlert, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { RUBRIC_DIMENSIONS } from '../utils/evaluator';

export default function EvaluationLab({ 
  dataset = [], 
  runHistory = { baseline: [], optimized: [] } 
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const hasHistory = runHistory.optimized && runHistory.optimized.length > 0;
  
  if (!hasHistory) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>Pairwise Lab Awaiting Results</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Please execute a benchmark run first in the <strong>Batch Runs</strong> tab before viewing granular pairwise analysis in the lab.
        </p>
      </div>
    );
  }

  const activeRun = runHistory.optimized[selectedIdx];
  const activeItem = dataset.find(item => String(item.id) === String(activeRun?.id)) || dataset[selectedIdx];

  if (!activeRun) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', height: 'calc(100vh - 120px)' }}>
      
      {/* Sidebar List Selector */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: '12.5px', color: 'white', fontWeight: 'bold' }}>
          Ingested Items ({runHistory.optimized.length})
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {runHistory.optimized.map((run, idx) => {
            const isSelected = selectedIdx === idx;
            const original = dataset.find(t => String(t.id) === String(run.id));
            
            return (
              <button
                key={run.id}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  background: isSelected ? 'rgba(140,82,255,0.06)' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: isSelected ? 'white' : 'var(--text-muted)' }}>ID {run.id}</span>
                  <span className={`badge ${run.winner === 'A' ? 'badge-danger' : (run.winner === 'B' ? 'badge-success' : 'badge-warning')}`} style={{ fontSize: '8px', padding: '0px 4px' }}>
                    Winner: {run.winner}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: isSelected ? 'var(--text-soft)' : 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                  {original?.prompt || 'No Prompt'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Pane */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '4px' }}>
        
        {/* Prompt Header */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <span className="badge badge-info" style={{ fontSize: '9px' }}>{activeItem?.domain || 'general'}</span>
            <span className="badge badge-purple" style={{ fontSize: '9px' }}>Difficulty: {activeItem?.difficulty || 'medium'}</span>
            {activeItem?.expected_winner && (
              <span className="badge badge-success" style={{ fontSize: '9px' }}>Ground Truth Label: {activeItem.expected_winner}</span>
            )}
          </div>
          <h3 style={{ fontSize: '13px', color: '#fff', fontWeight: '700', marginBottom: '4px' }}>Prompt:</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: '1.45', fontStyle: 'italic', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px' }}>
            {activeItem?.prompt}
          </p>
        </div>

        {/* Side-by-side Response Viewer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* Response A */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: activeRun.winner === 'A' ? '2px solid var(--danger)' : '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '12.5px', color: 'var(--danger)', fontWeight: 'bold' }}>Candidate Response A</h4>
              <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>Average Score: {activeRun.score_a}</span>
            </div>
            
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.18)', padding: '12px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-soft)', lineHeight: '1.5', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', minHeight: '120px' }}>
              {activeItem?.response_a}
            </div>

            {activeRun.failure_flags_a && activeRun.failure_flags_a.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {activeRun.failure_flags_a.map((f, i) => (
                  <span key={i} className="badge badge-danger" style={{ fontSize: '8px' }}>
                    ⚠️ {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Response B */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: activeRun.winner === 'B' ? '2px solid var(--success)' : '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '12.5px', color: 'var(--success)', fontWeight: 'bold' }}>Candidate Response B</h4>
              <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>Average Score: {activeRun.score_b}</span>
            </div>
            
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.18)', padding: '12px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-soft)', lineHeight: '1.5', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', minHeight: '120px' }}>
              {activeItem?.response_b}
            </div>

            {activeRun.failure_flags_b && activeRun.failure_flags_b.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {activeRun.failure_flags_b.map((f, i) => (
                  <span key={i} className="badge badge-danger" style={{ fontSize: '8px' }}>
                    ⚠️ {f}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Judge Decision and Reasoning */}
        <div className="glass-panel" style={{ padding: '18px', background: '#0e1017', border: '1.5px solid rgba(140,82,255,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>AI Evaluation Verdict</h3>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                Winner: <strong style={{ color: activeRun.winner === 'A' ? 'var(--danger)' : (activeRun.winner === 'B' ? 'var(--success)' : 'var(--warning)'), fontSize: '13px' }}>Response {activeRun.winner}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                Confidence: <strong style={{ color: '#fff' }}>{Math.round(activeRun.confidence * 100)}%</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <strong style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Reasoning Summary</strong>
              <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: '1.5' }}>
                {activeRun.reasoning_summary}
              </p>
            </div>
            
            {activeRun.recommended_improvement && (
              <div style={{ background: 'rgba(140,82,255,0.04)', borderLeft: '3px solid var(--accent)', padding: '8px 12px', borderRadius: '4px', marginTop: '6px' }}>
                <strong style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Recommended Improvement</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-soft)', lineHeight: '1.4' }}>
                  {activeRun.recommended_improvement}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rubric Matrix Sliding Bars */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '14px' }}>Granular Rubric Analysis</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RUBRIC_DIMENSIONS.map((dim) => {
              const scoreA = activeRun.rubric_scores_a?.[dim] || 0;
              const scoreB = activeRun.rubric_scores_b?.[dim] || 0;
              const cleanDim = dim.replace('_', ' ');

              return (
                <div key={dim} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 40px', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '11.5px', textTransform: 'capitalize', color: 'var(--text-soft)' }}>
                    {cleanDim}
                  </span>
                  
                  {/* Sliding comparison bar: A on left (red), B on right (green) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', alignItems: 'center' }}>
                    {/* Response A scale */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', height: '6px', background: '#1c1d24', borderRadius: '3px 0 0 3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${scoreA * 10}%`, 
                          height: '100%', 
                          background: 'var(--danger)', 
                          borderRadius: '3px 0 0 3px',
                          boxShadow: scoreA > scoreB ? '0 0 8px rgba(239, 68, 68, 0.4)' : 'none'
                        }} 
                      />
                    </div>
                    {/* Response B scale */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', height: '6px', background: '#1c1d24', borderRadius: '0 3px 3px 0', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${scoreB * 10}%`, 
                          height: '100%', 
                          background: 'var(--success)', 
                          borderRadius: '0 3px 3px 0',
                          boxShadow: scoreB > scoreA ? '0 0 8px rgba(34, 197, 94, 0.4)' : 'none'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Value numbers A vs B */}
                  <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: scoreA > scoreB ? 'bold' : 'normal' }}>{scoreA}</span>
                    <span style={{ color: 'var(--text-faint)', margin: '0 2px' }}>:</span>
                    <span style={{ color: 'var(--success)', fontWeight: scoreB > scoreA ? 'bold' : 'normal' }}>{scoreB}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
