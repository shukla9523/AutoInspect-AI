import React, { useState } from 'react';
import { 
  Car, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function ChassisDiagnostics({ activeVehicle, onNavigateToScanner }) {
  const [selectedZoneKey, setSelectedZoneKey] = useState('frontBumper');

  const zones = activeVehicle.zones || {};

  const zoneNames = {
    frontBumper: 'Front Bumper Assembly',
    hood: 'Engine Hood & Cowl',
    windshield: 'Acoustic Windshield Glass',
    frontLeftFender: 'Front Left Fender',
    frontRightFender: 'Front Right Fender',
    doorsLeft: 'Driver Side Door Shells',
    doorsRight: 'Passenger Side Door Shells',
    roof: 'Roof Panel & Pillars',
    rearLeftQuarter: 'Rear Left Quarter Panel',
    rearRightQuarter: 'Rear Right Quarter Panel',
    trunk: 'Trunk / Liftgate Shell',
    rearBumper: 'Rear Bumper & Diffuser',
  };

  const currentZone = zones[selectedZoneKey] || { health: 100, status: 'pristine', defects: 0 };

  const handleZoneClick = (zoneKey) => {
    soundEffects.playClick();
    setSelectedZoneKey(zoneKey);
  };

  const getZoneColor = (health) => {
    if (health >= 95) return '#10b981'; // emerald
    if (health >= 75) return '#38bdf8'; // blue
    if (health >= 55) return '#f59e0b'; // amber
    return '#ef4444'; // critical red
  };

  const getZoneStatusBadge = (health, status) => {
    if (health >= 95) return <span className="badge badge-low">PRISTINE (100%)</span>;
    if (health >= 75) return <span className="badge badge-medium">GOOD ({health}%)</span>;
    if (health >= 55) return <span className="badge badge-high">DAMAGED ({health}%)</span>;
    return <span className="badge badge-critical">CRITICAL ({health}%)</span>;
  };

  // Find defects related to the selected zone
  const zoneDefects = (activeVehicle.defects || []).filter(d => {
    const title = (d.title + ' ' + d.category + ' ' + d.repairAction).toLowerCase();
    const key = selectedZoneKey.toLowerCase();
    if (key.includes('bumper') && title.includes('bumper')) return true;
    if (key.includes('hood') && title.includes('hood')) return true;
    if (key.includes('windshield') && (title.includes('windshield') || title.includes('glass'))) return true;
    if (key.includes('fender') && title.includes('fender')) return true;
    if (key.includes('doors') && (title.includes('door') || title.includes('scratch'))) return true;
    if (key.includes('trunk') && (title.includes('trunk') || title.includes('tailgate') || title.includes('liftgate') || title.includes('taillight'))) return true;
    return false;
  });

  return (
    <div className="chassis-diagnostics-container">
      {/* Overview header */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Activity size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Vehicle 360° Chassis & Body Shell Matrix
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Interactive ultrasonic and vision-mapped structural health across 12 perimeter inspection zones for {activeVehicle.name}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ color: 'var(--text-muted)' }}>Pristine</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
              <span style={{ color: 'var(--text-muted)' }}>Good</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ color: 'var(--text-muted)' }}>Damaged</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ color: 'var(--text-muted)' }}>Critical</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chassis-layout">
        {/* Visual Interactive SVG Schematic */}
        <div className="glass-panel chassis-svg-card">
          <div style={{ 
            position: 'absolute', 
            top: '16px', 
            left: '20px', 
            fontSize: '0.74rem', 
            color: 'var(--text-dim)', 
            fontFamily: 'var(--font-mono)' 
          }}>
            CLICK ANY ZONE TO INSPECT • TOP-DOWN SCHEMATIC
          </div>

          <svg 
            viewBox="0 0 500 750" 
            style={{ width: '100%', maxWidth: '380px', height: 'auto', filter: 'drop-shadow(0 0 15px rgba(0, 242, 254, 0.15))' }}
          >
            <defs>
              {/* Glow filter */}
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Car Outer Outline Guide */}
            <path
              d="M 170 80 
                 C 200 65, 300 65, 330 80 
                 C 370 100, 390 180, 390 280 
                 L 395 480 
                 C 395 590, 370 670, 330 690 
                 C 300 705, 200 705, 170 690 
                 C 130 670, 105 590, 105 480 
                 L 110 280 
                 C 110 180, 130 100, 170 80 Z"
              fill="rgba(15, 23, 42, 0.6)"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Front Bumper */}
            <path
              d="M 160 85 C 200 65, 300 65, 340 85 L 350 120 C 300 105, 200 105, 150 120 Z"
              fill={selectedZoneKey === 'frontBumper' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.frontBumper?.health || 100)}33`}
              stroke={getZoneColor(zones.frontBumper?.health || 100)}
              strokeWidth={selectedZoneKey === 'frontBumper' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('frontBumper')}
            />
            <text x="250" y="98" fill="#fff" fontSize="11" textAnchor="middle" fontWeight="600" pointerEvents="none">
              Front Bumper ({zones.frontBumper?.health || 100}%)
            </text>

            {/* Front Left Fender */}
            <path
              d="M 105 125 L 148 122 L 150 220 L 108 240 Z"
              fill={selectedZoneKey === 'frontLeftFender' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.frontLeftFender?.health || 100)}33`}
              stroke={getZoneColor(zones.frontLeftFender?.health || 100)}
              strokeWidth={selectedZoneKey === 'frontLeftFender' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('frontLeftFender')}
            />
            <text x="127" y="180" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="500" pointerEvents="none">
              L Fender
            </text>

            {/* Front Right Fender */}
            <path
              d="M 395 125 L 352 122 L 350 220 L 392 240 Z"
              fill={selectedZoneKey === 'frontRightFender' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.frontRightFender?.health || 100)}33`}
              stroke={getZoneColor(zones.frontRightFender?.health || 100)}
              strokeWidth={selectedZoneKey === 'frontRightFender' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('frontRightFender')}
            />
            <text x="372" y="180" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="500" pointerEvents="none">
              R Fender
            </text>

            {/* Hood */}
            <path
              d="M 152 124 C 200 110, 300 110, 348 124 L 345 225 C 295 218, 205 218, 155 225 Z"
              fill={selectedZoneKey === 'hood' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.hood?.health || 100)}33`}
              stroke={getZoneColor(zones.hood?.health || 100)}
              strokeWidth={selectedZoneKey === 'hood' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('hood')}
            />
            <text x="250" y="175" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="600" pointerEvents="none">
              Hood ({zones.hood?.health || 100}%)
            </text>

            {/* Windshield */}
            <path
              d="M 154 230 C 200 224, 300 224, 346 230 L 352 300 C 295 292, 205 292, 148 300 Z"
              fill={selectedZoneKey === 'windshield' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.windshield?.health || 100)}33`}
              stroke={getZoneColor(zones.windshield?.health || 100)}
              strokeWidth={selectedZoneKey === 'windshield' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('windshield')}
            />
            <text x="250" y="270" fill="#fff" fontSize="11" textAnchor="middle" fontWeight="600" pointerEvents="none">
              Windshield ({zones.windshield?.health || 100}%)
            </text>

            {/* Left Doors */}
            <path
              d="M 107 245 L 146 295 L 146 470 L 105 480 Z"
              fill={selectedZoneKey === 'doorsLeft' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.doorsLeft?.health || 100)}33`}
              stroke={getZoneColor(zones.doorsLeft?.health || 100)}
              strokeWidth={selectedZoneKey === 'doorsLeft' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('doorsLeft')}
            />
            <text x="126" y="385" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="600" pointerEvents="none" transform="rotate(-90 126 385)">
              Doors Left ({zones.doorsLeft?.health || 100}%)
            </text>

            {/* Right Doors */}
            <path
              d="M 393 245 L 354 295 L 354 470 L 395 480 Z"
              fill={selectedZoneKey === 'doorsRight' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.doorsRight?.health || 100)}33`}
              stroke={getZoneColor(zones.doorsRight?.health || 100)}
              strokeWidth={selectedZoneKey === 'doorsRight' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('doorsRight')}
            />
            <text x="374" y="385" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="600" pointerEvents="none" transform="rotate(90 374 385)">
              Doors Right ({zones.doorsRight?.health || 100}%)
            </text>

            {/* Roof */}
            <path
              d="M 152 305 L 348 305 L 348 465 L 152 465 Z"
              fill={selectedZoneKey === 'roof' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.roof?.health || 100)}33`}
              stroke={getZoneColor(zones.roof?.health || 100)}
              strokeWidth={selectedZoneKey === 'roof' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('roof')}
            />
            <text x="250" y="388" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="600" pointerEvents="none">
              Roof Panel ({zones.roof?.health || 100}%)
            </text>

            {/* Rear Left Quarter */}
            <path
              d="M 105 485 L 148 475 L 150 580 L 115 620 Z"
              fill={selectedZoneKey === 'rearLeftQuarter' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.rearLeftQuarter?.health || 100)}33`}
              stroke={getZoneColor(zones.rearLeftQuarter?.health || 100)}
              strokeWidth={selectedZoneKey === 'rearLeftQuarter' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('rearLeftQuarter')}
            />
            <text x="130" y="540" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="500" pointerEvents="none">
              Rear L
            </text>

            {/* Rear Right Quarter */}
            <path
              d="M 395 485 L 352 475 L 350 580 L 385 620 Z"
              fill={selectedZoneKey === 'rearRightQuarter' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.rearRightQuarter?.health || 100)}33`}
              stroke={getZoneColor(zones.rearRightQuarter?.health || 100)}
              strokeWidth={selectedZoneKey === 'rearRightQuarter' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('rearRightQuarter')}
            />
            <text x="370" y="540" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="500" pointerEvents="none">
              Rear R
            </text>

            {/* Trunk / Rear Glass */}
            <path
              d="M 152 470 L 348 470 L 340 585 C 295 595, 205 595, 160 585 Z"
              fill={selectedZoneKey === 'trunk' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.trunk?.health || 100)}33`}
              stroke={getZoneColor(zones.trunk?.health || 100)}
              strokeWidth={selectedZoneKey === 'trunk' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('trunk')}
            />
            <text x="250" y="530" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="600" pointerEvents="none">
              Trunk / Liftgate ({zones.trunk?.health || 100}%)
            </text>

            {/* Rear Bumper */}
            <path
              d="M 158 590 C 205 600, 295 600, 342 590 L 330 670 C 290 685, 210 685, 170 670 Z"
              fill={selectedZoneKey === 'rearBumper' ? 'rgba(0, 242, 254, 0.4)' : `${getZoneColor(zones.rearBumper?.health || 100)}33`}
              stroke={getZoneColor(zones.rearBumper?.health || 100)}
              strokeWidth={selectedZoneKey === 'rearBumper' ? "3" : "1.5"}
              className="chassis-zone-cell"
              onClick={() => handleZoneClick('rearBumper')}
            />
            <text x="250" y="640" fill="#fff" fontSize="11" textAnchor="middle" fontWeight="600" pointerEvents="none">
              Rear Bumper ({zones.rearBumper?.health || 100}%)
            </text>
          </svg>
        </div>

        {/* Selected Zone Deep Dive Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Circular Health Meter Card */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Fleet Health Index
            </div>

            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 12px' }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={getZoneColor(activeVehicle.overallScore)}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * activeVehicle.overallScore) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="tech-val" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                  {activeVehicle.overallScore}%
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>INTEGRITY</span>
              </div>
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
              {activeVehicle.status}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activeVehicle.safetyRating}
            </div>
          </div>

          {/* Active Zone Detail Card */}
          <div className="glass-panel" style={{ padding: '20px', flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {zoneNames[selectedZoneKey] || selectedZoneKey}
              </h3>
              {getZoneStatusBadge(currentZone.health, currentZone.status)}
            </div>

            {/* Health Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Structural Zone Health:</span>
                <strong className="tech-val" style={{ color: getZoneColor(currentZone.health) }}>
                  {currentZone.health} / 100
                </strong>
              </div>
              <div className="confidence-bar-bg" style={{ height: '8px' }}>
                <div
                  className="confidence-bar-fill"
                  style={{
                    width: `${currentZone.health}%`,
                    background: getZoneColor(currentZone.health)
                  }}
                />
              </div>
            </div>

            {/* Zone Telemetry */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>DEFECTS FOUND</div>
                <div className="tech-val" style={{ fontSize: '1.1rem', fontWeight: 700, color: currentZone.defects > 0 ? '#f87171' : '#10b981' }}>
                  {currentZone.defects}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ADAS SENSORS</div>
                <div className="tech-val" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8' }}>
                  {selectedZoneKey.includes('windshield') || selectedZoneKey.includes('Bumper') ? 'CALIB REQ.' : 'NOMINAL'}
                </div>
              </div>
            </div>

            {/* Associated Defects in this zone */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Zone Defect Dossier:
              </div>

              {zoneDefects.length === 0 ? (
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                  padding: '12px', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.8rem',
                  color: '#34d399'
                }}>
                  <CheckCircle2 size={16} />
                  <span>This zone passed automated visual inspection without any detected anomalies.</span>
                </div>
              ) : (
                zoneDefects.map(defect => (
                  <div 
                    key={defect.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{defect.title}</strong>
                      <span className="tech-val" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                        ${defect.totalCost?.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {defect.repairAction}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => onNavigateToScanner()}
                      style={{ padding: '4px 8px', fontSize: '0.72rem', width: '100%', justifyContent: 'center' }}
                    >
                      <span>View in Camera Canvas</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
