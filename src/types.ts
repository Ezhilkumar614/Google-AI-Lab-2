export type MediumKey =
  | 'billboard'
  | 'newspaper'
  | 'social_post'
  | 'transit_shelter'
  | 'magazine_spread'
  | 'storefront';

export type AspectRatio = '16:9' | '1:1' | '3:4' | '4:3' | '9:16';

export interface MediumDefinition {
  key: MediumKey;
  name: string;
  category: string;
  aspectRatio: AspectRatio;
  description: string;
  recommendedSize: string;
  iconName: string;
}

export interface ProductDetails {
  name: string;
  category: string;
  description: string;
  materials: string;
  colors: string[];
  aesthetic: string;
  tagline?: string;
}

export interface GeneratedShot {
  mediumKey: MediumKey | 'master_anchor';
  name: string;
  imageUrl: string;
  base64Data?: string;
  mimeType?: string;
  aspectRatio: AspectRatio;
  promptUsed?: string;
  modelUsed?: string;
  status: 'idle' | 'generating' | 'success' | 'error';
  errorMessage?: string;
  timestamp?: number;
}

export interface CampaignCopy {
  tagline: string;
  billboardHeadline: string;
  billboardSubhead: string;
  newspaperHeadline: string;
  newspaperStory: string;
  socialCaption: string;
  socialHashtags: string[];
}

export interface ProductPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  materials: string;
  colors: string[];
  aesthetic: string;
  tagline: string;
}
