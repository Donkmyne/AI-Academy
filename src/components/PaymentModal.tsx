import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Zap, Sparkles, CreditCard, ArrowRight, CheckCircle2, Copy } from "lucide-react";
import confetti from "canvas-confetti";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    price: string | number;
    type: "course" | "subscription";
  } | null;
  onPaymentSuccess: (itemName: string) => void;
}

export default function PaymentModal({ isOpen, onClose, item, onPaymentSuccess }: PaymentModalProps) {
  const [stripeConfig, setStripeConfig] = useState<{ hasSecretKey: boolean; publishableKey: string }>({
    hasSecretKey: false,
    publishableKey: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"checkout" | "loading" | "success">("checkout");
  const [loadingText, setLoadingText] = useState("Initializing transaction...");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("checkout");
      setIsLoading(false);
      // Fetch Stripe Config
      fetch("/api/stripe/config")
        .then((res) => res.json())
        .then((data) => {
          setStripeConfig(data);
        })
        .catch((err) => console.error("Error fetching Stripe configuration:", err));
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRealStripePayment = async () => {
    setIsLoading(true);
    setStep("loading");
    setLoadingText("Connecting to Secure Stripe Gateway...");

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: item.name,
          itemPrice: item.price,
          itemType: item.type
        })
      });

      const data = await response.json();
      if (data.url) {
        setLoadingText("Redirecting to secure payment page...");
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Stripe Error: ${err.message || "Could not launch checkout. Falling back to simulator."}`);
      setIsLoading(false);
      setStep("checkout");
    }
  };

  const handleSimulatedPayment = () => {
    setIsLoading(true);
    setStep("loading");

    const steps = [
      { text: "Establishing secure SSL connection...", delay: 600 },
      { text: "Tokenizing placeholder account credentials...", delay: 1400 },
      { text: "Validating dummy payment liquidity...", delay: 2200 },
      { text: "Authorizing premium Neonmorphic access grant...", delay: 3000 }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setLoadingText(s.text);
      }, s.delay);
    });

    setTimeout(() => {
      // Complete simulated payment
      setIsLoading(false);
      setStep("success");
      
      // Save purchased state
      const purchased = JSON.parse(localStorage.getItem("academy_purchased_items") || "[]");
      if (!purchased.includes(item.name)) {
        purchased.push(item.name);
        localStorage.setItem("academy_purchased_items", JSON.stringify(purchased));
      }

      onPaymentSuccess(item.name);

      // Fire off awesome confetti celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"]
      });
    }, 3800);
  };

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
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0a081e]/90 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(139,92,246,0.3)] backdrop-blur-2xl z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {item.type === "subscription" ? "Subscription Portal" : "Syllabus Enrollment"}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === "checkout" && (
            <div className="space-y-6">
              {/* Product Info Summary */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-lg text-white group-hover:text-pink-400 transition-colors leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.type === "subscription" ? "Recurring Master Membership" : "Premium Standard Course Syllabus"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{item.price}</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{item.type === "subscription" ? "/ month" : "one-time"}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Payments</span>
                  <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-400" /> Instant Access</span>
                </div>
              </div>

              {/* API Key Status Info Block */}
              {stripeConfig.hasSecretKey ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 text-xs text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-400">Stripe Integration Live</span>
                      <p className="text-slate-400 mt-0.5">Your application has detected a valid Stripe secret key. Click below to checkout securely.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleRealStripePayment}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-extrabold text-xs uppercase tracking-widest hover:opacity-95 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" /> Proceed to Secure Stripe Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-3">
                    <div className="flex gap-2.5 items-center">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="font-black text-amber-400 uppercase tracking-wider text-[10px]">Stripe Developer Mode</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      To activate real payments, set up your credentials by defining them in <strong className="text-white">Settings &gt; Secrets</strong> or adding them in your container's environment variables:
                    </p>
                    <div className="space-y-2 font-mono text-[11px] bg-[#02010c] p-3 rounded-lg border border-white/5 select-all">
                      <div className="flex justify-between items-center text-slate-500">
                        <span># Backend Secret Key</span>
                        <button 
                          onClick={() => copyToClipboard("STRIPE_SECRET_KEY", "secret")}
                          className="text-[10px] hover:text-white flex items-center gap-1 font-sans cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> {copiedKey === "secret" ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="text-purple-400">STRIPE_SECRET_KEY=sk_test_...</div>
                      
                      <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-white/5">
                        <span># Frontend Publishable Key</span>
                        <button 
                          onClick={() => copyToClipboard("VITE_STRIPE_PUBLISHABLE_KEY", "pub")}
                          className="text-[10px] hover:text-white flex items-center gap-1 font-sans cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> {copiedKey === "pub" ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="text-pink-400">VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleSimulatedPayment}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-widest hover:opacity-95 shadow-[0_0_15px_rgba(236,72,153,0.25)] transition-all cursor-pointer text-center"
                    >
                      Simulate Payment (Demo)
                    </button>
                    <button
                      onClick={handleRealStripePayment}
                      disabled={true}
                      className="w-full py-4 rounded-xl bg-white/[0.02] border border-white/5 text-slate-500 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest cursor-not-allowed text-center"
                      title="Please set up STRIPE_SECRET_KEY first"
                    >
                      Stripe Locked
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "loading" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-pink-500 animate-spin" />
                <div className="absolute inset-1.5 rounded-full border-b-2 border-purple-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h5 className="font-bold text-sm tracking-wide text-white">Securing Transaction</h5>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed animate-pulse">{loadingText}</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </motion.div>

              <div className="space-y-2">
                <h4 className="font-black font-orbitron text-xl text-white">TRANSACTION CONFIRMED</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Excellent choice! The secure academy system has enrolled your profile. Your study milestones, AI endpoints, and tutor diagnostics have been unlocked for:
                </p>
                <div className="px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 font-bold text-sm text-purple-400 inline-block mt-2">
                  {item.name}
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest hover:text-white transition-all cursor-pointer"
              >
                Launch Learning Desk
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
