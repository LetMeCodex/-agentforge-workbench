import React, { useState, useEffect } from 'react';
import { Upload, Database, BookOpen, Plus, Trash2, Edit2, Search, HelpCircle, Save, Sparkles } from 'lucide-react';

export default function DatasetManager({ 
  dataset, 
  setDataset, 
  policies, 
  setPolicies,
  defaultTab = 'dataset'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Keep activeTab in sync with tab change from parent routing
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // New Ticket Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    ticket_id: '',
    customerName: '',
    tier: 'standard',
    customer_sentiment: 'neutral',
    risk_flags: [],
    ticket: '',
    expectedCategory: 'refund',
    expectedPriority: 'low',
    expectedEscalate: false,
    expectedPolicy: 'Refund Policy'
  });

  // Edit states
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);

  // Generate adversarial cases
  const generateSyntheticCases = () => {
    const synthetic = [
      {
        id: dataset.length > 0 ? Math.max(...dataset.map(t => t.id)) + 1 : 1,
        ticket_id: "TKT-SYN1",
        customerName: "Sophia Green",
        tier: "standard",
        customer_sentiment: "angry",
        risk_flags: ["double_negative"],
        ticket: "I DO NOT want to pay the return shipping fee because the watch is NOT working correctly. But your system claims standard orders get charged. Waive this fee.",
        expectedCategory: "return_shipping",
        expectedPriority: "high",
        expectedEscalate: false,
        expectedPolicy: "Shipping & Return Logistics"
      },
      {
        id: dataset.length > 0 ? Math.max(...dataset.map(t => t.id)) + 2 : 2,
        ticket_id: "TKT-SYN2",
        customerName: "Bruce Wayne",
        tier: "vip",
        customer_sentiment: "frustrated",
        risk_flags: ["vip_escalation"],
        ticket: "Cancel order #9983 immediately. It's been 2.5 hours but I am a Platinum VIP member. You must override the 2-hour cancellation rule for me.",
        expectedCategory: "cancellation",
        expectedPriority: "high",
        expectedEscalate: true,
        expectedPolicy: "VIP Customer Protocol"
      },
      {
        id: dataset.length > 0 ? Math.max(...dataset.map(t => t.id)) + 3 : 3,
        ticket_id: "TKT-SYN3",
        customerName: "Peter Parker",
        tier: "standard",
        customer_sentiment: "alarmed",
        risk_flags: ["safety_hazard", "abusive"],
        ticket: "You scammers, my charger just exploded and burned my hand. I will sue your company and contact the FTC if you don't refund me in 5 minutes.",
        expectedCategory: "safety_hazard",
        expectedPriority: "high",
        expectedEscalate: true,
        expectedPolicy: "Safety & Legal Escalation Rules"
      }
    ];

    setDataset([...dataset, ...synthetic]);
    alert("Generated 3 complex adversarial synthetic test cases to stress-test agent constraints!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const validated = parsed.map((item, idx) => ({
              id: dataset.length + idx + 1,
              ticket_id: item.ticket_id || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
              customerName: item.customerName || 'Anonymous',
              tier: item.tier || 'standard',
              customer_sentiment: item.customer_sentiment || 'neutral',
              risk_flags: item.risk_flags || [],
              ticket: item.ticket || item.query || '',
              expectedCategory: item.expectedCategory || 'general',
              expectedPriority: item.expectedPriority || 'low',
              expectedEscalate: !!item.expectedEscalate,
              expectedPolicy: item.expectedPolicy || 'Refund Policy'
            }));
            setDataset([...dataset, ...validated]);
            alert(`Successfully imported ${validated.length} tickets from JSON!`);
          } else {
            alert("JSON must be an array of ticket objects.");
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const result = [];
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map(v => v.trim());
            const item = {};
            headers.forEach((header, index) => {
              item[header] = values[index];
            });
            
            result.push({
              id: dataset.length + i,
              ticket_id: item.ticket_id || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
              customerName: item.customername || item.name || 'Anonymous',
              tier: (item.tier || 'standard').toLowerCase(),
              customer_sentiment: item.customer_sentiment || 'neutral',
              risk_flags: item.risk_flags ? item.risk_flags.split(';') : [],
              ticket: item.ticket || item.query || item.description || '',
              expectedCategory: item.expectedcategory || item.category || 'general',
              expectedPriority: item.expectedpriority || item.priority || 'low',
              expectedEscalate: item.expectedescalate === 'true' || item.escalate === 'true',
              expectedPolicy: item.expectedpolicy || item.policy || 'Refund Policy'
            });
          }
          setDataset([...dataset, ...result]);
          alert(`Successfully imported ${result.length} tickets from CSV!`);
        } else {
          alert("Unsupported file format. Please upload .csv or .json");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse file. Please verify CSV/JSON structure.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddTicket = (e) => {
    e.preventDefault();
    if (!newTicket.customerName || !newTicket.ticket) {
      alert("Please fill in customer name and ticket description.");
      return;
    }
    const tId = newTicket.ticket_id || `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = {
      id: dataset.length > 0 ? Math.max(...dataset.map(t => t.id)) + 1 : 1,
      ...newTicket,
      ticket_id: tId
    };
    setDataset([...dataset, created]);
    setShowAddForm(false);
    setNewTicket({
      ticket_id: '',
      customerName: '',
      tier: 'standard',
      customer_sentiment: 'neutral',
      risk_flags: [],
      ticket: '',
      expectedCategory: 'refund',
      expectedPriority: 'low',
      expectedEscalate: false,
      expectedPolicy: 'Refund Policy'
    });
  };

  const handleDeleteTicket = (id) => {
    setDataset(dataset.filter(t => t.id !== id));
  };

  const startEditTicket = (t) => {
    setEditingTicketId(t.id);
    setEditingTicket({ ...t });
  };

  const saveEditedTicket = () => {
    setDataset(dataset.map(t => t.id === editingTicketId ? editingTicket : t));
    setEditingTicketId(null);
    setEditingTicket(null);
  };

  const startEditPolicy = (p) => {
    setEditingPolicyId(p.id);
    setEditingPolicy({ ...p });
  };

  const saveEditedPolicy = () => {
    setPolicies(policies.map(p => p.id === editingPolicyId ? editingPolicy : p));
    setEditingPolicyId(null);
    setEditingPolicy(null);
  };

  const getSimulatedRAGResults = (query) => {
    if (!query) return [];
    
    const queryWords = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length === 0) return [];
    
    return policies.map(policy => {
      const policyLower = (policy.title + " " + policy.content).toLowerCase();
      let matchCount = 0;
      queryWords.forEach(word => {
        if (policyLower.includes(word)) {
          matchCount++;
        }
      });
      
      const score = queryWords.length > 0 ? (matchCount / queryWords.length) : 0;
      let titleBoost = 0;
      policy.title.toLowerCase().split(' ').forEach(tWord => {
        if (tWord.length > 3 && query.toLowerCase().includes(tWord)) {
          titleBoost += 0.2;
        }
      });

      const finalScore = Math.min(1, score + titleBoost);

      return {
        ...policy,
        score: parseFloat(finalScore.toFixed(2))
      };
    })
    .filter(p => p.score > 0.1)
    .sort((a, b) => b.score - a.score);
  };

  const ragResults = getSimulatedRAGResults(searchTerm);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {activeTab === 'dataset' ? (
        <>
          {/* Uploader, Add Button and Adversarial Generator */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr', gap: '20px' }}>
            
            {/* Drag & Drop File Area */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
              <div 
                style={{ 
                  flex: 1, 
                  border: '1px dashed var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'var(--panel-elevated)'
                }}
              >
                <input 
                  type="file" 
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer'
                  }} 
                />
                <Upload size={20} color="var(--text-muted)" style={{ marginBottom: '6px' }} />
                <h4 style={{ fontSize: '12.5px', color: 'white', marginBottom: '2px' }}>Upload custom dataset</h4>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Supports CSV or JSON (Array of customer support tickets)</p>
              </div>
            </div>

            {/* Actions Info Card */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="glow-button" style={{ flex: 1, fontSize: '12.5px' }} onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus size={14} />
                  Add ticket
                </button>
                <button className="btn-secondary" style={{ flex: 1, fontSize: '12.5px' }} onClick={generateSyntheticCases}>
                  <Sparkles size={14} color="var(--accent)" />
                  Synthetic generator
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <HelpCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Adversarial generator:</strong> Appends synthetic test cases containing double-negatives or policy bypass attempts.
                </span>
              </div>
            </div>

          </div>

          {/* Form to Add New Ticket */}
          {showAddForm && (
            <form onSubmit={handleAddTicket} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '14px', color: 'white' }}>Create support ticket</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ticket ID</label>
                  <input 
                    type="text" 
                    value={newTicket.ticket_id}
                    onChange={(e) => setNewTicket({...newTicket, ticket_id: e.target.value})}
                    placeholder="e.g. TKT-1089"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Customer name</label>
                  <input 
                    type="text" 
                    value={newTicket.customerName}
                    onChange={(e) => setNewTicket({...newTicket, customerName: e.target.value})}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Customer tier</label>
                  <select 
                    value={newTicket.tier}
                    onChange={(e) => setNewTicket({...newTicket, tier: e.target.value})}
                  >
                    <option value="standard">Standard</option>
                    <option value="vip">VIP Member</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Sentiment</label>
                  <select 
                    value={newTicket.customer_sentiment}
                    onChange={(e) => setNewTicket({...newTicket, customer_sentiment: e.target.value})}
                  >
                    <option value="neutral">neutral</option>
                    <option value="anxious">anxious</option>
                    <option value="frustrated">frustrated</option>
                    <option value="angry">angry</option>
                    <option value="alarmed">alarmed</option>
                    <option value="aggressive">aggressive</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Customer ticket inquiry</label>
                <textarea 
                  rows="3"
                  value={newTicket.ticket}
                  onChange={(e) => setNewTicket({...newTicket, ticket: e.target.value})}
                  placeholder="Paste customer message..."
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1.5fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Expected category</label>
                  <select 
                    value={newTicket.expectedCategory}
                    onChange={(e) => setNewTicket({...newTicket, expectedCategory: e.target.value})}
                  >
                    <option value="refund">refund</option>
                    <option value="warranty_refund">warranty_refund</option>
                    <option value="return_shipping">return_shipping</option>
                    <option value="cancellation">cancellation</option>
                    <option value="safety_hazard">safety_hazard</option>
                    <option value="legal_threat">legal_threat</option>
                    <option value="shipping_delay">shipping_delay</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Expected priority</label>
                  <select 
                    value={newTicket.expectedPriority}
                    onChange={(e) => setNewTicket({...newTicket, expectedPriority: e.target.value})}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="switch" style={{ marginTop: '16px' }}>
                    <input 
                      type="checkbox" 
                      checked={newTicket.expectedEscalate}
                      onChange={(e) => setNewTicket({...newTicket, expectedEscalate: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                  <span style={{ fontSize: '12px', marginTop: '16px', color: 'var(--text)' }}>Escalate?</span>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Reference policy</label>
                  <select 
                    value={newTicket.expectedPolicy}
                    onChange={(e) => setNewTicket({...newTicket, expectedPolicy: e.target.value})}
                  >
                    {policies.map(p => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="glow-button">Save Ticket</button>
              </div>
            </form>
          )}

          {/* Dataset Table */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.01)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 14px' }}>ID</th>
                  <th style={{ padding: '12px 14px' }}>Customer</th>
                  <th style={{ padding: '12px 14px' }}>Tier</th>
                  <th style={{ padding: '12px 14px' }}>Sentiment</th>
                  <th style={{ padding: '12px 14px', width: '32%' }}>Ticket</th>
                  <th style={{ padding: '12px 14px' }}>Risk flags</th>
                  <th style={{ padding: '12px 14px' }}>Category</th>
                  <th style={{ padding: '12px 14px' }}>Escalate?</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dataset.map(t => {
                  const isEditing = editingTicketId === t.id;
                  const item = isEditing ? editingTicket : t;
                  
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: isEditing ? 'rgba(99, 102, 241, 0.02)' : 'none' }}>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.ticket_id}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: '500', color: 'white' }}>
                        {isEditing ? (
                          <input 
                            type="text" 
                            style={{ padding: '6px' }}
                            value={item.customerName}
                            onChange={(e) => setEditingTicket({...editingTicket, customerName: e.target.value})}
                          />
                        ) : t.customerName}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {isEditing ? (
                          <select 
                            style={{ padding: '6px' }}
                            value={item.tier}
                            onChange={(e) => setEditingTicket({...editingTicket, tier: e.target.value})}
                          >
                            <option value="standard">standard</option>
                            <option value="vip">vip</option>
                          </select>
                        ) : (
                          <span className={`badge ${t.tier === 'vip' ? 'badge-purple' : 'badge-info'}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                            {t.tier}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px' }}>
                        {isEditing ? (
                          <select 
                            style={{ padding: '6px' }}
                            value={item.customer_sentiment}
                            onChange={(e) => setEditingTicket({...editingTicket, customer_sentiment: e.target.value})}
                          >
                            <option value="neutral">neutral</option>
                            <option value="anxious">anxious</option>
                            <option value="frustrated">frustrated</option>
                            <option value="angry">angry</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-soft)' }}>{t.customer_sentiment}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-soft)', lineHeight: '1.4' }}>
                        {isEditing ? (
                          <textarea 
                            rows="2"
                            style={{ padding: '6px' }}
                            value={item.ticket}
                            onChange={(e) => setEditingTicket({...editingTicket, ticket: e.target.value})}
                          />
                        ) : t.ticket}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {t.risk_flags.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>None</span>
                          ) : (
                            t.risk_flags.map((flag, idx) => (
                              <span key={idx} className="badge badge-danger" style={{ fontSize: '8px', padding: '1px 3px' }}>
                                {flag}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {isEditing ? (
                          <select 
                            style={{ padding: '6px' }}
                            value={item.expectedCategory}
                            onChange={(e) => setEditingTicket({...editingTicket, expectedCategory: e.target.value})}
                          >
                            <option value="refund">refund</option>
                            <option value="warranty_refund">warranty_refund</option>
                            <option value="return_shipping">return_shipping</option>
                            <option value="cancellation">cancellation</option>
                            <option value="safety_hazard">safety_hazard</option>
                            <option value="legal_threat">legal_threat</option>
                            <option value="shipping_delay">shipping_delay</option>
                          </select>
                        ) : (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>{t.expectedCategory}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                        {isEditing ? (
                          <input 
                            type="checkbox" 
                            checked={item.expectedEscalate}
                            onChange={(e) => setEditingTicket({...editingTicket, expectedEscalate: e.target.checked})}
                          />
                        ) : (
                          <span style={{ color: t.expectedEscalate ? 'var(--danger)' : 'var(--text-muted)' }}>{t.expectedEscalate ? '⚠️ Yes' : 'No'}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {isEditing ? (
                            <>
                              <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={saveEditedTicket}>
                                <Save size={12} />
                              </button>
                              <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setEditingTicketId(null)}>
                                X
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => startEditTicket(t)}>
                                <Edit2 size={12} />
                              </button>
                              <button className="btn-secondary" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => handleDeleteTicket(t.id)}>
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Policies & RAG View */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)' }}>
              Policy documents
            </h3>
            
            {policies.map(p => {
              const isEditing = editingPolicyId === p.id;
              const item = isEditing ? editingPolicy : p;
              
              return (
                <div key={p.id} className="glass-panel" style={{ padding: '16px' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={item.title}
                        onChange={(e) => setEditingPolicy({...editingPolicy, title: e.target.value})}
                        style={{ fontSize: '13.5px', fontWeight: '600' }}
                      />
                      <textarea 
                        rows="4"
                        value={item.content}
                        onChange={(e) => setEditingPolicy({...editingPolicy, content: e.target.value})}
                      ></textarea>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setEditingPolicyId(null)}>Cancel</button>
                        <button className="glow-button" style={{ padding: '6px 12px' }} onClick={saveEditedPolicy}>Save Changes</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '13.5px', color: 'white', fontWeight: '600' }}>{p.title}</h4>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11.5px' }} onClick={() => startEditPolicy(p)}>
                          <Edit2 size={11} /> Edit
                        </button>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: '1.5' }}>
                        {p.content}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '18px', position: 'sticky', top: '20px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', marginBottom: '4px' }}>
                RAG retrieval sandbox
              </h3>
              <p style={{ color: 'var(--text-soft)', fontSize: '12px', marginBottom: '14px' }}>
                Test policy vector similarity lookup queries.
              </p>

              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input 
                  type="text"
                  placeholder="e.g. standard refund shipping fee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '32px', fontSize: '12.5px' }}
                />
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {searchTerm ? `Vector Search Hits (${ragResults.length})` : 'Search Query Output'}
                </h4>

                {searchTerm === '' ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Type query to execute simulated TF-IDF vector score matching.
                  </div>
                ) : ragResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--danger)', fontSize: '12px' }}>
                    No matching policy docs found.
                  </div>
                ) : (
                  ragResults.map((res, idx) => (
                    <div key={res.id} className="glass-card" style={{ borderLeft: idx === 0 ? '2.5px solid var(--accent)' : '1px solid var(--border)', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{res.title}</span>
                        <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 4px' }}>
                          Score: {Math.round(res.score * 100)}%
                        </span>
                      </div>
                      
                      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.03)', borderRadius: '1.5px', marginBottom: '8px' }}>
                        <div style={{ width: `${res.score * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '1.5px' }}></div>
                      </div>

                      <p style={{ fontSize: '11.5px', color: 'var(--text-soft)', lineHeight: '1.4', fontStyle: 'italic' }}>
                        "...{res.content.substring(0, 120)}..."
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
      
    </div>
  );
}
