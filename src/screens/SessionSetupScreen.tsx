import { useState, useRef } from 'react';
import type { SessionSetup, InstructionMode } from '../types';

interface Props {
  onStart: (setup: SessionSetup) => void;
  onShowSaved: () => void;
  onShowDashboard: () => void;
  savedCount: number;
}

const MODES: InstructionMode[] = ['Trainer-led', 'App-led', 'Mixed'];

export default function SessionSetupScreen({ onStart, onShowSaved, onShowDashboard, savedCount }: Props) {
  const [site, setSite] = useState('');
  const [trainer, setTrainer] = useState('');
  const [topic, setTopic] = useState('');
  const [trade, setTrade] = useState('');
  const [learnerCount, setLearnerCount] = useState('');
  const [mode, setMode] = useState<InstructionMode>('Mixed');
  const [errors, setErrors] = useState<{ site?: string; trainer?: string }>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    const newErrors: { site?: string; trainer?: string } = {};
    if (!site.trim()) newErrors.site = 'Site name is required';
    if (!trainer.trim()) newErrors.trainer = 'Trainer name is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onStart({
      site: site.trim(),
      trainer: trainer.trim(),
      topic: topic.trim(),
      trade: trade.trim(),
      learnerCount: learnerCount ? parseInt(learnerCount, 10) : 0,
      mode,
    });
  };

  const scrollToFocused = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col screen-fade" style={{ background: 'var(--bentonite-bg)' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button
              onClick={onShowDashboard}
              className="text-bentonite-text-secondary active:opacity-60 no-select -ml-2"
              style={{ minHeight: 44, minWidth: 44 }}
              aria-label="Go back"
          >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-bentonite-text-primary tracking-tight">ClassTrack</h1>
            <p className="text-xs text-bentonite-text-secondary mt-0.5" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Classroom Observation
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pb-40 scrollbar-hide"
      >
        <div className="space-y-5">
          {/* Site */}
          <div>
            <label className="block text-xs font-semibold text-bentonite-text-secondary mb-2" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Site Name
            </label>
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              onFocus={scrollToFocused}
              placeholder="e.g. Vazhakkad ITI"
              className="w-full rounded-chip border bg-bentonite-card px-4 py-3.5 text-sm text-bentonite-text-primary placeholder:text-bentonite-text-secondary/50 outline-none transition-colors"
              style={{
                borderColor: errors.site ? '#A07030' : '#DDD5C8',
                minHeight: 48,
              }}
            />
            {errors.site && <p className="text-xs mt-1.5" style={{ color: '#A07030' }}>{errors.site}</p>}
          </div>

          {/* Trainer */}
          <div>
            <label className="block text-xs font-semibold text-bentonite-text-secondary mb-2" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Trainer Name
            </label>
            <input
              type="text"
              value={trainer}
              onChange={(e) => setTrainer(e.target.value)}
              onFocus={scrollToFocused}
              placeholder="e.g. Ameen"
              className="w-full rounded-chip border bg-bentonite-card px-4 py-3.5 text-sm text-bentonite-text-primary placeholder:text-bentonite-text-secondary/50 outline-none transition-colors"
              style={{
                borderColor: errors.trainer ? '#A07030' : '#DDD5C8',
                minHeight: 48,
              }}
            />
            {errors.trainer && <p className="text-xs mt-1.5" style={{ color: '#A07030' }}>{errors.trainer}</p>}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-bentonite-text-secondary mb-2" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Topic / Module
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={scrollToFocused}
              placeholder="e.g. AI Literacy Unit 2"
              className="w-full rounded-chip border bg-bentonite-card px-4 py-3.5 text-sm text-bentonite-text-primary placeholder:text-bentonite-text-secondary/50 outline-none transition-colors"
              style={{ borderColor: '#DDD5C8', minHeight: 48 }}
            />
          </div>

          {/* Trade */}
          <div>
            <label className="block text-xs font-semibold text-bentonite-text-secondary mb-2" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Trade / Course
            </label>
            <input
              type="text"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              onFocus={scrollToFocused}
              placeholder="e.g. Draughtsman Civil"
              className="w-full rounded-chip border bg-bentonite-card px-4 py-3.5 text-sm text-bentonite-text-primary placeholder:text-bentonite-text-secondary/50 outline-none transition-colors"
              style={{ borderColor: '#DDD5C8', minHeight: 48 }}
            />
          </div>

          {/* Learner count */}
          <div>
            <label className="block text-xs font-semibold text-bentonite-text-secondary mb-2" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Number of Learners
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={learnerCount}
              onChange={(e) => setLearnerCount(e.target.value)}
              onFocus={scrollToFocused}
              placeholder="e.g. 18"
              className="w-full rounded-chip border bg-bentonite-card px-4 py-3.5 text-sm text-bentonite-text-primary placeholder:text-bentonite-text-secondary/50 outline-none transition-colors"
              style={{ borderColor: '#DDD5C8', minHeight: 48 }}
            />
          </div>

          {/* Instruction mode */}
          <div>
            <label className="block text-xs font-semibold text-bentonite-text-secondary mb-2" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Instruction Mode
            </label>
            <div className="flex rounded-chip border overflow-hidden" style={{ borderColor: '#DDD5C8' }}>
              {MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-3 text-sm font-medium transition-colors no-select"
                  style={{
                    background: mode === m ? '#5C4A3A' : '#FDFAF5',
                    color: mode === m ? '#FFFFFF' : '#7A6555',
                    minHeight: 44,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pt-3"
        style={{
          background: 'linear-gradient(to top, var(--bentonite-bg) 70%, transparent)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={handleStart}
          className="w-full text-white font-semibold text-base rounded-chip active:opacity-90 no-select transition-opacity"
          style={{
            background: '#5C4A3A',
            height: 56,
          }}
        >
          Begin Observation
        </button>
      </div>
    </div>
  );
}
