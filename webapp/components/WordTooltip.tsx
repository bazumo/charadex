"use client";

import { useState } from "react";

interface WordTooltipProps {
  word: string;
  meaning: string;
  pinyin: string;
}

export default function WordTooltip({ word, meaning, pinyin }: WordTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="cursor-pointer border-b-2 border-dotted border-gray-400 dark:border-gray-600 hover:border-black dark:hover:border-white transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {word}
      </span>

      {/* Tooltip */}
      {isHovered && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-black dark:bg-white text-white dark:text-black text-sm rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
          <div className="font-medium">{pinyin}</div>
          <div className="text-xs opacity-90">{meaning}</div>
          {/* Arrow */}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black dark:border-t-white"></span>
        </span>
      )}
    </span>
  );
}
