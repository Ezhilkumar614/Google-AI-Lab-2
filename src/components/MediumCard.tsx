import React, { useState } from 'react';
import { MediumDefinition, GeneratedShot, ProductDetails, CampaignCopy } from '../types';
import { MockupBillboard } from './MockupBillboard';
import { MockupNewspaper } from './MockupNewspaper';
import { MockupSocialPost } from './MockupSocialPost';
import {
  Sparkles,
  RefreshCw,
  Download,
  Maximize2,
  Eye,
  Sliders,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MediumCardProps {
  medium: MediumDefinition;
  shot?: GeneratedShot;
  product: ProductDetails;
  copy?: CampaignCopy;
  onGenerate: (mediumKey: string) => void;
  onOpenLightbox: (shot: GeneratedShot) => void;
  isGenerating: boolean;
  hasAnchorImage: boolean;
}

export const MediumCard: React.FC<MediumCardProps> = ({
  medium,
  shot,
  product,
  copy,
  onGenerate,
  onOpenLightbox,
  isGenerating,
  hasAnchorImage,
}) => {
  const [viewMode, setViewMode] = useState<'shot' | 'mockup'>('shot');
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const hasImage = Boolean(shot?.imageUrl);
  const isCurrentlyGenerating = isGenerating || shot?.status === 'generating';

  const handleDownload = () => {
    if (!shot?.imageUrl) return;
    const a = document.createElement('a');
    a.href = shot.imageUrl;
    a.download = `${product.name.toLowerCase().replace(/\s+/g, '_')}_${medium.key}.png`;
    a.click();
  };

  // Aspect ratio classes for shot container
  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9':
        return 'aspect-[16/9]';
      case '3:4':
        return 'aspect-[3/4]';
      case '4:3':
        return 'aspect-[4/3]';
      case '9:16':
        return 'aspect-[9/16]';
      case '1:1':
      default:
        return 'aspect-square';
    }
  };

  const hasSpecialMockup = ['billboard', 'newspaper', 'social_post'].includes(medium.key);

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-4 transition hover:border-stone-700/80">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-stone-800 text-amber-300/90 border border-stone-700">
              {medium.category}
            </span>
            <span className="text-xs font-mono text-stone-500">
              {medium.aspectRatio}
            </span>
          </div>
          <h3 className="text-base font-bold text-stone-100 font-serif mt-1">
            {medium.name}
          </h3>
          <p className="text-xs text-stone-400 line-clamp-1">{medium.description}</p>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-1">
          {hasSpecialMockup && hasImage && (
            <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('shot')}
                className={`px-2 py-1 rounded cursor-pointer transition ${
                  viewMode === 'shot'
                    ? 'bg-stone-800 text-stone-100 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Direct Shot
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mockup')}
                className={`px-2 py-1 rounded cursor-pointer transition ${
                  viewMode === 'mockup'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                In Context
              </button>
            </div>
          )}

          {hasImage && (
            <>
              <button
                onClick={() => shot && onOpenLightbox(shot)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
                title="Inspect in Lightbox"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
                title="Download Shot"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={() => onGenerate(medium.key)}
            disabled={isCurrentlyGenerating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm ${
              hasImage
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-amber-950/30'
            } disabled:opacity-50`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isCurrentlyGenerating ? 'animate-spin' : ''}`}
            />
            <span>
              {isCurrentlyGenerating
                ? 'Generating...'
                : hasImage
                ? 'Re-roll'
                : 'Generate Shot'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'mockup' && hasSpecialMockup && hasImage ? (
        <div className="w-full flex justify-center py-2">
          {medium.key === 'billboard' && (
            <MockupBillboard
              imageUrl={shot!.imageUrl}
              product={product}
              copy={copy}
              onClickImage={() => shot && onOpenLightbox(shot)}
            />
          )}
          {medium.key === 'newspaper' && (
            <MockupNewspaper
              imageUrl={shot!.imageUrl}
              product={product}
              copy={copy}
              onClickImage={() => shot && onOpenLightbox(shot)}
            />
          )}
          {medium.key === 'social_post' && (
            <MockupSocialPost
              imageUrl={shot!.imageUrl}
              product={product}
              copy={copy}
              onClickImage={() => shot && onOpenLightbox(shot)}
            />
          )}
        </div>
      ) : (
        /* Direct Shot View */
        <div
          className={`relative w-full ${getAspectRatioClass(
            medium.aspectRatio
          )} rounded-xl overflow-hidden bg-stone-950 border border-stone-800/80 flex items-center justify-center group`}
        >
          {hasImage ? (
            <>
              <img
                src={shot!.imageUrl}
                alt={`${product.name} on ${medium.name}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-101 cursor-pointer"
                onClick={() => shot && onOpenLightbox(shot)}
              />

              {/* Badges on image */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-stone-950/80 backdrop-blur-md border border-stone-700/60 text-[10px] text-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Consistent Product</span>
              </div>

              <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-stone-950/80 backdrop-blur-md border border-stone-700/60 text-[10px] font-mono text-amber-300">
                {medium.recommendedSize}
              </div>
            </>
          ) : isCurrentlyGenerating ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Sparkles className="w-4 h-4 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-200">
                  Synthesizing {medium.name}...
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Maintaining anchor product geometry, zero people.
                </p>
              </div>
            </div>
          ) : shot?.status === 'error' ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-rose-400">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
              <p className="text-xs font-semibold">Generation Failed</p>
              <p className="text-[11px] text-stone-400 max-w-[240px]">
                {shot.errorMessage || 'Unable to generate shot. Please retry.'}
              </p>
              <button
                onClick={() => onGenerate(medium.key)}
                className="mt-2 text-xs px-3 py-1 rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2.5 p-6 text-center text-stone-600">
              <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-stone-300">Awaiting Generation</p>
              <p className="text-[11px] text-stone-500 max-w-[260px]">
                {hasAnchorImage
                  ? 'Master anchor locked. Ready to imagine on this medium.'
                  : 'Will inherit design from Master Product Anchor.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Info & Prompt Inspection Toggle */}
      {hasImage && shot?.promptUsed && (
        <div className="border-t border-stone-800/80 pt-2 text-xs">
          <button
            type="button"
            onClick={() => setShowPromptDetails(!showPromptDetails)}
            className="flex items-center justify-between w-full text-stone-400 hover:text-stone-200 transition text-[11px] py-0.5 cursor-pointer"
          >
            <span>Model Prompt & Conditioning Details</span>
            {showPromptDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showPromptDetails && (
            <div className="mt-2 p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-400 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-text">
              {shot.promptUsed}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
