import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  FlipHorizontal, 
  Sparkles, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Scan
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audio';
import { executeMachineLearningInspection } from '../utils/mlEngine';

export default function CameraScannerModal({ isOpen, onClose, onVehicleCreated }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back camera, 'user' = selfie
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [vehicleName, setVehicleName] = useState('Live Scanned Vehicle');

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setCapturedImage(null);
      setIsAnalyzing(false);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or permission denied. You can take a photo using your phone camera file picker below.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleToggleCamera = () => {
    soundEffects.playClick();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Capture Snapshot from Live Video Stream
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    soundEffects.playScanSweep();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
    
    // Automatically trigger ML Analysis
    runMLAnalysis(dataUrl, canvas);
  };

  // Handle upload / native mobile file capture
  const handleNativeFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      soundEffects.playClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setCapturedImage(dataUrl);
        stopCamera();
        
        const img = new Image();
        img.onload = () => {
          runMLAnalysis(dataUrl, img);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Real ML + Computer Vision Analysis
  const runMLAnalysis = async (imageUrl, imgElement) => {
    setIsAnalyzing(true);
    setAnalysisStatus('Executing TensorFlow Tensor Normalization...');
    soundEffects.playScanSweep();

    try {
      setTimeout(() => {
        setAnalysisStatus('Running Sobel Edge & Surface Defect Discontinuity Analysis...');
        soundEffects.playDefectFound('medium');
      }, 700);

      setTimeout(() => {
        setAnalysisStatus('Calculating Volumetric Displacement & Mitchell Part Catalog Match...');
        soundEffects.playDefectFound('high');
      }, 1500);

      const inspectionResult = await executeMachineLearningInspection(imgElement, vehicleName);

      setTimeout(() => {
        setIsAnalyzing(false);
        soundEffects.playScanComplete();

        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#00f2fe', '#38bdf8', '#10b981']
          });
        } catch (e) {
          console.warn(e);
        }

        // Construct dynamic vehicle entity
        const newVehicle = {
          id: `live-scan-${Date.now()}`,
          name: vehicleName,
          vin: `AI-VIN-${Math.floor(Math.random() * 900000 + 100000)}`,
          plate: 'LIVE-SCAN',
          mileage: 'Current Capture',
          color: 'Camera Detected Finish',
          engine: 'Standard Powertrain',
          transmission: 'Automatic',
          image: imageUrl,
          inspectionAngle: 'Live Phone Camera Snapshot',
          overallScore: inspectionResult.overallScore,
          status: inspectionResult.status,
          safetyRating: inspectionResult.safetyRating,
          totalEstimatedRepair: inspectionResult.totalEstimatedRepair,
          zones: {
            frontBumper: { health: inspectionResult.overallScore, status: inspectionResult.overallScore < 70 ? 'damaged' : 'good', defects: inspectionResult.defects.length },
            hood: { health: 100, status: 'pristine', defects: 0 },
            windshield: { health: 100, status: 'pristine', defects: 0 },
            frontRightFender: { health: 90, status: 'good', defects: 0 },
            frontLeftFender: { health: 90, status: 'good', defects: 0 },
            doorsLeft: { health: 100, status: 'pristine', defects: 0 },
            doorsRight: { health: 100, status: 'pristine', defects: 0 },
            roof: { health: 100, status: 'pristine', defects: 0 },
            rearRightQuarter: { health: 100, status: 'pristine', defects: 0 },
            rearLeftQuarter: { health: 100, status: 'pristine', defects: 0 },
            trunk: { health: 100, status: 'pristine', defects: 0 },
            rearBumper: { health: 100, status: 'pristine', defects: 0 },
          },
          defects: inspectionResult.defects
        };

        onVehicleCreated(newVehicle);
        onClose();
      }, 2300);

    } catch (err) {
      console.error('Inspection error:', err);
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    soundEffects.playClick();
    setCapturedImage(null);
    setIsAnalyzing(false);
    startCamera(facingMode);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', overflow: 'hidden' }}
      >
        {/* Modal Top Control Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '14px 20px', 
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(13, 19, 34, 0.98)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(0, 242, 254, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid var(--accent-cyan)' 
            }}>
              <Camera size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#fff' }}>
                Live Camera Vehicle Scanner
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Real-Time In-Browser TensorFlow &amp; Sobel Edge ML Inspection
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '6px 10px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Stage */}
        <div style={{ position: 'relative', background: '#000', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Live Video Feed */}
          {!capturedImage && !cameraError && (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
            />
          )}

          {/* Captured Photo Preview */}
          {capturedImage && (
            <img 
              src={capturedImage} 
              alt="Captured Vehicle" 
              style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
            />
          )}

          {/* HUD Reticle Overlay */}
          {!capturedImage && !cameraError && (
            <div style={{ 
              position: 'absolute', 
              inset: '20px', 
              border: '2px dashed rgba(0, 242, 254, 0.5)', 
              borderRadius: '16px',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px'
            }}>
              <div style={{ 
                background: 'rgba(7, 10, 18, 0.8)', 
                padding: '4px 12px', 
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(0, 242, 254, 0.4)'
              }}>
                ALIGN CAR BODY / DAMAGED PANEL IN RETICLE
              </div>

              {/* Center Target Crosshairs */}
              <div style={{ width: '40px', height: '40px', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--accent-cyan)', borderRadius: '50%' }} />
              </div>

              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '4px' }}>
                TENSORFLOW TENSOR VISION ACTIVE
              </div>
            </div>
          )}

          {/* Camera Error or Fallback Screen */}
          {cameraError && !capturedImage && (
            <div style={{ padding: '36px 20px', textAlign: 'center', maxWidth: '460px' }}>
              <AlertCircle size={44} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                Use Phone Camera or Upload Photo
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                {cameraError}
              </p>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                style={{ margin: '0 auto', padding: '10px 20px' }}
              >
                <Camera size={16} />
                <span>Snap Photo with Phone Camera</span>
              </button>
            </div>
          )}

          {/* Analyzing Neural Pipeline Overlay */}
          {isAnalyzing && (
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'rgba(7, 10, 18, 0.88)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              backdropFilter: 'blur(8px)'
            }}>
              <div className="laser-scanner-line" />
              <RefreshCw size={38} color="var(--accent-cyan)" className="spin" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                AI Vision Model Processing
              </h3>
              <p className="tech-val" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                {analysisStatus}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Shutter & Options Toolbar */}
        <div style={{ 
          padding: '16px 20px', 
          background: 'rgba(13, 19, 34, 0.98)', 
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Hidden File Input with native capture="environment" for phone camera */}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            capture="environment"
            onChange={handleNativeFileUpload}
            style={{ display: 'none' }}
          />

          {!capturedImage ? (
            <>
              {/* Flip camera button */}
              <button
                type="button"
                className="btn-secondary"
                onClick={handleToggleCamera}
                title="Flip to Front/Rear Camera"
                style={{ padding: '8px 12px' }}
              >
                <FlipHorizontal size={17} />
                <span>Flip Cam</span>
              </button>

              {/* Shutter Snap Button */}
              <button
                type="button"
                className="btn-primary"
                onClick={handleSnapPhoto}
                disabled={isAnalyzing || !stream}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '9999px',
                  boxShadow: '0 0 25px rgba(0, 242, 254, 0.6)'
                }}
              >
                <Camera size={18} />
                <span>Capture &amp; Analyze</span>
              </button>

              {/* Phone Gallery / Camera Upload */}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '8px 12px' }}
              >
                <Upload size={16} />
                <span>Choose Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRetake}
                disabled={isAnalyzing}
              >
                <RefreshCw size={16} />
                <span>Retake Photo</span>
              </button>

              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
                {isAnalyzing ? 'Extracting Damage Telemetry...' : 'Analyzing Snapshot...'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
