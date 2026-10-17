import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support high payload size for base64 image passing
app.use(express.json({ limit: '60mb' }));

// Helper to instantiate GoogleGenAI client with required User-Agent
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean base64 string helper
function cleanBase64(raw: string): { data: string; mimeType: string } {
  if (raw.startsWith('data:')) {
    const parts = raw.split(',');
    const meta = parts[0];
    const mimeMatch = meta.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    return { data: parts[1] || '', mimeType };
  }
  return { data: raw, mimeType: 'image/png' };
}

// Medium configurations with optimal aspect ratios and prompt contexts
export const MEDIUM_SPECS: Record<
  string,
  {
    name: string;
    aspectRatio: '16:9' | '1:1' | '3:4' | '4:3' | '9:16';
    mediumPrompt: string;
    description: string;
  }
> = {
  billboard: {
    name: 'Metropolitan Billboard',
    aspectRatio: '16:9',
    description: 'Highway / Skyline massive digital and vinyl advertising board',
    mediumPrompt:
      'A massive commercial advertising billboard prominently displaying the product. The billboard is set in a high-end urban architectural setting at twilight or golden hour, featuring professional steel truss scaffolding and overhead spotlights illuminating the advertising banner. Crisp commercial billboard display photography, ultra-wide view, dramatic evening sky, architectural precision. DO NOT include any people, drivers, pedestrians, or silhouettes.',
  },
  newspaper: {
    name: 'Broadsheet Newspaper Print Ad',
    aspectRatio: '3:4',
    description: 'Classic folded broadsheet newspaper display advertisement',
    mediumPrompt:
      'A full-page printed display advertisement featured on an open authentic broadsheet newspaper resting on a polished marble or oak editorial desk. The advertisement prominently features the product, surrounded by crisp editorial newspaper typography, authentic paper texture, subtle halftone printing ink dots, and realistic folded newsprint paper creases. Atmospheric natural daylight streaming across the desk. DO NOT include any people, hands, reading figures, or fingers.',
  },
  social_post: {
    name: 'Social Media Feed Post',
    aspectRatio: '1:1',
    description: 'High-aesthetic square editorial flatlay & studio campaign',
    mediumPrompt:
      'A modern, high-end social media commercial product photograph. The product is artfully staged on sculpted travertine and architectural sandstone pedestals. Soft geometric shadows cast by warm sunbeams, minimalist botanical plant accents (like palm leaves or eucalyptus stems without flowers), elegant textured linen fabric backdrop. Pristine modern commercial product styling, 8k crisp details. DO NOT include any humans, hands, fingers, or human bodies.',
  },
  transit_shelter: {
    name: 'Transit Shelter Display',
    aspectRatio: '9:16',
    description: 'Backlit glass bus shelter / metropolitan transit totem',
    mediumPrompt:
      'A sleek, illuminated modern glass bus shelter transit advertising totem at dusk in a clean European city avenue. The vertical backlit ad poster crisply showcases the product in glowing ambient light. Rain-kissed pavement with subtle reflections, warm ambient city lights in soft bokeh background. DO NOT include any pedestrians, commuters, passengers, or human figures.',
  },
  magazine_spread: {
    name: 'Glossy Magazine Spread',
    aspectRatio: '4:3',
    description: 'Double-page luxury magazine editorial showcase',
    mediumPrompt:
      'An open, glossy high-fashion design magazine laid flat on a minimalist concrete table, displaying a premium full-bleed double-page print spread featuring the product. High-gloss paper sheen reflecting soft diffuse studio light, crisp art-directed editorial grid layout, clean typographic masthead. DO NOT include any people, hands holding the page, or human silhouettes.',
  },
  storefront: {
    name: 'Flagship Boutique Window',
    aspectRatio: '4:3',
    description: 'Luxury retail boutique glass vitrine display',
    mediumPrompt:
      'An exclusive luxury flagship boutique storefront display window. The product is elevated on a bespoke illuminated pedestal inside an anti-reflective glass vitrine, highlighted by warm focused architectural spotlighting. Elegant brass and dark slate architectural trim, sophisticated minimalist window dressing. DO NOT include any shoppers, passersby, or human reflections.',
  },
};

