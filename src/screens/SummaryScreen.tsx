import { useState } from 'react';
import type { SessionData, IcapLevel, ObservationWindow } from '../types';
import { calculateIcap, formatDuration, formatDate, formatTime, calcTotalDuration, getDominantLevel } from '../utils';
import { saveSession } from '../storage';
import { ICAP_COLORS, TRAINER_CHIPS, LEARNER_CHIPS } from '../constants';

interface Props {
  session: SessionData;
  onNewSession: () => void;
  onSaved: () => void;
  onBack?: () => void;
}

const ICAP_LEVELS: IcapLevel[] = ['Interactive', 'Constructive', 'Active', 'Passive'];

function groupWindowsByICAP(windowLog: ObservationWindow[], getICAPForWindow: (win: ObservationWindow) => IcapLevel | null) {
  const groups: { icap: IcapLevel | null, windows: ObservationWindow[] }[] = [];
  windowLog.forEach((win) => {
    const icap = getICAPForWindow(win);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.icap === icap) {
      lastGroup.windows.push(win);
    } else {
      groups.push({ icap, windows: [win] });
    }
  });
  return groups;
}

function formatChipsAsSentence(chips: string[]) {
  if (chips.length === 0) return null;
  const lowercased = chips.map((chip, index) => {
    if (index === 0) return chip;
    return chip.charAt(0).toLowerCase() + chip.slice(1);
  });
  return lowercased.join(', ') + '.';
}

