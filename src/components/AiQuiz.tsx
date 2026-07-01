import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Brain, Award, Play, CheckCircle2, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface AiQuizProps {
  onQuizComplete: (score: number, totalQuestions: number, topic: string) => void;
}

export default function AiQuiz({ onQuizComplete }: AiQuizProps) {
  const [topic, setTopic] = useState("JavaScript Closures");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState("");

  // Quiz taking state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions(null);
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setQuizSubmitted(false);

    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty })
      });

      if (!res.ok) {
        throw new Error("Failed to generate quiz. Please check backend connection or API Key.");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setQuestions(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIdx] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (!questions) return;
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!questions) return;
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        finalScore += 1;
      }
    });

    setScore(finalScore);
    setQuizSubmitted(true);
    
    // Trigger callback to update learning analytics on homepage dashboard
    onQuizComplete(finalScore, questions.length, topic);

    // Dynamic, score-based confetti celebrations
    const percent = Math.round((finalScore / questions.length) * 100);
    if (percent === 100) {
      // 100% score: Ultra high intensity double side-cannon burst over 2.5 seconds
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 60 * (timeLeft / duration);
        // bursts from left side & right side with flame & cosmic colors
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]
        });
      }, 250);
    } else if (percent >= 75) {
      // 75% or higher: Solid festive burst of high-contrast particles
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#3b82f6", "#10b981"]
      });
    } else if (percent >= 50) {
      // 50% or higher: Moderate intensity pleasant shower
      confetti({
        particleCount: 75,
        spread: 50,
        origin: { y: 0.65 },
        colors: ["#3b82f6", "#10b981", "#f59e0b"]
      });
    } else {
      // Lower scores: Minimal encouragement dust
      confetti({
        particleCount: 20,
        spread: 25,
        origin: { y: 0.7 },
        colors: ["#94a3b8", "#64748b"]
      });
    }
  };

  const resetQuiz = () => {
    setQuestions(null);
    setSelectedAnswers([]);
    setQuizSubmitted(false);
    setCurrentQuestionIdx(0);
  };

  return (
    <div id="ai-quiz-generator" className="w-full max-w-4xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.05)]">
      {/* Decorative neon blobs */}
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">AI Diagnostic Quiz Generator</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Let Gemini build personalized multi-choice knowledge checkups</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 font-semibold self-start md:self-auto">
          <Sparkles className="w-3 h-3 animate-pulse" />
          JSON Mode Guided
        </div>
      </div>

      {/* Form State (Before quiz generation) */}
      {!questions && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Topic Input */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-300 tracking-wide uppercase">Select Study Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Web3, JavaScript Closures, Quantum Cryptography..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-white text-xs md:text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-500"
              />
            </div>

            {/* Difficulty Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-300 tracking-wide uppercase">Difficulty Level</label>
              <div className="flex border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] h-[42px] p-1">
                {["Easy", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                      difficulty === level
                        ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={generateQuiz}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg font-orbitron uppercase"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Generate Smart Quiz
          </motion.button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
          <div>
            <p className="text-slate-200 font-semibold text-sm">Generating customized questions...</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Evaluating the topic schema with Gemini to construct balanced, diagnostics-oriented questions and complete answers.</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
          <p className="text-red-400 font-medium text-sm">Failed to compile your custom checkup</p>
          <p className="text-xs text-red-300/70 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={generateQuiz}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            Retry Generation
          </button>
        </div>
      )}

      {/* Interactive Quiz Panel */}
      {questions && questions.length > 0 && (
        <AnimatePresence mode="wait">
          {!quizSubmitted ? (
            <motion.div
              key="quiz-body"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Question progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="uppercase tracking-wide">Topic: <b className="text-white">{topic}</b> ({difficulty})</span>
                  <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                    style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question display */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                <h4 className="text-sm md:text-base font-bold text-white leading-relaxed">
                  {questions[currentQuestionIdx].question}
                </h4>
              </div>

              {/* Options selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestionIdx].options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`text-left p-4.5 rounded-xl border transition-all cursor-pointer text-xs font-medium ${
                        isSelected
                          ? "bg-purple-500/10 border-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                          : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? "bg-purple-500 text-white" : "bg-white/10 text-slate-400"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Action Area */}
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>

                {currentQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestionIdx] === undefined}
                    className="px-4 py-2 text-xs font-bold text-white bg-purple-500 hover:bg-purple-400 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Next Question <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswers.length < questions.length || selectedAnswers.includes(undefined as any)}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Submit Exam Checkup
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            /* Quiz Completed/Diagnostic Score Panel */
            <motion.div
              key="quiz-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 space-y-8"
            >
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Award className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black text-white">Diagnostic Summary Complete</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  You scored <b className="text-emerald-400 text-lg">{score} / {questions.length}</b> correct answers on the <b>{topic}</b> challenge.
                </p>
              </div>

              {/* Progress visual metrics */}
              <div className="flex justify-center items-center gap-8 max-w-xs mx-auto py-4 border-y border-white/5">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{Math.round((score / questions.length) * 100)}%</div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Proficiency</div>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">+{score * 20} XP</div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Points Awarded</div>
                </div>
              </div>

              {/* Detailed review items */}
              <div className="space-y-4 text-left max-h-[300px] overflow-y-auto px-2">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Question Review</h4>
                {questions.map((q, idx) => {
                  const userAns = selectedAnswers[idx];
                  const isCorrect = userAns === q.correctAnswerIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border text-sm space-y-2 ${
                        isCorrect
                          ? "bg-emerald-500/[0.02] border-emerald-500/20"
                          : "bg-red-500/[0.02] border-red-500/20"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <span className="font-semibold text-white">{idx + 1}. {q.question}</span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1 pl-7">
                        <div>
                          Your answer: <span className={isCorrect ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                            {q.options[userAns]}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            Correct answer: <span className="text-emerald-400 font-semibold">{q.options[q.correctAnswerIndex]}</span>
                          </div>
                        )}
                        <p className="text-slate-500 italic mt-1.5">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset/Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={resetQuiz}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Take Another Quiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
