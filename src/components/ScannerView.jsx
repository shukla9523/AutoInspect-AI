import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Ruler, 
  Wrench, 
  Check, 
  SlidersHorizontal,
  Sparkles,
  ExternalLink,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audio';
import VoiceCopilot from './VoiceCopilot';

export default function ScannerView({ 
  vehicles, 
  activeVehicle, 
  setActiveVehicle, 
  onNavigateToTab 
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDefects, setScannedDefects] = useState([]);
  const [selectedDefectId, setSelectedDefectId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0.85);
  const [verifiedDefects, setVerifiedDefects] = useState({});

  const imageContainerRef = useRef(null);

  // When vehicle changes, reset scan state or reveal all defects
  useEffect(() => {
    setSelectedDefectId(activeVehicle.defects?.[0]?.id || null);
    setScannedDefects(activeVehicle.defects?.map(d => d.id) || []);
    setZoomLevel(1);
  }, [activeVehicle.id]);

  // Initiate AI Laser Diagnostic Scan
  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScannedDefects([]);
    soundEffects.playScanSweep();

    const defects = activeVehicle.defects || [];
    
    // Progressively reveal defects with defect audio pings
    defects.forEach((defect, index) => {
      setTimeout(() => {
        setScannedDefects(prev => [...prev, defect.id]);
        soundEffects.playDefectFound(defect.severity);
      }, 700 + index * 650);
    });

    // Complete scan
    setTimeout(() => {
      setIsScanning(false);
      soundEffects.playScanComplete();
      
      // Confetti burst for clean inspection
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#38bdf8', '#10b981', '#f59e0b']
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }, 700 + defects.length * 650 + 400);
  };

  const handleSelectDefect = (defectId) => {
    soundEffects.playClick();
    setSelectedDefectId(defectId);
  };

  const toggleVerifyDefect = (defectId, e) => {
    e?.stopPropagation();
    soundEffects.playClick();
    setVerifiedDefects(prev => ({
      ...prev,
      [defectId]: !prev[defectId]
    }));
  };

  // Filter defects based on confidence threshold
  const filteredDefects = (activeVehicle.defects || []).filter(
    d => d.confidence >= minConfidence
  );

  const selectedDefect = activeVehicle.defects?.find(d => d.id === selectedDefectId);

  // Helper for severity badge color
  const getSeverityBadgeClass = (severity) => {
    switch(severity) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  return (
    <div className="scanner-view-container">
      {/* Vehicle Selector Tabs */}
      <div className="vehicle-selector-bar">
        {vehicles.map((veh) => {
          const isCurrent = veh.id === activeVehicle.id;
          return (
            <button
              key={veh.id}
              type="button"
              className={`vehicle-pill ${isCurrent ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setActiveVehicle(veh);
              }}
            >
              <img 
                src={veh.image} 
                alt={veh.name} 
                className="vehicle-pill-thumb" 
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: isCurrent ? '#fff' : '#cbd5e1' }}>
                  {veh.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: isCurrent ? 'var(--accent-cyan)' : '#64748b' }}>
                  {veh.plate} • {veh.defects?.length || 0} Defects
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Voice Copilot Briefing Assistant */}
      <VoiceCopilot activeVehicle={activeVehicle} />

      {/* Active Vehicle Meta Bar */}
      <div className="glass-panel vehicle-meta-strip">
        <div className="vehicle-info-block">
          <h2>
            {activeVehicle.name}
            <span className={`badge ${getSeverityBadgeClass(activeVehicle.defects?.[0]?.severity || 'medium')}`}>
              {activeVehicle.status}
            </span>
          </h2>
          <div className="vehicle-specs-tags">
            <span className="spec-chip">VIN: <strong>{activeVehicle.vin}</strong></span>
            <span className="spec-chip">Plate: <strong>{activeVehicle.plate}</strong></span>
            <span className="spec-chip">Mileage: <strong>{activeVehicle.mileage}</strong></span>
            <span className="spec-chip">Color: <strong>{activeVehicle.color}</strong></span>
            <span className="spec-chip">Angle: <strong>{activeVehicle.inspectionAngle}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Safety Certification
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
              {activeVehicle.safetyRating}
            </div>
          </div>

          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: activeVehicle.overallScore > 75 
              ? 'rgba(16, 185, 129, 0.15)' 
              : activeVehicle.overallScore > 60 
                ? 'rgba(245, 158, 11, 0.15)' 
                : 'rgba(239, 68, 68, 0.15)',
            border: `2px solid ${
              activeVehicle.overallScore > 75 
                ? '#10b981' 
                : activeVehicle.overallScore > 60 
                  ? '#f59e0b' 
                  : '#ef4444'
            }`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>{activeVehicle.overallScore}</span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginTop: '-3px' }}>PTS</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Section: Canvas + Defects Column */}
      <div className="scanner-grid">
        {/* Canvas Section */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          {/* Scan Controls Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '14px', 
            flexWrap: 'wrap', 
            gap: '12px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleStartScan}
                disabled={isScanning}
                style={{ 
                  opacity: isScanning ? 0.7 : 1,
                  boxShadow: isScanning ? '0 0 30px rgba(0, 242, 254, 0.7)' : undefined
                }}
              >
                <Scan size={18} className={isScanning ? "spin" : ""} />
                <span>{isScanning ? 'Scanning Surface...' : 'Initiate AI Diagnostic Scan'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Confidence Min:</span>
                <input 
                  type="range"
                  min="0.80"
                  max="0.99"
                  step="0.01"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  style={{ width: '80px', accentColor: 'var(--accent-cyan)' }}
                  title={`Show defects with confidence ≥ ${(minConfidence * 100).toFixed(0)}%`}
                />
                <span className="tech-val" style={{ color: 'var(--accent-cyan)', fontSize: '0.78rem' }}>
                  {(minConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Quick toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className={`btn-secondary ${showBoxes ? 'active' : ''}`}
                onClick={() => setShowBoxes(!showBoxes)}
                title="Toggle Bounding Boxes"
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <Layers size={14} />
                <span>Bounding Boxes</span>
              </button>

              <button
                type="button"
                className={`btn-secondary ${showMasks ? 'active' : ''}`}
                onClick={() => setShowMasks(!showMasks)}
                title="Toggle AI Segmentation Masks"
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <Sparkles size={14} />
                <span>Instance Masks</span>
              </button>

              <button
                type="button"
                className={`btn-secondary ${showDimensions ? 'active' : ''}`}
                onClick={() => setShowDimensions(!showDimensions)}
                title="Toggle AI Dimension Tags"
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <Ruler size={14} />
                <span>Dimensions</span>
              </button>

              <button
                type="button"
                className={`btn-secondary ${showHeatmap ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setShowHeatmap(!showHeatmap);
                }}
                title="Toggle Multi-Spectral Thermal Damage Heatmap"
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '0.78rem',
                  borderColor: showHeatmap ? '#f59e0b' : undefined,
                  color: showHeatmap ? '#fbbf24' : undefined
                }}
              >
                <Flame size={14} color={showHeatmap ? '#fbbf24' : 'currentColor'} />
                <span>Thermal Heatmap</span>
              </button>
            </div>
          </div>

          {/* Interactive Inspection Canvas */}
          <div className="canvas-container" ref={imageContainerRef}>
            {/* Background grid */}
            <div className="scanner-hud-grid" />

            {/* Laser scanning beam line */}
            {isScanning && <div className="laser-scanner-line" />}

            {/* Thermal Legend HUD Overlay */}
            {showHeatmap && (
              <div className="thermal-legend-bar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={12} />
                    FLIR THERMAL STRESS
                  </span>
                  <span className="tech-val" style={{ color: '#fff', fontSize: '0.68rem' }}>PEAK: 68.4°C</span>
                </div>
                <div className="thermal-gradient-strip" />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                  <span>18°C (Ambient)</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>68°C (Damage)</span>
                </div>
              </div>
            )}

            {/* Canvas Image & Overlays */}
            <div 
              className="canvas-image-wrapper"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.25s ease'
              }}
            >
              <img 
                src={activeVehicle.image} 
                alt={activeVehicle.name} 
                className="canvas-img"
              />

              {/* Thermal Damage Heatmap Layer */}
              {showHeatmap && (
                <div 
                  className="thermal-heatmap-layer"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 7,
                    mixBlendMode: 'screen',
                    opacity: 0.88
                  }}
                >
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                    <defs>
                      {filteredDefects.map((defect) => {
                        const cx = defect.box.x + defect.box.w / 2;
                        const cy = defect.box.y + defect.box.h / 2;
                        const r = Math.max(defect.box.w, defect.box.h) * 1.4;
                        return (
                          <radialGradient key={`heat-${defect.id}`} id={`heat-${defect.id}`} cx={`${cx}%`} cy={`${cy}%`} r={`${r}%`} fx={`${cx}%`} fy={`${cy}%`}>
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                            <stop offset="20%" stopColor="#ef4444" stopOpacity="0.88" />
                            <stop offset="48%" stopColor="#f59e0b" stopOpacity="0.65" />
                            <stop offset="72%" stopColor="#00f2fe" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                          </radialGradient>
                        );
                      })}
                    </defs>

                    {/* Ambient cool infrared baseline */}
                    <rect width="100" height="100" fill="rgba(15, 23, 42, 0.45)" />

                    {/* Defect Thermal Radial Hotspots */}
                    {filteredDefects.map((defect) => (
                      <rect
                        key={`heat-rect-${defect.id}`}
                        width="100"
                        height="100"
                        fill={`url(#heat-${defect.id})`}
                      />
                    ))}
                  </svg>
                </div>
              )}

              {/* Segmentation Masks (SVG Polygons / Clip Paths) */}
              {showMasks && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 8 }}>
                  {filteredDefects.map((defect) => {
                    if (!scannedDefects.includes(defect.id) && isScanning) return null;
                    const isSelected = defect.id === selectedDefectId;
                    
                    return (
                      <div
                        key={`mask-${defect.id}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          clipPath: defect.layerMask,
                          background: isSelected 
                            ? 'rgba(0, 242, 254, 0.45)' 
                            : defect.severity === 'critical'
                              ? 'rgba(239, 68, 68, 0.35)'
                              : defect.severity === 'high'
                                ? 'rgba(245, 158, 11, 0.32)'
                                : 'rgba(0, 242, 254, 0.28)',
                          boxShadow: 'inset 0 0 20px rgba(0, 242, 254, 0.6)',
                          filter: isSelected ? 'drop-shadow(0 0 10px #00f2fe)' : 'none',
                          transition: 'all 0.25s ease'
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Bounding Boxes */}
              {showBoxes && filteredDefects.map((defect) => {
                const isRevealed = scannedDefects.includes(defect.id);
                if (!isRevealed && isScanning) return null;

                const isSelected = defect.id === selectedDefectId;
                const { x, y, w, h } = defect.box;

                return (
                  <div
                    key={defect.id}
                    className={`bounding-box severity-${defect.severity} ${isSelected ? 'selected pulse-glow' : ''}`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${w}%`,
                      height: `${h}%`,
                    }}
                    onClick={() => handleSelectDefect(defect.id)}
                    title={`${defect.title} (${(defect.confidence * 100).toFixed(1)}% confidence)`}
                  >
                    {/* Targeting reticle brackets */}
                    <span className="corner-tl" />
                    <span className="corner-tr" />
                    <span className="corner-bl" />
                    <span className="corner-br" />

                    {/* Tag label above box */}
                    {showConfidence && (
                      <div 
                        className="box-tag" 
                        style={{ 
                          color: defect.severity === 'critical' 
                            ? '#f87171' 
                            : defect.severity === 'high' 
                              ? '#fbbf24' 
                              : '#38bdf8' 
                        }}
                      >
                        {defect.category} • {(defect.confidence * 100).toFixed(1)}%
                      </div>
                    )}

                    {/* Dimension Tag */}
                    {showDimensions && defect.dimensions && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          marginTop: '4px',
                          background: 'rgba(7, 10, 18, 0.9)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#e2e8f0',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {defect.dimensions.length} ({defect.dimensions.depth})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Canvas Floating Toolbar */}
            <div className="canvas-toolbar">
              <button 
                type="button" 
                className="toolbar-btn"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>

              <button 
                type="button" 
                className="toolbar-btn"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>

              <button 
                type="button" 
                className="toolbar-btn"
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>

              <span style={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

              <span className="tech-val" style={{ fontSize: '0.74rem', color: 'var(--text-dim)', padding: '0 6px' }}>
                Zoom: {(zoomLevel * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detected Defects List & Detailed Telemetry */}
        <div className="glass-panel defect-list-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Detected Defects ({filteredDefects.length})
              </h3>
            </div>
            <span className="tech-val" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
              Est. Total: ${activeVehicle.totalEstimatedRepair?.toFixed(2)}
            </span>
          </div>

          {filteredDefects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-dim)' }}>
              <CheckCircle size={36} color="#10b981" style={{ marginBottom: '8px' }} />
              <p>No defects matching confidence threshold &gt;= {(minConfidence * 100).toFixed(0)}%</p>
            </div>
          ) : (
            filteredDefects.map((defect) => {
              const isSelected = defect.id === selectedDefectId;
              const isVerified = verifiedDefects[defect.id];

              return (
                <div
                  key={defect.id}
                  className={`defect-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectDefect(defect.id)}
                >
                  <div className="defect-header">
                    <div>
                      <div className="defect-title">{defect.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Zone: {defect.category}
                      </div>
                    </div>
                    <span className={`badge ${getSeverityBadgeClass(defect.severity)}`}>
                      {defect.severity.toUpperCase()}
                    </span>
                  </div>

                  {/* Confidence gauge bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>AI Neural Confidence</span>
                      <strong className="tech-val" style={{ color: 'var(--accent-cyan)' }}>
                        {(defect.confidence * 100).toFixed(1)}%
                      </strong>
                    </div>
                    <div className="confidence-bar-bg">
                      <div 
                        className="confidence-bar-fill"
                        style={{ width: `${defect.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Dimension measurements */}
                  {defect.dimensions && (
                    <div className="dimension-pills">
                      <span className="dimension-pill">L: {defect.dimensions.length}</span>
                      <span className="dimension-pill">Area: {defect.dimensions.area}</span>
                      <span className="dimension-pill">Depth: {defect.dimensions.depth}</span>
                    </div>
                  )}

                  {/* Prescribed action */}
                  <div className="repair-action-box">
                    <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>
                      Recommended Repair Action:
                    </strong>
                    {defect.repairAction}
                  </div>

                  {/* Urgency */}
                  {defect.urgency && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: defect.severity === 'critical' ? '#f87171' : '#fbbf24', 
                      marginTop: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px' 
                    }}>
                      <ShieldAlert size={13} />
                      <span>{defect.urgency}</span>
                    </div>
                  )}

                  {/* Cost breakdown row & Adjuster toggle */}
                  <div className="cost-row">
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>
                        Labor: {defect.laborHours}h ({defect.laborType})
                      </span>
                      <span className="tech-val" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                        ${defect.totalCost?.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className={`btn-secondary ${isVerified ? 'active' : ''}`}
                        onClick={(e) => toggleVerifyDefect(defect.id, e)}
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        title="Mark verified by licensed inspector"
                      >
                        <Check size={13} color={isVerified ? '#10b981' : 'inherit'} />
                        <span>{isVerified ? 'Verified' : 'Verify'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playClick();
                          onNavigateToTab('costs');
                        }}
                        style={{ padding: '4px 8px' }}
                        title="View itemized breakdown in Repair Cost tab"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
