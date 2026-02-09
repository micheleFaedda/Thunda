import { z } from 'zod';
import type { MenuCategory } from '../types/menu';

// Basic menu item schema
const MenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Item description is required"),
  price: z.union([
    z.number().positive("Price must be a positive number"),
    z.string().regex(/^\d+(\.\d{2})?$/, "Price must be a number or numeric string (e.g., 10 or 10.50)")
  ]),
  image: z.string().optional(),
  allergens: z.array(z.string()).optional()
});

// Tab schema (recursive for nested tabs)
const TabSchema: z.ZodSchema<unknown> = z.lazy(() =>
  z.object({
    id: z.string().min(1, "Tab ID is required"),
    label: z.string().min(1, "Tab label is required"),
    icon: z.string().optional(),
    items: z.array(MenuItemSchema).optional(),
    nestedTabs: z.array(TabSchema).optional()
  })
);

// Main menu category schema
export const MenuCategorySchema = z.object({
  title: z.string().min(1, "Menu title is required"),
  tabs: z.array(TabSchema).optional(),
  items: z.array(MenuItemSchema).optional()
}).refine(
  (data) => {
    // Must have either tabs or items, not both
    if (data.tabs && data.items) {
      return false;
    }
    // Must have at least one
    if (!data.tabs && !data.items) {
      return false;
    }
    return true;
  },
  {
    message: "Menu must have either 'tabs' or 'items', but not both"
  }
);

// Validate tab structure rules
export function validateMenuStructure(data: MenuCategory): string[] {
  const errors: string[] = [];

  if (data.tabs) {
    // Check for unique tab IDs
    const tabIds = new Set<string>();
    const checkDuplicateIds = (tabs: unknown[], path: string) => {
      tabs.forEach((tab, index) => {
        const tabObj = tab as { id: string; nestedTabs?: unknown[] };
        if (tabIds.has(tabObj.id)) {
          errors.push(`Duplicate tab ID '${tabObj.id}' at ${path}[${index}]`);
        }
        tabIds.add(tabObj.id);
        
        // Recursively check nested tabs
        if (tabObj.nestedTabs) {
          checkDuplicateIds(tabObj.nestedTabs, `${path}[${index}].nestedTabs`);
        }
      });
    };
    checkDuplicateIds(data.tabs, 'tabs');

    // Validate nested tabs are only used appropriately
    data.tabs.forEach((tab, index) => {
      if (tab.nestedTabs && tab.items) {
        errors.push(`Tab '${tab.label}' at tabs[${index}] cannot have both items and nestedTabs`);
      }
      
      // Check nesting depth (max 2 levels)
      if (tab.nestedTabs) {
        tab.nestedTabs.forEach((nestedTab, nestedIndex) => {
          if ((nestedTab as { nestedTabs?: unknown[] }).nestedTabs) {
            errors.push(`Too many nesting levels at tabs[${index}].nestedTabs[${nestedIndex}] - maximum 2 levels allowed`);
          }
        });
      }
    });
  }

  // Validate items if present
  if (data.items) {
    data.items.forEach((item, index) => {
      // Check for numeric price
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      if (isNaN(price) || price <= 0) {
        errors.push(`Item '${item.name}' at items[${index}] has invalid price: ${item.price}`);
      }
    });
  }

  return errors;
}

// Export validation function for use in loader
export function validateMenu(data: unknown, fileName: string): MenuCategory {
  try {
    // First validate against schema
    const validatedData = MenuCategorySchema.parse(data);
    
    // Then run additional structural validations
    const structureErrors = validateMenuStructure(validatedData as MenuCategory);
    
    if (structureErrors.length > 0) {
      throw new Error(`Validation errors in ${fileName}:\n${structureErrors.join('\n')}`);
    }
    
    return validatedData as MenuCategory;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => 
        `  - ${err.path.join('.')}: ${err.message}`
      ).join('\n');
      throw new Error(`YAML validation failed for ${fileName}:\n${errorMessages}`);
    }
    throw error;
  }
}