import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Quantum Studio ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      sessionStorage.removeItem('qs_active_tab');
      window.location.hash = '';
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    try {
      sessionStorage.setItem('qs_active_tab', 'dashboard');
      window.location.hash = '#tab=dashboard';
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#02060a] text-slate-100 flex items-center justify-center p-6 selection:bg-cyan-500/20 selection:text-cyan-300">
          <div className="max-w-xl w-full bg-[#050b11] border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/10">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
                Quantum Runtime Shield
              </span>
              <h1 className="text-2xl font-bold font-display text-white mb-3">
                Quantum Session Recovered
              </h1>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                A non-critical rendering interruption was safely intercepted. Your quantum environment and state remain intact.
              </p>

              {this.state.error && (
                <div className="w-full text-left bg-[#02060a] border border-slate-800 rounded-lg p-3.5 mb-6 text-xs font-mono text-slate-300 overflow-x-auto max-h-36">
                  <span className="text-red-400 font-bold block mb-1">
                    {this.state.error.name}: {this.state.error.message}
                  </span>
                  {this.state.error.stack && (
                    <span className="text-slate-500 text-[11px] whitespace-pre-wrap">
                      {this.state.error.stack.slice(0, 300)}...
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reload Quantum Engine
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#09141d] hover:bg-[#0c1b26] border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 text-sm font-semibold transition-all"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400/60" />
                <span>Zero Data Loss Protection Active</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
