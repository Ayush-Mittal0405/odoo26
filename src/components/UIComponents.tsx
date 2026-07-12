"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle, Info } from "lucide-react";

// ─── Module Accent Map ──────────────────────────────────────────────────────
// rawColor is used for inline SVG/Recharts since Tailwind can't scan dynamic classes
export const MODULE_ACCENTS = {
  E: {
    border: "border-l-[3px] border-accent-e",
    text: "text-accent-e",
    bg: "bg-accent-e/10",
    rawColor: "#2E7D32",          // deep nature green
    rawColorLight: "#4CAF50",     // fresh leaf green (hover / chart)
    shadowColor: "rgba(46,125,50,0.08)",
  },
  S: {
    border: "border-l-[3px] border-accent-s",
    text: "text-accent-s",
    bg: "bg-accent-s/10",
    rawColor: "#3E8E7E",          // muted teal-green
    rawColorLight: "#4DB6AC",
    shadowColor: "rgba(62,142,126,0.08)",
  },
  G: {
    border: "border-l-[3px] border-accent-g",
    text: "text-accent-g",
    bg: "bg-accent-g/10",
    rawColor: "#6A1B9A",          // royal purple
    rawColorLight: "#9C27B0",     // soft lavender/orchid
    shadowColor: "rgba(106,27,154,0.08)",
  },
  Gamification: {
    border: "border-l-[3px] border-accent-game",
    text: "text-accent-game",
    bg: "bg-accent-game/10",
    rawColor: "#C98A2C",          // warm amber/gold
    rawColorLight: "#E0A840",
    shadowColor: "rgba(201,138,44,0.08)",
  },
  System: {
    border: "border-l-[3px] border-text-muted",
    text: "text-text-muted",
    bg: "bg-bg-raised",
    rawColor: "#6B7A6E",          // sage-grey
    rawColorLight: "#8B9A8D",
    shadowColor: "rgba(107,122,110,0.08)",
  },
  None: {
    border: "border-l-0",
    text: "text-text-primary",
    bg: "bg-bg-surface",
    rawColor: "#1B2A1F",
    rawColorLight: "#2E7D32",
    shadowColor: "rgba(46,125,50,0.06)",
  },
};

// ─── 1. Asymmetric Leaf-shaped Card ─────────────────────────────────────────
export const AsymmetricCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  module?: keyof typeof MODULE_ACCENTS;
  onClick?: () => void;
  hoverLift?: boolean;
  style?: React.CSSProperties;
}> = ({ children, className = "", module = "None", onClick, hoverLift = true, style }) => {
  const accent = MODULE_ACCENTS[module];

  return (
    <div
      onClick={onClick}
      className={`
        leaf-card bg-bg-surface border border-border-hairline p-5 relative overflow-hidden
        ${accent.border}
        ${onClick ? "cursor-pointer select-none" : ""}
        ${hoverLift ? "card-lift" : ""}
        ${className}
      `}
      style={{
        boxShadow: "0 1px 3px rgba(46,125,50,0.06), 0 1px 2px rgba(27,42,31,0.04)",
        ...style
      }}
    >
      {children}
    </div>
  );
};