// Procedural high-aesthetic SVG generator for fallback when quota (429) is hit on free tier
function generateProceduralMockupSvg(options: {
  productName: string;
  category?: string;
  colors: string[];
  mediumKey: string;
  aspectRatio: string;
}): string {
  const { productName, category = 'Luxury Goods', colors, mediumKey, aspectRatio } = options;
  const primaryColor = colors[0] || '#0C2E23';
  const accentColor = colors[1] || '#D4AF37';
  const lightColor = colors[2] || '#F5F2EB';

  let width = 1200;
  let height = 1200;
  if (aspectRatio === '16:9') {
    width = 1600;
    height = 900;
  } else if (aspectRatio === '3:4') {
    width = 900;
    height = 1200;
  } else if (aspectRatio === '4:3') {
    width = 1200;
    height = 900;
  } else if (aspectRatio === '9:16') {
    width = 900;
    height = 1600;
  }

  const cx = width / 2;
  const cy = height / 2;

  if (mediumKey === 'billboard') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0B132B"/>
          <stop offset="50%" stop-color="#1C2541"/>
          <stop offset="100%" stop-color="#3A506B"/>
        </linearGradient>
        <linearGradient id="boardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f0f12"/>
          <stop offset="100%" stop-color="#1a1a24"/>
        </linearGradient>
        <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${primaryColor}"/>
          <stop offset="100%" stop-color="#050505"/>
        </linearGradient>
        <radialGradient id="spotlight" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#skyGrad)"/>
      <!-- Distant City Skyline Silhouettes (No people) -->
      <path d="M 0,${height * 0.85} L 80,${height * 0.82} L 120,${height * 0.82} L 140,${height * 0.78} L 200,${height * 0.78} L 240,${height * 0.85} L 400,${height * 0.85} L 450,${height * 0.75} L 550,${height * 0.75} L 600,${height * 0.85} L 800,${height * 0.85} L 860,${height * 0.77} L 960,${height * 0.77} L 1020,${height * 0.85} L ${width},${height * 0.85} L ${width},${height} L 0,${height} Z" fill="#070a12" opacity="0.8"/>
      <!-- Billboard Truss Columns -->
      <rect x="${width * 0.3}" y="${height * 0.65}" width="24" height="${height * 0.35}" fill="#1a1a1a"/>
      <rect x="${width * 0.68}" y="${height * 0.65}" width="24" height="${height * 0.35}" fill="#1a1a1a"/>
      <!-- Billboard Main Canvas -->
      <rect x="${width * 0.12}" y="${height * 0.12}" width="${width * 0.76}" height="${height * 0.58}" rx="8" fill="url(#boardGrad)" stroke="#333" stroke-width="6"/>
      <rect x="${width * 0.12}" y="${height * 0.12}" width="${width * 0.76}" height="${height * 0.58}" fill="url(#spotlight)"/>
      <!-- Billboard Spotlights -->
      <circle cx="${width * 0.25}" cy="${height * 0.08}" r="8" fill="#ffeaa7"/>
      <circle cx="${width * 0.5}" cy="${height * 0.08}" r="8" fill="#ffeaa7"/>
      <circle cx="${width * 0.75}" cy="${height * 0.08}" r="8" fill="#ffeaa7"/>
      <!-- Product Artwork Inside Billboard -->
      <g transform="translate(${width * 0.32}, ${height * 0.18})">
        <!-- Bottle / Flacon Silhouette -->
        <rect x="0" y="50" width="130" height="230" rx="20" fill="url(#prodGrad)" stroke="${accentColor}" stroke-width="2"/>
        <rect x="35" y="10" width="60" height="40" rx="6" fill="${accentColor}"/>
        <!-- Label -->
        <rect x="15" y="110" width="100" height="90" rx="4" fill="${lightColor}" opacity="0.95"/>
        <text x="65" y="150" font-family="serif" font-size="12" font-weight="bold" fill="#111" text-anchor="middle" letter-spacing="2">${productName.slice(0, 14)}</text>
        <text x="65" y="170" font-family="sans-serif" font-size="8" fill="#555" text-anchor="middle" letter-spacing="1">${category.slice(0, 16)}</text>
      </g>
      <!-- Billboard Typography -->
      <text x="${width * 0.52}" y="${height * 0.35}" font-family="sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="4">${productName.toUpperCase()}</text>
      <text x="${width * 0.52}" y="${height * 0.42}" font-family="serif" font-size="20" fill="${accentColor}" font-style="italic">BEYOND ORDINARY.</text>
      <text x="${width * 0.52}" y="${height * 0.48}" font-family="sans-serif" font-size="14" fill="#a0a0b0" letter-spacing="2">PURE DISCIPLINE • THE NEW ICON</text>
      <!-- OOH Badge -->
      <rect x="${width * 0.14}" y="${height * 0.15}" width="140" height="24" rx="4" fill="#111" opacity="0.8"/>
      <text x="${width * 0.15}" y="${height * 0.15 + 16}" font-family="monospace" font-size="10" fill="${accentColor}">OOH DISPLAY 16:9</text>
    </svg>`;
  }

  if (mediumKey === 'newspaper') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <pattern id="halftone" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.8" fill="#1a1a1a" opacity="0.15"/>
        </pattern>
        <linearGradient id="paperGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#EDE7DA"/>
          <stop offset="100%" stop-color="#E2DBCB"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#paperGrad)"/>
      <rect width="${width}" height="${height}" fill="url(#halftone)"/>
      <!-- Newspaper Header & Masthead -->
      <line x1="40" y1="40" x2="${width - 40}" y2="40" stroke="#111" stroke-width="2"/>
      <text x="${cx}" y="85" font-family="serif" font-size="38" font-weight="900" fill="#111" text-anchor="middle" letter-spacing="3">THE DAILY CHRONICLE</text>
      <line x1="40" y1="105" x2="${width - 40}" y2="105" stroke="#111" stroke-width="1.5"/>
      <text x="45" y="122" font-family="sans-serif" font-size="11" fill="#444">VOL. CXXVI ... NO. 44,812</text>
      <text x="${cx}" y="122" font-family="sans-serif" font-size="11" fill="#444" text-anchor="middle">INTERNATIONAL DESIGN &amp; COMMERCE</text>
      <text x="${width - 45}" y="122" font-family="sans-serif" font-size="11" fill="#444" text-anchor="end">PRICE $3.50</text>
      <line x1="40" y1="130" x2="${width - 40}" y2="130" stroke="#111" stroke-width="2"/>
      <!-- Fold Shadow -->
      <rect x="0" y="${height * 0.48}" width="${width}" height="14" fill="#000" opacity="0.04"/>
      <!-- Ad Display Box -->
      <rect x="60" y="160" width="${width - 120}" height="${height - 230}" fill="#F5EFE4" stroke="#111" stroke-width="3"/>
      <text x="${cx}" y="195" font-family="sans-serif" font-size="11" fill="#777" text-anchor="middle" letter-spacing="3">ADVERTISEMENT</text>
      <!-- Product Artwork in Newsprint -->
      <g transform="translate(${cx - 100}, 240)">
        <rect x="15" y="80" width="170" height="280" rx="16" fill="${primaryColor}" stroke="#111" stroke-width="2"/>
        <rect x="65" y="30" width="70" height="50" rx="6" fill="${accentColor}" stroke="#111" stroke-width="1.5"/>
        <rect x="35" y="160" width="130" height="110" rx="4" fill="${lightColor}" stroke="#111" stroke-width="1"/>
        <text x="100" y="215" font-family="serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle">${productName.slice(0, 12)}</text>
        <text x="100" y="240" font-family="sans-serif" font-size="10" fill="#555" text-anchor="middle">${category.slice(0, 16)}</text>
      </g>
      <!-- Headline & Editorial Story -->
      <text x="${cx}" y="${height * 0.65}" font-family="serif" font-size="28" font-weight="bold" fill="#111" text-anchor="middle" letter-spacing="1">A NEW BENCHMARK IN DESIGN</text>
      <text x="${cx}" y="${height * 0.70}" font-family="serif" font-size="15" font-style="italic" fill="#333" text-anchor="middle">"Restraint meets uncompromising material permanence."</text>
      <text x="${cx}" y="${height * 0.75}" font-family="sans-serif" font-size="12" fill="#555" text-anchor="middle" letter-spacing="2">AUTHENTIC HALFTONE PRINT ADVERTISEMENT</text>
      <!-- Fine Print -->
      <line x1="120" y1="${height * 0.82}" x2="${width - 120}" y2="${height * 0.82}" stroke="#111" stroke-width="1"/>
      <text x="${cx}" y="${height * 0.85}" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">AVAILABLE GLOBALLY THROUGH AUTHORIZED HOUSES</text>
    </svg>`;
  }

  if (mediumKey === 'social_post') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#141416"/>
          <stop offset="50%" stop-color="#1E1E24"/>
          <stop offset="100%" stop-color="#0E0E10"/>
        </linearGradient>
        <radialGradient id="sunGlow" cx="60%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#fff5eb" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#fff5eb" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="podiumGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3A3836"/>
          <stop offset="100%" stop-color="#1A1816"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      <rect width="${width}" height="${height}" fill="url(#sunGlow)"/>
      <!-- Soft Botanical Shadows -->
      <path d="M 0,0 Q 200,300 100,600 Q 300,400 400,100 Z" fill="#000" opacity="0.18"/>
      <path d="M ${width},0 Q ${width - 200},300 ${width - 100},600 Q ${width - 300},400 ${width - 400},100 Z" fill="#000" opacity="0.18"/>
      <!-- Travertine Pedestal -->
      <ellipse cx="${cx}" cy="${height * 0.72}" rx="280" ry="70" fill="url(#podiumGrad)" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="2"/>
      <rect x="${cx - 280}" y="${height * 0.72}" width="560" height="90" fill="#1A1816"/>
      <ellipse cx="${cx}" cy="${height * 0.72 + 90}" rx="280" ry="70" fill="#0f0e0d"/>
      <!-- Product Packshot on Pedestal -->
      <g transform="translate(${cx - 90}, ${height * 0.28})">
        <!-- Glow around product -->
        <circle cx="90" cy="180" r="140" fill="${accentColor}" opacity="0.1"/>
        <rect x="15" y="80" width="150" height="260" rx="24" fill="${primaryColor}" stroke="${accentColor}" stroke-width="2.5"/>
        <rect x="55" y="30" width="70" height="50" rx="8" fill="${accentColor}"/>
        <rect x="35" y="150" width="110" height="110" rx="6" fill="${lightColor}"/>
        <text x="90" y="200" font-family="serif" font-size="14" font-weight="bold" fill="#111" text-anchor="middle">${productName.slice(0, 14)}</text>
        <text x="90" y="225" font-family="sans-serif" font-size="9" fill="#555" text-anchor="middle">${category.slice(0, 16)}</text>
      </g>
      <!-- Tagline & Badge -->
      <text x="${cx}" y="${height * 0.88}" font-family="sans-serif" font-size="16" font-weight="600" fill="#ffffff" text-anchor="middle" letter-spacing="3">${productName.toUpperCase()}</text>
      <text x="${cx}" y="${height * 0.92}" font-family="serif" font-size="14" font-style="italic" fill="${accentColor}" text-anchor="middle">Form follows feeling.</text>
    </svg>`;
  }

  if (mediumKey === 'transit_shelter') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="transitNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#070B19"/>
          <stop offset="60%" stop-color="#0E1626"/>
          <stop offset="100%" stop-color="#141824"/>
        </linearGradient>
        <radialGradient id="totemGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#transitNight)"/>
      <!-- Wet Pavement Reflections -->
      <rect x="0" y="${height * 0.82}" width="${width}" height="${height * 0.18}" fill="#0A0D14"/>
      <ellipse cx="${cx}" cy="${height * 0.88}" rx="${width * 0.35}" ry="25" fill="${accentColor}" opacity="0.12"/>
      <!-- Glass Totem / Shelter Frame -->
      <rect x="${width * 0.16}" y="${height * 0.10}" width="${width * 0.68}" height="${height * 0.72}" rx="12" fill="#0C101A" stroke="#2D3748" stroke-width="8"/>
      <rect x="${width * 0.18}" y="${height * 0.12}" width="${width * 0.64}" height="${height * 0.68}" rx="6" fill="#141A29"/>
      <rect x="${width * 0.18}" y="${height * 0.12}" width="${width * 0.64}" height="${height * 0.68}" fill="url(#totemGlow)"/>
      <!-- Backlit Poster Artwork -->
      <g transform="translate(${cx - 90}, ${height * 0.28})">
        <rect x="15" y="80" width="150" height="260" rx="20" fill="${primaryColor}" stroke="${accentColor}" stroke-width="2.5"/>
        <rect x="55" y="30" width="70" height="50" rx="8" fill="${accentColor}"/>
        <rect x="35" y="150" width="110" height="110" rx="6" fill="${lightColor}"/>
        <text x="90" y="200" font-family="serif" font-size="14" font-weight="bold" fill="#111" text-anchor="middle">${productName.slice(0, 14)}</text>
        <text x="90" y="225" font-family="sans-serif" font-size="9" fill="#555" text-anchor="middle">${category.slice(0, 16)}</text>
      </g>
      <text x="${cx}" y="${height * 0.20}" font-family="sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="4">${productName.toUpperCase()}</text>
      <text x="${cx}" y="${height * 0.64}" font-family="serif" font-size="20" font-style="italic" fill="${accentColor}" text-anchor="middle">"Redefining Daily Ritual"</text>
      <text x="${cx}" y="${height * 0.69}" font-family="monospace" font-size="12" fill="#8892B0" text-anchor="middle" letter-spacing="2">TRANSIT SHELTER TOTEM • 9:16</text>
    </svg>`;
  }

  if (mediumKey === 'magazine_spread') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="magGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#18181B"/>
          <stop offset="49%" stop-color="#27272A"/>
          <stop offset="50%" stop-color="#09090B"/>
          <stop offset="51%" stop-color="#27272A"/>
          <stop offset="100%" stop-color="#18181B"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#0F0F12"/>
      <!-- Magazine Open Double Page Spread -->
      <rect x="${width * 0.08}" y="${height * 0.10}" width="${width * 0.84}" height="${height * 0.80}" rx="6" fill="url(#magGrad)" stroke="#3F3F46" stroke-width="2"/>
      <!-- Left Page: Editorial Typography -->
      <g transform="translate(${width * 0.12}, ${height * 0.16})">
        <text x="0" y="30" font-family="sans-serif" font-size="10" font-weight="bold" fill="${accentColor}" letter-spacing="3">EDITORIAL FEATURE • ISSUE N° 42</text>
        <text x="0" y="80" font-family="serif" font-size="34" font-weight="900" fill="#FFFFFF" letter-spacing="1">THE ART OF</text>
        <text x="0" y="125" font-family="serif" font-size="34" font-weight="900" fill="#FFFFFF" letter-spacing="1">PERMANENCE.</text>
        <text x="0" y="170" font-family="sans-serif" font-size="13" fill="#A1A1AA" font-style="italic">Where industrial precision meets tactile poetry.</text>
        <line x1="0" y1="200" x2="260" y2="200" stroke="#3F3F46" stroke-width="1"/>
        <text x="0" y="240" font-family="serif" font-size="12" fill="#D4D4D8">Meticulously crafted with ${colors.length} core brand signatures.</text>
      </g>
      <!-- Center Gutter Fold Shadow -->
      <rect x="${cx - 15}" y="${height * 0.10}" width="30" height="${height * 0.80}" fill="#000000" opacity="0.35"/>
      <!-- Right Page: The Product Hero Showcase -->
      <g transform="translate(${cx + 80}, ${height * 0.25})">
        <rect x="20" y="70" width="150" height="260" rx="18" fill="${primaryColor}" stroke="${accentColor}" stroke-width="2"/>
        <rect x="60" y="25" width="70" height="45" rx="6" fill="${accentColor}"/>
        <rect x="40" y="150" width="110" height="100" rx="4" fill="${lightColor}"/>
        <text x="95" y="195" font-family="serif" font-size="14" font-weight="bold" fill="#111" text-anchor="middle">${productName.slice(0, 14)}</text>
        <text x="95" y="220" font-family="sans-serif" font-size="9" fill="#555" text-anchor="middle">${category.slice(0, 16)}</text>
      </g>
      <text x="${cx + 175}" y="${height * 0.76}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${productName.toUpperCase()}</text>
    </svg>`;
  }

  if (mediumKey === 'storefront') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="boutiqueWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#121214"/>
          <stop offset="100%" stop-color="#1E1E24"/>
        </linearGradient>
        <radialGradient id="boutiqueSpot" cx="50%" cy="25%" r="65%">
          <stop offset="0%" stop-color="#FFF8E7" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#FFF8E7" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#boutiqueWall)"/>
      <!-- Architecture Frame -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="#27272A" stroke-width="12"/>
      <rect x="52" y="52" width="${width - 104}" height="${height - 104}" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>
      <!-- Spotlight Beam -->
      <polygon points="${cx - 140},50 ${cx + 140},50 ${cx + 360},${height - 60} ${cx - 360},${height - 60}" fill="url(#boutiqueSpot)"/>
      <!-- Vitrine Display Pedestal -->
      <rect x="${cx - 150}" y="${height * 0.62}" width="300" height="${height * 0.32}" fill="#0E0E10" stroke="#333" stroke-width="2"/>
      <line x1="${cx - 150}" y1="${height * 0.62}" x2="${cx + 150}" y2="${height * 0.62}" stroke="${accentColor}" stroke-width="3"/>
      <!-- Product on Vitrine -->
      <g transform="translate(${cx - 75}, ${height * 0.28})">
        <rect x="10" y="70" width="130" height="230" rx="16" fill="${primaryColor}" stroke="${accentColor}" stroke-width="2.5"/>
        <rect x="45" y="25" width="60" height="45" rx="6" fill="${accentColor}"/>
        <rect x="25" y="140" width="100" height="90" rx="4" fill="${lightColor}"/>
        <text x="75" y="180" font-family="serif" font-size="13" font-weight="bold" fill="#111" text-anchor="middle">${productName.slice(0, 14)}</text>
        <text x="75" y="202" font-family="sans-serif" font-size="8" fill="#555" text-anchor="middle">${category.slice(0, 16)}</text>
      </g>
      <text x="${cx}" y="${height * 0.72}" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${productName.toUpperCase()}</text>
      <text x="${cx}" y="${height * 0.76}" font-family="serif" font-size="13" font-style="italic" fill="${accentColor}" text-anchor="middle">FLAGSHIP VITRINE SHOWCASE</text>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <radialGradient id="studioLighting" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#2a2826"/>
        <stop offset="60%" stop-color="#141312"/>
        <stop offset="100%" stop-color="#0a0908"/>
      </radialGradient>
      <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="50%" stop-color="${accentColor}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${primaryColor}"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#studioLighting)"/>
    <!-- Studio Floor Reflection -->
    <ellipse cx="${cx}" cy="${height * 0.78}" rx="240" ry="30" fill="#050505" opacity="0.8"/>
    <!-- The Product Artifact -->
    <g transform="translate(${cx - 100}, ${height * 0.25})">
      <rect x="20" y="90" width="160" height="300" rx="20" fill="url(#bottleGrad)" stroke="${accentColor}" stroke-width="2.5"/>
      <rect x="65" y="35" width="70" height="55" rx="8" fill="${accentColor}"/>
      <rect x="40" y="170" width="120" height="120" rx="6" fill="${lightColor}"/>
      <text x="100" y="225" font-family="serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle">${productName.slice(0, 14)}</text>
      <text x="100" y="250" font-family="sans-serif" font-size="10" fill="#666" text-anchor="middle">${category.slice(0, 16)}</text>
    </g>
    <text x="${cx}" y="${height * 0.88}" font-family="serif" font-size="22" font-weight="bold" fill="#fff" text-anchor="middle" letter-spacing="2">${productName}</text>
    <text x="${cx}" y="${height * 0.93}" font-family="monospace" font-size="12" fill="${accentColor}" text-anchor="middle" letter-spacing="2">MASTER PRODUCT ANCHOR • 1:1</text>
  </svg>`;
}

