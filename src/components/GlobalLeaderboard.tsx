import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Users, Zap, Award, Search, Sparkles, RefreshCw, 
  HelpCircle, Star, ShieldAlert, ArrowUp, ArrowDown, User 
} from "lucide-react";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  level: number;
  xp: number;
  quizzesTaken: number;
  avgScore: number;
  isCurrentUser?: boolean;
  avatarSeed: string;
  status: "online" | "idle" | "studying";
}

interface GlobalLeaderboardProps {
  quizHistoryTrigger: number;
}

// Global announcements generator
const MOCK_ANNOUNCEMENTS = [
  { name: "Sofia Chen", action: "completed LLMs & Prompting Quiz", xp: 550, topic: "Prompt Design" },
  { name: "Liam Mitchell", action: "achieved a 7-day study streak", xp: 300, topic: "Consistency" },
  { name: "Elena Rostova", action: "mastered Autonomous Agents roadmap", xp: 450, topic: "LangChain" },
  { name: "Xavier Chen", action: "unlocked 'Grandmaster Verifier' badge", xp: 600, topic: "Credentials" },
  { name: "Marcus Aurelius", action: "finished PyTorch foundations checkup", xp: 400, topic: "Neural Nets" },
  { name: "Sarah Jenkins", action: "scored 100% on MLOps Quantization exam", xp: 500, topic: "Fine-Tuning" },
];

