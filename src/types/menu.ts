// Menu data type definitions
import type { ImageMetadata } from 'astro';

export interface MenuItem {
  name: string;
  description: string;
  price: number | string;
  image?: string;
  allergens?: string[];
}

export interface ProcessedMenuItem {
  name: string;
  description?: string | undefined;
  price: string;
  image?: string | ImageMetadata | undefined; // Can be string URL or imported image module
  allergens?: string[];
}

export interface MenuTab {
  id: string;
  label: string;
  icon?: string;
  items?: MenuItem[];
  nestedTabs?: MenuTab[];
}

export interface ProcessedMenuTab {
  id: string;
  label: string;
  icon?: string | undefined;
  items?: ProcessedMenuItem[] | undefined;
  nestedTabs?: ProcessedMenuTab[] | undefined;
}

export interface MenuCategory {
  title: string;
  tabs?: MenuTab[];
  items?: MenuItem[];
}

export interface ProcessedMenuCategory {
  title: string;
  tabs?: ProcessedMenuTab[] | undefined;
  items?: ProcessedMenuItem[] | undefined;
}

// For menu index page
export interface MenuLink {
  href: string;
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}