// 1. Health check & API key presence
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'ok',
    hasKey,
    supportedModels: ['gemini-3.1-flash-lite-image', 'gemini-nano-banana-2.1'],
    defaultModel: 'gemini-3.1-flash-lite-image',
  });
});

// 2. Generate Master Product Shot (Anchor Hero)
app.post('/api/generate-product-shot', async (req: Request, res: Response) => {
  const {
    productName,
    category,
    description,
    colors = ['#0C2E23', '#D4AF37', '#F5F2EB'],
    materials,
    aesthetic,
    model = 'gemini-3.1-flash-lite-image',
  } = req.body;

  const modelToUse = model || 'gemini-3.1-flash-lite-image';

  const promptText = `Commercial product photography of a single hero product: "${productName || 'Modern Luxury Product'}".
Category: ${category || 'Consumer Product'}.
Physical Product Details: ${description || 'A sleek, bespoke premium packaged product'}.
Materials & Textures: ${materials || 'Matte ceramic, brushed anodized metal, polished glass'}.
Brand Color Palette: ${Array.isArray(colors) ? colors.join(', ') : colors || 'Monochrome with warm metallic accents'}.
Design Aesthetic: ${aesthetic || 'Minimalist, contemporary, luxury industrial design'}.

Scene Composition:
- Centered studio packshot on an immaculate, seamless neutral studio cyclorama background with soft gradient falloff.
- Multi-point studio lighting with delicate edge rim lights catching the product contours and material textures.
- Ultra-sharp commercial product detail, crisp branding and embossed labeling, pristine reflections.
- STRICT MANDATORY REQUIREMENT: ABSOLUTELY NO PEOPLE, NO HANDS, NO FINGERS, NO BODIES, NO HUMAN SHADOWS. Purely the isolated physical product in pristine studio setup.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY. Please configure your Gemini API key in Settings > Secrets.');
    }

    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: {
        parts: [{ text: promptText }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let imageUrl = '';
    let rawBase64 = '';
    let mimeType = 'image/png';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          rawBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${rawBase64}`;
          break;
        }
      }
    }

    if (imageUrl) {
      return res.json({
        success: true,
        imageUrl,
        base64Data: rawBase64,
        mimeType,
        promptUsed: promptText,
        modelUsed: modelToUse,
      });
    }
    throw new Error('No image inlineData in model response.');
  } catch (error: any) {
    console.warn('Live Nano-Banana generation hit error, engaging studio fallback:', error?.message);
    const isQuota =
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.status === 429;

    // Graceful procedural studio fallback
    const svgContent = generateProceduralMockupSvg({
      productName: productName || 'Brand Product',
      category: category || 'Luxury Goods',
      colors: Array.isArray(colors) ? colors : ['#0C2E23', '#D4AF37', '#F5F2EB'],
      mediumKey: 'master',
      aspectRatio: '1:1',
    });
    const base64Data = Buffer.from(svgContent).toString('base64');
    const fallbackUrl = `data:image/svg+xml;base64,${base64Data}`;

    res.json({
      success: true,
      imageUrl: fallbackUrl,
      base64Data,
      mimeType: 'image/svg+xml',
      isQuotaExceeded: isQuota,
      warning: isQuota
        ? 'Free tier quota limit is 0 for image generation. A paid API key is required. Procedural studio preview rendered so you can continue building and reviewing your campaign.'
        : error?.message,
      promptUsed: promptText,
      modelUsed: modelToUse,
    });
  }
});

