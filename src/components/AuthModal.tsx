import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ShieldCheck, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { name: string; email: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate authenticating/verifying with a real glassmorphic feedback delay
    setTimeout(() => {
      if (!email || !password || (!isLogin && !name)) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      // Successful simulated database entry/lookup
      const userData = {
        name: isLogin ? name || email.split("@")[0] : name,
        email: email,
      };

      localStorage.setItem("academy_user", JSON.stringify(userData));
      onAuthSuccess(userData);
      setLoading(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#02010c]/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_0_50px_rgba(236,72,153,0.15)] backdrop-blur-2xl z-10"
          >
            {/* Top Pink Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 shadow-[0_0_20px_rgba(236,72,153,0.8)] rounded-full" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 mb-4 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white font-sans">
                {isLogin ? "Welcome Back to AI Academy" : "Create Academy Account"}
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {isLogin ? "Log in to resume your learning path" : "Sign up to start your personalized study journey"}
              </p>
            </div>

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-xs text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Password</label>
                  {isLogin && (
                    <a href="#" className="text-xs text-pink-500 hover:text-pink-400 transition-colors">Forgot?</a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(236,72,153,0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold text-sm tracking-wider hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isLogin ? "Access Portal" : "Begin Learning Journey"}</span>
                )}
              </motion.button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="text-center mt-6 pt-6 border-t border-white/5">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isLogin ? "New to the platform? " : "Already have an account? "}
                <span className="text-pink-500 font-semibold">{isLogin ? "Sign Up" : "Log In"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
