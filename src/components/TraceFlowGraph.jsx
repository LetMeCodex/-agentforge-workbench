import React, { useMemo } from 'react';
import ReactFlow, { Background, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node component for a premium dark enterprise aesthetic
const CustomNode = ({ data }) => {
  const { label, status, icon, description } = data;

  let borderColor = 'rgba(255, 255, 255, 0.08)';
  let bg = '#121319';
  let glow = 'none';
  let textColor = '#8b98ad';

  if (status === 'active') {
    borderColor = '#8c52ff';
    bg = '#1b1429';
    glow = '0 0 15px rgba(140, 82, 255, 0.4)';
    textColor = '#ffffff';
  } else if (status === 'completed') {
    borderColor = '#22c55e';
    bg = '#0e1d15';
    glow = '0 0 10px rgba(34, 197, 150, 0.15)';
    textColor = '#cbd5e1';
  } else if (status === 'error') {
    borderColor = '#ef4444';
    bg = '#201012';
    glow = '0 0 10px rgba(239, 68, 68, 0.2)';
    textColor = '#cbd5e1';
  }

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '8px',
        backgroundColor: bg,
        border: `1.5px solid ${borderColor}`,
        boxShadow: glow,
        color: textColor,
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        minWidth: '110px',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        position: 'relative'
      }}
    >
      {status === 'active' && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '8px',
            height: '8px',
            background: '#8c52ff',
            borderRadius: '50%',
            boxShadow: '0 0 8px #8c52ff',
            animation: 'pulse 1.5s infinite'
          }}
        />
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span style={{ fontSize: '12px' }}>{icon}</span>
        <span style={{ color: status === 'active' ? '#fff' : '#cbd5e1' }}>{label}</span>
      </div>
      <div style={{ fontSize: '9px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {description}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
      `}} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function TraceFlowGraph({ activeStep = null, status = 'idle' }) {
  // Map steps to indices
  // Steps: 'triage' -> 'rag' -> 'judge' -> 'scoring' -> 'verifier'
  const stepIndex = {
    'triage': 0,
    'rag': 1,
    'judge': 2,
    'scoring': 3,
    'verifier': 4
  }[activeStep] ?? -1;

  const getStatus = (idx) => {
    if (status === 'error' && stepIndex === idx) return 'error';
    if (stepIndex === idx) return 'active';
    if (stepIndex > idx) return 'completed';
    return 'idle';
  };

  const nodes = useMemo(() => [
    {
      id: 'n-triage',
      type: 'custom',
      position: { x: 10, y: 45 },
      data: { 
        label: 'Triage', 
        status: getStatus(0), 
        icon: '🔍', 
        description: getStatus(0) === 'active' ? 'Classifying prompt...' : (getStatus(0) === 'completed' ? 'Prompt Classified' : 'Ingest & Filter') 
      },
    },
    {
      id: 'n-rag',
      type: 'custom',
      position: { x: 160, y: 45 },
      data: { 
        label: 'RAG Context', 
        status: getStatus(1), 
        icon: '📚', 
        description: getStatus(1) === 'active' ? 'Fetching policies...' : (getStatus(1) === 'completed' ? 'Context Retreived' : 'Vector Database') 
      },
    },
    {
      id: 'n-judge',
      type: 'custom',
      position: { x: 310, y: 45 },
      data: { 
        label: 'LLM Judge', 
        status: getStatus(2), 
        icon: '⚖️', 
        description: getStatus(2) === 'active' ? 'Evaluating A vs B...' : (getStatus(2) === 'completed' ? 'Winner Declared' : 'Pairwise Arena') 
      },
    },
    {
      id: 'n-scoring',
      type: 'custom',
      position: { x: 460, y: 45 },
      data: { 
        label: 'Scoring', 
        status: getStatus(3), 
        icon: '📊', 
        description: getStatus(3) === 'active' ? 'Aggregating rubric...' : (getStatus(3) === 'completed' ? 'Scores Generated' : 'Rubric Matrix') 
      },
    },
    {
      id: 'n-verifier',
      type: 'custom',
      position: { x: 610, y: 45 },
      data: { 
        label: 'Verifier', 
        status: getStatus(4), 
        icon: '🛡️', 
        description: getStatus(4) === 'active' ? 'Auditing outputs...' : (getStatus(4) === 'completed' ? 'Audit Complete' : 'Compliance Check') 
      },
    },
  ], [activeStep, status]);

  const edges = useMemo(() => [
    {
      id: 'e-triage-rag',
      source: 'n-triage',
      target: 'n-rag',
      animated: stepIndex >= 0,
      style: { stroke: stepIndex > 0 ? '#22c55e' : (stepIndex === 0 ? '#8c52ff' : 'rgba(255,255,255,0.06)'), strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stepIndex > 0 ? '#22c55e' : (stepIndex === 0 ? '#8c52ff' : 'rgba(255,255,255,0.06)') }
    },
    {
      id: 'e-rag-judge',
      source: 'n-rag',
      target: 'n-judge',
      animated: stepIndex >= 1,
      style: { stroke: stepIndex > 1 ? '#22c55e' : (stepIndex === 1 ? '#8c52ff' : 'rgba(255,255,255,0.06)'), strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stepIndex > 1 ? '#22c55e' : (stepIndex === 1 ? '#8c52ff' : 'rgba(255,255,255,0.06)') }
    },
    {
      id: 'e-judge-scoring',
      source: 'n-judge',
      target: 'n-scoring',
      animated: stepIndex >= 2,
      style: { stroke: stepIndex > 2 ? '#22c55e' : (stepIndex === 2 ? '#8c52ff' : 'rgba(255,255,255,0.06)'), strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stepIndex > 2 ? '#22c55e' : (stepIndex === 2 ? '#8c52ff' : 'rgba(255,255,255,0.06)') }
    },
    {
      id: 'e-scoring-verifier',
      source: 'n-scoring',
      target: 'n-verifier',
      animated: stepIndex >= 3,
      style: { stroke: stepIndex > 3 ? '#22c55e' : (stepIndex === 3 ? '#8c52ff' : 'rgba(255,255,255,0.06)'), strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stepIndex > 3 ? '#22c55e' : (stepIndex === 3 ? '#8c52ff' : 'rgba(255,255,255,0.06)') }
    }
  ], [activeStep, status]);

  return (
    <div style={{ width: '100%', height: '140px', background: '#090a0f', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '10px', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={true}
      >
        <Background color="#1f2937" gap={12} size={1} style={{ opacity: 0.2 }} />
      </ReactFlow>
    </div>
  );
}
