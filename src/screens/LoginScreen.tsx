import { useState } from 'react';
import type { User } from '../types';

interface Props {
  onLogin: (role: 'trainer' | 'observer') => void;
}

export default function LoginScreen({ onLogin }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col justify-center px-6 py-12 screen-fade"
      style={{ background: 'var(--bentonite-bg)' }}
    >
      <div className="w-full max-w-md mx-auto space-y-8">

        {/* Brand Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-bentonite-text-primary tracking-tight">
            ClassTrack
          </h1>

          <p
            className="text-sm font-extrabold text-bentonite-text-secondary mt-2"
            style={{
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            AI Classroom Observation Platform
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-card border p-6 space-y-6"
          style={{
            background: 'var(--bentonite-card)',
            borderColor: 'var(--bentonite-border)',
          }}
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold text-bentonite-text-primary">
              Select Role
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => onLogin('trainer')}
              className="w-full py-4 px-4 text-sm font-semibold rounded-chip border transition-all no-select"
              style={{
                background: 'var(--bentonite-trainer-bg)',
                borderColor: 'var(--bentonite-border)',
                color: 'var(--bentonite-trainer)',
              }}
            >
              Trainer
            </button>

            <button
              type="button"
              onClick={() => onLogin('observer')}
              className="w-full py-4 px-4 text-sm font-semibold rounded-chip border transition-all no-select"
              style={{
                background: 'var(--bentonite-learner-bg)',
                borderColor: 'var(--bentonite-border)',
                color: 'var(--bentonite-learner)',
              }}
            >
              Observer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}