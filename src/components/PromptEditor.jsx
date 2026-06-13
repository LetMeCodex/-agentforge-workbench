import React, { useState } from 'react';
import { Sliders, Zap, CheckCircle2, Shield, Settings, Info } from 'lucide-react';

export default function PromptEditor({
  baselinePrompt,
  setBaselinePrompt,
  optimizedPrompt,
  setOptimizedPrompt,
  optToggles,
  setOptToggles
}) {
  const [baseInput, setBaseInput] = useState(baselinePrompt);
  const [optInput, setOptInput] = useState(optimizedPrompt);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when parent props change (e.g. on domain switch)
  React.useEffect(() => {
    setBaseInput(baselinePrompt);
    setOptInput(optimizedPrompt);
  }, [baselinePrompt, optimizedPrompt]);

  const handleSave = () => {
    setBaselinePrompt(baseInput);
    setOptimizedPrompt(optInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleConfig = (key) => {
    setOptToggles({
      ...optToggles,
      [key]: !optToggles[key]
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Settings Header banner */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', marginBottom: '2px' }}>
            System prompts and compilation configurations
          </h3>
          <p style={{ color: 'var(--text-soft)', fontSize: '12px' }}>
            Iterate and adjust instructions for evaluation models. Save updates to trigger subsequent run audits.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isSaved && (
            <span style={{ color: 'var(--success)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Configuration Saved
            </span>
          )}
          <button className="glow-button" onClick={handleSave} style={{ padding: '6px 14px', fontSize: '12px' }}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Editor Split screen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Side: Baseline Prompt */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Baseline agent prompt
            </h4>
            <span className="badge badge-danger" style={{ fontSize: '9px', padding: '1px 5px' }}>v1_unstructured</span>
          </div>

          <div>
            <textarea
              value={baseInput}
              onChange={(e) => setBaseInput(e.target.value)}
              rows="10"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: '1.4',
                color: 'var(--text)',
                borderColor: 'var(--border)',
                background: 'var(--panel-elevated)',
                padding: '10px'
              }}
            ></textarea>
          </div>

          {/* Locked indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Architecture control pipelines
            </span>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>RAG vector document context</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={false} readOnly disabled />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>JSON formatting restriction</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={false} readOnly disabled />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>Dual-pass verifier auditor</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={false} readOnly disabled />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div style={{ padding: '10px', background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '4px', fontSize: '11.5px', color: 'var(--danger)', lineHeight: '1.4' }}>
            Without structural grounding filters, this bot relies solely on its pre-trained knowledge base. It is prone to inventing rules, approving unauthorized refunds, and ignoring custom SLA priorities.
          </div>
        </div>

        {/* Right Side: Optimized Prompt */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Optimized agent prompt
            </h4>
            <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 5px' }}>v5_verified_rag_router</span>
          </div>

          <div>
            <textarea
              value={optInput}
              onChange={(e) => setOptInput(e.target.value)}
              rows="10"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: '1.4',
                color: 'var(--text)',
                borderColor: 'var(--border)',
                background: 'var(--panel-elevated)',
                padding: '10px'
              }}
            ></textarea>
          </div>

          {/* Interactive Toggle Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Architecture control pipelines
            </span>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>RAG vector document context</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={optToggles.rag} 
                  onChange={() => toggleConfig('rag')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>JSON formatting restriction</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={optToggles.json} 
                  onChange={() => toggleConfig('json')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>Dual-pass verifier auditor</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={optToggles.verifier} 
                  onChange={() => toggleConfig('verifier')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div style={{ padding: '10px', background: 'var(--success-soft)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '4px', fontSize: '11.5px', color: 'var(--success)', lineHeight: '1.4', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--success)' }} />
            <span>
              Grounding the LLM inside RAG policy documents prevents hallucinations. The verifier acts as a secondary model loop to check and correct unauthorized action attempts before publication.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
