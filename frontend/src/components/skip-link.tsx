"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SkipLink() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey) {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <a
      href="#main-content"
      className={cn(
        "fixed top-0 left-0 z-50 p-4 m-4 bg-white border rounded shadow-lg transform -translate-y-full focus:translate-y-0 transition-transform duration-200",
        !isVisible && "sr-only"
      )}
    >
      メインコンテンツにスキップ
    </a>
  );
} 
