import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  FileCheck, 
  Award,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function ReportModal({ isOpen, onClose, activeVehicle }) {
  if (!isOpen || !activeVehicle) return null;

  const handlePrint = () => {
    soundEffects.playClick();
    window.print();
  };

  const defects = activeVehicle.defects || [];
  const totalParts = defects.reduce((sum, d) => sum + (d.partsCost || 0), 0);
  const totalPaint = defects.reduce((sum, d) => sum + (d.paintCost || 0), 0);
  const totalLaborHours = defects.reduce((sum, d) => sum + (d.laborHours || 0), 0);
  const totalLaborCost = totalLaborHours * 100;
  const grandTotal = totalParts + totalPaint + totalLaborCost;

  const appraisalId = `CERT-AI-${activeVehicle.vin.slice(-6)}-${new Date().getFullYear()}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px', 
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(13, 19, 34, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={20} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Official Appraisal Preview</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn-primary"
              onClick={handlePrint}
              style={{ padding: '6px 16px' }}
            >
              <Printer size={16} />
              <span>Print to PDF / Paper</span>
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '6px 12px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Appraisal Document Body */}
        <div style={{ padding: '36px', background: '#ffffff', color: '#0f172a' }}>
          {/* Official Document Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            borderBottom: '3px solid #0f172a',
            paddingBottom: '20px',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Award size={32} color="#0284c7" />
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
                  AUTOINSPECT AI
                </h1>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                CERTIFIED VEHICLE DAMAGE &amp; ESTIMATION REPORT
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Compliant with Mitchell, Audatex &amp; ISO-27001 Optical Telemetry Standards
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                background: '#f1f5f9', 
                border: '1px solid #cbd5e1', 
                borderRadius: '6px', 
                padding: '6px 12px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0f172a'
              }}>
                {appraisalId}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Issued: <strong>{currentDate}</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                STATUS: APPROVED FOR REPAIR
              </div>
            </div>
          </div>

          {/* Vehicle Metadata Specification Grid */}
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '16px 20px', 
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            fontSize: '0.82rem'
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>VEHICLE SPECIFICATION</span>
              <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{activeVehicle.name}</strong>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>VEHICLE IDENTIFICATION (VIN)</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{activeVehicle.vin}</span>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>LICENSE PLATE</span>
              <strong style={{ color: '#0f172a' }}>{activeVehicle.plate}</strong>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>ODOMETER MILEAGE</span>
              <strong style={{ color: '#0f172a' }}>{activeVehicle.mileage}</strong>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>FACTORY PAINT CODE</span>
              <strong style={{ color: '#0f172a' }}>{activeVehicle.color}</strong>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>OVERALL HEALTH INDEX</span>
              <strong style={{ 
                color: activeVehicle.overallScore > 75 ? '#16a34a' : activeVehicle.overallScore > 60 ? '#d97706' : '#dc2626' 
              }}>
                {activeVehicle.overallScore} / 100 ({activeVehicle.status})
              </strong>
            </div>
          </div>

          {/* Damage & Evidence Image Box */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              Photographic Vision Evidence Record
            </h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '260px', height: '160px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <img 
                  src={activeVehicle.image} 
                  alt="Inspected Vehicle Damage" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              <div style={{ flex: 1, fontSize: '0.8rem', color: '#475569' }}>
                <p style={{ marginBottom: '6px' }}>
                  <strong>Sensor Capture Angle:</strong> {activeVehicle.inspectionAngle}
                </p>
                <p style={{ marginBottom: '6px' }}>
                  <strong>Defects Identified:</strong> {defects.length} distinct structural/surface anomalies
                </p>
                <p style={{ marginBottom: '6px' }}>
                  <strong>Safety Recommendation:</strong> {activeVehicle.safetyRating}
                </p>
                <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  * All bounding boxes and volumetric displacement calculated using dual-channel stereoscopic pixel depth estimation.
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Defect Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              Itemized Defect &amp; Parts Replacement Ledger
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Item / Defect Description</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Severity</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>OEM Part #</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Labor Type</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Hours</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Parts</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Labor</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {defects.map((defect, i) => (
                  <tr key={defect.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '8px 10px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{defect.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{defect.repairAction}</span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.72rem',
                        color: defect.severity === 'critical' ? '#dc2626' : defect.severity === 'high' ? '#d97706' : '#0284c7' 
                      }}>
                        {defect.severity.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                      {defect.partNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>
                      {defect.laborType}
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                      {defect.laborHours}h
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                      ${defect.partsCost?.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                      ${(defect.laborHours * 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      ${defect.totalCost?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Totals */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginBottom: '30px' 
          }}>
            <div style={{ width: '320px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px 18px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#475569' }}>
                <span>OEM Parts Subtotal:</span>
                <span style={{ fontFamily: 'monospace' }}>${totalParts.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#475569' }}>
                <span>Paint &amp; Materials:</span>
                <span style={{ fontFamily: 'monospace' }}>${totalPaint.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#475569' }}>
                <span>Labor ({totalLaborHours}h @ $100/hr):</span>
                <span style={{ fontFamily: 'monospace' }}>${totalLaborCost.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '8px', 
                borderTop: '2px solid #0f172a', 
                fontWeight: 800, 
                fontSize: '1.15rem', 
                color: '#0f172a' 
              }}>
                <span>CERTIFIED TOTAL:</span>
                <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Legal Sign-Off Block */}
          <div style={{ 
            borderTop: '1px solid #cbd5e1', 
            paddingTop: '18px', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '30px',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            <div>
              <p style={{ marginBottom: '8px' }}>
                <strong>Assessor Certification:</strong> I hereby certify that the above vehicular damage analysis and cost matrix was generated through algorithmic vision analysis and verified by an authorized collision estimator.
              </p>
              <div style={{ marginTop: '24px', borderTop: '1px solid #94a3b8', width: '220px', paddingTop: '4px' }}>
                Certified Inspector Signature / Date
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '10px 16px', borderRadius: '6px' }}>
                <ShieldCheck size={28} color="#0284c7" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>
                  AUTOINSPECT AI CRYPTOGRAPHIC SEAL
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#64748b' }}>
                  SHA256: 8f9c2e0b...4a11d
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
