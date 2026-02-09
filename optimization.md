# Tundha Website - Optimization Guide

## ✅ Completed Optimizations

### Performance Optimizations Implemented:
- **Image Optimization**: WebP format, lazy loading, responsive sizes for all images
- **Logo Optimization**: Reduced from 307KB PNG to ~15KB WebP with quality preservation
- **Font Loading**: DNS prefetch/preconnect, GoogleFontsOptimizer with display=swap
- **Build Configuration**: Code splitting, minification, compression, chunk optimization
- **CSS Cleanup**: Removed duplicate declarations and inline styles
- **Blur-up Placeholders**: Added smooth loading effect for carousel images

---

## 🚀 Remaining Optimization Opportunities

### 1. **Carousel Image Pre-Processing Pipeline** (HIGHEST IMPACT)

**Problem**: Carousel images are 1159x869px (126-230KB each) but display at only 450px wide.

**Solution**: Create an automated image optimization script:

```javascript
// scripts/optimize-carousel.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CAROUSEL_DIR = './public/carousel';
const OUTPUT_SIZES = [400, 600, 800];
const MAX_WIDTH = 800;
const QUALITY = 85;

// Watch for new images
fs.watch(CAROUSEL_DIR, async (eventType, filename) => {
  if (eventType === 'rename' && filename.match(/\.(jpg|jpeg|png)$/i)) {
    const filepath = path.join(CAROUSEL_DIR, filename);
    
    // Generate optimized versions
    for (const size of OUTPUT_SIZES) {
      await sharp(filepath)
        .resize(size, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: QUALITY })
        .toFile(path.join(CAROUSEL_DIR, `${filename}-${size}w.webp`));
    }
    
    // Create thumbnail for placeholder
    await sharp(filepath)
      .resize(20, null, { fit: 'inside' })
      .blur(5)
      .webp({ quality: 20 })
      .toFile(path.join(CAROUSEL_DIR, `${filename}-thumb.webp`));
  }
});
```

**Expected Impact**: Reduce carousel payload by 80% (~1.5MB savings)

### 2. **JavaScript Optimization for PhotoCarousel**

**Problem**: 250+ lines of inline JavaScript in the component.

**Solution A**: Extract to separate module with dynamic import:

```javascript
// src/scripts/carousel.ts
export class CarouselController {
  private autoAdvanceTimer: number | null = null;
  private currentIndex = 0;
  
  constructor(private element: HTMLElement) {
    this.init();
  }
  
  private init() {
    // Add visibility API to pause when hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause();
      else this.resume();
    });
    
    // Use Intersection Observer for lazy initialization
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.start();
        observer.disconnect();
      }
    });
    observer.observe(this.element);
  }
  
  // ... rest of carousel logic
}
```

**Solution B**: Load carousel script only when needed:

```astro
<!-- In PhotoCarousel.astro -->
<script>
  // Lazy load carousel controller
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting) {
        const { CarouselController } = await import('./carousel.js');
        new CarouselController(entries[0].target);
        observer.disconnect();
      }
    });
    
    const carousel = document.querySelector('.photo-carousel');
    if (carousel) observer.observe(carousel);
  }
</script>
```

### 3. **Critical CSS Extraction**

**Problem**: All CSS loads blocking, even below-the-fold styles.

**Solution**: Implement critical CSS inlining:

```javascript
// astro.config.mjs addition
import { defineConfig } from 'astro/config';
import criticalCSS from 'astro-critical-css';

export default defineConfig({
  integrations: [
    criticalCSS({
      inline: true,
      dimensions: [
        { width: 375, height: 667 },  // Mobile
        { width: 1920, height: 1080 }, // Desktop
      ],
    }),
  ],
});
```

Or manually extract critical CSS:

```html
<!-- In Layout.astro <head> -->
<style>
  /* Critical above-the-fold styles only */
  :root { 
    --brown: #1F0707; 
    --red: #9B371E; 
    --gold: #D5AD36;
  }
  body { 
    margin: 0; 
    background: var(--brown); 
    color: var(--white);
  }
  nav { /* menu styles */ }
  .hero { /* hero section styles */ }
</style>

<!-- Load rest async -->
<link rel="preload" href="/styles/main.css" as="style" 
      onload="this.onload=null;this.rel='stylesheet'">
```

### 4. **Service Worker for Advanced Caching**

**Problem**: No offline capability, assets re-downloaded on each visit.

**Solution**: Implement a service worker:

```javascript
// public/sw.js
const CACHE_NAME = 'tundha-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/styles/global.css',
  '/Tundha_Red_Logo_Transparent.webp',
  // ... critical assets
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) return response;
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Add to cache for images and fonts
          if (event.request.url.match(/\.(webp|jpg|jpeg|png|woff2)$/)) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        });
      })
  );
});
```

