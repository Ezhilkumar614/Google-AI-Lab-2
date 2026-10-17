import React from 'react';
import { ProductDetails, CampaignCopy } from '../types';

interface MockupNewspaperProps {
  imageUrl: string;
  product: ProductDetails;
  copy?: CampaignCopy;
  onClickImage?: () => void;
}

export const MockupNewspaper: React.FC<MockupNewspaperProps> = ({
  imageUrl,
  product,
  copy,
  onClickImage,
}) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-xl bg-[#EAE5D9] text-[#1E1C1A] p-5 sm:p-8 shadow-2xl border border-[#D5CEBF] font-serif overflow-hidden select-none">
      {/* Subtle paper grain and fold shadow */}
      <div className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-black/10 pointer-events-none" />

      {/* Newspaper Masthead */}
      <div className="border-b-2 border-[#1E1C1A] pb-3 mb-3 text-center">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-wider font-sans text-stone-600 pb-1 border-b border-stone-400">
          <span>Vol. CXLVIII ... No. 51,208</span>
          <span>Global Financial & Design Chronicle</span>
          <span>$3.50 International Edition</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase my-1 font-serif text-[#141311]">
          The Daily Chronicle
        </h2>

        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-sans border-t border-stone-400 pt-1 text-stone-600">
          <span>Late City Edition</span>
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span>Printed on 100% Recycled Cotton Rag</span>
        </div>
      </div>

      {/* Main Newspaper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Editorial Column */}
        <div className="md:col-span-4 border-r-0 md:border-r border-stone-400/80 pr-0 md:pr-4 space-y-3 font-serif">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide font-sans text-stone-800">
              Industrial Design Review
            </h4>
            <h3 className="text-sm font-bold leading-tight mt-1">
              {copy?.newspaperHeadline || `${product.name} Establishes New Paradigm`}
            </h3>
            <p className="text-[11px] leading-relaxed text-stone-700 mt-1.5 text-justify">
              {copy?.newspaperStory ||
                'In an era overwhelmed by disposable artifacts, quiet discipline reemerges. Meticulous craftsmanship and raw elemental finishes signal a profound shift toward permanence.'}
            </p>
          </div>

          <div className="border-t border-stone-400/60 pt-2 text-[10px] text-stone-600 space-y-1">
            <p className="font-semibold uppercase tracking-wider font-sans text-[9px]">
              Material Specification
            </p>
            <p className="italic">{product.materials || 'Bespoke precision components'}</p>
          </div>

          <div className="border-t border-stone-400/60 pt-2 text-[10px] text-stone-600">
            <p className="font-sans font-bold uppercase text-[9px]">Aesthetic Movement</p>
            <p>{product.aesthetic || 'Contemporary Minimalist'}</p>
          </div>
        </div>

        {/* Center/Right: The Full Printed Display Ad */}
        <div className="md:col-span-8 flex flex-col items-center">
          <div className="w-full border-2 border-[#1E1C1A] p-2 bg-[#F2EDE2] shadow-sm">
            <div className="flex items-center justify-between pb-1.5 text-[9px] uppercase tracking-wider font-sans text-stone-500 border-b border-stone-300 mb-2">
              <span>Advertisement</span>
              <span className="font-bold text-stone-800">{product.name}</span>
              <span>Authorized Showcase</span>
            </div>

            {/* Generated Shot on Newsprint */}
            <div className="relative aspect-[3/4] w-full rounded overflow-hidden bg-stone-900 shadow-inner group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${product.name} Newspaper Ad`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-101 cursor-pointer mix-blend-multiply contrast-105"
                  onClick={onClickImage}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-500 text-xs">
                  Generating Broadsheet Ad...
                </div>
              )}

              {/* Halftone & Ink simulation overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px]" />
            </div>

            <div className="mt-2 text-center border-t border-stone-300 pt-1.5">
              <p className="text-xs font-bold uppercase tracking-widest font-sans text-stone-900">
                {product.name}
              </p>
              <p className="text-[10px] italic text-stone-600 mt-0.5">
                {copy?.tagline || 'Excellence Without Compromise.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Rule */}
      <div className="border-t border-[#1E1C1A] mt-4 pt-2 flex items-center justify-between text-[9px] font-sans text-stone-600">
        <span>Section C: Culture & Commerce</span>
        <span>Broadsheet Aspect Ratio: 3:4</span>
        <span>Page C-14</span>
      </div>
    </div>
  );
};
