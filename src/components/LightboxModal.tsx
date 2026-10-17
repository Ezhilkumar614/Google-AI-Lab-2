import React from 'react';
import { GeneratedShot } from '../types';
import { X, Download, Copy, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface LightboxModalProps {
  shot: GeneratedShot | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ shot, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!shot || !shot.imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = shot.imageUrl;
    a.download = `brand_builder_${shot.mediumKey}_${Date.now()}.png`;
    a.click();
  };

  const handleCopyPrompt = () => {
    if (shot.promptUsed) {
      navigator.clipboard.writeText(shot.promptUsed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-stone-100 font-serif">
              {shot.name}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {shot.aspectRatio} Aspect
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" /> No Humans
            </span>
          </div>

          <div className="flex items-center gap-2">
            {shot.promptUsed && (
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer transition"
                title="Copy Generation Prompt"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Showcase */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-stone-950/60">
          <img
            src={shot.imageUrl}
            alt={shot.name}
            referrerPolicy="no-referrer"
            className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-stone-800"
          />
        </div>

        {/* Footer Prompt & Model Info */}
        {shot.promptUsed && (
          <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/80 text-xs text-stone-400 flex flex-col gap-1 max-h-28 overflow-y-auto font-mono">
            <span className="text-[10px] text-stone-500 uppercase font-sans font-bold">
              Prompt Specification ({shot.modelUsed || 'Nano-Banana'}):
            </span>
            <p className="text-[11px] text-stone-300 leading-relaxed whitespace-pre-wrap select-text">
              {shot.promptUsed}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
