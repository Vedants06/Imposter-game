import React, { memo } from "react"

export const AuroraText = memo(({
  children,
  className = "",
  colors = [
  "#7c3aed",  // violet
  "#6366f1",  // indigo
  "#3b82f6",  // blue
  "#06b6d4",  // cyan
  "#14b8a6",  // teal
  "#8b5cf6",  // soft purple
  "#7c3aed",  // loop
],
  speed = 1
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${
      colors[0]
    })`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration: `${10 / speed}s`,
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      <span
       className="animate-aurora relative bg-[length:200%_200%] bg-clip-text text-transparent"
       style={gradientStyle}
        aria-hidden="true">
        {children}
      </span>
    </span>
  );
})

AuroraText.displayName = "AuroraText"
