import { useState, useEffect } from 'react';
import type { Screen, SessionSetup, SessionData } from './types';
import { loadSessions } from './storage';
import SessionSetupScreen from './screens/SessionSetupScreen';
import ObservationScreen from './screens/ObservationScreen';
import SummaryScreen from './screens/SummaryScreen';
import SavedSessionsScreen from './screens/SavedSessionsScreen';
import TrainerDashboard from './screens/TrainerDashboard';
import ObserverDashboard from './screens/ObserverDashboard';
import LoginScreen from './screens/LoginScreen';
import TrainerSelectionScreen from './screens/TrainerSelectionScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [role, setRole] = useState<'trainer' | 'observer' | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [setup, setSetup] = useState<SessionSetup | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [savedSessions, setSavedSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    setSavedSessions(loadSessions());
  }, []);

  const handleLogin = (selectedRole: 'trainer' | 'observer') => {
    setRole(selectedRole);
    if (selectedRole === 'trainer') {
      setScreen('trainer-selection');
    } else {
      setScreen('observer-dashboard');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setSelectedTrainer(null);
    setScreen('login');
  };

  const handleStart = (s: SessionSetup) => {
    setSetup(s);
    setScreen('observation');
  };

  const handleEnd = (session: SessionData) => {
    setCurrentSession(session);
    setScreen('summary');
  };

  const handleNewSession = () => {
    setSetup(null);
    setCurrentSession(null);
    setScreen('setup');
  };

  const handleShowSaved = () => {
    setScreen('saved');
  };

  const handleViewSession = (session: SessionData) => {
    setCurrentSession(session);
    setScreen('summary');
  };

  const handleSaved = () => {
    setSavedSessions(loadSessions());
  };

  const handleDeleted = (updated: SessionData[]) => {
    setSavedSessions(updated);
  };

  const handleSelectTrainer = (trainerName: string) => {
    setSelectedTrainer(trainerName);
    setScreen('trainer-dashboard');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bentonite-bg)' }}>
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      {screen === 'trainer-selection' && (
        <TrainerSelectionScreen
          sessions={savedSessions}
          onSelectTrainer={handleSelectTrainer}
          onGoToObserver={() => handleLogin('observer')}
          onBack={handleLogout}
        />
      )}
      {screen === 'setup' && (
        <SessionSetupScreen
          onStart={handleStart}
          onShowSaved={handleShowSaved}
          onShowDashboard={() => setScreen('observer-dashboard')}
          savedCount={savedSessions.length}
        />
      )}
      {screen === 'observation' && setup && (
        <ObservationScreen
          setup={setup}
          onEnd={handleEnd}
        />
      )}
      {screen === 'summary' && currentSession && (
        <SummaryScreen
          session={currentSession}
          onNewSession={handleNewSession}
          onSaved={handleSaved}
        />
      )}
      {screen === 'saved' && (
        <SavedSessionsScreen
          sessions={savedSessions}
          onBack={() => setScreen(role === 'trainer' ? 'trainer-dashboard' : 'observer-dashboard')}
          onView={handleViewSession}
          onDeleted={handleDeleted}
        />
      )}
      {screen === 'trainer-dashboard' && selectedTrainer && (
        <TrainerDashboard
          trainerName={selectedTrainer}
          sessions={savedSessions.filter(s => s.trainer?.trim().toLowerCase() === selectedTrainer.toLowerCase())}
          onBack={() => setScreen('trainer-selection')}
        />
      )}
      {screen === 'observer-dashboard' && (
        <ObserverDashboard
          sessions={savedSessions}
          onStartNew={() => setScreen('setup')}
          onViewSaved={() => setScreen('saved')}
          onViewSession={handleViewSession}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
