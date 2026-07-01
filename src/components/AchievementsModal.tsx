import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trophy, CheckCircle2, Lock, Star, Flame, GraduationCap, ShieldCheck, Heart, Sparkles, Award } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: string;
  icon: any;
  unlocked: boolean;
  color: string;
  badgeGlow: string;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    streak: number;
    quizAttempts: number;
    completedMilestones: number;
    hasProfileName: boolean;
    hasPremiumUnlock: boolean;
  };
}

export default function AchievementsModal({ isOpen, onClose, stats }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (isOpen) {
      const list: Achievement[] = [
        {
          id: "profile",
          title: "Knowledge Explorer",
          description: "Registered your formal academic profile in the Neonmorphic Portal.",
          requirement: "Provide a student profile name",
          icon: GraduationCap,
          unlocked: stats.hasProfileName,
          color: "from-blue-500 to-indigo-500",
          badgeGlow: "rgba(59, 130, 246, 0.4)"
        },
        {
          id: "first_quiz",
          title: "Initiate Scholar",
          description: "Initiated diagnostic verification by attempting at least one quiz.",
          requirement: "Complete 1 Quiz Check",
          icon: Star,
          unlocked: stats.quizAttempts >= 1,
          color: "from-teal-400 to-emerald-500",
          badgeGlow: "rgba(20, 184, 166, 0.4)"
        },
        {
          id: "grand_quizzer",
          title: "Grandmaster Verifier",
          description: "Sustained thorough comprehension across 5 complete quiz evaluations.",
          requirement: "Complete 5 Quizzes (Current: " + stats.quizAttempts + "/5)",
          icon: Award,
          unlocked: stats.quizAttempts >= 5,
          color: "from-purple-500 to-fuchsia-500",
          badgeGlow: "rgba(168, 85, 247, 0.4)"
        },
        {
          id: "study_streak",
          title: "Consistency Guru",
          description: "Sustained focus by logging study sessions for at least 7 days consecutively.",
          requirement: "Maintain a 7-Day Study Streak (Current: " + stats.streak + "/7)",
          icon: Flame,
          unlocked: stats.streak >= 7,
          color: "from-orange-500 to-rose-500",
          badgeGlow: "rgba(249, 115, 22, 0.4)"
        },
        {
          id: "roadmap_progress",
          title: "Curriculum Navigator",
          description: "Successfully masterminded a path by completing your first curriculum checklist milestone.",
          requirement: "Check off 1 roadmap milestone",
          icon: ShieldCheck,
          unlocked: stats.completedMilestones >= 1,
          color: "from-pink-500 to-rose-500",
          badgeGlow: "rgba(236, 72, 153, 0.4)"
        },
        {
          id: "premium_member",
          title: "Academy Benefactor",
          description: "Unlocked the full potential of learning paths by purchasing a Premium course or membership.",
          requirement: "Activate any premium path / subscription",
          icon: Sparkles,
          unlocked: stats.hasPremiumUnlock,
          color: "from-amber-400 to-orange-500",
          badgeGlow: "rgba(245, 158, 11, 0.4)"
        }
      ];
      setAchievements(list);
    }
  }, [isOpen, stats]);

  if (!isOpen) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#02010c]/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal body */}
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a081e]/90 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(139,92,246,0.35)] backdrop-blur-2xl z-10"
        >
          {/* Neon decorative circles */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Academic Achievement Hall</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track your study badges, milestones, and rank goals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Global Progress Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 block">Overall Badge Completion</span>
              <div className="text-sm font-black text-white">{unlockedCount} of {achievements.length} Badges Unlocked</div>
            </div>

            <div className="w-full sm:w-64 space-y-2">
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / (achievements.length || 1)) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                  style={{
                    boxShadow: "0 0 10px rgba(139,92,246,0.4)"
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 text-right font-bold uppercase">
                {Math.round((unlockedCount / (achievements.length || 1)) * 100)}% Complete
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1 select-none custom-scrollbar relative z-10">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex gap-4 overflow-hidden ${
                    achievement.unlocked
                      ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_4px_20px_rgba(255,255,255,0.02)]"
                      : "bg-[#050314]/40 border-white/[0.02] opacity-60"
                  }`}
                >
                  {/* Badge Left Column with Icon */}
                  <div className="shrink-0 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                        achievement.unlocked
                          ? `bg-gradient-to-br ${achievement.color} text-white border-white/20`
                          : "bg-white/5 border-white/5 text-slate-600"
                      }`}
                      style={{
                        boxShadow: achievement.unlocked ? `0 0 15px ${achievement.badgeGlow}` : "none"
                      }}
                    >
                      {achievement.unlocked ? (
                        <Icon className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4.5 h-4.5 text-slate-600" />
                      )}
                    </div>
                  </div>

                  {/* Badge Right Column with details */}
                  <div className="flex-1 space-y-1 text-left">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-xs font-black tracking-wide leading-tight ${achievement.unlocked ? "text-white" : "text-slate-500"}`}>
                        {achievement.title}
                      </span>
                      {achievement.unlocked && (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                        </span>
                      )}
                    </div>

                    <p className={`text-[11px] leading-relaxed ${achievement.unlocked ? "text-slate-300" : "text-slate-500 font-medium"}`}>
                      {achievement.unlocked ? achievement.description : "Keep making academic checks to release this master study badge."}
                    </p>

                    <div className="pt-1">
                      <span className={`text-[9px] font-bold block uppercase tracking-wider ${achievement.unlocked ? "text-slate-500" : "text-amber-500/70"}`}>
                        Req: {achievement.requirement}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-end relative z-10">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold uppercase tracking-wider hover:text-white transition-all cursor-pointer"
            >
              Continue Master Path
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
