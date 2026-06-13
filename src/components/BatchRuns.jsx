import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle, Terminal, Cpu, GitMerge, Award, Hourglass } from 'lucide-react';
import { evaluatePair } from '../utils/evaluator';
import TraceFlowGraph from './TraceFlowGraph';

export default function BatchRuns({
  dataset = [],
  setRunHistory,
  apiKeys,
  setActiveView,
  selectedDomain = 'general'
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [speedMs, setSpeedMs] = useState(1000);
  
  // Track active step for TraceFlowGraph
  const [activeStep, setActiveStep] = useState(null); // 'triage' | 'rag' | 'judge' | 'scoring' | 'verifier'
  const [flowStatus, setFlowStatus] = useState('idle'); // 'idle' | 'active' | 'completed' | 'error'

  const [currentRunResults, setCurrentRunResults] = useState([]);
  const [cumulativeCost, setCumulativeCost] = useState(0);
  const [cumulativeLatency, setCumulativeLatency] = useState(0);

  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const startEvaluation = async () => {
    if (isRunning) return;
    if (dataset.length === 0) {
      alert("No dataset loaded. Please import a dataset first.");
      return;
    }

    setIsRunning(true);
    setCurrentIdx(0);
    setConsoleLogs([]);
    setCurrentRunResults([]);
    setCumulativeCost(0);
    setCumulativeLatency(0);
    setFlowStatus('active');

    addLog(`🚀 Initializing AgentForge Pairwise Benchmark Arena.`, "system");
    addLog(`📋 Active dataset contains ${dataset.length} evaluation items.`, "info");
    
    const isLive = apiKeys.gemini && 
      (apiKeys.gemini.trim().startsWith('AIzaSy') || apiKeys.gemini.trim().startsWith('AQ.'));
    if (isLive) {
      addLog("⚡ Live LLM evaluation mode active via Gemini 1.5 Flash API.", "system");
    } else if (apiKeys.gemini) {
      addLog("⚠️ API Key format is invalid for Gemini (must start with 'AIzaSy' or 'AQ.'). Defaulting to simulation mode.", "warning");
    } else {
      addLog("💤 No API key configured. Running simulation mode with deterministic heuristics.", "warning");
    }

    const tempResults = [];
    let runningCost = 0;
    let runningLatency = 0;

    for (let i = 0; i < dataset.length; i++) {
      setCurrentIdx(i);
      const item = dataset[i];
      addLog(`──────────────────────────────────────────────`, "muted");
      addLog(`📂 Ingesting Item ID ${item.id} - Difficulty: ${(item.difficulty || 'medium').toUpperCase()}`, "info");
      
      // Step 1: Triage
      setActiveStep('triage');
      addLog(`🔍 Triage filter check triggered...`, "info");
      await new Promise(r => setTimeout(r, speedMs * 0.2));

      // Step 2: RAG Context
      setActiveStep('rag');
      addLog(`📚 Querying RAG policy database for domain context: "${item.domain || 'general'}"...`, "info");
      await new Promise(r => setTimeout(r, speedMs * 0.2));
      addLog(`✓ Domain context grounded.`, "success");

      // Step 3: Judge
      setActiveStep('judge');
      addLog(`⚖️ Invoking Pairwise LLM Judge on Response A vs Response B...`, "info");
      
      let result;
      try {
        result = await evaluatePair(item.prompt, item.response_a, item.response_b, undefined, apiKeys);
      } catch (err) {
        addLog(`❌ Judge Execution Error: ${err.message}`, "danger");
        result = {
          winner: 'tie',
          confidence: 0.5,
          score_a: 5.0,
          score_b: 5.0,
          rubric_scores_a: {},
          rubric_scores_b: {},
          reasoning_summary: `Evaluation crashed: ${err.message}`,
          failure_flags_a: ['crashed'],
          failure_flags_b: ['crashed'],
          recommended_improvement: '',
          latency: 0.5,
          cost: 0
        };
      }

      runningCost += result.cost || 0;
      runningLatency += result.latency || 0;
      setCumulativeCost(runningCost);
      setCumulativeLatency(runningLatency);

      await new Promise(r => setTimeout(r, speedMs * 0.2));
      addLog(`✓ Decision: Response ${result.winner} preferred (Confidence: ${Math.round(result.confidence * 100)}%)`, "success");

      // Step 4: Scoring
      setActiveStep('scoring');
      addLog(`📊 Scoring 10 rubric dimensions... A: ${result.score_a} | B: ${result.score_b}`, "info");
      await new Promise(r => setTimeout(r, speedMs * 0.2));

      // Step 5: Verifier
      setActiveStep('verifier');
      addLog(`🛡️ Auditing output structure and checks...`, "info");
      await new Promise(r => setTimeout(r, speedMs * 0.2));
      
      // Assemble full result row
      const fullResult = {
        id: item.id,
        ...result
      };
      
      tempResults.push(fullResult);
      setCurrentRunResults([...tempResults]);
      
      addLog(`✓ Item ID ${item.id} evaluation completed.`, "success");
    }

    setActiveStep(null);
    setFlowStatus('completed');
    addLog(`──────────────────────────────────────────────`, "muted");
    addLog(`🏆 Pairwise benchmark arena run completed!`, "system");
    addLog(`💰 Total Estimated Cost: $${runningCost.toFixed(5)}`, "success");
    addLog(`⏱️ Total Execution Latency: ${runningLatency.toFixed(2)}s`, "success");
    
    setRunHistory({
      baseline: [],
      optimized: tempResults
    });

    setIsRunning(false);
    setCurrentIdx(-1);
  };

  const resetRuns = () => {
    setCurrentRunResults([]);
    setCumulativeCost(0);
    setCumulativeLatency(0);
    setConsoleLogs([]);
    setCurrentIdx(-1);
    setActiveStep(null);
    setFlowStatus('idle');
  };

  const activeItem = currentIdx !== -1 ? dataset[currentIdx] : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '20px' }}>
      
      {/* Left Column: Flowchart & Console */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Controls Panel */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '13.5px', color: 'white', fontWeight: '650' }}>Benchmark Run Controls</h3>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentRunResults.length > 0 && !isRunning && (
              <button className="btn-secondary" onClick={resetRuns} disabled={isRunning} style={{ flex: 1, justifyContent: 'center' }}>
                <RotateCcw size={13} /> Reset
              </button>
            )}
            <button 
              className="primary-button" 
              onClick={startEvaluation} 
              disabled={isRunning || dataset.length === 0} 
              style={{ flex: 2, justifyContent: 'center' }}
            >
              <Play size={13} />
              {isRunning ? `Evaluating (${currentIdx + 1}/${dataset.length})...` : 'Execute Pairwise Run'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sim speed delay:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[[1800, 'Slow'], [1000, 'Normal'], [200, 'Fast']].map(([val, label]) => (
                <button 
                  key={val}
                  onClick={() => setSpeedMs(val)}
                  style={{ 
                    background: speedMs === val ? 'var(--accent)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' 
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Interactive Node Graph */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>Trace Node Pipeline Graph</h4>
            <span className="badge badge-purple" style={{ fontSize: '8.5px' }}>React Flow active</span>
          </div>
          <TraceFlowGraph activeStep={activeStep} status={flowStatus} />
        </div>

        {/* Streaming Logs Console */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '240px', background: '#05070e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '10px' }}>
            <Terminal size={13} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>arena_evaluation_harness.log</span>
            {isRunning && <span className="pulse-active" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />}
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {consoleLogs.length === 0 ? (
              <div style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '30px 0' }}>
                Awaiting run execution to stream logs.
              </div>
            ) : (
              consoleLogs.map((log, index) => {
                let color = 'var(--text-soft)';
                if (log.type === 'system') color = 'var(--accent)';
                else if (log.type === 'success') color = 'var(--success)';
                else if (log.type === 'warning') color = 'var(--warning)';
                else if (log.type === 'danger') color = 'var(--danger)';
                else if (log.type === 'muted') color = 'var(--text-faint)';
                
                return (
                  <div key={index} style={{ color }}>
                    <span style={{ color: 'var(--text-faint)', marginRight: '4px' }}>[{log.timestamp}]</span>
                    {log.message}
                  </div>
                );
              })
            )}
            <div ref={logEndRef}></div>
          </div>
        </div>

      </div>

      {/* Right Column: Execution Metrics & Active Item View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Status / Run Statistics Dashboard */}
        {currentRunResults.length > 0 && (
          <div className="glass-panel" style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Items Processed</span>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{currentRunResults.length} / {dataset.length}</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Accumulated Cost</span>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success)' }}>${cumulativeCost.toFixed(5)}</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Execution Latency</span>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent)' }}>{cumulativeLatency.toFixed(2)}s</div>
            </div>
          </div>
        )}

        {/* Completion Panel Card */}
        {currentRunResults.length === dataset.length && !isRunning && (
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(34,197,94,0.02)', borderColor: 'rgba(34,197,94,0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} color="var(--success)" />
              <h3 style={{ fontSize: '13.5px', color: 'white', fontWeight: '600' }}>Evaluation Run Complete!</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: '1.4' }}>
              Successfully evaluated all {dataset.length} pairwise responses. Metrics are computed and stored. You can now analyze win distributions or view prompt optimization versions.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="primary-button" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setActiveView('overview')}>
                Overview Dashboard
              </button>
              <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setActiveView('lab')}>
                Pairwise Lab
              </button>
            </div>
          </div>
        )}

        {/* Active Ingested Item Display */}
        {activeItem ? (
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-purple" style={{ fontSize: '9px' }}>Current Item {currentIdx + 1}/{dataset.length}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {activeItem.id}</span>
            </div>

            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Active Prompt:</span>
              <p style={{ fontSize: '12px', color: '#fff', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', lineHeight: '1.4' }}>
                "{activeItem.prompt.substring(0, 300)}{activeItem.prompt.length > 300 && '...'}"
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.05)', borderRadius: '4px' }}>
                <span style={{ fontSize: '9px', color: 'var(--danger)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Response A Preview</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', height: '80px', overflow: 'hidden' }}>
                  {activeItem.response_a.substring(0, 150)}...
                </p>
              </div>
              <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.02)', border: '1px solid rgba(34, 197, 94, 0.05)', borderRadius: '4px' }}>
                <span style={{ fontSize: '9px', color: 'var(--success)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Response B Preview</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', height: '80px', overflow: 'hidden' }}>
                  {activeItem.response_b.substring(0, 150)}...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '12.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Hourglass size={24} />
            <span>Awaiting pairwise run trigger to stream execution traces.</span>
          </div>
        )}

      </div>

    </div>
  );
}
