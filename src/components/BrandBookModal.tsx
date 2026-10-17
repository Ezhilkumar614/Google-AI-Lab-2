import React from 'react';
import { ProductDetails, GeneratedShot, CampaignCopy, MediumDefinition } from '../types';
import { X, Printer, Download, Sparkles, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BrandBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetails;
  anchorShot: GeneratedShot;
  shots: Record<string, GeneratedShot>;
  mediums: MediumDefinition[];
  copy?: CampaignCopy;
}

export const BrandBookModal: React.FC<BrandBookModalProps> = ({
  isOpen,
  onClose,
  product,
  anchorShot,
  shots,
  mediums,
  copy,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="text-base font-bold text-stone-100 font-serif">
              Brand Campaign Presentation Deck
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 bg-stone-900 text-stone-100 print:bg-white print:text-black">
          {/* Deck Hero Cover */}
          <div className="border-b border-stone-800 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-mono">
                {product.category || 'Luxury Goods'} • Comprehensive Brand Identity
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-serif">
                {product.name}
              </h1>
              <p className="text-base text-stone-300 font-serif italic">
                "{copy?.tagline || product.tagline || 'Excellence in Form and Function'}"
              </p>
              <p className="text-xs text-stone-400 leading-relaxed max-w-xl">
                {product.description}
              </p>
            </div>

            {/* Color Swatches & Aesthetic Badge */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3 min-w-[220px]">
              <div>
                <p className="text-[10px] font-mono uppercase text-stone-400">
                  Brand Palette
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {product.colors.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-7 h-7 rounded-lg border border-stone-800 shadow"
                        style={{ backgroundColor: c }}
                      />
                      <span className="text-[9px] font-mono text-stone-400">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-800/80 pt-2 text-xs">
                <p className="text-[10px] text-stone-500">Aesthetic Identity</p>
                <p className="font-medium text-stone-200">{product.aesthetic}</p>
              </div>
            </div>
          </div>

          {/* Master Anchor vs Mediums Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-100 font-serif flex items-center gap-2">
                <span>Multi-Medium Cross-Campaign Matrix</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Consistent Product Identity
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Master Anchor */}
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-amber-500/30 flex flex-col justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-2">
                    <span>Master Product Anchor (1:1)</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                    {anchorShot.imageUrl ? (
                      <img
                        src={anchorShot.imageUrl}
                        alt="Master Anchor"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-500">
                        Not Rendered
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-stone-400">
                  Neutral studio packshot defining product geometry & finishes.
                </p>
              </div>

              {/* Mediums */}
              {mediums.map((m) => {
                const s = shots[m.key];
                return (
                  <div
                    key={m.key}
                    className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-300 font-semibold mb-2">
                        <span>{m.name}</span>
                        <span className="text-[10px] font-mono text-amber-400">
                          {m.aspectRatio}
                        </span>
                      </div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                        {s?.imageUrl ? (
                          <img
                            src={s.imageUrl}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-stone-500">
                            Awaiting Render
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2">
                      {m.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ad Copy & Brand Narrative Section */}
          {copy && (
            <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono">
                Art Direction & Campaign Copy Suite
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <p className="text-stone-400 uppercase text-[10px] font-mono">
                    Billboard Headline
                  </p>
                  <p className="text-sm font-bold text-white mt-1">
                    {copy.billboardHeadline}
                  </p>
                  <p className="text-xs text-amber-300/90 mt-0.5">
                    {copy.billboardSubhead}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <p className="text-stone-400 uppercase text-[10px] font-mono">
                    Newspaper Editorial Story
                  </p>
                  <p className="text-xs font-semibold text-white mt-1">
                    {copy.newspaperHeadline}
                  </p>
                  <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                    {copy.newspaperStory}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <p className="text-stone-400 uppercase text-[10px] font-mono">
                    Social Media Caption
                  </p>
                  <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                    {copy.socialCaption}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[10px] text-amber-400 font-mono mt-2">
                    {copy.socialHashtags.map((h, i) => (
                      <span key={i}>{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
