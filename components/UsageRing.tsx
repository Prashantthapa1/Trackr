/**
 * components/UsageRing.tsx
 *
 * Circular progress ring showing monthly expense count vs limit.
 */
"use client";

import type { UsageInfo } from "@/types";

interface UsageRingProps {
  usage: UsageInfo;
  plan: string;
}

export function UsageRing({ usage, plan }: UsageRingProps) {
  if (plan !== "FREE") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-green-500">∞</span>
        <span className="text-sm text-muted-foreground font-body">Unlimited</span>
      </div>
    );
  }

  const { count, limit, percentage } = usage;

  // Ring dimensions
  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(percentage, 100);
  const offset = circumference - (progress / 100) * circumference;

  // Color based on usage percentage
  let strokeColor = "stroke-green-500";
  let textColor = "text-foreground";
  let bgColor = "bg-green-100 dark:bg-green-900/30";

  if (percentage >= 90) {
    strokeColor = "stroke-red-500";
    textColor = "text-red-500";
    bgColor = "bg-red-100 dark:bg-red-900/30";
  } else if (percentage >= 70) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-500";
    bgColor = "bg-amber-100 dark:bg-amber-900/30";
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="-rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-gray-200 dark:stroke-zinc-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-500 ease-out ${strokeColor}`}
          />
        </svg>
        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${textColor}`}>{percentage}%</span>
        </div>
      </div>
      <div>
        <p className={`font-heading text-lg font-bold ${textColor}`}>
          {count} / {limit}
        </p>
        <p className="text-xs text-muted-foreground font-body">expenses</p>
      </div>
    </div>
  );
}
