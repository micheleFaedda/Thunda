# Menu Management Guide

This guide explains how to update menu items, prices, and images for the Tundha restaurant website.

## Quick Start

All menu data is stored in YAML files located in `/src/data/menu/`. To update any menu:

1. Open the corresponding YAML file
2. Edit the items, prices, or descriptions
3. Save the file
4. The website will automatically reflect the changes

## Menu Files

Each menu category has its own YAML file:

- `pizze.yaml` - Pizza menu (Crisp, Classiche, Stagionali)
- `vini.yaml` - Wine menu (Al Calice, In Bottiglia with subcategories)
- `birre.yaml` - Beer menu (Alla Spina, In Bottiglia)
- `per-iniziare.yaml` - Appetizers
- `dessert.yaml` - Desserts
- `liquori.yaml` - Liquors (organized by sections)
- `analcolici-caffetteria.yaml` - Soft drinks and coffee

## YAML File Structure

### Simple Menu (single list of items)
```yaml
title: Menu Title
items:
  - name: Item Name
    description: Item description
    price: €10
    image: item-image.jpg  # optional
```

### Tabbed Menu (multiple categories)
```yaml
title: Menu Title
tabs:
  - id: tab1
    label: Tab Label
    items:
      - name: Item Name
        description: Description
        price: €10
```

### Nested Tabs (subcategories)
```yaml
title: Menu Title
tabs:
  - id: main-tab
    label: Main Category
    nestedTabs:
      - id: sub-tab
        label: Subcategory
        items:
          - name: Item Name
            description: Description
            price: €10
```

### Sectioned Menu (grouped items)
```yaml
title: Menu Title
sections:
  - title: Section Title
    items:
      - name: Item Name
        description: Description
        price: €10
```

## Adding Images

1. Place image files in `/src/data/menu/images/{category}/`
   - Example: `/src/data/menu/images/pizze/margherita.jpg`

2. Reference the image in the YAML file:
```yaml
items:
  - name: Margherita
    description: Classic pizza
    price: €10
    image: margherita.jpg  # just the filename
```

## Examples

### Adding a New Pizza
Edit `src/data/menu/pizze.yaml`:
```yaml
tabs:
  - id: classiche
    label: Classiche
    items:
      # ... existing items ...
      - name: New Pizza Name
        description: Ingredients and description
        price: €12
```

### Updating Wine Prices
Edit `src/data/menu/vini.yaml`:
```yaml
tabs:
  - id: calice
    label: Al Calice
    items:
      - name: Vermentino di Sardegna DOC
        description: Cantina Sella & Mosca...
        price: €7  # <- Update this value
```

### Adding a Seasonal Special
Edit the appropriate file and add to the relevant section:
```yaml
items:
  - name: Summer Special
    description: Limited time offer
    price: €15
    image: summer-special.jpg  # Add image to /src/data/menu/images/{category}/
```

## Important Notes

- **Prices**: Always include the € symbol (e.g., `€10`)
- **Descriptions**: Can be as long as needed, will wrap automatically
- **Images**: 
  - Supported formats: .jpg, .png, .webp
  - Recommended size: 800x600px for best performance
  - Images are optional - items without images will show a default icon
- **Special Characters**: YAML supports UTF-8, so accented characters (è, à, ù) work fine
- **Comments**: Use `#` for comments in YAML files

## Testing Changes

After making changes:

1. Run the development server: `pnpm dev`
2. Navigate to the menu page to verify changes
3. Check that all items display correctly
4. Test on mobile and desktop views

## Troubleshooting

- **Changes not showing**: Make sure you saved the YAML file
- **Page shows error**: Check YAML syntax (proper indentation is crucial)
- **Image not showing**: Verify the image file exists in the correct directory
- **Price formatting issues**: Ensure price includes the € symbol

## YAML Syntax Tips

- Use 2 spaces for indentation (not tabs)
- Strings with special characters should be quoted
- Lists start with a hyphen and space `- `
- Key-value pairs use a colon and space `: `

For more complex updates or structural changes, consult the development team.