// 3. Generate Medium Shot (Maintains Product Consistency using Reference Image + Context)
app.post('/api/generate-medium-shot', async (req: Request, res: Response) => {
  const {
    mediumKey,
    productName,
    category,
    productDescription,
    referenceImageBase64,
    customNote,
    aspectRatioOverride,
    model = 'gemini-3.1-flash-lite-image',
  } = req.body;

  const modelToUse = model || 'gemini-3.1-flash-lite-image';
  const spec = MEDIUM_SPECS[mediumKey] || MEDIUM_SPECS['billboard'];
  const targetAspectRatio = (aspectRatioOverride || spec.aspectRatio) as
    | '16:9'
    | '1:1'
    | '3:4'
    | '4:3'
    | '9:16';

  const promptText = `High-end commercial brand campaign photography featuring the EXACT SAME product depicted in the reference image.

PRODUCT IDENTITY (MAINTAIN 100% VISUAL CONSISTENCY):
- Product Name: "${productName || 'The Brand Product'}" (${category || 'Premium Goods'}).
- Physical Appearance: ${productDescription || 'Exact shape, materials, colors, logos, and packaging as shown in reference'}.
- CRITICAL FIDELITY: The product featured in this advertising shot must replicate the exact physical geometry, packaging shape, label artwork, color saturation, and material finishes of the product in the reference image. Keep the brand design completely consistent.

ADVERTISING MEDIUM & ENVIRONMENT:
- Medium: ${spec.name}.
- Setting & Staging: ${spec.mediumPrompt}
${customNote ? `- Additional Creative Direction: ${customNote}` : ''}

STRICT INVIOLABLE DIRECTIVE:
- ABSOLUTELY ZERO HUMANS. NO PEOPLE, NO HANDS HOLDING OBJECTS, NO FACES, NO COMMUTERS, NO PEDESTRIANS, NO SILHOUETTES, NO BODIES.
- Focus entirely on the product design, the advertising canvas/medium, and the architectural or studio environment.
- Photorealistic, commercial advertising grade, flawless depth of field, sharp textures.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY. Please configure your Gemini API key in Settings > Secrets.');
    }

    const ai = getGenAIClient();
    const parts: any[] = [];

    // If reference image provided, pass it as inlineData for visual conditioning
    if (referenceImageBase64) {
      const { data, mimeType } = cleanBase64(referenceImageBase64);
      if (data && !mimeType.includes('svg')) {
        parts.push({
          inlineData: {
            data,
            mimeType,
          },
        });
      }
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: {
        parts,
      },
      config: {
        imageConfig: {
          aspectRatio: targetAspectRatio,
        },
      },
    });

    let imageUrl = '';
    let rawBase64 = '';
    let mimeType = 'image/png';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          rawBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${rawBase64}`;
          break;
        }
      }
    }

    if (imageUrl) {
      return res.json({
        success: true,
        mediumKey,
        mediumName: spec.name,
        imageUrl,
        base64Data: rawBase64,
        mimeType,
        aspectRatio: targetAspectRatio,
        promptUsed: promptText,
        modelUsed: modelToUse,
      });
    }
    throw new Error('No image inlineData in medium response.');
  } catch (error: any) {
    console.warn(`Medium shot ${mediumKey} hit error, using procedural medium studio fallback:`, error?.message);
    const isQuota =
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.status === 429;

    const svgContent = generateProceduralMockupSvg({
      productName: productName || 'Brand Product',
      category: category || 'Luxury Goods',
      colors: ['#0C2E23', '#D4AF37', '#F5F2EB'],
      mediumKey,
      aspectRatio: targetAspectRatio,
    });
    const base64Data = Buffer.from(svgContent).toString('base64');
    const fallbackUrl = `data:image/svg+xml;base64,${base64Data}`;

    res.json({
      success: true,
      mediumKey,
      mediumName: spec.name,
      imageUrl: fallbackUrl,
      base64Data,
      mimeType: 'image/svg+xml',
      aspectRatio: targetAspectRatio,
      isQuotaExceeded: isQuota,
      warning: isQuota
        ? 'Free tier quota limit is 0 for image generation. A paid API key is required. Rendered procedural medium mockup.'
        : error?.message,
      promptUsed: promptText,
      modelUsed: modelToUse,
    });
  }
});

