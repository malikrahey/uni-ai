# Theme Customization Guide

This guide explains how to customize the color scheme of the Acceluni application using CSS custom variables.

## Color Scheme Overview

The application uses a **light blue color scheme** with the following main colors:

- **Primary**: Blue (RGB: 59 130 246) - Main brand color
- **Accent**: Sky Blue (RGB: 14 165 233) - Secondary accent color
- **Neutral**: Slate grays - Background and text colors
- **Danger**: Red (RGB: 220 38 38) - Error and warning colors

## Customizing Colors

### Method 1: Modify CSS Custom Variables (Recommended)

All colors are defined using CSS custom variables in `app/globals.css`. To change the color scheme:

1. **Open** `app/globals.css`
2. **Locate** the `:root` section
3. **Modify** the color values as needed

**Important**: Colors must be defined in RGB format (space-separated values) for proper Tailwind compatibility.

#### Example: Change to Green Theme

```css
:root {
  /* Green Color Scheme - RGB values */
  --color-primary: 16 185 129;      /* Emerald-500: Primary green */
  --color-primary-light: 52 211 153; /* Emerald-400: Light green */
  --color-primary-dark: 5 150 105;   /* Emerald-600: Dark green */
  
  --color-accent: 6 182 212;         /* Cyan-500: Light cyan accent */
  --color-accent-light: 34 211 238;  /* Cyan-400: Light cyan */
  --color-accent-dark: 8 145 178;    /* Cyan-600: Dark cyan */
  
  /* Keep other colors the same */
  --color-danger: 220 38 38;
  --color-neutral: 248 250 252;
  /* ... etc */
}
```

#### Example: Change to Purple Theme

```css
:root {
  /* Purple Color Scheme - RGB values */
  --color-primary: 139 92 246;       /* Violet-500: Primary purple */
  --color-primary-light: 167 139 250; /* Violet-400: Light purple */
  --color-primary-dark: 124 58 237;   /* Violet-600: Dark purple */
  
  --color-accent: 168 85 247;        /* Purple-500: Light purple accent */
  --color-accent-light: 192 132 252; /* Purple-400: Light purple */
  --color-accent-dark: 147 51 234;   /* Purple-600: Dark purple */
  
  /* Keep other colors the same */
  --color-danger: 220 38 38;
  --color-neutral: 248 250 252;
  /* ... etc */
}
```

### Method 2: Modify Tailwind Config (Advanced)

For more advanced customization, you can modify `tailwind.config.ts`:

1. **Open** `tailwind.config.ts`
2. **Locate** the `colors` section
3. **Replace** the CSS variable references with direct color values

```typescript
colors: {
  primary: {
    DEFAULT: 'rgb(16 185 129)', // Direct RGB value instead of CSS variable
    light: 'rgb(52 211 153)',
    dark: 'rgb(5 150 105)',
  },
  // ... etc
}
```

## Available Color Variables

### Primary Colors
- `--color-primary` - Main brand color (RGB format)
- `--color-primary-light` - Lighter variant for hover states
- `--color-primary-dark` - Darker variant for active states

### Accent Colors
- `--color-accent` - Secondary accent color
- `--color-accent-light` - Lighter accent variant
- `--color-accent-dark` - Darker accent variant

### Semantic Colors
- `--color-danger` - Error and warning colors
- `--color-danger-light` - Light danger variant
- `--color-danger-dark` - Dark danger variant

### Neutral Colors
- `--color-neutral` - Light neutral background
- `--color-neutral-dark` - Dark neutral background
- `--color-neutral-darker` - Darker neutral background

### Text Colors
- `--color-text` - Primary text color
- `--color-text-light` - Secondary text color
- `--color-text-dark` - Dark text for light backgrounds

### Surface Colors
- `--color-surface-light` - Light surface background
- `--color-surface-dark` - Dark surface background

## RGB Color Format

All colors must be defined in RGB format (space-separated values) for proper Tailwind compatibility:

```css
/* ✅ Correct - RGB format */
--color-primary: 59 130 246;

/* ❌ Incorrect - Hex format */
--color-primary: #3B82F6;
```

## Dark Mode Support

The application automatically adjusts colors for dark mode. Dark mode colors are defined in the `@media (prefers-color-scheme: dark)` section of `app/globals.css`.

When customizing colors, make sure to update both light and dark mode variants:

```css
:root {
  /* Light mode colors - RGB format */
  --color-primary: 59 130 246;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode colors - RGB format */
    --color-primary: 96 165 250;
  }
}
```

## Color Palette Recommendations

### Professional Themes
- **Blue** (Current): Trustworthy, professional
- **Green**: Growth, success, nature
- **Purple**: Creative, innovative, luxury

### Industry-Specific Themes
- **Healthcare**: Blue or teal
- **Finance**: Blue or green
- **Technology**: Blue, purple, or green
- **Education**: Blue, green, or orange

### Accessibility Considerations

When choosing colors, ensure:
1. **Contrast Ratio**: Text should have at least 4.5:1 contrast with background
2. **Color Blindness**: Don't rely solely on color to convey information
3. **Dark Mode**: Test your colors in both light and dark modes

## Testing Your Changes

After modifying colors:

1. **Restart** the development server
2. **Check** all pages in both light and dark modes
3. **Verify** hover and active states work correctly
4. **Test** on different screen sizes

## Troubleshooting

### Colors Not Updating
- Clear browser cache
- Restart the development server
- Check for CSS caching issues
- Ensure colors are in RGB format

### Dark Mode Issues
- Ensure both light and dark mode colors are defined
- Test with system dark mode enabled

### Performance Issues
- CSS custom variables are performant
- Avoid too many color variations
- Use Tailwind's built-in color palette when possible 