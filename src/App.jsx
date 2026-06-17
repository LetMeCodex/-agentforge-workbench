import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BookOpen, 
  Sliders, 
  Zap, 
  AlertTriangle, 
  Inbox, 
  Award, 
  Settings as SettingsIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Bell,
  TrendingUp,
  LineChart,
  Terminal,
  FileText
} from 'lucide-react';

import OverviewDashboard from './components/OverviewDashboard';
import DatasetImport from './components/DatasetImport';
import EvaluationLab from './components/EvaluationLab';
import BatchRuns from './components/BatchRuns';
import FailureAnalysis from './components/FailureAnalysis';
import PromptOptimizer from './components/PromptOptimizer';
import Playground from './components/Playground';
import ReportGenerator from './components/ReportGenerator';

import { 
  defaultDataset, 
  defaultBaselinePrompt, 
  defaultOptimizedPrompt
} from './data/defaultData';

export default function App() {
  const [activeView, setActiveView] = useState('overview'); // overview, import, lab, runs, failures, optimizer, playground, reports, settings
  const [dataset, setDataset] = useState(defaultDataset);
  const [baselinePrompt, setBaselinePrompt] = useState(defaultBaselinePrompt);
  const [optimizedPrompt, setOptimizedPrompt] = useState(defaultOptimizedPrompt);
  
  // Empty by default, populated when batch runs are executed
  const [runHistory, setRunHistory] = useState({ baseline: [], optimized: [] });

  const [apiKeys, setApiKeys] = useState({
    gemini: localStorage.getItem('agentforge_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
  });

  const isKeyValid = !!(apiKeys.gemini && (apiKeys.gemini.trim().startsWith('AIzaSy') || apiKeys.gemini.trim().startsWith('AQ.')));

  const getPageTitle = () => {
    switch (activeView) {
      case 'overview':
        return 'Overview Dashboard';
      case 'import':
        return 'Dataset Import & Validation';
      case 'lab':
        return 'Pairwise Evaluation Lab';
      case 'runs':
        return 'Batch Evaluation Runs';
      case 'failures':
        return 'Trace & Failure Analysis';
      case 'optimizer':
        return 'Prompt Optimizer Matrix';
      case 'playground':
        return 'Tuning Playground';
      case 'reports':
        return 'Benchmark Reports';
      case 'settings':
        return 'Global Settings';
      default:
        return 'Overview Dashboard';
    }
  };

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '4px', paddingRight: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', width: '26px', height: '26px', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="7" fill="var(--logo-fill)" />
                  <path d="M6 15C6 11.6863 8.68629 9 12 9C15.3137 9 18 11.6863 18 15" stroke="var(--logo-stroke)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="12" cy="15" r="2.5" fill="var(--logo-stroke)" />
                </svg>
              </div>
              <h1 style={{ fontSize: '15px', color: '#ffffff', fontWeight: '750', letterSpacing: '-0.015em', fontFamily: "'Outfit', sans-serif" }}>
                AgentForge
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            
            {/* Overview Dashboard */}
            <button 
              onClick={() => setActiveView('overview')}
              className={`sidebar-item ${activeView === 'overview' ? 'nav-active' : ''}`}
            >
              <LayoutDashboard size={14} />
              <span style={{ fontWeight: activeView === 'overview' ? '600' : '500' }}>Overview Dashboard</span>
            </button>

            {/* Ingestion & Preview */}
            <button 
              onClick={() => setActiveView('import')}
              className={`sidebar-item ${activeView === 'import' ? 'nav-active' : ''}`}
            >
              <Database size={14} />
              <span style={{ fontWeight: activeView === 'import' ? '600' : '500' }}>Dataset Import</span>
            </button>

            {/* Evaluation Lab */}
            <button 
              onClick={() => setActiveView('lab')}
              className={`sidebar-item ${activeView === 'lab' ? 'nav-active' : ''}`}
            >
              <Award size={14} />
              <span style={{ fontWeight: activeView === 'lab' ? '600' : '500' }}>Evaluation Lab</span>
            </button>

            {/* Batch Evaluator Runs */}
            <button 
              onClick={() => setActiveView('runs')}
              className={`sidebar-item ${activeView === 'runs' ? 'nav-active' : ''}`}
            >
              <Terminal size={14} />
              <span style={{ fontWeight: activeView === 'runs' ? '600' : '500' }}>Batch Runs</span>
            </button>

            {/* Failure Analysis */}
            <button 
              onClick={() => setActiveView('failures')}
              className={`sidebar-item ${activeView === 'failures' ? 'nav-active' : ''}`}
            >
              <AlertTriangle size={14} />
              <span style={{ fontWeight: activeView === 'failures' ? '600' : '500' }}>Failure Analysis</span>
            </button>

            {/* Prompt Optimizer */}
            <button 
              onClick={() => setActiveView('optimizer')}
              className={`sidebar-item ${activeView === 'optimizer' ? 'nav-active' : ''}`}
            >
              <Sliders size={14} />
              <span style={{ fontWeight: activeView === 'optimizer' ? '600' : '500' }}>Prompt Optimizer</span>
            </button>

            {/* Playground */}
            <button 
              onClick={() => setActiveView('playground')}
              className={`sidebar-item ${activeView === 'playground' ? 'nav-active' : ''}`}
            >
              <Zap size={14} />
              <span style={{ fontWeight: activeView === 'playground' ? '600' : '500' }}>Tuning Playground</span>
            </button>

            {/* Reports */}
            <button 
              onClick={() => setActiveView('reports')}
              className={`sidebar-item ${activeView === 'reports' ? 'nav-active' : ''}`}
            >
              <FileText size={14} />
              <span style={{ fontWeight: activeView === 'reports' ? '600' : '500' }}>Reports</span>
            </button>

            {/* Settings */}
            <button 
              onClick={() => setActiveView('settings')}
              className={`sidebar-item ${activeView === 'settings' ? 'nav-active' : ''}`}
            >
              <SettingsIcon size={14} />
              <span style={{ fontWeight: activeView === 'settings' ? '600' : '500' }}>Settings</span>
            </button>

          </nav>
        </div>

        {/* Brand footer details */}
        <div style={{ fontSize: '10px', color: 'var(--text-faint)', padding: '6px' }}>
          AgentForge Evaluation Harness • AIOPL Track 1 MVP
        </div>

      </aside>

      {/* Main Workspace Area */}
      <main className="main-content">
        
        {/* Header Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '18px', color: '#ffffff', fontWeight: '700', fontFamily: "'Outfit', sans-serif" }}>
              {getPageTitle()}
            </h1>
            
            <span style={{ 
              fontSize: '9px', 
              fontWeight: '650', 
              background: 'var(--accent-soft)', 
              color: 'var(--text)', 
              border: '1px solid var(--border)', 
              padding: '2px 8px', 
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: "'Outfit', sans-serif"
            }}>
              AIOPL Track 1
            </span>
          </div>

          {/* Right Header items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            
            {/* API Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isKeyValid ? 'var(--success)' : (apiKeys.gemini ? 'var(--danger)' : 'var(--warning)') }} />
              <span>{isKeyValid ? 'Gemini Live' : (apiKeys.gemini ? 'Invalid API Key' : 'Simulation Mode')}</span>
            </div>

            {/* Profile Avatar Image with white border */}
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: '1.5px solid #ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              cursor: 'pointer'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

          </div>

        </header>

        {/* View routing */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeView === 'overview' && (
            <OverviewDashboard 
              dataset={dataset} 
              runHistory={runHistory} 
              setRunHistory={setRunHistory}
            />
          )}
          {activeView === 'import' && (
            <DatasetImport 
              dataset={dataset} 
              setDataset={setDataset} 
              setActiveView={setActiveView}
            />
          )}
          {activeView === 'lab' && (
            <EvaluationLab 
              dataset={dataset} 
              runHistory={runHistory} 
            />
          )}
          {activeView === 'runs' && (
            <BatchRuns 
              dataset={dataset}
              setRunHistory={setRunHistory}
              apiKeys={apiKeys}
              setActiveView={setActiveView}
            />
          )}
          {activeView === 'failures' && (
            <FailureAnalysis 
              runHistory={runHistory} 
            />
          )}
          {activeView === 'optimizer' && (
            <PromptOptimizer 
              baselinePrompt={baselinePrompt}
              setBaselinePrompt={setBaselinePrompt}
              optimizedPrompt={optimizedPrompt}
              setOptimizedPrompt={setOptimizedPrompt}
            />
          )}
          {activeView === 'playground' && (
            <Playground 
              apiKeys={apiKeys}
            />
          )}
          {activeView === 'reports' && (
            <ReportGenerator 
              dataset={dataset}
              runHistory={runHistory}
            />
          )}
          {activeView === 'settings' && (
            <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '15px', color: '#ffffff', fontWeight: '600' }}>AI Provider Configuration</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4' }}>
                Configure live API credentials. If left blank, AgentForge runs in deterministic simulation mode utilizing local heuristics and cached benchmark vectors.
              </p>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>GEMINI API KEY</label>
                <input 
                  type="text" 
                  value={apiKeys.gemini}
                  onChange={(e) => {
                    const val = e.target.value;
                    setApiKeys({...apiKeys, gemini: val});
                    localStorage.setItem('agentforge_gemini_key', val);
                  }}
                  placeholder="Enter key (starts with AIzaSy or AQ.)..."
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <div className="callout-box" style={{ borderColor: apiKeys.gemini && !isKeyValid ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
                <strong>Current State:</strong> {isKeyValid ? 'Live API sweeps enabled.' : (apiKeys.gemini ? 'Invalid Gemini API Key format (must start with "AIzaSy" or "AQ."). Defaulting to simulation mode.' : 'Simulation Active. The platform will use mathematical models to calculate pairwise outcomes.')}
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
