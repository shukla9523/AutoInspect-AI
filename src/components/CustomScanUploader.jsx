import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle, 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audio';
import { executeMachineLearningInspection } from '../utils/mlEngine';

export default function CustomScanUploader({ onCustomVehicleReady }) {
  const [selectedImage, setSelectedImage] = useState('./samples/front_bumper.jpg');
  const [imageName, setImageName] = useState('front_bumper_sample.jpg');
  const [vehicleMakeModel, setVehicleMakeModel] = useState('2024 Honda Civic Type R');
  const [vehicleVIN, setVehicleVIN] = useState('1HGFC2F76PE102934');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1, 2, 3, 4 = done
  const [isDone, setIsDone] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [mlData, setMlData] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
      setMlData(null);
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
      setMlData(null);
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
    setMlData(null);
  };

  const handleStartAnalysis = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsDone(false);
    setCurrentStep(1);
    soundEffects.playScanSweep();

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const onImageLoaded = async () => {
      // Step 2: YOLO & Object localization
      setTimeout(() => {
        setCurrentStep(2);
        soundEffects.playDefectFound('medium');
      }, 700);

      // Step 3: Computer Vision pixel & gradient calculus
      setTimeout(() => {
        setCurrentStep(3);
        soundEffects.playDefectFound('high');
      }, 1400);

      const inspection = await executeMachineLearningInspection(img, vehicleMakeModel);
      setMlData(inspection);

      // Step 4: Cost estimation completion
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
      }, 2100);
    };

    img.onload = onImageLoaded;
    img.onerror = () => {
      // Fallback if crossOrigin fails on some browsers
      onImageLoaded();
    };
    img.src = selectedImage;
  };

  const handleLaunchInScanner = () => {
    soundEffects.playClick();

    const finalDefects = mlData?.defects || [];
    const finalScore = mlData?.overallScore || 78;
    const finalStatus = mlData?.status || 'Fair - Surface Defects Identified';
    const finalSafety = mlData?.safetyRating || 'Drivable with Service Advisory';
    const finalCost = mlData?.totalEstimatedRepair || 680.00;

    // Build custom vehicle profile
    const customVehicle = {
      id: `custom-${Date.now()}`,
      name: vehicleMakeModel || 'Custom Inspected Vehicle',
      vin: vehicleVIN || 'CUSTOM-VIN-' + Math.floor(Math.random() * 900000 + 100000),
      plate: 'AI-ML',
      mileage: '12,500 mi',
      color: 'Custom Finish',
      engine: '2.0L Turbo',
      transmission: 'Automatic',
      image: selectedImage,
      inspectionAngle: 'Custom Camera Angle',
      overallScore: finalScore,
      status: finalStatus,
      safetyRating: finalSafety,
      totalEstimatedRepair: finalCost,
      zones: {
        frontBumper: { health: finalScore, status: finalScore < 70 ? 'damaged' : 'good', defects: finalDefects.length },
        hood: { health: 100, status: 'pristine', defects: 0 },
        windshield: { health: 100, status: 'pristine', defects: 0 },
        frontRightFender: { health: 90, status: 'good', defects: 0 },
        frontLeftFender: { health: 100, status: 'pristine', defects: 0 },
        doorsLeft: { health: 100, status: 'pristine', defects: 0 },
        doorsRight: { health: 100, status: 'pristine', defects: 0 },
        roof: { health: 100, status: 'pristine', defects: 0 },
        rearRightQuarter: { health: 100, status: 'pristine', defects: 0 },
        rearLeftQuarter: { health: 100, status: 'pristine', defects: 0 },
        trunk: { health: 100, status: 'pristine', defects: 0 },
        rearBumper: { health: 100, status: 'pristine', defects: 0 },
      },
      defects: finalDefects
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
            <input 
              ref={cameraInputRef}
              type="file" 
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }} 
            />

            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Drag &amp; drop vehicle image or take a photo
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Supports phone camera capture, JPEG, PNG, WEBP files
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="btn-secondary" style={{ display: 'inline-flex' }}>
                Browse Files
              </span>
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                style={{ 
                  display: 'inline-flex', 
                  padding: '7px 16px', 
                  fontSize: '0.82rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: '#fff',
                  boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Camera size={15} />
                <span>Snap Live Photo</span>
              </button>
            </div>
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
