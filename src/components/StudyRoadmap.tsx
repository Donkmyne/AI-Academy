import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Compass, CheckSquare, Square, Calendar, Award, BookOpen, Loader2, ArrowRight } from "lucide-react";

interface RoadmapWeek {
  weekNumber: number;
  topic: string;
  description: string;
  milestones: string[];
  resources: string[];
}

interface RoadmapData {
  title: string;
  description: string;
  weeks: RoadmapWeek[];
}

export default function StudyRoadmap() {
  const [subject, setSubject] = useState("AI Product Management");
  const [duration, setDuration] = useState(4);
  const [focus, setFocus] = useState("Practical Projects");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [error, setError] = useState("");

  // Persistent completion states
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  // On mount, check if there is an active saved roadmap
  useEffect(() => {
    const savedRoadmap = localStorage.getItem("academy_roadmap");
    if (savedRoadmap) {
      try {
        setRoadmap(JSON.parse(savedRoadmap));
      } catch (e) {
        // ignore
      }
    }

    const savedMilestones = localStorage.getItem("academy_completed_milestones");
    if (savedMilestones) {
      try {
        setCompletedMilestones(JSON.parse(savedMilestones));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const generateRoadmap = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    setError("");
    setRoadmap(null);

    try {
      const res = await fetch("/api/ai/personalized-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, duration, focus })
      });

      if (!res.ok) {
        throw new Error("Failed to generate personalized roadmap. Please verify key.");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setRoadmap(data);
      localStorage.setItem("academy_roadmap", JSON.stringify(data));
      // Reset progress for new roadmap
      setCompletedMilestones({});
      localStorage.setItem("academy_completed_milestones", JSON.stringify({}));
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (weekNum: number, index: number) => {
    const key = `${weekNum}-${index}`;
    const updated = {
      ...completedMilestones,
      [key]: !completedMilestones[key]
    };
    setCompletedMilestones(updated);
    localStorage.setItem("academy_completed_milestones", JSON.stringify(updated));
  };

  const calculateProgress = () => {
    if (!roadmap) return 0;
    let totalMilestones = 0;
    let completedCount = 0;

    roadmap.weeks.forEach((week) => {
      week.milestones.forEach((_, idx) => {
        totalMilestones++;
        const key = `${week.weekNumber}-${idx}`;
        if (completedMilestones[key]) {
          completedCount++;
        }
      });
    });

    if (totalMilestones === 0) return 0;
    return Math.round((completedCount / totalMilestones) * 100);
  };

  const progressPercent = calculateProgress();

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.05)]">
      {/* Background radial blobs */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">AI Interactive Study Architect</h3>
            <p className="text-xs text-slate-400 mt-0.5">Craft customized micro-curriculums complete with checkable milestones</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 font-semibold self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5" /> Personalized Roadmaps
        </div>
      </div>

      {/* Inputs (Form) */}
      {!roadmap && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Subject Input */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">What subject do you want to master?</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Solidity Smart Contracts, Advanced CSS/SVG Animations..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-colors placeholder:text-slate-500"
              />
            </div>

            {/* Duration select */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Duration (Weeks)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#0d0a21] border border-white/10 rounded-xl h-[48px] px-4 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-colors cursor-pointer"
              >
                {[2, 3, 4, 6, 8, 12].map((w) => (
                  <option key={w} value={w}>{w} Weeks</option>
                ))}
              </select>
            </div>

            {/* Focus target */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Curriculum Focus</label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full bg-[#0d0a21] border border-white/10 rounded-xl h-[48px] px-4 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-colors cursor-pointer"
              >
                <option value="Practical Projects">Practical Projects</option>
                <option value="Conceptual Research">Theoretical / Research</option>
                <option value="Job Interview Prep">Job Interview Prep</option>
                <option value="Crash Course">Speed / Crash Course</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(244,63,94,0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={generateRoadmap}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Calendar className="w-4 h-4" />
            Build My Learning Blueprint
          </motion.button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
          <div>
            <p className="text-slate-200 font-semibold">Architecting your syllabus...</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Evaluating learning pathways, compiling weekly progression milestones, and locating recommended educational resources with Gemini.</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
          <p className="text-red-400 font-medium">Failed to architect syllabus</p>
          <p className="text-xs text-red-300/70 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={generateRoadmap}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            Retry Generation
          </button>
        </div>
      )}

      {/* Render Active Roadmap */}
      {roadmap && (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Roadmap Meta info & overall progress */}
            <div className="p-6 rounded-2xl bg-[#09071c] border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{roadmap.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{roadmap.description}</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("academy_roadmap");
                    localStorage.removeItem("academy_completed_milestones");
                    setRoadmap(null);
                    setCompletedMilestones({});
                  }}
                  className="text-xs font-semibold text-rose-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer"
                >
                  Create New Path
                </button>
              </div>

              {/* Progress display */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>Syllabus Completion</span>
                  <span className="text-rose-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-orange-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Timeline sequence */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {roadmap.weeks.map((week) => (
                <div key={week.weekNumber} className="relative pl-10 group">
                  {/* Timeline bullet indicator */}
                  <div className="absolute left-1.5 top-1.5 w-5 h-5 rounded-full border border-rose-500/40 bg-[#030214] flex items-center justify-center text-[10px] font-bold text-rose-400 z-10 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                    {week.weekNumber}
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 group-hover:bg-white/[0.03] group-hover:border-white/10 transition-all">
                    {/* Header line */}
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Week {week.weekNumber} Study Targets
                    </div>
                    <h5 className="text-base font-bold text-white mb-2">{week.topic}</h5>
                    <p className="text-xs md:text-sm text-slate-400 mb-4">{week.description}</p>

                    {/* Checkbox Milestones */}
                    <div className="space-y-2 mb-4">
                      <h6 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">Key Milestones:</h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {week.milestones.map((milestone, idx) => {
                          const mKey = `${week.weekNumber}-${idx}`;
                          const isDone = !!completedMilestones[mKey];
                          return (
                            <button
                              key={idx}
                              onClick={() => toggleMilestone(week.weekNumber, idx)}
                              className="flex items-start gap-2.5 text-left p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer text-xs group-item text-slate-300"
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 hover:text-rose-400" />
                              )}
                              <span className={isDone ? "line-through text-slate-500" : "text-slate-300"}>{milestone}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resources */}
                    {week.resources && week.resources.length > 0 && (
                      <div className="pt-3 border-t border-white/5 space-y-1">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Recommended Curated Resources
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {week.resources.map((resource, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium text-slate-300 bg-white/[0.04] px-2 py-1 rounded border border-white/5 flex items-center gap-1"
                            >
                              <ArrowRight className="w-2.5 h-2.5 text-rose-400" /> {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Achievement Badge when completed 100% */}
            {progressPercent === 100 && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 text-center border border-emerald-500/30 bg-emerald-500/10 rounded-2xl space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <Award className="w-10 h-10 text-emerald-400 mx-auto" />
                <h5 className="text-white font-bold text-lg">Roadmap Completed!</h5>
                <p className="text-xs text-emerald-300 max-w-sm mx-auto">Sensational job. You completed every milestone in this blueprint. Take a diagnostic checkup using the quiz tool to cement your status.</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
