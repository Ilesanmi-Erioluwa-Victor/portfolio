"use client";
import { useEffect, useState } from "react";

export default function Clock({ className = "" }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Lagos",
      }).format(new Date());
      setTime(now);
    };
    tick();
    const id = setInterval(tick, 1000 * 15);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return <span className={`clock txt ${className}`} id={className ? undefined : "clock"}>{time}</span>;
}