import React, { useState } from 'react';
import { ProductDetails, ProductPreset } from '../types';
import { PRODUCT_PRESETS, COLOR_PALETTE_PRESETS } from '../constants/presets';
import { Sparkles, Wand2, Upload, RefreshCw, Palette, Layers, Package, Sliders, CheckCircle2 } from 'lucide-react';

interface ProductFormProps {
  product: ProductDetails;
  onChange: (updated: Partial<ProductDetails>) => void;
  onGenerateAnchor: () => void;
  onBatchGenerateAll: () => void;
  isGeneratingAnchor: boolean;
  isGeneratingAny: boolean;
  onCustomImageUpload: (base64: string) => void;
  onInspireProduct: () => void;
  isInspiring: boolean;
  hasAnchorImage: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onChange,
  onGenerateAnchor,
  onBatchGenerateAll,
  isGeneratingAnchor,
  isGeneratingAny,
  onCustomImageUpload,
  onInspireProduct,
  isInspiring,
  hasAnchorImage,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSelectPreset = (preset: ProductPreset) => {
    onChange({
      name: preset.name,
      category: preset.category,
      description: preset.description,
      materials: preset.materials,
      colors: preset.colors,
      aesthetic: preset.aesthetic,
      tagline: preset.tagline,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCustomImageUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (index: number, newColor: string) => {
    const updated = [...product.colors];
    updated[index] = newColor;
    onChange({ colors: updated });
  };

  const handleAddColor = () => {
    if (product.colors.length < 5) {
      onChange({ colors: [...product.colors, '#ffffff'] });
    }
  };

  const handleRemoveColor = (index: number) => {
    if (product.colors.length > 1) {
      const updated = product.colors.filter((_, i) => i !== index);
      onChange({ colors: updated });
    }
  };

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-5 lg:p-6 shadow-xl flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-stone-100 font-serif">
              Product Blueprint
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Describe the physical product. All medium shots will be anchored to this design.
          </p>
        </div>

        {/* AI Inspire & Upload buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onInspireProduct}
            disabled={isInspiring || isGeneratingAny}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            title="Generate a novel fictional product concept with AI"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isInspiring ? 'animate-spin' : ''}`} />
            <span>{isInspiring ? 'Inventing...' : 'AI Inspire'}</span>
          </button>

          <label
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700/80 border border-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
            title="Upload an existing photo of your product to use as reference"
          >
            <Upload className="w-3.5 h-3.5 text-stone-400" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Preset Inspirations Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
          <span className="font-medium text-stone-300">Quick Concept Presets:</span>
          <span className="text-[11px] text-stone-500">Click to load</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_PRESETS.map((preset) => {
            const isSelected = product.name === preset.name;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition text-left cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-medium'
                    : 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: preset.colors[0] }}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Product Name <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. AURA Botanical Elixir"
            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition shadow-inner"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Category / Industry <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={product.category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="e.g. Luxury Skincare, Specialty Coffee, Audio Tech"
            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Physical Appearance Details */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-stone-300">
            Physical Product Details & Distinctive Cues <span className="text-amber-400">*</span>
          </label>
          <span className="text-[11px] text-stone-500">
            Shape, bottle/box structure, caps, finish, typography
          </span>
        </div>
        <textarea
          rows={3}
          value={product.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the packaging geometry, materials, label texture, unique cap or closure, and branding typography..."
          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/70 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition shadow-inner resize-y leading-relaxed"
        />
      </div>

      {/* Materials & Aesthetic Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Materials & Textures
          </label>
          <input
            type="text"
            value={product.materials}
            onChange={(e) => onChange({ materials: e.target.value })}
            placeholder="e.g. Frosted emerald glass, brushed brass, cotton paper"
            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition shadow-inner"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Aesthetic & Brand Vibe
          </label>
          <input
            type="text"
            value={product.aesthetic}
            onChange={(e) => onChange({ aesthetic: e.target.value })}
            placeholder="e.g. Quiet Luxury, Scandinavian Modern, Brutalist Monolith"
            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Brand Color Palette */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            Brand Color Palette
          </label>
          <div className="flex items-center gap-2">
            {COLOR_PALETTE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange({ colors: preset.colors })}
                title={preset.name}
                className="flex items-center -space-x-1 hover:scale-110 transition cursor-pointer p-0.5 rounded"
              >
                {preset.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-stone-900 shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-stone-950/70 border border-stone-800/80 rounded-xl p-3">
          {product.colors.map((color, index) => (
            <div key={index} className="flex items-center gap-1.5 bg-stone-900 rounded-lg p-1 border border-stone-800">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-stone-300 uppercase px-1">
                {color}
              </span>
              {product.colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="text-stone-500 hover:text-stone-300 text-xs px-1 cursor-pointer"
                  title="Remove color"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {product.colors.length < 5 && (
            <button
              type="button"
              onClick={handleAddColor}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 transition cursor-pointer"
            >
              + Add Color
            </button>
          )}
        </div>
      </div>

      {/* Consistency Guarantee Notice */}
      <div className="rounded-xl bg-amber-950/20 border border-amber-500/20 p-3.5 flex items-start gap-3">
        <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-300">Cross-Medium Consistency:</span>{' '}
          Generating the Master Anchor Shot produces a photorealistic reference image. Every subsequent medium (Billboard, Newspaper, Social Post, etc.) feeds this reference image directly into the Nano-Banana model to ensure 100% brand & product fidelity without humans.
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onGenerateAnchor}
          disabled={isGeneratingAnchor || !product.name.trim()}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 font-medium text-xs sm:text-sm transition cursor-pointer shadow-md disabled:opacity-50"
        >
          {isGeneratingAnchor ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Rendering Master Anchor...</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{hasAnchorImage ? 'Re-Render Master Anchor' : '1. Render Master Anchor'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBatchGenerateAll}
          disabled={isGeneratingAny || !product.name.trim()}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-950/40 disabled:opacity-50"
        >
          {isGeneratingAny && !isGeneratingAnchor ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Campaign Shots...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate Full Campaign (All Mediums)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
