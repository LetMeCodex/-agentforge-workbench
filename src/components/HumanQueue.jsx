import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, ArrowRight, UserCheck, AlertTriangle, Send } from 'lucide-react';

export default function HumanQueue({
  escalatedTickets,
  setEscalatedTickets,
  policies
}) {
  const [selectedTicketId, setSelectedTicketId] = useState(escalatedTickets[0]?.id || null);
  const [editedReply, setEditedReply] = useState('');
  const [resolveMessage, setResolveMessage] = useState('');

  const activeTicket = escalatedTickets.find(t => t.id === selectedTicketId);

  // Initialize draft when active ticket changes
  React.useEffect(() => {
    if (activeTicket) {
      setSelectedTicketId(activeTicket.id); // keep selected state locked
      setEditedReply(activeTicket.draft_reply || activeTicket.customer_reply || '');
    } else if (escalatedTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(escalatedTickets[0].id);
    }
  }, [selectedTicketId, activeTicket, escalatedTickets]);

  const handleResolve = (type = 'resolved') => {
    if (!activeTicket) return;
    
    // Remove resolved ticket from escalated list
    const updated = escalatedTickets.filter(t => t.id !== activeTicket.id);
    setEscalatedTickets(updated);
    
    // Show success banner
    setResolveMessage(`✅ Ticket ${activeTicket.ticket_id} successfully ${type === 'resolved' ? 'approved & sent to customer' : 're-routed to legal/safety teams'}.`);
    
    // Select next ticket if exists
    if (updated.length > 0) {
      setSelectedTicketId(updated[0].id);
    } else {
      setSelectedTicketId(null);
    }

    setTimeout(() => {
      setResolveMessage('');
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel)' }}>
        <div>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <ShieldAlert size={16} color="var(--warning)" className="pulse-active" />
            Human review queue
          </h3>
          <p style={{ color: 'var(--text-soft)', fontSize: '12px' }}>
            Agent safety gate. Displays low-confidence runs, safety exceptions, and legal requests awaiting authorization.
          </p>
        </div>
        <span className="badge badge-warning" style={{ padding: '4px 10px', fontSize: '11px' }}>
          Pending: {escalatedTickets.length} tasks
        </span>
      </div>

      {resolveMessage && (
        <div style={{ padding: '10px 14px', background: 'var(--success-soft)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '4px', color: 'var(--success)', fontSize: '13px', fontWeight: '500' }}>
          {resolveMessage}
        </div>
      )}

      {escalatedTickets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', background: 'var(--success-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.15)'
          }}>
            <CheckCircle size={24} color="var(--success)" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', color: 'white', marginBottom: '4px' }}>Escalation queue is clear</h3>
            <p style={{ color: 'var(--text-soft)', maxWidth: '380px', margin: '0 auto', fontSize: '12px', lineHeight: '1.4' }}>
              All running support agents passed the evaluation criteria (confidence score &ge; 70%) and met safety guidelines.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
          
          {/* Left panel: escalated tickets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Pending tasks
            </span>

            {escalatedTickets.map(t => (
              <div 
                key={t.id} 
                className="glass-card"
                onClick={() => setSelectedTicketId(t.id)}
                style={{
                  cursor: 'pointer',
                  borderLeft: selectedTicketId === t.id ? '2.5px solid var(--warning)' : '1px solid var(--border)',
                  background: selectedTicketId === t.id ? 'rgba(255,255,255,0.02)' : 'var(--panel)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '10px 14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', fontFamily: 'var(--font-mono)' }}>{t.ticket_id}</span>
                  <span className="badge badge-danger" style={{ fontSize: '8.5px', padding: '1px 3px' }}>
                    Conf: {Math.round((t.confidence || 0.65) * 100)}%
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '500' }}>
                  {t.customerName}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  "{t.ticket}"
                </p>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {t.risk_flags.map((flag, idx) => (
                    <span key={idx} className="badge badge-danger" style={{ fontSize: '8px', padding: '1px 3px' }}>
                      {flag}
                    </span>
                  ))}
                  {t.tier === 'vip' && <span className="badge badge-purple" style={{ fontSize: '8px', padding: '1px 3px' }}>VIP</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Right panel: Active review desk workspace */}
          {activeTicket && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Ticket header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{activeTicket.ticket_id}</span>
                    <span className={`badge ${activeTicket.tier === 'vip' ? 'badge-purple' : 'badge-info'}`} style={{ fontSize: '9px', padding: '1px 4px' }}>{activeTicket.tier}</span>
                    <span className="badge badge-danger" style={{ fontSize: '9px', padding: '1px 4px' }}>{activeTicket.customer_sentiment}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                    Customer Name: <strong>{activeTicket.customerName}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Escalation trigger</div>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <AlertTriangle size={11} /> 
                    {activeTicket.confidence < 0.70 ? 'Low confidence' : 'Safety/legal exception'}
                  </span>
                </div>
              </div>

              {/* Inquiry */}
              <div>
                <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Inquiry message</h5>
                <p style={{ fontSize: '12.5px', color: 'var(--text)', padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', lineHeight: '1.4', fontStyle: 'italic' }}>
                  "{activeTicket.ticket}"
                </p>
              </div>

              {/* Retrieved RAG Policy Details */}
              <div>
                <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Retrieved policy guidelines</h5>
                <div className="glass-card" style={{ padding: '10px', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                    Grounding Policy: {activeTicket.policy_used}
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-soft)', lineHeight: '1.4' }}>
                    {policies.find(p => p.title === activeTicket.policy_used)?.content || 'No grounded policy references.'}
                  </p>
                </div>
              </div>

              {/* Manual Response Compiler Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Authorize response reply</h5>
                <textarea
                  rows="4"
                  value={editedReply}
                  onChange={(e) => setEditedReply(e.target.value)}
                  placeholder="Draft manual response here..."
                  style={{ fontSize: '12.5px', lineHeight: '1.4', fontFamily: 'var(--font-sans)' }}
                ></textarea>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Review terms before delivery. Clicking "Approve & Resolve" credits changes back to the customer thread.
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleResolve('routed')}
                  style={{ color: 'var(--warning)', borderColor: 'rgba(245,158,11,0.2)', fontSize: '12px', padding: '6px 12px' }}
                >
                  Reroute to Dept Manager
                </button>
                <button 
                  className="glow-button" 
                  onClick={() => handleResolve('resolved')}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <Send size={12} style={{ marginRight: '4px' }} />
                  Approve & Resolve Ticket
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
