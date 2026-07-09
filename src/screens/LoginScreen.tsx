import { useState } from 'react';
import type { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [role, setRole] = useState<'trainer' | 'observer'>('trainer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (cleanPassword === 'password') {
      onLogin({ username: cleanUsername, role });
    } else {
      setError('Invalid password. Hint: use "password"');
    }
  };

  const handleQuickFill = (quickRole: 'trainer' | 'observer') => {
    setError(null);
    setRole(quickRole);
    setUsername(quickRole === 'trainer' ? 'Ameen' : 'Observer Admin');
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 screen-fade" style={{ background: 'var(--bentonite-bg)' }}>
      <div className="w-full max-w-md mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 border"
            style={{ 
              background: 'var(--bentonite-card)', 
              borderColor: 'var(--bentonite-border)' 
            }}
          >
            <span className="text-2xl font-bold text-bentonite-trainer" style={{ fontFamily: "'Inter', sans-serif" }}>L</span>
          </div>
          <h1 className="text-3xl font-extrabold text-bentonite-text-primary tracking-tight">LEOP</h1>
          <p className="text-sm text-bentonite-text-secondary mt-1.5" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Classroom Observation Portal
          </p>
        </div>

        {/* Card Body */}
        <div 
          className="rounded-card border p-6 space-y-6"
          style={{ 
            background: 'var(--bentonite-card)', 
            borderColor: 'var(--bentonite-border)' 
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div 
                className="p-3.5 rounded-chip text-xs font-semibold"
                style={{ 
                  background: '#FAF0DC', 
                  border: '1px solid #E8D5A0', 
                  color: '#A07030' 
                }}
              >
                {error}
              </div>
            )}

            {/* Role Toggle */}
            <div className="flex rounded-chip border overflow-hidden" style={{ borderColor: '#DDD5C8' }}>
              {(['trainer', 'observer'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 py-3 text-sm font-medium transition-colors no-select capitalize"
                  style={{
                    background: role === r ? '#5C4A3A' : '#FDFAF5',
                    color: role === r ? '#FFFFFF' : '#7A6555',
                    minHeight: 44,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Username */}
            <div>
              <label 
                className="block text-xs font-semibold text-bentonite-text-secondary mb-2"
                style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-chip border bg-white px-4 py-3 text-sm text-bentonite-text-primary placeholder:text-bentonite-text-secondary/50 outline-none transition-colors focus:border-bentonite-trainer"
                style={{ borderColor: 'var(--bentonite-border)', minHeight: 48 }}
              />
            </div>

            {/* Password */}
            <div>
              <label 
                className="block text-xs font-semibold text-bentonite-text-secondary mb-2"
                style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-chip border bg-white px-4 py-3 text-sm text-bentonite-text-primary placeholder:text-bentonite-text-secondary/50 outline-none transition-colors focus:border-bentonite-trainer"
                style={{ borderColor: 'var(--bentonite-border)', minHeight: 48 }}
              />
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              className="w-full text-white font-semibold text-base rounded-chip active:opacity-90 transition-opacity no-select"
              style={{
                background: 'var(--bentonite-trainer)',
                height: 48,
              }}
            >
              Sign In
            </button>
          </form>

          {/* Quick-Fill Helpers */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--bentonite-border)' }}>
            <span 
              className="block text-[10px] font-semibold text-center text-bentonite-text-secondary mb-3"
              style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Quick Demo Login
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('trainer')}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-chip border transition-all no-select"
                style={{ 
                  background: 'var(--bentonite-trainer-bg)', 
                  borderColor: 'var(--bentonite-border)',
                  color: 'var(--bentonite-trainer)'
                }}
              >
                As Trainer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('observer')}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-chip border transition-all no-select"
                style={{ 
                  background: 'var(--bentonite-learner-bg)', 
                  borderColor: 'var(--bentonite-border)',
                  color: 'var(--bentonite-learner)'
                }}
              >
                As Observer
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
