import React from 'react';
import { 
  Scan, 
  Car, 
  Wrench, 
  FileText, 
  UploadCloud, 
  Volume2, 
  VolumeX, 
  Printer, 
  Activity,
  ShieldCheck,
  Sparkles,
  Camera
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isMuted, 
  setIsMuted, 
  onOpenReport,
  onOpenCamera,
  totalVehiclesCount = 4
}) {
  const handleTabClick = (tabId) => {
    soundEffects.playClick();
    setActiveTab(tabId);
  };

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEffects.playClick();
    }
  };

  return (
    <header className="app-header no-print">
      {/* Top micro telemetry ribbon */}
      <div className="telemetry-bar">
        <div className="telemetry-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="telemetry-item">
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#10b981', 
                display: 'inline-block',
                boxShadow: '0 0 10px #10b981' 
              }}></span>
              <strong style={{ color: '#10b981' }}>VISION PIPELINE v4.8 ONLINE</strong>
            </span>
            <span className="telemetry-item">
              Latency: <strong>38ms</strong>
            </span>
            <span className="telemetry-item">
              Tensor Resolution: <strong>2048x1536 HD</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="telemetry-item">
              Detection Accuracy: <strong style={{ color: 'var(--accent-cyan)' }}>98.4%</strong>
            </span>
            <span className="telemetry-item">
              Fleet Database: <strong>{totalVehiclesCount} Registered</strong>
            </span>
            <span className="telemetry-item">
              <ShieldCheck size={14} color="#38bdf8" />
              OEM Insurance Certified
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-icon-box">
            <Scan size={26} color="#00f2fe" />
            <div className="radar-ring" style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid rgba(0, 242, 254, 0.6)',
              borderRadius: 'inherit',
              pointerEvents: 'none'
            }} />
          </div>
          <div>
            <h1 className="brand-title">
              AutoInspect <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </h1>
            <div className="brand-subtitle">
              Automotive Vision & Damage Estimation Suite
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            type="button"
            className={`nav-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => handleTabClick('scanner')}
            title="Inspect vehicle defects with interactive bounding boxes & AI scan sweep"
          >
            <Scan size={17} />
            <span>AI Damage Scanner</span>
          </button>

          <button 
            type="button"
            className={`nav-tab-btn ${activeTab === 'chassis' ? 'active' : ''}`}
            onClick={() => handleTabClick('chassis')}
            title="Inspect 360-degree vehicle chassis zones and health metrics"
          >
            <Car size={17} />
            <span>360° Chassis Diagnostics</span>
          </button>

          <button 
            type="button"
            className={`nav-tab-btn ${activeTab === 'costs' ? 'active' : ''}`}
            onClick={() => handleTabClick('costs')}
            title="Itemized repair estimates, parts catalog, and insurance claims"
          >
            <Wrench size={17} />
            <span>Repair & Claims Costing</span>
          </button>

          <button 
            type="button"
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabClick('history')}
            title="Fleet inspection ledger and past claims"
          >
            <FileText size={17} />
            <span>Fleet Audit History</span>
          </button>

          <button 
            type="button"
            className={`nav-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => handleTabClick('upload')}
            title="Upload custom vehicle image for neural vision analysis"
          >
            <UploadCloud size={17} />
            <span>Custom AI Scan</span>
          </button>
        </nav>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button"
            className="btn-secondary"
            onClick={handleToggleSound}
            title={isMuted ? "Unmute AI Sound Effects" : "Mute Sound Effects"}
            style={{ padding: '8px 12px' }}
          >
            {isMuted ? (
              <>
                <VolumeX size={17} color="#ef4444" />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Muted</span>
              </>
            ) : (
              <>
                <Volume2 size={17} color="#00f2fe" />
                <span style={{ fontSize: '0.8rem' }}>Sound FX</span>
              </>
            )}
          </button>

          <button 
            type="button"
            className="btn-primary"
            onClick={() => {
              soundEffects.playClick();
              onOpenCamera();
            }}
            title="Open Live Phone / Laptop Camera Vehicle Scanner"
            style={{ 
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              color: '#fff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Camera size={17} />
            <span>Live Camera</span>
          </button>

          <button 
            type="button"
            className="btn-primary"
            onClick={() => {
              soundEffects.playClick();
              onOpenReport();
            }}
            title="Generate print-ready certified vehicle damage appraisal"
            style={{ padding: '8px 16px' }}
          >
            <Printer size={17} />
            <span>Official Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
