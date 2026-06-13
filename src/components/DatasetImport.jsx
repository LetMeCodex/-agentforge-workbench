import React, { useState } from 'react';
import { Upload, Database, Plus, Trash2, Edit2, Search, HelpCircle, Save, Sparkles, AlertTriangle, FileText, Check } from 'lucide-react';
import { parseDataset, detectFormat } from '../utils/parser';

export default function DatasetImport({ 
  dataset = [], 
  setDataset,
  setActiveView 
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [manualFormat, setManualFormat] = useState('auto');
  
  // Validation stats
  const [parsedItems, setParsedItems] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importStatus, setImportStatus] = useState('idle'); // 'idle' | 'parsed' | 'imported'

  // Selected row for Detail Drawer
  const [selectedRow, setSelectedRow] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Handle uploading files
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportStatus('idle');
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const detected = file.name.endsWith('.jsonl') ? 'jsonl' : (file.name.endsWith('.json') ? 'json' : (file.name.endsWith('.csv') ? 'csv' : 'txt'));
      
      const { items, errors } = parseDataset(text, detected);
      setParsedItems(items);
      setParseErrors(errors);
      setImportStatus('parsed');
    };
    reader.readAsText(file);
  };

  // Handle manual paste parsing
  const handlePasteParse = () => {
    if (!pastedText.trim()) {
      alert("Please paste some text first.");
      return;
    }
    setImportStatus('idle');
    const { items, errors } = parseDataset(pastedText, manualFormat);
    setParsedItems(items);
    setParseErrors(errors);
    setImportStatus('parsed');
  };

  // Confirm import and append to dataset
  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;
    
    // De-duplicate items based on ID
    const existingIds = new Set(dataset.map(item => String(item.id)));
    const merged = [...dataset];
    
    parsedItems.forEach(item => {
      // If ID already exists, modify the ID to avoid duplicates
      let uniqueId = String(item.id);
      let count = 1;
      while (existingIds.has(uniqueId)) {
        uniqueId = `${item.id}-dup${count}`;
        count++;
      }
      merged.push({
        ...item,
        id: uniqueId
      });
      existingIds.add(uniqueId);
    });

    setDataset(merged);
    setParsedItems([]);
    setParseErrors([]);
    setImportStatus('imported');
    alert(`Successfully imported ${merged.length - dataset.length} items to active dataset!`);
  };

  // Normalization action: trims strings, strips formatting arrays, makes standard text
  const handleNormalizeDataset = () => {
    const normalized = dataset.map(item => ({
      ...item,
      prompt: typeof item.prompt === 'string' ? item.prompt.trim() : String(item.prompt),
      response_a: typeof item.response_a === 'string' ? item.response_a.trim() : String(item.response_a),
      response_b: typeof item.response_b === 'string' ? item.response_b.trim() : String(item.response_b),
      expected_winner: item.expected_winner || null
    }));
    setDataset(normalized);
    alert("Dataset normalized: text whitespace cleaned and array structures unified.");
  };

  const handleDeleteItem = (id) => {
    if (confirm("Delete this row from the dataset?")) {
      setDataset(dataset.filter(item => item.id !== id));
      if (selectedRow && selectedRow.id === id) {
        setSelectedRow(null);
      }
    }
  };

  const handleUpdateItemInDrawer = (updated) => {
    setDataset(dataset.map(item => item.id === updated.id ? updated : item));
    setSelectedRow(updated);
  };

  const filteredDataset = dataset.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      String(item.id).toLowerCase().includes(q) ||
      item.prompt.toLowerCase().includes(q) ||
      item.response_a.toLowerCase().includes(q) ||
      item.response_b.toLowerCase().includes(q) ||
      (item.domain && item.domain.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Import Ingestion Panel Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        
        {/* Upload / Paste tabs Box */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', gap: '16px' }}>
            <button 
              onClick={() => { setActiveTab('upload'); setImportStatus('idle'); }}
              style={{ background: 'transparent', border: 'none', color: activeTab === 'upload' ? '#fff' : '#6b7280', fontSize: '13px', fontWeight: activeTab === 'upload' ? '600' : '500', cursor: 'pointer' }}
            >
              Upload Data File
            </button>
            <button 
              onClick={() => { setActiveTab('paste'); setImportStatus('idle'); }}
              style={{ background: 'transparent', border: 'none', color: activeTab === 'paste' ? '#fff' : '#6b7280', fontSize: '13px', fontWeight: activeTab === 'paste' ? '600' : '500', cursor: 'pointer' }}
            >
              Paste Raw Dataset
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div style={{ border: '1px dashed var(--border)', borderRadius: '8px', padding: '24px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
              <input 
                type="file" 
                accept=".csv,.json,.jsonl,.txt"
                onChange={handleFileUpload}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <Upload size={24} color="#8C52FF" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '13px', color: '#fff' }}>Click or drag a file to import</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Supports .json, .jsonl, .csv, and tabbed .txt</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select 
                  value={manualFormat} 
                  onChange={(e) => setManualFormat(e.target.value)}
                  style={{ width: '140px', fontSize: '12px', height: '32px' }}
                >
                  <option value="auto">Auto Detect</option>
                  <option value="json">JSON Array</option>
                  <option value="jsonl">JSONL (Lines)</option>
                  <option value="csv">CSV (Comma-separated)</option>
                  <option value="txt">TXT (Tabbed/Brackets)</option>
                </select>
                <button className="primary-button" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={handlePasteParse}>
                  Parse Paste
                </button>
              </div>
              <textarea 
                rows="6"
                placeholder='Paste raw JSON arrays, CSV lists, or copy-pasted test tables...'
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>
          )}
        </div>

        {/* Validation and normalizer card */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '13px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ingestion Auditor</h3>
            
            {importStatus === 'idle' && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Awaiting file upload or manual paste payload to perform schema verification.
              </div>
            )}

            {importStatus === 'parsed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                  <span>Parsed Count:</span>
                  <strong style={{ color: '#22c55e' }}>{parsedItems.length} items</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                  <span>Validation Status:</span>
                  <span className={`badge ${parseErrors.length === 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                    {parseErrors.length === 0 ? 'Passed' : 'Flags Warning'}
                  </span>
                </div>
                
                {parseErrors.length > 0 && (
                  <div style={{ maxHeight: '90px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--warning)', fontWeight: 'bold', marginBottom: '4px' }}>Skipped/Invalid rows:</div>
                    {parseErrors.map((err, idx) => (
                      <div key={idx} style={{ fontSize: '9.5px', color: 'var(--text-soft)', marginBottom: '2px' }}>
                        • Row {err.row}: {err.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {importStatus === 'imported' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '6px', padding: '8px 12px' }}>
                <Check size={16} color="#22C55E" />
                <span style={{ fontSize: '12px', color: '#22C55E' }}>Successfully committed to database.</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {parsedItems.length > 0 && (
              <button className="primary-button" style={{ flex: 1, justifyContent: 'center' }} onClick={handleConfirmImport}>
                Commit Import
              </button>
            )}
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }} onClick={handleNormalizeDataset}>
              Normalize DB
            </button>
          </div>
        </div>

      </div>

      {/* Main Preview Table Section */}
      <div className="glass-panel" style={{ padding: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>Preview Evaluation Dataset</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Currently loaded: {dataset.length} evaluation tasks</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '28px', height: '32px', width: '200px', fontSize: '12px' }}
              />
              <Search size={12} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>

            {dataset.length > 0 && (
              <button className="primary-button" style={{ height: '32px', padding: '0 14px', fontSize: '12px' }} onClick={() => setActiveView('runs')}>
                Start Evaluation Run
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '10px 12px', width: '8%' }}>ID</th>
                <th style={{ padding: '10px 12px', width: '14%' }}>Domain</th>
                <th style={{ padding: '10px 12px', width: '30%' }}>Prompt Preview</th>
                <th style={{ padding: '10px 12px', width: '20%' }}>Response A Preview</th>
                <th style={{ padding: '10px 12px', width: '20%' }}>Response B Preview</th>
                <th style={{ padding: '10px 12px', width: '8%' }}>Ground Truth</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDataset.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No dataset rows matched the query.
                  </td>
                </tr>
              ) : (
                filteredDataset.map(item => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedRow(item)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {item.id}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                      <span className="badge badge-info" style={{ fontSize: '8.5px', padding: '1px 4px' }}>
                        {item.domain || 'general'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                      {item.prompt}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                      {item.response_a}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                      {item.response_b}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '11px' }}>
                      {item.expected_winner ? (
                        <span className={`badge ${item.expected_winner === 'A' ? 'badge-danger' : (item.expected_winner === 'B' ? 'badge-success' : 'badge-warning')}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {item.expected_winner}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-faint)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn-secondary" style={{ display: 'inline-flex', padding: '4px 8px', color: 'var(--danger)' }} onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row detail sidebar drawer */}
      {selectedRow && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '480px', height: '100vh', background: 'var(--sidebar)', borderLeft: '1px solid var(--border)', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>Evaluation Task: {selectedRow.id}</h3>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setSelectedRow(null)}>Close</button>
          </div>
          
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Domain Category</label>
              <input 
                type="text" 
                value={selectedRow.domain || ''} 
                onChange={(e) => handleUpdateItemInDrawer({...selectedRow, domain: e.target.value})}
                style={{ fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Ground Truth Winner label</label>
              <select 
                value={selectedRow.expected_winner || ''} 
                onChange={(e) => handleUpdateItemInDrawer({...selectedRow, expected_winner: e.target.value || null})}
                style={{ fontSize: '12px' }}
              >
                <option value="">No Label (Rely on AI Judge)</option>
                <option value="A">Response A is Winner</option>
                <option value="B">Response B is Winner</option>
                <option value="tie">Tie (Equal quality)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Difficulty</label>
              <select 
                value={selectedRow.difficulty || 'medium'} 
                onChange={(e) => handleUpdateItemInDrawer({...selectedRow, difficulty: e.target.value})}
                style={{ fontSize: '12px' }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Prompt / Instruction</label>
              <textarea 
                rows="4" 
                value={selectedRow.prompt} 
                onChange={(e) => handleUpdateItemInDrawer({...selectedRow, prompt: e.target.value})}
                style={{ fontSize: '12px', lineHeight: '1.4' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Response Candidate A</label>
              <textarea 
                rows="6" 
                value={selectedRow.response_a} 
                onChange={(e) => handleUpdateItemInDrawer({...selectedRow, response_a: e.target.value})}
                style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Response Candidate B</label>
              <textarea 
                rows="6" 
                value={selectedRow.response_b} 
                onChange={(e) => handleUpdateItemInDrawer({...selectedRow, response_b: e.target.value})}
                style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
