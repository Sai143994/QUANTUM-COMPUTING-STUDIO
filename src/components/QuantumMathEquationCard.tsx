import React from 'react';
import { Atom } from 'lucide-react';

interface QuantumMathEquationCardProps {
  equations: string[];
  theme?: 'cyan' | 'indigo';
}

/**
 * Formats raw LaTeX equations into clean, readable, professional mathematical typography.
 */
function cleanLatexForDisplay(raw: string): string {
  return raw
    .replace(/\\hat\{([a-zA-Z])\}/g, '$1̂')
    .replace(/\\hat\{([a-zA-Z0-9_\\]+)\}/g, '$1̂')
    .replace(/\\dagger/g, '†')
    .replace(/\\hbar/g, 'ℏ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\phi/g, 'ϕ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\delta/g, 'δ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\xi/g, 'ξ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\vec\{([a-zA-Z])\}/g, '$1⃗')
    .replace(/\\cdot/g, '·')
    .replace(/\\approx/g, '≈')
    .replace(/\\sum_([a-zA-Z0-9])/g, '∑_$1')
    .replace(/\\sum/g, '∑')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\langle/g, '⟨')
    .replace(/\\rangle/g, '⟩')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\exp/g, 'exp')
    .replace(/\\cos/g, 'cos')
    .replace(/\\sin/g, 'sin')
    .replace(/\\quad/g, '  ')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\ll/g, '≪')
    .replace(/\\gg/g, '≫')
    .replace(/\\times/g, '×')
    .replace(/\\dot\{([a-zA-Z])\}/g, '$1̇')
    .replace(/\\delta_\{([a-zA-Z0-9,]+)\}/g, 'δ_{$1}')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/\{|\}/g, '');
}

export const QuantumMathEquationCard: React.FC<QuantumMathEquationCardProps> = ({ 
  equations, 
  theme = 'cyan' 
}) => {
  if (!equations || equations.length === 0) return null;

  const textColor = theme === 'cyan' ? 'text-cyan-300' : 'text-indigo-300';
  const borderTone = theme === 'cyan' ? 'border-cyan-800/40' : 'border-indigo-800/40';

  return (
    <div className={`p-3.5 rounded-xl bg-[#03060c] border ${borderTone} space-y-2 font-mono`}>
      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-850">
        <span className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Atom className="w-3 h-3" />
          <span>Governing Hamiltonian &amp; Transformation Equations</span>
        </span>
        <span>Exact Quantum Analytic Solution</span>
      </div>

      <div className="space-y-2 pt-0.5">
        {equations.map((rawEq, idx) => {
          const formatted = cleanLatexForDisplay(rawEq);
          return (
            <div 
              key={idx} 
              className="p-2 rounded-lg bg-[#070e17] border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
            >
              <span className={`font-mono font-bold ${textColor} text-center flex-1 tracking-wide`}>
                {formatted}
              </span>
              <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                [Eq. {idx + 1}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
