import { useState } from "react";
import { calculateIcap, formatDate, formatDuration, calcTotalDuration, getDominantLevel, groupWindowsByICAP } from '../utils';
import { type SessionData, type ObservationWindow, type IcapLevel } from "../types";

interface MappedSession {
    id: string;
    date: string;
    topic: string;
    duration: string;
    icap: { interactive: number; constructive: number; active: number; passive: number };
    windowLog: ObservationWindow[];
    site: string;
    trade: string;
    learnerCount: number;
    mode: string;
}

interface TrainerDashboardProps {
    sessions: SessionData[];
    trainerName: string;
    onBack: () => void;
}

const PERSONA_META = {
    "Task-Setter": {
        color: "#A07030",
        bg: "#FAF0DC",
        border: "#E8D5A0",
        description:
            "Your sessions have clear tasks and learners stay active. The next step is creating moments where learners generate their own ideas.",
        target: "Active → Constructive",
        action: "After the app video ends, ask learners to turn to a neighbour and share one thing they noticed. Give them 60 seconds. Do not speak during those 60 seconds.",
    },
    Explainer: {
        color: "#7C5C8A",
        bg: "#F0EAF5",
        border: "#D5C0E0",
        description:
            "You explain topics clearly and thoroughly. The next step is creating one moment per session where learners respond or do something.",
        target: "Passive → Active",
        action: "Next time you explain a new concept, pause for 30 seconds and ask learners to write down one question they have before continuing.",
    },
    Facilitator: {
        color: "#4A7C6F",
        bg: "#D8EAE6",
        border: "#A0CEC5",
        description:
            "You create genuine discussion and activity. The next step is sustaining Interactive moments across more of the session.",
        target: "More Interactive sustained",
        action: "Instead of answering a learner's question directly, ask another learner to answer it, and encourage them to build on each other's ideas.",
    },
} as const;

const ICAP_COLORS = {
    interactive: "#4A7C6F",
    constructive: "#5A7A9A",
    active: "#A07030",
    passive: "#9A8878",
};

const ICAP_LABELS = {
    interactive: "Interactive",
    constructive: "Constructive",
    active: "Active",
    passive: "Passive",
};

type IcapKey = keyof typeof ICAP_COLORS;

function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ChevronDown() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M6 9l6 6 6-6"
                stroke="#7A6555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChevronUp() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M18 15l-6-6-6 6"
                stroke="#7A6555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function StackedBar({
    icap,
    height,
    radius,
}: {
    icap: { interactive: number; constructive: number; active: number; passive: number };
    height: number;
    radius: number;
}) {
    const order: IcapKey[] = ["interactive", "constructive", "active", "passive"];
    return (
        <div
            className="flex w-full overflow-hidden"
            style={{ height: `${height}px`, borderRadius: `${radius}px` }}
        >
            {order.map((key) => (
                <div
                    key={key}
                    style={{
                        width: `${icap[key]}%`,
                        backgroundColor: ICAP_COLORS[key],
                    }}
                />
            ))}
        </div>
    );
}

function Legend() {
    const items: IcapKey[] = ["interactive", "constructive", "active", "passive"];
    return (
        <div className="flex flex-wrap" style={{ gap: "16px" }}>
            {items.map((key) => (
                <div key={key} className="flex items-center" style={{ gap: "6px" }}>
                    <span
                        style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: ICAP_COLORS[key],
                            borderRadius: "2px",
                            display: "inline-block",
                        }}
                    />
                    <span style={{ fontSize: "11px", color: "#7A6555" }}>
                        {ICAP_LABELS[key]}
                    </span>
                </div>
            ))}
        </div>
    );
}

