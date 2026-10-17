import React from 'react';
import { GeneratedShot, ProductDetails } from '../types';
import { Lock, Sparkles, Download, Maximize2, RefreshCw, CheckCircle2, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface ConsistencyAnchorCardProps {
  shot: GeneratedShot;
  product: ProductDetails;
  onReRender: () => void;
  onOpenLightbox: (shot: GeneratedShot) => void;
  isGenerating: boolean;
}

export const ConsistencyAnchorCard: React.FC<ConsistencyAnchorCardProps> = ({
  shot,
  product,
  onReRender,
  onOpenLightbox,
  isGenerating,
}) => {
  const hasImage = Boolean(shot.imageUrl);

  const handleDownload = () => {
    if (!shot.imageUrl) return;
    const a = document.createElement('a');
    a.href = shot.imageUrl;
    a.download = `${product.name.toLowerCase().replace(/\s+/g, '_')}_master_anchor.png`;
    a.click();
  };

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-5 lg:p-6 shadow-xl flex flex-col justify-between gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5 font-serif">
              Master Product Anchor
              {hasImage && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Locked Reference
                </span>
              )}
            </h3>
            <p className="text-[11px] text-stone-400">
              Conditioning shot passed to Nano-Banana for each medium
            </p>
          </div>
        </div>

        {hasImage && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenLightbox(shot)}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
              title="Inspect Full Resolution"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
              title="Download Master Image"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onReRender}
              disabled={isGenerating}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer disabled:opacity-50"
              title="Re-render Master Anchor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Visual Display Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800/90 flex items-center justify-center group">
        {hasImage ? (
          <>
            <img
              src={shot.imageUrl}
              alt={product.name || 'Master Product Anchor'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition duration-300 group-hover:scale-102 cursor-pointer"
              onClick={() => onOpenLightbox(shot)}
            />

            {/* Overlay Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-700/60 text-[10px] font-medium text-stone-200">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Studio Packshot</span>
            </div>

            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[10px] text-stone-300">
              <span className="truncate max-w-[180px] font-semibold">{product.name}</span>
              <span className="text-amber-400/90 font-mono text-[9px]">1:1 Master</span>
            </div>
          </>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-200">
                Rendering Master Product Shot...
              </p>
              <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">
                Isolated packshot with studio illumination & zero human figures.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-stone-500">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-300">No Master Anchor Yet</p>
              <p className="text-[11px] text-stone-500 mt-1 max-w-[220px]">
                Click "1. Render Master Anchor" or "Generate Full Campaign" to synthesize the reference shot.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Product Spec Snapshot */}
      <div className="space-y-2 pt-1 border-t border-stone-800/80 text-xs">
        <div className="flex items-center justify-between text-stone-400">
          <span className="text-stone-500">Identity:</span>
          <span className="text-stone-300 font-medium truncate max-w-[180px]">
            {product.category || 'Luxury Goods'}
          </span>
        </div>

        <div className="flex items-center justify-between text-stone-400">
          <span className="text-stone-500">Model Engine:</span>
          <span className="text-amber-300/90 font-mono text-[11px]">
            {shot.modelUsed?.includes('2.1') ? 'Nano-Banana 2.1' : 'Nano-Banana Lite'}
          </span>
        </div>

        <div className="flex items-center justify-between text-stone-400">
          <span className="text-stone-500">Colors:</span>
          <div className="flex items-center gap-1">
            {product.colors.map((c, i) => (
              <span
                key={i}
                className="w-3.5 h-3.5 rounded-full border border-stone-800 shadow"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
