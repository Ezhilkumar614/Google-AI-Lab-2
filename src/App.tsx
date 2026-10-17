import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductForm } from './components/ProductForm';
import { ConsistencyAnchorCard } from './components/ConsistencyAnchorCard';
import { MediumCard } from './components/MediumCard';
import { BrandBookModal } from './components/BrandBookModal';
import { LightboxModal } from './components/LightboxModal';
import { ProductDetails, GeneratedShot, CampaignCopy, MediumKey } from './types';
import { MEDIUMS, PRODUCT_PRESETS } from './constants/presets';
import {
  Sparkles,
  Layers,
  Wand2,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  FileText,
  Share2,
} from 'lucide-react';

export default function App() {
  // Initial default product: AURA Botanical Elixir
  const defaultPreset = PRODUCT_PRESETS[0];
  const [product, setProduct] = useState<ProductDetails>({
    name: defaultPreset.name,
    category: defaultPreset.category,
    description: defaultPreset.description,
    materials: defaultPreset.materials,
    colors: defaultPreset.colors,
    aesthetic: defaultPreset.aesthetic,
    tagline: defaultPreset.tagline,
  });

  // Model selection (Nano-Banana Lite by default, or Nano-Banana 2.1)
  const [modelVariant, setModelVariant] = useState<string>('gemini-3.1-flash-lite-image');

  // API Status
  const [hasKey, setHasKey] = useState<boolean>(true);

  // Master Anchor Shot
  const [anchorShot, setAnchorShot] = useState<GeneratedShot>({
    mediumKey: 'master_anchor',
    name: 'Master Product Anchor',
    imageUrl: '',
    aspectRatio: '1:1',
    status: 'idle',
  });

  // Generated Medium Shots
  const [shots, setShots] = useState<Record<string, GeneratedShot>>({});

  // Campaign Copy (Billboard headline, Newspaper story, Social caption)
  const [copy, setCopy] = useState<CampaignCopy>({
    tagline: 'Pure Botanical Radiance',
    billboardHeadline: 'Awaken Pure Cellular Glow',
    billboardSubhead: 'The Rare Emerald Elixir. Available Worldwide.',
    newspaperHeadline: 'An Uncompromising Formulation in Botanical Alchemy',
    newspaperStory:
      'Harvested from wild high-altitude alpine reserves and bottled in heavy frosted emerald glass, AURA sets a quiet benchmark in sustainable luxury skincare.',
    socialCaption:
      'Form meets botanical ritual. Emerald frosted glass, brushed knurled brass, and potent cold-pressed extracts. Discover the new standard in your daily skin cadence.',
    socialHashtags: ['#BotanicalElixir', '#CleanBeauty', '#ObjectDesign', '#QuietLuxury', '#AuraSkincare'],
  });

  // Generation status flags
  const [isGeneratingAnchor, setIsGeneratingAnchor] = useState<boolean>(false);
  const [generatingMediums, setGeneratingMediums] = useState<Record<string, boolean>>({});
  const [isInspiring, setIsInspiring] = useState<boolean>(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  // Modals
  const [lightboxShot, setLightboxShot] = useState<GeneratedShot | null>(null);
  const [isBrandBookOpen, setIsBrandBookOpen] = useState<boolean>(false);

  // Filter or tab state
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'priority' | 'ooh' | 'print' | 'digital'>('all');

  // Check backend health & API key on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasKey(data.hasKey);
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
      });
  }, []);

  const handleProductChange = (updated: Partial<ProductDetails>) => {
    setProduct((prev) => ({ ...prev, ...updated }));
  };

  // 1. Generate Master Product Anchor Shot
  const handleGenerateAnchor = async () => {
    if (!product.name.trim()) return;

    setIsGeneratingAnchor(true);
    setGlobalError(null);
    setAnchorShot((prev) => ({ ...prev, status: 'generating' }));

    try {
      const res = await fetch('/api/generate-product-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          category: product.category,
          description: product.description,
          colors: product.colors,
          materials: product.materials,
          aesthetic: product.aesthetic,
          model: modelVariant,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to render Master Anchor.');
      }

      if (data.isQuotaExceeded) {
        setQuotaNotice(data.warning || 'Free tier quota for Nano-Banana image models is 0. A paid API key is required for live generation. Showing procedural studio preview.');
      }

      setAnchorShot({
        mediumKey: 'master_anchor',
        name: `${product.name} (Master Anchor)`,
        imageUrl: data.imageUrl,
        base64Data: data.base64Data,
        mimeType: data.mimeType,
        aspectRatio: '1:1',
        promptUsed: data.promptUsed,
        modelUsed: data.modelUsed,
        status: 'success',
        timestamp: Date.now(),
      });
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || 'Error rendering Master Anchor.');
      setAnchorShot((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err.message,
      }));
    } finally {
      setIsGeneratingAnchor(false);
    }
  };

  // 2. Generate a specific medium shot
  const handleGenerateMedium = async (mediumKey: string) => {
    const mediumDef = MEDIUMS.find((m) => m.key === mediumKey);
    if (!mediumDef) return;

    setGeneratingMediums((prev) => ({ ...prev, [mediumKey]: true }));
    setGlobalError(null);
    setShots((prev) => ({
      ...prev,
      [mediumKey]: {
        ...(prev[mediumKey] || {
          mediumKey: mediumKey as MediumKey,
          name: mediumDef.name,
          imageUrl: '',
          aspectRatio: mediumDef.aspectRatio,
        }),
        status: 'generating',
      },
    }));

    try {
      let currentAnchorBase64 = anchorShot.base64Data;

      // If user hasn't generated master anchor yet, generate it on the fly first
      if (!currentAnchorBase64) {
        setIsGeneratingAnchor(true);
        const anchorRes = await fetch('/api/generate-product-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: product.name,
            category: product.category,
            description: product.description,
            colors: product.colors,
            materials: product.materials,
            aesthetic: product.aesthetic,
            model: modelVariant,
          }),
        });
        const anchorData = await anchorRes.json();
        if (anchorRes.ok && anchorData.success) {
          currentAnchorBase64 = anchorData.base64Data;
          setAnchorShot({
            mediumKey: 'master_anchor',
            name: `${product.name} (Master Anchor)`,
            imageUrl: anchorData.imageUrl,
            base64Data: anchorData.base64Data,
            mimeType: anchorData.mimeType,
            aspectRatio: '1:1',
            promptUsed: anchorData.promptUsed,
            modelUsed: anchorData.modelUsed,
            status: 'success',
            timestamp: Date.now(),
          });
        }
        setIsGeneratingAnchor(false);
      }

      // Now generate the specific medium shot conditioned on the anchor
      const res = await fetch('/api/generate-medium-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediumKey,
          productName: product.name,
          category: product.category,
          productDescription: product.description,
          referenceImageBase64: currentAnchorBase64,
          model: modelVariant,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to render ${mediumDef.name}.`);
      }

      if (data.isQuotaExceeded) {
        setQuotaNotice(data.warning || 'Free tier quota for Nano-Banana image models is 0. A paid API key is required for live generation. Showing procedural studio preview.');
      }

      setShots((prev) => ({
        ...prev,
        [mediumKey]: {
          mediumKey: mediumKey as MediumKey,
          name: `${product.name} on ${mediumDef.name}`,
          imageUrl: data.imageUrl,
          base64Data: data.base64Data,
          mimeType: data.mimeType,
          aspectRatio: data.aspectRatio,
          promptUsed: data.promptUsed,
          modelUsed: data.modelUsed,
          status: 'success',
          timestamp: Date.now(),
        },
      }));
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || `Error rendering ${mediumDef.name}.`);
      setShots((prev) => ({
        ...prev,
        [mediumKey]: {
          mediumKey: mediumKey as MediumKey,
          name: mediumDef.name,
          imageUrl: prev[mediumKey]?.imageUrl || '',
          aspectRatio: mediumDef.aspectRatio,
          status: 'error',
          errorMessage: err.message,
        },
      }));
    } finally {
      setGeneratingMediums((prev) => ({ ...prev, [mediumKey]: false }));
    }
  };

  // 3. Batch generate full campaign (Anchor + Copy + Billboard + Newspaper + Social Post)
  const handleBatchGenerateAll = async () => {
    if (!product.name.trim()) return;

    setIsBatchGenerating(true);
    setGlobalError(null);

    try {
      // Step A: Generate Master Anchor if not already present
      let anchorBase64 = anchorShot.base64Data;
      if (!anchorBase64) {
        setIsGeneratingAnchor(true);
        const anchorRes = await fetch('/api/generate-product-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: product.name,
            category: product.category,
            description: product.description,
            colors: product.colors,
            materials: product.materials,
            aesthetic: product.aesthetic,
            model: modelVariant,
          }),
        });
        const anchorData = await anchorRes.json();
        if (anchorRes.ok && anchorData.success) {
          anchorBase64 = anchorData.base64Data;
          setAnchorShot({
            mediumKey: 'master_anchor',
            name: `${product.name} (Master Anchor)`,
            imageUrl: anchorData.imageUrl,
            base64Data: anchorData.base64Data,
            mimeType: anchorData.mimeType,
            aspectRatio: '1:1',
            promptUsed: anchorData.promptUsed,
            modelUsed: anchorData.modelUsed,
            status: 'success',
            timestamp: Date.now(),
          });
        }
        setIsGeneratingAnchor(false);
      }

      // Step B: Generate Campaign Copy in parallel
      fetch('/api/generate-ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          category: product.category,
          description: product.description,
          aesthetic: product.aesthetic,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.copy) {
            setCopy(data.copy);
          }
        })
        .catch((e) => console.warn('Copy generation error:', e));

      // Step C: Generate the core requested mediums: Billboard, Newspaper, Social Post
      const priorityMediums = ['billboard', 'newspaper', 'social_post'];
      for (const key of priorityMediums) {
        await handleGenerateMedium(key);
      }
    } catch (err: any) {
      console.error('Batch generation error:', err);
      setGlobalError(err.message || 'Error during batch campaign generation.');
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // 4. Custom image upload for user's own product photo
  const handleCustomImageUpload = (base64: string) => {
    setAnchorShot({
      mediumKey: 'master_anchor',
      name: `${product.name} (Custom Uploaded Anchor)`,
      imageUrl: base64,
      base64Data: base64,
      aspectRatio: '1:1',
      status: 'success',
      modelUsed: 'Custom User Asset',
      timestamp: Date.now(),
    });
  };

  // 5. Inspire fresh product concept
  const handleInspireProduct = async () => {
    setIsInspiring(true);
    try {
      const res = await fetch('/api/inspire-product', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.concept) {
        const c = data.concept;
        setProduct({
          name: c.productName || 'Bespoke Artifact',
          category: c.category || 'Luxury Goods',
          description: c.description || 'Sleek architectural form with refined materials',
          colors: Array.isArray(c.colors) && c.colors.length > 0 ? c.colors : ['#121214', '#D4AF37', '#EAEAEA'],
          materials: c.materials || 'Frosted glass, brushed bronze, textured paper',
          aesthetic: c.aesthetic || 'Quiet Luxury & Clean Lines',
          tagline: c.tagline || 'Excellence in Form and Function',
        });
      }
    } catch (e) {
      console.error('Failed to inspire concept:', e);
    } finally {
      setIsInspiring(false);
    }
  };

  // Filter mediums according to tab
  const filteredMediums = MEDIUMS.filter((m) => {
    if (selectedCategoryTab === 'all') return true;
    if (selectedCategoryTab === 'priority') {
      return ['billboard', 'newspaper', 'social_post'].includes(m.key);
    }
    if (selectedCategoryTab === 'ooh') {
      return ['billboard', 'transit_shelter'].includes(m.key);
    }
    if (selectedCategoryTab === 'print') {
      return ['newspaper', 'magazine_spread'].includes(m.key);
    }
    if (selectedCategoryTab === 'digital') {
      return ['social_post', 'storefront'].includes(m.key);
    }
    return true;
  });

  const activeShotsCount = Object.values(shots).filter((s) => Boolean(s?.imageUrl)).length + (anchorShot.imageUrl ? 1 : 0);
  const isGeneratingAny = isGeneratingAnchor || isBatchGenerating || Object.values(generatingMediums).some(Boolean);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Studio Header */}
      <Header
        modelVariant={modelVariant}
        onModelChange={setModelVariant}
        onOpenBrandBook={() => setIsBrandBookOpen(true)}
        hasKey={hasKey}
        activeShotsCount={activeShotsCount}
      />

      {/* Quota / Paid Key Notice Banner */}
      {quotaNotice && (
        <div className="bg-amber-950/80 border-b border-amber-800 text-amber-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300 font-semibold">Paid Key Notice:</strong> {quotaNotice}
            </span>
          </div>
          <button
            onClick={() => setQuotaNotice(null)}
            className="text-stone-400 hover:text-stone-200 font-bold ml-4 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-stone-400 hover:text-stone-200 font-bold ml-4 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Top Product Studio Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7">
            <ProductForm
              product={product}
              onChange={handleProductChange}
              onGenerateAnchor={handleGenerateAnchor}
              onBatchGenerateAll={handleBatchGenerateAll}
              isGeneratingAnchor={isGeneratingAnchor}
              isGeneratingAny={isGeneratingAny}
              onCustomImageUpload={handleCustomImageUpload}
              onInspireProduct={handleInspireProduct}
              isInspiring={isInspiring}
              hasAnchorImage={Boolean(anchorShot.imageUrl)}
            />
          </div>

          {/* Right Master Anchor Card (5 cols) */}
          <div className="lg:col-span-5">
            <ConsistencyAnchorCard
              shot={anchorShot}
              product={product}
              onReRender={handleGenerateAnchor}
              onOpenLightbox={(shot) => setLightboxShot(shot)}
              isGenerating={isGeneratingAnchor}
            />
          </div>
        </section>

        {/* Campaign Copy Summary Strip */}
        {copy && (
          <section className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs uppercase tracking-wider font-bold text-stone-200 font-mono">
                  Active Campaign Copy & Art Direction
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 italic">
                Master Tagline: "{copy.tagline || product.tagline}"
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
              <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800/60">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                  Billboard Slogan
                </span>
                <p className="font-bold text-stone-100 mt-0.5">{copy.billboardHeadline}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{copy.billboardSubhead}</p>
              </div>

              <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800/60">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                  Newspaper Broadsheet Lead
                </span>
                <p className="font-semibold text-stone-100 mt-0.5 leading-snug">
                  {copy.newspaperHeadline}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                  {copy.newspaperStory}
                </p>
              </div>

              <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800/60">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                  Social Post Narrative
                </span>
                <p className="text-stone-200 text-[11px] line-clamp-2 mt-0.5">
                  {copy.socialCaption}
                </p>
                <div className="flex flex-wrap gap-1 text-[10px] text-amber-400/90 font-mono mt-1">
                  {copy.socialHashtags.slice(0, 3).map((h, i) => (
                    <span key={i}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Mediums Showcase Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-stone-100 font-serif">
                  Multi-Medium Creative Visualizer
                </h2>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                The product is visualized across billboards, broadsheets, and social posts while locking physical consistency. No humans allowed.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  selectedCategoryTab === 'all'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                All Mediums ({MEDIUMS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('priority')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  selectedCategoryTab === 'priority'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Core (Billboard, Paper, Social)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('ooh')}
                className={`hidden sm:inline-block px-3 py-1 rounded-lg transition cursor-pointer ${
                  selectedCategoryTab === 'ooh'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Outdoor OOH
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('print')}
                className={`hidden sm:inline-block px-3 py-1 rounded-lg transition cursor-pointer ${
                  selectedCategoryTab === 'print'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Print Media
              </button>
            </div>
          </div>

          {/* Mediums Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMediums.map((medium) => (
              <MediumCard
                key={medium.key}
                medium={medium}
                shot={shots[medium.key]}
                product={product}
                copy={copy}
                onGenerate={handleGenerateMedium}
                onOpenLightbox={(shot) => setLightboxShot(shot)}
                isGenerating={Boolean(generatingMediums[medium.key])}
                hasAnchorImage={Boolean(anchorShot.imageUrl)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 px-4 py-6 mt-12 text-center text-xs text-stone-500 space-y-1">
        <p>
          Brand Builder App • Powered by Google Gemini Nano-Banana Series
          (<code>gemini-3.1-flash-lite-image</code> & <code>gemini-nano-banana-2.1</code>)
        </p>
        <p className="text-[11px] text-stone-600">
          Enforcing Cross-Medium Product Consistency & Pure Inanimate Product Photography (Strict No-People Constraint).
        </p>
      </footer>

      {/* Fullscreen Lightbox Modal */}
      <LightboxModal shot={lightboxShot} onClose={() => setLightboxShot(null)} />

      {/* Campaign Brand Deck Modal */}
      <BrandBookModal
        isOpen={isBrandBookOpen}
        onClose={() => setIsBrandBookOpen(false)}
        product={product}
        anchorShot={anchorShot}
        shots={shots}
        mediums={MEDIUMS}
        copy={copy}
      />
    </div>
  );
}