function EngagementTimelineChart({
  windowLog,
  sessionStartTime
}: {
  windowLog: ObservationWindow[];
  sessionStartTime: string;
}) {
  if (windowLog.length < 3) {
    return (
      <div
        className="text-center"
        style={{ padding: '24px', fontSize: '12px', color: '#9A8878' }}
      >
        Not enough data yet — chart appears after a few observation windows.
      </div>
    );
  }

  const levels: IcapLevel[] = ['Interactive', 'Constructive', 'Active', 'Passive'];

  const n = windowLog.length;

  const chartWidth = 340;
  const chartHeight = 160;
  const padLeft = 28;
  const padRight = 10;
  const padTop = 10;
  const padBottom = 20;

  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const stepX = plotW / Math.max(n - 1, 1);

  const paths = levels.map(level => {
    const color = ICAP_COLORS[level];

    // 1 if dominant, 0 if not
    const raw = windowLog.map(win => (getDominantLevel(win) || 'Passive') === level ? 1 : 0);

    // Smoothed: 1-2-1 filter
    const smoothed = raw.map((val, i) => {
      const prev = i > 0 ? raw[i - 1] : val;
      const next = i < n - 1 ? raw[i + 1] : val;
      return prev * 0.25 + val * 0.5 + next * 0.25;
    });

    let dArea = `M ${padLeft},${padTop + plotH} `;
    let dLine = `M ${padLeft},${padTop + (1 - smoothed[0]) * plotH} `;

    smoothed.forEach((val, i) => {
      const x = padLeft + i * stepX;
      const y = padTop + (1 - val) * plotH;

      if (i === 0) {
        dArea += `L ${x},${y} `;
      } else {
        const prevX = padLeft + (i - 1) * stepX;
        const prevY = padTop + (1 - smoothed[i - 1]) * plotH;
        const cpX = prevX + (x - prevX) / 2;

        dArea += `C ${cpX},${prevY} ${cpX},${y} ${x},${y} `;
        dLine += `C ${cpX},${prevY} ${cpX},${y} ${x},${y} `;
      }
    });

    dArea += `L ${padLeft + plotW},${padTop + plotH} Z`;

    return { level, color, dArea, dLine, smoothed };
  });

  const numLabels = Math.min(n, 6);
  const labelIndices: number[] = [];
  for (let i = 0; i < numLabels; i++) {
    labelIndices.push(Math.floor(i * (n - 1) / Math.max(numLabels - 1, 1)));
  }
  const uniqueLabelIndices = Array.from(new Set(labelIndices));
  const startMs = new Date(sessionStartTime).getTime();

  return (
    <div className="mb-4">
      <svg
        width="100%"
        height="200"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Engagement Timeline Chart"
        style={{ overflow: 'visible' }}
      >
        {/* Horizontal Grid */}
        {[0, 0.5, 1].map((val, i) => {
          const y = padTop + (1 - val) * plotH;
          const labels = ["Low", "Mid", "High"];
          return (
            <g key={`h-grid-${i}`}>
              <line x1={padLeft} y1={y} x2={chartWidth - padRight} y2={y} stroke="#EFEFEF" strokeWidth={1} />
              <text x={padLeft - 6} y={y + 3} fontSize={9} fill="#9A8878" textAnchor="end">
                {labels[i]}
              </text>
            </g>
          );
        })}

        {/* Vertical Grid */}
        {uniqueLabelIndices.map((idx, i) => {
          const x = padLeft + idx * stepX;
          const point = windowLog[idx];
          const elapsedMinutes = Math.max(0, (new Date(point.timestamp).getTime() - startMs) / 60000);

          return (
            <g key={`v-grid-${i}`}>
              <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#EFEFEF" strokeWidth={1} />
              <text x={x} y={padTop + plotH + 14} fontSize={9} fill="#9A8878" textAnchor="middle">
                {Math.round(elapsedMinutes)}min
              </text>
            </g>
          );
        })}

        {/* Areas */}
        {paths.map(p => (
          <path
            key={`area-${p.level}`}
            d={p.dArea}
            fill={p.color}
            fillOpacity={0.12}
          />
        ))}

        {/* Lines */}
        {paths.map(p => (
          <path
            key={`line-${p.level}`}
            d={p.dLine}
            fill="none"
            stroke={p.color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Dots */}
        {paths.map(p => {
          return (
            <g key={`dots-${p.level}`}>
              {p.smoothed.map((val, i) => {
                const x = padLeft + i * stepX;
                const y = padTop + (1 - val) * plotH;
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={x}
                    cy={y}
                    r={2.5}
                    fill={p.color}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex justify-center mt-2" style={{ gap: '14px' }}>
        {levels.map(level => (
          <div key={level} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5" style={{ background: 'transparent', border: `2px solid ${ICAP_COLORS[level]}` }} />
            <span className="text-[11px]" style={{ color: '#7A6555' }}>
              {level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SummaryScreen({ session, onNewSession, onSaved, onBack }: Props) {
  const [saved, setSaved] = useState(false);
  const icap = calculateIcap(session.windows);
  const totalDuration = calcTotalDuration(session.startTime, session.endTime);

  const handleSave = () => {
    saveSession(session);
    setSaved(true);
    onSaved();
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
        {onBack && (
          <button
            onClick={onBack}
            className="text-bentonite-text-secondary active:opacity-60 no-select"
            style={{ minHeight: 44, minWidth: 44 }}
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <p className="text-xs font-semibold text-bentonite-text-secondary" style={{ letterSpacing: '0.12em' }}>
          SESSION SUMMARY
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-20 pb-32 scrollbar-hide">
        {/* Session info */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-bentonite-text-primary">{session.site}</h2>
          <p className="text-sm text-bentonite-text-secondary mt-1">{session.trainer}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <p className="text-xs text-bentonite-text-secondary">{formatDate(session.startTime)}</p>
            <p className="text-xs text-bentonite-text-secondary">·</p>
            <p className="text-xs text-bentonite-text-secondary">{formatDuration(totalDuration)} total</p>
            {session.topic && (
              <>
                <p className="text-xs text-bentonite-text-secondary">·</p>
                <p className="text-xs text-bentonite-text-secondary">{session.topic}</p>
              </>
            )}
          </div>
        </div>

        {/* ICAP section label */}
        <p
          className="text-xs font-semibold text-bentonite-text-secondary mb-3"
          style={{ letterSpacing: '0.12em' }}
        >
          ICAP DISTRIBUTION
        </p>

        {/* 2x2 stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {ICAP_LEVELS.map((level) => {
            const result = icap[level];
            return (
              <div
                key={level}
                className="rounded-card border p-4"
                style={{ background: '#FDFAF5', borderColor: '#DDD5C8' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: result.color }} />
                  <p className="text-xs font-semibold text-bentonite-text-secondary">{level}</p>
                </div>
                <p className="text-2xl font-bold text-bentonite-text-primary tabular-nums">
                  {Math.round(result.percentage)}%
                </p>
                <p className="text-xs text-bentonite-text-secondary mt-0.5">
                  {result.count} {result.count === 1 ? 'chip' : 'chips'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stacked horizontal bar */}
        <div className="mb-6">
          <div className="flex h-8 rounded-lg overflow-hidden" style={{ border: '1px solid #DDD5C8' }}>
            {ICAP_LEVELS.map((level) => {
              const result = icap[level];
              if (result.percentage === 0) return null;
              return (
                <div
                  key={level}
                  className="h-full flex items-center justify-center text-xs font-semibold text-white transition-all"
                  style={{
                    width: `${result.percentage}%`,
                    background: result.color,
                  }}
                >
                  {result.percentage >= 12 ? `${Math.round(result.percentage)}%` : ''}
                </div>
              );
            })}
          </div>
          {/* Labels */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {ICAP_LEVELS.map((level) => {
              const result = icap[level];
              return (
                <div key={level} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: result.color }} />
                  <p className="text-xs text-bentonite-text-secondary">{level}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Engagement Report */}
        <p
          className="text-[12px] font-semibold mb-1 uppercase"
          style={{ color: '#7A6555', letterSpacing: '0.1em' }}
        >
          Session engagement report
        </p>
        <p className="text-[11px] mb-4" style={{ color: '#9A8878' }}>
          {session.site} · {session.topic || 'No topic'} · {session.learnerCount || 0} learners · {formatDuration(totalDuration)}
        </p>

        <EngagementTimelineChart windowLog={session.windows} sessionStartTime={session.startTime} />

        <div className="space-y-2">
          {session.windows.length === 0 && (
            <p className="text-sm text-bentonite-text-secondary italic">No windows recorded.</p>
          )}
          {session.windows.map((w) => {
            let isTrainer = w.type === 'trainer';
            if (w.chipsSelected.length > 0) {
              const hasTrainerChip = w.chipsSelected.some(chip =>
                (TRAINER_CHIPS as readonly string[]).includes(chip)
              );
              const hasLearnerChip = w.chipsSelected.some(chip =>
                (LEARNER_CHIPS as readonly string[]).includes(chip)
              );
              if (hasTrainerChip && !hasLearnerChip) {
                isTrainer = true;
              } else if (hasLearnerChip && !hasTrainerChip) {
                isTrainer = false;
              }
            }
            const sentence = formatChipsAsSentence(w.chipsSelected);
            const dominantLevel = getDominantLevel(w);
            const borderColor = dominantLevel ? ICAP_COLORS[dominantLevel] : '#DDD5C8';

            return (
              <div
                key={w.windowNumber}
                style={{
                  background: '#FDFAF5',
                  border: '1px solid #DDD5C8',
                  borderLeft: `4px solid ${borderColor}`,
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Timestamp */}
                  <div
                    className="text-[11px] font-mono shrink-0 mt-0.5"
                    style={{ color: '#9A8878' }}
                  >
                    {formatTime(w.timestamp)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block px-1.5 py-0.5 text-[10px] uppercase font-semibold mb-1 rounded"
                      style={{
                        background: isTrainer ? 'rgba(92, 74, 58, 0.15)' : 'rgba(74, 124, 111, 0.15)',
                        color: isTrainer ? '#5C4A3A' : '#4A7C6F',
                      }}
                    >
                      {isTrainer ? 'Trainer' : 'Learner'}
                    </span>

                    {sentence ? (
                      <p className="text-sm text-bentonite-text-primary leading-snug">
                        {sentence}
                      </p>
                    ) : (
                      <p className="text-sm italic" style={{ color: '#B0A898' }}>
                        No activity logged this window
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pt-3 space-y-3"
        style={{
          background: 'linear-gradient(to top, var(--bentonite-bg) 70%, transparent)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full text-white font-semibold text-base rounded-chip active:opacity-90 no-select transition-opacity"
          style={{
            background: saved ? '#7A6555' : '#5C4A3A',
            opacity: saved ? 0.7 : 1,
            height: 52,
          }}
        >
          {saved ? 'Saved' : 'Save Session'}
        </button>
        <button
          onClick={onNewSession}
          className="w-full font-semibold text-base rounded-chip active:opacity-80 no-select transition-opacity"
          style={{
            background: 'transparent',
            color: '#5C4A3A',
            border: '1px solid #5C4A3A',
            height: 52,
          }}
        >
          New Session
        </button>
      </div>
    </div>
  );
}