function TrendChart({ sessions }: { sessions: MappedSession[] }) {
    if (sessions.length === 0) return null;

    const engaged = sessions.map(
        (s) => s.icap.interactive + s.icap.constructive + s.icap.active
    );
    const dates = sessions.map((s) => s.date);

    const width = 340;
    const height = 160;
    const padLeft = 24;
    const padRight = 24;
    const padTop = 20;
    const padBottom = 20;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const xFor = (i: number) =>
        padLeft + (engaged.length === 1 ? plotW / 2 : (plotW * i) / (engaged.length - 1));
    const yFor = (val: number) => padTop + plotH * (1 - val / 100);

    const points = engaged.map((v, i) => ({ x: xFor(i), y: yFor(v) }));

    const linePath = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + plotH
        } L ${points[0].x} ${padTop + plotH} Z`;

    const gridLevels = [25, 50, 75, 100];

    const lastPoint = points[points.length - 1];

    let trendText = "";
    let trendColor = "#4A7C6F";
    if (engaged.length > 1) {
        const diff = engaged[engaged.length - 1] - engaged[engaged.length - 2];
        if (diff > 0) {
            trendText = "↑ improving";
        } else if (diff < 0) {
            trendText = "↓ declining";
            trendColor = "#A07030";
        } else {
            trendText = "→ steady";
            trendColor = "#7A6555";
        }
    }

    return (
        <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            aria-label="Engagement trend chart"
        >
            {gridLevels.map((lvl) => (
                <g key={lvl}>
                    <line
                        x1={padLeft}
                        y1={yFor(lvl)}
                        x2={width - padRight}
                        y2={yFor(lvl)}
                        stroke="#DDD5C8"
                        strokeWidth={1}
                    />
                    {lvl < 100 && (
                        <text
                            x={padLeft - 6}
                            y={yFor(lvl) + 3}
                            textAnchor="end"
                            fontSize={9}
                            fill="#9A8878"
                        >
                            {lvl}%
                        </text>
                    )}
                </g>
            ))}

            <path d={areaPath} fill={hexToRgba("#5C4A3A", 0.08)} />

            <path
                d={linePath}
                stroke="#5C4A3A"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={5} fill="#5C4A3A" />
            ))}

            {trendText && (
                <text
                    x={lastPoint.x}
                    y={lastPoint.y - 12}
                    textAnchor="middle"
                    fontSize={11}
                    fill={trendColor}
                    fontWeight={600}
                >
                    {trendText}
                </text>
            )}

            {dates.map((d, i) => (
                <text
                    key={d}
                    x={xFor(i)}
                    y={height - 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#7A6555"
                >
                    {d}
                </text>
            ))}
        </svg>
    );
}

function SessionCard({
    session,
    isOpen,
    onToggle,
}: {
    session: MappedSession;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            style={{
                background: "#FDFAF5",
                border: "1px solid #DDD5C8",
                borderRadius: "14px",
                padding: "16px",
            }}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between text-left"
                style={{ minHeight: "44px" }}
            >
                <div>
                    <div style={{ fontSize: "14px", color: "#2C2118", fontWeight: 500 }}>
                        {session.topic}
                    </div>
                    <div style={{ fontSize: "12px", color: "#7A6555", marginTop: "2px" }}>
                        {session.duration}
                    </div>
                </div>
                <div className="flex items-center" style={{ gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#9A8878" }}>{session.date}</span>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>

            {isOpen && (
                <div
                    style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid #DDD5C8",
                        fontSize: "13px",
                        color: "#7A6555",
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div><strong style={{ color: "#2C2118", fontWeight: 500 }}>Site:</strong> {session.site}</div>
                        <div><strong style={{ color: "#2C2118", fontWeight: 500 }}>Trade:</strong> {session.trade}</div>
                        <div><strong style={{ color: "#2C2118", fontWeight: 500 }}>Learners:</strong> {session.learnerCount}</div>
                        <div><strong style={{ color: "#2C2118", fontWeight: 500 }}>Mode:</strong> {session.mode}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

function buildSessionNarrative(windowLog: ObservationWindow[], icapStats: { interactive: number; constructive: number; active: number; passive: number }) {
  if (!windowLog || windowLog.length === 0) {
    return { headline: "No session data available yet.", timingNote: null, groups: [] };
  }

  const groups = groupWindowsByICAP(windowLog, getDominantLevel);

  // Find the dominant ICAP level from the actual chip stats to match the UI
  const rank: Record<IcapLevel, number> = { Interactive: 4, Constructive: 3, Active: 2, Passive: 1 };
  
  let dominantIcap: IcapLevel = 'Passive';
  let dominantPct = 0;
  
  const icapKeys: IcapLevel[] = ['Interactive', 'Constructive', 'Active', 'Passive'];
  icapKeys.forEach(level => {
    const pct = icapStats[level.toLowerCase() as keyof typeof icapStats];
    if (pct >= dominantPct) {
      if (pct > dominantPct || rank[level] > rank[dominantIcap]) {
          dominantPct = pct;
          dominantIcap = level;
      }
    }
  });

  // Find the highest ICAP level present for the "stretch" note
  let bestIcap: IcapLevel = 'Passive';
  let bestRank = 0;
  icapKeys.forEach(level => {
    const pct = icapStats[level.toLowerCase() as keyof typeof icapStats];
    if (pct > 0 && rank[level] > bestRank) {
      bestRank = rank[level];
      bestIcap = level;
    }
  });

  // Headline sentence
  let headline = `Your session was mostly ${dominantIcap} (${dominantPct}% of activity)`;
  
  if (bestIcap !== dominantIcap && rank[bestIcap] > rank[dominantIcap]) {
    headline += `, with a ${bestIcap} stretch during the session.`;
  } else {
    headline += `.`;
  }

  // Timing note — describe WHEN the best group happened
  let timingNote: string | null = null;
  if (bestIcap !== 'Passive') {
    const bestGroup = groups.find(g => g.icap === bestIcap);
    if (bestGroup && bestGroup.windows.length > 0) {
      const firstWindow = bestGroup.windows[0];
      const sessionStart = new Date(windowLog[0].timestamp).getTime();
      const eventTime = new Date(firstWindow.timestamp).getTime();
      const minutesIn = Math.round((eventTime - sessionStart) / 60000);

      let positionLabel = 'partway through';
      const totalMinutes = Math.round((new Date(windowLog[windowLog.length - 1].timestamp).getTime() - sessionStart) / 60000) || 1;
      const ratio = minutesIn / totalMinutes;
      if (ratio < 0.33) positionLabel = 'in the first part of';
      else if (ratio > 0.66) positionLabel = 'toward the end of';
      else positionLabel = 'in the middle of';

      timingNote = `Your ${bestIcap} moment happened ${positionLabel} the session, around minute ${minutesIn}.`;
    }
  }

  return { headline, timingNote, groups };
}

export default function TrainerDashboard({
    trainerName,
    sessions,
    onBack
}: TrainerDashboardProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const mappedSessions = sessions.map(s => {
        const icapRes = calculateIcap(s.windows);
        const duration = calcTotalDuration(s.startTime, s.endTime);
        return {
            id: s.id,
            date: formatDate(s.startTime),
            topic: s.topic,
            duration: formatDuration(duration),
            icap: {
                interactive: Math.round(icapRes.Interactive.percentage),
                constructive: Math.round(icapRes.Constructive.percentage),
                active: Math.round(icapRes.Active.percentage),
                passive: Math.round(icapRes.Passive.percentage)
            },
            windowLog: s.windows,
            site: s.site || "Unknown",
            trade: s.trade || "Unknown",
            learnerCount: s.learnerCount || 0,
            mode: s.mode || "Unknown"
        };
    });

    const lastSession = mappedSessions.length > 0 ? mappedSessions[mappedSessions.length - 1] : null;

    let derivedPersona = "Task-Setter";
    if (lastSession) {
        const { passive, active, constructive, interactive } = lastSession.icap;
        const maxVal = Math.max(passive, active, constructive, interactive);
        if (maxVal === passive) derivedPersona = "Explainer";
        else if (maxVal === active) derivedPersona = "Task-Setter";
        else derivedPersona = "Facilitator"; // Constructive or Interactive
    }

    const TRAINER = {
        name: trainerName,
        site: sessions[0]?.site || "Unknown Site",
        trade: sessions[0]?.trade || "Unknown Trade",
        persona: derivedPersona,
        sessions: mappedSessions
    };

    const persona = PERSONA_META[TRAINER.persona as keyof typeof PERSONA_META];

    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const toggle = (id: string) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const icapKeys: IcapKey[] = ["interactive", "constructive", "active", "passive"];

    const narrative = lastSession?.windowLog ? buildSessionNarrative(lastSession.windowLog, lastSession.icap) : null;

    return (
        <div
            style={{ background: "var(--bentonite-bg)", minHeight: "100vh", padding: "24px 16px 48px" }}
            className="screen-fade"
        >
            {/* Header bar with Back button */}
            <div
                className="flex items-center gap-3"
                style={{
                    paddingBottom: "16px",
                    borderBottom: "1px solid #DDD5C8",
                    marginBottom: "24px",
                    paddingTop: "max(12px, env(safe-area-inset-top))",
                }}
            >
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
                <div>
                    <p className="text-xs font-semibold text-bentonite-text-secondary" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Trainer Dashboard
                    </p>
                </div>
            </div>

            {/* Section 1 — Greeting Header */}
            <header style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", color: "#2C2118", fontWeight: 600 }}>
                    Hello, {TRAINER.name}
                </h1>
                {/*<p style={{ fontSize: "13px", color: "#7A6555", marginTop: "4px" }}>
                    {TRAINER.site} · {TRAINER.trade}
                </p>*/}
                <p style={{ fontSize: "12px", color: "#9A8878", marginTop: "2px" }}>{today}</p>
            </header>

            {/* Section 2 — Persona Card */}
            <section
                style={{
                    background: persona.bg,
                    border: `1px solid ${persona.border}`,
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "24px",
                }}
            >
                <div className="flex items-center justify-between">
                    <span
                        style={{
                            fontSize: "11px",
                            color: "#7A6555",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                        }}
                    >
                        Your Persona
                    </span>
                    <span
                        style={{
                            fontSize: "12px",
                            color: persona.color,
                            backgroundColor: hexToRgba(persona.color, 0.2),
                            borderRadius: "20px",
                            padding: "4px 12px",
                        }}
                    >
                        {TRAINER.persona}
                    </span>
                </div>

                <h2
                    style={{
                        fontSize: "22px",
                        color: persona.color,
                        fontWeight: 600,
                        marginTop: "12px",
                    }}
                >
                    {TRAINER.persona}
                </h2>

                <p
                    style={{
                        fontSize: "14px",
                        color: "#7A6555",
                        lineHeight: 1.6,
                        marginTop: "8px",
                    }}
                >
                    {persona.description}
                </p>

                <div
                    className="flex items-center justify-between"
                    style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: "1px solid",
                        borderColor: persona.border,
                    }}
                >
                    <span
                        style={{
                            fontSize: "10px",
                            color: "#9A8878",
                            textTransform: "uppercase",
                        }}
                    >
                        Next Target
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: persona.color }}>
                        {persona.target}
                    </span>
                </div>
            </section>

            {/* Session Pattern Card */}
            {narrative && (
                <div style={{
                  background: '#FDFAF5',
                  border: '1px solid #DDD5C8',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#7A6555',
                    marginBottom: '10px'
                  }}>
                    Last Session Pattern
                  </div>

                  <div style={{
                    fontSize: '15px',
                    color: '#2C2118',
                    lineHeight: '1.6',
                    marginBottom: narrative.timingNote ? '10px' : '0'
                  }}>
                    {narrative.headline}
                  </div>

                  {narrative.timingNote && (
                    <div style={{
                      fontSize: '13px',
                      color: '#4A7C6F',
                      lineHeight: '1.6',
                      paddingTop: '10px',
                      borderTop: '1px solid #DDD5C8'
                    }}>
                      {narrative.timingNote}
                    </div>
                  )}

                  {narrative.groups.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                      {narrative.groups.map((g, i) => (
                        <div
                          key={i}
                          style={{
                            flex: g.windows.length,
                            height: '6px',
                            borderRadius: '3px',
                            background: g.icap ? ICAP_COLORS[(g.icap as string).toLowerCase() as IcapKey] : '#DDD5C8'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
            )}

            {/* Section 3 — Last Session Stats */}
            {lastSession && (
                <section style={{ marginBottom: "24px" }}>
                    <h3
                        style={{
                            fontSize: "11px",
                            color: "#7A6555",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            marginBottom: "12px",
                        }}
                    >
                        Last Session
                    </h3>

                    <div className="grid grid-cols-2" style={{ gap: "10px" }}>
                        {icapKeys.map((key) => {
                            const color = ICAP_COLORS[key];
                            const value = lastSession.icap[key];
                            return (
                                <div
                                    key={key}
                                    style={{
                                        background: hexToRgba(color, 0.12),
                                        border: `1px solid ${hexToRgba(color, 0.3)}`,
                                        borderRadius: "12px",
                                        padding: "16px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "10px",
                                            color,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {ICAP_LABELS[key]}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "32px",
                                            fontWeight: 700,
                                            color,
                                            lineHeight: 1.1,
                                            marginTop: "4px",
                                        }}
                                    >
                                        {value}%
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "4px",
                                            borderRadius: "2px",
                                            background: hexToRgba(color, 0.2),
                                            marginTop: "10px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${value}%`,
                                                height: "100%",
                                                borderRadius: "2px",
                                                background: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: "12px" }}>
                        <StackedBar icap={lastSession.icap} height={10} radius={5} />
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <Legend />
                    </div>
                </section>
            )}

            {/* Section 4 — Engagement Trend */}
            {TRAINER.sessions.length > 0 && (
                <section style={{ marginBottom: "24px" }}>
                    <h3
                        style={{
                            fontSize: "11px",
                            color: "#7A6555",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            marginBottom: "12px",
                        }}
                    >
                        Your Progress
                    </h3>

                    <div
                        style={{
                            background: "#FDFAF5",
                            border: "1px solid #DDD5C8",
                            borderRadius: "16px",
                            padding: "20px",
                        }}
                    >
                        <TrendChart sessions={TRAINER.sessions} />
                    </div>
                </section>
            )}

            {/* Section 5 — Next Action Card */}
            <section
                style={{
                    background: "#D8EAE6",
                    border: "1px solid #A0CEC5",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "24px",
                }}
            >
                <span
                    style={{
                        fontSize: "11px",
                        color: "#4A7C6F",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                    }}
                >
                    Try This Next Session
                </span>

                <p
                    style={{
                        fontSize: "14px",
                        color: "#2C2118",
                        lineHeight: 1.65,
                        marginTop: "10px",
                    }}
                >
                    {persona.action}
                </p>

                <div
                    style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: "1px solid #A0CEC5",
                    }}
                >
                    <span
                        style={{
                            fontSize: "11px",
                            color: "#4A7C6F",
                            backgroundColor: hexToRgba("#4A7C6F", 0.2),
                            borderRadius: "20px",
                            padding: "4px 10px",
                            display: "inline-block",
                        }}
                    >
                        {persona.target}
                    </span>
                </div>
            </section>

            {/* Section 6 — Session History */}
            <section>
                <h3
                    style={{
                        fontSize: "11px",
                        color: "#7A6555",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        marginBottom: "12px",
                    }}
                >
                    Past Sessions
                </h3>

                <div className="flex flex-col" style={{ gap: "10px" }}>
                    {TRAINER.sessions.length === 0 ? (
                        <div
                            className="rounded-card border p-8 text-center space-y-2"
                            style={{ background: 'var(--bentonite-card)', borderColor: 'var(--bentonite-border)' }}
                        >
                            <p className="text-sm font-medium text-bentonite-text-primary">No sessions found</p>
                            <p className="text-xs text-bentonite-text-secondary">Sessions recorded by observers will appear here.</p>
                        </div>
                    ) : (
                        [...TRAINER.sessions].reverse().map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                isOpen={!!expanded[session.id]}
                                onToggle={() => toggle(session.id)}
                            />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
