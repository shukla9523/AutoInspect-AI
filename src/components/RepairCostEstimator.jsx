import React, { useState } from 'react';
import { 
  DollarSign, 
  Wrench, 
  ShieldCheck, 
  FileSpreadsheet, 
  Plus, 
  Download, 
  Printer, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audio';

export default function RepairCostEstimator({ activeVehicle, onOpenReport }) {
  const [deductible, setDeductible] = useState(500);
  const [laborHourlyRate, setLaborHourlyRate] = useState(100);
  const [customItems, setCustomItems] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Sublet / Disposal');
  const [isApproved, setIsApproved] = useState(false);

  const defects = activeVehicle.defects || [];

  // Base calculations
  const totalPartsCost = defects.reduce((sum, d) => sum + (d.partsCost || 0), 0);
  const totalPaintCost = defects.reduce((sum, d) => sum + (d.paintCost || 0), 0);
  const totalLaborHours = defects.reduce((sum, d) => sum + (d.laborHours || 0), 0);
  const totalLaborCost = totalLaborHours * laborHourlyRate;

  const customItemsCost = customItems.reduce((sum, item) => sum + item.cost, 0);

  const grandTotal = totalPartsCost + totalPaintCost + totalLaborCost + customItemsCost;

  // Insurance calculation
  const customerShare = Math.min(deductible, grandTotal);
  const insuranceShare = Math.max(0, grandTotal - customerShare);
  const insurancePct = grandTotal > 0 ? (insuranceShare / grandTotal) * 100 : 0;

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || isNaN(parseFloat(newItemCost))) return;
    soundEffects.playClick();
    setCustomItems(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        title: newItemTitle,
        category: newItemCategory,
        cost: parseFloat(newItemCost),
        laborHours: 0,
        partNumber: 'SUBLET-FEE'
      }
    ]);
    setNewItemTitle('');
    setNewItemCost('');
    setShowAddItem(false);
  };

  const handleApproveWorkOrder = () => {
    soundEffects.playScanComplete();
    setIsApproved(true);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#00f2fe', '#38bdf8']
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleExportJSON = () => {
    soundEffects.playClick();
    const claimData = {
      vehicle: {
        name: activeVehicle.name,
        vin: activeVehicle.vin,
        plate: activeVehicle.plate,
        mileage: activeVehicle.mileage,
      },
      auditDate: new Date().toISOString(),
      laborRate: laborHourlyRate,
      deductible: deductible,
      totals: {
        parts: totalPartsCost,
        paint: totalPaintCost,
        laborHours: totalLaborHours,
        laborCost: totalLaborCost,
        sublets: customItemsCost,
        grandTotal: grandTotal,
        customerDeductible: customerShare,
        carrierCoverage: insuranceShare,
      },
      lineItems: [
        ...defects.map(d => ({
          title: d.title,
          category: d.category,
          partNumber: d.partNumber,
          laborHours: d.laborHours,
          partsCost: d.partsCost,
          paintCost: d.paintCost,
          total: d.totalCost,
        })),
        ...customItems
      ]
    };

    const blob = new Blob([JSON.stringify(claimData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `claim_${activeVehicle.vin}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="repair-estimator-container">
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <DollarSign size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Automated Insurance Claims & Repair Costing
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Cross-referenced against Mitchell &amp; Audatex OEM pricing databases for {activeVehicle.name}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportJSON}
              title="Download claim ledger as JSON"
            >
              <Download size={16} />
              <span>Export Claim JSON</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                soundEffects.playClick();
                onOpenReport();
              }}
            >
              <Printer size={16} />
              <span>Print Official Estimate</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="glass-panel kpi-card">
          <div className="kpi-label">TOTAL ESTIMATED REPAIR</div>
          <div className="kpi-val" style={{ color: 'var(--accent-cyan)' }}>
            ${grandTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Includes OEM parts, labor & materials
          </div>
        </div>

        <div className="glass-panel kpi-card kpi-parts">
          <div className="kpi-label">OEM REPLACEMENT PARTS</div>
          <div className="kpi-val">
            ${totalPartsCost.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {defects.filter(d => d.partsCost > 0).length} factory components
          </div>
        </div>

        <div className="glass-panel kpi-card kpi-paint">
          <div className="kpi-label">PAINT &amp; REFINISHING</div>
          <div className="kpi-val">
            ${totalPaintCost.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Basecoat, clearcoat & blend
          </div>
        </div>

        <div className="glass-panel kpi-card kpi-labor">
          <div className="kpi-label">SPECIALIZED BODY LABOR</div>
          <div className="kpi-val">
            ${totalLaborCost.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {totalLaborHours.toFixed(1)} hrs @ ${laborHourlyRate}/hr
          </div>
        </div>

        <div className="glass-panel kpi-card kpi-covered">
          <div className="kpi-label">CARRIER COVERAGE</div>
          <div className="kpi-val" style={{ color: '#34d399' }}>
            ${insuranceShare.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {insurancePct.toFixed(0)}% claim liability covered
          </div>
        </div>
      </div>

      {/* Interactive Claim Simulator: Deductible & Labor Rate Adjusters */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--accent-cyan)" />
          <span>Interactive Claims Deductible &amp; Labor Rate Simulator</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Deductible slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Policy Deductible:</span>
              <strong className="tech-val" style={{ color: '#fff' }}>${deductible}</strong>
            </div>

            <input 
              type="range"
              min="0"
              max="2000"
              step="50"
              value={deductible}
              onChange={(e) => setDeductible(parseInt(e.target.value))}
              className="custom-range-slider"
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[0, 250, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  className={`btn-secondary ${deductible === val ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setDeductible(val);
                  }}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Labor Hourly Rate Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shop Labor Rate ($/Hour):</span>
              <strong className="tech-val" style={{ color: '#fff' }}>${laborHourlyRate} / hr</strong>
            </div>

            <input 
              type="range"
              min="65"
              max="160"
              step="5"
              value={laborHourlyRate}
              onChange={(e) => setLaborHourlyRate(parseInt(e.target.value))}
              className="custom-range-slider"
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[85, 100, 125, 150].map(rate => (
                <button
                  key={rate}
                  type="button"
                  className={`btn-secondary ${laborHourlyRate === rate ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setLaborHourlyRate(rate);
                  }}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  ${rate}/hr
                </button>
              ))}
            </div>
          </div>

          {/* Visual Coverage Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coverage Distribution:</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Deductible: ${customerShare.toFixed(2)} | Insurer: ${insuranceShare.toFixed(2)}
              </span>
            </div>

            <div style={{ 
              height: '14px', 
              background: 'rgba(255,255,255,0.08)', 
              borderRadius: '9999px', 
              overflow: 'hidden', 
              display: 'flex' 
            }}>
              <div 
                style={{ 
                  width: `${100 - insurancePct}%`, 
                  background: '#f59e0b', 
                  transition: 'width 0.3s' 
                }} 
                title="Customer Out-of-Pocket Deductible"
              />
              <div 
                style={{ 
                  width: `${insurancePct}%`, 
                  background: '#10b981', 
                  transition: 'width 0.3s' 
                }} 
                title="Carrier Payout"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: '6px' }}>
              <span style={{ color: '#fbbf24' }}>● Customer Pays: ${customerShare.toFixed(2)}</span>
              <span style={{ color: '#34d399' }}>● Insurer Pays: ${insuranceShare.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} color="var(--accent-cyan)" />
            <span>Itemized Work Order &amp; Replacement Ledger</span>
          </h3>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              soundEffects.playClick();
              setShowAddItem(!showAddItem);
            }}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Plus size={14} />
            <span>Add Sublet Item</span>
          </button>
        </div>

        {/* Add custom item form modal/inline */}
        {showAddItem && (
          <form 
            onSubmit={handleAddCustomItem}
            style={{ 
              background: 'rgba(13, 19, 34, 0.95)', 
              border: '1px solid var(--border-subtle)', 
              padding: '16px', 
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'flex-end'
            }}
          >
            <div style={{ flex: '2', minWidth: '200px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                Item Description:
              </label>
              <input 
                type="text"
                placeholder="e.g. Hazardous waste disposal & clips"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
                required
              />
            </div>

            <div style={{ flex: '1', minWidth: '130px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                Amount ($):
              </label>
              <input 
                type="number"
                placeholder="0.00"
                step="0.01"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                Add Item
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowAddItem(false)}
                style={{ padding: '8px 12px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <table className="tech-table">
          <thead>
            <tr>
              <th>Defect / Task Description</th>
              <th>OEM Part #</th>
              <th>Labor Category</th>
              <th>Labor (Hrs)</th>
              <th>Parts ($)</th>
              <th>Paint ($)</th>
              <th>Labor ($)</th>
              <th>Subtotal ($)</th>
            </tr>
          </thead>
          <tbody>
            {defects.map((defect) => {
              const rowLabor = (defect.laborHours || 0) * laborHourlyRate;
              const rowTotal = (defect.partsCost || 0) + (defect.paintCost || 0) + rowLabor;

              return (
                <tr key={defect.id}>
                  <td>
                    <strong style={{ color: '#fff', display: 'block' }}>{defect.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{defect.repairAction}</span>
                  </td>
                  <td>
                    <span className="spec-chip">{defect.partNumber || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="badge badge-medium">{defect.laborType}</span>
                  </td>
                  <td className="tech-val">{defect.laborHours?.toFixed(1)} h</td>
                  <td className="tech-val">${defect.partsCost?.toFixed(2)}</td>
                  <td className="tech-val">${defect.paintCost?.toFixed(2)}</td>
                  <td className="tech-val">${rowLabor.toFixed(2)}</td>
                  <td>
                    <strong className="tech-val" style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                      ${rowTotal.toFixed(2)}
                    </strong>
                  </td>
                </tr>
              );
            })}

            {/* Custom Sublets */}
            {customItems.map((item) => (
              <tr key={item.id} style={{ background: 'rgba(0, 242, 254, 0.03)' }}>
                <td>
                  <strong style={{ color: '#fff', display: 'block' }}>{item.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Added adjuster sublet</span>
                </td>
                <td><span className="spec-chip">{item.partNumber}</span></td>
                <td><span className="badge badge-low">{item.category}</span></td>
                <td className="tech-val">-</td>
                <td className="tech-val">-</td>
                <td className="tech-val">-</td>
                <td className="tech-val">-</td>
                <td>
                  <strong className="tech-val" style={{ color: 'var(--accent-cyan)' }}>
                    ${item.cost.toFixed(2)}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Grand Total Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: '24px', 
          marginTop: '20px', 
          paddingTop: '16px',
          borderTop: '2px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Final Certified Claim Total
            </span>
            <div className="tech-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              ${grandTotal.toFixed(2)}
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleApproveWorkOrder}
            disabled={isApproved}
            style={{ 
              padding: '12px 24px',
              background: isApproved 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : undefined
            }}
          >
            <CheckCircle size={18} />
            <span>{isApproved ? 'Work Order Approved ✓' : 'Approve Work Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
