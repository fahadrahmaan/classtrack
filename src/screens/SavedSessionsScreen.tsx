import { useState, useRef } from 'react';
import type { SessionData, IcapLevel } from '../types';
import { calculateIcap, formatDate, formatDuration, calcTotalDuration } from '../utils';
import { deleteSession } from '../storage';

interface Props {
  sessions: SessionData[];
  onBack: () => void;
  onView: (session: SessionData) => void;
  onDeleted: (sessions: SessionData[]) => void;
}

const ICAP_LEVELS: IcapLevel[] = ['Interactive', 'Constructive', 'Active', 'Passive'];

export default function SavedSessionsScreen({ sessions, onBack, onView, onDeleted }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [sheetExiting, setSheetExiting] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLongPress = (id: string) => {
    setDeleteId(id);
    setShowSheet(true);
  };

  const startLongPress = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      handleLongPress(id);
      try { navigator.vibrate(50); } catch { /* ignore */ }
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      const updated = deleteSession(deleteId);
      onDeleted(updated);
    }
    setSheetExiting(true);
    setTimeout(() => {
      setShowSheet(false);
      setSheetExiting(false);
      setDeleteId(null);
    }, 200);
  };

  const cancelDelete = () => {
    setSheetExiting(true);
    setTimeout(() => {
      setShowSheet(false);
      setSheetExiting(false);
      setDeleteId(null);
    }, 200);
  };

  return (
    <div className="min-h-screen flex flex-col screen-fade" style={{ background: 'var(--bentonite-bg)' }}>
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 z-20 px-5 py-3 flex items-center gap-3"
        style={{
          background: 'var(--bentonite-bg)',
          borderBottom: '1px solid #DDD5C8',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
        }}
      >
        <button
          onClick={onBack}
          className="text-bentonite-text-secondary active:opacity-60 no-select"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-xs font-semibold text-bentonite-text-secondary" style={{ letterSpacing: '0.12em' }}>
            SAVED SESSIONS
          </p>
          <p className="text-sm font-semibold text-bentonite-text-primary">
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pt-20 pb-8 scrollbar-hide">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: '#F5F0E8' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A6555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-bentonite-text-primary">No saved sessions yet</p>
            <p className="text-xs text-bentonite-text-secondary mt-1">Complete an observation to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const icap = calculateIcap(session.windows);
              const duration = calcTotalDuration(session.startTime, session.endTime);
              return (
                <div
                  key={session.id}
                  onTouchStart={() => startLongPress(session.id)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  onClick={() => onView(session)}
                  className="rounded-card border p-4 active:opacity-80 no-select transition-opacity cursor-pointer"
                  style={{ background: '#FDFAF5', borderColor: '#DDD5C8' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-bentonite-text-primary truncate">{session.site}</p>
                      <p className="text-xs text-bentonite-text-secondary truncate">{session.trainer}</p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-xs text-bentonite-text-secondary">{formatDate(session.startTime)}</p>
                      <p className="text-xs font-mono font-semibold text-bentonite-text-primary tabular-nums">
                        {formatDuration(duration)}
                      </p>
                    </div>
                  </div>

                  {/* ICAP bar thumbnail */}
                  <div className="flex h-2 rounded-full overflow-hidden mt-3" style={{ background: '#F5F0E8' }}>
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
                          <div className="w-2 h-2 rounded-full" style={{ background: result.color }} />
                          <p className="text-xs text-bentonite-text-secondary">{Math.round(result.percentage)}%</p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-bentonite-text-secondary mt-2 italic">
                    Long-press to delete
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation sheet */}
      {showSheet && (
        <>
          <div
            className="fixed inset-0 z-30 fade-in"
            style={{ background: 'rgba(44,33,24,0.4)' }}
            onClick={cancelDelete}
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
                Delete this session?
              </p>
              <p className="text-sm text-bentonite-text-secondary text-center mb-6">
                This action cannot be undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmDelete}
                  className="w-full text-white font-semibold text-base rounded-chip active:opacity-90 no-select transition-opacity"
                  style={{ background: '#A07030', height: 52 }}
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
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
