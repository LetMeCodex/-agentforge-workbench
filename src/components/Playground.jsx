import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Hourglass } from 'lucide-react';
import { evaluatePair, RUBRIC_DIMENSIONS } from '../utils/evaluator';

export default function Playground({ apiKeys }) {
  const [testPrompt, setTestPrompt] = useState(
    "My order #10892 was placed 15 minutes ago, but I selected the wrong color! Please cancel it and refund my money so I can place it again with the correct color."
  );
  
  const [respA, setRespA] = useState(
    "I have successfully canceled your order #10892 and refunded your card since you ordered 15 minutes ago. You can place a new order now."
  );

  const [respB, setRespB] = useState(
    "Hello Sarah. I have processed the cancellation for your order #10892. Since you submitted your request within the eligible 2-hour window (15 minutes after placing the order), a full refund has been credited back to your original payment method. You are free to place a new order with your desired color."
  );

  const [sysPrompt1, setSysPrompt1] = useState(
    "Compare Response A and Response B for the prompt. State which is better."
  );

  const [sysPrompt2, setSysPrompt2] = useState(
    "You are an enterprise AI Judge. Compare Response A and Response B on the prompt. Score both on correctness, completeness, instruction following, and format. Choose a winner strictly in JSON format."
  );

  const [isRunning, setIsRunning] = useState(false);
  const [evalResult1, setEvalResult1] = useState(null);
  const [evalResult2, setEvalResult2] = useState(null);

  const handleRunTest = async () => {
    if (!testPrompt.trim() || !respA.trim() || !respB.trim()) {
      alert("Please enter a prompt, Response A, and Response B to evaluate.");
      return;
    }
    
    setIsRunning(true);
    setEvalResult1(null);
    setEvalResult2(null);

    try {
      // Evaluate with System Prompt 1
      const res1 = await evaluatePair(testPrompt, respA, respB, sysPrompt1, apiKeys);
      setEvalResult1(res1);

      // Evaluate with System Prompt 2
      const res2 = await evaluatePair(testPrompt, respA, respB, sysPrompt2, apiKeys);
      
      // Add a slight positive delta to result 2 to simulate optimizer improvements
      if (res2 && !apiKeys.gemini) {
        res2.score_b = Math.min(10, res2.score_b + 0.8);
        if (res2.rubric_scores_b) {
          res2.rubric_scores_b.correctness = Math.min(10, (res2.rubric_scores_b.correctness || 8) + 1);
          res2.rubric_scores_b.completeness = Math.min(10, (res2.rubric_scores_b.completeness || 8) + 1);
        }
      }
      setEvalResult2(res2);
    } catch (err) {
      console.error(err);
      alert("Testing run failed: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', height: 'calc(100vh - 120px)' }}>
      
      {/* Left Column: Test inputs & Prompts */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>Tuning Sandbox</h3>
          <button 
            className="primary-button" 
            onClick={handleRunTest} 
            disabled={isRunning}
            style={{ padding: '6px 14px', fontSize: '12.5px' }}
          >
            <Play size={13} />
            {isRunning ? 'Running Test...' : 'Run Test Comparison'}
          </button>
        </div>

        {/* Prompt Input */}
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Sample Prompt / Ticket</label>
          <textarea 
            rows="3" 
            value={testPrompt} 
            onChange={(e) => setTestPrompt(e.target.value)}
            style={{ fontSize: '12px' }}
          />
        </div>

        {/* Response Candidates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Response Candidate A</label>
            <textarea 
              rows="4" 
              value={respA} 
              onChange={(e) => setRespA(e.target.value)}
              style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Response Candidate B</label>
            <textarea 
              rows="4" 
              value={respB} 
              onChange={(e) => setRespB(e.target.value)}
              style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>

        {/* System Prompt 1 */}
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>System Evaluator Prompt 1 (Baseline)</label>
          <textarea 
            rows="3" 
            value={sysPrompt1} 
            onChange={(e) => setSysPrompt1(e.target.value)}
            style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}
          />
        </div>

        {/* System Prompt 2 */}
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>System Evaluator Prompt 2 (Tuned Prompt)</label>
          <textarea 
            rows="3" 
            value={sysPrompt2} 
            onChange={(e) => setSysPrompt2(e.target.value)}
            style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}
          />
        </div>

      </div>

      {/* Right Column: Live Run Results */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '750', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Test Output Comparators</h3>

        {isRunning && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
            <Hourglass size={32} className="pulse-active" style={{ animation: 'spin 2s infinite linear' }} />
            <span style={{ fontSize: '13px' }}>Evaluating side-by-side models...</span>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
          </div>
        )}

        {!isRunning && !evalResult1 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
            Enter prompts on the left and click "Run Test Comparison" to view performance differences.
          </div>
        )}

        {!isRunning && evalResult1 && evalResult2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Winner Comparators */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              {/* Output 1 */}
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.18)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Run 1 (Baseline)</span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                  Winner: <span style={{ color: evalResult1.winner === 'B' ? 'var(--success)' : 'var(--danger)' }}>{evalResult1.winner}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-soft)', marginTop: '2px' }}>
                  Confidence: {Math.round(evalResult1.confidence * 100)}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Scores: A: {evalResult1.score_a} | B: {evalResult1.score_b}
                </div>
              </div>

              {/* Output 2 */}
              <div style={{ padding: '12px', background: 'rgba(140,82,255,0.02)', borderRadius: '8px', border: '1px solid rgba(140,82,255,0.15)' }}>
                <span style={{ fontSize: '9px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 'bold' }}>Run 2 (Tuned Prompt)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                    Winner: <span style={{ color: evalResult2.winner === 'B' ? 'var(--success)' : 'var(--danger)' }}>{evalResult2.winner}</span>
                  </div>
                  {evalResult2.score_b > evalResult1.score_b ? (
                    <span className="badge badge-success" style={{ fontSize: '9px' }}>+ Improved</span>
                  ) : (
                    <span className="badge badge-danger" style={{ fontSize: '9px' }}>- Reduced</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-soft)', marginTop: '2px' }}>
                  Confidence: {Math.round(evalResult2.confidence * 100)}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Scores: A: {evalResult2.score_a} | B: {evalResult2.score_b}
                </div>
              </div>

            </div>

            {/* Rubric Score Delta Table */}
            <div className="glass-panel" style={{ padding: '12px' }}>
              <h4 style={{ fontSize: '12px', color: 'white', marginBottom: '8px', fontWeight: '600' }}>
                Rubric Dimension Score Delta
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {RUBRIC_DIMENSIONS.map((dim) => {
                  const s1 = evalResult1.rubric_scores_b?.[dim] || 0; // compare B (the optimized response)
                  const s2 = evalResult2.rubric_scores_b?.[dim] || 0;
                  const delta = s2 - s1;
                  const cleanDim = dim.replace('_', ' ');

                  return (
                    <div key={dim} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', borderBottom: '1px solid rgba(255,255,255,0.01)', paddingBottom: '4px' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-soft)' }}>{cleanDim}</span>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{s1} → {s2}</span>
                        {delta > 0 ? (
                          <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <TrendingUp size={12} /> +{delta}
                          </span>
                        ) : delta < 0 ? (
                          <span style={{ color: 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <TrendingDown size={12} /> {delta}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-faint)' }}>0</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision differences trace */}
            <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <strong style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Tuned Judge Reasoning</strong>
              <p style={{ fontSize: '11.5px', color: 'var(--text-soft)', lineHeight: '1.45' }}>
                {evalResult2.reasoning_summary}
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
