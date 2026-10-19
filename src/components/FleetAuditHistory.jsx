import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { FLEET_HISTORY } from '../data/mockVehicles';
import { soundEffects } from '../utils/audio';

export default function FleetAuditHistory({ onSelectVehicleById }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredHistory = FLEET_HISTORY.filter(item => {
    const matchesSearch = 
      item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.insuranceCo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || item.severity.toUpperCase() === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <span className="badge badge-critical">CRITICAL</span>;
      case 'high': return <span className="badge badge-high">HIGH</span>;
      case 'medium': return <span className="badge badge-medium">MEDIUM</span>;
      default: return <span className="badge badge-low">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
          <CheckCircle2 size={13} /> Approved
        </span>;
      case 'Claim Pending':
        return <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
          <Clock size={13} /> Claim Pending
        </span>;
      case 'Under Review':
        return <span style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
          <AlertCircle size={13} /> Under Review
        </span>;
      case 'Repaired':
        return <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
          <CheckCircle2 size={13} /> Repaired
        </span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="fleet-history-container">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FileText size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Fleet Computer Vision Audit Ledger &amp; Claims History
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Immutable AI inspection records, certified assessor approvals, and insurance payout tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>TOTAL AUDITS</div>
              <div className="tech-val" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {FLEET_HISTORY.length} Records
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>EST. DAMAGES</div>
              <div className="tech-val" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                $10,205.00
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search by VIN, Vehicle model, Inspector, or Carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Severity filter buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '4px' }}>Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                type="button"
                className={`btn-secondary ${severityFilter === sev ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSeverityFilter(sev);
                }}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status filter buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '4px' }}>Status:</span>
            {['ALL', 'Approved', 'Claim Pending', 'Under Review'].map(st => (
              <button
                key={st}
                type="button"
                className={`btn-secondary ${statusFilter === st ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setStatusFilter(st);
                }}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table className="tech-table">
          <thead>
            <tr>
              <th>Audit ID</th>
              <th>Vehicle Description</th>
              <th>VIN</th>
              <th>Date / Time</th>
              <th>Certified Inspector</th>
              <th>Defects</th>
              <th>Severity</th>
              <th>Est. Repair</th>
              <th>Carrier</th>
              <th>Claim Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                  No audit history records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="spec-chip" style={{ color: 'var(--accent-cyan)' }}>
                      {item.id}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#fff' }}>{item.vehicle}</strong>
                  </td>
                  <td>
                    <span className="tech-val" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.vin}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {item.date}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {item.inspector}
                  </td>
                  <td className="tech-val" style={{ textAlign: 'center' }}>
                    {item.defectsCount}
                  </td>
                  <td>
                    {getSeverityBadge(item.severity)}
                  </td>
                  <td>
                    <strong className="tech-val" style={{ color: '#fff' }}>
                      {item.estCost}
                    </strong>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {item.insuranceCo}
                  </td>
                  <td>
                    {getStatusBadge(item.status)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        soundEffects.playClick();
                        // Try matching vehicle
                        if (item.vehicle.includes('Subaru')) onSelectVehicleById('subaru-wrx');
                        else if (item.vehicle.includes('BMW')) onSelectVehicleById('bmw-7series');
                        else if (item.vehicle.includes('Tucson')) onSelectVehicleById('hyundai-tucson');
                        else if (item.vehicle.includes('Audi')) onSelectVehicleById('audi-q5');
                        else onSelectVehicleById('subaru-wrx');
                      }}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      title="Load vehicle in AI Scanner"
                    >
                      <span>Inspect</span>
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
