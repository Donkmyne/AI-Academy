import { motion } from "motion/react";

export default function EthereumCard() {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0]
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold text-slate-400 tracking-wide uppercase font-sans">
        Today's Highest Bid
      </h3>
      <div
        id="highest-bid-card"
        className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#0a091d]/60 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] min-w-[280px] md:min-w-[320px] hover:border-pink-500/30 transition-all duration-300"
      >
        {/* Glowing Ethereum 3D Crystal Icon */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-slate-800/30 border border-white/5 overflow-hidden">
          {/* Internal Glow Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-md" />

          <motion.svg
            className="w-10 h-10 relative z-10"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            animate={{
              y: [0, -3, 0],
              rotateY: [0, 10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <defs>
              <linearGradient id="eth-top-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="eth-top-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="eth-bottom-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="eth-bottom-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Top Pyramid - Left Facet */}
            <path
              d="M 50,10 L 50,52 L 20,44 Z"
              fill="url(#eth-top-left)"
              opacity="0.85"
            />
            {/* Top Pyramid - Right Facet */}
            <path
              d="M 50,10 L 80,44 L 50,52 Z"
              fill="url(#eth-top-right)"
              opacity="0.95"
            />

            {/* Bottom Pyramid - Left Facet */}
            <path
              d="M 50,90 L 20,56 L 50,52 Z"
              fill="url(#eth-bottom-left)"
              opacity="0.9"
            />
            {/* Bottom Pyramid - Right Facet */}
            <path
              d="M 50,90 L 50,52 L 80,56 Z"
              fill="url(#eth-bottom-right)"
              opacity="0.8"
            />

            {/* Inner Core Accent */}
            <path
              d="M 50,52 L 20,44 L 50,40 Z"
              fill="#ffffff"
              opacity="0.15"
            />
            <path
              d="M 50,52 L 50,40 L 80,44 Z"
              fill="#ffffff"
              opacity="0.25"
            />
          </motion.svg>
        </div>

        {/* Bid details */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Current Bid
          </span>
          <span className="text-lg md:text-xl font-bold text-white tracking-wide mt-0.5">
            15.50 ETH{" "}
            <span className="text-sm font-semibold text-slate-400 ml-1">
              = 23932.31 USD
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
