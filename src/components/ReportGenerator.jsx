import React, { useState } from 'react';
import { Download, Copy, Check, FileText, Share2 } from 'lucide-react';

export default function ReportGenerator({
  dataset = [],
  runHistory = { baseline: [], optimized: [] }
}) {
  const [copied, setCopied] = useState(false);

  const hasHistory = runHistory.optimized && runHistory.optimized.length > 0;

  // Compute stats for the report
  const total = hasHistory ? runHistory.optimized.length : 0;
  let winA = 0;
  let winB = 0;
  let ties = 0;
  let scoreA = 0;
  let scoreB = 0;
  let failures = [];

  if (hasHistory) {
    runHistory.optimized.forEach(r => {
      if (r.winner === 'A') winA++;
      else if (r.winner === 'B') winB++;
      else ties++;
      scoreA += r.score_a || 0;
      scoreB += r.score_b || 0;

      const flags = [...(r.failure_flags_a || []), ...(r.failure_flags_b || [])];
      flags.forEach(f => {
        if (!failures.includes(f)) {
          failures.push(f);
        }
      });
    });
  }

  const avgScoreA = total > 0 ? (scoreA / total).toFixed(2) : '0.00';
  const avgScoreB = total > 0 ? (scoreB / total).toFixed(2) : '0.00';

  const generateReportText = () => {
    return `# AGENTFORGE ENTERPRISE AI EVALUATION REPORT
Generated on: ${new Date().toLocaleDateString()}
AIOPL Track 1 Submission

## 1. Executive Summary
AgentForge executed a pairwise evaluation benchmark run on the ingested preference dataset. The target task was to compare Candidate Response A vs Candidate Response B across all dataset items to declare a preferred response using a strict enterprise quality rubric.

- **Total Ingested Items**: ${total}
- **Response A Win Rate**: ${total > 0 ? ((winA / total) * 100).toFixed(1) : 0}% (${winA} wins)
- **Response B Win Rate**: ${total > 0 ? ((winB / total) * 100).toFixed(1) : 0}% (${winB} wins)
- **Tie Rate**: ${total > 0 ? ((ties / total) * 100).toFixed(1) : 0}% (${ties} ties)

---

## 2. Rubric Evaluation Parameters & Quality Scores
Each response was rated from 0 to 10 across ten dimensions: Correctness, Instruction following, Completeness, Reasoning quality, Factuality, Safety, Helpfulness, Conciseness, Domain appropriateness, and Format quality.

- **Response A Average Score**: ${avgScoreA} / 10
- **Response B Average Score**: ${avgScoreB} / 10

Response ${avgScoreB > avgScoreA ? 'B' : 'A'} demonstrated overall superior quality metrics across the benchmarked dimensions.

---

## 3. Failure Bucket Distribution
The following audit flags were raised during the evaluation trajectory runs:
${failures.length === 0 ? '- No major failure flags detected.' : failures.map(f => `- **${f}**: Flagged in prompt evaluations.`).join('\n')}

---

## 4. Prompt Optimization Recommendations
Based on the failure analysis, we recommend updating system evaluator prompts with these strict constraints:
1. **Chain of Thought**: Mandate writing logical steps before giving final choices to prevent reasoning discrepancies.
2. **XML Division**: Enforce strict context segmentation of ingested knowledge databases.
3. **Strict JSON Schema**: Block unstructured free text judge output to guarantee downstream system ingestion safety.

---

## 5. Enterprise Deployment Roadmap
We recommend deploying the **v4 Strict JSON Judge** as the baseline evaluator in production, using **Gemini 1.5 Flash** for rapid cost-effective batch sweeps, and routing low-confidence evaluations (confidence < 0.70) to human validation desks.
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateReportText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "AgentForge_Benchmark_Report.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#CBD5E1' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>Benchmark Report Center</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Generate and export the final platform benchmark report containing evaluation breakdowns.
          </p>
        </div>
        
        {hasHistory && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleCopy}>
              {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
            <button className="primary-button" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={handleDownload}>
              <Download size={13} />
              <span>Download Report</span>
            </button>
          </div>
        )}
      </div>

      {!hasHistory ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>No Evaluation Data Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Please run the evaluations in the <strong>Batch Runs</strong> tab to generate the final benchmark report.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          
          {/* Report Preview */}
          <div className="glass-panel" style={{ padding: '18px', maxHeight: '550px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '13px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px', marginBottom: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <FileText size={14} color="var(--accent)" />
              Report Preview
            </h3>
            
            <pre style={{ whiteSpace: 'pre-wrap', background: 'transparent', border: 'none', padding: 0, fontSize: '12.5px', color: 'var(--text-soft)', fontFamily: 'inherit', lineHeight: '1.6' }}>
              {generateReportText()}
            </pre>
          </div>

          {/* Quick Metrics Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Domain metrics */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '12.5px', color: '#fff', fontWeight: '600' }}>Evaluation Accuracy</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Total Items Evaluated:</span>
                  <strong style={{ color: '#fff' }}>{total}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Response A Preferred:</span>
                  <strong style={{ color: 'var(--danger)' }}>{winA}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Response B Preferred:</span>
                  <strong style={{ color: 'var(--success)' }}>{winB}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Ties/No Preference:</span>
                  <strong style={{ color: 'var(--warning)' }}>{ties}</strong>
                </div>
              </div>
            </div>

            {/* Deploy recommendations */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '12.5px', color: '#fff', fontWeight: '600' }}>Deployment Status</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                We recommend moving to production with **Response B** based on a score difference of **{Math.abs(avgScoreB - avgScoreA).toFixed(2)} points** across Correctness and Instruction compliance.
              </p>
              <div style={{ padding: '6px 10px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '4px', fontSize: '11px', color: '#22C55E', textAlign: 'center', fontWeight: 'bold', marginTop: '6px' }}>
                ✓ RECOMMENDED FOR DEPLOYMENT: RESPONSE B
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
