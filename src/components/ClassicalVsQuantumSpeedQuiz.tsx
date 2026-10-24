import React, { useState, useEffect } from 'react';
import { SPEED_QUIZ_QUESTIONS, SpeedQuizQuestion } from '../data/speed_quiz_dataset';
import { SideBySidePerformanceSimulator } from './SideBySidePerformanceSimulator';
import { 
  Trophy, 
  Timer, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Zap, 
  Cpu, 
  Scale, 
  Sparkles, 
  Layers, 
  Award,
  ChevronRight,
  BookOpen,
  Play
} from 'lucide-react';

export const ClassicalVsQuantumSpeedQuiz: React.FC = () => {
  const [viewMode, setViewMode] = useState<'quiz' | 'simulator'>('quiz');
  const [questions, setQuestions] = useState<SpeedQuizQuestion[]>(SPEED_QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  
  // Scoring & Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  // Timer State (25 seconds per question)
  const TIME_PER_QUESTION = 25;
  const [timeLeft, setTimeLeft] = useState<number>(TIME_PER_QUESTION);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  
  // Race simulation trigger
  const [raceTriggered, setRaceTriggered] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning || isAnswered || isGameOver) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, isAnswered, isGameOver]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setIsTimerRunning(false);
    setStreak(0);
  };

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);
    setIsTimerRunning(false);

    const option = currentQ.options.find(o => o.id === optionId);
    if (option?.isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setCorrectCount(prev => prev + 1);

      // Base points + speed bonus + streak multiplier
      const speedBonus = timeLeft * 10;
      const multiplier = newStreak >= 3 ? 2 : newStreak >= 2 ? 1.5 : 1;
      const pointsEarned = Math.round((100 + speedBonus) * multiplier);
      setScore(prev => prev + pointsEarned);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setTimeLeft(TIME_PER_QUESTION);
      setIsTimerRunning(true);
      setRaceTriggered(false);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    // Shuffle questions on restart
    const shuffled = [...SPEED_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setTimeLeft(TIME_PER_QUESTION);
    setIsTimerRunning(true);
    setIsGameOver(false);
    setRaceTriggered(false);
  };

  // Rank assessment
  const getRank = () => {
    const accuracy = (correctCount / questions.length) * 100;
    if (accuracy >= 85 && score >= 1200) return { title: 'Quantum Supremacist', tier: 'GRANDMASTER', color: 'text-cyan-300' };
    if (accuracy >= 70) return { title: 'Fault-Tolerant Architect', tier: 'EXPERT', color: 'text-emerald-400' };
    if (accuracy >= 50) return { title: 'Quantum Circuit Apprentice', tier: 'PRACTITIONER', color: 'text-amber-400' };
    return { title: 'Classical Turing Loyalist', tier: 'NOVICE', color: 'text-slate-400' };
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Arena Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('quiz')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'quiz'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Interactive Speed Quiz</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900/60 text-slate-300">
              {currentIndex + 1}/{questions.length}
            </span>
          </button>

          <button
            onClick={() => setViewMode('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'simulator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side Performance Simulator</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-2 pr-2">
          <span>Real-time Asymptotic Duel Engine</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="text-cyan-400 font-semibold">Classical CPU vs Quantum QPU</span>
        </div>
      </div>

      {viewMode === 'simulator' ? (
        <SideBySidePerformanceSimulator />
      ) : isGameOver ? (
        <div className="p-6 md:p-8 rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              SPEED ARENA COMPLETE
            </span>
            <h2 className="text-2xl font-bold text-white">
              Classical vs. Quantum Algorithmic Proficiency
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You tested your mastery against rigorous asymptotic complexity bounds and physical quantum speedup mathematics.
            </p>
          </div>

          {/* Player Rank Card */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Certified Algorithmic Rank:</div>
            <div className={`text-xl font-bold font-mono ${getRank().color}`}>
              {getRank().title}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Tier: <strong>{getRank().tier}</strong> · Accuracy: <strong>{Math.round((correctCount / questions.length) * 100)}%</strong>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center font-mono">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px]">TOTAL SCORE</div>
              <div className="text-xl font-bold text-cyan-300 mt-0.5">{score}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px]">ACCURACY</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {correctCount}/{questions.length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px]">MAX STREAK</div>
              <div className="text-xl font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-current" />
                {bestStreak}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-500 text-[10px]">QUESTIONS</div>
              <div className="text-xl font-bold text-slate-200 mt-0.5">{questions.length}</div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Speed Duel Again</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Quiz Header & Scoreboard HUD */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Question:</span>
                <span className="text-white font-bold">{currentIndex + 1} / {questions.length}</span>
              </div>

              <span className="text-slate-800 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Score:</span>
                <span className="text-cyan-300 font-bold text-sm">{score}</span>
              </div>

              <span className="text-slate-800 hidden sm:inline">|</span>

              <div className="flex items-center gap-1">
                <Flame className={`w-3.5 h-3.5 ${streak > 1 ? 'text-amber-400 animate-pulse fill-current' : 'text-slate-600'}`} />
                <span className="text-slate-400">Streak:</span>
                <span className={`font-bold ${streak > 1 ? 'text-amber-300' : 'text-slate-300'}`}>
                  {streak}x
                </span>
              </div>
            </div>

            {/* Timer Bar */}
            <div className="flex items-center gap-2">
              <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-cyan-400'}`} />
              <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
                />
              </div>
              <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-[#07090e] space-y-4">
            {/* Category & Asymptotic Speedup Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/40 uppercase">
                  {currentQ.category}
                </span>
                <span className="text-xs font-mono font-bold text-white">{currentQ.title}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                  currentQ.speedupType === 'EXPONENTIAL' 
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                    : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                }`}>
                  {currentQ.speedupType} SPEEDUP
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">
                  {currentQ.speedupRatioDisplay}
                </span>
              </div>
            </div>

            {/* Scenario Callout */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
              <Scale className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300">Scenario ({currentQ.variableN}):</strong> {currentQ.scenario}
              </div>
            </div>

            {/* Main Question Text */}
            <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Classical vs Quantum Head-to-Head Visual Duel Bar */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  <span>Classical Algorithm: <strong className="text-rose-400">{currentQ.classicalComplexity}</strong></span>
                </span>
                <span className="text-rose-300 font-bold">{currentQ.classicalOpsDisplay}</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Quantum Algorithm: <strong className="text-cyan-400">{currentQ.quantumComplexity}</strong></span>
                </span>
                <span className="text-cyan-300 font-bold">{currentQ.quantumOpsDisplay}</span>
              </div>

              {/* Race Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="w-16 shrink-0">Classical:</span>
                  <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-rose-500 w-[15%]" />
                  </div>
                  <span className="text-slate-500">Sequential</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="w-16 shrink-0 text-cyan-400 font-bold">Quantum:</span>
                  <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-cyan-400 w-[100%]" />
                  </div>
                  <span className="text-emerald-400 font-bold">Done!</span>
                </div>
              </div>

              {/* Launcher to Side-by-Side Simulator */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500">Compare live CPU vs QPU hardware clocks:</span>
                <button
                  onClick={() => setViewMode('simulator')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Launch Side-by-Side Simulation</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 4 Interactive Answer Choices */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {currentQ.options.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'bg-slate-950/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-200';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/40 font-semibold';
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = 'bg-rose-950/40 border-rose-500/80 text-rose-200 line-through';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer text-xs font-mono flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-400 shrink-0 uppercase">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    {isAnswered && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !opt.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Proof Card (Appears after answer) */}
            {isAnswered && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 font-mono text-xs animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mathematical Derivation &amp; Asymptotic Breakdown:</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect ? 'Correct! +Bonus' : 'Incorrect'}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {currentQ.explanation.coreReason}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-rose-300">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Classical Math:</div>
                    <div className="mt-0.5">{currentQ.explanation.classicalMath}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Quantum Math:</div>
                    <div className="mt-0.5">{currentQ.explanation.quantumMath}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-slate-300">
                  <strong className="text-indigo-400">Industry Takeaway: </strong>
                  {currentQ.explanation.takeaway}
                </div>

                {/* Next Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Final Certification'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
