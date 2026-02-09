import type { ImageMetadata } from 'astro';
import type { MenuCategory, MenuTab, MenuItem, ProcessedMenuItem, ProcessedMenuTab, ProcessedMenuCategory } from '../types/menu';
import { validateMenu } from './menuSchema';

// Import all YAML files
import pizzeData from '../data/menu/pizze.yaml';
import viniData from '../data/menu/vini.yaml';
import birreData from '../data/menu/birre.yaml';
import perIniziareData from '../data/menu/per-iniziare.yaml';
import dessertData from '../data/menu/dessert.yaml';
import liquoriData from '../data/menu/liquori.yaml';
import analcoliciCaffetteriaData from '../data/menu/analcolici-caffetteria.yaml';

// Import menu images with glob
const menuImages = import.meta.glob('../data/menu/images/**/*.{jpg,jpeg,png,webp}', { eager: true });

// Helper function to get image module from imported modules
function getImageModule(category: string, imageName: string): ImageMetadata | undefined {
  const imageModule = Object.entries(menuImages).find(([path]) => path.endsWith(`${category}/${imageName}`));
  
  if (imageModule) {
    const [, module] = imageModule;
    return (module as { default: ImageMetadata }).default;
  }
  
  return undefined;
}

// Map of menu data - validate each on load
const menuDataMap: Record<string, MenuCategory> = {
  'pizze': validateMenu(pizzeData, 'pizze.yaml'),
  'vini': validateMenu(viniData, 'vini.yaml'),
  'birre': validateMenu(birreData, 'birre.yaml'),
  'per-iniziare': validateMenu(perIniziareData, 'per-iniziare.yaml'),
  'dessert': validateMenu(dessertData, 'dessert.yaml'),
  'liquori': validateMenu(liquoriData, 'liquori.yaml'),
  'analcolici-caffetteria': validateMenu(analcoliciCaffetteriaData, 'analcolici-caffetteria.yaml'),
};

/**
 * Load menu data from pre-imported YAML
 * @param menuName - The name of the menu file (without .yaml extension)
 * @returns The parsed menu category data
 */
export async function loadMenuData(menuName: string): Promise<ProcessedMenuCategory> {
  const data = menuDataMap[menuName];
  
  if (!data) {
    throw new Error(`Menu data not found for: ${menuName}. Available menus: ${Object.keys(menuDataMap).join(', ')}`);
  }
  
  // Process image paths if they exist
  const processedData: ProcessedMenuCategory = { 
    title: data.title,
    tabs: undefined,
    items: undefined
  };
  
  if (data.items) {
    processedData.items = processMenuItemImages(data.items, menuName);
  }
  
  if (data.tabs) {
    processedData.tabs = processTabImages(data.tabs, menuName);
  }
  
  return processedData;
}

/**
 * Process menu item images to add full paths and format prices
 */
function processMenuItemImages(items: MenuItem[], category: string): ProcessedMenuItem[] {
  return items.map(item => {
    const processedItem = { ...item } as ProcessedMenuItem;
    
    if (item.image && typeof item.image === 'string' && !item.image.startsWith('/') && !item.image.startsWith('http')) {
      // Get the imported image module
      const imageModule = getImageModule(category, item.image);
      if (imageModule) {
        processedItem.image = imageModule;
      } else {
        // Fallback to direct path if image not found in imports
        console.warn(`Image not found: ${category}/${item.image}`);
        processedItem.image = undefined;
      }
    }
    
    // Format numeric prices with € symbol
    if (typeof item.price === 'number') {
      processedItem.price = `€${item.price}`;
    } else {
      processedItem.price = item.price;
    }
    
    return processedItem;
  });
}

/**
 * Process tab images recursively
 */
function processTabImages(tabs: MenuTab[], category: string): ProcessedMenuTab[] {
  return tabs.map(tab => {
    const processedTab: ProcessedMenuTab = {
      id: tab.id,
      label: tab.label,
      icon: tab.icon,
      items: undefined,
      nestedTabs: undefined
    };
    
    if (tab.items) {
      processedTab.items = processMenuItemImages(tab.items, category);
    }
    
    if (tab.nestedTabs) {
      processedTab.nestedTabs = processTabImages(tab.nestedTabs, category);
    }
    
    return processedTab;
  });
}