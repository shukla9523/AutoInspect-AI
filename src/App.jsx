import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ScannerView from './components/ScannerView';
import ChassisDiagnostics from './components/ChassisDiagnostics';
import RepairCostEstimator from './components/RepairCostEstimator';
import FleetAuditHistory from './components/FleetAuditHistory';
import CustomScanUploader from './components/CustomScanUploader';
import ReportModal from './components/ReportModal';
import CameraScannerModal from './components/CameraScannerModal';
import { VEHICLES_DATA } from './data/mockVehicles';
import { soundEffects } from './utils/audio';

export default function App() {
  const [vehicles, setVehicles] = useState(VEHICLES_DATA);
  const [activeVehicleId, setActiveVehicleId] = useState(VEHICLES_DATA[0].id);
  const [activeTab, setActiveTab] = useState('scanner');
  const [isMuted, setIsMuted] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];

  const handleSelectVehicle = (vehicle) => {
    setActiveVehicleId(vehicle.id);
  };

  const handleSelectVehicleById = (id) => {
    setActiveVehicleId(id);
    setActiveTab('scanner');
  };

  const handleCustomVehicleReady = (customVehicle) => {
    setVehicles(prev => [customVehicle, ...prev]);
    setActiveVehicleId(customVehicle.id);
    setActiveTab('scanner');
  };

  return (
    <div className="app-container">
      {/* Top Cyberpunk / Automotive Navigation & Telemetry */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenCamera={() => setIsCameraOpen(true)}
        totalVehiclesCount={vehicles.length}
      />

      {/* Main Workspace Stage */}
      <main className="main-content">
        {activeTab === 'scanner' && (
          <ScannerView 
            vehicles={vehicles}
            activeVehicle={activeVehicle}
            setActiveVehicle={handleSelectVehicle}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'chassis' && (
          <ChassisDiagnostics 
            activeVehicle={activeVehicle}
            onNavigateToScanner={() => setActiveTab('scanner')}
          />
        )}

        {activeTab === 'costs' && (
          <RepairCostEstimator 
            activeVehicle={activeVehicle}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <FleetAuditHistory 
            onSelectVehicleById={handleSelectVehicleById}
          />
        )}

        {activeTab === 'upload' && (
          <CustomScanUploader 
            onCustomVehicleReady={handleCustomVehicleReady}
          />
        )}
      </main>

      {/* Official Certified Appraisal Print / PDF Modal */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeVehicle={activeVehicle}
      />

      {/* Live Phone / Webcam Real-Time ML Scanner Modal */}
      <CameraScannerModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onVehicleCreated={handleCustomVehicleReady}
      />
    </div>
  );
}
