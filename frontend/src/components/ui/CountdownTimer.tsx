"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  endsAt: string;
}

export default function CountdownTimer({ endsAt }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ hours: string, minutes: string, seconds: string }>({
    hours: "00", minutes: "00", seconds: "00"
  });

  useEffect(() => {
    const target = new Date(endsAt).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0")
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1 text-[var(--text-secondary)] text-sm font-medium">
      <Clock size={16} />
      <span>{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds} Left</span>
    </div>
  );
}
