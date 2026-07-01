import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Award, Clock, Flame, BookOpen, BarChart3, RotateCcw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import AchievementsModal from "./AchievementsModal";

interface DashboardPreviewProps {
  quizHistoryTrigger: number; // Trigger reload when quiz is taken
}

export default function DashboardPreview({ quizHistoryTrigger }: DashboardPreviewProps) {
  const [userName, setUserName] = useState("Guest Scholar");
  const [streak, setStreak] = useState(3);
  const [activeMinutes, setActiveMinutes] = useState(140);
  const [quizStats, setQuizStats] = useState({
    attempts: 0,
    avgScore: 0,
    topicsCompleted: [] as string[]
  });
  const [selectedWeekDay, setSelectedWeekDay] = useState<number | null>(null);
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);
  const [completedMilestonesCount, setCompletedMilestonesCount] = useState(3);
  const [totalMilestonesCount, setTotalMilestonesCount] = useState(8);
  const [todayGoalCompleted, setTodayGoalCompleted] = useState(false);
  const [streakCelebrate, setStreakCelebrate] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [hasPremiumUnlock, setHasPremiumUnlock] = useState(false);

  // flame animation variants
  const flameVariants = {
    active: {
      scale: [1, 1.15, 1, 1.05, 1],
      rotate: [0, -5, 5, -3, 0],
      filter: [
        "drop-shadow(0 0 4px rgba(249,115,22,0.6))",
        "drop-shadow(0 0 12px rgba(239,68,68,0.9))",
        "drop-shadow(0 0 6px rgba(249,115,22,0.6))"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    inactive: {
      scale: 1,
      rotate: 0,
      filter: "none"
    },
    celebrate: {
      scale: [1, 1.6, 0.9, 1.2, 1],
      rotate: [0, -15, 15, -10, 0],
      filter: "drop-shadow(0 0 24px rgba(239,68,68,1)) drop-shadow(0 0 8px rgba(245,158,11,1))",
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const triggerStreakActive = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const savedHistory = localStorage.getItem("academy_streak_history");
    let historyList: string[] = [];
    if (savedHistory) {
      try {
        historyList = JSON.parse(savedHistory);
      } catch (e) {}
    }
    if (!Array.isArray(historyList)) {
      historyList = [];
    }

    if (!historyList.includes(todayStr)) {
      historyList.push(todayStr);
      historyList.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      localStorage.setItem("academy_streak_history", JSON.stringify(historyList));
      
      // Calculate new streak count
      let currentStreak = 0;
      let checkDate = new Date();
      while (true) {
        const checkStr = checkDate.toLocaleDateString('en-CA');
        if (historyList.includes(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      localStorage.setItem("academy_streak_count", currentStreak.toString());
      setStreak(currentStreak);
      setTodayGoalCompleted(true);
      
      // Play flame celebration
      setStreakCelebrate(true);
      setTimeout(() => setStreakCelebrate(false), 1500);

      // Trigger beautiful confetti focus
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#f97316", "#ef4444", "#f59e0b"] // flame colors
      });
    }
  };

  // References to keep track of previous values for celebratory triggers
  const prevAttemptsRef = useRef<number | null>(null);
  const prevMilestonesRef = useRef<number | null>(null);

  const mockWeeklyData = [
    { day: "Mon", minutes: 30, x: 50, y: 150 },
    { day: "Tue", minutes: 45, x: 120, y: 120 },
    { day: "Wed", minutes: 60, x: 190, y: 90 },
    { day: "Thu", minutes: 40, x: 260, y: 130 },
    { day: "Fri", minutes: 90, x: 330, y: 50 },
    { day: "Sat", minutes: 120, x: 400, y: 20 },
    { day: "Sun", minutes: 75, x: 470, y: 80 }
  ];

  const triggerQuizConfetti = () => {
    // Beautiful celebratory burst of colors
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"],
      disableForReducedMotion: true,
    });
  };

  const triggerMilestoneConfetti = () => {
    // Dual side-cannons for milestones
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
      colors: ["#ec4899", "#8b5cf6", "#3b82f6"]
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
      colors: ["#ec4899", "#8b5cf6", "#3b82f6"]
    });
  };

  const loadStats = () => {
    // Load User
    const savedUser = localStorage.getItem("academy_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setUserName(u.name);
      } catch (e) {}
    } else {
      setUserName("Guest Scholar");
    }

    // Load Quiz History
    let attemptsCount = 0;
    const history = localStorage.getItem("academy_quiz_history");
    if (history) {
      try {
        const h = JSON.parse(history);
        if (Array.isArray(h) && h.length > 0) {
          attemptsCount = h.length;
          const totalScore = h.reduce((sum: number, q: any) => sum + (q.score / q.totalQuestions) * 100, 0);
          const avgScore = Math.round(totalScore / attemptsCount);
          const topics = Array.from(new Set(h.map((q: any) => q.topic))) as string[];
          setQuizStats({
            attempts: attemptsCount,
            avgScore,
            topicsCompleted: topics
          });
          // Update simulated minutes to represent effort
          setActiveMinutes(140 + attemptsCount * 15);
        }
      } catch (e) {}
    } else {
      setQuizStats({
        attempts: 0,
        avgScore: 0,
        topicsCompleted: []
      });
    }

    // Load Milestones Progress
    let milestonesCount = 3;
    let totalCount = 8;
    const roadmapStr = localStorage.getItem("academy_roadmap");
    const savedMilestones = localStorage.getItem("academy_completed_milestones");
    if (roadmapStr) {
      try {
        const roadmapObj = JSON.parse(roadmapStr);
        if (roadmapObj && Array.isArray(roadmapObj.weeks)) {
          let calcTotal = 0;
          roadmapObj.weeks.forEach((week: any) => {
            if (Array.isArray(week.milestones)) {
              calcTotal += week.milestones.length;
            }
          });
          if (calcTotal > 0) {
            totalCount = calcTotal;
          }
        }
      } catch (e) {}
    }
    if (savedMilestones) {
      try {
        const m = JSON.parse(savedMilestones);
        if (m && typeof m === "object") {
          milestonesCount = Object.values(m).filter(Boolean).length;
        }
      } catch (e) {}
    } else if (roadmapStr) {
      milestonesCount = 0;
    }
    setCompletedMilestonesCount(milestonesCount);
    setTotalMilestonesCount(totalCount);

    // Load daily study streak details
    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    const dayBeforeStr = dayBefore.toLocaleDateString('en-CA');

    let savedHistory = localStorage.getItem("academy_streak_history");
    let historyList: string[] = [];
    let currentStreak = 3;
    let loggedToday = false;

    if (savedHistory) {
      try {
        historyList = JSON.parse(savedHistory);
        if (!Array.isArray(historyList)) {
          historyList = [];
        }
      } catch (e) {
        historyList = [];
      }
    } else {
      // Seed initial 3 days history to support starting streak of 3
      historyList = [todayStr, yesterdayStr, dayBeforeStr];
      localStorage.setItem("academy_streak_history", JSON.stringify(historyList));
      localStorage.setItem("academy_streak_count", "3");
      localStorage.setItem("academy_today_goal_completed", "true");
    }

    const savedStreak = localStorage.getItem("academy_streak_count");
    if (savedStreak) {
      currentStreak = parseInt(savedStreak, 10);
    }

    if (historyList.includes(todayStr)) {
      loggedToday = true;
    } else {
      // If today is not in history, let's see if yesterday was in history.
      if (historyList.includes(yesterdayStr)) {
        loggedToday = false;
      } else {
        // If yesterday was also not in history, streak is broken! Reset to 0.
        loggedToday = false;
        currentStreak = 0;
        localStorage.setItem("academy_streak_count", "0");
      }
    }

    setStreak(currentStreak);
    setTodayGoalCompleted(loggedToday);

    // Load premium purchase details
    const purchased = localStorage.getItem("academy_purchased_items");
    let premiumActive = false;
    if (purchased) {
      try {
        const p = JSON.parse(purchased);
        if (Array.isArray(p) && p.length > 0) {
          premiumActive = true;
        }
      } catch (e) {}
    }
    setHasPremiumUnlock(premiumActive);

    // Trigger celebrations if values increased after initial mount
    if (prevAttemptsRef.current !== null && attemptsCount > prevAttemptsRef.current) {
      triggerQuizConfetti();
      triggerStreakActive();
    }
    if (prevMilestonesRef.current !== null && milestonesCount > prevMilestonesRef.current) {
      triggerMilestoneConfetti();
      triggerStreakActive();
    }

    // Update references
    prevAttemptsRef.current = attemptsCount;
    prevMilestonesRef.current = milestonesCount;
  };

  useEffect(() => {
    loadStats();
    // Setup interval to poll for stats in case they logged in/completed stuff
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, [quizHistoryTrigger]);

  const handleResetStats = () => {
    localStorage.removeItem("academy_quiz_history");
    localStorage.removeItem("academy_roadmap");
    localStorage.removeItem("academy_completed_milestones");
    localStorage.removeItem("academy_streak_history");
    localStorage.removeItem("academy_streak_count");
    localStorage.removeItem("academy_today_goal_completed");
    loadStats();
  };

  const progressBars = [
    {
      id: "syllabus",
      name: "Syllabus Milestone Track",
      current: completedMilestonesCount,
      target: totalMilestonesCount,
      unit: "milestones",
      percent: Math.round((completedMilestonesCount / totalMilestonesCount) * 100) || 0,
      color: "from-pink-500 to-rose-500",
      glowColor: "rgba(236, 72, 153, 0.4)",
      nextAction: "Check off more weekly items in the Study Roadmap generator below to progress your master path!",
      iconColor: "text-pink-400"
    },
    {
      id: "quizzes",
      name: "Quiz Verification Goal",
      current: quizStats.attempts,
      target: 5,
      unit: "quizzes",
      percent: Math.min(Math.round((quizStats.attempts / 5) * 100), 100) || 0,
      color: "from-purple-500 to-indigo-500",
      glowColor: "rgba(168, 85, 247, 0.4)",
      nextAction: "Generate a smart AI Quiz with Gemini 3.5 Flash and score 80%+ to fulfill your diagnostic requirement!",
      iconColor: "text-purple-400"
    },
    {
      id: "study_time",
      name: "Weekly Routine Commitment",
      current: activeMinutes,
      target: 300,
      unit: "minutes",
      percent: Math.min(Math.round((activeMinutes / 300) * 100), 100) || 0,
      color: "from-indigo-500 to-blue-500",
      glowColor: "rgba(99, 102, 241, 0.4)",
      nextAction: "Spend active hours using the AI Tutor chats, reviewing material, and taking quiz checkups!",
      iconColor: "text-indigo-400"
    },
    {
      id: "streaks",
      name: "Active Scholar Streaks",
      current: streak,
      target: 7,
      unit: "days",
      percent: Math.min(Math.round((streak / 7) * 100), 100) || 0,
      color: "from-amber-500 to-orange-500",
      glowColor: "rgba(245, 158, 11, 0.4)",
      nextAction: "Return consecutive days to level up your scholar ranking and unlock premium certificates!",
      iconColor: "text-amber-400"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.05)]">
      {/* Glow Rings */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4" /> Live Performance Analytics
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Student Control Center</h3>
        </div>

        {/* Interactive Daily Study Streak Counter */}
        <div className="flex flex-wrap items-center gap-3">
          <div 
            onClick={triggerStreakActive}
            title={todayGoalCompleted ? "Daily goal achieved today!" : "Click to complete today's check-in!"}
            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              todayGoalCompleted 
                ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] cursor-default" 
                : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] cursor-pointer"
            }`}
          >
            {/* Flame Icon with gorgeous floating sparks & fire animation */}
            <div className="relative">
              <motion.div
                animate={streakCelebrate ? "celebrate" : todayGoalCompleted ? "active" : "inactive"}
                variants={flameVariants}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  todayGoalCompleted 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
                    : "bg-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Flame className="w-4.5 h-4.5" />
              </motion.div>

              {/* Floating Sparks/Sparks Animation */}
              {todayGoalCompleted && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-orange-400"
                      initial={{ x: "50%", y: "60%", opacity: 0.8, scale: 1 }}
                      animate={{
                        x: `calc(50% + ${(i - 2) * 8}px)`,
                        y: "-15%",
                        opacity: 0,
                        scale: [1, 1.5, 0.5]
                      }}
                      transition={{
                        duration: 1 + Math.random() * 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut"
                      }}
                      style={{ left: "calc(50% - 2px)", top: "calc(50% - 2px)" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Streak count details */}
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">{streak} Day Streak</span>
                {todayGoalCompleted ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                    Action Required
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {todayGoalCompleted ? "Goal Completed for Today!" : "Click to log today's study goal"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAchievementsOpen(true)}
            className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          >
            <Trophy className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Achievements
          </button>

          <button
            onClick={handleResetStats}
            className="text-[10px] font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] px-3.5 py-2.5 rounded-2xl cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Profile
          </button>
        </div>
      </div>

      {/* Student Welcome Card */}
      <div className="p-5 rounded-2xl bg-[#09071c] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h4 className="text-base font-bold text-white">Hi, {userName}!</h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-md">Your personalized AI copilot has customized a high-velocity curriculum. Jump into study mode below to claim points.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="text-center bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 text-xs">
            <div className="text-white font-black text-xs">{userName === "Guest Scholar" ? "Level 1" : "Level 3"}</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Scholar Rank</div>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 text-xs">
            <div className="relative">
              <Flame className={`w-4.5 h-4.5 ${todayGoalCompleted ? "text-orange-400 animate-pulse" : "text-slate-500"}`} />
            </div>
            <div className="text-left">
              <div className="text-white font-black text-xs">{streak} Days</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Daily Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Milestone Progress Bars with Hover Tooltips */}
      <div className="mb-8 p-5 rounded-2xl bg-white/[0.01] border border-white/5 relative">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Interactive Progress Tracks</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Hover on any track to inspect milestone status & actions</h4>
          </div>
          <span className="text-[9px] text-purple-300 border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider self-start sm:self-auto shadow-[0_0_10px_rgba(139,92,246,0.15)]">
            Interactive Tooltips Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {progressBars.map((bar) => {
            const isHovered = hoveredBarId === bar.id;
            return (
              <div
                key={bar.id}
                className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-help"
                onMouseEnter={() => setHoveredBarId(bar.id)}
                onMouseLeave={() => setHoveredBarId(null)}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-bold text-slate-300">{bar.name}</span>
                  <span className="text-xs font-extrabold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {bar.percent}%
                  </span>
                </div>

                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${bar.color}`}
                    style={{
                      boxShadow: `0 0 12px ${bar.glowColor}`
                    }}
                  />
                </div>

                {/* Counter indicator */}
                <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-medium">
                  <span>Current: {bar.current} {bar.unit}</span>
                  <span>Target: {bar.target} {bar.unit}</span>
                </div>

                {/* Floating Interactive Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-[105%] w-[290px] sm:w-[320px] p-4 rounded-xl border bg-[#050316] text-left shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-30 pointer-events-none"
                      style={{
                        borderColor: bar.id === "syllabus" ? "rgba(236,72,153,0.3)" : bar.id === "quizzes" ? "rgba(168,85,247,0.3)" : bar.id === "study_time" ? "rgba(99,102,241,0.3)" : "rgba(245,158,11,0.3)",
                        boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 15px ${bar.glowColor}`
                      }}
                    >
                      {/* Tooltip Header */}
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${bar.iconColor}`}>
                          {bar.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {bar.percent}% Complete
                        </span>
                      </div>

                      {/* Tooltip Body */}
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                        You have logged <strong className="text-white">{bar.current} of {bar.target} {bar.unit}</strong> towards this development target.
                      </p>

                      {/* Next suggested action */}
                      <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                          Next Suggested Action:
                        </span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                          {bar.nextAction}
                        </p>
                      </div>

                      {/* Decorative bottom indicator arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                           style={{
                             borderTopColor: bar.id === "syllabus" ? "rgba(236,72,153,0.3)" : bar.id === "quizzes" ? "rgba(168,85,247,0.3)" : bar.id === "study_time" ? "rgba(99,102,241,0.3)" : "rgba(245,158,11,0.3)"
                           }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid containing stats & SVG charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Statistics Cards Columns */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Active study hours */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">{activeMinutes} Mins</div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Focus Hours</p>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Flame className="w-4.5 h-4.5 animate-bounce-slow" />
            </div>
            <div>
              <div className="text-sm font-black text-white">{streak} Day Goal</div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Active Streaks</p>
            </div>
          </div>

          {/* Quizzes Completed */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">{quizStats.attempts} Done</div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">AI Quizzes Taken</p>
            </div>
          </div>

          {/* Average Score */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">{quizStats.avgScore || 0}%</div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Average Score</p>
            </div>
          </div>
        </div>

        {/* Dynamic Glow SVG chart Column */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Effort Visualization</span>
            <span className="text-[9px] text-purple-400 bg-purple-500/15 px-2 py-1 rounded-full border border-purple-500/20 font-bold">
              +28% Active this week
            </span>
          </div>

          {/* Glowing Area Chart SVG */}
          <div className="relative w-full h-[180px] bg-white/[0.01] rounded-xl overflow-hidden p-2 flex items-end justify-between">
            <svg viewBox="0 0 520 180" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                {/* Glowing area gradient */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
                {/* Glowing line filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Area Under Curve */}
              <path
                d="M 50 150 C 120 120, 190 90, 260 130 S 400 20, 470 80 L 470 180 L 50 180 Z"
                fill="url(#areaGradient)"
                className="transition-all duration-500"
              />

              {/* Grid Lines */}
              <line x1="50" y1="150" x2="470" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="50" y1="100" x2="470" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="50" y1="50" x2="470" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {/* Elegant Wave line */}
              <path
                d="M 50 150 C 120 120, 190 90, 260 130 S 400 20, 470 80"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3.5"
                filter="url(#glow)"
                className="transition-all duration-500"
              />

              {/* Data Node Anchors */}
              {mockWeeklyData.map((d, index) => (
                <circle
                  key={index}
                  cx={d.x}
                  cy={d.y}
                  r="5.5"
                  fill="#8b5cf6"
                  stroke="#030214"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-8 transition-all hover:fill-white"
                  onClick={() => setSelectedWeekDay(index)}
                />
              ))}
            </svg>

            {/* Labels overlay */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-between px-10 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              {mockWeeklyData.map((d, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedWeekDay(index)}
                  className={`cursor-pointer transition-colors hover:text-white ${selectedWeekDay === index ? "text-purple-400 font-bold" : ""}`}
                >
                  {d.day}
                </button>
              ))}
            </div>

            {/* Float dynamic tooltip indicator */}
            <AnimatePresence>
              {selectedWeekDay !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-2 left-4 p-2 bg-[#09071c] border border-purple-500/30 rounded-lg text-left text-[10px] z-10"
                >
                  <p className="text-slate-400">{mockWeeklyData[selectedWeekDay].day} Study Minutes</p>
                  <p className="text-purple-400 font-black text-xs">{mockWeeklyData[selectedWeekDay].minutes} Mins</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWeekDay(null);
                    }}
                    className="text-[8px] text-slate-500 hover:text-white mt-1 cursor-pointer block font-bold"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subjects studied list */}
          <div className="pt-4 border-t border-white/5">
            <h5 className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Active Topic Fields:
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {quizStats.topicsCompleted.length > 0 ? (
                quizStats.topicsCompleted.map((topicName, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-bold text-white bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.1)]"
                  >
                    {topicName}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-slate-500 font-medium italic">No active topics found. Generate and complete a quiz below to see topics listed here.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        stats={{
          streak,
          quizAttempts: quizStats.attempts,
          completedMilestones: completedMilestonesCount,
          hasProfileName: userName !== "Guest Scholar",
          hasPremiumUnlock: hasPremiumUnlock
        }}
      />
    </div>
  );
}
