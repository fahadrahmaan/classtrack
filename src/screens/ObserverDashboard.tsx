import type { SessionData, IcapLevel } from '../types';
import { calculateIcap, formatDate, formatDuration, calcTotalDuration } from '../utils';

interface Props {
  sessions: SessionData[];
  onStartNew: () => void;
  onViewSaved: () => void;
  onViewSession: (session: SessionData) => void;
  onLogout: () => void;
}

const ICAP_LEVELS: IcapLevel[] = ['Interactive', 'Constructive', 'Active', 'Passive'];

export default function ObserverDashboard({ sessions, onStartNew, onViewSaved, onViewSession, onLogout }: Props) {
  
  // Calculate aggregate metrics
  const totalSessions = sessions.length;
  
  const totalLearners = sessions.reduce((acc, s) => acc + (s.learnerCount || 0), 0);
  
  const totalSeconds = sessions.reduce((acc, s) => {
    return acc + calcTotalDuration(s.startTime, s.endTime);
  }, 0);
  const totalMins = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMins / 60);
  const displayTime = totalHours > 0 ? `${totalHours}h ${totalMins % 60}m` : `${totalMins}m`;

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 3);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-12 screen-fade" style={{ background: 'var(--bentonite-bg)' }}>
      
      {/* Header bar */}
      <div 
        className="flex items-center justify-between pb-4 border-b mb-6"
        style={{ borderColor: 'var(--bentonite-border)', paddingTop: 'max(12px, env(safe-area-inset-top))' }}
      >
        <div>
          <h1 className="text-xl font-bold text-bentonite-text-primary tracking-tight">LEOP Observer</h1>
          <p className="text-[10px] text-bentonite-text-secondary mt-0.5" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Classroom Observation
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-xs font-semibold px-3 py-2 rounded-chip border bg-white text-bentonite-text-secondary active:opacity-60 transition-opacity no-select"
          style={{ borderColor: 'var(--bentonite-border)' }}
        >
          Sign Out
        </button>
      </div>

      {/* Greeting banner */}
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-bentonite-text-primary">Welcome, Observer</h2>
        <p className="text-xs text-bentonite-text-secondary mt-0.5">{today}</p>
      </header>

      {/* Quick Action Cards */}
      <section className="grid grid-cols-2 gap-3.5 mb-8">
        <button
          onClick={onStartNew}
          className="flex flex-col items-start p-4 rounded-card border text-left active:opacity-90 transition-all no-select"
          style={{ background: 'var(--bentonite-trainer-bg)', borderColor: 'var(--bentonite-border)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3 bg-white/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bentonite-trainer)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="text-sm font-bold text-bentonite-trainer">New Observation</span>
          <span className="text-[11px] text-bentonite-text-secondary mt-1">Start classroom audit</span>
        </button>

        <button
          onClick={onViewSaved}
          className="flex flex-col items-start p-4 rounded-card border text-left active:opacity-90 transition-all no-select"
          style={{ background: 'var(--bentonite-learner-bg)', borderColor: 'var(--bentonite-border)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3 bg-white/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bentonite-learner)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-bentonite-learner">Saved Sessions</span>
          <span className="text-[11px] text-bentonite-text-secondary mt-1">View {totalSessions} records</span>
        </button>
      </section>

      {/* Metrics Row */}
      <section className="mb-8 space-y-3">
        <h3 className="text-xs font-bold text-bentonite-text-secondary" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Overview Metrics
        </h3>
        <div className="grid grid-cols-3 gap-3">
          
          {/* Observed Sessions */}
          <div 
            className="p-3.5 rounded-card border text-center"
            style={{ background: 'var(--bentonite-card)', borderColor: 'var(--bentonite-border)' }}
          >
            <p className="text-[10px] font-semibold text-bentonite-text-secondary uppercase">Sessions</p>
            <p className="text-2xl font-bold mt-1 text-bentonite-text-primary">{totalSessions}</p>
          </div>

          {/* Observed Learners */}
          <div 
            className="p-3.5 rounded-card border text-center"
            style={{ background: 'var(--bentonite-card)', borderColor: 'var(--bentonite-border)' }}
          >
            <p className="text-[10px] font-semibold text-bentonite-text-secondary uppercase">Learners</p>
            <p className="text-2xl font-bold mt-1 text-bentonite-text-primary">{totalLearners}</p>
          </div>

          {/* Observation Time */}
          <div 
            className="p-3.5 rounded-card border text-center"
            style={{ background: 'var(--bentonite-card)', borderColor: 'var(--bentonite-border)' }}
          >
            <p className="text-[10px] font-semibold text-bentonite-text-secondary uppercase">Time</p>
            <p className="text-2xl font-bold mt-1 text-bentonite-text-primary">{displayTime}</p>
          </div>

        </div>
      </section>

      {/* Recent Observations */}
      <section className="flex-1">
        <h3 className="text-xs font-bold text-bentonite-text-secondary mb-4" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Recent Observations
        </h3>

        {recentSessions.length === 0 ? (
          <div 
            className="rounded-card border p-8 text-center space-y-2"
            style={{ background: 'var(--bentonite-card)', borderColor: 'var(--bentonite-border)' }}
          >
            <p className="text-sm font-medium text-bentonite-text-primary">No observations logged yet</p>
            <p className="text-xs text-bentonite-text-secondary">Tap 'New Observation' to begin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const icap = calculateIcap(session.windows);
              const duration = calcTotalDuration(session.startTime, session.endTime);
              return (
                <div
                  key={session.id}
                  onClick={() => onViewSession(session)}
                  className="rounded-card border p-4 active:opacity-80 transition-opacity cursor-pointer text-left"
                  style={{ background: 'var(--bentonite-card)', borderColor: 'var(--bentonite-border)' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-bentonite-text-primary truncate">{session.site}</p>
                      <p className="text-xs text-bentonite-text-secondary truncate">Trainer: {session.trainer}</p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-xs text-bentonite-text-secondary">{formatDate(session.startTime)}</p>
                      <p className="text-xs font-mono font-semibold text-bentonite-text-primary tabular-nums">
                        {formatDuration(duration)}
                      </p>
                    </div>
                  </div>

                  {/* ICAP bar thumbnail */}
                  <div className="flex h-2 rounded-full overflow-hidden mt-3" style={{ background: 'var(--bentonite-bg)' }}>
                    {ICAP_LEVELS.map((level) => {
                      const result = icap[level];
                      if (result.percentage === 0) return null;
                      return (
                        <div
                          key={level}
                          className="h-full"
                          style={{ width: `${result.percentage}%`, background: result.color }}
                        />
                      );
                    })}
                  </div>

                  {/* ICAP mini labels */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                    {ICAP_LEVELS.map((level) => {
                      const result = icap[level];
                      if (result.count === 0) return null;
                      return (
                        <div key={level} className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: result.color }} />
                          <p className="text-[10px] text-bentonite-text-secondary">{Math.round(result.percentage)}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