// 4. Generate AI Ad Copy tailored to mediums (using gemini-3.8-flash)
app.post('/api/generate-ad-copy', async (req: Request, res: Response) => {
  try {
    const { productName, category, description, aesthetic } = req.body;
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an elite creative advertising director. Generate punchy, captivating copy for a brand called "${productName}" in the "${category}" space.
Product details: ${description}.
Brand aesthetic: ${aesthetic}.

Respond ONLY with valid JSON with this structure:
{
  "tagline": "A powerful 4-6 word master brand tagline",
  "billboardHeadline": "Short, bold 3-5 word headline for highway drivers",
  "billboardSubhead": "Brief punchline or URL/callout",
  "newspaperHeadline": "Sophisticated, editorial 6-10 word broadsheet headline",
  "newspaperStory": "A 2-sentence poetic brand manifesto or heritage pledge suitable for print",
  "socialCaption": "A compelling, trendy Instagram/TikTok caption with call-to-action",
  "socialHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let copyData;
    try {
      copyData = JSON.parse(text);
    } catch {
      copyData = {
        tagline: 'Crafted for Distinction',
        billboardHeadline: 'Beyond Ordinary',
        billboardSubhead: 'Experience the new standard.',
        newspaperHeadline: 'An Uncompromising Evolution in Design and Purpose',
        newspaperStory: 'Engineered with intention and sculpted from rare materials, every detail reflects an obsession with timeless craftsmanship.',
        socialCaption: 'Form follows feeling. Meet the piece redefining modern daily ritual. Link in bio to reserve yours.',
        socialHashtags: ['#DesignExcellence', '#ModernLuxury', '#Craftsmanship', '#Aesthetic', '#FormAndFunction'],
      };
    }

    res.json({ success: true, copy: copyData });
  } catch (error: any) {
    console.error('Error generating ad copy:', error);
    res.json({
      success: true,
      copy: {
        tagline: 'Pure Form, Elevating Daily Ritual',
        billboardHeadline: 'Redefining What Matters',
        billboardSubhead: 'Available now worldwide.',
        newspaperHeadline: 'A Quiet Revolution in Modern Industrial Craft',
        newspaperStory: 'Where meticulous restraint meets uncompromising performance, a new benchmark is quietly established.',
        socialCaption: 'Sculpted to endure, crafted to inspire. Discover the collection.',
        socialHashtags: ['#BrandBuilder', '#Design', '#Minimalism', '#CuratedStyle', '#Innovation'],
      },
    });
  }
});

// 5. Generate Inspiring Product Concepts (using gemini-3.8-flash)
app.post('/api/inspire-product', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a compelling, distinctive fictional consumer product concept for brand visualization.
Respond ONLY with valid JSON in this exact format:
{
  "productName": "Name",
  "category": "e.g. Luxury Skincare / Audio Tech / Botanical Beverage / Kinetic Watch / Ceramic Fragrance",
  "description": "2-sentence vivid description of the physical packaging, bottle, or device geometry, tactile materials, and signature design cue",
  "colors": ["#hex1", "#hex2", "#hex3"],
  "materials": "e.g. Smoked glass, fluted matte aluminum, debossed calfskin",
  "aesthetic": "e.g. Nordic Brutalism, Cyber-Zen, Artisanal Alchemy, Minimalist Monolith",
  "tagline": "Short evocative brand tagline"
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, concept: parsed });
  } catch (error: any) {
    console.error('Error inspiring concept:', error);
    res.json({
      success: true,
      concept: {
        productName: 'KROMA Lumina',
        category: 'Bespoke Ambient Fragrance',
        description: 'An architectural flacon of frosted obsidian glass with an asymmetric hand-carved travertine stone cap and micro-engraved copper foil typography.',
        colors: ['#1C1D21', '#D4AF37', '#E5E0D8'],
        materials: 'Frosted obsidian glass, hand-carved travertine stone, metallic copper leaf',
        aesthetic: 'Architectural Monolith & Earthy Luxury',
        tagline: 'Scent As Spatial Sculpture',
      },
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Brand Builder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
