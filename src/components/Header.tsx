import React from 'react';
import { Layers, ShieldCheck, Sparkles, BookOpen, Key, AlertCircle } from 'lucide-react';

interface HeaderProps {
  modelVariant: string;
  onModelChange: (model: string) => void;
  onOpenBrandBook: () => void;
  hasKey: boolean;
  activeShotsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  modelVariant,
  onModelChange,
  onOpenBrandBook,
  hasKey,
  activeShotsCount,
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/20 ring-1 ring-amber-400/30">
            <Layers className="w-5 h-5 text-stone-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-stone-100 font-serif">
                Brand Builder
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Studio Edition
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Cross-Medium Product Visualization & Consistency Engine
            </p>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Consistency Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Product Consistency Lock</span>
          </div>

          {/* No People Constraint Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Pure Object Focus (No Humans)</span>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-stone-900/90 border border-stone-800 rounded-lg p-1 text-xs">
            <span className="px-2 text-stone-400 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-400" /> Model:
            </span>
            <select
              value={modelVariant}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-stone-950 text-stone-200 text-xs font-medium rounded px-2 py-1 border border-stone-700/60 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="gemini-3.1-flash-lite-image">
                Nano-Banana Lite (Flash Image)
              </option>
              <option value="gemini-nano-banana-2.1">
                Nano-Banana 2.1 (Ultra Fidelity)
              </option>
            </select>
          </div>

          {/* API Key Status Indicator */}
          {!hasKey ? (
            <div
              title="Gemini API Key missing or not detected. Please verify your API Key in Settings > Secrets."
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Key Missing</span>
            </div>
          ) : (
            <div
              title="Connected with server-side Gemini Nano-Banana API."
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-900/70 border border-stone-800 text-stone-400 text-xs"
            >
              <Key className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px]">API Connected</span>
            </div>
          )}

          {/* Brand Book Presentation Trigger */}
          <button
            onClick={onOpenBrandBook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-medium transition cursor-pointer shadow-sm hover:text-white"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Campaign Deck</span>
            {activeShotsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                {activeShotsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
