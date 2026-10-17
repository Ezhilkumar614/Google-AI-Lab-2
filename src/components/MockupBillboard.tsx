import React from 'react';
import { ProductDetails, CampaignCopy } from '../types';

interface MockupBillboardProps {
  imageUrl: string;
  product: ProductDetails;
  copy?: CampaignCopy;
  onClickImage?: () => void;
}

export const MockupBillboard: React.FC<MockupBillboardProps> = ({
  imageUrl,
  product,
  copy,
  onClickImage,
}) => {
  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-4 sm:p-6 border border-stone-800 shadow-2xl flex flex-col items-center overflow-hidden">
      {/* Twilight ambient glow effect */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-950/20 via-indigo-950/10 to-transparent pointer-events-none" />

      {/* Top Truss & Floodlights */}
      <div className="w-full max-w-4xl flex items-center justify-between px-8 sm:px-16 mb-2 z-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            {/* Spot fixture */}
            <div className="w-3.5 h-3 bg-stone-700 rounded-sm border border-stone-600 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-amber-200 rounded-full shadow-[0_0_8px_#fde68a]" />
            </div>
            {/* Angle bracket arm */}
            <div className="w-0.5 h-3 bg-stone-600" />
          </div>
        ))}
      </div>

      {/* Billboard Main Board */}
      <div className="relative w-full max-w-4xl aspect-[16/9] rounded-lg overflow-hidden bg-stone-950 border-4 border-stone-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${product.name} Billboard`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-101 cursor-pointer"
            onClick={onClickImage}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-600 p-8 text-center">
            <span className="text-sm font-medium">Billboard Shot Not Yet Generated</span>
          </div>
        )}

        {/* Billboard Frame Border Inset & Trim */}
        <div className="absolute inset-0 pointer-events-none border border-stone-900/40 shadow-inner" />

        {/* Optional Headline Bar Overlay */}
        {copy?.billboardHeadline && (
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <div className="bg-stone-950/75 backdrop-blur-md border border-stone-700/60 rounded-xl px-4 py-2.5 max-w-lg shadow-xl">
              <p className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase font-sans">
                {copy.billboardHeadline}
              </p>
              {copy.billboardSubhead && (
                <p className="text-[10px] sm:text-xs text-amber-300 font-medium mt-0.5">
                  {copy.billboardSubhead}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Structural Support Pillars */}
      <div className="w-full max-w-4xl flex justify-around px-12 sm:px-24 mt-2">
        <div className="w-4 sm:w-6 h-8 sm:h-12 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-900 border-x border-stone-700 shadow-lg" />
        <div className="w-4 sm:w-6 h-8 sm:h-12 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-900 border-x border-stone-700 shadow-lg" />
      </div>

      {/* Medium Info Tag */}
      <div className="mt-3 flex items-center justify-between w-full max-w-4xl text-xs text-stone-400">
        <span className="font-mono text-[11px] text-amber-400">
          OOH Format: 16:9 Panoramic Outdoor
        </span>
        <span className="text-[11px] text-stone-500">
          Simulated High-Visibility City Skyline Scaffolding
        </span>
      </div>
    </div>
  );
};