// ─── 2. Growth Ring Gauge ────────────────────────────────────────────────────
// Light theme: ring tracks in --bg-tint (#F4FFF4), fills in module accents
export const GrowthRingGauge: React.FC<{
  value: number;
  label: string;
  module?: keyof typeof MODULE_ACCENTS;
  size?: number;
  subLabel?: string;
  multiValues?: { E: number; S: number; G: number; Overall: number };
}> = ({ value, label, module = "None", size = 150, subLabel = "Points", multiValues }) => {
  const accentColor = MODULE_ACCENTS[module].rawColor;
  const strokeWidth = 5;
  const [animatedVal, setAnimatedVal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedVal(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  // ── Multi-ring (Overall ESG Score) ────────────────────────────────────────
  if (multiValues) {
    const center = size / 2;
    const rE = size * 0.42; // Increased from 0.38
    const rS = size * 0.33; // Increased from 0.28
    const rG = size * 0.24; // Increased from 0.18

    const cE = 2 * Math.PI * rE;
    const cS = 2 * Math.PI * rS;
    const cG = 2 * Math.PI * rG;

    const [valE, setValE] = useState(0);
    const [valS, setValS] = useState(0);
    const [valG, setValG] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        setValE(multiValues.E);
        setValS(multiValues.S);
        setValG(multiValues.G);
      }, 150);
      return () => clearTimeout(timer);
    }, [multiValues]);

    return (
      <div className="flex flex-col items-center justify-center p-2 relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            {/* Green-to-purple gradient arc for the Overall ring — E+S+G combined */}
            <linearGradient id="overall-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2E7D32" />
              <stop offset="50%" stopColor="#3E8E7E" />
              <stop offset="100%" stopColor="#6A1B9A" />
            </linearGradient>
          </defs>

          {/* Track circles — light tint bg */}
          {[rE, rS, rG].map((r, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#F4FFF4"
              strokeWidth={strokeWidth + 1}
              className="opacity-100"
            />
          ))}
          {/* Subtle hairline ring outlines */}
          {[rE, rS, rG].map((r, i) => (
            <circle
              key={`outline-${i}`}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#E3E8DE"
              strokeWidth={1}
              className="opacity-60"
            />
          ))}

          {/* Environmental Ring */}
          <circle
            cx={center}
            cy={center}
            r={rE}
            fill="none"
            stroke={MODULE_ACCENTS.E.rawColor}
            strokeWidth={strokeWidth}
            strokeDasharray={cE}
            strokeDashoffset={cE - (valE / 100) * cE}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Social Ring */}
          <circle
            cx={center}
            cy={center}
            r={rS}
            fill="none"
            stroke={MODULE_ACCENTS.S.rawColor}
            strokeWidth={strokeWidth}
            strokeDasharray={cS}
            strokeDashoffset={cS - (valS / 100) * cS}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Governance Ring */}
          <circle
            cx={center}
            cy={center}
            r={rG}
            fill="none"
            stroke={MODULE_ACCENTS.G.rawColor}
            strokeWidth={strokeWidth}
            strokeDasharray={cG}
            strokeDashoffset={cG - (valG / 100) * cG}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score Label Overlay */}
        <div className="absolute text-center flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-semibold tracking-tight text-text-primary leading-none">
            {multiValues.Overall}
          </span>
          <span className="font-sans text-[9px] text-text-muted mt-1 uppercase tracking-wider font-semibold">{label}</span>
        </div>
      </div>
    );
  }

  // ── Single ring gauge ────────────────────────────────────────────────────
  const center = size / 2;
  const radius = size * 0.35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedVal / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-2 relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Concentric growth lines representing tree woodgrain - moved outside of text zone */}
        {[radius + 14, radius + 7].map((r, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#E3E8DE"
            strokeWidth={1}
            strokeDasharray="2 4"
            className="opacity-40"
          />
        ))}

        {/* Faded Background Ring Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F4FFF4"
          strokeWidth={strokeWidth + 2}
        />
        {/* Track border hairline */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E3E8DE"
          strokeWidth={1}
          className="opacity-70"
        />

        {/* Active Arc Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Floating Score value */}
      <div className="absolute text-center flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-semibold tracking-tight text-text-primary leading-none">
          {value}
        </span>
        <span className="font-sans text-[9px] text-text-muted mt-1 uppercase tracking-wider font-semibold">{subLabel}</span>
      </div>
    </div>
  );
};

// ─── 3. Growth-Fill Progress Bar ─────────────────────────────────────────────
export const GrowthProgressBar: React.FC<{
  value: number;
  max?: number;
  module?: keyof typeof MODULE_ACCENTS;
  className?: string;
  showText?: boolean;
}> = ({ value, max = 100, module = "None", className = "", showText = true }) => {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const accent = MODULE_ACCENTS[module];
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1 text-xs font-mono text-text-muted">
        {showText && <span>{value.toLocaleString()} / {max.toLocaleString()}</span>}
        {showText && <span className={`${accent.text} font-bold`}>{percentage}%</span>}
      </div>
      {/* Track: light tint background */}
      <div className="w-full bg-bg-tint h-2 rounded-full overflow-hidden border border-border-hairline/60 p-[1px]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedWidth}%`,
            backgroundImage: `linear-gradient(to right, ${accent.rawColorLight || accent.rawColor}55, ${accent.rawColor})`,
          }}
        />
      </div>
    </div>
  );
};

