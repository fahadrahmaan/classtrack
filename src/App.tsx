import { useState, useEffect } from 'react';
import type { Screen, SessionSetup, SessionData, User } from './types';
import { loadSessions } from './storage';
import SessionSetupScreen from './screens/SessionSetupScreen';
import ObservationScreen from './screens/ObservationScreen';
import SummaryScreen from './screens/SummaryScreen';
import SavedSessionsScreen from './screens/SavedSessionsScreen';
import TrainerDashboard from './screens/TrainerDashboard';
import ObserverDashboard from './screens/ObserverDashboard';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [setup, setSetup] = useState<SessionSetup | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [savedSessions, setSavedSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    setSavedSessions(loadSessions());
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'trainer') {
      setScreen('trainer-dashboard');
    } else {
      setScreen('observer-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bentonite-bg)' }}>
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
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
          onBack={() => setScreen(user?.role === 'trainer' ? 'trainer-dashboard' : 'observer-dashboard')}
          onView={handleViewSession}
          onDeleted={handleDeleted}
        />
      )}
      {screen === 'trainer-dashboard' && (
        <TrainerDashboard
          trainerName={user?.username || 'Trainer'}
          sessions={savedSessions.filter(s => s.trainer === user?.username)}
          onBack={handleLogout}
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
