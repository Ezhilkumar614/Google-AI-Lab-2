import { MediumDefinition, ProductPreset } from '../types';

export const MEDIUMS: MediumDefinition[] = [
  {
    key: 'billboard',
    name: 'Metropolitan Billboard',
    category: 'Outdoor / OOH',
    aspectRatio: '16:9',
    description: 'High-visibility highway & downtown panoramic billboard illuminated at twilight.',
    recommendedSize: '1920 × 1080 (16:9)',
    iconName: 'Maximize2',
  },
  {
    key: 'newspaper',
    name: 'Broadsheet Newspaper',
    category: 'Print Media',
    aspectRatio: '3:4',
    description: 'Authentic morning newspaper broadsheet with fine halftone ink texture and editorial fold.',
    recommendedSize: '1200 × 1600 (3:4)',
    iconName: 'Newspaper',
  },
  {
    key: 'social_post',
    name: 'Social Media Feed Post',
    category: 'Digital / Social',
    aspectRatio: '1:1',
    description: 'Aesthetic square flatlay with travertine pedestals, soft sunbeams, and editorial styling.',
    recommendedSize: '1080 × 1080 (1:1)',
    iconName: 'Instagram',
  },
  {
    key: 'transit_shelter',
    name: 'Transit Shelter Poster',
    category: 'Outdoor / Transit',
    aspectRatio: '9:16',
    description: 'Sleek illuminated glass bus shelter advertising totem on a rain-kissed European avenue.',
    recommendedSize: '1080 × 1920 (9:16)',
    iconName: 'Smartphone',
  },
  {
    key: 'magazine_spread',
    name: 'Glossy Magazine Spread',
    category: 'Print Media',
    aspectRatio: '4:3',
    description: 'Double-page luxury fashion & design publication spread with subtle gloss reflections.',
    recommendedSize: '1600 × 1200 (4:3)',
    iconName: 'BookOpen',
  },
  {
    key: 'storefront',
    name: 'Flagship Boutique Window',
    category: 'Retail Architecture',
    aspectRatio: '4:3',
    description: 'Architectural vitrine display window with brass accents and warm focused spotlights.',
    recommendedSize: '1600 × 1200 (4:3)',
    iconName: 'Store',
  },
];

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: 'aura-botanicals',
    name: 'AURA Botanical Elixir',
    category: 'Luxury Skincare',
    description:
      'Heavy frosted emerald-green cylindrical glass bottle with a knurled brushed brass pipette dropper and a tactile embossed off-white cotton paper label with minimalist gold typography.',
    materials: 'Frosted emerald glass, brushed gold brass, debossed textured paper label',
    colors: ['#0C2E23', '#D4AF37', '#F5F2EB', '#1F1F1F'],
    aesthetic: 'Minimalist Scandinavian Apothecary & Quiet Luxury',
    tagline: 'Pure Botanical Radiance',
  },
  {
    id: 'kroma-obsidian',
    name: 'KROMA No. 9 Fragrance',
    category: 'Haute Parfumerie',
    description:
      'A monolithic faceted obsidian crystal bottle with a heavy carved raw travertine stone magnetic cap, featuring ultra-fine laser etched silver branding and smoked gradient glass.',
    materials: 'Faceted obsidian black glass, porous travertine marble, laser-etched platinum',
    colors: ['#121214', '#9E9E9E', '#E6E1DA', '#2C2B29'],
    aesthetic: 'Brutalist Monolith & Dark Avant-Garde',
    tagline: 'Architecture For The Senses',
  },
  {
    id: 'solaris-brew',
    name: 'SOLARIS Craft Cold Brew',
    category: 'Specialty Beverage',
    description:
      'A sleek amber pharmaceutical-grade glass bottle sealed with a stamped geometric copper crown cap, wrapped in a textured matte terracotta label with clean Bauhaus typography.',
    materials: 'Amber apothecary glass, stamped copper crown, tactile terracotta paper',
    colors: ['#3A1C08', '#C86D51', '#D9822B', '#EDE6DB'],
    aesthetic: 'Warm Bauhaus Artisanal Craft',
    tagline: 'Slow Extraction. Infinite Clarity.',
  },
  {
    id: 'velo-audio',
    name: 'VELO Precision Earbuds',
    category: 'High-End Audio Tech',
    description:
      'Sculpted space-grade matte titanium charging capsule with a bead-blasted bead finish, soft-touch magnetic sliding lid, and subtle debossed geometric soundwave motif in champagne silver.',
    materials: 'Anodized bead-blasted titanium, frosted polycarbonate, liquid silicone',
    colors: ['#282A2E', '#9EA4A9', '#DCD6CD', '#4B5563'],
    aesthetic: 'Aerospace Precision & Functionalist Minimalism',
    tagline: 'Pure Acoustic Silence',
  },
  {
    id: 'lumina-mezcal',
    name: 'LUMINA Artisanal Mezcal',
    category: 'Ultra-Premium Spirits',
    description:
      'Hand-thrown matte black volcanic clay flacon wrapped in raw waxed hemp twine, topped with a scorched charred-oak stopper and stamped with a sealing wax seal.',
    materials: 'Volcanic matte clay, scorched oak wood, natural waxed hemp cord, deep red wax',
    colors: ['#1A1715', '#6B2D19', '#A38B78', '#EBE4DC'],
    aesthetic: 'Ancestral Craft & Raw Earth Textures',
    tagline: 'Distilled From Ancient Earth',
  },
];

export const COLOR_PALETTE_PRESETS = [
  { name: 'Emerald & Gold', colors: ['#0C2E23', '#D4AF37', '#F5F2EB'] },
  { name: 'Obsidian & Silver', colors: ['#121214', '#8E9196', '#E6E1DA'] },
  { name: 'Terracotta & Sand', colors: ['#A0522D', '#D9822B', '#F4EBD9'] },
  { name: 'Cobalt & Chrome', colors: ['#0A2540', '#4A90E2', '#E8EEF5'] },
  { name: 'Nordic Forest & Bone', colors: ['#233D2D', '#A3B18A', '#DAD7CD'] },
  { name: 'Monochrome Noir', colors: ['#000000', '#555555', '#FFFFFF'] },
];
