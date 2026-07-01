import { useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import BackgroundVideo from "./components/BackgroundVideo";
import ParticleCanvas from "./components/ParticleCanvas";
import CountdownTimer from "./components/CountdownTimer";
import EthereumCard from "./components/EthereumCard";
import AuthModal from "./components/AuthModal";
import AiTutor from "./components/AiTutor";
import AiQuiz from "./components/AiQuiz";
import StudyRoadmap from "./components/StudyRoadmap";
import DashboardPreview from "./components/DashboardPreview";
import GlobalLeaderboard from "./components/GlobalLeaderboard";
import PaymentModal from "./components/PaymentModal";
import confetti from "canvas-confetti";
import { 
  Sparkles, Brain, Award, ShieldCheck, ChevronDown, Check, Zap, 
  HelpCircle, Star, ArrowUpRight, GraduationCap, ArrowRight, Github, Twitter, Linkedin,
  ArrowUp
} from "lucide-react";

// Predefined static data to maintain maximum performance & clean file layout
const STATS = [
  { value: "45K+", label: "Active Scholars", glowColor: "rgba(139,92,246,0.4)" },
  { value: "98.4%", label: "Quiz Pass Rate", glowColor: "rgba(168,85,247,0.4)" },
  { value: "1.2M+", label: "AI Explanations", glowColor: "rgba(124,58,237,0.4)" },
  { value: "120+", label: "Master Pathways", glowColor: "rgba(99,102,241,0.4)" }
];

const TRUSTED_LOGOS = [
  { name: "Google AI", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "OpenAI", url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" },
  { name: "NVIDIA", url: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg" },
  { name: "Stanford", url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Seal_of_Stanford_University.svg" }
];

const COURSES = [
  {
    title: "Advanced Generative AI & Prompt Architecture",
    category: "LLMs & Prompting",
    duration: "4 Weeks",
    difficulty: "Intermediate",
    rating: 4.9,
    reviews: 1240,
    price: "$49",
    tag: "Most Popular",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    title: "Deep Learning Foundations & PyTorch Mechanics",
    category: "Neural Networks",
    duration: "6 Weeks",
    difficulty: "Advanced",
    rating: 4.8,
    reviews: 890,
    price: "$79",
    tag: "Expert Led",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    title: "Autonomous Agents & LangChain Orchestration",
    category: "AI Agents",
    duration: "5 Weeks",
    difficulty: "Advanced",
    rating: 5.0,
    reviews: 430,
    price: "$99",
    tag: "Trending",
    gradient: "from-violet-600 to-indigo-600"
  },
  {
    title: "Fine-Tuning Techniques & Model Quantization",
    category: "MLOps",
    duration: "8 Weeks",
    difficulty: "Expert",
    rating: 4.7,
    reviews: 210,
    price: "$149",
    tag: "Hardcore",
    gradient: "from-indigo-500 to-violet-500"
  }
];

const HOW_IT_WORKS = [
  { step: "01", title: "Authenticate & Portal In", desc: "Create a glassmorphic account to initialize your persistent learning credentials." },
  { step: "02", title: "Architect Syllabus", desc: "Enter your target topic & select a focus. Our AI instantly compiles a checkable roadmap." },
  { step: "03", title: "Interact with AI Tutor", desc: "Ask custom queries and get rich Markdown explanations generated on the fly by Gemini." },
  { step: "04", title: "Verify with Quizzes", desc: "Take dynamically compiled diagnostic checkups to secure XP points and update stats." }
];

const TESTIMONIALS = [
  {
    quote: "The personalized study plan created for my smart-contracts learning path was incredible. I completed all milestones in 4 weeks and passed my developer interview flawlessly.",
    name: "Alex Rivera",
    role: "AI Lead, Cryptoverse",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    quote: "Having an AI Tutor that can break down complex neural net backpropagation visually has completely changed how I learn. It is like having a 1-on-1 PhD mentor in my browser 24/7.",
    name: "Dr. Sofia Chen",
    role: "ML Researcher",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  }
];

const PRICING = [
  {
    name: "Scholar Free",
    price: "$0",
    period: "forever",
    desc: "Test the frontiers of AI with basic interactive widgets.",
    features: [
      "Custom AI roadmap generation (1 per month)",
      "Daily 1-on-1 AI Tutor queries (5 per day)",
      "Basic diagnostic multiple-choice quizzes",
      "Persistent study state tracking"
    ],
    cta: "Start Free Path",
    popular: false,
    gradient: "border-white/10"
  },
  {
    name: "Neural Master Pro",
    price: "$29",
    period: "month",
    desc: "Unleash infinite master class generation powered by Gemini.",
    features: [
      "Unlimited custom AI roadmaps",
      "Infinite 1-on-1 AI Tutor consulting",
      "Advanced diagnostic quizzes with explanations",
      "Full live performance metrics dashboard",
      "Access to community cohort forums",
      "Verified course completion certs"
    ],
    cta: "Join Pro Portal",
    popular: true,
    gradient: "border-purple-500/50 shadow-[0_0_25px_rgba(139,92,246,0.25)]"
  },
  {
    name: "Enterprise Lab",
    price: "Custom",
    period: "org",
    desc: "Scale personalized tutoring for schools or developer teams.",
    features: [
      "Dedicated high-throughput model endpoints",
      "Custom system prompts for in-house SDKs",
      "Team-wide analytics dashboards",
      "SLA support and integration specialists",
      "Custom LMS/LTI integrations"
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "border-white/10"
  }
];

const FAQS = [
  { q: "How are the quizzes and roadmaps generated?", a: "Every single quiz, study plan, and explanation is built on the fly using Gemini 3.5 Flash through structured JSON modes. We compile current academic practices to output reliable, high-fidelity questions and structured milestone steps." },
  { q: "Can I persist my study progress and scores?", a: "Yes! Your progress, milestones, quiz histories, and active hours are saved securely in your browser's localStorage. If you log in with your name, your portal state persists across restarts perfectly." },
  { q: "Is there a real-time speech feature planned?", a: "Yes! Utilizing Gemini Live APIs, we are currently beta-testing high-velocity 1-on-1 voice tutoring modules which will launch in our next cohort." },
  { q: "Do you offer certificates upon completion?", a: "Indeed. Completing all milestones on a personalized roadmap grants a verified Neonmorphic Academy smart certificate encoded on the blockchain." }
];

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // User Authenticated State
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quizHistoryTrigger, setQuizHistoryTrigger] = useState(0);

  // FAQ accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Active course filter
  const [courseFilter, setCourseFilter] = useState("All");

  // Stripe & Payment Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<{ name: string; price: string | number; type: "course" | "subscription" } | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("academy_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // ignore
      }
    }

    // Load purchased items
    const savedPurchased = localStorage.getItem("academy_purchased_items");
    if (savedPurchased) {
      try {
        setPurchasedItems(JSON.parse(savedPurchased));
      } catch (e) {}
    }

    // Check Stripe return URL parameters
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const paidItem = params.get("item");

    if (paymentStatus === "success" && paidItem) {
      const items = JSON.parse(localStorage.getItem("academy_purchased_items") || "[]");
      if (!items.includes(paidItem)) {
        items.push(paidItem);
        localStorage.setItem("academy_purchased_items", JSON.stringify(items));
        setPurchasedItems(items);
      }

      // Smooth trigger confetti celebration
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"]
        });
      }, 500);

      // Clean parameters from url bar to keep the workspace URL clean
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePaymentSuccess = (itemName: string) => {
    const items = JSON.parse(localStorage.getItem("academy_purchased_items") || "[]");
    if (!items.includes(itemName)) {
      items.push(itemName);
      localStorage.setItem("academy_purchased_items", JSON.stringify(items));
    }
    setPurchasedItems(items);
    // Also trigger reload in dashboard to update metrics
    setQuizHistoryTrigger(prev => prev + 1);
  };

  // Back to Top button visibility state & handler
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("academy_user");
    setUser(null);
  };

  const handleQuizComplete = (score: number, totalQuestions: number, topic: string) => {
    const history = localStorage.getItem("academy_quiz_history") || "[]";
    try {
      const h = JSON.parse(history);
      h.push({ score, totalQuestions, topic, date: new Date().toISOString() });
      localStorage.setItem("academy_quiz_history", JSON.stringify(h));
      // Trigger reload in Dashboard Preview
      setQuizHistoryTrigger(prev => prev + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ["All", "LLMs & Prompting", "Neural Networks", "AI Agents", "MLOps"];

  return (
    <div className="relative min-h-screen w-full bg-[#030214] text-white flex flex-col justify-between overflow-x-hidden font-sans select-none scroll-smooth">
      {/* Fixed Full Screen Background Video */}
      <BackgroundVideo />

      {/* Scroll Progress Bar */}
      <motion.div
        id="scroll-progress-bar"
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 origin-left z-[100] shadow-[0_0_12px_rgba(139,92,246,0.8),0_0_20px_rgba(168,85,247,0.4)]"
        style={{ scaleX }}
      />

      {/* Header Navigation with reactive User state */}
      <Header user={user} onLoginClick={() => setAuthModalOpen(true)} onLogout={handleLogout} />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        
        {/* HERO SECTION */}
        <section id="home" className="relative w-full overflow-hidden border-b border-white/5">
          <ParticleCanvas />
          <div className="relative z-10 px-6 md:px-12 lg:px-20 py-16 md:py-24 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content Column */}
            <motion.div
              animate={{
                y: [0, -6, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="lg:col-span-8 flex flex-col items-start justify-center"
            >
              {/* "AI LEARNING SYSTEM" Subtitle */}
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-orbitron font-bold tracking-[0.4em] text-[10px] sm:text-xs md:text-sm text-purple-400 uppercase mb-3 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
              >
                Adaptive AI Syllabus Engine
              </motion.span>

              {/* Glowing Hero Title */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-orbitron font-black tracking-[0.05em] text-2xl sm:text-4xl md:text-5xl xl:text-6xl text-white uppercase select-none leading-[1.05] mb-6"
              >
                THE FUTURE <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                  OF EDUCATION
                </span>
              </motion.h1>

              {/* Paragraph Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed mb-8 text-left"
              >
                Master neural network structures, prompt engineering, and LLM fine-tuning. 
                Our platform uses secure server-side Gemini intelligence to generate checkable 
                weekly roadmaps, 1-on-1 tutor explanations, and interactive diagnostic quizzes.
              </motion.p>

              {/* Call to Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center gap-4 sm:gap-6 flex-wrap"
              >
                {/* Explore Button */}
                <motion.a
                  href="#syllabus"
                  whileHover={{ scale: 1.04, boxShadow: "0 0 25px rgba(139, 92, 246, 0.6)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 border-2 border-purple-500 hover:border-purple-400 text-white font-bold tracking-widest rounded-full bg-slate-900/40 backdrop-blur-sm cursor-pointer transition-all duration-300 text-xs font-orbitron uppercase"
                >
                  Architect Syllabus
                </motion.a>

                {/* Launch AI Tutor */}
                <motion.a
                  href="#ai-tutor"
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors duration-300 tracking-wider text-xs md:text-sm group font-sans cursor-pointer"
                >
                  <span>Consult AI Tutor</span>
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Hero Right Column: Kept as beautiful background spacing */}
            <div className="hidden lg:col-span-4" />
          </div>
        </div>
      </section>

        {/* TRUSTED BY & STATS */}
        <section className="border-y border-white/5 bg-white/[0.01] backdrop-blur-sm py-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Logos */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
                Scholars currently studying from:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
                {TRUSTED_LOGOS.map((logo, idx) => (
                  <span key={idx} className="text-sm font-orbitron font-extrabold text-white tracking-widest">
                    {logo.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Glowing stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/5">
              {STATS.map((stat, idx) => (
                <div key={idx} className="text-center p-4">
                  <div
                    className="text-3xl md:text-4xl lg:text-5xl font-black font-orbitron tracking-tight text-white"
                    style={{ textShadow: `0 0 15px ${stat.glowColor}` }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENTO GRID KEY FEATURES */}
        <section id="key-features" className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto w-full space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Cutting-Edge Features</span>
            <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">The Bento Learning Kit</h2>
            <p className="text-xs md:text-sm text-slate-400">Everything a future AI scientist needs, backed by real-time neural diagnostics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl w-fit mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gemini Study Architect</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Instantly convert any obscure learning interest into a logical, week-by-week curriculum with checkable progress state.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl w-fit mb-6">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1-on-1 AI Tutor Sessions</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Stuck on a neural feedback calculation? Input it directly and watch our tutor stream clear, beautifully formatted Markdown explanations.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Diagnostic Quiz Suite</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">No mock data. Gemini builds real multi-choice exam diagnostic checkups, giving you immediate scores, scorecards, and in-depth explanations.</p>
            </div>
          </div>
        </section>

        {/* LEARNING DASHBOARD & SMART ANALYTICS PREVIEW */}
        <section id="analytics" className="px-6 md:px-12 lg:px-20 py-16 bg-transparent border-t border-white/5 w-full">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Secure Scholar State</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Active Analytics Console</h2>
              <p className="text-xs md:text-sm text-slate-400">Your points, XP, and weekly active minutes populate in real time as you complete quizzes.</p>
            </div>

            <DashboardPreview quizHistoryTrigger={quizHistoryTrigger} />
            <GlobalLeaderboard quizHistoryTrigger={quizHistoryTrigger} />
          </div>
        </section>

        {/* STUDY ARCHITECT (ROADMAP GENERATOR) */}
        <section id="syllabus" className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 w-full">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-rose-500 tracking-widest uppercase">Self-Guided Blueprint</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Syllabus Architect</h2>
              <p className="text-xs md:text-sm text-slate-400">Design your master path. Check milestones to level up your scholar profile.</p>
            </div>

            <StudyRoadmap />
          </div>
        </section>

        {/* AI TUTOR / LESSON HELPER */}
        <section id="ai-tutor" className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 bg-transparent w-full">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-pink-500 tracking-widest uppercase">Interactive Consultant</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">AI 1-on-1 Consultant</h2>
              <p className="text-xs md:text-sm text-slate-400">Consult on complex algorithms, equations, or development stack practices.</p>
            </div>

            <AiTutor />
          </div>
        </section>

        {/* DIAGNOSTIC QUIZ GENERATOR */}
        <section id="practice-exams" className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 w-full">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Knowledge Check</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Exam Diagnostic Suite</h2>
              <p className="text-xs md:text-sm text-slate-400">Secure immediate feedback. All results feed directly into your live dashboard.</p>
            </div>

            <AiQuiz onQuizComplete={handleQuizComplete} />
          </div>
        </section>

        {/* POPULAR COURSES SECTION */}
        <section id="popular-courses" className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 bg-transparent w-full">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <span className="text-xs font-bold text-pink-500 tracking-widest uppercase">Pre-curated Core Syllabus</span>
                <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Standard Masterpaths</h2>
              </div>

              {/* Course Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCourseFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border cursor-pointer transition-all ${
                      courseFilter === cat
                        ? "bg-pink-500 border-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {COURSES.filter(c => courseFilter === "All" || c.category === courseFilter).map((course, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8, border: "rgba(255,255,255,0.2)" }}
                  className="rounded-2xl border border-white/5 bg-[#030214]/80 p-5 flex flex-col justify-between relative overflow-hidden group transition-all"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${course.gradient}`} />
                  
                  {/* Category & Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{course.category}</span>
                    <span className="text-[9px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">{course.tag}</span>
                  </div>

                  <h4 className="text-sm md:text-base font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                    {course.title}
                  </h4>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Duration</span>
                      <span className="text-slate-300 font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Difficulty</span>
                      <span className="text-slate-300 font-semibold">{course.difficulty}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Rating</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-pink-500 stroke-none" /> {course.rating}
                      </span>
                    </div>
                    
                    {/* Price & CTA */}
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="text-base font-black text-white">
                        {purchasedItems.includes(course.title) ? (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            Unlocked
                          </span>
                        ) : (
                          course.price
                        )}
                      </span>
                      <button
                        onClick={() => {
                          if (purchasedItems.includes(course.title)) {
                            // Prefill study planner with course subject name and scroll
                            const roadmapSection = document.getElementById("syllabus");
                            if (roadmapSection) {
                              roadmapSection.scrollIntoView({ behavior: "smooth" });
                            }
                          } else {
                            setSelectedPaymentItem({
                              name: course.title,
                              price: course.price,
                              type: "course"
                            });
                            setPaymentModalOpen(true);
                          }
                        }}
                        className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                          purchasedItems.includes(course.title)
                            ? "text-emerald-400 hover:text-emerald-300"
                            : "text-pink-400 hover:text-white"
                        }`}
                      >
                        {purchasedItems.includes(course.title) ? (
                          <>Study Path <ArrowRight className="w-3 h-3" /></>
                        ) : (
                          <>Enroll Path <ArrowUpRight className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 w-full">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Academic Workflow</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Onboarding Sequence</h2>
              <p className="text-xs md:text-sm text-slate-400">Step onto the path. Claim total mastery in four simple execution steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {HOW_IT_WORKS.map((item, idx) => (
                <div key={idx} className="relative space-y-4">
                  <div className="text-4xl md:text-5xl font-black font-orbitron bg-gradient-to-b from-pink-500/30 to-transparent bg-clip-text text-transparent mb-1">
                    {item.step}
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STUDENT TESTIMONIALS */}
        <section className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 bg-transparent w-full">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-rose-400 tracking-widest uppercase">Scholar Feedback</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Approved Scholar Reviews</h2>
              <p className="text-xs md:text-sm text-slate-400">Direct reports from software engineers and computational researchers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col justify-between gap-6 relative">
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} referrerPolicy="no-referrer" className="w-11 h-11 rounded-full object-cover border border-white/10" />
                    <div>
                      <h5 className="text-sm font-bold text-white">{t.name}</h5>
                      <p className="text-xs text-slate-500 font-semibold">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING PLANS */}
        <section id="pricing" className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 w-full">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-pink-500 tracking-widest uppercase">Predictable Models</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Portal Membership Tiers</h2>
              <p className="text-xs md:text-sm text-slate-400">Claim absolute consulting privileges with our customized pricing options.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {PRICING.map((plan, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8 }}
                  className={`p-8 rounded-3xl border bg-white/[0.01] flex flex-col justify-between relative ${plan.gradient} transition-all`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 right-6 px-4 py-1.5 rounded-full bg-pink-500 text-white text-[10px] font-extrabold tracking-widest uppercase shadow-[0_0_12px_rgba(236,72,153,0.8)]">
                      Highly Recommended
                    </span>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                    <p className="text-xs text-slate-400">{plan.desc}</p>
                    
                    <div className="py-4 border-y border-white/5">
                      <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-bold uppercase ml-1">/ {plan.period}</span>
                    </div>

                    <ul className="space-y-3 pt-2">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (plan.price === "$0") {
                        // Free plan is always available
                        return;
                      }
                      
                      if (purchasedItems.includes(plan.name)) {
                        confetti({
                          particleCount: 50,
                          spread: 40,
                          origin: { y: 0.8 }
                        });
                        return;
                      }

                      if (!user) {
                        setAuthModalOpen(true);
                      } else {
                        setSelectedPaymentItem({
                          name: plan.name,
                          price: plan.price,
                          type: "subscription"
                        });
                        setPaymentModalOpen(true);
                      }
                    }}
                    className={`w-full mt-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer text-center transition-all ${
                      plan.price === "$0"
                        ? "bg-white/[0.04] text-slate-400 cursor-default"
                        : purchasedItems.includes(plan.name)
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : plan.popular
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-95 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                        : "bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {plan.price === "$0"
                      ? "Free Access Unlocked"
                      : purchasedItems.includes(plan.name)
                      ? "Active Pro Portal"
                      : plan.cta}
                  </button>

                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 bg-transparent w-full">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Support Center</span>
              <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-tight">Frequently Asked Doubts</h2>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Clear diagnostics on our models, data safety, and syllabus structures.</p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="rounded-2xl border border-white/5 bg-[#030214]/60 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer hover:bg-white/[0.01] transition-all"
                    >
                      <span className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4.5 h-4.5 text-pink-500 shrink-0" />
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-pink-500" : ""}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="border-t border-white/5 bg-white/[0.01]"
                        >
                          <div className="p-6 text-xs md:text-sm text-slate-400 leading-relaxed font-sans select-text">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL NEON CTA */}
        <section className="px-6 md:px-12 lg:px-20 py-20 border-t border-white/5 w-full relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center space-y-8 relative">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 bg-pink-500/10 px-4 py-2 rounded-full border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)] uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 animate-bounce" /> Portal Launch Access
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-orbitron text-white uppercase tracking-tight leading-[1.1]">
              BEGIN YOUR NEONMORPHIC <br />
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]">
                LEARNING ODYSSEY
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Create an account now to claim your first checkable roadmap and gain unrestricted access to our 1-on-1 AI Tutor consulting panels.
            </p>

            <div className="flex justify-center items-center gap-4 flex-wrap pt-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(236,72,153,0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAuthModalOpen(true)}
                className="px-8 py-4.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg"
              >
                Launch Portal Now <GraduationCap className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </section>

      </div>

      {/* COMPREHENSIVE FOOTER WITH ORIGINAL CARDS (Bid Card & Countdown Timer) */}
      <footer className="relative z-10 border-t border-white/5 bg-transparent px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Top segment: Left holds Brand/Links, Right holds Interactive assets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Brand overview & Directory links */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center">
                <a href="/" className="font-syncopate tracking-[0.2em] text-lg md:text-xl font-bold flex items-center">
                  <span className="bg-gradient-to-r from-pink-500 via-magenta-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]">
                    NEON
                  </span>
                  <span className="text-white">MORPHIC</span>
                </a>
              </div>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Neonmorphic is an AI-powered diagnostic training academy. We synthesize personalized, week-by-week learning roadmaps, interactive diagnostic checkup exams, and 1-on-1 PhD level tutoring models on demand.
              </p>

              {/* Directory Links */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Features</h5>
                  <ul className="space-y-1.5 text-[11px] text-slate-500 font-semibold">
                    <li><a href="#syllabus" className="hover:text-pink-500 transition-colors">Syllabus Engine</a></li>
                    <li><a href="#ai-tutor" className="hover:text-pink-500 transition-colors">1-on-1 AI Tutor</a></li>
                    <li><a href="#practice-exams" className="hover:text-pink-500 transition-colors">Diagnostic Exam</a></li>
                    <li><a href="#analytics" className="hover:text-pink-500 transition-colors">Live Scorecard</a></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h5>
                  <ul className="space-y-1.5 text-[11px] text-slate-500 font-semibold">
                    <li><a href="#popular-courses" className="hover:text-pink-500 transition-colors">Standard Courses</a></li>
                    <li><a href="#pricing" className="hover:text-pink-500 transition-colors">Pricing Tiers</a></li>
                    <li><a href="#" className="hover:text-pink-500 transition-colors">Developer API</a></li>
                    <li><a href="#" className="hover:text-pink-500 transition-colors">AI Whitepaper</a></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Connect</h5>
                  <div className="flex gap-3 pt-1">
                    <a href="#" className="text-slate-500 hover:text-white transition-colors" title="Twitter">
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a href="#" className="text-slate-500 hover:text-white transition-colors" title="Github">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href="#" className="text-slate-500 hover:text-white transition-colors" title="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Original Interactive Elements (Highest Bid on left, Countdown on right) */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-end justify-end gap-6 md:gap-8 w-full">
              {/* Today's Highest Bid Card (Now customized to Course NFT Credential) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="w-full sm:w-auto"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-pink-500" /> Syllabus NFT Credential
                </div>
                <EthereumCard />
              </motion.div>

              {/* Interactive Countdown Timer (Next AI Cohort Orientation Starts In) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="w-full sm:w-auto"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Next Scholar Cohort
                </div>
                <CountdownTimer />
              </motion.div>
            </div>

          </div>

          {/* Bottom Copyright segment */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
            <span>© 2026 Neonmorphic AI Learning Academy. All rights reserved.</span>
            <span>Synthesized under Google AI Studio Build</span>
          </div>

        </div>
      </footer>

      {/* User Auth Portal Dialog modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Stripe Payment Gateway and Simulator Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedPaymentItem(null);
        }}
        item={selectedPaymentItem}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Back to Top floating glassmorphic button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            id="back-to-top-btn"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[90] p-4 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl text-purple-400 hover:text-white shadow-[0_8px_32px_0_rgba(139,92,246,0.15)] hover:shadow-[0_8px_32px_0_rgba(139,92,246,0.3)] hover:border-purple-500/30 transition-all duration-300 group cursor-pointer"
            aria-label="Back to top"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
