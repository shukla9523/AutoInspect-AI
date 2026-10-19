import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Radio
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function VoiceCopilot({ activeVehicle }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.1);
  const [speechText, setSpeechText] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Whenever vehicle changes, stop ongoing speech and update the script
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }

    if (!activeVehicle) return;

    const defectCount = activeVehicle.defects?.length || 0;
    const topDefect = activeVehicle.defects?.[0]?.title || 'general surface wear';
    const totalRepair = activeVehicle.totalEstimatedRepair?.toFixed(2) || '0.00';

    const script = `AutoInspect AI Copilot briefing for ${activeVehicle.name}. Overall vehicle integrity is scored at ${activeVehicle.overallScore} out of 100, categorized as ${activeVehicle.status}. Neural vision sensors localized ${defectCount} anomalies, primarily ${topDefect}. Total estimated repair is $${totalRepair}. Roadworthiness recommendation: ${activeVehicle.safetyRating}.`;

    setSpeechText(script);
  }, [activeVehicle?.id]);

  const handleStartSpeaking = () => {
    if (!synthRef.current || !speechText) return;

    soundEffects.playClick();

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;

    // Pick best English voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  };

  const handlePauseSpeaking = () => {
    if (!synthRef.current) return;
    soundEffects.playClick();
    synthRef.current.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStopSpeaking = () => {
    if (!synthRef.current) return;
    soundEffects.playClick();
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleChangeRate = (rate) => {
    soundEffects.playClick();
    setPlaybackRate(rate);
    if (isSpeaking) {
      handleStopSpeaking();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="voice-copilot-bar">
      {/* Left side: Avatar & Visual Waveform */}
      <div className="voice-status-block">
        <div className="voice-avatar">
          <Mic size={20} />
          {isSpeaking && (
            <div 
              className="radar-ring" 
              style={{
                position: 'absolute',
                inset: 0,
                border: '2px solid rgba(0, 242, 254, 0.7)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
              AI Copilot Voice Inspector
            </span>
            <span className={`badge ${isSpeaking ? 'badge-low' : 'badge-medium'}`} style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
              {isSpeaking ? 'NARRATING' : isPaused ? 'PAUSED' : 'STANDBY'}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '580px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
            {speechText}
          </div>
        </div>

        {/* Dynamic Equalizer Bars */}
        <div className="eq-bars-container" style={{ marginLeft: '12px' }}>
          {[1, 2, 3, 4, 5].map((bar) => (
            <span
              key={bar}
              className={`eq-bar ${isSpeaking ? 'active' : ''}`}
              style={{
                height: isSpeaking ? undefined : '4px',
                background: isSpeaking ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Right side: Audio Playback Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
          {[1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              className={`nav-tab-btn ${playbackRate === rate ? 'active' : ''}`}
              onClick={() => handleChangeRate(rate)}
              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Play / Pause Toggle */}
        {!isSpeaking ? (
          <button
            type="button"
            className="btn-primary"
            onClick={handleStartSpeaking}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            title="Listen to spoken damage briefing"
          >
            <Play size={14} fill="currentColor" />
            <span>{isPaused ? 'Resume Briefing' : 'Audio Briefing'}</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePauseSpeaking}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            title="Pause narration"
          >
            <Pause size={14} />
            <span>Pause</span>
          </button>
        )}

        {/* Stop button */}
        {(isSpeaking || isPaused) && (
          <button
            type="button"
            className="btn-secondary"
            onClick={handleStopSpeaking}
            style={{ padding: '6px 10px' }}
            title="Stop narration"
          >
            <Square size={13} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
