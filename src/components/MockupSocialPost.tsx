import React, { useState } from 'react';
import { ProductDetails, CampaignCopy } from '../types';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, CheckCircle } from 'lucide-react';

interface MockupSocialPostProps {
  imageUrl: string;
  product: ProductDetails;
  copy?: CampaignCopy;
  onClickImage?: () => void;
}

export const MockupSocialPost: React.FC<MockupSocialPostProps> = ({
  imageUrl,
  product,
  copy,
  onClickImage,
}) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const brandHandle = product.name
    ? product.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'brand';

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden text-stone-100 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          {/* Brand avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ring-1 ring-amber-400/40"
            style={{
              backgroundColor: product.colors[0] || '#222',
              color: product.colors[2] || '#fff',
            }}
          >
            {product.name ? product.name.slice(0, 2).toUpperCase() : 'BB'}
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold tracking-tight text-white">
                {brandHandle}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            </div>
            <p className="text-[10px] text-stone-400">
              Sponsored • {product.category || 'Luxury Goods'}
            </p>
          </div>
        </div>

        <button className="text-stone-400 hover:text-stone-200 p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main Square 1:1 Image */}
      <div className="relative aspect-square w-full bg-stone-950 overflow-hidden group">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${product.name} Social Post`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition duration-300 group-hover:scale-101 cursor-pointer"
            onClick={onClickImage}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-950 text-stone-600 text-xs">
            Generating Social Flatlay...
          </div>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLiked(!liked)}
              className="transition transform active:scale-125 cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${
                  liked ? 'text-rose-500 fill-rose-500' : 'text-stone-300 hover:text-white'
                }`}
              />
            </button>
            <button className="text-stone-300 hover:text-white cursor-pointer">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="text-stone-300 hover:text-white cursor-pointer">
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setSaved(!saved)}
            className="text-stone-300 hover:text-white cursor-pointer"
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'text-amber-400 fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Likes count */}
        <p className="text-xs font-bold text-stone-200">
          {liked ? '1,429 likes' : '1,428 likes'}
        </p>

        {/* Caption */}
        <div className="text-xs leading-relaxed space-y-1">
          <p>
            <span className="font-bold mr-1.5 text-white">{brandHandle}</span>
            <span className="text-stone-300">
              {copy?.socialCaption ||
                `Form follows feeling. Meet ${product.name}, crafted to redefine modern daily ritual.`}
            </span>
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1 text-[11px] text-amber-400/90 font-medium pt-1">
            {copy?.socialHashtags?.map((tag, idx) => (
              <span key={idx} className="hover:underline cursor-pointer">
                {tag}
              </span>
            )) || (
              <>
                <span>#DesignExcellence</span>
                <span>#BrandBuilder</span>
                <span>#ObjectDesign</span>
                <span>#QuietLuxury</span>
              </>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-stone-500 uppercase tracking-wide pt-1">
          2 hours ago • Original Audio
        </p>
      </div>
    </div>
  );
};
