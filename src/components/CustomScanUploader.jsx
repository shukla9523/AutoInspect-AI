import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle, 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audio';

export default function CustomScanUploader({ onCustomVehicleReady }) {
  const [selectedImage, setSelectedImage] = useState('./samples/front_bumper.jpg');
  const [imageName, setImageName] = useState('front_bumper_sample.jpg');
  const [vehicleMakeModel, setVehicleMakeModel] = useState('2024 Honda Civic Type R');
  const [vehicleVIN, setVehicleVIN] = useState('1HGFC2F76PE102934');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1, 2, 3, 4 = done
  const [isDone, setIsDone] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const samplePresets = [
    { name: 'Front Bumper Abrasion', src: './samples/front_bumper.jpg', model: '2023 Subaru WRX Limited' },
    { name: 'Door Key Scratch', src: './samples/door_scratch.jpg', model: '2022 BMW 740i xDrive' },
    { name: 'Rear Collision Impact', src: './samples/rear_collision.jpg', model: '2024 Hyundai Tucson SEL' },
    { name: 'Windshield Fracture', src: './samples/windshield_crack.jpg', model: '2023 Audi Q5 TFSI' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setImageName(file.name);
      setIsDone(false);
      setCurrentStep(0);
      soundEffects.playClick();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setImageName(file.name);
      setIsDone(false);
      setCurrentStep(0);
      soundEffects.playClick();
    }
  };

  const handleSelectPreset = (preset) => {
    soundEffects.playClick();
    setSelectedImage(preset.src);
    setImageName(preset.name);
    setVehicleMakeModel(preset.model);
    setIsDone(false);
    setCurrentStep(0);
  };

  const handleStartAnalysis = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsDone(false);
    setCurrentStep(1);
    soundEffects.playScanSweep();

    // Step 2
    setTimeout(() => {
      setCurrentStep(2);
      soundEffects.playDefectFound('medium');
    }, 900);

    // Step 3
    setTimeout(() => {
      setCurrentStep(3);
      soundEffects.playDefectFound('high');
    }, 1800);

    // Step 4
    setTimeout(() => {
      setCurrentStep(4);
      setIsProcessing(false);
      setIsDone(true);
      soundEffects.playScanComplete();

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#38bdf8', '#10b981']
        });
      } catch (err) {
        console.warn(err);
      }
    }, 2800);
  };

  const handleLaunchInScanner = () => {
    soundEffects.playClick();
    // Build custom vehicle profile
    const customVehicle = {
      id: `custom-${Date.now()}`,
      name: vehicleMakeModel || 'Custom Inspected Vehicle',
      vin: vehicleVIN || 'CUSTOM-VIN-' + Math.floor(Math.random() * 900000 + 100000),
      plate: 'AI-TEST',
      mileage: '12,500 mi',
      color: 'Custom Finish',
      engine: '2.0L Turbo',
      transmission: 'Automatic',
      image: selectedImage,
      inspectionAngle: 'Custom Camera Angle',
      overallScore: 72,
      status: 'Fair - Surface Defects Identified',
      safetyRating: 'Drivable with Service Advisory',
      totalEstimatedRepair: 890.00,
      zones: {
        frontBumper: { health: 65, status: 'damaged', defects: 2 },
        hood: { health: 95, status: 'good', defects: 0 },
        windshield: { health: 100, status: 'pristine', defects: 0 },
        frontRightFender: { health: 85, status: 'minor_damage', defects: 1 },
        frontLeftFender: { health: 100, status: 'pristine', defects: 0 },
        doorsLeft: { health: 100, status: 'pristine', defects: 0 },
        doorsRight: { health: 100, status: 'pristine', defects: 0 },
        roof: { health: 100, status: 'pristine', defects: 0 },
        rearRightQuarter: { health: 100, status: 'pristine', defects: 0 },
        rearLeftQuarter: { health: 100, status: 'pristine', defects: 0 },
        trunk: { health: 100, status: 'pristine', defects: 0 },
        rearBumper: { health: 100, status: 'pristine', defects: 0 },
      },
      defects: [
        {
          id: 'custom-def-1',
          title: 'Surface Paint Scuff & Clearcoat Abrasion',
          category: 'Paint Damage',
          severity: 'medium',
          confidence: 0.968,
          box: { x: 40, y: 45, w: 28, h: 25 },
          dimensions: { length: '28 cm', area: '290 cm²', depth: '0.8 mm' },
          layerMask: 'polygon(42% 46%, 66% 46%, 67% 68%, 41% 69%)',
          repairAction: 'Featheredge sanding, primer surfacer, color blend & clear coat',
          partNumber: 'N/A',
          laborType: 'Refinish & Paint',
          laborHours: 2.8,
          partsCost: 0,
          paintCost: 160.00,
          laborCost: 280.00,
          totalCost: 440.00,
          urgency: 'Moderate - Prevent oxidation',
        },
        {
          id: 'custom-def-2',
          title: 'Trim Bracket Impact Crease',
          category: 'Panel Deformation',
          severity: 'high',
          confidence: 0.942,
          box: { x: 52, y: 58, w: 18, h: 18 },
          dimensions: { length: '14 cm', area: '120 cm²', depth: '1.8 mm crease' },
          layerMask: 'polygon(53% 59%, 69% 59%, 68% 75%, 53% 74%)',
          repairAction: 'PDR lever access or panel alignment fixture adjustment',
          partNumber: '71108-T20-A00',
          laborType: 'Body Specialist',
          laborHours: 2.0,
          partsCost: 150.00,
          paintCost: 0,
          laborCost: 300.00,
          totalCost: 450.00,
          urgency: 'High - Structural alignment check',
        }
      ]
    };

    onCustomVehicleReady(customVehicle);
  };

  return (
    <div className="custom-scan-container">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size={20} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Custom Vehicle AI Vision Diagnostic Pipeline
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Upload any vehicle exterior photograph or select a sample image to execute the YOLOv11 &amp; Mitchell damage estimation neural network.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
        {/* Left Column: Upload / Preview */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Preset Buttons */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
              Quick Test Sample Images:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {samplePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={`btn-secondary ${selectedImage === preset.src ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  <ImageIcon size={13} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className={`upload-dropzone ${isDragActive ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }} 
            />

            <UploadCloud size={44} color="var(--accent-cyan)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Drag &amp; drop vehicle image here
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Supports high-resolution JPEG, PNG, WEBP files up to 25MB
            </p>
            <span className="btn-secondary" style={{ display: 'inline-flex' }}>
              Browse Files from Computer
            </span>
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div style={{ marginTop: '20px', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <img 
                src={selectedImage} 
                alt="Selected Vehicle Preview" 
                style={{ width: '100%', height: '320px', objectFit: 'contain', background: '#000', display: 'block' }} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                padding: '8px 14px', 
                background: 'rgba(7, 10, 18, 0.85)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.78rem' 
              }}>
                <span className="tech-val" style={{ color: '#fff' }}>{imageName}</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Ready for Vision Tensor Inference</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Processing Pipeline & Form */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="var(--accent-cyan)" />
              <span>Neural Pipeline Configuration</span>
            </h3>

            {/* Inputs */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                Vehicle Make / Model:
              </label>
              <input 
                type="text" 
                value={vehicleMakeModel} 
                onChange={(e) => setVehicleMakeModel(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                VIN (Vehicle Identification Number):
              </label>
              <input 
                type="text" 
                value={vehicleVIN} 
                onChange={(e) => setVehicleVIN(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            {/* Neural Pipeline Progress Steps */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Processing Stages:
              </div>

              <div className={`pipeline-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStep >= 1 ? '#10b981' : '#64748b' }} />
                <span>1. Image Preprocessing &amp; Color Normalization</span>
                {currentStep > 1 && <CheckCircle size={14} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>

              <div className={`pipeline-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStep >= 2 ? '#10b981' : '#64748b' }} />
                <span>2. YOLOv11 Multi-Scale Damage Localization</span>
                {currentStep > 2 && <CheckCircle size={14} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>

              <div className={`pipeline-step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'done' : ''}`}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStep >= 3 ? '#10b981' : '#64748b' }} />
                <span>3. Depth Calculus &amp; Severity Classification</span>
                {currentStep > 3 && <CheckCircle size={14} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>

              <div className={`pipeline-step ${currentStep === 4 ? 'done' : ''}`}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStep >= 4 ? '#10b981' : '#64748b' }} />
                <span>4. OEM Parts &amp; Flat-Rate Labor Estimator</span>
                {currentStep >= 4 && <CheckCircle size={14} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div>
            {!isDone ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleStartAnalysis}
                disabled={isProcessing}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={17} className="spin" />
                    <span>Executing Vision Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    <span>Run AI Damage Diagnostic</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleLaunchInScanner}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <span>Launch in Interactive Scanner</span>
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