// ─── 4. Data Table ────────────────────────────────────────────────────────────
export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  initialSortKey,
  searchPlaceholder = "Search entries...",
  searchKey,
  emptyMessage = "No records found.",
  itemsPerPage = 6,
  module = "None",
  actionBar,
}: {
  columns: TableColumn<T>[];
  data: T[];
  initialSortKey?: string;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  emptyMessage?: string;
  itemsPerPage?: number;
  module?: keyof typeof MODULE_ACCENTS;
  actionBar?: React.ReactNode;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const filteredData = data.filter((row) => {
    if (!searchTerm || !searchKey) return true;
    const value = row[searchKey];
    if (value === undefined || value === null) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
    if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const accent = MODULE_ACCENTS[module];

  return (
    <div className="w-full">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {searchKey ? (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-surface border border-border-hairline text-text-primary rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-accent-e font-sans placeholder:text-text-muted/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          {actionBar}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-border-hairline leaf-card bg-bg-surface"
        style={{ boxShadow: "0 1px 3px rgba(46,125,50,0.06), 0 1px 2px rgba(27,42,31,0.04)" }}>
        <table className="w-full border-collapse text-left text-sm font-sans">
          <thead>
            {/* Table header: slightly tinted bg to distinguish from body */}
            <tr className="bg-bg-tint border-b border-border-hairline">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-xs font-semibold text-text-muted tracking-wider select-none cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap uppercase"
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {sortKey === col.key && (
                      sortOrder === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline/60">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="hover:bg-bg-tint transition-colors group"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-text-primary font-mono text-xs
                        ${cIdx === 0 ? "font-sans font-medium" : ""}
                      `}
                      style={cIdx === 0 && module !== "None" ? {
                        borderLeft: `3px solid ${accent.rawColor}`,
                      } : undefined}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted italic font-sans text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs font-mono text-text-muted">
          <span>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1.5 border border-border-hairline rounded hover:bg-bg-tint disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border-hairline rounded hover:bg-bg-tint disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-border-hairline rounded hover:bg-bg-tint disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1.5 border border-border-hairline rounded hover:bg-bg-tint disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 5. Toast Alert ───────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  title: string;
  description: string;
  type: "success" | "warning" | "error" | "info";
}

export const ToastAlert: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => {
        let borderClass = "border-l-4";
        let borderColor = "#4CAF50";
        let textClass = "text-accent-e";
        let Icon = CheckCircle;

        if (toast.type === "warning") {
          borderColor = "#C98A2C";
          textClass = "text-accent-game";
          Icon = AlertTriangle;
        } else if (toast.type === "error") {
          borderColor = "#A0392B";
          textClass = "text-status-critical";
          Icon = AlertTriangle;
        } else if (toast.type === "info") {
          borderColor = "#3E8E7E";
          textClass = "text-accent-s";
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`leaf-card bg-bg-surface border border-border-hairline p-4 shadow-lg flex gap-3 items-start animate-slide-in ${borderClass}`}
            style={{
              borderLeftColor: borderColor,
              boxShadow: "0 4px 16px rgba(46,125,50,0.12), 0 2px 4px rgba(27,42,31,0.06)",
            }}
          >
            <Icon className={`h-5 w-5 ${textClass} shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h4 className="font-display font-semibold text-text-primary text-sm">{toast.title}</h4>
              <p className="font-sans text-xs text-text-muted mt-1 leading-relaxed">{toast.description}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ─── 6. Interactive Modal ─────────────────────────────────────────────────────
export const InteractiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  module?: keyof typeof MODULE_ACCENTS;
}> = ({ isOpen, onClose, title, children, module = "None" }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const accent = MODULE_ACCENTS[module];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay — light scrim */}
      <div
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={`
          relative w-full max-w-lg bg-bg-surface border border-border-hairline leaf-card p-6 overflow-hidden z-10 animate-scale-up
          ${accent.border}
        `}
        style={{
          borderLeftColor: module !== "None" ? accent.rawColor : undefined,
          boxShadow: "0 8px 32px rgba(46,125,50,0.12), 0 4px 8px rgba(27,42,31,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-border-hairline">
          <h3 className="font-display text-xl font-semibold text-text-primary flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 border border-transparent rounded hover:border-border-hairline hover:bg-bg-tint"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