export default function GlobalLeaderboard({ quizHistoryTrigger }: GlobalLeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "top3" | "online">("all");
  const [currentUserXp, setCurrentUserXp] = useState(0);
  const [currentUserName, setCurrentUserName] = useState("Guest Scholar");
  const [userAttempts, setUserAttempts] = useState(0);
  const [userAvgScore, setUserAvgScore] = useState(0);
  const [activeAnnouncement, setActiveAnnouncement] = useState(MOCK_ANNOUNCEMENTS[0]);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [showXpTip, setShowXpTip] = useState(false);

  // Set up peer global scholars with standard static/dynamic XP baseline
  const [scholars, setScholars] = useState<LeaderboardUser[]>([
    {
      id: "sch_1",
      rank: 1,
      name: "Dr. Sofia Chen",
      level: 12,
      xp: 4850,
      quizzesTaken: 14,
      avgScore: 96,
      avatarSeed: "sofia",
      status: "online"
    },
    {
      id: "sch_2",
      rank: 2,
      name: "Xavier Chen",
      level: 10,
      xp: 3950,
      quizzesTaken: 11,
      avgScore: 92,
      avatarSeed: "xavier",
      status: "studying"
    },
    {
      id: "sch_3",
      rank: 3,
      name: "Elena Rostova",
      level: 9,
      xp: 3100,
      quizzesTaken: 8,
      avgScore: 95,
      avatarSeed: "elena",
      status: "online"
    },
    {
      id: "sch_4",
      rank: 4,
      name: "Liam Mitchell",
      level: 8,
      xp: 2650,
      quizzesTaken: 9,
      avgScore: 88,
      avatarSeed: "liam",
      status: "idle"
    },
    {
      id: "sch_5",
      rank: 5,
      name: "Marcus Aurelius",
      level: 7,
      xp: 1950,
      quizzesTaken: 6,
      avgScore: 85,
      avatarSeed: "marcus",
      status: "studying"
    }
  ]);

  // Load the current user's actual live statistics
  const loadUserLiveStats = () => {
    // Determine Name
    const savedUser = localStorage.getItem("academy_user");
    let name = "Guest Scholar";
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) name = u.name;
      } catch (e) {}
    }
    setCurrentUserName(name);

    // Compute XP from Quiz History
    const history = localStorage.getItem("academy_quiz_history");
    let calculatedXp = 0;
    let attemptsCount = 0;
    let avgScore = 0;

    if (history) {
      try {
        const h = JSON.parse(history);
        if (Array.isArray(h) && h.length > 0) {
          attemptsCount = h.length;
          // XP formula: 150 XP per correct answer + 100 XP per exam checklist completed
          let totalScorePercentage = 0;
          h.forEach((q: any) => {
            const correctAnswersCount = q.score;
            calculatedXp += (correctAnswersCount * 150) + 100;
            totalScorePercentage += (q.score / q.totalQuestions) * 100;
          });
          avgScore = Math.round(totalScorePercentage / attemptsCount);
        }
      } catch (e) {}
    }
    
    setCurrentUserXp(calculatedXp);
    setUserAttempts(attemptsCount);
    setUserAvgScore(avgScore);
  };

  useEffect(() => {
    loadUserLiveStats();
    // Refresh user stats periodically to keep them in perfect alignment with quiz triggers
    const timer = setInterval(loadUserLiveStats, 1500);
    return () => clearInterval(timer);
  }, [quizHistoryTrigger]);

  // Simulate active real-time updates from other scholars in the academy
  useEffect(() => {
    const xpGenerator = setInterval(() => {
      // Pick a random scholar (except the current user) to earn a small dynamic amount of XP
      const randomIndex = Math.floor(Math.random() * scholars.length);
      setScholars(prev => {
        return prev.map((s, idx) => {
          if (idx === randomIndex) {
            const gain = Math.random() > 0.5 ? 150 : 50; // quiz complete vs lesson tick
            const newXp = s.xp + gain;
            const extraQuizzes = gain === 150 ? 1 : 0;
            return {
              ...s,
              xp: newXp,
              quizzesTaken: s.quizzesTaken + extraQuizzes,
              // Micro fluctuation in average score
              avgScore: Math.min(100, Math.max(70, s.avgScore + (Math.random() > 0.5 ? 1 : -1)))
            };
          }
          return s;
        });
      });

      // Cycle background ticker announcements
      setAnnouncementIndex(prev => {
        const nextIdx = (prev + 1) % MOCK_ANNOUNCEMENTS.length;
        setActiveAnnouncement(MOCK_ANNOUNCEMENTS[nextIdx]);
        return nextIdx;
      });
    }, 6000);

    return () => clearInterval(xpGenerator);
  }, [scholars.length]);

  // Combine current user with our pre-populated global scholars and sort to compute final ranks
  const leaderboardList = useMemo(() => {
    const list: LeaderboardUser[] = [
      ...scholars,
      {
        id: "current_user",
        rank: 99, // default rank to be sorted
        name: `${currentUserName} (You)`,
        level: currentUserXp >= 3000 ? 5 : currentUserXp >= 1500 ? 3 : 1,
        xp: currentUserXp,
        quizzesTaken: userAttempts,
        avgScore: userAvgScore,
        isCurrentUser: true,
        avatarSeed: "current_user",
        status: "online"
      }
    ];

    // Sort by XP descending, and if equal, by quizzes completed
    list.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.quizzesTaken - a.quizzesTaken;
    });

    // Reassign ranks based on index
    return list.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [scholars, currentUserXp, currentUserName, userAttempts, userAvgScore]);

  // Apply search query filter & state categories
  const filteredLeaderboard = useMemo(() => {
    return leaderboardList.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedFilter === "top3") {
        return matchesSearch && user.rank <= 3;
      }
      if (selectedFilter === "online") {
        return matchesSearch && (user.status === "online" || user.status === "studying");
      }
      return matchesSearch;
    });
  }, [leaderboardList, searchQuery, selectedFilter]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-2xl relative overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.3)]">
      {/* Decorative radial gradients */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Leaderboard Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              Live Academic Federation
            </span>
          </div>
          <h3 className="text-xl font-black font-orbitron tracking-tight text-white mt-1 uppercase flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Global Scholar Leaderboard
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Compare XP margins with leading computational scholars. Earn points through correct checkup responses.
          </p>
        </div>

        {/* Live status feed */}
        <div className="flex items-center gap-2.5 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-2 rounded-2xl">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
          <div className="text-[10px] text-slate-300 font-semibold leading-none">
            <span className="text-cyan-400 uppercase tracking-widest font-black block text-[8px] mb-0.5">Real-time Updates</span>
            <span>Online Sync Active</span>
          </div>
        </div>
      </div>

      {/* Live Activity Ticker Tapes */}
      <div className="mb-6 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 overflow-hidden">
        <span className="text-[8px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
          Feed Activity
        </span>
        
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeAnnouncement.name + activeAnnouncement.action}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] text-slate-300 truncate"
            >
              <strong className="text-white font-bold">{activeAnnouncement.name}</strong>{" "}
              {activeAnnouncement.action} (
              <span className="text-cyan-400 font-bold">+{activeAnnouncement.xp} XP</span>) in{" "}
              <span className="text-purple-400 font-semibold italic">#{activeAnnouncement.topic}</span>
            </motion.p>
          </AnimatePresence>
        </div>
        
        <div className="text-[9px] text-slate-500 shrink-0 font-bold select-none">
          {announcementIndex + 1}/{MOCK_ANNOUNCEMENTS.length}
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search scholar name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.02] text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/40 focus:bg-white/[0.04] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 select-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all shrink-0 ${
              selectedFilter === "all"
                ? "bg-cyan-500 border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            All Scholars
          </button>
          <button
            onClick={() => setSelectedFilter("top3")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all shrink-0 ${
              selectedFilter === "top3"
                ? "bg-amber-500 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            ⭐ Podium (Top 3)
          </button>
          <button
            onClick={() => setSelectedFilter("online")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all shrink-0 ${
              selectedFilter === "online"
                ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            🟢 Active Now
          </button>
        </div>
      </div>

      {/* Leaderboard Grid / Table */}
      <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500 select-none">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">Scholar Profile</div>
          <div className="col-span-2 text-center">Quizzes</div>
          <div className="col-span-1 text-center">Avg</div>
          <div className="col-span-2 text-right">Comprehension XP</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/[0.03] select-none">
          {filteredLeaderboard.length > 0 ? (
            filteredLeaderboard.map((user) => (
              <div
                key={user.id}
                className={`grid grid-cols-12 gap-2 px-5 py-4 items-center transition-all duration-300 ${
                  user.isCurrentUser
                    ? "bg-cyan-500/10 border-y border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                {/* Rank indicator Column */}
                <div className="col-span-2 flex items-center justify-center">
                  {user.rank === 1 ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      1st
                    </div>
                  ) : user.rank === 2 ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 flex items-center justify-center text-slate-900 font-black text-xs shadow-[0_0_15px_rgba(203,213,225,0.4)]">
                      2nd
                    </div>
                  ) : user.rank === 3 ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(180,83,9,0.4)]">
                      3rd
                    </div>
                  ) : (
                    <span className="text-slate-400 font-mono text-sm font-extrabold">
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* Profile Name & Metadata Column */}
                <div className="col-span-5 flex items-center gap-3">
                  {/* Status Ring Avatar */}
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-black text-xs ${
                      user.isCurrentUser
                        ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-white border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        : "bg-white/5 border-white/5 text-slate-300"
                    }`}>
                      {user.isCurrentUser ? (
                        <User className="w-4 h-4" />
                      ) : (
                        user.name.split(" ").map(w => w[0]).join("")
                      )}
                    </div>
                    {/* Status dot */}
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#030214] ${
                      user.status === "online" 
                        ? "bg-emerald-400" 
                        : user.status === "studying" 
                        ? "bg-purple-400 animate-pulse" 
                        : "bg-amber-500"
                    }`} title={user.status} />
                  </div>

                  {/* Name Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black truncate leading-tight ${
                        user.isCurrentUser ? "text-cyan-400" : "text-white"
                      }`}>
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span className="text-[7px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded font-black uppercase tracking-wider shrink-0 animate-pulse">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      Scholar Level {user.level} • {user.status === "studying" ? "💻 Active Quiz Check" : "💤 Monitoring Code"}
                    </span>
                  </div>
                </div>

                {/* Quizzes Taken Column */}
                <div className="col-span-2 text-center text-xs font-mono font-bold text-slate-300">
                  {user.quizzesTaken}
                </div>

                {/* Average Score Column */}
                <div className="col-span-1 text-center text-xs font-mono font-bold text-slate-400">
                  {user.avgScore > 0 ? `${user.avgScore}%` : "—"}
                </div>

                {/* Total Computed XP Column */}
                <div className="col-span-2 text-right">
                  <div className={`text-sm font-black font-mono tracking-tight ${
                    user.isCurrentUser ? "text-cyan-400" : "text-white"
                  }`}>
                    {user.xp.toLocaleString()} XP
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                    COMPREHENSION
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-semibold">No scholars found matching your filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Information & Tooltip triggers */}
      <div className="mt-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2 text-slate-500 hover:text-slate-400 cursor-pointer transition-colors" onClick={() => setShowXpTip(!showXpTip)}>
          <HelpCircle className="w-4 h-4 text-cyan-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">How is my XP computed?</span>
        </div>

        <div className="text-[10px] text-slate-500 text-right select-none font-medium leading-tight">
          Keep answering checkups inside the <strong className="text-cyan-400">Exam Diagnostic Suite</strong> to claim the Rank #1 Podium!
        </div>
      </div>

      {/* Embedded slide-down explaining XP mechanics */}
      <AnimatePresence>
        {showXpTip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden border border-cyan-500/10 rounded-2xl bg-cyan-500/[0.02]"
          >
            <div className="p-4 space-y-3 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                COMPREHENSION SCORE ENGINE
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The Neonmorphic leaderboard ranks academic scholars purely on real comprehension XP logs. Whenever you complete an interactive exam checkup, points are logged according to the following protocol:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[10px]">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-cyan-400 font-extrabold block mb-0.5">Quiz Verification Attempt</span>
                  <span className="text-white font-bold block">+100 XP flat per attempt</span>
                  <span className="text-slate-500">Regardless of score achieved</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-emerald-400 font-extrabold block mb-0.5">Correct Answer Multiplier</span>
                  <span className="text-white font-bold block">+150 XP per correct response</span>
                  <span className="text-slate-500">Demonstrated comprehension bonus</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-purple-400 font-extrabold block mb-0.5">Podium Bonus Target</span>
                  <span className="text-white font-bold block">Consistently maintain 90%+</span>
                  <span className="text-slate-500">Unlocks gold scholar certifications</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
