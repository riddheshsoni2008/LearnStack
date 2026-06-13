"use client";
import React from "react";

export default function LearnStackLogo({
  variant = "default", // "default" | "monochrome" | "dark" | "favicon"
  size = 40,
  showText = false,
  className = "",
}) {
  // SVG gradient definitions
  const renderGradients = () => {
    if (variant === "monochrome") return null;
    return (
      <defs>
        <linearGradient id="logoGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary, #6c5ce7)" />
          <stop offset="100%" stopColor="var(--primary-light, #a29bfe)" />
        </linearGradient>
        <linearGradient id="logoGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent, #00cec9)" />
          <stop offset="100%" stopColor="var(--accent-light, #81ecec)" />
        </linearGradient>
        <linearGradient id="logoGradGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a29bfe" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#81ecec" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    );
  };

  // Renders the isometric tech stack representing growth, learning, and fullstack technology
  const renderIcon = () => {
    let fillTop = "url(#logoGradAccent)";
    let fillMiddle = "url(#logoGradPrimary)";
    let fillBottom = "rgba(108, 92, 231, 0.2)";
    let strokeColor = "rgba(255, 255, 255, 0.1)";

    if (variant === "monochrome") {
      fillTop = "#333333";
      fillMiddle = "#666666";
      fillBottom = "#cccccc";
      strokeColor = "none";
    } else if (variant === "dark") {
      fillTop = "#ffffff";
      fillMiddle = "rgba(255, 255, 255, 0.6)";
      fillBottom = "rgba(255, 255, 255, 0.2)";
      strokeColor = "rgba(0, 0, 0, 0.2)";
    }

    return (
      <g stroke={strokeColor} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
        {/* Bottom Layer - Large Database/Curriculum Base */}
        <path
          d="M25 36 L43 27 L25 18 L7 27 Z"
          fill={fillBottom}
          className="transition-all duration-300"
        />
        <path d="M7 27 L7 31 L25 40 L25 36 Z" fill={variant === "monochrome" ? "#999999" : "rgba(108, 92, 231, 0.3)"} />
        <path d="M25 36 L25 40 L43 31 L43 27 Z" fill={variant === "monochrome" ? "#888888" : "rgba(108, 92, 231, 0.4)"} />

        {/* Middle Layer - Application/Growth Level */}
        <path
          d="M25 24 L43 15 L25 6 L7 15 Z"
          fill={fillMiddle}
          transform="translate(0, -5)"
          className="transition-all duration-300"
        />
        <path d="M7 10 L7 14 L25 23 L25 19 Z" fill={variant === "monochrome" ? "#555555" : "var(--primary-dark, #4834d4)"} />
        <path d="M25 19 L25 23 L43 14 L43 10 Z" fill={variant === "monochrome" ? "#444444" : "var(--primary, #6c5ce7)"} />

        {/* Top Layer - Innovation/Certification Node (Ascending Arrow Cap) */}
        <path
          d="M25 12 L38 5 L25 -2 L12 5 Z"
          fill={fillTop}
          transform="translate(0, -10)"
          className="transition-all duration-300"
        />
        <path d="M12 -5 L12 -1 L25 6 L25 2 Z" fill={variant === "monochrome" ? "#222222" : "var(--accent-dark, #00b894)"} />
        <path d="M25 2 L25 6 L38 -1 L38 -5 Z" fill={variant === "monochrome" ? "#111111" : "var(--accent, #00cec9)"} />

        {/* Dynamic Sparkle/Node representing learning achievement (glowing core) */}
        {!showText && variant !== "monochrome" && (
          <circle cx="25" cy="-15" r="2" fill="#fff" className="animate-ping shadow-lg shadow-white" />
        )}
      </g>
    );
  };

  const viewBoxWidth = showText ? 160 : 50;
  const viewBoxHeight = 50;

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      style={{ height: size, width: showText ? "auto" : size }}
    >
      <svg
        viewBox={`0 -20 ${viewBoxWidth} ${viewBoxHeight + 20}`}
        width={showText ? undefined : size}
        height={size}
        className="overflow-visible"
      >
        {renderGradients()}
        {renderIcon()}

        {showText && (
          <text
            x="58"
            y="20"
            fontFamily="var(--font-inter, system-ui, sans-serif)"
            fontWeight="900"
            fontSize="18"
            letterSpacing="-0.03em"
            fill={variant === "dark" ? "#ffffff" : "var(--foreground, #ffffff)"}
          >
            Learn
            <tspan fill={variant === "monochrome" ? "#999" : "var(--accent, #00cec9)"}>
              Stack
            </tspan>
          </text>
        )}
      </svg>
    </div>
  );
}
