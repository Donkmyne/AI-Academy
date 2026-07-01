import { useState } from "react";
import { motion } from "motion/react";
import { Menu, X, User, LogOut } from "lucide-react";

interface HeaderProps {
  user: { name: string; email: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Header({ user, onLoginClick, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["Home", "Analytics", "Syllabus", "AI Tutor", "Practice Exams", "Pricing"];

  return (
    <header className="relative z-50 w-full px-6 py-6 md:px-12 md:py-8 flex items-center justify-between">
      {/* Brand Logo */}
      <div id="brand-logo" className="flex items-center">
        <a href="/" className="font-syncopate tracking-[0.2em] text-sm md:text-base font-bold flex items-center">
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">
            NEON
          </span>
          <span className="text-white">MORPHIC</span>
        </a>
      </div>

      {/* Desktop Navigation Links */}
      <nav id="desktop-nav" className="hidden md:flex items-center gap-6 lg:gap-10">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            className={`relative text-xs font-semibold tracking-wider text-slate-400 hover:text-white transition-colors duration-300 ${
              item === "AI Tutor" ? "text-purple-400 font-bold" : ""
            }`}
          >
            {item}
            {item === "Home" && (
              <motion.span
                layoutId="activeIndicator"
                className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </a>
        ))}
      </nav>

      {/* User Portal Trigger (Desktop) */}
      <div id="connect-wallet-desktop" className="hidden md:block">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Portal: <strong className="text-white">{user.name}</strong>
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="p-2.5 rounded-full border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoginClick}
            className="relative px-5 py-2 rounded-full border-2 border-purple-500 text-purple-300 hover:text-white font-semibold text-xs tracking-wider bg-transparent cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          >
            Student Portal
          </motion.button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        id="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 w-full bg-[#030214]/95 border-b border-white/10 p-6 flex flex-col gap-6 md:hidden z-40 backdrop-blur-xl"
        >
          <nav className="flex flex-col gap-4">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold tracking-wider text-slate-300 hover:text-white py-2 border-b border-white/5"
              >
                {item}
              </a>
            ))}
          </nav>
          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-sm text-slate-300 flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl">
                <User className="w-4 h-4 text-purple-400" />
                Logged in as <b>{user.name}</b>
              </span>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-full border border-red-500/30 text-red-400 font-semibold text-sm flex items-center justify-center gap-1 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onLoginClick();
                setMobileMenuOpen(false);
              }}
              className="w-full px-5 py-2.5 rounded-full border-2 border-purple-500 text-purple-300 font-semibold text-xs tracking-wider bg-transparent cursor-pointer"
            >
              Student Portal
            </button>
          )}
        </motion.div>
      )}
    </header>
  );
}
