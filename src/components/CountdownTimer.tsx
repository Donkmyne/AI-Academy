import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  // We want to target a date that is approximately 12 days, 3 hours, 11 minutes, and 43 seconds from now
  // on first mount, or a persistent future target date so it ticks down realistically.
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 12,
    hours: 3,
    minutes: 11,
    seconds: 43,
  });

  useEffect(() => {
    // Define a target time: 12 days, 3 hours, 11 minutes, 43 seconds from first mount
    const totalSeconds =
      12 * 24 * 60 * 60 + 3 * 60 * 60 + 11 * 60 + 43;
    const targetTimestamp = Date.now() + totalSeconds * 1000;

    const interval = setInterval(() => {
      const difference = targetTimestamp - Date.now();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeBlocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div id="countdown-container" className="flex items-center gap-3 md:gap-4">
      {timeBlocks.map((block, index) => (
        <div
          key={index}
          id={`time-block-${block.label.toLowerCase()}`}
          className="flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#0a091d]/60 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-blue-500/30 transition-all duration-300"
        >
          <span className="text-2xl md:text-3xl font-bold text-white tracking-tight font-orbitron">
            {block.value.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wider mt-1 uppercase">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}
