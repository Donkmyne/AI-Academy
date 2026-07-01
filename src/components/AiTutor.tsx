import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Brain, ArrowRight, Loader2, HelpCircle } from "lucide-react";

const PRESETS = [
  "Explain Quantum Computing in plain English",
  "Explain how Neural Networks actually learn",
  "What is the blockchain consensus mechanism?",
  "Explain React state management under the hood"
];

export default function AiTutor() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (textToSearch: string) => {
    if (!textToSearch.trim()) return;
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: textToSearch })
      });

      if (!res.ok) {
        throw new Error("Failed to consult AI Tutor. Please check your network or key.");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.text || "No explanation provided.");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const parseAndFormatText = (text: string) => {
    // Simple robust custom markdown-like formatter to render elegant list items, bold tags, and code blocks
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Code blocks
      if (trimmed.startsWith("```")) {
        return null; // Skip markdown block declarations
      }

      // Check for bullet points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        const itemContent = trimmed.substring(2);
        return (
          <li key={idx} className="ml-6 list-disc text-slate-300 text-sm md:text-base leading-relaxed my-1 font-sans">
            {formatBold(itemContent)}
          </li>
        );
      }

      // Headers
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm md:text-base font-bold text-purple-400 mt-4 mb-2 font-sans tracking-tight">
            {trimmed.substring(4)}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base md:text-lg font-bold text-violet-400 mt-6 mb-3 font-sans tracking-tight">
            {trimmed.substring(3)}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={idx} className="text-lg md:text-xl font-extrabold text-white mt-8 mb-4 font-sans tracking-tight">
            {trimmed.substring(2)}
          </h2>
        );
      }

      // Fallback standard paragraphs with bold format
      return (
        <p key={idx} className="text-slate-300 text-xs md:text-sm leading-relaxed my-2 font-sans">
          {formatBold(line)}
        </p>
      );
    });
  };

  // Safe inner bold formatting helper
  const formatBold = (str: string) => {
    const parts = str.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-white font-semibold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.05)]">
      {/* Decorative Neon Ring */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">AI 1-on-1 Lesson Tutor</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Instant master-class breakdown on any learning topic</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 font-semibold self-start md:self-auto">
          <Sparkles className="w-3 h-3 animate-pulse" />
          Powered by Gemini 3.5 Flash
        </div>
      </div>

      {/* Input Search Block */}
      <div className="space-y-4">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="What study concept can I break down for you today?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.06] border border-white/10 focus:border-purple-500/40 rounded-2xl py-3.5 pl-5 pr-14 text-white text-xs md:text-sm focus:outline-none transition-all placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loading || !query.trim()}
            className="absolute right-2 p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-95 transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Popular presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quick Prompts:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                handleSearch(p);
              }}
              disabled={loading}
              className="text-[10px] text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display Area */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 py-16 flex flex-col items-center justify-center gap-4 text-center border border-white/5 bg-white/[0.01] rounded-2xl"
          >
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <div>
              <p className="text-slate-200 text-xs font-semibold">AI Tutor is thinking...</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Retrieving concept context and generating dynamic pedagogical insights.</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 p-6 border border-red-500/20 bg-red-500/5 rounded-2xl text-center"
          >
            <p className="text-red-400 text-xs font-medium">Unable to load explanation</p>
            <p className="text-[11px] text-red-300/70 mt-1 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => handleSearch(query)}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              Retry
            </button>
          </motion.div>
        )}

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 p-6 md:p-8 border border-white/5 bg-[#030214]/60 rounded-2xl shadow-inner max-h-[500px] overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-purple-400 tracking-widest uppercase">
              <Sparkles className="w-4 h-4" /> Lesson Breakdown
            </div>
            <div className="space-y-2 select-text selection:bg-purple-500/30 selection:text-white">
              {parseAndFormatText(response)}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span className="text-xs text-slate-500">Need direct validation? Generate a custom quiz from this topic.</span>
              <button
                onClick={() => {
                  // Dispatch an event to scroll/transition user to the Quiz generator
                  const quizSection = document.getElementById("ai-quiz-generator");
                  if (quizSection) {
                    quizSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs text-purple-400 hover:text-white font-bold flex items-center gap-1.5 cursor-pointer bg-purple-500/5 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-all"
              >
                Test your knowledge now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
