import React from 'react';
import { ShieldAlert, AlertTriangle, Info, BookOpen, MessageSquareCode } from 'lucide-react';
import { FAILURE_TYPES } from '../utils/evaluator';

export default function FailureAnalysis({ 
  runHistory = { baseline: [], optimized: [] } 
}) {
  const hasHistory = runHistory.optimized && runHistory.optimized.length > 0;

  // Initialize failure counts
  const failureBuckets = {
    [FAILURE_TYPES.INCORRECT_REASONING]: {
      count: 0,
      description: 'Logical fallacies, simple math mistakes, or contradictory assumptions.',
      fix: 'Add explicit step-by-step reasoning triggers (e.g. Chain of Thought) in system instructions.'
    },
    [FAILURE_TYPES.MISSED_CONTEXT]: {
      count: 0,
      description: 'Ignores parameters in prompt, retrieved policies, or temporal constraints.',
      fix: 'Format retrieved context under clear semantic XML dividers (<context></context>) and add enforcement prompts.'
    },
    [FAILURE_TYPES.HALLUCINATION]: {
      count: 0,
      description: 'Falsely claims features or references policies/facts that do not exist.',
      fix: 'Apply strict groundedness instructions: "If the information is not present, reply with: I do not know."'
    },
    [FAILURE_TYPES.UNSAFE_ANSWER]: {
      count: 0,
      description: 'Abusive language, policy bypass attempts, or leakage of sensitive system instructions.',
      fix: 'Integrate pre-evaluation guardrails and strict safety prompt audit filters.'
    },
    [FAILURE_TYPES.TOO_VERBOSE]: {
      count: 0,
      description: 'Excessive fluff, repeated sentences, or unnecessarily long introductions.',
      fix: 'Add conciseness constraint: "Provide answers under 150 words. Omit pleasantries or conversational preambles."'
    },
    [FAILURE_TYPES.TOO_VAGUE]: {
      count: 0,
      description: 'Lacks details, lists too few steps, or provides overly general advice.',
      fix: 'Specify structure expectations: "Outline exactly 5 steps. Provide code blocks for technical actions."'
    },
    [FAILURE_TYPES.DID_NOT_FOLLOW_INSTRUCTION]: {
      count: 0,
      description: 'Misses explicit constraints like word limits, formatting tags, or tone directions.',
      fix: 'Use high-weight markers (e.g., "CRITICAL: ...") or negative constraints ("NEVER do X").'
    },
    [FAILURE_TYPES.BAD_FORMATTING]: {
      count: 0,
      description: 'Malformed JSON blocks, syntax mistakes, or unclosed markdown elements.',
      fix: 'Provide 1-shot JSON examples in prompt. Force model settings to output valid application/json.'
    },
    [FAILURE_TYPES.OVERCONFIDENT_ANSWER]: {
      count: 0,
      description: 'High confidence output that is logically wrong or lacks proper details.',
      fix: 'Instruct the model to express confidence values based on factual certainty markers.'
    },
    [FAILURE_TYPES.BIASED_OR_UNSUPPORTED_CLAIM]: {
      count: 0,
      description: 'Unsupported claims, bias, or opinionated remarks.',
      fix: 'Ground replies in neutral, passive writing styles. Require citations.'
    }
  };

  if (hasHistory) {
    runHistory.optimized.forEach(run => {
      const allFlags = [...(run.failure_flags_a || []), ...(run.failure_flags_b || [])];
      allFlags.forEach(flag => {
        if (failureBuckets[flag]) {
          failureBuckets[flag].count++;
        }
      });
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#CBD5E1' }}>
      
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>Trace Auditing & Failure Analysis</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Aggregate failures bucketed into key enterprise constraints to formulate optimized prompt improvements.
        </p>
      </div>

      {!hasHistory ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>No Active Failure Audits</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Run a benchmark evaluation in the <strong>Batch Runs</strong> tab first to gather failure analytics.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {Object.entries(failureBuckets).map(([name, data]) => {
            const hasFailures = data.count > 0;
            return (
              <div 
                key={name} 
                className="glass-panel" 
                style={{ 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  borderLeft: hasFailures ? '3px solid var(--danger)' : '3.5px solid rgba(255,255,255,0.03)',
                  background: hasFailures ? 'rgba(239, 68, 68, 0.01)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '13px', color: hasFailures ? 'white' : 'var(--text-soft)', fontWeight: '600' }}>
                    {name}
                  </h4>
                  <span className={`badge ${hasFailures ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    {data.count} {data.count === 1 ? 'failure' : 'failures'}
                  </span>
                </div>
                
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {data.description}
                </p>

                {hasFailures && (
                  <div style={{ marginTop: '4px', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                      <MessageSquareCode size={12} color="var(--accent)" />
                      <strong style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase' }}>Recommended Fix</strong>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-soft)', lineHeight: '1.35' }}>
                      {data.fix}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