Register in Layout.astro:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 5. **Advanced Image Loading Strategy**

**Problem**: Images load without progressive enhancement.

**Solution**: Implement LQIP (Low Quality Image Placeholder) with base64:

```astro
---
// In PhotoCarousel.astro
import sharp from 'sharp';

// Generate tiny placeholders at build time
const generatePlaceholder = async (imagePath: string) => {
  const placeholder = await sharp(imagePath)
    .resize(20)
    .blur(10)
    .toBuffer();
  
  return `data:image/jpeg;base64,${placeholder.toString('base64')}`;
};

const carouselImagesWithPlaceholders = await Promise.all(
  carouselImages.map(async (img) => ({
    ...img,
    placeholder: await generatePlaceholder(img.src)
  }))
);
---

<!-- Use in template -->
{carouselImagesWithPlaceholders.map((image) => (
  <div class="image-container">
    <img 
      src={image.placeholder} 
      class="placeholder-blur"
      aria-hidden="true"
    />
    <Image 
      src={image.src}
      class="carousel-image"
      onload="this.classList.add('loaded')"
    />
  </div>
))}
```

### 6. **Bundle Monitoring & Analysis**

**Problem**: No visibility into bundle size growth.

**Solution A**: Add bundle analysis script:

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true astro build",
    "bundle-report": "npx vite-bundle-visualizer"
  }
}
```

**Solution B**: Set up size limits:

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/**/*.js",
      "maxSize": "50 kB"
    },
    {
      "path": "./dist/**/*.css", 
      "maxSize": "10 kB"
    }
  ]
}
```

### 7. **Resource Hints for Third-Party Services**

Add additional hints for external resources:

```html
<!-- In Layout.astro -->
<!-- Preconnect to analytics -->
<link rel="preconnect" href="https://www.google-analytics.com">
<link rel="dns-prefetch" href="https://www.googletagmanager.com">

<!-- Preconnect to map tiles if using maps -->
<link rel="preconnect" href="https://maps.googleapis.com">
<link rel="preconnect" href="https://maps.gstatic.com">
```

### 8. **Implement Resource Priority Hints**

Use the Priority Hints API for better resource loading:

```html
<!-- High priority for LCP image -->
<img fetchpriority="high" src="/hero-image.webp" />

<!-- Low priority for below-fold content -->
<img fetchpriority="low" loading="lazy" src="/footer-decoration.webp" />

<!-- Auto priority for normal content -->
<img fetchpriority="auto" src="/content-image.webp" />
```

### 9. **HTTP/2 Server Push Configuration**

If your hosting supports it, configure server push:

```apache
# .htaccess or server config
<FilesMatch "\.html$">
  Header set Link "</styles/critical.css>; rel=preload; as=style"
  Header add Link "</fonts/averia-serif.woff2>; rel=preload; as=font; crossorigin"
</FilesMatch>
```

### 10. **Performance Monitoring**

Set up real user monitoring:

```javascript
// Add to Layout.astro
if ('PerformanceObserver' in window) {
  // Log Core Web Vitals
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      console.log(`${entry.name}: ${entry.value}ms`);
      // Send to analytics
      if (window.gtag) {
        gtag('event', entry.name, {
          value: Math.round(entry.value),
          metric_name: entry.name,
          non_interaction: true,
        });
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // First Input Delay
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const delay = entry.processingStart - entry.startTime;
      console.log('FID:', delay);
    }
  }).observe({ entryTypes: ['first-input'] });
}
```

---

## 📊 Performance Checklist

### Before Deployment:
- [ ] Run `npm run build` and check bundle sizes
- [ ] Test with Lighthouse in Chrome DevTools
- [ ] Check Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Test on real devices with throttled connection
- [ ] Verify all images are optimized (<100KB for carousel)
- [ ] Ensure critical CSS is inlined
- [ ] Test service worker functionality

### Monitoring:
- [ ] Set up Google PageSpeed Insights monitoring
- [ ] Configure real user monitoring (RUM)
- [ ] Track bundle size over time
- [ ] Monitor Core Web Vitals in Google Search Console

---

## 🎯 Priority Implementation Order

1. **Image optimization script** (Biggest impact - save 1.5MB)
2. **Service worker** (Improve repeat visits)
3. **Critical CSS inlining** (Faster initial render)
4. **JavaScript extraction** (Better caching)
5. **Performance monitoring** (Track improvements)

---

## 📚 Resources

- [Astro Performance Guide](https://docs.astro.build/en/guides/performance/)
- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Core Web Vitals](https://web.dev/vitals/)