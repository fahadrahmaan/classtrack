import { useMemo } from 'react';
import type { SessionData } from '../types';

interface Props {
  sessions: SessionData[];
  onSelectTrainer: (trainerName: string) => void;
  onGoToObserver: () => void;
  onBack: () => void;
}

export default function TrainerSelectionScreen({ sessions, onSelectTrainer, onGoToObserver, onBack }: Props) {
  const trainerStats = useMemo(() => {
    const stats: Record<string, number> = {};
    sessions.forEach(s => {
      const t = s.trainer?.trim() || 'Unknown Trainer';
      stats[t] = (stats[t] || 0) + 1;
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [sessions]);

  return (
    <div className="min-h-screen flex flex-col p-6 screen-fade" style={{ background: 'var(--bentonite-bg)' }}>
      <div className="max-w-2xl w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-black/5 transition-colors no-select"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bentonite-text-secondary">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-bentonite-text-primary">
            Trainer Selection
          </h2>
          <div className="w-10" /> {/* Spacer to center title */}
        </div>

        {trainerStats.length === 0 ? (
          <div 
            className="rounded-card border p-8 text-center space-y-6"
            style={{
              background: 'var(--bentonite-card)',
              borderColor: 'var(--bentonite-border)',
            }}
          >
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--bentonite-learner-bg)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--bentonite-learner)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-bentonite-text-primary">No Observations Found</h3>
              <p className="text-sm text-bentonite-text-secondary">
                No classroom observations have been recorded yet.
              </p>
            </div>
            
            <button
              onClick={onGoToObserver}
              className="px-6 py-3 text-sm font-semibold rounded-chip border transition-all no-select inline-block mt-4"
              style={{
                background: 'var(--bentonite-learner-bg)',
                borderColor: 'var(--bentonite-border)',
                color: 'var(--bentonite-learner)',
              }}
            >
              Go to Observer
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {trainerStats.map(trainer => (
              <button
                key={trainer.name}
                onClick={() => onSelectTrainer(trainer.name)}
                className="rounded-card border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg no-select group"
                style={{
                  background: 'var(--bentonite-card)',
                  borderColor: 'var(--bentonite-border)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-bentonite-text-primary group-hover:text-bentonite-trainer transition-colors">
                      {trainer.name}
                    </h3>
                    <p 
                      className="text-xs font-semibold text-bentonite-text-secondary"
                      style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      {trainer.count} Session{trainer.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--bentonite-trainer-bg)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bentonite-trainer)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
