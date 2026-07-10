import { useState, useEffect, useRef } from 'react';
import type { SessionSetup, ObservationWindow, WindowType, SessionData } from '../types';
import { TRAINER_CHIPS, LEARNER_CHIPS, TRAINER_DURATION, LEARNER_DURATION } from '../constants';

interface Props {
  setup: SessionSetup;
  onEnd: (session: SessionData) => void;
  onBack?: () => void;
}

export default function ObservationScreen({ setup, onEnd, onBack }: Props) {
  const [activeCard, setActiveCard] = useState<WindowType>('trainer');
  const [trainerChips, setTrainerChips] = useState<string[]>([]);
  const [learnerChips, setLearnerChips] = useState<string[]>([]);
  const [windowLog, setWindowLog] = useState<ObservationWindow[]>([]);
  const [barKey, setBarKey] = useState(0);
  const [chipsVisible, setChipsVisible] = useState(true);
  const [showEndSheet, setShowEndSheet] = useState(false);
  const [sheetExiting, setSheetExiting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTimeRef = useRef<string>(new Date().toISOString());
  interface WakeLockSentinel {
    release(): Promise<void>;
  }

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Refs for interval access
  const activeCardRef = useRef<WindowType>('trainer');
  const trainerChipsRef = useRef<string[]>([]);
  const learnerChipsRef = useRef<string[]>([]);


  useEffect(() => { activeCardRef.current = activeCard; }, [activeCard]);

  // WakeLock
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
        }
      } catch { /* not supported */ }
    };
    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLockRef.current) {
        try { wakeLockRef.current.release(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Timer for elapsed seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer — single interval for the whole screen lifecycle
  useEffect(() => {
    const duration = activeCardRef.current === 'trainer' ? TRAINER_DURATION : LEARNER_DURATION;
    const timeout = setTimeout(() => {
      handleWindowSwitch();
    }, duration * 1000);

    return () => clearTimeout(timeout);
  }, [barKey]); // restart timer when barKey changes (on each switch)

  const handleWindowSwitch = () => {
    // Capture BOTH type and chips as local constants BEFORE touching any ref or state.
    // React batches setState calls and may invoke the setWindowLog functional-update
    // callback *after* activeCardRef.current has already been mutated to nextCard —
    // so reading the ref inside the callback would log the wrong type.
    const currentType: WindowType = activeCardRef.current;
    const currentChips = currentType === 'trainer' ? trainerChipsRef.current : learnerChipsRef.current;
    const nextCard: WindowType = currentType === 'trainer' ? 'learner' : 'trainer';
    const logTimestamp = new Date().toISOString();

    // 1. Log current window using fully captured values (no refs inside callback)
    setWindowLog((prev) => [...prev, {
      windowNumber: prev.length + 1,
      type: currentType,
      timestamp: logTimestamp,
      chipsSelected: [...currentChips],
    }]);

    // 2. Reset only the card that just ended
    if (currentType === 'trainer') {
      setTrainerChips([]);
      trainerChipsRef.current = [];
    } else {
      setLearnerChips([]);
      learnerChipsRef.current = [];
    }

    // 3. Fade chips out
    setChipsVisible(false);

    // 4. Haptic
    try { navigator.vibrate?.(80); } catch { /* ignore */ }

    // 5. Switch card — update ref synchronously so timer effect reads correct value
    activeCardRef.current = nextCard;
    setActiveCard(nextCard);

    // 6. Reset progress bar after transition completes (420ms)
    setTimeout(() => {
      setBarKey((prev) => prev + 1);
    }, 420);

    // 7. Fade chips in after delay
    setTimeout(() => {
      setChipsVisible(true);
    }, 220);
  };


  const toggleChip = (chip: string) => {
    // Route by chip identity — trainer chips always go to trainerChips,
    // learner chips always go to learnerChips. This prevents any race
    // condition where a queued tap fires after activeCardRef has already
    // flipped to the next card.
    if ((TRAINER_CHIPS as readonly string[]).includes(chip)) {
      setTrainerChips((prev) => {
        const next = prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip];
        trainerChipsRef.current = next;
        return next;
      });
    } else {
      setLearnerChips((prev) => {
        const next = prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip];
        learnerChipsRef.current = next;
        return next;
      });
    }
  };

  const handleEndSession = () => {
    // Log current window before ending
    const currentChips = activeCard === 'trainer' ? trainerChips : learnerChips;
    const allWindows = [...windowLog, {
      windowNumber: windowLog.length + 1,
      type: activeCard,
      timestamp: new Date().toISOString(),
      chipsSelected: [...currentChips],
    }];

    const session: SessionData = {
      id: crypto.randomUUID(),
      site: setup.site,
      trainer: setup.trainer,
      topic: setup.topic,
      trade: setup.trade,
      learnerCount: setup.learnerCount,
      mode: setup.mode,
      startTime: startTimeRef.current,
      endTime: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      windows: allWindows,
    };

    onEnd(session);
  };

  const confirmEnd = () => {
    setSheetExiting(true);
    setTimeout(() => {
      setShowEndSheet(false);
      setSheetExiting(false);
      handleEndSession();
    }, 200);
  };

  const cancelEnd = () => {
    setSheetExiting(true);
    setTimeout(() => {
      setShowEndSheet(false);
      setSheetExiting(false);
    }, 200);
  };

  const sessionInfo = `${setup.site} · ${setup.trainer}`;

  function formatElapsed(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return (
    <div
      className="flex flex-col screen-fade overflow-hidden"
      style={{ height: '100dvh', background: 'var(--bentonite-bg)' }}
    >
      {/* Trainer Card */}
      <div
        className="obs-card relative flex flex-col"
        style={{
          height: activeCard === 'trainer' ? '75vh' : '25vh',
          background: '#EDE0D0',
          opacity: activeCard === 'trainer' ? 1 : 0.6,
        }}
      >
        {/* Top row: label + session info */}
        <div className="flex items-start justify-between px-4 pt-4 shrink-0">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-bentonite-text-secondary active:opacity-60 no-select -ml-2"
                style={{ minHeight: 44, minWidth: 44 }}
                aria-label="Go back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <span
              className="text-[11px] font-semibold no-select"
              style={{ color: '#7A6555', letterSpacing: '0.14em' }}
            >
              TRAINER
            </span>
          </div>
          <div className="flex flex-col items-start text-left">
            <span
              className="text-[11px] no-select mt-2"
              style={{ color: '#7A6555' }}
            >
              {sessionInfo}
            </span>
            <span
              className="text-[11px] no-select mt-1"
              style={{ color: '#9A8878' }}
            >
              Elapsed · {formatElapsed(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Chips area — bottom 55% of expanded card */}
        {activeCard === 'trainer' && (
          <div
            className={`chips-wrap flex-1 flex flex-col justify-end pb-4 ${chipsVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: chipsVisible ? 'all' : 'none' }}
          >
            <p
              className="text-[10px] font-semibold mb-2 px-4 no-select"
              style={{ color: '#9A8070', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              TAP ALL THAT APPLY
            </p>
            <div className="flex flex-wrap gap-2 px-4">
              {TRAINER_CHIPS.map((chip) => {
                const selected = trainerChips.includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className="chip-press rounded-chip font-medium no-select"
                    style={{
                      background: selected ? '#5C4A3A' : 'rgba(255,255,255,0.5)',
                      color: selected ? '#FFFFFF' : '#5C4A3A',
                      border: selected ? '1px solid #5C4A3A' : '1px solid #DDD5C8',
                      padding: '10px 14px',
                      fontSize: '14px',
                      minHeight: 44,
                    }}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
            {/* End session link */}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setShowEndSheet(true)}
                className="text-xs font-medium active:opacity-60 no-select"
                style={{ color: '#9A8070', minHeight: 44, padding: '8px 16px' }}
              >
                End session
              </button>
            </div>
          </div>
        )}

        {/* Collapsed progress bar */}
        {activeCard !== 'trainer' && (
          <div
            className="absolute"
            style={{ bottom: 20, left: 16, right: 16 }}
          >
            <div
              className="rounded-full overflow-hidden"
              style={{ background: 'rgba(92,74,58,0.15)', height: 4, borderRadius: 2 }}
            >
              <div
                key={`trainer-bar-${barKey}`}
                className="bar-learner h-full rounded-full"
                style={{ background: '#5C4A3A' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Learner Card */}
      <div
        className="obs-card relative flex flex-col"
        style={{
          height: activeCard === 'learner' ? '75vh' : '25vh',
          background: '#D8EAE6',
          opacity: activeCard === 'learner' ? 1 : 0.6,
        }}
      >
        {/* Top row: label */}
        <div className="flex items-start justify-between px-4 pt-4 shrink-0">
          <span
            className="text-[11px] font-semibold no-select"
            style={{
              color: '#4A7C6F',
              letterSpacing: '0.14em',
              opacity: activeCard === 'learner' ? 1 : 0.5,
            }}
          >
            LEARNER
          </span>
        </div>

        {/* Chips area — only when active */}
        {activeCard === 'learner' && (
          <div
            className={`chips-wrap flex-1 flex flex-col justify-end pb-4 ${chipsVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: chipsVisible ? 'all' : 'none' }}
          >
            <p
              className="text-[10px] font-semibold mb-2 px-4 no-select"
              style={{ color: '#9A8070', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              TAP ALL THAT APPLY
            </p>
            <div className="flex flex-wrap gap-2 px-4">
              {LEARNER_CHIPS.map((chip) => {
                const selected = learnerChips.includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className="chip-press rounded-chip font-medium no-select"
                    style={{
                      background: selected ? '#4A7C6F' : 'rgba(255,255,255,0.5)',
                      color: selected ? '#FFFFFF' : '#5C4A3A',
                      border: selected ? '1px solid #4A7C6F' : '1px solid #DDD5C8',
                      padding: '10px 14px',
                      fontSize: '14px',
                      minHeight: 44,
                    }}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
            {/* End session link */}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setShowEndSheet(true)}
                className="text-xs font-medium active:opacity-60 no-select"
                style={{ color: '#9A8070', minHeight: 44, padding: '8px 16px' }}
              >
                End session
              </button>
            </div>
          </div>
        )}

        {/* Collapsed progress bar */}
        {activeCard !== 'learner' && (
          <div
            className="absolute"
            style={{ bottom: 20, left: 16, right: 16 }}
          >
            <div
              className="rounded-full overflow-hidden"
              style={{ background: 'rgba(74,124,111,0.15)', height: 4, borderRadius: 2 }}
            >
              <div
                key={`learner-bar-${barKey}`}
                className="bar-trainer h-full rounded-full"
                style={{ background: '#4A7C6F' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* End session confirmation bottom sheet */}
      {showEndSheet && (
        <>
          <div
            className="fixed inset-0 z-30 fade-in"
            style={{ background: 'rgba(44,33,24,0.4)' }}
            onClick={cancelEnd}
          />
          <div
            className={`fixed bottom-0 left-0 right-0 z-40 ${sheetExiting ? 'sheet-exit' : 'sheet-enter'}`}
            style={{
              background: '#FDFAF5',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            <div className="px-6 pt-6 pb-2">
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#DDD5C8' }} />
              <p className="text-lg font-semibold text-bentonite-text-primary text-center mb-1">
                End this session?
              </p>
              <p className="text-sm text-bentonite-text-secondary text-center mb-6">
                Your observation will be saved to the summary.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmEnd}
                  className="w-full text-white font-semibold text-base rounded-chip active:opacity-90 no-select transition-opacity"
                  style={{ background: '#5C4A3A', height: 52 }}
                >
                  Confirm
                </button>
                <button
                  onClick={cancelEnd}
                  className="w-full font-semibold text-base rounded-chip active:opacity-80 no-select transition-opacity"
                  style={{
                    background: 'transparent',
                    color: '#7A6555',
                    border: '1px solid #DDD5C8',
                    height: 52,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
