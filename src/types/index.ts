export interface Movie {
  id: string;
  title: string;
  titleFa: string;
  year: number;
  genre: string[];
  rating: number;
  poster: string;
  backdrop: string;
  duration: string;
  country: string;
  description: string;
  descriptionFa: string;
  embedUrl?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  accessType: 'free' | 'subscription';
}

export interface Series {
  id: string;
  title: string;
  titleFa: string;
  year: number;
  genre: string[];
  rating: number;
  poster: string;
  backdrop: string;
  seasons: number;
  episodes: number;
  country: string;
  description: string;
  descriptionFa: string;
  isFeatured?: boolean;
  isNew?: boolean;
  accessType: 'free' | 'subscription';
}

export interface Software {
  id: string;
  name: string;
  nameFa: string;
  version: string;
  category: string;
  platform: string[];
  thumbnail: string;
  screenshots: string[];
  description: string;
  descriptionFa: string;
  accessType: 'free' | 'paid' | 'vip';
  price?: number;
  currency?: string;
  downloads: number;
  rating: number;
  size: string;
  developer: string;
  changelog?: string;
}

export interface Game {
  id: string;
  title: string;
  titleFa: string;
  genre: string[];
  platform: string[];
  thumbnail: string;
  screenshots: string[];
  description: string;
  descriptionFa: string;
  accessType: 'free' | 'paid' | 'vip';
  price?: number;
  currency?: string;
  rating: number;
  releaseYear: number;
  developer: string;
  publisher: string;
  size: string;
}

export interface Product {
  id: string;
  name: string;
  nameFa: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  thumbnail: string;
  images: string[];
  description: string;
  descriptionFa: string;
  stock: number;
  rating: number;
  reviewCount: number;
  brand: string;
  isNew?: boolean;
  isSale?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameFa: string;
  period: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  price: number;
  originalPrice?: number;
  currency: string;
  features: string[];
  featuresFa: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

export type Language = 'en' | 'fa';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription?: string;
  country: string;
  joinedAt: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'software' | 'game';
  name: string;
  price: number;
  currency: string;
  thumbnail: string;
  quantity: number;
}
